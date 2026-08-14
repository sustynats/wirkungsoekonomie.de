# UX-Handoff an Codex — Wirkungsportal Parlament (Stand 1)

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

## Responsive & A11y (verbindlich)

Mobile-first: erster Viewport der Entscheidungsseite = Kurztitel, Status/Termin, Empfehlung (im Prototyp verifiziert, 375×812). Breakpoint-Verhalten in `prototype.css` (@media 640px). Fokusstile, Skip-Link, `aria-current/pressed/live`, Chips nie Farbe-allein, `<details>`-Linearfassung des Wirkpfads, Reduced-Motion-Guard — alles im Prototyp vorhanden und zu übernehmen. Ziel WCAG 2.2 AA.

## Tokens/Fonts

Portal erbt Site-Tokens (`--navy #0B1020`, `--ivory`, `--gold`, `--green`, `--coral`, Radius 8, Container 1180) und lokale Fonts (`/assets/fonts/source-serif-4-*.woff2`, `inter-*.woff2`). Empfehlungs- und Statusfarben ausschließlich aus `prototype.css` (`.rec--*`, `.chip--*`) — keine Ampel-Semantik erfinden.

## Noch offen (nächste Claude-Iterationen)

Wireframes/Screens: Historie-Ansicht (damals/heute-Gegenüberstellung), Monitor (Erwartung→Beobachtung→Abweichung), Dialog, Werkzeugkasten-Seite, Methodik-/Trust-Center-Langform, Parlament-Modus-Zusatzblöcke (Drucksachenliste, Prüffragen, Kurzbrief-Kopierblock), Wirkungsnetz (Komplexfälle), Fassungs-Detailseite. Diese folgen als Stand 2; die Komponentensprache oben gilt für sie unverändert.
