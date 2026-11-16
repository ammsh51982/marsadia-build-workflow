# <Project name>

<One or two lines: what the product is, who uses it, the market.>
The owner decides the product.

**Owner mode:** <not yet answered — ask the owner the one question in docs/WORKFLOW.md ("The owner's setting"): plain or technical>

**Session mode:** <not yet answered — ask the owner the second question in docs/WORKFLOW.md ("How sessions follow each other"): scheduled or continuous; unanswered means continuous>

This project follows the **Marsadia Build Workflow** (`docs/WORKFLOW.md`).

## Read this first, every session

The `SessionStart` hook prints `docs/STATE.md`, the branch and recent commits. That is where the
work stands. If it did not print, read `docs/STATE.md` yourself before acting.

Full rules: `.specify/memory/constitution.md`. The summary below is what you must hold in every
session.

## Non-negotiable rules

<List the project's own rules here — five to ten lines, each one a rule a session could break by
accident. Examples: data isolation, audit, languages, "never invent domain content", "synthetic
data only". They are restated in full in the constitution and, as review severities, in AGENTS.md.>

1. <rule>
2. <rule>

## Workflow

One slice at a time.

1. The owner approves a brief in `docs/briefs/`.
2. `/speckit-specify` — using that brief as the input. Never write the spec from scratch.
3. `/speckit-clarify` — only if the brief leaves something truly ambiguous.
4. `/speckit-plan`
5. `/speckit-tasks` — in phases, then the dependency pass.
6. `/speckit-analyze` — then stop: `phase: awaiting the advisor chat's spec-and-plan review`.
7. `/speckit-implement` — phase by phase, after the hold is released.
8. Pull request: CI green; the code review requested with `@codex review` at each phase's closing
   push and at any push carrying a migration that touches grants, policies or auth — never on an
   ordinary push. A push does not re-trigger a review. A comment asking for both reviews runs only
   the code review; the security review is requested in a comment of its own, at the close, on
   the owner's word.
9. When a review returns: every finding recorded verbatim in the slice's sweep before anything is
   fixed, then classed **Serious / Major / Minor** (below).
10. The owner runs the acceptance test from the brief and approves.
11. Merge on the owner's word, deploy, the post-merge record, `/wrap`.

Never start a slice without an approved brief. Never expand scope mid-slice: record discovered
work in `docs/BACKLOG.md` and raise it.

## Findings

| Class | Meaning | Action |
| --- | --- | --- |
| Serious | Breaks a non-negotiable rule, or reachable by a user in ordinary use | Fixed before anything is deployed or merged |
| Major | Needs a stolen credential, or two people acting on the same thing in the same instant | Fixed once per slice, in one bundle at the close |
| Minor | Needs a contrived sequence, touches one reader's one page, or is wording | Queued with its reasoning; built only on the owner's word |

The reviewer's own severity (P0/P1/P2) is recorded beside the class; the class decides the action.

## Working with the owner

Read **Owner mode** at the top of this file. If it is not yet answered, ask the owner the one
question before any other work, record his one-word answer there with the date, and until then
work as `plain`.

- **`plain`** — technical choices are yours: make them, record them, report them afterwards.
  Never bring the owner a technical issue or question. Bring him only decisions about what the
  product does, in plain words, with no engineering terms he does not use himself. Only Minor
  findings reach him, as a short plain-words list.
- **`technical`** — technical decisions of consequence (architecture, the data model, a security
  trade-off, a new dependency, the shape of a Serious or Major fix) also go to him, in technical
  words, with options and a recommendation. Every finding reaches him verbatim with its class.
  Small implementation details stay yours.

In both modes: acceptance criteria are steps a user performs in a browser — if a test cannot be
run without reading code, it is written wrong, so rewrite it. When a decision is the owner's,
present the question, two or three options, the consequence of each with a real-world example,
your recommendation, and what happens if it is deferred. Never choose silently. Write it under
"Needs the owner" in `docs/STATE.md`.

## Chained sessions

**Session mode** at the top of this file says how sessions follow each other: `scheduled` — the
chain task fires at fixed times; `continuous` — the advisor chat fires the next session as soon
as the last one finishes. Either way a session behaves the same.

Run `node scripts/session-guard.mjs` first. On STOP, touch nothing and say why in one line. On GO,
write the marker (`--open <session name>`), commit and push it at once.

A session never: merges; marks a pull request ready; requests the security review; changes
sign-in or project settings; deletes branches; builds queued Minors or anything outside the brief;
settles a layout or a product rule the owner did not choose; invents domain content; pushes while
a hosted job is pending.

Commit and push at every natural step. Begin `/wrap` before the time cap (3.5 hours after the
first marker). Never force-push.

## Layout

```
CLAUDE.md               this file
AGENTS.md               what the independent reviewer flags, and at which severity
.specify/memory/        constitution — the full rules
.claude/skills/         spec-kit skills (installed by specify init — do not edit)
.claude/commands/       our own slash commands (/wrap)
.claude/settings.json   SessionStart hook
docs/WORKFLOW.md        the workflow in full
docs/STATE.md           where the work stands — the only handoff between sessions
docs/briefs/            owner-approved brief per slice; input to /speckit-specify
docs/decisions/         owner decisions (OD-…) and architecture decisions (ADR-…)
docs/<slice>-SWEEP.md   the slice's review findings
docs/BACKLOG.md         discovered work, not yet approved
docs/prompts/           the standing instructions of the scheduled tasks
specs/                  spec-kit output per slice
scripts/session-guard.mjs
```

## Stack and commands

<The stack in three lines, then the commands a session needs.>

```bash
<dev server>
<build>
<tests>
<lint / typecheck>
```

## Ending a session

Run `/wrap`. It updates `docs/STATE.md`, checks off completed tasks, clears the marker and commits.
Do this before closing, even mid-slice. Never write a handoff message into chat — write it to
`docs/STATE.md`.
