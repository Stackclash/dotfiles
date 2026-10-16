// Single commit for the whole change, when the requester chose it at the
// commit-mode gate; a no-op otherwise.
import { readFileSync } from "node:fs";
import { artifact } from "../../.shared/build.ts";
import { commitChanges } from "../../.shared/commit.ts";
import { gateDecision } from "../../.shared/gate.ts";

if (gateDecision(process.env.INPUTS_COMMIT_MODE).decision !== "end") {
  console.log(JSON.stringify({ committed: false }));
  process.exit(0);
}

const title = readFileSync(artifact("proposal.md"), "utf8")
  .split(/\r?\n/)
  .find((l) => /^#\s/.test(l))
  ?.replace(/^#\s+/, "")
  .trim();
const committed = commitChanges(title || "Implement change");
console.log(JSON.stringify({ committed }));
