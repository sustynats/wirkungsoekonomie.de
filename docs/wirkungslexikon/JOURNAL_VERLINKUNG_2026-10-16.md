# Begleitartikel im Journal verlinken

Natalie Weber bestätigte am 16.10.2026 die bereits erfolgte Veröffentlichung des Begleitartikels. Der kanonische Beitrag ist unter https://wirkungsoekonomie.de/blog/wirkungslexikon-politische-sprache-was-worte-vorbereiten.html erreichbar. Titel, Titelbild und Veröffentlichungsdatum wurden an der ausgelieferten Seite abgeglichen.

Der vorhandene Journal-Teaser in der aufklappbaren Lexikon-Einleitung zeigt den veröffentlichten Titel und einen direkten Leselink. `publication-policy.json` hält den bestätigten Status und die Linkmetadaten fest; `build.mjs` übergibt diese an die gemeinsame statische und clientseitige Darstellung. Die manuelle Veröffentlichung des Artikels wird lediglich referenziert. Es gibt keine automatische Artikelveröffentlichung und keine Änderung am Artikeltext, an seiner PDF oder an der LinkedIn-Vorlage.

Geprüft: öffentlicher Build mit 180 Karten und 540 Socialbildern, 19 gezielte Bestands-/Beispiel-/Deploymenttests, neun vollständige Website-Integrationsprüfungen sowie Titelbild, Tastatur-Link und Artikelaufruf bei 390 und 1440 px. Der Link ist auch ohne JavaScript vorhanden; keine seitlichen Überläufe, JS-Fehler oder axe-Verstöße am Teaser. Der Journalartikel ist im integrierten Gesamtartefakt bytegleich zum gesicherten Produktionsstand. Karten-JSON und alle 540 bestehenden Socialbilder sind unverändert.

Auslieferung über den vorhandenen manuellen GitHub-Pages-Prozess und das unveränderliche Komponentenartefakt `wirkungslexikon-v10-20261016-journal-r4`. Vor der Veröffentlichung wird der dann aktive Gesamtbestand erneut gesichert und ergänzt; die bestehende Prüfung gegen eine zwischenzeitlich veränderte Produktionsbasis bleibt aktiv. Kein Vercel-Einsatz.

Maschinenprotokolle, SHA-256-Prüfsummen und abschließender Live-Nachweis werden in der privaten Übergabe `Journal_Verlinkung_2026-10-16` unter Dropbox `/WOEK/Wirkungslexikon/` abgelegt.
