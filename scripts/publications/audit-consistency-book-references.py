"""Resolve both volumes' source identifiers, including Word structured fields.

This checks reference integrity, not whether every cited source supports every
claim. Missing, empty and repeated definitions fail rather than disappear from
the bibliography when a definition is inside a structured document tag.
"""
from pathlib import Path
from zipfile import ZipFile
import argparse
import collections
import hashlib
import json
import re
import xml.etree.ElementTree as ET

NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
IDENTIFIER = r'[IE]-(?:K?\d+|L|V|AV|KG)-\d+'
CROSS_VOLUME_NOTE = ('Die gemeinsamen Belege zu Kurzfassung, Begriffen, Vorwort '
                     'und Abkürzungen stehen in Band I unter denselben Quellenkennungen.')


def inventory(xml):
    root = ET.fromstring(xml)
    body = root.find(NS + 'body')
    if body is None:
        raise RuntimeError('Missing Word document body')
    paragraphs = []
    for paragraph in body.iter(NS + 'p'):
        paragraphs.append(''.join('\n' if node.tag == NS + 'br' else
                                  (node.text or '') if node.tag == NS + 't' else ''
                                  for node in paragraph.iter()).strip())
    definitions = collections.defaultdict(list)
    identifiers = set()
    empty = []
    for index, text in enumerate(paragraphs):
        for bracket in re.findall(r'\[([^\]]+)\]', text):
            identifiers.update(re.findall(IDENTIFIER, bracket))
        for match in re.finditer(r'(?m)^\[(' + IDENTIFIER + r')\]\s*', text):
            value = text[match.end():].split('\n[')[0].strip()
            if not value:
                following = next((s for s in paragraphs[index+1:] if s), '')
                if following and not following.startswith('['):
                    value = following
            if not value:
                empty.append(match[1])
            definitions[match[1]].append({'xmlParagraph': index, 'text': value})
    return {'definitions': dict(definitions), 'identifiers': sorted(identifiers),
            'empty': empty, 'hasCrossVolumeNote': CROSS_VOLUME_NOTE in '\n'.join(paragraphs)}


def validate(volumes):
    known = set().union(*(row['definitions'] for row in volumes.values()))
    evidence = []
    for volume, row in volumes.items():
        missing = sorted(set(row['identifiers']) - known)
        duplicates = sorted(k for k, values in row['definitions'].items() if len(values) > 1)
        shared = sorted(set(row['identifiers']) - set(row['definitions']) - set(missing))
        if missing or duplicates or row['empty']:
            raise RuntimeError(f'Band {volume}: missing={missing}, duplicate={duplicates}, empty={row["empty"]}')
        if shared and (volume != 'II' or not row['hasCrossVolumeNote'] or
                       any(not re.fullmatch(r'[IE]-(?:V|L|AV|KG)-\d+', key) for key in shared)):
            raise RuntimeError(f'Band {volume}: undocumented cross-volume references')
        evidence.append({'volume': volume, 'definitions': len(row['definitions']),
                         'referenceIdentifiers': len(row['identifiers']),
                         'unresolved': [], 'emptyDefinitions': [], 'duplicateDefinitions': [],
                         'sharedReferencesResolvedToBandI': shared})
    return evidence


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--band-i', type=Path, required=True)
    parser.add_argument('--band-ii', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    volumes = {}
    sources = []
    for volume, path in [('I', args.band_i), ('II', args.band_ii)]:
        with ZipFile(path) as archive:
            volumes[volume] = inventory(archive.read('word/document.xml'))
        sources.append({'volume': volume, 'filename': path.name,
                        'docxSha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    evidence = validate(volumes)
    report = {'status': 'PASS', 'scope': 'Source-identifier integrity across the two books; claim support remains a separate review.',
              'sources': sources, 'volumes': evidence}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('Both books: every source identifier resolved; no empty or duplicate definition.')


if __name__ == '__main__':
    main()
