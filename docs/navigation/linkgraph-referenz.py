#!/usr/bin/env python3
"""Linkgraph-Analyse einer statischen Site: Klicktiefe ab Startseite, Waisen,
Breadcrumbs, Standard-Header, Sitemap-Abdeckung je Top-Bereich.
Aufruf: python3 -I linkgraph.py <site_root> <out_json>"""
import json, os, re, sys
from collections import Counter, defaultdict, deque
from urllib.parse import urlsplit, unquote

ROOT = os.path.abspath(sys.argv[1])
OUT = sys.argv[2]
SKIP_TOP = {"_site", "public", "node_modules", "_internal", "_debug", "admin", ".git",
            "templates", "docs", "tools", "scripts", "reports", "content", "components"}
HREF = re.compile(r'href\s*=\s*"([^"]+)"', re.I)
BREAD = re.compile(r'breadcrumb|BreadcrumbList', re.I)
NOINDEX = re.compile(r'<meta[^>]+name="robots"[^>]+noindex', re.I)
REFRESH = re.compile(r'<meta[^>]+http-equiv="refresh"', re.I)
HEADER = re.compile(r'class="site-header', re.I)

pages = []
for dp, dns, fns in os.walk(ROOT):
    rel_dir = os.path.relpath(dp, ROOT)
    top = rel_dir.split(os.sep)[0]
    if top in SKIP_TOP:
        dns[:] = []
        continue
    for fn in fns:
        if fn.endswith(".html"):
            pages.append(os.path.normpath(os.path.join(rel_dir, fn)).replace(os.sep, "/").lstrip("./"))
page_set = set(pages)

def top_of(p):
    return p.split("/")[0] if "/" in p else "(root)"

def resolve(src, href):
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parts = urlsplit(href)
    if parts.scheme in ("http", "https"):
        if parts.netloc not in ("wirkungsoekonomie.de", "www.wirkungsoekonomie.de"):
            return None
        path = parts.path
        base = ""
    elif parts.scheme:
        return None
    else:
        path = parts.path
        base = os.path.dirname(src)
    if not path:
        return None
    path = unquote(path)
    if path.startswith("/"):
        cand = path.lstrip("/")
    else:
        cand = os.path.normpath(os.path.join(base, path)).replace(os.sep, "/")
    if cand in (".", ""):
        cand = "index.html"
    if cand.startswith(".."):
        return None
    if cand.endswith("/") or cand in ("",):
        cand = cand.rstrip("/") + "/index.html"
    if cand in page_set:
        return cand
    if cand + "/index.html" in page_set:
        return cand + "/index.html"
    if cand + ".html" in page_set:
        return cand + ".html"
    return None

out_edges = {}
inbound = Counter()
meta = {}
for i, p in enumerate(pages):
    try:
        with open(os.path.join(ROOT, p), encoding="utf-8", errors="ignore") as fh:
            s = fh.read()
    except Exception:
        continue
    tgts = set()
    for h in HREF.findall(s):
        t = resolve(p, h)
        if t and t != p:
            tgts.add(t)
    out_edges[p] = tgts
    for t in tgts:
        inbound[t] += 1
    head = s[:20000]
    meta[p] = {
        "bread": bool(BREAD.search(s)),
        "noindex": bool(NOINDEX.search(head)),
        "stub": bool(REFRESH.search(head)) or len(s) < 1500,
        "header": bool(HEADER.search(s)),
        "links_out": len(tgts),
    }

# BFS ab Startseite
depth = {"index.html": 0}
q = deque(["index.html"])
while q:
    u = q.popleft()
    for v in out_edges.get(u, ()):
        if v not in depth:
            depth[v] = depth[u] + 1
            q.append(v)

# Sitemap
sm = set()
try:
    with open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8") as fh:
        for loc in re.findall(r"<loc>([^<]+)</loc>", fh.read()):
            t = resolve("index.html", loc)
            if t:
                sm.add(t)
except Exception:
    pass

areas = defaultdict(lambda: Counter())
depth_hist = Counter()
for p in pages:
    a = top_of(p)
    m = meta.get(p, {})
    c = areas[a]
    c["pages"] += 1
    if m.get("stub"):
        c["stubs"] += 1
        continue  # Weiterleitungs-Stubs nicht als echte Seiten werten
    c["real"] += 1
    d = depth.get(p)
    if d is None:
        c["unreached"] += 1
        depth_hist["nicht erreichbar"] += 1
    else:
        key = str(d) if d <= 5 else "6+"
        c["d" + key] += 1
        depth_hist[key] += 1
        c["depth_sum"] += d
        c["reached"] += 1
    if inbound[p] == 0:
        c["no_inbound"] += 1
    if m.get("bread"):
        c["bread"] += 1
    if m.get("header"):
        c["header"] += 1
    if m.get("noindex"):
        c["noindex"] += 1
    if p in sm:
        c["sitemap"] += 1
    if m.get("links_out", 0) <= 3:
        c["deadendish"] += 1

res = {
    "total_pages": len(pages),
    "real_pages": sum(c["real"] for c in areas.values()),
    "depth_hist": dict(depth_hist),
    "sitemap_resolved": len(sm),
    "areas": {a: dict(c) for a, c in sorted(areas.items(), key=lambda kv: -kv[1]["pages"])},
    "home_out": len(out_edges.get("index.html", ())),
    "sample_unreached": {},
}
by_area_unreached = defaultdict(list)
for p in pages:
    if not meta.get(p, {}).get("stub") and p not in depth:
        by_area_unreached[top_of(p)].append(p)
for a, lst in by_area_unreached.items():
    res["sample_unreached"][a] = lst[:5]
with open(OUT, "w", encoding="utf-8") as fh:
    json.dump(res, fh, ensure_ascii=False, indent=1)
print("fertig", len(pages), "Seiten")
