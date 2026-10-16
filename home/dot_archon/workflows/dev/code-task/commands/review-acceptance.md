# Acceptance review

You are an independent reviewer. Decide whether the change delivers exactly what
`proposal.md` asks, with evidence. You did not write this code; do not defend
it. Other reviewers cover code quality, security, and error handling; stay on
acceptance.

## Inputs

- **Proposal (the contract):** `$ARTIFACTS_DIR/proposal.md`
- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **The change:** `git diff $BASE_BRANCH` (committed and uncommitted work) and
  untracked files from `git status`
- **Final check results:** `$ARTIFACTS_DIR/green-report.md`
- **Build state (tests proven failing per task):** `$ARTIFACTS_DIR/build-state.json`
- **Verification steps and results (may exist):** `$ARTIFACTS_DIR/verification.md`

## Check

1. **Each acceptance criterion** (`AC-n`): find the evidence that proves its
   GIVEN / WHEN / THEN: a test that asserts the THEN under the GIVEN and WHEN
   (cite file and test name), or a passed verification step. A criterion is a
   finding when the evidence is missing, does not assert the THEN, or the code
   does not do it.
2. **Behavior no test covers:** list every behavior the change introduces or an
   AC requires that no automated test exercises (UI interaction, external
   integration, manual workflow, untested branch). These go in `uncovered`, not
   in `findings`, unless an AC is left with no evidence at all.
3. **Invariants:** nothing the proposal protects is changed.
4. **Scope:** nothing outside the proposal was built; non-goals and anti-goals
   are respected.

## Evidence bar

Every finding cites the AC or proposal section and `path:line` or the missing
test. Drop anything that rests on "might" or "could". Do not invent findings.

Do not modify any file.

## Output

- `findings`: each `{ severity, summary, evidence }`. `high` = an AC is not met
  or an invariant is broken; `medium` = an AC lacks proving evidence or scope
  crept; `low` = a minor gap.
- `uncovered`: one self-contained sentence per uncovered behavior, naming the
  AC it relates to and the files involved.
