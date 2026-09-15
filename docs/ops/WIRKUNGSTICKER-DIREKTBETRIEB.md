# Wirkungsticker: Direktbetrieb (seit 15.09.2026)

Verbindliche Betriebsarchitektur des Wirkungstickers. Sie ersetzt die Dropbox-ChatGPT-Bridge
(10.–15.09.2026) und die frühere Oracle-Proxy-Lane. Entscheidung: Natalie, 15.09.2026.

## Warum

Die Bridge hatte fünf Übergabepunkte (GitHub → Oracle-SQLite → Dropbox → ChatGPT-Worker →
Dropbox → Oracle → GitHub) und zusätzlich eine zweite ChatGPT-Prüfung je Meldung. Jeder Punkt
konnte hängen; am 15.09. lagen 801 Meldungen bis zu acht Tage in der Warteschlange, 276
Aufträge waren „geclaimt“ und nie geliefert, und die Worker lieferten für Planet und
Demokratie meist `insufficient_basis` statt eines modellierten Wirkungspotenzials. Über 30
Patches in zwei Tagen behandelten Symptome dieser Kette.

## Die gerade Linie

Ein einziger Workflow `.github/workflows/wirkungsticker.yml`, alle 15 Minuten:

1. **Einsammeln** (kostenlos): amtliche Feeds aus `content/news/source-registry.json` plus die
   aktive Discovery über freigegebene Indizes (`scripts/news/active-discovery.mjs`).
2. **Lokal bewerten** (kostenlos, deterministisch): Dedupe, Ereignis-Clustering, Relevanz-
   und Ereignisbewertung (`preAnalyzeStory`, `event-relevance.mjs`). Reihenfolge LIFO:
   frische Meldungen zuerst, beauftragte Potenzial-Neubewertungen dahinter, kein Altbestand.
3. **Genau ein OpenAI-Aufruf je Meldung** (`scripts/news/openai-transport.mjs`): Responses API,
   JSON-Modus, Systemanweisung „ein Durchgang, veröffentlichungsreif, alle drei Dimensionen
   modelliert, zweiter Recherchepass im selben Durchgang“. Der Aufruf liefert das komplette
   Paket: Quellenzusammenfassung, WÖk-Einordnung, Claim-Ledger, Publikationsgate und
   `impact_assessment` 2.1 (Mensch, Planet, Demokratie mit sechs Faktoren je Pfad).
4. **Deterministische Ableitung**: Tragweite, Richtung und Dominanz werden aus den sechs
   Faktoren des Modells nachgerechnet (`deriveAssessmentCalculations`); die Spanne wird nur
   auf den nachgerechneten Punktwert eingeschnappt. Nichts Redaktionelles wird erfunden.
5. **Deterministisches Gate** (`scripts/news/impact-gate.mjs`): `validateAnalysis`,
   `impactAssessmentErrors`, `semanticIssues`, `modelledPublicationIssues`. Nur ein
   vollständiges, quellengebundenes Profil mit drei modellierten Dimensionen wird als
   `publication_status: ready` freigegeben und mit `impact_semantic_review` (Modus
   `deterministic-gate-1`) versehen. Erst dann rendern Ring und Balken öffentlich.
6. **Build → Commit → Pages** wie bisher (`build.mjs`, `publish-git.mjs`, `deploy.yml`
   ticker-only), anschließend `news:health`.

## Kostenregeln

- **Ein bezahlter Versuch je Eingabestand.** `WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT=1`:
  Scheitert das Gate, bleibt die Meldung als `QUALITY_GATE_FAILED` bzw.
  `AI_ATTEMPT_LIMIT_REACHED` sichtbar liegen. Erst neue Evidenz (anderer Fingerprint) löst
  erneut aus. Es gibt keine bezahlte Zweitprüfung und keinen Review-Kindjob.
- Transportfehler ohne Modellantwort (Timeout, 5xx, 429) sind kein bezahlter Versuch; höchstens
  ein zweiter Transportversuch, nie ein dritter. 401/403 bricht sofort ab.
- Einzige Ausnahme von der Ein-Versuch-Regel: eine formal unbrauchbare Anbieterantwort
  (`AI_OUTPUT_INVALID`, kein gültiges JSON) darf nach Backoff genau einmal wiederholt werden.
  Inhaltliche Gate-Ablehnungen werden nie wiederholt.
- LIFO-Horizont `WOEK_NEWS_MAX_SOURCE_AGE_HOURS` (Standard 24; 0 schaltet ab, nur für Tests).
- Kapazität: `WOEK_NEWS_MAX_AI_STORIES_PER_RUN` (Standard 4 je Viertelstunde),
  `WOEK_NEWS_MAX_AI_CALLS_PER_HOUR` (Standard 12). Monatsbudget und Stufen unverändert in
  `scripts/news/budget.mjs` (70 % / 85 % / 95 %).
- Reasoning-Aufwand über `WOEK_NEWS_REASONING_EFFORT` (Standard `low`; `medium` verdoppelte im
  ersten Live-Lauf die Ausgabe-Token ohne bessere Struktur). Jede bezahlte Antwort wird als
  privates Laufartefakt `ai-raw-output-<run>` (3 Tage) gesichert, damit Gate-Fehler erklärbar sind.
- Der Transport wandelt nur Typen (Zahlen-Strings → Zahlen, Boolean-Strings → Booleans) und
  rechnet die Tragweite aus den gelieferten Faktoren nach; er ergänzt nie Inhalte.
- Betriebsmodell seit 15.09.2026 abends: `gpt-5.6-luna` (Variable `WOEK_NEWS_MODEL`, Entscheidung
  Natalie); September-Freigabe auf 100 EUR angehoben (`NEWS_AI_BUDGET_DIRECT_OPERATION`).
- Modell über Repository-Variable `WOEK_NEWS_MODEL` (Code-Standard `gpt-5.4-mini`; zugelassen
  `gpt-5.5`, `gpt-5.6-luna`). Richtwerte je Meldung bei rund 11k Eingabe- und 4k Ausgabe-Token:
  `gpt-5.6-luna` ≈ 0,7 Cent, `gpt-5.4-mini` ≈ 2,6 Cent, `gpt-5.5` ≈ 18 Cent.

## Schlüssel und Variablen

- Secret `WIRKUNGSTICKER` = OpenAI-API-Schlüssel (von Natalie am 15.09.2026 angelegt). Er wird
  im Workflow als `OPENAI_API_KEY` gesetzt und liegt nirgends im Repository.
- Variable `WIRKUNGSTICKER_PROCESSING_MODE=api`. Der Wert `dropbox_chatgpt_bridge` schaltet den
  Direktbetrieb ab; die Bridge-Workflows bleiben nur als Historie lesbar.
- `WOEK_NEWS_BRIDGE_DISCOVERY_ENABLED=false`, `WOEK_NEWS_BATCH_ENABLED=false`.

## Neustart und Reparatur (15.09.2026)

- `scripts/news/retire-backlog.mjs`: Alle unveröffentlichten Kandidaten der alten Warteschlange
  wurden mit `BACKLOG_RETIRED_DIRECT_OPERATION_2026_09_15` geschlossen, offene Aktualisierungen
  veröffentlichter Meldungen verworfen. Veröffentlichte Texte blieben unverändert.
- `scripts/news/queue-reassessment.mjs --limit=30`: Die jüngsten Online-Meldungen ohne
  vollständiges freigegebenes Profil erhalten `pending_update.impact_reassessment` und werden
  im regulären Lauf mit genau einem Aufruf neu gefasst (Modus `impact_potential_reassessment`,
  Version +1, Veröffentlichungsdatum bleibt). Manuell über den Workflow-Input `reassess_limit`.

## Private Redaktion (Meinung & Analyse, Nachgehört/Nachgesehen, Buch & Wirkung)

Eingabe, Entwurf und Freigabe laufen weiterhin über die private Redaktion auf Oracle
(`admin/redaktion`, `editorial-server`). Der Nachrichtenworkflow holt in jedem Lauf die dort
freigegebenen Fassungen über die vorhandene authentifizierte Schnittstelle ab
(`scripts/news/import-approved-editorials.mjs --claim`, Import-Sperre wird gehalten), baut sie
mit und quittiert die Übernahme erst nach dem erfolgreichen Push (`--finalize`). Eine gestörte
Redaktion hält den Nachrichtenlauf nie an (`continue-on-error`). Die Entwurfserzeugung auf
Oracle (bisher ChatGPT-Worker, vorbereitet: `bridge/run-api-processor.mjs` mit OpenAI) ist eine
eigene Betriebsentscheidung.

## Prüfen

```bash
npm run news:test
WIRKUNGSTICKER_PROCESSING_MODE=api node scripts/news/run-api.mjs --dry-run
npm run news:validate
npm run news:health
```
