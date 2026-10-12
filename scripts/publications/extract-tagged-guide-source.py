"""Read the tagged primary PDF without guessing table cells from line positions."""
from pathlib import Path
from collections import Counter, defaultdict
import hashlib, json
from pypdf import PdfReader
from pypdf.generic import IndirectObject, ArrayObject, NumberObject

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'source-assets/originals/WOeK_Begriffsleitfaden_v1.8_2026-10-01.pdf'
EXPECTED = 'f08258822e45066cc9a5870bad6056a051633b971e5f3fddb5f199360b1de75a'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED
reader = PdfReader(SOURCE)
pages = {page.indirect_reference.idnum: index + 1 for index, page in enumerate(reader.pages)}
texts = defaultdict(list)
unmarked = defaultdict(list)
for number, page in enumerate(reader.pages, 1):
    stack = []
    def operand(op, args, cm, tm):
        if op == b'BDC':
            properties = args[1].get_object()
            stack.append(properties.get('/MCID') if isinstance(properties, dict) else None)
        elif op == b'BMC':
            stack.append(None)
        elif op == b'EMC':
            if not stack:
                raise RuntimeError('Unbalanced marked content')
            stack.pop()
    def visit(text, cm, tm, font, size):
        if not text:
            return
        mcid = next((v for v in reversed(stack) if v is not None), None)
        (texts[(number, int(mcid))] if mcid is not None else unmarked[number]).append(text)
    page.extract_text(visitor_operand_before=operand, visitor_text=visit)
    if stack:
        raise RuntimeError('Marked content left open')

roles = Counter()
missing = []
def walk(reference, inherited_page=None):
    if isinstance(reference, ArrayObject):
        return [walk(value, inherited_page) for value in reference]
    if isinstance(reference, (int, NumberObject)):
        key = (inherited_page, int(reference))
        if key not in texts:
            missing.append(key)
        return dict(role='text', page=inherited_page, mcid=int(reference), text=''.join(texts[key]))
    obj = reference.get_object()
    if not isinstance(obj, dict):
        return dict(role='unknown', value=str(obj))
    page = obj.get('/Pg')
    if page is not None:
        inherited_page = pages[page.idnum]
    if '/MCID' in obj:
        return walk(obj['/MCID'], inherited_page)
    role = str(obj.get('/S', obj.get('/Type', 'container'))).lstrip('/')
    roles[role] += 1
    children = walk(obj['/K'], inherited_page) if '/K' in obj else []
    return dict(role=role, object=reference.idnum if isinstance(reference, IndirectObject) else None,
                page=inherited_page, children=children if isinstance(children, list) else [children])

tree = walk(reader.trailer['/Root']['/StructTreeRoot'])
out = dict(sourceSha256=EXPECTED, pages=len(reader.pages), roles=dict(roles), missing=missing,
           unmarked={n: ''.join(value) for n, value in unmarked.items()}, tree=tree)
target = ROOT / 'source-assets/generated/guide-v18-tagged-structure.json'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(pages=out['pages'], roles=out['roles'], markedTextCharacters=sum(len(''.join(value)) for value in texts.values()),
                      missingCount=len(missing), unmarkedCharacters=sum(len(''.join(x)) for x in unmarked.values())), ensure_ascii=False))
