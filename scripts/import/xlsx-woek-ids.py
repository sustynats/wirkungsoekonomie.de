#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import openpyxl
except Exception as exc:
    raise SystemExit(f"openpyxl is required: {exc}")

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/hagen/Desktop/WÖk-Konzepte etc/Kerndokumente/WOeK_Master_Items_final_v1.2.xlsx")
if not src.exists():
    raise SystemExit(f"Missing XLSX: {src}")

wb = openpyxl.load_workbook(src, data_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
headers = [str(cell or "").strip() for cell in rows[0]]
items = []
for row in rows[1:]:
    item = {headers[i] or f"column_{i+1}": row[i] for i in range(min(len(headers), len(row)))}
    if any(value not in (None, "") for value in item.values()):
        items.append(item)

out = Path("public/data/woek-ids.json")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"sourceFile": str(src), "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
Path("src/data").mkdir(parents=True, exist_ok=True)
Path("src/data/woek-ids.json").write_text(out.read_text(encoding="utf-8"), encoding="utf-8")
print(f"Wrote {len(items)} WÖk-ID rows.")

