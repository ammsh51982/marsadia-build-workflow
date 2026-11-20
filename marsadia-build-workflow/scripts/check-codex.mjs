#!/usr/bin/env node
/**
 * Marsadia Build Workflow — prove that Codex review works on a repository.
 *
 *   node scripts/check-codex.mjs <owner/repo> look
 *       Read only. Reports Codex's latest activity on the repository's recent pull requests.
 *
 *   node scripts/check-codex.mjs <owner/repo> review <pr> [code|security] [--minutes <n>]
 *       Posts a bare "@codex review" (or "@codex security review") comment on the open pull
 *       request <pr>, from the GitHub account `gh` is signed in as, then waits for Codex.
 *
 *   node scripts/check-codex.mjs <owner/repo> wait <pr> [code|security] [--since <time>] [--minutes <n>]
 *       Read only. Waits for Codex's answer to the latest request of that kind on <pr>, or to
 *       anything Codex posts after --since (an ISO time, for example when a pull request opened).
 *
 * The last line printed is the verdict:
 *   result: CONFIRMED   the review came back
 *   result: BARRIER     Codex answered that it cannot review (its words are printed)
 *   result: NO START    no sign of Codex within 10 minutes
 *   result: NO ANSWER   Codex started, but no review came back in time
 *   (look mode: SEEN, NOT SEEN or BARRIER)
 * Exit code: 0 confirmed or seen, 3 barrier, 4 no start, no answer or not seen, 1 usage or GitHub error.
 *
 * Settings: --minutes <n> how long to wait for an answer (default 30). DRY_RUN=1 prints the
 * comment instead of posting it. CODEX_LOGIN overrides the reviewer's GitHub login (default
 * chatgpt-codex-connector). CODEX_POLL_SECONDS sets the polling interval (default 30).
 *
 * Needs the GitHub command tool `gh`, signed in. See docs/REVIEWER.md (references/codex-review.md).
 */
import { execFileSync } from 'node:child_process';

const LOGIN = new RegExp(process.env.CODEX_LOGIN ?? 'chatgpt-codex-connector', 'i');
const POLL_SECONDS = Math.max(5, Number(process.env.CODEX_POLL_SECONDS ?? 30) || 30);
const START_MINUTES = 10;

const USAGE = `usage:
  node check-codex.mjs <owner/repo> look
  node check-codex.mjs <owner/repo> review <pr> [code|security] [--minutes <n>]
  node check-codex.mjs <owner/repo> wait <pr> [code|security] [--since <time>] [--minutes <n>]`;

function fail(message, code = 1) {
  if (message) console.error(message);
  process.exit(code);
}

const [repo, mode, ...rest] = process.argv.slice(2);
if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo) || !['look', 'review', 'wait'].includes(mode)) {
  fail(USAGE);
}

let minutes = 30;
let since = null;
const words = [];
for (let i = 0; i < rest.length; i += 1) {
  if (rest[i] === '--minutes') {
    i += 1;
    minutes = Number(rest[i]);
  } else if (rest[i] === '--since') {
    i += 1;
    since = rest[i] ?? '';
  } else {
    words.push(rest[i]);
  }
}
if (!Number.isFinite(minutes) || minutes <= 0) fail('--minutes takes a positive number of minutes');
if (since !== null && Number.isNaN(Date.parse(since))) fail(`--since is not a time: ${since}`);
const [pr, kind = 'code'] = words;
if (!['code', 'security'].includes(kind)) fail(`the kind of review is code or security, not: ${kind}`);

// ---------------------------------------------------------------------------
// GitHub, through the `gh` command tool (it carries the sign-in).
// ---------------------------------------------------------------------------
function gh(args) {
  try {
    const out = execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return out.trim() ? JSON.parse(out) : null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      fail('The GitHub command tool (gh) is not installed; see references/installation.md.');
    }
    const said = String(error.stderr || error.message).trim().split('\n').pop();
    return fail(`GitHub refused or failed: ${said}`);
  }
}
const get = (path) => gh(['api', path]);
function list(path) {
  const all = [];
  for (let page = 1; page <= 10; page += 1) {
    const joiner = path.includes('?') ? '&' : '?';
    const items = get(`${path}${joiner}per_page=100&page=${page}`) ?? [];
    all.push(...items);
    if (items.length < 100) break;
  }
  return all;
}

// ---------------------------------------------------------------------------
// Reading what Codex left.
// ---------------------------------------------------------------------------
const ENVIRONMENT = /to use codex here|create an environment/i;
const SECURITY = /codex security review/i;
const RECEIPT = /codex review:/i;
const SUMMARY = /codex-pull-request-review-summary/;

const isCodex = (user) => Boolean(user && LOGIN.test(user.login ?? ''));
const later = (time, than) => Boolean(time) && Date.parse(time) > Date.parse(than);
const plain = (body) =>
  String(body ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\]\([^)]*\)/g, ']')
    .split('\n')
    .map((line) => line.replace(/[#*_`[\]]/g, '').trim())
    .find((line) => line && !line.startsWith('<')) ?? '(no text)';

function activity(number, sinceTime) {
  return {
    comments: list(`repos/${repo}/issues/${number}/comments`).filter(
      (c) => isCodex(c.user) && later(c.created_at, sinceTime),
    ),
    reviews: list(`repos/${repo}/pulls/${number}/reviews`).filter(
      (r) => isCodex(r.user) && later(r.submitted_at, sinceTime),
    ),
    inline: list(`repos/${repo}/pulls/${number}/comments`).filter(
      (c) => isCodex(c.user) && later(c.created_at, sinceTime),
    ),
  };
}

function judge(found) {
  const blocked = found.comments.find((c) => ENVIRONMENT.test(c.body ?? ''));
  if (blocked) {
    return { result: 'BARRIER', text: `Codex said: ${plain(blocked.body)}`, at: blocked.created_at, url: blocked.html_url, code: 3 };
  }
  if (kind === 'security') {
    const answer = found.comments.find((c) => SECURITY.test(c.body ?? '') && !SUMMARY.test(c.body ?? ''));
    if (answer) {
      return { result: 'CONFIRMED', text: 'the security review came back', at: answer.created_at, url: answer.html_url, code: 0 };
    }
  } else {
    const review = found.reviews[0];
    if (review) {
      return { result: 'CONFIRMED', text: 'the code review came back with findings', at: review.submitted_at, url: review.html_url, code: 0 };
    }
    const receipt = found.comments.find(
      (c) => RECEIPT.test(c.body ?? '') && !SECURITY.test(c.body ?? '') && !SUMMARY.test(c.body ?? ''),
    );
    if (receipt) {
      return { result: 'CONFIRMED', text: `the code review came back: ${plain(receipt.body)}`, at: receipt.created_at, url: receipt.html_url, code: 0 };
    }
    const line = found.inline[0];
    if (line) {
      return { result: 'CONFIRMED', text: 'the code review came back with findings', at: line.created_at, url: line.html_url, code: 0 };
    }
  }
  const other = found.comments.find(
    (c) => !SUMMARY.test(c.body ?? '') && !RECEIPT.test(c.body ?? '') && !SECURITY.test(c.body ?? ''),
  );
  if (other) {
    return { result: 'BARRIER', text: `Codex said: ${plain(other.body)}`, at: other.created_at, url: other.html_url, code: 3 };
  }
  return null;
}

function codexStarted(number, requestId, sinceTime) {
  const marks = [];
  if (requestId) marks.push(...list(`repos/${repo}/issues/comments/${requestId}/reactions`));
  marks.push(...list(`repos/${repo}/issues/${number}/reactions`));
  return marks.some((m) => isCodex(m.user) && later(m.created_at, sinceTime));
}

function finish(verdict, sinceTime) {
  if (verdict.url) console.log(`see: ${verdict.url}`);
  let when = '';
  if (verdict.at && sinceTime) {
    const gap = Math.max(0, Math.round((Date.parse(verdict.at) - Date.parse(sinceTime)) / 60000));
    when = ` (answered ${gap} min after the request)`;
  }
  console.log(`result: ${verdict.result} — ${verdict.text}${when}`);
  process.exit(verdict.code);
}

async function waitFor(number, sinceTime, requestId, startedAt) {
  let seenStart = false;
  let lastNote = 0;
  for (;;) {
    const found = activity(number, sinceTime);
    const verdict = judge(found);
    if (verdict) finish(verdict, sinceTime);
    seenStart =
      seenStart ||
      found.comments.length > 0 ||
      found.reviews.length > 0 ||
      codexStarted(number, requestId, sinceTime);
    const elapsed = (Date.now() - startedAt) / 60000;
    const startLimit = Math.min(START_MINUTES, minutes);
    if (!seenStart && elapsed >= startLimit) {
      finish({ result: 'NO START', text: `no sign of Codex within ${startLimit} minutes of the request`, code: 4 });
    }
    if (elapsed >= minutes) {
      finish({ result: 'NO ANSWER', text: `Codex started, but no ${kind} review came back within ${minutes} minutes`, code: 4 });
    }
    if (Date.now() - lastNote >= 120000) {
      console.log(
        `waiting for the ${kind} review — ${Math.floor(elapsed)} min so far, ${seenStart ? 'Codex has started' : 'no sign of Codex yet'}`,
      );
      lastNote = Date.now();
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_SECONDS * 1000));
  }
}

function pullRequest(number) {
  if (!/^\d+$/.test(String(number ?? ''))) fail('give the pull request number, for example: review 12');
  return get(`repos/${repo}/pulls/${number}`);
}

// ---------------------------------------------------------------------------
// The three modes.
// ---------------------------------------------------------------------------
if (mode === 'look') {
  const pulls = get(`repos/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=10`) ?? [];
  if (pulls.length === 0) {
    console.log('result: NOT SEEN — the repository has no pull requests yet. Open one, then use review mode.');
    process.exit(4);
  }
  let latest = null;
  for (const pull of pulls) {
    const seen = [
      ...(get(`repos/${repo}/issues/${pull.number}/comments?per_page=100`) ?? [])
        .filter((c) => isCodex(c.user))
        .map((c) => ({ at: c.created_at, pr: pull.number, barrier: ENVIRONMENT.test(c.body ?? ''), text: plain(c.body) })),
      ...(get(`repos/${repo}/pulls/${pull.number}/reviews?per_page=100`) ?? [])
        .filter((r) => isCodex(r.user))
        .map((r) => ({ at: r.submitted_at, pr: pull.number, barrier: false, text: 'a code review with findings' })),
    ];
    for (const item of seen) {
      if (!latest || Date.parse(item.at) > Date.parse(latest.at)) latest = item;
    }
  }
  if (!latest) {
    console.log(`result: NOT SEEN — no Codex activity on the last ${pulls.length} pull requests`);
    process.exit(4);
  }
  console.log(`last Codex activity: ${latest.at} on #${latest.pr} — ${latest.text}`);
  if (latest.barrier) {
    console.log('result: BARRIER — the latest thing Codex said here is that it cannot review; see section 7 of the reviewer guide');
    process.exit(3);
  }
  console.log('result: SEEN — Codex has been reviewing here; prove it with review mode before recording it');
  process.exit(0);
}

if (mode === 'review') {
  const pull = pullRequest(pr);
  if (pull.state !== 'open') {
    fail(`pull request #${pr} is ${pull.merged_at ? 'merged' : 'closed'}; Codex reviews open pull requests — use an open one`);
  }
  const body = kind === 'security' ? '@codex security review' : '@codex review';
  if (process.env.DRY_RUN === '1') {
    console.log(`dry run — would post on #${pr} of ${repo}: ${body}`);
    process.exit(0);
  }
  const posted = gh(['api', '--method', 'POST', `repos/${repo}/issues/${pr}/comments`, '-f', `body=${body}`]);
  console.log(`posted on #${pr}: ${body} — ${posted.html_url}`);
  if (kind === 'security') {
    console.log(
      "If there is no sign of Codex within 10 minutes, post the same words from the owner's own browser, then run: wait " +
        `${pr} security`,
    );
  }
  await waitFor(pr, posted.created_at, posted.id, Date.now());
}

if (mode === 'wait') {
  pullRequest(pr);
  let sinceTime = since;
  let requestId = null;
  if (!sinceTime) {
    const pattern = kind === 'security' ? /^\s*@codex security review\b/i : /^\s*@codex review\b/i;
    const requests = list(`repos/${repo}/issues/${pr}/comments`).filter((c) => pattern.test(c.body ?? ''));
    const last = requests.at(-1);
    if (!last) {
      fail(`no "${kind === 'security' ? '@codex security review' : '@codex review'}" request on #${pr}; use review mode, or --since <time>`);
    }
    sinceTime = last.created_at;
    requestId = last.id;
    console.log(`waiting on the request of ${sinceTime} by ${last.user?.login ?? 'unknown'}`);
  }
  const requestedAt = Date.parse(sinceTime);
  await waitFor(pr, sinceTime, requestId, Math.min(Date.now(), requestedAt));
}
