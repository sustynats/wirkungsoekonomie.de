## WÖk FACH CLOSURE — Berlin BSW P24 deterministic children, part 1

Authoritative continuation after merged PR #323 (`main=b33b88ceaa4b16e892fb87743be32927e37a5c9f`). Frozen artifact: `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`. Exact child IDs/texts are the deterministic source-bound objects from #323. This supplies only the deliberately withheld object-level Fach; no DNS mapping, Recommendation, score, party-wide judgement or voter-facing recommendation.

Fresh baseline: Berlin's Schwerbehinderten-Feststellung is administered by LAGeSo/Versorgungsamt under SGB IX. The official service states that processing time depends, among other things, on completeness and external medical responses. Source: https://www.berlin.de/lageso/behinderung/schwerbehinderung-versorgungsamt/feststellungsverfahren/

1. `BE-BSW-P24-U02-A02-C02-0706beb55deb` — streamline/simplify disability recognition procedure
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_ADMINISTRATIVE_TIMELINESS_AND_ENTITLEMENT_ACCESS_POTENTIAL / MEDICAL_ACCURACY_DUE_PROCESS_AND_EXTERNAL_DEPENDENCY_GUARD`
- `evidence_level = HIGH_FOR_PROCESS_FRICTION_MECHANISM / PARTICIPATION_OUTCOME_PENDING`
- Competence: `LAND_BERLIN_LAGESO_ADMINISTRATION_WITH_FEDERAL_SGB_IX_AND_VERSMEDV_BOUNDARY`.
- Mechanism: fewer avoidable workflow loops and clearer evidence handling can reduce processing burden/time and bring legally available participation protections forward.
- Noncompensation: speed cannot compensate for incorrect GdB/Merkzeichen decisions or loss of effective remedy.
- Reality check: processing-time distribution plus completeness/rework, objection/reversal, accessibility, applicant effort and time to actual entitlement use.

2. `BE-BSW-P24-U02-A03-C01-fdc54977ddd5` — improve working conditions
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_WORK_QUALITY_RETENTION_AND_CARE_CONTINUITY_POTENTIAL / EMPLOYER_DESIGN_WORKFORCE_AND_FINANCING_DEPENDENT`
- `evidence_level = MEDIUM_FOR_WORK_CONDITION_TO_RETENTION_MECHANISM / FACILITY_OUTCOME_PENDING`
- Risks: undefined package, nominal improvement without staffing relief, cost shifting, workforce redistribution without net gain.
- Reality check: vacancies, turnover, absence/overtime, schedule predictability, employee burden, continuity and quality/safety.

3. `BE-BSW-P24-U02-A03-C02-1620c28834f0` — improve remuneration
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_INCOME_FAIRNESS_RECRUITMENT_AND_RETENTION_POTENTIAL / REFINANCING_ADDITIONALITY_AND_LABOUR_SUPPLY_DEPENDENT`
- `evidence_level = HIGH_FOR_DIRECT_INCOME_MECHANISM / NET_STAFFING_AND_CARE_OUTCOME_PENDING`
- Risks: unfunded provider pressure, pass-through to care costs, pay change without staffing/work-condition improvement, sectoral poaching.
- Reality check: actual wage distribution, filled FTE, retention/applications, provider cost, care capacity and quality.

4. `BE-BSW-P24-U04-A02-C01-8a39894ef2b6` — medical support/access
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_MEDICAL_CARE_ACCESS_AND_CONTINUITY_POTENTIAL / CLINICAL_CAPACITY_EVIDENCE_AND_REFERRAL_DEPENDENT`
- `evidence_level = MEDIUM_FOR_ACCESS_MECHANISM / CONDITION_SPECIFIC_OUTCOME_PENDING`
- Boundary: this access assessment does not validate disputed diagnosis or causal attribution elsewhere in the programme.
- Reality check: waiting/travel time, completed appropriate care pathways, unmet need, continuity and safety/quality.

5. `BE-BSW-P24-U04-A02-C02-ef3ab49d0a13` — psychotherapeutic support/access
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_MENTAL_HEALTH_ACCESS_AND_DISTRESS_SUPPORT_POTENTIAL / THERAPY_CAPACITY_INDICATION_AND_CONTINUITY_DEPENDENT`
- `evidence_level = MEDIUM_FOR_ACCESS_MECHANISM / OUTCOME_PENDING`
- Reality check: time to indicated care, completion, functional/distress outcomes, crisis use, dropout and distribution.

6. `BE-BSW-P24-U04-A02-C03-bede2088b2b7` — social-law/benefits support
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_ENTITLEMENT_NAVIGATION_AND_FINANCIAL_SECURITY_POTENTIAL / LEGAL_SCOPE_CASEWORK_AND_BENEFIT_ELIGIBILITY_DEPENDENT`
- `evidence_level = HIGH_FOR_NAVIGATION_TO_ENTITLEMENT_MECHANISM / HOUSEHOLD_OUTCOME_PENDING`
- Boundary: counselling does not create entitlement; success is correct/timely access where legally due.
- Reality check: completed applications/appeals/referrals, processing time, lawful entitlement access and unresolved cases.

This part closes six exact P24 child objects. Remaining P24 child decisions follow separately; recompute only after both parts are present. GitHub-only, no Vercel.
