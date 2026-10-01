# IOOI: fachliche Präzisierung vom 1. Oktober 2026

Auftrag: IOOI nicht als Konkurrenz, sondern als integrierbare Teilperspektive der
Wirkungsökonomie darstellen. Der Zusatznutzen ist nicht nur eine Hülle um eine
unveränderte Ergebniskette. Die WÖk setzt im Prüfprozess früher an, präzisiert die
Analyse innerhalb der Kette und geht in ihrem Wirtschafts- und Gesellschaftsmodell
darüber hinaus.

## Fachlicher Umfang

- Problem Review und Goal Review vor Auswahl von Inputs und Maßnahmen; nicht
  Wirkungspotenzial als zusätzliche zeitliche Kausalstation.
- Zustandsbeschreibung, Baseline, Gegenfaktum, Zurechnung, Unsicherheit,
  Doppelzählung, Nebenfolgen und Schutzgrenzen innerhalb der Kette.
- Systemfolgen, Verteilung, Resilienz, Nichtkompensation und Rückkopplung in
  wirtschaftliche und gesellschaftliche Entscheidungen.
- Gesellschaftlicher Referenz- und Steuerungsrahmen einschließlich SDG+
  (WÖk-eigene Erweiterung), Demokratie, Kommunikation und Medien. IOOI kann
  gesellschaftliche Veränderungen darstellen; die vier Begriffe allein liefern
  keinen solchen Rahmen. Resonanzraum und Reichweite sind kein Wirkungsnachweis.
- Keine pauschale empirische Überlegenheit gegenüber sorgfältiger Evaluation;
  bereits bestehende Methoden werden anerkannt.

## Befund und Umsetzung

Die Leitseite und einige Glossarimporte verneinten einen früheren Ansatz zu
pauschal; der ältere PHINEO-Text erklärte dagegen Potenzial und Bewertung wie
zeitlich vor- bzw. nachgelagerte Stationen. Beide Verkürzungen werden in der
aktuellen Darstellung präzisiert. Historische Importstände bleiben erhalten;
der datierte Import hat im bestehenden Registry-Generator Vorrang.

Eine gemeinsame Content-Datei (`content/site/iooi-precision-2026-10-01.json`)
steuert Website und PDF-Ergänzung. Bestehende Tabellen-, Content- und
Publikationskomponenten werden weiterverwendet. Glossar, Modell, Vergleich,
Kompass, Buchzugänge und Impact-Controlling-Dossiers erhalten die Präzisierung.
Es wird kein neuer redaktioneller Tickerbeitrag und keine Parallelarchitektur
angelegt.

## Historische Integrität und Auslieferung

Der Zusatz ist datiert; er verändert keine historischen Buchabsätze. Die neuen
Lesefassungen von Buch, WÖMM 2.0 und WÖMS 2.0 erhalten ihn vorangestellt. Alle
1.744 bisherigen PDF-Seiten einschließlich vorhandener Ergänzungen werden im
Builder anhand ihrer Content-Streams vollständig auf Erhalt geprüft. Vorherige
Ausgaben bleiben zitierfähig und abrufbar. Gedruckte Verkaufsausgaben werden
dadurch nicht geändert.

Vier PDF-Dateien werden mit SHA-256 und Quellenhashes in
`assets/data/iooi-precision-editions-2026-10-01.json` gebunden und als unveränderte
GitHub-Release-Assets ausgeliefert. Lokale `output/`- und `tmp/`-Verzeichnisse
gehören nicht in das Website-Artefakt.

## Prüfweg

- `npm run test:iooi` (einschließlich Prüfumfang, Gesellschaft, Rechenbeispiel,
  Textintegrität, idempotenter Hinweise und Artifact-Ausschluss).
- `node scripts/quality/check-publication-editions.mjs`.
- `npm run typecheck`, `npm run lint`, vollständiger Build im PDF-Verify-Modus,
  bestehendes Public-Artifact- und PR-Gate.
- Browserprüfung Desktop sowie 375 und 390 Pixel, semantische Tabellen und
  kein horizontaler Seitenüberlauf; Sichtprüfung aller Ergänzungsseiten.
- Nach normaler Freigabe/Deployment Live-Marker, Download-URLs und Hashes prüfen.

Tatsächliche Lauf- und Deploymentergebnisse werden im PR und Abschlussbericht
festgehalten; dieser Prüfplan ist kein vorweggenommener Erfolgsnachweis.
