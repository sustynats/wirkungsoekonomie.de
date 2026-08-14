# Content-Audit: IOOI und Wirkungsarchitektur

**Stand:** 14. August 2026
**Status:** Arbeitsaudit vor der inhaltlichen Umsetzung
**Geltungsbereich:** `wirkungsoekonomie.de`, öffentliches Glossar, Quellenarchiv, Akademie, WÖk-Kompass, Modell- und Unternehmensseiten.
**Führende Begriffsquelle:** `source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.md`, ergänzt um die führende Resilienzpräzisierung v1.3. Für die hier dokumentierte Erweiterung wird die bestehende Stufenlogik des Leitfadens fortgeschrieben, nicht durch ein paralleles Modell ersetzt.

## Repository und Source of Truth

- Die Website ist ein statisches HTML-Repository. Viele öffentliche Seiten sind direkte HTML-Quellen; wiederkehrende Inhalte entstehen aus Skripten unter `scripts/`.
- Der vollständige Produktionslauf `npm run build` baut Glossar, Quellenarchiv, Akademie, Methodenseiten, Suchindex, Sitemap, Feeds und weitere Indizes. Neue Glossarbegriffe liegen als kuratierte JSON-Importe unter `content/glossary/imports/` und werden in `scripts/glossary/build-glossary-registry.mjs` registriert.
- `content/glossary/terms.json` und `assets/data/term-registry.json` sind bestehende Begriffsdaten; kuratierte Importe ergänzen bzw. präzisieren sie. `scripts/glossary/build-glossary-pages.mjs` erzeugt die öffentlichen Begriffseiten und Hover-/Alias-Daten.
- `content/academy/woek-g-curriculum.json` ist die Quelle für den Akademie-Lernpfad; `content/kompass/compass-questions.json`, `content/kompass/compass-answer-templates.json` und `content/kompass/impact-paths.json` sind die Quellen des WÖk-Kompasses.
- Die zentralen direkten öffentlichen Seiten sind unter anderem `modell.html`, `so-wirkt-wirkungsoekonomie/index.html`, `verstehen/index.html`, `vergleich.html` und `fuer/unternehmen/impact-controlling/index.html`. Die bestehenden Visuals liegen unter `assets/visuals/model/`.
- Quellen aus Glossarbegriffen werden über das Quellenarchiv in öffentliche, zitierfähige Archivseiten überführt. Offizielle bzw. primäre Herausgeberseiten haben Vorrang.

## Bestehende relevante Inhalte

| Bereich | Bestehende Quelle / Route | Befund | Entscheidung |
| --- | --- | --- | --- |
| Führender Leitfaden | `source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.md` | Enthält bereits die neutrale Wirkungsdefinition, SDGs/Agenda 2030/SDG+ als Referenzrahmen und die Stufen Auslöser bis Wirkungsarchitektur. | Als führende Basis fortschreiben und IOOI als Anschlussmodell innerhalb des Wirkungspfads ergänzen. |
| Resilienzpräzisierung | `source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.3-resilienzpraezisierung.md` | Ergänzt Nachhaltigkeit und Resilienz, ändert die Kernlogik Wirkung/Bewertung nicht. | Unverändert verknüpfen; keine Doppeldefinition schaffen. |
| Modell | `/modell.html` | Enthält bereits Auslöser, Wirkungspotenzial, Wirkmechanismus, Zustandsveränderung, Bewertung, Netto-Wirkung, Rückkopplung und Lernen. Der IOOI-Kern ist dort noch nicht explizit sichtbar. | Text und vorhandenes Wirkungsrad um IOOI als Teil des Wirkpfads erweitern. |
| Verstehen | `/verstehen/` | Vermittelt bereits: Absicht, Reichweite und Output sind keine Wirkung. | Neue Leitkarte auf die kanonische IOOI-Seite setzen. |
| Vergleich | `/vergleich.html` | Trennt Wirkung, Bewertung, Netto-Wirkung und Rückkopplung bereits methodisch. Methoden, Wirtschaftsmodelle und Reporting-Standards sind aber noch nicht klar in drei Kategorien strukturiert. | Struktur und Vergleichstabelle fair erweitern. |
| Unternehmensseite | `/fuer/unternehmen/impact-controlling/` | Beschreibt Wirkungscontrolling und Rückkopplung; IOOI/Results-Chain-Perspektive fehlt. | Abschnitt „vom IOOI-Projektmodell zum WÖk-Entscheidungsmodell“ ergänzen. |
| Akademie | `content/academy/woek-g-curriculum.json` | Enthält Auslöser, Wirkmechanismus, Wirkungspotenzial, Output/Outcome und Wirkungsrad in bestehenden Modulen. | Neues verknüpfendes Grundlagenmodul mit Lernzielen, Fragen und Lernlogik ergänzen, ohne bestehende Module zu duplizieren. |
| WÖk-Kompass | `content/kompass/*.json` | Kennt Wirkung, Wirkungspotenzial, SDG+, Rückkopplung und IOI; IOOI-Fragen und eine explizite Verwechslungswarnung fehlen. | Fragen, Antworten, Synonyme und Pfade ergänzen. |
| Glossar | `content/glossary/terms.json`, `content/glossary/imports/legacy-detail-definitions.json` | Output und Outcome sind nur kurz in einem Legacy-Import definiert. `Input`, `Impact`, `IOOI`, `Wirkungstreppe` und `Referenzrahmen` haben keine kuratierten Detailseiten. | Einen konsolidierten Import mit vollständigen Detaildefinitionen, Quellen und Querverweisen anlegen. |
| Quellenarchiv | `content/quellenarchiv/sources.json` plus Glossar-Quellenableitung | SDG-/SDG+- und Wirkungsquellen sind vorhanden; die neue IOOI-Einordnung braucht nachvollziehbare Methodenquellen. | PHINEO, OECD DAC, Impact Frontiers und Bertelsmann Stiftung über die neuen Begriffseiten einbinden. |

## Suchlauf und fachliche Befunde

Der Suchlauf umfasste insbesondere `Input`, `Output`, `Outcome`, `Impact`, `IOOI`, `IOI`, `Wirkungskette`, `Wirkungspfad`, `Wirkungslogik`, `Theory of Change`, `Wirkungstreppe`, `Wirkung`, `Wirkungsbewertung`, `Netto-Wirkung`, `Transformationswirkung`, `SDG`, `SDG+`, `Agenda 2030`, `Reverse Merit Order`, `Nichtkompensationsprinzip`, `Wirkungsgrenze` und `Wirkungsrückkopplung` in Markdown, JSON, YAML, JavaScript und HTML.

### Konsistenzen, die erhalten bleiben

- Der Leitfaden definiert Wirkung korrekt als tatsächliche, zunächst neutrale Zustandsveränderung.
- `modell.html` und `vergleich.html` unterscheiden bereits Wirkungspotenzial, Wirkung, Bewertung, Netto-Wirkung und Rückkopplung.
- Die Akademie behandelt Wirkstoff ausdrücklich als didaktische Analogie und trennt Potenzial von belegter Wirkung.
- Bestehende Kompass-Inhalte formulieren bei Sprache, Medien und Narrativen überwiegend vorsichtig als Wirkungspotenzial, Wirkpfad oder Risiko.

### Lücken und Risiken

- **IOOI/IOI:** IOI ist als WÖk-Instrument vorhanden, IOOI ist nicht als eigener Begriff, eigene Suchintention oder eigene Leitseite verfügbar. Eine Verwechslungswarnung fehlt.
- **Input und Impact:** Es fehlt eine vollständige, kuratierte Begriffsseite. Output und Outcome haben bisher nur Kurzdefinitionen; Outcome muss ausdrücklich als Wirkungsebene und Output ausdrücklich als Leistung, nicht als Wirkung, erklärt werden.
- **Referenzrahmen:** Die Sache ist auf mehreren Seiten vorhanden, aber nicht als eigenständiger Glossarbegriff oder klarer methodischer Zwischenschritt sichtbar.
- **Wirkungstreppe:** Es existieren Verweise auf etablierte Wirkungstreppen, aber keine eigene, quellen- und urheberrechtsbewusste Erklärung.
- **Wirkungsrad:** Die vorhandene Visualisierung beginnt mit Auslöser und behandelt die Vorwirkungslogik bereits teilweise. Die Verbindung zum IOOI-Kern sowie die Ausdifferenzierung von Nebenwirkung, Wechselwirkung und Rebound sind noch nicht sichtbar genug.
- **Impact:** Der Begriff wird heterogen verwendet. Er darf nicht als methodisch schwach, zwangsläufig positiv oder als WÖk-exklusiv behandelt werden.
- **Medien und Politik:** Wegen vorhandener Narrativ- und Radar-Seiten ist die Unterscheidung von Wirkungspotenzial, Wirkungsrisiko, Wirkmechanismus und empirisch belegter Wirkung besonders wichtig; sie wird mit einem gezielten Terminologie-Check abgesichert.

## Wissenschaftliche und methodische Quellen für die Umsetzung

- OECD DAC, *Glossary of Key Terms in Evaluation and Results-Based Management*, 2. Auflage (2022): Results Chain, Activity, Baseline, Attribution, Output, Outcome, Impact und Theory of Change.
- Impact Frontiers, *Five Dimensions of Impact*: What, Who, How Much, Contribution und Risk; einschließlich positiver/negativer, beabsichtigter/unbeabsichtigter Wirkung.
- United Nations, *Transforming our world: the 2030 Agenda for Sustainable Development*: Ziele, Targets und globaler Referenzrahmen.
- PHINEO, *Grundbegriffe der Wirkungsorientierung*: deutschsprachige Praxis- und Methodenquelle für IOOI, Outcome, Impact, Wirkungskette und Theory of Change.
- Bertelsmann Stiftung, *Die iooi-Methode*: deutschsprachige Praxisquelle zur Einordnung im Corporate-Citizenship-Kontext.

## Geplante Änderungen

1. Den Leitfaden versioniert um die explizite Einordnung „Vorwirkung → IOOI-Wirkpfad → Bewertung → Rückkopplung“ ergänzen.
2. `/verstehen/iooi-und-wirkungsoekonomie/` als kanonische, zugängliche Leitseite bauen; mit Textalternativen, responsiver SVG und einer klaren Trennung von Wirkungsermittlung, Wirkungsbewertung und Wirkungsrückkopplung.
3. Glossar konsolidieren: IOOI, Input, Aktivität, Output, Outcome, Impact, Wirkungstreppe, Referenzrahmen sowie die notwendigen Quer- und Rückverweise; bestehende Definitionen von Wirkung, Wirkungsbewertung und Wirkungspfad präzisieren.
4. Modell, Verstehen, Vergleich, Impact-Controlling, Akademie und Kompass gezielt verknüpfen. Bestehende passende Inhalte bleiben erhalten.
5. Quellenarchiv, Suchindex, Sitemap, Metadaten und Glossar-Hover generieren; abschließend global auf IOOI/IOI- und Wirkungsbegriffe prüfen.

## Bewusst nicht vorgesehen

- Keine Kopie der PHINEO-Wirkungstreppe oder ihrer Grafik.
- Keine Behauptung, IOOI sei wertlos, könne Negatives nicht abbilden oder nur die WÖk könne Wirkung messen.
- Keine unzulässige Gleichsetzung von Wirkmechanismus und Wirkungsnachweis.
- Keine separate, konkurrierende Content-Architektur neben dem bestehenden Glossar, Quellenarchiv und Methodenraum.
