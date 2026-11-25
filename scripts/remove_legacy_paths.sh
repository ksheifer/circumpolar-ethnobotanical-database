#!/usr/bin/env bash
# Run from a local clone of the GitHub repository to remove tracked, obsolete pages.
set -euo pipefail
cd "$(dirname "$0")/.."
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo 'Run this in a Git clone, not an unpacked ZIP.' >&2
  exit 1
fi
git rm -r --ignore-unmatch -- sviridova
if [ -d sviridova ]; then
  echo 'Untracked files still remain under sviridova/: inspect and delete separately.' >&2
  exit 1
fi
echo 'Staged obsolete path deletion. Review: git diff --cached --stat'
echo 'Then commit and push to main.'
