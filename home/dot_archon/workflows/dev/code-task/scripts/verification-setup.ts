// Decide whether this validation pass needs the verification loop: always in
// repos without tests; otherwise when the acceptance review found behavior no
// test covers, or earlier steps are still pending or failed.
import { readSteps } from "../../.shared/verification.ts";

const hasTests = process.env.INPUTS_HAS_TESTS === "true";
const uncovered: string[] = JSON.parse(process.env.INPUTS_UNCOVERED || "[]");
const open = readSteps().filter((s) => s.status !== "passed");

const needed = !hasTests || uncovered.length > 0 || open.length > 0;
console.log(JSON.stringify({ needed }));
