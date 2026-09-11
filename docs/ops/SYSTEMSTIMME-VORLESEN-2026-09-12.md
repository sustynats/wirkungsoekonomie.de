# Vorlesen mit lokaler Systemstimme

Stand: 12.09.2026. Nutzerentscheidung: zunächst Systemstimme; kein eigener Stimmklon.

## Verhalten

Nachrichten, Meinung & Analyse, Buch- und Medienbesprechungen sowie passende Journal-/Wissensartikel erhalten über `assets/js/main.js` denselben Vorlese-Button. Bestehende und neue Beiträge verwenden dieselbe Erkennung ihrer Artikelstruktur. Feed, Suche, Navigation, Administration und private Notizen werden nicht vorgelesen. Inhalte und redaktionelle Freigaben werden nicht verändert.

Der Button startet erst nach einem Klick. Pause/Fortsetzen, nächster Abschnitt, Beenden, lokale Stimmen der Beitragssprache und vier Tempostufen stehen bereit. Während der Wiedergabe bleibt die Steuerung über der mobilen Navigation erreichbar. Bedienelemente sind mindestens 44 Pixel hoch. Der aktuelle Textabschnitt wird markiert; Status und Schaltflächen bleiben als Text zugänglich.

`SpeechSynthesisVoice.localService === true` ist Voraussetzung. Es gibt keinen entfernten TTS-Fallback, keinen Mikrofonzugriff, keinen Audioupload und keinen neuen Serverdienst. Fehlen API oder lokale Stimme, zeigt die Oberfläche eine Erklärung. Geräte können zusätzliche Stimmen in ihren Spracheinstellungen benötigen.

## Erschließung

- Überschrift, Einleitung und Artikeltext werden in Lesereihenfolge verarbeitet.
- Tabellen: Spaltenüberschrift plus Zellinhalt je Zeile. Bei verbundenen Zellen wird die Einschränkung angesagt und die Reihenfolge der Zellen beibehalten; keine Spaltenzuordnung erfinden.
- Grafiken: vorhandene Beschreibung bzw. Alternativtext, keine automatische Interpretation.
- Geschlossene Zusatzabschnitte werden ausgelassen. Vor dem Start geöffnete Abschnitte werden mitgelesen. Frühere eingeklappte Fassungen werden dadurch nicht mit der aktuellen Fassung vermischt.
- Lange Texte werden in kurze Passagen zerlegt. Fortsetzen wiederholt die letzte kurze Passage, weil native Pause/Fortsetzen je nach Browser unzuverlässig ist.
- Seitenwechsel beendet die Wiedergabe. Wechsel in den Hintergrund pausiert. Bildschirm-Sperre und Hintergrundwiedergabe wie bei einem Podcast werden nicht zugesagt.

## Änderung und Auslieferung

Neue gemeinsame Dateien: `assets/js/read-aloud.js`, `assets/css/read-aloud.css`. Zentraler Ladeaufruf in `assets/js/main.js`. Der Ticker-Generator verwendet einen neuen Versionsparameter für dieses Skript; 393 generierte Seiten ändern ausschließlich diesen Parameter. Inhaltsdaten und Analysepipeline bleiben unverändert. Keine neue Infrastruktur, kein Vercel-Build.

## Verifikation

- `npm run news:test`: 1.039 Tests bestanden, einschließlich acht neuer Controller-/Datenschutztests.
- `tests/news/read-aloud.browser.fixture`: zwölf DOM-/Bedienungstests bestanden, einschließlich Tabellen, später verfügbarer Stimmen, fehlender lokaler Stimme, Feed-Ausschluss und Ausschluss privater Notizen.
- Browser mit echter lokaler deutscher Systemstimme: Start meldet `speechSynthesis.speaking = true`, Pause stoppt; die Steuerung bleibt bedienbar.
- Ansichten: 320 und 390 Pixel sowie Desktop geprüft; keine horizontale Überbreite, Bedienelemente mindestens 44 Pixel. Aktiver Player und mobile Navigation überlagern einander nicht.
- Beispielseiten: Europa-Analyse mit Tabellen, Sumy-Nachricht, Buchbeitrag, Nachgesehen, Journalartikel; Newsfeed bleibt ohne Vorlese-Button.
- `npm run news:build`, `npm run news:validate`, `npm run typecheck` bestanden.
- `npm run lint` erfolgreich; 25 vorhandene Sprach-Audit-Funde unverändert. Keine neuen Funde durch diese Funktion.
- Kein Test auf einem physischen iPhone. Stimmqualität hängt von den installierten Stimmen des jeweiligen Geräts ab.

Browsertests lokal: Die HTML-Testdaten in `tests/news/read-aloud.browser.fixture` mit einem lokalen HTTP-Server als `text/html` bereitstellen. Ergebnis steht in `window.__readAloudTestResults`. Das Testverzeichnis ist vom öffentlichen Release-Artefakt ausgeschlossen; die Fixture ist keine Website-Seite und gehört nicht in deren Suchindex oder Inhaltsaudit.

Beispiel aus dem Repository-Stamm:

```sh
python3 -c 'from http.server import HTTPServer, SimpleHTTPRequestHandler; SimpleHTTPRequestHandler.extensions_map[".fixture"]="text/html"; HTTPServer(("127.0.0.1", 18937), SimpleHTTPRequestHandler).serve_forever()'
```

Dann `http://127.0.0.1:18937/tests/news/read-aloud.browser.fixture` öffnen. Die Tickerseiten und Suchpartitionen werden beim Release mit den aktuellen Nachrichten aus den bestehenden Generatoren gebaut; dieses UX-Paket schreibt keinen veralteten Nachrichten-Snapshot zurück.
