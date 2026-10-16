// Join gate for every requirements path: proposal.md must exist and carry
// well-formed acceptance criteria, and nothing so far may have touched the
// worktree. Emits the AC IDs and unresolved items for later nodes.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { blocks, bullets, section } from "../../.shared/markdown.ts";
import { changesSinceSnapshot } from "../../.shared/worktree.ts";

function fail(msg: string): never {
  console.error(`check-proposal: ${msg}`);
  process.exit(1);
}

const path = join(process.env.ARTIFACTS_DIR ?? "", "proposal.md");
if (!existsSync(path)) fail(`${path} is missing`);
const md = readFileSync(path, "utf8");

const acSection = section(md, "Acceptance criteria");
if (acSection === null) fail("proposal.md has no '## Acceptance criteria' section");

const acs = blocks(acSection);
if (acs.length === 0) fail("proposal.md has no acceptance criteria");

const ids: string[] = [];
const problems: string[] = [];
for (const { heading, text } of acs) {
  const m = heading.match(/^###\s+(AC-\d+):\s*\S/);
  if (!m) {
    problems.push(`heading "${heading}" is not '### AC-n: <title>'`);
    continue;
  }
  if (ids.includes(m[1])) problems.push(`${m[1]} is duplicated`);
  ids.push(m[1]);
  for (const kw of ["GIVEN", "WHEN", "THEN"]) {
    if (!new RegExp(`^\\s*-\\s*\\**${kw}\\b`, "m").test(text)) problems.push(`${m[1]} has no ${kw} line`);
  }
}
if (problems.length) fail(`malformed acceptance criteria:\n- ${problems.join("\n- ")}`);

const changed = changesSinceSnapshot();
if (changed.length) fail(`requirements and planning are read-only but the worktree changed:\n${changed.join("\n")}`);

console.log(JSON.stringify({ acceptance_criteria: ids, unresolved: bullets(section(md, "Unresolved")) }));
