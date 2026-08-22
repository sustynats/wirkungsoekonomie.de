## WÖk CDU Primary-Source-Parity + Editorial-v2+ — final official PDF pp.63–64 fully reconciled

Fortsetzung direkt nach `ST_CDU_PRIMARY_PARITY_P60_P62 = PASS_SEGMENT` (`#234` comment `5374807332`). Vor diesem Batch wurden #234/#241/PR257 erneut gelesen. Geprüft wurden die effect-bearing Passagen der finalen parteioffiziellen CDU-Fassung auf **PDF pp.63–64** gegen das immutable Release-1-Register. `344` bleibt Working-/History-Baseline; kein finaler Nenner wird aus Legacy-Zeilen oder Child-Summen abgeleitet.

**Primärquelle:** `https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf`  
**Historische Working-Baseline:** `woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md`, blob `6e8c53392d76e9847ee3028d241a988c12b3d2fb`; IDs/Text immutable.

**Prüfbaselines, nur für Wirkung/Additionality/Delivery:**
- UBA Radverkehr, aktualisiert 13.08.2026: `https://www.umweltbundesamt.de/themen/verkehr/nachhaltige-mobilitaet/radverkehr`
- UBA Binnenschiffe, aktualisiert 09.06.2026: `https://www.umweltbundesamt.de/themen/verkehr/emissionsstandards/binnenschiffe`
- UBA Schifffahrt/Klimaanpassung: `https://www.umweltbundesamt.de/themen/wasser/fluesse/nutzung-belastungen/schifffahrt`
- UBA Luftverkehr/Klimawirkung: `https://www.umweltbundesamt.de/themen/verkehr/emissionsstandards/luftverkehr`
- Bundestag, GKE/Staustufen: `https://dserver.bundestag.de/btd/20/107/2010791.pdf`; die Bundesregierung hält fest, dass das Gesamtkonzept Elbe auf dem Eckpunktepapier beruht, das stabile Schifffahrtsbedingungen **unter Ausschluss des Baus von Staustufen in der Elbe** vorsieht.

### 1. Primary-Source-Parity pp.63–64

| Legacy | Klassifikation | source-bound Behandlung |
|---|---|---|
| `0236` Schiene/Netz/Elektrifizierung | `OVERMERGED` | fünf Mechanismen getrennt; kein Parent-Score |
| `0237` Verkehrssicherheitsarbeit | `OVERMERGED` | vier Zielgruppen/Angebotspfade getrennt |
| `0238` ländliche Mobilität | `OVERMERGED` | integrierter Pilot + sieben eigenständige Instrument-/Angebotspfade; Zusammenarbeit/Übertragbarkeit bleibt Delivery-Rahmen |
| `0239` Radverkehr | `OVERMERGED` | Radwegenetz/Suburbanzugang und sichere Abstell-/Ladeinfrastruktur getrennt |
| `0240` Wasserstraße/Luftverkehr | `OVERMERGED` | Ganzjahres-Schiffbarkeit als Goal-Parent; sieben konkrete Instrument-/Standortpfade getrennt |
| `0241` Rastplätze | `OVERMERGED` | Ausbau/Investition, Sicherheits-/Bewachungspfad, Bund-Länder-Konzept und lärmschutzfreundliche Anordnung getrennt |

In diesem Segment wurde **keine effect-bearing Finalpassage als ABSENT gegenüber dem Parentbestand gefunden**. Die Fachlücke liegt in der bisherigen Overmerge-Segmentierung, nicht in einem fehlenden gesamten Bullet. Alle historischen Parents bleiben erhalten und werden versioniert durch Children aufgelöst.

### 2. Terminale source-bound Mechanismen

#### `ST-CDU-PRIMARY-SPLIT-0236-RAIL-INFRA-ELECTRIFICATION-SPEED`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
**Key finding:** Erneuerung, Elektrifizierung und gezielte Kapazitäts-/Geschwindigkeitsverbesserung können Zuverlässigkeit, Energieeffizienz und Attraktivität der Schiene erhöhen, wenn nachfrage- und engpassbezogen priorisiert wird. **Problem:** Netzalter, Engpässe, Elektrifizierungslücken und Pünktlichkeit getrennt messen. **Goal:** zuverlässige emissionsarme Schienenleistung, nicht Investitionsvolumen. **Delivery:** wesentliche Netzhebel Bund/DB InfraGO; Land als Besteller/Advocacy nur teilweise. **Verteilung/Zeit:** Pendler, Güterverkehr, Regionen; langjährig. **Grenzen:** Flächen/Natur, Baufolgen, Lifecycle-Kosten. **Falsifikation:** Pünktlichkeit, Kapazität, Reisezeit, elektrifizierter Betrieb, Fahrgäste/Güter, Kosten.

#### `ST-CDU-PRIMARY-SPLIT-0236-HARZ-TOURIST-LONG-DISTANCE`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Touristischer Fernverkehr nördlich/südlich des Harzes kann autofreie Erreichbarkeit und Tourismuszugang verbessern. Nachfrage, Trassenkapazität und Wirtschaftlichkeit sind offen; ein Fernverkehrsangebot ist primär Betreiber-/Bundes-/Marktpfad, kein alleiniger Landes-Outcome. Recheck: Nachfrage, saisonale Auslastung, Reisezeit, Pkw-Verlagerung, Zuschuss-/Trassenbedarf.

#### `ST-CDU-PRIMARY-SPLIT-0236-FREIGHT-RAIL-SHIFT`
`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`  
**Reason:** Die Passage beschreibt die Entlastungswirkung einer Verlagerung von Gütern auf Schiene/kombinierten Verkehr, benennt aber kein zusätzliches Landesinstrument. Das Ziel ist plausibel; Wirkung hängt an Terminalkapazität, Trassen, Preisen, Zuverlässigkeit, Umschlag und Verladerentscheidungen. Keine positive Maßnahmenrichtung ohne Instrument. Falsifikation nach späterem Design: Tonnen-/tkm-Shift, Lkw-km, Terminal-/Trassenkapazität, Kosten, Emissionen.

#### `ST-CDU-PRIMARY-SPLIT-0236-NON-ELECTRIFIED-LINE-DECARBONISATION`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Nicht elektrifizierte Strecken auf einen belastbaren Dekarbonisierungspfad zu bringen kann fossile Traktion reduzieren; Oberleitung, Batterie oder andere Pfade dürfen nicht pauschal als wirkungsäquivalent behandelt werden. Delivery hängt an Netz-/Fahrzeug-Lifecycle, Streckennutzung und Bundes-/Betreiberzuständigkeit. Falsifikation: Diesel-km, Energieverbrauch, Lifecycle-THG, Infrastruktur-/Fahrzeugkosten, Zuverlässigkeit.

#### `ST-CDU-PRIMARY-SPLIT-0236-CROSSBORDER-LOCAL-TRANSIT`
`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`  
„Einfacher und günstiger“ ist ein Ziel, aber ohne Tarif-, Bestell-, Takt-, Infrastruktur- oder Ticketingdesign kein eigenständiger Wirkmechanismus. Goal Review: niedrigere grenzüberschreitende Zugangsfriktion und bessere Erreichbarkeit. Recheck: Takt, Reisezeit, Tarif, Umstiege, Fahrgastentwicklung, Finanzierung und ausländische Partnerabhängigkeit.

#### `ST-CDU-PRIMARY-SPLIT-0237-PRIMARY-SCHOOL-CYCLING-EDUCATION`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Radfahrausbildung im Grundschulalter kann Regel-, Wahrnehmungs- und Handlungskompetenz fördern; Polizei-/Schulkooperation ist Output, weniger Unfälle sind erst Outcome. Delivery: Schulen, Polizei, lokale Verkehrssicherheitsakteure, Übungsinfrastruktur. Verteilung: alle Kinder, Zugänglichkeit für Behinderung/fehlendes eigenes Fahrrad beachten. Falsifikation: Kompetenztest, Teilnahme, sichere Praxis, Unfall-/Beinaheunfalldaten altersbezogen.

#### `ST-CDU-PRIMARY-SPLIT-0237-SECONDARY-CYCLING-EDUCATION`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Fortführung in Sekundarstufe I kann altersgerechte Risikokompetenz aktualisieren, sofern Inhalte reale Jugendmobilität adressieren. Keine Wirkung aus Unterrichtsstunden allein. Recheck: Teilnahme, Kompetenztransfer, Verkehrsverhalten, Unfall-/Konfliktdaten.

#### `ST-CDU-PRIMARY-SPLIT-0237-ESCOOTER-SAFETY-EDUCATION`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Eine Erweiterung auf E-Scooter kann neue Konflikt-/Regelrisiken adressieren. Schutzpfade sind Fahrkompetenz, Regelwissen und Rücksicht auf Fuß-/Radverkehr; sie ersetzen sichere Infrastruktur und Vollzug nicht. Falsifikation: Kompetenz, Fehlverhalten, Unfall-/Konfliktdaten, Infrastrukturkontext.

#### `ST-CDU-PRIMARY-SPLIT-0237-SENIOR-ROAD-SAFETY-OFFERS`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Freiwillige altersgerechte Verkehrssicherheitsangebote können Risikowahrnehmung und sichere Mobilität unterstützen; Selbstselektion und Erreichbarkeit begrenzen den Effekt. Ziel ist sichere selbstständige Mobilität, nicht Kurszahl. Recheck: Reichweite, Kompetenz/Verhalten, Unfall-/Verletzungsschwere, regionale Zugänglichkeit.

#### `ST-CDU-PRIMARY-SPLIT-0238-RURAL-INTEGRATED-MOBILITY-PILOT`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Ein integriertes Modellprojekt kann reale ländliche Angebotslücken testen und Lernen vor flächiger Skalierung ermöglichen. `PILOT_AND_LEARN_AS_DESIGN != WOEK_RECOMMENDATION`. Problem Review: Erreichbarkeitslücken nach Zielgruppe/Region, nicht „ländlich“ pauschal. Delivery: Land, Kommunen, Aufgabenträger, private Anbieter; Übertragbarkeit muss nachgewiesen werden. Falsifikation: Erreichbarkeit, Kosten je Fahrt, Nutzung nach Gruppe, Anschlussqualität, Abbruch-/Skalierungskriterien.

#### `ST-CDU-PRIMARY-SPLIT-0238-AUTONOMOUS-RURAL-MOBILITY`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
Autonome Angebote können bei Fahrerknappheit und dünner Nachfrage neue Bedienmodelle ermöglichen; Sicherheitsnachweis, Betriebsbereich, Cyber-/Haftungsfragen, Barrierefreiheit und hohe Systemkosten sind materielle Bedingungen. Kein Technologie-Label als Mobilitätsoutcome. Recheck: Verfügbarkeit, Eingriffe/Sicherheitsereignisse, Kosten, Fahrgastnutzung, Ausfall-/Fallback-Fähigkeit.

#### `ST-CDU-PRIMARY-SPLIT-0238-ON-DEMAND-RURAL-TRANSIT`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
Ruf-/On-Demand-Verkehr kann in dünn besiedelten Gebieten Erreichbarkeit flexibler verbessern als starre Leerfahrten, wenn Bündelung, Verfügbarkeit, Tarifintegration und Anschluss funktionieren. Risiken: hohe Zuschüsse bei geringer Bündelung, digitale Exklusion. Falsifikation: Bedienzeit, Auslastung, Kosten/Fahrgast, ersetzte Pkw-Fahrten, analoge Buchbarkeit, Anschlussquote.

#### `ST-CDU-PRIMARY-SPLIT-0238-CITIZEN-BUS`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Bürgerbusse können lokale Versorgungslücken ergänzen und soziale Teilhabe stärken; freiwillige Kapazität, Verlässlichkeit und professionelle Grundversorgung dürfen nicht still ersetzt werden. Recheck: Fahrten, Ausfälle, Zielgruppenreichweite, Ehrenamtsstabilität, Kosten und Anschlusswirkung.

#### `ST-CDU-PRIMARY-SPLIT-0238-CARSHARING-RURAL`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
Carsharing kann Haushalten Zweit-/Eigenfahrzeuge ersparen, wenn Standorte, Buchbarkeit und Nachfrage passen; in dünnen Räumen kann Auslastung wirtschaftlich schwach sein und zusätzliche Fahrten statt Substitution entstehen. Falsifikation: Fahrzeuge je Nutzer, private Pkw-Bestände, Fahrleistung, Auslastung, Kosten, räumliche Abdeckung.

#### `ST-CDU-PRIMARY-SPLIT-0238-BIKESHARING-RURAL`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Bike-Sharing kann die letzte Meile und multimodale Anschlüsse verbessern, wenn sichere Wege, Stationierung und Wartung stimmen. Nutzen ist stark standortabhängig. Recheck: Nutzung, Verfügbarkeit, Defekte, Anschlusswege, Pkw-Substitution und regionale Verteilung.

#### `ST-CDU-PRIMARY-SPLIT-0238-ESCOOTER-INTEGRATED-BOOKING`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
E-Scooter mit verkehrsträgerübergreifender Buchung können kurze Anschlusswege erleichtern; Gehwegkonflikte, Abstellflächen, Unfallrisiken und zusätzliche statt substituierte Fahrten begrenzen den Nutzen. Digitale Buchung braucht barrierearme Alternativen. Recheck: Modal-Substitution, Unfälle/Konflikte, Abstellverstöße, Nutzungsgruppen, App-Zugang.

#### `ST-CDU-PRIMARY-SPLIT-0238-MOBILITY-LAW`
`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`  
Ein Mobilitätsgesetz ist ein Governance-/Rechtscontainer, dessen Wirkung vollständig vom Regelungsinhalt abhängt. „Bündelung“ kann Kohärenz schaffen, ist aber noch kein Zustandsmechanismus. Erst Ziele, Rechte/Pflichten, Finanzierung, Standards und Zuständigkeiten erlauben eine Wirkungsrichtung.

#### `ST-CDU-PRIMARY-SPLIT-0239-CYCLE-NETWORK-SUBURBAN-LINKS`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
Mehr **durchgängige, sichere und tatsächlich relevante** Radwege und bessere suburbane Verbindungen können aktive Mobilität, Gesundheit und Pkw-Verlagerung fördern. UBA betont Netzdurchgängigkeit/Sicherheit statt bloßer Wegzahl. Goal Review: sichere attraktive Alltagsverbindung, nicht Kilometerzahl. Delivery: Land/Kommunen/Baulastträger. Falsifikation: Netzlücken, Unfälle, Radverkehrsanteil, Pendlerwege, Nutzungs-/Regionseffekt.

#### `ST-CDU-PRIMARY-SPLIT-0239-SECURE-BIKE-PARKING-CHARGING`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Sichere Abstellanlagen und Lademöglichkeiten können Diebstahl-/Reichweitenbarrieren reduzieren, besonders an Umstiegen und Arbeitsorten. Output ist Stellplatzzahl; Outcome sind Nutzung, geringere Diebstahlfriktion und mehr Alltagsradverkehr. Recheck: Auslastung, Diebstahl, Standortqualität, Rad-/Pedelec-Pendeln.

#### `0240` Goal-Parent — ganzjährige Schiffbarkeit Elbe/Saale/Unstrut
`SOURCE_UNIT_RECLASSIFIED_VERSIONED` · `OPEN` · `NOT_ASSESSABLE`  
„Ganzjährige Schiffbarkeit“ ist ein Zielzustand, „geeignete Maßnahmen“ ist ohne Instrument unbestimmt. Klimabedingte Niedrigwasser sind ein reales Resilienzproblem; UBA weist zugleich darauf hin, dass Anpassung über Flotten-, Logistik-, Digital- und Gewässermaßnahmen erfolgen kann. Kein pauschaler Infrastruktur-Score. Die folgenden Children sind getrennt zu prüfen.

#### `ST-CDU-PRIMARY-SPLIT-0240-ELBE-WEIRS`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Staustufen könnten Wasserstände für einzelne Nutzungen stabilisieren, wären aber ein massiver, langfristiger Fluss- und Auen-Eingriff mit Durchgängigkeits-, Sediment-, Habitat-, Wasserstands- und Lock-in-Risiken. Besonders material: Das geltende **Gesamtkonzept Elbe schließt den Bau von Staustufen in der deutschen Elbe ausdrücklich aus**; die Programmformulierung „im Zuge des Elbe-Gesamtkonzepts“ ist damit policy-coherence-seitig nicht die aktuelle Baseline. **Problem:** Niedrigwasser/Schiffbarkeit ≠ Nachweis, dass Staustufen der wirksamste oder rechtlich tragfähige Engpasshebel sind. **Goal:** resiliente Transport-/Flussfunktion bei ökologischem Zustand. **Delivery:** Bundeswasserstraße, Bund/Länder/EU-Wasser-/Naturschutzrecht; Land nicht allein entscheidungsbefugt. **Grenzen:** WRRL/Natura/Flussdurchgängigkeit, Biodiversität, Hochwasser-/Grundwasserwirkungen, Irreversibilität. **Falsifikation:** hydrologischer Nutzen, Schiffbarkeit, Sediment/Sohle, Habitat-/Artenzustand, Kosten, Alternativen, Rechts-/GKE-Status.

#### `ST-CDU-PRIMARY-SPLIT-0240-SAALE-SIDE-CANAL`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
Ein Saale-Seiten-Kanal kann Güterverkehrskapazität und Hafenanbindung erhöhen, verursacht aber hohe CAPEX/Folge-, Flächen-, Gewässer-/Natur- und Nachfrage-/Stranded-Asset-Risiken. Bundesverkehrswegeplan-/Bundeskompetenz ist Delivery-Voraussetzung. Falsifikation: Güterpotenzial, Modal Shift, Kosten-Nutzen, Natur-/Wasserwirkung, Niedrigwasserresilienz, Lebenszykluskosten.

#### `ST-CDU-PRIMARY-SPLIT-0240-NO-DISMANTLING-TECHNICAL-STRUCTURES`
`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`  
Die pauschale Ablehnung des Rückbaus benennt weder Bauwerke noch Zustand, Funktion oder Gegenfaktum. Erhalt kann Sicherheit/Schifffahrt stützen oder ökologische Durchgängigkeit/Sanierung blockieren. Objektweise Lifecycle-, Sicherheits-, Gewässer- und Kostenprüfung nötig; kein pauschaler Richtungswert.

#### `ST-CDU-PRIMARY-SPLIT-0240-PORTS-SHIPYARDS-INTERMODAL`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Bessere intermodale Hafen-/Werftanbindung kann Umschlagfriktionen senken und bei tatsächlicher Verlagerung von der Straße Umwelt- und Netzentlastung unterstützen. UBA bewertet Binnenschiff pro Tonne klimagünstiger als Lkw, weist aber auf Luftschadstoffe und alte Flotten hin. Delivery: Hafen-/Schienen-/Straßen-/Wasserstraßen-Schnittstellen. Falsifikation: Umschlag, tkm-Shift, Lkw-km, Energie/THG, Luftschadstoffe, Auslastung.

#### `ST-CDU-PRIMARY-SPLIT-0240-WATER-TOURISM`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
Wassertourismus kann regionale Wertschöpfung und Naherholung stärken; zusätzlicher Verkehr, Uferdruck, Störungen und Infrastruktur können Natur-/Wasserziele belasten. Wirkung hängt an Besucherlenkung, Kapazität und Schutzdesign. Recheck: Nachfrage/Wertschöpfung, saisonale Belastung, Habitat-/Wasserzustand, lokale Verteilung.

#### `ST-CDU-PRIMARY-SPLIT-0240-COCHSTEDT-RESEARCH-SITE`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Ausbau eines bestehenden Flugplatzes als Forschungsstandort kann Test-/FuE-Kapazität und regionale Wissenscluster stärken, wenn Additionalität und offene Forschungsnutzung belegt sind. Kein automatischer Innovations-Outcome aus Infrastruktur. Recheck: Forschungsprojekte, Drittmittel, Wissenstransfer, Auslastung, öffentliche Kosten und ggf. Lärm-/Flugbetriebsfolgen.

#### `ST-CDU-PRIMARY-SPLIT-0240-LEJ-INTERNATIONAL-HUB-SUPPORT`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
Unterstützung des Flughafens Leipzig/Halle kann internationale Konnektivität, Fracht- und Standortfunktionen stützen; Luftverkehr erzeugt zugleich erhebliche CO2- und Nicht-CO2-Klimawirkungen sowie lokale Lärm-/Luftwirkungen. Ohne konkretes Unterstützungsinstrument ist die Größenordnung offen. Delivery zudem länder-/bundes-/EU- und Betreiberabhängig. Falsifikation: zusätzliche Flüge/Fracht/Jobs versus öffentliche Kosten, Lärmexposition, CO2- und Nicht-CO2-Klimawirkung.

#### `ST-CDU-PRIMARY-SPLIT-0241-REST-AREA-CAPACITY-INVESTMENT`
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
Zusätzliche bedarfsgerechte Lkw-/Bus-Stellplätze können Ruhezeiten, Logistik und Sicherheit verbessern; Neubau verursacht Fläche, Bau-/Betriebskosten und lokale Belastung. Problem Review: Standort-/Zeit-bezogenen Stellplatzmangel messen, nicht „Bedarf wächst“ pauschal. Delivery: Autobahn-/Bund-/private Autohofrollen trennen. Falsifikation: Fehlbelegung/Parksuchverkehr, Auslastung, Unfälle, Fläche, Kosten.

#### `ST-CDU-PRIMARY-SPLIT-0241-GUARDED-REST-AREA-SAFETY`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Bewachte Anlagen und risikobasierte Sicherheitsmaßnahmen können Diebstahl-/Übergriffs- und Ruhezeitrisiken reduzieren, wenn Bedarf und Wirksamkeit standortbezogen belegt sind. Grenzen: Datenschutz/Überwachung, faire Zugänglichkeit. Recheck: Vorfälle, Schadenshöhe, Nutzung, Fahrer-Sicherheitsgefühl, Kosten.

#### `ST-CDU-PRIMARY-SPLIT-0241-FEDERAL-REST-AREA-CONCEPT`
`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`  
Ein bundeseinheitliches Konzept ist Prozess-/Governance-Output; ohne Standards, Zuständigkeit, Flächen-/Finanzierungs- und Priorisierungsdesign keine eigenständige Wirkungsrichtung. Späterer Recheck gegen tatsächlichen Regelungsinhalt.

#### `ST-CDU-PRIMARY-SPLIT-0241-NOISE-SENSITIVE-TRUCK-LAYOUT`
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
Lärmschutzorientierte Anordnung der Lkw-Stellplätze kann Ruhebedingungen für Fahrer und angrenzende Bereiche verbessern, sofern Verkehrsführung/Sicherheit nicht verschlechtert werden. Recheck: Nachtpegel, Schlaf-/Beschwerdedaten, Konflikte, Unfall-/Manöverdaten.

### 3. Batchweite #241-Systemprüfung pp.63–64

- `PROBLEM_REVIEW`: Schienenlücken, Verkehrssicherheit, ländliche Erreichbarkeit, Radnetz, Niedrigwasser/Schiffbarkeit, Intermodalität, Luftverkehrskonnektivität und Rastplatzbedarf getrennt; technologische oder infrastrukturelle Lösung nie als Problemdefinition.
- `GOAL_REVIEW`: sichere/zugängliche/resiliente/emissionsarme Mobilität, tragfähige Güterlogistik und ökologisch funktionsfähige Gewässer; Fernzug, Kanal, Staustufe, App, Mobility Law oder Rastplatz sind Instrumente/Outputs.
- `DNS_REFERENCE = EXACT_REGISTRY_CROSSWALK_PENDING`; keine Keyword-Zuordnung, Zielbezug nie Kausalitätsnachweis.
- `MATERIAL_OMISSIONS`: Nachfrage-/Engpassbaseline, Investitions-/Folgekosten, Klima-/Natur-/Wasser-Lifecycle, bestehende Angebote, tatsächliche ländliche Erreichbarkeit, Betriebs-/Personal-/Digitalzugang, Niedrigwasserszenarien, Luftverkehr-Additionalität.
- `POLICY_COHERENCE`: besonders `0240-ELBE-WEIRS` gegen geltendes Gesamtkonzept Elbe; Schienen-/Rad-/Sharing-/ÖPNV-Pfade gegen Straßen-/Luft-/Wasserinfrastruktur nicht saldieren, sondern Interaktionen zeigen.
- `DELIVERY_FEASIBILITY`: Bund/DB/WSV/Bundesverkehrswegeplanung bei Schiene/Wasser/Autobahn; Land/NASA/Aufgabenträger bei SPNV; Kommunen/Private bei Sharing/Rast-/Radangeboten. Advocacy nie als umgesetzter Outcome.
- `RESOURCE_FINANCING`: CAPEX + Betrieb/Erhaltung + Folgekosten + Additionalität; Pilot-/Sharing-/Ehrenamtsmodelle mit realer Dauerfinanzierung prüfen.
- `SPATIAL_DISTRIBUTION`: ländliche Räume, Zentren, Harz, Grenzräume, Hafen-/Flusskorridore, Flughafenanrainer, Fahrer und Menschen ohne Pkw.
- `INTERNATIONAL_LEAKAGE`: Luftverkehr und Kraftstoff-/Fahrzeugketten material; grenzüberschreitender Verkehr als eigener Kooperationspfad.
- `ROBUSTNESS_STRESS_TEST`: Niedrigwasser/Klimawandel, Nachfrageverschiebung, Fach-/Fahrermangel, Cyber-/App-Ausfall, Ehrenamtsausfall, Baukosten, Netz-/Trassenengpässe.
- `REVERSIBILITY_LOCKIN`: Staustufen/Kanal/Flughafen-/Großinfrastruktur stark; Apps/Piloten/Sharing/Tarif- und Angebotsdesign leichter reversibel.
- `FALSIFICATION_TRIGGERS`: Reisezeit/Pünktlichkeit, Modal Shift, Unfall/Verletzung, Erreichbarkeit, Nutzung/Kosten, Klima/Luft/Lärm, Wasser-/Habitat-/Sedimentzustand, Niedrigwassernutzbarkeit, Flächen- und Lifecycle-Kosten.
- `LIFECYCLE_TRACEABILITY`: Wahlprogramm → Landesinitiative/Bestellung/Förderung bzw. Bund/DB/WSV/Kommunen → Rechts-/Planungs-/Vergabeakt → Infrastruktur/Service → Nutzung → Outcome → Reality Check.
- `VERSION_DELTA`: `0236–0241` bleiben historische Overmerge-Parents; Children additiv/stabil, keine Mutation alter Texte/IDs.
- `COMMUNICATION_MEDIA_IMPACT`: keine eigenständige Kommunikationswirkung ohne passagegebundenen Mechanismus; technologische/infrastrukturelle Positivframes nicht als Wirkungsbeweis übernehmen.
- `RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`; keine WÖk-Option ohne exact APPROVED RecommendationRecord.
- `STATE_GFA_ENAP_BENCHMARK = NOT_APPLICABLE`.
- `COVERAGE_SCOPE = ST_CDU_PRIMARY_SOURCE_P63_P64_FULL_SEMANTIC_RECONCILIATION`.

### 4. Checkpoint

`ST_CDU_PRIMARY_PARITY_P63_P64 = PASS_SEGMENT`  
`ST_CDU_P63_P64_NEW_OR_SPLIT_TERMINAL = PASS_30`  
`ST_CDU_P63_P64_UNRESOLVED_SOURCE_GAPS = 0`  
`ST_CDU_PRIMARY_SOURCE_PARITY = NOT_YET_FULL_PROGRAMME`  
`ST_CDU_FINAL_VERSIONED_MANIFEST = PENDING_DOCUMENT_WIDE_RECONCILIATION`  
`authoritative_source_unit_count = null`  
`authoritative_effect_mechanism_count = null`  
`denominator_status = NOT_FROZEN_PENDING_FULL_PRIMARY_SOURCE_PARITY`

**Nächster document-wide Scope:** finale offizielle PDF **p.65 ff.**, Übergang zu Wohnraum/Raumentwicklung. Kein Completion-Trigger vor Vollprogramm-Parity, konsistenter Segmentierungsregel, finalem Manifest, allen finalen Units terminal und 0 globalen Source-/Restore-/Overmerge-Gaps.
