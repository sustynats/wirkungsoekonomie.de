# Begrenzter API-Redaktionsprozess auf Oracle

Stand 13.09.2026. Die API bereitet native Bridge-Ausgaben vor. Discovery, Import,
Quellen-/Fakten-/MPD-Gates, unabhängiger semantischer Zweitpass und ACK bleiben
unverändert. Eine gelieferte Ausgabe ist noch keine Veröffentlichung.

## Betrieb

- Bestehender Faktencheck-API-Prozess, bestehender Schlüssel und beide vorhandenen
  Kostenjournale. Kein weiterer Provider, kein Vercel, keine Mac-Abhängigkeit.
- Private authentifizierte Route `/api/news-analysis/editorial-jobs`; Browser-Origin
  wird abgewiesen. Aktivierung nur über `NEWS_BRIDGE_API_ENABLED=true`.
- Oracle-Worker mit `api-processor-config.json` im bestehenden privaten
  Bridge-Verzeichnis: version 1, enabled, max_jobs_per_run 1..10,
  max_news_age_hours 1..24, news_only, excluded_job_ids. Pilot: news_only=true,
  höchstens fünf frische Aufträge. `--dry-run` erzeugt weder Claims noch API-Aufrufe.
- Gesonderter API-Read-/Write-Preflight, atomarer Dropbox-Claim, unveränderliche
  Ausgaben. Fremde Claims, ACKs und vorhandene Ausgaben bleiben unangetastet.
- SQLite-Prozesslock verhindert parallele Worker. Timer alle zehn Minuten, erst
  nach vollständigem Pilot aktivieren. Bei Fehlern vorhandenen Import und
  Discovery weiterführen; keine Sperren gewaltsam entfernen.
- Originales Nachrichtendatum bleibt erhalten; standardmäßig maximal sechs
  Stunden alte Ereignisse, jüngste zuerst innerhalb der bestehenden Prioritäten.
- Aktuelle Korrekturen und unabhängige Zweitprüfungen werden vor neuen Entwürfen
  abgeschlossen. Die bestehende Artikelprüfung läuft bereits vor der Übergabe
  und nochmals im Import. Dadurch geht konkretes Fehlerfeedback direkt in den
  begrenzten Korrekturlauf, ohne zusätzliche GitHub-Runde.
- Ein einziges natives News-Ausgabeformat; die Software ergänzt den Transport.
  Fertige Antworten bleiben nach der reinen Transportkorrektur des Wissensprofils
  wiederverwendbar, ausschließlich bei identischem Quellen-/Methodenmanifest.
  Originaler Request-Key, Usage und Rohantwort bleiben erhalten. Keine neue
  fachliche Bewertung durch bloßes Umbenennen oder automatische Score-Ergänzung.
- Versionierte fachliche Regeln und Quellenmanifest statt angenommener
  ChatGPT-Erinnerungen. Tatsachen nur aus mitgelieferten Quellenauszügen. Fehlende
  Recherche wird als HOLD sichtbar; keine Quellenlektüre erfinden.
- Modell gpt-5.4-mini, reasoning low, maximal 24.000 Ausgabetokens,
  maximal 150.000 UTF-8-Bytes Eingang, keine Tools/automatischen Provider-Retries.
  Beides passt in die bestehende Vorabreservierung. Tatsächliche Usage wird auch
  bei unbrauchbarem Ergebnis verbucht; Rohantwort bleibt privat gesichert.
- Dauerhafte Request-Keys ermöglichen GET-Wiederaufnahme ohne erneute Erstellung.
  Ungewisse Providerantworten sperren auch weitere Keys dieses Jobs. Insgesamt
  höchstens drei Provider-Aufrufe je Job, einschließlich aller Korrekturpfade.
- 5 EUR/Tag ist ein Effizienzziel, kein neuer Tagesstopp. Bestehende verbindliche
  Monatsfreigaben bleiben bestehen. Keine stillen Budgeterhöhungen.
- Personalisierte Formate nur über `editorial_request` und bestehende finale
  Freigabe. Der alte direkt publizierende `editorial_analysis`-Pfad ist gesperrt.

## Kostenabgleich und Rollback

Historische unbekannte Reservierungen dürfen nur mit einem verifizierten,
privaten Gesamtkostenexport abgeglichen werden. Der Abgleich erhält ursprüngliche
Einträge und Zähler, protokolliert eine separate aggregierte Korrektur und hält
mindestens die gemessenen Gesamtkosten einschließlich bestehender Steuer-/FX-
Reserve zurück. Keine angebliche Einzelabruf-Abrechnung und keine Löschung von
Kostenhistorie. Kein Abgleich bei nicht abgeschlossener Batch-/neuer Aktivität.
Beide Journale vor Änderung sichern; API kurz anhalten; beide Ergebnisse atomar
ersetzen; bei Fehler beide Originale wiederherstellen. Rechnung bleibt privat.

Vor Runtime-Wechsel Source-/Build-Hash prüfen, bisherige Runtime, Konfiguration
und Journale privat sichern. Nur getestetes, commitgebundenes Artefakt installieren.
Rollback: Worker-Timer anhalten, bisherigen Runtime-Build und Konfiguration
wiederherstellen. Nach bereits bezahlten Aufrufen niemals ein altes Kostenjournal
zurückspielen. Ergebnisse/Claims bleiben für sichere Wiederaufnahme gespeichert.

## Erfolgsnachweis

Nicht nur Dienststatus oder Output zählen: frischer Auftrag -> native Prüfung ->
getrennter Fachpass -> Import -> ACK -> tatsächlich abrufbare öffentliche URL.
`api-processor-health` ist ergänzende Betriebsinformation, kein Ersatz für
Publication Health. Ein einzelner Pilot belegt noch keinen stabilen Tagesbetrieb.

Pilotbefunde: Die erste API-Einstellung verbrauchte ihr Ausgabelimit vollständig
für internes Reasoning. Ein begrenztes Low-Profil liefert vollständige Antworten.
Konkurrierende Ausgabeformate verursachten anschließend Verschachtelungsfehler;
der Native-Vertrag und die frühe Artikelprüfung beheben diese Transportursache.
Ein generischer Validatorfehler verwechselte ausdrücklich gespeicherte
Pfadannahmen mit beobachteten Wirkungen. Er wurde separat mit Regressionstest
korrigiert; Aussagen im Artikel, in Begründungen und Outcomes bleiben geprüft.
HOLD, gelieferter Entwurf, unabhängige Prüfung und öffentliche Meldung werden
weiterhin getrennt gezählt. Nicht abgeschlossene Pilotfälle sind kein PASS.
