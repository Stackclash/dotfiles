# Write the proposal from a complete ticket

An Azure DevOps work item was fetched, has acceptance criteria and no gaps, and
was checked against the code, glossary and ADRs with no conflicts found. No
interview took place. Turn the ticket into `proposal.md`: the single brief every
later step of this change works from.

You are a translator, not an author: carry the ticket's intent across faithfully.
Do not add requirements the ticket does not state or imply, and do not drop any
it does.

## Inputs

- **Ticket:** `$ARTIFACTS_DIR/work-item.md`
- **Requester's message (context only):** $intake.output.request
- **Docs directory:** `$DOCS_DIR`

## Steps

1. Read the ticket.
2. Read the project's context files (`CLAUDE.md`, `AGENTS.md`,
   `.github/copilot-instructions.md`, `README*`), `$DOCS_DIR/GLOSSARY.md`, and
   the ADRs in `$DOCS_DIR/adr/`, where present. Use the glossary's terms.
3. Read the code the ticket concerns, enough to fill `## Code context` and to
   state invariants accurately.
4. Convert each acceptance criterion in the ticket into one or more GIVEN / WHEN
   / THEN scenarios. Keep the ticket's meaning exactly; split a compound
   criterion into separate scenarios. If a criterion cannot be made testable
   without inventing a requirement, keep it as close to the ticket's wording as
   possible and list the ambiguity under `## Unresolved`.

## Write `$ARTIFACTS_DIR/proposal.md`

Use exactly these sections, in this order. Write `_None._` under a section with
no content rather than omitting it.

- `# <Title>` — the ticket's title
- `## Source` — "ticket", with the work item ID
- `## Problem`
- `## Why now` — from the ticket; `_None._` if it does not say
- `## Desired outcome`
- `## Goals`
- `## Non-goals`
- `## Anti-goals` — `_None._` unless the ticket states one
- `## Invariants` — existing behavior the ticket must not change, as evident
  from the ticket and the code
- `## Acceptance criteria` — each as:
  ```
  ### AC-1: <title>
  - GIVEN <precondition>
  - WHEN <action>
  - THEN <observable result>
  ```
  Number from AC-1 with no gaps. Use `- AND …` for extra lines.
- `## Out of scope`
- `## Decisions` — decisions recorded in the ticket or its comments
- `## Unresolved` — ambiguities found while converting, one `- ` bullet each
- `## Proposed glossary terms` — domain terms the ticket introduces that the
  glossary lacks: `**Term**: definition` + `_Avoid_: synonyms`
- `## ADR candidates` — `_None._` unless the ticket records a decision that is
  hard to reverse, surprising without context, and the result of a real
  trade-off
- `## Code context` — files and `path:line` references a planner needs

Do not create or modify any other file.

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

One line: the number of acceptance criteria and unresolved items written.
