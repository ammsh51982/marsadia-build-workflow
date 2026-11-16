#!/usr/bin/env bash
# Marsadia Build Workflow — put the workflow's files into a project.
#
#   bash <path-to-skill>/scripts/install.sh <project-folder>
#
# It copies the templates and the session guard into the project. It never
# overwrites a file that already exists: an existing file is left as it is and
# listed at the end, so nothing of an existing project is lost.
#
# It does not install spec-kit and does not touch GitHub; references/installation.md
# covers those steps.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: bash install.sh <project-folder>" >&2
  exit 1
fi

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES="$SKILL_DIR/assets/templates"
TARGET="$1"

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
echo
echo "Next:"
echo "  1. Fill the angle-bracket placeholders in CLAUDE.md, AGENTS.md and docs/STATE.md."
echo "  2. If spec-kit is not in the project yet:  specify init --here --force --integration claude"
echo "  3. Write the project's rules:  /speckit-constitution  (start from docs/constitution-additions.md)"
echo "  4. Check the guard:  node scripts/session-guard.mjs"
echo "  5. Continue with references/installation.md (GitHub, the reviewer, the scheduled tasks)."
