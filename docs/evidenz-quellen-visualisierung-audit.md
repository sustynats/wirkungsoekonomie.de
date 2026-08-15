# Evidenz-, Quellen- und Visualisierungsraum - Audit

Stand: 2026-05-22

## 1. Angelegte Quellenbereiche

Angelegt wurde ein kuratierter Quellenraum unter `/quellen/` mit folgenden Seiten:

- `/quellen/index.html`
- `/quellen/grundlagen-denker.html`
- `/quellen/systemtheorie-kybernetik.html`
- `/quellen/oekonomie-innovation.html`
- `/quellen/nachhaltigkeit-sdgs-planetare-grenzen.html`
- `/quellen/regulatorik-standards-daten.html`
- `/quellen/studien-und-berichte.html`
- `/quellen/vergleichsmodelle.html`
- `/quellen/bibliografie.html`
- `/quellen/bild-grafik-und-tabellennachweise.html`

Der Bereich trennt Theorie, Normativität, Regularien, Standards, Datenquellen, empirische Berichte, Vergleichsmodelle, interne WÖk-Quellen und Visualnachweise.

## 2. Erfasste Grundlagen-Denker

Im internen Register `content/sources/evidence-source-registry.json` wurden konkrete, zitierfähige Werke erfasst, nicht nur Namen. Enthalten sind unter anderem konkrete Werke von:

- Humberto Maturana / Francisco Varela
- Heinz von Foerster
- Stafford Beer
- Gregory Bateson
- Frederic Vester
- Donella Meadows
- Peter Drucker
- Joseph Schumpeter
- Nikolai Kondratieff
- Adam Smith
- Elinor Ostrom
- Amartya Sen
- Martha Nussbaum
- Herman Daly
- Nicholas Georgescu-Roegen

Jede Quelle enthält Metadaten wie Titel, Jahr, Verlag / Institution, Quellentyp, Qualitätsstufe, WÖk-Relevanz, unterstützte Claims, Grenzen und Nutzungslogik für einen späteren WÖk-Kompass.

## 3. Studienräume

Die Seite `/quellen/studien-und-berichte.html` ist als kuratierter Studienraum vorbereitet. Erste konkrete Studien und Berichte sind im Register erfasst, darunter IPCC AR6, IPBES Global Assessment, Planetary Boundaries 2023, UN Agenda 2030 und Stiglitz-Sen-Fitoussi.

Offen bleibt die systematische Erweiterung in die Kategorien Klima / Umwelt, Demokratie / Vertrauen / Medien, Wirtschaft / Ungleichheit, Unternehmen / Lieferketten, Wohnen, Rente, Arbeit, Automatisierung und Kapitalmarkt.

## 4. Bibliografie

Vorbereitet wurden:

- `content/sources/bibliography.json`
- `content/sources/bibliography.md`
- `content/sources/bibliography.bib`

Die Bibliografie ist wiederverwendbar für Website, Buch, Akademie, Whitepaper, WÖk-Kompass und Scanner.

## 5. Seiten mit Quellenbezug

Alle neuen Quellen-Seiten nutzen Quellenkarten mit konkreten Einträgen. Zusätzlich wurde die Seite `/wissen/sechster-kondratieff.html` mit einem Quellen- und Statusblock angelegt.

Die projektweite Ausweitung dezent sichtbarer Evidenzhinweise auf bestehende Inhaltsseiten bleibt ein Folgeschritt.

## 6. Kondratieff-Seite

Angelegt wurde:

- `/wissen/sechster-kondratieff.html`

Die Seite beschreibt Kondratieff-Zyklen ausdrücklich als wirtschaftshistorische Deutungsfigur, nicht als unumstrittenes Naturgesetz. Die WÖk wird als mögliche Rückkopplungs- und Betriebssystemlogik einer Nachhaltigkeitstransformation eingeordnet.

Ergänzt wurde ein ausführlicher Seitentext mit Hero, Kurzantwort, Tabelle zu bisherigen Wellen, Technikgrenze, WÖk als Betriebssystem, Wirkungspfad, Abgrenzung, zentraler Formel und Quellenhinweis.

## 7. Visual-Briefing

Angelegt wurde:

- `docs/visual-briefing-sechster-kondratieff.md`
- `assets/visuals/diagrams/kondratieff-woek-overlay.svg`

Das Briefing beschreibt ein hochwertiges Hero- und Erklärvisual mit Zeitachse, Transformationswelle und WÖk als Betriebssystem, ohne falsche Datenpräzision zu suggerieren. Die Umsetzung ist bewusst in Basisbild plus präzises SVG-/HTML-Overlay getrennt, damit Texte, Labels, Legende und Barrierefreiheit kontrollierbar bleiben.

## 8. Visual-Typen und Asset-Struktur

Vorbereitet wurde:

- `assets/visuals/`
- `assets/visuals/generated/`
- `assets/visuals/diagrams/`
- `assets/visuals/tables/`
- `assets/visuals/heroes/`
- `docs/visual-system-guide.md`

Der Styleguide definiert ruhige, hochwertige, wissenschaftlich zugängliche Visuals, Legendenpflicht, Quellenpflicht und klare Trennung zwischen Datenvisualisierung, Erklärgrafik und Illustration.

## 9. Bild-, Grafik- und Tabellennachweise

Angelegt wurde:

- `content/visuals/visual-source-registry.json`
- `/quellen/bild-grafik-und-tabellennachweise.html`

Das Register enthält die priorisierten Visuals. Der Kondratieff-Eintrag wurde als `kondratieff-woek-betriebssystem` mit Visualtyp `hero_infographic` erfasst.

- Von Daten zur Scorecard
- Von Scorecard zur Steuerklasse
- Wirkung vs. Wirkungspotenzial
- Wirkungsarchitektur
- WÖk vs. ESG vs. GWÖ vs. Donut vs. Wellbeing
- Soziale Marktwirtschaft vs. WÖk
- Wirkungsorientierte Unternehmensführung als Roadmap
- WÖk-Kompass / Scanner-Logik
- 6. Kondratieff / Nachhaltigkeitstransformation / WÖk als Betriebssystem
- Wirkungspfad politischer Sprache

## 10. Claim-to-Source-Mapping

Angelegt wurde:

- `content/sources/claim-source-map.json`

Damit sind zentrale Aussagen intern auf Quellen mappbar. Es wird unterschieden zwischen direkter Evidenz, theoretischer Anschlussfähigkeit, methodischer Grundlage und WÖk-eigener Weiterentwicklung.

## 11. Interne WÖk-Quellenextraktion

Angelegt wurde:

- `content/sources/internal-woek-source-extraction-plan.json`

Der Plan bereitet die Extraktion von Buch-Endnoten, aktuellen Buchquellen, alten WÖk-Dokumenten, Apfelbeispiel-Quellen sowie WStG-/WUStG-Arbeitsständen vor.

Offen: Die vollständige Extraktion aus dem aktuellen Buch und allen älteren Dokumenten ist noch nicht abgeschlossen und darf nicht als erledigt gelten.

## 12. Offene Quellen und Studien

Noch zu ergänzen:

- vollständige Buch-Endnoten und Kapitelquellen
- Quellen aus allen älteren WÖk-Dokumenten nach Prüfung
- konkrete CELEX- und Dokumentnummern weiterer EU-Rechtsakte
- konkrete ISO-/DIN-/EN-Quelleneinträge mit Lizenzhinweis
- konkrete Studien zu Medienvertrauen, Desinformation und demokratischer Resilienz
- konkrete Studien zu Wohnen, Rente, Automatisierung und Einkommenssystemen
- konkrete Praxis- und Beratungsquellen nur als sekundäre Kontextquellen
- öffentliche Quellenkarten für weitere Visuals nach Erstellung

## 13. Leitsatz

Quellen dürfen nicht nur Namen sein. Jede belastbare Quelle muss konkret, prüfbar und zitierfähig sein. Die Website soll zeigen, welche Quelle welche Aussage stützt und wo die eigene WÖk-Weiterentwicklung beginnt.
