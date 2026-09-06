# Vollständige Fachakte - Gesetz über die Feststellung des Bundeshaushaltsplans für das Haushaltsjahr 2027 (Haushaltsgesetz 2027 - HG 2027)

> Die ursprüngliche Review-Datei bleibt unverändert. Das nachträgliche Entscheidungsreife-/Abstimmungssupplement wird ergänzend vollständig dargestellt. Keine Verdichtung.

## A. Ursprünglicher Review - vollständig

**analysis_version:** 1.1.0

### calculation_requirements

#### Eintrag 1

**calculation_id:** C1

**name:** Konsolidiertes Wirkungsbudget

**specification:** Kernhaushalt und Sondervermögen nach Transfers, Doppelzählungen, Ausgaberesten und Finanzierungsquellen konsolidieren; anschließend nach Wirkungsfeldern ausweisen.

##### required_inputs

- Kernhaushaltstitel
- Wirtschaftspläne aller Sondervermögen
- Transfermatrix
- Ausgabereste
- Finanzierungsquellen
- Programmzuordnung

##### available_inputs

_Leere Liste._

##### missing_inputs

- Kernhaushaltstitel
- Wirtschaftspläne aller Sondervermögen
- Transfermatrix
- Ausgabereste
- Finanzierungsquellen
- Programmzuordnung

**status:** DATA_GAP

#### Eintrag 2

**calculation_id:** C2

**name:** Investitionszusätzlichkeit

**specification:** Zusätzliche reale Investitionen gegenüber dem plausiblen Haushalts- und Projektgegenfaktum ermitteln; bloße Verlagerung oder Vorziehung separat ausweisen.

##### required_inputs

- Projektbaseline
- frühere Finanzplanung
- Projektstatus
- Kernhaushaltsvergleich
- Sondervermögenszuordnung
- Gegenfaktum

##### available_inputs

_Leere Liste._

##### missing_inputs

- Projektbaseline
- frühere Finanzplanung
- Projektstatus
- Kernhaushaltsvergleich
- Sondervermögenszuordnung
- Gegenfaktum

**status:** DATA_GAP

#### Eintrag 3

**calculation_id:** C3

**name:** Portfolio-Netto-Wirkung

**specification:** Positive und negative Outcomes je Portfolio mit Schutzgates zusammenführen; keine Addition über nichtkompensierbare Grenzen.

##### required_inputs

- Outcome-Indikatoren
- Baselines
- Reichweiten
- Attribution
- Unsicherheit
- Schutzgate-Prüfung

##### available_inputs

_Leere Liste._

##### missing_inputs

- Outcome-Indikatoren
- Baselines
- Reichweiten
- Attribution
- Unsicherheit
- Schutzgate-Prüfung

**status:** DATA_GAP

#### Eintrag 4

**calculation_id:** C4

**name:** Fiskalische Lebenszykluswirkung

**specification:** Kredit-, Zins-, Betriebs-, Wartungs- und Personalfolgekosten den vermiedenen Schäden und langfristigen Erträgen gegenüberstellen.

##### required_inputs

- Zinsprofil
- Tilgungsprofil
- Betriebs- und Wartungskosten
- Nutzungsdauer
- vermiedene Folgekosten
- Szenarien

##### available_inputs

_Leere Liste._

##### missing_inputs

- Zinsprofil
- Tilgungsprofil
- Betriebs- und Wartungskosten
- Nutzungsdauer
- vermiedene Folgekosten
- Szenarien

**status:** DATA_GAP

#### Eintrag 5

**calculation_id:** C5

**name:** Verteilungs- und Generationenwirkung

**specification:** Direkte und indirekte Lasten und Nutzen nach Gruppen, Regionen und Generationen ausweisen.

##### required_inputs

- Mikrodaten oder belastbare Verteilungsparameter
- Steuer-/Transferwirkung
- Nutzergruppen
- Regionaldaten
- Zeitprofil

##### available_inputs

_Leere Liste._

##### missing_inputs

- Mikrodaten oder belastbare Verteilungsparameter
- Steuer-/Transferwirkung
- Nutzergruppen
- Regionaldaten
- Zeitprofil

**status:** DATA_GAP

#### Eintrag 6

**calculation_id:** C6

**name:** Umsetzungs- und Absorptionsrisiko

**specification:** Reifegrad, Personal, Genehmigungen, Vergabekapazität und Lieferketten gegen Mittelvolumen und Zeitplan prüfen.

##### required_inputs

- Projektpipeline
- Reifegrad
- Personalbestand
- Vergabezeiten
- Genehmigungsstände
- Lieferkapazität

##### available_inputs

_Leere Liste._

##### missing_inputs

- Projektpipeline
- Reifegrad
- Personalbestand
- Vergabezeiten
- Genehmigungsstände
- Lieferkapazität

**status:** DATA_GAP


**case_id:** caf988db-91fe-435c-bbe1-4b4c55ccbbf3

### counterarguments

- Ein höherer Haushaltsansatz ist weder automatisch expansiver Realvollzug noch positive Wirkung; Preissteigerungen, Umschichtungen und Umsetzungsengpässe können den realen Effekt mindern.
- Mittelabfluss, Vergabe und Baufortschritt sind wichtige Outputs, aber noch keine Zustandsverbesserung.
- Kreditfinanzierung ist nicht per se gut oder schlecht; entscheidend sind Zusätzlichkeit, Netto-Wirkung, Lebenszyklus- und Opportunitätskosten.
- Ressortkürzungen oder -steigerungen dürfen nicht isoliert bewertet werden, weil Funktionen zwischen Kernhaushalt, Sondervermögen und anderen Einzelplänen verlagert sein können.
- Verteidigungs-, Klima-, Sozial- und Infrastrukturwirkungen sind nicht in einer einfachen Summe verrechenbar; Schutzgates und Mindestversorgung bleiben bindend.

### counterfactuals

#### Eintrag 1

**question:** Wie sähen Kernhaushalt, Sondervermögen und reale Investitionen bei Fortschreibung des 2026er Plans ohne HG 2027 aus?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 2

**question:** Welche regulären Ausgaben würden ohne Sondervermögen entfallen, später erfolgen oder aus dem Kernhaushalt finanziert?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 3

**question:** Welche alternative Allokation desselben Finanzierungsvolumens erzeugte höhere positive Netto-Wirkung bei geringeren Lebenszyklusrisiken?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 4

**question:** Welche Kosten und Schäden entstehen bei Nichtinvestition oder Verzögerung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 5

**question:** Wie verändern unterschiedliche Zins-, Inflations- und Umsetzungsszenarien die langfristige fiskalische und reale Wirkung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.


### cross_case_links

#### Eintrag 1

**case_id:** 539ca2eb-04ba-4bb9-b525-d30da6fe2747

**reason:** Digitalstaats- und Identitätsinfrastruktur benötigt Haushaltsmittel, Umsetzungskapazität und messbare Nutzerentlastung.

#### Eintrag 2

**case_id:** e9bbdd4a-9f5f-47e4-ac5a-bc347d1e659e

**reason:** Verwaltungsvereinfachung und Umweltkontrolle zeigen den Zielkonflikt zwischen Bürokratieabbau, Vollzugskapazität und Schutzwirkung.

#### Eintrag 3

**case_id:** ec3dd2c3-c21b-4050-830c-d6f5af416d3d

**reason:** Die ausgewiesenen Entlastungspotenziale müssen im Haushalt als reale Vollzugs- und Qualitätswirkung rückgekoppelt werden.


### data_gaps

#### Eintrag 1

**gap_id:** DG1

**description:** Konsolidierte Darstellung des Kernhaushalts und aller Sondervermögen ohne interne Transfers und Doppelzählungen.

**severity:** MATERIAL

#### Eintrag 2

**gap_id:** DG2

**description:** Titel- und programmbezogene Baselines, Zielzustände, Einheiten, räumliche Reichweite und Zeitbezug.

**severity:** MATERIAL

#### Eintrag 3

**gap_id:** DG3

**description:** Materielle Zusätzlichkeit gegenüber fortgeschriebenem Kernhaushalt und bereits geplanten Projekten.

**severity:** MATERIAL

#### Eintrag 4

**gap_id:** DG4

**description:** Ist-Vollzug und Mittelbindung früherer Jahre einschließlich Ausgaberesten und Verpflichtungen.

**severity:** MATERIAL

#### Eintrag 5

**gap_id:** DG5

**description:** Projektlisten, Reifegrade, Genehmigungsstände, Beschaffungspläne und Personal-/Planungskapazitäten.

**severity:** MATERIAL

#### Eintrag 6

**gap_id:** DG6

**description:** Lebenszyklus-, Betriebs-, Wartungs-, Personal- und Zinsfolgekosten.

**severity:** MATERIAL

#### Eintrag 7

**gap_id:** DG7

**description:** Verteilungswirkung nach Einkommen, Region, Geschlecht, Alter, Behinderung und Generation.

**severity:** MATERIAL

#### Eintrag 8

**gap_id:** DG8

**description:** Klima-, Ressourcen-, Biodiversitäts-, Gesundheits- und Sicherheitswirkungen der finanzierten Aktivitäten.

**severity:** MATERIAL

#### Eintrag 9

**gap_id:** DG9

**description:** Kausale Gegenfaktum-Grundlage für große Programme und Maßnahmenbündel.

**severity:** MATERIAL

#### Eintrag 10

**gap_id:** DG10

**description:** Unsicherheiten, Sensitivitäten und Szenarien zu Zinsen, Inflation, Baupreisen, Lieferketten und Umsetzungskapazität.

**severity:** MATERIAL

#### Eintrag 11

**gap_id:** DG11

**description:** Nichtkompensationsprüfung für Grundrechte, irreversible Umweltschäden, soziale Mindestversorgung und demokratische Budgetkontrolle.

**severity:** MATERIAL

#### Eintrag 12

**gap_id:** DG12

**description:** Öffentliche, maschinenlesbare Verknüpfung von Haushaltstitel, Output, Outcome, Evaluation und Korrekturentscheidung.

**severity:** MATERIAL


### decision

**object:** Gesetz über die Feststellung des Bundeshaushaltsplans für das Haushaltsjahr 2027 (Haushaltsgesetz 2027 - HG 2027)

**date:** `null`

**parliamentary_status:** Dem Bundestag zugeleitet - Noch nicht beraten

**actual_outcome:** `null`

**final_version:** `null`

**decision_state:** PENDING_PARLIAMENTARY_DECISION

**confirmation_status:** PENDING_PARLIAMENTARY_DECISION

#### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

### ex_ante

**assessment_type:** WIRKUNGSPOTENZIAL_WIRKUNGSRISIKO_AND_CHANGE_LEVERS

**scope_statement:** Der Haushaltsentwurf wird als gekoppeltes Wirkungsportfolio geprüft. Ermächtigungen und Ansatzhöhen sind Inputs; Bindung, Vergabe und Auszahlung sind Outputs; erst beobachtete Zustandsänderungen sind Outcomes. Eine kausal zurechenbare Haushaltswirkung setzt Gegenfaktum und Attribution voraus.

**overall_potential:** Der Haushalt 2027 besitzt ein sehr großes Wirkungspotenzial, weil er Ressourcen, Kreditspielräume, Verpflichtungsermächtigungen und Sondervermögen über nahezu alle staatlichen Wirkungsfelder verteilt. Die amtliche Fassung erlaubt jedoch noch keine Aussage darüber, ob die Mittel zusätzliche, positive Netto-Wirkung erzeugen, vorhandene Ausgaben ersetzen, Lock-ins verstärken oder durch Umsetzungsengpässe ungenutzt bleiben.

#### impact_paths

##### Eintrag 1

**path_id:** P1

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Gesamtallokation und Priorisierung des Kernhaushalts

**hypothesis:** Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

###### affected_groups

- Bevölkerung
- Unternehmen
- Kommunen und Länder
- künftige Generationen

###### prerequisites

- Wirkungsziele je Titel/Programm
- vollständige Konsolidierung
- Umsetzungskapazität
- transparente Verteilungsanalyse

###### risks_and_side_effects

- Mittelansatz wird mit Wirkung verwechselt
- Ressort-Silos und Doppelzählung
- Verdrängung wirksamerer Alternativen

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Für große Titel verbindliche Wirkungslogik mit Baseline, Zielzustand, Meilensteinen, Schutzgates, Verantwortlichkeit und Korrekturmechanismus in Haushaltsvermerken verankern.

###### normative_target_areas

- Daseinsvorsorge
- Systemresilienz
- öffentliche Rechenschaft

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 2

**path_id:** P2

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Verteidigungs- und Sicherheitsausgaben einschließlich Sondervermögen und Verpflichtungsermächtigungen

**hypothesis:** Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Demokratie
- Planet

###### affected_groups

- Bevölkerung
- Soldatinnen und Soldaten
- Beschäftigte der Sicherheits- und Rüstungsindustrie
- Bündnispartner
- künftige Haushalte

###### prerequisites

- fähigkeitsbasierte Bedarfsplanung
- Beschaffungsreife
- Lebenszyklus- und Betriebskosten
- Export- und Menschenrechtskontrolle
- parlamentarische Transparenz

###### risks_and_side_effects

- mehrjährige Lock-ins
- Kostensteigerungen und Lieferverzögerungen
- Opportunitätskosten
- ökologische Belastungen
- Sicherheitsausgaben ohne messbaren Fähigkeitszuwachs

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Verpflichtungsermächtigungen an nachprüfbare Fähigkeitslücken, Lebenszykluskosten, Interoperabilität, Resilienz und Abbruch-/Nachsteuerungsklauseln binden.

###### normative_target_areas

- Frieden und Sicherheit
- demokratische Resilienz
- verantwortliche Beschaffung

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 3

**path_id:** P3

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Sondervermögen Infrastruktur und Klimaneutralität

**hypothesis:** Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

###### affected_groups

- Pendlerinnen und Pendler
- Kommunen
- Unternehmen
- Kinder und Lernende
- Energieverbraucher
- künftige Generationen

###### prerequisites

- materielle Zusätzlichkeit
- projektbezogene Reife
- Priorisierung nach Netto-Wirkung
- Klimakompatibilität
- kommunale Absorptionsfähigkeit

###### risks_and_side_effects

- Umetikettierung regulärer Ausgaben
- Mittelabfluss ohne Outcome
- graue Emissionen und Flächenverbrauch
- Lock-in fossiler oder autozentrierter Infrastruktur

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Projektpass mit Ausgangszustand, Gegenfaktum, Lebenszykluswirkung, Zugänglichkeit, Resilienz, Zusätzlichkeit und Transformationshebel verpflichtend machen.

###### normative_target_areas

- SDG 9
- SDG 11
- SDG 13
- gesellschaftliche Resilienz

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 4

**path_id:** P4

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Klima- und Transformationsfonds sowie ökologische Haushaltsanteile

**hypothesis:** Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Planet
- Mensch
- Demokratie

###### affected_groups

- Haushalte
- Industrie
- Beschäftigte in Transformationsbranchen
- klimaverwundbare Gruppen
- Ökosysteme

###### prerequisites

- zusätzliche Emissionsminderung
- Lebenszyklusbewertung
- soziale Zugänglichkeit
- Netz- und Systemintegration
- kein schädlicher fossiler Lock-in

###### risks_and_side_effects

- Mitnahmeeffekte
- regressive Verteilung
- Verlagerung statt Minderung
- Biodiversitäts- oder Rohstoffkonflikte

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Förderentscheidungen mit messbarer Emissions- und Ressourcenwirkung, Verteilungsprüfung und Nichtkompensationsgates versehen.

###### normative_target_areas

- SDG 7
- SDG 12
- SDG 13
- SDG 15

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 5

**path_id:** P5

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Arbeit und Soziales

**hypothesis:** Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Demokratie

###### affected_groups

- Arbeitsuchende
- Rentnerinnen und Rentner
- Menschen mit Behinderung
- Familien
- Beschäftigte

###### prerequisites

- Zugänglichkeit
- Armuts- und Teilhabewirkung
- Verwaltungsfähigkeit
- Verknüpfung mit Prävention und Befähigung

###### risks_and_side_effects

- reine Transfer-/Ausgabenlogik ohne Zustandsziel
- Nichtinanspruchnahme
- bürokratische Ausschlüsse
- Verfestigung statt Befähigung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Nicht nur Leistungsvolumen, sondern Armutsrisiko, materielle Teilhabe, Übergänge in gute Arbeit und Zugangsbarrieren als Ergebnisindikatoren führen.

###### normative_target_areas

- SDG 1
- SDG 8
- SDG 10
- gesellschaftlicher Zusammenhalt

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 6

**path_id:** P6

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Gesundheit und Pflege

**hypothesis:** Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Demokratie

###### affected_groups

- Patientinnen und Patienten
- Pflegebedürftige
- Gesundheits- und Pflegepersonal
- ländliche Regionen

###### prerequisites

- Versorgungsbedarfsplanung
- Personal- und Umsetzungskapazität
- Präventionsorientierung
- Zugangsgerechtigkeit

###### risks_and_side_effects

- Kürzung oder Umschichtung ohne Wirkungsanalyse
- Reparaturfinanzierung statt Prävention
- regionale Unterversorgung
- Überlastung des Personals

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Abweichungen gegenüber 2026 funktional erklären und an Versorgungsqualität, vermeidbare Erkrankung, Personalstabilität und regionale Erreichbarkeit koppeln.

###### normative_target_areas

- SDG 3
- Gesundheitsresilienz
- Zugangsgerechtigkeit

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 7

**path_id:** P7

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Bildung, Familie, Jugend, Forschung und Technologie

**hypothesis:** Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Demokratie
- Planet

###### affected_groups

- Kinder
- Jugendliche
- Familien
- Lernende
- Forschende
- Unternehmen

###### prerequisites

- Zielgruppengenauigkeit
- langfristige Finanzierung
- Transfer in Praxis
- offener und sicherer Wissenszugang

###### risks_and_side_effects

- kurzfristige Projektlogik
- soziale Selektivität
- Forschung ohne Wirkungs- und Transferbezug
- digitale Exklusion

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Mittel mit Bildungszugang, Kompetenzzuwachs, Transferwirkung, Forschungsintegrität und Zukunftsfähigkeit verknüpfen.

###### normative_target_areas

- SDG 4
- SDG 9
- SDG+ Wissen und Technologieverantwortung

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 8

**path_id:** P8

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Verkehr, Wohnen, Stadtentwicklung und Entwicklungspolitik

**hypothesis:** Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

###### affected_groups

- Mieterinnen und Mieter
- Pendler
- Kommunen
- ländliche Räume
- Partnerländer
- vulnerable Gruppen

###### prerequisites

- Bedarfs- und Verteilungsanalyse
- Klimakompatibilität
- Lebenszykluskosten
- Barrierefreiheit
- Partnerschaftlichkeit

###### risks_and_side_effects

- Instandhaltungsstau
- sozial selektive Investitionen
- fossile/straßenbezogene Lock-ins
- Destabilisierung durch Kürzungen

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Kürzungen und Umschichtungen gegen Mindestversorgungs-, Klima-, Bezahlbarkeits- und Resilienzindikatoren prüfen; keine pauschale Ressortbewertung nur nach Betrag.

###### normative_target_areas

- SDG 10
- SDG 11
- SDG 13
- SDG 17

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 9

**path_id:** P9

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Digitales und Staatsmodernisierung

**hypothesis:** Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Demokratie
- Planet

###### affected_groups

- Bürgerinnen und Bürger
- Unternehmen
- Verwaltungsbeschäftigte
- Menschen mit Behinderung oder geringer Digitalkompetenz

###### prerequisites

- Interoperabilität
- Informationssicherheit
- Barrierefreiheit
- analoge Alternativen
- Prozessneugestaltung statt bloßer Digitalisierung

###### risks_and_side_effects

- digitale Exklusion
- Lock-in proprietärer Systeme
- Cyberrisiken
- Automatisierung ineffizienter Prozesse

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Vorhaben an Ende-zu-Ende-Zeit, Fehlerquote, Zugänglichkeit, Datensouveränität, Energiebedarf und tatsächliche Nutzerentlastung koppeln.

###### normative_target_areas

- SDG 9
- SDG 16
- SDG+ digitale Selbstbestimmung

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 10

**path_id:** P10

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Kreditaufnahme, Zinslast und fiskalische Resilienz

**hypothesis:** Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

###### affected_groups

- heutige und künftige Steuerzahlende
- öffentliche Leistungssysteme
- Kapitalmarkt
- Kommunen und Länder

###### prerequisites

- produktive und zusätzliche Mittelverwendung
- tragfähiges Zins- und Laufzeitenmanagement
- transparente Folgekosten
- Nutzen über Finanzierungskosten

###### risks_and_side_effects

- steigende Zinsbindung verdrängt spätere Wirkungsausgaben
- Schulden finanzieren laufende oder nicht zusätzliche Ausgaben
- intergenerationelle Lastverschiebung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Für kreditfinanzierte Großprogramme erwartete Zustandswirkung, vermiedene Folgekosten, Betriebsfolgekosten, Tilgungsprofil und Sensitivitäten offenlegen.

###### normative_target_areas

- fiskalische Resilienz
- Generationengerechtigkeit
- SDG 16

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 11

**path_id:** P11

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Mehrjährige Verpflichtungsermächtigungen

**hypothesis:** Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.

**direction:** AMBIVALENT

###### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

###### affected_groups

- künftige Haushaltsgesetzgeber
- Auftragnehmer
- öffentliche Einrichtungen
- künftige Generationen

###### prerequisites

- realistische Bedarfs- und Kostenplanung
- Meilensteinsteuerung
- Kündigungs- und Anpassungsrechte
- Transparenz künftiger Bindungen

###### risks_and_side_effects

- Pfadabhängigkeit
- Kosten- und Technologie-Lock-in
- Aushöhlung künftiger Budgethoheit
- Fortführung trotz schlechter Wirkung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Verpflichtungsermächtigungen mit stufenweiser Freigabe, Wirkungskriterien, unabhängiger Prüfung und Stop-or-Adapt-Triggern versehen.

###### normative_target_areas

- demokratische Haushaltskontrolle
- langfristige Resilienz

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

##### Eintrag 12

**path_id:** P12

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Umsetzungskapazität, Mittelabfluss und lernende Rückkopplung

**hypothesis:** Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.

**direction:** POSITIVE_POTENTIAL

###### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

###### affected_groups

- Parlament
- Verwaltung
- Zuwendungsempfänger
- Öffentlichkeit

###### prerequisites

- einheitliche Datenarchitektur
- klare Baselines
- öffentliches Register
- Auditierbarkeit
- Korrekturkompetenz

###### risks_and_side_effects

- Kennzahlen ohne Entscheidungen
- Mittelabfluss als Erfolgsersatz
- Datenfriedhöfe
- strategische Zielverschiebung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Quartalsweise Output- und jährliche Outcome-Rückkopplung mit Ursachenanalyse, Gegenfaktum-Plan und verbindlicher Umschichtungs-/Korrekturlogik einführen.

###### normative_target_areas

- SDG 16
- öffentliche Transparenz
- Wirkungsfähigkeit des Staates

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`


#### portfolio_architecture

**assessment_unit:** Bundeshaushalt 2027 als Portfolio aus Kernhaushalt, Sondervermögen, Kreditermächtigungen und mehrjährigen Verpflichtungsermächtigungen

##### official_inputs

**core_budget_2027_eur:** 555435744000

**core_budget_2026_plan_eur:** 524540138000

**core_budget_change_eur:** 30895606000

**tax_revenue_2027_eur:** 394721000000

**net_borrowing_authorisation_2027_eur:** 118727000000

**financing_balance_2027_eur:** -125546865000

**core_investment_2027_eur:** 56272282000

**core_investment_2026_plan_eur:** 58353829000

**core_investment_change_eur:** -2081547000

**federal_debt_budget_2027_eur:** 43610595000

**federal_debt_budget_2026_plan_eur:** 33649367000

**article_115_exception_expenditure_eur:** 130059222000

**debt_rule_relevant_net_borrowing_eur:** 33366000000

**total_commitment_authorisations_eur:** 367849614000

**defence_commitment_authorisations_eur:** 291917764000

##### separately_reported_special_funds

###### Eintrag 1

**name:** Sondervermögen Bundeswehr

**2027_plan_eur:** 29955311000

###### Eintrag 2

**name:** Sondervermögen Infrastruktur und Klimaneutralität

**2027_plan_eur:** 54924922000

###### Eintrag 3

**name:** Klima- und Transformationsfonds

**2027_plan_eur:** 38938012000

###### Eintrag 4

**name:** Aufbauhilfe 2021

**2027_plan_eur:** 2570938000


**consolidation_rule:** Kernhaushalt und Sondervermögen dürfen ohne belastbare Konsolidierung, Transferbereinigung und Prüfung der Zusätzlichkeit nicht zu einer vermeintlichen Gesamtwirkung addiert werden.

##### ministry_allocation_signals

###### Eintrag 1

**portfolio:** Arbeit und Soziales

**2027_eur:** 201461027000

**change_vs_2026_plan_eur:** 4119987000

###### Eintrag 2

**portfolio:** Verteidigung

**2027_eur:** 109749619000

**change_vs_2026_plan_eur:** 27062307000

###### Eintrag 3

**portfolio:** Gesundheit

**2027_eur:** 14336568000

**change_vs_2026_plan_eur:** -7437377000

###### Eintrag 4

**portfolio:** Verkehr

**2027_eur:** 26430230000

**change_vs_2026_plan_eur:** -1471130000

###### Eintrag 5

**portfolio:** Umwelt, Naturschutz und nukleare Sicherheit

**2027_eur:** 2740533000

**change_vs_2026_plan_eur:** -31556000

###### Eintrag 6

**portfolio:** Bildung, Familie, Frauen und Jugend

**2027_eur:** 15478330000

**change_vs_2026_plan_eur:** -1185684000

###### Eintrag 7

**portfolio:** Wirtschaftliche Zusammenarbeit und Entwicklung

**2027_eur:** 9469110000

**change_vs_2026_plan_eur:** -586623000

###### Eintrag 8

**portfolio:** Wohnen, Stadtentwicklung und Bauwesen

**2027_eur:** 7509080000

**change_vs_2026_plan_eur:** -236601000

###### Eintrag 9

**portfolio:** Forschung, Technologie und Raumfahrt

**2027_eur:** 21966289000

**change_vs_2026_plan_eur:** 148020000

###### Eintrag 10

**portfolio:** Digitales und Staatsmodernisierung

**2027_eur:** 1444241000

**change_vs_2026_plan_eur:** 84617000

###### Eintrag 11

**portfolio:** Inneres

**2027_eur:** 16712949000

**change_vs_2026_plan_eur:** 951354000


**interpretation_boundary:** Ressourcenverschiebungen zeigen politische Priorisierung und finanzielles Wirkungspotenzial. Sie beweisen weder Effizienz noch Zielerreichung, Verteilungswirkung, Zusätzlichkeit oder positive Netto-Wirkung.

**evidence_boundary:** Die Quellen belegen Entwurf, Regelungsmechanik und gegebenenfalls amtliche Schätzungen; sie belegen noch keine eingetretene Wirkung der aktuellen Vorlage.

**score_status:** NO_SCORE_PERMITTED

### ex_post

**assessment_status:** NOT_YET_ASSESSABLE

**observed_current_proposal_effect:** `null`

**reason:** Die parlamentarische Entscheidung und Umsetzung stehen aus. Historische Rückkopplungen werden separat als Kontext behandelt und nicht der aktuellen Vorlage zugerechnet.

#### output_outcome_impact_separation

**output:** Rechtsänderung, Mittelbindung, administrative Einführung oder Vollzugsaktivität wären zunächst Outputs.

**outcome:** Erst beobachtete Veränderungen bei Betroffenen, Institutionen, Umwelt oder Systemzuständen sind Outcomes.

**causal_impact:** Eine kausal zurechenbare Wirkung erfordert Gegenfaktum, Attribution, Reichweite und Unsicherheitsangabe.

**generated_at:** 2026-08-15T08:40:45Z

### impact_domains

#### Eintrag 1

**domain:** Mensch

##### relevance

- soziale Sicherheit
- Gesundheit und Pflege
- Bildung und Chancen
- bezahlbares Wohnen
- Mobilität und Zugang
- Arbeit und Teilhabe

**assessment:** EX_ANTE_ONLY

#### Eintrag 2

**domain:** Planet

##### relevance

- Klimaschutz
- Energie- und Ressourceneffizienz
- Kreislaufwirtschaft
- Biodiversität
- Klimaanpassung

**assessment:** EX_ANTE_ONLY

#### Eintrag 3

**domain:** Demokratie

##### relevance

- Haushaltstransparenz
- parlamentarische Budgethoheit
- öffentliche Rechenschaft
- staatliche Leistungsfähigkeit
- Sicherheits- und Krisenresilienz

**assessment:** EX_ANTE_ONLY


### impact_paths

#### Eintrag 1

**path_id:** P1

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Gesamtallokation und Priorisierung des Kernhaushalts

**hypothesis:** Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

##### affected_groups

- Bevölkerung
- Unternehmen
- Kommunen und Länder
- künftige Generationen

##### prerequisites

- Wirkungsziele je Titel/Programm
- vollständige Konsolidierung
- Umsetzungskapazität
- transparente Verteilungsanalyse

##### risks_and_side_effects

- Mittelansatz wird mit Wirkung verwechselt
- Ressort-Silos und Doppelzählung
- Verdrängung wirksamerer Alternativen

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Für große Titel verbindliche Wirkungslogik mit Baseline, Zielzustand, Meilensteinen, Schutzgates, Verantwortlichkeit und Korrekturmechanismus in Haushaltsvermerken verankern.

##### normative_target_areas

- Daseinsvorsorge
- Systemresilienz
- öffentliche Rechenschaft

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 2

**path_id:** P2

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Verteidigungs- und Sicherheitsausgaben einschließlich Sondervermögen und Verpflichtungsermächtigungen

**hypothesis:** Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Demokratie
- Planet

##### affected_groups

- Bevölkerung
- Soldatinnen und Soldaten
- Beschäftigte der Sicherheits- und Rüstungsindustrie
- Bündnispartner
- künftige Haushalte

##### prerequisites

- fähigkeitsbasierte Bedarfsplanung
- Beschaffungsreife
- Lebenszyklus- und Betriebskosten
- Export- und Menschenrechtskontrolle
- parlamentarische Transparenz

##### risks_and_side_effects

- mehrjährige Lock-ins
- Kostensteigerungen und Lieferverzögerungen
- Opportunitätskosten
- ökologische Belastungen
- Sicherheitsausgaben ohne messbaren Fähigkeitszuwachs

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Verpflichtungsermächtigungen an nachprüfbare Fähigkeitslücken, Lebenszykluskosten, Interoperabilität, Resilienz und Abbruch-/Nachsteuerungsklauseln binden.

##### normative_target_areas

- Frieden und Sicherheit
- demokratische Resilienz
- verantwortliche Beschaffung

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 3

**path_id:** P3

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Sondervermögen Infrastruktur und Klimaneutralität

**hypothesis:** Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

##### affected_groups

- Pendlerinnen und Pendler
- Kommunen
- Unternehmen
- Kinder und Lernende
- Energieverbraucher
- künftige Generationen

##### prerequisites

- materielle Zusätzlichkeit
- projektbezogene Reife
- Priorisierung nach Netto-Wirkung
- Klimakompatibilität
- kommunale Absorptionsfähigkeit

##### risks_and_side_effects

- Umetikettierung regulärer Ausgaben
- Mittelabfluss ohne Outcome
- graue Emissionen und Flächenverbrauch
- Lock-in fossiler oder autozentrierter Infrastruktur

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Projektpass mit Ausgangszustand, Gegenfaktum, Lebenszykluswirkung, Zugänglichkeit, Resilienz, Zusätzlichkeit und Transformationshebel verpflichtend machen.

##### normative_target_areas

- SDG 9
- SDG 11
- SDG 13
- gesellschaftliche Resilienz

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 4

**path_id:** P4

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Klima- und Transformationsfonds sowie ökologische Haushaltsanteile

**hypothesis:** Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Planet
- Mensch
- Demokratie

##### affected_groups

- Haushalte
- Industrie
- Beschäftigte in Transformationsbranchen
- klimaverwundbare Gruppen
- Ökosysteme

##### prerequisites

- zusätzliche Emissionsminderung
- Lebenszyklusbewertung
- soziale Zugänglichkeit
- Netz- und Systemintegration
- kein schädlicher fossiler Lock-in

##### risks_and_side_effects

- Mitnahmeeffekte
- regressive Verteilung
- Verlagerung statt Minderung
- Biodiversitäts- oder Rohstoffkonflikte

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Förderentscheidungen mit messbarer Emissions- und Ressourcenwirkung, Verteilungsprüfung und Nichtkompensationsgates versehen.

##### normative_target_areas

- SDG 7
- SDG 12
- SDG 13
- SDG 15

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 5

**path_id:** P5

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Arbeit und Soziales

**hypothesis:** Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Demokratie

##### affected_groups

- Arbeitsuchende
- Rentnerinnen und Rentner
- Menschen mit Behinderung
- Familien
- Beschäftigte

##### prerequisites

- Zugänglichkeit
- Armuts- und Teilhabewirkung
- Verwaltungsfähigkeit
- Verknüpfung mit Prävention und Befähigung

##### risks_and_side_effects

- reine Transfer-/Ausgabenlogik ohne Zustandsziel
- Nichtinanspruchnahme
- bürokratische Ausschlüsse
- Verfestigung statt Befähigung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Nicht nur Leistungsvolumen, sondern Armutsrisiko, materielle Teilhabe, Übergänge in gute Arbeit und Zugangsbarrieren als Ergebnisindikatoren führen.

##### normative_target_areas

- SDG 1
- SDG 8
- SDG 10
- gesellschaftlicher Zusammenhalt

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 6

**path_id:** P6

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Gesundheit und Pflege

**hypothesis:** Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Demokratie

##### affected_groups

- Patientinnen und Patienten
- Pflegebedürftige
- Gesundheits- und Pflegepersonal
- ländliche Regionen

##### prerequisites

- Versorgungsbedarfsplanung
- Personal- und Umsetzungskapazität
- Präventionsorientierung
- Zugangsgerechtigkeit

##### risks_and_side_effects

- Kürzung oder Umschichtung ohne Wirkungsanalyse
- Reparaturfinanzierung statt Prävention
- regionale Unterversorgung
- Überlastung des Personals

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Abweichungen gegenüber 2026 funktional erklären und an Versorgungsqualität, vermeidbare Erkrankung, Personalstabilität und regionale Erreichbarkeit koppeln.

##### normative_target_areas

- SDG 3
- Gesundheitsresilienz
- Zugangsgerechtigkeit

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 7

**path_id:** P7

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Bildung, Familie, Jugend, Forschung und Technologie

**hypothesis:** Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Demokratie
- Planet

##### affected_groups

- Kinder
- Jugendliche
- Familien
- Lernende
- Forschende
- Unternehmen

##### prerequisites

- Zielgruppengenauigkeit
- langfristige Finanzierung
- Transfer in Praxis
- offener und sicherer Wissenszugang

##### risks_and_side_effects

- kurzfristige Projektlogik
- soziale Selektivität
- Forschung ohne Wirkungs- und Transferbezug
- digitale Exklusion

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Mittel mit Bildungszugang, Kompetenzzuwachs, Transferwirkung, Forschungsintegrität und Zukunftsfähigkeit verknüpfen.

##### normative_target_areas

- SDG 4
- SDG 9
- SDG+ Wissen und Technologieverantwortung

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 8

**path_id:** P8

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Verkehr, Wohnen, Stadtentwicklung und Entwicklungspolitik

**hypothesis:** Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

##### affected_groups

- Mieterinnen und Mieter
- Pendler
- Kommunen
- ländliche Räume
- Partnerländer
- vulnerable Gruppen

##### prerequisites

- Bedarfs- und Verteilungsanalyse
- Klimakompatibilität
- Lebenszykluskosten
- Barrierefreiheit
- Partnerschaftlichkeit

##### risks_and_side_effects

- Instandhaltungsstau
- sozial selektive Investitionen
- fossile/straßenbezogene Lock-ins
- Destabilisierung durch Kürzungen

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Kürzungen und Umschichtungen gegen Mindestversorgungs-, Klima-, Bezahlbarkeits- und Resilienzindikatoren prüfen; keine pauschale Ressortbewertung nur nach Betrag.

##### normative_target_areas

- SDG 10
- SDG 11
- SDG 13
- SDG 17

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 9

**path_id:** P9

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Digitales und Staatsmodernisierung

**hypothesis:** Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Demokratie
- Planet

##### affected_groups

- Bürgerinnen und Bürger
- Unternehmen
- Verwaltungsbeschäftigte
- Menschen mit Behinderung oder geringer Digitalkompetenz

##### prerequisites

- Interoperabilität
- Informationssicherheit
- Barrierefreiheit
- analoge Alternativen
- Prozessneugestaltung statt bloßer Digitalisierung

##### risks_and_side_effects

- digitale Exklusion
- Lock-in proprietärer Systeme
- Cyberrisiken
- Automatisierung ineffizienter Prozesse

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Vorhaben an Ende-zu-Ende-Zeit, Fehlerquote, Zugänglichkeit, Datensouveränität, Energiebedarf und tatsächliche Nutzerentlastung koppeln.

##### normative_target_areas

- SDG 9
- SDG 16
- SDG+ digitale Selbstbestimmung

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 10

**path_id:** P10

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Kreditaufnahme, Zinslast und fiskalische Resilienz

**hypothesis:** Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

##### affected_groups

- heutige und künftige Steuerzahlende
- öffentliche Leistungssysteme
- Kapitalmarkt
- Kommunen und Länder

##### prerequisites

- produktive und zusätzliche Mittelverwendung
- tragfähiges Zins- und Laufzeitenmanagement
- transparente Folgekosten
- Nutzen über Finanzierungskosten

##### risks_and_side_effects

- steigende Zinsbindung verdrängt spätere Wirkungsausgaben
- Schulden finanzieren laufende oder nicht zusätzliche Ausgaben
- intergenerationelle Lastverschiebung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Für kreditfinanzierte Großprogramme erwartete Zustandswirkung, vermiedene Folgekosten, Betriebsfolgekosten, Tilgungsprofil und Sensitivitäten offenlegen.

##### normative_target_areas

- fiskalische Resilienz
- Generationengerechtigkeit
- SDG 16

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 11

**path_id:** P11

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Mehrjährige Verpflichtungsermächtigungen

**hypothesis:** Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.

**direction:** AMBIVALENT

##### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

##### affected_groups

- künftige Haushaltsgesetzgeber
- Auftragnehmer
- öffentliche Einrichtungen
- künftige Generationen

##### prerequisites

- realistische Bedarfs- und Kostenplanung
- Meilensteinsteuerung
- Kündigungs- und Anpassungsrechte
- Transparenz künftiger Bindungen

##### risks_and_side_effects

- Pfadabhängigkeit
- Kosten- und Technologie-Lock-in
- Aushöhlung künftiger Budgethoheit
- Fortführung trotz schlechter Wirkung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Verpflichtungsermächtigungen mit stufenweiser Freigabe, Wirkungskriterien, unabhängiger Prüfung und Stop-or-Adapt-Triggern versehen.

##### normative_target_areas

- demokratische Haushaltskontrolle
- langfristige Resilienz

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`

#### Eintrag 12

**path_id:** P12

**type:** CAUSAL_HYPOTHESIS_EX_ANTE

**lever:** Umsetzungskapazität, Mittelabfluss und lernende Rückkopplung

**hypothesis:** Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.

**direction:** POSITIVE_POTENTIAL

##### affected_mpd_dimensions

- Mensch
- Planet
- Demokratie

##### affected_groups

- Parlament
- Verwaltung
- Zuwendungsempfänger
- Öffentlichkeit

##### prerequisites

- einheitliche Datenarchitektur
- klare Baselines
- öffentliches Register
- Auditierbarkeit
- Korrekturkompetenz

##### risks_and_side_effects

- Kennzahlen ohne Entscheidungen
- Mittelabfluss als Erfolgsersatz
- Datenfriedhöfe
- strategische Zielverschiebung

**evidence_boundary:** Die amtliche Vorlage dokumentiert Regelungsabsicht und Mechanismus, nicht die spätere Zustandsänderung oder Kausalwirkung.

**change_lever_for_positive_net_impact:** Quartalsweise Output- und jährliche Outcome-Rückkopplung mit Ursachenanalyse, Gegenfaktum-Plan und verbindlicher Umschichtungs-/Korrekturlogik einführen.

##### normative_target_areas

- SDG 16
- öffentliche Transparenz
- Wirkungsfähigkeit des Staates

##### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**evidence_status:** OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION

**requires_validation:** `true`

**analytical_derivation:** `true`


**input_package_hash:** bc17ce64339b3a1503de3cb64f5711f937f366f23264b11220ed9bf157ac5ff9

### non_compensable_boundaries

#### Eintrag 1

**boundary:** Grund- und Menschenrechte sowie diskriminierungsfreier Zugang zu staatlichen Leistungen.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

#### Eintrag 2

**boundary:** Soziale Mindestversorgung in Gesundheit, Pflege, Bildung, Wohnen und Existenzsicherung.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

#### Eintrag 3

**boundary:** Irreversible Klima-, Biodiversitäts-, Ressourcen- und Gesundheitsschäden.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

#### Eintrag 4

**boundary:** Demokratische Budgethoheit, Transparenz und parlamentarische Kontrolle.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

#### Eintrag 5

**boundary:** Sicherheits- und Verteidigungsfähigkeit bei gleichzeitiger Rechtsstaatlichkeit und ziviler Kontrolle.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

#### Eintrag 6

**boundary:** Intergenerationelle Tragfähigkeit einschließlich nicht offengelegter Folgekosten und Lock-ins.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.


### normative_mapping

**reference_frame:** SDGs, SDG+ sowie getrennt Grundrechte, Staatsziele, Staatsstrukturprinzipien und Schutzaufträge

**mapping_status:** PROPOSED_PENDING_REFERENCE_RECONCILIATION

#### sdg_mappings

##### Eintrag 1

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 2

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 3

**id:** SDG_10

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Weniger Ungleichheiten. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 4

**id:** SDG_11

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Nachhaltige Städte und Gemeinden. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 5

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 6

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 7

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 8

**id:** SDG_11

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Nachhaltige Städte und Gemeinden. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 9

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 10

**id:** SDG_04

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Hochwertige Bildung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 11

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 12

**id:** SDG_07

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Bezahlbare und saubere Energie. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 13

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 14

**id:** SDG_12

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Nachhaltiger Konsum und Produktion. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 15

**id:** SDG_08

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 16

**id:** SDG_10

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Weniger Ungleichheiten. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 17

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 18

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 19

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 20

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 21

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 22

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 23

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 24

**id:** SDG_08

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 25

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 26

**id:** SDG_10

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Weniger Ungleichheiten. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 27

**id:** SDG_11

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Nachhaltige Städte und Gemeinden. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 28

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 29

**id:** SDG_17

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Partnerschaften zur Erreichung der Ziele. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 30

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 31

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 32

**id:** SDG_08

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 33

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 34

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 35

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 36

**id:** SDG_08

**framework:** SDG

**direction:** POSITIVE_POTENTIAL

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P12

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744


#### sdg_plus_mappings

##### Eintrag 1

**id:** SDG_PLUS_INSTITUTIONAL_TRUST

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Institutionelles Vertrauen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 2

**id:** SDG_PLUS_RULE_OF_LAW

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Rechtsstaatlichkeit. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 3

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 4

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 5

**id:** SDG_PLUS_SOCIAL_COHESION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Gesellschaftlicher Zusammenhalt. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 6

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 7

**id:** SDG_PLUS_SOCIAL_COHESION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Gesellschaftlicher Zusammenhalt. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 8

**id:** SDG_PLUS_INSTITUTIONAL_TRUST

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Institutionelles Vertrauen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 9

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 10

**id:** SDG_PLUS_DISCOURSE_CAPACITY

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Diskursfähigkeit. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744


#### constitutional_anchor_mappings

##### Eintrag 1

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 2

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 3

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 4

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 5

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 6

**id:** GG_ART_20A_NATURAL_FOUNDATIONS

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Natürliche Lebensgrundlagen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 7

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 8

**id:** GG_ART_20A_NATURAL_FOUNDATIONS

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Natürliche Lebensgrundlagen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 9

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 10

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 11

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 12

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 13

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 14

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 15

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 16

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 17

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 18

**id:** GG_ART_20A_NATURAL_FOUNDATIONS

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Natürliche Lebensgrundlagen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 19

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 20

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 21

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 22

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 23

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 24

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 25

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 26

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** POSITIVE_POTENTIAL

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P12

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 27

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** POSITIVE_POTENTIAL

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P12

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744


#### tile_mappings

##### Eintrag 1

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 2

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 3

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 4

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 5

**id:** SDG_10

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Weniger Ungleichheiten. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 6

**id:** SDG_11

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Nachhaltige Städte und Gemeinden. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 7

**id:** SDG_PLUS_INSTITUTIONAL_TRUST

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Institutionelles Vertrauen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 8

**id:** SDG_PLUS_RULE_OF_LAW

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Verteilung von 555,435744 Mrd. Euro kann Daseinsvorsorge, Transformation, Sicherheit und staatliche Handlungsfähigkeit stärken, sofern Titel auf überprüfbare Zustandsziele, klare Verantwortlichkeiten und realistische Umsetzungskapazitäten ausgerichtet werden.“ berührt Rechtsstaatlichkeit. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P1

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 9

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 10

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 11

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 12

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 13

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Erhöhte Mittel können Verteidigungsfähigkeit, Abschreckung, Bündnisfähigkeit, Cyber- und Bevölkerungsschutz sowie industrielle Resilienz stärken.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P2

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 14

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 15

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 16

**id:** SDG_11

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Nachhaltige Städte und Gemeinden. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 17

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 18

**id:** GG_ART_20A_NATURAL_FOUNDATIONS

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Natürliche Lebensgrundlagen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 19

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 20

**id:** SDG_04

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Hochwertige Bildung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 21

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die vorgesehene Mittelausstattung kann Verkehrs-, Energie-, Bildungs-, Digital- und kommunale Infrastruktur modernisieren und Klimaneutralität beschleunigen, wenn sie tatsächlich zusätzliche und transformativ wirksame Investitionen finanziert.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P3

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 22

**id:** GG_ART_20A_NATURAL_FOUNDATIONS

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Natürliche Lebensgrundlagen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 23

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 24

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 25

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 26

**id:** SDG_07

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Bezahlbare und saubere Energie. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 27

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 28

**id:** SDG_12

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Förderung kann Emissionen, Energieabhängigkeit und Ressourcenverbrauch senken und klimafreundliche Technologien skalieren.“ berührt Nachhaltiger Konsum und Produktion. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P4

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 29

**id:** SDG_08

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 30

**id:** SDG_10

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Weniger Ungleichheiten. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 31

**id:** SDG_PLUS_SOCIAL_COHESION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Gesellschaftlicher Zusammenhalt. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 32

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 33

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 34

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 35

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Der größte Einzelplan kann soziale Sicherheit, Arbeitsmarktintegration, Teilhabe und Krisenfestigkeit stabilisieren.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P5

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 36

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 37

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 38

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 39

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 40

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 41

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 42

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Haushaltsmittel können Versorgungssicherheit, Prävention, Pflegequalität, Digitalisierung und Krisenresilienz stärken.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P6

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 43

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 44

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 45

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 46

**id:** SDG_08

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 47

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Investitionen können Kompetenzen, Chancengerechtigkeit, Innovationsfähigkeit und langfristige Produktivität erhöhen.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P7

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 48

**id:** SDG_10

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Weniger Ungleichheiten. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 49

**id:** SDG_PLUS_SOCIAL_COHESION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Gesellschaftlicher Zusammenhalt. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 50

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 51

**id:** GG_ART_20A_NATURAL_FOUNDATIONS

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Natürliche Lebensgrundlagen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 52

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 53

**id:** SDG_11

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Nachhaltige Städte und Gemeinden. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 54

**id:** SDG_13

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Klimaschutz. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 55

**id:** SDG_17

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Die Portfolios können Erreichbarkeit, bezahlbaren Wohnraum, regionale Teilhabe, internationale Stabilität und klimaverträgliche Mobilität stärken.“ berührt Partnerschaften zur Erreichung der Ziele. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P8

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 56

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 57

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 58

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 59

**id:** SDG_PLUS_INSTITUTIONAL_TRUST

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Institutionelles Vertrauen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 60

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 61

**id:** SDG_PLUS_DIGITAL_SELF_DETERMINATION

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Digitale Selbstbestimmung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 62

**id:** SDG_PLUS_DISCOURSE_CAPACITY

**framework:** SDG_PLUS

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Digitale Infrastruktur und Verwaltungsmodernisierung können Zugänglichkeit, Geschwindigkeit, Transparenz und Krisenfähigkeit verbessern.“ berührt Diskursfähigkeit. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P9

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 63

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 64

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 65

**id:** SDG_08

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 66

**id:** SDG_09

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Kreditfinanzierung kann zeitkritische Zukunftsinvestitionen ermöglichen und Kosten des Unterlassens vermeiden.“ berührt Industrie, Innovation und Infrastruktur. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P10

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 67

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 68

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 69

**id:** SDG_03

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Gesundheit und Wohlergehen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 70

**id:** SDG_16

**framework:** SDG

**direction:** AMBIVALENT

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Langfristige Bindungen können Planungssicherheit und Umsetzung großer Programme ermöglichen.“ berührt Frieden, Gerechtigkeit und starke Institutionen. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P11

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 71

**id:** GG_ART_109_2_MACROECONOMIC_BALANCE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** POSITIVE_POTENTIAL

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.“ berührt Gesamtwirtschaftliches Gleichgewicht. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P12

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 72

**id:** GG_ART_20_STATE_STRUCTURE

**framework:** CONSTITUTIONAL_ANCHOR

**direction:** POSITIVE_POTENTIAL

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.“ berührt Demokratischer und sozialer Rechtsstaat. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P12

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 73

**id:** SDG_08

**framework:** SDG

**direction:** POSITIVE_POTENTIAL

**evidence_status:** SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS

**rationale:** Der Wirkpfad „Ein ressortübergreifendes Wirkungsmonitoring kann Haushaltsvollzug von der reinen Ausgaben- zur Zustandssteuerung entwickeln.“ berührt Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.

###### impact_path_refs

- P12

###### source_refs

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744


**separation_rule:** SDG, SDG+ und Verfassungs-/Schutzanker sind getrennte Referenzebenen; Mehrfachbezug erzeugt keine Mehrfachpunkte.

**previous_review_id:** `null`

### provenance

**review_generated_at:** 2026-08-15T08:40:45Z

#### source_refs_used

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

**source_use_rule:** Only source_id values contained in the case source_manifest were used.

### retrospective

**status:** HISTORICAL_FEEDBACK_AVAILABLE_BUT_NOT_CURRENT_EX_POST_PROOF

**current_proposal_effect_status:** NOT_YET_OBSERVABLE

#### feedback_loops

##### Eintrag 1

**feedback_id:** HF1

**feedback_type:** FISCAL_PLANNING_COMPARISON

**description:** Der Entwurf vergleicht den Haushaltsansatz 2027 mit dem Plan 2026 und weist Veränderungen bei Gesamtvolumen, Ressorts, Investitionen, Krediten, Zinsausgaben und Verpflichtungsermächtigungen aus.

**what_it_supports:** Eine finanzielle Rückkopplung darüber, wie Prioritäten und Bindungen gegenüber dem Vorjahresplan verschoben werden; sie macht Wirkungspotenziale, Opportunitätskosten und Risikofelder sichtbar.

**what_it_does_not_support:** Keine Aussage über tatsächlichen Vollzug 2026, Zielerreichung, Zusätzlichkeit, Effizienz oder kausal bewirkte Zustandsänderungen.

**feedback_strength:** STRONG_FOR_ALLOCATION_FEEDBACK_ONLY

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744

##### Eintrag 2

**feedback_id:** HF2

**feedback_type:** CONSTITUTIONAL_FISCAL_FEEDBACK

**description:** Der Entwurf enthält die schuldenregelbezogene Berechnung, die Bereichsausnahme nach Artikel 115 und eine Aufteilung der Kreditermächtigung.

**what_it_supports:** Rechtlich-fiskalische Rückkopplung zu Finanzierungsraum und formaler Tragfähigkeit im Haushaltsjahr.

**what_it_does_not_support:** Keine materielle Bewertung, ob kreditfinanzierte Ausgaben positive Netto-Wirkung erzeugen oder langfristig tragfähiger sind als Alternativen.

**feedback_strength:** STRONG_FOR_FORMAL_FISCAL_COMPLIANCE

###### source_ids

- 3f9d5d5c-cc43-4f93-92ee-01d2507412fa
- d5f03d43-7394-4e27-ad22-17371c5a8744


**interpretation:** Beim Haushalt existiert bereits eine Rückkopplung auf der Ebene von Planung, Vorjahresvergleich und Schuldenregel. Das ist bedeutsam, weil es Prioritätsverschiebungen und künftige Bindungen sichtbar macht. Es fehlt jedoch die entscheidende Wirkungsrückkopplung: konsolidierte Ist-Ausgaben, erreichte Outputs, beobachtete Zustandsänderungen, Zusätzlichkeit und kausale Attribution früherer bzw. laufender Programme.

#### feedback_data_gaps

- Konsolidierter Ist-Vollzug 2026 einschließlich Sondervermögen und Transfers zwischen Haushalten.
- Programm- und projektbezogene Ergebnisse früherer Mittelansätze statt bloßer Soll-Ist-Ausgaben.
- Zusätzlichkeit und Verdrängung regulärer Ausgaben durch Sondervermögen.
- Outcome- und Netto-Wirkungsdaten für große Investitions-, Sozial-, Sicherheits- und Transformationsprogramme.
- Lebenszyklus- und Folgekosten bereits eingegangener Verpflichtungen.

#### monitoring_and_correction

**output_feedback:** Quartalsweise: Verpflichtungen, Vergaben, Auszahlungen, Projektfortschritt, Verzögerungen, Kostenänderungen und Verwaltungsengpässe; getrennt nach Kernhaushalt und jedem Sondervermögen.

**outcome_feedback:** Jährlich: titel- und programmbezogene Zustandsindikatoren für Zugang, Versorgung, Emissionen, Resilienz, Sicherheit, Teilhabe und Produktivität.

**causal_review:** Für große Programme vorab definierte Gegenfaktum- oder Vergleichsstrategie; Evaluation nach ausreichender Beobachtungsdauer und mit Unsicherheitsintervall.

**correction_trigger:** Verbindliche Nachsteuerung bei fehlender materieller Zusätzlichkeit, dauerhafter Unterauslastung, erheblicher Kosten-/Terminabweichung, negativer Schutzgate-Wirkung oder besserer wirkungsäquivalenter Alternative.

**earliest_meaningful_review:** Vollzugsreview ab dem ersten Quartal 2027; erste Jahres-Outcome-Rückkopplung nach Abschluss des Haushaltsjahres; Transformations- und Netto-Wirkungsprüfung mehrjährig.

**review_id:** REVIEW-WOEK-REVIEW-2026-0003-caf988db

**review_status:** PARTIAL

**review_type:** FULL_REVIEW

### risks

#### Eintrag 1

**risk_id:** R1

**description:** Doppelzählung und fehlende Konsolidierung zwischen Kernhaushalt und Sondervermögen.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 2

**risk_id:** R2

**description:** Scheinzusätzlichkeit durch Umetikettierung bereits geplanter Ausgaben.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 3

**risk_id:** R3

**description:** Mittelabfluss wird als Wirkung ausgegeben.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 4

**risk_id:** R4

**description:** Umsetzungs- und Absorptionsengpässe.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 5

**risk_id:** R5

**description:** Mehrjährige finanzielle und technologische Lock-ins durch Verpflichtungsermächtigungen.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 6

**risk_id:** R6

**description:** Steigende Zinslast verdrängt künftige Daseinsvorsorge und Transformation.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 7

**risk_id:** R7

**description:** Sozial oder regional ungleiche Nutzen- und Lastenverteilung.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

#### Eintrag 8

**risk_id:** R8

**description:** Negative Klima-, Ressourcen-, Biodiversitäts- oder Gesundheitswirkungen innerhalb einzelner Investitionen.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `true`

#### Eintrag 9

**risk_id:** R9

**description:** Schwächung parlamentarischer Transparenz durch fragmentierte Nebenhaushalte.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `true`

#### Eintrag 10

**risk_id:** R10

**description:** Fehlende Rückkopplung und Fortführung unwirksamer Programme.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`


**schema_version:** 1.0.0

### source_completeness

#### decision_basis

**status:** PASS

**reason:** Current parliamentary status and proposal are source-backed in the package.

#### ex_ante

**status:** PASS

**reason:** The ex-ante review is restricted to proposal mechanics, potentials, risks and change levers.

#### historical_feedback

**status:** PARTIAL

**reason:** Der Entwurf liefert eine sehr breite amtliche Soll- und Finanzierungsbasis sowie Vorjahresplanvergleiche. Es fehlen jedoch konsolidierte Ist-Vollzugs-, Outcome- und Evaluationsergebnisse. Der Vorjahresplan ist keine Baseline tatsächlicher Wirkung.

#### ex_post_current_proposal

**status:** NOT_YET_ASSESSABLE

**reason:** No decision, implementation or observation period exists for the current proposal.

#### calculation

**status:** FAIL

**reason:** No final calculation is permitted while material inputs or causal boundaries remain missing.

#### normative_framework

**status:** PARTIAL

**reason:** The embedded WÖk reference snapshot is preserved unchanged and marks a pending reference gap; no final score is generated.

#### non_compensation

**status:** DEFINED_NOT_APPLIED

**reason:** Protection boundaries are identified but no final scored assessment is made.

#### overall

**status:** NOT_PUBLICATION_READY

**publication_readiness:** EVIDENCE_REQUIRED

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

**public_title:** Bundeshaushalt 2027

**public_key_statement:** Der Bundeshaushalt 2027 verteilt Ressourcen und bindet künftige Handlungsspielräume; das sind Inputs, noch keine Wirkung. Wirkung entsteht nur bei zusätzlicher, umsetzbarer Finanzierung mit messbaren Zustandszielen, Lebenszyklus- und Verteilungsprüfung sowie verbindlicher Rückkopplung.

**maturity_stage:** VORPRUEFUNG

**maturity_label:** Wirkungsökonomische Vorprüfung

**public_release_status:** READY_FOR_PUBLIC_RELEASE_WITH_MATURITY_LABEL

**public_release_boundary:** Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar. Sie ist kein Endscore und keine abgeschlossene kausale Netto-Wirkungsbewertung.

#### ten_policy_field_screening

##### Eintrag 1

**policy_field:** HOUSING

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 2

**policy_field:** HEALTH_CARE

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 3

**policy_field:** EDUCATION_PARTICIPATION

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 4

**policy_field:** WORK_SKILLS

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 5

**policy_field:** ECONOMY_TRANSFORMATION

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 6

**policy_field:** ENERGY_GRIDS

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 7

**policy_field:** MOBILITY

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 8

**policy_field:** CLIMATE_RESILIENCE

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 9

**policy_field:** DIGITAL_STATE_INFRASTRUCTURE

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

##### Eintrag 10

**policy_field:** STATE_ADMINISTRATION

**status:** MATERIAL

**rationale:** Der Bundeshaushalt verteilt oder bindet Mittel in diesem Politikfeld; Wirkung setzt titelbezogene Baselines, Outputs, Outcomes, Zusätzlichkeit, Verteilung und Korrekturregeln voraus.

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12


#### mpd_dimensions

##### Eintrag 1

**dimension:** Mensch

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

**status:** MATERIAL

##### Eintrag 2

**dimension:** Planet

###### impact_path_refs

- P1
- P2
- P3
- P4
- P7
- P8
- P9
- P10
- P11
- P12

**status:** MATERIAL

##### Eintrag 3

**dimension:** Demokratie

###### impact_path_refs

- P1
- P2
- P3
- P4
- P5
- P6
- P7
- P8
- P9
- P10
- P11
- P12

**status:** MATERIAL


#### effect_improving_options

- Für materielle Titel und Programme Baseline, Zielzustand, Einheit, Meilenstein, Verantwortung, Verteilungsdimension und Korrekturtrigger verbindlich ausweisen. Verwandelt Ausgabenansätze in überprüfbare Wirkungshypothesen.
- Kernhaushalt, Sondervermögen, Transfers, Ausgabereste und Verpflichtungsermächtigungen konsolidieren und materielle Zusätzlichkeit ausweisen. Verhindert Doppelzählung, fiskalische Substitution und falsche Wirkungsschlüsse aus Mittelvolumen.
- Lebenszyklus-, Zins-, Betriebs-, Personal-, Klima-, Ressourcen- und Opportunitätsfolgen offenlegen und Schutzgates anwenden. Macht langfristige Bindungen und nichtkompensierbare Risiken vor der Mittelentscheidung sichtbar.

**historical_feedback:** `null`

#### sources_and_evidence

##### official_sources

###### Eintrag 1

**institution:** Deutscher Bundestag - DIP

###### relevant_locations

_Leere Liste._

**source_id:** 3f9d5d5c-cc43-4f93-92ee-01d2507412fa

**temporal_class:** CURRENT_REFERENCE

**title:** Gesetz über die Feststellung des Bundeshaushaltsplans für das Haushaltsjahr 2027 (Haushaltsgesetz 2027 - HG 2027)

**url:** https://dip.bundestag.de/vorgang/338317

###### Eintrag 2

**institution:** Deutscher Bundestag - DIP

###### relevant_locations

###### Eintrag 1

**section:** Amtlicher Entwurf, Abschnitt chunk-0001

###### Eintrag 2

**section:** Amtlicher Entwurf, Abschnitt chunk-0002

###### Eintrag 3

**section:** Amtlicher Entwurf, Abschnitt chunk-0003

###### Eintrag 4

**section:** Amtlicher Entwurf, Abschnitt chunk-0004

###### Eintrag 5

**section:** Amtlicher Entwurf, Abschnitt chunk-0005

###### Eintrag 6

**section:** Amtlicher Entwurf, Abschnitt chunk-0006

###### Eintrag 7

**section:** Amtlicher Entwurf, Abschnitt chunk-0007

###### Eintrag 8

**section:** Amtlicher Entwurf, Abschnitt chunk-0008


**source_id:** d5f03d43-7394-4e27-ad22-17371c5a8744

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**title:** Entwurf eines Gesetzes über die Feststellung des Bundeshaushaltsplans für das Haushaltsjahr 2027 (Haushaltsgesetz 2027 - HG 2027)

**url:** https://dserver.bundestag.de/btd/21/073/2107300.pdf


##### candidate_sources

###### Eintrag 1

**source_id:** CAND-BMF-FINANZBERICHT-2027

**title:** Finanzbericht 2027

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/finanzbericht-2027.pdf?__blob=publicationFile&v=3

**publication_date:** 2026-08-14

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Gesamtbericht; insbesondere Finanzplan 2026-2030, Haushalt des Bundes und gesamtwirtschaftliche Ausgangslage.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Amtliche Planungs-, Finanzierungs- und Baseline-Daten des Regierungsentwurfs.

**what_it_actually_supports:** Amtliche Planungs-, Finanzierungs- und Baseline-Daten des Regierungsentwurfs.

**what_it_does_not_support:** Keine eingetretenen Outcomes, keine kausale Wirkung einzelner Titel und keine positive Netto-Wirkung.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 2

**source_id:** CAND-BMF-SVIK-MONITORING-2025-BH27

**title:** Monitoringbericht zum Sondervermögen für Infrastruktur und Klimaneutralität über das Jahr 2025

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/svik-monitoringbericht-2025.html

**publication_date:** 2026-06-01

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Gesamtbericht; Kapitel zu Zielen, gesamtwirtschaftlicher Einordnung, Bundessäule, Ländersäule, Mittel- und Verpflichtungsbelegung.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Frühe Vollzugs- und Monitoringinformationen sowie die institutionelle Rückkopplungsarchitektur des SVIK.

**what_it_actually_supports:** Frühe Vollzugs- und Monitoringinformationen sowie die institutionelle Rückkopplungsarchitektur des SVIK.

**what_it_does_not_support:** Keinen kausalen Nachweis, dass Mittelabfluss bereits Infrastruktur-, Klima- oder Wohlfahrtsoutcomes erzeugt hat.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 3

**source_id:** CAND-BMF-HAUSHALTSABSCHLUSS-2025

**title:** Vorläufiger Abschluss des Bundeshaushalts 2025 einschließlich KTF und SVIK

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2026/01/Inhalte/Kapitel-2-Analysen/2-1-abschluss-bundeshaushalt-ktf-svik-2025.html

**publication_date:** 2026-01-29

**retrieval_date:** 2026-08-15

**source_type:** OFFICIAL_STATISTICS

**exact_location:** Abschnitte zum Haushaltsabschluss 2025, Ausgaben, Einnahmen, Nettokreditaufnahme sowie KTF/SVIK.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Ist-nahe finanzielle Ausgangswerte und Vollzugsvergleich für die Fortschreibung.

**what_it_actually_supports:** Ist-nahe finanzielle Ausgangswerte und Vollzugsvergleich für die Fortschreibung.

**what_it_does_not_support:** Keine Outcome- oder Kausalbewertung der Programme.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 4

**source_id:** CAND-BMF-BUNDESHAUSHALT-2026

**title:** Bundeshaushalt 2026

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/bundeshaushalt-2026.pdf?__blob=publicationFile&v=3

**publication_date:** `null`

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Haushaltsplan 2026, Einzelpläne und Gesamtübersichten.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Planbaseline für Ressort-, Titel- und Sondervermögensvergleiche 2026/2027.

**what_it_actually_supports:** Planbaseline für Ressort-, Titel- und Sondervermögensvergleiche 2026/2027.

**what_it_does_not_support:** Keine Ist-Umsetzung 2026 und keine Wirkungsbewertung.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 5

**source_id:** CAND-BMF-ZWOH-RAHMENKONZEPT

**title:** Rahmenkonzept ziel- und wirkungsorientierte Haushaltsführung (zwoH)

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Content/DE/Downloads/Oeffentliche-Finanzen/Spending-Reviews/zwoh-rahmenkonzept.pdf?__blob=publicationFile&v=6

**publication_date:** 2025-07-30

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Kapitel 1 bis 4: Grundlagen, Ziele, Instrumente und Umsetzung der zwoH.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Amtlichen methodischen Anschluss für Ziele, Indikatoren, Erfolgskontrolle und Rückkopplung im Bundeshaushalt.

**what_it_actually_supports:** Amtlichen methodischen Anschluss für Ziele, Indikatoren, Erfolgskontrolle und Rückkopplung im Bundeshaushalt.

**what_it_does_not_support:** Keine fallbezogene Bewertung des Haushaltsentwurfs 2027.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 6

**source_id:** CAND-BMF-IIB-SVIK-2026

**title:** Startschuss für das SVIK - Ziele konkretisieren, Tempo gewinnen

**institution:** Investitions- und Innovationsbeirat beim Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/svik-iib-bericht-2026.html

**publication_date:** 2026-06-09

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Gesamtbericht; Empfehlungen zu Zielklarheit, Projektreife, Tempo, Transparenz und Umsetzung.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Governance- und Umsetzungsempfehlungen für das Sondervermögen.

**what_it_actually_supports:** Governance- und Umsetzungsempfehlungen für das Sondervermögen.

**what_it_does_not_support:** Keine ex-post kausale Wirkung der finanzierten Projekte.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 7

**source_id:** CAND-BMF-SVIK-FAQ-2026

**title:** Sondervermögen für Infrastruktur und Klimaneutralität - Fragen und Antworten

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Content/DE/FAQ/SVIK/sondervermoegen-infrastruktur-klimaneutralitaet.html

**publication_date:** `null`

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Abschnitte zu Monitoring, Bundessäule, Ländersäule, Berichts- und Transparenzpflichten.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Offizielle Ausgestaltung der Berichts- und Monitoringpflichten.

**what_it_actually_supports:** Offizielle Ausgestaltung der Berichts- und Monitoringpflichten.

**what_it_does_not_support:** Keine eigenständige Wirkungsevidenz.

**verification_status:** CANDIDATE_ONLY

###### Eintrag 8

**source_id:** CAND-BMF-FINANZPLAN-ARCHIV

**title:** Haushalts- und Finanzpläne des Bundes

**institution:** Bundesministerium der Finanzen

**canonical_url:** https://www.bundesfinanzministerium.de/Web/DE/Themen/Oeffentliche_Finanzen/Bundeshaushalt/Haushalts_und_Finanzplaene/haushalts_finanzplaene.html

**publication_date:** `null`

**retrieval_date:** 2026-08-15

**source_type:** OTHER_PRIMARY_SOURCE

**exact_location:** Archiv der Haushalts- und Finanzpläne; Vergleichsjahre 2023 bis 2026.

**temporal_class:** AVAILABLE_AT_DECISION_TIME

**needed_for:** Zeitreihe amtlicher Planstände für Gegenfaktum, Zusätzlichkeit und Planrevisionen.

**what_it_actually_supports:** Zeitreihe amtlicher Planstände für Gegenfaktum, Zusätzlichkeit und Planrevisionen.

**what_it_does_not_support:** Keine Ist- oder Outcome-Daten ohne Verknüpfung mit Haushaltsabschlüssen und Fachmonitoring.

**verification_status:** CANDIDATE_ONLY


##### assumptions

_Leere Liste._

##### calculation_inputs

###### Eintrag 1

**calculation_id:** C1

**name:** Konsolidiertes Wirkungsbudget

**specification:** Kernhaushalt und Sondervermögen nach Transfers, Doppelzählungen, Ausgaberesten und Finanzierungsquellen konsolidieren; anschließend nach Wirkungsfeldern ausweisen.

###### required_inputs

- Kernhaushaltstitel
- Wirtschaftspläne aller Sondervermögen
- Transfermatrix
- Ausgabereste
- Finanzierungsquellen
- Programmzuordnung

###### available_inputs

_Leere Liste._

###### missing_inputs

- Kernhaushaltstitel
- Wirtschaftspläne aller Sondervermögen
- Transfermatrix
- Ausgabereste
- Finanzierungsquellen
- Programmzuordnung

**status:** DATA_GAP

###### Eintrag 2

**calculation_id:** C2

**name:** Investitionszusätzlichkeit

**specification:** Zusätzliche reale Investitionen gegenüber dem plausiblen Haushalts- und Projektgegenfaktum ermitteln; bloße Verlagerung oder Vorziehung separat ausweisen.

###### required_inputs

- Projektbaseline
- frühere Finanzplanung
- Projektstatus
- Kernhaushaltsvergleich
- Sondervermögenszuordnung
- Gegenfaktum

###### available_inputs

_Leere Liste._

###### missing_inputs

- Projektbaseline
- frühere Finanzplanung
- Projektstatus
- Kernhaushaltsvergleich
- Sondervermögenszuordnung
- Gegenfaktum

**status:** DATA_GAP

###### Eintrag 3

**calculation_id:** C3

**name:** Portfolio-Netto-Wirkung

**specification:** Positive und negative Outcomes je Portfolio mit Schutzgates zusammenführen; keine Addition über nichtkompensierbare Grenzen.

###### required_inputs

- Outcome-Indikatoren
- Baselines
- Reichweiten
- Attribution
- Unsicherheit
- Schutzgate-Prüfung

###### available_inputs

_Leere Liste._

###### missing_inputs

- Outcome-Indikatoren
- Baselines
- Reichweiten
- Attribution
- Unsicherheit
- Schutzgate-Prüfung

**status:** DATA_GAP

###### Eintrag 4

**calculation_id:** C4

**name:** Fiskalische Lebenszykluswirkung

**specification:** Kredit-, Zins-, Betriebs-, Wartungs- und Personalfolgekosten den vermiedenen Schäden und langfristigen Erträgen gegenüberstellen.

###### required_inputs

- Zinsprofil
- Tilgungsprofil
- Betriebs- und Wartungskosten
- Nutzungsdauer
- vermiedene Folgekosten
- Szenarien

###### available_inputs

_Leere Liste._

###### missing_inputs

- Zinsprofil
- Tilgungsprofil
- Betriebs- und Wartungskosten
- Nutzungsdauer
- vermiedene Folgekosten
- Szenarien

**status:** DATA_GAP

###### Eintrag 5

**calculation_id:** C5

**name:** Verteilungs- und Generationenwirkung

**specification:** Direkte und indirekte Lasten und Nutzen nach Gruppen, Regionen und Generationen ausweisen.

###### required_inputs

- Mikrodaten oder belastbare Verteilungsparameter
- Steuer-/Transferwirkung
- Nutzergruppen
- Regionaldaten
- Zeitprofil

###### available_inputs

_Leere Liste._

###### missing_inputs

- Mikrodaten oder belastbare Verteilungsparameter
- Steuer-/Transferwirkung
- Nutzergruppen
- Regionaldaten
- Zeitprofil

**status:** DATA_GAP

###### Eintrag 6

**calculation_id:** C6

**name:** Umsetzungs- und Absorptionsrisiko

**specification:** Reifegrad, Personal, Genehmigungen, Vergabekapazität und Lieferketten gegen Mittelvolumen und Zeitplan prüfen.

###### required_inputs

- Projektpipeline
- Reifegrad
- Personalbestand
- Vergabezeiten
- Genehmigungsstände
- Lieferkapazität

###### available_inputs

_Leere Liste._

###### missing_inputs

- Projektpipeline
- Reifegrad
- Personalbestand
- Vergabezeiten
- Genehmigungsstände
- Lieferkapazität

**status:** DATA_GAP


##### counterfactual

**status:** CANDIDATE_ONLY

###### questions

###### Eintrag 1

**question:** Wie sähen Kernhaushalt, Sondervermögen und reale Investitionen bei Fortschreibung des 2026er Plans ohne HG 2027 aus?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

###### Eintrag 2

**question:** Welche regulären Ausgaben würden ohne Sondervermögen entfallen, später erfolgen oder aus dem Kernhaushalt finanziert?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

###### Eintrag 3

**question:** Welche alternative Allokation desselben Finanzierungsvolumens erzeugte höhere positive Netto-Wirkung bei geringeren Lebenszyklusrisiken?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

###### Eintrag 4

**question:** Welche Kosten und Schäden entstehen bei Nichtinvestition oder Verzögerung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

###### Eintrag 5

**question:** Wie verändern unterschiedliche Zins-, Inflations- und Umsetzungsszenarien die langfristige fiskalische und reale Wirkung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.


**minimum_design:** Vorschlag gegen geltende Rechtslage/Trend plus sachlich geeignete Alternative; Parallelreformen und Vortrends kontrollieren.

**causal_claim_gate:** Keine kausale Aussage ohne explizite Treatment-Abgrenzung, Gegenfaktum, Attribution und Unsicherheit.

##### uncertainties

- Konsolidierte Darstellung des Kernhaushalts und aller Sondervermögen ohne interne Transfers und Doppelzählungen.
- Titel- und programmbezogene Baselines, Zielzustände, Einheiten, räumliche Reichweite und Zeitbezug.
- Materielle Zusätzlichkeit gegenüber fortgeschriebenem Kernhaushalt und bereits geplanten Projekten.
- Ist-Vollzug und Mittelbindung früherer Jahre einschließlich Ausgaberesten und Verpflichtungen.
- Projektlisten, Reifegrade, Genehmigungsstände, Beschaffungspläne und Personal-/Planungskapazitäten.
- Lebenszyklus-, Betriebs-, Wartungs-, Personal- und Zinsfolgekosten.
- Verteilungswirkung nach Einkommen, Region, Geschlecht, Alter, Behinderung und Generation.
- Klima-, Ressourcen-, Biodiversitäts-, Gesundheits- und Sicherheitswirkungen der finanzierten Aktivitäten.
- Kausale Gegenfaktum-Grundlage für große Programme und Maßnahmenbündel.
- Unsicherheiten, Sensitivitäten und Szenarien zu Zinsen, Inflation, Baupreisen, Lieferketten und Umsetzungskapazität.
- Nichtkompensationsprüfung für Grundrechte, irreversible Umweltschäden, soziale Mindestversorgung und demokratische Budgetkontrolle.
- Öffentliche, maschinenlesbare Verknüpfung von Haushaltstitel, Output, Outcome, Evaluation und Korrekturentscheidung.

#### protection_gates

##### Eintrag 1

**boundary:** Grund- und Menschenrechte sowie diskriminierungsfreier Zugang zu staatlichen Leistungen.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

##### Eintrag 2

**boundary:** Soziale Mindestversorgung in Gesundheit, Pflege, Bildung, Wohnen und Existenzsicherung.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

##### Eintrag 3

**boundary:** Irreversible Klima-, Biodiversitäts-, Ressourcen- und Gesundheitsschäden.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

##### Eintrag 4

**boundary:** Demokratische Budgethoheit, Transparenz und parlamentarische Kontrolle.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

##### Eintrag 5

**boundary:** Sicherheits- und Verteidigungsfähigkeit bei gleichzeitiger Rechtsstaatlichkeit und ziviler Kontrolle.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.

##### Eintrag 6

**boundary:** Intergenerationelle Tragfähigkeit einschließlich nicht offengelegter Folgekosten und Lock-ins.

**gate_status:** MUST_BE_TESTED

**reason:** Eine schwere negative Wirkung in diesem Feld darf nicht durch Vorteile in anderen Feldern kompensiert werden.


#### assumptions_and_uncertainty

##### assumptions

_Leere Liste._

##### uncertainties

- Konsolidierte Darstellung des Kernhaushalts und aller Sondervermögen ohne interne Transfers und Doppelzählungen.
- Titel- und programmbezogene Baselines, Zielzustände, Einheiten, räumliche Reichweite und Zeitbezug.
- Materielle Zusätzlichkeit gegenüber fortgeschriebenem Kernhaushalt und bereits geplanten Projekten.
- Ist-Vollzug und Mittelbindung früherer Jahre einschließlich Ausgaberesten und Verpflichtungen.
- Projektlisten, Reifegrade, Genehmigungsstände, Beschaffungspläne und Personal-/Planungskapazitäten.
- Lebenszyklus-, Betriebs-, Wartungs-, Personal- und Zinsfolgekosten.
- Verteilungswirkung nach Einkommen, Region, Geschlecht, Alter, Behinderung und Generation.
- Klima-, Ressourcen-, Biodiversitäts-, Gesundheits- und Sicherheitswirkungen der finanzierten Aktivitäten.
- Kausale Gegenfaktum-Grundlage für große Programme und Maßnahmenbündel.
- Unsicherheiten, Sensitivitäten und Szenarien zu Zinsen, Inflation, Baupreisen, Lieferketten und Umsetzungskapazität.
- Nichtkompensationsprüfung für Grundrechte, irreversible Umweltschäden, soziale Mindestversorgung und demokratische Budgetkontrolle.
- Öffentliche, maschinenlesbare Verknüpfung von Haushaltstitel, Output, Outcome, Evaluation und Korrekturentscheidung.

**quantification_status:** NOT_ROBUSTLY_QUANTIFIABLE

**causal_boundary:** Beobachtete Zeitreihen, Vollzug oder Mittelabfluss sind ohne Gegenfaktum und Zurechnungsbasis kein kausaler Wirkungsnachweis.

**no_end_score:** `true`

**no_party_or_person_assessment:** `true`

#### status_rationale

**review_status:** PARTIAL

**material_data_gap_count:** 12

**open_calculation_requirement_count:** 6

**reason:** Die Entscheidungswirkung ist noch nicht beobachtbar; die Ex-ante-Wirkpfade sind veröffentlichbar, offene Daten und Recheninputs bleiben sichtbar.

#### effect_improving_options_structured

##### Eintrag 1

**option_id:** OPT-1

**option:** Für materielle Titel und Programme Baseline, Zielzustand, Einheit, Meilenstein, Verantwortung, Verteilungsdimension und Korrekturtrigger verbindlich ausweisen.

**why_it_can_improve_impact:** Verwandelt Ausgabenansätze in überprüfbare Wirkungshypothesen.

###### impact_path_refs

- P1
- P2
- P5
- P6
- P7
- P8
- P9

**evidence_status:** EX_ANTE_DESIGN_OPTION_REQUIRES_DECISION_AND_LATER_EVALUATION

##### Eintrag 2

**option_id:** OPT-2

**option:** Kernhaushalt, Sondervermögen, Transfers, Ausgabereste und Verpflichtungsermächtigungen konsolidieren und materielle Zusätzlichkeit ausweisen.

**why_it_can_improve_impact:** Verhindert Doppelzählung, fiskalische Substitution und falsche Wirkungsschlüsse aus Mittelvolumen.

###### impact_path_refs

- P1
- P3
- P10
- P11

**evidence_status:** EX_ANTE_DESIGN_OPTION_REQUIRES_DECISION_AND_LATER_EVALUATION

##### Eintrag 3

**option_id:** OPT-3

**option:** Lebenszyklus-, Zins-, Betriebs-, Personal-, Klima-, Ressourcen- und Opportunitätsfolgen offenlegen und Schutzgates anwenden.

**why_it_can_improve_impact:** Macht langfristige Bindungen und nichtkompensierbare Risiken vor der Mittelentscheidung sichtbar.

###### impact_path_refs

- P4
- P10
- P11
- P12

**evidence_status:** EX_ANTE_DESIGN_OPTION_REQUIRES_DECISION_AND_LATER_EVALUATION


#### reference_snapshot_reconciliation

**case_snapshot_preserved:** `true`

**preserved_case_snapshot_status:** INCOMPLETE_PENDING_TWO_LEADING_REFERENCES

**controlled_release_snapshot_id:** WOEK-CONTROLLED-REFERENCE-SNAPSHOT-2026-08-15

**controlled_release_snapshot_status:** CONTROLLED_WITH_ONE_METADATA_CONFLICT

**qualitative_mapping_status:** PROPOSED_PENDING_REFERENCE_RECONCILIATION

**consequence:** Qualitative SDG-, SDG+-, Grundrechts-, Staatsziel- und Schutzgüterzuordnungen sind publikationsfähig. Scores, Gewichtungen, Schwellenanwendungen und Präferenzurteile sind nicht Bestandteil dieses Releases.

### public_summary

**headline:** Bundeshaushalt 2027

**key_statement:** Der Bundeshaushalt 2027 verteilt Ressourcen und bindet künftige Handlungsspielräume; das sind Inputs, noch keine Wirkung. Wirkung entsteht nur bei zusätzlicher, umsetzbarer Finanzierung mit messbaren Zustandszielen, Lebenszyklus- und Verteilungsprüfung sowie verbindlicher Rückkopplung.

**stage:** VORPRUEFUNG

**what_is_known:** Wirkpfade und Risiken sind aus den vorliegenden amtlichen Quellen strukturiert.

**what_is_not_yet_known:** Eine belastbare Netto-Wirkung ist erst nach Baseline, Beobachtung, Gegenfaktum, Zurechnung, Unsicherheitsangabe und Schutzgate-Prüfung möglich.

#### improvement_options

- Für große Titel verbindliche Wirkungslogik mit Baseline, Zielzustand, Meilensteinen, Schutzgates, Verantwortlichkeit und Korrekturmechanismus in Haushaltsvermerken verankern.
- Verpflichtungsermächtigungen an nachprüfbare Fähigkeitslücken, Lebenszykluskosten, Interoperabilität, Resilienz und Abbruch-/Nachsteuerungsklauseln binden.
- Projektpass mit Ausgangszustand, Gegenfaktum, Lebenszykluswirkung, Zugänglichkeit, Resilienz, Zusätzlichkeit und Transformationshebel verpflichtend machen.
- Förderentscheidungen mit messbarer Emissions- und Ressourcenwirkung, Verteilungsprüfung und Nichtkompensationsgates versehen.
- Nicht nur Leistungsvolumen, sondern Armutsrisiko, materielle Teilhabe, Übergänge in gute Arbeit und Zugangsbarrieren als Ergebnisindikatoren führen.
- Abweichungen gegenüber 2026 funktional erklären und an Versorgungsqualität, vermeidbare Erkrankung, Personalstabilität und regionale Erreichbarkeit koppeln.
- Mittel mit Bildungszugang, Kompetenzzuwachs, Transferwirkung, Forschungsintegrität und Zukunftsfähigkeit verknüpfen.
- Kürzungen und Umschichtungen gegen Mindestversorgungs-, Klima-, Bezahlbarkeits- und Resilienzindikatoren prüfen; keine pauschale Ressortbewertung nur nach Betrag.

**publisher:** Institut für Wirkungsökonomie

**maturity_stage:** VORPRUEFUNG

**evidence_boundary:** Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar. Sie ist kein Endscore und keine abgeschlossene kausale Netto-Wirkungsbewertung.

## B. Entscheidungsreife und Abstimmungsverhalten - vollständige Ergänzung

**schema_version:** 1.0.0

**case_id:** caf988db-91fe-435c-bbe1-4b4c55ccbbf3

**generated_at:** 2026-08-16T01:48:02+02:00

**method_reference:** WÖk v1.5 / Root AGENTS 1.0 / Decision-readiness supplement

**decision_object:** Gesetz über die Feststellung des Bundeshaushaltsplans für das Haushaltsjahr 2027 (Haushaltsgesetz 2027 - HG 2027)

**decision_status_at_review:** Dem Bundestag zugeleitet - Noch nicht beraten

**temporal_mode:** LIVE_EX_ANTE

### decision_object_clarity

**status:** CONDITIONAL_PORTFOLIO_OBJECT

**rationale:** Der rechtlich/parlamentarisch benannte Entscheidungsgegenstand wird getrennt von der Frage behandelt, ob seine Folgen bereits hinreichend evidenzbasiert entscheidbar sind.

### impact_information_readiness

**status:** CONDITIONAL_MATERIAL_EVIDENCE_GAPS

#### material_missing_information

- Konsolidierte Darstellung des Kernhaushalts und aller Sondervermögen ohne interne Transfers und Doppelzählungen.
- Titel- und programmbezogene Baselines, Zielzustände, Einheiten, räumliche Reichweite und Zeitbezug.
- Materielle Zusätzlichkeit gegenüber fortgeschriebenem Kernhaushalt und bereits geplanten Projekten.
- Ist-Vollzug und Mittelbindung früherer Jahre einschließlich Ausgaberesten und Verpflichtungen.
- Projektlisten, Reifegrade, Genehmigungsstände, Beschaffungspläne und Personal-/Planungskapazitäten.
- Lebenszyklus-, Betriebs-, Wartungs-, Personal- und Zinsfolgekosten.
- Verteilungswirkung nach Einkommen, Region, Geschlecht, Alter, Behinderung und Generation.
- Klima-, Ressourcen-, Biodiversitäts-, Gesundheits- und Sicherheitswirkungen der finanzierten Aktivitäten.
- Kausale Gegenfaktum-Grundlage für große Programme und Maßnahmenbündel.
- Unsicherheiten, Sensitivitäten und Szenarien zu Zinsen, Inflation, Baupreisen, Lieferketten und Umsetzungskapazität.
- Nichtkompensationsprüfung für Grundrechte, irreversible Umweltschäden, soziale Mindestversorgung und demokratische Budgetkontrolle.
- Öffentliche, maschinenlesbare Verknüpfung von Haushaltstitel, Output, Outcome, Evaluation und Korrekturentscheidung.

**rule:** Materiale Datenlücken sind kein neutraler Wert. Sie begrenzen die Belastbarkeit einer Folgenentscheidung, ohne automatisch die formale Abstimmungsfähigkeit der Vorlage zu verneinen.

### decision_readiness

**status:** CONDITIONAL

**rationale:** Der Gegenstand ist grundsätzlich identifizierbar; die vorhandene Fachakte dokumentiert jedoch materielle offene Evidenz-, Gegenfaktums-, Vollzugs- oder Berechnungsfragen. Deshalb keine künstliche Ja/Nein-Endbewertung vor Schließung der entscheidungsrelevanten Lücken.

**not_equivalent_to_review_status:** METHOD_REVIEW_REQUIRED, DATA_GAP, PARTIAL und Monitoringstatus sind andere Dimensionen und werden nicht automatisch in Entscheidungsreife übersetzt.

### missing_decision_parameters

- Konsolidierte Darstellung des Kernhaushalts und aller Sondervermögen ohne interne Transfers und Doppelzählungen.
- Titel- und programmbezogene Baselines, Zielzustände, Einheiten, räumliche Reichweite und Zeitbezug.
- Materielle Zusätzlichkeit gegenüber fortgeschriebenem Kernhaushalt und bereits geplanten Projekten.
- Ist-Vollzug und Mittelbindung früherer Jahre einschließlich Ausgaberesten und Verpflichtungen.
- Projektlisten, Reifegrade, Genehmigungsstände, Beschaffungspläne und Personal-/Planungskapazitäten.
- Lebenszyklus-, Betriebs-, Wartungs-, Personal- und Zinsfolgekosten.
- Verteilungswirkung nach Einkommen, Region, Geschlecht, Alter, Behinderung und Generation.
- Klima-, Ressourcen-, Biodiversitäts-, Gesundheits- und Sicherheitswirkungen der finanzierten Aktivitäten.
- Kausale Gegenfaktum-Grundlage für große Programme und Maßnahmenbündel.
- Unsicherheiten, Sensitivitäten und Szenarien zu Zinsen, Inflation, Baupreisen, Lieferketten und Umsetzungskapazität.
- Nichtkompensationsprüfung für Grundrechte, irreversible Umweltschäden, soziale Mindestversorgung und demokratische Budgetkontrolle.
- Öffentliche, maschinenlesbare Verknüpfung von Haushaltstitel, Output, Outcome, Evaluation und Korrekturentscheidung.

**better_decision_question:** Welche konkrete Ausgestaltung von „Gesetz über die Feststellung des Bundeshaushaltsplans für das Haushaltsjahr 2027 (Haushaltsgesetz 2027 - HG 2027)“ verbessert den benannten Zielzustand gegenüber Status quo und realistischen Alternativen nachweisbar, ohne Schutzgrenzen zu verletzen, und welche Daten müssen dafür vor bzw. nach der Entscheidung erhoben werden?

### alternative_designs_and_counterfactuals

#### Eintrag 1

**question:** Wie sähen Kernhaushalt, Sondervermögen und reale Investitionen bei Fortschreibung des 2026er Plans ohne HG 2027 aus?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 2

**question:** Welche regulären Ausgaben würden ohne Sondervermögen entfallen, später erfolgen oder aus dem Kernhaushalt finanziert?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 3

**question:** Welche alternative Allokation desselben Finanzierungsvolumens erzeugte höhere positive Netto-Wirkung bei geringeren Lebenszyklusrisiken?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 4

**question:** Welche Kosten und Schäden entstehen bei Nichtinvestition oder Verzögerung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

#### Eintrag 5

**question:** Wie verändern unterschiedliche Zins-, Inflations- und Umsetzungsszenarien die langfristige fiskalische und reale Wirkung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.


### pre_decision_effect_screening

**status:** MATERIAL_PLAUSIBLE

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

**description:** Doppelzählung und fehlende Konsolidierung zwischen Kernhaushalt und Sondervermögen.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 2

**risk_id:** R2

**description:** Scheinzusätzlichkeit durch Umetikettierung bereits geplanter Ausgaben.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 3

**risk_id:** R3

**description:** Mittelabfluss wird als Wirkung ausgegeben.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 4

**risk_id:** R4

**description:** Umsetzungs- und Absorptionsengpässe.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 5

**risk_id:** R5

**description:** Mehrjährige finanzielle und technologische Lock-ins durch Verpflichtungsermächtigungen.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 6

**risk_id:** R6

**description:** Steigende Zinslast verdrängt künftige Daseinsvorsorge und Transformation.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 7

**risk_id:** R7

**description:** Sozial oder regional ungleiche Nutzen- und Lastenverteilung.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`

##### Eintrag 8

**risk_id:** R8

**description:** Negative Klima-, Ressourcen-, Biodiversitäts- oder Gesundheitswirkungen innerhalb einzelner Investitionen.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `true`

##### Eintrag 9

**risk_id:** R9

**description:** Schwächung parlamentarischer Transparenz durch fragmentierte Nebenhaushalte.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `true`

##### Eintrag 10

**risk_id:** R10

**description:** Fehlende Rückkopplung und Fortführung unwirksamer Programme.

**status:** TO_BE_TESTED

**non_compensation_relevance:** `false`


### decision_information_gap

#### required_before_or_for_review

- Konsolidierte Darstellung des Kernhaushalts und aller Sondervermögen ohne interne Transfers und Doppelzählungen.
- Titel- und programmbezogene Baselines, Zielzustände, Einheiten, räumliche Reichweite und Zeitbezug.
- Materielle Zusätzlichkeit gegenüber fortgeschriebenem Kernhaushalt und bereits geplanten Projekten.
- Ist-Vollzug und Mittelbindung früherer Jahre einschließlich Ausgaberesten und Verpflichtungen.
- Projektlisten, Reifegrade, Genehmigungsstände, Beschaffungspläne und Personal-/Planungskapazitäten.
- Lebenszyklus-, Betriebs-, Wartungs-, Personal- und Zinsfolgekosten.
- Verteilungswirkung nach Einkommen, Region, Geschlecht, Alter, Behinderung und Generation.
- Klima-, Ressourcen-, Biodiversitäts-, Gesundheits- und Sicherheitswirkungen der finanzierten Aktivitäten.
- Kausale Gegenfaktum-Grundlage für große Programme und Maßnahmenbündel.
- Unsicherheiten, Sensitivitäten und Szenarien zu Zinsen, Inflation, Baupreisen, Lieferketten und Umsetzungskapazität.
- Nichtkompensationsprüfung für Grundrechte, irreversible Umweltschäden, soziale Mindestversorgung und demokratische Budgetkontrolle.
- Öffentliche, maschinenlesbare Verknüpfung von Haushaltstitel, Output, Outcome, Evaluation und Korrekturentscheidung.

#### calculation_requirements

##### Eintrag 1

**calculation_id:** C1

**name:** Konsolidiertes Wirkungsbudget

**specification:** Kernhaushalt und Sondervermögen nach Transfers, Doppelzählungen, Ausgaberesten und Finanzierungsquellen konsolidieren; anschließend nach Wirkungsfeldern ausweisen.

###### required_inputs

- Kernhaushaltstitel
- Wirtschaftspläne aller Sondervermögen
- Transfermatrix
- Ausgabereste
- Finanzierungsquellen
- Programmzuordnung

###### available_inputs

_Leere Liste._

###### missing_inputs

- Kernhaushaltstitel
- Wirtschaftspläne aller Sondervermögen
- Transfermatrix
- Ausgabereste
- Finanzierungsquellen
- Programmzuordnung

**status:** DATA_GAP

##### Eintrag 2

**calculation_id:** C2

**name:** Investitionszusätzlichkeit

**specification:** Zusätzliche reale Investitionen gegenüber dem plausiblen Haushalts- und Projektgegenfaktum ermitteln; bloße Verlagerung oder Vorziehung separat ausweisen.

###### required_inputs

- Projektbaseline
- frühere Finanzplanung
- Projektstatus
- Kernhaushaltsvergleich
- Sondervermögenszuordnung
- Gegenfaktum

###### available_inputs

_Leere Liste._

###### missing_inputs

- Projektbaseline
- frühere Finanzplanung
- Projektstatus
- Kernhaushaltsvergleich
- Sondervermögenszuordnung
- Gegenfaktum

**status:** DATA_GAP

##### Eintrag 3

**calculation_id:** C3

**name:** Portfolio-Netto-Wirkung

**specification:** Positive und negative Outcomes je Portfolio mit Schutzgates zusammenführen; keine Addition über nichtkompensierbare Grenzen.

###### required_inputs

- Outcome-Indikatoren
- Baselines
- Reichweiten
- Attribution
- Unsicherheit
- Schutzgate-Prüfung

###### available_inputs

_Leere Liste._

###### missing_inputs

- Outcome-Indikatoren
- Baselines
- Reichweiten
- Attribution
- Unsicherheit
- Schutzgate-Prüfung

**status:** DATA_GAP

##### Eintrag 4

**calculation_id:** C4

**name:** Fiskalische Lebenszykluswirkung

**specification:** Kredit-, Zins-, Betriebs-, Wartungs- und Personalfolgekosten den vermiedenen Schäden und langfristigen Erträgen gegenüberstellen.

###### required_inputs

- Zinsprofil
- Tilgungsprofil
- Betriebs- und Wartungskosten
- Nutzungsdauer
- vermiedene Folgekosten
- Szenarien

###### available_inputs

_Leere Liste._

###### missing_inputs

- Zinsprofil
- Tilgungsprofil
- Betriebs- und Wartungskosten
- Nutzungsdauer
- vermiedene Folgekosten
- Szenarien

**status:** DATA_GAP

##### Eintrag 5

**calculation_id:** C5

**name:** Verteilungs- und Generationenwirkung

**specification:** Direkte und indirekte Lasten und Nutzen nach Gruppen, Regionen und Generationen ausweisen.

###### required_inputs

- Mikrodaten oder belastbare Verteilungsparameter
- Steuer-/Transferwirkung
- Nutzergruppen
- Regionaldaten
- Zeitprofil

###### available_inputs

_Leere Liste._

###### missing_inputs

- Mikrodaten oder belastbare Verteilungsparameter
- Steuer-/Transferwirkung
- Nutzergruppen
- Regionaldaten
- Zeitprofil

**status:** DATA_GAP

##### Eintrag 6

**calculation_id:** C6

**name:** Umsetzungs- und Absorptionsrisiko

**specification:** Reifegrad, Personal, Genehmigungen, Vergabekapazität und Lieferketten gegen Mittelvolumen und Zeitplan prüfen.

###### required_inputs

- Projektpipeline
- Reifegrad
- Personalbestand
- Vergabezeiten
- Genehmigungsstände
- Lieferkapazität

###### available_inputs

_Leere Liste._

###### missing_inputs

- Projektpipeline
- Reifegrad
- Personalbestand
- Vergabezeiten
- Genehmigungsstände
- Lieferkapazität

**status:** DATA_GAP


#### counterfactual_requirements

##### Eintrag 1

**question:** Wie sähen Kernhaushalt, Sondervermögen und reale Investitionen bei Fortschreibung des 2026er Plans ohne HG 2027 aus?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

##### Eintrag 2

**question:** Welche regulären Ausgaben würden ohne Sondervermögen entfallen, später erfolgen oder aus dem Kernhaushalt finanziert?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

##### Eintrag 3

**question:** Welche alternative Allokation desselben Finanzierungsvolumens erzeugte höhere positive Netto-Wirkung bei geringeren Lebenszyklusrisiken?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

##### Eintrag 4

**question:** Welche Kosten und Schäden entstehen bei Nichtinvestition oder Verzögerung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.

##### Eintrag 5

**question:** Wie verändern unterschiedliche Zins-, Inflations- und Umsetzungsszenarien die langfristige fiskalische und reale Wirkung?

**status:** REQUIRED_NOT_ESTABLISHED

**causal_rule:** No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.


### decision_gate_conclusion

**status:** CONDITIONAL

**meaning:** Kein Für/gegen-Votum. Die Fachakte ist als Folgencheck nutzbar, muss aber die ausgewiesenen Daten-, Gegenfaktums- und Schutzfragen offen halten bzw. nachliefern.

### vote_layer

**status:** PENDING

**roll_call:** PENDING

**individual_records_status:** NOT_APPLICABLE_YET

**rule:** Vor einer tatsächlichen Abstimmung keine Individualstimme oder Fraktionsposition erfinden.

**person_scoring_prohibited:** `true`

**vote_interpretation_rule:** Abstimmungsverhalten ist ein dokumentierter parlamentarischer Akt. Aus Ja/Nein/Enthaltung wird weder eine Motivation noch die gesamte Wirkung der Entscheidung oder ein Personenwert abgeleitet.