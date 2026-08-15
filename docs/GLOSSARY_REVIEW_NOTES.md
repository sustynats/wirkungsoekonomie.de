# Glossar-Review-Notizen

Stand: 2026-05-23

## Rolle des Glossars

Das Glossar ist die führende Begriffsschicht der WÖk-Online-Referenz. Hoverdefinitionen, Suchsynonyme, Crosslinks, Terminologieprüfungen und PDF-Glossare sollen aus `src/data/glossary.terms.yml` erzeugt werden.

## Importierte führende Begriffe

Phase 1A legt die prioritären Begriffe aus dem führenden Begriffsleitfaden als strukturierte Daten an. Der Führende Begriffsleitfaden bleibt maßgebliche Quelle.

## Alphabetische Prüfung

Die alphabetische Prüfung erfolgt über:

```bash
node scripts/glossary/check-glossary-alphabetical.mjs
```

Regeln:

- deutsche Kollation
- Groß-/Kleinschreibung ignorieren
- Umlaute und ß über deutsche Sortierung behandeln
- keine doppelten Slugs
- keine führenden Begriffe ohne Hoverdefinition

## Kandidaten

Kandidaten werden nicht automatisch veröffentlicht. Sie werden in `src/data/glossary.candidates.yml`, `public/data/glossary-candidates.json` und `docs/GLOSSARY_EXTENSION_CANDIDATES.md` geführt.

## Offene Punkte

- Hauptwerksglossar erst nach bestätigter kanonischer Hauptwerksquelle vollständig gegenprüfen.
- PDF-Exportprofil mit alphabetischem Glossar erst nach stabiler Webfassung aktivieren.

