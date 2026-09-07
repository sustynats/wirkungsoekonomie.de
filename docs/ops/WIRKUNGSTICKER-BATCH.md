# Zeitunkritische Nachrichtenarbeit über OpenAI Batch

Stand: 7. September 2026. Kein Ersatz für die unmittelbare Nachrichtenverarbeitung.

## Routing

- `media_backfill`: fehlender, lokal ausgelöster Frame-/Mediencheck einer bereits veröffentlichten Wirkungsakte.
- `editorial_background`: eigenständige, recherchereife Vertiefung nach unverändertem Relevanz-, Analysegewinn-, Quellenintegritäts- und Evidenzgate.
- Nur veröffentlichte, sichtbare Ausgangsakten ohne neue Quelle oder Aktualisierung seit mindestens 24 Stunden und ohne wartendes Nachrichtenupdate. Explizite Dringlichkeit, Sonderanalysen sowie bekannte Ereignistermine innerhalb der nächsten 48 Stunden sind ausgeschlossen. Redaktionell beauftragte Sonderanalysen bleiben vom generischen Vertiefungsworker ausgeschlossen.
- Neue Nachrichten, Breaking News und aktuelle Updates bleiben synchron. Batch wartet nicht auf eine Mengenquote: ein einzelner passender Auftrag erhält bereits den Batch-Tarif.

Die 24-Stunden-Altersregel ist ein konservativer technischer Filter, keine Garantie fehlender Dringlichkeit. Neue Quellen, Fakten, Claims, Analyseänderungen oder Methodenversionen verändern den Fingerprint. Verspätete Ergebnisse dürfen dann nicht den aktuellen Beitrag überschreiben.

## Bestehende Architektur

GitHub Actions `wirkungsticker.yml` führt nach dem normalen Nachrichtenimport die Hintergrundarbeit aus. Kein zweiter Cron, keine neue Datenbank, kein Vercel-Dienst und kein zusätzlicher KI-Anbieter. Oracle verwendet denselben API-Schlüssel, `gpt-5.4-mini`, die vorhandenen Newsroom-Anweisungen und die vorhandenen Kostenjournale.

Authentifizierte interne API:

- `POST /api/news-analysis/batches`: idempotente Einreichung.
- `GET /api/news-analysis/batches`: Wiederherstellungsmetadaten, keine Artikelantworten.
- `GET /api/news-analysis/batches/<key>`: Status, geprüfte Abrechnung und gegebenenfalls generierte Antwort.

`NEWS_BATCH_ENABLED=true` aktiviert den Oracle-Adapter. Die Repository-Variable `WOEK_NEWS_BATCH_ENABLED=true` aktiviert das Hybridrouting im Worker. Die normale Nachrichten-Lane verwendet diese Variable nicht. Für einen Rückbau zuerst eingereichte Jobs abholen; ein Abschalten des Workers storniert keine bereits eingereichten OpenAI-Aufträge.

## Haltbarkeit und Sicherheit

Der SHA-256-Auftragsschlüssel bindet Protokollversion, Jobart, Story, vollständigen Inhaltsfingerprint, Prompt und Versuch. Oracle schreibt vor `POST /v1/batches` einen dauerhaften Einreichungsmarker. Nach einer unklaren Providerantwort sucht es ausschließlich nach passender eigener Metadaten-/Dateiidentität; kein spekulatives erneutes Absenden. Unklare Jobs halten ihre Reserve und werden nach 30 Stunden als prüfbedürftig gemeldet.

Private Oracle-Datei: `data/news-analysis-batches.json`, atomar ersetzt, Modus 0600. Das ist ein technisches Auftragsjournal im bestehenden Dateispeicher, kein öffentlicher Inhaltsbestand. Der Worker speichert nur Status, Fingerprints und Kosten in `data/news/state.json` und `data/news/usage.json`. Ein abgebrochener GitHub-Lauf kann fehlende Metadaten aus Oracle wiederherstellen. Modelltexte gelangen erst nach den bestehenden Qualitätsgates in veröffentlichte, versionierte Datensätze.

Providerdateien enthalten nur die ohnehin zulässig verwendeten Quellenmetadaten/-auszüge und bestehenden Recherchepakete; externe Inhalte bleiben untrusted. Kein Artikel-Crawler, keine Paywall-Umgehung, kein zusätzliches Web-Search-Tool. Nach terminalem Ergebnis und geklärter Abrechnung werden genau die zugehörigen Providerdateien gelöscht, **nach** dauerhafter Sicherung des Resultats. Bei ungeklärter Abrechnung bleibt die Evidenz erhalten. Private Resultate werden vorerst nicht automatisch gelöscht; Metadatenabruf enthält die letzten sieben Tage plus alle unabgerechneten Jobs.

## Abrechnung und Grenzen

Offizielle Grundlage: [OpenAI Batch Guide](https://developers.openai.com/api/docs/guides/batch), [gpt-5.4-mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini). Batch hat ein Verarbeitungsfenster von bis zu 24 Stunden und 50 % geringere Input-/Output-Tokenpreise gegenüber synchroner Verarbeitung desselben Modells. Nicht jeder Nachrichtenteil ist batchfähig; deshalb keine pauschale Halbierung der gesamten Betriebskosten versprechen.

- Pro Auftrag 0,125 USD konservative Vorabreserve in beiden bestehenden Kostenjournalen; tatsächliche Provider-Tokens inklusive Cache werden zum halben Tarif abgeglichen.
- Fehlerhafte, aber abgerechnete Antworten kosten ebenfalls Geld. Unbekannte Nutzung bleibt reserviert; keine erfundenen Nullkosten.
- Höchstens vier gleichzeitig offene und acht neu eingereichte Hintergrundaufträge pro UTC-Tag. Bis zu drei fachliche/technische Versuche je Inhaltsstand; keine tägliche Inhaltsquote.
- Hintergrundarbeit lässt mindestens 1 USD Nachrichtenreserve sowie 1,50 EUR gemeinsame Dienstreserve frei. Aktuelle Nachrichten dürfen diese Reserven weiterhin normal nutzen.
- Die bestehende Freigabe bleibt unverändert: maximal 50 EUR brutto Nachrichten-KI im September 2026, ab Oktober wieder 25 EUR; gemeinsames Dienstlimit separat und unverändert. Kein Zurücksetzen historischer Kosten.
- Ein fertiger, bereits bezahlter Auftrag wird auch bei später ausgeschöpftem Budget oder fehlendem FX-Update abgeholt. Nur **neue** Einreichungen benötigen neue Budgetreserve.
- Im Nutzungsjournal genau eine Zeile je Batch-Key: erst Reservierung, später Abgleich derselben Zeile. Veröffentlichung/Update wird an diese Zeile gebunden, nicht ein zweites Mal berechnet.

## Qualität und Betrieb

Batch-Ergebnisse verwenden denselben Transportdecoder, dieselben Quellen-/Fakten-, WÖk-, Frame-, Self-Frame-, Zahlen- und Publikationsprüfungen wie synchrone Ergebnisse. `pending` ist kein Betriebsausfall. Unbrauchbare Antworten werden nicht veröffentlicht; Korrekturprompts bleiben innerhalb der vorhandenen Quality-Retry-Logik und der begrenzten Batch-Versuche. Erschöpfte Versuche bleiben sichtbar, werden nicht endlos bezahlt wiederholt.

Die normalen Laufberichte bleiben maßgeblich für aktuelle Nachrichten. Editorial-Report und Medien-Backfill-Ausgabe ergänzen `batch` mit eingereichten, offenen, abgeholten, angewendeten und prüfbedürftigen Jobs. Kostenvergleich getrennt nach `ai.processing_mode=batch`, Reserven vs. abgeglichenen Kosten und Veröffentlichungen vs. Updates führen. Ein eingereichter Job ist noch keine Veröffentlichung.

Die Betriebskostenübersicht (Schema 1.1) trennt `news` (direkte Nachrichten einschließlich Ablehnungen, Wiederholungen und synchroner Medienchecks), `editorial` (synchrone Vertiefungen) und `batch` (Hintergrundjobs, zusätzlich nach Medienchecks/Vertiefungen). `total` enthält unverändert **alle** Kosten einschließlich offener Reserven und bezahlter Qualitätsablehnungen. Ein abgeglichener Batch-Anbieterwert ist keine Ersatzschätzung. `settled_cost_usd`, `reserved_cost_usd` und `applied_jobs` unterscheiden bezahlte Verarbeitung, offene Reservierung und tatsächlich angewendetes Ergebnis. Die Vier-Cent-Kennzahl für direkte Nachrichten ist keine Gesamtkostenquote einschließlich Hintergrundarbeit, Bildern oder Hosting.

Der Tagesbericht zeigt das freigegebene Nachrichtenbudget des aktuellen UTC-Abrechnungsmonats aus dem Worker-Bericht, nicht einen fest codierten 25-EUR-Wert. Ein älterer Monatsbericht darf die Septemberausnahme nicht fortschreiben. Fehlt ein gültiger Wert, bleibt das Limit ausdrücklich unbekannt. Dies ist reine Berichterstattung: Budgets, historische Journale und laufende Aufträge werden dadurch nicht verändert.

Der Stillstandsmonitor bewertet die unmittelbare Nachrichtenwarteschlange ohne Hintergrund-Batch, alte Medien-Backfills oder eigenständige Vertiefungen. Diese dürfen einen ausbleibenden Nachrichtenfortschritt nicht verdecken. Veröffentlichungen, substantielle Updates und ordentlich abgeschlossene Verwerfungen/Zusammenführungen aus der normalen Nachrichtenverarbeitung bleiben gültiger Fortschritt.

Lange Discord-Tagesberichte werden vollständig in begrenzte Nachrichtenteile zerlegt, nicht mehr bei 1.950 Zeichen abgeschnitten. Damit bleiben auch abschließende Kostenwerte, Warnungen und Links erhalten. Die bestehende Outbox wird erst nach vollständiger Zustellung quittiert; jeder Teil behält bei einer Wiederholung seine eigene stabile Nonce. Es bleibt ausschließlich die konfigurierte private Empfängerin; keine öffentliche Ausweichzustellung.

### Erster realer Durchlauf, 7. September 2026

Geprüfter Stand `606feeea3fcb5ff2b762f09f9484ef18a6947948`, Live-Release abgeschlossen um 16:21 UTC: sechs Batch-Antworten abgeglichen, fünf davon als versionierte Medienchecks angewendet; ein erster Qualitätsversuch blieb unveröffentlicht, sein geprüfter Korrekturversuch wurde später angewendet. Anbieterbasierte Gesamtschätzung dieser sechs Versuche: 0,031962 USD. Zwei weitere Aufträge waren zu diesem Stand regulär offen (zusammen 0,25 USD Reserve). Keine dieser Nachprüfungen ist eine neue Nachricht; daraus darf kein Preis je neuem Artikel abgeleitet werden.

Der normale Nachrichtenbetrieb lief parallel. Seit der Freigabe um 13:27 UTC: elf Läufe, acht Erstveröffentlichungen, eine normale Aktualisierung und 69 abgeschlossene Queue-Prüfungen. 227 Kandidaten wurden lokal verworfen; 3.154 Feed-Dubletten erreichten keine neue Vollanalyse. Die direkte KI-Kostenschätzung von 0,584104 USD ergibt mit dem gespeicherten ECB-Kurs und 19 % Steuerreserve rund 7,48 Eurocent je Erstveröffentlichung einschließlich erfolgloser Prüfungen/Updates. Das ist eine **Aufholphase, kein Beleg für einen normalen Vier-Cent-Betrieb**. Noch 105 offene Prüfungen (98 Kapazität, vier technische Wiederholungen, drei Quellenintegritäts-Holds); der Rückstand war nicht erledigt. Kein zusätzlicher kostenpflichtiger Testlauf wurde für diese Kontrolle ausgelöst.

## Verifikation

Tests umfassen Dringlichkeitsausschluss, geänderte Fingerprints, exakte Ergebnisidentität, Authentifizierung, verlorene Einreichungsantwort, Wiederanlauf ohne lokale Jobdatei, Doppelveröffentlichung, Rundung des Batch-Tarifs, Budgetreserve, Monatswechsel, abgelehnte/abgelaufene Aufträge und bestehendes Editorial-Publikationsgate. Backend: TypeScript, Unit-Tests und Build. Frontend: vollständige News-Tests, News-Validierung, Hosting-Kostengate und Release-Prüfungen.

Rollout erfolgt backup-first als inkrementeller Oracle-Patch; bestehende Parlaments-, Polls- und Higgsfield-Erweiterungen sowie Daten, `.env` und beide Kostenjournale werden nicht ersetzt. Nach Release: Healthcheck, authentifizierter Batch-Zugriff, normaler Nachrichtenlauf und ein echter geeigneter Hintergrundauftrag. Die tatsächliche Fertigstellung wird erst nach Providerabschluss gemeldet.
