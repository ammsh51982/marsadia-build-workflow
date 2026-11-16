# Changelog

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
