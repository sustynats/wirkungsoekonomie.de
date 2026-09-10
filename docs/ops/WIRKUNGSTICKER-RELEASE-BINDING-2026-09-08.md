# Wirkungsticker: Veröffentlichung an den gepushten Stand binden

Stand: 08.09.2026. Interner Betriebsnachweis, keine redaktionelle Nachricht.

## Beobachteter Fehler

Der reguläre Nachrichtenlauf [34253480823](https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/34253480823) erzeugte um 16:59:24 UTC Commit `84f10399e5` mit zwei neuen Erstveröffentlichungen. `publish-git.mjs` wartete erfolgreich auf den Push nach `main`. Anschließend startete der Worker um 16:59:36 UTC den Pages-Workflow mit `--ref main -f ticker_only=true`, ohne den gerade übertragenen Inhaltscommit mitzugeben.

Der ausgelöste Pages-Lauf [34254397796](https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/34254397796) verwendete dennoch den vorherigen Commit `be873946dc40e89c312cccd9cb7f4e7cd2388ba3`: nicht nur als `headSha` in der API, sondern auch nachweislich im Build-Checkout um 17:00:34 UTC und im Checkout der App-Benachrichtigung um 17:07:08 UTC. Der erfolgreiche Lauf lieferte deshalb einen älteren Feed. Warum GitHub bei diesem Dispatch diesen Ereignisstand bestimmte, ist damit nicht abschließend belegt; eine Cache- oder Konsistenzursache wird nicht als erwiesene Tatsache ausgegeben.

Der folgende reguläre [Pages-Lauf 34255771531](https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/34255771531) mit `7414e524580e9ca2a866782211b108df5a35af9f` endete um 17:21:23 UTC erfolgreich. Live geprüft: Feedrevision `20260908-direction1:2026-09-08T17:06:38.176Z`, 174 Einträge. Die drei neuen Meldungen (BSW-Vorschlag, Kryptosteuer-Pläne, Sanofi/Insulin) und das CDU-Update waren enthalten. Das ist ein Wiederanlaufnachweis, noch kein Nachweis einer vollständig stabilen Verarbeitung.

## Korrektur

1. Der Worker liest `HEAD` erst **nach** dem erfolgreichen `publish-git.mjs`-Aufruf. Das ist wichtig, weil Rebase, Wiederaufbau und Push-Retry den ursprünglichen lokalen Commit ändern können. Ohne erfolgreichen Push gibt es keine veröffentlichungsfähige Commit-Ausgabe.
2. Der Dispatch übergibt diese vollständige 40-stellige SHA als `ticker_commit`. `--ref main` bestimmt weiterhin die Workflowdefinition, nicht den zu bauenden Inhaltsstand. Fehlende oder ungültige SHAs werden im automatischen Aufruf abgewiesen.
3. Der Pages-Workflow akzeptiert eine solche Überschreibung nur im Ticker-only-Dispatch, validiert sie vor dem Checkout und checkt genau diesen Commit aus. Danach muss das tatsächliche `HEAD` mit dem angeforderten Stand übereinstimmen. Andernfalls stoppt nur dieser fehlerhafte Release vor dem Build; die gespeicherte Nachrichtenqueue bleibt erhalten.
4. Die tatsächliche Quell-SHA wird als Job-Ausgabe und im internen Actions-Laufbericht festgehalten. Ereignis-SHA und Inhalts-SHA werden ausdrücklich getrennt; Pages-/Actions-Metadaten allein sind kein Beweis für den ausgecheckten Inhalt.
5. App-Benachrichtigungen checken die verifizierte Quell-SHA des erfolgreichen Builds aus und prüfen sie vor dem Versand erneut. Sie verwenden weder einen inzwischen weitergewanderten `main`-Stand noch einen möglicherweise älteren Ereignisstand.

Normale Pushes, manuelle bzw. ältere Dispatches ohne Überschreibung sowie der separate Speedtest-Release bleiben rückwärtskompatibel. Die serielle Pages-Queue, sämtliche Inhalts-/Quellen-/Kostengates und die bestehenden Benachrichtigungs-Dublettenregeln bleiben erhalten. Keine Vercel-Builds, keine zusätzlichen kostenpflichtigen KI-Aufrufe, keine Queue- oder Usage-Umschreibung.

Technische Grundlage: [`gh workflow run`](https://cli.github.com/manual/gh_workflow_run) beschreibt `--ref` als Branch/Tag für die Workflowdefinition und `-f` für Eingaben. [`actions/checkout` v4](https://github.com/actions/checkout/blob/v4/README.md) unterstützt eine konkrete SHA als `ref`; ohne Überschreibung verwendet es den Ereignisstand. Diese Eigenschaften werden hier ausdrücklich miteinander verbunden.

## Prüfungen

`tests/news/release-binding.test.mjs` führt die tatsächlichen Shellblöcke aus beiden Workflows mit lokalen Git-/Publisher-/CLI-Testdoubles aus. Geprüft werden insbesondere ein nach Rebase veränderter Commit, fehlgeschlagener Push, unveränderte Arbeit, veralteter Checkout, fehlende/ungültige SHA, unveränderte reguläre Releasepfade und identische Inhaltsstände für Build und Benachrichtigung. Kein Test löst einen echten Dispatch, Push, Provideraufruf oder App-Versand aus.

Vor Änderung der Deploymentworkflows: `check:hosting-cost` und der angemeldete Accountcheck `check:hosting-cost:vercel` bestanden; letzterer prüfte fünf Bestandsprojekte ausschließlich lesend. Für die Reparatur bleibt die vorhandene GitHub-Pages-Infrastruktur zuständig.

Bestanden: Workflow-YAML-Parsing, **664 Nachrichten-/Betriebsmonitortests**, Typecheck, Nachrichten-/Registryvalidierung (76 Quellen, 193 veröffentlichte inklusive archivierter Storys), Ticker-Generator, vollständiger öffentlicher Artefakt-Build einschließlich seiner Tests und Linkprüfungen, Datenschutzprüfung (19.390 Textdateien) und Größenprüfung (820,6 MB). Der Generator verändert in diesem Korrekturschritt weder Artikelseiten noch kanonische Nachrichten-/Kostendaten. Language-Lint: dieselben 25 vorhandenen Befunde, keine neuen. Keine neue Darstellung: die bereits geprüften Desktop-/Mobile-Komponenten bleiben unverändert. Produktiver Inhalts-/Release-Nachweis folgt nach dem regulären Deployment.

## Kosten und offener Rückstand - separate Momentaufnahme

Gespeicherter Nachrichtenstand `4cc5f92c7e` vom 17:29 UTC: 71 wartende Vorgänge, davon 61 Kapazitätsrückstellungen, fünf technische und fünf Quellenintegritätsfälle. Eine Kapazitätsrückstellung ist weder eine erledigte Prüfung noch eine verlorene Nachricht.

Kostenfenster 08.09.2026 seit 00:00 Berlin, gemessen um 19:35 Berlin: unmittelbare Nachrichten einschließlich Ablehnungen, Wiederholungen und synchroner Medienchecks **3,205155 USD**, 40 Erstveröffentlichungen und neun Updates. Mit gespeichertem ECB-Kurs vom 07.09.2026 (1 EUR = 1,1622 USD) und 19 Prozent Steuerreserve geschätzt **3,281823 EUR**, also **8,20 Cent je Erstveröffentlichung** bzw. **6,70 Cent je Erstveröffentlichung oder Update**. Kein Rechnungsbetrag, keine reine Routine-Stichprobe und noch kein Viercentnachweis.

Separat: Autorenanalysen 4,346257 USD mit konservativer Schätzung; acht heute abgerechnete Hintergrund-Batchjobs 0,118206 USD, keine offenen Batchreservierungen. Alle 16 gespeicherten Batchjobs waren abgeschlossen und abgerechnet. Die halbstündliche Stabilisierungskontrolle bleibt bestehen; weder die Queue noch das Gesamtziel sind mit diesem einzelnen Releasefix erledigt.
