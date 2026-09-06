"""Non-substantive publication corrections, with full text preservation checks.

Original files must be archived before applying the verified output. This tool
does not replace source files. Reports contain repository-relative names only.
"""
from pathlib import Path
import argparse
import concurrent.futures
import hashlib
import json
import re
import tempfile

import fitz
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, NameObject, TextStringObject
from pdf_stream_hygiene import replace_pdf, DASHES

DASHES |= set('\u2e3a\u2e3b\ufe58\ufe63\uff0d')
PRIVATE = re.compile(r'file:/+[^\s<>"\']+|(?<![\w/.:])/(?:Users|home|private/var|var/folders|Volumes)/[^\n<>"\']+|[A-Z]:[\\/]Users[\\/][^\n<>"\']+')
FORBIDDEN = re.compile(r'\b(?:Claude|ChatGPT)\b', re.I)
TRANSLATION = str.maketrans({c: '-' for c in DASHES})
TRACKING = re.compile(r'[?&]utm_source=chatgpt\.com', re.I)

def text_normalized(value):
    return TRACKING.sub('', value.translate(TRANSLATION)).replace('Shannon, Claude E.', 'Shannon, C. E.').replace('Claude Shannon', 'C. Shannon')

def comparable(value):
    return re.sub(r'\s+', '', PRIVATE.sub('', text_normalized(value)))

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def inspect_pdf(path):
    with fitz.open(path) as doc:
        text = '\n'.join(page.get_text() for page in doc)
        links = '\n'.join(str(link.get('uri', link.get('file', ''))) for page in doc for link in page.get_links())
        metadata = json.dumps(doc.metadata, ensure_ascii=False) + doc.get_xml_metadata()
        return dict(pages=len(doc), text=text, metadata=doc.metadata, dashes=sum(c in DASHES for c in text + metadata), forbidden=len(FORBIDDEN.findall(text + metadata + links)), privatePaths=len(PRIVATE.findall(text + metadata + links)))

def scrub_pdf(source, target):
    source, target = Path(source), Path(target)
    before = inspect_pdf(source)
    reader = PdfReader(source)
    for field in (reader.get_fields() or {}).values():
        if field.get('/FT') == '/Sig' and field.get('/V'):
            raise ValueError('Signed publication requires a separate corrected edition')
    corrections = dict(privateFooters=0, privateLinks=0, abbreviatedNames=0, trackingParameters=0, productionChecklistTokens=0)
    approved_deletions=[]
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='publication-hygiene-') as temporary:
        preprocessed = Path(temporary) / 'preprocessed.pdf'
        with fitz.open(source) as doc:
            touched = False
            for page in doc:
                page_text=page.get_text()
                for match in TRACKING.finditer(page_text):
                    for rect in page.search_for(match.group()):
                        page.add_redact_annot(rect,fill=(1,1,1),cross_out=False)
                        corrections['trackingParameters']+=1
                if 'Sanitizing-Check vor Veröffentlichung' in page_text and 'Suche nach:' in page_text:
                    for token in ('CodeX, Codex, ', 'ChatGPT, '):
                        for rect in page.search_for(token):
                            page.add_redact_annot(rect,fill=(1,1,1),cross_out=False)
                            corrections['productionChecklistTokens']+=1
                            approved_deletions.append(token)
                for link in page.get_links():
                    if PRIVATE.search(str(link.get('uri', link.get('file', '')))):
                        page.delete_link(link); corrections['privateLinks'] += 1; touched = True
                for line in page.get_text('dict')['blocks']:
                    if 'lines' not in line:
                        continue
                    for row in line['lines']:
                        joined = ''.join(span['text'] for span in row['spans'])
                        for match in PRIVATE.finditer(joined):
                            # Browser-print footers are isolated lines. Restrict
                            # redaction to the exact path rather than the footer.
                            for rect in page.search_for(match.group()):
                                page.add_redact_annot(rect, fill=(1, 1, 1), cross_out=False)
                                corrections['privateFooters'] += 1; touched = True
                if page.first_annot:
                    redactions = [a for a in page.annots() if a.type[0] == fitz.PDF_ANNOT_REDACT]
                    if redactions:
                        page.apply_redactions(images=0, graphics=0)
                # Preserve the scientist's citation using the conventional initial.
                # Use a replacement span with the original baseline and size.
                if 'Claude' in page.get_text():
                    spans = [s for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans']]
                    for rect in page.search_for('Claude'):
                        span = next((s for s in spans if fitz.Rect(s['bbox']).intersects(rect)), None)
                        if not span:
                            raise ValueError('Cannot locate author-name span')
                        context = page.get_textbox(fitz.Rect(max(0, rect.x0-100), rect.y0-2, min(page.rect.width, rect.x1+100), rect.y1+2))
                        if 'Shannon' not in context:
                            raise ValueError('Unreviewed producer reference in publication body')
                        page.add_redact_annot(rect, fill=(1, 1, 1), cross_out=False)
                        page.apply_redactions(images=0, graphics=0)
                        page.insert_text((rect.x0, span['origin'][1]), 'C.', fontsize=span['size'], fontname='helv', color=(0, 0, 0))
                        corrections['abbreviatedNames'] += 1; touched = True
            doc.save(preprocessed, garbage=4, deflate=True, no_new_id=True)
        stream_output = Path(temporary) / 'streams.pdf'
        corrections.update(replace_pdf(preprocessed, stream_output))
        reader = PdfReader(stream_output); writer = PdfWriter(); writer.clone_document_from_reader(reader)
        seen = set()
        def clean_object(obj):
            if id(obj) in seen:
                return
            seen.add(id(obj))
            if isinstance(obj, DictionaryObject):
                for key in list(obj):
                    if key == '/Metadata':
                        del obj[key]; continue
                    value = obj[key]
                    if isinstance(value, TextStringObject):
                        normalized = PRIVATE.sub('', text_normalized(str(value)))
                        if FORBIDDEN.search(normalized):
                            normalized = FORBIDDEN.sub('Redaktion', normalized)
                        obj[key] = TextStringObject(normalized)
                    elif isinstance(value, (DictionaryObject, ArrayObject)):
                        clean_object(value)
            elif isinstance(obj, ArrayObject):
                for i, value in enumerate(obj):
                    if isinstance(value, TextStringObject):
                        obj[i] = TextStringObject(PRIVATE.sub('', text_normalized(str(value))))
                    elif isinstance(value, (DictionaryObject, ArrayObject)):
                        clean_object(value)
        for obj in writer._objects:
            clean_object(obj)
        writer.add_metadata({'/Author': 'Natalie Weber', '/Creator': 'Natalie Weber', '/Producer': 'Natalie Weber'})
        intermediate = Path(temporary) / 'metadata.pdf'
        writer.write(intermediate)
        with fitz.open(intermediate) as doc:
            doc.save(target, garbage=4, deflate=True, no_new_id=True)
    after = inspect_pdf(target)
    # Inserting a shortened historical name may change extraction order. Compare
    # that one abbreviation separately; every other character must be retained.
    old_text=before['text']
    for token in approved_deletions:old_text=old_text.replace(token,'',1)
    old, new = comparable(old_text), comparable(after['text'])
    if corrections['abbreviatedNames']:
        old = old.replace('C.', ''); new = new.replace('C.', '')
    if old != new:
        import difflib
        changes = [x for x in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes() if x[0] != 'equal']
        raise ValueError('Text preservation failed: ' + str([(op, old[a:b][:80], new[c:d][:80]) for op,a,b,c,d in changes[:8]]))
    if after['pages'] != before['pages'] or after['dashes'] or after['forbidden'] or after['privatePaths']:
        raise ValueError('Publication hygiene verification failed: ' + str({k:v for k,v in after.items() if k not in ('text','metadata')}))
    if any(after['metadata'].get(k) != 'Natalie Weber' for k in ('author', 'creator', 'producer')):
        raise ValueError('Creator metadata not canonical')
    return dict(beforeSha256=sha(source), afterSha256=sha(target), beforeBytes=source.stat().st_size, afterBytes=target.stat().st_size, pages=after['pages'], textPreserved=True, corrections=corrections)

def run_item(item):
    try:
        return dict(path=item['path'], status='verified', **scrub_pdf(item['source'], item['target']))
    except Exception as error:
        return dict(path=item['path'], status='failed', error=str(error))

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--manifest',required=True);parser.add_argument('--report',required=True);parser.add_argument('--workers',type=int,default=4)
    args=parser.parse_args();items=json.loads(Path(args.manifest).read_text());results=[]
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers) as pool:
        for result in pool.map(run_item,items):
            results.append(result)
            if result['status']=='failed' or len(results)%25==0:
                print(json.dumps(dict(completed=len(results),total=len(items),**{k:v for k,v in result.items() if k in ('path','status','error')}),ensure_ascii=False),flush=True)
            Path(args.report).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    raise SystemExit(any(r['status']=='failed' for r in results))

if __name__=='__main__':
    main()
