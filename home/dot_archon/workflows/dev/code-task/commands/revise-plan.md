# Revise the plan from review findings

An independent review found problems in `plan.md`. Fix them.

## Inputs

- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **Review:** `$ARTIFACTS_DIR/plan-review.md`
- **Proposal (the contract):** `$ARTIFACTS_DIR/proposal.md`

## Steps

1. For each finding, check its evidence in the code or proposal. If it holds,
   change the plan to address it. If it does not hold, leave the plan as is and
   record why under `## Review responses` at the end of the plan.
2. Keep the plan's format exactly (task headings, fields, section names), and
   keep task IDs stable where tasks survive.
3. If a finding reveals that the proposal itself is the problem, do not work
   around it: add it under `## Proposal issues`.
4. Change only what the findings require. Do not add tasks, options, or
   abstractions a finding did not call for, and do not rewrite parts of the plan
   no finding touched. Record any new interpretation you had to choose under
   `## Assumptions`.

Modify only `$ARTIFACTS_DIR/plan.md`.

## Where to look

Search only inside this repository and the projects folder
`$INPUTS.projects_dir`, where the requester's other local projects live (a
project the task names, such as a sibling repo, is a folder in it; check its
immediate subfolders before going deeper). If the projects folder is empty,
search only this repository.

Never search the whole filesystem, your home directory, or a drive root: no
`find /`, `find ~`, `find /c`, `ls -R /`, `dir /s` on a drive, or similar. Such
searches can run for hours and hang this run. If what you need is in neither
place, say so in your output instead of searching further.

## Output

One line: findings addressed, findings rejected (with the reason recorded), and
proposal issues added.
