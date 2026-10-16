<!--
Engineering discipline (think first, simplicity, surgical changes, verifiable
goals) adapted from multica-ai/andrej-karpathy-skills CLAUDE.md.
-->

# Implement one task

Make exactly one task of the plan work. After you finish, a deterministic check
runs: the task's confirmed-failing tests (if any) must pass and must be
byte-for-byte unchanged, and every repository check (tests, lint, build,
typecheck) that passed before the change must still pass.

## Inputs

- **The task, any confirmed failing tests, and any requester guidance:**
  `$ARTIFACTS_DIR/current-task.md`
- **Plan:** `$ARTIFACTS_DIR/plan.md`
- **Proposal (the contract):** `$ARTIFACTS_DIR/proposal.md`
- **Results of the previous attempt at this task (absent on the first
  attempt):** `$ARTIFACTS_DIR/green-report.md` and the `build-*.log` /
  `green-*-targeted.log` files next to it
- **Baseline (failures that existed before this change):** `$ARTIFACTS_DIR/baseline.md`

## Steps

1. Read `current-task.md`. Requester guidance overrides the plan where they
   differ. If it says a re-check was requested, the requester fixed this task by
   hand: run the checks, and change nothing unless they still fail.
2. If a previous attempt's report exists and names this task, read it and the
   logs first, and fix what they show instead of starting over.
3. Read the code the task's **Files** field names and its surroundings. Follow
   the context files (`CLAUDE.md`, `AGENTS.md`, …), the ADRs in `$DOCS_DIR/adr/`,
   and the glossary's terms.
4. Before editing, settle what "done" means: list the few edits you will make,
   each with the check that proves it (usually a specific test passing). Note any
   assumption you are making where the task, plan, or code is ambiguous.
5. Implement the smallest change that satisfies the task. Stay inside the
   task: later tasks will build the rest.
6. Run the task's targeted test command (if it has one) until it passes, then
   the repository's checks, to confirm you did not break anything that passed at
   baseline.
7. Reread your diff before finishing. Simplify anything a senior engineer would
   call overcomplicated, and revert any line that does not trace to this task.

## Engineering discipline

- **Don't guess silently.** No one can answer questions during this step, so
  state assumptions in your output instead. If two readings of the task would
  produce materially different code, implement the one the proposal supports
  most directly and name the other. If neither is supportable, make no change
  and explain what is ambiguous.
- **Simplicity.** Write the minimum code that solves the task. No features
  beyond it, no abstraction for a single use, no configurability nobody asked
  for, and no handling for scenarios that cannot occur. If it could be much
  shorter, rewrite it.
- **Surgical changes.** Every changed line must trace to this task. Do not
  "improve" adjacent code, comments, or formatting, and do not refactor working
  code. Match the existing style even where you would write it differently.
  Remove imports, variables, or functions that *your* change made unused; leave
  pre-existing dead code alone and mention it in your output instead.

## Do not

- Modify the task's confirmed-failing test files. If a test is wrong, stop and
  say so in your output; the requester decides.
- Run the plan's verification steps; they run later, at validation, by the
  requester's choice.
- Implement other tasks, refactor unrelated code, or change behavior the
  proposal lists as an invariant.
- Commit, stage, or write to `$DOCS_DIR`.

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

Two or three sentences: what you changed, and anything the requester should know
(for example, a test you believe is wrong). Then any assumptions you made, and
any unrelated dead code or problems you noticed but left alone.
