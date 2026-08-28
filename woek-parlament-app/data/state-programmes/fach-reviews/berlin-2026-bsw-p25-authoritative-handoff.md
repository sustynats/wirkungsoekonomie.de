## WÖk FACH BATCH — Berlin BSW physical PDF page 25: digital continuation + health/militarisation section — source repair and finite child residual

Disjoint continuation after P24 comment `5452737343`. Frozen artifact/SHA unchanged: `BE-AGH-2026-BSW-WAHLPROGRAMM` / `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`.

This batch first resolves the physical P24→P25 continuation and then reviews every P25 source atom. No DNS, Recommendation, score, party-wide judgement or generic political conclusion is generated.

### A. Cross-page source repair: P24-U10-A03 + P25-U01-A01

The two stored atoms are a single sentence split at the physical page boundary:
- `BE-BSW-P24-U10-A03-6094823e1bfa`: `Wir unterstützen digitale Angebote, wenn sie den Versorgungsalltag verbessern, z.B. wie die bessere digitale`
- `BE-BSW-P25-U01-A01-918be517716b`: `Vernetzung zwischen stationärer und ambulanter Versorgung.`

Reclassify both originals as:
`SOURCE_UNIT_RECLASSIFIED_VERSIONED / NONCOUNTING_CROSS_PAGE_CONTINUATION_SUPERSEDED`.

Create one deterministic merged source-bound record with exact text:
`Wir unterstützen digitale Angebote, wenn sie den Versorgungsalltag verbessern, z.B. wie die bessere digitale Vernetzung zwischen stationärer und ambulanter Versorgung.`

Fach decision for the merged text:
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- exact reason: the sentence identifies a desired digital interoperability/networking direction but specifies no implementation lever, data/interface standard, actor/accountability, procurement/interoperability architecture, financing, baseline or measurable handoff outcome. “support digital offers” is too indeterminate for an object-specific effect direction; do not turn the policy label into an effect.
- `competence_boundary = MIXED_LAND_PROVIDER_PAYER_FEDERAL_DIGITAL_HEALTH_FRAMEWORK`.

CodeX only supplies the deterministic merged ID; this semantic decision is already bound to the exact merged text.

### B. P25-U01-A02 — digital appointment allocation/documentation + platform-dependency guard

`BE-BSW-P25-U01-A02-9ebda025a46f` combines distinct product/process and governance levers. Mark parent:
`SOURCE_UNIT_RECLASSIFIED_VERSIONED / NONCOUNTING_COMPOUND_PARENT_PENDING_CHILD_IDS`.

Generate deterministic children:
1. digital appointment scheduling/allocation intended to reduce practice workload;
2. digital documentation intended to reduce practice workload;
3. design/procurement/interoperability guard against creating new dependencies on private platforms.

Return exact child IDs/text spans to #240. Do not synthesize child Fach.

### C. Structural heading

`BE-BSW-P25-U02-74d424d63855` — `Gesundheit statt Militarisierung` → `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`.

### D. P25-U03 — health/militarisation text

#### `BE-BSW-P25-U03-A01-3707538b8568` — “Krankenhäuser sind Orte der Heilung, nicht der Aufrüstung.”
`terminal_fach_state = NON_EFFECT_NORMATIVE_HEALTH_SYSTEM_PURPOSE_GUARD_REVIEWED`.
Exact reason: normative framing/end-state criterion; no independent action.

#### `BE-BSW-P25-U03-A02-a6741ef9bf6b` — reject “jede Militarisierung des Gesundheitswesens”
`terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`.
Exact reason: `Militarisierung` is not operationally defined in this atom; no concrete act, budget, training, preparedness, infrastructure or governance object is specified. A blanket direction would collapse potentially different civil-protection, military, emergency-preparedness and capacity effects. Assess concrete measures separately.

#### `BE-BSW-P25-U03-A03-cc9e2987d44b` — Bundeswehr exercises in hospitals + military-shaped civil defence + additional Bundeswehr study places
Three materially distinct objects. Mark parent:
`SOURCE_UNIT_RECLASSIFIED_VERSIONED / NONCOUNTING_COMPOUND_PARENT_PENDING_CHILD_IDS`.
Generate children:
1. reject/stop Bundeswehr exercises in Berlin hospitals;
2. reject/avoid the described military-shaped civil-defence arrangements in the health context;
3. reject/avoid additional Bundeswehr-linked study places.

Competence, preparedness trade-offs, resource effects and protected interests differ. Return exact child IDs/texts; no child Fach synthesis.

#### `BE-BSW-P25-U03-A04-f063b81e546c` — invest instead in civil healthcare + disaster protection + social infrastructure
Three investment domains. Mark parent versioned non-counting; generate children:
1. additional investment in civil healthcare;
2. additional investment in disaster/civil protection;
3. additional investment in social infrastructure.

Each needs its own budget/additionality/alternative-use and outcome path. No blended positive direction.

#### `BE-BSW-P25-U03-A05-823b956dc5d2` — “Kriege werden durch Diplomatie verhindert, nicht durch Aufrüstung.”
`terminal_fach_state = NON_EFFECT_BROAD_CAUSAL_POLITICAL_CLAIM_REVIEWED`.
Exact reason: broad programme-authored causal assertion, not a Berlin policy intervention and not accepted as causal evidence. Preserve as source statement only.

#### `BE-BSW-P25-U03-A06-12010189d586` — strong solidaristic health system as peace policy
`terminal_fach_state = NON_EFFECT_NORMATIVE_CROSS_DOMAIN_FRAME_REVIEWED`.
Exact reason: political/normative linkage, no independent object-specific mechanism beyond the health measures reviewed elsewhere.

### E. P25 result

All clean P25 records are terminal after the cross-page repair. Mechanical/object residual consists only of:
- `P25-U01-A02` → 3 deterministic children;
- `P25-U03-A03` → 3;
- `P25-U03-A04` → 3.

Expected exact new child residual from P25 = **9 children**, subject to deterministic source-span output.

The P24→P25 cross-page merge is Fach-terminal once CodeX materialises its deterministic merged ID; it is **not** an open Fach item.

### CodeX handoff

Extend the same exact-current-main GitHub-only successor ordered for P22→P24:
1. perform P24→P25 cross-page merge exactly as above and preserve superseded fragment lineage;
2. materialise P25 clean decisions;
3. generate the three child sets above and post exact IDs/texts to #240 — no Fach synthesis;
4. remove P25 opaque envelope only after source repair/materialisation; keep exact child residuals; untouched page envelopes then start at P26–P66 = 41;
5. recompute Berlin residual SET-WISE and run all existing residual/Source-vs-View/SamePage/tests/typecheck/lint/build gates.

BSW remains programme-open; Berlin remains `3/12 terminal / 9/12 open`. GitHub-first. **No Vercel Preview/build/deploy/promotion.**
