"""Read-only text screening; findings are review signals, never automatic errors.

Usage: python3 audit-publication-text.py /path/to/repository /path/to/audit-output
Requires pymupdf. Does not modify publications or contact external services.
"""
import collections
import csv
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys

import pymupdf

root, output = map(Path, sys.argv[1:3])
output.mkdir(parents=True, exist_ok=True)
assets = json.loads((root / 'assets/data/public-release-assets.json').read_text())['assets']
patterns = {
    'ID_INDICATOR_EQUATION': r'W[Öo]k[- ]IDs?\s+(?:sind|ist|bezeichnet|bezeichnen|bilden)\s+[^.!?]{0,100}Indikator',
    'EFFECT_ALWAYS_POSITIVE': r'Wirkung\s+(?:ist|bedeutet)\s+(?:immer|grundsätzlich|ausschließlich|stets)\s+(?:eine\s+)?positiv',
    'REACH_EFFECT_EQUATION': r'Reichweite\s+(?:ist|bedeutet|entspricht)\s+(?:gleich\s+)?Wirkung',
    'NO_EXISTING_STATE_ASSESSMENT': r'(?:bisher|bislang|heute)\s+(?:gibt\s+es|existiert|existieren)\s+keine?\s+[^.!?]{0,90}(?:Wirkungsprüf|Folgenabschätz|Nachhaltigkeitsprüf)',
    'LANGUAGE_ACTIVE_INGREDIENT_LITERAL': r'(?:Sprache|Narrative|Wörter)\s+(?:ist|sind)\s+(?:ein\s+|ein[e]?\s+)?Wirkstoff',
    'TRANSFORMATION_MULTIPLIER': r'(?:Transformations?(?:faktor|multiplikator)|T[- ]SROI[^.!?]{0,100}multipl|multipl[^.!?]{0,100}T[- ]SROI)',
    'R_MEANS_FEEDBACK': r'\bR\s*(?:=|steht\s+für|bedeutet)\s*Rückkopplung',
}
compiled = {key: re.compile(value, re.I) for key, value in patterns.items()}
cache, inventory, findings = {}, [], []
for rel, url in sorted(assets.items()):
    if not rel.lower().endswith('.pdf'):
        continue
    p = root / rel
    digest = hashlib.sha256(p.read_bytes()).hexdigest()
    if digest not in cache:
        hits, empty, pages, total_chars = [], [], 0, 0
        try:
            with pymupdf.open(p) as doc:
                pages = len(doc)
                for number, page in enumerate(doc, 1):
                    text = re.sub(r'\s+', ' ', page.get_text()).strip()
                    total_chars += len(text)
                    if len(text) < 30:
                        empty.append(number)
                    for key, pattern in compiled.items():
                        for match in pattern.finditer(text):
                            hits.append({'rule': key, 'page': number, 'context': text[max(0, match.start()-180):match.end()+240]})
            cache[digest] = {'pages': pages, 'characters': total_chars, 'lowTextPages': empty, 'hits': hits, 'error': ''}
        except Exception as exc:
            cache[digest] = {'pages': pages, 'characters': total_chars, 'lowTextPages': empty, 'hits': hits, 'error': str(exc)}
    result = cache[digest]
    inventory.append({'sourcePath': rel, 'url': url, 'sha256': digest, 'pages': result['pages'], 'textCharacters': result['characters'], 'lowTextPageCount': len(result['lowTextPages']), 'signalCount': len(result['hits']), 'error': result['error']})
    for hit in result['hits']:
        findings.append({'sourcePath': rel, 'url': url, **hit, 'status': 'CONTEXT_REVIEW_REQUIRED'})

for filename, rows in [('historical-pdf-text-inventory.csv', inventory), ('historical-pdf-text-signals.csv', findings)]:
    with (output / filename).open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]) if rows else ['status'], lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)

summary = {
    'checkedAt': datetime.now(timezone.utc).isoformat(),
    'assetPaths': len(inventory),
    'uniqueFileHashes': len(cache),
    'uniquePagesRead': sum(item['pages'] for item in cache.values()),
    'uniqueCharactersRead': sum(item['characters'] for item in cache.values()),
    'unreadableUniqueFiles': sum(bool(item['error']) for item in cache.values()),
    'uniquePagesWithLittleExtractableText': sum(len(item['lowTextPages']) for item in cache.values()),
    'signalsByRuleIncludingDuplicatePaths': dict(collections.Counter(row['rule'] for row in findings)),
    'uniqueFileSignals': sum(len(item['hits']) for item in cache.values()),
    'rules': patterns,
    'limitations': [
        'Signals may quote rejected claims, describe historical states, or be explicitly framed as analogies. Read surrounding context before making a correction.',
        'Text extraction does not verify layout, images, formulas, evidence quality or scientific validity.',
        'No signal does not mean that a publication is correct or current. This is a targeted terminology screen, not peer review.',
        'Page numbers are one-based physical PDF pages. No original publication was modified.',
    ],
}
(output / 'historical-pdf-text-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: value for key, value in summary.items() if key not in ['rules','limitations']}, ensure_ascii=False))
