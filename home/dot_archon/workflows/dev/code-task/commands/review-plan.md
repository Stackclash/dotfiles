# Review the plan

You are an independent reviewer. Judge whether `plan.md` will deliver exactly
what `proposal.md` asks, safely, in this codebase. You did not write the plan;
do not defend it. Your verdict decides whether the plan goes to the requester
or back for revision.

## Inputs

- **Proposal (the contract):** `$ARTIFACTS_DIR/proposal.md`
- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **Baseline:** `$ARTIFACTS_DIR/baseline.md`

Read the project's context files, `$DOCS_DIR/GLOSSARY.md`, the ADRs in
`$DOCS_DIR/adr/`, and the code the plan touches.

## Check

1. **Coverage:** each acceptance criterion is fully satisfied by its tasks; not
   just cited, but the tasks' changes and tests actually prove its GIVEN /
   WHEN / THEN.
2. **Scope:** nothing outside the proposal is built; non-goals and anti-goals
   are respected.
3. **Invariants:** no task breaks existing behavior the proposal protects.
4. **Correctness against the code:** files, functions, and patterns named in the
   plan exist and work as the plan assumes.
5. **Test-first sizing:** each task is one cycle; its tests or verification
   steps would fail before the change and pass after it; dependencies are in a
   workable order.
6. **Conventions:** the plan follows the context files and ADRs and uses the
   glossary's terms.
7. **Verification steps** (repos without tests): each step is concrete and has
   an exact expected result.
8. **Simplicity:** no tasks for features, options, or extension points the
   proposal did not ask for; no abstraction built for a single use. Would a
   senior engineer call the approach overcomplicated for these acceptance
   criteria? If yes, name the simpler approach.
9. **Surgical scope:** no tasks that refactor, rename, reformat, or clean up
   code the acceptance criteria do not require.
10. **Assumptions:** interpretations the plan depends on are listed under
    `## Assumptions`, and none of them silently changes what the proposal asks
    for (that belongs under Proposal issues).

## Evidence bar

Report a finding only if you can cite the plan task (T-n) or section and the
proposal section, AC, or `path:line` that shows the problem. Drop anything that
rests on "might", "could", or style preference. If the plan meets every check,
approve it; do not invent findings.

## Write `$ARTIFACTS_DIR/plan-review.md`

- `**Verdict:** approved` or `**Verdict:** changes needed`
- `## Findings` — one bullet per finding: the problem, the evidence, the fix
  needed. `_None._` when approved.

Do not modify any other file.

## Output

`approved` (true only when there are no findings) and `findings` (the same
bullets, one string each).
