"""Remove reviewed production notes from the teaching manuscript sources."""
from pathlib import Path
import re

def clean_manuscript(text):
    lines=[]
    for line in text.splitlines(keepends=True):
        if line.startswith('**Ablage:**') or (line.startswith('**Quelle:**') and 'woek-akademie-app/' in line):continue
        if re.search(r'^\*\*Status(?: dieser Erweiterung)?:\*\*',line) and re.search(r'Claude|Codex',line):
            if 'dieser Erweiterung' not in line:
                lines.append('**Status:** Studienskript V1.\n')
            continue
        if re.search(r'Claude|Codex(?:-V1|-Fassung|-Inhaltsproduktion|-Erweiterung|-HANDOFF)',line,re.I):
            continue
        if re.search(r'^> Erstellt nach .*vorlesung-template',line,re.I):
            continue
        lines.append(line)
    return ''.join(lines)

if __name__=='__main__':
    count=0
    for file in Path('content/studienskripte').glob('*.md'):
        original=file.read_text();clean=clean_manuscript(original)
        if clean!=original:file.write_text(clean);count+=1
    print(f'Reviewed manuscript production notes removed from {count} sources.')
