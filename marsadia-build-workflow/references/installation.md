# Installation

Everything the workflow needs, in the order to set it up. Steps 1 to 4 are done once per computer;
steps 5 to 10 once per project. Checked against the tools' own documentation on 17 November 2026
(spec-kit 1.4.1). Tools change: where a command fails, read the linked page before improvising.

## What you need

| Need | Why | Check |
| --- | --- | --- |
| A Claude plan with Claude Code, cloud sessions and scheduled tasks | The build sessions, the chain, the check-ins | Claude can start a Claude Code session on a GitHub repository |
| A GitHub account and a repository | The project, the pull requests, the automatic checks | `gh auth status` |
| Git | Everything | `git --version` |
| Node.js 18 or newer | The session guard script | `node --version` |
| Python 3.11 or newer and `uv` | spec-kit | `python3 --version`, `uv --version` |
| spec-kit (`specify`) | Spec, plan, tasks, analysis | `specify version` |
| The GitHub command tool (`gh`) | Pull requests, checks and review comments from a session | `gh --version` |
| An OpenAI API key with a monthly limit (asked for at setup; billed separately from ChatGPT) | Deep reviews at a chosen effort, run on GitHub's machines | `node scripts/check-codex.mjs <owner/repo> deep <pr> high` |
| OpenAI Codex connected to GitHub (a ChatGPT plan that includes Codex) | The independent reviewer | `node scripts/check-codex.mjs <owner/repo> look`, then the proof in `references/codex-review.md` |

## Once per computer

### 1. Git, Node.js and the GitHub command tool

On macOS with Homebrew:

```bash
brew install git node gh
gh auth login
```

On other systems use the installers at <https://git-scm.com>, <https://nodejs.org> and
<https://cli.github.com>.

### 2. uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh     # or: brew install uv
uv --version
```

### 3. spec-kit

```bash
uv tool install specify-cli
specify version
```

To pin a version for a team, use `uv tool install specify-cli==1.4.1`. To upgrade later, use
`uv tool install --force specify-cli` (the same tool you installed with). Documentation:
<https://github.github.com/spec-kit/installation.html>.

### 4. This skill

For Claude Code on the computer, copy the skill folder into the personal skills folder:

```bash
git clone https://github.com/ammsh51982/marsadia-build-workflow.git
mkdir -p ~/.claude/skills
cp -R marsadia-build-workflow/marsadia-build-workflow ~/.claude/skills/
```

For Claude chat, save the skill to the account (the advisor chat can propose it for saving).
A cloud session that should use the templates attaches the repository and reads them from there.

### 4a. Make it the default for every project

Where the skill is installed decides where it works:

| Installed in | Works in |
| --- | --- |
| The Claude account | Chats, and Claude Code sessions both local and in the cloud |
| `~/.claude/skills/` on a computer | Every project on that computer; not cloud sessions |
| A project's own `.claude/skills/` | That project only — not the place for a default |

Install it in the first two and it is available everywhere; Claude picks it up when the work
matches its description. To make it the stated default as well, add one line to the personal
instructions file that Claude Code loads in every session, `~/.claude/CLAUDE.md` (create the file
if it does not exist):

```
My default build workflow is the marsadia-build-workflow skill. Use it for all build work in every project.
```

A global install gives Claude the workflow. Each project still gets its own files once — steps 5
to 10 below.

## Once per project

### 5. spec-kit in the project

In the project folder (commit or back up local changes first; `--force` merges into an existing
folder):

```bash
specify init --here --force --integration claude
specify extension add git
```

This writes the spec-kit skills to `.claude/skills/` — `/speckit-constitution`, `/speckit-specify`,
`/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`,
`/speckit-converge`, `/speckit-checklist` — and its templates and scripts to `.specify/`. The git
extension adds the `/speckit-git-*` skills. The names are hyphenated, not dotted.

### 6. The workflow's files

```bash
bash ~/.claude/skills/marsadia-build-workflow/scripts/install.sh <project-folder>
```

It adds `CLAUDE.md`, `AGENTS.md`, `docs/STATE.md`, `docs/WORKFLOW.md`, `docs/REVIEWER.md`, the brief, decision, sweep
and acceptance templates, the three scheduled-task instructions under `docs/prompts/`, the
`SessionStart` hook, the `/wrap` command, a checks skeleton and `scripts/session-guard.mjs`. It
never overwrites a file that exists; it lists those for comparing by hand.

The script ends with two questions for the owner, each answered with one word, and writes the
answers into `CLAUDE.md`: **plain** or **technical** (`Owner mode:` — how technical matters reach
him) and **scheduled** or **continuous** (`Session mode:` — how the build sessions follow each
other; unanswered means continuous). Run without a keyboard (inside a session), it leaves the lines
unanswered and Claude asks him instead. To set them in the same command:
`bash …/install.sh <project-folder> plain continuous`.

Then fill the angle-bracket placeholders in `CLAUDE.md`, `AGENTS.md` and `docs/STATE.md`, and check
the guard:

```bash
node scripts/session-guard.mjs        # expect: verdict: GO
```

### 7. The constitution

In Claude Code, run `/speckit-constitution` with the project's own non-negotiable rules, then add
the three sections of `docs/constitution-additions.md` (Delivery Rules, Definition of Done,
Governance). Delete that file afterwards. The same rules appear in three places on purpose: in the
constitution (enforced at plan and implement time), in `CLAUDE.md` (held by every session) and, as
severities, in `AGENTS.md` (what the reviewer flags).

### 8. GitHub

1. Create the repository (private unless there is a reason otherwise) and push the main line.
2. Replace the placeholders in `.github/workflows/ci.yml` with the project's own commands, and
   confirm both jobs — `verify` and `isolation` — run on a pull request.
3. Protect the main line with a branch rule: changes only through a pull request, and both checks
   required. From then on even a records-only change goes through a pull request.
4. If the checks use paid minutes, set a monthly budget with a stop, so a runaway job cannot run
   up a bill.

### 9. The independent reviewer

Claude does this step itself when it applies the workflow, and proves it with a real review:
`references/codex-review.md` (in the project, `docs/REVIEWER.md`). In short:

1. Look: `node scripts/check-codex.mjs <owner/repo> look` (reads only).
2. Ask the owner once, in one line, before changing his GitHub and Codex settings.
3. Set up in his signed-in browser: the Codex app's repository access on GitHub; Codex settings →
   the repository → Review code → Automatic review; a Codex environment if Codex asks for one.
4. Fill the review rules in `AGENTS.md`, under `## Code Review Rules`.
5. Deep reviews: the owner's one yes for an OpenAI API key with a monthly limit; he pastes it as the
   repository's Actions secret `OPENAI_API_KEY`.
6. Prove it on a real pull request: `check-codex.mjs <owner/repo> review <pr>`, then
   `review <pr> security`, then — once the workflow's files are merged — `deep <pr> high`. Each
   must come back.
7. Record `**Reviewer:**` in `CLAUDE.md`. No slice is built before it.

Only barriers Claude cannot clear reach the owner, as one decision (section 8 of the reviewer
guide). Current documentation: <https://learn.chatgpt.com/docs/third-party/github>.

### 10. The scheduled tasks

The advisor chat creates these with its scheduling tools, from the instructions the install
placed under `docs/prompts/`:

| Task | From | Settings |
| --- | --- | --- |
| The chain | `docs/prompts/chain-task.md` | A fresh session each firing; automatic approval; push notifications on; the default build model. `Session mode: scheduled` — a schedule, every five hours by default. `Session mode: continuous` — no schedule, fired by hand |
| Check-ins | `docs/prompts/check-in.md` | `continuous` mode only: one-off reminders into the advisor chat itself, every 30 to 60 minutes while a session runs |
| The daily email check | `docs/prompts/daily-email-check.md` | Once a day; read-only; needs the owner's email connector |

A scheduled task takes the model it is set to, not the model of the session that happens to be
talking. The advisor chat changes the task's model before a firing it wants on the stronger model,
and changes it back afterwards.

## A first run to confirm the installation

1. `specify version` prints a version.
2. `node scripts/session-guard.mjs` prints `verdict: GO`.
3. `node scripts/session-guard.mjs --open test` then `node scripts/session-guard.mjs` prints
   `verdict: STOP (another session holds the slice)`; `--clear` returns it to GO.
4. A draft pull request shows both checks, and the reviewer is proved: the `**Reviewer:**` line in
   `CLAUDE.md` is filled (`references/codex-review.md`, section 5).
5. The first slice should be a small one — the project's skeleton and its checks — so the whole
   loop is walked once before anything important depends on it.
