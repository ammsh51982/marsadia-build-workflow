# Constitution additions

Run `/speckit-constitution` and give it the project's own principles first. Then add the three
sections below, so spec-kit enforces the workflow at plan and implement time. Delete this file
once they are in `.specify/memory/constitution.md`.

## Delivery Rules

**One bounded slice at a time.** Never translate a master plan into a single large task list or
implementation.

**Owner decisions are not engineering assumptions.** Where a specification requires a decision the
owner has not made, it stops at that point, states the decision needed, presents options with a
recommendation, and continues with unaffected work. It does not choose.

**Scope discipline.** No feature enters a slice because it seemed useful during implementation.
Discovered work is recorded in `docs/BACKLOG.md` and raised with the owner. It is not built.

**The owner does not read code.** Acceptance criteria are written as steps performable in a
browser. If an acceptance test cannot be performed without reading code, it is written wrong and
must be rewritten.

**Implementation-time judgment is recorded.** Whenever a judgment call differs from the task text,
or creates a dependency a later phase must honour, a decision record is written in
`docs/decisions/` and the dependent task in `tasks.md` is amended to name it.

**A dependency pass follows `/speckit-tasks`.** No task may depend on something a later phase
builds.

**Claims about database behaviour are probed** before they become requirements.

## Definition of Done

A slice is complete only when all of the following hold:

- Approved brief in `docs/briefs/`, and all blocking decisions resolved
- Acceptance criteria expressed as steps a non-technical owner can perform
- UX states present: default, empty, loading, error, permission denied, conflict, success
- <the project's own gates: isolation tests, languages, audit events …>
- `docs/STATE.md` updated
- CI green, and no Serious finding open; the slice's Major bundle built
- The security review returned clean on the final commit
- Owner acceptance test passed

## Governance

This constitution supersedes all other practice in this repository. Amendments require an owner
decision recorded in `docs/decisions/`, a version increment, and a note of what changed and why.

**Every review finding is classed, and the class decides the action.** The reviewer's P0/P1/P2 is
its severity; the class is ours. **Serious**: breaks a non-negotiable rule or is reachable by a
user in ordinary use — fixed before anything is deployed or merged. **Major**: needs a stolen
credential sending raw requests, or two people acting on the same thing in the same instant —
fixed once per slice, in one bundle. **Minor**: needs a contrived sequence, touches one reader's
one page, or is wording — queued with its reasoning and built only on the owner's word.
