// Count pending verification steps and compose the verify-gate message.
import { readSteps } from "../../.shared/verification.ts";

const steps = readSteps();
const pending = steps.filter((s) => s.status === "pending");
const settled = steps.filter((s) => s.status !== "pending");

const message = [
  `# Verification: ${pending.length} step(s) need a result`,
  "",
  "Each step has manual instructions. Where a script could do the check, the",
  "step explains what that script would run; nothing runs unless you ask.",
  "",
  ...pending.map((s) => `${s.text}\n`),
  settled.length ? `## Already settled\n${settled.map((s) => `- ${s.id} ${s.title}: ${s.status}`).join("\n")}\n` : "",
  "## How to answer",
  "- **Run these scripts**: list the step IDs in the text (e.g. `V-1, V-3`) or `all`.",
  "- **Here are my manual results**: one line per step, e.g. `V-2: pass` or",
  "  `V-2: fail - the dialog never appeared`.",
  "Steps you leave out stay pending and come back in the next round.",
].join("\n");

console.log(JSON.stringify({ pending: pending.length, message }));
