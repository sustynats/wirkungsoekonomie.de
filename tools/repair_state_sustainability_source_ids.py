#!/usr/bin/env python3
"""Move the #253 federal-architecture source records into the next free source-ID range.

The sitewide #253 batch initially used WÖK-Q-1029..1035, but a publication supplement already
owns WÖK-Q-1029..1097. The Quellenarchiv merge is intentionally fail-closed on duplicate IDs.
This deterministic repair assigns the seven #253 records to WÖK-Q-1098..1104, directly after
the currently published supplemental range, without changing source content or provenance.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "content/quellenarchiv/legal-source-records.json"

TITLE_TO_CODE = {
    "Gemeinsame Geschäftsordnung der Bundesministerien (GGO) – §§ 43 und 44": "WÖK-Q-1098",
    "BMJV – Nachhaltige Gesetzgebung": "WÖK-Q-1099",
    "Bundesregierung – Steuerung der Deutschen Nachhaltigkeitsstrategie": "WÖK-Q-1100",
    "Deutsche Nachhaltigkeitsstrategie – Weiterentwicklung 2025": "WÖK-Q-1101",
    "Statistisches Bundesamt – Indikatoren der Deutschen Nachhaltigkeitsstrategie": "WÖK-Q-1102",
    "E-Gesetzgebung – elektronische Gesetzesfolgenabschätzung (eGFA) und eNAP": "WÖK-Q-1103",
    "Bundesregierung – Aktionsplan Nachhaltigkeit 2026 (Beteiligungsfassung)": "WÖK-Q-1104",
}


def main() -> int:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    seen = {src.get("code") for src in data.get("sources", [])}
    changed = 0
    matched = set()
    for src in data.get("sources", []):
        title = src.get("title")
        if title not in TITLE_TO_CODE:
            continue
        matched.add(title)
        target = TITLE_TO_CODE[title]
        current = src.get("code")
        if current == target:
            continue
        if target in seen:
            raise RuntimeError(f"target source ID already occupied: {target}")
        seen.discard(current)
        src["code"] = target
        seen.add(target)
        changed += 1

    missing = sorted(set(TITLE_TO_CODE) - matched)
    if missing:
        raise RuntimeError(f"#253 source records missing for ID repair: {missing}")

    codes = [src.get("code") for src in data.get("sources", []) if src.get("code")]
    dupes = sorted({code for code in codes if codes.count(code) > 1})
    if dupes:
        raise RuntimeError(f"duplicate source IDs remain in legal-source-records.json: {dupes}")

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"#253 source IDs canonical: {changed} records changed; range WÖK-Q-1098..1104")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
