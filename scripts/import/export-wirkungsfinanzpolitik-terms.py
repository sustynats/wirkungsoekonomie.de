#!/usr/bin/env python3
"""Exportiert die kuratierten Begriffsdefinitionen der Wirkungsfinanzpolitik.

Die Redaktion pflegt die Begriffe beim zugehörigen Journal-Import. Dieser
Export macht sie zugleich für die zentrale Glossar-Pipeline verfügbar.
"""

from __future__ import annotations

import ast
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "scripts/import/import-wirkungsfinanzpolitik-journal.py"
OUTPUT = ROOT / "content/glossary/imports/wirkungsfinanzpolitik-term-definitions.json"


def term_definitions() -> list[tuple[str, str, str]]:
    tree = ast.parse(SOURCE.read_text(encoding="utf-8"), filename=str(SOURCE))
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if not any(isinstance(target, ast.Name) and target.id == "TERM_DEFINITIONS" for target in node.targets):
            continue
        value = ast.literal_eval(node.value)
        if isinstance(value, list):
            return value
    raise RuntimeError("TERM_DEFINITIONS wurde nicht gefunden.")


terms = []
for label, slug, definition in term_definitions():
    terms.append({
        "id": slug,
        "termId": slug,
        "label": label,
        "canonicalLabel": label,
        "slug": slug,
        "shortDefinition": definition,
        "category": "Wirkungsfinanzpolitik",
        "type": "Wirkungsfinanzpolitik",
        "source": "Wirkungsfinanzpolitik-Journal",
        "sourceDocument": "Von der Schuldenfrage zur Wirkungsfinanzpolitik",
        "sourceSection": "Wirkungsfinanzpolitik, öffentliche Finanzen, Schuldentragfähigkeit und Zukunftsrisiken",
        "reviewStatus": "redaktionell synchronisiert",
        "status": "approved",
        "version": "1.0",
        "pageUrl": f"/begriffe/{slug}/",
    })

OUTPUT.write_text(json.dumps({"terms": terms}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Exported {len(terms)} Wirkungsfinanzpolitik terms to {OUTPUT.relative_to(ROOT)}")
