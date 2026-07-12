#!/usr/bin/env python3
"""
Baut aus einer Grundlagen-PDF (WÖMM 2.0 / WÖMS 2.0) eine zitierbare HTML-Onlinefassung:
- ein Kapitel = eine eigene Seite mit eigener URL (zitierbar)
- jede Überschrift bekommt einen Copy-Anker (cite-anchor), damit einzelne Abschnitte
  direkt verlinkt/zitiert werden können
- EIN Inhaltsverzeichnis (Übersichtsseite), keine Dopplung auf den Kapitelseiten
- PDF bleibt als Download erhalten; Onlinefassung ist die Lesefassung

Quelle ist ausschließlich die PDF (kein Markdown) -> Text via PyMuPDF (fitz),
Gliederung via PDF-Inhaltsverzeichnis (get_toc).

Aufruf:  python3 scripts/library/build_grundlagen_onlinefassung.py <doc-key>
         doc-key: woemm-2-0 | woems-2-0 | all
Ausgabe: bibliothek/eintraege/<doc-key>/lesen/            (Übersicht + Kapitelseiten)
"""
import sys, os, re, html, json, unicodedata
import fitz

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

DOCS = {
    "woemm-2-0": {
        "pdf": "assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf",
        "title": "Das Wirkungsökonomische Managementmodell",
        "short": "WÖMM 2.0",
        "chapter_level": 1,          # oberste TOC-Ebene = Kapitelseite
    },
    "woems-2-0": {
        "pdf": "assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf",
        "title": "Das Wirkungsökonomische Methodensystem",
        "short": "WÖMS 2.0",
        "chapter_level": 2,          # Teil=1 (Gruppe), Kapitel=2 = Kapitelseite
    },
}

# Kopf-/Fußzeilen-Zeilen, die auf jeder PDF-Seite wiederkehren und raus müssen
def is_running_line(ln, short):
    s = ln.strip()
    if not s:
        return True
    if re.fullmatch(r"Seite\s+\d+", s):
        return True
    if s.startswith(short):                       # "WÖMM 2.0 | ..."
        return True
    if re.fullmatch(r"Natalie Weber\s*·.*", s):
        return True
    if s in ("Wirkung statt Kapital", "Wirkung verstehen · gestalten · rückkoppeln"):
        return True
    return False


def slugify(t):
    t = unicodedata.normalize("NFKD", t)
    t = t.replace("ö", "oe").replace("ä", "ae").replace("ü", "ue").replace("ß", "ss")
    t = t.encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return re.sub(r"-+", "-", t) or "abschnitt"


def esc(s):
    return html.escape(s, quote=True)


HEADER = '''    <header class="site-header" data-search-exclude>
      <a class="brand" href="{r}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="{r}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="{r}index.html">Start</a>
        <a href="{r}verstehen/">Verstehen</a>
        <a href="{r}fuer/">Für wen?</a>
        <a href="{r}wirkungsfelder/">Wirkungsfelder</a>
        <a href="{r}werkzeuge/">Praxis &amp; Tools</a>
        <a href="{r}oeffentlicher-wirkungsraum/">Debatte &amp; Radar</a>
        <a href="{r}lernen/">Lernen</a>
        <a href="{r}bibliothek/" aria-current="page">Bibliothek</a>
        <a href="{r}mitmachen.html">Mitmachen</a>
      </nav>
    </header>'''


def page_shell(r, title, desc, body, css_v="20260712-reader"):
    return f'''<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(title)} | Bibliothek der Wirkungsökonomie</title>
    <meta name="description" content="{esc(desc)}">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Onlinefassung">
    <link rel="stylesheet" href="{r}assets/css/style.css?v={css_v}">
  </head>
  <body>
{HEADER.format(r=r)}
    <main class="section" data-pagefind-body>
{body}
    </main>
    <script src="{r}assets/js/main.js?v={css_v}"></script>
  </body>
</html>'''


def clean_paragraphs(text, short):
    """Rohtext eines Abschnitts -> Liste von Absätzen (laufende Zeilen entfernt,
    weiche Zeilenumbrüche zu Absätzen zusammengefügt)."""
    lines = [l for l in text.splitlines() if not is_running_line(l, short)]
    paras, buf = [], []
    for ln in lines:
        s = ln.strip()
        if not s:
            if buf:
                paras.append(" ".join(buf)); buf = []
            continue
        buf.append(s)
        # Absatzende heuristisch: Satzzeichen am Zeilenende + nächste Zeile beginnt groß
        if s.endswith((".", ":", "!", "?")) and len(s) > 40:
            paras.append(" ".join(buf)); buf = []
    if buf:
        paras.append(" ".join(buf))
    # Mini-Fragmente (Seitenzahlen-Reste) verwerfen
    return [p for p in paras if len(p) > 2]


def build_doc(key):
    cfg = DOCS[key]
    pdf = fitz.open(os.path.join(ROOT, cfg["pdf"]))
    toc = pdf.get_toc()                      # [ [level, title, page(1-based)], ... ]
    npages = pdf.page_count
    short = cfg["short"]
    clvl = cfg["chapter_level"]

    # Kapitelgrenzen = TOC-Einträge auf chapter_level (bzw. <= für Frontmatter auf lvl1)
    chapters = []
    for i, (lvl, title, page) in enumerate(toc):
        if lvl <= clvl:
            chapters.append({"idx": len(chapters), "lvl": lvl, "title": title.strip(),
                             "page": page - 1, "subs": []})
        elif chapters:
            chapters[-1]["subs"].append({"lvl": lvl, "title": title.strip(), "page": page - 1})
    # Endseite je Kapitel = Startseite des nächsten Kapitels
    for i, ch in enumerate(chapters):
        ch["end"] = chapters[i + 1]["page"] if i + 1 < len(chapters) else npages

    outdir = os.path.join(ROOT, "bibliothek", "eintraege", key, "lesen")
    os.makedirs(outdir, exist_ok=True)
    r = "../../../../"                        # /bibliothek/eintraege/<key>/lesen/ -> root

    made = []
    for ch in chapters:
        # Rohtext des Kapitels (seitengranular)
        raw = "\n".join(pdf[p].get_text() for p in range(ch["page"], max(ch["end"], ch["page"] + 1)))
        slug = f'{ch["idx"]:02d}-{slugify(ch["title"])[:60]}'
        ch["slug"] = slug

        # In Unterabschnitte splitten anhand der Sub-Überschriften (verbatim im Text)
        blocks = []
        if ch["subs"]:
            positions = []
            for sub in ch["subs"]:
                m = re.search(re.escape(sub["title"][:50]), raw)
                positions.append((m.start() if m else None, sub))
            # Intro vor erster Sub-Überschrift
            first = next((p for p, _ in positions if p is not None), None)
            if first is None or first > 0:
                intro = raw[:first] if first else raw
                # Teil-Trenner + wiederholte Kapitelüberschrift am Anfang entfernen
                ti = intro.rfind(ch["title"])
                if ti != -1:
                    intro = intro[ti + len(ch["title"]):]
                blocks.append((None, intro))
            valid = [(p, s) for p, s in positions if p is not None]
            for j, (pos, sub) in enumerate(valid):
                nxt = valid[j + 1][0] if j + 1 < len(valid) else len(raw)
                seg = raw[pos:nxt]
                seg = seg.split("\n", 1)[1] if "\n" in seg else seg   # Überschriftzeile weg
                blocks.append((sub["title"], seg))
        else:
            intro = raw
            ti = intro.find(ch["title"])
            if ti != -1:
                intro = intro[ti + len(ch["title"]):]
            blocks.append((None, intro))

        # HTML des Kapitelinhalts
        parts = []
        for subtitle, seg in blocks:
            if subtitle:
                sid = slugify(subtitle)[:60]
                parts.append(
                    f'<h2 id="{sid}" class="reader-heading">{esc(subtitle)}'
                    f'<a class="cite-anchor" href="#{sid}" aria-label="Abschnitt verlinken" data-copy-anchor>#</a></h2>')
            for para in clean_paragraphs(seg, short):
                parts.append(f"<p>{esc(para)}</p>")
        content = "\n            ".join(parts) if parts else "<p>Inhalt wird ergänzt.</p>"

        # Prev/Next
        prev_ch = chapters[ch["idx"] - 1] if ch["idx"] > 0 else None
        next_ch = chapters[ch["idx"] + 1] if ch["idx"] + 1 < len(chapters) else None
        rc = r + "../"   # Kapitelseite liegt eine Ebene tiefer als die Übersicht
        nav = ['<nav class="chapter-bottom-nav" aria-label="Kapitelnavigation">']
        nav.append(f'<a class="btn btn-secondary" href="../">Inhaltsübersicht</a>')
        if prev_ch:
            nav.append(f'<a class="btn btn-secondary" href="../{prev_ch["slug"] if "slug" in prev_ch else str(prev_ch["idx"]).zfill(2)}-{slugify(prev_ch["title"])[:60]}/">← {esc(prev_ch["title"][:40])}</a>')
        if next_ch:
            nav.append(f'<a class="btn btn-primary" href="../{str(next_ch["idx"]).zfill(2)}-{slugify(next_ch["title"])[:60]}/">{esc(next_ch["title"][:40])} →</a>')
        nav.append("</nav>")

        body = f'''      <article class="article-shell reference-reader chapter-reader">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="{rc}bibliothek/">Bibliothek</a> / <a href="../../">{esc(cfg["short"])}</a> / <a href="../">Onlinefassung</a> / Abschnitt {ch["idx"] + 1}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">{esc(cfg["short"])} · Onlinefassung · Abschnitt {ch["idx"] + 1} von {len(chapters)}</p>
          <h1 id="kapitel" class="reader-heading">{esc(ch["title"])}<a class="cite-anchor" href="#kapitel" aria-label="Kapitel verlinken" data-copy-anchor>#</a></h1>
          <div class="chapter-reader-tools">
            <a class="btn btn-secondary" href="{rc}{cfg['pdf']}">PDF-Fassung</a>
            <button class="btn btn-secondary" type="button" data-copy-current-url>Seitenlink kopieren</button>
          </div>
        </header>
        <div class="reader-body">
            {content}
        </div>
        {''.join(nav)}
      </article>'''
        outpath = os.path.join(outdir, slug)
        os.makedirs(outpath, exist_ok=True)
        with open(os.path.join(outpath, "index.html"), "w") as f:
            f.write(page_shell(r + "../", ch["title"] + " – " + cfg["short"],
                               f'{cfg["title"]}, {cfg["short"]}: {ch["title"]}. Zitierbare Onlinefassung.',
                               body))
        made.append(ch)

    # EINE Inhaltsübersicht (kein doppeltes IV auf den Kapitelseiten)
    toc_items = []
    cur_group = None
    for ch in made:
        subs = "".join(f'<li><a href="{ch["slug"]}/#{slugify(s["title"])[:60]}">{esc(s["title"])}</a></li>'
                       for s in ch["subs"][:12])
        toc_items.append(
            f'<li class="reader-toc-chapter"><a class="reader-toc-link" href="{ch["slug"]}/"><span class="reader-toc-num">{ch["idx"] + 1}</span> {esc(ch["title"])}</a>'
            + (f'<ul class="reader-toc-subs">{subs}</ul>' if subs else "") + "</li>")
    overview = f'''      <article class="article-shell reference-reader">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="{r}bibliothek/">Bibliothek</a> / <a href="../">{esc(cfg["short"])}</a> / Onlinefassung</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">{esc(cfg["short"])} · Onlinefassung</p>
          <h1>{esc(cfg["title"])}</h1>
          <p class="lead">Zitierbare Lesefassung – {len(made)} Kapitel, jedes mit eigener, verlinkbarer Adresse.</p>
          <div class="chapter-reader-tools">
            <a class="btn btn-primary" href="{made[0]['slug']}/">Von vorn lesen</a>
            <a class="btn btn-secondary" href="{r}{cfg['pdf']}">PDF-Fassung</a>
          </div>
        </header>
        <section class="term-section-card">
          <p class="section-eyebrow">Inhalt</p>
          <h2>Inhaltsverzeichnis</h2>
          <ol class="reader-toc">
            {"".join(toc_items)}
          </ol>
        </section>
      </article>'''
    with open(os.path.join(outdir, "index.html"), "w") as f:
        f.write(page_shell(r, cfg["title"] + " – Onlinefassung",
                           f'Zitierbare Onlinefassung von {cfg["title"]}, {cfg["short"]}.', overview))

    print(f"{key}: {len(made)} Kapitelseiten + 1 Inhaltsübersicht -> bibliothek/eintraege/{key}/lesen/")
    return len(made)


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    keys = list(DOCS) if which == "all" else [which]
    for k in keys:
        build_doc(k)
