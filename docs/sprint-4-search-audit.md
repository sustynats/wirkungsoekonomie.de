# Sprint 4 Search Audit

Stand: 2026-05-22.

## Umgesetzt

- Suche um Live-Vorschläge während der Eingabe erweitert.
- Trefferanzahl bleibt im Statusfeld sichtbar.
- Ergebnisvorschau bleibt über Titel, Auszug, Typ, Tags und Link erhalten.
- Filter erweitert:
  - Alle
  - Seiten
  - Glossar
  - Wissenskarten
  - Anwendungen
  - Zielgruppen
  - Akademie
  - Evidenz
  - Downloads
  - Audio
- Formatfilter um `Wissenskarte` ergänzt.
- Synonyme ergänzt bzw. gesichert:
  - Grundeinkommen -> Wirkungseinkommen
  - Rente -> Wirkungsrente
  - ESG -> WÖk vs ESG
  - Quellen -> Evidenz
  - KI -> Automatisierung / Wirkungseinkommen / Kondratieff
  - Kapital -> Wirkungskapital
  - Steuer -> Wirkungssteuer
  - Medien -> Wirkung politischer Sprache
  - Unternehmen -> wirkungsorientiertes Management
  - Gesundheit -> Gesundheit als Systemwirkung

## Technische Umsetzung

- `assets/js/search.js` auf Version `20260522-sprint4-tools`.
- Suchindex berücksichtigt Wissenskarten aus `/content/wissen/wissenskarten.json`.
- Keine externe API-Abhängigkeit.

## Offene Punkte

- Vorschläge können in Sprint 5 stärker gewichtet werden.
- Suche kann später mit echter Pagefind/Lunr/Fuse-Indexierung ersetzt oder ergänzt werden.
