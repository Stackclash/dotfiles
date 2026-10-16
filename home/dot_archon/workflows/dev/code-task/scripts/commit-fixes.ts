// Commit a validation fix when the requester chose per-task commits.
import { commitChanges } from "../../.shared/commit.ts";
import { gateDecision } from "../../.shared/gate.ts";

const committed =
  gateDecision(process.env.INPUTS_COMMIT_MODE).decision === "approve" && commitChanges("Address validation findings");
console.log(JSON.stringify({ committed }));
