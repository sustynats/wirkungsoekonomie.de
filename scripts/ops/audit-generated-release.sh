#!/usr/bin/env bash
set -euo pipefail

# A route inventory is derived from the release being built. News imports change
# it independently of a code release. Comparing it with an old committed snapshot
# rejects valid new pages; all semantic and historical-content gates still apply.
release_commit="$(git rev-parse HEAD)"
matrix=content/audits/state-sustainability-architecture-url-matrix
mkdir -p reports
rm -f reports/generated-release-audit.txt
python3 tools/audit_state_sustainability_architecture_fast.py --root . --output "$matrix.json" --markdown "$matrix.md"
python3 tools/audit_state_sustainability_support_files.py --root . --matrix "$matrix.json" --markdown "$matrix.md"
python3 tools/finalize_state_sustainability_matrix.py --root . --matrix "$matrix.json" --markdown "$matrix.md"
python3 tools/check_state_sustainability_architecture.py
python3 tools/check_state_sustainability_wiwi_scope.py
[[ "$(git rev-parse HEAD)" == "$release_commit" ]]
mkdir -p reports
{
  printf 'release_commit=%s\n' "$release_commit"
  printf 'semantic_and_historical_gates=PASS\n'
  python3 -c 'import hashlib,sys; [print(hashlib.sha256(open(p,"rb").read()).hexdigest(),p) for p in sys.argv[1:]]' "$matrix.json" "$matrix.md"
} > reports/generated-release-audit.txt
