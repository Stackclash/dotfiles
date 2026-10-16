// Combine the deterministic checks with the regression judge (when one ran)
// into the attempt's verdict, and count the attempt.
import { readFileSync } from "node:fs";
import { artifact, requireState, saveState } from "../../.shared/build.ts";

const green = process.env.INPUTS_GREEN === "true";
const needsJudge = process.env.INPUTS_NEEDS_JUDGE === "true";
const newFailures: string[] = JSON.parse(process.env.INPUTS_NEW_FAILURES || "[]");

const state = requireState();
const verdict = green && (!needsJudge || newFailures.length === 0);
state.attempts += 1;
state.last_green = verdict;
state.last_failure = verdict
  ? ""
  : [
      readFileSync(artifact("green-report.md"), "utf8"),
      newFailures.length ? `## New failures (regression judge)\n${newFailures.map((f) => `- ${f}`).join("\n")}` : "",
    ].join("\n");
saveState(state);

console.log(JSON.stringify({ green: verdict, attempts: state.attempts }));
