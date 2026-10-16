<!--
Glossary and ADR formats adapted from mattpocock/skills (domain-modeling; MIT).
-->

# Write the glossary and ADRs

The change is built and validated. Record what future readers, and future AI
sessions working in this repository, need to understand it: the domain terms it
settled and the architectural decisions it made. These files are a reference
other sessions will trust, so accuracy beats volume. The requester decides
whether to commit them; you never commit.

## Inputs

- **Proposal** (`## Proposed glossary terms`, `## ADR candidates`,
  `## Decisions`): `$ARTIFACTS_DIR/proposal.md`
- **Plan** (`## Design decisions`): `$ARTIFACTS_DIR/plan.md`
- **Interview and clarification notes (may exist):**
  `$ARTIFACTS_DIR/interview-notes.md`, `$ARTIFACTS_DIR/clarify-notes.md`
- **Validation findings and fixes (may exist):** `$ARTIFACTS_DIR/findings.md`,
  `$ARTIFACTS_DIR/fix-guidance.md`
- **The change as built:** `git diff $BASE_BRANCH`
- **Existing record:** `$DOCS_DIR/GLOSSARY.md` (or `$DOCS_DIR/GLOSSARY-MAP.md`
  for a multi-context repo) and `$DOCS_DIR/adr/`

Describe what was actually built. Where the artifacts and the diff disagree,
the diff wins.

## Glossary

Update `$DOCS_DIR/GLOSSARY.md`, creating it if absent:

```md
# {Context Name}

{One or two sentences: what this context is.}

## Language

**Term**:
{One or two sentences defining what it IS.}
_Avoid_: synonym, synonym
```

- Add only terms specific to this project's domain. General programming
  concepts (timeouts, retries, error types) do not belong, even if the change
  uses them heavily.
- Be opinionated: pick one canonical word and list the others under `_Avoid_`.
- Update an existing term only if this change genuinely changed its meaning;
  never duplicate one.
- No implementation details. It is a glossary, not a spec.
- If `GLOSSARY-MAP.md` exists, update the glossary of the context the change
  belongs to.

## ADRs

You decide what qualifies. Write an ADR only for a decision that is all three:

1. **Hard to reverse**: changing it later has a meaningful cost.
2. **Surprising without context**: a future reader would wonder why.
3. **The result of a real trade-off**: there were genuine alternatives.

Typical qualifiers: architectural shape, integration patterns, technology with
lock-in, boundary and ownership decisions, deliberate deviations from the
obvious approach, constraints not visible in the code, non-obvious rejected
alternatives. Most changes produce zero or one ADR; zero is a normal result.

Write each as `$DOCS_DIR/adr/NNNN-<slug>.md`, numbered after the highest
existing number (start at `0001`):

```md
# {Short title of the decision}

{1–3 sentences: the context, what was decided, and why.}
```

Add `## Considered Options` or `## Consequences` only when they carry real
value. If the decision supersedes an existing ADR, add `Status: superseded by
ADR-NNNN` to the old one rather than editing its content.

## Do not

- Modify anything outside `$DOCS_DIR`.
- Commit or stage anything.

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

`glossary_terms`: terms added or changed. `adrs`: paths of ADRs written or
updated. Empty arrays are valid.
