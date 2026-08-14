# Wirkungsportal Parlament — Design System

Stand: 2026-08-14 · Referenz-Implementierung: `docs/parlament/ux/prototype/` (der Prototyp IST die Spezifikation; dieses Dokument erklärt die Regeln dahinter).

## Haltung

**Hochwertiger parlamentarischer Briefingdienst + wissenschaftliches Evidenzlabor.** Ruhig, institutionell, editorial — kein NGO-Kampagnenlook, kein Nachrichtenportal, kein BI-Dashboard, kein KI-Spielzeug. Herausgeber-Optik: **Institut für Wirkungsökonomie** (Herausgeberzeile gehört zum Layout, nicht in den Footer verbannt).

## Tokens (geerbt von wirkungsoekonomie.de `assets/css/style.css`, dort führend)

- Farben: `--navy #0B1020` (Institutionsgrund), `--ivory #F6F1E8` / `--cream #FFF9EE` / `--paper #FFFCF5` (Papierwelt), `--line #E8E4DC`, `--text #222`, `--muted #4a4a44`; Akzente sparsam: `--gold #C89B3C` (Auszeichnung/Primäraktion), `--green #2F7D5C` (tragfähig/positiv **nur mit Text-Label**), `--coral #C85A4A` (Risiko/rote Linie **nur mit Text-Label**).
- Typografie: `Source Serif 4` (Display/Editorial, lokale woff2 `/assets/fonts/`), `Inter` (UI/Meta/Zahlen), Fallbacks Georgia/system. Lesetexte max. `--content-readable 860px`.
- Geometrie: Container 1180px, Radius 8px, Schatten `--shadow-card`; großzügiger Weißraum, klare Absatzführung.

## Portal-spezifische Ergänzungstoken (im Prototyp definiert)

- `--wp-navy-ink #0E1530` (Flächen auf Navy), `--wp-status-*` für Verfahrensstatus (neutral blaugrau, kein Ampelrot/-grün).
- Empfehlungskategorien (§24 Master-Prompt) haben **feste Wortmarken + neutrale Flächenfarben**, nie Smileys/Daumen/Ampeln:
  `tragfähig` (grün-getönte Ivory + Grün-Text), `unter Bedingungen` (gold-getönt), `erprobung` (blau-grau), `nacharbeiten` (sand), `derzeit nicht tragfähig` (coral-getönt), `keine belastbare Empfehlung` (grau). Farbe ist immer Zweitkodierung — Text trägt die Bedeutung (A11y).

## Kernkomponenten (siehe Prototyp)

1. **Trust-Band** (Seitenkopf): Herausgeberzeile + „Parteiunabhängig · Methodik offen · Quellen prüfbar" mit Links auf `/transparenz`.
2. **Decision Card** (Radar/Start): Kurztitel (Alltagssprache) + Originaltitel, Phase-Chip, Termin, Wirkungsrelevanz (Wortskala), Analyse-Status, Empfehlungs-Chip (nur wenn freigegeben), „seit letzter Analyse geändert"-Marker, 3 CTAs (60 Sekunden / Interaktiv prüfen / Fachdossier).
3. **Verfahrens-Stepper**: nicht-lineare Phasen („Aktueller Stand / Als Nächstes / Noch nicht"), verträgt abweichende Verfahrenswege; `STATUS_UNVERIFIED`-Zustand.
4. **60-Sekunden-Block**: 10 feste Antwortfelder (Was? Wann? Stand? Unmittelbare Änderung? Ziel? Wirkpfad-Miniatur, größte Chance, größtes Risiko, wichtigste Unsicherheit, Empfehlung + 3 Gründe).
5. **Wirkpfad-Diagramm**: max. 5 Stationen, je Kante Evidenz-Badge (`HIGH/MEDIUM/LIMITED/MODEL_ASSUMPTION/DATA_GAP`) + „mögliche Bruchstelle"-Marker; linearisierte Screenreader-Fassung zwingend.
6. **Ebenen-Kennzeichnung**: jeder Absatz im Dossier trägt eine von drei Marken — `SACHVERHALT` (grau), `WIRKUNGSANALYSE` (blau-grau), `WÖK-BEWERTUNG` (gold) — die Dreischichtigkeit ist visuell, nicht nur strukturell.
7. **Claim-Zeile + Quellen-Drawer**: Behauptung mit Claim-ID, daneben „Quelle ansehen" → Drawer mit Quelle/Institution/Datum/Passage/Evidenzklasse/Gegenquelle (volle `RESULT_EXPLAINABILITY`-Spezifikation, nicht die V3-Schlankversion).
8. **Trust-Card** (Analyse-Fuß): analysierte Fassung, Stand, Methodenversion, Quellenstand, Redaktion, Gegenprüfung, Korrekturen (+ „Wie dieser Wirkungscheck entstanden ist").
9. **Empfehlungs-Block**: Kategorie-Wortmarke + „Warum?" (3–5 Gründe) + „Was würde die Empfehlung ändern?" (Falsifizierbarkeit) + stärkstes Gegenargument — alle vier Elemente sind Pflicht, das Layout erzwingt sie.
10. **Nichtkompensations-Kasten**: rote Linien separat, nie in Score-Summen eingemischt; `BOUNDARY_REVIEW_REQUIRED`-Zustand.
11. **Versions-Timeline**: Fassungsänderungen mit Wirkungsänderungs-Status (`NO/MINOR/MATERIAL/VERDICT_REVIEW`), „Warum?" klickbar.
12. **Modus-Schalter** „Für alle / Für Parlament": identische Fakten, zusätzliche Tiefe (Drucksachen, Ausschüsse, Prüffragen, Kurzbrief-Kopierblock) — nie abweichende Voten.
13. **KI-Abschnitt** („Mit WÖK-KI weiterdenken"): räumlich getrennt, Opt-in-Checkbox nicht vorausgewählt, Hinweis „verändert das veröffentlichte Fachvotum nicht".

## Verbote (hart)

Keine Parteifarben/-logos; Rot/Grün nie als alleinige Gut/Schlecht-Codierung; keine Smileys/Daumen/Scores auf Personen; keine Kurven ohne Modell; keine Engagement-Dark-Patterns; keine Warnhinweis-Tapeten — Vertrauen entsteht durch prüfbare Struktur.

## A11y-Basis

WCAG 2.2 AA: Kontraste auf Ivory/Navy geprüft, sichtbarer Fokus (2px Gold auf Navy, Navy auf Ivory), Tastatur-Reihenfolge = visuelle Reihenfolge, `aria-current` im Stepper, Drawer als `<dialog>`-Muster mit Fokusfalle, Reduced-Motion-Variante, Diagramme mit linearer Textalternative, Chips immer Text+Farbe.
