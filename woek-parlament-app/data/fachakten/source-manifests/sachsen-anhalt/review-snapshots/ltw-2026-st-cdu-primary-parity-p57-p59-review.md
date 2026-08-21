## WÖk CDU Primary-Source-Parity + Editorial-v2+ — final official PDF pp.60–62 fully reconciled

Fortsetzung des document-wide Reaudits nach `ST_CDU_PRIMARY_PARITY_P57_P59 = PASS_SEGMENT`. Dieser Batch prüft die **finale parteioffizielle Beschlussfassung** source-bound gegen das historische Release-1-Register; `344` bleibt ausdrücklich nur Working-Baseline und wird nicht als Nenner fortgeschrieben.

**Primärquelle:** CDU Sachsen-Anhalt, finales Regierungsprogramm 2026–2031, `https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf` — Mobilitätsabschnitt pp.60–62. Der final indexierte Text enthält u.a. das Straßen-/Schienennetz-Portfolio, Verkehrsmanagement, Planungsbeschleunigung, Technologie-/Antriebspfade, Geschwindigkeits-/Umweltzonenpositionen, ÖPNV/Sachsen-Anhalt-Takt und Deutschlandticket.

**Historische Working-Baseline:** `woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md`, blob `6e8c53392d76e9847ee3028d241a988c12b3d2fb`; historische IDs/Text bleiben unverändert.

**Relevante externe Prüfbaselines:** UBA zu Tempolimits/Tempo 30 (`https://www.umweltbundesamt.de/themen/verkehr/nachhaltige-mobilitaet/tempolimit`), UBA-Lebenszyklusvergleich alternative Antriebe (`https://www.umweltbundesamt.de/publikationen/analyse-der-umweltbilanz-von-kraftfahrzeugen`), UmwRG §2/§7 (`https://www.gesetze-im-internet.de/umwrg/__2.html`, `https://www.gesetze-im-internet.de/umwrg/__7.html`), aktueller bundesrechtlicher Finanzierungsrahmen des Deutschlandtickets 2026 als Additionality-/Kompetenzbaseline. Keine dieser Quellen ersetzt den finalen Programmtext; sie dienen nur der Wirkungs-/Rechts-/Additionality-Prüfung.

### 1. Primary-Source-Parity pp.60–62

| Legacy | Klassifikation | source-bound Aktion |
|---|---|---|
| `0226` Verbraucherschutz | `SAME` | ID unverändert; ein eigenständiger Mechanismus |
| `0227` Technologiefeindlichkeit/Fahrverbote | `CONTEXT_ONLY` | politischer Frame/Einleitung; konkrete Regelungspfade stehen in `0232/0233`, daher kein zusätzlicher Effect-Count |
| `0228` Mobilitätsangebot … „Wir werden“ | `TRUNCATED` | Ziel-/Summary-Parent erhalten; die danach in der finalen Quelle stehenden konkreten Infrastrukturpfade werden additiv restauriert |
| `0229` Brückensanierungsplan + feste Elb-Querungen | `PARTIAL_PARENT` | bildet nur den Schluss des deutlich größeren Straßen-/Fernverkehrs-Bullets ab; zwei enthaltene Mechanismen versioniert splitten |
| `0230` Verkehrsmanagementzentrale + digitale Ausspielung | `OVERMERGED` | zwei Children |
| `0231` Planungsbeschleunigung/Präklusion/Stichtag/Mitwirkung/Verbandsklage | `OVERMERGED` | vier getrennte Rechts-/Delivery-Mechanismen |
| `0232` Technologieoffenheit + Diesel/BEV/H₂/Biokraftstoffe | `OVERMERGED` | Technologieframe nicht saldieren; vier antriebsspezifische Children |
| `0233` Autobahnlimit/Tempo 30/Umweltzonen | `OVERMERGED` | drei getrennte Regelungspfade |
| `0234` Busse+Infrastruktur/Takt/Wartebereiche | `OVERMERGED` | drei Children |
| `0235` SPNV/Takt/Deutschlandticket/ländlicher Nutzen | `OVERMERGED` | drei Children; ländlicher Mehrnutzen ohne Design fail-closed |

**Bestätigte ABSENT-/Split-Restauration aus dem vollständigen Straßen-/Fernverkehrs-Bullet hinter `0228`:**

- `ST-CDU-PRIMARY-GAP-P60-A14-A143-TRANSPORT-PLANS`
- `ST-CDU-PRIMARY-GAP-P60-A14-SIX-LANE`
- `ST-CDU-PRIMARY-GAP-P60-A71-NORTH`
- `ST-CDU-PRIMARY-GAP-P60-MAGDEBURG-EAST-RING`
- `ST-CDU-PRIMARY-GAP-P60-ICE-REGIONAL-CENTRES`
- `ST-CDU-PRIMARY-SPLIT-0229-BRIDGE-REHAB-PLAN`
- `ST-CDU-PRIMARY-SPLIT-0229-FIXED-ELBE-CROSSINGS`

Die finalen Source-Passagen sind damit für pp.60–62 vollständig gegen die Working-Baseline behandelt; historische Parents bleiben als Provenienzanker erhalten.

### 2. Terminale fachliche Entscheidungen — pp.60–62

#### `0226` — Verbraucherberatung/Schutz vor neuen Risiken
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · Evidenz `LOW`  
**Key finding:** Niedrigschwellige, verlässliche Beratung kann Informationsasymmetrien, Fehlentscheidungen und Schäden reduzieren, wenn Reichweite, Aktualität und Qualität gesichert sind. **Problem Review:** neue digitale/finanzielle/vertragliche Risiken sind heterogen; bloß „neue Risiken“ ist keine Baseline. **Goal Review:** informierte, geschützte Verbraucher statt Beratungsangebot als Output. **Delivery:** Land/Förderung/Verbraucherzentralen; Personal und Finanzierung sind Engpässe. **Verteilung/Zeit:** besonders Menschen mit geringer Informations-/Digitalkompetenz; kurz- bis mittelfristig. **Grenzen:** diskriminierungsfreier Zugang, Datenschutz. **Falsifikation:** Reichweite nach Gruppen/Region, Wartezeit, Falllösung, Beschwerden/Schäden, Kompetenz-/Entscheidungsmaße.

#### `ST-CDU-PRIMARY-GAP-P60-A14-A143-TRANSPORT-PLANS` — laufende Autobahn-/Verkehrsplanprojekte beschleunigt fertigstellen
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Fertigstellung bereits weit fortgeschrittener Netzprojekte kann Erreichbarkeit, Netzschluss und Verlässlichkeit verbessern; zusätzliche Straßenkapazität erzeugt zugleich Flächen-, Lebenszyklus-, Verkehrsverlagerungs-, Emissions- und Folgekostenrisiken. **Problem:** konkrete Engpässe/Netzlücken je Projekt statt „Infrastruktur“ pauschal. **Ziel:** zuverlässige Erreichbarkeit bei minimalen System-/Umweltfolgen. **Delivery/Kompetenz:** Bund/Land/Planfeststellung/Baulastträger; Projektstatus und Finanzierung trennen. **Verteilung/Zeit:** Pendler, Logistik, Anrainer, Naturflächen; jahrzehntelange Lock-ins. **Grenzen:** Natur-/Artenschutz, Flächenverbrauch, Lärm/Gesundheit, Rechtskontrolle. **Falsifikation:** Reisezeit/Engpass, Verkehrsmenge/induzierter Verkehr, Unfall/Lärm, Flächenverbrauch, THG/Lifecycle, Bau-/Folgekosten.

#### `ST-CDU-PRIMARY-GAP-P60-A14-SIX-LANE` — sechsspuriger A14-Ausbau belasteter Abschnitte
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Kapazitätsausbau kann lokale Spitzenengpässe reduzieren, ist aber ohne Korridor-/Nachfrageanalyse nicht als dauerhafte Stau- oder Wohlfahrtslösung belegt; induzierter Verkehr, Flächenversiegelung und Emissions-/Lärmlock-in sind materiell. **Problem:** nachzuweisen sind Engpassdauer, Nachfrageursache und Alternativen. **Ziel:** robuste Kapazität/Erreichbarkeit, nicht Fahrstreifenzahl. **Delivery:** Bundesautobahn/Bund; Land primär Advocacy. **Verteilung/Zeit:** Nutzer vs. Anrainer/Natur, langfristig. **Grenzen/Falsifikation:** wie oben plus Verkehrsnachfrage nach Ausbau, Modal Split, Lebenszykluskosten.

#### `ST-CDU-PRIMARY-GAP-P60-A71-NORTH` — Nordverlängerung A71 nach Bernburg
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Neue Netzverbindung kann regionale Erreichbarkeit verbessern, schafft aber besonders starken Neubau-/Flächen-/Biodiversitäts- und Pfadabhängigkeitshebel. **Problem Review:** belastbare Origin-Destination-/Engpassbaseline fehlt im Wahlprogramm. **Goal Review:** regionale Erreichbarkeit und Resilienz; Neubautrasse ist Instrument. **Delivery:** Bund/BVWP/Planung, Land als Initiator/Advocacy. **Verteilung:** betroffene Korridore, Kommunen, Landwirtschaft/Natur; sehr langfristig. **Grenzen:** Schutzgebiete, Flächen/Nichtkompensation, Wirtschaftlichkeit. **Falsifikation:** Nutzen-Kosten, Zeitgewinn, Verkehrsverlagerung, Natur-/Flächeneffekt, Folgekosten.

#### `ST-CDU-PRIMARY-GAP-P60-MAGDEBURG-EAST-RING` — Autobahnring östlich Magdeburg schließen
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Ein Ring kann Durchgangsverkehr verlagern und städtische Abschnitte entlasten, zugleich neue Verkehrsströme, Flächenverbrauch und Anrainerbelastungen an anderer Stelle erzeugen. **Problem:** aktuelle Durchgangsverkehrs-/Netzengpassdaten und Alternativen fehlen. **Ziel:** Netto-Entlastung/Erreichbarkeit statt Ringvollständigkeit. **Delivery:** Bund/Land/kommunale Schnittstellen. **Verteilung:** Innenstadtentlastung vs. neue Korridorbelastung. **Falsifikation:** Verkehrsverlagerung, Lärm/Luft, Reisezeit, Unfälle, Fläche, Kosten.

#### `ST-CDU-PRIMARY-GAP-P60-ICE-REGIONAL-CENTRES` — Fernverkehrsanbindung der Ober-/Mittelzentren und ICE-Anschluss Magdeburg
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
**Key finding:** Bessere Fernverkehrsanbindung kann Erreichbarkeit, Standortzugang und Verlagerung zum Schienenverkehr unterstützen; Wirkung hängt an Fahrplan, Infrastruktur, Nachfrage und DB-/Bundesentscheidungen. **Problem:** tatsächliche Erreichbarkeits-/Taktlücken je Zentrum. **Ziel:** verlässliche Reisezeit/Netzzugang, nicht Label ICE. **Delivery:** Bund/DB/InfraGO/EVU plus Länderbestellung nur im SPNV. **Verteilung/Zeit:** Zentren und ländliche Zubringer; mittel-/langfristig. **Grenzen:** Investitions-/Flächenfolgen. **Falsifikation:** Takt, Reisezeit, Pünktlichkeit, Umstiege, Fahrgastzahl, Modal Shift.

#### `ST-CDU-PRIMARY-SPLIT-0229-BRIDGE-REHAB-PLAN` — landesweiter Brückensanierungsplan
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
**Key finding:** Zustandsbasierte Sanierungspriorisierung kann Sicherheit, Verfügbarkeit und Erhalt vor teurem Ersatzneubau verbessern. **Problem:** alternde/limitierte Bauwerke müssen objektbezogen priorisiert werden. **Ziel:** sichere verfügbare Netze über Lebenszyklus. **Delivery:** je Straßenklasse Bund/Land/Kommune; Zustandsdaten, Planungs-/Baukapazität und Finanzierung erforderlich. **Verteilung:** Nutzer/Logistik/Anrainer; mittel-/langfristig. **Grenzen:** Sicherheit, Haushalts-/Lifecycle-Transparenz. **Falsifikation:** Zustandsnoten, Sperrungen, Traglast, Sanierungsstau, Kosten/Zeit.

#### `ST-CDU-PRIMARY-SPLIT-0229-FIXED-ELBE-CROSSINGS` — weitere feste Elb-Querungen
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Zusätzliche Querungen können Netzresilienz und Reisewege verbessern, sind ohne Standort-/Nachfrage-/Umweltprüfung aber kein generisch positiver Hebel. **Problem:** konkrete fehlende Redundanz/Wege-/Kapazitätslücke. **Ziel:** resiliente Querungskapazität. **Delivery:** Baulast/Planfeststellung je Projekt. **Verteilung:** Nutzergewinne vs. lokale Natur-/Anrainerkosten. **Grenzen:** Elbe-/Auen-/Natura-/Hochwasserraum, Flächen, Wirtschaftlichkeit. **Falsifikation:** Umweg-/Ausfalltage, Nachfrage, Natur-/Hochwasserwirkung, Kosten.

#### `ST-CDU-PRIMARY-SPLIT-0230-TRAFFIC-DATA-CENTRE` — landesweite Verkehrsmanagementzentrale / Datenzusammenführung
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Verkehrsübergreifende Echtzeitdaten können Störungsmanagement und Netzsteuerung verbessern; Zentralisierung schafft Datenschutz-, Interoperabilitäts-, Cyber- und Single-Point-of-Failure-Risiken. **Problem:** fragmentierte Leitstellen-/Datenlage konkret nachweisen. **Ziel:** bessere Netzperformance und Information, nicht Datenzentralisierung selbst. **Delivery:** Land, Kreise, Verkehrsunternehmen; Datenverträge/Standards/Resilienz nötig. **Verteilung:** alle Verkehrsteilnehmer, digital Ausgeschlossene beachten. **Grenzen:** Datenschutz, IT-Sicherheit, Zweckbindung. **Falsifikation:** Datenabdeckung/Latenz, Störungsreaktion, Reisezeit/Pünktlichkeit, Ausfälle/Cybervorfälle.

#### `ST-CDU-PRIMARY-SPLIT-0230-TELEMATICS-TRAVEL-INFO` — Hinweise über Navigation/INSA/Radio
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
**Key finding:** Multikanal-Echtzeitinformation kann Fehlfahrten, Unsicherheit und Störungsfolgen reduzieren, sofern Daten korrekt und barrierefrei zugänglich sind. **Problem:** Informationsfriktion/Qualität. **Ziel:** verlässliche Entscheidungen/Reiseplanung. **Delivery:** offene Schnittstellen + Anbieter. **Verteilung:** inklusive analoger/barrierefreier Kanäle. **Falsifikation:** Aktualität, Fehlmeldungen, Nutzungsquote, Reisezeit-/Anschlusswirkung.

#### `ST-CDU-PRIMARY-SPLIT-0231-FEDERAL-PLANNING-ACCELERATION` — Planungsbeschleunigungsgesetz auf Bundesebene
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Verfahrensvereinfachung kann Projektlaufzeiten senken, wenn Engpässe tatsächlich im Verfahren liegen; pauschale Frist-/Rechtsschutzverkürzung kann Fehler, Nacharbeit und Akzeptanz-/Naturfolgen erhöhen. **Problem:** Zeitanteile nach Planung, Personal, Genehmigung, Klage, Finanzierung und Bau trennen. **Ziel:** schnelle **und rechtssichere** Infrastruktur. **Delivery:** Bundesgesetzgeber; Land nur Initiative/Advocacy. **Grenzen:** effektiver Rechtsschutz, Umwelt-/Beteiligungsrecht. **Falsifikation:** Verfahrenszeit je Stufe, Klagequote/-dauer, Heilungsverfahren, Personalengpässe, Bauzeit.

#### `ST-CDU-PRIMARY-SPLIT-0231-PRECLUSION-CUTOFF` — Präklusion/Stichtagsregelung
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Frühzeitige Bündelung von Einwendungen kann Verfahren strukturieren, darf aber materiell relevante spätere Informationen und unions-/völkerrechtlich gebotenen Rechtsschutz nicht unzulässig abschneiden. **Problem:** Verzögerung durch verspätete Einwendungen ist fallbezogen zu belegen. **Ziel:** berechenbare Verfahren bei materiell wirksamer Kontrolle. **Delivery:** Bundes-/EU-Rechtsrahmen. **Grenzen:** Aarhus-/EU-Zugang zu Gerichten, Verhältnismäßigkeit. **Falsifikation:** tatsächlicher Zeitgewinn, spätere neue Tatsachen, Rechtsfehler/Heilungen, Gerichtsentscheidungen.

#### `ST-CDU-PRIMARY-SPLIT-0231-ACTIVE-PARTICIPATION-CONDITION` — Klagerechte an aktive Mitwirkung knüpfen
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Eine Beteiligungsobliegenheit kann frühere Konfliktklärung fördern; ein blanket Ausschluss effektiven Rechtsschutzes wäre dagegen rechtlich hoch riskant und kann Fehler-/Umweltschutzkontrolle schwächen. Das geltende UmwRG kennt bereits differenzierte Beteiligungs-/Einwendungsregeln, aber keinen frei gestaltbaren landespolitischen Blankoscheck. **Delivery:** primär Bund/EU/Aarhus; Land nicht allein kompetent. **Grenzen:** effektiver Rechtsschutz, Umweltrecht, faire Beteiligung. **Falsifikation:** welche Verfahren tatsächlich verzögert werden, Beteiligungsmöglichkeiten, Gerichts-/EU-Rechtsprüfung, Fehlerheilung.

#### `ST-CDU-PRIMARY-SPLIT-0231-ABOLISH-ASSOCIATION-ACTION` — komplette Abschaffung der Verbandsklage
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Weniger Verbandsrechtsbehelfe könnten einzelne Verfahren verkürzen; zugleich entfiele ein institutioneller Kontrollpfad für Umwelt-/Naturschutzrecht. §2 UmwRG und §64 BNatSchG verankern aktuell spezifische Verbandsrechtsbehelfe; unions-/Aarhus-Bindungen begrenzen die politische Umsetzbarkeit. **Problem:** kein Nachweis, dass Verbandsklagen der binding bottleneck der Gesamtverfahrensdauer sind. **Ziel:** rechtssichere Geschwindigkeit, nicht Klagezahl. **Delivery:** Bundes-/EU-/Völkerrechtsweg; Landesversprechen allein nicht umsetzbar. **Verteilung:** Vorhabenträger vs. Umwelt-/Anwohnerinteressen und künftige Generationen. **Grenzen:** Rechtsschutz/Nichtkompensation. **Falsifikation:** Zeitanteil Verbandsklagen, Erfolgs-/Fehlerquote, EU/Aarhus-Kompatibilität, Nacharbeit/Kosten.

#### `ST-CDU-PRIMARY-SPLIT-0232-LOW-EMISSION-DIESEL-INCENTIVE` — Anreize für „emissionsarmen Diesel“
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Neuere Diesel können lokale Schadstoffemissionen gegenüber Altflotten senken, bleiben aber fossil geprägt und erzeugen im Pkw-Straßenverkehr gegenüber direkter Elektrifizierung Energie-/THG-/Lock-in-Nachteile. **Problem:** Zielgröße muss Luftschadstoff, THG, Kosten oder Flottenerneuerung explizit trennen. **Ziel:** emissionsarme Mobilitätsleistung, nicht Antriebslabel. **Delivery:** wesentliche Steuer-/Flottenregeln Bund/EU; Landförderung begrenzt. **Grenzen:** Klima/Luft/Gesundheit. **Falsifikation:** reale g/km, Lebenszyklus-THG, Fahrleistung/Rebound, Flottenalter, Vollkosten.

#### `ST-CDU-PRIMARY-SPLIT-0232-BEV-INCENTIVE` — Anreize E-Mobilität
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
**Key finding:** Direkte batterieelektrische Nutzung ist im Straßenverkehr typischerweise energieeffizienter und über den Lebenszyklus klimagünstiger als Verbrenner-/H₂-/E-Fuel-Pkw; Nutzen hängt an Strommix, Fahrzeuggröße, Laufleistung und Ladeinfrastruktur. **Problem:** Dekarbonisierung/Luftbelastung/Importenergie getrennt. **Ziel:** emissions- und ressourceneffiziente Mobilität. **Delivery:** EU/Bund-Fahrzeugrahmen + Land/Lokal-Lade-/Flottenhebel. **Verteilung:** Anschaffungs-/Ladezugang beachten. **Grenzen:** Rohstoffe, Flächen, Stromnetz. **Falsifikation:** Lifecycle-THG, Strommix, Fahrzeuggröße, Ladeabdeckung, TCO, Fahrleistung.

#### `ST-CDU-PRIMARY-SPLIT-0232-HYDROGEN-DRIVE-INCENTIVE` — Anreize Wasserstoffantriebe
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** H₂ kann in einzelnen schwer elektrifizierbaren Nutzfahrzeug-/Spezialanwendungen sinnvoll sein, ist für Pkw gegenüber direkter Batterieelektrifizierung deutlich energieineffizienter; Klimawirkung hängt vollständig an H₂-Herkunft/Additionalität. **Problem/Ziel:** Nutzungskontext statt pauschale Technologieoffenheit. **Delivery:** Infrastruktur, H₂-Verfügbarkeit, EU/Bund-Regeln. **Grenzen:** erneuerbare Stromknappheit, Lifecycle, Kosten. **Falsifikation:** H₂-Herkunft, kWh/km, Lifecycle-THG, TCO, Auslastung Infrastruktur.

#### `ST-CDU-PRIMARY-SPLIT-0232-BIOFUEL-INCENTIVE` — Anreize Biokraftstoffantriebe
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Nachhaltige Rest-/Abfallpfade können fossile Kraftstoffe teilweise ersetzen; pflanzenbasierte/knappe Biokraftstoffpfade tragen Flächen-, indirekte Landnutzungs-, Biodiversitäts- und Opportunitätsrisiken. **Problem/Ziel:** schwer elektrifizierbare Restanwendungen und Feedstock-Additionalität explizit. **Delivery:** primär EU/Bund-Quoten/Nachhaltigkeitsregeln. **Grenzen:** Fläche/Nahrung/Biodiversität/Klima. **Falsifikation:** Feedstock, ILUC/Lifecycle-THG, verfügbare nachhaltige Mengen, Einsatzkonkurrenz.

#### `ST-CDU-PRIMARY-SPLIT-0233-NO-AUTOBAHN-SPEEDLIMIT-EXPANSION` — zusätzliche Autobahn-Tempolimits ablehnen
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Der Frame „unbegründet“ ersetzt keine Problembaseline. UBA/BASt-Befunde zeigen, dass Tempolimits in geeigneter Ausgestaltung THG, Schadstoffe und schwere Unfallfolgen mindern können; gegenläufig stehen individuelle Reisezeit-/Freiheitspräferenzen. Eine pauschale Ablehnung kann deshalb reale Schutzpotenziale blockieren. **Goal Review:** sichere, emissionsärmere, verlässliche Mobilität statt Geschwindigkeit als Endziel. **Delivery:** bundesrechtlicher Rahmen. **Grenzen:** Gesundheit/Sicherheit/Klima. **Falsifikation:** Unfälle/Schwere, Emissionen, Lärm, Reisezeiten, Verkehrsverlagerung.

#### `ST-CDU-PRIMARY-SPLIT-0233-NO-TEMPO30-MAIN-ROAD-EXPANSION` — Tempo-30-Ausweitung auf innerörtlichen Durchgangsstraßen ablehnen
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`  
**Key finding:** Tempo 30 auf Hauptverkehrsstraßen kann laut UBA insbesondere Lärm und Sicherheit verbessern; Luft-/CO₂-Effekte sind ortsabhängig. Ein generelles Nein ohne lokale Lärm-/Unfall-/Luftbaseline ist daher ebenso wenig evidenzbasiert wie ein undifferenziertes flächiges Ja. **Delivery:** StVO + kommunale Anordnungsspielräume. **Verteilung:** Durchfahrende vs. Anwohner/Fuß-/Radverkehr. **Grenzen:** Gesundheit/Sicherheit. **Falsifikation:** Lärm, Unfälle, Reisezeit, Verlagerung in Nebenstraßen, Luftschadstoffe.

#### `ST-CDU-PRIMARY-SPLIT-0233-ABOLISH-ENVIRONMENTAL-ZONES` — „überholte“ Umweltzonen aufheben
`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`  
**Key finding:** Die Wirkung bestehender Umweltzonen hängt heute stark von Flottenstand und lokaler Luftqualität ab; „überholt“ muss zonenspezifisch gemessen werden. Aufhebung kann Bürokratie reduzieren, darf aber bei verbleibender Grenzwert-/Hotspotwirkung Luftreinhalteziele nicht verschlechtern. **Delivery:** kommunale Luftreinhalte-/Straßenverkehrsentscheidungen im Rechtsrahmen. **Verteilung:** Anwohner mit hoher Exposition vs. Fahrzeughalter. **Falsifikation:** NO₂/PM vor/nach, Flottenzusammensetzung, Grenzwertnähe, Verlagerung, Verwaltungskosten.

#### `ST-CDU-PRIMARY-SPLIT-0234-CLEAN-BUSES-INFRA` — umweltfreundliche Busse + Infrastruktur fördern
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
**Key finding:** Niedrig-/Nullemissionsbusse können lokale Luft-/Lärmbelastung und bei sauberer Energie auch Lifecycle-THG senken; Fahrzeug-/Lade-/Depot-/Netzdesign entscheidet über Realwirkung. **Problem:** Flottenalter, Emissionen und Betriebskosten. **Ziel:** zuverlässige emissionsarme Verkehrsleistung. **Delivery:** Land/Aufgabenträger/Verkehrsunternehmen, Beschaffung + Infrastruktur synchron. **Verteilung:** besonders belastete Korridore; mittelfristig. **Grenzen:** Rohstoffe/Netz/Finanzierung. **Falsifikation:** Ausfallquote, Energie/km, Lifecycle-THG, TCO, Lärm/Luft, Fahrgastangebot.

#### `ST-CDU-PRIMARY-SPLIT-0234-EXPAND-SAXONY-ANHALT-TAKT` — Sachsen-Anhalt-Takt erweitern
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
**Key finding:** Dichter/verlässlicher Takt kann Erreichbarkeit und ÖPNV-Nutzung erhöhen; Wirkung entsteht nur mit Nachfragepassung, Anschlusssicherheit, Fahrzeug-/Personal-/Infrastrukturkapazität. **Problem:** konkrete Angebots-/Anschlusslücken je Region. **Ziel:** reale Erreichbarkeit. **Delivery:** Land/NASA/Aufgabenträger/EVU. **Verteilung:** ländliche Räume/kein Pkw-Zugang besonders relevant. **Falsifikation:** Takt/Pünktlichkeit, Anschlussverlust, Fahrgäste, Modal Shift, Kosten/Fahrgastkm.

#### `ST-CDU-PRIMARY-SPLIT-0234-WEATHERPROOF-WAITING` — witterungsunabhängige Aufenthaltsmöglichkeiten
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`  
**Key finding:** Wetterschutz kann Zugänglichkeit, Komfort und Resilienz bei Störungen erhöhen, besonders für ältere/kranke/mobilitätseingeschränkte Menschen. **Problem:** belastete Haltestellen/Umsteigeorte priorisieren. **Ziel:** nutzbare, sichere Mobilitätskette. **Delivery:** Stationseigentümer/Kommunen/DB/Verkehrsunternehmen. **Grenzen:** Barrierefreiheit/Sicherheit. **Falsifikation:** Abdeckung priorisierter Standorte, Nutzbarkeit, Beschwerden, Warte-/Störungsexposition.

#### `ST-CDU-PRIMARY-SPLIT-0235-SPNV-NETWORK-TAKT-CENTRES` — SPNV stärken / Ober- und Mittelzentren verbinden
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
**Key finding:** Verlässlicher SPNV zwischen Zentren kann Erreichbarkeit, Teilhabe und Verlagerung vom Pkw unterstützen; Infrastruktur-/Personalengpässe und Nachfrage bestimmen den Grenznutzen. **Problem:** konkrete Reisezeit-/Takt-/Pünktlichkeitslücken. **Ziel:** verlässliche Zugänglichkeit. **Delivery:** Land/NASA/EVU, DB InfraGO bei Netz. **Verteilung:** Pendler, Jugendliche, ältere Menschen, ländliche Zubringer. **Falsifikation:** Takt, Pünktlichkeit, Fahrgäste, Reisezeit, Modal Split, Zugänglichkeit.

#### `ST-CDU-PRIMARY-SPLIT-0235-RETAIN-DEUTSCHLANDTICKET` — Deutschlandticket erhalten
`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`  
**Key finding:** Einheitlicher Tarif senkt Zugangs-/Komplexitätsbarrieren; der Bund sichert 2026 weiterhin Finanzierungsmittel, sodass ein künftiges Landesversprechen Additionalität und Finanzierungsperiode sauber ausweisen muss. Tarif allein ersetzt kein Angebot. **Problem:** Preis-/Tarifkomplexität und ÖPNV-Zugang getrennt. **Ziel:** bezahlbare einfache Mobilität. **Delivery:** Bund/Länder/Aufgabenträger; dauerhafte Finanzierung/Preisdesign. **Verteilung:** Nutzen hängt an vorhandener ÖPNV-Dichte. **Falsifikation:** Nutzung nach Region/Einkommen, Angebotskilometer, Preis, Einnahmeausgleich, Modal Shift.

#### `ST-CDU-PRIMARY-SPLIT-0235-RURAL-DEUTSCHLANDTICKET-BENEFIT` — ländliche Bevölkerung soll stärker profitieren
`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`  
**Reason:** Die Passage benennt einen plausiblen Verteilungsanspruch, aber **kein Instrument**, ob Angebotsausbau, Preisstaffel, Zubringer, On-Demand, Park&Ride oder andere Leistung. **Problem:** geringerer Nutzen eines Flatrate-Tickets bei dünnem Angebot ist plausibel, muss regional gemessen werden. **Goal Review:** vergleichbarer Mobilitätsnutzen/Erreichbarkeit, nicht identischer Ticketbesitz. **Delivery:** Land/Aufgabenträger plus Bundes-/Tarifverbund. **Grenzen:** regionale Fairness, Finanzierbarkeit. **Falsifikation:** Nutzungs-/Angebotsdaten Land/Stadt, Wegezeit, Bedienhäufigkeit, Ausgabenwirkung. Terminal bleibt bewusst ohne Wirkungsrichtung bis zum Design.

### 3. Batchweite #241-Systemprüfung pp.60–62

- `PROBLEM_REVIEW`: Erreichbarkeit, Netzengpass, Planungsdauer, Luft/Lärm/Sicherheit, ländliche Angebotslücke und Informationsfriktion getrennt; politische Frames wie „ideologisch“, „grundlos“ oder „Technologieoffenheit“ sind **keine** empirische Problembaseline.
- `GOAL_REVIEW`: Endziele sind sichere, bezahlbare, erreichbare, resiliente und emissions-/ressourcenschonende Mobilität; Autobahnkilometer, Fahrstreifen, Antriebslabel, Klagezahl und Geschwindigkeit sind Instrument-/Zwischenachsen.
- `MATERIAL_OMISSIONS`: projektweise Nachfrage/Gegenfaktum, induzierter Verkehr, Lifecycle-/Flächen-/Lärm-/Naturkosten, Betriebs-/Erhaltungskosten, SPNV-Kapazität, reale ländliche Zugänglichkeit, technologiebezogene Energie-/Feedstock-Additionalität.
- `POLICY_COHERENCE`: Straßenausbau/Tempolimit-/Umweltzonenpfade gegen ÖPNV/Schiene/Rad/Antriebsdekarbonisierung getrennt auf Wechselwirkungen prüfen; keine Portfolio-Saldierung.
- `DELIVERY_FEASIBILITY`: Bundesautobahnen/BVWP/Schienenfernverkehr/UmwRG sind nicht allein Landeskompetenz; Landesrolle als Bundesratsinitiative/Advocacy/Ko-Finanzierung/Bestellung transparent machen.
- `RESOURCE_FINANCING`: CAPEX + Erhaltung/Betrieb + Opportunitätskosten je Infrastrukturtyp; keine Scheingenauigkeit ohne Projektansatz.
- `SPATIAL_DISTRIBUTION`: ländlicher Raum, Zentren, Pendler, Anrainer, Natur-/Auenkorridore, Menschen ohne Pkw getrennt.
- `INTERNATIONAL_LEAKAGE`: bei Kraftstoffen/Antrieben Energie-/Rohstoff-/Feedstock-Lieferketten; sonst überwiegend `NOT_APPLICABLE/LOW_MATERIALITY`.
- `ROBUSTNESS_STRESS_TEST`: Demografie, Energiepreise, Fachkräftemangel, Baukosten, Niedrig-/Hochwasser für Querungen, Cyberausfall der Verkehrssteuerung, Nachfrageverschiebung.
- `REVERSIBILITY_LOCKIN`: neue Straßen/Querungen besonders stark; digitale Info/Takt/Busbeschaffung deutlich reversibler/skalierbarer.
- `FALSIFICATION_TRIGGERS`: Reisezeit/Pünktlichkeit, Verkehrsmenge/Modal Split, Unfälle, Lärm/Luft/THG, Flächen-/Naturwirkung, Lifecycle-/Folgekosten, Nutzungs-/Verteilungsdaten, Rechts-/Gerichtsstatus.
- `LIFECYCLE_TRACEABILITY`: Wahlprogramm → Landesposition/Bundesinitiative/Bestellung/Förderung → Planung/Rechtsakt/Vergabe → Bau/Betrieb/Service → Nutzung → Zustands-/Verteilungsoutcome → Reality Check.
- `VERSION_DELTA`: `0228/0229/0230–0235` versioniert als Parents/Overmerges behandeln; historische Texte/IDs nicht mutieren.
- `COMMUNICATION_MEDIA_IMPACT`: „ideologisch“, „diskriminierend“, „grundlos“, „Technologieoffenheit“ als politische Frames separat dokumentieren, **nicht** als Maßnahmenwirkung oder Problembefund übernehmen.
- `DNS_REFERENCE = EXACT_REGISTRY_CROSSWALK_PENDING`; keine Keyword-Zuordnung, Zielbezug nie Kausalitätsnachweis.
- `STATE_GFA_ENAP_BENCHMARK = NOT_APPLICABLE` für Wahlprogramm-Source-Units.
- `RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`; keine WÖk-Handlungsoption ohne exact APPROVED RecommendationRecord.

### 4. Fortschritt / Completion Guard

`ST_CDU_PRIMARY_PARITY_P60_P62 = PASS_SEGMENT`  
`ST_CDU_P60_P62_SOURCE_RESTORE_GAPS = 0`  
`ST_CDU_P60_P62_NEW_OR_SPLIT_TERMINAL = PASS_26`  
`ST_CDU_PRIMARY_SOURCE_PARITY = IN_PROGRESS`  
`authoritative_source_unit_count = null`  
`authoritative_effect_mechanism_count = null`  
`denominator_status = NOT_FROZEN_PENDING_FULL_PRIMARY_SOURCE_PARITY`

**Kein Completion-Trigger:** weder `344` noch `344 + n` noch die Summe der bisherigen Shard-Children ist der finale CDU-Nenner. Freeze erst nach vollständigem final-official PDF-Diff unter einer konsistenten Segmentierungsregel und 0 Source-/Restore-/Overmerge-Gaps über das gesamte Programm.

**Nächster konfliktarmer Source-/Fachscope:** finale offizielle PDF **pp.63–65**, beginnend bei `0236` Schiene/Elektrifizierung über Verkehrssicherheit, ländliche Mobilität, Rad, Wasserstraße/Luftverkehr und Rastplätze bis zum Übergang Wohnraum/Raumentwicklung.
