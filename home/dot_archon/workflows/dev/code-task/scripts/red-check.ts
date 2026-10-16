// Decides whether this pass may implement. After write-tests: only the
// declared test files may have changed, and the targeted test command must
// fail. Runs on every pass so later nodes never read a skipped producer:
// - task already past the test step (repo without tests, or tests already
//   proven red on an earlier pass): ready, nothing to run
// - no task in progress (all done): not ready
// A failing red check is not fatal; it is recorded for the stuck gate.
import { join } from "node:path";
import { hashFile, normalize, requireState, run, saveState } from "../../.shared/build.ts";
import { changedPathsSinceSnapshot } from "../../.shared/worktree.ts";

const state = requireState();
const task = state.tasks[state.current];

if (!task || task.phase === "done") {
  console.log(JSON.stringify({ red: false }));
  process.exit(0);
}
if (task.phase === "implement") {
  console.log(JSON.stringify({ red: true }));
  process.exit(0);
}

const command = (process.env.INPUTS_TEST_COMMAND ?? "").trim();
const testFiles: string[] = JSON.parse(process.env.INPUTS_TEST_FILES || "[]").map(normalize);

let failure = "";
const changed = changedPathsSinceSnapshot(`task-start-${state.current}.txt`);
const stray = changed.filter((p) => !testFiles.includes(normalize(p)));
if (!command) failure = "write-tests declared no targeted test command";
else if (testFiles.length === 0) failure = "write-tests declared no test files";
else if (stray.length) failure = `the test-writing step changed files that are not declared test files: ${stray.join(", ")}`;
else if (changed.length === 0) failure = "the test-writing step changed no files";

if (!failure) {
  const res = run(command);
  await Bun.write(join(process.env.ARTIFACTS_DIR ?? "", `red-${state.current}.log`), res.log);
  if (res.code === 0) failure = `the new tests already pass before implementation (\`${command}\` exited 0), so they do not prove ${state.current}`;
}

if (failure) {
  state.last_failure = `Red check failed: ${failure}`;
  console.error(`red-check: ${failure}`);
} else {
  task.phase = "implement";
  task.test_command = command;
  task.test_files = testFiles;
  task.test_hashes = Object.fromEntries(testFiles.map((f) => [f, hashFile(f)]));
}
saveState(state);
console.log(JSON.stringify({ red: !failure }));
