// Every repo check over the whole change, against the baseline, plus: no
// confirmed-failing test from any task may have been edited since its red check.
import { hashFile, loadState, repoChecksFromEnv, runRepoChecks, writeCheckReport } from "../../.shared/build.ts";

const baselineRed: string[] = JSON.parse(process.env.INPUTS_BASELINE_RED || "[]");
const state = loadState();

const failures: string[] = [];
for (const [id, task] of Object.entries(state?.tasks ?? {})) {
  const edited = Object.entries(task.test_hashes)
    .filter(([f, h]) => hashFile(f) !== h)
    .map(([f]) => f);
  if (edited.length) failures.push(`${id}'s confirmed tests were modified after they were proven failing: ${edited.join(", ")}`);
}

const r = runRepoChecks(repoChecksFromEnv(), baselineRed);
failures.push(...r.failures);
writeCheckReport("Final checks over the whole change", r.rows, failures, r.judge);

console.log(JSON.stringify({ failures, needs_judge: r.judge.length > 0, judge: r.judge }));
