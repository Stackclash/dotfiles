# Fetch Azure DevOps work item

Retrieve one Azure DevOps work item and its immediate context, and transcribe it
faithfully into a file. You are a transcriber, not an analyst: do not interpret,
summarize away detail, propose solutions, or explore the codebase.

**Work item ID:** $intake.output.work_item_id
**Project:** $intake.output.project
**Requester's message (context only, not part of the ticket):** $intake.output.request

## Steps

1. Get the work item with its relations expanded (`wit_get_work_item`, expand
   relations) in the project above.
   - If the call fails for any reason (not found, unauthorized, wrong organization,
     wrong project), stop immediately. Write no file. Return `fetched: false` and
     put the exact error text plus the ID and project you used in `error`.
2. From the relations, collect the parent (at most one) and children. Fetch them
   with `wit_get_work_items_batch_by_ids`. Related items: titles only.
3. List the work item's comments (`wit_list_work_item_comments`); keep the 20 most
   recent.
4. Write `$ARTIFACTS_DIR/work-item.md` with these sections, copying field content
   verbatim (convert HTML to Markdown, keep all wording):
   - `# <Type> <ID>: <Title>` and a line with State, Area Path, Iteration Path, Tags
   - `## Description`
   - `## Acceptance Criteria` (write `_None provided._` if the field is empty)
   - `## Repro Steps` (Bugs only; `_None provided._` if empty)
   - `## Parent` — type, ID, title, description
   - `## Children` — type, ID, title, state per line
   - `## Related` — type, ID, title per line
   - `## Comments` — author, date, text; oldest first
   - `## Attachments` — file names only; do not download
5. Identify gaps — things an engineer would need answered before planning. Only
   list a gap you can point to in the ticket text:
   - acceptance criteria missing or not testable
   - description empty or a single vague line
   - description and comments contradict each other (quote both)
   - questions asked in comments that were never answered (quote them)
   Write each gap as one self-contained sentence. Do not invent gaps from what
   the ticket "might" need.

## Do not

- Modify the work item, add comments, or change its state.
- Read or search the repository.

## Output

Return `fetched`, `error` (empty string on success), `has_acceptance_criteria`
(true only if the Acceptance Criteria field is non-empty), and `gaps`.
