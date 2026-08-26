# Parliament Impact-First Masterausführung · 26.08.2026

## Ergebnis

Die technische Impact-First-Architektur und die sechs freigegebenen
Sachsen-Anhalt-Programmbilder sind GitHub-terminal vorbereitet. Eine
Production-Veröffentlichung dieses Changesets ist nicht freigegeben, solange
der bindende Länder-Controller Berlin und Mecklenburg-Vorpommern nicht als
Fach-terminal ausweist.

Basis: `9e8389cb8623109a87ba6f3563d5aabac3ba6cea`

Route-Matrix: `data/executive-impact/route-coverage-v1.json`

Executive-Vertrag: `data/contracts/executive-impact-summary.schema.json`
Visual-Descriptor: `data/impact-visuals/sachsen-anhalt-2026-v1.json`

## Master-Checkliste

| Gegenstand | Status | Nachweis / Grenze |
| --- | --- | --- |
| Vollständiges Route-zu-Impact-Audit | PASS | Jede `page.tsx`, öffentliche `route.ts`, `sitemap.ts` und `robots.ts` ist einer geprüften Route-Familie zugeordnet. |
| Gemeinsamer ExecutiveImpactSummary-Vertrag | PASS | Zod + JSON Schema, keine route-spezifische Parallelstruktur. |
| Kernaussage und Relevanz vor Prozessdaten | PASS | Gemeinsame Executive-Ansicht in Sachsen-Anhalt, Parlamentsentscheidungen mit Working Act, vollständigen Regierungsakten, EU-Details und zwei Länder-Koalitionsreviews. |
| Mensch / Planet / Demokratie | PASS_FAIL_CLOSED | Explizite Pfadzuordnungen bleiben sichtbar; eine nicht freigegebene Aggregatrichtung bleibt `OPEN`. |
| SDG / SDG+ | PASS_FAIL_CLOSED | Nur explizite Referenzen werden gezeigt; Zielrichtung und Materialität bleiben ohne Fachfreigabe offen. |
| Drei bis fünf materielle Pfade | PASS_FAIL_CLOSED | Vollständige Mengen bis fünf können ohne Ranking sichtbar sein; eine Top-Auswahl wird nicht technisch erzeugt. |
| Nichtkompensation | PASS | Nur explizite `BLOCK`-/Nichtkompensationsbefunde werden hervorgehoben; keine technische Ableitung. |
| Evidenz, Unsicherheit, Reality Check | PASS | Getrennte Bänder und ausdrücklich offener Zustand. |
| Kommunikationswirkung | PASS | In Sachsen-Anhalt exakt aus der freigegebenen separaten Fachachse übernommen. |
| Wirkungsbilder Sachsen-Anhalt | PASS_6_OF_6_PROGRAM | Sechs owner-seitig freigegebene Programmbilder, vollständige Asset-/Handoff-Provenienz. |
| Wirkungsbilder Case-Deep-Dives | NOT_APPLICABLE_FAIL_CLOSED | Keine Case-Auswahl und keine Case-Assets freigegeben; sechs symmetrische Slots bleiben geschlossen. |
| Marker | PASS_NO_MARKER | Kein sichtbares Element war eindeutig an die vier ausgewählten Pfade bindbar; keine Bild-zu-Fach-Ableitung. |
| Keine Partei-Scores / Recommendations / DNS-Synthese | PASS | Quality-Gate und vorhandene Fachgrenzen bleiben bindend. |
| Mobile / Responsive / Accessibility | PASS_BROWSER_AND_GATE | Semantische Überschriften, Text+Icon+Farbe, 44-px-Controls, Einspalten-Fallback und Reduced Motion; Browserprüfung bei 390 px sowie 1.440 px ohne horizontalen Überlauf oder Runtime-Fehler. |
| Build / Tests / Source-vs-View | LOCAL_PASS | 265/265 Tests, vollständiger Produktionsbuild, 240/240 Golden-State-Routen und 17.033/17.033 Inhalts-Pfade; GitHub-Exact-Head-Ergebnisse werden im PR und in den Issues dokumentiert. |
| Production live | EXTERNAL_BLOCKER | #241 verlangt zuerst Berlin 12/12, danach MV Fach-terminal, danach einen kombinierten Golden State und genau einen RC. |

## Fachliche Inputs, die nicht technisch erzeugt werden dürfen

### Unmittelbarer Länder-Releasepfad

1. Berlin: Terminal sind DKP, Die PARTEI und SGP. BSW ist für PDF-Seiten
   1–13 fachlich handoff-seitig fortgeschritten; der kleinste aktuelle
   BSW-Rest ist PDF-Seiten 14–66. Zusätzlich bleiben AfD, BÜNDNIS 90/DIE
   GRÜNEN, FDP, Tierschutzpartei, Volt, SPD, CDU und Die Linke als
   verified-final Programme fachlich nicht terminal. Benötigt werden
   source-bound Bewertungen der endlichen Effektobjekte; keine
   Programmtext-Inferenz.
2. Mecklenburg-Vorpommern: Die zwölf verified-final Quellen sind eingefroren,
   aber die analoge finite Deep-Fach-Matrix und die expliziten Objektfreigaben
   folgen nach Berlin. Die Source-Freeze ersetzt keine Fachanalyse.

### Executive-Impact-Schichten

3. Sachsen-Anhalt, je sechs Programme: separate Fachfreigabe für
   programmweite MPD-Richtung/-Materialität/-Evidenz, SDG-Richtung und eine
   Materialitätsauswahl bzw. -rangfolge der bereits freigegebenen Pfade.
4. Regierung: Für 57 kompakte Fachrecords fehlen die strukturierten
   MPD-/SDG-/SDG+-/Wirkpfad-/Grenz-/Evidenzschichten. Bei den sechs
   Full-Schema-Records fehlen eine ausdrücklich freigegebene domänenweite
   MPD-/SDG-Richtung und Pfadmaterialität; der Altersvorsorge-Record mit sechs
   Pfaden benötigt zusätzlich eine freigegebene Auswahl von höchstens fünf.
5. EU: Für 21 freigegebene Kurzrecords fehlen source-bound MPD-, SDG-/SDG+-,
   materielle Wirkpfad- und Nichtkompensationsprojektionen.
6. Baden-Württemberg und Rheinland-Pfalz, Koalitionsvereinbarungen: Es fehlen
   jeweils eine dokumentweite Auswahl der materiellen Pfade sowie
   programmweite MPD-/SDG-Richtungsprojektionen. Kapitelbefunde werden nicht
   technisch zu einem Gesamturteil verrechnet.
7. Historische Bundesprogramme/-vereinbarungen und Fachanalysen: Die vorhandene
   Fachveröffentlichung bleibt sichtbar; neue MPD-/SDG-/Materialitätsfelder
   benötigen objektspezifische Freigaben statt Schema-Backfill aus Text.

### Noch nicht freigegebene visuelle Vertiefung

8. Für jeden der sechs `CASE_SCENARIO`-Slots: konkrete symmetrische Case-Auswahl,
   Case-Visual-Brief, Asset, sichtbare Elementbindung bzw. dokumentierte
   No-Marker-Entscheidung, nichtvisualisierbare Folgen, Alt-Text und
   redaktionelles Sign-off.

## Releasegrenze

`NO_NEW_VERCEL_BUILD=true` bleibt gesetzt. Weder Preview noch Build,
Deployment oder Promotion gehören zu diesem GitHub-Changeset. Erst nach den
unter 1 und 2 genannten Fachterminals darf der bestehende minimale
Deploymentpfad einen kombinierten RC erzeugen.
