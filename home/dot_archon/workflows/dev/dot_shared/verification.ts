// verification.md: one "### V-n: title" block per step, each with a
// "- **Status:** pending | passed | failed" line and a "- **Files:**" line.
import { existsSync, readFileSync } from "node:fs";
import { artifact } from "./build.ts";
import { blocks } from "./markdown.ts";

export type Step = { id: string; title: string; status: string; files: string[]; text: string };

export function readSteps(): Step[] {
  const p = artifact("verification.md");
  if (!existsSync(p)) return [];
  return blocks(readFileSync(p, "utf8"))
    .map(({ heading, text }) => {
      const m = heading.match(/^###\s+(V-\d+):\s*(.*)$/);
      if (!m) return null;
      const field = (name: string) => text.match(new RegExp(`^\\s*-\\s*\\*\\*${name}:?\\*\\*:?\\s*(.*)$`, "im"))?.[1].trim() ?? "";
      return {
        id: m[1],
        title: m[2].trim(),
        status: (field("Status").match(/pending|passed|failed/i)?.[0] ?? "pending").toLowerCase(),
        files: field("Files")
          .split(/[,\s]+/)
          .map((f) => f.replace(/[`]/g, "").replace(/\\/g, "/"))
          .filter((f) => f && f.toLowerCase() !== "none"),
        text: text.trim(),
      };
    })
    .filter((s): s is Step => s !== null);
}
