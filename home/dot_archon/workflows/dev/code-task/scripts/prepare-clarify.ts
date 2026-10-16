// Start a clarify pass: collect why the requirements are being reopened
// (planner's proposal issues and/or your gate feedback) and reset the notes so
// the clarify interview begins at round 1.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bullets, section } from "../../.shared/markdown.ts";

const artifacts = process.env.ARTIFACTS_DIR ?? "";
const feedback = (process.env.INPUTS_FEEDBACK ?? "").trim();
const planPath = join(artifacts, "plan.md");
const issues = existsSync(planPath) ? bullets(section(readFileSync(planPath, "utf8"), "Proposal issues")) : [];

rmSync(join(artifacts, "clarify-notes.md"), { force: true });
writeFileSync(
  join(artifacts, "clarify-input.md"),
  [
    "# Why the requirements were reopened",
    "",
    "## Proposal issues raised by the planner",
    "",
    ...(issues.length ? issues.map((i) => `- ${i}`) : ["_None._"]),
    "",
    "## Requester's feedback at plan approval",
    "",
    feedback || "_None._",
    "",
  ].join("\n"),
);

console.log(`clarify input: ${issues.length} issue(s), feedback ${feedback ? "present" : "absent"}`);
