<!--
Engineering discipline (think first, simplicity, surgical changes, verifiable
goals) adapted from multica-ai/andrej-karpathy-skills CLAUDE.md.
-->

# Write the failing tests for one task

Write the tests for exactly one task of the plan, before any implementation
exists. A deterministic check runs right after you: it fails the step if you
changed any file other than the test files you declare, or if your targeted
test command passes. The tests must fail now, for the right reason, and pass
once the task is implemented.

## Inputs

- **The task, why a previous attempt failed (if one did), and any requester
  guidance:** `$ARTIFACTS_DIR/current-task.md`
- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **Proposal (the contract; acceptance criteria are GIVEN / WHEN / THEN):**
  `$ARTIFACTS_DIR/proposal.md`
- **The repository's full test command:** `$discover-toolchain.output.test`

## Steps

1. Read `current-task.md`. If it contains requester guidance, it overrides the
   plan where they differ. If it says a re-check was requested, the requester
   edited the tests by hand: keep their tests, change nothing unless the task's
   tests are missing, and declare them.
2. Read the existing tests near the code this task changes, and follow their
   layout, naming, framework, and style exactly.
3. Write the test cases the task's **Tests** field names. Each test asserts the
   observable behavior of the acceptance criterion it proves (the THEN), set
   up from its GIVEN and driven by its WHEN. Name each test so the AC ID is
   findable (in the name or a comment).
4. Prefer failures on assertions over failures on missing symbols, where the
   language allows; a compile or import failure is acceptable only when the
   code under test does not exist yet.
5. Work out the narrowest command that runs only these tests, using the
   repository's own test runner (for example the full test command with a file
   path or filter appended). Run it once yourself and confirm it fails for the
   expected reason. If it fails for an unrelated reason (syntax error in your
   test, wrong path), fix the test.

## Engineering discipline

- **Don't guess silently.** If the task's Tests field or the acceptance
  criterion can be read more than one way, test the reading the proposal
  supports most directly, and leave a one-line comment above that test naming
  the other reading. Reviewers will see it.
- **Simplicity.** Only the cases the task names, each asserting one behavior.
  No new test helpers, base classes, or fixtures when the existing tests manage
  without them; no cases for inputs that cannot occur.
- **Surgical changes.** Add tests; do not reformat, rename, or tidy existing
  tests in the same files. Match the surrounding test style exactly.

## Do not

- Create or modify any non-test file: no implementation, no stubs, no fixtures
  outside the test tree, no config changes.
- Weaken a test to make it fail convincingly; it must express the real
  requirement.
- Commit, stage, or touch `$DOCS_DIR`.

## Output

`test_command`: the targeted command, runnable from the repository root.
`test_files`: every file you created or modified, as repository-relative paths.
