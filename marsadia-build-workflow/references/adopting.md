# Adopting the workflow in a project

## The question to ask first

When the owner returns to a project that does not already follow this workflow, ask before
changing anything:

> "Shall we apply our default build workflow to this project, continue with its current way of
> working, or apply the workflow in stages?"

Give each answer a real-world example from that project, a recommendation, and what happens if
the question is left for later. Do not switch anything until he answers. A project is already on
the workflow when its `CLAUDE.md` names it or `docs/WORKFLOW.md` exists.

| Answer | What happens |
| --- | --- |
| **Apply** | The full installation (`installation.md`), then the next piece of work starts with a brief |
| **Continue** | Nothing changes. Record the answer so the question is not asked again every session; ask again only when the project reaches a natural turning point (a release, a new module) |
| **In stages** | The stages below, one at a time, each only on his word |

## The stages

Each stage is useful by itself and safe to stop after.

| Stage | What is added | What the project gains | Cost |
| --- | --- | --- | --- |
| 1. The record | `docs/STATE.md`, the `SessionStart` hook, `/wrap`, `docs/decisions/`, `docs/BACKLOG.md` | Sessions stop depending on chat history; decisions are written down | An hour; no change to the code |
| 2. The triage | Serious / Major / Minor in `CLAUDE.md`; a sweep file for findings | Only product questions reach the owner; small findings stop interrupting the work | None beyond stage 1 |
| 3. The gate | Pull requests into a protected main line, the automatic checks, the independent reviewer, `AGENTS.md` | Nothing reaches the live product unreviewed | A day to set up the checks; every change now goes through a pull request |
| 4. The brief and spec-kit | Briefs, the constitution, `/speckit-specify` → `/speckit-analyze`, phases | Rules are settled before building; acceptance tests in the owner's own words | The first brief takes longest; spec-kit must be installed |
| 5. The chain | The guard script, the chain task, check-ins | Building continues while the owner is away | Needs stages 1 to 4 first |

## For an existing project

- Do not rewrite history. The first brief covers the next piece of work; what exists is described
  once, in a short "where the product stands" note under `docs/`.
- Write the constitution from the rules the project already keeps, not from wishes. A rule nobody
  can check is not a rule.
- If the project is close to a deadline or a trial, recommend stage 1 and stage 2 only until it
  has passed.
- `install.sh` never overwrites. Where a file exists (`CLAUDE.md` almost always does), merge the
  template's sections into it by hand and keep the project's own rules.

## For a new project

1. Installation steps 1 to 10.
2. A first, small slice: the skeleton, the checks, sign-in. Its purpose is to walk the whole loop
   once.
3. Then the product's slices, each from a brief.
