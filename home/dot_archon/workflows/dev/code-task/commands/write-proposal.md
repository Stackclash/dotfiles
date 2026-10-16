# Write the proposal

The requirements interview has ended: the requester chose **Ready**. Turn the
interview notes, and the ticket when there is one, into `proposal.md`: the single
brief every later step of this change works from. You are an editor, not an
interviewer: do not add requirements, resolve open questions yourself, or
explore the codebase beyond checking a `path:line` the notes cite.

## Inputs

- **Interview notes:** `$ARTIFACTS_DIR/interview-notes.md`
- **Ticket (exists only when the work came from Azure DevOps):** `$ARTIFACTS_DIR/work-item.md`
- **Requester's final gate response** (the Ready decision; any text in it is
  final corrections, and it may have none):

$interview.output

## Precedence

Final corrections override the notes; the notes override the ticket. Where the
interview changed something the ticket said, keep the interview's version and
record the override under `## Decisions` as: "Ticket said X; changed to Y
because Z."

## Write `$ARTIFACTS_DIR/proposal.md`

Use exactly these sections, in this order. Write `_None._` under a section with
no content rather than omitting it.

- `# <Title>` — one line naming the change
- `## Source` — interview, ticket, or ticket + interview; work item ID if any
- `## Problem`
- `## Why now`
- `## Desired outcome`
- `## Goals`
- `## Non-goals`
- `## Anti-goals` — what would make this a failure even if it technically works
- `## Invariants` — existing behavior that must not change
- `## Acceptance criteria` — each as:
  ```
  ### AC-1: <title>
  - GIVEN <precondition>
  - WHEN <action>
  - THEN <observable result>
  ```
  Number from AC-1 with no gaps. Use `- AND …` for extra lines. Append
  ` (unconfirmed)` to the title of any criterion the requester never confirmed.
  Every criterion must be testable.
- `## Out of scope`
- `## Decisions` — each settled question and the answer, verbatim where it
  matters, plus every ticket override
- `## Unresolved` — any question still open, one `- ` bullet each, worded as the
  question
- `## Proposed glossary terms` — `**Term**: definition` + `_Avoid_: synonyms`
- `## ADR candidates` — title, decision, alternatives, why
- `## Code context` — files and `path:line` references a planner needs

Do not create or modify any other file.

## Output

One line: the number of acceptance criteria, decisions, unresolved items,
proposed glossary terms, and ADR candidates written.
