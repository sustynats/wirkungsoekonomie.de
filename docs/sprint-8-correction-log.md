# Sprint 8 - Correction Log

Datum: 2026-05-22

Sprint 8 wurde als Korrektur-Sprint gegen die Sprint-7-Endabnahme ausgeführt. Die Sprint-7-Matrix enthält keine Seiten mit `needs_revision` oder `blocked`. Deshalb wurden keine neuen Funktionen gebaut und keine Inhalte gelöscht. Die Arbeit bestand aus gezielter Regression, Statusprüfung und Dokumentation der bewusst verbleibenden MVP- und Feinschliffpunkte.

| Datum | Seite / Datei | ursprünglicher Status | Problem | Korrektur | neue Bewertung | offene Punkte | Quelle der Korrektur |
|---|---|---|---|---|---|---|---|
| 2026-05-22 | Sprint-7-Reviews A-F | approved / keep_as_mvp | keine `needs_revision`- oder `blocked`-Einträge vorhanden | keine Inhaltskorrektur nötig; Befund dokumentiert | fixed | keine Blocker | `docs/sprint-7-*.md` |
| 2026-05-22 | `/kompass.html` | keep_as_mvp | MVP-Status darf nicht als Mangel missverstanden werden | Status als bewusstes MVP bestätigt; keine neue Funktion ergänzt | fixed | Nutzungsfeedback später auswerten | Sprint-7-Paket A/C |
| 2026-05-22 | `/anwendungen/scanner.html` | keep_as_mvp | Scanner darf keine finale Bewertung behaupten | Statushinweise, Ersteinschätzung und Grenzen erneut geprüft | fixed | echte Datenanbindung bleibt späterer Sprint | Sprint-7-Paket C |
| 2026-05-22 | `/fuer/rente.html` | approved | Modellwerte und Rechner rechtlich sensibel | Statushinweise geprüft: Arbeitspapier-Modellrechnung, keine Leistungszusage, keine Personenbewertung | fixed | bei neuen Zahlen erneut prüfen | Sprint-7-Paket B/C |
| 2026-05-22 | `/fuer/wirkungseinkommen.html` | approved | 2.000 Euro und Finanzierungsstack rechtlich sensibel | Statushinweise geprüft: Zielmodell / Modellwert, keine Leistungszusage, keine fiskalische Gesamtprüfung | fixed | bei Modellfortschreibung erneut prüfen | Sprint-7-Paket B/C |
| 2026-05-22 | `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` | approved | politisch und rechtlich sensibler Anwendungsbereich | Seite bleibt öffentlich; Faktencheck/Wirkungsanalyse, Wirkungspotenzial, Scanner-Link und keine Wahlempfehlung geprüft | fixed | Quellenstand bei neuen Beispielen pflegen | Sprint-7-Paket D |
| 2026-05-22 | Navigation auf 37 Kernseiten | approved | Regression moeglich: Scanner/Quellen als Hauptpunkt | automatisiert geprüft: finale Hauptnavigation vorhanden, Scanner nicht Hauptpunkt, Quellen nicht Hauptpunkt | fixed | keine | Sprint-8-Regressionscheck |
| 2026-05-22 | Interne Links auf 37 Kernseiten | approved | mögliche 404 nach Korrekturen | automatisiert geprüft: keine fehlenden lokalen Linkziele | fixed | keine | Sprint-8-Regressionscheck |
| 2026-05-22 | Visuals auf 15 Kern-/Zielgruppen-/Toolseiten | approved | fehlende Alt-Texte oder ungeeignete Einbindung möglich | automatisiert geprüft: keine `img` ohne Alt-Text gefunden | fixed | Captions bei künftigen Visuals weiter prüfen | Sprint-8-Visualcheck |
| 2026-05-22 | kritische Begriffe | approved | falsche Zielgröße, finale Bewertung oder Social-Credit-Risiko | Suchlauf geprüft; relevante Treffer sind Warnhinweise, Negationen oder korrekte T-SROI-Verweise | fixed | ungetracktes `woek-akademie-app/` nicht geprüft und nicht bearbeitet | Sprint-8-Begriffscheck |
| 2026-05-22 | Audio-Bereiche | approved | einzelne Transkripte bleiben Feinschliff | keine Audio-Datei entfernt; Transkriptvervollständigung bewusst deferred | deferred | Transkripte schrittweise vervollständigen | Sprint-7-Paket F |
| 2026-05-22 | Blog-/Archivbereich | approved | einzelne Archivartikel enthalten historische Stände | nicht gelöscht; Statushinweise bleiben fuehrend, redaktionelle Archivpflege deferred | deferred | Archivstatus einzelner Artikel weiter pflegen | Sprint-7-Paket E |

## Regressionsergebnis

- Navigation: 37 Kernseiten geprüft, 0 Fehler.
- Lokale Links: 37 Kernseiten geprüft, 0 fehlende Ziele.
- Visual-Alt-Texte: 15 zentrale Visualseiten geprüft, 0 fehlende Alt-Texte.
- Statushinweise: Rente, Wirkungseinkommen, Scanner, Investor:innen, Politik und politische Sprache geprüft.
- Erreichbarkeit lokal: Startseite per mobile Headless-DOM geprüft; Kompass, Scanner und politische Sprache per HTTP 200 geprüft.

## Nicht bearbeitet

- `.DS_Store` blieb unberührt.
- `woek-akademie-app/` blieb unberührt, weil es untracked ist und nicht Teil der veröffentlichten Sprint-7-Matrix war.
