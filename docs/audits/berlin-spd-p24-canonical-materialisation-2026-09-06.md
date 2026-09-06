# Berlin SPD P24 - canonical source-bound materialisation

Execution origin: clean fresh worktree at current main
`b97eaf1bdc079e44b25d9afc620e212f550540fd`.
No old dirty-worktree changes were imported. The original source checkout was
not modified. Subsequent unrelated main updates are reconciled before merge.

Authority: [#240/5555260265](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5555260265),
with only its explicitly reaffirmed Fach from
[#240/5542647318](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5542647318).
Controller: [#241/5555531118](https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5555531118).
Both full authoritative comments are archived and byte-pinned. Source identity
always comes from the corrected canonical ledger, never the old comment's labels.

## Source and exhaustive coverage

Artifact `BE-AGH-2026-SPD-WAHLPROGRAMM`, canonical PDF SHA-256:
`379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9`.
The actual PDF was hash-verified locally. All ten full source units were
independently reconstructed from their exact PDF block locators with the existing
PyMuPDF canonical-parity extractor. Only layout whitespace/dehyphenation variants
whose hash exactly matches the frozen canonical ledger were accepted.

The committed full-source proof contains exact text, hash, locator and page set
for SU0281-SU0290. The validator covers every source character: reviewed leaves,
punctuation/whitespace delimiters, and two explicitly located grammatical
connectors between the supplied tram-route clauses. Connectors are not Fach
objects and create no semantics or counts.

| Disjoint/set-wise property | Result |
| --- | ---: |
| Canonical source units | 10 |
| Original atoms | 26 |
| Authorized deterministic children/replacements | 32 |
| Total source/review records | 68 |
| Active EXPLICIT_FACH_APPROVED | 16 |
| Active exact RNAA | 20 |
| Zero-count structure/context/version records | 32 |
| Uncovered substantive P24 source ranges | 0 |
| Withdrawn non-source objects in active projection | 0 |

All six withdrawn old-comment objects remain excluded. Compound parents and
malformed fragments preserve their original identities/text and reverse lineage,
but count zero. SU0290 spans P24-P25 and is consumed exactly once.

Protected SPD P1-P23 projection hash:
`d608d4f07a6d6b2b9de84d74aff1ab94717df791e10ef57ab89e0e5866c00022`.
All other Berlin programme projections hash:
`aebac94ba5b6fd510c65512fb49f5bc225d3e34e775a7ba55285643a7bd1842b`.
Tests prove both unchanged from the execution origin. MV/ST Fach and UI code
are unchanged. No DNS, Recommendation, score or party-wide judgement is authored.

## Current residual, recomputed from sets

Berlin remains 4/12 programme-terminal (BSW, DKP, Die PARTEI, SGP), 8 open.
There are 1,191 remaining page-bound review envelopes, not 1,191 known effects.
The total unsegmented effect-object count remains unknown, not zero.
SPD is protected through P24; the next untouched frontier is physical P25,
`BE-SPD-2026-SU-0291`, with remaining physical envelope P25-P66.
P25 Fach is not authorized by this transaction.

Berlin descriptor:
`04e03864e35944488001b4af826c56e7881df822a2819871cd3453f49355cd8f`.
Current combined readiness descriptor:
`73d6d2b90391153c095bd5ec7e9553178d5eb0a5e0f2a72518f4ca727a6252de`.
MV SPD P1-P55 remains protected; P56+ has no new authorization here.

## Verification

Local Node 22.23.2: 307/307 App tests; 19/19 Berlin/P22/P23/P24 integrity and
mutation tests; typecheck; lint; production build; privacy and publication gates;
same-page-navigation gate; impact visual/source fidelity gates; Berlin/MV/ST
validators; issue #241 residual; immutable historical Golden descriptor; current
fail-closed readiness - all passed.
Build-included rendered Source-vs-View audits passed; B07 verifies 240/240 routes
and 17,033/17,033 content paths, with no unrendered content paths.
Exact-head GitHub/browser artifacts and merge SHA are recorded in the PR and
controller issue completion comments rather than asserted before CI completes.

## Release boundary

`BE_SPD_2026_P24_FACH_COMPLETE = PASS_SOURCE_BOUND` applies to this finite page,
not to the SPD programme, Berlin, MV, the combined programme, or Production.
`NO_NEW_VERCEL_BUILD=true`; `PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`.
No Vercel preview, build reservation, deployment or promotion occurred.
