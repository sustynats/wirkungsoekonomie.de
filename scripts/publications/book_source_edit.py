"""Replace reviewed paragraph text while preserving explicitly bound figures."""
from copy import deepcopy
from pathlib import PurePosixPath
import re
from docx.oxml.ns import qn


def public_text(text):
    return re.sub('[\u2010\u2011\u2012\u2013\u2014\u2212]', '-', text).replace('\u00ad', '')


def replace_paragraph(paragraph, text, prefix_image=None):
    if paragraph._p.xpath('.//w:footnoteReference | .//w:endnoteReference'):
        raise RuntimeError('Note reference needs separate review')
    drawings = paragraph._p.xpath('.//w:drawing')
    drawing_xml = drawings[0].xml if len(drawings) == 1 else None
    preserved = None
    text_run = paragraph.runs[0] if paragraph.runs else None
    if drawings:
        if prefix_image is None:
            raise RuntimeError('Embedded object needs separate review: ' + paragraph.text[:90])
        children = [node for node in paragraph._p if node.tag != qn('w:pPr')]
        if (len(children) != 2 or any(node.tag != qn('w:r') for node in children)
                or len(drawings) != 1 or children[0].xpath('.//w:t')
                or not children[0].xpath('./w:drawing/wp:inline')
                or children[1].xpath('.//w:drawing')):
            raise RuntimeError('Unknown figure-and-text paragraph structure')
        if any(node.tag not in (qn('w:rPr'), qn('w:drawing')) for node in children[0]):
            raise RuntimeError('Unknown object beside the reviewed prefix figure')
        blips = drawings[0].xpath('.//a:blip')
        if len(blips) != 1:
            raise RuntimeError('Unknown prefix figure relationship')
        rid = blips[0].get(qn('r:embed'))
        relationship = paragraph.part.rels.get(rid)
        if (relationship is None or not relationship.reltype.endswith('/image')
                or PurePosixPath(str(relationship.target_part.partname)).name != prefix_image):
            raise RuntimeError('Unexpected prefix figure source')
        preserved = deepcopy(children[0])
        text_run = paragraph.runs[1]
    elif prefix_image is not None:
        raise RuntimeError('Expected reviewed prefix figure is missing')
    formatting = deepcopy(text_run._r.rPr) if text_run is not None and text_run._r.rPr is not None else None
    paragraph.clear()
    if preserved is not None:
        paragraph._p.append(preserved)
    run = paragraph.add_run(public_text(text))
    if formatting is not None:
        run._r.insert(0, formatting)
    if preserved is not None and paragraph._p.xpath('.//w:drawing')[0].xml != drawing_xml:
        raise RuntimeError('Reviewed embedded figure changed during text replacement')
