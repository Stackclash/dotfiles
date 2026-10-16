// Structural and traceability gate for plan.md. Fails on a malformed plan;
// reports has_issues when the planner raised proposal issues, which sends the
// next planning pass back to the requester.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { blocks, bullets, section } from "../../.shared/markdown.ts";
import { changesSinceSnapshot } from "../../.shared/worktree.ts";

function fail(msg: string): never {
  console.error(`check-plan: ${msg}`);
  process.exit(1);
}

const artifacts = process.env.ARTIFACTS_DIR ?? "";
const hasTests = process.env.INPUTS_HAS_TESTS === "true";
const read = (name: string) => {
  const p = join(artifacts, name);
  if (!existsSync(p)) fail(`${p} is missing`);
  return readFileSync(p, "utf8");
};

const proposal = read("proposal.md");
const plan = read("plan.md");

const acIds = blocks(section(proposal, "Acceptance criteria") ?? "")
  .map((b) => b.heading.match(/^###\s+(AC-\d+):/)?.[1])
  .filter((id): id is string => !!id);

const issues = bullets(section(plan, "Proposal issues"));

const tasksBody = section(plan, "Tasks");
if (tasksBody === null) fail("plan.md has no '## Tasks' section");
const tasks = blocks(tasksBody);
if (tasks.length === 0 && issues.length === 0) fail("plan.md has no tasks");

const field = (text: string, name: string): string | null => {
  const m = text.match(new RegExp(`^\\s*-?\\s*\\*\\*${name}:?\\*\\*:?\\s*(.*)$`, "im"));
  return m ? m[1].trim() : null;
};

const problems: string[] = [];
const taskIds: string[] = [];
const covered = new Set<string>();
const deps: [string, string[]][] = [];
const evidence = hasTests ? "Tests" : "Verification";

for (const { heading, text } of tasks) {
  const id = heading.match(/^###\s+(T-\d+):\s*\S/)?.[1];
  if (!id) {
    problems.push(`heading "${heading}" is not '### T-n: <title>'`);
    continue;
  }
  if (taskIds.includes(id)) problems.push(`${id} is duplicated`);
  taskIds.push(id);

  for (const name of ["Files", "Satisfies", evidence, "Depends on", "Done when"]) {
    if (!field(text, name)) problems.push(`${id} has no ${name}`);
  }
  const satisfies = field(text, "Satisfies") ?? "";
  for (const ac of satisfies.match(/AC-\d+/g) ?? []) {
    if (!acIds.includes(ac)) problems.push(`${id} cites ${ac}, which is not in proposal.md`);
    covered.add(ac);
  }
  if (satisfies && !/AC-\d+/.test(satisfies) && !/supporting/i.test(satisfies)) {
    problems.push(`${id} Satisfies must list AC-n IDs or say "supporting"`);
  }
  deps.push([id, (field(text, "Depends on") ?? "").match(/T-\d+/g) ?? []]);
}

for (const [id, ds] of deps) {
  for (const d of ds) if (!taskIds.includes(d)) problems.push(`${id} depends on ${d}, which does not exist`);
}
// Proposal issues mean the plan is incomplete by design; coverage waits for
// the requirements to be settled.
if (issues.length === 0) {
  for (const ac of acIds) if (!covered.has(ac)) problems.push(`${ac} is not satisfied by any task`);
}
if (problems.length) fail(`plan.md is malformed:\n- ${problems.join("\n- ")}`);

const changed = changesSinceSnapshot();
if (changed.length) fail(`planning is read-only but the worktree changed:\n${changed.join("\n")}`);

// A new plan starts a new review count.
rmSync(join(artifacts, "review-round.txt"), { force: true });

console.log(JSON.stringify({ has_issues: issues.length > 0 }));
