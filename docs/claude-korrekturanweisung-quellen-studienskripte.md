# Korrekturanweisung fuer Claude: Quellen in Studienskripten

Stand: 2026-07-03

## Ziel

In allen oeffentlichen Studienskript-Ausgaben muessen interne Pfade durch echte, lesbare Titel und echte Links ersetzt sein. Das betrifft Markdown-Master, App-Spiegel, App-Quelltexte fuer Lehrgaenge und die Word-Rohfassungen.

Interne Arbeitsorte duerfen in Produktionsmetadaten, Indexdateien, Runbooks oder technischen Uebergaben stehen. Sie duerfen aber nicht als Quellenangaben im veroeffentlichbaren Skripttext oder in Word-Dokumenten erscheinen.

## Word-Dokumente

Die Word-Rohfassungen liegen hier:

`/Users/hagen/Documents/New project/docs/studienskripte/word-rohfassungen/`

Namensschema:

`<slug>.docx`

Beispiele:

- `/Users/hagen/Documents/New project/docs/studienskripte/word-rohfassungen/woek-g-v20.docx`
- `/Users/hagen/Documents/New project/docs/studienskripte/word-rohfassungen/wirkungsmanagement-v1.docx`
- `/Users/hagen/Documents/New project/docs/studienskripte/word-rohfassungen/wirkungscontrolling-wc-v1.docx`

## Fuehrende Markdown-Orte

- Markdown-Master: `/Users/hagen/Documents/New project/content/studienskripte/`
- Website-Skriptindex: `/Users/hagen/Documents/New project/content/studienskripte/index.json`
- App-Spiegel: `/Users/hagen/Documents/New project/woek-akademie-app/content/lehrgaenge/`
- App-Lehrgangsquellen: `/Users/hagen/Documents/New project/woek-akademie-app/docs/lehrgaenge/`
- Geschuetzte Pruefungslogik: `/Users/hagen/Documents/New project/woek-akademie-app/content/pruefungen/`

Die geschuetzte Pruefungs- und Antwortlogik darf nicht als oeffentliche Quelle zitiert oder in Quellenlisten sichtbar gemacht werden.

## Verbotene Quellenmuster in oeffentlichen Skripten

Diese Muster duerfen nicht in Markdown-Skripten oder DOCX-Ausgaben stehen:

- `woek-akademie-app/docs/lehrgaenge/...`
- `woek-akademie-app/content/lehrgaenge/...`
- `content/studienskripte/...`
- `assets/pdf/die-neue-ordnung-des-wohlstands.pdf`
- `buch.html` ohne vollstaendige URL und sprechenden Titel
- `docs/CODEX-HANDOFF-studienskripte.md`
- `docs/CODEX-HANDOFF-pruefungen.md`
- `source-assets/originals/...`
- `content/internal-documents/originals/...`
- `docs/grundlagen/...`
- `docs/whitepaper/...`
- `docs/praxis/...`
- `docs/gesetze/...`
- Formulierungen wie `Interne Quelle`, `Interne Quellen`, `interne Primaerquelle`, `Website-Korpus:`

## Erlaubtes WÖk-Quellenformat

Als Standardblock verwenden:

```markdown
### WÖk-Quellen

- [Die neue Ordnung des Wohlstands](https://wirkungsoekonomie.de/buch.html)
- [WÖk-Referenz](https://wirkungsoekonomie.de/referenz/)
- [Glossar der Wirkungsökonomie](https://wirkungsoekonomie.de/glossar.html)
- [WÖk-Werkzeuge](https://wirkungsoekonomie.de/werkzeuge/)
- [WÖk-Journal](https://wirkungsoekonomie.de/blog.html)
```

Bei Inline-Hinweisen:

```markdown
*Öffentliche Quelle:* [Titel der WÖk-Seite](https://wirkungsoekonomie.de/...)
```

Nicht:

```markdown
*Interne Quelle:* `docs/...`
```

## Externe Quellen mit echten Links

Fuer fachliche Rahmenwerke nur offizielle oder primaere Quellen verlinken:

- [United Nations: Transforming our world: the 2030 Agenda for Sustainable Development](https://sdgs.un.org/2030agenda)
- [European Commission: Corporate sustainability reporting](https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en)
- [EFRAG: Sustainability reporting and ESRS](https://www.efrag.org/en/sustainability-reporting)
- [European Commission: EU taxonomy for sustainable activities](https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en)
- [European Commission: Digital Product Passport consultation](https://single-market-economy.ec.europa.eu/news/commission-launches-consultation-digital-product-passport-2025-04-09_en)
- [GRI Standards](https://www.globalreporting.org/standards/)

## Generatoren

Beim Neuaufbau von Skripten muessen diese Generatoren den oeffentlichen Quellenstandard beibehalten:

- `/Users/hagen/Documents/New project/scripts/studienskripte/generate-rohfassungen.mjs`
- `/Users/hagen/Documents/New project/scripts/studienskripte/deepen-sprint2.mjs`
- `/Users/hagen/Documents/New project/scripts/studienskripte/export-word-rohfassung.py`

Der Word-Exporter muss fenced code blocks auslassen, damit technische `chart-spec`- oder Asset-Hinweise nicht in DOCX-Dateien erscheinen.

## Pflichtpruefungen

Aus dem Website-Repo:

```bash
node scripts/studienskripte/verify-v1.mjs
```

DOCX-Quellenscan:

```bash
python3 - <<'PY'
from pathlib import Path
from docx import Document

patterns = [
    'content/studienskripte/',
    'woek-akademie-app/docs/lehrgaenge',
    'woek-akademie-app/content/lehrgaenge',
    'assets/pdf/die-neue-ordnung-des-wohlstands.pdf',
    'docs/CODEX-HANDOFF',
    'Interne Quelle',
    'Interne Quellen',
    'interne Primaerquelle',
    'Website-Korpus:',
    'source-assets/originals',
    'content/internal-documents/originals',
    'docs/whitepaper/',
    'docs/grundlagen/',
    'docs/gesetze/',
    'docs/praxis/',
]

hits = []
for path in sorted(Path('docs/studienskripte/word-rohfassungen').glob('*.docx')):
    if path.name.startswith('~$'):
        continue
    doc = Document(str(path))
    texts = [p.text for p in doc.paragraphs]
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                texts.append(cell.text)
    text = '\n'.join(texts)
    for pattern in patterns:
        if pattern in text:
            hits.append((str(path), pattern))

if hits:
    for hit in hits[:100]:
        print(hit)
    raise SystemExit(f'{len(hits)} forbidden DOCX hits')

print({'ok': True, 'forbiddenHits': 0})
PY
```

App-Typecheck:

```bash
cd "/Users/hagen/Documents/New project/woek-akademie-app"
npm run typecheck
```

Render-Stichprobe:

```bash
python3 /Users/hagen/.codex/plugins/cache/openai-primary-runtime/documents/26.630.12135/skills/documents/render_docx.py \
  "/Users/hagen/Documents/New project/docs/studienskripte/word-rohfassungen/wirkungscontrolling-wc-v1.docx" \
  --output_dir /tmp/woek-wc-v1-render
```

Danach mindestens Seite 1, eine mittlere Seite mit Tabelle und die letzte Quellen-Seite visuell pruefen.
