#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# i18n key-parity gate.
#
# English is the default locale; French ships in v1. A key present in one
# file but missing in the other means a missing or orphan translation.
# This compares the full set of leaf key-paths between en.json and fr.json.
#
# Requires: jq
# Exit: 0 keys match · 1 mismatch
# ─────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
DIR="apps/frontend/messages"
EN="$DIR/en.json"
FR="$DIR/fr.json"

command -v jq >/dev/null || { echo "✗ jq is required"; exit 1; }
[ -f "$EN" ] && [ -f "$FR" ] || { echo "✗ missing $EN or $FR"; exit 1; }

# Leaf key-paths (e.g. nav.signin), sorted.
keys() { jq -r 'paths(scalars) | join(".")' "$1" | sort; }

only_en="$(comm -23 <(keys "$EN") <(keys "$FR"))"
only_fr="$(comm -13 <(keys "$EN") <(keys "$FR"))"

fail=0
if [ -n "$only_en" ]; then
  echo "✗ Keys in en.json missing from fr.json:"; echo "$only_en" | sed 's/^/   /'; fail=1
fi
if [ -n "$only_fr" ]; then
  echo "✗ Keys in fr.json missing from en.json:"; echo "$only_fr" | sed 's/^/   /'; fail=1
fi

if [ "$fail" -eq 0 ]; then echo "✓ i18n parity OK ($(keys "$EN" | wc -l | tr -d ' ') keys)"; fi
exit "$fail"
