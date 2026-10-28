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

Before merge, verify every CI gate on the exact current PR head and inspect
new main/bot changes. After merge, use the normal serial worker and ordinary
Pages release to prove processing and actual delivery. A passing local scan
does not constitute deployment or new publication. No Oracle reinstallation,
manual dispatch, quota/model/budget change or Vercel build is required.
