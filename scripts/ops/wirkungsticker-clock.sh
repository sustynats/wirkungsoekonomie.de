#!/usr/bin/env bash
set -euo pipefail

# Oracle only wakes the existing worker. Main, relevance gates, queue and budget
# remain owned by the GitHub workflow. A clock commit never changes main.
clock_repo="${WOEK_CLOCK_REPO:-/var/lib/woek-wirkungsticker-clock/repository.git}"
clock_state="${WOEK_CLOCK_STATE:-/var/lib/woek-wirkungsticker-clock/last-dispatch}"
clock_branch="codex/wirkungsticker-clock"
clock_key="${WOEK_CLOCK_KEY:-/home/ubuntu/.ssh/woek_wirkungsticker_clock}"
clock_known_hosts="${WOEK_CLOCK_KNOWN_HOSTS:-/home/ubuntu/.ssh/woek_clock_known_hosts}"
clock_now="$(date -u +%s)"
export GIT_SSH_COMMAND="ssh -i $clock_key -o UserKnownHostsFile=$clock_known_hosts -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=15"
export GIT_AUTHOR_NAME="wirkungsticker-clock"
export GIT_AUTHOR_EMAIL="wirkungsticker-clock@users.noreply.github.com"
export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"

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
