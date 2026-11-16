#!/usr/bin/env bash
# Marsadia Build Workflow — put the workflow's files into a project.
#
#   bash <path-to-skill>/scripts/install.sh <project-folder> [plain|technical] [scheduled|continuous]
#
# It copies the templates and the session guard into the project. It never
# overwrites a file that already exists: an existing file is left as it is and
# listed at the end, so nothing of an existing project is lost.
#
# It ends with two questions for the owner, each answered with one word:
#
#   Owner mode — how technical matters reach the owner
#     plain       Claude decides technical matters and reports them; only product decisions,
#                 in plain words, reach the owner.
#     technical   the owner also receives the technical decisions, in technical words.
#
#   Session mode — how the build sessions follow each other
#     scheduled   a session starts at fixed times (every five hours by default).
#     continuous  the next session starts as soon as the last one finishes. The default
#                 when unanswered.
#
# The answers are written into the project's CLAUDE.md. Give the words as arguments (in any
# order) to skip the questions. Run without a keyboard (inside a session), the questions are
# left for Claude to ask.
#
# It does not install spec-kit and does not touch GitHub; references/installation.md
# covers those steps.
set -euo pipefail

usage() {
  echo "usage: bash install.sh <project-folder> [plain|technical] [scheduled|continuous]" >&2
  exit 1
}

[ $# -ge 1 ] || usage

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES="$SKILL_DIR/assets/templates"
TARGET="$1"
shift

OWNER_MODE=""
SESSION_MODE=""
for word in "$@"; do
  case "$word" in
    plain | technical) OWNER_MODE="$word" ;;
    scheduled | continuous) SESSION_MODE="$word" ;;
    *)
      echo "Not one of the four words (plain, technical, scheduled, continuous): $word" >&2
      exit 1
      ;;
  esac
done

if [ ! -d "$TARGET" ]; then
  echo "The project folder does not exist: $TARGET" >&2
  exit 1
fi
TARGET="$(cd "$TARGET" && pwd)"

copied=()
kept=()

copy_one() {
  # copy_one <source file> <path inside the project>
  local src="$1" dest="$TARGET/$2"
  mkdir -p "$(dirname "$dest")"
  if [ -e "$dest" ]; then
    kept+=("$2")
  else
    cp "$src" "$dest"
    copied+=("$2")
  fi
}

# Every template, at the same path inside the project.
while IFS= read -r -d '' file; do
  rel="${file#"$TEMPLATES"/}"
  copy_one "$file" "$rel"
done < <(find "$TEMPLATES" -type f -print0 | sort -z)

# The session guard.
copy_one "$SKILL_DIR/scripts/session-guard.mjs" "scripts/session-guard.mjs"

# A copy of the workflow itself, so every session can read it without the skill.
copy_one "$SKILL_DIR/references/workflow.md" "docs/WORKFLOW.md"

echo
echo "Marsadia Build Workflow — files placed in: $TARGET"
echo
echo "Added (${#copied[@]}):"
for f in "${copied[@]:-}"; do [ -n "$f" ] && echo "  + $f"; done
if [ "${#kept[@]}" -gt 0 ]; then
  echo
  echo "Already there, left untouched (${#kept[@]}) — compare each with the template by hand:"
  for f in "${kept[@]}"; do echo "  = $f   (template: $TEMPLATES/$f)"; done
fi

# ---------------------------------------------------------------------------
# The owner's two settings — one question each, one word each.
# ---------------------------------------------------------------------------
TODAY="$(date +%Y-%m-%d)"

# setting <label> <current value> <word 1> <word 2> <question> <meaning 1> <meaning 2> <if unanswered>
# Asks when a keyboard is attached and no word was given; writes the answer into
# CLAUDE.md where the line is still unanswered.
setting() {
  local label="$1" value="$2" one="$3" two="$4" question="$5" mean_one="$6" mean_two="$7" unanswered_note="$8"
  local marker="**$label:** <not yet answered"
  local file="$TARGET/CLAUDE.md"

  if [ -f "$file" ] && grep -qF "$marker" "$file"; then
    if [ -z "$value" ] && [ -t 0 ]; then
      echo
      echo "A question for the owner — $question"
      printf '  %-11s %s\n' "$one" "$mean_one"
      printf '  %-11s %s\n' "$two" "$mean_two"
      while [ "$value" != "$one" ] && [ "$value" != "$two" ]; do
        printf 'Answer with one word (%s / %s): ' "$one" "$two"
        read -r value || break
      done
    fi
    if [ "$value" = "$one" ] || [ "$value" = "$two" ]; then
      local line="**$label:** $value (the owner's answer, $TODAY)"
      awk -v marker="$marker" -v line="$line" \
        'index($0, marker) == 1 { print line; next } { print }' \
        "$file" > "$file.tmp" && mv "$file.tmp" "$file"
      echo
      echo "$label recorded in CLAUDE.md: $value"
    else
      echo
      echo "$label is not answered yet. Claude asks the owner: \"$question $one or $two?\" $unanswered_note"
    fi
  elif [ -n "$value" ]; then
    echo
    echo "$label ($value) was not written, because CLAUDE.md already carries its own text."
    echo "Add this line to it by hand:   **$label:** $value"
  fi
}

setting "Owner mode" "$OWNER_MODE" plain technical \
  "how should technical matters reach you?" \
  "Claude decides technical matters and reports them afterwards; only decisions about what the product does reach you, in plain words." \
  "you also receive the technical decisions, in technical words, and decide them." \
  "Until then sessions work as plain."

setting "Session mode" "$SESSION_MODE" scheduled continuous \
  "how should the build sessions follow each other?" \
  "a session starts at fixed times, every five hours by default; work can sit idle until the next one." \
  "the next session starts as soon as the last one finishes; no idle time, but the advisor chat must stay active." \
  "Until then the mode is continuous."

echo
echo "Next:"
echo "  1. Fill the angle-bracket placeholders in CLAUDE.md, AGENTS.md and docs/STATE.md."
echo "  2. If spec-kit is not in the project yet:  specify init --here --force --integration claude"
echo "  3. Write the project's rules:  /speckit-constitution  (start from docs/constitution-additions.md)"
echo "  4. Check the guard:  node scripts/session-guard.mjs"
echo "  5. Continue with references/installation.md (GitHub, the reviewer, the scheduled tasks)."
