# Sprint 1 Abnahmebericht

Stand: 22. Mai 2026  
Ziel: Qualitaetspruefung nach Sprint 1 fuer Navigation, `/fuer/`-Bereich, Visualsystem, Begriffslogik, Mobile und interne Links.

## 1. Was wurde umgesetzt?

- Finale Hauptnavigation zentral und konsistent: `Start · Verstehen · Modell · Kompass · Für wen? · Anwendungen · Ordnung · Akademie · Mehr · Suche`.
- Scanner ist kein Hauptnavigationspunkt mehr; er ist unter Anwendungen und im Footer als Werkzeug eingeordnet.
- Footer-Struktur entspricht der finalen Logik: Verstehen, Werkzeuge & Anwendungen, Lernen, Projekt, Rechtliches.
- `/fuer/`-Seiten wurden aus dem Content-Master neu aufgebaut bzw. stark ueberarbeitet.
- Neue Seiten `/fuer/wissenschaft-forschung.html` und `/fuer/gesundheit.html` sind vorhanden.
- Zentrale Sprint-1-SVGs wurden erstellt, eingebunden und in der Visual Registry erfasst.
- Alte KI-Poster liegen im rejected-Ordner und sind nicht oeffentlich eingebunden.

## 2. Was ist abnahmefaehig?

- Navigation und Footer auf allen geprueften Seiten.
- `/fuer/unternehmen.html`, `/fuer/politik.html`, `/fuer/buergerinnen.html`, `/fuer/mieter.html`, `/fuer/investoren.html`, `/fuer/kommunen.html`, `/fuer/akademie.html`, `/fuer/journalismus.html`.
- Zentrale Modellseiten `/`, `/wirkungsoekonomie.html`, `/modell.html`, `/kompass.html`.
- Visualsystem Sprint 1: alle 18 Registry-Visuals sind kontrollierte SVG/Layoutgrafiken mit Alt-Text und Caption.

## 3. Was ist noch `needs_revision`?

- `/verstehen.html`: Datei existiert nicht; Navigation nutzt `/wirkungsoekonomie.html`. Empfehlung: Redirect/Alias anlegen oder Matrix dauerhaft auf `/wirkungsoekonomie.html` umstellen.
- `/methodik/`: kein `/methodik/index.html`; aktuell wird `/methodik/datenbasis.html` als Methodik-Einstieg genutzt. Empfehlung: Methodik-Hub anlegen.
- `/sdg-plus/`: kein `/sdg-plus/index.html`; kanonische Seite ist `/sdg-plus.html`. Empfehlung: Redirect/Alias anlegen.

## 4. Welche Seiten sind blockiert?

Keine A-Blocker in den Sprint-1-Kernseiten.  
`/fuer/wissenschaft-forschung.html`, `/fuer/gesundheit.html`, `/fuer/rente.html` und `/fuer/wirkungseinkommen.html` sind inhaltlich aufgebaut, bleiben aber wegen Modell-/Fachstatus als `needs_review` markiert.

## 5. Welche Visuals sind abnahmefaehig?

Alle Sprint-1-Visuals aus der Registry sind abnahmefaehig. Besonders relevant:

- `woek_modell_auf_einen_blick_v2`
- `woek_wirkungskreislauf_stufen`
- `woek_reverse_merit_order_schutzregel`
- `woek_unternehmen_wirkungssystem`
- `woek_politik_reparaturstaat_wirkungsarchitektur`
- `woek_kondratieff_nachhaltigkeitstransformation`

## 6. Welche Visuals muessen ersetzt werden?

Keine der oeffentlich eingebundenen Sprint-1-Visuals.  
Die abgelehnten KI-Poster bleiben unter `/assets/visuals/rejected/` und sind nicht eingebunden.

## 7. Welche Inhalte wurden aus dem Content-Master uebernommen?

Alle geforderten Zielgruppen-Seiten folgen der Master-Dramaturgie:

- Hero
- Warum diese Perspektive wichtig ist
- Was heute falsch laeuft
- Warum Reparatur/ESG/Reporting nicht reichen
- WÖk-Verschiebung
- konkreter Gewinn
- Was nicht passiert
- Wirkungspfad
- Beispiel
- Visual
- Quellenpanel
- Weiterfuehrende Links

Die Inhalte wurden nicht in generische Nachhaltigkeits- oder ESG-Beratungssprache umgeschrieben. ESG/CSRD erscheinen als Anschlussraeume, nicht als Primaerlogik.

## 8. Welche Begriffe wurden korrigiert?

- `workflow.html`: Scorecard-Labels von pauschal `positive Wirkung` auf Beitrag zur `Netto-Wirkung` geschaerft.
- `workflow.html`: unpraezise Preis-/Steuerformulierung auf `nachweislich positive Netto-Wirkung entlastet` korrigiert.
- `glossar.html`: positive Wirkung deutlicher gegen isolierten Einzelvorteil abgegrenzt und Zielgroesse `positive Netto-Wirkung` ergaenzt.
- `glossar.html`: automatische Guenstiger-Behauptung fuer nachhaltige Produkte entfernt; stattdessen Modell-/Markt-/Datenabhaengigkeit genannt.
- `sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`: Sprache nicht mehr automatisch als positive Wirkung formuliert; Wirkungspotenzial und Kontextbezug ergaenzt.

## 9. Welche Navigationen waren noch alt?

Keine alte Hauptnavigation in den geprueften Seiten.  
Keine prominente Hauptnavigation `Quellen`; oeffentlicher Begriff ist `Evidenz`.

## 10. Empfohlene naechste Schritte

1. Redirects oder Alias-Seiten fuer `/verstehen.html`, `/methodik/` und `/sdg-plus/` anlegen.
2. Fachliche Freigabe fuer Wissenschaft/Forschung, Gesundheit, Rente und Wirkungseinkommen durchgehen.
3. In Sprint 2 die Nicht-`/fuer/`-Seiten systematisch auf dieselbe Tiefe heben, vor allem Anwendungshub, Methodik und SDG+.
4. Langfristig textlastige Legacy-PNGs als kontrollierte SVG/Layoutgrafiken nachbauen.

## Pruefnachweise

- Navigation statisch auf Hauptseiten und Zielgruppenseiten geprueft.
- `/fuer/`-Dramaturgie automatisiert nach Inhaltsmarkern geprueft.
- Linkcheck: 213 HTML-Dateien; keine oeffentlich gebrochenen internen Links, nur Template-Platzhalter.
- Browser-Stichprobe lokal: keine Body-Overflow-Probleme und keine fehlenden Alt-Texte auf geprueften Seiten.
- Problembegriff-Suchlauf: echte Risiken korrigiert; verbleibende Treffer sind Schutzformulierungen wie `keine Personenbewertung`.
