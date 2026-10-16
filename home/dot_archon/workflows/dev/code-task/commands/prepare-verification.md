# Prepare verification steps

Write or update `verification.md`: the checks that automated tests do not cover,
each with manual instructions and, where possible, an explained script the
requester can choose to have run. Nothing runs at this step.

## Inputs

- **Plan (Verification fields, in repos without tests):** `$ARTIFACTS_DIR/plan.md`
- **Behavior the acceptance review found no test covers:**
  $review-acceptance.output.uncovered
- **Proposal (acceptance criteria):** `$ARTIFACTS_DIR/proposal.md`
- **Existing steps and results (from an earlier validation pass, may exist):**
  `$ARTIFACTS_DIR/verification.md`
- **Was this pass a fix?** `$ARTIFACTS_DIR/fix-base.json` (`fixing: true`)

## Steps

1. If `verification.md` exists, keep every step and its result. Set any
   `failed` step back to `pending` if this pass applied a fix (the fix may have
   addressed it). Never change a `passed` step.
2. Add a step for every plan Verification field and every uncovered behavior not
   already covered by an existing step. Number new steps after the highest
   existing `V-n`.
3. For each new step, read the code involved so the instructions are exact.

## Step format

```
### V-1: <what is being verified>
- **Source:** <T-n verification step | uncovered behavior: AC-n>
- **Not covered by tests:** <yes, with one line on why | no>
- **Files:** <repository paths this step exercises, comma-separated>
- **Manual:** <numbered actions a person performs, with exact inputs>
- **Expected:** <the exact observable result>
- **Script:** <if a script could perform this check: what it would run and what
  it would assert, in plain words, including any side effects; otherwise
  "none possible: <reason>">
- **Status:** pending
- **Result:** _None yet._
```

Write a script description only when a script can genuinely perform the check
without a GUI, a physical device, or credentials it does not have. Do not write
or run the script now.

## Write

`$ARTIFACTS_DIR/verification.md`, starting with `# Verification steps`. Modify
no other file.

## Output

One line: steps kept, steps added, steps reset to pending.
