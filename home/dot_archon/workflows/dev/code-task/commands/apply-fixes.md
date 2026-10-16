<!--
Engineering discipline (think first, simplicity, surgical changes, verifiable
goals) adapted from multica-ai/andrej-karpathy-skills CLAUDE.md.
-->

# Fix validation findings

The requester reviewed the validation findings and chose **Fix**. Address them.

## Inputs

- **Findings:** `$ARTIFACTS_DIR/fix-request.md`
- **Requester's direction** (which findings to fix, or how; "fix all" when
  empty): `$ARTIFACTS_DIR/fix-guidance.md`
- **Proposal (the contract):** `$ARTIFACTS_DIR/proposal.md`
- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **Latest check results and logs:** `$ARTIFACTS_DIR/green-report.md`,
  `$ARTIFACTS_DIR/build-*.log`
- **Verification steps and results (may exist):** `$ARTIFACTS_DIR/verification.md`

## Steps

1. Read the requester's direction first. It decides which findings to fix and
   overrides the findings' suggested fixes where they differ. Findings it
   excludes stay unfixed.
2. For each finding to fix, confirm its evidence in the code, then fix the cause
   rather than the symptom.
3. Where a finding is a behavior bug in a repository with tests, add a test that
   fails without the fix and passes with it, next to the existing tests.
4. Run the repository's checks to confirm nothing that passed at baseline now
   fails.
5. Where a finding's evidence does not hold up, do not change code for it; say
   so in your output.
6. Reread your diff before finishing, and revert any line that does not trace to
   a finding you were asked to fix.

## Engineering discipline

- **Don't guess silently.** If a finding or the requester's direction can be
  read more than one way, fix the reading the evidence supports and name the
  other in your output. If you cannot tell, leave it unfixed and say why.
- **Simplicity.** The minimum change that resolves each finding. A finding is
  not a licence to redesign; no new abstractions, options, or defensive handling
  for scenarios that cannot occur.
- **Surgical changes.** Every changed line traces to a finding being fixed.
  Do not improve adjacent code, comments, or formatting, or refactor working
  code. Match the existing style. Remove only what *your* fix made unused.

## Do not

- Modify any test that a task proved failing before implementation (listed per
  task in `$ARTIFACTS_DIR/build-state.json`); add new tests instead.
- Change behavior the proposal lists as an invariant, or expand scope.
- Commit, stage, or write to `$DOCS_DIR`.

## Output

One line per finding: fixed (what changed), or not fixed (why). Then any
assumptions you made.
