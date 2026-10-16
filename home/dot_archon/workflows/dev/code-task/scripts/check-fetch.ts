// Gate after fetch-ado: fail loudly on a failed fetch or missing artifact,
// otherwise record the ticket's gaps for the interview.
import { existsSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const fetched = process.env.INPUTS_FETCHED === "true";
const error = process.env.INPUTS_ERROR ?? "";
const hasAc = process.env.INPUTS_HAS_ACCEPTANCE_CRITERIA === "true";
const gaps: string[] = JSON.parse(process.env.INPUTS_GAPS || "[]");

if (!fetched) {
  console.error(`check-fetch: ADO work item fetch failed: ${error || "no error reported"}`);
  process.exit(1);
}

const artifact = join(process.env.ARTIFACTS_DIR ?? "", "work-item.md");
if (!existsSync(artifact) || statSync(artifact).size === 0) {
  console.error(`check-fetch: fetch-ado reported success but ${artifact} is missing or empty`);
  process.exit(1);
}

if (!hasAc && !gaps.some((g) => /acceptance criteria/i.test(g))) {
  gaps.unshift("The work item has no acceptance criteria.");
}

// The interview reads gaps from this file; its absence means there are none.
if (gaps.length > 0) {
  writeFileSync(
    join(process.env.ARTIFACTS_DIR ?? "", "ticket-gaps.md"),
    `# Ticket gaps\n\n${gaps.map((g) => `- ${g}`).join("\n")}\n`,
  );
}

console.log(JSON.stringify({ gaps }));
