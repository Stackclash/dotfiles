// Compose the plan-approval gate message from the artifacts.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { blocks, bullets, section } from "../../.shared/markdown.ts";

const artifacts = process.env.ARTIFACTS_DIR ?? "";
const read = (name: string) => {
  const p = join(artifacts, name);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
};

const plan = read("plan.md");
const proposal = read("proposal.md");
const review = read("plan-review.md");
const baseline = read("baseline.md");

const tasks = blocks(section(plan, "Tasks") ?? "").map((b) => `- ${b.heading.replace(/^###\s+/, "")}`);
const unresolved = bullets(section(proposal, "Unresolved"));
const redLine = baseline.split(/\r?\n/).find((l) => l.startsWith("Pre-existing failures"));

const out = [
  "# Plan ready for approval",
  "",
  "## Approach",
  (section(plan, "Approach") ?? "_Missing._").trim(),
  "",
  "## Assumptions the plan makes",
  (section(plan, "Assumptions") ?? "_None stated._").trim() || "_None stated._",
  "",
  "## Tasks",
  ...(tasks.length ? tasks : ["_None._"]),
  "",
  "## Plan review",
  review.trim().replace(/^## /gm, "### ") || "_No review record._",
  "",
  "## Unresolved in the proposal",
  ...(unresolved.length ? unresolved.map((u) => `- ${u}`) : ["_None._"]),
  "",
  "## Baseline",
  redLine ?? "All discovered checks pass.",
  "",
  `Full plan: ${join(artifacts, "plan.md")}`,
  `Proposal: ${join(artifacts, "proposal.md")}`,
  "",
  "Approve plan, Revise plan (put what to change in the text), or Back to interview (put what to revisit in the text).",
];
console.log(out.join("\n"));
