# Sprint 2 Abnahmebericht

Stand: 2026-05-22

## 1. Welche Seiten wurden korrigiert?

- `/` wurde in der Hero-Logik geschärft: Kapital misst Bewegung, Wirkung zeigt Richtung, Zielgroesse ist positive Netto-Wirkung.
- `/anwendungen.html` wurde als echter Anwendungshub nachgezogen: Scanner prominent, Anwendungen mit Problem, Wirkungsfrage, Datenbasis, Wirkungspfad, Rueckkopplung, Beispiel und Vertiefung.
- `/kompass.html` und die Kompass-Daten wurden von "Bio-Apfel guenstiger" auf wirkungsoekonomische Einordnung und moegliche Entlastung korrigiert.
- `/fuer/buergerinnen.html` wurde ueber den Generator begrifflich korrigiert: keine deterministische Preiszusage.
- Alle statischen Seiten wurden auf die zentrale Navigation mit `/verstehen.html` synchronisiert.

## 2. Welche Blocker wurden behoben?

- `/verstehen.html` fehlte und wurde als Einstiegseite erstellt.
- `/methodik/` fehlte und wurde als Methodik-Hub erstellt.
- `/sdg-plus/` fehlte und wurde als SDG+-Hub erstellt.
- Die Hauptnavigation zeigt jetzt auf `/verstehen.html`; der bisherige Grundlagenartikel bleibt als Vertiefung erhalten.
- Preis- und Entlastungsformulierungen wurden so korrigiert, dass keine Garantie oder finale Steuerwirkung suggeriert wird.

## 3. Welche Seiten sind abnahmefähig?

Abnahmefaehig nach Sprint-2-Pruefung:

- `/`
- `/verstehen.html`
- `/wirkungsoekonomie.html`
- `/modell.html`
- `/kompass.html`
- `/anwendungen.html`
- `/fuer/`
- alle aus dem Content-Master erzeugten `/fuer/`-Seiten
- `/methodik/`
- `/sdg-plus/`
- `/evidenz/`

Sensible Seiten bleiben fachlich als Modell-/Konzeptstand markiert, sind aber in dieser Form veroeffentlichungsfaehig:

- `/fuer/politik.html`
- `/fuer/investoren.html`
- `/fuer/gesundheit.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/wissenschaft-forschung.html`

## 4. Welche Seiten bleiben needs_revision?

Keine A-Blocker in der geprueften Sprint-2-Kernmatrix.

Needs_revision fuer Sprint 3 ist kein Abnahmeblocker, sondern Funktionsausbau:

- Kompass: von MVP-Demo zu staerkerer Nutzeroberflaeche.
- Scanner: Analysefluss, Quellenpanel und Ergebniskarten weiter produktisieren.
- Anwendungen: weitere operative Beispiele koennen in Sprint 3 interaktiv werden.

## 5. Welche Visuals wurden ersetzt?

In Sprint 2 wurden keine neuen Visuals erzeugt. Die Sprint-1-Visuals bleiben im kontrollierten SVG-System. Es wurden keine KI-Poster eingebunden.

## 6. Welche Begriffe wurden korrigiert?

- Zielgroesse: positive Netto-Wirkung.
- Wirkung bleibt neutral: tatsaechliche Veraenderung von Zustaenden.
- Wirkungspotenzial bleibt Moeglichkeit, nicht eingetretene Wirkung.
- Produkt- und Preislogik: "kann belastet/entlastet werden" statt "wird guenstiger/teurer".
- Reporting bleibt Beschreibung; Rueckkopplung veraendert Entscheidungen.
- T-SROI bleibt als T-SROI bezeichnet.

## 7. Welche Navigationen waren noch falsch?

Die zentrale Navigation war inhaltlich bereits korrekt, aber "Verstehen" zeigte noch auf `wirkungsoekonomie.html`. Das wurde auf `verstehen.html` umgestellt und zentral auf alle HTML-Seiten synchronisiert.

Finale Hauptnavigation:

Start · Verstehen · Modell · Kompass · Fuer wen? · Anwendungen · Ordnung · Akademie · Mehr · Suche

Scanner bleibt unter Anwendungen. Quellen bleibt oeffentlich Evidenz.

## 8. Welche Inhalte stammen aus dem Content-Master?

Die `/fuer/`-Seiten werden weiter aus `tools/generate_fuer_pages.py` generiert, das die Inhalte des Zielgruppen-Content-Masters abbildet. In Sprint 2 wurde die Buerger:innen-Formulierung im Generator korrigiert und danach der Zielgruppenbereich neu gebaut.

## 9. Welche offenen Punkte bleiben für Sprint 3?

- Kompass, Scanner, Suche und Wissensraum interaktiv machen.
- Kompass-Fragen erweitern, ohne Chatbot-Logik zu erzeugen.
- Anwendungshub um echte Demo-Flows fuer Produkte, Politik, Medien, Unternehmen und Gesundheit erweitern.
- Mobile Detailtests mit mehreren realen Geraetebreiten und visueller Regression.
- Optional PNG/WebP-Exports fuer zentrale SVG-Visuals.

## 10. Empfehlung: nächste Reihenfolge

1. Kompass-MVP als gefuehrte Nutzeroberflaeche ausbauen.
2. Scanner-Ergebnislogik mit Quellenpanel und Datenstatus produktisieren.
3. Suche und Wissensraum strukturieren: Begriffe, Fragen, Anwendungen, Evidenz.
4. Anwendungen mit je einem interaktiven Beispiel vertiefen.

## Pruefung

- `python3 tools/generate_fuer_pages.py`
- `python3 tools/sync_layout.py`
- statischer Kernseitencheck: H1, Title, Meta Description, Headernavigation, interne Links
- Browsercheck lokal auf Start, Anwendungen, Kompass, Unternehmen, Methodik und SDG+

