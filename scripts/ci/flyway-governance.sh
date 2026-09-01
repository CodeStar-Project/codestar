#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Flyway migration governance gate.
#
# Flyway applies each V<n>.sql once and records its checksum. Editing or
# deleting an already-applied migration makes Flyway refuse to start in
# production ("checksum mismatch"). This script enforces, on every PR:
#   1. existing migrations are never modified or deleted (only new ones added)
#   2. version numbers are unique and strictly increasing (no gap / collision)
#
# Usage: flyway-governance.sh [BASE_REF]
#   BASE_REF defaults to $BASE_REF env, then origin/main.
# Exit: 0 ok · 1 violation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

MIG_DIR="apps/backend/src/main/resources/db/migration"
BASE="${1:-${BASE_REF:-origin/main}}"
fail=0

cd "$(git rev-parse --show-toplevel)"

# Resolve base; if unknown (e.g. shallow clone), skip the diff-based check.
if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  echo "! base ref '$BASE' not found — skipping modified/deleted check"
else
  echo "==> Checking migrations against $BASE"
  # Status of migration files between base and HEAD: A=added M=modified D=deleted R=renamed
  while IFS=$'\t' read -r status path rest; do
    [ -z "$status" ] && continue
    case "$status" in
      M*) echo "✗ Modified an existing migration: $path (forbidden — add a new V### instead)"; fail=1 ;;
      D*) echo "✗ Deleted an existing migration: $path (forbidden)"; fail=1 ;;
      R*) echo "✗ Renamed an existing migration: $path -> $rest (forbidden)"; fail=1 ;;
      A*) echo "  + new migration: $path" ;;
    esac
  done < <(git diff --name-status "$BASE"...HEAD -- "$MIG_DIR")
fi

# Numbering integrity on the current tree: unique + contiguous (V001, V002, …).
echo "==> Checking version numbering"
nums="$(ls "$MIG_DIR" 2>/dev/null | grep -oE '^V[0-9]+' | grep -oE '[0-9]+' | sed 's/^0*//;s/^$/0/' | sort -n || true)"
if [ -n "$nums" ]; then
  dups="$(echo "$nums" | uniq -d)"
  if [ -n "$dups" ]; then echo "✗ Duplicate migration version(s): $dups"; fail=1; fi
  expected=1
  for n in $nums; do
    if [ "$n" -ne "$expected" ]; then
      echo "✗ Non-contiguous numbering: expected V$(printf '%03d' "$expected"), found V$(printf '%03d' "$n")"
      fail=1; break
    fi
    expected=$((expected + 1))
  done
fi

if [ "$fail" -eq 0 ]; then echo "✓ Flyway governance OK"; fi
exit "$fail"
