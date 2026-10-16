import html,json,re,sys
from pathlib import Path

def inline(text: str) -> str:
    """Inline-Markdown → HTML. Erst escapen, dann Muster ersetzen."""
    t = html.escape(text, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)
    return t


def md_to_html(md: str) -> str:
    md=re.sub(r'\A---\n.*?\n---\n', '', md, flags=re.S)
    out, para, liste, list_tag = [], [], [], None

    def flush_para():
        nonlocal para
        if para:
            joined = ""
            for i, line in enumerate(para):
                hard = line.endswith("  ")
                joined += inline(line.strip()) + ("<br>" if hard and i < len(para) - 1 else " ")
            out.append("<p>" + joined.strip() + "</p>")
            para = []

    def flush_list():
        nonlocal liste, list_tag
        if liste:
            out.append(f"<{list_tag}>" + "".join(f"<li>{inline(i)}</li>" for i in liste) + f"</{list_tag}>")
            liste, list_tag = [], None

    for raw in md.splitlines():
        line = raw.rstrip("\n")
        if not line.strip():
            flush_para(); flush_list(); continue
        m = re.match(r"^(#{1,4})\s+(.*)$", line)
        if m:
            flush_para(); flush_list()
            lvl = len(m.group(1))
            title=m.group(2).strip(); anchor=title.lower().replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss'); anchor=re.sub(r'[^a-z0-9 -]','',anchor); anchor=re.sub(r'[ -]+','-',anchor).strip('-')
            out.append(f'<h{lvl} id="{anchor}">{inline(title)}</h{lvl}>')
            continue
        m_ul = re.match(r"^\s*[-*]\s+(.*)$", line)
        m_ol = re.match(r"^\s*\d+\.\s+(.*)$", line)
        if m_ul or m_ol:
            flush_para()
            tag = "ul" if m_ul else "ol"
            if list_tag and list_tag != tag:
                flush_list()
            list_tag = tag
            liste.append((m_ul or m_ol).group(1).strip())
            continue
        if liste:
            flush_list()
        para.append(line)
    flush_para(); flush_list()
    return "\n".join(out)


p=Path(__file__).resolve().parents[2]/'content/wirkungslexikon'
mapping={'startseite':'texte/STARTSEITE_V3.md','fuer_redaktionen':'texte/FUER_REDAKTIONEN_V3.md','methodik_fuer_leser':'texte/03_METHODIK_FUER_LESER.md','schwerpunkt_afd':'texte/02_SCHWERPUNKT_AFD.md','schwerpunkt_ifr':'texte/04_SCHWERPUNKT_INSTITUT_FUER_REMIGRATION.md','methodik':'LEXIKON_METHODIK_v3.md'}
if '--public' in sys.argv:
    mapping['schwerpunkt_ifr']='texte/04_SCHWERPUNKT_INSTITUT_FUER_REMIGRATION_PUBLIC.md'
print(json.dumps({k:md_to_html((p/f).read_text()) for k,f in mapping.items()},ensure_ascii=False))
