#!/usr/bin/env bash
set -euo pipefail

# Oracle only wakes the existing worker. Main, relevance gates, queue and budget
# remain owned by the GitHub workflow. A clock commit never changes main.
clock_repo="${WOEK_CLOCK_REPO:-/var/lib/woek-wirkungsticker-clock/repository.git}"
clock_state="${WOEK_CLOCK_STATE:-/var/lib/woek-wirkungsticker-clock/last-dispatch}"
clock_branch="codex/wirkungsticker-clock"
if [[ "${WOEK_CLOCK_LANE:-discovery}" == "import" ]]; then
  clock_branch="codex/wirkungsticker-import-clock"
  clock_state="${clock_state}-import"
fi
# Discovery and import wake-ups share one bare Git repository, not a publisher.
exec 9>"${clock_repo}.wake.lock"
flock -w 30 9
clock_key="${WOEK_CLOCK_KEY:-/home/ubuntu/.ssh/woek_wirkungsticker_clock}"
clock_known_hosts="${WOEK_CLOCK_KNOWN_HOSTS:-/home/ubuntu/.ssh/woek_clock_known_hosts}"
clock_now="$(date -u +%s)"
clock_stale_lock_seconds="${WOEK_CLOCK_STALE_LOCK_SECONDS:-900}"
export GIT_SSH_COMMAND="ssh -i $clock_key -o UserKnownHostsFile=$clock_known_hosts -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=15"
export GIT_AUTHOR_NAME="wirkungsticker-clock"
export GIT_AUTHOR_EMAIL="wirkungsticker-clock@users.noreply.github.com"
export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"

recover_stale_git_lock() {
  local lock_name="$1"
  local lock_path="$clock_repo/$lock_name"
  [[ -e "$lock_path" ]] || return 0

  local lock_mtime lock_age archive_dir archive_path
  lock_mtime="$(node -e 'const fs=require("node:fs");try{console.log(Math.floor(fs.statSync(process.argv[1]).mtimeMs/1000))}catch{process.exit(1)}' "$lock_path")"
  if [[ ! "$lock_mtime" =~ ^[0-9]+$ ]]; then
    echo "Cannot determine age of Git lock $lock_path; refusing recovery." >&2
    return 75
  fi
  lock_age=$(( clock_now - lock_mtime ))
  if (( lock_age < 0 || lock_age < clock_stale_lock_seconds )); then
    echo "Git lock $lock_path is only ${lock_age}s old; refusing recovery." >&2
    return 75
  fi
  if command -v fuser >/dev/null 2>&1 && fuser "$lock_path" >/dev/null 2>&1; then
    echo "Git lock $lock_path is held by a process; refusing recovery." >&2
    return 75
  fi

  archive_dir="${clock_repo}.stale-locks"
  archive_path="$archive_dir/${lock_name//\//-}.$clock_now.$$"
  mkdir -p "$archive_dir"
  mv -- "$lock_path" "$archive_path"
  echo "Recovered stale Git lock $lock_path (${lock_age}s old) to $archive_path."
}

# A killed shallow fetch can leave these empty lock files behind. The outer
# wake lock serializes both clock lanes; an additional holder check protects
# manual Git work. Archive old locks instead of deleting them silently.
recover_stale_git_lock "shallow.lock"
recover_stale_git_lock "gc.log.lock"

if [[ "${WOEK_CLOCK_FORCE:-false}" != "true" ]]; then
  if [[ -f "$clock_state" ]]; then
    clock_last_dispatch="$(< "$clock_state")"
    if [[ "$clock_last_dispatch" =~ ^[0-9]+$ ]] && (( clock_now - clock_last_dispatch < 12 * 60 )); then
      echo "Recent Oracle dispatch; no duplicate wake-up."
      exit 0
    fi
  fi
  clock_last_attempt="$(curl --fail --silent --show-error --max-time 15 \
    "https://raw.githubusercontent.com/sustynats/wirkungsoekonomie.de/main/reports/wirkungsticker-latest-run.json?check=$clock_now" \
    | node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{const d=JSON.parse(s);const t=Date.parse(d.started_at);console.log(Number.isFinite(t)?Math.floor(t/1000):0)}catch{console.log(0)}})' || echo 0)"
  if [[ "$clock_last_attempt" =~ ^[0-9]+$ ]] && (( clock_now - clock_last_attempt < 12 * 60 )); then
    # A fresh importer report must not suppress independent availability checks.
    # This branch starts only the monitor, never another paid news analysis.
    clock_branch="codex/ops-monitor-clock"
    echo "Recent Wirkungsticker run; wake monitoring only."
  fi
fi

git --git-dir="$clock_repo" fetch --quiet --no-tags --depth=1 --filter=blob:none origin main
clock_main="$(git --git-dir="$clock_repo" rev-parse FETCH_HEAD)"
clock_tree="$(git --git-dir="$clock_repo" rev-parse "$clock_main^{tree}")"
clock_parent="$clock_main"
if git --git-dir="$clock_repo" ls-remote --exit-code origin "refs/heads/$clock_branch" >/dev/null 2>&1; then
  git --git-dir="$clock_repo" fetch --quiet --no-tags --depth=1 --filter=blob:none origin "$clock_branch"
  clock_parent="$(git --git-dir="$clock_repo" rev-parse FETCH_HEAD)"
fi
clock_commit="$(printf 'chore: Oracle Wirkungsticker wake-up %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  | git --git-dir="$clock_repo" commit-tree "$clock_tree" -p "$clock_parent")"
git --git-dir="$clock_repo" push --quiet origin "$clock_commit:refs/heads/$clock_branch"
printf '%s\n' "$clock_now" > "$clock_state"
echo "Oracle wake-up pushed to $clock_branch: $clock_commit"
