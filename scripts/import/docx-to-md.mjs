import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const input = process.argv[2];
const output = process.argv[3] || "src/content/docs/imported/document.md";

if (!input || !fs.existsSync(input)) {
  console.error("Usage: node scripts/import/docx-to-md.mjs <input.docx> [output.md]");
  process.exit(1);
}

const python = "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const script = `
import sys, zipfile, xml.etree.ElementTree as ET, pathlib, html
src, out = sys.argv[1], pathlib.Path(sys.argv[2])
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with zipfile.ZipFile(src) as z:
    xml = z.read('word/document.xml')
root = ET.fromstring(xml)
paras = []
for p in root.findall('.//w:p', ns):
    texts = []
    for t in p.findall('.//w:t', ns):
        if t.text:
            texts.append(t.text)
    text = ''.join(texts).strip()
    if text:
        paras.append(text)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text('\\n\\n'.join(paras) + '\\n', encoding='utf-8')
print(f'Wrote {len(paras)} paragraphs to {out}')
`;

const result = spawnSync(python, ["-c", script, input, output], { stdio: "inherit" });
process.exit(result.status ?? 1);

