# Open a draft pull request

The requester approved opening a draft pull request for this branch. Push the
branch and open the PR as a **draft**. Do nothing else.

## Inputs

- **Forge:** $pr-check.output.forge
- **Branch:** $pr-check.output.branch
- **Base branch:** $BASE_BRANCH
- **Title:** the first `# ` heading of `$ARTIFACTS_DIR/report.md`
- **Description:** the full contents of `$ARTIFACTS_DIR/report.md`

## Steps

1. Push the branch: `git push -u origin <branch>`. Do not force-push. If the push
   is rejected, stop and report the error.
2. Open the draft PR targeting the base branch:
   - **github:** `gh pr create --draft --base <base> --head <branch> --title
     "<title>" --body-file "$ARTIFACTS_DIR/report.md"`
   - **azure-devops:** use the azure-ado MCP tool
     `repo_create_pull_request` with `isDraft: true`, the branch as source, the
     base branch as target, the title, and the report as description. Use
     `repo_get_repo_by_name_or_id` first if you need the repository ID.
   - **other / none:** do not open anything; report that the forge is not
     supported and give the pushed branch name.
3. If a PR for this branch already exists, do not open a second one; return its
   URL.

## Do not

- Mark the PR ready for review, request reviewers, merge, or enable auto-merge.
- Link work items or use `AB#` mentions; the workflow never writes to the board.
- Modify, stage, or commit any file.

## Output

`url`: the PR's URL, or `""` if none was opened. `error`: what went wrong, or
`""`.
