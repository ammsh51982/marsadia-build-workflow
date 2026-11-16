# Marsadia Build Workflow — the full workflow

Version 1.1.1 · Created by Dr. Ahmed Hegazy — a physician bringing AI into everyday healthcare, and the founder of Marsadia.

A workflow for building software with AI sessions when the owner decides the product and never reads code.
It is project-neutral: replace the names in angle brackets with your own.

Contents: 1 Roles · 2 Standing files · 3 The slice loop · 4 Spec-kit steps · 5 Phases · 6 Reviews ·
7 Findings · 8 Chained sessions · 9 Scheduled pieces · 10 Steering the chain · 11 The owner's part ·
12 Safeguards

---

## 1. Roles

| Role | Who | Holds |
| --- | --- | --- |
| **Owner** | The person who decides what the product does | Every product and domain decision, the acceptance test, the word to merge |
| **Advisor chat** | One long-lived Claude chat acting as lead engineer | Briefs, spec-and-plan review, finding triage, steering the build sessions, the merge clicks on the owner's word |
| **Build sessions** | Fresh Claude Code sessions, one after another | Spec, plan, tasks, code, tests, records |
| **Independent reviewer** | Codex on the pull request | Code review and security review |
| **CI** | Automatic checks on every pull request | Lint, typecheck, tests, build, isolation or security suite |

The dividing line: anything that changes how a user works is the owner's decision. Everything else follows the owner's setting below.

### The owner's setting

Some owners are engineers. Right after the workflow is installed in a project, the owner is asked one question and answers with one word; the answer is recorded in `CLAUDE.md` as `Owner mode:`. It is not asked again, and he can change it at any time with the same word. Until he answers, sessions work as `plain`.

| | `plain` | `technical` |
| --- | --- | --- |
| Product and domain decisions | The owner's, in plain words with a real-world example | The owner's; technical words are fine |
| Technical decisions of consequence (architecture, the data model, a security trade-off, a new dependency, the shape of a Serious or Major fix) | Decided by the advisor chat, recorded, reported afterwards; never brought to him as an issue or a question | Brought to him as a decision, in technical words, with options and a recommendation |
| Small implementation details | Decided by the sessions | Decided by the sessions |
| Review findings | Only Minors reach him, as a short plain-words list | Every finding reaches him verbatim with its class |
| Acceptance | Steps in a browser | Steps in a browser; he may also read the pull request |

---

## 2. Standing files

| File | Purpose |
| --- | --- |
| `CLAUDE.md` | The rules every session must hold, and the workflow in short |
| `.specify/memory/constitution.md` | The full non-negotiable rules; spec-kit enforces them at plan and implement time |
| `docs/STATE.md` | Where the work stands. The only handoff between sessions; never a chat message |
| `docs/briefs/<slice>.md` | The owner-approved brief for each slice; the input to the spec |
| `docs/decisions/` | One record per owner decision (`OD-…`) and per architecture decision (`ADR-…`) |
| `docs/<slice>-SWEEP.md` | Every review finding of the slice, numbered, with its class and outcome |
| `docs/BACKLOG.md` | Work discovered but not approved |
| `specs/<slice>/` | Spec-kit output: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md` |

---

## 3. The slice loop

The product is built one slice at a time. A slice is one piece a user can use end to end.

| # | Stage | What happens | Who | Output |
| --- | --- | --- | --- | --- |
| 1 | **Brief** | Product rules settled one decision at a time, each with options, a real-world example, a recommendation and what happens if deferred | Advisor chat writes; owner rules and approves | `docs/briefs/<slice>.md`, first decision record |
| 2 | **Opening** | Brief committed as the first commit on a new branch; draft pull request opened; spec-kit run in order | Build session | Spec, plan, tasks, analysis |
| 3 | **Spec-and-plan review** | The plan is read against the brief; engineering readings decided; only product-level readings go to the owner | Advisor chat | A decision record; the hold released |
| 4 | **Build** | The task list implemented phase by phase | Chained build sessions | Code, tests, migrations, a code review per phase |
| 5 | **Close phase** | Whole test suite on the hosted development environment; acceptance sheet and word list prepared | Build session | State: `ready-for-acceptance` |
| 6 | **Acceptance** | The owner runs the brief's tests in a browser, accepts the wording, rules on small findings | Owner, advisor chat driving | Acceptance record |
| 7 | **Closing session** | Owner's corrections and the slice's bundle of deferred fixes built | Build session | Final commit |
| 8 | **Security review and merge** | Security review requested on the final commit; on the owner's word the pull request is marked ready and squash-merged; production is built and checked | Advisor chat on the owner's word | Slice live |
| 9 | **Post-merge record** | A records-only pull request brings the state file, decision record and sweep true | Build session | Slice closed, branch deleted |

Rules of the loop:

- Never start a slice without an approved brief.
- Never expand scope mid-slice. Discovered work goes to `docs/BACKLOG.md`.
- The spec is written from the brief, never from scratch.
- Acceptance tests are steps a user performs in a browser. A test that needs reading code is written wrong.

---

## 4. Spec-kit steps (stage 2)

Run in this order, with a commit and push after each:

1. `/speckit-specify` — the brief becomes `spec.md`.
2. `/speckit-clarify` — only if the brief leaves something truly ambiguous.
3. `/speckit-plan` — `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`. Every claim about database behaviour is probed before it becomes a requirement.
4. `/speckit-tasks` — `tasks.md`, cut into phases, followed by a dependency pass (no task may depend on something a later phase builds).
5. `/speckit-analyze` — consistency check across spec, plan and tasks.

Then the session sets the hold `awaiting spec-and-plan review` and stops.
`/speckit-implement` begins only after the advisor chat releases the hold.
`/speckit-converge` is used when a session ended badly and the task list may be out of step with the code.

---

## 5. Phases inside the build (stage 4)

- `tasks.md` is cut into phases: usually one per rule or user story, each with its own database migration, plus a final Close phase.
- Each phase names the model that builds it.
- A phase is closed only when its tests are green and its migration is applied.
- A migration is proved three times: on a stand-in database inside the session, on a disposable database in CI, then applied to the hosted development environment.
- One hosted job at a time; never push while one is pending.
- A session continues into the next phase only if it has ample room to finish it and wrap.

---

## 6. Reviews and when they happen

| Review | Who | When | Gate |
| --- | --- | --- | --- |
| Brief | Owner | Before anything is built | No brief, no slice |
| Spec and plan | Advisor chat | After `/speckit-analyze`, before any implementing | Hold until released |
| CI | Automatic | Every push to the pull request | Must be green to merge |
| Code review (`@codex review`) | Independent reviewer, requested by the build session | At each phase's closing push, and at any push with a migration touching grants, policies or auth. Never on an ordinary push | Serious findings fixed before the next phase |
| Arithmetic check | Advisor chat, on the strongest model | Where a phase handles money or other calculation | Hold until released |
| Picture check | Advisor chat | After any phase that changes a screen: each built screen compared with the owner's chosen drawing, before the owner is called | Hold until released |
| Acceptance | Owner | After the Close phase | No merge without it |
| Security review (`@codex security review`) | Independent reviewer, requested in a comment of its own | After the acceptance corrections, on the final commit | Must return clean |
| Automatic reviews | Independent reviewer | Triggered when the pull request is marked ready | Wait for them to return before merging |

Notes on the reviewer:

- A push does not re-trigger a review. The triggers are opening the pull request, marking a draft ready, and an explicit comment.
- A comment asking for both reviews runs only the code review; ask for the security review separately.
- Every finding is reported verbatim (severity, file, lines, text) before anything is recorded or fixed.

---

## 7. What happens to a finding

The reviewer's own severity is recorded, but the class below decides the action.

| Class | Meaning | Action |
| --- | --- | --- |
| **Serious** | Breaks a non-negotiable rule, or reachable by a user in ordinary use | Fixed before anything is deployed or merged |
| **Major** | Needs a stolen credential, or two people acting on the same thing in the same instant | Fixed once per slice, in one bundle at the close |
| **Minor** | Needs a contrived sequence, touches one reader's one page, or is wording | Queued with its reasoning; built only on the owner's word |

- In `plain` mode, Serious and Major are handled without consulting the owner, unless the shape of the fix changes how a user works, and Minors reach him as a short plain-words list to approve queuing.
- In `technical` mode, every finding reaches him verbatim with its class, and the shape of a Serious or Major fix is his to decide.
- Findings are decided before they are fixed.

---

## 8. Chained sessions

A slice is built by a chain: fresh sessions, one after another, each picking up from `docs/STATE.md`.
No session carries memory; the repository is the memory.

### What one session does

1. **Setup.** Attach and clone the repository. Confirm it holds no database secret. Find the open slice (the open draft pull request) and read `docs/STATE.md` on that branch.
2. **Guard.** Run the guard script first. Stop in one line if:
   - another session's marker is open and the branch moved recently or a job is running;
   - "Needs the owner" holds a question the session's instructions do not answer;
   - a hold stands (spec-and-plan review, arithmetic check, picture check);
   - the slice is ready for acceptance.
3. **Mark.** Write the session marker into `docs/STATE.md`, commit and push it at once.
4. **Work by state.**
   - *No open slice, a brief supplied:* open the slice (section 4).
   - *A slice open:* build the next unbuilt phase (section 5), request the code review at its close, record and class the findings.
   - *A merge recorded, no record yet:* write the post-merge record.
   - *Nothing to do:* stop in one line.
5. **Wrap.** Commit and push at every natural step. Begin `/wrap` before a fixed time cap (for example 3.5 hours after the first marker). `/wrap` updates `docs/STATE.md`, clears the marker and pushes. Never force-push; if the branch moved, fetch and rebase, or stop.
6. **Report.** One short plain-words paragraph: what was done, what the reviewer found and its class, anything now needing the owner, what the next session will do.

### The handshake in `docs/STATE.md`

```
session-open: <timestamp> <session name>     or: none
slice-state:  spec-and-plan | building | needs-owner | ready-for-acceptance
phase:        <the open phase, the model it runs on, or the hold that stands>
```

### What a build session never does

- Merge, mark a pull request ready, or request the security review.
- Touch sign-in or project settings, deploy server functions, delete branches.
- Build queued Minors or anything outside the brief.
- Settle a layout or a product rule the owner did not choose.
- Invent domain content (rules, required fields, thresholds, terminology).
- Push while a hosted job is pending.

When a decision is the owner's, the session writes the question in plain words under "Needs the owner", with its recommendation, finishes only what does not depend on it, and wraps.

---

## 9. Scheduled pieces

| Piece | What it does | Schedule |
| --- | --- | --- |
| **The chain task** | Starts a fresh build session with the standing instructions. Auto-approve; its final paragraph is pushed to the owner's phone | Either automatic every few hours, or started by hand by the advisor chat |
| **Check-ins** | One-off reminders the advisor chat sets for itself to read the repository while a session runs, each carrying the state forward to the next | Every 30 to 60 minutes while a session is running |
| **Daily email check** | A read-only morning session that reads the repository's notification emails and reports only what is still failing, plus security and billing notices | Once a day |

Two ways to run the chain:

- **Automatic schedule.** The task fires every few hours. Simple, but time is lost between a session ending and the next firing.
- **Hand-fired with check-ins.** The schedule is off. The advisor chat checks on a rhythm and fires the next session the moment the last one ends. No idle time, but it depends on the advisor chat staying active.

---

## 10. How the advisor chat steers the chain

- **Rulings travel in the instructions.** The owner's answers are written into the chain task's standing instructions, or sent as the extra message of a hand firing. The session records them in a decision record.
- **The model is set on the task.** A default model builds; the advisor chat switches to the strongest model for the sessions it names, then back, and tells the owner each switch. Which model builds a phase is never the owner's question.
- **Holds are released by hand.** The advisor chat does the review or check itself, then fires the chain with the release.

At each check-in the advisor chat reads the commits, the checks, the marker and any new review, then acts:

| What it finds | What it does |
| --- | --- |
| Marker open, last push recent | Waits; tells the owner nothing |
| Marker open, no push for over an hour | Tells the owner and asks him to look at the session |
| Marker clear, phases left, no hold | Fires the next session at once and confirms within minutes that it started |
| A hold stands | Does the review or check, then releases it |
| New findings | Checks the class; Minors go to the owner as a short list |
| A question under "Needs the owner" | Brings it to the owner with options, an example and a recommendation |
| Ready for acceptance | Tells the owner and offers the sitting |

The state of the work is always read from the repository, never from a timer or a schedule.

---

## 11. The owner's part

| Moment | What the owner does |
| --- | --- |
| Brief | Answers each decision; approves the brief |
| During the build | Nothing, unless a product question appears |
| Acceptance | Signs in, judges each test, accepts the wording, rules on Minors |
| Security review | One word to request it |
| Merge | One word; the advisor chat does the clicks |
| Post-merge record | One word to merge it |

Every decision is brought as: the question, two or three options, the consequence of each with a real-world example, a recommendation, and what happens if it is deferred. In `technical` mode he also receives the technical decisions of consequence, in technical words.

---

## 12. Safeguards

Each safeguard carries a status. **Proven** means it has run in a real project. **Recommended** means it is
the right rule by analysis but has not yet been run for a full slice; treat it as the default and record
what happens the first time it is used.

| # | Safeguard | Status |
| --- | --- | --- |
| 1 | **No step may depend on a rate-limited model.** A slice opens on the default model; the spec-and-plan review is the safeguard | Recommended |
| 2 | **Test data is made for the day of acceptance.** Never tie a test to a fixed weekday or date | Recommended |
| 3 | **Wait for the automatic reviews before merging.** A finding should never arrive after the merge | Recommended |
| 4 | **Keep acceptance in the browser.** Loading test data and release steps should not need the owner's own computer | Recommended |
| 5 | **A drawing governs a screen.** Any screen the owner chose from a drawing is checked against it before he looks; any arrangement he has not drawn is listed for him, never settled by a session | Proven |
| 6 | **Give the queue of Minors a date.** Decide with the owner when queued items are cleared, or the list only grows | Recommended (the owner's decision in each project) |
| 7 | **Separate the live site from the test area** before the first real user's data | Recommended |
