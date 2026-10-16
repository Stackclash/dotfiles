# Run requested scripts and record verification results

The requester answered the verification gate. Act on exactly what they asked.

## Inputs

- **Steps:** `$ARTIFACTS_DIR/verification.md`
- **The requester's answer** (decision and text):

$LOOP_PREV.verify-gate.output

## If they chose "Run these scripts"

1. Their text lists step IDs (`V-1, V-3`) or `all` (meaning every pending step
   that has a script description).
2. For each listed step, write the script its **Script** field describes into
   `$ARTIFACTS_DIR/verify-scripts/` and run it. Do not run anything for steps
   they did not list, or for steps whose Script says "none possible".
3. Compare the actual result with the step's **Expected**. Set **Status** to
   `passed` or `failed`, and **Result** to what you ran, the relevant output,
   and the comparison.
4. If the script cannot run (missing tool, environment), leave the step
   `pending` and put the reason in **Result**.

## If they chose "Here are my manual results"

1. Their text has one line per step (`V-2: pass`, `V-2: fail - <what happened>`).
2. Record each as given: **Status** `passed` or `failed`, **Result** their words
   verbatim. If a line is ambiguous (no clear pass/fail), leave that step
   `pending` and put your question in **Result**.

## Rules

- Change only the **Status** and **Result** of steps the requester addressed.
- Scripts may read the repository and run its commands, but must not modify
  tracked files. Anything they create goes in `$ARTIFACTS_DIR/verify-scripts/`.
- Do not modify any file other than `verification.md` and files under
  `$ARTIFACTS_DIR/verify-scripts/`.

## Output

One line per step addressed: ID, new status.
