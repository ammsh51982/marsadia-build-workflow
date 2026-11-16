---
description: Save session state to docs/STATE.md and commit, so the next session resumes without a handoff message
---

Wrap up this session by writing its state to disk.

1. Rewrite `docs/STATE.md` to reflect reality right now. Keep the existing headings and replace
   the content under each:

   - **Updated / Phase / Slice** — the date and time, the current phase, the current slice.
   - **Current slice** — the slice, its branch and pull request, the paths of its brief and spec.
   - **Chained sessions** — `slice-state:` and `phase:` as they now stand. If the next step is the
     advisor chat's (a review or a check), `phase:` begins with the word "awaiting".
   - **Needs the owner** — `none`, or each question in plain words with options, a real-world
     example, your recommendation and what happens if it is deferred.
   - **For the owner** — plain words, no code: what is built, what is queued, his next step.
   - **Done** — completed slices, one line each. Do not list individual commits.
   - **In progress** — what is half-finished, specific enough to resume: which task numbers in
     `specs/*/tasks.md`, what is missing.
   - **Next** — the single next action, not a wishlist.
   - **Blocked / open questions** — anything stopping progress.
   - **Last chained session** — this session's plain-words report.

2. Keep the file short. It loads into context at the start of every session, so length costs
   every future session. Cut history that no longer changes what happens next.

3. If a task list exists at `specs/*/tasks.md` for the current slice, make sure completed tasks
   are checked off, and count them rather than typing a number from memory. Count the open and
   resolved findings from the sweep's `**Status:**` lines the same way.

4. If anything was discovered this session that is real work but outside the approved slice,
   append it to `docs/BACKLOG.md` with one line of context. Do not build it.

5. Clear the session marker: `node scripts/session-guard.mjs --clear`.

6. Commit with the message `chore: session state <slice-id>` and push if the branch exists on the
   remote. If the push is rejected because the branch moved, fetch and rebase; never force.

7. Report back in one short paragraph of plain words: what was completed, what the reviewer
   found and its class, anything the owner must decide, and what the next session will do. Do not
   produce a handoff message — the file is the handoff.
