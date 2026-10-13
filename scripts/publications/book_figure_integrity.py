"""Validate the exact editable figure source, pixels and recorded visual review."""
from pathlib import Path
import hashlib
import json
import re


def validate_figure(root, source, build):
    root = Path(root).resolve()
    key = source['key']
    entry_hash = hashlib.sha256(json.dumps(
        source, ensure_ascii=False, sort_keys=True, separators=(',', ':')
    ).encode()).hexdigest()
    if build.get('key') != key or build.get('sourceEntrySha256') != entry_hash:
        raise RuntimeError('Figure source changed after rendering: ' + key)
    if build.get('placements') != source['placements'] or build.get('originalSha256') != source['originalSha256']:
        raise RuntimeError('Figure provenance changed: ' + key)
    for name, digest in [('image', 'sha256'), ('svg', 'svgSha256')]:
        path = (root / build[name]).resolve()
        if not path.is_relative_to(root) or not path.is_file():
            raise RuntimeError('Figure artifact missing or outside source tree: ' + key)
        if hashlib.sha256(path.read_bytes()).hexdigest() != build.get(digest):
            raise RuntimeError('Figure artifact changed after review: ' + key)
    evidence = build.get('reviewEvidence', {})
    if (build.get('visualReview') != 'PASS'
            or build.get('reviewedImageSha256') != build['sha256']
            or evidence.get('actuallyViewed') is not True
            or not evidence.get('observation', '').strip()
            or not re.fullmatch('[0-9a-f]{64}', evidence.get('sheetSha256', ''))):
        raise RuntimeError('Exact figure has no complete visual review: ' + key)
    return build
