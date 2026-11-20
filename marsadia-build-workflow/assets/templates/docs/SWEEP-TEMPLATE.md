# <slice id> sweep — the findings of slice <slice id>

**Scope:** every finding a review, the acceptance or a session raises on this slice.
**Numbered from:** `F<n>` — the series runs on from the previous slice's sweep without a gap, so a
finding has one number across the whole project.

Each finding opens with a `**Status:**` line — `open`, `resolved` or `unverified` — and it is the
only place the status is recorded. Each carries the reviewer's severity and our class.

**Review requests of this slice** (listed as they are made, each with its depth — Light, Standard,
Deep or Deepest): none yet.

---

## F<n> · <one-line title>

**Status:** open
**Source:** <code review of <commit> | security review | acceptance | a session's own reading>
**Reviewer's severity:** <P0 | P1 | P2 | —> · **Class:** <Serious | Major | Minor>

**The finding, verbatim:**

> <the reviewer's text, with file and lines>

**Reasoning for the class:** <who can reach it, and how>

**Action:** <fixed in <commit> | in the close bundle | queued for the owner's word> — <date>
