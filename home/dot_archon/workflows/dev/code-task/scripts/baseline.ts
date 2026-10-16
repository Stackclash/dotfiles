// Run the repo's own commands on the untouched branch. Failures are recorded,
// not fatal: validation later judges only failures this change introduces.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { saveSnapshot } from "../../.shared/worktree.ts";

const artifacts = process.env.ARTIFACTS_DIR ?? "";
const commands: Record<string, string> = {
  test: process.env.INPUTS_TEST ?? "",
  lint: process.env.INPUTS_LINT ?? "",
  build: process.env.INPUTS_BUILD ?? "",
  typecheck: process.env.INPUTS_TYPECHECK ?? "",
};

const shell = (cmd: string) => (process.platform === "win32" ? ["cmd", "/d", "/s", "/c", cmd] : ["sh", "-c", cmd]);

const red: string[] = [];
const rows: string[] = [];
for (const [name, cmd] of Object.entries(commands)) {
  if (!cmd.trim()) {
    rows.push(`| ${name} | _none found_ | — |`);
    continue;
  }
  console.error(`baseline: running ${name}: ${cmd}`);
  const res = Bun.spawnSync(shell(cmd), { stdout: "pipe", stderr: "pipe" });
  const log = `$ ${cmd}\nexit ${res.exitCode}\n\n${res.stdout.toString()}\n${res.stderr.toString()}`;
  writeFileSync(join(artifacts, `baseline-${name}.log`), log);
  if (res.exitCode !== 0) red.push(name);
  rows.push(`| ${name} | \`${cmd}\` | ${res.exitCode === 0 ? "pass" : `**fail** (exit ${res.exitCode})`} |`);
}

writeFileSync(
  join(artifacts, "baseline.md"),
  [
    "# Baseline (before any change)",
    "",
    "| Check | Command | Result |",
    "|---|---|---|",
    ...rows,
    "",
    red.length
      ? `Pre-existing failures: ${red.join(", ")}. Full output in baseline-<check>.log. Only failures beyond these count against the change.`
      : "All discovered checks pass.",
    "",
  ].join("\n"),
);

// Whatever the commands left behind (build output, caches) is the accepted
// state that later read-only gates compare against.
saveSnapshot();

console.log(JSON.stringify({ red }));
