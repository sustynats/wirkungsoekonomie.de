# Erklärende Visualisierungen in Analysen

Stand: 24.09.2026. Gilt für Meinung & Analyse, Nachgehört, Nachgesehen und Buch & Wirkung.

## Redaktioneller Standard

Jeder Beitrag wird darauf geprüft, welche Beziehung visuell leichter verständlich
wird: Ablauf, Vergleich, Zuständigkeit, Rückkopplung oder Systemzusammenhang.
Mindestens eine erklärende Visualisierung ist der Regelfall. Bewusst darauf
verzichten, wenn sie keinen Erkenntnisgewinn bringt; Begründung im internen
Review. MPD-Profil, Titelbild, Showkarte, Cover und Portrait sind kein Ersatz.

Keine erfundenen Messwerte, keine unbelegten Pfeile, keine automatische
Gegenrechnung von Risiken und Nutzen. Szenario, Potenzial und tatsächliche
Veränderung bleiben unterscheidbar. Bei Medien nicht Gespräch, Rezeption und
Politikfolge gleichsetzen.

## Gemeinsame Implementierung

Der vorhandene Markdown-Renderer zeigt eigenständige Pfeilketten mit mindestens
drei Schritten als zugängliche HTML-Ablaufgrafik. Beispiel:

    Ankündigung → mögliche Umsetzung → zu prüfende Zustandsveränderung

Die Bedingung und Beleggrenze stehen unmittelbar am Ablauf. Kein neuer
Bildgenerator, keine externe Bibliothek, keine bezahlte Verarbeitung.
Private Entwürfe und veröffentlichte persönliche Beiträge nutzen denselben
Renderer. Einzelne Quellenlinks und Fließtext mit Pfeilen werden nicht als
eigene Kette interpretiert.

Bestehende strukturierte Analysen verwenden weiterhin renderSystemicVisual.
Für die 30 neuesten freigegebenen Markdown-Beiträge hält
content/news/editorial-diagram-layouts.json bewusst ausgewählte Tabellen und
wortgleiche Auszüge als Darstellungskonfiguration fest:

- Schritte: Reihenfolge aus der vorhandenen Tabelle.
- Pfade: Instrument/Funktion/Zustandsveränderung; Grenzen bleiben daneben.
- Vergleich: parallele Argumente, keine kausalen Verbindungspfeile.
- Ein alternativer Risikopfad bleibt von einer positiven Kaskade getrennt.

Die Konfiguration ist an den SHA-256 des Manuskripts gebunden. Ändert sich eine
freigegebene Fassung, wird ein alter Zusatz nicht still übernommen. Quellen,
Wortlaut, ursprüngliche Freigabe-Hashes, Datumsangaben und Nachrichten-Autopilot
bleiben unberührt. Neue inhaltliche Ergänzungen benötigen weiterhin Natalies
abschließende Freigabe; reine Darstellung ist keine behauptete neue Textfreigabe.

## Qualitätssicherung

- node --test tests/news/editorial-diagrams.test.mjs
- node scripts/news/audit-editorial-visuals.mjs --check-latest
- npm run news:test, npm run typecheck, npm run lint, npm run news:build
- Desktop und Smartphone: Ketten, Vergleiche, Bedingungen, Quellenlinks,
  keine horizontale Seitenausdehnung, funktionierendes Vorlesen.

Die Bestandsinventur unterscheidet vorhandene Diagramme, reine Tabellen und
offene visuelle Prüfungen. Sie ist keine erneute fachliche Quellenprüfung und
keine Aufforderung, historische Manuskripte automatisch umzuschreiben.
