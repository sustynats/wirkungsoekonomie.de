# Berlin SPD P25 — lossless preparation, exact source-authority stop

## Transaction and authority

- Fresh clean base: `989b903b866ad17b16b18cc0b5f04becaa7787ba`.
- Branch: `codex/berlin-spd-p25-20260906`.
- Execution controller: [#241/5558179043](https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5558179043), read completely.
- Fach authority: [#240/5558175710](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5558175710), archived verbatim in `woek-parlament-app/data/state-programmes/fach-reviews/berlin-2026-spd-p25-authoritative-handoff.md`.
- Snapshot SHA-256: `9889ee1ba703a4f9959fca5f249f9013b586a0f56335f222e5511fe3152d5fa5`.
- Exact source-only packet: [#240/5558090004](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5558090004); never accepted as Fach authority.
- Root/Parliament AGENTS, Publication Contract and newest #238/#240/#241 comments read before changes.

## Completed preparation, not page terminality

All 12 units SU0291–SU0302 and all 29 original atom identities are preserved. The 18 expressly authorised child spans use the established parent + ordinal + exact-text-hash convention. Every supplied clause hash matches. The deterministic JSON retains all authoritative object text and the assessment/quality layers verbatim.

Set-wise prepared inventory:

| Set | Count |
| --- | ---: |
| Source units | 12 |
| Original atoms | 29 |
| Authorised deterministic children | 18 |
| Prepared records | 59 |
| Active EXPLICIT_FACH_APPROVED review leaves | 26 |
| Active exact RNAA review leaves | 9 |
| Non-counting containers/structure/version records | 24 |
| Uncovered non-connector source spans | **1** |

The three compound parents SU0294-A01, SU0298-A01 and SU0299-A06 are zero-count with bidirectional child lineage. SU0302 contains its complete authorised P25→P26 text once; SU0290 and SU0303+ are absent from this batch.

The second SU0299-A06 child has no separately supplied evidence grade. No grade is invented or inherited; its exact approval, conditions and reality-check wording remain present. This is not a second request for new Fach.

## The exact external blocker

> Wir sorgen dafür, dass sie nicht mehr auf Gehwegen genutzt werden können.

- Canonical artifact: `BE-AGH-2026-SPD-WAHLPROGRAMM`, v4.1, 66 pages, 663059 bytes.
- PDF SHA-256: `379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9`.
- Party-primary URL: <https://spd.berlin/media/2026/08/SPD_Berlin_Wahlprogramm_20260521-v4-1.pdf>.
- Physical P25, right-column E-Scooter/Leihräder paragraph.
- Source unit: `BE-SPD-2026-SU-0299`.
- Locator: `p025:b013@304.72,336.55,548.79,559.73`.
- Full-unit SHA-256: `bc5f7f99e0c8f701477e4b534f07ca30b40582d17f97ca87e9f88553d3864d94`.
- Smallest exact range: UTF-16 `[128,201)` in the canonical unit, excluding surrounding spaces.
- Clause SHA-256: `352663d0d94b92249f85d3d5476e3744ebbbe1a43d432ad54f35d5e054a1f0d5`.

Confirmed through exact-hash PDF re-extraction and direct visual examination of P25. The full canonical unit and extractor are unchanged from the accepted P24 commit. The sentence occurs in the full source-only packet, but neither in the 29 legacy atom texts nor in the new Fach handoff. It cannot be silently merged with the separately reviewed parking-station or trip-ending-geofence decisions.

Needed from the WÖk authority: an object-bound supplement for **only this exact clause**, including explicit status/role, its object-specific Fach/reason and authorisation of the exact child span. No existing P25 decision needs to be reopened. No old generic RNAA is admissible.

Evidence already posted in [#240/5559103240](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5559103240) and [#241/5559103770](https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5559103770).

## Gates and unchanged residual

- Deterministic serialization check: PASS.
- P25 regression tests: 6/6 PASS, including mutation tests for stale text, rewritten Fach, fabricated grade, duplicated count, dropped source, false completion and P26 advancement.
- P22/P23/P24/P25 + Berlin residual/combined regressions: 25/25 PASS on Node 22.23.2.
- Berlin Fach, #241 residual, shared current-Golden validators: PASS with the truthful pre-existing nonzero residual.
- Same-page query navigation, cross-page scroll, hash traps and button semantics: PASS.
- P25 terminal admission (`check-berlin-spd-p25.mjs --require-terminal`): **FAIL — SOURCE_AUTHORITY_GAP**, exit 1.

The P25 JSON is deliberately **not admitted** to the public/current Berlin projection or shared Golden descriptors. Those files remain byte-identical. Berlin remains 4/12 programme-terminal with 1,191 physical page review envelopes. SPD retains P25–P66 and the current untouched frontier SU0291. Those envelopes are not a count of effect objects.

Protected SPD P1–P24 projection SHA-256: `eca48473c061f00e17322363bb9b55f82a9bec756ec01f41e613a56c792fbf0f`.
All other Berlin programme projections SHA-256: `aebac94ba5b6fd510c65512fb49f5bc225d3e34e775a7ba55285643a7bd1842b`.
Berlin current descriptor: `04e03864e35944488001b4af826c56e7881df822a2819871cd3453f49355cd8f`.
Shared current-readiness descriptor: `73d6d2b90391153c095bd5ec7e9553178d5eb0a5e0f2a72518f4ca727a6252de`.

The exact-head GitHub workflow must reject terminal admission at the same source gap. A green preparation/integrity test is not a green P25 terminal gate. No merged-main matrix or post-merge frontier proof can truthfully be reported before that blocker is closed and the exact green P25 PR is merged.

## Controller checklist

| Requested item | Current result |
| --- | --- |
| Fresh main and immutable source identity | PASS |
| Lossless supplied Fach / authorised children | PASS for supplied set; exact one-span source gap disclosed |
| Preserve SPD P1–P24, BSW, MV P1–P55 | PASS; no protected data changed |
| P25 source terminal admission | EXTERNAL_BLOCKER: exact WÖk supplement absent |
| Set-wise current residual proof | PASS; P25 remains open, no subtraction |
| Full literal exact-head all-green matrix | NOT_COMPLETE; P25 admission must remain red |
| Fresh-main reconciliation and green-head merge | BLOCKED by missing authority; no merge attempted |
| Merged-main matrix / next frontier proof | NOT_RUN; no P25 merge exists |
| P26 / SU0303+ | UNAUTHORISED, untouched |
| Separate root Pages / #253 | Not imported into this transaction |
| Vercel | NO ACTION; NO_NEW_VERCEL_BUILD=true; PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED |

No live/production completion is claimed. The precise remaining work is a new WÖk decision, not a technical convenience approval or a request to relax a gate.
