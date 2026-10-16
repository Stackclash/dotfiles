# Update the proposal after clarification

The requester settled the reopened requirements and chose **Ready**. Apply the
agreed changes to `proposal.md`. You are an editor: change only what the
clarification settled.

## Inputs

- **Proposal:** `$ARTIFACTS_DIR/proposal.md`
- **Clarify notes:** `$ARTIFACTS_DIR/clarify-notes.md`
- **Requester's final gate response** (any text is final corrections, which
  override the notes):

$clarify.output

## Steps

1. Apply every entry under `## Proposal changes` in the notes, plus the final
   corrections, to the matching proposal sections.
2. Keep the proposal's section layout and acceptance criteria format exactly:
   `### AC-n: <title>` with `- GIVEN` / `- WHEN` / `- THEN` lines. Keep existing
   AC numbers stable; a new criterion takes the next free number; a removed one
   leaves its number unused. Append ` (unconfirmed)` to any criterion the
   requester did not confirm.
3. Record each change under `## Decisions` as: "Revised during planning: X,
   because Y."
4. Remove from `## Unresolved` anything now settled; add anything still open
   from the notes' `## Open questions`.
5. Append new entries from the notes to `## Proposed glossary terms` and
   `## ADR candidates`.

Do not modify any file other than `$ARTIFACTS_DIR/proposal.md`.

## Output

One line: the sections changed and the acceptance criteria added, changed, or
removed.
