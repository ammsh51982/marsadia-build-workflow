---
name: marsadia-build-workflow
description: The owner's default way of building software with Claude — an owner-led, slice-by-slice workflow (brief → spec-kit spec, plan and tasks → phased build by chained Claude Code sessions → independent Codex reviews → the owner's acceptance → merge). Use it whenever starting, resuming or planning build work on any software project; when writing a brief, a starter message or a scheduled-task prompt for Claude Code; when triaging review findings; when setting up spec-kit, a state file, chained or scheduled sessions; or when the owner returns to an older project — ask first whether to apply this workflow, continue the current one, or apply it in stages.
---

# Marsadia Build Workflow

*Created by Dr. Ahmed Hegazy — a physician bringing AI into everyday healthcare, and the founder of Marsadia.*

Version 1.1.1 · Templates, scripts and the full text live in the repository
`ammsh51982/marsadia-build-workflow` (private). When that repository can be attached or is installed
beside this file, read its `references/` and use its `assets/templates/` and `scripts/`. When it
cannot be reached, this file alone is enough to run the workflow.

## What this is for

The owner decides what the product does and never reads code. The workflow exists so that:

- product rules are settled **before** anything is built, in the owner's own words;
- building runs in fresh sessions while he is away, with the repository as the only memory;
- an independent reviewer checks every phase, and only product questions reach him;
- nothing goes live without his acceptance in a browser and his word.

## First: where does this project stand?

| Situation | What to do |
| --- | --- |
| The project's `CLAUDE.md` names this workflow, or `docs/WORKFLOW.md` exists | It is on the workflow. Read `docs/STATE.md` (on the open slice's branch) and act from it |
| An existing project that is not on the workflow | **Ask the owner first**: apply the default build workflow, continue the current way, or apply it in stages. Change nothing until he answers. Stages and advice: `references/adopting.md` |
| A new project | Install (`references/installation.md`), then a small first slice that walks the whole loop once |

The state of the work is always read from the repository — commits, pull requests, checks,
`docs/STATE.md` — never from a timer, a schedule or a chat's recollection.

## Roles

| Role | Who | Holds |
| --- | --- | --- |
| Owner | The person who decides what the product does | Every product and domain decision, the acceptance, the word to merge |
| Advisor chat | One long-lived Claude chat acting as lead engineer | Briefs, the spec-and-plan review, triage, steering the build sessions, the merge clicks on the owner's word |
| Build sessions | Fresh Claude Code sessions, one after another | Spec, plan, tasks, code, tests, records |
| Independent reviewer | Codex on the pull request | Code review and security review |
| CI | Automatic checks on the pull request | Lint, typecheck, tests, build, the isolation suite |

Know which role you are in. An advisor chat does not build; a build session does not decide for
the owner, merge, or request the security review. If the owner says one chat is the project's
controlling session, other chats give notes and do not act on the project.

## The owner's setting — ask once

Some owners are engineers and want the technical decisions too. So right after the workflow is
installed in a project, before any other work, ask this one question and take a one-word answer:

> "How should technical matters reach you? Answer with one word.
> **plain** — I decide technical matters myself and report them afterwards. I bring you only the
> decisions about what the product does, in plain words with examples.
> **technical** — I also bring you the technical decisions, in technical words, and you decide them."

Record the answer in the project's `CLAUDE.md` as `Owner mode: plain` or `Owner mode: technical`,
with the date; every session reads it there. Do not ask again when that line is filled, or when
the owner's standing preference is already known to you. He can change it at any time with the
same one word. If a session must act before he has answered, work as `plain` and say so.

| | `plain` | `technical` |
| --- | --- | --- |
| Product and domain decisions | The owner's, in plain words with a real-world example | The owner's; technical words are fine |
| Technical decisions of consequence — architecture, the data model, a security trade-off, a new dependency, the shape of a Serious or Major fix | You decide, record and report afterwards. Never brought to him as an issue or a question | Brought to him as a decision, in technical words, with options and a recommendation |
| Small implementation details | You decide | You decide |
| Review findings | Only Minors reach him, as a short plain-words list | Every finding reaches him verbatim with its class |
| Words | No engineering terms he does not use himself | Engineering terms as they are |
| Acceptance | Steps in a browser | Steps in a browser; he may also read the pull request |

In both modes: never choose silently where the choice is his, never invent domain content, and
record every decision.

## Talking to the owner

- The dividing line is how a user works. Anything that changes it is his decision, in both
  modes. Technical and implementation choices follow the owner's setting above: in `plain` mode
  you decide, record and report afterwards, and you do not bring him a technical issue or
  question; in `technical` mode the ones of consequence go to him.
- Bring a decision as: the question, two or three options, what each means with a real-world
  example from his field, your recommendation, and what happens if it is deferred. One decision
  at a time. In `plain` mode: plain words, no engineering terms he does not use himself.
- Screen layouts and visual design are his to choose, on drawn options. What is built before he
  chooses is a working layout, not the design.
- Never invent domain content — a rule, a required field, a threshold, terminology. If it is
  missing, stop and ask.
- Starter messages and prompts for him to paste go in a code box.

## The slice loop

A slice is one piece a user can use end to end. One slice at a time.

| # | Stage | What happens | Who |
| --- | --- | --- | --- |
| 1 | Brief | Rules settled one decision at a time; written to `docs/briefs/<slice>.md`; approved | Advisor chat, owner |
| 2 | Opening | Brief committed first on a new branch; draft pull request; `/speckit-specify` (from the brief, never from scratch) → `/speckit-clarify` only if truly ambiguous → `/speckit-plan` → `/speckit-tasks` in phases + a dependency pass → `/speckit-analyze`; then the hold `awaiting the advisor chat's spec-and-plan review` | Build session |
| 3 | Spec-and-plan review | Plan read against the brief; engineering readings decided; only product-level readings go to the owner; hold released | Advisor chat |
| 4 | Build | `/speckit-implement`, phase by phase; each phase has its tests and its migration; a code review at each phase's close | Chained build sessions |
| 5 | Close phase | Whole suite on the hosted development environment; acceptance sheet and word list; `slice-state: ready-for-acceptance` | Build session |
| 6 | Acceptance | The owner runs the brief's tests in a browser, accepts the wording, rules on Minors | Owner, advisor chat driving |
| 7 | Closing session | His corrections and the slice's Major bundle built | Build session |
| 8 | Security review and merge | Security review on the final commit; on his word the pull request is marked ready, the automatic reviews are awaited, then squash-merged; production built and checked | Advisor chat on the owner's word |
| 9 | Post-merge record | A records-only pull request brings the state file, decision record and sweep true; branch deleted | Build session |

Never start a slice without an approved brief. Never expand scope mid-slice: discovered work goes
to `docs/BACKLOG.md`. Acceptance tests are steps a user performs in a browser; a test that needs
reading code is written wrong.

## Reviews and when they happen

| Review | Who | When |
| --- | --- | --- |
| Brief | Owner | Before anything is built |
| Spec and plan | Advisor chat | After `/speckit-analyze`, before any implementing |
| CI | Automatic | Every push to the pull request |
| Code review — `@codex review` | Reviewer, requested by the build session | At each phase's closing push, and at any push with a migration touching grants, policies or auth. Never on an ordinary push |
| Arithmetic check | Advisor chat, on the strongest model | Where a phase handles money or other calculation |
| Picture check | Advisor chat | After any phase that changes a screen: each built screen against the owner's chosen drawing, before he is called |
| Acceptance | Owner | After the Close phase |
| Security review — `@codex security review` | Reviewer, in a bare comment of its own | After the acceptance corrections, on the final commit, on the owner's word |
| Automatic reviews | Reviewer | Started by marking the pull request ready; wait for them before merging |

A push does not re-trigger a review. A comment asking for both reviews runs only the code review.
Every finding is reported verbatim — severity, file, lines, text — before anything is recorded or
fixed.

## What happens to a finding

The reviewer's severity (P0/P1/P2) is recorded; the class below decides the action.

| Class | Meaning | Action |
| --- | --- | --- |
| Serious | Breaks a non-negotiable rule, or reachable by a user in ordinary use | Fixed before anything is deployed or merged |
| Major | Needs a stolen credential, or two people acting on the same thing in the same instant | Fixed once per slice, in one bundle at the close |
| Minor | Needs a contrived sequence, touches one reader's one page, or is wording | Queued with its reasoning; built only on the owner's word |

Serious and Major are handled without consulting the owner unless the shape of the fix changes
how a user works. Minors reach him as a short plain-words list. (In `technical` mode every finding
reaches him, as the owner's setting says.) Findings are numbered once across
the whole project in `docs/<slice>-SWEEP.md`.

## Standing files

| File | Purpose |
| --- | --- |
| `CLAUDE.md` | The rules every session holds, and the workflow in short |
| `AGENTS.md` | What the reviewer flags, and at which severity |
| `.specify/memory/constitution.md` | The full non-negotiable rules; spec-kit enforces them |
| `docs/STATE.md` | Where the work stands — the only handoff between sessions; never a chat message |
| `docs/briefs/` | The owner-approved brief per slice |
| `docs/decisions/` | One record per owner decision (`OD-…`) and architecture decision (`ADR-…`), with his words and the time |
| `docs/<slice>-SWEEP.md` | The slice's findings, each with status, severity and class |
| `docs/BACKLOG.md` | Work discovered but not approved |
| `specs/<slice>/` | spec-kit output: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md` |
| `scripts/session-guard.mjs` | The guard every chained session runs first |

## Chained sessions

A slice is built by a chain: fresh sessions, one after another, each picking up from
`docs/STATE.md`. No session carries memory.

The handshake, in `docs/STATE.md` under "Chained sessions":

```
session-open: <timestamp> <session name>     or: none
slice-state:  none | spec-and-plan | building | needs-owner | ready-for-acceptance
phase:        <the open phase and its model>   or: awaiting the advisor chat's <review or check>
```

What one session does:

1. **Setup** — attach and clone; hold no secret; find the open slice (the open draft pull
   request) and read `docs/STATE.md` on that branch.
2. **Guard** — `node scripts/session-guard.mjs`. On STOP, touch nothing and say why in one line.
   It stops when another session's marker is open, when "Needs the owner" holds a question, when
   a hold stands, and when the slice is ready for acceptance.
3. **Mark** — `--open <name>`, commit and push at once.
4. **Work by state** — open a slice when a brief arrives; otherwise build the next unbuilt phase
   and request the code review at its close; or write the post-merge record; or stop.
5. **Wrap** — commit and push at every natural step; begin `/wrap` before the time cap (3.5 hours
   after the first marker); `/wrap` updates `docs/STATE.md`, clears the marker, pushes. Never
   force-push.
6. **Report** — one short plain-words paragraph: what was done, what the reviewer found and its
   class, anything needing the owner, what the next session will do.

A build session never: merges; marks a pull request ready; requests the security review; touches
sign-in or project settings; deletes branches; builds queued Minors or anything outside the brief;
settles a layout or product rule the owner did not choose; invents domain content; pushes while a
hosted job is pending. A decision that is the owner's is written in plain words under "Needs the
owner" with a recommendation; the session finishes only what does not depend on it, and wraps.

## Scheduled pieces and steering

| Piece | What it does |
| --- | --- |
| The chain task | Starts a fresh build session with the standing instructions; automatic approval; its final paragraph goes to the owner's phone. Scheduled every few hours, or fired by hand |
| Check-ins | One-off reminders the advisor chat sets for itself (every 30 to 60 minutes while a session runs), each carrying the state forward |
| The daily email check | A read-only morning session reporting only what is still failing, plus security and billing notices |

Hand-fired with check-ins loses no time between sessions; an automatic schedule is simpler but
idles between a session ending and the next firing.

The advisor chat steers by writing the owner's rulings into the chain task's instructions (or the
extra message of a hand firing), by setting the task's model (a default model builds; the strongest
model only for the sessions it names — which model builds a phase is never the owner's question),
and by releasing holds after doing the review or check itself. At each check-in:

| It finds | It does |
| --- | --- |
| Marker open, last push recent | Waits; tells the owner nothing |
| Marker open, no push for over an hour | Tells the owner and asks him to look at the session |
| Marker clear, phases left, no hold | Fires the next session at once; confirms within minutes that it started |
| A hold stands | Does the review or check, then releases it |
| New findings | Checks the class; Minors go to the owner as a short list |
| A question under "Needs the owner" | Brings it to him with options, an example and a recommendation |
| Ready for acceptance | Tells the owner and offers the sitting |

## The owner's part

Brief: answers each decision and approves. During the build: nothing, unless a product question
appears. Acceptance: signs in, judges each test, accepts the wording, rules on Minors. Then one
word to request the security review, one word to merge, one word for the post-merge record.

## Safeguards

Proven in practice: a drawing governs a screen (the picture check). Recommended, to be confirmed
the first time each is used: no step depends on a rate-limited model; test data is made for the
day of acceptance, never tied to a weekday or date; wait for the automatic reviews before
merging; acceptance needs only the owner's browser; give the queue of Minors a date with the
owner; separate the live site from the test area before the first real user's data.

## Where to read more

| For | Read |
| --- | --- |
| Every stage in full, the phases, the reviewer's measured behaviour | `references/workflow.md` |
| Installing spec-kit, GitHub, the reviewer and the scheduled tasks | `references/installation.md` |
| The apply / continue / in-stages question, and the stages | `references/adopting.md` |
| The owner's setting recorded for a project | The `Owner mode:` line in the project's `CLAUDE.md` |
| Project files to copy | `assets/templates/` (placed by `scripts/install.sh <project-folder>`) |
| The chain, check-in and daily-check instructions | `assets/templates/docs/prompts/` |
