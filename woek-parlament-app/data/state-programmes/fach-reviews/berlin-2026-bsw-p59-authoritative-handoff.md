## WÖk FACH BATCH - Berlin BSW physical PDF page 59 complete source-bound review + U02-A04 two-child repair

Authoritative continuation after P58 `5458180510`. Frozen artefact remains `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`, physical PDF P59/66. Fresh current `main` immediately before this Fach batch is `2f5d5d896eb1a8e851529a31139bfa57b00eca84` (merged PR #324; technical BSW materialisation through P29). Exact P59 source inventory from the frozen ledger is three source units: structural U01 plus seven atom IDs in U02/U03. Generic delegated/#313 RNAA is not Fach proof and is superseded below. No DNS mapping, Recommendation, score or party-wide judgement.

### Current Berlin baseline / additionality guard

P59 must **not** be assessed against a zero-financing or zero-public-responsibility baseline. Berlin/Lichtenberg has a new two-year contract with Tierheim Berlin effective **01.01.2026** for all Berlin Fundtiere; the district states that the contract improves financing to more than two euros per Berlin resident. The same official source says the regionalised authority also brings animals from official seizures, quarantine/observation and custody situations to Tierheim Berlin. Official source: https://www.berlin.de/ba-lichtenberg/aktuelles/pressemitteilungen/2025/pressemitteilung.1628410.php .

Berlin also updated the fee framework for public animal-care facilities in October 2025 because costs and needs had risen substantially since 2002; the Senate proposal increased transport/daily custody rates and allows administrative fees/expenses. Official source: https://www.berlin.de/rbmskzl/aktuelles/pressemitteilungen/2025/pressemitteilung.1608655.php .

Therefore the relevant delta is **durability, scope, adequacy and allocation of financing**, not invention of public financing from zero. Programme assertions about universal insecurity/overload remain source claims unless independently evidenced.

### U01 - structural heading

`BE-BSW-P59-U01-52a33870afd2` - `Tierheime und Tierschutzorganisationen verlässlich unterstützen`.
- `terminal_fach_state = NON_EFFECT_CONTEXT_REVIEWED`
- `context_kind = STRUCTURAL_HEADING`

### U02 - funding stability / crisis financing

`BE-BSW-P59-U02-A01-7f6998b50632` - statement that shelters/animal-welfare organisations perform indispensable work and operate near capacity limits.
- `terminal_fach_state = NON_EFFECT_SOURCE_DIAGNOSIS_AND_RATIONALE_REVIEWED`
- Exact reason: this is a programme diagnosis/rationale, not an independent intervention. Preserve it as source claim/context; do not render the claimed general degree of overload as independently verified outcome evidence.

`BE-BSW-P59-U02-A02-71c03fe93841` - statement that financing is insecure and mostly donation/short-project dependent.
- `terminal_fach_state = NON_EFFECT_SOURCE_FINANCING_DIAGNOSIS_REVIEWED`
- Exact reason: diagnosis only. Current Berlin already has at least a 2026-2027 Tierheim contract and public custody/fee architecture, so this sentence must not be rendered as a verified universal zero/staccato-financing baseline for every Berlin animal-welfare organisation.

`BE-BSW-P59-U02-A03-df16cc02be7f` - permanent/basic funding so intake, care, prevention and education become plannable.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_ANIMAL_WELFARE_SERVICE_CAPACITY_AND_FINANCING_STABILITY_POTENTIAL / ADDITIONALITY_TARGETING_AND_QUALITY_DEPENDENT`
- `evidence_level = MEDIUM_FOR_STABLE_FINANCING_TO_CAPACITY_MECHANISM / ANIMAL_WELFARE_OUTCOME_PENDING`
- `A→M→ΔZ`: predictable basic funding → lower stop/start financing risk and better staffing/capacity planning → potentially more reliable intake/care/prevention/education and less emergency crowding/deferral.
- Additionality guard: existing Tierheim Berlin public financing/contract is baseline. The relevant effect is any **additional or more durable** coverage, broader eligible organisations/functions, adequate rates or reduced unfunded mandate - not the mere existence of a public payment stream.
- Material omissions: eligible organisations/functions, amount/indexation, duration beyond existing contracts, quality/welfare standards, capacity baseline, co-financing/donation interaction, procurement/zuwendungsrecht, audit and exit/renewal rules.
- Risks/trade-offs: funding may stabilise incumbent capacity without correcting inefficient allocation; fixed funding can lag animal numbers/care complexity; grant administration can itself consume capacity; opportunity cost within Land/district budgets.
- Competence: `LAND_BERLIN_AND_DISTRICT_FUNDING_CONTRACT_ZUWENDUNG_AND_ANIMAL_CUSTODY_GOVERNANCE_WITH_ORGANISATION_SPECIFIC_DELIVERY`.
- Distribution: shelters versus other animal-welfare organisations, species/care complexity, districts, volunteers/workforce and animals requiring long/expensive care.
- Noncompensation: funding volume cannot compensate for inadequate welfare/space/veterinary standards or avoidable length of stay.
- Reality check: funding stability/coverage, staffing/care capacity, refusal/wait/overflow events, length of stay, veterinary/welfare indicators, prevention/education reach, emergency reliance and cost per appropriate care outcome - not euro amount alone.

`BE-BSW-P59-U02-A04-a33034210bec` is semantically compound and must be versioned zero-count, then split deterministically into exactly two source-bound children from the source clauses:

1. exact clause: `Berlin braucht Mehrjahresförderungen statt Projektflickwerk`
   - deterministic child ID/hash: generate mechanically from exact clause; no Fach synthesis during ID generation.
   - `terminal_fach_state = NON_EFFECT_IMPLEMENTATION_REFINEMENT_OF_STABLE_BASE_FINANCING_REVIEWED`
   - Exact reason: multi-year funding is an implementation/duration refinement of the stable basic-financing lever already assessed in `U02-A03`; counting it as a second independent effect would double-count the same financing-stability mechanism. Also preserve current two-year Tierheim contract as a partial existing baseline, so any claimed delta must be duration/scope/coverage-specific.
   - relation: `REFINES = BE-BSW-P59-U02-A03-df16cc02be7f`; zero active-effect count.

2. exact clause: `einen Krisenfonds für Großeinsätze oder Beschlagnahmen`
   - deterministic child ID/hash: generate mechanically from exact clause.
   - `terminal_fach_state = EXPLICIT_FACH_APPROVED`
   - `impact_direction = POSITIVE_SHOCK_RESILIENCE_AND_UNFUNDED_CUSTODY_RISK_BUFFER_POTENTIAL / TRIGGER_ADDITIONALITY_AND_COST_CONTROL_DEPENDENT`
   - `evidence_level = MEDIUM_FOR_CONTINGENCY_FINANCE_TO_RESPONSE_CAPACITY_MECHANISM / EVENT_OUTCOME_PENDING`
   - Mechanism: ring-fenced contingency finance for unusually large/expensive intake events → reduces risk that ordinary shelter budgets/voluntary donations absorb acute state-triggered cost spikes → more resilient lawful care capacity during seizures/major incidents.
   - Existing-baseline guard: official custody arrangements/fees already exist; crisis fund is only additional if it covers residual extraordinary costs/capacity gaps not already reimbursed through contract/fee/legal pathways.
   - Omissions: trigger threshold, eligible cost/species/organisation, payer/administrator, relationship to confiscation owner recovery/fees, cap/replenishment, audit, advance vs reimbursement timing.
   - Risks: duplicate reimbursement, weak trigger design, cost shifting from ordinary budgets, idle earmarks versus underfunded routine care.
   - Competence: `LAND_BERLIN_DISTRICT_BUDGET_AND_CUSTODY_FINANCING_WITH_LEGAL_COST_RECOVERY_DEPENDENCIES`.
   - Reality check: qualified events, time-to-funding, uncovered cost share, care-capacity continuity, animal welfare/safety, duplicate-payment rate and post-event budget disruption.

### U03 - seizure-cost responsibility

`BE-BSW-P59-U03-A01-9c08bbb9cd16` - binding rule for cost assumption after confiscations.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_COST_RESPONSIBILITY_CLARITY_AND_CARE_CAPACITY_POTENTIAL / EXACT_LEGAL_SCOPE_AND_FULL_COST_COVERAGE_DEPENDENT`
- `evidence_level = HIGH_FOR_DIRECT_COST_ALLOCATION_MECHANISM / NET_CAPACITY_AND_WELFARE_OUTCOME_PENDING`
- Mechanism: clearer binding payer/reimbursement responsibility for officially seized animals → less uncompensated/uncertain expenditure and fewer cash-flow disputes for receiving organisations → potentially more stable lawful intake/care capacity.
- Current-baseline guard: Berlin already places seized/custody animals through a public arrangement and has an updated fee/cost framework. The Fach delta is any demonstrated residual ambiguity, coverage gap, reimbursement lag or insufficient cost allocation; do **not** claim current rules contain no public responsibility.
- Omissions: exact legal actor/payer, which seizure grounds and species, full-cost definition, owner recovery, duration, veterinary/special-care costs, dispute/appeal process and timing.
- Risks: cost shifting between Land/districts/owners/organisations; per-day reimbursement can create different incentives than outcome/placement-based capacity management; administrative claims burden.
- Competence: `BERLIN_DISTRICT_ENFORCEMENT_AND_CONTRACT_FEE_BUDGET_GOVERNANCE_WITH_FEDERAL_ANIMAL_WELFARE_PROPERTY_PROCEDURE_BOUNDARIES`.
- Reality check: uncovered expenditure, payment delays/disputes, intake refusals/capacity, length of custody, welfare/medical outcomes, recovery from liable owners where lawful and admin cost.

`BE-BSW-P59-U03-A02-81e12c5fa39f` - claim that responsibility remains with associations while the state watches.
- `terminal_fach_state = NON_EFFECT_SOURCE_PROBLEM_AND_RESPONSIBILITY_FRAME_REVIEWED`
- Exact reason: political diagnosis/rationale, no independent intervention. It is not accepted as a verified description of all current Berlin custody financing given the existing contract/fee framework.

`BE-BSW-P59-U03-A03-6090038e6b31` - `Wer Tierschutz ernst nimmt, muss ihn auch finanzieren.`
- `terminal_fach_state = NON_EFFECT_NORMATIVE_FINANCING_PRINCIPLE_REVIEWED`
- Exact reason: normative principle/restatement of the financing measures above, not a separate lever.

### Page-59 terminality

After lossless materialisation including the exact U02-A04 parent→two-child repair:

`BE_BSW_P59_FACH_COMPLETE = PASS_SOURCE_BOUND_AFTER_U02_A04_REPAIR`

Protected BSW physical Fach scope then becomes **P1-P59**. Next untouched physical Fach page becomes **P60**, leaving **P60-P66 = 7 pages**, unless a newer authoritative #240 handoff closes a subset first. BSW remains programme-open; Berlin remains `3/12 programme-terminal / 9/12 programme-open` until the true nine-programme residual reaches zero.

### CodeX boundary

Fresh technical `main` at Fach-write time is `2f5d5d896eb1a8e851529a31139bfa57b00eca84`, materialised through P29. Re-read exact current main and newest #240/#241 before writing. Consume every still-unmaterialised authoritative BSW handoff **P30→P59 in source order, idempotently and losslessly**. Preserve original source IDs/text/hashes and all current-law/current-programme/source-claim/competence/additionality/noncompensation guards. Create only deterministic splits/repairs explicitly authorised by each page handoff, including exactly the two U02-A04 children above. No technical Fach/DNS/Recommendation/score synthesis.

Recompute Berlin/BSW residual **SET-WISE** and run established Berlin residual integrity, BSW programme truth, #241 residual, Golden-readiness, Source-vs-View, SamePage navigation, tests/typecheck/lint/local production build/privacy/link/accessibility/responsive gates. GitHub-only: `NO_NEW_VERCEL_BUILD=true`; **no Vercel Preview/build/deploy/promotion and no owner-RC request**.
