# Vollständige Fachakte - Erstes Gesetz zur Änderung des Tierhaltungskennzeichnungsgesetzes

> Die ursprüngliche Review-Datei bleibt unverändert. Das nachträgliche Entscheidungsreife-/Abstimmungssupplement wird ergänzend vollständig dargestellt. Keine Verdichtung.

## A. Ursprünglicher Review - vollständig

**analysis_version:** 1.1.0

### calculation_requirements

#### Eintrag 1

**calculation_id:** C1

**name:** Vollzugsqualitätsgewinn

**specification:** Vergleich Fehler-/Nichtkonformitätsquote mit und ohne zusätzlichen Vorlauf.

##### required_inputs

- Kontrollen
- Fehlerquoten
- Länderreife

##### available_inputs

_Leere Liste._

##### missing_inputs

- Kontrollen
- Fehlerquoten
- Länderreife

**status:** DATA_GAP

#### Eintrag 2

**calculation_id:** C2

**name:** Verzögerte Markt-/Tierwohlwirkung

**specification:** Differenz in Kennzeichnungsabdeckung, Kaufreaktion und nachgelagerten Tierwohlindikatoren über sieben Monate.

##### required_inputs

- Abdeckung
- Kaufdaten
- Tierwohlindikatoren

##### available_inputs

_Leere Liste._

##### missing_inputs

- Abdeckung
- Kaufdaten
- Tierwohlindikatoren

**status:** DATA_GAP

#### Eintrag 3

**calculation_id:** C3

**name:** Netto-Vollzugsvergleich

**specification:** Qualitätsgewinn und Wirkungsverzögerung getrennt darstellen; keine Gleichsetzung von Kennzeichnung mit Tierwohl.

##### required_inputs

- C1
- C2

##### available_inputs

_Leere Liste._

##### missing_inputs

- C1
- C2

**status:** DATA_GAP


**case_id:** 94cdfef9-baca-41aa-91df-4a1dbd6b5d4e

### counterarguments

- Zusätzliche Vorbereitungszeit kann Vollzug verbessern, doch wiederholte Verschiebung kann Glaubwürdigkeit und Investitionsanreize schwächen.
- Kennzeichnung kann Kaufentscheidungen beeinflussen, ist aber kein direkter Nachweis besserer Tiergesundheit oder Tierwohlzustände.

### counterfactuals

#### Eintrag 1

**question:** Welche Fehler-/Vollzugsprobleme wären bei Start am ursprünglichen Termin aufgetreten?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.

#### Eintrag 2

**question:** Welche Tierwohl-/Marktwirkung geht durch sieben Monate Verzögerung verloren?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.

#### Eintrag 3

**question:** Wäre ein gestufter Start oder Übergang mit Toleranzregeln wirksamer gewesen?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.


### cross_case_links

#### Eintrag 1

**case_id:** 64892605-37f9-4a8c-a1ab-ff5e86056693

**reason:** Beide Agrarfälle betreffen den Trade-off zwischen Vollzugsreife und verzögerter Zielwirkung.


### data_gaps

#### Eintrag 1

**gap_id:** DG1

**description:** Vollzugsreife der Länder zum ursprünglichen und verschobenen Stichtag

**severity:** MATERIAL

#### Eintrag 2

**gap_id:** DG2

**description:** Registrierungs-/Melde-/Kontrollprozesse und Fehlerquoten

**severity:** MATERIAL

#### Eintrag 3

**gap_id:** DG3

**description:** Anteil korrekt gekennzeichneter Produkte und Marktabdeckung

**severity:** MATERIAL

#### Eintrag 4

**gap_id:** DG4

**description:** Verbraucherverständnis und Kaufverhalten

**severity:** MATERIAL

#### Eintrag 5

**gap_id:** DG5

**description:** Investitionen/Umstellungen in Haltungsformen

**severity:** MATERIAL

#### Eintrag 6

**gap_id:** DG6

**description:** Direkte Tierwohlindikatoren statt Kennzeichnung als Proxy

**severity:** MATERIAL

#### Eintrag 7

**gap_id:** DG7

**description:** Kosten der Umstellung und Vollzugskosten

**severity:** MATERIAL


### decision

**object:** Erstes Gesetz zur Änderung des Tierhaltungskennzeichnungsgesetzes

**date:** 2025-06-26

**parliamentary_status:** 2. Beratung

**actual_outcome:** Annahme der Vorlage

**final_version:** Annahme der Vorlage

**confirmation_status:** DECISION_CONFIRMED

#### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55
- 29250af8-9eeb-43b3-840d-260e2f4975c3

### ex_ante

**assessment_type:** WIRKUNGSPOTENZIAL_WIRKUNGSRISIKO_AND_CAUSAL_PATHS

#### impact_paths

##### Eintrag 1

**path_id:** P1

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Zusätzliche Vorbereitungszeit kann Länder- und Unternehmensprozesse stabilisieren und fehlerhafte oder inkonsistente Kennzeichnung reduzieren.

**direction:** POSITIVE_POTENTIAL

###### affected_mpd_dimensions

- Mensch
- Demokratie

###### normative_target_areas

- Sicherheit/Resilienz
- Wohlstand/Produktivität

###### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 2

**path_id:** P2

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Die Verschiebung verzögert Verbrauchertransparenz und damit mögliche nachfrage- und investitionsseitige Tierwohl-Anreize.

**direction:** NEGATIVE_RISK

###### affected_mpd_dimensions

- Mensch

###### normative_target_areas

- Freiheit/Selbstbestimmung
- Nachhaltigkeit/Zukunftsfähigkeit

###### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 3

**path_id:** P3

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Ein später, aber funktionsfähiger Start kann wirksamer sein als ein formaler Start ohne Vollzugsinfrastruktur; dies ist empirisch zu prüfen.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Demokratie

###### normative_target_areas

- Sicherheit/Resilienz

###### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 4

**path_id:** P4

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Die angekündigte breitere Reform kann die spätere Systemwirkung erhöhen, ist aber zum Entscheidungszeitpunkt noch Zukunftspotenzial und keine eingetretene Wirkung.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Planet

###### normative_target_areas

- Nachhaltigkeit/Zukunftsfähigkeit

###### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`


#### risks_and_side_effects

##### Eintrag 1

**risk_id:** R1

**description:** Verzögerte Transparenz

**status:** TO_BE_TESTED

##### Eintrag 2

**risk_id:** R2

**description:** Verzögerte Tierwohl-Investitionsanreize

**status:** TO_BE_TESTED

##### Eintrag 3

**risk_id:** R3

**description:** Wiederholte Fristverschiebung/Regelungsunsicherheit

**status:** TO_BE_TESTED

##### Eintrag 4

**risk_id:** R4

**description:** Kennzeichnung ohne nachweisliche Tierwohlverbesserung

**status:** TO_BE_TESTED

##### Eintrag 5

**risk_id:** R5

**description:** Ungleiche Belastung bereits vorbereiteter vs. nicht vorbereiteter Akteure

**status:** TO_BE_TESTED


#### distributional_effects

**status:** DATA_GAP

##### questions

- Welche Gruppen/Regionen erhalten Nutzen?
- Welche Gruppen/Regionen tragen Kosten, Risiken oder Verzögerungen?
- Wie unterscheiden sich kurzfristige und langfristige Verteilungswirkungen?

#### implementation_dependencies

**status:** DATA_GAP

##### required_analysis

- Vollzugs-/Umsetzungskapazität
- Zeitpfad
- Finanzierung/Personal/IT/Planung soweit relevant
- Verhaltensreaktionen und Rebound-/Verlagerungseffekte

### ex_post

**decision_observed:** `true`

**effect_evidence_available_in_package:** `false`

#### observed_outcomes

_Leere Liste._

#### observed_impacts

_Leere Liste._

**assessment:** DATA_GAP

**note:** Nach der Entscheidung veröffentlichte DIP-Vorgangsquelle(n) bestätigen den parlamentarischen Vorgang, enthalten im Paket aber keine gemessenen Outcome-/Impactdaten.

#### required_follow_up_data

- Vollzugsreife der Länder zum ursprünglichen und verschobenen Stichtag
- Registrierungs-/Melde-/Kontrollprozesse und Fehlerquoten
- Anteil korrekt gekennzeichneter Produkte und Marktabdeckung
- Verbraucherverständnis und Kaufverhalten
- Investitionen/Umstellungen in Haltungsformen
- Direkte Tierwohlindikatoren statt Kennzeichnung als Proxy
- Kosten der Umstellung und Vollzugskosten

**generated_at:** 2026-08-15T09:02:23+02:00

### impact_domains

- Mensch
- Demokratie
- Planet

### impact_paths

#### Eintrag 1

**path_id:** P1

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Zusätzliche Vorbereitungszeit kann Länder- und Unternehmensprozesse stabilisieren und fehlerhafte oder inkonsistente Kennzeichnung reduzieren.

**direction:** POSITIVE_POTENTIAL

##### affected_mpd_dimensions

- Mensch
- Demokratie

##### normative_target_areas

- Sicherheit/Resilienz
- Wohlstand/Produktivität

##### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 2

**path_id:** P2

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Die Verschiebung verzögert Verbrauchertransparenz und damit mögliche nachfrage- und investitionsseitige Tierwohl-Anreize.

**direction:** NEGATIVE_RISK

##### affected_mpd_dimensions

- Mensch

##### normative_target_areas

- Freiheit/Selbstbestimmung
- Nachhaltigkeit/Zukunftsfähigkeit

##### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 3

**path_id:** P3

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Ein später, aber funktionsfähiger Start kann wirksamer sein als ein formaler Start ohne Vollzugsinfrastruktur; dies ist empirisch zu prüfen.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Demokratie

##### normative_target_areas

- Sicherheit/Resilienz

##### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 4

**path_id:** P4

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**hypothesis:** Die angekündigte breitere Reform kann die spätere Systemwirkung erhöhen, ist aber zum Entscheidungszeitpunkt noch Zukunftspotenzial und keine eingetretene Wirkung.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Planet

##### normative_target_areas

- Nachhaltigkeit/Zukunftsfähigkeit

##### source_ids

- 5da0237e-87bc-4081-9e82-f656b92eea55

**evidence_status:** DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`


**input_package_hash:** 147e891905a0b4991e2e6494fbcb2a39c1129077309079ad3441332c2be2b1ca

### non_compensable_boundaries

- Tierwohl darf nicht allein über Kennzeichnungscompliance bewertet werden; direkte Schutz-/Wohlfahrtsindikatoren sind erforderlich.

### normative_mapping

**reference_frame:** SDGs, SDG+ sowie getrennt Grundrechte, Staatsziele, Staatsstrukturprinzipien und Schutzaufträge

**mapping_status:** PROPOSED_PENDING_REFERENCE_RECONCILIATION

#### sdg_mappings

##### Eintrag 1

**id:** SDG_02

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Kein Hunger. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 2

**id:** SDG_08

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 3

**id:** SDG_09

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 4

**id:** SDG_12

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Nachhaltiger Konsum und Produktion. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._


#### sdg_plus_mappings

##### Eintrag 1

**id:** SDG_PLUS_DISCOURSE_CAPACITY

**framework:** SDG_PLUS

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Diskursfähigkeit. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 2

**id:** SDG_PLUS_INSTITUTIONAL_TRUST

**framework:** SDG_PLUS

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Institutionelles Vertrauen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._


#### constitutional_anchor_mappings

##### Eintrag 1

**id:** AEUV_ART_13_ANIMAL_WELFARE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Tiere als fühlende Wesen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 2

**id:** GG_ART_20A_ANIMAL_PROTECTION

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Tierschutz und Tierwohl. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 3

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._


#### tile_mappings

##### Eintrag 1

**id:** AEUV_ART_13_ANIMAL_WELFARE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Tiere als fühlende Wesen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 2

**id:** GG_ART_20A_ANIMAL_PROTECTION

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Tierschutz und Tierwohl. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 3

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 4

**id:** SDG_02

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Kein Hunger. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 5

**id:** SDG_08

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 6

**id:** SDG_09

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 7

**id:** SDG_12

**framework:** SDG

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Nachhaltiger Konsum und Produktion. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 8

**id:** SDG_PLUS_DISCOURSE_CAPACITY

**framework:** SDG_PLUS

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Diskursfähigkeit. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._

##### Eintrag 9

**id:** SDG_PLUS_INSTITUTIONAL_TRUST

**framework:** SDG_PLUS

**direction:** EVIDENCE_OPEN

**evidence_status:** DATA_GAP_OR_NOT_YET_OBSERVABLE

**rationale:** Der Wirkpfad „Eine verpflichtende Kennzeichnung kann Markttransparenz und Investitionsanreize für höhere Haltungsstandards stärken. Risiken sind weitere Verzögerung, Compliancekosten, geringe Nutzung durch Verbraucher:innen und eine Kennzeichnung ohne messbare Tierwohlverbesserung. Der Pflicht“ berührt Institutionelles Vertrauen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- MON-01

###### source_refs

_Leere Liste._


**separation_rule:** SDG, SDG+ und Verfassungs-/Schutzanker sind getrennte Referenzebenen; Mehrfachbezug erzeugt keine Mehrfachpunkte.

**previous_review_id:** WOEK-REVIEW-2026-0001::94cdfef9-baca-41aa-91df-4a1dbd6b5d4e

### provenance

**review_generated_at:** 2026-08-15T09:02:23+02:00

#### source_refs_used

- 29250af8-9eeb-43b3-840d-260e2f4975c3
- 5da0237e-87bc-4081-9e82-f656b92eea55

### retrospective

**historical_assessment_status:** NO_ROBUST_RETROSPECTIVE_ASSESSMENT

#### learning_points

- Die erneute Verschiebung verändert den ursprünglichen Wirkpfad; die beabsichtigte Kennzeichnungswirkung ist bislang nicht eingetreten.
- Kennzeichnungscompliance ist nur Proxy und darf nicht mit Tierwohlwirkung gleichgesetzt werden.

#### publication_blockers

- No verified post-decision outcome/impact evidence is contained in the case package; parliamentary follow-up sources do not constitute impact evidence.
- A later parliamentary decision changed the implementation path again before the reviewed delayed start; the intended labelling effect of the reviewed decision is therefore not observable as originally planned.
- The observation window or implementation stage is not yet sufficient for a robust retrospective outcome/impact assessment.
- The counterfactual required for causal attribution is not established.
- Material calculation inputs remain missing; no quantitative net-impact statement may be produced.
- Der ursprüngliche Fall-Snapshot bleibt unverändert als Provenienz erhalten. Für Release 1.0 liegt ein kontrollierter Referenzstand vor; qualitative Zuordnungen sind veröffentlichbar, Scores, Gewichtungen und Präferenzurteile bleiben ausgeschlossen.
- The supplied source excerpts are limited/truncated and do not provide a fully reviewable text body for every relevant ex-ante proposition.

**publication_readiness:** NOT_YET_ASSESSABLE

#### reasoning_components

##### Eintrag 1

**gate:** DECISION_BASIS

**status:** PASS

**reason:** Official decision metadata is contained in the package.

##### Eintrag 2

**gate:** EX_ANTE

**status:** PARTIAL

**reason:** Temporal separation is respected; full-source verification remains incomplete because excerpts are limited.

##### Eintrag 3

**gate:** EX_POST

**status:** FAIL

**reason:** No verified outcome/impact evidence in the package.

##### Eintrag 4

**gate:** IMPACT_LOGIC

**status:** PARTIAL

**reason:** Impact hypotheses exist; reach, attribution and counterfactual are not established.

##### Eintrag 5

**gate:** CALCULATION

**status:** FAIL

**reason:** Required calculation inputs are missing or unverified.

##### Eintrag 6

**gate:** NORMATIVE_FRAMEWORK

**status:** FAIL

**reason:** Leading WÖk reference snapshot is incomplete.

##### Eintrag 7

**gate:** NON_COMPENSATION

**status:** NOT_YET_APPLICABLE

**reason:** Protection gates are defined but no final scored assessment is permitted.


#### source_candidates

##### Eintrag 1

**source_id:** CAND-BT-THKG-SECOND-AMENDMENT-20260115

**title:** Pflicht zur Verwendung der Tierhaltungskennzeichnung wird verschoben

**institution:** Deutscher Bundestag

**canonical_url:** https://www.bundestag.de/dokumente/textarchiv/2026/kw03-de-tierhaltungskennzeichnungsgesetz-1134328

**publication_date:** 2026-01-15

**retrieval_date:** 2026-08-15

**source_type:** OFFICIAL_PARLIAMENTARY_FOLLOW_UP

**exact_location:** Beschluss zur erneuten Verschiebung des Anwendungsbeginns auf 1. Januar 2027

**temporal_class:** PUBLISHED_AFTER_DECISION

**needed_for:** Shows that the implementation path changed again before the delayed 2026 start; direct labelling and animal-welfare outcomes from the reviewed decision are therefore not yet observable.


**review_id:** FINAL-REVIEW-WOEK-REVIEW-2026-0001-94cdfef9

**review_status:** PARTIAL

**review_type:** FULL_REVIEW

### risks

#### Eintrag 1

**risk_id:** R1

**description:** Verzögerte Transparenz

**status:** TO_BE_TESTED

#### Eintrag 2

**risk_id:** R2

**description:** Verzögerte Tierwohl-Investitionsanreize

**status:** TO_BE_TESTED

#### Eintrag 3

**risk_id:** R3

**description:** Wiederholte Fristverschiebung/Regelungsunsicherheit

**status:** TO_BE_TESTED

#### Eintrag 4

**risk_id:** R4

**description:** Kennzeichnung ohne nachweisliche Tierwohlverbesserung

**status:** TO_BE_TESTED

#### Eintrag 5

**risk_id:** R5

**description:** Ungleiche Belastung bereits vorbereiteter vs. nicht vorbereiteter Akteure

**status:** TO_BE_TESTED


**schema_version:** 1.0.0

### source_completeness

#### decision_basis

**status:** PASS

**reason:** Final decision metadata, decision date, parliamentary status and outcome are source-backed within the package.

#### ex_ante

**status:** PARTIAL

**reason:** Only at-decision-time source IDs are used for ex-ante logic, but the provided excerpts are limited and do not support full-document verification of every proposition.

#### ex_post

**status:** FAIL

**reason:** Package follow-up sources confirm parliamentary status only; no verified outcome/impact evidence is supplied.

#### impact_logic

**status:** PARTIAL

**reason:** Impact paths and risks are structured as hypotheses; causal reach, attribution and counterfactual remain unverified.

#### calculation

**status:** FAIL

**reason:** Material inputs required by the calculation requirements are missing or unverified.

#### normative_framework

**status:** FAIL

**reason:** Der ursprüngliche Fall-Snapshot bleibt unverändert. Der kontrollierte Release-Referenzstand trägt die qualitative Zuordnung; Scores, Gewichtungen und Präferenzurteile bleiben ausgeschlossen.

#### non_compensation

**status:** DEFINED_NOT_APPLIED

**reason:** Relevant protection gates are identified but cannot be applied to a final assessment until evidence and the normative snapshot are complete.

#### overall

**status:** NOT_PUBLICATION_READY

**publication_readiness:** NOT_YET_ASSESSABLE

### source_conflicts

_Leere Liste._

### woek_reference_snapshot

**known_gap:** Der führende Referenzbestand ist noch nicht vollständig kontrolliert importiert. Er kann für externe Vorarbeit sichtbar gemacht werden, blockiert aber Veröffentlichung und methodische Endfreigabe.

**last_verified:** 2026-08-14

#### leading_references

##### Eintrag 1

###### authority_scope

- system_logic
- positive_net_impact
- coupled_system_mensch_planet_demokratie

**reference_id:** WOEK_SYSTEM_LOGIC

**version:** `null`

##### Eintrag 2

###### authority_scope

- management_architecture
- governance
- operating_model
- impact_realisation

**reference_id:** WOEMM

**version:** 2.0

##### Eintrag 3

###### authority_scope

- methods
- canvas
- workshop_journeys
- quality
- governance
- realisation
- training

**reference_id:** WOEMS

**version:** 2.0

##### Eintrag 4

###### authority_scope

- terminology
- public_language
- glossary
- resilience_systematics

**reference_id:** WOEK_GLOSSARY_GUIDE

**version:** 1.3

##### Eintrag 5

###### authority_scope

- public_short_definitions
- term_navigation

**reference_id:** WOEK_GLOSSARY_PUBLIC

**version:** `null`

##### Eintrag 6

###### authority_scope

- sdgs
- agenda_2030
- sdg_plus
- normative_evaluation

**reference_id:** SDG_SDGPLUS_REFERENCE

**version:** 0.3

##### Eintrag 7

###### authority_scope

- sdgs
- agenda_2030
- sdg_plus
- public_reference_orientation

**reference_id:** SDG_SDGPLUS_ONLINE

**version:** `null`

##### Eintrag 8

###### authority_scope

- woek_ids
- indicator_registry
- benchmark_status
- governance_rules
- assurance_status

**reference_id:** WOEK_MASTER_ITEMS

**version:** 1.3

##### Eintrag 9

###### authority_scope

- tsroi_calculation
- causal_boundaries
- discounted_net_benefit
- protection_gate

**reference_id:** TSROI_STANDARD

**version:** 1.1


**manifest_version:** 2026-08-14

**snapshot_hash:** ee21b55975c6de8366b058cf5d721ec50673d312590d3b0a58ea88413bdfad8f

**status:** INCOMPLETE_PENDING_TWO_LEADING_REFERENCES

### release_1_0

**publisher:** Institut für Wirkungsökonomie

**public_title:** Tierhaltungskennzeichnung

**public_key_statement:** Eine Tierhaltungskennzeichnung kann Transparenz schaffen und Nachfrage sowie Investitionen verändern. Die tatsächliche Tierwohlwirkung hängt von vollständigem Anwendungsbereich, überprüfbaren Kriterien, Kontrollen, verständlicher Information und realen Haltungsverbesserungen ab.

**maturity_stage:** MONITORING

**maturity_label:** Wirkungsmonitoring

**public_release_status:** READY_FOR_PUBLIC_RELEASE_WITH_MATURITY_LABEL

**public_release_boundary:** Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar. Sie ist kein Endscore und keine abgeschlossene kausale Netto-Wirkungsbewertung.

#### ten_policy_field_screening

##### Eintrag 1

**policy_field:** HOUSING

**status:** NOT_MATERIAL_IDENTIFIED

**rationale:** Im dokumentierten Entscheidungsgegenstand und den vorhandenen Wirkpfaden wurde kein materieller Bezug identifiziert.

###### impact_path_refs

_Leere Liste._

##### Eintrag 2

**policy_field:** HEALTH_CARE

**status:** INDIRECT

**rationale:** Haltungsbedingungen können Tiergesundheit, Lebensmittelsicherheit und indirekt menschliche Gesundheit berühren.

###### impact_path_refs

- P2
- P3

##### Eintrag 3

**policy_field:** EDUCATION_PARTICIPATION

**status:** NOT_MATERIAL_IDENTIFIED

**rationale:** Im dokumentierten Entscheidungsgegenstand und den vorhandenen Wirkpfaden wurde kein materieller Bezug identifiziert.

###### impact_path_refs

_Leere Liste._

##### Eintrag 4

**policy_field:** WORK_SKILLS

**status:** NOT_MATERIAL_IDENTIFIED

**rationale:** Im dokumentierten Entscheidungsgegenstand und den vorhandenen Wirkpfaden wurde kein materieller Bezug identifiziert.

###### impact_path_refs

_Leere Liste._

##### Eintrag 5

**policy_field:** ECONOMY_TRANSFORMATION

**status:** MATERIAL

**rationale:** Kennzeichnung kann Nachfrage, Investitionen und Wettbewerbsbedingungen in Tierhaltung und Handel verändern.

###### impact_path_refs

- P1
- P2
- P4

##### Eintrag 6

**policy_field:** ENERGY_GRIDS

**status:** NOT_MATERIAL_IDENTIFIED

**rationale:** Im dokumentierten Entscheidungsgegenstand und den vorhandenen Wirkpfaden wurde kein materieller Bezug identifiziert.

###### impact_path_refs

_Leere Liste._

##### Eintrag 7

**policy_field:** MOBILITY

**status:** NOT_MATERIAL_IDENTIFIED

**rationale:** Im dokumentierten Entscheidungsgegenstand und den vorhandenen Wirkpfaden wurde kein materieller Bezug identifiziert.

###### impact_path_refs

_Leere Liste._

##### Eintrag 8

**policy_field:** CLIMATE_RESILIENCE

**status:** INDIRECT

**rationale:** Haltungsformen können Emissions-, Flächen- und Ressourcenwirkungen verändern; die Kennzeichnung allein garantiert dies nicht.

###### impact_path_refs

- P2
- P3

##### Eintrag 9

**policy_field:** DIGITAL_STATE_INFRASTRUCTURE

**status:** NOT_MATERIAL_IDENTIFIED

**rationale:** Im dokumentierten Entscheidungsgegenstand und den vorhandenen Wirkpfaden wurde kein materieller Bezug identifiziert.

###### impact_path_refs

_Leere Liste._

##### Eintrag 10

**policy_field:** STATE_ADMINISTRATION

**status:** MATERIAL

**rationale:** Anwendungsbeginn, Erfassung, Kontrolle und Sanktionierung bestimmen die tatsächliche Umsetzung.

###### impact_path_refs

- P1
- P4


#### mpd_dimensions

##### Eintrag 1

**dimension:** Mensch

###### impact_path_refs

- MON-01

**status:** MATERIAL

##### Eintrag 2

**dimension:** Planet

###### impact_path_refs

- MON-01

**status:** MATERIAL

##### Eintrag 3

**dimension:** Demokratie

###### impact_path_refs

- MON-01

**status:** MATERIAL


#### effect_improving_options

_Leere Liste._

#### historical_feedback

**status:** NOT_YET_ASSESSABLE

##### observed_developments

###### Eintrag 1

**finding_id:** 94cdfef9-F01

**evidence_type:** IMPLEMENTATION

**statement:** Belegt die erneute Verschiebung des Anwendungsbeginns auf 01.01.2027.

**observation_period:** 2026-01-15

**source_id:** CAND-BT-THKG-SECOND-AMENDMENT-20260115

**source_title:** Pflicht zur Verwendung der Tierhaltungskennzeichnung wird verschoben

**source_institution:** Deutscher Bundestag

**source_status:** CANDIDATE_ONLY

**what_it_supports:** Belegt die erneute Verschiebung des Anwendungsbeginns auf 01.01.2027.

**what_it_does_not_support:** Belegt noch keine Kennzeichnungsnutzung, Verbraucherreaktion, Betriebsinvestition oder Tierwohlwirkung.

**causal_limit:** Beobachtung, Vollzug oder Evaluation ersetzt ohne tragfähiges Gegenfaktum, Attribution und Unsicherheitsangabe keinen kausalen Wirkungsnachweis.

###### Eintrag 2

**finding_id:** 94cdfef9-F02

**evidence_type:** OBSERVATION

**statement:** Belegt, dass die Pflichtanwendung erneut verschoben wurde und Outcomes vor 2027 nicht sinnvoll zugerechnet werden können.

**observation_period:** 2026-01-15

**source_id:** CAND-BT-THKG-VERSCHIEBUNG-20260115

**source_title:** Pflicht zur Verwendung der Tierhaltungskennzeichnung wird verschoben

**source_institution:** Deutscher Bundestag

**source_status:** CANDIDATE_ONLY

**what_it_supports:** Belegt, dass die Pflichtanwendung erneut verschoben wurde und Outcomes vor 2027 nicht sinnvoll zugerechnet werden können.

**what_it_does_not_support:** Keine Aussage zu späterer Compliance, Kaufverhalten, Investitionen oder Tierwohl.

**causal_limit:** Beobachtung, Vollzug oder Evaluation ersetzt ohne tragfähiges Gegenfaktum, Attribution und Unsicherheitsangabe keinen kausalen Wirkungsnachweis.


**learning_point:** Die erneute Verschiebung des Anwendungsbeginns ist beobachtbarer Vollzug. Wirkung auf Kaufverhalten, Haltungsformen, Tierwohl, Preise und Betriebe kann sinnvoll erst nach verpflichtender Anwendung geprüft werden.

**ex_post_assessment:** NO_ROBUST_RETROSPECTIVE_ASSESSMENT

**counterfactual_status:** CANDIDATE_ONLY

##### monitoring_plan

###### indicators

- Abdeckung/Compliance, Bekanntheit und tatsächliche Nutzung der Kennzeichnung, Verteilung der Haltungsformen, Investitionen der Betriebe, Tierwohl-/Gesundheitsindikatoren sowie Preis- und Kostenwirkungen.

###### baseline_needed

- Markt-, Haltungsform-, Tierwohl- und Preisdaten 2025/2026 vor verpflichtender Anwendung.

**earliest_credible_review_date:** 2029-01-31

**date_rule:** Nach mindestens einem vollständigen Umsetzungs- und Beobachtungszyklus.

###### required_sources

- BMLEH/BLE
- Länder-Vollzug
- Destatis/Agrarstatistik
- amtliche Tierwohl-/Veterinärdaten
- amtlich beauftragte Evaluation

###### correction_triggers

- Weitere Verschiebung, geringe Compliance/Nutzung, keine messbare Tierwohlverbesserung oder materielle Verletzung nichtkompensierbarer Tierwohl-/Gesundheitsgrenzen.

**earliest_meaningful_review_date:** 2029-01-31

##### correction_triggers

- Weitere Verschiebung, geringe Compliance/Nutzung, keine messbare Tierwohlverbesserung oder materielle Verletzung nichtkompensierbarer Tierwohl-/Gesundheitsgrenzen.

##### causal_boundary

**implementation_or_output:** Darf als solcher belegt werden.

**observed_state_change:** Nur mit Messwert, Einheit, Zeitraum und Reichweite.

**causal_effect:** Nur mit Gegenfaktum, Attribution und Unsicherheit.

#### sources_and_evidence

##### official_sources

_Leere Liste._

##### candidate_sources

_Leere Liste._

##### assumptions

_Leere Liste._

##### calculation_inputs

###### Eintrag 1

**calculation_id:** C1

**name:** Vollzugsqualitätsgewinn

**specification:** Vergleich Fehler-/Nichtkonformitätsquote mit und ohne zusätzlichen Vorlauf.

###### required_inputs

- Kontrollen
- Fehlerquoten
- Länderreife

###### available_inputs

_Leere Liste._

###### missing_inputs

- Kontrollen
- Fehlerquoten
- Länderreife

**status:** DATA_GAP

###### Eintrag 2

**calculation_id:** C2

**name:** Verzögerte Markt-/Tierwohlwirkung

**specification:** Differenz in Kennzeichnungsabdeckung, Kaufreaktion und nachgelagerten Tierwohlindikatoren über sieben Monate.

###### required_inputs

- Abdeckung
- Kaufdaten
- Tierwohlindikatoren

###### available_inputs

_Leere Liste._

###### missing_inputs

- Abdeckung
- Kaufdaten
- Tierwohlindikatoren

**status:** DATA_GAP

###### Eintrag 3

**calculation_id:** C3

**name:** Netto-Vollzugsvergleich

**specification:** Qualitätsgewinn und Wirkungsverzögerung getrennt darstellen; keine Gleichsetzung von Kennzeichnung mit Tierwohl.

###### required_inputs

- C1
- C2

###### available_inputs

_Leere Liste._

###### missing_inputs

- C1
- C2

**status:** DATA_GAP


**counterfactual:** Vortrend und geeignete nicht erfasste Produkt-/Tierkategorien oder vergleichbare Kennzeichnungssysteme; Markt- und Regulierungsänderungen parallel kontrollieren.

##### uncertainties

_Leere Liste._

#### protection_gates

_Leere Liste._

#### assumptions_and_uncertainty

##### assumptions

_Leere Liste._

##### uncertainties

_Leere Liste._

**quantification_status:** NOT_ROBUSTLY_QUANTIFIABLE

**causal_boundary:** Beobachtete Zeitreihen, Vollzug oder Mittelabfluss sind ohne Gegenfaktum und Zurechnungsbasis kein kausaler Wirkungsnachweis.

**no_end_score:** `true`

**no_party_or_person_assessment:** `true`

#### status_rationale

**review_status:** PARTIAL

**material_data_gap_count:** 7

**open_calculation_requirement_count:** 3

**reason:** Die Entscheidung ist umgesetzt oder angelaufen; der sinnvolle Beobachtungszeitraum beziehungsweise die Outcome-Evidenz ist noch nicht vollständig.

#### effect_improving_options_structured

_Leere Liste._

#### reference_snapshot_reconciliation

**case_snapshot_preserved:** `true`

**preserved_case_snapshot_status:** INCOMPLETE_PENDING_TWO_LEADING_REFERENCES

**controlled_release_snapshot_id:** WOEK-CONTROLLED-REFERENCE-SNAPSHOT-2026-08-15

**controlled_release_snapshot_status:** CONTROLLED_WITH_ONE_METADATA_CONFLICT

**qualitative_mapping_status:** PROPOSED_PENDING_REFERENCE_RECONCILIATION

**consequence:** Qualitative SDG-, SDG+-, Grundrechts-, Staatsziel- und Schutzgüterzuordnungen sind publikationsfähig. Scores, Gewichtungen, Schwellenanwendungen und Präferenzurteile sind nicht Bestandteil dieses Releases.

### public_summary

**headline:** Tierhaltungskennzeichnung

**key_statement:** Eine Tierhaltungskennzeichnung kann Transparenz schaffen und Nachfrage sowie Investitionen verändern. Die tatsächliche Tierwohlwirkung hängt von vollständigem Anwendungsbereich, überprüfbaren Kriterien, Kontrollen, verständlicher Information und realen Haltungsverbesserungen ab.

**stage:** MONITORING

**what_is_known:** Wirkpfade und Risiken sind aus den vorliegenden amtlichen Quellen strukturiert.

**what_is_not_yet_known:** Eine belastbare Netto-Wirkung ist erst nach Baseline, Beobachtung, Gegenfaktum, Zurechnung, Unsicherheitsangabe und Schutzgate-Prüfung möglich.

#### improvement_options

- Wirkungsziele, Baseline, Zuständigkeit, Beobachtungsindikatoren, Korrekturtrigger und materielle Schutzgates ausdrücklich in die Umsetzung aufnehmen.

**publisher:** Institut für Wirkungsökonomie

**maturity_stage:** MONITORING

**evidence_boundary:** Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar. Sie ist kein Endscore und keine abgeschlossene kausale Netto-Wirkungsbewertung.

## B. Entscheidungsreife und Abstimmungsverhalten - vollständige Ergänzung

**schema_version:** 1.0.0

**case_id:** 94cdfef9-baca-41aa-91df-4a1dbd6b5d4e

**generated_at:** 2026-08-16T01:48:02+02:00

**method_reference:** WÖk v1.5 / Root AGENTS 1.0 / Decision-readiness supplement

**decision_object:** Erstes Gesetz zur Änderung des Tierhaltungskennzeichnungsgesetzes

**decision_status_at_review:** 2. Beratung

**temporal_mode:** RETROSPECTIVE_EX_ANTE_RECONSTRUCTION_AT_DECISION_DATE

### decision_object_clarity

**status:** CLEAR

**rationale:** Der rechtlich/parlamentarisch benannte Entscheidungsgegenstand wird getrennt von der Frage behandelt, ob seine Folgen bereits hinreichend evidenzbasiert entscheidbar sind.

### impact_information_readiness

**status:** CONDITIONAL_MATERIAL_EVIDENCE_GAPS

#### material_missing_information

- Vollzugsreife der Länder zum ursprünglichen und verschobenen Stichtag
- Registrierungs-/Melde-/Kontrollprozesse und Fehlerquoten
- Anteil korrekt gekennzeichneter Produkte und Marktabdeckung
- Verbraucherverständnis und Kaufverhalten
- Investitionen/Umstellungen in Haltungsformen
- Direkte Tierwohlindikatoren statt Kennzeichnung als Proxy
- Kosten der Umstellung und Vollzugskosten
- Vollzugs-/Umsetzungskapazität
- Zeitpfad
- Finanzierung/Personal/IT/Planung soweit relevant
- Verhaltensreaktionen und Rebound-/Verlagerungseffekte

**rule:** Materiale Datenlücken sind kein neutraler Wert. Sie begrenzen die Belastbarkeit einer Folgenentscheidung, ohne automatisch die formale Abstimmungsfähigkeit der Vorlage zu verneinen.

### decision_readiness

**status:** CONDITIONAL

**rationale:** Der Gegenstand ist grundsätzlich identifizierbar; die vorhandene Fachakte dokumentiert jedoch materielle offene Evidenz-, Gegenfaktums-, Vollzugs- oder Berechnungsfragen. Deshalb keine künstliche Ja/Nein-Endbewertung vor Schließung der entscheidungsrelevanten Lücken.

**not_equivalent_to_review_status:** METHOD_REVIEW_REQUIRED, DATA_GAP, PARTIAL und Monitoringstatus sind andere Dimensionen und werden nicht automatisch in Entscheidungsreife übersetzt.

### missing_decision_parameters

- Vollzugsreife der Länder zum ursprünglichen und verschobenen Stichtag
- Registrierungs-/Melde-/Kontrollprozesse und Fehlerquoten
- Anteil korrekt gekennzeichneter Produkte und Marktabdeckung
- Verbraucherverständnis und Kaufverhalten
- Investitionen/Umstellungen in Haltungsformen
- Direkte Tierwohlindikatoren statt Kennzeichnung als Proxy
- Kosten der Umstellung und Vollzugskosten
- Vollzugs-/Umsetzungskapazität
- Zeitpfad
- Finanzierung/Personal/IT/Planung soweit relevant
- Verhaltensreaktionen und Rebound-/Verlagerungseffekte

**better_decision_question:** Welche konkrete Ausgestaltung von „Erstes Gesetz zur Änderung des Tierhaltungskennzeichnungsgesetzes“ verbessert den benannten Zielzustand gegenüber Status quo und realistischen Alternativen nachweisbar, ohne Schutzgrenzen zu verletzen, und welche Daten müssen dafür vor bzw. nach der Entscheidung erhoben werden?

### alternative_designs_and_counterfactuals

#### Eintrag 1

**question:** Welche Fehler-/Vollzugsprobleme wären bei Start am ursprünglichen Termin aufgetreten?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.

#### Eintrag 2

**question:** Welche Tierwohl-/Marktwirkung geht durch sieben Monate Verzögerung verloren?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.

#### Eintrag 3

**question:** Wäre ein gestufter Start oder Übergang mit Toleranzregeln wirksamer gewesen?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.


### pre_decision_effect_screening

**status:** MATERIALITY_SCREEN_REQUIRED

**general_path:** Vorlage/Ankündigung/öffentliche Kommunikation → Exposition und Interpretation → Erwartungen, Risiko-/Kostenwahrnehmung oder Resonanz → mögliche Verhaltens-, Markt-, Verwaltungs- oder Vertrauensreaktion → mögliche spätere Zustandsveränderung.

#### screen_dimensions

- Erwartungen/Planbarkeit
- Vertrauen und Risiko-/Kostenwahrnehmung
- Verhaltens- oder Investitionsreaktionen
- Verwaltungs-/Marktreaktionen
- öffentliche Resonanz/Frames
- Plattform-/Medienverstärkung, soweit materiell

**evidence_boundary:** Ein plausibler Kommunikationspfad ist kein Nachweis eingetretener Medien- oder Verhaltenswirkung. Exposition, Wahrnehmung, Einstellungsänderung und Verhalten sind getrennt empirisch zu prüfen.

**intent_boundary:** Keine Absichtszuschreibung aus dem Wirkpfad.

### reversibility_and_lock_in

**status:** MUST_BE_CHECKED

#### questions

- Welche Teile der Entscheidung sind reversibel?
- Welche Rechts-, Infrastruktur-, Budget-, Daten- oder Verhaltens-Lock-ins können entstehen?
- Welche Exit-, Befristungs-, Evaluations- oder Korrekturmechanismen bestehen?

#### source_anchor_risks

##### Eintrag 1

**risk_id:** R1

**description:** Verzögerte Transparenz

**status:** TO_BE_TESTED

##### Eintrag 2

**risk_id:** R2

**description:** Verzögerte Tierwohl-Investitionsanreize

**status:** TO_BE_TESTED

##### Eintrag 3

**risk_id:** R3

**description:** Wiederholte Fristverschiebung/Regelungsunsicherheit

**status:** TO_BE_TESTED

##### Eintrag 4

**risk_id:** R4

**description:** Kennzeichnung ohne nachweisliche Tierwohlverbesserung

**status:** TO_BE_TESTED

##### Eintrag 5

**risk_id:** R5

**description:** Ungleiche Belastung bereits vorbereiteter vs. nicht vorbereiteter Akteure

**status:** TO_BE_TESTED


### decision_information_gap

#### required_before_or_for_review

- Vollzugsreife der Länder zum ursprünglichen und verschobenen Stichtag
- Registrierungs-/Melde-/Kontrollprozesse und Fehlerquoten
- Anteil korrekt gekennzeichneter Produkte und Marktabdeckung
- Verbraucherverständnis und Kaufverhalten
- Investitionen/Umstellungen in Haltungsformen
- Direkte Tierwohlindikatoren statt Kennzeichnung als Proxy
- Kosten der Umstellung und Vollzugskosten
- Vollzugs-/Umsetzungskapazität
- Zeitpfad
- Finanzierung/Personal/IT/Planung soweit relevant
- Verhaltensreaktionen und Rebound-/Verlagerungseffekte

#### calculation_requirements

##### Eintrag 1

**calculation_id:** C1

**name:** Vollzugsqualitätsgewinn

**specification:** Vergleich Fehler-/Nichtkonformitätsquote mit und ohne zusätzlichen Vorlauf.

###### required_inputs

- Kontrollen
- Fehlerquoten
- Länderreife

###### available_inputs

_Leere Liste._

###### missing_inputs

- Kontrollen
- Fehlerquoten
- Länderreife

**status:** DATA_GAP

##### Eintrag 2

**calculation_id:** C2

**name:** Verzögerte Markt-/Tierwohlwirkung

**specification:** Differenz in Kennzeichnungsabdeckung, Kaufreaktion und nachgelagerten Tierwohlindikatoren über sieben Monate.

###### required_inputs

- Abdeckung
- Kaufdaten
- Tierwohlindikatoren

###### available_inputs

_Leere Liste._

###### missing_inputs

- Abdeckung
- Kaufdaten
- Tierwohlindikatoren

**status:** DATA_GAP

##### Eintrag 3

**calculation_id:** C3

**name:** Netto-Vollzugsvergleich

**specification:** Qualitätsgewinn und Wirkungsverzögerung getrennt darstellen; keine Gleichsetzung von Kennzeichnung mit Tierwohl.

###### required_inputs

- C1
- C2

###### available_inputs

_Leere Liste._

###### missing_inputs

- C1
- C2

**status:** DATA_GAP


#### counterfactual_requirements

##### Eintrag 1

**question:** Welche Fehler-/Vollzugsprobleme wären bei Start am ursprünglichen Termin aufgetreten?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.

##### Eintrag 2

**question:** Welche Tierwohl-/Marktwirkung geht durch sieben Monate Verzögerung verloren?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.

##### Eintrag 3

**question:** Wäre ein gestufter Start oder Übergang mit Toleranzregeln wirksamer gewesen?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.


### decision_gate_conclusion

**status:** CONDITIONAL

**meaning:** Kein Für/gegen-Votum. Die Fachakte ist als Folgencheck nutzbar, muss aber die ausgewiesenen Daten-, Gegenfaktums- und Schutzfragen offen halten bzw. nachliefern.

### vote_layer

**status:** VOTED

**roll_call:** NOT_ROLL_CALL

**date:** 2025-06-26

**result:** ADOPTED

#### factions

**CDU/CSU:** YES

**SPD:** YES

**AfD:** NO

**B90/Grüne:** NO

**Die Linke:** NO

**url:** https://www.bundestag.de/dokumente/textarchiv/2025/kw23-de-tierhaltungskennzeichnung-1083666

**person_scoring_prohibited:** `true`

**vote_interpretation_rule:** Abstimmungsverhalten ist ein dokumentierter parlamentarischer Akt. Aus Ja/Nein/Enthaltung wird weder eine Motivation noch die gesamte Wirkung der Entscheidung oder ein Personenwert abgeleitet.