// Counts plan-review rounds so the review loop can hand open findings to the
// approval gate after round 3 instead of failing at max_iterations.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const path = join(process.env.ARTIFACTS_DIR ?? "", "review-round.txt");
const round = (existsSync(path) ? Number(readFileSync(path, "utf8")) || 0 : 0) + 1;
writeFileSync(path, String(round));
console.log(JSON.stringify({ round }));
