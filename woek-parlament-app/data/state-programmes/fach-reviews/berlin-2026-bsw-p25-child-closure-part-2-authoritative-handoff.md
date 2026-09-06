## WÖk FACH CLOSURE - Berlin BSW P25 deterministic children, part 2 / child residual zero

Continuation of `5457240763`; same #323 exact deterministic children.

7. `BE-BSW-P25-U03-A04-C01-c3aac15e1878` - additional investment in civil healthcare
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_CIVIL_HEALTHCARE_CAPACITY_SAFETY_AND_ASSET_QUALITY_POTENTIAL / NEED_PRIORITISATION_STAFFING_ADDITIONALITY_AND_LIFECYCLE_COST_DEPENDENT`
- `evidence_level = HIGH_FOR_CAPITAL_RESOURCE_TO_CAPACITY_MECHANISM / CARE_OUTCOME_PENDING`
- Competence: `LAND_BERLIN_HEALTH_INVESTMENT_AND_PUBLIC_PROVIDER_LEVERS_WITH_FEDERAL_PAYER_PROVIDER_DEPENDENCIES`.
- Mechanism: genuinely additional, need-prioritised investment can improve usable infrastructure/equipment and reduce maintenance/capacity constraints.
- Risks: construction/procurement overruns, stranded/overbuilt capacity, money without staff, operating-cost lock-in, displacement of higher-value maintenance or prevention.
- Noncompensation: investment volume cannot compensate for unsafe care, missing staff or unnecessary assets.
- Reality check: asset condition/availability, usable capacity, accessibility, downtime, lifecycle cost, staffing, quality/safety and patient access.

8. `BE-BSW-P25-U03-A04-C02-642fc0f268fb` - additional investment in disaster/civil protection
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_CRISIS_PREPAREDNESS_REDUNDANCY_AND_RESPONSE_CAPACITY_POTENTIAL / HAZARD_FIT_MAINTENANCE_INTEROPERABILITY_AND_TRAINING_DEPENDENT`
- `evidence_level = HIGH_FOR_CAPABILITY_RESOURCE_MECHANISM / REAL_EVENT_OUTCOME_PENDING`
- Competence: `MIXED_LAND_BERLIN_CIVIL_PROTECTION_FIRE_RESCUE_AND_FEDERAL_CIVIL_DEFENCE_FRAMEWORK`.
- Mechanism: appropriate additional equipment, infrastructure, reserves and capability funding can improve surge/redundancy and response readiness.
- Risks: procurement without staffing/training/maintenance, wrong hazard assumptions, duplicated command/capability, equipment obsolescence, opportunity cost.
- Boundary: inventory and spend are preparedness inputs, not demonstrated resilience.
- Reality check: readiness/availability, exercise performance, response time, redundancy/failure recovery, staffing/training, maintenance and real-event service continuity.

9. `BE-BSW-P25-U03-A04-C03-e7c558578e1d` - additional investment in social infrastructure
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = CONDITIONAL_POSITIVE_SOCIAL_SERVICE_PARTICIPATION_AND_COMMUNITY_CAPACITY_POTENTIAL / TARGET_SCOPE_ADDITIONALITY_AND_LOCAL_NEED_DEPENDENT`
- `evidence_level = LOW_TO_MEDIUM / RESOURCE_TO_SERVICE_CAPACITY_MECHANISM_PLAUSIBLE / DOMAIN_AND_OUTCOME_UNSPECIFIED`
- Why assessable: the child identifies an additional public-investment lever into social infrastructure, but the source does not specify facility/service class, geography, target group or budget; therefore direction is only conditional and confidence limited.
- Risks: broad label hides low-priority projects, capital without operating staff, spatial mismatch, lifecycle/follow-cost and displacement of other high-need uses.
- Reality check: exact funded assets/services, additional usable capacity, staffing/operating funding, utilisation/access distribution, unmet-need change and lifecycle cost.

### P25 child terminality

Together with `5457240763`, all **9** deterministic P25 children that remained open after #323 are now source-bound Fach-terminal. `BE-BSW-P25-U01-A02-C03-40401b1e96f5` is intentionally terminal as a **non-counting design/procurement guard**, not an effect object.

`BE_BSW_P25_CHILD_FACH_RESIDUAL = 0`

Combined with P24 closure comments `5457221577` + `5457228818`:
`BE_BSW_P24_P25_EXACT_CHILD_FACH_RESIDUAL = 0`.

CodeX: materialize all four child-closure comments losslessly on a fresh exact-current-main successor, preserve exact #323 IDs/source text/hashes/spans and parent relations, recompute the Berlin residual SET-WISE, then continue the already-authoritative source-order P26+ queue. Do not synthesize any Fach for later generated children. GitHub-only; no Vercel Preview/build/deploy/promotion and no owner-RC request.
