# Changelog

## 1.4.0 — 20 November 2026

- **How deep each review goes, picked automatically.** Claude gives every review a depth from what
  the phase touches — Light, Standard, Deep, Deepest — and records it on the sweep. The owner is
  never asked.
- On GitHub, OpenAI chooses Codex's model and effort and offers no setting, so the depth steers
  what Codex looks at: a focus line naming the risky part for Deep phases.
- Where the Codex command tool is already signed in, Claude adds a second review with the effort
  set by the depth (`high` for Deep; `xhigh`, or `max` where offered, for Deepest), leaving the model
  on Codex's default. The owner's sign-in is never placed in a cloud session.
- `check-codex.mjs review` takes `--focus "<text>"` for a Deep code review.
- New section 10 of the reviewer guide.

## 1.3.0 — 20 November 2026

- **The reviewer, set up and proved.** When the workflow is applied to a project (in stages: with
  stage 3), Claude sets up Codex review in the owner's accounts after one yes for those settings,
  and proves it with a real code review and a real security review on a real pull request. The
  result is recorded as `**Reviewer:**` in `CLAUDE.md`.
- New `references/codex-review.md` (copied into projects as `docs/REVIEWER.md`): what Codex review
  gives, what it needs, setup, proof, use, what to do when a review does not come, and the one
  decision that reaches the owner when Codex cannot be used — get Codex working, a fresh Claude
  reviewer meanwhile, or no reviewer.
- New `scripts/check-codex.mjs`: `look` (read only), `review` (posts a bare request and waits) and
  `wait`; it recognises Codex's answers, its start signal and its "create an environment" barrier.
- The session guard stops any building while the reviewer is not yet confirmed; opening a slice may
  go ahead.
- `AGENTS.md` template: the review rules now sit under `## Code Review Rules`, as Codex's current
  documentation names the section.

## 1.2.2 — 18 November 2026

- The terms of use stated, on the author's decision: anyone may install the skill and use the
  workflow on their own projects without asking; sharing a copy or publishing a changed version
  needs the author's permission. All rights otherwise reserved.
- A contact address for permission and questions: marsadia.co@gmail.com.
- The same terms now travel inside the skill itself, so a copy installed anywhere carries them.

## 1.2.1 — 18 November 2026

- Prepared for publication: the download commands carry the repository's real address, the
  "private" notes are removed, and the README states that no licence has been chosen yet.
- Checked before publication: no project, clinic or account details in any file or past version.

## 1.2.0 — 17 November 2026

- **The session mode.** A second one-word question after installation: `scheduled` (sessions start
  at fixed times, every five hours by default) or `continuous` (the next session starts as soon as
  the last one finishes, with check-ins by the advisor chat). Recorded as `Session mode:` in the
  project's `CLAUDE.md`; unanswered means `continuous`.
- `install.sh` asks both questions (or takes the words as arguments) and writes the answers.
- The workflow now lists the chain's time rules in one table.

## 1.1.1 — 17 November 2026

- Installation: how to make the workflow the default for every project (the account copy, the
  personal skills folder, and one line in `~/.claude/CLAUDE.md`).
- The author's credit added to the skill, the workflow and the README.

## 1.1.0 — 17 November 2026

- **The owner's setting.** Right after installation the owner is asked one question and answers with
  one word, `plain` or `technical`. In `plain` mode technical matters are decided by Claude and
  reported, and only product decisions reach the owner, in plain words. In `technical` mode the
  technical decisions of consequence and every review finding also reach him, in technical words.
  Recorded as `Owner mode:` in the project's `CLAUDE.md`; unanswered means `plain`.
- `install.sh` asks the question (or takes the word as its second argument) and writes the answer.
- The skill, the workflow, the `CLAUDE.md` template, the chain task and the check-in follow the setting.

## 1.0.0 — 17 November 2026

The first version, generalised from the workflow that built a live multi-slice product.

- The slice loop: brief, spec-kit opening, spec-and-plan review, phased build, close, acceptance,
  security review and merge, post-merge record.
- Reviews and their moments; the Serious / Major / Minor triage.
- Chained sessions with the session guard; the chain task, check-ins and the daily email check.
- The adoption question for an existing project: apply, continue, or apply in stages.
- Templates, `install.sh`, and installation instructions checked against spec-kit 1.4.1.
- The guard now also stops on a hold (`phase: awaiting …`) unless run with `--released`; in the
  source project that rule lived only in the chain's instructions.
- Safeguards: one proven (the picture check), six recommended and to be confirmed in use.
