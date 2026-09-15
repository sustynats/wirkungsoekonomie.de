# Übergabe an Codex: Wirkungsticker im Direktbetrieb (15.09.2026)

Entscheidung von Natalie am 15.09.2026, umgesetzt von Claude. Bitte nicht zurückbauen und
keine neuen Bridge-Zwischenschritte einführen. Maßgebliche Doku:
`docs/ops/WIRKUNGSTICKER-DIREKTBETRIEB.md`.

## Was sich geändert hat

- **Ein Workflow, eine Linie.** `.github/workflows/wirkungsticker.yml` läuft alle 15 Minuten:
  Import → lokale Bewertung (LIFO, Horizont 24 h) → genau ein OpenAI-Aufruf je Meldung →
  deterministisches Gate → Build → Commit → Pages. Keine Clock-Branches, keine Bridge-Phasen.
- **Direkter Transport** `scripts/news/openai-transport.mjs` (Responses API, JSON-Modus,
  Systemanweisung für den einzigen Durchgang). Schlüssel: Secret `WIRKUNGSTICKER`.
- **Deterministisches Gate** `scripts/news/impact-gate.mjs` ersetzt die Zweitprüfung per Job:
  Nur ein vollständiges 2.1-Profil mit drei modellierten Dimensionen wird `publication_status:
  ready` und erhält `impact_semantic_review.mode = deterministic-gate-1`. Erst dann rendern
  Ring und Balken.
- **Ein bezahlter Versuch je Eingabestand** (`paidAttemptsExhausted`, Reason
  `AI_ATTEMPT_LIMIT_REACHED`). Neue Evidenz löst erneut aus, sonst nichts.
- **LIFO-Horizont** (`WOEK_NEWS_MAX_SOURCE_AGE_HOURS`, Standard 24): ältere unveröffentlichte
  Kandidaten werden mit `LIFO_HORIZON_EXCEEDED` geschlossen, ohne Aufruf.
- **Neubewertung** `scripts/news/queue-reassessment.mjs`: Modus `impact_potential_reassessment`
  für veröffentlichte Meldungen ohne vollständiges Profil (Version +1, Datum bleibt).
- **Altwarteschlange geschlossen** (`scripts/news/retire-backlog.mjs`,
  `BACKLOG_RETIRED_DIRECT_OPERATION_2026_09_15`).
- `validateAnalysis` verlangt bei `requireImpactAssessment` drei modellierte Dimensionen;
  `budget.mjs` kennt `gpt-5.6-luna`.

## Was bewusst unverändert bleibt

Datenmodell `stories.json`, Vertrag 2.1 (`impact-assessment.mjs`, `impact-potential.mjs`,
`impact-magnitude.mjs`), `build.mjs`, `validate.mjs`, `publish-git.mjs`, `deploy.yml`,
Titelbildsystem, App-Ausspielung, Quellenregister, Budgetstufen.

## Was Codex prüfen sollte (in dieser Reihenfolge)

1. Erste Live-Läufe im Workflow-Log: `ai_calls` je Lauf, `quality_holds` nach Grund,
   `lifo_expired`, `published_stories`. Ziel: Holds vor allem redaktionell, nicht strukturell.
2. Wiederkehrende Gate-Fehlercodes (`IMPACT_*`) sammeln und daraus Präzisierungen der
   Systemanweisung in `openai-transport.mjs` ableleiten, nicht das Gate lockern.
3. Oracle: Bridge-Timer (`woek-wirkungsticker-clock`, `woek-news-bridge-poll`,
   `woek-news-self-heal`) und Dropbox-Poller können abgeschaltet werden; der private
   Redaktionsdienst (`editorial-server`, `/admin/redaktion`) bleibt in Betrieb.
4. Bridge-Workflows (`wirkungsticker-discovery.yml`, `wirkungsticker-bridge-manual.yml`,
   `wirkungsticker-processor-config.yml`, `chatgpt-dropbox-bridge.yml`) sind über die
   Variable inaktiv; Löschung nach einer Woche stabilem Betrieb.
5. Offene PRs #771, #772, #774 sind durch diesen Umbau überholt (Bridge-Reparaturen).

## Private Redaktion

Freigegebene Fassungen aus `admin/redaktion` werden übernommen
(`scripts/news/import-approved-editorials.mjs`, Claim vor dem Build, Finalize nach dem Push).
Die Entwurfserzeugung läuft seit 15.09.2026 abends im **GitHub-Redaktionsworker**
(`.github/workflows/redaktionsworker.yml`, `scripts/news/redaktionsworker.mjs`) über die
vorhandene Oracle-Schnittstelle und Dropbox-Ablage; der Oracle-seitige `run-api-processor.mjs`
muss NICHT aktiviert werden (Doppelbearbeitung vermeiden). Bitte auf Oracle nichts parallel
starten, das `00_INBOX`-Aufträge claimt. Belege je Auftrag: `95_LOGS/processor-github-<job>.json`,
Beobachtungen `github-attempt:<job>`, `github-claim:<name>`, `github-candidate:<story>`.
