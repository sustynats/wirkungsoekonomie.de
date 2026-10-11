"""Measure actual HTML links and navigation; no content or URL mutations.

The report distinguishes indexable pages from redirects and dated noindex
archives. Uses the standard HTML parser, resolves relative/encoded URLs, and
reads sitemap indexes recursively. All recorded paths are public routes.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,unquote
from collections import Counter,defaultdict,deque
import re,json,hashlib,argparse,xml.etree.ElementTree as ET

SITE='https://wirkungsoekonomie.de'
EXCLUDED={'.git','.github','.claude','.next','.codex-backup','_internal','_debug','_site','admin','components','content','data','docs','export','lib','manifest','node_modules','outputs','ops','public','reports','scripts','source-assets','src','templates','tests','tiktok_archive','tiktok_library','tools','woek-akademie-app','woek-institut-app','woek-parlament-app'}
def route(file):return '/'+(file[:-10] if file.endswith('index.html') else file) if file!='index.html' else '/'
def resolved(base,value):
    url=urlsplit(urljoin(SITE+base,value))
    if url.scheme not in {'http','https'} or url.netloc not in {'wirkungsoekonomie.de','www.wirkungsoekonomie.de'}:return None
    return unquote(url.path),unquote(url.fragment)
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.links=[];self.ids=set();self.noindex=False;self.redirect=False;self.footer=False;self.breadcrumb=False;self.skip=[];self.current=0;self.lang='de';self.canonical='';self.has_main=False;self.main_id='';self.main_js=False;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html':self.lang=a.get('lang','de').split('-')[0]
        if a.get('id'):self.ids.add(a['id'])
        if tag=='main':self.has_main=True;self.main_id=a.get('id','')
        if tag=='script' and re.search(r'(?:^|/)main\.js(?:[?#]|$)',a.get('src','')):self.main_js=True
        if tag=='meta':
            if a.get('name','').lower() in {'robots','googlebot'} and re.search(r'\bnoindex\b',a.get('content',''),re.I):self.noindex=True
            if a.get('http-equiv','').lower()=='refresh':self.redirect=True
        if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
        if tag=='footer' and (not a.get('class') or {'footer','site-footer'}&set(a.get('class','').split())):self.footer=True
        if tag=='nav' and ('breadcrumb' in a.get('class','') or a.get('aria-label') in {'Brotkrumen','Breadcrumb'}):self.breadcrumb=True
        if tag=='a' and a.get('href'):
            self.links.append(a['href'])
            if 'skip-link' in a.get('class',''):self.skip.append(a['href'])
            if a.get('aria-current')=='page':self.current+=1
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)

def shell_hash(raw,kind,base):
    pattern=r'<header\b[^>]*\bclass=["\'][^"\']*\bsite-header\b[^"\']*["\'][^>]*>[\s\S]*?</header>' if kind=='header' else r'<footer(?:\s+[^>]*\bclass=["\'](?:[^"\']*\s)?(?:footer|site-footer)(?:\s[^"\']*)?["\'][^>]*|\s*)>[\s\S]*?</footer>'
    fragment=re.search(pattern,raw,re.I)
    if not fragment:return None
    text=fragment.group()
    def href(m):
        value=resolved(base,m.group(2));return m.group(1)+'="'+(value[0] if value else m.group(2))+'"'
    text=re.sub(r'(href|src)=["\']([^"\']*)["\']',href,text)
    text=re.sub(r'\saria-current=["\'][^"\']+["\']','',text)
    text=re.sub(r'\s+',' ',text).strip()
    return hashlib.sha256(text.encode()).hexdigest()[:16]

def measure(root,search_urls=None):
    files={};pages={};raws={};aliases={}
    for f in sorted(root.rglob('*.html')):
        rel=f.relative_to(root).as_posix()
        if any(p in EXCLUDED or p.startswith('.') for p in Path(rel).parts[:-1]):continue
        r=route(rel);files[r]=rel;aliases['/'+rel]=r
        if rel.endswith('/index.html'):aliases['/'+rel[:-11]]=r
        text=f.read_text(errors='replace');raws[r]=text;pages[r]=Page(text)
    def target(base,url):
        value=resolved(base,url)
        if not value:return None
        p=value[0];return (p if p in pages else aliases.get(p) or aliases.get(p+'.html') or aliases.get(p.rstrip('/')+'/index.html')),value[1]
    edges={};redirect_links=[];broken_skip=[];variants={'header':defaultdict(Counter),'footer':defaultdict(Counter)}
    mainjs=(root/'assets/js/main.js').read_text() if (root/'assets/js/main.js').exists() else ''
    legacy_dynamic_skip=bool(re.search(r'skipLink\.href\s*=\s*["\']#main-content["\']',mainjs))
    for r,p in pages.items():
        linked=set()
        for url in p.links:
            t=target(r,url)
            if t and t[0] in pages and t[0]!=r:
                linked.add(t[0])
                if pages[t[0]].redirect and not p.redirect:redirect_links.append({'from':r,'to':t[0]})
        edges[r]=linked
        for url in p.skip:
            t=target(r,url)
            if not t or t[0]!=r or not t[1] or t[1] not in p.ids:broken_skip.append(r)
        if legacy_dynamic_skip and not p.skip and p.main_js and p.has_main and p.main_id and p.main_id!='main-content':broken_skip.append(r)
        if not p.redirect:
            for kind in variants:
                h=shell_hash(raws[r],kind,r)
                if h:variants[kind][p.lang][h]+=1
    depth={'/':0};queue=deque(['/'])
    while queue:
        source=queue.popleft()
        for t in sorted(edges.get(source,[])):
            if t not in depth:depth[t]=depth[source]+1;queue.append(t)
    sitemap=set();seen_xml=set()
    def read_sitemap(file):
        if file in seen_xml or not file.is_file():return
        seen_xml.add(file)
        node=ET.fromstring(file.read_text())
        index=node.tag.endswith('sitemapindex')
        for loc in node.iter():
            if not loc.tag.endswith('loc') or not loc.text:continue
            v=resolved('/',loc.text)
            if not v:continue
            if index:read_sitemap(root/v[0].lstrip('/'))
            else:
                t=target('/',loc.text)
                if t and t[0]:sitemap.add(t[0])
    read_sitemap(root/'sitemap.xml')
    if search_urls is None:
        manifest=root/'assets/search/browser-index-manifest.json'
        index=root/'assets/search/search-index.json'
        if manifest.exists():index=manifest.parent/json.loads(manifest.read_text())['json']
        data=json.loads(index.read_text()) if index.exists() else []
        # Match the actually delivered compact browser index in source mode.
        search_urls={e.get('url','') for e in data if not re.match(r'^/(bibliothek|quellenarchiv)/.+',e.get('url',''))} if not manifest.exists() else {e.get('url','') for e in data}
    search=set()
    for u in search_urls:
        t=target('/',u)
        if t and t[0]:search.add(t[0])
    active={r for r,p in pages.items() if not p.noindex and not p.redirect and r!='/404.html'}
    content={r for r,p in pages.items() if not p.redirect}
    areas=defaultdict(Counter)
    for r in sorted(active):
        area=r.strip('/').split('/')[0] if '/' in r.strip('/') else '(root)'
        a=areas[area];a['indexable']+=1;a['reachable']+=r in depth;a['unreachable']+=r not in depth;a['withinThreeClicks']+=depth.get(r,10**9)<=3;a['sitemap']+=r in sitemap;a['search']+=r in search;a['breadcrumb']+=pages[r].breadcrumb;a['withoutFooter']+=not pages[r].footer
    hubs={}
    for r in sorted(pages):
        if not r.endswith('/') or r.count('/')>2:continue
        children={child for child in active if child.startswith(r) and child!=r} if r!='/' else set()
        modules={r+child[len(r):].split('/')[0]+'/' for child in children if '/' in child[len(r):]}
        existing_modules={m for m in modules if m in active}
        hubs[r]={'bytes':len(raws[r].encode()),'indexableChildren':len(children),'modules':len(existing_modules),'linkedModules':len(existing_modules&edges[r]),'missingModules':sorted(existing_modules-edges[r])}
    counts={'publicHtml':len(pages),'contentHtml':len(content),'indexable':len(active),'reachable':sum(r in depth for r in active),'withinThreeClicks':sum(depth.get(r,10**9)<=3 for r in active),'unreachable':sum(r not in depth for r in active),'withoutFooter':sum(not pages[r].footer for r in content),'sitemapCoverage':len(active&sitemap),'searchCoverage':len(active&search),'redirectsInSearch':sum(pages[r].redirect for r in search),'brokenSkipLinks':len(set(broken_skip)),'multipleCurrentPages':sum(p.current>1 for p in pages.values()),'linksToRedirects':len(redirect_links),'htmlBytes':sum(len(raws[r].encode()) for r in pages)}
    return {'schemaVersion':1,'measurement':'HTMLParser; BFS of authored HTML links; physical public routes; sitemap-index recursion; delivered browser index','counts':counts,'variants':{k:{lang:dict(v) for lang,v in langs.items()} for k,langs in variants.items()},'areas':{a:dict(v) for a,v in sorted(areas.items())},'unreachable':[r for r in sorted(active) if r not in depth],'brokenSkipLinks':sorted(set(broken_skip)),'linksToRedirects':redirect_links[:100],'redirectLinkSampleLimit':100,'hubs':hubs,'hubBytes':{r:h['bytes'] for r,h in hubs.items()}}

def regressions(before,after):
    """Compare proportions for coverage and absolute defects for invariant gates."""
    bad=[];a=before['counts'];b=after['counts']
    for name in ('unreachable','withoutFooter','redirectsInSearch','brokenSkipLinks','multipleCurrentPages','linksToRedirects'):
        if b[name]>a[name]:bad.append(f'{name}: {a[name]} -> {b[name]}')
    for name in ('withinThreeClicks','sitemapCoverage','searchCoverage'):
        if b[name]/max(1,b['indexable'])+1e-9<a[name]/max(1,a['indexable']):bad.append(f'{name}: coverage decreased')
    for kind in ('header','footer'):
        for lang,hashes in after['variants'][kind].items():
            old=before['variants'][kind].get(lang,{})
            if old and len(hashes)>len(old):bad.append(f'{kind}/{lang}: {len(old)} -> {len(hashes)} variants')
    return bad

def markdown(after,before=None):
    a=(before or after)['counts'];b=after['counts']
    labels={'indexable':'Indexierbare Seiten','unreachable':'Ohne Linkpfad ab Start','withinThreeClicks':'In höchstens drei Klicks','withoutFooter':'Inhaltsseiten ohne Footer','sitemapCoverage':'In Sitemap','searchCoverage':'In ausgelieferter Suche','redirectsInSearch':'Weiterleitungen in Suche','brokenSkipLinks':'Defekte Skip-Links','multipleCurrentPages':'Mehrfach aria-current=page','linksToRedirects':'Links auf Weiterleitungen','htmlBytes':'HTML-Bytes'}
    lines=['# Navigationsbericht','','Gemessen am gebauten öffentlichen Artefakt. „Nicht erreichbar“ bezeichnet einen fehlenden HTML-Linkpfad ab der Startseite, keinen HTTP-Fehler. JavaScript-Listen ersetzen keine statischen Links. Die Abdeckung verwendet alle indexierbaren Seiten; noindex, Meta-Refresh und interne Pfade sind ausgeschlossen. Footer werden auf allen Inhaltsseiten geprüft, auch noindex.','','| Kennzahl | Vorher | Nachher |','|---|---:|---:|']
    for key,label in labels.items():lines.append(f'| {label} | {a[key]:,} | {b[key]:,} |')
    lines+=['','| Bereich | Indexierbar | Ohne Linkpfad | ≤3 Klicks | Sitemap | Suche | Ohne Footer | Brotkrumen |','|---|---:|---:|---:|---:|---:|---:|---:|']
    for area,c in after['areas'].items():lines.append('| '+area+' | '+' | '.join(str(c.get(k,0)) for k in ('indexable','unreachable','withinThreeClicks','sitemap','search','withoutFooter','breadcrumb'))+' |')
    lines+=['','| Bauteil | Sprache | Varianten |','|---|---|---:|']
    for kind,langs in after['variants'].items():
        for lang,v in langs.items():lines.append(f'| {kind} | {lang} | {len(v)} |')
    lines+=['','| Bereichs-Startseite | Bytes | Verlinkte öffentliche Module |','|---|---:|---:|']
    for url,h in after['hubs'].items():
        if h['modules'] or h['bytes']>=300000:lines.append(f'| {url} | {h["bytes"]:,} | {h["linkedModules"]}/{h["modules"]} |')
    return '\n'.join(lines)+'\n'

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',default='_site');p.add_argument('--output',default='reports/navigation/latest.json');p.add_argument('--compare');p.add_argument('--markdown');p.add_argument('--gate',action='store_true');args=p.parse_args()
    root=Path(args.root)
    if not root.is_dir():raise SystemExit('Build artifact missing; use --root . for the separately labelled source measurement.')
    report=measure(root);out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    before=json.loads(Path(args.compare).read_text()) if args.compare else None
    if args.markdown:Path(args.markdown).write_text(markdown(report,before))
    print(json.dumps(report['counts'],ensure_ascii=False))
    problems=regressions(before,report) if before else []
    if problems:print(('FAIL' if args.gate else 'WARNING')+': '+'; '.join(problems))
    if problems and args.gate:raise SystemExit(1)
if __name__=='__main__':main()
