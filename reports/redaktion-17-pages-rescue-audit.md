# P0 Audit: `codex/redaktion-17-pages` retten

Stand: 2026-06-05

## Kurzbefund

Der Commit `4dcdad918 Redaktionell überarbeite 17 Wirkungsradar-Seiten` ist bereits Bestandteil von `origin/main`.

Das eigentliche Risiko und Rettungspotenzial liegt nicht im Branch-Commit, sondern im alten Arbeitsbaum `/private/tmp/woek-redaktion-17-work` mit 715 uncommitted Änderungen.

Diese Änderungen dürfen nicht pauschal gemergt werden:

- Der Arbeitsbaum ist 30 Live-Commits älter als `origin/main`.
- Er würde neuere Live-Funktionen überschreiben, unter anderem `Mein Wirkungsraum`, Analytics-/Merken-Tracking, aktuelle Debattenstruktur, Audio-Erklärungen und Cache-Keys.
- Er enthält viele generierte HTML-Änderungen, veraltete Reports, Datenartefakte und einige Dubletten-Dateien wie `index 2.html`.

## Umfang des alten Arbeitsbaums

Uncommitted Änderungen gegen den Branch-Commit:

| Bereich | Dateien |
|---|---:|
| `wirkungsradar` | 338 |
| `wirkungsfelder` | 160 |
| `referenz` | 109 |
| `werkzeuge` | 47 |
| `dokumente` | 22 |
| `erleben` | 12 |
| `public` | 9 |
| `werkstatt` | 7 |
| `reports` | 4 |
| `docs` | 3 |
| `assets` | 2 |
| `woek-id-register` | 1 |
| `bibliothek` | 1 |

Besonders relevant: 62 geänderte Seiten unter `wirkungsradar/live/*/index.html`.

## Was wertvoll ist

Diese Seiten enthalten im alten Arbeitsbaum echte redaktionelle Mehrsubstanz gegenüber aktuellem Live-Stand und sollten selektiv gerettet werden. Nicht die Datei übernehmen, sondern Inhalte in den aktuellen Live-Stand einarbeiten.

| Priorität | Seite | Wertvoller Inhalt | Risiko |
|---|---|---|---|
| P0 | `wirkungsradar/live/migration-kostet-nur/` | Ausführlichere 10/30/120-Sekunden-Antwort, bessere Zeitpfad-Logik, konkrete IAB-/BA-/SVR-/OECD-Belege. | Alter Cache-Key; Datei ist nicht live-kompatibel. |
| P0 | `wirkungsradar/live/radwege-in-peru/` | Bessere Trennung Zuschuss/Kredit/Rückzahlung, KfW/BMZ-Logik, deutscher Nutzen, Kontrolle und Wirkung. | Alter Cache-Key; muss mit aktueller Template-Struktur verheiratet werden. |
| P0 | `wirkungsradar/live/e-autos-schlimmer-als-verbrenner/` | Zusätzliche ADAC-/LCA-/Ökostrom-/Batterieargumentation, bessere Bilanzgrenzen. | Prüfen gegen aktuelle Masterfassung; nicht blind übernehmen. |

Mögliche P1-Rettung nach Einzelprüfung:

- `wirkungsradar/live/heizgesetz-heizhammer-narrativ/`
- `wirkungsradar/live/klimaschutz-deindustrialisiert-deutschland/`
- einzelne Studio-/Embed-Texte für `migration`, `radwege`, `e-autos`

## Was alt ist

Diese Teile sind technisch oder strukturell überholt:

- Cache-Key `20260604-debate-answer-top` statt aktueller `20260605`-Linie.
- Generierte HTML-Seiten unter `referenz`, `wirkungsfelder`, `werkzeuge`, `dokumente`, `erleben`.
- Daten- und Reportdateien unter `public/data`, `assets/data`, `reports`, `docs`, die nicht den aktuellen Live-Stand abbilden.
- Doppelte Dateien wie `wirkungsfelder/arbeit-einkommen/*/dossier/index 2.html`.
- Alte statische Seiten, die spätere Funktionen wie Merken, Notizen, Audio, Analytics oder aktuelle Navigation nicht zuverlässig enthalten.

## Was gefährlich ist

Diese Änderungen würden beim pauschalen Merge Qualität verschlechtern oder Live-Funktionen zurückdrehen:

| Muster | Befund |
|---|---|
| Platzhalter statt Quellen | Im alten Arbeitsbaum gibt es 114 Treffer für Muster wie `Prüfpunkt 2`, `Prüfbarer Kern`, `Quellenprüfung redaktionell nachführen`, `Quellen im bestehenden Deep Dive`. Live hat aktuell nur 13 solcher Treffer. |
| Quellenverlust | Viele alte Debattenseiten enthalten 0 konkrete Quellenmarker, während Live bereits 4-5 Quellenmarker hat. |
| Template-Rückschritt | Alter Arbeitsbaum predatet spätere Debattenstruktur, `Mein Wirkungsraum`, Audio und Analytics. |
| Dubletten-Dateien | `index 2.html`-Dateien dürfen nicht ins Live-Repo. |
| Generated noise | `wirkungsradar-canonicalization-report.*`, Manifeste und Inventare sind als alte Momentaufnahme gefährlich. |

Beispiele für alte Live-Debattenseiten, die eher nicht gerettet, sondern verworfen werden sollten:

- `15-minuten-stadt-oder-klimakaefig`
- `arbeit-lohnt-sich-nicht-mehr`
- `co2-preis-oder-fossile-systemkosten`
- `deutschland-nur-zwei-prozent`
- `fusion-loest-das-energieproblem`
- `wasserstoff-fuer-alles`
- `schulden-machen-oder-sparen`
- viele weitere Seiten mit generischen `Prüfpunkt`-/`Prüfbarer Kern`-Blöcken

Das heißt nicht, dass diese Themen inhaltlich fertig sind. Es heißt nur: Die alte uncommitted Variante ist nicht die richtige Quelle für den Live-Stand.

## Entscheidung

Nicht mergen.

Stattdessen:

1. Alten Arbeitsbaum als Quarantäne behandeln.
2. Drei P0-Seiten selektiv in den aktuellen Live-Stand übernehmen:
   - `migration-kostet-nur`
   - `radwege-in-peru`
   - `e-autos-schlimmer-als-verbrenner`
3. Dabei nur redaktionelle Inhalte retten, nicht HTML-Dateien, Cache-Keys oder generierte Reports.
4. Danach die restlichen 59 alten Debattenseiten als `verwerfen`, `P1 prüfen` oder `separat redaktionell neu aufbauen` markieren.

## Nächster Arbeitsschritt

P0-Rettungspaket 1:

- Inhalte aus dem alten Arbeitsbaum extrahieren.
- In aktuelle `origin/main`-Struktur übertragen.
- Aktuelle Debattenreihenfolge, Merken/Notizen, Audio/Analytics und Cache-Keys erhalten.
- Lokal prüfen.
- Danach erst deployen.

## P0-Abschluss

Umgesetzt am 2026-06-05:

- `migration-kostet-nur` mit Zeitpfad-Logik, IAB-/BA-/SVR-/OECD-Belegen, klarer Startkosten-/Integrationsnutzen-Trennung und Quellenbelegen gerettet.
- `radwege-in-peru` mit Trennung von Zuschuss, Kredit, Rückzahlung, Projektwirkung, deutschem Nutzen und KfW-/BMZ-Quellenlogik gerettet.
- `e-autos-schlimmer-als-verbrenner` mit Lebenszyklusgrenze, Strompfad, ADAC-/ICCT-/IEA-/BMV-Quellen, Recycling- und Ladeinfrastrukturbezug gerettet.

Technische Entscheidung:

- Die alten HTML-Dateien aus `/private/tmp/woek-redaktion-17-work` wurden nicht übernommen.
- Die geretteten Inhalte wurden als P0-Overlays im aktuellen Debattenkarten-Generator hinterlegt.
- Die Overlay-Markierung ist idempotent, damit beim GitHub-Pages-Build keine doppelten `P0 gerettet`-Status entstehen.

QA vor Deployment:

- `npm run build` erfolgreich.
- `npm run check:links` erfolgreich.
- `npm run check:size` erfolgreich, aktueller Stand: 845,1 MB.
- In den drei P0-Seiten keine Treffer für bekannte Platzhaltermuster wie `Prüfpunkt 2`, `Prüfbarer Kern`, `Quellenprüfung redaktionell nachführen` oder doppelte `P0 gerettet`-Marker.
