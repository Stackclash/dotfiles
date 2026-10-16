// Start of each build pass: pick the task to work on and its phase, carry any
// guidance from the stuck gate, and snapshot the worktree so this pass's
// changes can be checked precisely.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { blocks, section } from "../../.shared/markdown.ts";
import { artifact, type BuildState, loadState, saveState } from "../../.shared/build.ts";
import { gateDecision } from "../../.shared/gate.ts";
import { hasSnapshot, saveSnapshot } from "../../.shared/worktree.ts";

function fail(msg: string): never {
  console.error(`next-task: ${msg}`);
  process.exit(1);
}

const hasTests = process.env.INPUTS_HAS_TESTS === "true";
const stuck = gateDecision(process.env.INPUTS_STUCK_GATE);
const stuckDecision = stuck.decision.trim();
const stuckText = stuck.text.trim();

const planPath = artifact("plan.md");
if (!existsSync(planPath)) fail(`${planPath} is missing`);
const taskBlocks = blocks(section(readFileSync(planPath, "utf8"), "Tasks") ?? "");

let state: BuildState | null = loadState();
if (!state) {
  const order: string[] = [];
  const deps: Record<string, string[]> = {};
  for (const { heading, text } of taskBlocks) {
    const id = heading.match(/^###\s+(T-\d+):/)?.[1];
    if (!id) continue;
    order.push(id);
    const line = text.match(/^\s*-?\s*\*\*Depends on:?\*\*:?\s*(.*)$/im)?.[1] ?? "";
    deps[id] = line.match(/T-\d+/g) ?? [];
  }
  if (order.length === 0) fail("plan.md has no tasks");
  state = {
    tasks: Object.fromEntries(order.map((id) => [id, { phase: "pending", test_command: "", test_files: [], test_hashes: {} }])),
    order,
    deps,
    current: "",
    attempts: 0,
    last_green: false,
    last_failure: "",
    guidance: "",
    recheck: false,
  } as BuildState;
}

if (stuckDecision === "abort") fail(`run aborted by the requester at the stuck gate for ${state.current}`);

// The stuck gate answered on the previous pass: retry the same task with the
// requester's guidance, or re-check after their manual fix.
const previousFailure = stuckDecision ? state.last_failure : "";
state.guidance = stuckDecision ? stuckText : "";
state.recheck = stuckDecision === "recheck";
state.attempts = 0;
state.last_green = false;
state.last_failure = "";

const done = (id: string) => state!.tasks[id].phase === "done";
let next = state.current && !done(state.current) ? state.current : "";
if (!next) next = state.order.find((id) => !done(id) && state!.deps[id].every(done)) ?? "";

if (!next) {
  const remaining = state.order.filter((id) => !done(id));
  if (remaining.length) fail(`tasks ${remaining.join(", ")} can never start: their dependencies are not satisfiable`);
  saveState(state);
  console.log(JSON.stringify({ done_all: true, task_id: "", phase: "" }));
  process.exit(0);
}

state.current = next;
const task = state.tasks[next];
if (!hasTests && task.phase === "pending") task.phase = "implement";
const phase = task.phase === "pending" ? "tests" : "implement";
saveState(state);
// Once per task, so a retried test step is still measured from the task's start.
if (!hasSnapshot(`task-start-${next}.txt`)) saveSnapshot(`task-start-${next}.txt`);

const block = taskBlocks.find((b) => b.heading.startsWith(`### ${next}:`))?.text ?? "";
writeFileSync(
  artifact("current-task.md"),
  [
    `# Current task: ${next}`,
    "",
    `Phase: ${phase}`,
    "",
    block.trim(),
    "",
    "## Confirmed failing tests",
    task.test_command ? `- Command: \`${task.test_command}\`\n- Files: ${task.test_files.join(", ")}` : "_None yet._",
    "",
    "## Previous attempt at this task",
    previousFailure.trim() || "_None._",
    "",
    "## Requester guidance from the stuck gate",
    state.guidance || "_None._",
    "",
    state.recheck
      ? "## Re-check requested\nThe requester says they fixed this task by hand. Verify it; change nothing unless the checks still fail."
      : "",
  ].join("\n"),
);

console.log(JSON.stringify({ done_all: false, task_id: next, phase }));
