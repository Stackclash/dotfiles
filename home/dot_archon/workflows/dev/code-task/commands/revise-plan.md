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

## Output

One line: findings addressed, findings rejected (with the reason recorded), and
proposal issues added.
