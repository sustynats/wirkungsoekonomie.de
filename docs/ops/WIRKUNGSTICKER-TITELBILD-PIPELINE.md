# Automatische Titelbilder – Betrieb und Grenzen

Stand: 4. September 2026. Ergänzt Claudes Designvertrag in
`WIRKUNGSTICKER-TITELBILD.md`; dessen Renderer, Safe Areas und beide Modi bleiben
die Grundlage. Nutzerfreigabe: bestehendes Higgsfield-Abo, Nano Banana Pro,
anschließend ausdrücklich auch Bilder für bereits veröffentlichte Akten.

## Ablauf ohne lokalen Rechner

1. Der vorhandene GitHub-/Oracle-Tickerlauf prüft Nachrichten und Belege.
2. Erst nach bestandenem Gate wählt `title-image/policy.mjs` den Bildmodus.
3. `pipeline.mjs` ruft die geschützte Oracle-Route `/api/news-title-image` auf.
   Sie verwendet den bestehenden News-Admin-Bearer. Keine öffentliche Generierung.
4. Oracle startet ausschließlich die offizielle CLI, persistiert Auftrag und
   Original, prüft das Bild und liefert freigegebene Bildbytes zurück.
5. Der Runner rendert OG 1200×630, Website 1200×675 und Square 1080×1080 mit
   eingebetteten Markenfonts. Chrome ist im Workflow auf 152.0.7977.82 festgelegt;
   der Renderer nutzt das dokumentierte DevTools-Protokoll, ein frisches Profil
   und ausschließlich eingebettete Daten. Kein externes Browser-Navigieren.
6. Original und drei PNGs werden unveränderlich in GitHub Releases gespeichert.
   Erst danach werden Referenzen in `data/news/stories.json` und öffentliche
   Seiten/Feeds geschrieben. Hash/Fingerprint verhindert erneute Generierung.
7. Der bestehende Pages-Workflow veröffentlicht. Bildänderungen aktualisieren
   die App-Daten, erzeugen aber keine neue Nachrichten-Push-Meldung.

Es gibt keinen Codex-/Mac-Scheduler und keine zusätzliche Vercel-Laufzeit.

## Modus und Bildprüfung

Editorial erhält eine individuelle, bereits geprüfte neutrale Nachricht als
Kontext. Safe Areas, textfreier Hintergrund, keine Personen, Logos, Karten,
Charts oder Nachstellungen realer Ereignisse sind feste Promptregeln. Bei
sensiblen/unklaren Themen wird ohne Bildauftrag die Wirkungskarte gewählt.
Die Moduswahl ist konservativ, aber keine Garantie für vollständige semantische
Erkennung. Das Ergebnis ist immer als Symbolbild bzw. WÖk-Einordnung gekennzeichnet.

Originale müssen PNG/JPEG/WebP sein, mindestens 1200 Pixel breit, höchstens
12 MiB und 34 Megapixel groß. Downloads haben HTTPS-/Host-/IP-/Redirect-Grenzen.
Tesseract prüft die Originaldatei auf gut erkennbare Schrift. Gate `text-free-2`
sperrt sichere Treffer sofort; unsichere Treffer müssen in einer zweiten
Segmentierung bestätigt werden. Ein Prüferausfall bleibt geschlossen. Nach
einem Gate-Update wird dasselbe gespeicherte Original erneut geprüft, niemals
dafür neu generiert. OCR erkennt nicht jede denkbare Bildabweichung.

Der erste echte Test (2 Credits) enthielt unerwünschte Wörter und wurde gesperrt.
Er wird nicht veröffentlicht oder kostenpflichtig durch ein „schöneres“ ersetzt.
Prompt v2 vermeidet die zuvor missverständlich ausgelegten Platzhalterbegriffe.

Fallback: Editorial → Wirkungskarte → bestehendes statisches OG-Bild.
Eine Bildstörung darf keine Nachricht verwerfen. Befristete Rückstellungen werden
im normalen Lauf wiederaufgenommen, fachlich gesperrte Motive nicht neu erzeugt.

## Server, Authentifizierung, Reproduzierbarkeit

- Anwendung: `/opt/faktencheck-bot`, Dienst `faktencheck-bot`, Benutzer `ubuntu`.
- Adapter: `news-media/scripts/news/title-image/higgsfield.mjs` mit `policy.mjs`,
  `image-file.mjs`, `quality.mjs`, `config.json`, `index.mjs`, `text.mjs`,
  `font-metrics.json` und dem gemeinsamen `../visuals.mjs`.
- Installer: `install-higgsfield.mjs --directory=/opt/faktencheck-bot/news-media/bin`.
  Offizielle CLI **1.1.24**, Archive und SHA-256 in `config.json`, niemals `latest`.
- Modell: authentifiziertes Schema `nano_banana_pro`, Anzeigename Nano Banana Pro;
  16:9, 2k; vor jedem neuen Auftrag muss die offizielle Kostenauskunft ≤2 Credits sein.
- OAuth-Konfiguration: `/home/ubuntu/.config/higgsfield/`, 0700; Dateien 0600.
  Offiziell erzeugte Credentials wurden über SSH übertragen, nicht in Git/CI.
- Journal/Originale/Reservierungen: `/opt/faktencheck-bot/data/news-title-images/`.
- Systemd-Drop-in: `oracle-higgsfield.conf`; die vorhandene `.env` bleibt erhalten.
- Ubuntu 24.04: `tesseract-ocr=5.3.4-1build5`, `tesseract-ocr-eng=1:4.1.0-2`.
- Backendänderung: `patches/oracle-title-images-20260904.patch`. Vor Anwendung
  Backup und Abgleich mit aktuellem Serverstand; fremde Änderungen bewahren.
  Ausgangs-SHA-256 API: `41cb304971956f6436672cd24c87c68c5b4c368609986fd2a4ac8402695fc6b1`,
  index: `49e581605bc41a87b4d879088a90b569a7772e063c374ec5ae2e83035ef7c789`.

Offene Anbietergrenze: Die CLI speichert den offiziellen OAuth-Login und verwaltet
seine Tokens. Dauerhaft unbeaufsichtigtes Refresh-Verhalten ist vom Anbieter noch
nicht verbindlich geklärt ([offizielles Issue #47](https://github.com/higgsfield-ai/cli/issues/47)).
Bei Ablauf: 15-Minuten-Circuit-Breaker und Wirkungskarten; Nachrichten laufen weiter.
Eine erforderliche erneute Anmeldung kann nicht ohne den Kontoinhaber erfunden
oder mit Website-Cookies umgangen werden. Keine Garantie „nie wieder einloggen“.

## Kosten, Wiederholungen, Laufzeiten

Ein aktiver Generierungsauftrag serverweit, zusätzlich dateibasierte Sperre.
Private Reservierung **vor** dem Create; unbekannter Ausgang wird anhand eindeutig
passenden Modell-/Prompt-/Zeitdaten aus der offiziellen Auftragsliste geklärt.
Es wird nie blind erneut Create ausgeführt. Bekannte Jobs werden nur abgefragt.
Timeout/Downloadfehler: begrenzte Wiederholung mit Backoff. Kein Nachkauf von Credits.

Konservative eigene Grenzen in `config.json`: 1 neuer Bildversuch je Normallauf,
20 Generierungen/UTC-Tag, 600 Credits/UTC-Monat, höchstens 2 Credits/Bild. Das ist
eine Obergrenze innerhalb vorhandener Credits, keine Zusage zusätzlicher Ausgaben.
Sie ist unabhängig vom unverändert maximal 25-EUR-Nachrichten-KI-Budget.

Nachrichten: bis 12 KI-Kandidaten/Lauf und 48 Aufrufe/rollender Stunde, seriell und
mit unverändertem Monatsgate. KI-Zeitbudget 7 Minuten, Bilder 4 Minuten; Rest wird
dauerhaft vertagt. Der Workflow hat eine äußere 35-Minuten-Sicherheitsgrenze.
Ein rotes Quellen-/KI-Health-Gate bleibt sichtbar; Teilresultate werden vorher gesichert.

## Backfill und Regeneration

```sh
npm run news:title-images:backfill -- --dry-run --limit=20
npm run news:title-images:backfill -- --execute --limit=20
npm run news:title-images:backfill -- --execute --render-only --limit=20
```

Standard ist Dry-run. Der bestehende Workflow besitzt die expliziten Dispatch-
Eingaben `title_images_backfill=true` und `title_images_limit=20`. Er markiert nur
die ausgewählte Menge bestehender Akten. Nach dem vierminütigen Backfill-Zeitbudget
beendet der normale servergestützte Tickerlauf die markierte Restmenge schrittweise.
Keine automatische Generierung für die gesamte Historie bei jedem Build.
`--render-only` nutzt gespeicherte Originale ohne neue Generierung.

Referenzen: Originale und Titelbilder unter Release-Tag `wirkungsticker-media-YYYY-MM`;
Dateinamen enthalten Story-ID, Hash/Fingerprint und Ausgabeformat. Keine Überschreibung:
bereits vorhandene Assets müssen Größe und SHA-256 bestätigen. Interne Prompts,
Journalpfade und Providerantworten sind nicht im öffentlichen JSON enthalten.
Große Bilder liegen nicht im Website-Git und nicht auf Vercel.

## Abnahme

`npm run news:test`, `npm run news:build`, `npm run news:validate`; zusätzlich reale
Rasterisierung aller Formate, schmale Browseransichten, App-Rücknavigation und
Release-/Live-Prüfung. Server: Typecheck, API-Tests, Build, `/healthz` 200,
Bildroute ohne Token 403, authentifizierter Modell-/Kontotest ohne Generierung.

Der Quellenbereich beschreibt öffentlich Belege, Interessen und Prüfgrenzen.
Keine Abos/Agentur-APIs zu kaufen ist eine interne Kostenregel: weiterhin nur
freie zulässige Zugänge, keine Paywall-Umgehung und keine Drittanbieter-Umgehung.

### Linux-Nachprüfung vom 4. September 2026

Der erste Produktions-Backfill deckte einen Linux-spezifischen Cleanup-Race auf:
Chrome-Hilfsprozesse schrieben noch ins temporäre Profil; `ENOTEMPTY` im `finally`
verwarf dadurch bereits fertig gerenderte PNGs. Die Reparatur beendet ausschließlich
die eigens gestartete Prozessgruppe und räumt mit begrenzten Wiederholungen auf.
Ein verbliebener Cleanup-Fehler wird gemeldet, aber vernichtet kein Bildergebnis.
Der neue echte Linux-/Chrome-Test prüft beide Modi und alle drei Ausgabegrößen,
ohne Higgsfield-Aufrufe oder Credits. Gespeicherte Originale werden wiederverwendet.

Umfangreiche Nachrichtencluster halten außerdem bereits im Client das 40.000-
Zeichen-Limit der Oracle-Analyse ein: Quellenidentitäten, Claims und Provenienz
bleiben vollständig erhalten; bei Bedarf werden unveränderte Belegsegmente
gleichmäßig ausgewählt und ausdrücklich als unvollständige Auswahl gekennzeichnet.
Reicht selbst das nicht, wird vor einem kostenpflichtigen Request zurückgestellt.
