# P1 — Navigation und Routen

Basis: `4d57b24dab20fa1daf63a661cdcd69dd04cc195c` (frisches, isoliertes main-Worktree).

Vor dem Merge mit dem zwischenzeitlich fortgeschrittenen main `5a852ce415d1f04f071228e4aa05fcaec00b8af9` abgeglichen. Dessen Änderungen betreffen weder Parliament-App noch Parliament-Governance; der PR-Diff bleibt auf P1 begrenzt.

## Umfang

Fünf gleichrangige Bereiche mit gemeinsamer Untergliederung, globalen Brotkrumen, aktivem Navigationszustand und nativem modalen Drawer. Alte Seiten bleiben als vollständige Renderer erhalten; die neuen Adressen verwenden dieselben Komponenten und Daten. `/entscheidungen/[slug]` bleibt kanonisch. Weiterleitungen sind permanent (308), einhopfig und erhalten Suchparameter und Fragmente. Die Root-/Parliament-Governance und der Publication Contract bleiben unverändert.

Das Register führt in P1 die bisherigen vollständigen Listen zunächst als benannte Bestandsansichten weiter; die Facetten folgen erst in P3. P1 erzeugt keine neuen Fachentscheidungen. Regierungs-Publikationsschutz und Authentifizierung der Betriebsansicht gelten auch am neuen Pfad.

## Textbestands-Diff

Der vollständige maschinenlesbare Nachweis steht in `p1-text-inventory.json`: 648 Textobjekte, kein fehlendes Objekt. Er lässt sich mit `PORTAL_TEXT_REPORT=<datei> npm run check:portal-structure` im App-Verzeichnis reproduzieren.

| Änderung | Erreichbarer Bestand danach |
| --- | --- |
| Reality-Check-Kandidaten aus der Observatorium-Seite extrahiert | Identische Texte in `RealityCheckCandidates`, auf `/monitor/observatorium` und `/monitor/reality-checks` eingebunden |
| Doppelte Titel-Suffixe auf Länderübersicht, Sachsen-Anhalt-Zielen und -Quellen entfernt | Nur Metadaten bereinigt; H1 und Inhalte unverändert |
| Bisherige lokale Brotkrumen | Links und Wortlaut bleiben als Aktenkontext erhalten; genau eine globale Brotkrumen-Navigation ersetzt die doppelte Navigationsrolle |
| Werkzeug-Einstieg | Vollständiger bisheriger Toolbox-Inhalt zusätzlich unter `/pruefstandard/methodik#werkzeuge` |
| Regierungs-Unternavigation | Alle Ziele im gemeinsamen Navigationsmodell; keine Sondernavigation mehr |
| Altadressen | Dünne Route-Adapter verwenden die bisherigen Renderer; Inventar: `data/navigation/p1-route-migration.json` |

## Prüfungen

- 281 Tests bestanden, einschließlich Neutralität (`same_case + different_party = identical_verdict`).
- Typecheck und Lint bestanden.
- Vollständiger Produktionsbuild einschließlich Source-vs-View, Fachresidual-, Visual-, Veröffentlichungs-, Datenschutz- und Release-Sicherheitsgates bestanden.
- B07 Golden State: 240/240 Routen und 17.033/17.033 Inhaltspfade bestanden. Keine Fachentscheidung geändert, keine offenen Residuals als abgeschlossen ausgegeben.
- Textbestands-Diff: 648 Objekte, 0 fehlend.
- Der Browser-Workflow prüft sämtliche Sitemap-/Navigationsziele, alle Weiterleitungsregeln, Auth-Schutz, fünf Bereiche bei 375/1440 px, Fokusfalle/Escape/Fokusrückgabe, Query-/Fragment-Erhalt und Same-Page-Navigation inklusive Back/Forward. Der exakte Head und die vollständigen Ergebnisse liegen gemeinsam im Preview-Artefakt.
- Vollständiger lokaler Browserlauf: 342/342 Ziele, 33/33 Weiterleitungsregeln, 10/10 Bereich-/Viewport-Kombinationen, sämtliche Tastatur- und History-Prüfungen bestanden; keine Laufzeitfehler oder 5xx. Beim Wechsel von Überblick zu Quellen bleibt der fokussierte Tab im sichtbaren Bild stehen (gemessen: 383,52 → 383,98 px). Die Dokument-Scrollposition darf sich durch Browser-Scroll-Anchoring ändern, wenn ein nur im Überblick sichtbarer Block oberhalb des Tabs entfällt.
- Manuelle 375-px-Prüfung mit axe: keine WCAG-A/AA-Verletzung. Manuell geklärte automatische Prüfrückfragen: geschlossenes Dialogziel existiert; Pfeil-/Menüsymbole tragen keine alleinige Bedeutung, sichtbarer Text ist vorhanden.

Die öffentliche Abstimmungsbilanz zeigt bei ausdrücklich fehlender Datenbank-Konfiguration einen Nichtverfügbarkeits-Hinweis statt eines 500-Fehlers. Es werden weder Daten gelöscht noch leere Bestände oder Kennzahlen erfunden; andere Datenbankfehler werden nicht verschluckt.

## Preview und Release

Der Workflow `Parliament structure preview` baut exakt den PR-Head in GitHub, prüft ihn im Browser und liefert Screenshots, einen HTML-Index, JSON-Prüfergebnisse, Textinventar und `commit.txt` als gemeinsames Artefakt. Keine Vercel-Preview, kein automatisches Git-Deployment, keine Änderung an Hosting- oder Budgetgates. Die abschließende Veröffentlichung folgt erst nach P1–P6 und den geltenden Release-/Kostengates.
