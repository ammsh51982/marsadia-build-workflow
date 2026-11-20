# Marsadia Build Workflow

Version 1.4.0

*Created by Dr. Ahmed Hegazy — a physician bringing AI into everyday healthcare, and the founder of Marsadia.*

An owner-led way of building software with Claude: the owner decides the product in plain words and
never reads code; fresh Claude Code sessions build it slice by slice; an independent reviewer checks
every phase; nothing goes live without the owner's acceptance.

```
brief  →  spec, plan, tasks (spec-kit)  →  plan review  →  phased build by chained sessions
       →  code review per phase  →  the owner's acceptance  →  security review  →  merge  →  record
```

## After installing

Right after the workflow is installed in a project, the owner is asked two questions and answers each
with one word.

**How should technical matters reach you?** Some owners are engineers.

- **plain** — Claude decides technical matters and reports them afterwards; only decisions about what
  the product does reach the owner, in plain words with examples.
- **technical** — the owner also receives the technical decisions, in technical words, and decides them.

**How should the build sessions follow each other?**

- **scheduled** — a session starts at fixed times, every five hours by default. Nothing has to stay
  open, but work can sit idle until the next fixed time.
- **continuous** — the next session starts as soon as the last one finishes. No idle time; the advisor
  chat must stay active, and the plan's limits are used faster. This is the default when unanswered.

The answers are kept in the project's `CLAUDE.md` as `Owner mode:` and `Session mode:` and can be
changed at any time with the same word.

**Then the independent reviewer.** Claude sets up Codex review for the project in the owner's accounts
(after one yes for those settings) and proves it with a real code review and a real security review.
No slice is built before it. Only what Claude cannot clear — for example a plan without Codex — reaches
the owner, as one decision: get Codex working, a fresh Claude reviewer meanwhile, or no reviewer.
How deep each review goes is picked by Claude automatically from what the work touches: more for
migrations, permissions, money and personal data, less for ordinary screens, none for wording.

## What is in this repository

| Path | What it is |
| --- | --- |
| `marsadia-build-workflow/SKILL.md` | The skill: the workflow in a form Claude follows |
| `marsadia-build-workflow/references/workflow.md` | The workflow in full |
| `marsadia-build-workflow/references/installation.md` | Everything to install, step by step |
| `marsadia-build-workflow/references/adopting.md` | Applying it to a new or an existing project, whole or in stages |
| `marsadia-build-workflow/references/codex-review.md` | The independent reviewer: setting up Codex review, proving it works, using it, and what reaches the owner when it is blocked |
| `marsadia-build-workflow/assets/templates/` | The files a project needs: `CLAUDE.md`, `AGENTS.md`, the state file, the brief, the decision record, the findings list, the acceptance sheet, the session hook, `/wrap`, a checks skeleton, and the instructions for the three scheduled tasks |
| `marsadia-build-workflow/scripts/session-guard.mjs` | The guard every chained session runs first |
| `marsadia-build-workflow/scripts/install.sh` | Places the templates in a project without overwriting anything |
| `marsadia-build-workflow/scripts/check-codex.mjs` | Proves that Codex review answers on a repository |
| `CHANGELOG.md` | What changed in each version |

## Install

**In Claude chat** — save the skill to your account (ask Claude to propose it from this repository).

**In Claude Code on a computer**

```bash
git clone https://github.com/ammsh51982/marsadia-build-workflow.git
mkdir -p ~/.claude/skills
cp -R marsadia-build-workflow/marsadia-build-workflow ~/.claude/skills/
```

**Make it your default for every project**

The two installs above cover everything: the account copy is used by chats and cloud sessions, the
`~/.claude/skills/` copy by Claude Code on that computer. To make the workflow the stated default,
add one line to your personal instructions file, `~/.claude/CLAUDE.md`:

```
My default build workflow is the marsadia-build-workflow skill. Use it for all build work in every project.
```

**In a project**

```bash
uv tool install specify-cli                              # spec-kit, once per computer
cd <project-folder>
specify init --here --force --integration claude         # spec-kit in the project
specify extension add git
bash ~/.claude/skills/marsadia-build-workflow/scripts/install.sh .   # ends with the two one-word questions
node scripts/session-guard.mjs                           # expect: verdict: GO
```

Then follow `references/installation.md` from step 7: the constitution, GitHub, the reviewer and the
scheduled tasks.

## What it needs

A Claude plan with Claude Code, cloud sessions and scheduled tasks; a GitHub account; Git; Node.js 18
or newer; Python 3.11 or newer with `uv`; spec-kit; the GitHub command tool; and OpenAI Codex
connected to GitHub as the independent reviewer.

## Changing the workflow

The workflow is changed here first, then projects follow. A change raises the version (in `SKILL.md`,
`references/workflow.md`, this file) and gets a line in `CHANGELOG.md`. A rule marked *Recommended*
becomes *Proven* once it has run for a full slice in a real project.

## Licence and permission

No licence has been chosen. All rights are reserved by the author, with this permission:

- **Without asking**, you may read this repository, install the skill and use the workflow on your
  own projects.
- **Please ask first** before sharing a copy of it or publishing a changed version.

To ask, or for anything else about the workflow, write to **marsadia.co@gmail.com**.
