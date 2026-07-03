#!/usr/bin/env bash
# Regenerates the public URL list from _site and diffs it against the protected
# baseline (reports/url-baseline.txt). Removed URLs are forbidden unless the
# baseline is intentionally updated. New URLs are printed for review.
# Run AFTER `npm run build && npm run build:artifact`.
set -euo pipefail
cd "$(dirname "$0")/../.."
node scripts/quality/check-url-baseline.mjs
find _site -name '*.html' | sed 's|^_site||; s|/index.html$|/|' | sort -u > /tmp/woek-urls-now.txt
echo "URLs now: $(wc -l < /tmp/woek-urls-now.txt)  baseline: $(wc -l < reports/url-baseline.txt)"
echo "--- removed (must be empty) ---"
comm -23 <(sort -u reports/url-baseline.txt) /tmp/woek-urls-now.txt
echo "--- added (new, review) ---"
comm -13 <(sort -u reports/url-baseline.txt) /tmp/woek-urls-now.txt
