// After an implementation attempt. Deterministic where possible:
// - confirmed-failing tests must be unchanged and must now pass
// - each repo check that was green at baseline must stay green
// - a check that was red at baseline and still fails needs a judge to tell new
//   failures from old ones (needs_judge)
import { writeFileSync } from "node:fs";
import { artifact, hashFile, repoChecksFromEnv, requireState, run, runRepoChecks, writeCheckReport } from "../../.shared/build.ts";

const hasTests = process.env.INPUTS_HAS_TESTS === "true";
const baselineRed: string[] = JSON.parse(process.env.INPUTS_BASELINE_RED || "[]");

const state = requireState();
const task = state.tasks[state.current];
const failures: string[] = [];
let judge: string[] = [];
const rows: string[] = [];

if (hasTests) {
  const edited = Object.entries(task.test_hashes)
    .filter(([f, h]) => hashFile(f) !== h)
    .map(([f]) => f);
  if (edited.length) failures.push(`confirmed-failing tests were modified during implementation: ${edited.join(", ")}`);
  const res = run(task.test_command);
  writeFileSync(artifact(`green-${state.current}-targeted.log`), res.log);
  rows.push(`| targeted | \`${task.test_command}\` | ${res.code === 0 ? "pass" : "**fail**"} |`);
  if (res.code !== 0) failures.push(`targeted tests still fail: \`${task.test_command}\` (see green-${state.current}-targeted.log)`);
}

// Skip the broader checks once something has already failed: the attempt is
// rejected either way and they can be slow.
if (failures.length === 0) {
  const r = runRepoChecks(repoChecksFromEnv(), baselineRed);
  rows.push(...r.rows);
  failures.push(...r.failures);
  judge = r.judge;
}

writeCheckReport(`Checks after implementing ${state.current}`, rows, failures, judge);
console.log(JSON.stringify({ green: failures.length === 0, needs_judge: failures.length === 0 && judge.length > 0, judge }));
