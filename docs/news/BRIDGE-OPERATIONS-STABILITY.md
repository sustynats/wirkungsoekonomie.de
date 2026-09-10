# Bridge-Betrieb: Wiederaufnahme und Status

Stand: 2026-09-10. Textverarbeitung bleibt in ChatGPT, Bildrendering bei Bedarf bei Higgsfield. Kein Text-API-Fallback.

- Discovery bleibt :05/:20/:35/:50, ChatGPT HH:00, Output-Polling alle fünf Minuten. Manuelle Aktionen benutzen dieselben Lanes und Daten.
- Vollständige erfolgreiche Quellpakete werden privat in Oracle zwischengespeichert. Ein abgebrochener GitHub-Lauf verliert dadurch keine noch nicht eingereihten Funde. Cache-Frequenz entspricht der Source Registry; geänderte Quellenkonfiguration invalidiert den Cache. Ein 304 erhält vorhandene Funde. Der Cache ist kein Seen-Checkpoint und keine zweite Warteschlange.
- Normales Warten ist `PROCESSING_PENDING`. Überalterung eines Claims beginnt mit seiner tatsächlichen Beobachtung, nicht mit der Anlage des Jobs. Erst mehr als zwei Stunden sind auffällig. Ein ausdrücklich neuer Repair-Claim erhält eine eigene Beobachtung; Alter allein setzt keinen Claim zurück.
- Elternaufträge mit ausstehendem unabhängigem Fachprüfauftrag gelten nicht als verspäteter Import. Das Output des Prüfauftrags weckt denselben Importer. Ungeklärte Fachprüfung wird separat gemeldet; andere Aufträge bleiben unabhängig verarbeitbar.
- Fertiges, unmittelbar importierbares Output wird ab zehn Minuten als verspätet gemeldet. Die erste Erkennung bleibt unverändert. Bei einer neuen Korrekturgeneration wird der vorige Erkennungszeitpunkt im privaten Journal erhalten.
- Explizite Dropbox-429-Antworten erhalten höchstens zwei kurze unmittelbare Wiederholungen. Größere Wartefenster sowie 429/5xx beim Tokenabruf oder der Auftragsverarbeitung werden dauerhaft terminiert: 5, 10, 20, 40, höchstens 60 Minuten, mit längerem `Retry-After`, falls verlangt. Kein endloser synchroner Retry und kein blindes Replay einer unklaren Schreibantwort.
- Vorübergehend verweigerte Repair-Übertragungen bleiben derselbe Auftrag mit unveränderter Fehlerhistorie. Redaktionelle Korrekturen selbst bleiben auf zwei Versuche begrenzt. Hash-/Inhaltskonflikte bleiben gesperrt.
- Per-Job-Warteschlangenhinweise bleiben im Laufbericht als `attention` sichtbar, machen aber keinen unabhängig abgeschlossenen Import zum fehlgeschlagenen Serverlauf. Nicht erreichbare Dropbox, unvollständige Läufe und Text-API-Aufrufe bleiben Fehler. Einzelne Publication Gates werden nicht gelockert.
- Discord unterscheidet Zugriff, Discovery, tatsächliche Claims, fertige Imports, Fachprüfung und Quarantäne. Normale Wartezeit erzeugt keinen Alarm; bestehende Incident-Deduplizierung bleibt erhalten.

Regressionen: `bridge-monitor.test.mjs`, `dropbox-bridge.test.mjs`, `discovery-cache.test.mjs`, `source-run-health.test.mjs`, `discord-monitor.test.mjs`. Änderungen werden erst nach Integration mit dem Wirkungsmodell 2.0 produktiv gesetzt.
