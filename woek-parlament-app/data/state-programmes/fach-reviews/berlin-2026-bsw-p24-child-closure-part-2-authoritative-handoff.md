## WÖk FACH CLOSURE — Berlin BSW P24 deterministic children, part 2 / page-child closure

Continuation of P24 child part 1 `5457221577`; same frozen artifact and #323 deterministic IDs. No DNS, Recommendation, score, party-wide judgement or voter-facing recommendation.

7. `BE-BSW-P24-U04-A04-C01-dc1c10b1f67d` — outreach medical care access for homeless people
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_LOW_THRESHOLD_MEDICAL_ACCESS_AND_EARLY_TREATMENT_POTENTIAL / WORKFORCE_TRUST_REFERRAL_AND_FOLLOWUP_DEPENDENT`
- `evidence_level = MEDIUM_HIGH_FOR_OUTREACH_ACCESS_MECHANISM / HEALTH_OUTCOME_PENDING`
- Competence: `MIXED_LAND_DISTRICT_PUBLIC_HEALTH_PROVIDER_AND_PAYER_DELIVERY`.
- Reality check: reached previously unmet need, completed referrals, continuity, appropriate emergency-use delta, clinical/safety outcomes and social-service linkage.

8. `BE-BSW-P24-U04-A04-C02-f1f75c0199d1` — outreach mental-health care access for homeless people
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_LOW_THRESHOLD_MENTAL_HEALTH_AND_CRISIS_PREVENTION_POTENTIAL / SPECIALIST_CAPACITY_CONSENT_SAFEGUARD_AND_CONTINUITY_DEPENDENT`
- `evidence_level = MEDIUM_FOR_OUTREACH_ENGAGEMENT_MECHANISM / OUTCOME_PENDING`
- Risks: coercive or poorly integrated outreach, insufficient downstream capacity, discontinuity, confidentiality/safety failures.
- Noncompensation: reduced visible public-space crisis cannot substitute for autonomy, appropriate care and rights.
- Reality check: engagement, indicated follow-up, crisis recurrence, continuity, patient-reported outcomes and safeguarding.

9. `BE-BSW-P24-U06-A03-C01-667d363fbf96` — family-friendly working conditions
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_WORKFORCE_RETENTION_REENTRY_AND_SCHEDULE_SUSTAINABILITY_POTENTIAL / COVERAGE_AND_TEAM_EQUITY_DEPENDENT`
- `evidence_level = MEDIUM_FOR_RETENTION_AND_PARTICIPATION_MECHANISM / NET_CAPACITY_PENDING`
- Risks: flexibility shifted to colleagues, uncovered shifts, career penalties, nominal policy without usable scheduling/childcare conditions.
- Reality check: retention/re-entry, working hours/FTE, roster stability, overtime, career/pay distribution and service coverage.

10. `BE-BSW-P24-U06-A03-C02-46db2e7de34a` — make tariff-bound salaries refinancable
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_FAIR_PAY_FINANCING_AND_PROVIDER_STABILITY_POTENTIAL / TARIFF_SCOPE_PAYMENT_DESIGN_AND_COST_PASS_THROUGH_DEPENDENT`
- `evidence_level = HIGH_FOR_FINANCING_TO_PAYABILITY_MECHANISM / NET_WORKFORCE_OUTCOME_PENDING`
- Competence: `MIXED_PAYER_FEDERAL_LAND_PROVIDER_AND_COLLECTIVE_AGREEMENT_FINANCING`.
- Risks: weak cost controls, unequal provider treatment, cost shifting, payment increase without wage pass-through/capacity gain.
- Reality check: verified pay pass-through, provider stability, staffing/retention, service prices/public spending, capacity and quality.

11. `BE-BSW-P24-U08-A01-C01-12e88f3b4492` — ÖGD personnel capacity
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_PUBLIC_HEALTH_DELIVERY_AND_RESILIENCE_CAPACITY_POTENTIAL / NET_FTE_SKILL_MIX_AND_RETENTION_DEPENDENT`
- `evidence_level = HIGH_FOR_STAFFING_CAPACITY_MECHANISM / POPULATION_OUTCOME_PENDING`
- Competence: `LAND_DISTRICT_OGD_PERSONNEL_AND_PUBLIC_HEALTH_DELIVERY`.
- Reality check: net filled FTE/skills, vacancy/turnover, response/backlog, service coverage and event/outbreak/prevention performance; authorised posts alone are input.

12. `BE-BSW-P24-U08-A01-C02-07f67e7a184e` — ÖGD financial resources
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_PUBLIC_HEALTH_OPERATIONAL_CAPACITY_POTENTIAL / ADDITIONALITY_ALLOCATION_AND_ABSORPTION_DEPENDENT`
- `evidence_level = HIGH_FOR_RESOURCE_CAPACITY_MECHANISM / OUTCOME_PENDING`
- Risks: funding not aligned to binding bottlenecks, temporary funding cliffs, money without recruitable staff/delivery capacity.
- Reality check: additional usable budget, execution, service/capacity delta, lifecycle commitments and service outcomes.

13. `BE-BSW-P24-U08-A01-C03-c38af7e6fd76` — ÖGD organisational/governance capacity
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = CONDITIONAL_POSITIVE_PUBLIC_HEALTH_COORDINATION_AND_DELIVERY_POTENTIAL / ORGANISATIONAL_DESIGN_UNSPECIFIED`
- `evidence_level = LOW_TO_MEDIUM / GOVERNANCE_MECHANISM_PLAUSIBLE / EXACT_DELTA_PENDING`
- Why assessable: within the explicit demand to strengthen the ÖGD, organisational capability is a distinct governance lever; the missing redesign limits confidence rather than erasing the lever.
- Risks: reorganisation without capacity gain, added hierarchy/coordination burden, unclear Land-district accountability.
- Reality check: decision/response times, handoff clarity, duplication, surge coordination, staff burden and service performance before/after the actual design.

### P24 child terminality

Together with `5457221577`, all **13** P24 child objects that were still `GENUINE_FACH_REVIEW_REQUIRED` after #323 are now source-bound Fach-terminal. The 14th deterministic P24 child (`BE-BSW-P24-U02-A02-C01-78ef3b8412f2`) was already terminal `NON_EFFECT_PROBLEM_CLAIM_REVIEWED` and must remain unchanged.

`BE_BSW_P24_CHILD_FACH_RESIDUAL = 0`

CodeX: materialize both P24 closure comments losslessly, preserve #323 parent/child/source-span/hash lineage, and recompute residual SET-WISE. Do not reopen P1–P23 or clean/merged P24 records. No Vercel.
