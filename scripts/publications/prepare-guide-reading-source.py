"""Prepare a public reading source from the immutable, fully tagged v1.8 guide.

Every paragraph and cell carries its primary-source object ID. Internal
publication operations and superseded editing instructions stay in the archive.
Scientific definitions are retained; narrow corrections resolve conflicting
short forms using the guide's own expanded definitions and the core reference.
"""
from pathlib import Path
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'source-assets/generated/guide-v18-tagged-structure.json'
EXPECTED = 'f08258822e45066cc9a5870bad6056a051633b971e5f3fddb5f199360b1de75a'
data = json.loads(SOURCE.read_text())
if data['sourceSha256'] != EXPECTED or data['missing']:
    raise RuntimeError('Unverified primary guide structure')
nodes = data['tree']['children'][0]['children']
if len(nodes) != 568:
    raise RuntimeError('Primary document structure changed')

def raw_text(node):
    return node.get('text', '') + ''.join(raw_text(c) for c in node.get('children', []))

def canonical(value):
    value = value.replace('\u00ad', '')
    value = re.sub(r'(?<=\w)-\s*\n\s*(?=\w)', '-', value)
    value = re.sub(r'\s+', ' ', value).strip()
    for prefix, word in [('WÖk', 'ID'), ('WÖk', 'Wirkungspfad'), ('WÖMS', 'Methodenkarte'),
                         ('Eurostat', 'Klassifikation'), ('Netto', 'Nutzens')]:
        value = value.replace(prefix+'- '+word, prefix+'-'+word)
    return value.translate(str.maketrans({'\u2010':'-', '\u2011':'-', '\u2013':'-', '\u2014':'-'}))

# Source-index ranges are pinned to the complete primary PDF checksum above.
# The archived source retains the entire original development/operations record.
excluded = {0, 4, 65, 66, 81, 82, 87, 88, 161, 162, 427, 549, 550, 551, 567}
for first, last in [(7, 63), (157, 159), (227, 242), (414, 425), (452, 490), (495, 542)]:
    excluded.update(range(first, last + 1))

headings = {
    1: 'Begriffsleitfaden der Wirkungsökonomie',
    64: 'IOOI und Wirkungsökonomie',
    70: 'Registerobjekte, Kennzahlen und Klassifikationen',
    74: 'Grundregeln der Analyse',
    83: 'Begriffs- und Rechengrundlagen',
    86: 'Wirkungsrelevanz und staatliche Prüfarchitektur',
    149: 'Anwendung der staatlichen Prüfrahmen',
    160: 'Staatliche Nachhaltigkeits- und Folgenprüfung',
    222: 'Grundregeln staatlicher Wirkungsanalysen',
    243: '1. Quellenhierarchie',
    245: '1.1 Quellen richtig einordnen',
    377: '6.5 Evidenzstatus',
    390: '7.3 IOOI und Wirkungsökonomie im Vergleich',
    402: '8.3 Fragen zur Resilienz',
    410: '9. Begriffsgruppen',
    426: '10. Definitionen',
    491: '12. Begriffe und ihre Grenzen',
    493: '13. Mini-Definitionen',
    543: '16. Quellen und methodische Grenzen',
    544: '16.1 WÖk-Quellen',
}

units = []
changes = []
for index, node in enumerate(nodes):
    if index in excluded:
        changes.append(dict(sourceIndex=index, sourceObject=node['object'], kind='archive-only-production-or-development-record'))
        continue
    role = node['role']
    entry = dict(sourceIndex=index, sourceObject=node['object'], sourcePage=node.get('page'))
    if role == 'Table':
        rows = [[canonical(raw_text(cell)) for cell in row['children']] for row in node['children']]
        if not rows or len({len(row) for row in rows}) != 1:
            raise RuntimeError('Unknown table structure: ' + str(index))
        entry.update(type='table', rows=rows)
        replacements = []
        if index == 244:
            replacements = [(4, 1, 'Indikatoren, Datenquellen, Einheiten, Benchmarks und Versionen',
                             'Prüfgegenstände, Zustandsgrößen, Indikatoren, Beobachtungen, Einheiten, Quellen und Versionen')]
        elif index == 276:
            replacements = [(7, 1, 'Zum Beispiel WÖk-ID, Scorecard, NWI, IOI, T-SROI, Register, Datenräume, Rechner und Demos. Sie beantworten begrenzte Fragen und sind keine Gesamtarchitektur.',
                             'Zum Beispiel WÖk-ID, Scorecard, WÖk-Netto-Wirkungsindex, IOI, T-SROI, Register, Datenräume, Rechner und Demos. Sie beantworten begrenzte Fragen und sind keine Gesamtarchitektur.')]
        elif index == 281:
            replacements = [(0, 2, 'Redaktionelle Regel', 'Abgrenzung')]
        elif index == 413:
            replacements = [(1, 1, 'Definieren Identität und tragende Logik. Nur zentral ändern.', 'Definieren Identität und tragende Logik.'),
                            (5, 2, 'Scorecard, NWI, IOI, T-SROI, FinalScore', 'Scorecard, WÖk-Netto-Wirkungsindex, IOI, T-SROI, FinalScore')]
        for row, cell, before, after in replacements:
            if rows[row][cell] != before:
                raise RuntimeError('Primary table cell conflict: ' + str(index))
            rows[row][cell] = after
            changes.append(dict(sourceIndex=index, row=row, cell=cell, before=before, after=after,
                                kind='reader-label-or-alignment-with-expanded-primary-definition'))
    else:
        text = canonical(raw_text(node))
        if role == 'L':
            text = re.sub(r'^(?:•|\d+\.)\s*', '', text)
        if index in headings:
            changes.append(dict(sourceIndex=index, before=text, after=headings[index], kind='reader-heading'))
            text = headings[index]
        if index == 72:
            suffix = ' Die offene Migration bleibt offen. Ein neuer Versionsaufdruck ersetzt keine Korrespondenzprüfung und keine validierte Branchenzuordnung.'
            if not text.endswith(suffix):
                raise RuntimeError('NACE source paragraph changed')
            before_text = text
            text = text[:-len(suffix)]
            changes.append(dict(sourceIndex=index, before=before_text, after=text, kind='remove-internal-migration-instruction'))
        if index == 84:
            before = 'Terminologiebasis: kumulative Fassung v1.7;'
            if not text.startswith(before):
                raise RuntimeError('Guide basis changed')
            before_text = text
            text = 'Begriffsgrundlage: Leitfaden v1.8 auf Basis von v1.7;' + text[len(before):]
            changes.append(dict(sourceIndex=index, before=before_text, after=text, kind='current-primary-source-label'))
        if index == 547:
            if text != 'Natalie Weber: WÖk Master Items, Version 1.3 geprüft.':
                raise RuntimeError('Historical bibliography changed')
            before_text = text
            text = 'Natalie Weber: WÖk Master Items, historische Ausgabe Version 1.3.'
            changes.append(dict(sourceIndex=index, before=before_text, after=text, kind='historical-source-label'))
        if text == 'WÖK-Q-9035: Aktionsplan Nachhaltigkeit 2026, Beteiligungsfassung; nicht als Finalfassung ausgeben.':
            before_text = text
            text = 'WÖK-Q-9035: Aktionsplan Nachhaltigkeit 2026, historische Beteiligungsfassung.'
            changes.append(dict(sourceIndex=index, before=before_text, after=text, kind='historical-source-label'))
        kind = 'heading' if role in {'H2','H3'} else 'bullet' if role == 'L' else 'paragraph'
        if index == 1:
            kind = 'title'
        entry.update(type=kind, text=text, level=3 if role == 'H3' else 2)
    units.append(entry)

# The eleven detailed definition tables and the complete mini-definition table
# must survive with their full dimensions and definitions, not just their labels.
definition_indices = [429,431,433,435,437,439,441,443,445,447,449,494]
for index in definition_indices:
    current = next(u for u in units if u['sourceIndex'] == index)
    expected = [[canonical(raw_text(c)) for c in r['children']] for r in nodes[index]['children']]
    if current['rows'] != expected:
        raise RuntimeError('A full scientific definition table changed')

result = dict(version='1.8', sourceDate='2026-10-01', readingEditionDate='2026-10-12',
              author='Natalie Weber', status='SOURCE_PREPARED_RENDER_REVIEW_PENDING',
              sourceSha256=EXPECTED, originalUnits=568, sourceStructureSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              units=units, changes=changes, retainedDefinitionTableObjects=[nodes[i]['object'] for i in definition_indices])
target = ROOT / 'content/grundlagen/guide-public-reading-v1.8-20261012.json'
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(units=len(units), tables=sum(u['type']=='table' for u in units),
                      completeDefinitionTables=len(definition_indices), status=result['status'])))
