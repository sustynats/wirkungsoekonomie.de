# Current-news import recovery, 12 September 2026

Run `34665348578` accepted one regular news story (`wt-e35490f299667146`)
with `staged: false`, `published_stories: 1` and `public_changed: true`.
The later legacy impact import failed while reading Oracle (`store.all`,
truncated HTTP 200 followed by HTTP 502). The failed process never committed
the completed current-news record.

`importBackgroundImpact` now defers only a transport error explicitly marked
retryable and a transient read failure. It retains the already completed
current-news result and records the deferred legacy pass as degraded. Content,
authorization, ownership and write failures are not converted to success.
No editorial approval or publication gate changes.

The run's recovery artifact `news-recovery-34665348578-1` preserves the accepted
record, independent semantic review, sources and generated release images.
The artifact's `data/news/stories.json` SHA-256 is
`6ff27a9d826eac7d93a60d7250b5cf0856ff79e8467a073aa8879a2de12f309f`.
Recovery copies only this accepted whole record into the current catalog,
after comparing the original catalog record's content hash with the immutable
job input. Other records, private drafts and approvals remain unchanged.
The original source date remains 11 September; it is not presented as a new
event on 12 September.

Validation: 1,063 news tests, typecheck and lint passed. Four added tests cover
deferred legacy reads, no invented publication, continued hard gate failures,
and normal successful legacy results. Local mobile (390 px) and desktop
(1,440 px) checks show all three MPD dimensions, categorical status rings,
sharing and the existing system-voice reader. No mobile horizontal overflow.

This change does not repair the Oracle service itself. The prepared paginated
server update still needs installation. Routine processor capability and
actual queue throughput must be verified separately; a recovered publication
is not proof of a healthy automatic hourly service.
