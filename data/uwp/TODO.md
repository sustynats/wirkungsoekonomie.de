# UWP-100 Beta TODO

Dieser MVP nutzt ein kuratiertes Beta-Universum aus öffentlich abrufbaren Indexumfeld-Tabellen. Es ist kein offizieller Index und keine Kapitalmarkt- oder ESG-Bewertung.

Offene Schritte vor einer produktiven Bewertung:

- ISIN, LEI, Ticker und Indexmitgliedschaften gegen Primärquellen validieren.
- Unternehmensberichte, Nachhaltigkeitsberichte, CSRD-/ESRS-Berichte und IR-Quellen versioniert ablegen.
- Dokumente hashen und Abrufdatum, Sprache, Framework und Assurance-Status erfassen.
- Indikatorenkatalog für Mensch, Planet, Demokratie, Transformation und Datenqualität finalisieren.
- Keine echten Scores anzeigen, bevor Beobachtungen, Quellenanker und Datenqualität ausreichend sind.
- Lizenzstatus optionaler Provider wie CDP oder kommerzieller ESG-Daten prüfen.
- Snapshot-Pipeline aus Quell-Adaptern, WÖk-ID-Mapping und Snapshot-Writer bauen.
- Datenqualitätsklassen A-E pro Beobachtung ausweisen; D/E als Rückfrage statt Befund rendern.
- Gesamtprofil sperren, wenn ein kritisches Feld fehlt oder nur mit unzureichender Datenqualität vorliegt.
