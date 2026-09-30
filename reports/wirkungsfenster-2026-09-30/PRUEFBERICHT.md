# Wirkungsfenster: Implementierung und lokaler Prüfnachweis

Stand: 30. September 2026. Branch: `codex/wirkungsfenster`. Kein Merge, kein Deployment, kein öffentlicher PDF-Upload. Keine Hosting- oder Workflowänderung, keine zusätzliche KI-Generierung.

## Ausgangslage und Umfang

- Ausgangsaudit: `09530f48d8511d8daa85c087be72d903fad24087` aus `sustynats/wirkungsoekonomie.de`.
- Vor dem PR auf `8281ec5cff767d80d9ba081a4c1a998972654c25` aktualisiert. Die sechs zwischenzeitlichen automatischen Ticker-Commits wurden unverändert als Basis übernommen; der PR enthält keine eigenen Ticker- oder Workflowänderungen.
- Neuester ausdrücklich führender Leitfaden beim Start: v1.7. Die neue v1.8 ist kumulativ; v1.5-v1.7 einschließlich IOOI, DNS/GGO/GFA/eNAP und objektspezifischer BHO-Prüfarchitektur bleiben enthalten.
- Der ursprüngliche lokale Checkout mit fremden Änderungen wurde nicht bearbeitet. Umsetzung in einem separaten verwalteten Worktree.
- Bestandsprüfung: kein kanonisches Wirkungsfenster vorhanden. Wirkungssteuerung ist bereits dem kanonischen Wirkungslenkung-Eintrag zugeordnet. Wirkungskorridor existiert in einem anderen Benchmark-Kontext. Es wurden keine Doppelbegriffe oder Methoden angelegt.
- Medizinische Quelle: [FDA, Narrow Therapeutic Index Drugs](https://www.fda.gov/drugs/cder-conversations/setting-and-implementing-standards-narrow-therapeutic-index-drugs). Nur Analogiequelle, keine Validierung gesellschaftlicher Anwendungen. Keine medizinischen Synonyme im Autolinker.

## Implementierte Quellen und Ausgaben

- Kanonischer Import: `content/glossary/imports/begriffsleitfaden-v1.8.json`. Führende Kurz- und Langdefinition wortgleich zum Auftrag. Der neue Import wird nach älteren Overrides angewendet.
- Erklärung und datierte Ergänzungen: `content/site/wirkungsfenster.json`, `scripts/site/build-wirkungsfenster.mjs`, gemeinsamer kleiner Renderer. Bestehende Templates und Erklärkomponenten werden wiederverwendet.
- Neue Routen: `/begriffe/wirkungsfenster/`, `/verstehen/wirkungsfenster/` mit `#anwendung`. Die Erklärung beginnt mit der fiktiven Schulküche; keine erfundenen Zahlen, Pilotergebnisse oder Dosiskurve.
- Ergänzt: Modell, sechs Fragen, Verstehen-Karte, Methodik, Küchenbeispiel, Methodenraum-Gesamtbild, Workflow, Referenzaktualisierung, Bibliotheksverweise und datierter Podcast-Link.
- Elf vorhandene Glossareinträge gezielt ergänzt bzw. verknüpft. Wirkungshypothese und Wirkungszeit werden als prüfbare Fragen erläutert; kein paralleles Begriffssystem.
- F13, I06, E10, H02, H06, H07 konkretisiert; A05/C07/F14 verlinkt. 152 Methoden und 208 Canvas-Spezifikationen bleiben erhalten. Nur die sechs Basis-Canvas wurden geändert, keine Varianten oder Pflichtfeldstrukturen.
- Glossar, Hover, DefinedTerm/Article-Metadaten, Quellenarchiv, Sitemap, Suchdaten, öffentliche Glossar-/Methoden-/Canvas-API-Exporte und vorhandene KI-Wissensbasis aktualisiert.
- v1.8: versionierter Delta-Quelltext, kumulative Markdown-/Onlinefassung und lokal erzeugte PDF. v1.7 erhält einen eigenen Archivzugang; alte PDF-Dateien bleiben bytegleich.
- Die Quellen datierter Methodik-/Lern-PDFs bleiben bytegleich. Die neueren Web-Ergänzungen werden separat aus der v1.8-Quelle gerendert; keine alte PDF wird still neu ausgegeben.

## Tests

| Prüfung | Ergebnis |
| --- | --- |
| Baseline `WOEK_PDF_BUILD_MODE=verify npm run build` | Bestanden vor der Erweiterung |
| Vollständiger Website-Build einschließlich Postbuild | Bestanden; Staatsarchitektur-Audit mit 18 Pflichtbegriffen, 14 amtlichen Quellen und 621 IDs |
| `npm run check:wirkungsfenster` | 8 Tests bestanden |
| Zweifacher gezielter Rebuild | 33 geänderte Ausgabeflächen bytegleich bei festem `SOURCE_DATE_EPOCH`; eigenständiger Methodik-Teilbuild behält das Addendum; Hashnachweis in `rebuild.json` |
| `npm run typecheck` | Bestanden |
| `npm run check:woems` | Bestanden: 152 Methoden, 56 Varianten, 208 Canvas |
| Bestehende Küchen-Rechentests | 7 Tests bestanden |
| `npm run check:publication-editions` | Bestanden; datierte Ausgaben und 994 gebundene Korrekturdateien geschützt |
| `npm run check:release-assets` | Lokaler Manifest-/Speichercheck bestanden; kein Nachweis eines öffentlichen v1.8-Downloads |
| `npm run build:artifact` | Bestanden auch für den bereinigten, auf `main` aktualisierten Branch; 0 defekte interne Links. |

Kompakte Ergebnisdaten stehen in [checks.json](checks.json), die Rebuild-Hashes in [rebuild.json](rebuild.json). Suchindex und Taxonomie wurden nach dem Rebase erneut gebaut und stimmen bytegleich mit den eingecheckten Ausgaben überein.

Die neuen Tests vergleichen gegen Hashes des Ausgangs-Commits: neun geschützte Kerndefinitionen, Berechnungsquellen, Register, historische Leitfaden-PDFs, datierte Lernquellen, Podcast und Tariftabellen. Sie prüfen außerdem Links/Anker, Definitionen, Schema, Suchindex, Sitemap, Quellen und die sechs methodischen Erweiterungen. Dies ist keine empirische Validierung des Begriffs oder vollständige Barrierefreiheitszertifizierung.

## Browser und PDF

- Chromium: Desktop sowie 390 × 844 px mobil. Kein horizontaler Seitenüberlauf (390 px Inhalt bei 390 px Viewport); Anwendungsanker erreicht den richtigen Abschnitt.
- Tastatur: Sprunglink per Tab/Enter erreicht `main-content`; Tabellen besitzen benannte, fokussierbare Regionen. Keine JavaScript-Fehler in den geprüften neuen Seiten.
- Druck: achtseitiger Browserdruck geprüft, einschließlich beider Tabellen. Der fokussierte Sprunglink und die persönliche Notizoberfläche werden nicht mitgedruckt.
- Leitfaden-PDF: 56 A4-Seiten (1.240.416 Bytes; SHA-256 `8eac95d228a6db979bf99c0e69982c32719682b3236baa96afdb7df8950711ff`), Autorin Natalie Weber. Definitionen, neue Abschnitte sowie die beiden übernommenen Architekturabbildungen visuell geprüft. Die vorhandenen Bilddateien werden in v1.8 korrekt aufgelöst und auf die Druckbreite begrenzt; historische PDFs bleiben unverändert.
- Screenshots: [Desktop](desktop.png), [Mobil](mobile.png), [Anwendung mobil](mobile-application.png), [Druck](print-application.png), [Glossar](glossary-desktop.png).

## Vorhandene Auffälligkeiten und behobene neue Fehler

Der Baseline-Build war erfolgreich, erzeugte aber bereits sehr umfangreiche sachfremde Normalisierungsänderungen. Diese gehören nicht zur Erweiterung und werden nicht übernommen. Gemeinsame generierte Manifeste werden hingegen aus den vorhandenen Quellen neu erzeugt: Insbesondere das zuvor auf August datierte Contentmanifest enthält dadurch auch ältere Indexrückstände. Diese Metadaten-Neuerzeugung erklärt einen großen Teil des Diffs, ohne historische Originaltexte oder PDFs umzuschreiben. Der ältere Leitfaden-Generator setzt einen doppelten Migrationshinweis ein und verweist auf Abbildungen mit abweichenden Dateinamen; für neue v1.8-Ausgaben werden diese Darstellungsprobleme korrigiert, historische Quellen und PDFs nicht umgeschrieben.

Ein älterer Kapitel-Export enthält ausdrücklich v1.0 vom 21. Mai 2026, wurde aber bislang mit dem jeweils führenden Registertitel beschriftet. Er wird jetzt transparent als historische Lesefassung markiert und verweist auf die kumulative aktuelle Fassung; der Originaltext bleibt erhalten. `content/documents/reader-editions.json` hält die abweichende Reader-Edition ausdrücklich fest; Register, Renderer und Qualitätsprüfung verwenden diese Angabe. Historische Aliasziele müssen weiterhin unmittelbar auf Text führen und `noindex,follow` tragen, aktuelle Aliasziele indexierbar bleiben.

Der bestehende Bibliotheksgenerator ergänzt beim Rebuild außerdem sechs fehlende Metadatenseiten zu bereits vorhandenen Journal-PDFs. Diese kleinen Katalogkarten bleiben erhalten, damit die neu erzeugten Bibliotheksverweise auflösbar sind; Journaltexte, Ticker und politische Bewertungen wurden nicht geändert.

Der abschließende Artefaktlauf des bereinigten Branches meldet zusätzlich 2.528 verwaiste Routen und 1.316 doppelte Titel als Warnungen. Dafür wurde kein eigener Baseline-Artefaktlauf hergestellt; diese siteweiten Warnungen werden nicht pauschal als neu oder als bereits vorhanden eingestuft.

Während der Umsetzung erkannte Fehler wurden korrigiert: Glossar-Selbstverlinkung mit doppelter Kurzdefinition, falscher Gegenfaktum-Slug, zunächst fehlender Sitemap-Eintrag, versehentlich mitbearbeitete Canvas-Varianten sowie die Bindung älterer Lern-PDF-Quellen. Die Quellen- und Publikationsschutzgates wurden nicht abgeschwächt.

## Vorschau und Wiederholung

Im Branch-Checkout lokal starten:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Dann `/verstehen/wirkungsfenster/`, `/begriffe/wirkungsfenster/` und `/verstehen/wirkungsfenster/#anwendung` auf `http://127.0.0.1:8765` öffnen. Die lokale v1.8-PDF liegt unter `/public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.8.pdf`.

```sh
SOURCE_DATE_EPOCH=1787270400 WOEK_PDF_BUILD_MODE=verify npm run build
npm run check:wirkungsfenster
npm run check:wirkungsfenster-rebuild
npm run build:artifact
```

Der Rebuild-Test führt Generatoren aus und verändert deren Ausgaben im Checkout. Der feste Zeitwert entspricht dem bestehenden CI-Standard; fachliche Standdaten der neuen Inhalte sind ausdrücklich der 30. September 2026.

## Offene Freigaben und getrennte Folgearbeiten

- Die v1.8-PDF ist **nicht** zu GitHub Releases hochgeladen. Der Release-Zielpfad ist vorbereitet und im Manifest ausdrücklich als `pendingPublication` markiert. Vor einer späteren Produktionsfreigabe: Datei und Hash prüfen, separat freigegeben hochladen, öffentlichen Download verifizieren und Pending-Hinweis entfernen. Die lokale PDF ist jetzt prüfbar; der künftige Release-Link ist noch kein verfügbarer Download.
- Keine Live-Prüfung einer neuen Produktion, da Veröffentlichung ausdrücklich nicht beauftragt ist. Externe CI-Ergebnisse werden nicht durch lokale Tests ersetzt.
- Spätere Buchauflage: Wirkungsrad, Wirkungslenkung, Wirkungsrisiko, Wirkungscontrolling und Pilotprojekte redaktionell einarbeiten und neu prüfen. Historische Ausgaben behalten ihren Stand.
- Spätere Kurse: qualifizierte Anwendung und Prüfvermerk didaktisch integrieren; eigene Freigabe und gegebenenfalls neue datierte Lern-PDFs. Keine automatische Änderung bestehender Prüfungen oder Berechnungen.
