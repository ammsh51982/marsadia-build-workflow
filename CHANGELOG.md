# Changelog

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
