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

Ein einziger Workflow `.github/workflows/wirkungsticker.yml`, alle 15 Minuten. Zeitgeber sind der
GitHub-Cron auf versetzten Minuten (:04/:19/:34/:49) **und** der Oracle-Takt (systemd-Timer,
leerer Commit mit aktuellem main-Baum auf `codex/wirkungsticker-clock`); am 15.09.2026 feuerte der
GitHub-Cron für dieses Repository nur alle vier bis fünf Stunden. Die Workflow-Concurrency verhindert
Doppelläufe.

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

- **Höchstens zwei bezahlte Versuche je Eingabestand.** `WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT=2`:
  Scheitert das Gate an einem strukturellen Fehler (fehlende Felder, Faktoren, Formate), folgt nach
  15 Minuten Backoff genau ein zweiter Versuch mit denselben Quellen (mit luna rund 1 Cent).
  Inhaltliche Ablehnungen (nicht materiell, Dublette, Evidenz unzureichend) werden nie erneut
  bezahlt. Danach bleibt die Meldung als `AI_ATTEMPT_LIMIT_REACHED` sichtbar liegen; erst neue
  Evidenz (anderer Fingerprint) löst erneut aus. Es gibt keine Zweitprüfung und keinen Review-Kindjob.
- Transportfehler ohne Modellantwort (Timeout, 5xx, 429) sind kein bezahlter Versuch; höchstens
  ein zweiter Transportversuch, nie ein dritter. 401/403 bricht sofort ab.
- Einzige Ausnahme von der Ein-Versuch-Regel: eine formal unbrauchbare Anbieterantwort
  (`AI_OUTPUT_INVALID`, kein gültiges JSON) darf nach Backoff genau einmal wiederholt werden.
  Inhaltliche Gate-Ablehnungen werden nie wiederholt.
- LIFO-Horizont `WOEK_NEWS_MAX_SOURCE_AGE_HOURS` (Standard 24; 0 schaltet ab, nur für Tests).
- Kapazität: `WOEK_NEWS_MAX_AI_STORIES_PER_RUN` (Standard 4 je Viertelstunde),
  `WOEK_NEWS_MAX_AI_CALLS_PER_HOUR` (Standard 12). Monatsbudget und Stufen unverändert in
  `scripts/news/budget.mjs` (70 % / 85 % / 95 %).
- Reasoning-Aufwand über `WOEK_NEWS_REASONING_EFFORT` (Standard seit 15.09. abends `medium`:
  `gpt-5.6-luna` entgleiste bei `low` in zwei von vier Antworten im hinteren Teil, Planet und
  Demokratie kamen als Fragmente; bei `gpt-5.4-mini` hatte `medium` nur die Ausgabe-Token
  verdoppelt). Jede bezahlte Antwort wird als privates Laufartefakt `ai-raw-output-<run>`
  (3 Tage) gesichert, damit Gate-Fehler erklärbar sind.
- Der Transport ergänzt nie Inhalte. Er wandelt Typen (Zahlen-Strings → Zahlen, Boolean-Strings
  → Booleans), rechnet die Tragweite aus den gelieferten Faktoren nach und repariert seit
  15.09. abends deterministisch drei Etikettfehler, die sonst ganze Bindungsketten kippten
  (Lauf 7: „rbb24“ statt `rbb24-nachrichten` ließ alle Faktoren als fehlend erscheinen):
  Quellenkennungen werden auf die gelieferten `source_id` abgebildet (exakt, normalisiert,
  eindeutiges Präfix, eindeutiger Verlagsname; nicht Zuordenbares wird verworfen, nie
  ergänzt), Nebenpfade (`side_effect`, `side_risk`) wandern aus `primary_paths` nach
  `secondary_paths`, `data_status: missing` einer modellierten Dimension wird `modelled`,
  Textfragmente an Pfadstellen werden verworfen. Jede Reparatur steht im Analyseobjekt unter
  `transport_repairs`. Ein unvollständiger Pfad bleibt unvollständig und fällt im Gate durch.
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
  Version +1, Veröffentlichungsdatum bleibt). Seit 16.09. fester Schritt jedes Laufs (Limit
  `WOEK_NEWS_REASSESS_LIMIT`, Standard 30; Workflow-Input `reassess_limit` übersteuert), denn am
  15.09. hatte ein einziger Vertagungsvermerk (`AI_BUDGET_OR_BATCH_LIMIT`) den Aktualisierungs-
  vermerk der Meldungen neu geschrieben und die Markierung gelöscht: null Meldungen in der
  Reparaturschlange, alte Meldungen blieben ohne Balken. Die Markierung überlebt jetzt jeden
  Vertagungsvermerk, und `partitionAiQueue` reserviert je Lauf einen Platz für eine wartende
  Neufassung, damit der frische Nachrichtenstrom sie nicht verdrängt.

## Private Redaktion (Meinung & Analyse, Nachgehört/Nachgesehen, Buch & Wirkung)

Eingabe und Freigabe bleiben in der Redaktionsapp (`admin/redaktion`, Oracle). Neu seit dem
15.09.2026 abends: **Der Redaktionsworker in GitHub** (`.github/workflows/redaktionsworker.yml`,
`scripts/news/redaktionsworker.mjs`, alle 15 Minuten versetzt zum Nachrichtenlauf) übernimmt die
Rolle der früheren ChatGPT-Worker ohne Serverzugang:

1. Er hält die Import-Sperre über die vorhandene authentifizierte Oracle-Schnittstelle, liest
   offene Aufträge (`editorial_request`, Status `queued`), übernimmt das Eingabepaket atomar
   (`00_INBOX` → `10_CLAIMED`) und macht **genau einen** OpenAI-Aufruf mit dem unveränderten
   Redaktionsvertrag (`EDITORIAL_REQUEST_CONTRACT_V4`, Wissensprofil `editorialKnowledge`).
2. Die Antwort wird mit den bestehenden Regeln geprüft (`validateApiOutput`, Vorschau- und
   Quellenprüfung) und als `20_OUTPUT_READY/<job>.output.json` abgelegt. Die Redaktionsapp holt den
   Entwurf innerhalb einer Minute ab und legt ihn zur Freigabe oder Rückgabe mit Kommentar vor.
3. Eine unbrauchbare oder ungültige Antwort wird einmal privat vermerkt
   (`github-attempt:<job>`) und nie erneut bezahlt; der Auftrag bleibt sichtbar in Bearbeitung.
4. Tagesdeckel `WOEK_EDITORIAL_MAX_JOBS_PER_DAY` (10), je Lauf `WOEK_EDITORIAL_MAX_JOBS_PER_RUN` (2),
   Kosten je Auftrag im privaten Beleg `95_LOGS/processor-github-<job>.json`.
5. **Kandidaten für Meinung & Analyse** (`scripts/news/redaktions-kandidaten.mjs`, aktiv mit
   `WOEK_EDITORIAL_AUTO_CANDIDATES=true`): Aus stark relevanten, unabhängig belegten Meldungen der
   letzten 48 Stunden entsteht höchstens ein regulärer Auftrag je Lauf, zwei je Tag, je Meldung nur
   einmal. `author_notes` bleiben leer; der Entwurf ist ein Vorschlag, keine Position der Autorin.

Der Nachrichtenworkflow holt freigegebene Fassungen in jedem Lauf ab
(`scripts/news/import-approved-editorials.mjs --claim`) und quittiert erst nach dem erfolgreichen
Push (`--finalize`). Eine gestörte Redaktion hält den Nachrichtenlauf nie an.

## Prüfen

```bash
npm run news:test
WIRKUNGSTICKER_PROCESSING_MODE=api node scripts/news/run-api.mjs --dry-run
npm run news:validate
npm run news:health
```
