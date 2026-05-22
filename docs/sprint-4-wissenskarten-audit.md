# Sprint 4 Wissenskarten Audit

Stand: 2026-05-22.

## Umgesetzt

Neue Datei:

- `/content/wissen/wissenskarten.json`

15 Wissenskarten angelegt:

1. Wirkung
2. Wirkungspotenzial
3. positive Netto-Wirkung
4. Wirkungsbewertung
5. Wirkungsrückkopplung
6. Wirkungslenkung
7. Wirkungsarchitektur
8. WÖk-ID
9. Scorecard
10. Reverse Merit Order
11. SDG+
12. Wirkungskapital
13. Wirkungseinkommen
14. Wirkungsrente
15. Wirkungskompetenz

## Struktur je Karte

- Titel
- Kurzantwort
- Ein Satz
- Warum wichtig?
- Wirkungspfad
- Beispiel
- zentrale Begriffe
- verwandte Seiten
- Quellenbasis
- Status

## Einbindung

- Kompass kann Karten über `kompass.html?karte=<id>` öffnen.
- Suchindex baut Wissenskarten als Typ `Wissenskarte` und Bereich `Wissenskarten` ein.
- Suche kann nach Wissenskarten filtern.

## Offene Punkte

- Eigene HTML-Detailseiten für Karten sind möglich, aber im MVP nicht nötig.
- Glossar-Anker können noch granularer verbunden werden.
