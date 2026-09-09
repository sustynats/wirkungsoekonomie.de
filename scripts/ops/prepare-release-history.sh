#!/usr/bin/env bash
set -euo pipefail

# The release checkout remains pinned. Only fetch enough commit history for
# historical-content checks; do not download unrelated binary publication files.
release_commit="$(git rev-parse HEAD)"
for history_depth in 32 128 512; do
  if git merge-base origin/main HEAD >/dev/null 2>&1; then
    [[ "$(git rev-parse HEAD)" == "$release_commit" ]]
    exit 0
  fi
  git fetch --no-tags --filter=blob:none --depth="$history_depth" origin +refs/heads/main:refs/remotes/origin/main
done
git merge-base origin/main HEAD >/dev/null
[[ "$(git rev-parse HEAD)" == "$release_commit" ]]
