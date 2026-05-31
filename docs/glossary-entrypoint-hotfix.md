# Glossary Entrypoint Hotfix

Stand: 2026-05-31

## Anlass

Nach der Glossar-Wiederherstellung waren die vollständigen Begriffsdetailseiten zwar unter `/begriffe/` vorhanden, der öffentliche Einstieg `/glossar.html` zeigte aber weiterhin den alten kleinen Glossar-Hub. Dadurch wirkten neuere Begriffe wie `Salienz` oder `Kognitive Dissonanz` für Nutzer:innen weiterhin verloren.

## Korrektur

- `/glossar.html` wird als Legacy-Einstieg auf den vollständigen Begriffshub `/begriffe/` geführt.
- `/glossar/` wird ebenfalls auf `/begriffe/` geführt.
- Alte Anker nach dem Muster `/glossar.html#begriff-{slug}` werden clientseitig auf `/begriffe/{slug}/` weitergeleitet.
- Navigation und Footer verweisen für `Glossar` auf `/begriffe/`.
- Der alte vollständige Graph bleibt unter `/begriffe/` die führende Glossar-Infrastruktur.

## Stichprobe

Lokal geprüft:

- `/begriffe/salienz/` existiert.
- `/begriffe/kognitive-dissonanz/` existiert.
- `/begriffe/` enthält `Salienz`.
- `/begriffe/` enthält `Kognitive Dissonanz`.
- `assets/js/glossaryTerms.js` enthält beide Begriffe.
- `assets/search/search-index.json` enthält beide Begriffe.

## Verifikation

- Build ausgeführt: erfolgreich.
- Lokaler Linkcheck nach enger Commit-Bereinigung: 150897 Links, 0 fehlende Ziele.
- Suche geprüft: 6656 Einträge, bestanden.
- Größencheck geprüft: 757.4 MB, bestanden.
- Glossar-Routen-Audit ausgeführt: bestanden.
- Glossar-Hover-Audit ausgeführt: bestanden.
- Glossar-Crosslink-Audit ausgeführt: bestanden.
- Glossar-Coverage-Audit ausgeführt: bestanden.
- Glossar-Regression gegen Baseline: 1145 Begriffe, 1447 Detailseiten, 1145 Hover-Einträge, Ergebnis OK.

## Offener Punkt

Die aktuelle technische Baseline enthält 1145 veröffentlichte Begriffe und 1447 Detail-/Alias-Seiten. Wenn es nach dieser Baseline noch nicht inventarisierte spätere Begriffsstände gab, müssen diese aus Git-Branches, lokalen Sicherungen oder externen Entwürfen separat forensisch gesucht und kontrolliert ergänzt werden.
