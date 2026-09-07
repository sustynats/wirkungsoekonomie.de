# Oracle: begrenztes Ausgabefenster für redaktionelle Langanalysen

## Befund und Änderung

Wiederholte fehlgeschlagene Langanalysen hatten jeweils genau 6500 Ausgabetokens. Der synchrone Nachrichtenpfad verwendete dieses Limit auch für die wesentlich umfangreicheren redaktionellen JSON-Ausgaben; der bestehende Batch-Redaktionspfad hatte bereits 10000. Die alten Protokolle enthalten nicht durchgehend `incomplete_details`, daher ist nicht jede historische Ablehnung zweifelsfrei als Abschneiden identifiziert.

Der authentifizierte interne Redaktionsclient erhält nun dasselbe begrenzte Fenster von 10000 Tokens. Normale Nachrichten bleiben bei 6500, öffentliche Chat-Aufrufe bei 2600. Ein vom Benutzer geliefertes Body-Feld kann das Profil nicht erhöhen. Die Profilzuweisung erfolgt erst am authentifizierten Worker-Endpunkt anhand des bestehenden Redaktions-Client-Headers.

Providerstatus `incomplete` mit Grund `max_output_tokens` wird als `news_output_truncated` erkannt; andere unvollständige Antworten als `news_output_incomplete`. Auch syntaktisch parsebares JSON aus einer unvollständigen Antwort wird nicht veröffentlicht. Die 40000-Zeichen-Grenze bleibt erhalten. Kosten werden vor dem Decodieren erfasst; keine verdeckte Wiederholung, keine Löschung alter Reserven.

Versionierter Patch: `docs/ops/patches/oracle-editorial-output-profile-20260907.patch`. Betroffene Backend-Dateien: `src/services/openaiWoekAi.ts`, `src/http/apiServer.ts` und die zugehörigen Tests.

## Produktiver Einbau

Am 7. September auf den tatsächlich laufenden Oracle-Quellstand angewendet, nicht durch Überschreiben mit einem älteren lokalen Backend. Aktuelle Parliament-, Bild- und Polls-Funktionen bleiben erhalten. Zuerst Patchprüfung, Typecheck, Tests und Build in einer Kopie des Live-Codes; dann Code-Backup und Code-only-Rückfallplan. Private Daten und `.env` blieben ausschließlich auf Oracle.

Remote-Releaseverzeichnis: `/home/ubuntu/woek-editorial-output-xsDhqQ`. Getestetes Artefakt: `tested-code.tgz`, SHA-256 `ca7564b3243bf5d9305dc51d149b28daaeb2be7c9c51d981520eb339566e19aa`.

Die drei Kosten-/Batchjournale waren beim Installationsvergleich unverändert. Dienst und Nachrichtentimer sind aktiv; anschließender lokaler Healthcheck auf Port 8787 liefert `ok: true`. Es wurde kein kostenpflichtiger Probeauftrag gestartet. Die tatsächliche Reduktion der Ablehnungen muss aus den folgenden regulären Läufen gemessen werden, nicht aus einem erfolgreichen Build behauptet werden.

## Tests

Prüfungen für vertrauenswürdiges Profil, manipulierte Body-/Headerwerte, unveränderte öffentliche Limits, Provider-Abschneiden, gültig aussehendes unvollständiges JSON, Zeichenlimit, Kostenübernahme und redigierte Fehlerantwort. Auf dem Live-Code-Staging bestanden 87 Tests in 18 Suites sowie Typecheck und Build. Zusätzlicher lokaler gezielter Vitest-Lauf: 41 Tests in vier Dateien (KI-Service, API, Batch, Polls) bestanden.
