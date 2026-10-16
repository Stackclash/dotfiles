<!--
Method adapted from mattpocock/skills (grilling, domain-modeling; MIT) and
obra/superpowers (brainstorming).
-->

# Clarify the requirements: one round

Planning has reopened the requirements. Either the planner found the proposal
infeasible, contradictory, or incomplete, or the requester asked to revisit it
at plan approval. You run one **round** per turn of a short interview that
settles exactly those points: your output is shown to the requester at a gate,
and their reply comes back to you on the next turn. A later step updates the
proposal from your notes.

## Inputs

- **Why the requirements were reopened:** `$ARTIFACTS_DIR/clarify-input.md`
- **Current proposal:** `$ARTIFACTS_DIR/proposal.md`
- **Plan that raised the issues (may exist):** `$ARTIFACTS_DIR/plan.md`
- **Clarify notes (exist after the first round):** `$ARTIFACTS_DIR/clarify-notes.md`
- **Docs directory:** `$DOCS_DIR`
- **Requester's reply to the previous round (empty on the first round):**

$LOOP_PREV.clarify-gate.output.text

## Hard rules

- **Read-only.** The only file you may create or edit is
  `$ARTIFACTS_DIR/clarify-notes.md`. Do not modify the repository or the
  proposal.
- **Stay on the reopened points** and whatever they directly affect. Do not
  re-interview settled parts of the proposal.
- **Facts are your job; decisions are the requester's.** Look up anything you
  can find in the repository; put every decision to the requester.
- **Surface, don't pick.** When an issue has more than one reasonable
  resolution, present them with your recommendation. When a simpler resolution
  would meet the goal (often: drop the part that is infeasible), say so.

## First round

If `clarify-notes.md` does not exist, this is the first round:

1. Read `clarify-input.md`, the proposal, and the plan if present.
2. For each issue and each point of feedback, check the code and the glossary
   (`$DOCS_DIR/GLOSSARY.md`) so you can state precisely what is wrong and why,
   citing `path:line`.
3. Open with a short playback: what was reopened and why, in plain terms.
4. Ask round 1: one decision per issue or feedback point, each with your
   recommended resolution.

## Later rounds

Read `clarify-notes.md` first. Apply the reply, answer any questions with
evidence, and ask about whatever the answers newly opened.

## Round format

```
**Q1 — <short title>**: <question; may include options>

> Recommended: <your recommended answer and the one-line reason>
```

Word every question so that "yes" accepts your recommendation. Close every round
with one line: answer by number in the gate's text, then choose **Send
answers**. When every reopened point is settled, give a final playback of the
changes the proposal needs and tell the requester to choose **Ready: update
proposal** (any text sent with Ready is applied as final corrections).

## Every round: update the notes file

Rewrite `$ARTIFACTS_DIR/clarify-notes.md` in full:

- `## Reopened points` — each issue/feedback point and its status (settled/open)
- `## Proposal changes` — for each settled point, the exact change to make to
  `proposal.md`: which section, what to add, change, or remove, and the
  requester's answer behind it
- `## Open questions`
- `## Proposed glossary terms` and `## ADR candidates` — only new ones

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

Exactly what the requester reads at the gate: the playback (when there is one)
and the round. No preamble about what you did.
