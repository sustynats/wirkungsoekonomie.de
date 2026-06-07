# Glossar-Buildprozess

Stand: 2026-06-07

## Ziel

Neue Glossarbegriffe oder Ergänzungen bestehender Begriffe werden nicht direkt in fertige HTML-Seiten geschrieben. Maßgeblich ist die zentrale Registry:

`assets/data/term-registry.json`

Aus ihr entstehen Detailseiten, Glossar-Hub, Hover-Begriffe, Term-Links, Referenzindex und Suchindex.

## Standardablauf

1. Redaktionsquelle prüfen.
2. Begriffe als strukturierte Importdatei unter `content/glossary/imports/` ablegen.
3. Import ausführen:

```bash
GLOSSARY_IMPORT_FILE=content/glossary/imports/recht-wirtschaft-innovation-klima.json npm run glossary:import-supplement
```

4. Qualitätschecks ausführen:

```bash
npm run check:glossary
npm run check:glossary-alpha
npm run check:hover-definitions
npm run check:search
```

5. Bei Website-weiten Änderungen zusätzlich:

```bash
npm run build
npm run check:links
npm run check:size
```

6. Commit, Push auf `main`, GitHub-Pages-Deployment abwarten und Live-URLs mit Cachebuster prüfen.

## Pflichtfelder pro Begriff

- Titel
- Kurzdefinition
- WÖk-Verwendung
- Abgrenzung
- Querverweise

## Verknüpfungsregel

Glossarbegriffe dürfen nicht isoliert entstehen. Jeder Import normalisiert `Querverweise` auf echte Slugs. Nicht auflösbare Querverweise werden im Report notiert und nicht als blinde Chips veröffentlicht.

## Upsert-Regel

Eine Begriffsbedeutung = eine kanonische Seite.

- Existiert der Begriff bereits, wird er synchronisiert.
- Fehlt der Begriff, wird er neu angelegt.
- Synonyme und Schreibweisen werden als Alias hinterlegt.
- Keine Dubletten durch Schreibvarianten, Pluralformen oder englische Tool-Bezeichnungen.

## Personenregel

Personen und Schulen werden als Bezugslinien geführt, nicht als Autoritäten oder Ursprung der Wirkungsökonomie.

Empfohlene Formulierungen:

- `anschlussfähig für`
- `Bezugslinie für`
- `hilft, folgenden WÖk-Aspekt zu präzisieren`

Nicht verwenden:

- `Die WÖk basiert auf ...`
- `Die WÖk übernimmt ...`

## Bericht

Jeder Import schreibt einen Report unter `reports/`, aktuell:

`reports/glossary-import-recht-wirtschaft-innovation-klima.md`
