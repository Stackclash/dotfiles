// End of a build pass: mark the task done when its last attempt was green,
// committing it when the requester chose per-task commits.
import { requireState, saveState } from "../../.shared/build.ts";
import { commitChanges } from "../../.shared/commit.ts";
import { gateDecision } from "../../.shared/gate.ts";

const commitMode = gateDecision(process.env.INPUTS_COMMIT_MODE).decision;
const state = requireState();
const id = state.current;

if (!state.last_green) {
  console.log(JSON.stringify({ done: false, committed: false }));
  process.exit(0);
}

// Commit before marking done, so a failed commit cannot leave a task recorded
// as finished but uncommitted.
let committed = false;
if (commitMode === "approve") {
  const title = Bun.file(`${process.env.ARTIFACTS_DIR ?? ""}/current-task.md`);
  const heading = (await title.text()).split(/\r?\n/).find((l) => l.startsWith(`### ${id}:`)) ?? `### ${id}`;
  committed = commitChanges(heading.replace(/^###\s+/, ""));
}

state.tasks[id].phase = "done";
saveState(state);

console.log(JSON.stringify({ done: true, committed }));
