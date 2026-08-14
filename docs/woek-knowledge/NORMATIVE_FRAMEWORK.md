# Normative Framework — Normativer Referenzrahmen der WÖk

Stand: 2026-08-14 · Führend: **SDG-/SDG+-Referenzrahmen (Lesefassung) v0.3** + führende Onlinefassung `verstehen/sdgs-sdgplus/` (Status im Bibliotheksregister verifiziert).

## Die drei Schichten

1. **SDGs / Agenda 2030** (`OFFICIAL_SDG`) — offizieller UN-Zielrahmen; in der WÖk als „globales Risikoregister" gelesen. 17 Ziele, Datenbasis `assets/data/sdg-reference.json` (Einträge mit `isOfficialUNGoal: true`), Portalseiten `verstehen/sdgs-sdgplus/sdg-1…sdg-17` + `agenda-2030`, `unterziele` (`data/sdg_unterziele_global_europa_deutschland_matrix_v1_0.json`), `geschichte`.
2. **SDG+** (`WOEK_SDG_PLUS`) — **WÖk-eigene Erweiterung, ausdrücklich keine offizielle UN-Kategorie** (Pflicht-Disclosure überall). 7 Dimensionen mit eigenen Portalseiten: Demokratie, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlicher Zusammenhalt, Rechtsstaatlichkeit, digitale Selbstbestimmung (`sdgplus-*`; `sdg-reference.json` mit `isOfficialUNGoal: false`).
3. **Mensch – Planet – Demokratie** (`WOEK_NORMATIVE_DIMENSION`) — übergeordneter Wirkungsraum/kommunikative Ordnung, die SDGs+SDG+ zusammenführt (`begriffe/mensch-planet-demokratie/`, Leitbild `assets/pdf/leitbild-mensch-planet-demokratie.pdf`). Zielsatz: **Positive Netto-Wirkung für Mensch, Planet und Demokratie.**

Jede Anwendung muss die drei Klassen unterscheidbar halten: `OFFICIAL_SDG` | `WOEK_SDG_PLUS` | `WOEK_NORMATIVE_DIMENSION`.

## Nichtkompensation & Reverse Merit Order

- **Netto-Wirkung ist keine Addition**: Schwere negative Wirkungen dürfen nicht durch positive Werte anderer Felder verrechnet werden (Wirkungsgrenzen: u.a. Menschenwürde, Kinderarbeit/Zwangsarbeit, irreversible ökologische Schäden, Rechtsstaatlichkeit).
- **Reverse Merit Order**: `FinalScore = min(Kernfeldscores)` — Kernfelder: Klima · Ressourcen & Kreislauf · Arbeit & Fairness · Gesundheit & Sicherheit (Produkt-Detailkonzept v1.0; formal WUStG-Leitlinien v2.1 §2.12 f.).
- In den Tools implementiert als „rote Linien"/Schutz-Gates (z.B. Wirkungscheck-V3-Regeln: „Wenn sich eine rote Linie verschlechtert, wird nicht gegen positive andere Signale aufgerechnet"; T-SROI-Rechner mit Schutz-Gate; UWP mit `NonCompensation_RedLine`).
- Wo eine Grenze selbst demokratische/rechtliche Bewertung braucht: `BOUNDARY_REVIEW_REQUIRED` markieren, nicht technisch entscheiden.

## Bewertungslogik (Primärskala)

- **−3 … +3** je Indikator ist die methodische Primärlogik (`content/methodik/scoring-rules.json`, Regel `score-scale-minus3-plus3`; Master Items v1.3 übersetzen Messwerte über Schwellen in WÖk-Klassen; 28 Scoring-Regeln).
- −100…+100 mit GWV-Gewichtung (0,35/0,35/0,30) existiert nur als gekennzeichnete Darstellungs-/Verwaltungsskala einzelner Use Cases (kommunale Wirkungsgewerbesteuer; älterer WStG-Entwurf) — Details und Auflösungsstand: `SOURCE_HIERARCHY.md`, SOURCE_CONFLICT 1.
- Gewichtungs-Vorsicht: Der KWI-Beta nutzt Mensch 0,4 / Planet 0,3 / Demokratie 0,3 (`assets/data/kwi/*`), der GWV-Use-Case 0,35/0,35/0,30 — Gewichtungen sind kontext-/werkzeugspezifisch, nie als „die eine WÖk-Gewichtung" zitieren.

## Neu seit Begriffsleitfaden v1.3: Resilienz als Leitgröße

Nachhaltigkeit ist definiert als **„langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie"** — Resilienzsystematik mit 8 Analysebausteinen (v1.2/v1.3-Deltas). Das stützt die Positionierung „Systemresilienz/Risiko statt ‚Nachhaltigkeit'" in der Außenkommunikation (Finanzmarkt-Register), ohne den Begriff aufzugeben.

## Verwendungsregeln für Produkte (inkl. Parlament-Portal)

1. SDG-Mapping ist **keine** Wirkungsbewertung — Betroffenheit ≠ gut/schlecht. Richtungswerte: `STRENGTHENS | WEAKENS | MIXED | UNCLEAR | NOT_MATERIAL`.
2. Sachverhalt / Wirkungsanalyse / normative Bewertung sichtbar trennen (Dreischichtigkeit).
3. SDG+-Disclosure ist Pflichttext bei jeder SDG+-Nennung.
4. Keine Personenbewertung, kein Ranking von Menschen/Abgeordneten/Parteien — normative Bewertung gilt Zuständen und Entscheidungsszenarien.
5. Ex ante über Wirkungspotenziale/-risiken sprechen, nie künftige Wirkung als eingetreten darstellen; ex post Kausalität nur mit tragfähiger Evidenz.
