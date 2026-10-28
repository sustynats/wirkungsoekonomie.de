# Public identifiers and retained paid work - 28 October 2026

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

## Paid answers remain held, not regenerated

Subsequent old-commit runs completed four paid calls before failing at the
same unrelated scan. Every recovery ZIP and encrypted raw-output ZIP is
retained unchanged, with verified bytes, SHA-256 and ZIP integrity.

For `wt-4c85309b0533c98a`, three retained answers share the original title,
source-review fingerprints and evidence-excerpt hash. A full-text check found
an ecological intensity factor of zero justified by absent information.
The originals remain private pending independent review. No answer is selected
for publication or silently rescored. The first retained analysis hash is
`362b8a04988e5c5ff6947290b3736be8636516b1e5a4bd3628df9beacd788b92`.

The native `pendingRecord` path creates the source-bound paid-attempt receipt
for the unchanged candidate; it records the three completed attempts and their
immutable provenance. Only normal hold fields and provenance enter the store.
Its original source-review fingerprints and title match the paid packet. The existing
`paidAttemptReceiptStatus` returns `same_paid_input` for both identical evidence
and a feed-clock-only change, preventing a replacement generation. Genuine
changed source evidence remains distinguishable. This record stays pending.

For `wt-0cf9b31cfbe74eb0`, the existing gate already returned
`IMPACT_ZERO_FROM_MISSING_EVIDENCE:planet`. Its native unpublished pending
record, error and one-attempt receipt are preserved from the verified runner;
no answer text or score enters the repository. Only its exact pending ID and
source-bound seen-item record are added to state. Every prior state/dedup entry,
unrelated story and pre-existing usage row is unchanged. No unpublished answer,
personal manuscript, human approval or general historical projection changes.

The existing `recoverUsageReport` path accounts for each completed run once:

| Failed run | Input tokens | Output tokens | Actual USD |
| --- | ---: | ---: | ---: |
| 40620363616 | 19,578 | 6,451 | 0.011657 |
| 40621851691 | 19,575 | 5,854 | 0.009180 |
| 40623305684 | 19,575 | 5,997 | 0.011111 |
| 40624975084 | 17,738 | 5,449 | 0.010086 |

Total actual spending: USD 0.042034. Historical delivery counts stay zero:
the failed runs did not deliver publications. No budget or allowance changes.

## Validation and normal resumption

The final data bundle must pass local integration and every exact-head CI gate.
Technical checks are not a human editorial review or a new publication.
Two jobless pending runs were cancelled before any job started. The existing
monitor independently dispatched another old-commit run; it was left untouched
and its completed work is included above. To prevent further starts during CI,
workflow `348864401` (`wirkungsticker.yml`) is temporarily `disabled_manually`.
Existing requests, locks, serialization, editorial worker, monitor and clock
definitions remain unchanged.

Before merge, verify every CI gate on the exact current PR head and inspect
new main/bot changes. After merge, **enable workflow 348864401**, confirm
`active`, then use its normal serial clock/cron run and ordinary Pages release.
Prove actual scan passage, preserved holds/paid guards and live delivery
separately. A green run is not a new article or substantive result. No Oracle reinstallation,
manual dispatch, quota/model/budget change or Vercel build is required.
