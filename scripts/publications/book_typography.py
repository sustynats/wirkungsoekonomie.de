"""Preserve source text while avoiding a verified Graphite PDF glyph mapping bug."""
from copy import deepcopy
import re
from docx.oxml.ns import qn
from docx.text.run import Run

UMLAUT_LIGATURE = re.compile(r'\w*fl[äöü]\w*', re.IGNORECASE)


def format_umlaut_ligatures(doc):
    """Give only affected words a font with correct searchable PDF characters.

    Linux Libertine G renders these ligatures correctly but the native PDF
    exporter can repeat the following umlaut in its Unicode map. Disabling
    Word ligatures did not fix the real round-trip fixture. Changing the font
    of the complete affected word preserves its spelling and surrounding type.
    """
    changed = 0
    words = set()
    for node in list(doc.element.xpath('.//w:r')):
        original = Run(node, None).text
        if not UMLAUT_LIGATURE.search(original):
            continue
        replacements = []
        for child in list(node):
            if child.tag == qn('w:rPr'):
                continue
            parts = re.split('(' + UMLAUT_LIGATURE.pattern + ')', child.text or '',
                             flags=re.IGNORECASE) if child.tag == qn('w:t') else [None]
            for part in parts:
                if part == '':
                    continue
                copy = deepcopy(node)
                for item in list(copy):
                    if item.tag != qn('w:rPr'):
                        copy.remove(item)
                run = Run(copy, None)
                if part is None:
                    copy.append(deepcopy(child))
                else:
                    run.add_text(part)
                if part is not None and UMLAUT_LIGATURE.fullmatch(part):
                    fonts = run._r.get_or_add_rPr().get_or_add_rFonts()
                    for name in ['ascii', 'hAnsi', 'eastAsia', 'cs']:
                        fonts.set(qn('w:' + name), 'DejaVu Serif')
                    changed += 1
                    words.add(part)
                node.addprevious(copy)
                replacements.append(run.text)
        if ''.join(replacements) != original:
            raise RuntimeError('Umlaut-ligature font repair changed source text')
        node.getparent().remove(node)
    return {'wordRuns': changed, 'affectedWords': sorted(words), 'sourceTextUnchanged': True}
