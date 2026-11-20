# The reviewer — Codex review

Part of the Marsadia Build Workflow, version 1.4.0. In each project this file is copied to
`docs/REVIEWER.md`.

Codex, OpenAI's coding agent, reviews the work on every pull request. It is the workflow's
independent second opinion: a different model from the one that built the work. This file says
how Claude sets it up when the workflow is applied to a project, how Claude proves it works,
how it is used, and what reaches the owner when something blocks it.

Contents: 1 What it gives · 2 When it is set up · 3 What it needs · 4 Setting it up ·
5 Proving it works · 6 Using it · 7 When a review does not come · 8 What goes to the owner ·
9 The fresh Claude reviewer · 10 Model, effort and how deep each review goes

## 1. What Codex review gives

| Review | How it is requested | What comes back |
| --- | --- | --- |
| Code review | A comment `@codex review` on the pull request; also automatically when a pull request is opened for review or a draft is marked ready | A review whose findings are marked `[P0]` or `[P1]`, each on a line of the change; or a short comment "Codex Review: Didn't find any major issues" |
| Security review (research preview) | A comment `@codex security review`, on its own | A comment headed "Codex Security Review", with any findings |

- Its comments and reviews come from the GitHub account `chatgpt-codex-connector[bot]`.
- It reacts 👀 when it starts; when a code review finds nothing it may also react 👍.
- By default it flags only P0 and P1 issues.
- In practice a code review answers in 2 to 5 minutes and a security review in about 6.
- A comment can add a focus: `@codex review for issues in the database migration`.
- It reads the project's rules from the top-level `AGENTS.md`, section `## Code Review Rules`,
  with `###` headings grouping the checks. Older projects may use `## Review guidelines`; if
  Codex seems to ignore the rules, rename the section.

## 2. When it is set up

- When the workflow is applied to a project in full, as part of applying it — the owner does not
  have to ask.
- When the workflow is applied in stages: with stage 3, "The gate", the first stage that uses
  pull requests. Codex reviews only pull requests.
- Again whenever a project moves to a new repository.

It is set up by the advisor chat, or whichever Claude applies the workflow; never by a build
session. Opening a slice (brief, spec, plan, tasks) may go ahead meanwhile, but no slice is built
until the `Reviewer:` line in the project's `CLAUDE.md` is filled. The session guard enforces it.

## 3. What it needs

All of it lives in the owner's accounts; Claude only uses them.

| Need | How often |
| --- | --- |
| A ChatGPT plan that includes Codex, connected to the owner's GitHub account | Once, for all projects |
| The Codex app on GitHub allowed to see this repository (if it was installed for "only select repositories", this one is added) | Once per project |
| The repository connected in Codex settings, with code review turned on for it | Once per project |
| A Codex environment for the repository, if Codex asks for one | Once per project, when asked |
| Push or admin permission on the repository, which automatic reviews need | Already true when the owner owns it |

## 4. Setting it up

1. **Look first.** `node scripts/check-codex.mjs <owner/repo> look` reads the repository's
   recent pull requests and changes nothing. If Codex has been active there, it is connected:
   go to section 5 and prove it.
2. **Ask once.** Allowing the Codex app to see the repository and turning on its review change
   the owner's account settings. Ask in one line that names them, for this project only:
   "I'll switch on Codex review for <project> in your GitHub and Codex settings. Go ahead?"
   One yes covers steps 3a to 3c for this project.
3. **Set up**, in the owner's browser where he is signed in (Claude in Chrome or the built-in
   browser):
   a. GitHub: <https://github.com/settings/installations> → the ChatGPT Codex app → Repository
      access. If it reads "Only select repositories", add this repository and save.
   b. Codex settings (Codex links them as <https://chatgpt.com/codex/cloud/settings/general>):
      connect the repository, choose it, and under "Review code" turn on "Automatic review".
      Under "Personal preferences", "Automatic review" applies to every repository with code
      review on; turn it on if it is off. Leave "Auto security review" off: the workflow asks for
      the security review itself, once per slice.
   c. If Codex says "To use Codex here, create an environment for this repo", create one for the
      repository at <https://chatgpt.com/codex/cloud/settings/environments>.
   d. Sign-in prompts and two-step confirmations belong to the owner: stop, ask him to approve,
      and continue when he says it is done.
4. **The rules.** `AGENTS.md` (placed by `install.sh`) carries the project's review rules under
   `## Code Review Rules`. Fill its placeholders with two or three of the project's most
   important rules per group. Formatting and lint belong to the automatic checks, not here.

## 5. Proving it works

A setup is not finished until a real review has come back.

1. **Use a real pull request, not a throwaway one**: the pull request that adds the workflow's
   files to the project, or, when those are already in, a small one that writes the `Reviewer:`
   line into `CLAUDE.md`.
2. **Code review**: `node scripts/check-codex.mjs <owner/repo> review <pr>` posts a bare
   `@codex review` and waits up to 30 minutes for the answer.
3. **Security review**: `node scripts/check-codex.mjs <owner/repo> review <pr> security`. If it
   shows no sign of starting within 10 minutes, post the same three words from the owner's own
   browser and run `node scripts/check-codex.mjs <owner/repo> wait <pr> security`. Posting it
   bare, from the owner's own browser, is the one way measured to work.
4. **Both came back** (`result: CONFIRMED`): write in `CLAUDE.md`
   `**Reviewer:** Codex — code review and security review confirmed working on <date> (pull request #<n>)`,
   and tell the owner in one line. Any finding they returned is handled like any other
   (section 6).
5. **Otherwise** (`BARRIER`, `NO START`, `NO ANSWER`): section 7, then section 8.

The script's last line is its verdict; its exit code is 0 confirmed, 3 a barrier Codex reported,
4 no start or no answer, 1 a usage or GitHub error.

## 6. Using it in the workflow

| Moment | Request | Who posts it |
| --- | --- | --- |
| The push that closes a phase | `@codex review` | The build session |
| A push carrying a migration that touches grants, policies or sign-in | `@codex review` | The build session |
| The end of the slice, after the acceptance corrections | `@codex security review`, bare, in its own comment | From the owner's browser, on his word |
| The pull request marked ready, just before merging | Automatic | The click; the merge waits for the answer |

Rules measured in practice:

- **A push does not start a review.** Only opening the pull request for review, marking a draft
  ready, or an explicit comment do. A finding fixed by a push keeps reading as open until the
  next review runs.
- **One trigger per comment.** A comment asking for both reviews runs only the code review.
- **Never on an ordinary push.** Reviews cost the owner's Codex usage; the moments above are
  enough.
- **Every finding is recorded verbatim** — severity, file, lines, the reviewer's text — in the
  slice's sweep before anything is fixed. Then it is classed Serious, Major or Minor and handled
  as the workflow says. Each thread gets a one-sentence reply.
- **No answer after 30 minutes**:
  `node scripts/check-codex.mjs <owner/repo> wait <pr> [code|security]`, then section 7.

## 7. When a review does not come

| The check shows | Likely cause | What Claude does |
| --- | --- | --- |
| `NO START` — no 👀 and nothing from Codex within 10 minutes | Code review not on for this repository; the repository not connected to Codex; the comment not exactly `@codex review` | Checks the three in Codex settings (any change with the owner's yes, as in section 4); posts a bare request once more |
| `BARRIER` — "create an environment for this repo" | No Codex environment for the repository | Creates it (section 4, step 3c) and requests again |
| `BARRIER` — any other message from Codex | Often a usage limit or an account matter | Reads it in full; if it concerns the owner's plan or account, section 8 |
| `NO ANSWER` — Codex started but nothing came back in 30 minutes | A slow or stuck run, or a usage limit | Waits one more period; then section 8 |
| Reviews requested by comment work, automatic ones never come | "Automatic review" off for the repository or in personal preferences; the account lacks push or admin permission | Turns it on (with the owner's yes); a missing permission goes to section 8 |

## 8. What goes to the owner

Claude clears everything it can. Only these reach the owner, each as one decision in the form his
setting asks for: plain words with a real-world example, or technical words.

- His plan has no Codex, or Codex will not connect to his GitHub account.
- A step needs a permission he does not hold, such as a repository someone else owns.
- Codex still does not answer after the steps of section 7.
- The security review is not available to him (it is a research preview).

When Codex cannot be used for now, the decision is:

| Option | What it means | Everyday example |
| --- | --- | --- |
| **A. Get Codex working** | The owner fixes the account side (for example a plan that includes Codex); Claude finishes the setup and proves it | An outside auditor checks the work |
| **B. A fresh Claude reviewer meanwhile** | A separate Claude session that took no part in building reviews each phase (section 9) until Codex works | A colleague from the same office who did not do the work checks it |
| **C. No independent reviewer** | Only the automatic checks and the advisor chat's own reading | Nobody double-checks |

Recommend A. If he defers, B runs until Codex works, recorded in `CLAUDE.md` as
`**Reviewer:** interim — fresh Claude reviewer (<reason>, <date>)`. Option C is recorded as
`**Reviewer:** none — the owner's decision (<date>)`.

## 9. The fresh Claude reviewer (option B)

- Where the workflow would request `@codex review`, the build session instead sets
  `phase: awaiting the advisor chat's review` and wraps.
- The advisor chat starts a separate Claude session that took no part in building. It gives that
  session only the pull request and `AGENTS.md`, and asks for findings in Codex's form:
  `[P0]` or `[P1]`, file, lines, text.
- The findings go to the sweep verbatim and are classed as usual; the advisor chat then releases
  the hold.
- Each time, the advisor chat checks whether Codex now works (`look`, then section 5), and
  switches back as soon as it does.

## 10. Model, effort and how deep each review goes

**On GitHub, OpenAI chooses the model and the effort.** Codex's GitHub documentation names no
model, and there is no setting for model or effort: not in Codex settings, not per repository, not
in the comment. When OpenAI introduced its review model it said the model adjusts how long it
thinks to the size and difficulty of the change, so on GitHub "more for complex, less for simple"
happens inside Codex. What Claude controls there is what Codex looks at: the focus line in the
request and the rules in `AGENTS.md`.

**With the Codex command tool, Claude chooses the effort** (and, when needed, the model):

```
codex review --base <main branch> -c model_reasoning_effort="high"
```

The levels a model offers vary (for example low, medium, high, xhigh, max); use the highest the
depth below asks for that the model offers. Leave the model on Codex's own default, because model
names change every few months. Name a stronger model with `-m <model>` only after checking that the
owner's account offers it. `--base`, `--commit`, `--uncommitted` and a custom prompt cannot be
combined, so this pass takes its guidance from `AGENTS.md`, not from a focus line.

**Claude picks the depth of every review itself**, from what the phase touches, and writes the
depth beside the request in the slice's sweep. The owner is never asked.

| Depth | The phase touches | On GitHub | With the command tool |
| --- | --- | --- | --- |
| Light | Only wording, documents or records | No review requested; the automatic checks only | Not run |
| Standard | Ordinary screens and logic | `@codex review` | Not run |
| Deep | A migration, permissions, sign-in, money, personal data, keeping customers' data apart, or many files at once | `@codex review for <the risky part, named in a few words>` | Effort `high` |
| Deepest | The slice's close, or a phase where one mistake would expose one customer's data to another or let someone act without permission | The slice's security review at the close, as section 6 says | Effort `xhigh`, or `max` where the model offers it |

The command-tool pass runs only where Codex is already signed in on that machine: a session on the
owner's computer, or the advisor chat through a shell on his computer. The owner's sign-in is never
placed in a cloud session, because sessions hold no secrets. Where the pass cannot run, the GitHub
review stands alone and the sweep says so. Its findings are recorded verbatim and classed exactly
like the GitHub review's.
