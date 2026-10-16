# Wirkungslexikon: V9-Staging

V9 ergänzt den unveränderten V3-Korpus (180 IDs/Slugs) um versionierte V8-Entwürfe,20 Narrativfamilien und21 getrennte Programm-Dossiers. Kein Produktivdeploy und keine übernommenen pauschalen Freigaben. Publikationspolicy ist deaktiviert; PR1072 bleibt historischer V3-Entwurf.

Aktiver Arbeitscheckout: `outputs/wirkungslexikon/release-repo`, Branch `codex/wirkungslexikon-v9-staging-20261016`. Private Daten und Nachweise liegen unter `outputs/wirkungslexikon/v9/`; keine dieser Dateien in Git aufnehmen. Vollständige Übergabe zusätzlich im tatsächlich synchronisierten Dropbox-Pfad `WOEK/Wirkungslexikon/Umsetzung_V9/`.

```sh
node scripts/wirkungslexikon/v9-import.mjs /absoluter/pfad/zum/V9-Paket
node scripts/wirkungslexikon/v9-build.mjs
node scripts/wirkungslexikon/v9-build.mjs --public
node scripts/wirkungslexikon/v9-test.mjs
node scripts/wirkungslexikon/v9-golden-test.mjs
WL_VERSION=9 WL_PORT=8799 node scripts/wirkungslexikon/serve.mjs
node scripts/wirkungslexikon/v9-browser-test.mjs
```

Import ist nur bei leerem Store möglich. `--public` erzeugt ohne Freigabe ausschließlich eine lokale Negativprobe mit0 Karten. Die lokale Vorschau verlangt Authentifizierung für HTML,Daten,Assets und API und bindet an Loopback. Der bestehende gemeinsame Website-Renderer und die Claude-Komponenten bleiben aktiv. Globaler Einstieg über Footer und ergänzende Für-wen-Teaser.

Freigaben benötigen signierte, personengebundene Entscheidungen auf einer exakten Revision; Kernfunktionen werden nur mit synthetischen Testidentitäten geprüft. Die echte Natalie-Kontozuordnung und der abschließende Produktionsadapter sind noch offen und deshalb gesperrt. Kein technisches Konto kann die fehlende Zuordnung ersetzen. Artikel bleiben eigenständige Entwürfe bis nach verifiziertem Lexikon-Livegang und separater Freigabe.

V9-Webtexte, Quellenvorschläge und Originale bleiben privat. Vollständige Berichte mit Quellenlücken, allen Claude-Prüfpunkten, Testgrenzen, Originalhashes und tatsächlichen lokalen URLs befinden sich in der privaten Übergabe. Kein abgeschlossener wissenschaftlicher Vollreview und keine WCAG-Zertifizierung aus automatisierten Tests ableiten.
