// The report must exist and account for every acceptance criterion.
import { existsSync, readFileSync } from "node:fs";
import { artifact } from "../../.shared/build.ts";
import { blocks, section } from "../../.shared/markdown.ts";

const fail = (msg: string): never => {
  console.error(`check-report: ${msg}`);
  process.exit(1);
};

if (!existsSync(artifact("report.md"))) fail("report.md is missing");
const report = readFileSync(artifact("report.md"), "utf8");
const proposal = readFileSync(artifact("proposal.md"), "utf8");

const ids = blocks(section(proposal, "Acceptance criteria") ?? "")
  .map((b) => b.heading.match(/^###\s+(AC-\d+):/)?.[1])
  .filter((id): id is string => !!id);
const reportSection = section(report, "Acceptance criteria") ?? "";
const missing = ids.filter((id) => !new RegExp(`^###\\s+${id}:`, "m").test(reportSection));
if (missing.length) fail(`report.md does not account for ${missing.join(", ")}`);

console.log(`report accounts for ${ids.length} acceptance criteria`);
