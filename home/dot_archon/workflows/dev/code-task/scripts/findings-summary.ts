// Merge everything validation found into findings.md and the findings-gate
// message. clean = nothing at all to report, which ends the validation loop.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { artifact } from "../../.shared/build.ts";
import { readSteps } from "../../.shared/verification.ts";
import { changedPathsSinceSnapshot } from "../../.shared/worktree.ts";

type Finding = { severity: string; summary: string; evidence: string };
const parse = <T>(name: string, fallback: T): T => {
  try {
    return JSON.parse(process.env[name] || "") as T;
  } catch {
    return fallback;
  }
};

const checkFailures = [...parse<string[]>("INPUTS_CHECK_FAILURES", []), ...parse<string[]>("INPUTS_NEW_FAILURES", [])];
const reviews: Record<string, Finding[]> = {
  Acceptance: parse("INPUTS_ACCEPTANCE", []),
  Quality: parse("INPUTS_QUALITY", []),
  Security: parse("INPUTS_SECURITY", []),
  "Error handling": parse("INPUTS_ERRORS", []),
};
const uncovered = parse<string[]>("INPUTS_UNCOVERED", []);
const steps = readSteps();
const failedSteps = steps.filter((s) => s.status === "failed");

// Passed verification steps whose files this pass's fix touched: their result
// is kept, but the requester should know it predates the fix.
let touchedPassed: string[] = [];
const base = existsSync(artifact("fix-base.json")) ? JSON.parse(readFileSync(artifact("fix-base.json"), "utf8")) : null;
if (base?.fixing && base.head) {
  const diff = Bun.spawnSync(["git", "diff", "--name-only", base.head], { stdout: "pipe" }).stdout.toString();
  const touched = new Set([
    ...diff.split(/\r?\n/).filter(Boolean),
    ...changedPathsSinceSnapshot("validation-pass-start.txt", true),
  ]);
  touchedPassed = steps
    .filter((s) => s.status === "passed" && s.files.some((f) => touched.has(f)))
    .map((s) => `${s.id} ${s.title} (passed before this fix; the fix changed ${s.files.filter((f) => touched.has(f)).join(", ")})`);
}

const order = ["high", "medium", "low"];
const lines: string[] = ["# Validation findings", ""];
let count = 0;

if (checkFailures.length) {
  lines.push("## Checks", ...checkFailures.map((f) => `- **high** ${f}`), "");
  count += checkFailures.length;
}
for (const [name, findings] of Object.entries(reviews)) {
  if (!findings.length) continue;
  const sorted = [...findings].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  lines.push(`## ${name} review`, ...sorted.map((f) => `- **${f.severity}** ${f.summary}\n  Evidence: ${f.evidence}`), "");
  count += findings.length;
}
if (failedSteps.length) {
  lines.push("## Failed verification steps", ...failedSteps.map((s) => `- **high** ${s.id} ${s.title}`), "");
  count += failedSteps.length;
}

const notes: string[] = [];
if (uncovered.length) notes.push("## Not covered by tests (verified separately)", ...uncovered.map((u) => `- ${u}`), "");
if (touchedPassed.length) notes.push("## Verified steps affected by the last fix", ...touchedPassed.map((t) => `- ${t}`), "");

const clean = count === 0;
const body = [...lines, ...(clean ? ["No findings.", ""] : []), ...notes].join("\n");
writeFileSync(artifact("findings.md"), body);

const message = [
  body,
  "Fix (optionally say which findings or how, in the text), Accept as-is, or Abort run.",
].join("\n");
console.log(JSON.stringify({ clean, count, message }));
