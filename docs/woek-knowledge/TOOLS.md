# Tools — Werkzeugbestand der Wirkungsökonomie

Stand: 2026-08-14 · Maschinenlesbar: [`tool-registry.yaml`](tool-registry.yaml) · Vor jedem Neubau: `findEquivalentCapability()` — erst hier und in den Site-Registries (`assets/data/tool-registry.json`, `assets/data/tool-examples.json`, `docs/dashboard-tool-inventory.md`) prüfen.

## Kernbefund

Die Site hat **~30 echte interaktive Werkzeuge** und einen großen Bestand an **Methodikseiten, die wie Tools benannt sind, aber keine sind** (~45 Routen unter `/werkzeuge/*` ohne Formular — Namen wie „…-Rechner", „…-Check", „…-Simulator" versprechen dort Interaktivität, die nicht eingelöst ist). Bei Wiederverwendung immer `implementation` prüfen: `CONTENT_ONLY | FRONTEND_ONLY | BACKEND_AVAILABLE | API_AVAILABLE`.

## Die wichtigsten interaktiven Werkzeuge (Auswahl, vollständig im YAML)

| Werkzeug | Route | Implementation | Kern |
|---|---|---|---|
| WÖk-App (PWA) | `/app/` | API (Oracle) | Wirkungscheck/Faktencheck, Frag die WÖk, Produktcheck |
| Faktencheck | `/werkzeuge/faktencheck/` | API (Oracle) | Folgen-vor-Fakten-Methodik |
| WÖk-KI | `/woek-ki/` | API (Oracle) | quellengebundener Chat (Beta) |
| **Wahlkreis-/Bundestag-Wirkungscheck V3** | `/werkzeuge/wahlkreis-wirkungscheck/` | lokal deterministisch + Opt-in-KI | Themenmodule Wohnen/Gesundheit, Sofortreaktionen, rote Linien, Instrumentenbibliothek |
| Impact-Controlling-Rechner | `/erleben/impact-controlling-rechner/` | Frontend | NWI + T-SROI live (Schutz-Gate) |
| T-SROI-Rechner | `/werkzeuge/t-sroi/#interaktives-beispiel` | Frontend | Rechenstandard v1.1 |
| Produktwirkungsrechner / Scorecard-Dashboard | `/erleben/produktwirkungsrechner/`, `/scorecard-dashboard.html` | Frontend | Scorecards + Reverse Merit Order |
| UWP Beta | `/erleben/unternehmens-wirkungsprofil/` | Frontend (JSON-Universe) | Unternehmensprofile, rote Linien |
| KWI Beta | `/erleben/kommunaler-wirkungsindex/` | Frontend (Snapshots) | 45 Städte; ⚠️ Quelle abgeschaltet |
| Wirkungskompasse | `/erleben/{welt,laender,europa}-wirkungskompass/` | Frontend | Territorialprofile M/P/D |
| WÖk-ID-Register-Explorer | `/woek-id-register/` | Frontend | 621 IDs, Filter |
| Wirkungswahl-Kompass | `/werkzeuge/wirkungswahl-kompass/` | Frontend (localStorage) | Wahl-O-Mat-artig, Prioritäten→Programm-Matrix |
| Debattenkarten + Studio | `/wirkungsradar/debattenkarten/`, `/wirkungsradar/studio/` | Frontend | 127 Karten, Format-Exporte |
| Zertifikate prüfen | `/zertifikat/` | API (Akademie) | ID/QR-Verifikation (Ausstellung fehlt noch!) |
| Mein Wirkungsraum | `/mein-wirkungsraum/` | Backend (Akademie) + lokal | Merkliste via WÖk-ID |

## Wichtige Klarstellungen (Verwechslungsgefahr)

- **Wirkungsrisiko-Matrix, Reverse Merit Order, Wirkungscontrolling** = Methodikseiten (CONTENT_ONLY), keine Rechner; die RMO-Rechnung lebt in `assets/js/impact-calculations.js` (calculateFinalScore) und den Scorecard-/Produkt-Rechnern.
- **„KWI"** doppelt vergeben: Kommunaler Wirkungsindex (`/erleben/kommunaler-wirkungsindex/`) vs. Kapitalwirkungsindex (`/werkzeuge/kapitalwirkungscheck/`, CONTENT_ONLY) — nie verwechseln.
- **LawReader** existiert nicht als Tool — nur als Kapitel im generischen Dokument-Reader (`assets/js/reference-reader.js`); Gesetzes-Volltexte: `werkstatt/gesetze/`.
- **Drei „Kompass"-Konzepte**: WÖk-Kompass (`/kompass.html`, kuratierte Q&A), Wirkungswahl-Kompass (Wahl-Tool), Resonanz-Kompass (Wirkungsradar-Content) + territoriale Wirkungskompasse.
- **Wirkungsrenten-Rechner** (`/erleben/wirkungsrenten-rechner/`): trägt „Rechner" im Namen, hat **keine** Eingabefelder (PROTOTYPE).
- Der frühere V1-Fragebogen des Wahlkreis-Wirkungschecks ist auf main **verwaist** (Code vorhanden, nirgends eingebunden); der UX-Branch dazu ist längst gemergt (PR #212).

## Gemeinsame Rechen-/UI-Bausteine (Reuse-Kandidaten)

- `assets/js/impact-calculations.js` — calculateNWI, calculateTSROI, calculateFinalScore (RMO) — von T-SROI-/Impact-Controlling-/Investment-Rechnern geteilt.
- `assets/js/tool-examples-dashboard.js` + `assets/data/tool-examples.json` — Demo-Widget-System (per `data-tool-example-*` aktivierbar, embeddable).
- `assets/js/reference-reader.js` — Lesemodus/Referenzmodus/Quellenmodus-Widget (1681 Einbindungen).
- `assets/js/wirkungskompass/territorial-compass.js` — eine Engine für Welt/EU/Länder-Kompasse (per `data-*` konfiguriert).
- `assets/js/woek-ai-client.js` — gemeinsamer Oracle-Client (askWoek, sendFeedback).
- Wirkungscheck-V3: Sofortreaktions-Registry (`docs/wirkungscheck-v3/IMMEDIATE_FEEDBACK_RULES.md`), Regel-Engine (`RULE_ENGINE_V3.md` → `rules-v3.js`), Instrumentenbibliothek (`instruments-2026.js`), ExplainDrawer-Spezifikation (`docs/wirkungscheck/RESULT_EXPLAINABILITY.md`).
