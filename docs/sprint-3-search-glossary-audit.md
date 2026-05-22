# Sprint 3 Search- und Glossary-Audit

Stand: 2026-05-22.

## Suche

Die Suche wurde für Sprint 3 als Wissenszugang geschärft:

- Suchbeschreibung erweitert um Audios.
- Typfilter auf die gewünschten Zugänge reduziert: Glossar, Seiten, Anwendungen, Akademie, Blog, Evidenz, Downloads, Audio.
- Speziallogik ergänzt, damit `Seiten`, `Anwendungen` und `Audio` sinnvoll über Bereich, Format und Tags matchen.
- Synonyme und Assoziationen ergänzt: Grundeinkommen, Rente, ESG, KI, Quellen, Steuer, Produkt, Medien, Unternehmen, Kapital und Audio.
- Curated Entrypoint für Audio ergänzt.
- Build-Script nutzt nun `search_title`, `search_description`, `search_type` und `search_section`, damit Spezialseiten wie Audio sauber indexiert werden.

## Glossar

Das Glossar bleibt zentrale Begriffsinfrastruktur. Sprint 3 hat keine Glossarbegriffe gelöscht. Für Sprint 4 bleiben diese Begriffe prioritär zu prüfen und gegebenenfalls als voll strukturierte Begriffskarten auszubauen:

- Wirkung
- positive Netto-Wirkung
- Wirkungspotenzial
- Wirkungsrisiko
- Wirkungsraum
- Resonanzraum
- Wirkungsbewertung
- Netto-Wirkung
- Wirkungsrückkopplung
- Wirkungslenkung
- Wirkungsarchitektur
- Wirkungskapital
- Wirkungseinkommen
- Wirkungsrente
- WÖk-ID
- Reverse Merit Order
- Wirkungsrat
- SDG+
- Wirkungskompetenz

## Offene Punkte

Die Suche ist benutzbarer, aber Sprint 4 sollte eine echte Vorschlagsoberfläche mit Trefferanzahl, Top-Treffern und Begriffskarten als eigene UI-Komponente weiter ausbauen.
