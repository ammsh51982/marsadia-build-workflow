# <Project name>

<One line on the product.> The authoritative rules are in `.specify/memory/constitution.md`. Read it.

## Review guidelines

Flag as **P0** — a non-negotiable rule is broken:
- <e.g. one customer's data readable by another>
- <e.g. a change with no audit record, or a way to alter or delete audit data>
- <e.g. domain content — a rule, a threshold, a required field — that traces to no stated source>
- Real personal data, or anything resembling it, in code, tests, seeds or fixtures
- A credential, key or connection string committed to the repository

Flag as **P1**:
- <e.g. code, a file or a migration that applies to one specific customer>
- <e.g. an authorization check that bypasses the shared function>
- <e.g. hardcoded user-facing text; a layout that breaks in the second language>
- A migration that is not safe to run unattended
- New behaviour without a test, especially around data isolation or authorization

Do not flag: formatting, naming preferences, or optional refactoring. Report only actionable
findings with file, line, evidence and consequence.
