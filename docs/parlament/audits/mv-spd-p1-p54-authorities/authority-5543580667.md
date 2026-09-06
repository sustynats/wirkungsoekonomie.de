## WÖk FACH SOURCE-BINDING REPAIR DELTA - MV SPD P53 `SU00495-C02` + canonical heading identities - AUTHORITATIVE

This is the finite source-binding delta required by #240 `5543340788` / #241 `5543349415`. It resolves only the confirmed P53 binding defect and the two heading-text identity mismatches. It does **not** reopen or re-author MV SPD P1-P54.

Fresh controller read immediately before this delta: `main = 394b0ccd35734ce5e0f9b8eefe01e4355b89e172`. This SHA is provenance only; CodeX must re-read/rebase exact-current `main` before continuing because independent commits may move it.

Frozen canonical programme remains:
- artifact `MV-LTW-2026-SPD-REGIERUNGSPROGRAMM`
- SHA-256 `b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc`
- 95 physical PDF pages.

### 1. `MV-SPD-2026-SU-00495-C02` - exact source-binding repair

Parent identity remains:
- parent: `MV-SPD-2026-SU-00495`
- parent SHA-256: `549cb097e5b6961c1026b3d09d74cea3b17b83a756b27ce9e6337f6016fd67ff`
- locator: `p053:sb004@56.78,265.08,541.66,394.87`.

The stale proposed child binding from #240 `5474946653` is **not source-valid** and must not be materialised as current source text:
`Kommunale Energieinfrastruktur ist dabei ein wichtiger Baustein, der Klima- und Daseinsvorsorge miteinander verbindet.`
SHA-256 `b73986b3503e39d59da93a89882a76d0b6f81d9947bfcbee5e43d2fd6ddad9ff`.

The exact contiguous frozen-canonical source span is instead:
`Kommunale Energieinfrastruktur wird zunehmend zu einer strategischen Aufgabe, die Versorgungssicherheit, Klimaschutz und wirtschaftliche Entwicklung verbindet.`

Exact SHA-256:
`800fbf3fffa1976f6bb3ace6110f4b1ea6ad2cfe960cf826ea8600fb82e62598`

Bind **this exact source span/hash** to:
- `terminal_fach_state = NON_EFFECT_SYSTEM_ROLE_AND_GOAL_FRAME_REVIEWED`
- `zero_count = true`
- exact reason: this sentence describes the strategic/system role and desired coherence of municipal energy infrastructure across supply security, climate protection and economic development. It does not itself specify a distinct intervention, instrument, resource allocation, delivery trigger, actor obligation or implementation decision. Therefore it is reviewed context/system-role framing, not a separately countable effect-bearing action.

CodeX may generate the stable replacement child ID mechanically under the repository’s existing deterministic child-ID convention. Preserve/version the stale wrong-source child as superseded/non-current if lineage requires it; **do not reuse its stale source hash/text as current** and do not generate any new Fach semantics.

### 2. `MV-SPD-2026-SU-00496` - canonical heading identity only

Use exact frozen-canonical heading:
`Gutes und bezahlbares Wohnen`

SHA-256:
`52c52569def77a0732ef84619b60d2e7d27ca5b0f292b10344fa739f2678545c`

Preserve intended reviewed role as structural/non-effect context, zero-count. The stale label `Bezahlbares Wohnen und moderne Quartiere` is not a current source identity and must not be written as source text. No new substantive Fach is created.

### 3. `MV-SPD-2026-SU-00499` - canonical heading identity only

Use exact frozen-canonical heading:
`Wohnraum als Daseinsvorsorge in Stadt und Land`

SHA-256:
`6e12088d19a9035493faf599f712b3a9705fee4213dae3522a20c7464f3709c7`

Preserve intended reviewed structural-context role, zero-count. The stale label `Bezahlbares Wohnen und moderne Quartiere` is not a current source identity and must not be written as source text. No new substantive Fach is created.

### 4. Early protected-scope authority-pointer gap - controller clarification

The preflight correctly found that literal object-ID references are absent in the searched #240/#241 snapshots for `SU00001-SU00028`, `SU00033`, `SU00034`, with particular unresolved authority pointers for `SU00010`, `SU00017-SU00022`, `SU00024`, `SU00025`, `SU00028`, `SU00033`.

This absence is **not permission to reopen P1-P54, not a new Fach backlog, and not authority to consume generic delegated RNAA**. Controlling #241 `5542571686` defines the active transaction as reconciliation/materialisation of **already-authored protected P1-P54**; earlier #240 `5472678228` / #241 `5472679906` already protected source-order-authored P1-P38 and the subsequent explicit chain continued through P54.

Required handling:
1. continue backward semantic predecessor-chain recovery from protected P54 `5476819703`, preserving supersession/VOID/cross-page rules;
2. use only recoverable explicit WÖk Fach authority for effect-bearing objects;
3. do not convert a text/hash occurrence, delegated ledger classification, existing score or metadata into Fach authority;
4. if after exhaustive predecessor-chain + approved-stock recovery an exact early object still lacks a recoverable authority pointer, report that **finite pointer set** back to #240/#241 as `PROTECTED_AUTHORED_REFERENCE_UNRESOLVED` in the controller narrative; do not invent a terminal decision, do not recast the whole protected scope as unreviewed, and do not advance the P1-P54 transaction or P56 on that basis.

### 5. Serial / release guard

This delta clears the finite P53 source-text/Fach binding conflict identified in `5543340788` for `SU00495-C02` and gives exact canonical identities for `SU00496` / `SU00499`. It changes no other P1-P54 decision.

Active order remains:
1. finish MV SPD protected-authored P1-P54 lossless technical reconciliation on fresh exact-current main;
2. recompute MV-SPD/MV/#241/shared Golden residuals **SET-WISE** from the exact candidate;
3. exact-head GitHub gates + fresh-main reconcile; merge only green exact head;
4. read fresh merged-main MV residual; **P56 remains unauthorised unless that residual proves it**;
5. Berlin SPD P24 #240 `5542647318` remains queued behind this shared transaction and must rebase after it.

`NO_NEW_VERCEL_BUILD=true`
`PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`

No Vercel Preview/build/deployment/promotion/reservation and no owner-RC request.
