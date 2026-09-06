# Berlin SPD P23 - lossless source-bound materialisation

Fresh clean branch base: `1db5d993bd7149c3c09993bf346f66d6c587a7ee`, the merged MV SPD P55 transaction (#368). No old dirty-worktree changes were imported. This lane follows #241/5540520103 and the P55 closeout #241/5541530345.

## Authority and immutable source

- Exact authority: [#240/5526873010](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5526873010), archived verbatim with one terminal newline.
- Authority file SHA-256: `80764145fdd11f92a702b24afae3efde1eaf85c43a1dba2975f452cc3268f299`.
- Source: `BE-AGH-2026-SPD-WAHLPROGRAMM`, final v4.1, 66 pages, 663,059 bytes.
- PDF SHA-256: `379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9`.
- Historical manifest bytes: `8711be87e5cc9965f78d799451e1c643422f512a4b2a5aa626caf9eb71b934d0`; logical descriptor `cec984d14a19663535b13af55d6bd8ffe1c61ab664c09db43162f09a9bf42de6`.

The entire canonical parity gate passed for 2,042/2,042 historical source hashes. P23/P24 were also rendered and inspected to verify the two-column/cross-page source. Full P23 source text is stored separately because the historical `source_excerpt` field is truncated for long source units. No truncated excerpt is treated as complete text. All full texts match the pre-existing source SHA-256 and locator; source shards and protected P22 Fach remain byte-identical. No source discovery was repeated.

## Exact current P23 set

The materialiser enumerates only the supplied clauses and role decisions, without text classification or Fach synthesis:

| Set | Cardinality |
| --- | ---: |
| Source units SU0266-SU0280 | 15 |
| Original atoms | 39 |
| Exact deterministic children | 20 |
| All terminal records including containers/version parents | 74 |
| Active object-specific RNAA leaves | 34 |
| Reviewed context, goals, continuations, containers and version parents (zero-count) | 40 |
| EXPLICIT_FACH_APPROVED direction judgments in this handoff | 0 |
| P23 residual source objects | 0 |

All non-delimiter source characters are covered by non-overlapping reviewed leaves. The validator records every remaining punctuation/whitespace delimiter separately; no uncovered clause is silently accepted. `SU0268-A01/A02` and `SU0276-A04` are versioned, non-counting parents/fragments with explicit replacement links. Stable child IDs use the established parent/ordinal/SHA-prefix convention. Exact text, full SHA, locators and bidirectional lineage are in `berlin-2026-spd-p23-explicit-v1.json`.

Reasons are the exact supplied prose or the explicitly supplied object-specific reason code where no prose was supplied. The EU-source-claim qualification remains verbatim; no Berlin 20%-area legal obligation is invented. Continuation, goals and expected outcomes are not independent effects. No impact direction, evidence level, DNS, Recommendation, score or party judgment is derived.

`BE_SPD_2026_P23_FACH_COMPLETE = PASS_SOURCE_BOUND_AFTER_LOSSLESS_MATERIALISATION`

## Set-wise residual and preservation

P1-P22 protection is unchanged. The source-order set difference removes P23 and consumes cross-page `SU0280` exactly once. The first remaining canonical source unit is `BE-SPD-2026-SU-0281` on physical P24, not a guessed page increment. The remaining SPD page-envelope set is P24-P66 (43). No SU0281+ Fach was authored or materialised.

Berlin remains 4/12 programme-terminal: BSW, DKP, Die PARTEI, SGP. Its residual is 1,192 page review envelopes; the total number of still-unsegmented effect objects remains unknown, not zero. SPD and Berlin are not programme-terminal.

All 11 other Berlin programme projections and the complete pre-existing SPD terminal projection are protected by exact JSON hashes frozen from the fresh base in the P23 tests. MV P55 remains unchanged and terminal; its protected authored predecessor reconciliation remains a separate technical lane.

## Verification and release boundary

Deterministic generation, independent active-leaf set, source-character coverage, mutation tests (source/reason substitution, omissions, duplicate counting, parent roles, invented Fach), protected P22 and BSW integrity, Berlin/#241/current-readiness gates are required. The production build runs Source-vs-View, SamePage, privacy, public-content and impact gates; the full browser suite checks routes, redirects, search, keyboard/Back/Forward/focus and 320/360/375/390/428/1440.

Exact-head GitHub gate and merge evidence is posted to #240/#241 after the green transaction. The historical Golden release is not overwritten. No Vercel action, reservation, Preview, deployment or promotion is performed. `NO_NEW_VERCEL_BUILD=true`; `PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`.
