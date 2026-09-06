# Berlin BSW P22 - authoritative WÖk Fach handoff snapshot

This repository snapshot preserves the complete authoritative GitHub issue-comment bodies consumed by the deterministic materializer. The Fach text below is not paraphrased or regenerated.

- Frozen artifact: BE-AGH-2026-BSW-WAHLPROGRAMM
- Artifact SHA-256: fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675
- Base main before handoff: 130d94a7b4f1ab8d7c6addcd4783123d5d43fdec

## Issue #240 comment 5452887573

- URL: https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5452887573
- Created: 2026-08-28T13:07:12Z
- Updated: 2026-08-28T13:07:12Z
- Author: sustynats

## WÖk FACH BATCH - Berlin BSW physical PDF page 22, part 1: ambulante Versorgung / Arztsitze / Terminzugang (U01-U04)

Fresh continuation after merged PR #319. Authoritative current `main=130d94a7b4f1ab8d7c6addcd4783123d5d43fdec`. Frozen source artefact remains `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`. Physical P1-P21 stay protected terminal. This review supersedes the generic delegated RNAA template only for the exact P22 objects below. No DNS mapping, Recommendation, score or programme-wide judgment.

Current external baselines used only to test competence/mechanism/Additionality, never as party-derived proof:
- G-BA Bedarfsplanungs-Richtlinie: bundesweiter Rahmen; regional deviations and planning levels are explicit parts of the system.
- KV Berlin Bedarfsplan/current opening decisions: Berlin already uses regionalised GP/pediatric planning; 2026 openings exist in specific planning areas. Therefore unequal/local supply can be material, but the programme adjective `überaus kritisch` is not adopted wholesale as an independent fact.
- §95 SGB V: municipalities may found MVZ, including in public-law form; admission remains part of contract-physician regulation.
- 116117 is already a KBV/KV telephone/online/app service; 2025 statistics show high timeliness among booked/eligible requests but materially lower coverage across all incoming search requests. Channel choice is therefore not the same as creating care capacity.

### U01 - structural heading

`BE-BSW-P22-U01-a4d6359e0f28` - `Ärzte vor Ort und schnelle Terminvergabe`
- `terminal_fach_state = NON_EFFECT_CONTEXT_REVIEWED`
- `context_kind = STRUCTURAL_HEADING`

### U02 - local GP/pediatric supply

`BE-BSW-P22-U02-A01-c99a7b50029f` - `Gesundheit darf nicht von der Postleitzahl abhängen.`
- `terminal_fach_state = NON_EFFECT_ACCESS_EQUITY_GOAL_REVIEWED`
- Exact reason: distributional target/guard, no independent intervention. Preserve postcode/district inequality as an evaluation dimension for the following capacity measures.

`BE-BSW-P22-U02-A02-2addf961c9d6` - claim that GP/pediatric basic supply in some districts is `überaus kritisch`.
- `terminal_fach_state = NON_EFFECT_PROBLEM_BASELINE_CLAIM_REVIEWED`
- Exact reason: this is a problem assertion, not a policy action. Current KV planning/opening data support that regional capacity differences and additional supply opportunities exist; the source’s exact severity wording is not independently proven and must not be rendered as established outcome evidence.

`BE-BSW-P22-U02-A03-70a17f93bf74` - sufficient number of GPs/pediatricians in every Kiez.
- `terminal_fach_state = NON_EFFECT_ACCESS_CAPACITY_GOAL_REVIEWED`
- Exact reason: target state without a separate implementation instrument. `Kiez` is also finer than current formal planning areas, so do not equate achievement with plan-level coverage alone.

`BE-BSW-P22-U02-A04-8ebf4ba58b7a` - `Arztsitze ... umverteilt` + new municipal/public primary-care centres.
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- Exact reason: two non-saldierbare mechanisms are overmerged. Preserve parent source ID/text and materialise two deterministic children from the exact clauses below; child stable IDs may be generated mechanically using the existing child-ID convention.

Child `C01 / ARZTSITZ_REDISTRIBUTION`, exact clause: `Arztsitze müssen gezielt umverteilt werden.`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_NEEDS_BASED_ACCESS_REALLOCATION_POTENTIAL / SELF_GOVERNANCE_PROVIDER_SUPPLY_AND_PLANNING_GRANULARITY_DEPENDENT`
- `evidence_level = MEDIUM`
- `competence = GBA_FRAMEWORK_PLUS_KV_LANDESAUSSCHUSS / NOT_UNILATERAL_BERLIN_SENATE_LEVER`
- `A→M→ΔZ`: needs-based seat/planning allocation → more formal capacity options in underprovided planning areas → potential shorter travel/waiting and better local access if seats are actually filled and used.
- Material risks: redistribution can move scarcity rather than add net workforce; formal seat availability may remain vacant; planning-area averages can hide Kiez-level gaps; neighbouring areas may lose access.
- Distribution: district/planning area, mobility, children/parents, chronic patients, low-income households.
- Reality check: filled physician FTE/seats, appointment availability, travel/waiting time, continuity and spillovers to neighbouring areas; plan quota alone is output.

Child `C02 / PUBLIC_PRIMARY_CARE_CENTRES`, exact clause: `neue kommunale beziehungsweise öffentliche Primärversorgungszentren gegründet werden, besonders in den unterversorgten Bezirken.`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_UNDERSERVED_AREA_ACCESS_AND_CAPACITY_POTENTIAL / STAFFING_ZULASSUNG_FINANCING_AND_GOVERNANCE_DEPENDENT`
- `evidence_level = MEDIUM`
- `competence = LAND_OR_MUNICIPAL_PUBLIC_PROVIDER_GOVERNANCE_WITH_SGB_V_ZULASSUNG_AND_SELF_GOVERNANCE_DEPENDENCIES`
- Mechanism: additional public/MVZ-like provider structures can add or stabilise ambulatory capacity where private-practice supply is weak. §95 SGB V establishes a real municipal MVZ pathway; legal existence does not prove staff or capacity additionality.
- Risks: workforce cannibalisation from existing providers, duplicate infrastructure, CAPEX/OPEX burden, weak governance, formal centre opening without net appointment capacity.
- Noncompensation: public ownership/centre count cannot compensate for missing qualified staff, poor quality or inaccessible services.
- Reality check: net additional clinical FTE/appointments, opening/access time, wait/travel, continuity/quality, workforce origin and lifecycle cost.

`BE-BSW-P22-U02-A05-873288cc541d` - `Hausarztquote bei Studienplätzen`.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_LONG_HORIZON_PRIMARY_CARE_WORKFORCE_PIPELINE_POTENTIAL / SELECTION_BINDING_TRAINING_AND_RETENTION_DESIGN_DEPENDENT`
- `evidence_level = MEDIUM_LOW`
- `competence = LAND_HIGHER_EDUCATION_ADMISSION_DESIGN_WITH_FEDERAL_PROFESSIONAL_AND_CAPACITY_FRAMEWORK`
- Mechanism: reserved/conditioned study access can increase the pipeline oriented toward general medicine if selection, training and later binding/retention work.
- Risks/trade-offs: long time lag, selection fairness/equality, opportunity cost of study places, specialty switching, migration after training, bottlenecks in training practices and no guarantee of Kiez-level retention.
- Reality check: entrants → completed training → specialty choice → actual Berlin primary-care FTE → retention/location after 2/5 years. Study-place quota alone is input.

`BE-BSW-P22-U02-A06-3cbf6b56ceec` - reliable entry into care after studying general medicine/pediatrics.
- `terminal_fach_state = NON_EFFECT_WORKFORCE_OUTCOME_GOAL_REVIEWED`
- Exact reason: desired transition/outcome without a separate lever. Use as a pipeline/retention criterion for A05 and later workforce measures; do not double-count.

`BE-BSW-P22-U02-A07-0cd49822c754` - new land-owned primary-care centres in social hotspots/areas threatened by undersupply.
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `role = RESTATEMENT_WITH_TARGETING_REFINEMENT_OF_U02_A04_C02`
- `counts_as_effect_object = false`
- Exact reason: same core public-centre mechanism as A04-C02, refined by land ownership and targeting social hotspots/undersupply risk. Preserve those targeting qualifiers on the active C02 child; no second centre effect count.

### U03 - appointment access / opening hours

`BE-BSW-P22-U03-A01-67b757f3933b` - appointment allocation through 116117 instead of commercial platforms.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_PUBLIC_ACCESS_CHANNEL_AND_EQUITY_POTENTIAL / CAPACITY_NEUTRAL_AND_SELF_GOVERNANCE_DEPENDENT`
- `evidence_level = MEDIUM_FOR_CHANNEL_MECHANISM / NET_ACCESS_OUTCOME_PENDING`
- `competence = KBV_KV_SELF_GOVERNANCE_AND_FEDERAL_SERVICE_FRAME / BERLIN_COOPERATION_ADVOCACY_NOT_SOLE_LEVER`
- Baseline/additionality: 116117 already exists by telephone, online and app and already mediates appointments. Moving more allocation to it may simplify a public channel and reduce dependence on commercial platforms, but does not itself create appointments.
- Risks/trade-offs: reduced channel diversity, call/digital bottlenecks, accessibility issues, displacement rather than added capacity, provider participation constraints.
- Reality check: successful mediation share, wait time, failed searches, phone/digital accessibility, socioeconomic distribution and actual specialist capacity; traffic to 116117 is not outcome.

`BE-BSW-P22-U03-A02-db47aecfbce7` - `telefonische Erreichbarkeit der Arztpraxen muss gewährleistet werden`.
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: service-quality target but no actor, enforceable standard, minimum hours/response threshold, staffing/financing instrument, complaint/enforcement path or relation to existing practice/KV rules is specified. Those fields are necessary before an effect-bearing implementation can be judged; no direction/evidence is inferred from the word `gewährleistet`.

`BE-BSW-P22-U03-A03-aa9709718601` - flexible practice hours to speed specialist access and relieve emergency departments.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_ACCESS_AND_EMERGENCY_DIVERSION_POTENTIAL / STAFFING_WORKLOAD_DEMAND_STEERING_AND_SELF_GOVERNANCE_DEPENDENT`
- `evidence_level = LOW_TO_MEDIUM`
- Mechanism: extended/flexible availability can better match patient demand and potentially shift suitable cases away from EDs; it does not add clinician hours if schedules are merely redistributed.
- Risks: staff workload/burnout, higher operating cost, empty off-peak capacity, reduced daytime access, inappropriate diversion or no effect where total physician capacity is the binding constraint.
- Reality check: appointment availability by time of day, total clinical hours/FTE, wait time, appropriate ED utilisation with attribution guard, staff workload and patient access distribution.

### U04 - rejection of new/acute patients

`BE-BSW-P22-U04-A01-5702b36422c3` - KV Berlin rule to prevent practice rejection of new patients/especially acute cases.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_ACCESS_PROTECTION_POTENTIAL / CAPACITY_TRIAGE_CONTINUITY_AND_RULE_DESIGN_DEPENDENT`
- `evidence_level = LOW_TO_MEDIUM`
- `competence = KV_SELF_GOVERNANCE_WITH_FEDERAL_CONTRACT_PHYSICIAN_RULES / SOURCE_NAMES_KV_NOT_DIRECT_SENATE_COMMAND`
- Mechanism: a sufficiently precise acceptance/triage rule can reduce avoidable access refusal, especially for acute needs.
- Hard safeguards: clinical urgency/triage, safe capacity limits, continuity, emergency referral, provider workload and enforceable exception/complaint rules.
- Risks: nominal acceptance with excessive waiting, unsafe overload, displacement of existing patients, administrative burden and gaming.
- Reality check: refusal/complaint rates, time to clinically appropriate care, safety events, workload, continuity and distribution by patient group.

### Part-1 status

`BE_BSW_P22_U01_U04_FACH_COMPLETE = PASS_SOURCE_BOUND`

Do not close P22 yet. U05-U09 remain for the disjoint continuation. Generic delegated RNAA for these exact U01-U04 records is superseded by this handoff. All directions are ex-ante potential assessments, not endorsements or recommendations.

---

## Issue #240 comment 5452894797

- URL: https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5452894797
- Created: 2026-08-28T13:07:54Z
- Updated: 2026-08-28T13:07:54Z
- Author: sustynats

## WÖk FACH BATCH - Berlin BSW P22, part 2: Praxisteams / MFA / Fallmanagement (U05-U07)

Disjoint continuation of P22 part 1 `5452887573`. Same frozen artefact and current main. This batch reviews only U05-U07. Existing generic delegated RNAA is superseded only for the exact objects below. No DNS mapping, Recommendation, score or party-wide judgment.

### U05 - structural heading

`BE-BSW-P22-U05-77bd253d8b1d` - `Starke Praxisteams bilden`
- `terminal_fach_state = NON_EFFECT_CONTEXT_REVIEWED`
- `context_kind = STRUCTURAL_HEADING`

### U06 - multiprofessional primary-care teams

`BE-BSW-P22-U06-A01-e042977c45a1` - `Die Hausarztpraxis der Zukunft ist ein Teamprojekt.`
- `terminal_fach_state = NON_EFFECT_SYSTEM_DESIGN_FRAME_REVIEWED`
- Exact reason: design frame/rationale for the following team instruments, not an independent intervention.

`BE-BSW-P22-U06-A02-e49235cab409` - multiprofessional structures intended to relieve GPs and create more patient time.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_TEAM_BASED_CARE_AND_PHYSICIAN_TIME_CAPACITY_POTENTIAL / ROLE_REIMBURSEMENT_WORKFORCE_AND_INTEGRATION_DEPENDENT`
- `evidence_level = MEDIUM`
- `A→M→ΔZ`: defined team roles/delegation → appropriate non-physician tasks move from physicians to qualified team members → potential increase in physician time for complex/medical work and improved access/continuity.
- Material omissions: exact professions/tasks, reimbursement, supervision, training, liability, information systems, staffing availability and whether total team capacity is additional rather than shifted from other care settings.
- Risks/trade-offs: role ambiguity, fragmentation, unsafe task transfer, documentation burden, new bottlenecks in scarce non-physician professions, physician time savings not translating into additional patient access.
- Competence: `MIXED_FEDERAL_GKV_SELF_GOVERNANCE_PROFESSIONAL_SCOPE_AND_LAND_WORKFORCE_SUPPORT`; do not render as a single unilateral Berlin lever.
- Distribution: complex/chronic patients, older people, homebound patients, practices in underserved areas, staff groups.
- Reality check: physician time allocation, team FTE, appointment access, continuity, patient-reported coordination, safety/quality and staff retention; number of professions in the team is output.

`BE-BSW-P22-U06-A03-4d1881f7bf2b` - qualified non-physician staff independently conduct home visits or accompany chronically ill/highly aged people.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_HOME_BASED_ACCESS_CONTINUITY_AND_PHYSICIAN_RELIEF_POTENTIAL / SCOPE_TRAINING_SUPERVISION_LIABILITY_AND_REIMBURSEMENT_DEPENDENT`
- `evidence_level = MEDIUM`
- Mechanism: qualified delegated/substituted home-based tasks can reduce mobility/access barriers, identify needs earlier and free physician capacity for tasks requiring medical qualification.
- Hard safeguards: legally permitted scope, training, escalation/supervision, documentation/data protection, liability, emergency recognition and adequate reimbursement.
- Risks: under-supervision, duplicative visits, unmet medical need being shifted rather than treated, staff scarcity and travel-time burden.
- Distribution: homebound, older, chronic/multimorbid people, carers, peripheral/underserved areas.
- Reality check: completed appropriate home visits, escalation quality, avoidable care gaps/crises with attribution guard, patient/carer burden, physician capacity and adverse events.

### U07 - MFA career/role architecture and case management

`BE-BSW-P22-U07-A01-ac6e7aa6dd52` - `Für medizinische Fachangestellte brauchen wir eine Karriereoffensive.`
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: `Karriereoffensive` is a programme label without an independently specified instrument, funding rule, training pathway, legal change or employer/tariff action. The concrete components in A02 are reviewed separately; A01 must not receive a duplicate effect direction.

`BE-BSW-P22-U07-A02-18b00148d452` - better pay + clear advancement + more responsibility + reliable legal framework.
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- Exact reason: four materially different levers are overmerged. The source’s causal wording `Nur durch ... werden diese Berufe attraktiv` is not accepted as a proven exclusive causal claim. Preserve parent and materialise four deterministic children from the exact component phrases:

Child `C01 / BETTER_PAY`, exact phrase `bessere Bezahlung`.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_RECRUITMENT_RETENTION_AND_JOB_ATTRACTIVENESS_POTENTIAL / PAY_INCIDENCE_AND_FINANCING_DEPENDENT`
- `evidence_level = MEDIUM`
- Mechanism: higher effective remuneration can improve recruitment/retention and reduce exit pressure where pay is a binding job-quality factor.
- Competence: `MIXED_EMPLOYER_TARIFF_GKV_REIMBURSEMENT_AND_POLICY_FRAME`; exact payer/financing path is omitted.
- Risks: cost pass-through without staffing gain, compression with other roles, provider-financing stress, pay not addressing workload/conditions.
- Reality check: real pay, vacancies, applications, turnover/retention, working hours and provider cost/incidence.

Child `C02 / CAREER_PATHS`, exact phrase `klare Aufstiegsmöglichkeiten`.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_SKILL_DEVELOPMENT_AND_RETENTION_POTENTIAL / QUALIFICATION_PATHWAY_AND_EMPLOYER_DEMAND_DEPENDENT`
- `evidence_level = LOW_TO_MEDIUM`
- Mechanism: transparent qualification/career ladders can strengthen skills and retention if higher roles are actually available and compensated.
- Omissions: qualification standards, providers, recognition, time/cost, role destination and remuneration linkage.
- Risks: credentials without role/pay change, access inequality, training burden and poaching between providers.
- Reality check: uptake/completion, role progression, retention, pay/responsibility change and patient-care capability.

Child `C03 / MORE_RESPONSIBILITY`, exact phrase `mehr Verantwortung`.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_TASK_SHIFTING_AND_CAREER_POTENTIAL / QUALIFICATION_SCOPE_SAFETY_AND_ACCOUNTABILITY_DEPENDENT`
- `evidence_level = MEDIUM`
- Mechanism: expanded responsibilities can increase team capacity and professional development when matched to qualification and clear escalation.
- Risks: responsibility without authority/pay/training, unsafe scope expansion, liability ambiguity, physician oversight burden.
- Noncompensation: efficiency/time gains cannot compensate for patient-safety or professional-scope violations.
- Reality check: exact delegated tasks, competency/safety outcomes, workload, retention and physician/patient access effects.

Child `C04 / LEGAL_FRAMEWORK`, exact phrase `verlässliche rechtliche Rahmenbedingungen`.
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: no legal norm, competence level, scope change, liability rule, delegation/substitution boundary or proposed statutory wording is identified. `Legal certainty` is a goal/design condition until the concrete rule delta exists.

`BE-BSW-P22-U07-A03-736a81fe58bc` - professional case management with fixed contacts for very old/chronic/care-dependent patients.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_CARE_COORDINATION_CONTINUITY_AND_NAVIGATION_POTENTIAL / STAFFING_DATA_SHARING_AND_SYSTEM_INTEGRATION_DEPENDENT`
- `evidence_level = MEDIUM`
- `A→M→ΔZ`: fixed case-management responsibility → fewer coordination/interface gaps and clearer navigation → potential better continuity, earlier problem resolution and lower patient/carer coordination burden.
- Risks: duplicate case-management structures, new bureaucracy, data-sharing/privacy friction, narrow eligibility, case manager overload and lack of actual downstream services.
- Distribution: highly aged, multimorbid/chronic/care-dependent people and carers; language/disability/digital-access needs.
- Reality check: continuity/follow-up, completed referrals, avoidable interface failures/crises with attribution guard, patient/carer burden, access equity and staff caseload.

`BE-BSW-P22-U07-A04-ad8d751e13b5` - expand existing `successful model projects` Berlin-wide.
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: the model projects are not named or source-bound in this object, their intervention bundle, target population, evaluation design and claimed `success` are unspecified. Without identifying what is scaled, no robust effect object exists. Do not infer the missing programme from neighbouring text or metadata.

`BE-BSW-P22-U07-A05-9e07c982e98a` - other European countries allegedly show such teams work well.
- `terminal_fach_state = NON_EFFECT_BENCHMARK_CLAIM_REVIEWED`
- Exact reason: comparative programme claim, not an intervention and not accepted as evidence without identified comparator/design/outcomes. It may trigger later evidence research but carries no effect count.

`BE-BSW-P22-U07-A06-c73c41d01af5` - `Berlin darf hier nicht länger zurückliegen.`
- `terminal_fach_state = NON_EFFECT_COMPARATIVE_GOAL_FRAME_REVIEWED`
- Exact reason: comparative rhetoric/goal frame, no independent lever or measured outcome.

### Part-2 status

`BE_BSW_P22_U05_U07_FACH_COMPLETE = PASS_SOURCE_BOUND`

Together with part 1, U01-U07 are now terminal. Do not close P22 yet: U08-U09 remain for the final disjoint emergency-care batch. Parent/child roles above are non-saldierbar; CodeX must preserve parents at zero count and count only terminal children/effect leaves.

---

## Issue #240 comment 5452902986

- URL: https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5452902986
- Created: 2026-08-28T13:08:43Z
- Updated: 2026-08-28T13:08:43Z
- Author: sustynats

## WÖk FACH BATCH - Berlin BSW P22, part 3: Notfallversorgung / INZ / Rettungsdienst / AED / Erste Hilfe (U08-U09) + page closure

Final disjoint P22 continuation after parts 1 `5452887573` and 2 `5452894797`. Same frozen artefact and `main=130d94a7b4f1ab8d7c6addcd4783123d5d43fdec`. Current federal baseline matters materially: the 22.04.2026 federal Notfallreform bill already proposes a stronger 116117 acute-care role, digitally networked Integrierte Notfallzentren and a national public-AED registry. Therefore source proposals in the same direction are assessed against this inherited/current reform path rather than against a zero baseline. No DNS mapping, Recommendation, score or party-wide judgment.

### U08 - structural heading

`BE-BSW-P22-U08-671844fbb707` - `Notfallversorgung entlasten`
- `terminal_fach_state = NON_EFFECT_CONTEXT_REVIEWED`
- `context_kind = STRUCTURAL_HEADING`

### U09 - emergency-care objects

`BE-BSW-P22-U09-A01-e7164757ad75` - claim that last winter showed Berlin emergency departments rapidly reaching overload.
- `terminal_fach_state = NON_EFFECT_PROBLEM_BASELINE_CLAIM_REVIEWED`
- Exact reason: problem assertion/context, not an intervention. Do not promote the source wording into an independently proven system baseline without separate utilisation/capacity evidence.

`BE-BSW-P22-U09-A02-8b6105da4cc3` - longer opening hours for Notdienstpraxen/INZ + alternative employment solutions for self-employed pool doctors.
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- Exact reason: two different mechanisms/competence paths are overmerged. Preserve parent and materialise two deterministic children:

Child `C01 / INZ_NOTDIENST_LONGER_HOURS`, exact clause: `Wir wollen Notdienstpraxen wie die Integrierten Notfallzentren (INZ) mit längeren Öffnungszeiten ausbauen.`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_ACUTE_ACCESS_AND_EMERGENCY_DEPARTMENT_DIVERSION_POTENTIAL / FEDERAL_REFORM_SITE_SELECTION_STAFFING_AND_DOUBLE_STRUCTURE_DEPENDENT`
- `evidence_level = MEDIUM`
- Additionality/baseline: federal Notfallreform already proposes networked INZ made up of hospital ED, KV notdienst practice and central triage. Berlin implementation/extension must therefore show additional local access or operating-time benefit rather than claim the architecture as wholly new.
- `A→M→ΔZ`: longer/expanded ambulatory acute-care availability with triage → more suitable cases can be treated outside full ED pathway → potential shorter access and lower avoidable ED load.
- Competence: `FEDERAL_SGB_V_ARCHITECTURE_PLUS_KV_HOSPITAL_AND_LAND_SITE_IMPLEMENTATION`; not a simple unilateral Land lever.
- Risks: parallel/double structures, scarce clinician redistribution, cost escalation, inappropriate diversion, site-access inequality, longer hours without sufficient demand/staff.
- Reality check: appropriate triage and treatment location, ED wait/load with attribution guard, clinical outcomes/safety, staffing, opening utilisation, patient travel/access and full operating cost.

Child `C02 / POOL_DOCTOR_EMPLOYMENT_MODEL`, exact clause: `und uns für alternative Lösungen zur Beschäftigung von selbständigen Poolärzten einsetzen.`
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: `alternative Lösungen` does not identify the employment/contract model, legal status, remuneration, social-insurance/tax treatment, liability, working-time arrangement, responsible actor or relation to existing/federal notdienst structures. No effect direction is robust before that design exists.

`BE-BSW-P22-U09-A03-6047e0632e39` - more protection for emergency staff + enough training places.
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- Exact reason: occupational safety/protection and training-capacity expansion are distinct mechanisms. Preserve parent and split:

Child `C01 / STAFF_PROTECTION`, exact clause: `Rettungskräfte und Personal in den Rettungsstellen brauchen mehr Schutz im Einsatz.`
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: no protection instrument is specified - e.g. staffing/security, police cooperation, physical design, de-escalation training, alarms/equipment, reporting/prosecution support or occupational-safety standard. Without a mechanism and incident baseline, `mehr Schutz` is a goal only.

Child `C02 / TRAINING_PLACES`, exact clause: `Rettungskräfte und Personal in den Rettungsstellen brauchen ausreichend Ausbildungsplätze.`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_EMERGENCY_WORKFORCE_PIPELINE_POTENTIAL / TRAINING_CAPACITY_COMPLETION_AND_RETENTION_DEPENDENT`
- `evidence_level = MEDIUM`
- Baseline: Berlin already operates current Notfallsanitäter training routes; additional places are therefore an expansion/adequacy question, not creation from zero.
- Mechanism: more genuinely additional training capacity → more qualified graduates if instructor/practice capacity and completion hold → potential staffing/resilience gain after lag.
- Risks: instructor/practice bottlenecks, attrition, training-quality dilution, graduates leaving Berlin/sector, places not filled.
- Reality check: funded/offered/filled places, completion, licensure, Berlin retention, vacancy/shift coverage and safety/quality; training-place count alone is pipeline input.

`BE-BSW-P22-U09-A04-f002601dc899` - Berliner Notfallverfügung documenting patient wishes clearly in emergencies.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_WITH_POSITIVE_PATIENT_AUTONOMY_AND_EMERGENCY_INFORMATION_POTENTIAL / LEGAL_VALIDITY_AUTHENTICITY_ACCESS_AND_UPDATE_DEPENDENT`
- `evidence_level = LOW_TO_MEDIUM`
- Mechanism: a standardised, reliably available emergency-wishes record can reduce information loss and improve concordance with patient preferences when patients cannot communicate.
- Competence/legal guard: Berlin can organise forms/workflows/information within its services, but legal effect must remain compatible with federal civil/medical consent rules and existing advance-directive/proxy arrangements; do not render a Berlin form as overriding those rules.
- Risks: stale/ambiguous wishes, false confidence, inaccessible document in emergency, identity/authenticity error, privacy/security, oversimplification of clinical situations.
- Noncompensation: documentation convenience cannot substitute for valid consent, clinical assessment or current patient will.
- Reality check: availability at point of care, validity/currentness, concordance with verified wishes, errors/conflicts, clinician/patient usability and privacy incidents.

`BE-BSW-P22-U09-A05-4b51e67cc6ee` - citywide AED availability + broad training programmes.
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- Exact reason: device accessibility/maintenance and training/capability are complementary but distinct causal levers. Preserve parent and split:

Child `C01 / AED_PUBLIC_ACCESS`, exact clause: `Berlin braucht außerdem flächendeckend Defibrillatoren.`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_EARLY_DEFIBRILLATION_AND_CARDIAC_ARREST_SURVIVAL_POTENTIAL / PLACEMENT_ACCESSIBILITY_MAINTENANCE_AND_DISPATCH_INTEGRATION_DEPENDENT`
- `evidence_level = HIGH_FOR_EARLY_DEFIBRILLATION_MECHANISM`
- Baseline/additionality: federal Notfallreform already plans a national registry of publicly accessible AEDs; Berlin device deployment remains a local availability/placement/accessibility layer, not the registry itself.
- GRC/ERC 2025 evidence-based guidance supports rapid AED use and highly visible/easily accessible public placement; local outcome still depends on proximity/retrieval and functioning devices.
- Risks: poorly targeted placement, locked/inaccessible or unmaintained devices, mapping/registry mismatch, false sense of coverage and opportunity cost.
- Reality check: functioning accessible AED coverage by time-to-retrieval/risk location, dispatch/registry integration, use before EMS arrival, time to defibrillation and survival/neurological outcome with appropriate causality guard.

Child `C02 / AED_TRAINING`, exact clause: `und breit angelegte Schulungsprogramme für deren Einsatz.`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_BYSTANDER_CAPABILITY_AND_AED_USE_POTENTIAL / TRAINING_REACH_RETENTION_AND_REAL_WORLD_RESPONSE_DEPENDENT`
- `evidence_level = MEDIUM_HIGH`
- Mechanism: practical training can improve recognition, confidence and correct early AED/CPR response; training participation is not equivalent to real emergency action.
- Risks: one-off training decay, inequitable reach, overemphasis on device versus CPR/emergency call, low practice refresh.
- Reality check: representative training reach, retained practical skill, bystander CPR/AED use, time to intervention and safety/outcomes.

`BE-BSW-P22-U09-A06-627706c6a880` - first-aid capability already in primary school.
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_EARLY_LIFE_EMERGENCY_CAPABILITY_AND_BYSTANDER_RESPONSE_POTENTIAL / AGE_APPROPRIATE_CURRICULUM_TEACHER_CAPACITY_AND_SKILL_RETENTION_DEPENDENT`
- `evidence_level = MEDIUM`
- Additionality: Berlin is already expanding resuscitation teaching in secondary schools from grade 7; the source specifically extends capability-building into primary school, so the delta must be evaluated as age-appropriate earlier education rather than claiming first-aid education is absent.
- Mechanism: repeated age-appropriate first-aid learning/practice → earlier knowledge/confidence and potentially stronger later bystander response.
- Risks: curriculum/time burden, unsuitable content for age, teacher training/equipment gaps, one-off lessons without retention, unequal school implementation.
- Distribution: all primary pupils including inclusive/special-needs accessibility; school/district implementation capacity.
- Reality check: curriculum coverage, practical skill/retention over time, teacher readiness and later willingness/capability to respond; lesson count alone is output.

### Page-22 terminality and set-wise handoff

Together with parts 1 and 2, every frozen physical-P22 source unit/atom now has an explicit terminal Fach/source role. Five overmerged source atoms are versioned into deterministic child objects; the additional U02-A07 restatement/refinement remains zero-counting and points to the public-primary-care-centre child.

Expected role-domain after deterministic child materialisation (validate SET-WISE; do not force arithmetic if the existing canonical role model differs):
- 29 original P22 source objects including 3 headings: all terminal;
- 12 deterministic child review objects from the five non-saldierbar parent splits;
- 24 active terminal review leaves: 18 `EXPLICIT_FACH_APPROVED` + 6 `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`;
- all remaining P22 records are zero-count structural/context/goal/restatement/parent roles.

`BE_BSW_P22_FACH_COMPLETE = PASS_SOURCE_BOUND`

After lossless materialisation, protected BSW physical scope becomes **P1-P22**. The next untouched physical review envelope begins at **P23** and runs through P66 unless a newer exact #240 handoff closes a subset before write time.

Berlin overall must still remain `3/12` programme-terminal / `9/12` programme-open. Recompute residual SET-WISE; expected page-envelope reduction is exactly P22 removal, but do not create authoritative totals by historical-plus-child arithmetic.

### Cross-batch system guards

- `DNS_REFERENCE = EXACT_REGISTRY_CROSSWALK_PENDING`; no keyword mapping.
- `RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`.
- `STATE_GFA_ENAP_BENCHMARK = NOT_APPLICABLE` for election-programme objects.
- Output/activity/input never equal outcome.
- Problem/source claims are not automatically accepted as independent factual baselines.
- Target alignment is not causality.
- No aggregate party score or recommendation.
- Communication/media effects remain a separate passage-bound layer.

### CodeX handoff

Materialise P22 parts `5452887573`, `5452894797` and this comment losslessly on a fresh branch from exact current main. For each versioned parent, generate deterministic stable child IDs mechanically from the exact child clauses and preserve parent/child/restatement relations; ID generation is technical, not Fach synthesis. Replace generic delegated RNAA only for exact objects covered by these handoffs. Update Berlin/BSW residual and #241 residual SET-WISE. Run all GitHub-side exact-head gates including residual integrity, BSW programme truth, Source-vs-View, same-page navigation, tests/typecheck/lint/build, privacy/link/Golden-State. No Vercel Preview/build/deployment. Post exact new head, P22 role counts and remaining BSW physical envelope back to #240/#241, then continue with P23.

