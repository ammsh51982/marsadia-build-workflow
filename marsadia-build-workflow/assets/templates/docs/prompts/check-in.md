# The check-in — the advisor chat's own reminder

Used when the project's `Session mode` is `continuous`. While a build session runs, the advisor
chat sets itself a one-off reminder (every 30 to 60 minutes) that arrives back in the same chat.
(In `scheduled` mode the chain fires itself; the advisor chat applies the same rules whenever it
reads the results, except that it leaves the next firing to the schedule.) Each reminder carries the state forward, because the
chat should act on what it last saw, not on a schedule. Rewrite the first paragraph at every
check-in; keep the rules.

---

```
Check-in for <project name> (no-delays rule; <30|60>-minute rhythm while a session runs).

STATE AT <time>: <which session is running, on which model, started when, its time cap; the last
commit seen; the checks; any job in progress; the last review seen; what I have already told the
owner; what I owe him.>

NOW: read GitHub — the commits of the slice's branch since <commit>, the checks on the head, the
jobs in progress, the pull request's comments and reviews since <time> — then docs/STATE.md on the
branch: "Chained sessions", "Needs the owner", "For the owner".

RULES
(a) Marker OPEN and the last push under 60 minutes old → alive: wait, tell the owner nothing, set
    the next check-in.
(b) Marker OPEN and no push for over 60 minutes → tell the owner and ask him to look at the
    session before anything is fired.
(c) Marker CLEAR, phases left, no hold → fire the next session at once, with any ruling as its
    extra message; then CHECK WITHIN FIVE MINUTES that a marker commit appeared.
(d) `phase: awaiting …` → do not fire. Do the review or the check myself (spec and plan against
    the brief; the arithmetic; each built screen against the owner's drawing; or, when the
    Reviewer line reads interim, the fresh Claude reviewer of docs/REVIEWER.md section 9). Then
    fire with the release, or with the precise list of what differs.
(e) New findings → read them verbatim and check the class. In `plain` owner mode, Serious and
    Major are mine and Minors go to the owner as a short plain-words list; in `technical` mode
    every finding goes to him verbatim with its class. A finding whose fix changes how a user works goes
    to him with an example, options, a recommendation and what happens if deferred.
(f) A question under "Needs the owner" → bring it to him the same way; write his answer into the
    chain task's prompt.
(g) `slice-state: ready-for-acceptance` → tell the owner and offer the sitting.
(h) A review requested over 30 minutes ago with no answer → run
    `node scripts/check-codex.mjs <owner>/<repo> wait <pr> [code|security]` and follow
    docs/REVIEWER.md sections 7 and 8. Only section 8's barriers go to the owner.
(i) The guard stopped because the reviewer is not confirmed → set it up and prove it
    (docs/REVIEWER.md sections 4 and 5), then fire.
(j) A Deep or Deepest phase has closed → if the Codex command tool is signed in where I can run
    it (a shell on the owner's computer), run its review at the depth's effort
    (docs/REVIEWER.md section 10) and record the findings like Codex's; otherwise note on the
    sweep that the GitHub review stood alone.

Tell the owner only what changed or what needs his decision. Then set the next check-in, carrying
this state forward.
```
