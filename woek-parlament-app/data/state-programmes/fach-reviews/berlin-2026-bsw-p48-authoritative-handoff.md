## WÖk FACH BATCH - Berlin BSW P48: Mobilitätsrahmen · ÖPNV-Ausbau · Seilbahnen · Netzoptimierung/Rufbus · Berlin-Brandenburg-Tarif · Schülerticket · P+R - source-bound review + atomic repairs

Authoritative continuation after P47 `5458802801`. Fresh complete #240 re-read immediately before authoring found **no existing P48 Fach handoff**. Frozen artefact remains `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`, physical PDF P48/66. Exact source IDs/text are bound to `berlin-2026-bsw-v1.json`. Generic delegated/#313 RNAA is not Fach authority and is superseded only for this exact P48 scope. No DNS mapping, Recommendation, score or programme-wide judgement.

### 1. Current mobility baseline / guards

Berlin's outer districts do **not** have a zero-transit baseline. In its 23.06.2026 report on the `letzte Meile`, the Senate states that a dense bus/tram network already provides near-home public-transport access in outer districts and lists existing bike/ÖPNV interchange measures. This does not prove that frequency, travel time or reliability are adequate in every corridor; it means every expansion claim needs a corridor-specific baseline/counterfactual. Source: `https://www.berlin.de/rbmskzl/aktuelles/pressemitteilungen/2026/pressemitteilung.1685011.php`.

The previous BVG Muva on-demand service ended on **28.02.2026**. Since 01.01.2026 the VBB-BAV provides a new barrier-free alternative transport offer for mobility-impaired people when no accessible public-transport route is available. Any new Rufbus/on-demand proposal must therefore distinguish general low-density service from the existing accessibility fallback. Source: `https://www.bvg.de/de/verbindungen/bvg-muva`.

Berlin school students already have a **free VBB Berlin AB student ticket**. A free ticket `in der gesamten Region` is therefore an extension of geographic scope, not a new zero-to-one Berlin benefit. Current VBB information: `https://www.vbb.de/abonnements/schueler/`. VBB fares were adjusted from 01.01.2026, with the stated reason of rising fuel/personnel/investment costs and tight public budgets; affordability and operating/funding capacity must be assessed jointly. Source: `https://www.vbb.de/news/neue-fahrpreise-im-vbb-ab-1-januar-2026/`.

For all P48 transport objects: infrastructure length, vehicles, ticket counts or spending are inputs. Relevant outcomes are door-to-door travel time/reliability, accessibility, safety, induced/suppressed demand, mode shift, capacity/crowding, operating cost/subsidy, land use, local pollution/noise and lifecycle emissions. A benefit for one mode must not silently compensate safety/access losses or material burdens on other users.

### 2. U01 - programme framing / modal-coexistence goals, zero-count

- `BE-BSW-P48-U01-A01-284b755466f4` - `Verkehrspolitik darf nicht spalten`: `NON_EFFECT_NORMATIVE_POLICY_FRAME_REVIEWED`, zero-count.
- `BE-BSW-P48-U01-A02-f5a7ad8b6e2e` - no ideological opposition between car/bike/transit, `vernünftiges Miteinander`: `NON_EFFECT_MODAL_COHERENCE_GOAL_REVIEWED`, zero-count.
- `BE-BSW-P48-U01-A03-eb1521ca39b7` - safe walking + strong transit + reliable cycle network + good car conditions `gehören zusammen`: `NON_EFFECT_MULTI_MODAL_TARGET_STATE_REVIEWED`, zero-count. Preserve safety, reliability, access and cross-mode interactions as evaluation dimensions; do not assume all modal claims can be simultaneously maximised on scarce street space.
- `BE-BSW-P48-U01-A04-06cdde67f23f` - car often indispensable for named groups/outer districts: `NON_EFFECT_ACCESS_AND_DEPENDENCY_DIAGNOSIS_CLAIM_REVIEWED`, zero-count. The statement is plausible for some trips/groups but not promoted to a universal measured baseline; disaggregate by time, trip purpose, disability, household/work pattern and available alternatives.

`BE-BSW-P48-U02-2b263d920996` is already a context unit. Preserve as `NON_EFFECT_PROBLEM_DIAGNOSIS_REVIEWED`: programme claims about slow infrastructure build/congestion/unreliability require corridor-specific evidence and do not themselves count as effects.

`BE-BSW-P48-U03-381203f1f6b4` - heading `Öffentlichen Nahverkehr gezielt ausbauen`: `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`.

### 3. U04 A01/A02 - priority and deficit diagnosis, not independent levers

`BE-BSW-P48-U04-A01-99aec02f9c87` - strengthen public transport, especially outer districts:
- `terminal_fach_state = NON_EFFECT_POLICY_PRIORITY_AND_SPATIAL_GOAL_REVIEWED`
- zero-count; actual route/service/investment decisions below carry effects.

`BE-BSW-P48-U04-A02-dfec33084059` - frequency/access/reliability often insufficient as car alternative:
- `terminal_fach_state = NON_EFFECT_SERVICE_DEFICIT_DIAGNOSIS_CLAIM_REVIEWED`
- zero-count; current Senate baseline says outer-district coverage is broadly dense, so the programme claim must be tested corridor/time-of-day specifically, not accepted or rejected wholesale.

### 4. U04 A03 - compound `U-Bahn, S-Bahn, Straßenbahn und Bus` expansion requires four children

Parent `BE-BSW-P48-U04-A03-e81f62d9b934`:
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- zero-count.
- Generate four deterministic children from exact modal clauses: targeted **U-Bahn** expansion; targeted **S-Bahn** expansion; targeted **Straßenbahn** expansion; targeted **Bus** expansion. Parent text/lineage immutable.

All four children are terminal `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`, with mode-specific competence preserved.

Exact reason shared at this programme granularity: `gezielter Ausbau` supplies no route/corridor, stops, capacity/frequency delta, demand baseline, capital/operating cost, construction/land requirement, alternative-mode comparison or delivery horizon. Those fields determine whether an expansion is high-value, duplicative or cost-ineffective. One positive/negative WÖk direction would therefore be invented.

Competence guards:
- U-Bahn/Bus/Tram: primarily Berlin planning/funding/operator delivery with federal co-funding/regulatory interfaces where applicable;
- S-Bahn: Berlin-Brandenburg/VBB contract and DB/network/operator dependencies, not unilateral Land execution.

Minimum later Reality Check per project: incremental door-to-door accessibility/travel-time/reliability, ridership/capacity/crowding, mode shift, safety/barrier-free access, capex/opex/lifecycle cost, construction/displacement, land/environment and emissions.

### 5. U04 A04 - two named cable-car projects must be split

Parent `BE-BSW-P48-U04-A04-21a1989ffc91` combines two independent build projects: one cable-car line in **Treptow-Köpenick**, one in **Pankow Nord**.

- parent `SOURCE_UNIT_RECLASSIFIED_VERSIONED`, zero-count;
- generate two deterministic children from the exact named project clauses.

Each child:
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: district name alone does not define endpoints/alignment/stations, catchment demand, interchange, capacity/frequency, land/visual/privacy/resident effects, weather/reliability, evacuation/accessibility, capex/opex or comparison with bus/tram/rail. Cable cars can be useful in specific barrier/corridor geometries, but `Seilbahn` is not itself evidence of net benefit.
- Reality check if specified later: time/cost versus best alternative, riders/hour, access/interchanges, reliability/weather, safety/evacuation/barrier-free use, land/visual/privacy impact, energy/lifecycle footprint.

### 6. U04 A05 - integrate cable cars into Berlin public-transport fare/network system

`BE-BSW-P48-U04-A05-104c39b0ec69` - integrate proposed lines and, if possible, existing Gärten-der-Welt cable car into Berlin ÖPNV network:
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_FARE_NETWORK_INTEGRATION_AND_TRANSFER_FRICTION_REDUCTION_POTENTIAL / SERVICE_EXISTENCE_CONTRACT_AND_OPERATING_COST_DEPENDENT`
- `evidence_level = HIGH_FOR_TICKET_NETWORK_INTEGRATION_MECHANISM / RIDERSHIP_AND_NET_COST_OUTCOME_PENDING`
- Mechanism: if a cable-car service exists and is useful for everyday journeys, VBB/ÖPNV integration can reduce separate-ticket/transfer friction and improve multimodal usability.
- Boundary: approval of integration is **not** approval of building the two new lines; their project economics remain RNAA above. For the existing tourist-oriented Gärten-der-Welt line, actual everyday catchment/service suitability and operator contract are separate.
- Competence: Berlin/VBB/operator/contracting parties.
- Distribution: regular commuters, low-income/ticket holders, visitors, nearby residents, people requiring barrier-free interchange.
- Reality check: actual VBB acceptance, fare/subsidy/settlement cost, operating hours/frequency, incremental everyday ridership, interchange time, accessibility and fiscal cost.

### 7. U04 A06/A07 - project-selection principles, not defined projects

`BE-BSW-P48-U04-A06-58a443380aaf` - U-Bahn extensions/gap closures where `klarer Nutzen`/quarter connection:
- `terminal_fach_state = NON_EFFECT_PROJECT_SELECTION_AND_BENEFIT_TEST_GUARD_REVIEWED`
- zero-count. This is a sensible selection condition but names no project; define `klarer Nutzen` through demand, time/access, alternatives, full cost, delivery and externalities before any route gets a Fach direction.

`BE-BSW-P48-U04-A07-68bf517c3fd0` - tram extensions where access improves/gaps close:
- `terminal_fach_state = NON_EFFECT_PROJECT_SELECTION_AND_NETWORK_GAP_GUARD_REVIEWED`
- zero-count for the same reason; no specific corridor/resource shift.

### 8. U05 - service design, on-demand and trolleybus options

#### `BE-BSW-P48-U05-A01-00098694378e` - reorder bus/tram frequencies, routes and transfers to simplify journeys/avoid duplication

- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_NETWORK_SIMPLIFICATION_TRANSFER_AND_OPERATING_EFFICIENCY_POTENTIAL / SERVICE_LOSS_AND_DEMAND_DISTRIBUTION_DEPENDENT`
- `evidence_level = MEDIUM_HIGH_FOR_NETWORK_DESIGN_MECHANISM / CORRIDOR_OUTCOME_PENDING`
- Mechanism: timetable/route/interchange redesign can reduce waiting/transfer friction and duplicated service, potentially reallocating vehicle-hours to higher-value gaps.
- Risks: `Doppelstruktur` may actually provide resilience, capacity or distinct catchments; simplification can worsen access for low-volume/shift/vulnerable users. Optimise passenger journeys, not route-count minimisation.
- Reality check: door-to-door travel/wait/transfer time, missed connections, service kilometres/operating cost, crowding, coverage, reliability and distribution by district/time/user group before/after redesign.

`BE-BSW-P48-U05-A02-7f53a793d737` - flexible complements can play a role:
- `terminal_fach_state = NON_EFFECT_OPTION_SPACE_AND_RATIONALE_REVIEWED`, zero-count; concrete Rufbus/trolleybus objects below carry effects.

#### `BE-BSW-P48-U05-A03-16ed75cf3524` - Rufbus/on-demand for poorly served districts

- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_LOW_DENSITY_ACCESS_AND_FIRST_LAST_MILE_POTENTIAL / DEMAND_POOLING_COST_AND_ACCESSIBILITY_DEPENDENT`
- `evidence_level = MEDIUM_HIGH_FOR_ON_DEMAND_ACCESS_MECHANISM / SERVICE_ECONOMICS_AND_MODE_SHIFT_PENDING`
- Current-baseline guard: do not conflate with former BVG Muva or current VBB-BAV accessibility fallback. This source proposes general low-density service supplementation.
- Mechanism: demand-responsive routing can provide access where fixed high-frequency routes are inefficient; benefit depends on pooling, wait time and operating cost.
- Risks: expensive low occupancy, digital/booking exclusion, unreliable pickup windows, competition with useful fixed services, labour/vehicle costs.
- Reality check: requests served/refused, wait/detour, passengers/vehicle-hour, cost/passenger-km, accessible booking/vehicles, connection success, fixed-route counterfactual and car-trip substitution.

`BE-BSW-P48-U05-A04-dbab479d21f7` - secure/develop such models:
- `terminal_fach_state = NON_EFFECT_RESTATEMENT_AND_CONTINUATION_GOAL_REVIEWED`, zero-count; child of A03/option-space, no separate instrument.

`BE-BSW-P48-U05-A05-40a7121a76db` - trolleybuses `können geprüft werden`:
- `terminal_fach_state = NON_EFFECT_TECHNOLOGY_OPTION_APPRAISAL_REVIEWED`
- zero-count; requesting comparison is not deployment. Future appraisal must compare overhead infrastructure, battery/e-bus alternatives, demand, reliability, street/visual impacts and lifecycle cost/emissions.

`BE-BSW-P48-U05-A06-12f6965a428d` - `nicht Symbolpolitik, sondern bessere Erreichbarkeit`:
- `NON_EFFECT_NORMATIVE_OUTCOME_PRIORITY_FRAME_REVIEWED`, zero-count. Preserve accessibility as outcome criterion, not party rhetoric as evidence.

`BE-BSW-P48-U06-152396dd78db` - heading `Berlin und Brandenburg besser vernetzen`: `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`.

### 9. U07 A01/A02 - cooperation/rationale, zero-count

`BE-BSW-P48-U07-A01-a0e5c7f0fef9` - Berlin/Brandenburg closer cooperation:
- `NON_EFFECT_INTERGOVERNMENTAL_COHERENCE_GOAL_REVIEWED`, zero-count; cooperation alone is not outcome.

`BE-BSW-P48-U07-A02-2fa72e8f675f` - shared metropolitan living/work area:
- `NON_EFFECT_SPATIAL_DEMAND_CONTEXT_CLAIM_REVIEWED`, zero-count.

### 10. U07 A03 - compound tariff/commuter/student-ticket atom requires three children

Parent `BE-BSW-P48-U07-A03-ad2e2b61d926` contains three distinct actions/criteria:
1. reorganise Berlin-Brandenburg tariff structure;
2. give commuter flows greater consideration;
3. campaign for a free student ticket across the whole region.

- parent `SOURCE_UNIT_RECLASSIFIED_VERSIONED`, zero-count;
- generate three deterministic exact semantic children preserving wording/lineage.

**Child 1 - tariff-structure reorganisation**
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: no zones/products/prices/caps/transition/revenue settlement/funding or affected passenger groups are specified. Tariff simplification can reduce friction but changes revenue and distribution; direction depends on missing design.
- Competence: joint Berlin/Brandenburg/VBB contracting/funding architecture.

**Child 2 - commuter flows more strongly considered**
- `terminal_fach_state = NON_EFFECT_DEMAND_PLANNING_AND_DISTRIBUTION_GUARD_REVIEWED`
- zero-count; use OD/time/capacity data and do not privilege commuters at the expense of non-work trips without evidence.

**Child 3 - free student ticket across the entire Berlin-Brandenburg region**
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_YOUTH_MOBILITY_AFFORDABILITY_AND_REGIONAL_ACCESS_POTENTIAL / FISCAL_CAPACITY_CAPACITY_EFFECT_AND_TARGETING_DEPENDENT`
- `evidence_level = HIGH_FOR_DIRECT_FARE_BARRIER_MECHANISM / NET_MOBILITY_AND_DISTRIBUTION_OUTCOME_PENDING`
- Baseline: Berlin school students already receive free Berlin AB. This proposal expands free geographic validity region-wide; Brandenburg current arrangements differ.
- Mechanism: eliminating fares for eligible regional student trips reduces direct cost/friction and can expand education/social mobility, especially for cross-border journeys.
- Risks/trade-offs: subsidy/fare-revenue replacement, crowding/capacity, benefit to trips that would occur anyway, eligibility/admin and unequal benefit by residence/travel need.
- Reality check: eligible/use/take-up, new cross-border access/trips, education/social participation where measurable, crowding/capacity, foregone revenue/public subsidy and distribution by income/place/school.

### 11. U07 A04 - Park-and-Ride at city edges

`BE-BSW-P48-U07-A04-08e54cbed207`:
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_INNER_CITY_CAR_TRIP_REDUCTION_POTENTIAL / INDUCED_DRIVING_LAND_USE_AND_TRANSIT_SUBSTITUTION_DEPENDENT`
- `evidence_level = MEDIUM_FOR_INTERCEPT_PARKING_MODE_TRANSFER_MECHANISM / NET_VKT_AND_LAND_OUTCOME_SITE_DEPENDENT`
- Mechanism: well-sited P+R linked to high-quality transit can intercept some car trips before the inner city; it can also induce driving to the station, consume valuable land or substitute for feeder bus/bike trips.
- Competence: Berlin/Brandenburg municipalities, VBB/operators, road/land owners depending on site.
- Distribution: suburban/regional commuters, non-car households, local residents/land users, disabled travellers.
- Noncompensation: fewer inner-city car kilometres do not compensate increased total vehicle kilometres, habitat/land loss or weak transit accessibility; preserving commuter mobility does not require free/abundant parking at any cost.
- Reality check: true before/after origin-mode data, net car-km/inner-city entries, parking occupancy/turnover, transit boardings, induced trips, feeder-mode substitution, land opportunity cost, pricing/subsidy and emissions.

### 12. P48 terminal result / handoff

After deterministic repairs of U04-A03 (four modal children), U04-A04 (two cable-car projects) and U07-A03 (three tariff/demand/ticket children), plus lossless materialisation of all exact decisions above:

`BE_BSW_P48_FACH_COMPLETE = PASS_SOURCE_BOUND`

P48 contains explicit Fach decisions for: cable-car fare/network integration conditional on service existence; bus/tram network redesign; low-density Rufbus/on-demand; regional free student-ticket extension; P+R. Specific U/S/Tram/Bus infrastructure expansion and two cable-car build projects remain exact RNAA until routes/demand/cost/alternatives are specified. Framing, diagnoses and selection criteria are reviewed zero-count.

If P22→P47 remain correctly materialised, protected BSW Fach scope extends through **P48** and next untouched Fach page becomes **P49**. BSW remains programme-open; Berlin remains `3/12 programme-terminal / 9/12 programme-open`; MV and combined Parliament Golden State remain fail-closed.

CodeX: consume this P48 only after idempotent reconciliation of authoritative P22→P47. Generate child IDs mechanically from exact source text using the established deterministic convention; no Fach inference during segmentation. Preserve original parent IDs/SHA/text and all earlier supersession/cross-page relations. Recompute Berlin/#241 residual **SET-WISE**. Run Berlin residual integrity, BSW full-programme truth, parent/child/repair integrity, Source-vs-View, SamePage, tests/typecheck/lint/build/privacy/link/accessibility/responsive/Golden-readiness. Merge only green exact head, post merge SHA + generated IDs + fresh residual into #240/#241, then re-read newest comments. **GitHub-only: no Vercel Preview/build/deploy/promotion and no owner RC request.**
