# Marsadia Build Workflow

Version 1.1.0 · private

An owner-led way of building software with Claude: the owner decides the product in plain words and
never reads code; fresh Claude Code sessions build it slice by slice; an independent reviewer checks
every phase; nothing goes live without the owner's acceptance.

```
brief  →  spec, plan, tasks (spec-kit)  →  plan review  →  phased build by chained sessions
       →  code review per phase  →  the owner's acceptance  →  security review  →  merge  →  record
```

## One question after installing

Some owners are engineers. Right after the workflow is installed in a project, the owner is asked how
technical matters should reach him, and answers with one word:

- **plain** — Claude decides technical matters and reports them afterwards; only decisions about what
  the product does reach the owner, in plain words with examples.
- **technical** — the owner also receives the technical decisions, in technical words, and decides them.

The answer is kept in the project's `CLAUDE.md` as `Owner mode:` and can be changed at any time.

## What is in this repository

| Path | What it is |
| --- | --- |
| `marsadia-build-workflow/SKILL.md` | The skill: the workflow in a form Claude follows |
| `marsadia-build-workflow/references/workflow.md` | The workflow in full |
| `marsadia-build-workflow/references/installation.md` | Everything to install, step by step |
| `marsadia-build-workflow/references/adopting.md` | Applying it to a new or an existing project, whole or in stages |
| `marsadia-build-workflow/assets/templates/` | The files a project needs: `CLAUDE.md`, `AGENTS.md`, the state file, the brief, the decision record, the findings list, the acceptance sheet, the session hook, `/wrap`, a checks skeleton, and the instructions for the three scheduled tasks |
| `marsadia-build-workflow/scripts/session-guard.mjs` | The guard every chained session runs first |
| `marsadia-build-workflow/scripts/install.sh` | Places the templates in a project without overwriting anything |
| `CHANGELOG.md` | What changed in each version |

## Install

**In Claude chat** — save the skill to your account (ask Claude to propose it from this repository).

**In Claude Code on a computer**

```bash
git clone https://github.com/<owner>/marsadia-build-workflow.git
mkdir -p ~/.claude/skills
cp -R marsadia-build-workflow/marsadia-build-workflow ~/.claude/skills/
```

**In a project**

```bash
uv tool install specify-cli                              # spec-kit, once per computer
cd <project-folder>
specify init --here --force --integration claude         # spec-kit in the project
specify extension add git
bash ~/.claude/skills/marsadia-build-workflow/scripts/install.sh .   # ends with the one question: plain or technical
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

## Before this repository is made public

- [ ] No project names, account names, addresses or product details in any file (`SKILL.md` names the
      private repository's owner — replace it).
- [ ] No real person's data in any template or example.
- [ ] A licence chosen by the owner and added as `LICENSE`.
- [ ] The installation steps re-checked against the tools' current documentation.

Until then: private, all rights reserved.
