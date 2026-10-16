// Build-stage state and command running. build-state.json in ARTIFACTS_DIR is
// the single source of truth for task progress across loop passes.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type TaskState = {
  phase: "pending" | "implement" | "done";
  test_command: string;
  test_files: string[];
  test_hashes: Record<string, string>;
};

export type BuildState = {
  tasks: Record<string, TaskState>;
  order: string[];
  deps: Record<string, string[]>;
  current: string;
  attempts: number;
  last_green: boolean;
  last_failure: string;
  guidance: string;
  recheck: boolean;
};

export const artifact = (name: string) => join(process.env.ARTIFACTS_DIR ?? "", name);

export function loadState(): BuildState | null {
  const p = artifact("build-state.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

export function saveState(s: BuildState): void {
  writeFileSync(artifact("build-state.json"), JSON.stringify(s, null, 2));
}

export function requireState(): BuildState {
  const s = loadState();
  if (!s) {
    console.error("build-state.json is missing");
    process.exit(1);
  }
  return s;
}

export function run(cmd: string): { code: number; log: string } {
  const argv = process.platform === "win32" ? ["cmd", "/d", "/s", "/c", cmd] : ["sh", "-c", cmd];
  const res = Bun.spawnSync(argv, { stdout: "pipe", stderr: "pipe" });
  return { code: res.exitCode ?? 1, log: `$ ${cmd}\nexit ${res.exitCode}\n\n${res.stdout.toString()}\n${res.stderr.toString()}` };
}

export function hashFile(path: string): string {
  return existsSync(path) ? createHash("sha256").update(readFileSync(path)).digest("hex") : "missing";
}

export const normalize = (p: string) => p.trim().replace(/\\/g, "/").replace(/^\.\//, "");

// Repo checks against the baseline: a check green at baseline must pass; a
// check red at baseline that still fails needs a judge (pre-existing vs new).
// Logs go to build-<check>.log, which the regression judge reads.
export function runRepoChecks(
  checks: Record<string, string>,
  baselineRed: string[],
): { rows: string[]; failures: string[]; judge: string[] } {
  const rows: string[] = [];
  const failures: string[] = [];
  const judge: string[] = [];
  for (const [name, cmd] of Object.entries(checks)) {
    if (!cmd.trim()) continue;
    const res = run(cmd);
    writeFileSync(artifact(`build-${name}.log`), res.log);
    if (res.code === 0) {
      rows.push(`| ${name} | \`${cmd}\` | pass |`);
    } else if (baselineRed.includes(name)) {
      rows.push(`| ${name} | \`${cmd}\` | fail (also failed at baseline; judged for new failures) |`);
      judge.push(name);
    } else {
      rows.push(`| ${name} | \`${cmd}\` | **fail** (passed at baseline) |`);
      failures.push(`${name} passed at baseline and now fails (see build-${name}.log)`);
    }
  }
  return { rows, failures, judge };
}

// Checks read from discover-toolchain bindings. The full test suite only
// counts in repos that have tests.
export function repoChecksFromEnv(): Record<string, string> {
  return {
    test: process.env.INPUTS_HAS_TESTS === "true" ? process.env.INPUTS_TEST ?? "" : "",
    lint: process.env.INPUTS_LINT ?? "",
    build: process.env.INPUTS_BUILD ?? "",
    typecheck: process.env.INPUTS_TYPECHECK ?? "",
  };
}

export function writeCheckReport(title: string, rows: string[], failures: string[], judge: string[]): void {
  writeFileSync(
    artifact("green-report.md"),
    [
      `# ${title}`,
      "",
      "| Check | Command | Result |",
      "|---|---|---|",
      ...rows,
      "",
      failures.length ? `## Failures\n${failures.map((f) => `- ${f}`).join("\n")}` : "No deterministic failures.",
      judge.length ? `\nNeeds regression judgment: ${judge.join(", ")}` : "",
      "",
    ].join("\n"),
  );
}
