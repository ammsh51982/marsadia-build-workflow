#!/usr/bin/env node
/**
 * Marsadia Build Workflow — the session guard.
 *
 * The first command of every chained build session. It reads docs/STATE.md and
 * decides whether this session may touch the slice, so two sessions never work
 * on the same branch and no session builds past a question or a hold.
 *
 * It prints, one per line:
 *
 *   marker:      OPEN <age>     another session wrote `session-open:` recently
 *                STALE <age>    a marker older than the limit (a session that never wrapped) — treated as clear
 *                CLEAR          `session-open: none`, or no marker line
 *   state:       the `slice-state:` line
 *                (none | spec-and-plan | building | needs-owner | ready-for-acceptance)
 *   phase:       the `phase:` line — the open phase, its model, or the hold that stands
 *   needs-owner: yes | no       whether "## Needs the owner" holds anything but "none"
 *   hold:        yes | no       whether the `phase:` line begins with "awaiting"
 *   reviewer:    confirmed | interim | none | not yet confirmed | not stated
 *                read from the `**Reviewer:**` line of CLAUDE.md; "not yet confirmed" stops any
 *                building (slice-state spec-and-plan or building) — opening a slice may go ahead
 *   verdict:     STOP (<reason>) | GO
 *
 * Exit code: 0 on GO, 2 on STOP, 1 when the state file cannot be read.
 *
 *   node scripts/session-guard.mjs                 read and judge
 *   node scripts/session-guard.mjs --released      read and judge, the advisor chat having released the hold
 *   node scripts/session-guard.mjs --open <who>    write the marker (now, <who>) — a session's start, after a GO
 *   node scripts/session-guard.mjs --clear         clear the marker — done by /wrap
 *
 * The marker line is `session-open: <ISO instant> <session name>` or
 * `session-open: none`. Nothing else in the file is changed by this script.
 *
 * Settings (environment variables):
 *   SESSION_GUARD_STATE        path of the state file (default docs/STATE.md beside this script's folder)
 *   SESSION_GUARD_CLAUDE       path of the project's rules file (default CLAUDE.md at the project's root)
 *   SESSION_GUARD_STALE_HOURS  hours after which an open marker is read as stale (default 5)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATE = process.env.SESSION_GUARD_STATE ?? path.join(ROOT, 'docs', 'STATE.md');
const RULES = process.env.SESSION_GUARD_CLAUDE ?? path.join(ROOT, 'CLAUDE.md');
const STALE_HOURS = Number(process.env.SESSION_GUARD_STALE_HOURS ?? 5);
const STALE_MS = (Number.isFinite(STALE_HOURS) && STALE_HOURS > 0 ? STALE_HOURS : 5) * 60 * 60 * 1000;
const MARKER = /^session-open:\s*(.*)$/m;

let text;
try {
  text = readFileSync(STATE, 'utf8');
} catch (error) {
  console.error(`cannot read ${STATE}: ${error.message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args[0] === '--open' || args[0] === '--clear') {
  const value =
    args[0] === '--clear' ? 'none' : `${new Date().toISOString()} ${args[1] ?? 'unnamed-session'}`;
  if (!MARKER.test(text)) {
    console.error(
      'The state file carries no `session-open:` line to write; add the "Chained sessions" section first.',
    );
    process.exit(1);
  }
  writeFileSync(STATE, text.replace(MARKER, `session-open: ${value}`));
  console.log(`session-open: ${value}`);
  process.exit(0);
}
const released = args.includes('--released');

const age = (ms) => {
  const minutes = Math.round(ms / 60000);
  return minutes < 120 ? `${minutes} min` : `${(minutes / 60).toFixed(1)} h`;
};

const marker = text.match(MARKER)?.[1]?.trim() ?? '';
let markerLine = 'CLEAR';
let open = false;
if (marker && marker !== 'none') {
  const [instant] = marker.split(/\s+/);
  const since = Date.now() - Date.parse(instant);
  if (Number.isNaN(since)) {
    markerLine = `OPEN (unreadable instant "${instant}" — read as open)`;
    open = true;
  } else if (since < STALE_MS) {
    markerLine = `OPEN ${age(since)} (${marker})`;
    open = true;
  } else {
    markerLine = `STALE ${age(since)} (${marker}) — treated as clear`;
  }
}

const state = text.match(/^slice-state:\s*(.*)$/m)?.[1]?.trim() ?? 'unstated';
const phase = text.match(/^phase:\s*(.*)$/m)?.[1]?.trim() ?? 'unstated';

// The whole "Needs the owner" section, through the next heading or the end of
// the file. `(?![\s\S])` is the end of the input and nothing else — a plain `$`
// with the multiline flag would stop at the end of the section's first line and
// miss a question written lower down.
const needsSection =
  text.match(/^## Needs the owner[ \t]*\n([\s\S]*?)(?=\n## |(?![\s\S]))/m)?.[1] ?? '';
// The section needs the owner unless it is ONE line saying "none" (a
// "none — because …" on that line is still none). Any further line stops the session.
const needsLines = needsSection
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('<!--'));
const needsOwner =
  needsLines.length > 0 && !(needsLines.length === 1 && /^(-\s*)?none\b/i.test(needsLines[0]));

// A hold: the advisor chat owes a review or a check before building goes on.
const hold = /^awaiting\b/i.test(phase);

// The reviewer, from the `**Reviewer:**` line of CLAUDE.md. A project with no such line (set up
// before the reviewer rule) reads "not stated" and is not stopped.
let reviewer = 'not stated';
try {
  const line = readFileSync(RULES, 'utf8').match(/^\*\*Reviewer:\*\*\s*(.*)$/m)?.[1]?.trim();
  if (line) {
    if (/^<not yet confirmed/i.test(line)) reviewer = 'not yet confirmed';
    else if (/^interim\b/i.test(line)) reviewer = 'interim';
    else if (/^none\b/i.test(line)) reviewer = 'none';
    else reviewer = 'confirmed';
  }
} catch {
  // no CLAUDE.md beside the state file: not stated
}
const building = state === 'building' || state === 'spec-and-plan';

let verdict = 'GO';
if (open) verdict = 'STOP (another session holds the slice)';
else if (needsOwner || state === 'needs-owner')
  verdict = 'STOP (the slice needs the owner — read "Needs the owner")';
else if (state === 'ready-for-acceptance')
  verdict = 'STOP (ready for the owner\'s acceptance — nothing for a session to do)';
else if (hold && !released)
  verdict = `STOP (a hold stands: ${phase} — released only by the advisor chat)`;
else if (reviewer === 'not yet confirmed' && building)
  verdict = 'STOP (the reviewer is not yet confirmed — no slice is built before it; see docs/REVIEWER.md)';

console.log(`marker: ${markerLine}`);
console.log(`state: ${state}`);
console.log(`phase: ${phase}`);
console.log(`needs-owner: ${needsOwner ? 'yes' : 'no'}`);
console.log(`hold: ${hold ? 'yes' : 'no'}`);
console.log(`reviewer: ${reviewer}`);
console.log(`verdict: ${verdict}`);
process.exit(verdict === 'GO' ? 0 : 2);
