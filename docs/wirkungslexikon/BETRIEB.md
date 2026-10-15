# Wirkungslexikon: technischer Betrieb

Der redaktionelle V3-Master bleibt unverändert in der privaten Ablage. Im öffentlichen Git-Repository wird ausschließlich der ausdrücklich freigegebene Teilbestand `content/wirkungslexikon/published.json` geführt. Entwürfe, Änderungsjournale und Zugänge werden durch `.gitignore` ausgeschlossen.

## Redaktion und Vorschau

- `node scripts/wirkungslexikon/build.mjs` baut den geschützten Bestand unter `outputs/wirkungslexikon/preview`.
- `node scripts/wirkungslexikon/serve.mjs` startet ausschließlich auf der Loopback-Schnittstelle. Zugangsdaten stehen lokal unter `outputs/wirkungslexikon/access.json` und gehören weder ins Repository noch in die Dropbox-Übergabe.
- Die Redaktion bietet vollständige Kartenbearbeitung im JSON-Format, Quellenhinweise und Revisionen. Das normale Redaktionskonto kann keine neue Veröffentlichung freigeben. Änderungen an bereits freigegebenen Karten gehen zurück in den Review.
- Master und ursprüngliche Permalinks bleiben erhalten. Neue Karten können mit `editorial.mjs add <datei.json>` in den privaten Ergänzungsbestand aufgenommen werden.
- Jede Speicherung erhält Version, Datum, Bearbeitungsidentität, Begründung und ein Journal mit vorher/nachher. `editorial.mjs undo <ereignis-id>` erzeugt eine nachvollziehbare Rücknahme.

Ein eigener entfernter Redaktionsserver ist noch nicht eingerichtet. Eine Internet-Freigabe des Vorschauordners über einen ungeschützten Dateiserver ist unzulässig. Für einen späteren Oracle-Betrieb sind ein erreichbarer administrativer Zugang, TLS, individuelle Redaktionskonten, Backup und Wiederherstellungsprüfung nötig. Es gibt keine Vercel-Abhängigkeit.

## Rückmeldung von ChatGPT

`review-intake.mjs <datei.json>` prüft eine Lieferung mit `masterSha256` und vollständigen Kartenobjekten in `entries`. Mit `--stage` wird sie separat abgelegt. Das Verfahren übernimmt nichts in den aktiven Bestand, verändert keinen Prüfstatus und erteilt keine Freigabe. Die weitere Quellenprüfung und fassungsgebundene Entscheidung liegt bei Natalie Weber.

## Veröffentlichung

`release.mjs snapshot --expected-revision=<n>` exportiert nur bereits dokumentierte Freigaben. Das Skript kann keine neue Karte freigeben.

Der öffentliche Generator verwendet echte statische Permalinks. Auch ohne JavaScript sind vollständige Karten und eine A-Z-Liste lesbar. Client-JavaScript ergänzt Volltextsuche, Filter, Dialoge und die lokale Checkliste. Allgemeine Forschungsmechanismen, Wirkungspotenziale, dokumentierte Reaktionen und Ursachenattribution bleiben getrennt.

Social-Cards werden mit `render-social.mjs --public` aus Claudes HTML-Vorlage in drei Größen gebaut. Für Vorschauen tragen sie eine Entwurfsmarke. Playwright wird über `WL_PLAYWRIGHT` aufgelöst; die Browserdatei kann über `WL_CHROME_BIN` festgelegt werden. Das CI-Werkzeug wird isoliert installiert, ohne die Anwendungsabhängigkeiten zu verändern.

Die manuelle GitHub-Pages-Veröffentlichung bindet die erwartete Quellrevision, sichert das aktive Artefakt und ergänzt ausschließlich Lexikon, Navigation, Suchindex und Sitemap. Bestehende Artikelinhalte bleiben überprüfbar unverändert. Das vorherige Artefakt bleibt der Rückfallstand. Die 48 gesperrten Karten und beide Begleitartikel sind nicht Teil des öffentlichen Releases.

Öffentliche Quellenhinweise bereiten eine E-Mail an den bestehenden redaktionellen Kontakt vor; erst das E-Mail-Programm des Besuchers versendet sie. In der geschützten Vorschau werden Hinweise in der privaten Redaktionsablage gespeichert.

## Grenzen der technischen Prüfung

Ein bestandener Build oder Quellenlinktest ist keine fachliche Einzelbegutachtung. Automatische axe-Tests ersetzen keinen vollständigen Screenreader-Test. Unpräzise Quellenfundstellen, standardisierte Texte und offene Originalabgleiche bleiben redaktionelle Aufgaben. Es gibt keine automatische Personenbewertung, Wirkungs-Scores oder Social-Credit-Funktion.

Nach einer Speicherung werden unveränderte Social-Bilder beibehalten; geänderte oder zurückgezogene Fassungen verlieren ihre alten Bilder. Der lokale Server rendert fehlende Vorschau-Bilder neu. Dafür muss Playwright verfügbar sein (oder über `WL_PLAYWRIGHT` aufgelöst werden). Ein fehlgeschlagener Bildaufbau hebt die bereits gespeicherte Kartenrevision nicht auf; `socialImagesReady` im API-Ergebnis zeigt diesen Fall. Ein erneuter Aufbau ist mit `render-social.mjs --missing` möglich.
