## CDU Primary-Source-Parity / Fachbatch P43–P46 — Energie: vollständiger Kapitel-Diff, 36 Restore-/Split-Mechanismen terminal source-bound geprüft

Fresh #234/#241/PR257 re-read. Dieser Batch setzt **hinter** dem bereits abgeschlossenen Landwirtschaftssegment P40–P42 an und arbeitet das komplette Kapitel **„Energie – sicher und bezahlbar“** der finalen parteioffiziellen CDU-PDF, **P43–P46**, bis unmittelbar vor „Frühkindliche Bildung“ ab. Die historischen 344 Release-1-Records bleiben immutable Working-Baseline; `authoritative_source_unit_count` und `authoritative_effect_mechanism_count` bleiben ausdrücklich **nicht eingefroren**.

**Primärquelle:** CDU Sachsen-Anhalt, *Regierungsprogramm zur Landtagswahl am 6. September 2026*, beschlossen am 13.06.2026, P43–P46: https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf  
**Historisches Register:** `woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md`, blob `6e8c53392d76e9847ee3028d241a988c12b3d2fb`.

### 1. Primary-Source-Parity gegen Release-1

| Primärpassage | Legacy | Parity | Konsequenz |
|---|---|---|---|
| Kapitelkopf/Leitbild P43 | `0169`, `0170` | `CONTEXT_ONLY` | historisch erhalten, nicht als eigener Effect-Mechanism zählen |
| Versorgung/Resilienz | `0171` | `SAME` | source-exakt, fachlich unten revalidiert |
| Akzeptanz-/Beteiligungsgesetz evaluieren | `0172` | `OVERMERGED` | Source-Text ist vollständig, Legacy hängt aber die nächste Zwischenüberschrift „Wir werden“ an; clean Child versionieren |
| regionale Strompreiszonen | `0173` | `SAME` | source-exakt |
| Industriestrompreis + Prüfung der Auskömmlichkeit | – | `ABSENT` | neue stabile Unit |
| Verbraucher/EE-Netzkostenverteilung | `0174` | `SAME` | source-exakt; Additionality-Baseline beachten |
| „Neue Ideen … starre Rahmenbedingungen“ | `0175` | `CONTEXT_ONLY` | kein hinreichend bestimmter eigenständiger Hebel |
| Technologieoffenheits-/Wind-Bündel P44 | nur Teilfragmente `0175/0176` | `PARTIAL_PARENT` | fünf fehlende eigenständige Mechanismen additiv restaurieren; `0176` selbst bleibt `SAME` |
| Flächenbeitragswerte nach 2027 ablehnen | `0176` | `SAME` | source-exakt, gegen geltendes WindBG prüfen |
| Kohlekompromiss/Strukturmittel/stoffliche Braunkohle | – | `ABSENT` | drei Mechanismen additiv restaurieren |
| dezentrale Erzeugung + Nachbarschaftsstrom + Speicher | `0177` | `OVERMERGED` | zwei Children |
| Smart Grids/Bidirektional + Netzentgelt + BKZ | `0178` | `OVERMERGED` | drei Children |
| CCS/CCU + Batterie + Wärmespeicher + synthetische Kraftstoffe | `0179` | `OVERMERGED` | vier technologiegetrennte Children; kein Parent-Score |
| H2-Industrie + Gas/H2-Kraftwerk + Erzeugung + Forschung/Region + Kernnetzanschluss | `0180` | `OVERMERGED` | fünf Children; kein Parent-Score |
| Wärmeplanung + Bioenergie + EU-Förderung + Geothermie + Abwärme | `0181` | `OVERMERGED` | fünf Children |
| Biogas/Biomethan + Gasinfrastruktur + Einspeisung + Rechtsrahmen | `0182` | `OVERMERGED` | vier Children |
| PV/Solarthermie | `0183` | `PARTIAL_PARENT` | Legacy erfasst nur Betrieb/Vermarktung; Solarpflicht, Landesliegenschaften und Freiflächensteuerung fehlen als drei Children |

`TRUNCATED = 0` in diesem Kapitel nach Restore; `UNRESOLVED_SOURCE_GAPS = 0` für P43–P46.

### 2. Stable source-v2 Records + terminale Fachentscheidung

#### Bestehende SAME-Units, source-bound revalidiert

- `0171` **Versorgung mit verlässlicher Energie / Speicher-Netze-Ersatzleistung / Resilienz** — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW`. **Problem Review:** Versorgungssicherheit, Bezahlbarkeit und Resilienz sind reale Systemziele, „grundlastfähig“ ist aber kein eigenständiger Bedarfsnachweis; maßgeblich ist gesicherte Leistung/Flexibilität im Gesamtsystem. **Goal Review:** problemadäquat nur als Mehrzielkorridor aus Versorgung, Kosten, Klima und Resilienz. Speicher/Netze/Ersatzkapazität können Engpässe schließen; technologieblinder Kapazitätserhalt kann Lock-in/Überkapazität erzeugen. Land nur teilweise zuständig. Recheck: Adequacy, SAIDI/Engpass/Redispatch, Flexibilitätsbedarf, Vollkosten, Emissionen, Import-/Brennstoffabhängigkeit.
- `0173` **regionale Strompreiszonen initiieren** — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW`. Regionale Preiszonen können Netzengpässe/Standortsignale besser abbilden und in Überschussregionen zeitweise niedrigere Großhandelspreise bringen; Gegenpfade sind höhere Preise andernorts, Liquiditäts-/Hedgingeffekte, Investitionssignale und neue Verteilung. **Problem Review:** Sachsen-Anhalts Preis-/Wettbewerbsproblem ist nicht allein durch die einheitliche Zone bewiesen. **Goal Review:** Bezahlbarkeit/Wettbewerbsfähigkeit ja; Zonensplit ist Instrument, kein Endziel. Umsetzung primär Bund/EU/Marktdesign, Land = Initiative/Advocacy. Recheck: zonale Modellierung von Verbraucher-/Industriepreisen, Redispatch/Netzkosten, Investitionen, Verteilung.
- `0174` **EE-Netzkosten regional fairer verteilen** — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`, aber `INHERITED_CURRENT_BASELINE`. Die BNetzA verteilt EE-bedingte Mehrkosten besonders belasteter Verteilernetze bereits seit **01.01.2025** bundesweit; 2026 wurde der Mechanismus fortentwickelt. Daher ist nicht „Einführung“, sondern zusätzliche Ausgestaltung/Entlastung zu prüfen. Positiv ist die breitere Kostenteilung in hoch belasteten EE-Regionen; Kosten verschwinden nicht, sondern werden bundesweit umgelegt. Recheck: tatsächliche regionale Netzentgelte, Haushalts-/Unternehmensbelastung, bundesweite Gegenbelastung, Investitions-/Netzsignale. Amtlich: https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Aktuelles/VerteilungNetzkosten/start.html
- `0176` **starre Flächenbeitragswerte nach 2027 ablehnen** — `EDITORIAL_V2_PLUS_APPROVED · NEGATIVE · MEDIUM` **für eine Umsetzung ohne rechtlich gleichwertigen Ersatzpfad**. Das geltende WindBG verlangt für Sachsen-Anhalt 1,8 % bis 31.12.2027 und 2,2 % bis 31.12.2032. Ein bloßes Fallenlassen des post-2027-Pfads würde Ausbau-/Planungssicherheit schwächen und ist bundesrechtlich gebunden; ein alternatives Design, das den 2032-Pfad rechtssicher gleichwertig erfüllt, wäre separat zu bewerten. Recheck: tatsächlich ausgewiesene/anrechenbare Flächen, Genehmigungen/Zubau, Natur-/Akzeptanzwirkungen, Rechtsänderung. Amtlich: https://www.gesetze-im-internet.de/windbg/anlage.html
- `0183` **unbürokratischer Betrieb/Vermarktung von PV/Solarthermie** — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · LOW`. Geringere echte Transaktionshürden können Investition/Nutzung erleichtern; Wirkung hängt von konkreten Regeln ab und darf Schutz-/Netzanforderungen nicht blind entfernen. Recheck: Bearbeitungs-/Anschlusszeit, zusätzliche Kapazität, Netzdienlichkeit, Kosten, Beschwerden/Fehler.

#### `0172` sauber versioniert

- `ST-CDU-PRIMARY-SPLIT-0172-ACCEPTANCE-LAW-EFFECTIVENESS-REVIEW` — `SOURCE_UNIT_RECLASSIFIED_VERSIONED · POSITIVE · MEDIUM`; `parent=0172`. Exakte Source-Unit endet **vor** „Wir werden“. Eine echte Wirksamkeitsprüfung des bereits beschlossenen Akzeptanz-/Beteiligungsgesetzes kann Beteiligungsdesign evidenzbasiert verbessern. Sie beweist nicht vorab, dass Beteiligung Investitionen/„Akzeptanz“ kausal erhöht. Baseline: Gesetz wurde vom Landtag beschlossen; daher Evaluation/Weiterentwicklung, keine Neuerfindung. Recheck: kommunale Zahlungen/Nutzung, Bürgerbeteiligung, Projekt-/Genehmigungsdaten, Akzeptanzmessung mit geeignetem Gegenfaktum, Verteilung. Amtlicher Gesetzgebungskontext: https://www.landtag.sachsen-anhalt.de/43-sitzungsperiode

#### P43 — fehlender Hebel

- `ST-CDU-PRIMARY-ADD-P43-INDUSTRIAL-POWER-PRICE-ADEQUACY` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON · OPEN · NOT_ASSESSABLE · ABSENT`. Source: Industriestrompreis wird begrüßt; zugleich soll geprüft werden, ob er ausreicht. Ohne genaue Tarif-/Beihilfe-/Finanzierungs-/Begünstigtenstruktur ist keine robuste Nettowirkungsrichtung möglich. Potenzial: energieintensive Produktion/Arbeitsplätze stabilisieren; Risiken: fiskalische/Quersubventionskosten, Mitnahme, verzerrte Effizienz-/Transformationssignale und Verteilung. Bund/EU-Hebel, Land primär Advocacy. Recheck: Begünstigtenkreis, Preisdelta, Zusatzkosten, Produktion/Investitionen/Emissionen, Transformationskonditionalität.

#### P44 — Technologieoffenheit/Wind: fünf fehlende Mechanismen

- `ST-CDU-PRIMARY-SPLIT-0175-EQUAL-PROMOTION-ALL-ENERGY-FORMS` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON · OPEN · NOT_ASSESSABLE · ABSENT_CHILD`. „Alle Energieformen gleichberechtigt fördern“ definiert weder Technologien noch Fördermaßstab. Gleichbehandlung ist keine Wirkungsäquivalenz: Vollkosten, Emissionen, Flächen/Rohstoffe, Flexibilität und Reifegrad unterscheiden sich. Erst konkretes Instrument/Technologieportfolio bewertbar.
- `ST-CDU-PRIMARY-SPLIT-0175-AFFORDABILITY-GUARD` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · LOW · ABSENT_CHILD`. Bezahlbarkeit als explizite Designbedingung kann regressiven Belastungen vorbeugen; ohne Verteilungs-/Vollkostenmaß bleibt die konkrete Wirkung offen. Recheck: Energieausgabenquote, Einkommen/Branche/Region, System- statt Einzeltechnologiekosten.
- `ST-CDU-PRIMARY-SPLIT-0175-EARLY-PUBLIC-PARTICIPATION` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM · ABSENT_CHILD`. Frühzeitige, verständliche Beteiligung kann Informationsqualität, Konfliktbearbeitung und Verfahrenslegitimität verbessern; keine Garantie für Zustimmung. Schutz: Beteiligung muss ergebnisoffen/rechtskonform sein, nicht bloß Akzeptanzmarketing. Recheck: Beteiligungszeitpunkt/-reichweite, Einwendungen/Änderungen, Verfahrensdauer, repräsentative Akzeptanzdaten.
- `ST-CDU-PRIMARY-SPLIT-0175-WIND-IN-FOREST-RESTRAINT` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW · ABSENT_CHILD`. Waldrestriktionen können Biodiversitäts-, Boden-, Wasser- und Erholungsfunktionen schützen; pauschale Einschränkungen können zugleich geeignete Flächen verknappen, Kosten/Netzpfade verschieben und Klimaziele erschweren. Recheck: Standortalternativen, Waldtyp/Ökosystemwert, kumulative Naturwirkung, Ertrag/Netzanschluss, Flächenzielpfad.
- `ST-CDU-PRIMARY-SPLIT-0175-MUNICIPAL-CONSENT-AND-BENEFIT` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW · ABSENT_CHILD`. Lokaler Nutzen/Beteiligung kann Verteilung und Legitimität verbessern; ein absolutes kommunales Zustimmungserfordernis kann bei ungeklärter Rechtsarchitektur zusätzliche Vetopunkte/regionale Blockaden schaffen. Recheck: konkrete Rechtsform, Beteiligungserlöse, Projektzeiten, räumliche Verteilung, Bundes-/Planungsrecht.

#### P44 — Kohlekompromiss: drei ABSENT-Mechanismen

- `ST-CDU-PRIMARY-ADD-P44-COAL-EXIT-2038-CONTINUITY` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM · ABSENT`. Festhalten am gesetzlichen Ausstiegspfad erhöht kurzfristig Planungssicherheit; zugleich ist 2038 der späteste gesetzliche Endpunkt und das KVBG enthält Überprüfungen/Vorziehungsoptionen. Klimawirkung hängt vom tatsächlichen Abschaltpfad, Ersatzmix und EU-ETS ab. Bundesrechtlicher Baselinepfad, keine neue Landesleistung. Amtlich: https://www.gesetze-im-internet.de/kvbg/__4.html
- `ST-CDU-PRIMARY-ADD-P44-COAL-REGION-TARGETED-STRUCTURAL-FUNDS` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM · ABSENT`, `INHERITED_CURRENT_BASELINE`. Zielgerichtete Strukturmittel können Diversifizierung, Beschäftigung und Infrastruktur unterstützen; Mittelabfluss ist Output, nicht Outcome. Das InvKG stellt Sachsen-Anhalt bereits bis 2038 Strukturhilfen bereit. Recheck: Additionalität, private Folgeinvestitionen, Produktivität/Jobs/Löhne, Demografie, Flächen-/Klimaeffekte, Vollkosten. Amtlich: https://www.gesetze-im-internet.de/invkg/__1.html
- `ST-CDU-PRIMARY-ADD-P44-LIGNITE-MATERIAL-USE` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW · ABSENT`. Stoffliche Braunkohlenutzung kann regionale Wertschöpfung/Forschung erhalten, ist aber kein pauschal klimaneutraler Pfad; Lebenszyklus, Kohlenstoffbindung/-freisetzung, Tagebaufolgen, Alternativrohstoffe und Lock-in sind produktspezifisch. Recheck: konkrete Produkte/Mengen, Lebenszyklus-Emissionen, Resttagebau-/Flächen-/Wasserwirkung, Substitution, Wirtschaftlichkeit.

#### `0177` — zwei Children

`0177 = SOURCE_UNIT_RECLASSIFIED_VERSIONED · OVERMERGED`.
- `ST-CDU-PRIMARY-SPLIT-0177-NEIGHBORHOOD-ELECTRICITY-SHARING` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · LOW`. Lokaler Stromhandel/Sharing kann Eigenverbrauch, Teilhabe und lokale Nutzung erhöhen; Netz-„Entlastung“ ist ohne zeit-/ortsscharfe Steuerung nicht automatisch. Bund/EU/Marktdesign relevant. Recheck: tatsächliche Last-/Einspeiseprofile, Netzwirkung, Preise, Zugang Mieter/Nicht-Eigentümer.
- `ST-CDU-PRIMARY-SPLIT-0177-ELECTRICITY-STORAGE-SUPPORT` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`. Speicher können Verschiebung, Flexibilität und Integration variabler EE verbessern, wenn Standort/Steuerung systemdienlich sind. Risiken: Rohstoff-/Lebenszyklus, Doppel-/Fehlförderung, netzschädliche Betriebsweise. Recheck: nutzbare Leistung/Energie, Zyklen, vermiedener Redispatch/Spitzen, Vollkosten/Lifecycle.

#### `0178` — drei Children

`0178 = SOURCE_UNIT_RECLASSIFIED_VERSIONED · OVERMERGED`.
- `ST-CDU-PRIMARY-SPLIT-0178-SMART-GRIDS-BIDIRECTIONAL-CHARGING` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`. Intelligente Steuerung/V2G kann Flexibilität bereitstellen; nötig sind Interoperabilität, Mess-/Tarifdesign, Nutzerakzeptanz, Batterie-/Datenschutzbedingungen. Recheck: verfügbare Flexleistung, Peak-/Redispatchwirkung, Batteriedegradation, Nutzerkosten.
- `ST-CDU-PRIMARY-SPLIT-0178-STORAGE-NETWORK-TARIFF-DESIGN` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON · OPEN · NOT_ASSESSABLE`. „Faire Netzentgeltstruktur“ ist Ziel, kein ausreichend definiertes Instrument. Bewertung erst mit konkreter Kostenallokation, zeit-/ortsvariablen Signalen und Verteilungsdesign.
- `ST-CDU-PRIMARY-SPLIT-0178-ABOLISH-BKZ-GRID-SERVING-STORAGE` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW`. Wegfall des Baukostenzuschusses kann netzdienliche Speicherinvestitionen erleichtern; ohne präzise Netzdienlichkeitskriterien können Anschlusskosten sozialisiert und Standortsignale geschwächt werden. Regulatorischer Bundes/BNetzA-Hebel. Recheck: zusätzliche systemdienliche Kapazität, Anschlusskosten, Netzausbau, Standort/Dispatch, Verteilungswirkung.

#### `0179` — vier technologiegetrennte Children

`0179 = SOURCE_UNIT_RECLASSIFIED_VERSIONED · OVERMERGED`; **kein Parent-Gesamtscore**.
- `ST-CDU-PRIMARY-SPLIT-0179-CCS-CCU-AND-CO2-TRANSPORT` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM`. CCS kann schwer vermeidbare Prozessrestemissionen mindern; Risiken: Energie-/Infrastrukturbedarf, Permanenz/Haftung, Leckage, Fossil-Lock-in und Verdrängung direkter Vermeidung. CO2-Transport ist Infrastrukturoutput. Bundestag beschloss die KSpG-Novelle am 06.11.2025; konkrete Landeswirkung bleibt Umsetzungs-/Standortfrage. Amtlich: https://www.bundestag.de/dokumente/textarchiv/2025/kw45-de-kohlendioxid-speicherung-1116742
- `ST-CDU-PRIMARY-SPLIT-0179-BATTERY-STORAGE` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`. Flexibilitäts-/Netznutzen bei systemdienlichem Betrieb; Lifecycle/Rohstoffe/Standort berücksichtigen. Recheck: Systemdienstleistungen, vermiedene Engpässe, Wirkungsgrad, Zyklen, Vollkosten/Lifecycle.
- `ST-CDU-PRIMARY-SPLIT-0179-HEAT-STORAGE` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`. Wärmespeicher können Lasten zeitlich verschieben und Wärme-/Stromsysteme koppeln; Wirkung hängt Wärmequelle, Temperatur, Netz/Gebäude und Verlusten ab. Recheck: nutzbare Speichermenge, Verluste, Peakreduktion, Wärmevollkosten, Emissionen.
- `ST-CDU-PRIMARY-SPLIT-0179-SYNTHETIC-FUELS` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM`. Für schwer direkt elektrifizierbare Anwendungen können synthetische Kraftstoffe relevant sein; breite Nutzung erzeugt hohe Strom-/H2-Opportunitätskosten und hängt von zusätzlicher erneuerbarer Energie, CO2-Quelle und Einsatzfall ab. Kein Technologie-Label als Wirkungsäquivalenz. Recheck: Einsatzsektor, Strom/H2-Additionalität, Well-to-use-Effizienz, CO2-/Luftschadstoff-Lifecycle, Alternativen.

#### `0180` — fünf Children

`0180 = SOURCE_UNIT_RECLASSIFIED_VERSIONED · OVERMERGED`; **kein Gesamturteil**.
- `ST-CDU-PRIMARY-SPLIT-0180-GREEN-H2-INDUSTRIAL-USE` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`, sofern zusätzlicher erneuerbarer H2 in schwer elektrifizierbaren industriellen Anwendungen fossile Einsatzstoffe ersetzt. Recheck: Herkunft/Additionalität, Einsatzprozess, vermiedene Lifecycle-Emissionen, Vollkosten.
- `ST-CDU-PRIMARY-SPLIT-0180-GAS-H2-POWER-PLANT` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM`. Gesicherte flexible Leistung kann Resilienz/Adequacy unterstützen; Erdgasphase erzeugt Methan-/CO2-, Auslastungs-, H2-Verfügbarkeits- und Stranded-Asset-Risiken. „H2-ready“ ist noch kein H2-Betrieb. Recheck: Bedarf/Auslastung, Umstellungsdatum/-kosten, Brennstoffherkunft, Emissionen, Alternativflexibilität.
- `ST-CDU-PRIMARY-SPLIT-0180-OWN-H2-PRODUCTION-CAPACITY` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW`. Regionale Erzeugung kann Versorgung/Industrie unterstützen; Wirkung hängt Stromadditionalität, Elektrolyseauslastung, Wasser, Netzen und Endnutzung ab. Recheck: erneuerbare Herkunft, Wasser-/Netzbedarf, kg-H2/Lifecycle, Kosten.
- `ST-CDU-PRIMARY-SPLIT-0180-H2-RESEARCH-AND-REGIONAL-ECOSYSTEM` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · LOW`. Forschung/Cluster können Lern-, Koordinations- und Innovationsfähigkeit erhöhen; Förderung ist Output, wirtschaftliche/dekarbonisierende Wirkung nicht garantiert. Recheck: Demonstration→Skalierung, Patente/Investitionen, Nutzung, vermiedene Emissionen, Förderadditionalität.
- `ST-CDU-PRIMARY-SPLIT-0180-INDUSTRY-CONNECTION-H2-CORE-NETWORK` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`, aber `INHERITED_FEDERAL_NETWORK_BASELINE`. Die BNetzA genehmigte das 9.040-km-Wasserstoff-Kernnetz am 22.10.2024, sukzessive Inbetriebnahme bis 2032. Landeshebel ist insbesondere Anschluss-/Standort-/Projektkoordination, nicht das Kernnetz selbst. Recheck: reale Anschlusskapazität/Datum, H2-Verfügbarkeit/-herkunft, industrielle Nutzung, Kosten/Emissionen. Amtlich: https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2024/20241022_H2Kernnetz.html

#### `0181` — fünf Children

`0181 = SOURCE_UNIT_RECLASSIFIED_VERSIONED · OVERMERGED`.
- `ST-CDU-PRIMARY-SPLIT-0181-HEAT-PLANNING-FEASIBILITY-AFFORDABILITY` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW`. Rechtssicherheit, technische Machbarkeit und Bezahlbarkeit sind legitime Designziele; „realistisch“ ist noch kein Instrument und darf Dekarbonisierungsziele nicht implizit abschwächen. Wärmeplanung ist seit 2024 bundesrechtlich etabliert; Additionalität = konkrete Landesumsetzung. Amtlich: https://www.gesetze-im-internet.de/wpg/WPG.pdf
- `ST-CDU-PRIMARY-SPLIT-0181-BIOMASS-BIOMETHANE-WOODCHIP-HEAT` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM`. Regelbare erneuerbare Wärme kann sinnvoll sein, besonders bei Rest-/Abfallstoffen; Risiken sind Flächen-/Biodiversitätsdruck, Luftschadstoffe, Methanlecks und Nutzungskonkurrenz. Recheck: Feedstock/Herkunft, Lifecycle, lokale Luftqualität, Wärmevollkosten, Alternativen.
- `ST-CDU-PRIMARY-SPLIT-0181-EU-FUNDING-CHECK` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON · OPEN · NOT_ASSESSABLE`. „EU-Fördermittel prüfen“ enthält noch kein bestimmtes Programm, Additionalitäts- oder Auswahlkriterium; Förderzugang ist Output, Wirkung erst nach Projektdesign.
- `ST-CDU-PRIMARY-SPLIT-0181-GEOTHERMAL-LOOP-HEAT` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · LOW`. Geothermie kann lokale, emissionsarme Wärme liefern, sofern geologisch/technisch passend; Investitions-, Bohr-/Genehmigungs- und ggf. induzierte Risiken standortspezifisch. Recheck: nutzbare Wärme, Bohr-/Netzkosten, Wärmevollkosten, Betriebsdaten, Umwelt-/Seismikauflagen.
- `ST-CDU-PRIMARY-SPLIT-0181-WASTE-HEAT-INFRASTRUCTURE` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM`. Nutzbare Abwärme kann Primärenergiebedarf senken; abhängig von Temperatur, räumlicher Nähe, Langfristigkeit der Quelle und Netzkosten. Recheck: gesicherte Abwärmemenge/-temperatur, Netzverluste, Vollkosten, Vertrags-/Quellenrisiko, vermiedene Energie/Emissionen.

#### `0182` — vier Children

`0182 = SOURCE_UNIT_RECLASSIFIED_VERSIONED · OVERMERGED`.
- `ST-CDU-PRIMARY-SPLIT-0182-FLEXIBLE-BIOGAS-BIOMETHANE-CAPACITY` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM`. Regelbare Bioenergie kann Flexibilität/gesicherte Leistung liefern; Nachhaltigkeit hängt stark von Substrat, Methanverlusten, Flächen- und Nutzungskonkurrenz ab. Recheck: Substratmix, Methanschlupf, flexible Fahrweise/Systemwert, Lifecycle, Kosten.
- `ST-CDU-PRIMARY-SPLIT-0182-REUSE-GAS-STORAGE-TRANSPORT-INFRASTRUCTURE` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · LOW`. Bestehende Infrastruktur kann Transformationskosten senken; zugleich kann sie fossile Pfadabhängigkeit verlängern, wenn Feedstock/Umrüstpfad nicht klar ist. Recheck: kompatible Infrastruktur, Auslastung, Restwert/Umrüstung, Brennstoffmix, Lock-in.
- `ST-CDU-PRIMARY-SPLIT-0182-BIOMETHANE-GRID-INJECTION` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM`. Einspeisung erhöht Nutzungsflexibilität erneuerbarer Gase; Wirkung steht und fällt mit nachhaltigem Biomethan, Methanemissionen und Alternativnutzung. Recheck: eingespeiste zusätzliche Mengen, Herkunft/Lifecycle, Methanschlupf, Kosten, tatsächliche fossile Substitution.
- `ST-CDU-PRIMARY-SPLIT-0182-EEG-GAS-MARKET-EU-RULE-ADAPTATION` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON · OPEN · NOT_ASSESSABLE`. Ohne konkrete gewünschte Normänderung ist Richtung nicht belastbar; EEG/Gasmarkt sind primär Bundes-/EU-Hebel. Recheck erst anhand konkreter Rechtsänderung, Kostenallokation und Nachhaltigkeitskriterien.

#### `0183`-Umfeld — drei fehlende PV-Children

- `ST-CDU-PRIMARY-SPLIT-0183-REJECT-SOLAR-MANDATE` — `EDITORIAL_V2_PLUS_APPROVED · AMBIVALENT · MEDIUM · ABSENT_CHILD`. Verzicht auf Pflicht vermeidet Zwangs-/Grenzfallkosten, kann aber wirtschaftlich geeigneten Dach-PV-Zubau verlangsamen. Nettoeffekt hängt Alternativanreizen, Gebäudetyp, Netz und Vollkosten ab. Recheck: zusätzlicher Dachzubau, Wirtschaftlichkeit, Verteilung Mieter/Eigentümer, Netz-/Emissionswirkung.
- `ST-CDU-PRIMARY-SPLIT-0183-STATE-ROOFS-FACADES-PV` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM · ABSENT_CHILD`. Nutzung geeigneter Landesdächer/-fassaden/PV-Zäune schafft direkten öffentlichen Zubau/Demonstration; Output ist installierte Kapazität, Outcome sind Erzeugung, Kosten-/Emissions- und Netzwirkung. Recheck: Eignungsquote, MW/MWh, Eigenverbrauch, Vollkosten, Netzprofil, Lifecycle.
- `ST-CDU-PRIMARY-SPLIT-0183-FREESPACE-PV-LAND-STEERING-AGRIPV` — `EDITORIAL_V2_PLUS_APPROVED · POSITIVE · MEDIUM · ABSENT_CHILD`. Vorrang von Brach-/Konversions-/ertragsschwachen Flächen und Doppelnutzung durch Agri-PV kann Konflikte mit hochwertigen Ackerböden reduzieren. Kein automatischer Naturgewinn: Biodiversität, Boden, Landschaft, Netz und reale Doppelnutzung sind standortabhängig. Recheck: Flächentyp/ha, landwirtschaftlicher Ertrag, Biodiversitäts-/Bodenindikatoren, MW/MWh, Netzanschluss, Rückbau.

### 3. Batchweite #241-Systemprüfung P43–P46

- `PROBLEM_REVIEW`: Bezahlbarkeit, Versorgung/Adequacy, Netzkosten/Engpässe, Flexibilität, industrielle Dekarbonisierung und Wärmedekarbonisierung getrennt. Einheitliche Preiszone, Flächenwerte oder „Technologieoffenheit“ sind **Instrument-/Frame-Achsen**, keine empirischen Problembeweise.
- `GOAL_REVIEW`: bezahlbare/resiliente/klimakompatible Energieversorgung, industrielle Transformation und faire Verteilung sind Mehrzielarchitektur. Instrumente nie als Endziel behandeln.
- `DNS_REFERENCE = EXACT_REGISTRY_CROSSWALK_PENDING`; keine Keyword-Zuordnung, Alignment nie Kausalität.
- `STATE_GFA_ENAP_BENCHMARK = NOT_APPLICABLE` für Wahlprogramm-Source-Units.
- `MATERIAL_OMISSIONS`: Systemkosten/Adequacy, EE-/H2-Additionalität, Methan/Lifecycle, Flächen/Natur, Netz-/Flexibilitätswert, soziale/regionale Kostenverteilung, Alternativtechnologien, konkrete Rechts-/Förderdesigns.
- `POLICY_COHERENCE`: Wind-Flächenzielablehnung gegen WindBG-Zielpfad; Kohle 2038/Strukturmittel gegen KVBG/InvKG-Baseline; Netzkosten gegen laufende BNetzA-Verteilung; H2-Anschluss gegen genehmigtes Kernnetz; Wärmeplanung gegen WPG. Bestehende Rechts-/Policy-Baseline nie als künftige Eigenleistung zählen.
- `DELIVERY_FEASIBILITY`: Landeshebel von Bund/EU/BNetzA/Netzbetreiber-/Kommunalhebeln strikt trennen; Advocacy ist keine Umsetzung.
- `RESOURCE_FINANCING`: keine Scheingenauigkeit; Vollkosten, Förderadditionalität, Netz-/Folgekosten, Brennstoff-/Rohstoffkosten und Opportunitätskosten je Technologie rechecken.
- `SPATIAL_DISTRIBUTION`: Strom-/Netzpreise, Wind/PV-Flächen, Strukturwandel, Wärmenetze, Industrie-/H2-Anschlüsse und lokale Umweltlasten räumlich explizit.
- `INTERNATIONAL_LEAKAGE`: H2-/synthetische Kraftstoffe/Biomasse/Technologieimporte nur mit Herkunfts-/Lifecycle-Layer.
- `ROBUSTNESS_STRESS_TEST`: Dunkelflaute/Spitzenlast, Brennstoff-/H2-Preis und -Verfügbarkeit, Netzengpässe, verzögerter Ausbau, Nachfrage-/Industrieschock, Hitze/Dürre für Biomasse/Wasser.
- `REVERSIBILITY_LOCKIN`: Gas/H2-Kraftwerk, CO2-/Gas-/Wärmenetz und größere Infrastruktur besonders; Förder-/Pilotdesign und modulare Speicher/PV tendenziell reversibler.
- `FALSIFICATION_TRIGGERS`: Preise, SAIDI/Adequacy, Redispatch, Netz-/Speicherdaten, reale H2-Herkunft/Nutzung, Lifecycle-Emissionen, Wärmevollkosten, Zubau/Flächen, regionale Belastung/Entlastung, Investition/Beschäftigung.
- `LIFECYCLE_TRACEABILITY`: Wahlprogramm → Land/Bund/EU/BNetzA/Planung/Förderung → Rechts-/Marktdesign → Investition/Bau → Betrieb/Nutzung → Zustands-/Verteilungs-/Klimaoutcome → Reality Check.
- `COMMUNICATION_MEDIA_IMPACT`: „ideologiefrei“, „starre Rahmenbedingungen“, „Vorreiter“, Fairness-/Standort-/Akzeptanzframes nur passagegebunden als Kommunikationslayer; nie aus Maßnahmenrichtung ableiten.
- `RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`; keine WÖk-Option erzeugt.
- `COVERAGE_SCOPE = ST_CDU_PRIMARY_SOURCE_P43_P46_ENERGY_FULL_CHAPTER`.

### 4. Fortschritt / Completion-Gate

- P43–P46: **vollständige passageweise Primary-Source-Parity dieses Kapitels = PASS**.
- **36** neu restaurierte/gesplittete effect-mechanism Source-v2-Records in diesem Batch fachlich terminal klassifiziert.
- Legacy SAME-Units `0171/0173/0174/0176/0183` source-bound revalidiert; `0169/0170/0175` als `CONTEXT_ONLY`; Overmerge-/Partial-Parents bleiben historisch erhalten und werden nicht still mutiert.
- **0 unresolved Source-/Restore-/Overmerge-Gaps innerhalb P43–P46** nach versionierter Child-Auflösung.
- **Nächster document-wide Primary-Source-Parity-Scope: P47 „Frühkindliche Bildung“ ff.**

`ST_CDU_PRIMARY_PARITY_P43_P46 = PASS_SEGMENT`  
`ST_CDU_P43_P46_NEW_OR_SPLIT_TERMINAL = PASS_36`  
`ST_CDU_P43_P46_UNRESOLVED_SOURCE_GAPS = 0`  
`ST_CDU_PRIMARY_SOURCE_PARITY = NOT_YET_FULL_PROGRAMME`  
`ST_CDU_FINAL_VERSIONED_MANIFEST = PENDING_DOCUMENT_WIDE_RECONCILIATION`  
`authoritative_source_unit_count = null`  
`authoritative_effect_mechanism_count = null`  
`denominator_status = NOT_FROZEN_PENDING_FULL_PRIMARY_SOURCE_PARITY`  
`ST_CDU_TERMINAL_COMPLETE = FALSE`  
`#234_TERMINAL_COMPLETE = FALSE`

**PR257-Handoff:** Diese P43–P46-Befunde sind jetzt source-bound in #234 freigegeben. PR #257 darf sie erst nach sequenzieller Materialisierung der bereits fachlich freigegebenen Zwischenmanifeste P23–P42 aufnehmen; kein Sprung über fehlende Manifestsegmente, kein Denominator-Freeze, PR bleibt DRAFT.
