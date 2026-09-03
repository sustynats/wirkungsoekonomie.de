# Audit: Externe Quellen, Daten, Regularien und Vergleichsmodelle

Status: draft  
Stand: 2026-05-22

## Angelegte Dateien

- `content/sources/external-source-registry.json`
- `content/sources/external-source-registry.md`
- `content/sources/source-categories.yml`
- `content/sources/certification-to-woek-mapping.json`
- `content/sources/alternative-models-revival-monitor.json`
- `content/sources/source-to-woek-mapping.json`
- `content/comparisons/economic-models-comparison.json`
- `docs/externe-quellen-governance.md`
- `docs/vergleich-wirtschaftsmodelle-methodik.md`

## 1. Welche Quellenkategorien wurden erstellt?

Erstellt wurden:

- `eu_regulations_and_official_data`
- `global_sdg_un_science_data`
- `germany_municipal_sources`
- `standards_methods_and_impact_frameworks`
- `esg_rating_methodologies_and_sustainability_data_providers`
- `product_lca_epd_and_data_space_sources`
- `consulting_and_professional_services`
- `certifications_labels_standards`
- `alternative_economic_models_and_revival_debates`

Das Register ist schema-konform erweitert um Quelle, Status, URLs, Lizenzhinweise, Prüfdatum, Updatefrequenz, Quellenqualität, WÖk-Nutzung, Wirkungsräume, Datenarten, Glossarbezüge, Risiken, Kopierpolitik, empfohlene Aktion und `llm_use`.

## 2. Welche Primärquellen wurden erfasst?

Erfasst wurden unter anderem EU-Kommission, EUR-Lex-nahe Rechtsquellen, EFRAG, ESMA, EEA/Eurostat/JRC-Kontext, UN, UNSD, UNDP, UNEP, FAO, WHO, ILO, World Bank, OECD, IPCC, IPBES, Destatis, UBA, Bundesministerien, KfW, RNE/DNK und kommunale Quellen.

## 3. Welche EU-Regularien wurden erfasst?

Erfasst wurden Reporting, Sustainable Finance, Lieferketten, Produkte, Kreislaufwirtschaft, Klima/Energie/Industrie und Digital-/Datenrechtsakte, darunter CSRD, ESRS, EFRAG Guidance, XBRL Taxonomy, EU-Taxonomie, SFDR, EU Green Bond Standard, ESG Ratings Regulation, CSDDD, LkSG-Bezug, CBAM, EUDR, Forced Labour, ESPR, DPP, Waste Framework, PPWR, Batteries Regulation, REACH, CLP, EU ETS, Fit for 55, RED, EED, NZIA, DSA, DMA, Data Act, AI Act, NIS2 und European Data Spaces.

Hinweis: Konkrete Rechtsstände, Anwendungsfristen und Schwellenwerte bleiben prüfpflichtig.

## 4. Welche UN-/SDG-Datenquellen wurden erfasst?

Erfasst wurden Agenda 2030, UN SDG Goals, SDG Global Indicator Framework, UNSD SDG Data Portal, UN Data, UNDP SDG Resources, UNEP, FAO, WHO, ILOSTAT, UNESCO, UN-Habitat, World Bank, OECD, IPCC, IPBES, Paris Agreement / UNFCCC, CBD und Sendai Framework.

## 5. Welche Reportingstandards wurden erfasst?

Erfasst wurden GRI, IFRS S1/S2, ISSB, SASB, CDP, TCFD historisch, TNFD, GHG Protocol, PCAF, SBTi, EMAS, EPD/EN 15804, PEF/OEF, SDG Compass, UN Global Compact, B Corp / B Impact Assessment sowie Impact- und Social-Value-Methoden.

## 6. Welche ESG-Ratinganbieter wurden erfasst?

Erfasst wurden Morningstar Sustainalytics, MSCI ESG, S&P Global CSA / Sustainable1, ISS ESG, Moody's ESG, LSEG / Refinitiv, FTSE Russell, EcoVadis, CDP Scores, Clarity AI, RepRisk, Bloomberg ESG, FactSet Truvalue, Arabesque und Covalence.

Regel: Nur öffentliche Methodik und Anbieterprofile; keine Ratings, Scores oder proprietären Daten.

## 7. Welche KfW-/kommunalen Quellen wurden erfasst?

Erfasst wurden KfW Nachhaltigkeit, KfW SDG-Mapping, KfW Wirkungsmanagement, SDG-Portal Deutschland, Mannheim 2030, Mannheim Modell / wirkungsorientierte Steuerung, Köln als Prüfpunkt für Nachhaltigkeitshaushalt sowie Voluntary Local Reviews.

## 8. Welche Quellen sind nur teilweise zugänglich oder proprietär?

Teilweise oder potenziell proprietär sind insbesondere ESG-Ratinganbieter, private Nachhaltigkeitsdatenanbieter, OpenLCA-Nexus-Datensätze, Beratungsreports, einzelne EPD-/LCA-Datenbanken sowie ISO-/DIN-/EN-Normen.

## 9. Welche Quellen brauchen Lizenzprüfung?

Lizenzprüfung nötig bei:

- ISO/DIN/EN/CEN/CENELEC-Normtexten
- ESG-Ratings, Scores und Datenfeeds
- MSCI, Sustainalytics, Bloomberg, LSEG, FactSet, RepRisk, Clarity AI und vergleichbaren Datenanbietern
- kostenpflichtigen LCA-Datenbanken
- Zertifizierungsdatenbanken
- Logos, Siegeln und Markenzeichen

## 10. Welche Quellen wurden mit WÖk-IDs, Scorecards oder Glossar verknüpft?

Alle Registereinträge wurden in `content/sources/source-to-woek-mapping.json` mit WÖk-Relevanz, Glossarbegriffen, Wirkungsräumen, Datenarten, empfohlenen Seiten und LLM-Nutzungsregel verbunden.

Besonders wichtig:

- CSRD / ESRS -> Unternehmensdaten, Berichtsdaten, Datenqualität, Scorecards
- SDGs / UNSD -> Referenzrahmen, Indikatoren, SDG-/SDG+-Mapping
- DPP / ESPR / EPD / LCA -> Produktdaten, WÖk-ID, Scorecards
- CSDDD / OECD / UNGP / ILO -> Lieferketten, Menschenrechte, Wirkungsgrenzen
- ESG-Ratings -> Marktvergleich, aber keine positive Netto-Wirkung

## 11. Welche offenen Quellen fehlen?

Offen bleiben:

- exakte EUR-Lex-Links für alle Einzelrechtsakte ergänzen
- ESMA-/EBA-/EIOPA-Detailquellen zu Sustainable Finance prüfen
- kommunale Nachhaltigkeitshaushalte außerhalb Mannheim/Köln erweitern
- CEN/CENELEC-DPP- und EPD-Normen genauer referenzieren
- nationale Statistikquellen weiterer Länder bei internationaler WÖk-Erweiterung ergänzen
- wissenschaftliche Einzelpapers nur nach kuratierter Prüfung aufnehmen

## 12. Welche Quellen müssen regelmäßig geprüft werden?

Regelmäßige Prüfung:

- EU-Rechtsakte / Regularien: alle 3 Monate oder bei Änderung
- Reportingstandards: alle 6 Monate
- SDG-Datenbanken: jährlich oder nach Update
- ESG-Ratingmethodiken: jährlich
- kommunale Modelle: jährlich
- wissenschaftliche Reports: nach Neuerscheinung
- interne WÖk-Mappings: bei jeder größeren WÖk-Version

## Beratungsunternehmen erfasst

Erfasst wurden Big Four, große Beratungen, Professional Services sowie spezialisierte Nachhaltigkeits-, ESG-, Klima-, Impact- und Circular-Economy-Akteure.

Status: Startliste / draft.  
Einordnung: sekundäre Praxisquelle / Marktquelle.  
Nutzung: Marktanalyse, Praxisabgleich, Methodikvergleich, CSRD-/ESRS-Kontext, Datenqualitätslogik, WÖk-Kompass-Kontext.

Beratungsquellen sind nicht normativ für die WÖk. Sie zeigen Marktlogik, Umsetzungsdebatten, Beratungspraxis, Datenanforderungen und Lücken bestehender ESG-/Reporting-Systeme.

## Professional Services / Assurance Quellen erfasst

Assurance-, Audit-Readiness-, ESG-Controls- und Sustainability-Reporting-Kontexte sind im Register als Praxisquellen vorgesehen. Sie dürfen für Datenqualität, Prüfpfade und WÖk-Assurance-Anschluss genutzt werden, aber nicht als WÖk-Definition.

## Zertifizierungen und Standards erfasst

Erfasst wurden ISO-/DIN-/EN-Kontexte, Umwelt- und Produktlabels, Klima- und Emissionsstandards, Biodiversitäts- und Landwirtschaftslabels, Sozial-/Arbeits- und Menschenrechtsstandards, Gebäudezertifizierungen, Unternehmens-/Impact-/Governance-Frameworks sowie Digital-/KI-/Plattformstandards.

Zusätzlich wurde `content/sources/certification-to-woek-mapping.json` angelegt. Die Datei markiert für jeden Eintrag:

- Scope
- Wirkungsräume
- mögliche WÖk-Relevanz
- Grenzen
- wofür der Standard nicht ausreicht

## ISO-/DIN-/EN-Lizenzhinweise dokumentiert

Regel ergänzt:

- ISO/DIN/EN nicht kopieren.
- Nur Titel, Zweck, offizieller Link, Anwendungsbereich und WÖk-Bezug referenzieren.
- Bei unklarer Lizenz gilt `link_only`.

## Alternative Wirtschaftsmodelle erfasst

Erfasst wurden unter anderem:

- Gemeinwohlökonomie
- Donut-Ökonomie
- Wellbeing Economy
- Degrowth / Postwachstum
- Beyond GDP
- Social / Solidarity / Cooperative Economy
- Circular Economy
- Regenerative Economy
- Impact Investing
- Systemtheorie / ökologische Ökonomie als Kontextfeld

Status: Vergleichs- und Kontextquellen, nicht führend.

## Revival- und aktuelle Debattenquellen erfasst

Der Revival-Monitor wurde unter `content/sources/alternative-models-revival-monitor.json` angelegt.

Priorität für künftige Pflege:

1. offizielle Organisationen
2. kommunale / staatliche Anwendungen
3. wissenschaftliche Quellen
4. Thinktanks
5. seriöse Medien
6. Social Media nur ergänzend

## Vergleichsmatrix erstellt

Die Matrix liegt unter `content/comparisons/economic-models-comparison.json`.

Enthaltene Modelle:

- Wirkungsökonomie
- ESG
- CSR
- Gemeinwohlökonomie
- Donut-Ökonomie
- Wellbeing Economy
- Degrowth / Postwachstum
- Social / Solidarity Economy
- Circular Economy
- Regenerative Economy
- Impact Investing
- Soziale Marktwirtschaft
- Kapitalismus
- Sozialismus / Planwirtschaft

## Zertifizierungs-Mapping zur WÖk erstellt

Die Mapping-Datei ist draft und dient als Arbeitsgrundlage. Keine Zertifizierung wird als WÖk-konform bezeichnet. Zulässige Formulierungen:

- potenzielle Datenquelle
- anschlussfähiger Nachweis
- methodischer Vergleichspunkt
- Teilindikator
- Audit-Hinweis

Unzulässige Gleichsetzungen:

- ISO-Zertifizierung = gute Wirkung
- ESG-Rating = positive Netto-Wirkung
- Label = WÖk-Bewertung
- Zertifizierung = Produktsteuerklasse

## Suchbegriffe erweitert

Suchbegriffe für Beratungen, alternative Modelle, Zertifizierungen, Standards, Assurance und ESG-/CSRD-Kontexte werden in `assets/search/search-dictionary.json` und `assets/search/search-associations.json` ergänzt.

## WÖk-Kompass-Regeln ergänzt

Regel:

Der Assistent darf Beratungs- und Zertifizierungsquellen nutzen, um externe Methoden zu erklären, Unterschiede zur WÖk zu zeigen, Anschlussfähigkeit zu erklären, Praxisstandards zu benennen und Grenzen bestehender Systeme aufzuzeigen.

Er darf sie nicht nutzen, um WÖk-Definitionen zu ersetzen, proprietäre Daten auszugeben, Zertifizierungen als WÖk-Bewertung auszugeben, ESG-Ratings als positive Netto-Wirkung darzustellen oder ISO-Zertifizierung mit guter Wirkung gleichzusetzen.

Standardformulierung:

> Diese Quelle zeigt einen bestehenden Standard / eine bestehende Methode. Die WÖk nutzt solche Quellen als Anschluss- oder Datenbasis, bewertet Wirkung aber nach eigener Logik: SDGs / Agenda 2030 / SDG+, WÖk-IDs, Scorecards, Reverse Merit Order, positive Netto-Wirkung und Wirkungsrückkopplung.

## Offene Quellen / Lücken

- Einzelne offizielle Unterseiten der Beratungen müssen noch fachlich geprüft und priorisiert werden.
- DIN-/EN-/CEN-Normen sollten nur mit offiziellen Übersichtsseiten und ohne Normtextauszüge referenziert werden.
- ESG-Ratinganbieter können später ergänzt werden, aber nur mit öffentlichen Methodikseiten und ohne Scores.
- Kommunale Doughnut-, Wellbeing- und Gemeinwohl-Anwendungen brauchen eine zweite Quellenprüfung.
- Juristische Aktualität zu CSRD, ESRS, CSDDD, EU-Taxonomie, DPP und EU AI Act muss vor Veröffentlichung konkreter Aussagen erneut geprüft werden.

## Wichtigster Zusatz-Leitsatz

Beratungen zeigen den Markt. Zertifizierungen zeigen Nachweissysteme. Alternative Modelle zeigen Denk- und Zielräume. Die Wirkungsökonomie verbindet diese Anschlussstellen zu einer eigenen Rückkopplungsarchitektur.

Nicht alles, was zertifiziert ist, hat positive Netto-Wirkung. Nicht alles, was ESG-konform ist, ist wirkungsökonomisch ausreichend. Nicht jedes alternative Wirtschaftsmodell besitzt operative Rückkopplung.

Die WÖk prüft: Welche Wirkung entsteht, wie wird sie bewertet, und wie wird sie in Preise, Steuern, Kapital und Entscheidungen zurückgeführt?
