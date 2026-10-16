// Snapshot the worktree so check-docs can see exactly what write-docs changed.
import { saveSnapshot } from "../../.shared/worktree.ts";

saveSnapshot("docs-start.txt");
console.log("snapshot saved");
