#!/usr/bin/env python3
"""
Registry-getriebener Generator für zitierbare HTML-Onlinefassungen ALLER PDF-only
Bibliothekswerke (verallgemeinert aus build_grundlagen_onlinefassung.py).

Für jedes Dokument:
- Kapitel-Lesefassung, wenn das PDF ein brauchbares Inhaltsverzeichnis hat
  (auto: Teil-/Part-Struktur -> Kapitel = TOC-Ebene 2, sonst Ebene 1); jede
  Kapitelseite mit eigener URL + Copy-Anker.
- Fallback (kein/zu dünnes TOC): EINE Lesefassungs-Seite mit dem vollständigen
  Text, Überschriften heuristisch als Anker.
- Generische Laufzeilen-/Fußzeilen-Erkennung (Zeilen, die auf vielen Seiten
  wiederkehren, werden entfernt).

Quellen: assets/data/library-version-registry.json (documents, urls.primary),
         assets/data/library-source-details.json (id -> detailSlug).
Ausgabe: bibliothek/eintraege/<detailSlug>/lesen/

Aufruf:
  python3 scripts/library/build_bibliothek_onlinefassungen.py wave1
  python3 scripts/library/build_bibliothek_onlinefassungen.py <id1,id2,...>
  python3 scripts/library/build_bibliothek_onlinefassungen.py all-standalone
"""
import sys, os, re, html, unicodedata
from collections import Counter
import fitz

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
REG = os.path.join(ROOT, "assets/data/library-version-registry.json")
DET = os.path.join(ROOT, "assets/data/library-source-details.json")

# Bereits erledigt (eigener, handkuratierter Generator)
ALREADY = {"woemm-2-0", "woems-2-0"}
# Welle 1: hochwertige eigenständige Werke zuerst
WAVE1_TYPES = {"Grundlagenwerk", "Whitepaper", "Gesetzesentwurf", "Leitbild"}


def esc(s):
    return html.escape(s or "", quote=True)


def slugify(t):
    t = unicodedata.normalize("NFKD", t or "")
    t = t.replace("ö", "oe").replace("ä", "ae").replace("ü", "ue").replace("ß", "ss")
    t = t.encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return re.sub(r"-+", "-", t) or "abschnitt"


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


def page_shell(r, title, desc, body, css_v="20260612-mobile-table-fix"):
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


def running_lines(pdf):
    """Zeilen, die auf vielen Seiten wiederkehren (Kopf-/Fußzeilen) + Seitenzahlen."""
    cnt = Counter()
    n = pdf.page_count
    for p in range(n):
        for ln in pdf[p].get_text().splitlines():
            s = ln.strip()
            if s and len(s) < 90:
                cnt[s] += 1
    thr = max(3, int(0.30 * n))
    return {s for s, c in cnt.items() if c >= thr}


_LEAK = re.compile(r"file://\S+|/(?:var|private|Users|home|tmp|opt)/\S+|[A-Za-z]:\\[\\\S]+")


def sanitize(s):
    """Entfernt lokale Pfad-/file://-Leaks aus PDF-extrahiertem Text (Privacy-Gate)."""
    return re.sub(r"\s{2,}", " ", _LEAK.sub("", s)).strip()


def clean_paragraphs(text, running):
    lines = []
    for ln in text.splitlines():
        s = ln.strip()
        if not s or s in running or re.fullmatch(r"(Seite\s+)?\d{1,4}", s):
            lines.append("")  # als Absatztrenner behandeln
        else:
            lines.append(s)
    paras, buf = [], []
    for s in lines:
        if not s:
            if buf:
                paras.append(" ".join(buf)); buf = []
            continue
        buf.append(s)
        if s.endswith((".", ":", "!", "?", "”", "“")) and len(s) > 40:
            paras.append(" ".join(buf)); buf = []
    if buf:
        paras.append(" ".join(buf))
    return [q for q in (sanitize(p) for p in paras) if len(q) > 2]


def detect_chapter_level(toc):
    if not toc or len(toc) < 3:
        return None  # Fallback: Einzelseite
    lvl1 = [t for t in toc if t[0] == 1]
    if len(lvl1) < 2:
        return None
    if any(re.match(r"^(Teil|Part)\b", (t[1] or "").strip(), re.I) for t in lvl1) \
            and any(t[0] == 2 for t in toc):
        return 2
    return 1


def font_chapters(pdf, running):
    """Kapitelgrenzen ohne PDF-TOC: größte Überschriften-Schriftgröße als Kapitel.
    Rückgabe: [(title, page_index), ...] oder None, wenn zu wenig erkennbar."""
    lines = []
    for pno in range(pdf.page_count):
        try:
            d = pdf[pno].get_text("dict")
        except Exception:
            continue
        for b in d.get("blocks", []):
            for l in b.get("lines", []):
                txt = "".join(s.get("text", "") for s in l.get("spans", [])).strip()
                if not txt:
                    continue
                size = max((s.get("size", 0) for s in l.get("spans", [])), default=0)
                bold = any("bold" in (s.get("font", "").lower()) for s in l.get("spans", []))
                lines.append((round(size, 1), bold, txt, pno))
    if not lines:
        return None
    body = Counter(sz for sz, _, _, _ in lines).most_common(1)[0][0]

    def is_head(sz, bold, txt):
        if not (3 < len(txt) < 95) or txt in running:
            return False
        if txt.endswith((".", ",", ";", ":")) and not re.match(r"^(§|Art\.|Artikel|Kapitel|Teil|Abschnitt)\b", txt):
            return False
        return sz >= round(body * 1.15, 1) or (bold and sz >= round(body * 1.05, 1)
                                               and re.match(r"^(§|Art\.|Artikel|Kapitel|Teil|Abschnitt|\d+[.\)]|[A-Z]\d)", txt))

    heads = [(sz, txt, pno) for sz, bold, txt, pno in lines if is_head(sz, bold, txt)]
    if len(heads) < 3:
        return None
    top = max(sz for sz, _, _ in heads)
    chapters = [(txt, pno) for sz, txt, pno in heads if sz >= top - 0.1]
    if len(chapters) < 3:
        sizes = sorted({sz for sz, _, _ in heads}, reverse=True)
        keep = set(sizes[:2])
        chapters = [(txt, pno) for sz, txt, pno in heads if sz in keep]
    # Duplikate/Direkt-Folge auf gleicher Seite zusammenfassen: nur erste je Seitenstart
    seen, out = set(), []
    for txt, pno in chapters:
        key = (txt, pno)
        if key in seen:
            continue
        seen.add(key)
        out.append((txt, pno))
    return out if len(out) >= 3 else None


def pattern_chapters(pdf, running):
    """Struktur-Marker als Kapitel, wenn Font-Erkennung versagt: § N, Artikel N,
    Kapitel/Teil/Abschnitt N, oder dezimale Top-Nummerierung '1 Titel' (ohne Punkt)."""
    full = "\n".join(pdf[p].get_text() for p in range(pdf.page_count))
    lines = [l.strip() for l in full.splitlines()]
    pats = [
        r"^§\s*\d+[a-z]?\b.{0,80}",
        r"^Artikel\s+\d+\b.{0,80}",
        r"^(Kapitel|Teil|Abschnitt)\s+[\dIVXLC]+\b.{0,80}",
        r"^\d+\s+[A-ZÄÖÜ].{2,80}$",
    ]
    chosen = None
    for pat in pats:
        hits = [l for l in lines if re.match(pat, l) and l not in running and len(l) < 95]
        # dedup direkte Wiederholungen
        uniq = [h for i, h in enumerate(hits) if i == 0 or hits[i - 1] != h]
        if len(uniq) >= 3:
            chosen = pat
            break
    if not chosen:
        return None
    out, seen = [], None
    for m in re.finditer(chosen, full, re.M):
        t = m.group(0).strip()
        if t in running or not (3 < len(t) < 95) or t == seen:
            continue
        seen = t
        out.append((t, 0))
    return out if len(out) >= 3 else None


def build_one(pdf_path, detail_slug, title, short):
    pdf = fitz.open(pdf_path)
    running = running_lines(pdf)
    toc = pdf.get_toc()
    clvl = detect_chapter_level(toc)
    outdir = os.path.join(ROOT, "bibliothek", "eintraege", detail_slug, "lesen")
    os.makedirs(outdir, exist_ok=True)
    rel_pdf = os.path.relpath(os.path.join(ROOT, pdf_path), ROOT)

    # Kapitel-Seeds bestimmen: aus TOC oder (bei langem TOC-losem PDF) aus Schriftgrößen
    font_seeds = None
    if clvl is None and pdf.page_count > 8:
        font_seeds = font_chapters(pdf, running) or pattern_chapters(pdf, running)

    # ---- Fallback: eine einzige Lesefassungs-Seite (kurz + kein TOC + keine Font-Kapitel) ----
    if clvl is None and not font_seeds:
        r = "../../../../"
        raw = "\n".join(pdf[p].get_text() for p in range(pdf.page_count))
        paras = clean_paragraphs(raw, running)
        content = "\n            ".join(f"<p>{esc(p)}</p>" for p in paras) or "<p>Inhalt wird ergänzt.</p>"
        body = f'''      <article class="article-shell reference-reader chapter-reader">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="{r}bibliothek/">Bibliothek</a> / <a href="../">{esc(title)}</a> / Onlinefassung</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Onlinefassung</p>
          <h1 id="text" class="reader-heading">{esc(title)}<a class="cite-anchor" href="#text" aria-label="Verlinken" data-copy-anchor>#</a></h1>
          <div class="chapter-reader-tools">
            <a class="btn btn-secondary" href="{r}{esc(rel_pdf)}">PDF-Fassung</a>
            <button class="btn btn-secondary" type="button" data-copy-current-url>Seitenlink kopieren</button>
          </div>
        </header>
        <div class="reader-body">
            {content}
        </div>
      </article>'''
        with open(os.path.join(outdir, "index.html"), "w") as f:
            f.write(page_shell(r, title + " – Onlinefassung",
                               f"Zitierbare Onlinefassung von {title}.", body))
        return 1  # eine Seite

    # ---- Kapitel-Lesefassung ----
    npages = pdf.page_count
    chapters = []
    if clvl is not None:
        for lvl, t, page in toc:
            t = (t or "").strip()
            if lvl <= clvl:
                chapters.append({"idx": len(chapters), "title": t, "page": page - 1, "subs": []})
            elif chapters and lvl == clvl + 1:
                chapters[-1]["subs"].append({"title": t, "page": page - 1})
    else:  # aus Schriftgrößen erkannte Kapitel (kein PDF-TOC) -> per Text-Position splitten
        full = "\n".join(pdf[p].get_text() for p in range(npages))
        valid = []
        for t, _pno in font_seeds:
            m = re.search(re.escape(t.strip()[:60]), full)
            if m:
                valid.append((m.start(), t.strip()))
        valid.sort()
        for k, (pos, t) in enumerate(valid):
            nxt = valid[k + 1][0] if k + 1 < len(valid) else len(full)
            seg = full[pos:nxt]
            seg = seg.split("\n", 1)[1] if "\n" in seg else seg  # Überschriftzeile weg
            chapters.append({"idx": len(chapters), "title": t, "page": 0, "subs": [], "text": seg})
    for i, ch in enumerate(chapters):
        ch["end"] = chapters[i + 1]["page"] if i + 1 < len(chapters) else npages
        ch["slug"] = f'{ch["idx"]:02d}-{slugify(ch["title"])[:60]}'

    r = "../../../../"
    for ch in chapters:
        rc = r + "../"
        raw = ch.get("text") or "\n".join(pdf[p].get_text() for p in range(ch["page"], max(ch["end"], ch["page"] + 1)))
        blocks = []
        if ch["subs"]:
            positions = []
            for sub in ch["subs"]:
                m = re.search(re.escape(sub["title"][:50]), raw)
                positions.append((m.start() if m else None, sub))
            first = next((p for p, _ in positions if p is not None), None)
            intro = raw[:first] if first else (raw if first is None else "")
            ti = intro.rfind(ch["title"])
            if ti != -1:
                intro = intro[ti + len(ch["title"]):]
            if intro.strip():
                blocks.append((None, intro))
            valid = [(p, s) for p, s in positions if p is not None]
            for j, (pos, sub) in enumerate(valid):
                nxt = valid[j + 1][0] if j + 1 < len(valid) else len(raw)
                seg = raw[pos:nxt]
                seg = seg.split("\n", 1)[1] if "\n" in seg else seg
                blocks.append((sub["title"], seg))
        else:
            intro = raw
            ti = intro.find(ch["title"])
            if ti != -1:
                intro = intro[ti + len(ch["title"]):]
            blocks.append((None, intro))

        parts = []
        for subtitle, seg in blocks:
            if subtitle:
                sid = slugify(subtitle)[:60]
                parts.append(f'<h2 id="{sid}" class="reader-heading">{esc(subtitle)}'
                             f'<a class="cite-anchor" href="#{sid}" aria-label="Abschnitt verlinken" data-copy-anchor>#</a></h2>')
            for para in clean_paragraphs(seg, running):
                parts.append(f"<p>{esc(para)}</p>")
        content = "\n            ".join(parts) if parts else "<p>Inhalt wird ergänzt.</p>"

        prev_ch = chapters[ch["idx"] - 1] if ch["idx"] > 0 else None
        next_ch = chapters[ch["idx"] + 1] if ch["idx"] + 1 < len(chapters) else None
        nav = ['<nav class="chapter-bottom-nav" aria-label="Kapitelnavigation">',
               '<a class="btn btn-secondary" href="../">Inhaltsübersicht</a>']
        if prev_ch:
            nav.append(f'<a class="btn btn-secondary" href="../{prev_ch["slug"]}/">← {esc(prev_ch["title"][:40])}</a>')
        if next_ch:
            nav.append(f'<a class="btn btn-primary" href="../{next_ch["slug"]}/">{esc(next_ch["title"][:40])} →</a>')
        nav.append("</nav>")

        body = f'''      <article class="article-shell reference-reader chapter-reader">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="{rc}bibliothek/">Bibliothek</a> / <a href="../../">{esc(short)}</a> / <a href="../">Onlinefassung</a> / Abschnitt {ch["idx"] + 1}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">{esc(short)} · Onlinefassung · Abschnitt {ch["idx"] + 1} von {len(chapters)}</p>
          <h1 id="kapitel" class="reader-heading">{esc(ch["title"])}<a class="cite-anchor" href="#kapitel" aria-label="Kapitel verlinken" data-copy-anchor>#</a></h1>
          <div class="chapter-reader-tools">
            <a class="btn btn-secondary" href="{rc}{esc(rel_pdf)}">PDF-Fassung</a>
            <button class="btn btn-secondary" type="button" data-copy-current-url>Seitenlink kopieren</button>
          </div>
        </header>
        <div class="reader-body">
            {content}
        </div>
        {''.join(nav)}
      </article>'''
        cdir = os.path.join(outdir, ch["slug"])
        os.makedirs(cdir, exist_ok=True)
        with open(os.path.join(cdir, "index.html"), "w") as f:
            f.write(page_shell(r + "../", ch["title"] + " – " + short,
                               f'{title}: {ch["title"]}. Zitierbare Onlinefassung.', body))

    toc_items = []
    for ch in chapters:
        subs = "".join(f'<li><a href="{ch["slug"]}/#{slugify(s["title"])[:60]}">{esc(s["title"])}</a></li>'
                       for s in ch["subs"][:12])
        toc_items.append(
            f'<li class="reader-toc-chapter"><a class="reader-toc-link" href="{ch["slug"]}/"><span class="reader-toc-num">{ch["idx"] + 1}</span> {esc(ch["title"])}</a>'
            + (f'<ul class="reader-toc-subs">{subs}</ul>' if subs else "") + "</li>")
    overview = f'''      <article class="article-shell reference-reader">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="{r}bibliothek/">Bibliothek</a> / <a href="../">{esc(short)}</a> / Onlinefassung</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Onlinefassung</p>
          <h1>{esc(title)}</h1>
          <p class="lead">Zitierbare Lesefassung – {len(chapters)} Kapitel, jedes mit eigener, verlinkbarer Adresse.</p>
          <div class="chapter-reader-tools">
            <a class="btn btn-primary" href="{chapters[0]['slug']}/">Von vorn lesen</a>
            <a class="btn btn-secondary" href="{r}{esc(rel_pdf)}">PDF-Fassung</a>
          </div>
        </header>
        <section class="term-section-card">
          <p class="section-eyebrow">Inhalt</p>
          <h2>Inhaltsverzeichnis</h2>
          <ol class="reader-toc">{"".join(toc_items)}</ol>
        </section>
      </article>'''
    with open(os.path.join(outdir, "index.html"), "w") as f:
        f.write(page_shell(r, title + " – Onlinefassung",
                           f"Zitierbare Onlinefassung von {title}.", overview))
    return len(chapters)


def short_label(title):
    m = re.search(r"\b(W[ÖO]M[MS]\s*[\d.]+|WÖk)\b", title)
    return m.group(1) if m else (title[:32] + ("…" if len(title) > 32 else ""))


def load_data():
    import json
    reg = json.load(open(REG))["documents"]
    det = {e["id"]: e.get("detailSlug") for e in json.load(open(DET)).get("entries", [])}
    tbl = {e["title"]: e.get("detailSlug") for e in json.load(open(DET)).get("entries", [])}
    return reg, det, tbl


def select(mode, reg):
    import re as _re
    def is_pdf_only(x):
        p = ((x.get("urls") or {}).get("primary") or "").lower()
        return p.endswith(".pdf")
    docs = [x for x in reg if is_pdf_only(x) and x.get("id") not in ALREADY]
    if mode == "wave1":
        return [x for x in docs if x.get("type") in WAVE1_TYPES
                and "rang-" not in ((x.get("urls") or {}).get("primary") or "")]
    if mode == "all-standalone":
        return [x for x in docs if "rang-" not in ((x.get("urls") or {}).get("primary") or "")]
    ids = set(mode.split(","))
    return [x for x in docs if x.get("id") in ids]


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "wave1"
    reg, det, tbl = load_data()
    sel = select(mode, reg)
    print(f"Auswahl '{mode}': {len(sel)} Dokumente")
    made_ch = made_single = failed = 0
    for x in sel:
        did = x.get("id")
        slug = det.get(did) or tbl.get(x.get("title"))
        pdf = (x.get("urls") or {}).get("primary")
        if not slug or not pdf or not os.path.isfile(os.path.join(ROOT, pdf)):
            print(f"  ÜBERSPRUNGEN {did}: slug={slug} pdf={pdf}")
            failed += 1
            continue
        title = x.get("title") or slug
        try:
            n = build_one(os.path.join(ROOT, pdf), slug, title, short_label(title))
            if n == 1:
                made_single += 1
            else:
                made_ch += 1
            print(f"  ok {slug}: {n} {'Einzelseite' if n==1 else 'Kapitel'}")
        except Exception as e:
            print(f"  FEHLER {slug}: {type(e).__name__}: {e}")
            failed += 1
    print(f"\nFertig: {made_ch} Werke mit Kapiteln, {made_single} Einzelseiten, {failed} übersprungen/fehlerhaft")
