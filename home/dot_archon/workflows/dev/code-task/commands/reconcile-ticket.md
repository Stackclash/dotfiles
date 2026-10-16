# Reconcile the ticket against the project

Check one fetched Azure DevOps work item against the project as it exists today,
and report every place where they contradict each other. Your report decides
whether the requester is interviewed before planning, so a missed conflict
sends a wrong ticket straight to planning, and an invented one wastes the
requester's time.

## Inputs

- **Ticket:** `$ARTIFACTS_DIR/work-item.md`
- **Docs directory:** `$DOCS_DIR`

## Steps

1. Read the ticket.
2. Read the project's context, where present: `CLAUDE.md`, `AGENTS.md`,
   `.github/copilot-instructions.md`, `README*`, `CONTRIBUTING*`, and any nested
   `CLAUDE.md` / `AGENTS.md` in directories the ticket touches.
3. Read `$DOCS_DIR/GLOSSARY.md` and every ADR in `$DOCS_DIR/adr/`, if present.
4. Find and read the code the ticket concerns, and its tests.
5. List the conflicts. A conflict is a contradiction you can cite on **both**
   sides:
   - the ticket states current behavior that the code does not have
   - the ticket asks for something an ADR decided against, or a context file
     forbids
   - the ticket uses a term in a sense the glossary defines differently
   - the ticket names a file, endpoint, setting, or component that does not
     exist
   The evidence bar: quote the ticket, and cite `path:line`, the ADR file, or
   the glossary entry. Drop anything that rests on "might", "could", or "may be
   inconsistent". A ticket asking to *change* existing behavior is not a
   conflict by itself; it is one only when the ticket misdescribes what exists.
6. If there are conflicts, write `$ARTIFACTS_DIR/ticket-conflicts.md`: one
   `- ` bullet per conflict, each self-contained, with both sides' evidence.
   If there are none, write no file.

## Do not

- Modify any file other than `$ARTIFACTS_DIR/ticket-conflicts.md`.
- Report gaps (missing or vague information); those were collected already.
- Propose a resolution. The requester decides.

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

Return `conflicts`: the same bullets as the file, one string each, or `[]`.
