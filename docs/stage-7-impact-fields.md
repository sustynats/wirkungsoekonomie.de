# Stage 7: Wirkungsfelder

Branch: `site-restructure-stage-7-impact-fields`

## Ziel

Die Wirkungsfelder werden als verständliche Cluster sichtbar gemacht, ohne bestehende Wirkungsfeldseiten, Unterseiten, Dossiers, Werkzeuge, Demos oder Downloadpfade zu löschen.

## Inventar Top-Level-Wirkungsfelder

Alle folgenden vorhandenen Wirkungsfeldseiten bleiben kanonisch erreichbar:

| Cluster | Wirkungsfeld | Route | Status |
| --- | --- | --- | --- |
| Alltag & Grundbedürfnisse | Bildung | `/wirkungsfelder/bildung/` | Live |
| Alltag & Grundbedürfnisse | Gesundheit & Pflege | `/wirkungsfelder/gesundheit-pflege/` | Live |
| Alltag & Grundbedürfnisse | Wohnen & Stadt | `/wirkungsfelder/wohnen-stadt/` | Live |
| Alltag & Grundbedürfnisse | Arbeit & Einkommen | `/wirkungsfelder/arbeit-einkommen/` | Live |
| Alltag & Grundbedürfnisse | Rente & soziale Sicherung | `/wirkungsfelder/rente-soziale-sicherung/` | Live |
| Wirtschaft & Kapital | Wirtschaft & Unternehmen | `/wirkungsfelder/wirtschaft-unternehmen/` | Live |
| Wirtschaft & Kapital | Produkte & Konsum | `/wirkungsfelder/produkte-konsum/` | Live |
| Wirtschaft & Kapital | Finanzsystem & Kapital | `/wirkungsfelder/finanzsystem-kapital/` | Live |
| Staat & Demokratie | Staat, Recht & Demokratie | `/wirkungsfelder/staat-recht-demokratie/` | Live |
| Öffentlichkeit & Wissen | Medien & Öffentlichkeit | `/wirkungsfelder/medien-oeffentlichkeit/` | Live |
| Öffentlichkeit & Wissen | Wissenschaft, Innovation & Digitalisierung | `/wirkungsfelder/wissenschaft-innovation-digitalisierung/` | Live |
| Öffentlichkeit & Wissen | Kultur, Identität & Resonanz | `/wirkungsfelder/kultur-identitaet-resonanz/` | Live |
| Planet & Resilienz | Klima, Energie & Ressourcen | `/wirkungsfelder/klima-energie-ressourcen/` | Live |

Zusätzlich existieren zahlreiche Unterseiten, Detailkonzepte, Dossiers und Toolseiten unter `/wirkungsfelder/`. Sie wurden nicht gelöscht oder umbenannt.

## Umsetzung

- Neue Stage-7-Logik in `scripts/portal/apply-impact-field-stage7.mjs`.
- Buildkette in `package.json` erweitert, damit die Cluster nach den bestehenden Portal-Generatoren angewendet werden.
- `/wirkungsfelder/` wird als Cluster-Übersicht mit fünf Clustern erzeugt.
- Jede Karte zeigt Titel, Kurzbeschreibung, MPD-Dimensionen, Status, passende Methoden/Werkzeuge, Demos und Bibliotheksdokumente.
- Auf allen 13 Top-Level-Wirkungsfeldseiten wird ein einheitlicher Navigator eingefügt:
  - Was ist das Problem?
  - Welche Wirkung wird sichtbar?
  - Welche Werkzeuge passen?
  - Was kann pilotiert werden?
  - Welche Dokumente vertiefen?

## Platzhalterprüfung

Für alle 13 inventarisierten Top-Level-Wirkungsfelder existiert bereits eine Detailseite. Daher wurden keine neuen Platzhalterseiten benötigt.

## Schutzlinien

Die Cluster sind Navigationshilfen. Sie ersetzen keine bestehenden Routen und treffen keine automatische Entscheidung. Wirkungsfelder bewerten keine Personen. Wirkung bleibt neutral und relational; positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet.
