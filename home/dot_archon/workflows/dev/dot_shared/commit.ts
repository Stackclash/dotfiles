// Commit what the workflow changed: everything that differs from the baseline
// snapshot, except $DOCS_DIR (glossary and ADRs are the requester's to commit)
// and files the baseline commands left behind.
import { changedPathsSinceSnapshot } from "./worktree.ts";

export function commitChanges(message: string): boolean {
  const docsDir = (process.env.INPUTS_DOCS_DIR ?? "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/?$/, "/");
  const paths = changedPathsSinceSnapshot(undefined, true).filter((p) => !(docsDir !== "/" && p.startsWith(docsDir)));
  if (paths.length === 0) return false;

  const git = (...args: string[]) => {
    const res = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" });
    if (res.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${res.stderr.toString().trim()}`);
  };
  git("add", "--all", "--", ...paths);
  git("commit", "-m", message, "--", ...paths);
  return true;
}
