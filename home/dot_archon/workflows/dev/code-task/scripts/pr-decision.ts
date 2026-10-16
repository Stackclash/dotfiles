// Read the PR gate's answer from its whole output.
import { gateDecision } from "../../.shared/gate.ts";

console.log(JSON.stringify({ open: gateDecision(process.env.INPUTS_PR_GATE).decision === "approve" }));
