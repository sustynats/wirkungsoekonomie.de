# Governance: Externe Quellen, Daten und Regularien

Status: draft  
Stand: 2026-05-22  
Register: `content/sources/external-source-registry.json`

## Zweck

Das externe Quellenregister hält fest, welche externen Daten-, Rechts-, Methoden-, Standard- und Praxisquellen für die Wirkungsökonomie relevant sind. Es ist kein PDF-Archiv und keine wahllose Linkliste, sondern ein kuratierter Quellenraum für Website, Glossar, Methodik, WÖk-Kompass, WÖk-IDs, Scorecards, Datenbasis, Wirkungssteuer, SDG-/SDG+-Mapping, Akademie und Forschung.

## Grundprinzip

Externe Quellen sind keine Dekoration. Sie sind die Anschlussfähigkeit der Wirkungsökonomie.

Die WÖk erfindet Daten nicht frei. Sie nutzt bestehende globale, europäische, nationale und methodische Datenquellen und übersetzt sie in Wirkungsindikatoren, Scorecards, Netto-Wirkung, Wirkungsklassen und Rückkopplung.

Externe Quelle, WÖk-Interpretation, WÖk-Mapping und WÖk-Bewertung müssen immer getrennt bleiben.

## Quellenhierarchie

### A: Primärquellen

Offizielle Rechtsquellen, amtliche Datenbanken, Behörden, UN-/EU-/nationale Portale, wissenschaftliche Assessment-Reports und offizielle kommunale Modelle.

Beispiele: EU-Kommission, EUR-Lex, EFRAG, ESMA, EEA, Eurostat, UN, UNSD, UNDP, UNEP, FAO, WHO, ILO, World Bank, OECD, IPCC, IPBES, Destatis, UBA, Bundesministerien, offizielle SDG-Portale.

### B: Standardsetter und anerkannte Methodenrahmen

Offizielle Standardsetter und etablierte methodische Rahmen.

Beispiele: GRI, ISSB / IFRS Sustainability, SASB, GHG Protocol, CDP, SBTi, TNFD, TCFD historisch, ISO soweit öffentlich referenzierbar, CEN / CENELEC, Social Value International, IRIS+, Impact Management Platform.

### C: Öffentliche Methoden- und Datenquellen

Öffentliche Datenbanken, kommunale Modelle, Produktdatenquellen, LCA-/EPD-Systeme und Datenrauminitiativen.

Beispiele: KfW SDG-Mapping, KfW Wirkungsmanagement, Mannheim 2030, SDG-Portal Deutschland, ÖKOBAUDAT, ProBas, EPD International, PEP Ecopassport, Agribalyse, OpenLCA Nexus, Catena-X, Battery Pass, CIRPASS, Gaia-X.

### D: ESG-Rating- und Datenanbieter

Nur öffentliche Methodik, Produktbeschreibung, Taxonomie oder Transparenzdokumente erfassen. Keine Scores, Ratings, proprietären Daten oder Datenbanken kopieren.

### E: Sekundärquellen

Wissenschaft, Thinktanks, Beratungsstudien, Medien, NGOs und Fachblogs nur ergänzend nutzen, wenn sie erklären, vergleichen oder aktuelle Entwicklungen einordnen.

## Quellenqualität

- A = offizielle Primärquelle / Rechtsquelle / amtliche Datenbank
- B = offizieller Standardsetter / anerkannter Methodenrahmen
- C = öffentliche Methodik eines privaten Anbieters
- D = wissenschaftliche oder Thinktank-Quelle
- E = Medien / Blog / Sekundärquelle

## Prüfintervalle

- EU-Rechtsakte / Regularien: alle 3 Monate oder bei Änderung
- Reportingstandards: alle 6 Monate
- SDG-Datenbanken: jährlich oder nach Update
- ESG-Ratingmethodiken: jährlich
- kommunale Modelle: jährlich
- wissenschaftliche Reports: nach Neuerscheinung
- interne WÖk-Mappings: bei jeder größeren WÖk-Version

## Rechtsänderungen

EU-Regularien und Nachhaltigkeitsstandards ändern sich laufend. Deshalb dürfen Website, Glossar, Akademie und WÖk-Kompass ohne erneute Prüfung nicht behaupten:

- endgültiger Rechtsstand
- finale Fassung
- unverändert gültige Schwellenwerte
- verbindliche Anwendungsfristen
- abschließende Pflichten

Zulässige Formulierungen:

- Stand: zuletzt geprüft am ...
- Rechtsstand prüfen
- EU-Vereinfachungsverfahren / Omnibus / Überarbeitung möglich
- Quelle regelmäßig aktualisieren

## Kostenpflichtige und lizenzierte Quellen

Paid Databases, proprietäre ESG-Daten, Ratings, Scores, Normtexte und geschützte Methodiken dürfen nicht ohne Lizenz genutzt werden.

Regel:

- `link_only`, wenn Lizenz unklar ist
- `short_summary_allowed`, wenn öffentliche Informationen paraphrasiert werden dürfen
- `data_use_requires_license`, wenn Datenbank-, API- oder Score-Nutzung lizenzpflichtig ist
- keine Logos ohne Nutzungsrecht
- keine Scrapes aus Zertifizierungs- oder Ratingdatenbanken

## Freigabe für den WÖk-Kompass

Jede Quelle enthält `llm_use`.

Mögliche Nutzungen:

- `citation_only`: nur nennen und verlinken
- `summary`: kurz erklären und Quelle nennen
- `mapping`: für WÖk-Mapping nutzen
- `data_lookup`: als Datenquelle nutzen, sofern Lizenz und API es erlauben
- `not_allowed`: nicht nutzen

Der WÖk-Kompass muss immer unterscheiden:

- externe Quelle
- WÖk-Interpretation
- WÖk-Mapping
- WÖk-Bewertung

Er darf externe Quellen nie als WÖk-eigene Inhalte ausgeben.

## Führend markieren

Externe Quellen dürfen nicht als führende WÖk-Quelle markiert werden. Führend für die WÖk bleiben:

- `WOeK_Begriffsleitfaden_fuehrend_v1.0.md`
- aktuelles Buch / aktueller Buchstand `Die neue Ordnung des Wohlstands`
- aktuelle Website / Glossar / Methodik
- SDGs / Agenda 2030 / SDG+
- positive Netto-Wirkung für Mensch, Planet und Demokratie

Externe Quellen können `primary`, `standardsetter`, `data provider`, `methodology` oder `secondary` sein, aber nicht führend für die WÖk-Systemlogik.

## Änderungsdokumentation

Änderungen am Register sollen dokumentieren:

- Datum
- Quelle
- geänderte URL oder Version
- betroffene WÖk-Mappings
- betroffene Glossarbegriffe
- Rechtsstands- oder Lizenzhinweis
- empfohlene Aktion: `use`, `monitor`, `map`, `archive`, `verify`

## Öffentliche Nutzung

Die öffentliche Seite `/methodik/externe-quellen.html` bleibt kuratiert. Das vollständige Register darf intern detaillierter sein als die Website.

Öffentliche Texte sollen erklären:

- welche Quellenart vorliegt
- was die Quelle liefert
- was sie nicht liefert
- wie die WÖk sie nutzt
- welche Grenzen bestehen
