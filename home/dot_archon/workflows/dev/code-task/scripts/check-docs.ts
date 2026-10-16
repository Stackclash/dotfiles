// write-docs may only touch $DOCS_DIR. Compared against the snapshot taken
// just before it ran.
import { changedPathsSinceSnapshot } from "../../.shared/worktree.ts";

const docsDir = (process.env.INPUTS_DOCS_DIR ?? "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/?$/, "/");
const stray = changedPathsSinceSnapshot("docs-start.txt").filter((p) => !p.startsWith(docsDir));
if (stray.length) {
  console.error(`check-docs: write-docs may only change ${docsDir}, but changed: ${stray.join(", ")}`);
  process.exit(1);
}
console.log("docs confined to the docs directory");
