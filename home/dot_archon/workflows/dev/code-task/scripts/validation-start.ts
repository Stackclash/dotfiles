// Start of each validation pass. Acts on the previous pass's findings gate:
// Fix -> record what to fix for apply-fixes; Abort -> fail the run. Records
// the commit the pass starts from, so later steps can see what a fix touched.
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { artifact } from "../../.shared/build.ts";
import { gateDecision } from "../../.shared/gate.ts";
import { saveSnapshot } from "../../.shared/worktree.ts";

const gate = gateDecision(process.env.INPUTS_FINDINGS_GATE);
if (gate.decision === "abort") {
  console.error("validation-start: run aborted by the requester at the findings gate");
  process.exit(1);
}

const fix = gate.decision === "approve";
if (fix) {
  if (!existsSync(artifact("findings.md"))) {
    console.error("validation-start: Fix was chosen but findings.md is missing");
    process.exit(1);
  }
  copyFileSync(artifact("findings.md"), artifact("fix-request.md"));
  writeFileSync(artifact("fix-guidance.md"), `# Requester's direction for this fix\n\n${gate.text.trim() || "_Fix all findings._"}\n`);
}

const head = Bun.spawnSync(["git", "rev-parse", "HEAD"], { stdout: "pipe" }).stdout.toString().trim();
writeFileSync(artifact("fix-base.json"), JSON.stringify({ head, fixing: fix }));
saveSnapshot("validation-pass-start.txt");

console.log(JSON.stringify({ fix }));
