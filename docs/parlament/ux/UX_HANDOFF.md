# UX-Handoff — Wirkungsportal Parlament (Stand 1)

Stand: 2026-08-14 · Referenz: `prototype/` (index.html, entscheidung-beispiel.html, prototype.css) — **der Prototyp ist die verbindliche visuelle Spezifikation**; dieses Dokument listet Zustände und Datenfelder, die im Prototyp nur als ein Beispielzustand sichtbar sind. Abweichungen nur aus Technik-/Security-/A11y-Gründen, dokumentiert.

## Seitenstruktur & Komponenten (implementiert im Prototyp)

1. **Trust-Band** (immer): Herausgeberzeile; auf Entscheidungsseiten zusätzlich analysierte Fassung + Stand + Link „Wie dieser Wirkungscheck entstanden ist".
2. **Header**: Brand mit Subline, 6-Punkte-Nav, `aria-current`; **Modus-Schalter** „Für alle / Für Parlament" (Segmented Buttons, `aria-pressed`, Zustand in URL `?modus=`).
3. **Decision Card**: Felder → `kurztitel, originaltitel, phase_label, termin_label, relevanz_label, analyse_status, empfehlung(optional), geändert_marker(optional), ctas[60s|interaktiv|dossier]`. Zustände: freigegeben / in Arbeit (CTA disabled + Status-Chip) / Radarhinweis (nur Beobachten) / `STATUS_UNVERIFIED`.
4. **Verfahrens-Stepper**: Klassen `done | aria-current="step" | open`; Phasen aus amtlichen Daten, nie hart verdrahtet; Zusatzzeile „Finale Abstimmungsfassung verifiziert: Ja/Nein".
5. **60-Sekunden-Block** (`.sixty`): dl-Grid mit 9 Zellen + Empfehlungszelle (`cell--full`); Datenfelder siehe Master-Prompt §28A. Mobil einspaltig; ist der erste Inhalt nach dem Seitenkopf.
6. **Wirkpfad** (`.pfad`): max. 5 Stationen; je Station `titel, beschreibung`; je Kante `mechanismus, evidenzklasse(HIGH|MEDIUM|LIMITED|MODEL_ASSUMPTION|DATA_GAP), bruchstelle?`; Bruchstellen-Station mit `.bruch` (Coral-Rahmen). Pflicht: `<details>`-Linearfassung.
7. **Ebenen-Marken** (`.ebene--fakt/--analyse/--bewertung`): SACHVERHALT/WIRKUNGSANALYSE/WÖK-BEWERTUNG — jede Dossier-Sektion trägt genau eine.
8. **Claim-Zeile** (`.claim`): `claim_id, claim_type, evidence_grade, claim_text` + Drawer (`<details>` im Prototyp; im Produkt fokusfangender Dialog ok) mit Quelle/Institution+Datum/Passage/Evidenzklasse/Gegenquelle/„Was würde die Annahme kippen?". Fehlender Herleitungstext ⇒ „Die Herleitung dieser Regel ist noch nicht freigegeben." (nie stillschweigend rendern).
9. **Szenario-Auswahl + Sofortreaktion** (`.szenarien`, `.sofort`): Buttons mit `aria-pressed`; Sofortreaktion = drei feste Slots (verändert unmittelbar / folgt nicht automatisch / entscheidend als Nächstes) je mit `evidenceClass`-Chip; Texte AUSSCHLIESSLICH aus Regel-Registry (Muster `IMMEDIATE_FEEDBACK_RULES.md`), `aria-live="polite"`.
10. **Nichtkompensations-Kasten** (`.rote-linie`): rote Linien separat; `BOUNDARY_REVIEW_REQUIRED`-Badge.
11. **Empfehlungs-Block** (`.empfehlung`): Kategorie-Wortmarke (6 feste Werte, `.rec--*`), Übersetzungszeile nur bei verifizierter Ja/Nein-Abstimmung, 4 Pflichtspalten (Warum ×3–5 / Was würde sie ändern / stärkstes Gegenargument / Was bleibt politisch). Ohne alle vier Felder darf keine Empfehlung publiziert werden — bitte im CMS/Editorial-Workflow erzwingen.
12. **Regionale Rückkopplung**: ehrlicher `DATA_GAP`-Zustand ist der Default, solange keine passende Kennzahl existiert; Datenfelder je Wert: `quelle, beobachtungszeitpunkt, territorial_level, is_exact|is_proxy`.
13. **Werkzeugkasten kontextuell**: Instrument-Links aus Bestand (`instruments-2026.js`-Muster), je Falltyp kuratiert; keine Neubauten.
14. **KI-Abschnitt** (`.ki-box`): Checkbox nicht vorausgewählt; Start-Button `aria-disabled` bis Consent; fester Hinweistext „verändert das veröffentlichte Fachvotum nicht"; erlaubter/verbotener Kontext gemäß `WOEK_AI_V3.md` (keine Partei/Fraktion/Namen/IDs).
15. **Versions-Timeline** (`.versions`): je Eintrag `datum, ereignis, wirkungsaenderung(NO|MINOR|MATERIAL|VERDICT_REVIEW), warum_link`; `MATERIAL` = Gold-Punkt. Ältere Fassungen als eingefrorene Ansicht mit Banner.
16. **Trust-Card** (`.trust-card`): Herausgeber, Fassung, Methodenversion, Quellenstand, Redaktion/Gegenprüfung, Korrekturen + CTA.
17. **Footer**: Institut/Kontakt, Transparenz-Links, Ökosystem-Ausleitungen; keine Partei-/Kampagnenlinks.

## Responsive-Regeln (verbindlich)

**Breakpoints**: ein einziger harter Breakpoint bei **640px** (`prototype.css`), alles darüber fließend über `clamp()`/`auto-fit`-Grids. Keine festen Pixelbreiten, keine horizontale Scrollleiste auf `body` — breite Inhalte (Wirkpfad, Tabellen) scrollen in eigenem Container.

**Erste-Viewport-Regel (§56, im Prototyp bei 375×812 verifiziert)**: Auf der Entscheidungsseite müssen ohne Scrollen sichtbar sein — Kurztitel, Wirkungsrelevanz, Termin/Phase, Empfehlungs-Chip (falls freigegeben). Verboten: lange Einleitungstexte, Cookie-/Modal-Overlays, Hero-Bilder vor dem Inhalt.

| Komponente | < 640px | ≥ 640px |
|---|---|---|
| Header/Nav | Nav umbricht unter Brand (`margin-left:0`), keine Hamburger-Pflicht bei 6 Punkten | Nav rechtsbündig |
| 60-Sekunden-Block | **einspaltig** (`grid-template-columns:1fr`), Reihenfolge = Lesereihenfolge, Empfehlungszelle bleibt letzte | 2–3 Spalten `auto-fit minmax(250px,…)` |
| Decision-Card-CTAs | volle Breite, gestapelt (`flex:1 1 100%`), Primär-CTA zuerst | nebeneinander |
| Wirkpfad | Stationen stapeln (`min-width:150px` + wrap), Nummern bleiben sichtbar | horizontale Kette |
| Szenario-Karten / Empfehlungsspalten / Trust-Card-dl | einspaltig | `auto-fit` mehrspaltig |
| Stepper | umbricht in mehrere Zeilen, aktueller Schritt behält Kontrast | eine Zeile |
| Modus-Schalter | bleibt sichtbar über dem Titel (nicht in ein Menü verstecken) | rechts neben Kicker |

**Touch**: Interaktive Ziele ≥ 44×44 px effektiv (Chips mit Link-Funktion brauchen Padding-Ausgleich); Drawer/`<details>`-Summaries volle Zeilenbreite als Trefferfläche. Keine Hover-only-Information — Glossar-Definitionen müssen auf Touch per Tap erreichbar sein (Hover ist nur Progressive Enhancement).

## Accessibility-Anforderungen (Ziel WCAG 2.2 AA — Launch-Gate)

**Struktur & Navigation**: genau eine `<h1>` je Seite (der Kurztitel); lückenlose Überschriftenhierarchie; Skip-Link als erstes fokussierbares Element; Landmarks (`header/nav/main/footer`) mit `aria-label` bei Mehrfachnutzung; Tab-Reihenfolge = visuelle Reihenfolge (kein positives `tabindex`).

**Zustände in ARIA** (im Prototyp umgesetzt): Nav `aria-current="page"` · Stepper `aria-current="step"` · Szenario- und Modus-Buttons `aria-pressed` · Sofortreaktions-Container `aria-live="polite"` (nur der Ergebnisbereich, nie die ganze Seite) · deaktivierte CTAs `aria-disabled="true"` **plus** erklärender Text („folgt"), nie nur ausgegraut · Drawer als `<details>` oder Dialog mit Fokusfalle, Escape schließt, Fokus kehrt zum Auslöser zurück.

**Farbe & Kontrast**: Text ≥ 4.5:1, große Typo/UI-Ränder ≥ 3:1 — geprüft auf Ivory `#F6F1E8` und Navy `#0B1020`. **Farbe nie alleiniger Bedeutungsträger**: Empfehlungskategorien, Evidenzklassen, Phasen und rote Linien tragen immer Text; Wirkpfad-Bruchstellen sind zusätzlich beschriftet („Mögliche Bruchstelle:"). Fokus sichtbar mit 2px-Outline + Offset, auf beiden Grundfarben geprüft (`--gold-deep` auf Ivory, Gold auf Navy).

**Diagramme/Daten**: Jede Visualisierung braucht eine lineare Textalternative im DOM (Wirkpfad: `<details>`-Fassung im Prototyp; Wirkungsnetz und Monitor-Kurven später analog). Keine reinen Bild-Diagramme ohne Textfassung. Zahlen im Fließtext immer mit Einheit und Bezugszeitpunkt.

**Bewegung & Eingabe**: `prefers-reduced-motion`-Guard global (im Prototyp gesetzt, inkl. `scroll-behavior`); keine Auto-Play-Animationen, kein Auto-Scroll; keine Zeitlimits; Formularfelder mit persistenten `<label>` (kein Placeholder-als-Label); Fehlermeldungen textlich und programmatisch verknüpft.

**Sprache & Verständlichkeit**: `lang="de"`; Fachbegriffe bei erster Nennung erklärt (Progressive Disclosure Alltagssprache → Kurzerklärung → Fachbegriff); Linktexte selbsterklärend („Vollständige Begründung", nie „hier"); Abkürzungen (T-SROI, RMO, SDG+) beim ersten Auftreten ausgeschrieben.

**Testpflicht vor Launch**: axe/Lighthouse-A11y in CI; manueller Tastatur-Durchlauf der Entscheidungsseite (inkl. Drawer, Szenario-Auswahl, Modus-Schalter, KI-Consent); Screenreader-Stichprobe (VoiceOver/NVDA) auf 60-Sekunden-Block und Wirkpfad; 200%-Zoom und 320px-Breite ohne Inhaltsverlust.

## Tokens/Fonts

Portal erbt Site-Tokens (`--navy #0B1020`, `--ivory`, `--gold`, `--green`, `--coral`, Radius 8, Container 1180) und lokale Fonts (`/assets/fonts/source-serif-4-*.woff2`, `inter-*.woff2`). Empfehlungs- und Statusfarben ausschließlich aus `prototype.css` (`.rec--*`, `.chip--*`) — keine Ampel-Semantik erfinden.

## Stand-2-Komponenten (Prototyp `rueckblick-beispiel.html`, `dialog-beispiel.html`)

18. **Monitor-Zeile** (`.monitor-row`, Route `/monitor/`): vier Spalten **Erwartung (ex ante) · Indikator · Beobachtung · Einordnung**; Desktop 4-spaltig, < 760px gestapelt mit erhaltenen Feldlabels. Datenfelder je Zeile: `erwartung_text, indikator_label, woek_id(Register-Referenz), beobachtung_text, beobachtungsstand_datum, status`. Status-Werte (`.mstatus--*`): `NOT_YET_OBSERVABLE | ON_TRACK | MIXED | OFF_TRACK | BOUNDARY_RISK | DATA_GAP`. Pflicht-Hinweis über der Tabelle: aus einer Zeitreihe allein folgt keine Kausalität.
19. **Korrekturtrigger-Kasten**: erscheint, wenn eine als kritisch markierte Annahme abweicht; Felder `ausgeloeste_annahme, trigger_definition, folge_status(VERDICT_REVIEW_REQUIRED)`. Ausdrücklich „redaktionell, nicht automatisch" — kein Auto-Update des Votums.
20. **Damals/Heute-Gegenüberstellung** (`.damals-heute`, Route `/historie/`, `RETROSPECTIVE_CASE`): zwei gleichwertige Spalten mit Goldtrenner; links nur Quellen mit `datum <= entscheidungsdatum`, rechts nur `datum > entscheidungsdatum`. **Diese Filterung ist eine Datenmodell-Anforderung, keine Redaktionsdisziplin** — bitte serverseitig erzwingen (Rückschaufehler-Schutz). Felder: `wissensstand_damals{evidenz, beabsichtigte_wirkung}`, `wissensstand_heute{evidenz, beobachtete_entwicklung, zurechenbarkeit}`, je `evidenzstand`.
21. **Lernpunkt-Kasten** (`.hindsight`): heutige WÖk-Einordnung + `lernpunkt` — dieser Wert fließt zurück in den Wirkungsrelevanz-Standard des Radars (Feld `feeds_into: materiality_standard`).
22. **Dialog-Trennungskasten** (`.trennung`, Route `/dialog/`): fester Text „Was Umfragen dürfen / nicht dürfen"; darf nicht abschaltbar oder einklappbar sein.
23. **Umfrage-Ergebnisbalken** (`.balken`): Parlament (Navy) vs. Öffentlichkeit (Gold) je Frage; Pflicht-Metazeile darunter: `n je Gruppe, zeitraum, auswahlverfahren, repraesentativitaets_hinweis, mindestkohorte (n>=10, kleinere unterdrücken)`. Vergleich nur bei methodisch identischer Frage rendern — sonst Gruppen getrennt ausgeben.
24. **Dialog-Prozesskette** (4 Karten): Eingang (anonymisiert, keine Verknüpfung Person↔Antwort↔Analyse) → redaktionelle Prüfung gegen Wirkungsrelevanz-Standard → Aufnahme ins Radar mit ausgewiesener Herkunft → Grenze (Votum bleibt analysebasiert).

## Noch offen (nächste Design-Iterationen)

Werkzeugkasten-Seite, Methodik-/Trust-Center-Langform, Parlament-Modus-Zusatzblöcke (Drucksachenliste, Prüffragen, Kurzbrief-Kopierblock), Wirkungsnetz (Komplexfälle), Fassungs-Detailseite, Radar-Listenansichten mit Filtern. Folgen als Stand 3; die Komponentensprache oben gilt für sie unverändert.

## Prototyp-Dateien (Stand 2)

| Datei | Deckt ab |
|---|---|
| `prototype/index.html` | Portalstart, Decision Cards, Fünf-Säulen-Schleife, Unabhängigkeitserklärung |
| `prototype/entscheidung-beispiel.html` | Entscheidungsseite: Stepper, 60 Sekunden, Wirkpfad, Interaktiv, Dossier-Ebenen, Claim-Drawer, Nichtkompensation, Empfehlung, Region, Werkzeuge, KI, Versionen, Trust-Card |
| `prototype/rueckblick-beispiel.html` | `/monitor/` (Monitor-Zeilen, Korrekturtrigger) und `/historie/` (Damals/Heute, Lernpunkt) |
| `prototype/dialog-beispiel.html` | `/dialog/` (Trennungskasten, zwei Fragerunden, Ergebnisbalken mit Pflicht-Metazeile, Prozesskette) |
| `prototype/prototype.css` | Alle Tokens, Komponentenklassen, Breakpoint 640/760, A11y-Stile |
