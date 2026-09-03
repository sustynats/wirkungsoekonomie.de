## WÖk FACH BATCH — Berlin BSW P44: Rüstungsansiedlung / Beschäftigtenwechsel / Wirtschafts- und Haushaltsclaims — source-bound terminal review

Disjoint continuation after P43 `5458636824`. Frozen artefact unchanged: `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`, physical PDF P44/66. This page contains unusually many political/causal assertions. **Programme claims are preserved as source text but are not promoted to empirical fact merely by appearing in the programme.** No DNS mapping, Recommendation, score or programme-wide judgement.

### 1. U01 — compound opposition to defence-industry siting + worker-sector mobility

`BE-BSW-P44-U01-A01-9fa687778f7d` combines two distinct mechanisms and must be versioned/split. Parent:

- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- `repair_reason = DEFENCE_INDUSTRY_SITING_POLICY_AND_EMPLOYEE_SECTOR_MOBILITY_ARE_DISTINCT_MECHANISMS`

Create deterministic children from these exact clauses:

**Child A:** `Das Berliner BSW spricht sich vehement gegen die Ansiedlung von Rüstungsbetrieben in der deutschen Hauptstadt aus`

- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- `exact_reason_code = DEFENCE_INDUSTRY_SITING_LEGAL_INSTRUMENT_AND_BOUNDARY_UNSPECIFIED`
- Exact reason: opposition to a sector’s siting is an identifiable political target but the source gives no lawful Berlin instrument (zoning/planning, land disposal, economic promotion exclusion, permitting criterion etc.), no covered activity/definition, no site/capacity baseline and no counterfactual for employment, tax base, civilian opportunity costs, supply/security resilience or neighbouring externalities. A general sector ban cannot be inferred from the statement.

**Child B:** `möchte verhindern, dass Mitarbeiter aus der Zivilwirtschaft in die Kriegswirtschaft wechseln.`

- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- `exact_reason_code = WORKER_MOBILITY_INTERVENTION_AND_LAWFUL_COMPETENCE_UNSPECIFIED`
- Exact reason: the source states a desired labour-flow outcome but no lawful labour-market, retention, wage, training or industrial-policy instrument. Individual occupational mobility, vacancy baselines, skills transfer, worker preferences/rights and the receiving/counterfactual civilian jobs are unspecified. No impact direction may be assigned by inventing a restriction or incentive.

CodeX may generate stable child IDs/hashes mechanically and attach these exact Fach decisions because the decisions are bound to the exact child clauses.

### 2. U02 / U03 — heading and programme-authored factual background

#### `BE-BSW-P44-U02-493cbc0941cb`
- `terminal_fach_state = NON_EFFECT_CONTEXT_REVIEWED`
- `context_kind = STRUCTURAL_HEADING`

#### `BE-BSW-P44-U03-619eed1bbf6c`
- `terminal_fach_state = NON_EFFECT_PROGRAMME_BACKGROUND_CLAIMS_REVIEWED`
- Exact guard: the paragraph’s company/site/conversion/employment assertions are programme-authored background claims. Preserve source/provenance, but do not make them independent effects or verified reality events unless separately checked against primary company/public records. Any later reality display must distinguish `SOURCE_CLAIM` from `VERIFIED_FACT`.

### 3. U04 — economic/industrial-policy assertions are not independent measures

#### `BE-BSW-P44-U04-A01-d74e723833aa`
Source claim: increasing defence production would not counter deindustrialisation.

- `terminal_fach_state = NON_EFFECT_CAUSAL_ECONOMIC_CLAIM_REVIEWED`
- Reason: this is an empirical/causal judgement, not an independently specified Berlin intervention. Do not accept or reject it from party text; testing would require sectoral value added, productivity, labour/capital opportunity cost, import content, security value and counterfactual civilian investment.

#### `BE-BSW-P44-U04-A02-0dc3aed33d43`
Source claim: defence production does not increase welfare/productivity and consumes money better used for future investment.

- `terminal_fach_state = NON_EFFECT_NORMATIVE_AND_CAUSAL_BUDGET_CLAIM_REVIEWED`
- Reason: combines a value judgement and an unspecified public-expenditure counterfactual. No budget line, government level, amount, security benefit/cost or alternative investment portfolio is identified. Do not render `sinnlos` or the claimed zero welfare/productivity effect as fact.

#### `BE-BSW-P44-U04-A03-1d8b1179811e`
Source statement: need for civilian production/investment such as bridges, rail, infrastructure, schools and hospitals.

- `terminal_fach_state = NON_EFFECT_CIVIL_INFRASTRUCTURE_PRIORITY_GOAL_REVIEWED`
- Reason: broad target/priority list without an independent budget, procurement, production or project lever on this page. Concrete infrastructure investment was already assessed on P43; do not double-count this restatement.

### 4. U05 / U06 — heading and Operationsplan-related source claims

#### `BE-BSW-P44-U05-21465599ff1c`
- `terminal_fach_state = NON_EFFECT_CONTEXT_REVIEWED`
- `context_kind = STRUCTURAL_HEADING`

#### `BE-BSW-P44-U06-991a6a1c716c`
- `terminal_fach_state = NON_EFFECT_PROGRAMME_BACKGROUND_AND_CAUSAL_CLAIMS_REVIEWED`
- Exact guard: this paragraph describes/interprets the `Operationsplan Deutschland`, public enterprises, healthcare and administrative preparation. The ledger correctly exposes it as context rather than an independent P44 policy action. Preserve the party’s assertions as source claims; do **not** infer that civil healthcare is being reduced, that a named plan has a claimed causal purpose/effect, or that public-sector preparedness has a specific welfare direction without exact official plan/action evidence. If later linked to actual GovernmentAction/LegalAct/EvidenceEvent objects, verify each claim and effect path separately.

### 5. P44 terminality

After deterministic U01 child materialisation:

- U01 parent: zero-count/versioned; **2 exact children, both terminal RNAA**;
- U02/U05: structural headings terminal non-effect;
- U03/U06: programme background/source-claim contexts terminal non-effect;
- U04 A01–A03: causal/normative/priority claims terminal non-effect.

No genuine P44 Fach residual remains after the two deterministic U01 children are generated and bound to the decisions above.

`BE_BSW_P44_FACH_COMPLETE = PASS_SOURCE_BOUND_WITH_SOURCE_CLAIM_GUARDS`

The next physical Fach scope is P45. BSW remains programme-open; Berlin remains `3/12 programme-terminal / 9/12 programme-open`.

### CodeX handoff

Consume source-order queue through P43 first/idempotently, then P44. Generate U01 child IDs/hashes from the exact clauses and attach the supplied RNAA decisions. Preserve U03/U06 as source-claim context only; do not turn programme assertions into evidence events. Recompute residuals SET-WISE and run established Berlin/BSW/#241/Golden-readiness/Source-vs-View/SamePage/tests/typecheck/lint/build/privacy/link/accessibility/responsive gates. GitHub-only; no Vercel/owner RC.
