// Worktree snapshots. Baseline commands may leave build output behind, so
// baseline records the post-baseline state and later gates compare against a
// snapshot instead of demanding a clean tree. The build stage also snapshots
// the start of each task to see exactly what a step changed.
//
// Each entry is a porcelain status line plus a content hash, so further edits
// to an already-modified file still show up as a change.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const BASELINE_SNAPSHOT = "worktree-snapshot.txt";

const snapshotPath = (name: string) => join(process.env.ARTIFACTS_DIR ?? "", name);

// Accepts a bare porcelain line or a snapshot entry (porcelain + tab + hash).
const pathOf = (entry: string) => {
  const p = entry.split("\t")[0].slice(3);
  return (p.includes(" -> ") ? p.split(" -> ")[1] : p).replace(/^"|"$/g, "").replace(/\\/g, "/");
};

const hashOf = (path: string) => {
  try {
    return statSync(path).isFile() ? createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16) : "-";
  } catch {
    return "missing";
  }
};

export function gitStatus(): string[] {
  const res = Bun.spawnSync(["git", "status", "--porcelain", "--untracked-files=all"], { stdout: "pipe", stderr: "pipe" });
  if (res.exitCode !== 0) throw new Error(`git status failed: ${res.stderr.toString().trim()}`);
  return res.stdout
    .toString()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => `${l}\t${hashOf(pathOf(l))}`);
}

export function saveSnapshot(name = BASELINE_SNAPSHOT): void {
  writeFileSync(snapshotPath(name), gitStatus().join("\n"));
}

export function hasSnapshot(name: string): boolean {
  return existsSync(snapshotPath(name));
}

function diff(name: string): { added: string[]; reverted: string[] } {
  const p = snapshotPath(name);
  const want = new Set(existsSync(p) ? readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean) : []);
  const have = gitStatus();
  return { added: have.filter((l) => !want.has(l)), reverted: [...want].filter((l) => !have.includes(l)) };
}

// Human-readable differences from the snapshot (or from a clean tree when the
// snapshot does not exist yet); empty when unchanged.
export function changesSinceSnapshot(name = BASELINE_SNAPSHOT): string[] {
  const { added, reverted } = diff(name);
  return [...added.map((l) => l.split("\t")[0]), ...reverted.map((l) => `(reverted) ${l.split("\t")[0]}`)];
}

// Repo-relative paths (forward slashes) that differ from the snapshot. With
// existingOnly, paths whose only difference is disappearing are left out.
export function changedPathsSinceSnapshot(name = BASELINE_SNAPSHOT, existingOnly = false): string[] {
  const { added, reverted } = diff(name);
  const paths = added.map(pathOf);
  if (!existingOnly) paths.push(...reverted.map(pathOf));
  return [...new Set(paths)];
}
