# <Project name>

<One line on the product.> The authoritative rules are in `.specify/memory/constitution.md`. Read it.

## Code Review Rules

Codex reads this section on every review. Start with two or three of the project's most important
rules in each group, and add more only when a review misses something. Formatting and lint belong to
the automatic checks, not here.

### Flag as P0 — a non-negotiable rule is broken

- <e.g. one customer's data readable by another>
- <e.g. a change with no audit record, or a way to alter or delete audit data>
- Real personal data, or anything resembling it, in code, tests, seeds or fixtures
- A credential, key or connection string committed to the repository

### Flag as P1

- <e.g. code, a file or a migration that applies to one specific customer>
- <e.g. an authorization check that bypasses the shared function>
- A migration that is not safe to run unattended
- New behaviour without a test, especially around data isolation or authorization

### Do not flag

Formatting, naming preferences, or optional refactoring. Report only actionable findings, each with
file, line, evidence and consequence.
