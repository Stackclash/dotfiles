<!--
Engineering discipline (think first, simplicity, surgical changes, verifiable
goals) adapted from multica-ai/andrej-karpathy-skills CLAUDE.md.
-->

# Plan the change

Write the implementation plan for the change described in `proposal.md`. An
implementer who has never seen the proposal discussion will execute your tasks
one at a time, test-first, so every task must stand on its own.

## Inputs

- **Proposal (the contract):** `$ARTIFACTS_DIR/proposal.md`
- **Repository checks:** test `$discover-toolchain.output.test`, lint
  `$discover-toolchain.output.lint`, build `$discover-toolchain.output.build`,
  typecheck `$discover-toolchain.output.typecheck` (empty means none);
  has tests: `$discover-toolchain.output.has_tests`
- **Baseline results:** `$ARTIFACTS_DIR/baseline.md`
- **Previous plan (exists on a later planning pass):** `$ARTIFACTS_DIR/plan.md`
- **Requester's response at the previous plan approval (empty on the first
  pass):**

$INPUTS.approval_response

## Before planning

1. Read the proposal in full. The acceptance criteria, invariants, non-goals and
   anti-goals bind the plan.
2. Read the project's context files (`CLAUDE.md`, `AGENTS.md`,
   `.github/copilot-instructions.md`, `CONTRIBUTING*`), `$DOCS_DIR/GLOSSARY.md`,
   and the ADRs in `$DOCS_DIR/adr/`. The plan must follow their conventions.
3. Read every file you expect to change, and the existing tests nearby, so the
   tasks match the code as it is.
4. If a previous plan and the requester's response exist, the response is
   feedback on that plan: address every point, and keep what they did not
   object to.

## Rules

- **One task per test-first cycle.** Each task's tests (or verification steps)
  can be written, seen failing, and made to pass on their own. Split anything
  larger.
- **Every acceptance criterion is satisfied by at least one task.** Tasks that
  only enable others (refactor, plumbing) say `supporting`.
- **If the repository has tests**, each task names the test cases to write: the
  test file, and what each case asserts, tied to the AC scenario it proves.
  Follow the existing test layout and style.
- **If the repository has no tests**, do not propose adding a test framework.
  Each task instead gives verification steps: concrete actions with the exact
  expected result, specific enough for either an AI or a person to run
  (commands to run, inputs to use, output or behavior to observe).
- Respect every invariant; if a task risks one, say how the tests or
  verification protect it.
- **Simplest approach that meets the acceptance criteria.** No tasks for
  features, options, or extension points the proposal did not ask for; no new
  abstraction unless more than one task needs it. If a markedly simpler approach
  exists, take it and say why under Design decisions; if it would change *what*
  gets built, raise it under Proposal issues instead.
- **Surgical scope.** Tasks change only what the acceptance criteria require. No
  "while we're here" refactors, renames, reformatting, or cleanup of unrelated
  code; list anything worth doing later under Risks as a note, not a task.
- **Assumptions are written down.** Wherever the proposal or code leaves room
  for interpretation and you chose one, record it under `## Assumptions`. Only
  choices that would change what gets built are Proposal issues.
- Do not modify any file. You write only `$ARTIFACTS_DIR/plan.md`.

## When the proposal is not plannable

If you find that the proposal is infeasible, contradicts itself, contradicts the
code or an ADR in a way that blocks the work, or leaves a decision open that the
plan cannot be written without: do not guess. List each problem under
`## Proposal issues` as one self-contained bullet with evidence (`path:line`,
the AC or section). The requester will be asked about them. Plan whatever is
unaffected; leave the affected tasks out.

## Write `$ARTIFACTS_DIR/plan.md`

- `# Plan: <proposal title>`
- `## Approach` — the shape of the solution in one or two paragraphs
- `## Assumptions` — interpretations you chose, each with why; `_None._` if
  none
- `## Design decisions` — each decision with the alternatives considered and why
  this one
- `## Verification mode` — `tests` or `verification steps`, matching has-tests
- `## Tasks` — in execution order, each:
  ```
  ### T-1: <title>
  - **Files:** <paths to create or change>
  - **Satisfies:** AC-1, AC-3   (or: supporting)
  - **Tests:** <test file and cases>          (repos with tests)
  - **Verification:** <steps + expected results>  (repos without tests)
  - **Depends on:** T-n, … (or: none)
  - **Done when:** <a checkable condition>
  ```
- `## Risks` — what could go wrong and how the plan mitigates it
- `## Proposal issues` — `_None._` unless there are blocking problems

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

One line: the number of tasks and of proposal issues.
