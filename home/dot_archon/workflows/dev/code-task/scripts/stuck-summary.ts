// Compose the stuck-gate message for a task that could not be completed.
import { readFileSync } from "node:fs";
import { artifact, requireState } from "../../.shared/build.ts";

const state = requireState();
const task = readFileSync(artifact("current-task.md"), "utf8");

console.log(
  [
    `# ${state.current} is stuck`,
    "",
    state.attempts ? `Implementation attempts: ${state.attempts}.` : "Stopped before implementation.",
    "",
    "## What failed",
    state.last_failure.trim() || "_No failure recorded._",
    "",
    "## The task",
    task.trim(),
    "",
    `Logs are in ${process.env.ARTIFACTS_DIR ?? ""}.`,
    "",
    "Retry with guidance (put your guidance in the text), I fixed it, re-check (after fixing it in the worktree yourself), or Abort run.",
  ].join("\n"),
);
