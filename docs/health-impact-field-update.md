# Gesundheits-Wirkungsfeld: Änderungsnotiz

Stand: 2026-06-01

## Ziel

Gesundheit wurde als zentrales Wirkungsfeld sichtbar gemacht, ohne das bestehende Portal `Gesundheit & Pflege`, dessen Dossiers, Tools oder alte Routen zu ersetzen.

## Neue oder sichtbarere Routen

- `/wirkungsfelder/gesundheit/` als zentrale Einstiegs- und Masterseite.
- `/wirkungsfelder/gesundheit-pflege/` bleibt als bestehendes Vertiefungsportal erhalten.
- `/journal/gesundheit-erzeugen-statt-krankheit-verwalten/` als vorbereiteter Journalbeitrag.
- `/journal/` als ergänzender Einstieg für neue Journalrouten; alte Blog-/Journalrouten bleiben erhalten.

## Glossar-Ergänzungen

Neue oder abgesicherte Detailseiten wurden für Gesundheits-, Digitalisierungs- und Eigentumsbegriffe ergänzt, damit relatedTerms nicht ins Leere zeigen. Dazu gehören unter anderem `Gesundheitswirkung`, `Gesundheitskasse`, `Präventionsökonomie`, `Krankheitssystem`, `Gesundheitssystem`, `Gesundheitsdividende`, `Pflege als Wirkleistung`, `Gesundheit`, `Digitalisierung`, `Künstliche Intelligenz`, `Robotik`, `Automatisierung`, `Wirkungsdatenräume`, `KI-Governance`, `Algorithmische Fairness`, `Automatisierungsdividende`, `Digitale Selbstbestimmung`, `Maschinenwertschöpfungsbeitrag` und `Wirkungspflicht des Eigentums`.

## Prüfungen

- Build: `npm run build`
- Link-/Suchindexcheck: `npm run check:links`
- Glossar-Hover: `npm run check:hover-definitions`
- Glossar-Alphabet/Duplikate: `npm run check:glossary`
- Glossar-Routen-Audit: 0 fehlende Detailseiten
- Glossar-Crosslink-Audit: 0 fehlende relatedTerms-Ziele
- Glossar-Regression: OK gegen Baseline

## Offene Hinweise

- Das bestehende Portal `Gesundheit & Pflege` enthält bereits umfangreiche Unterseiten, Tools, Konzept- und Dossierstrukturen. Ein separates Gesundheitsdossier ist fachlich nicht zwingend nötig, solange `/wirkungsfelder/gesundheit/` als Einstieg und `/wirkungsfelder/gesundheit-pflege/` als Vertiefung zusammenspielen.
- Die Build-Pipeline regeneriert viele HTML-Dateien. Relevante Quellen sind die Generatoren und Registries; generierte Dateien wurden nur zur statischen Auslieferung aktualisiert.
