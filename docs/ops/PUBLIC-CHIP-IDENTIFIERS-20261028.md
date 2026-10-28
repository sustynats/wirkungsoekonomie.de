# Public article identifiers in the secret scan - 28 October 2026

The ordinary serial news run `40618944489` stopped before its atomic commit
with `SECRET_PATTERN_FOUND:data/news/stories.json`. The retained recovery ZIP
`12786912230` passed its SHA-256 and ZIP-integrity checks. Its manifest and all
38 referenced parts decode to 15,088 stories without changing any data.

After applying the existing, previously reviewed projection, exactly five
matches remain: the slug of `wt-22212d0a64c1c7eb`, its stern and Tagesspiegel
source URLs, and those same two URLs in their exact `state.seen_items` records.
All are identifiers for the SK Hynix earnings headline, not credentials. The
current registered Tagesspiegel RSS feed independently confirms its complete
URL and headline. The stern identifier is retained in the failed run's source
metadata; it is no longer in the current 20-entry RSS window. No disabled
article fetch, paywall bypass or paid request was used for this diagnosis.

The correction adds only those complete identifiers to the existing scan
projection. Story ID, slug, source ID, full URL, field and deduplication key
remain bound. The credential patterns are byte-identical. Unknown stories,
other fields, changed URLs, query strings, fragments and real key families
remain blocked. Original source/publication/state bytes are never rewritten.

Validation: eight focused tests and all 2,254 news/operations tests pass.
Both projections also pass against the complete verified recovery data, with
identical before/after hashes of the original decoded story store and state.
There were zero provider calls and zero production data writes in this check.

The next ordinary run `40620363616` failed at the same scan. Its recovery ZIP
`12787612274` and encrypted raw-output ZIP `12786629957` are retained unchanged.
The complete second snapshot also passes both corrected scans. It contains one
new V1 for `wt-4c85309b0533c98a` that never reached the atomic commit. Although
the existing offline recovery and deterministic gates accept that snapshot,
the full-text review found an ecological intensity factor of zero justified
by missing information. This is not evidence of zero intensity. The answer
therefore stays in its immutable private archive pending independent review;
it is not restored as a public article or silently rescored.

The native `pendingRecord` path creates the source-bound paid-attempt receipt
for the unchanged candidate. Only its normal quality/attempt hold fields and
explicit recovery provenance enter the canonical store. Its original source
review fingerprints and title match the retained paid packet. The existing
`paidAttemptReceiptStatus` returns `same_paid_input` for both identical evidence
and a feed-clock-only change, preventing a replacement generation. Genuine
changed source evidence remains distinguishable. All unrelated stories and
the entire state file remain equal to the baseline; this record stays pending.
No unpublished answer or new human approval is imported into the final tree.

The existing `recoverUsageReport` path accounts once for that failed run's
19,578 input and 6,451 output tokens, costing USD 0.011657. Historical delivery
counts stay zero because the failed run did not deliver a publication. This is
accounting for actual paid work, not a change to a budget or hourly allowance.
The unchanged retained analysis has SHA-256
`362b8a04988e5c5ff6947290b3736be8636516b1e5a4bd3628df9beacd788b92`.
The prepared repair still requires the ordinary worker and release. The held
answer is not a delivery result, and a green workflow must not claim otherwise.

Before merge, verify every CI gate on the exact current PR head and inspect
new main/bot changes. After merge, use the normal serial worker and ordinary
Pages release to prove processing and actual delivery. A passing local scan
does not constitute deployment or new publication. No Oracle reinstallation,
manual dispatch, quota/model/budget change or Vercel build is required.
