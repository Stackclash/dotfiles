# Write the final report

Write `report.md`: the record of what this run delivered, for the requester and
for anyone reviewing the change. Report facts from the artifacts and the
repository; do not soften failures or omit accepted findings.

## Inputs

- **Proposal:** `$ARTIFACTS_DIR/proposal.md`
- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **Build state (tasks, tests proven failing):** `$ARTIFACTS_DIR/build-state.json`
- **Final checks:** `$ARTIFACTS_DIR/green-report.md`; baseline:
  `$ARTIFACTS_DIR/baseline.md`
- **Verification (may exist):** `$ARTIFACTS_DIR/verification.md`
- **Last validation findings:** `$ARTIFACTS_DIR/findings.md`. If it lists
  findings, the requester accepted them as-is.
- **Docs written this run:** glossary terms $write-docs.output.glossary_terms;
  ADRs $write-docs.output.adrs
- **Repository:** `git log --oneline $BASE_BRANCH..HEAD`,
  `git diff --stat $BASE_BRANCH`, `git status`, `git branch --show-current`

## Write `$ARTIFACTS_DIR/report.md`

- `# <proposal title>`
- `## Summary`: two or three sentences on what changed and why
- `## Acceptance criteria`: one `### AC-n: <title>` per criterion in the
  proposal, each with its evidence: the test file and test name that prove it,
  or the verification step and its result. Say plainly if one has no evidence.
- `## Tests added`: test files and what they cover; `_None (repository has no
  tests)._` where applicable
- `## Checks`: final results against the baseline, including pre-existing
  failures
- `## Verification`: each step, its status, and who ran it (script or
  requester); `_None._` if there were no steps
- `## Accepted findings`: findings the requester accepted without fixing;
  `_None._` if none
- `## Commits`: the commits on this branch, or "No commits: changes are left
  uncommitted in the worktree."
- `## Docs (uncommitted)`: glossary terms and ADRs written to `$DOCS_DIR`,
  which the requester decides whether to commit
- `## Branch`: the branch name

If the work came from an Azure DevOps work item, name it in the summary as plain
text ("Work item 1234"), not with `AB#` syntax.

Modify no other file.

## Output

The full contents of `report.md`.
