# Public artifact JSON whitespace

The normal Pages release retains the existing 950 MiB hard size gate. A release
on 21 October 2026 reached that gate; a subsequent normal data release passed at
948.8 MiB. Passing once does not establish sufficient capacity for future news.

`compact-public-runtime-json.mjs` runs at the end of `build:artifact`, before the
existing artifact checks. Its fixed allowlist contains only public runtime
catalogs and feeds addressed by stable paths. It removes exactly space, tab,
carriage return and line feed outside JSON strings from their artifact copies.
The routing manifest is deliberately excluded: its existing regeneration gate
requires exact serialized bytes. Neither that file nor that gate changes.

It validates strict UTF-8 and JSON before any write. It does not parse and
reserialize values: every string byte, escape, numeric token, key order and
duplicate key remains unchanged. Symlinks and hard links are rejected. Missing
optional catalogs are skipped. A second pass is a no-op.

Canonical Git sources, approved editorial catalogs, reader HTML, downloads,
hash-addressed shards/manifests, snapshots and search partitions are
not candidates. No historical text, paid answer, source, approval, version or
publication timestamp is removed or regenerated. All existing historical,
privacy, navigation, URL, search and size gates still run.

On 23 October the complete PR build reached 950.4 MiB although a normal
ticker-only release passed at 948.9 MiB. The allowlist therefore also includes
the stable-path public relationship and canvas projections and the two public
glossary/canvas API catalogs with their `index.json` aliases. These are generated
runtime copies, not frozen source snapshots. Only their artifact whitespace is
removed; source files, download originals and hash-bound files remain intact.
This small, bounded recovery must not be described as permanent growth capacity.

This recovers a bounded amount of whitespace, not unlimited capacity. Further
growth must still be monitored. Do not increase the cap or remove publications
to clear it. Large immutable publication assets use the existing GitHub Release
process only after the usual backup, link, integrity and fallback checks.

Rollback: revert the code change and rebuild from canonical Git sources through
the normal release. No source restoration, Oracle installation, manual worker
dispatch, provider call or Vercel build is needed.
