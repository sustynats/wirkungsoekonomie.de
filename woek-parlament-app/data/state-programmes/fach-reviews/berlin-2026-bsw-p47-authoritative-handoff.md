## WÖk FACH BATCH — Berlin BSW P47: Wärmepumpen/Netzwärme · Wirkungspriorisierung · Technologieoffenheit · CCS · Speicher · Geothermie · Hitzeschutz · Wind/Repowering — source-bound review + mandatory segmentation repairs

Authoritative continuation after P46 `5458773627`. Fresh complete #240 re-read immediately before authoring found **no existing P47 Fach handoff**. Frozen artefact remains `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`, physical PDF P47/66. Exact source IDs/text below are bound to `berlin-2026-bsw-v1.json`. Generic delegated/#313 RNAA is not Fach authority and is superseded only for this exact P47 scope. No DNS mapping, Recommendation, score or party-wide judgement.

### 1. Current baseline / factual guards

**Berlin Wärmeplanung is already active.** The Senate adopted the citywide Wärmeplan on 16.06.2026 for a climate-neutral, affordable and reliable heat supply by 2045, explicitly distinguishing areas suited to heat networks from decentralised solutions. Therefore neither heat pumps nor heat networks have a zero baseline, and one architecture must not be treated as universally optimal. Source: `https://www.berlin.de/rbmskzl/aktuelles/pressemitteilungen/2026/pressemitteilung.1682253.php`.

**Deep-geothermal potential is promising but not yet a citywide proven commercial resource.** Berlin reported positive 2D pilot results on 30.01.2026; a citywide 3D seismic campaign is planned from Q1 2027, with data processing expected through summer 2028. Preserve the programme's geothermal-potential sentence as a prospect/baseline claim, not as established usable capacity. Source: `https://www.berlin.de/sen/uvk/presse/pressemitteilungen/2026/pressemitteilung.1639132.php`.

**CCS is legally and technically developing, but no blanket climate-benefit label is justified.** In a Bundestag expert hearing on 18.03.2026, views ranged from broad use to restriction to unavoidable residual emissions. The federal government stated on 13.05.2026 that Germany currently has no domestic CO₂ storage and estimates 8–10 years for storage development. Sources: `https://www.bundestag.de/ausschuesse/umwelt/sitzungen/1151870-1151870`, `https://www.bundestag.de/presse/hib/kurzmeldungen-1178324`.

**Berlin's wind-area obligation remains current federal law.** WindBG requires Berlin to reach 0.25% of land by 31.12.2027 and 0.50% by 31.12.2032; Berlin's planning process states this corresponds to about 446 ha and aims at designation by end-2027. Sources: `https://www.gesetze-im-internet.de/windbg/anlage.html`, `https://mein.berlin.de/vorhaben/2025-01196/`.

**Heat adaptation is a real current health/resilience need.** Berlin's health administration warned on 25.06.2026 of acute heat health risks and specifically advised use of cool rooms; current district practice also uses drinking fountains/cool places as heat-protection infrastructure. Sources: `https://www.berlin.de/sen/wgp/presse/2026/pressemitteilung.1685884.php`, `https://www.berlin.de/ba-tempelhof-schoeneberg/aktuelles/pressemitteilungen/2026/pressemitteilung.1701633.php`.

### 2. U01 — malformed Wärmepumpe/Netzwärme sentence; one deterministic semantic object

Stored atoms:
- `BE-BSW-P47-U01-A01-6a2348e8be71` = `Wir wollen Bedingungen schaffen, bei denen die Nutzung von Wärmepumpen wirtschaftlich und technisch sinnvoll ist, d. h.`
- `BE-BSW-P47-U01-A02-ae417a1a413f` = `Integration in ein Fernwärmesystem mit Wärmespeichern.`

These are one sentence split at `d. h.`. Both stored atoms:
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`

CodeX must generate one deterministic semantic child from the exact concatenated source text, preserve both parents and lineage.

Semantic child:
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = CONDITIONAL_POSITIVE_LARGE_HEAT_PUMP_NETWORK_AND_THERMAL_STORAGE_INTEGRATION_POTENTIAL / SITE_SCALE_HEAT_SOURCE_NETWORK_AND_FULL_COST_DEPENDENT`
- `evidence_level = MEDIUM_HIGH_FOR_HEAT_PUMP_AND_STORAGE_SYSTEM_MECHANISM / SITE_SPECIFIC_NET_OUTCOME_PENDING`
- Mechanism: suitably sited large heat pumps plus thermal storage can convert ambient/waste/geothermal heat using electricity, shift heat production in time and feed heat networks efficiently; the value depends on source temperature, COP, grid conditions, storage losses, network temperature and alternative options.
- Critical source guard: the wording must **not** be rendered as a universal claim that all heat pumps are economically/technically sensible only when integrated into district heating. Berlin's Wärmeplan explicitly includes decentralised solutions. Treat this as one network-scale architecture.
- Competence: mixed Berlin heat planning/public utilities/building owners/network operators/federal building-energy and market rules.
- Distribution: connected/unconnected households, tenants/owners, heat-network areas versus decentralised areas, energy-poverty exposure.
- Noncompensation: low operating emissions cannot compensate for poor full cost/reliability/site fit; cheap short-term operation cannot compensate for fossil-heavy electricity/heat-source or lock-in.
- Reality check: seasonal COP, source availability, storage round-trip/standing losses, network losses/temperature, electricity peak effects, €/MWh lifecycle cost, customer tariff, reliability and lifecycle emissions against decentralised counterfactuals.

### 3. U02 — effect prioritisation + anti-target rhetoric are design/frame, not independent effects

`BE-BSW-P47-U02-A01-465b845ac6cc` — invest in emission-reducing installations where they achieve the greatest effect:
- `terminal_fach_state = NON_EFFECT_MARGINAL_IMPACT_AND_COST_EFFECTIVENESS_DESIGN_GUARD_REVIEWED`
- `counts_as_effect_object = false`
- Reason: this is an allocation/evaluation principle, but the source defines neither metric, budget, actor nor comparison boundary. Preserve the useful guard: compare additional lifecycle emissions avoided, full system cost, delivery probability, distribution and lock-in — not technology labels or nominal capacity.

`BE-BSW-P47-U02-A02-4164ec1a74e2` — `Aktivismus ... Zielmarken`:
- `terminal_fach_state = NON_EFFECT_NORMATIVE_POLICY_PRIORITY_FRAME_REVIEWED`
- `counts_as_effect_object = false`
- Reason: rhetorical/normative position, no intervention. Do not infer that statutory climate targets are irrelevant; conversely do not treat target compliance alone as proof of welfare/effectiveness.

### 4. U03 — technology research/openess + H₂/e-fuel examples

`BE-BSW-P47-U03-A01-dc1476d3a42d` — `Technologieforschung und Technologieoffenheit`:
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- Exact reason: no R&D/funding/procurement/sandbox programme, budget, selection rule, technology-readiness stage, actor or success criterion is specified. A broad commitment to research/openess does not identify a source-bound resource shift whose net effect can be assessed.

`BE-BSW-P47-U03-A02-2f013f7c0efb` — hydrogen and synthetic-fuel production as examples:
- `terminal_fach_state = NON_EFFECT_TECHNOLOGY_EXAMPLE_SCOPE_REVIEWED`
- zero-count; these are examples under A01, not independent deployment mandates.

`BE-BSW-P47-U03-A03-b46bd2264eb0` — both have pros/cons in production/distribution:
- `terminal_fach_state = NON_EFFECT_TECHNOLOGY_COMPARISON_RATIONALE_REVIEWED`
- zero-count; correct guard is disaggregated lifecycle efficiency, electricity demand, feedstock/carbon source, infrastructure, cost and use-case suitability. `Technologieoffenheit` never means equal WÖk performance.

### 5. U04 — CCS/CCU endorsement

#### `BE-BSW-P47-U04-A01-48550be8d573` — support capture, storage and use of CO₂ from power/industrial combustion

- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_CAPTURED_EMISSIONS_REDUCTION_POTENTIAL / CAPTURE_RATE_ENERGY_PENALTY_PERMANENCE_USE_CASE_AND_FOSSIL_LOCKIN_DEPENDENT`
- `evidence_level = MEDIUM_HIGH_FOR_CAPTURE_MECHANISM / LOW_TO_MEDIUM_FOR_NET_LIFECYCLE_BENEFIT_WITHOUT_SPECIFIC_PROJECT`
- Mechanism: capture can reduce stack CO₂ reaching the atmosphere; permanent geological storage can create durable abatement if capture/transport/storage integrity is high. CCU benefit depends on product lifetime and whether CO₂ is re-released.
- Important source boundary: the programme names combustion processes broadly, not only technically unavoidable process emissions. Do not render `CCS = klimaneutral` or assume it is preferable to direct fuel substitution/efficiency.
- Current-baseline guard: domestic storage is not currently operating; infrastructure/legal/export pathways are still developing.
- Risks: energy penalty, upstream fuel/methane emissions, incomplete capture, transport/storage leakage/liability, water/material use, fossil-asset life extension, opportunity cost versus direct abatement.
- Noncompensation: captured tonnes cannot compensate for avoidable upstream/uncaptured emissions or unsafe storage; direct-abatement purity cannot ignore genuinely hard-to-abate residuals.
- Reality check: counterfactual direct-abatement option, capture rate, net lifecycle tCO₂e, energy input, permanence/leakage, full €/tCO₂ avoided, infrastructure utilisation, liability/monitoring and lock-in.

### 6. U05 — mandatory malformed storage sentence repair

Stored:
- `BE-BSW-P47-U05-A01-90ab03ddb969` = `Die Entwicklung bzw.`
- `BE-BSW-P47-U05-A02-0683261296fe` = `Weiterentwicklung von Strom- und Wärmespeichern ist für den Umstieg auf erneuerbare Energien zentral und muss noch stärker unterstützt werden.`

Both stored atoms:
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- zero-count.

Generate one deterministic semantic child from the exact full source unit:
`Die Entwicklung bzw. Weiterentwicklung von Strom- und Wärmespeichern ist für den Umstieg auf erneuerbare Energien zentral und muss noch stärker unterstützt werden.`

Semantic child:
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_STORAGE_INNOVATION_FLEXIBILITY_AND_RENEWABLE_INTEGRATION_POTENTIAL / SUPPORT_INSTRUMENT_STORAGE_TYPE_AND_LIFECYCLE_DEPENDENT`
- `evidence_level = MEDIUM_HIGH_FOR_STORAGE_FLEXIBILITY_MECHANISM / PROGRAMME_ADDITIONALITY_AND_TECHNOLOGY_OUTCOME_PENDING`
- Mechanism: better electricity/thermal storage can shift energy temporally, reduce mismatch/curtailment and support renewable integration; R&D/support can improve cost, durability and deployability where additional.
- Omissions: exact support instrument/budget, technology portfolio, TRL, intellectual-property/procurement rules, recycling/material supply and system need.
- Guard: electricity and thermal storage are distinct technology families; public UI may preserve the combined mandate but must not imply equal economics/uses.
- Reality check: incremental performance/cost/durability, deployed useful capacity, cycles/thermal losses, curtailment/system-value contribution, lifecycle resources/emissions and support additionality.

### 7. U06 — geothermal potential claim + demonstration/research action

`BE-BSW-P47-U06-A01-28befc44f29e` — Berlin has usable geothermal potential that can make building heat greener:
- `terminal_fach_state = NON_EFFECT_RESOURCE_POTENTIAL_AND_EXPECTED_OUTCOME_CLAIM_REVIEWED`
- zero-count.
- Current-source guard: official 2D measurements are promising, but citywide 3D characterisation is still pending through 2027–2028. Do not promote `nutzbares Potential` to proven commercial capacity or a quantified climate effect.

#### `BE-BSW-P47-U06-A02-df55264bada6` — support demonstration plants and accompanying research

- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_OPTION_VALUE_LEARNING_AND_GEOTHERMAL_DEMONSTRATION_POTENTIAL / GEOLOGICAL_SITE_FINANCING_AND_SCALABILITY_DEPENDENT`
- `evidence_level = MEDIUM_FOR_DEMONSTRATION_LEARNING_MECHANISM / COMMERCIAL_SCALE_OUTCOME_PENDING`
- Mechanism: demonstrators plus research can convert subsurface uncertainty into measured drilling/temperature/flow/cost/operations evidence and reveal whether scalable low-carbon heat is viable.
- Risks: drilling failure/capital loss, induced seismicity/geological risk, permitting/insurance, local construction impacts, network-interface need, vendor/project lock-in.
- Competence: Berlin funding/public-utility/research/site levers plus applicable mining/environmental/safety law.
- Reality check: successful drilling/flow/temperature, availability, heat yield, €/MWh lifecycle, environmental/seismic outcomes, network compatibility, learnings transferred to later projects and avoided sunk-cost replication.

### 8. U07 — six materially different urban heat/adaptation interventions hidden in one list

`BE-BSW-P47-U07-A01-ac033f6b604f` currently combines: `Baumpflanzungen, Fassaden- und Dachbegrünung, offene Wasserflächen, Trinkwasserbrunnen und Kühlräume ...`.

- parent `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- parent zero-count.
- Generate **six** deterministic children from exact list components: `Baumpflanzungen`; `Fassadenbegrünung`; `Dachbegrünung`; `offene Wasserflächen`; `Trinkwasserbrunnen`; `Kühlräume`. The trailing source judgement `sind sinnvolle Investitionen im Innenstadtbereich` is rationale for the list, not independent proof.

Child decisions:

1. **Baumpflanzungen**
- `EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_SHADE_HEAT_RESILIENCE_AND_URBAN_ECOSYSTEM_POTENTIAL / SITE_SURVIVAL_WATER_AND_SPACE_DEPENDENT`
- Reality: canopy/survival after 3/5/10 years, shade/surface-air temperature where relevant, water/maintenance, biodiversity, accessibility and distribution of canopy gains.

2. **Fassadenbegrünung**
- `EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_BUILDING_MICROCLIMATE_COOLING_AND_BIODIVERSITY_POTENTIAL / STRUCTURAL_FIRE_WATER_AND_MAINTENANCE_DEPENDENT`
- Reality: coverage/survival, indoor/façade temperature effects, water/maintenance, fire/building integrity, biodiversity and lifecycle cost.

3. **Dachbegrünung**
- `EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_HEAT_STORMWATER_AND_BIODIVERSITY_POTENTIAL / STRUCTURAL_WATER_MAINTENANCE_AND_ROOF_USE_TRADEOFF_DEPENDENT`
- Guard: check coexistence/trade-off with PV and other roof uses; green roof area is input.
- Reality: retention/runoff, roof/indoor thermal effect, survival/maintenance/water, biodiversity, lifecycle cost and PV compatibility.

4. **offene Wasserflächen**
- `EXPLICIT_FACH_APPROVED`
- `impact_direction = CONDITIONAL_POSITIVE_LOCAL_COOLING_AND_PUBLIC_REALM_POTENTIAL / WATER_AVAILABILITY_QUALITY_SAFETY_AND_SPACE_DEPENDENT`
- Risks: evaporation/water scarcity, hygiene/ecology, drowning/safety, mosquito/nuisance, maintenance and high land opportunity cost.
- Reality: measured local cooling/use benefit versus water/lifecycle/maintenance/safety impacts.

5. **Trinkwasserbrunnen**
- `EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_HEAT_HEALTH_HYDRATION_AND_LOW_BARRIER_ACCESS_POTENTIAL / LOCATION_HYGIENE_MAINTENANCE_AND_UPTIME_DEPENDENT`
- `evidence_level = HIGH_FOR_DIRECT_HYDRATION_ACCESS_MECHANISM / POPULATION_HEALTH_CONTRIBUTION_CONTEXT_DEPENDENT`
- Distribution: outdoor workers, homeless people, older/vulnerable residents, children, low-income users, tourists and high-heat locations.
- Reality: uptime/water quality, spatial access and use during heat periods, maintenance cost; number installed alone is input.

6. **Kühlräume**
- `EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_ACUTE_HEAT_EXPOSURE_REDUCTION_POTENTIAL / ACCESS_OPERATING_ENERGY_TARGETING_AND_AWARENESS_DEPENDENT`
- `evidence_level = HIGH_FOR_DIRECT_COOLING_EXPOSURE_MECHANISM / HEALTH_OUTCOME_CONTRIBUTION_PENDING`
- Risks: accessibility/opening-hour/info barriers, energy demand/emissions, infection/crowding, unequal distribution.
- Reality: hours/access/use by heat-vulnerable groups, indoor temperature reliability, energy/lifecycle footprint and acute heat-health contribution.

Cross-child noncompensation: visible greening/water/cooling infrastructure cannot compensate for poor access, tree/green failure, unsafe design or displacement of higher-priority functions; health benefit cannot erase water/energy/resource externalities. Site-level portfolio selection is required.

### 9. U08 — mandatory split: Berlin wind ban vs federal WindBG repeal; repowering + rationale

#### Parent `BE-BSW-P47-U08-A01-7cb685beaad5`
Source combines two distinct actions: `(a) Verzicht auf die Errichtung von Windrädern in Berlin` and `(b) Initiative zur Veränderung des Wind-an-Land-Gesetzes, um die Flächenvorgaben ... abzuschaffen`.

- parent `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- zero-count.
- Generate two deterministic exact semantic children from those clauses.

**Child A — no new wind turbines in Berlin**
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_LOCAL_LAND_USE_CONFLICT_AVOIDANCE_VS_FOREGONE_LOCAL_RENEWABLE_GENERATION_AND_SPATIAL_EXTERNALISATION / SITE_COUNTERFACTUAL_DEPENDENT`
- `evidence_level = HIGH_FOR_FOREGONE_LOCAL_GENERATION_MECHANISM / NET_WELFARE_SITE_AND_SYSTEM_DEPENDENT`
- Competence/legal guard: Berlin controls planning choices only within binding federal law; it currently owes 0.25%/0.50% WindBG area contributions unless law/valid transfer framework changes. Do not render blanket non-build as presently frictionless/legal compliance.
- Potential benefits: avoid site-specific landscape, biodiversity, recreation, safety/noise/acceptance conflicts where Berlin sites have high conflict cost.
- Costs/risks: foregone local low-carbon generation, less local supply diversification, possible need for more generation/import/infrastructure elsewhere and spatial externalisation to other regions.
- Reality check: site-level expected net MWh, capacity factor/grid value, biodiversity/recreation/noise constraints, alternative land use, cost, external generation/grid requirement and emissions.

**Child B — federal initiative to abolish WindBG area targets**
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = AMBIVALENT_PLANNING_FLEXIBILITY_VS_LOWER_RENEWABLE_DEPLOYMENT_CERTAINTY_AND_INTERREGIONAL_BURDEN_SHIFT / REPLACEMENT_FRAMEWORK_DEPENDENT`
- `evidence_level = HIGH_FOR_PLANNING_CONSTRAINT_CHANGE / NET_DEPLOYMENT_SYSTEM_EFFECT_DEPENDS_ON_REPLACEMENT_RULE`
- Competence: `FEDERAL_LEGISLATIVE_CHANGE / BERLIN_ADVOCACY_OR_BUNDESRAT_ROLE`.
- Mechanism: removing binding area contributions increases state planning discretion; without an equally effective replacement deployment mechanism it can reduce/redistribute land availability and project certainty.
- Noncompensation: local flexibility cannot erase climate/system contribution and burden-shifting effects; national deployment targets cannot erase genuinely disproportionate local conflicts.
- Reality check: replacement rule, designated/usable areas, project pipeline/build rates, regional burden allocation, network/system effects and actual conflict reduction.

#### `BE-BSW-P47-U08-A02-1862cc9fddf1` — repowering old wind turbines
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_EXISTING_SITE_GENERATION_AND_ASSET_EFFICIENCY_POTENTIAL / SITE_PERMIT_GRID_ECOLOGY_AND_LIFECYCLE_DEPENDENT`
- `evidence_level = HIGH_FOR_REPOWERING_OUTPUT_MECHANISM / SITE_NET_EFFECT_PENDING`
- Mechanism: replacing older units with newer machines can increase annual generation/capacity at established sites and use existing grid/access infrastructure; actual benefit varies by site and turbine design.
- Risks: new height/footprint/ecological/noise impacts, permitting, grid constraints, premature retirement/material waste, community acceptance.
- Reality check: incremental net MWh/capacity factor, downtime, grid value/curtailment, lifecycle material/recycling/emissions, biodiversity/noise and full cost.

`BE-BSW-P47-U08-A03-db77b10e4e82` — definition of repowering:
- `terminal_fach_state = NON_EFFECT_DEFINITION_REVIEWED`
- zero-count; child/rationale of A02.

`BE-BSW-P47-U08-A04-82f503052981` — claim that repowering brings more green power/efficiency:
- `terminal_fach_state = NON_EFFECT_EXPECTED_OUTCOME_CLAIM_REVIEWED`
- zero-count; plausible direction but not treated as observed fact for every site. Reality Check belongs to A02.

### 10. P47 terminal result / CodeX handoff

After deterministic repairs for U01, U05, U07 and U08-A01 and lossless materialisation of all exact decisions above:

`BE_BSW_P47_FACH_COMPLETE = PASS_SOURCE_BOUND`

Required semantic-repair structure:
- U01 A01+A02 → 1 exact full-sentence heat-pump/network/storage child;
- U05 A01+A02 → 1 exact full-sentence storage-development child;
- U07 A01 → 6 smallest list-item intervention children;
- U08 A01 → 2 distinct action children (Berlin no-build; federal WindBG change).

If P22→P46 remain correctly materialised, protected BSW Fach scope extends through **P47** and next untouched Fach page becomes **P48**. BSW remains programme-open; Berlin remains `3/12 programme-terminal / 9/12 programme-open`; MV and combined Parliament Golden State remain fail-closed.

CodeX: consume this P47 only after idempotent reconciliation of the authoritative P22→P46 chain. Generate child IDs mechanically from exact source text using the established deterministic convention; do not infer additional Fach during segmentation. Preserve original parent IDs/SHA/text and all previous supersession/cross-page relations. Recompute Berlin/#241 residual **SET-WISE**, never stale subtraction. Run Berlin residual integrity, BSW full-programme truth, parent/child/repair integrity, Source-vs-View, SamePage navigation, tests/typecheck/lint/build/privacy/link/accessibility/responsive/Golden-readiness. Merge only a green exact head, post merge SHA + generated child IDs + fresh residual in #240/#241, then re-read newest comments. **GitHub-only: no Vercel Preview/build/deploy/promotion and no owner RC request.**
