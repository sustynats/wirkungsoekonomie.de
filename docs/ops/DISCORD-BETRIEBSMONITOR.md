# Betriebsmonitor und private Tagesberichte

Der Hintergrundprozess `.github/workflows/ops-discord-monitor.yml` prüft alle
15 Minuten die Hauptseite, Wirkungsticker, RSS, Akademie, Parlament, Institut,
Oracle-API und Push-Konfiguration. GitHub Schedule und der bereits bestehende
Oracle-Reserve-Taktgeber starten denselben serialisierten Job. Er benötigt
keinen geöffneten Browser, Codex oder eingeschalteten Nutzerrechner und ruft
keine kostenpflichtige KI auf. Keine Vercel-Deployments oder neuen Hostingdienste.

## Erkennung

- HTTP-Status plus erwarteter Seiteninhalt bzw. JSON-Vertrag; begrenzter Timeout
  und ein unmittelbarer technischer Wiederholungsversuch.
- Ein Ausfall wird nach zwei Beobachtungen im Abstand von mindestens fünf Minuten
  gemeldet. Ein einmaliger kurzer Verbindungsfehler erzeugt keine Direktnachricht.
- Seit über 45 Minuten kein abgeschlossener Nachrichtenlauf: sofortige Meldung.
- KI-Fehler, Quellenabrufprobleme, Budget-/Wechselkurssperre und eine seit über
  45 Minuten im Live-Feed fehlende, bereits geprüfte Aktenversion werden erkannt.
- Eine unveränderte Artikelzahl ist **kein** Ausfall. Zurückstellungen am
  Evidenz-/Relevanzgate werden gezählt, nicht ungeprüft veröffentlicht.
- Unveränderte bestätigte Störung bleibt still; Behebung erzeugt eine Entwarnung.
  Der tägliche Bericht nennt weiterhin offene Probleme.

Der Monitor läuft außerhalb Oracle und kann daher auch einen Oracle-Ausfall
melden. GitHub- und Discord-Ausfälle können Zustellung verzögern. Dies ist kein
Verfügbarkeitsversprechen; auch der Reserve-Taktgeber kann GitHub nicht ersetzen.
Push-Konfiguration ist nicht gleich nachgewiesene Zustellung auf jedem Smartphone.

## Tagesbericht

Einmal pro Berliner Kalendertag ab 08:00 Uhr (Zeitzone Europe/Berlin, inklusive
Sommer-/Winterzeit). GitHub kann den Start verzögern; der nächste Lauf holt den
Bericht nach. Enthalten sind Erreichbarkeit der genannten Seiten/Dienste,
Live-Aktenzahl, Erstveröffentlichungen gestern/heute, letzter Lauf, offene
Prüfungen, Quellenstatus und geschätzte KI-Kosten gestern/heute/im Monat.

USD-Werte stammen aus `data/news/usage.json`, dedupliziert nach Lauf-ID.
Euro-Umrechnung erfolgt nur mit ausreichend aktuellem gespeichertem EZB-Kurs,
einschließlich 19 % Steuerreserve. Die 25-EUR-Freigabe bleibt unverändert.
Historische fehlende Nutzungswerte, Higgsfield-Abo/Bildcredits und Hostingkosten
werden als fehlend/ausgeschlossen benannt. Es handelt sich nicht um eine Rechnung.

Besucher/Besuche, Installationen, tatsächliche aktive Push-Abonnements und
RSS-Nutzung sind in diesem Betriebsbericht noch nicht integriert. Fehlende
Messwerte werden niemals als null ausgegeben. Die Akademie-Analytics-Erweiterung
bleibt ein gesonderter, vom Vercel-Kostengate gesperrter Release.

## Private Zustellung und Zustand

Repository-Secrets `WOEK_MONITOR_DISCORD_BOT_TOKEN` und
`WOEK_MONITOR_DISCORD_USER_ID` konfigurieren den vorhandenen WÖk-Discord-Bot und
den ausdrücklich angegebenen Empfänger. Kein öffentlicher Kanal, kein Webhook-
Fallback. Weder Token noch Nutzer-ID werden ins Repository oder in Logs geschrieben.
Die Discord-DM-API entspricht dem bestehenden Benachrichtigungsweg der Apps.

`codex/ops-monitor-state:monitor-state.json` enthält nur aggregierte Betriebs-
zustände, Tagesdatum und ausstehende Nachrichten ohne private Nutzerinformationen.
Der Prozess schreibt niemals auf `main`. Er persistiert die Outbox **vor** dem
Versand und entfernt Einträge erst nach erfolgreichem HTTP-Ergebnis. Eine stabile
Discord-Nonce reduziert doppelte Zustellungen bei einem unklaren Netzwerkfehler;
bei einem Absturz zwischen Versand und Bestätigung ist exakt-einmalige Zustellung
nicht unter allen Umständen garantiert. Fehler bleiben im GitHub-Job sichtbar.

## Prüfung und Betrieb

```sh
node --test tests/ops/discord-monitor.test.mjs
node scripts/ops/discord-monitor.mjs --dry-run
gh workflow run ops-discord-monitor.yml --ref main -f report_now=true
```

Dry-run prüft echte öffentliche Ziele, versendet nichts und schreibt keinen
Zustand. Der manuelle Bericht übergeht nur die Uhrzeit, nicht die Tagessperre.
Workflow und Oracle-Clock werden gemeinsam überwacht; die letzten tatsächlichen
Ausführungen sind in GitHub Actions nachvollziehbar. Keine Rohdaten von Besuchern,
Push-Endpunkten oder Discord-Nutzern in diesem öffentlichen Zustandszweig.
