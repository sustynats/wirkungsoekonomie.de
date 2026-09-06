#!/usr/bin/env python3
"""Read-only inventory of a built artifact. Findings need editorial triage: JS filter hashes and machine API pages are not automatically defects."""
import os,re,json,sys,hashlib,collections
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,unquote
ROOT=Path(sys.argv[1]); OUT=Path(sys.argv[2]); OUT.mkdir(parents=True,exist_ok=True)
SKIP={'.git','node_modules','_site','outputs','.next','woek-parlament-app','reports','audit-manifests','docs','source-assets','content','templates','tests','scripts','tools','assets','public'}
class Page(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.stack=[];self.ids=[];self.links=[];self.images=[];self.words=[];self.title=[];self.headings=[];self.meta={};self.canonical='';self.redirect=False;self.active=None;self.heading=None;self.h1_count=0
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='h1':self.h1_count+=1
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(t)
  if a.get('id'):self.ids.append(a['id'])
  if t=='meta':
   if a.get('name'):self.meta[a['name']]=a.get('content','')
   if a.get('http-equiv','').lower()=='refresh':self.redirect=True
  if t=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
  if t=='a' and 'href' in a:self.links.append({'href':a['href'],'main':'main' in self.stack})
  if t=='img':self.images.append({'src':a.get('src',''),'alt':a.get('alt',None)})
  if t in {'h1','h2','h3'} and 'main' in self.stack:self.heading={'level':int(t[1]),'text':'','id':a.get('id','')};self.headings.append(self.heading)
 def handle_endtag(self,t):
  if t in {'h1','h2','h3'}:self.heading=None
  if t in self.stack:self.stack=self.stack[:len(self.stack)-1-self.stack[::-1].index(t)]
 def handle_data(self,s):
  if any(x in self.stack for x in ('script','style','template')):return
  if 'title' in self.stack:self.title.append(s)
  if 'main' in self.stack:
   self.words.append(s)
   if self.heading is not None:self.heading['text']+=s
pages={}
for base,dirs,files in os.walk(ROOT):
 dirs[:]=[d for d in dirs if d not in SKIP and not d.startswith('.')]
 for f in files:
  if not f.endswith('.html'):continue
  p=Path(base)/f;rel=p.relative_to(ROOT).as_posix();parser=Page();raw=p.read_text(errors='replace');parser.feed(raw)
  route='/'+rel
  if route.endswith('/index.html'):route=route[:-10]
  text=re.sub(r'\s+',' ',' '.join(parser.words)).strip();indexable=not parser.redirect and 'noindex' not in parser.meta.get('robots','').lower()
  pages[rel]={'path':rel,'url':route,'bytes':p.stat().st_size,'title':''.join(parser.title),'description':parser.meta.get('description',''),'indexable':indexable,'canonical':parser.canonical,'redirect':parser.redirect,'word_count':len(text.split()),'h1_count':parser.h1_count,'headings':parser.headings,'duplicate_ids':[i for i,n in collections.Counter(parser.ids).items() if n>1],'missing_alt':[i['src'] for i in parser.images if i['alt'] is None],'placeholder_hits':re.findall(r'.{0,70}(?:wird ergänzt|folgt in Kürze|Coming soon|TODO|Onlinefassunge\b|Gesamtset nicht öffentlich|Es wird kein kaputter Downloadlink gesetzt).{0,90}',text,re.I),'main_digest':hashlib.sha256(text.encode()).hexdigest(),'links':parser.links,'ids':set(parser.ids),'text':text}
print('Parsed',len(pages),'pages',flush=True)
existing={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file()}
broken=[];anchors=[];incoming=collections.Counter(); selflinks=[]
for rel,p in pages.items():
 if not p['indexable']:continue
 for link in p['links']:
  h=link['href'];u=urlsplit(urljoin('https://wirkungsoekonomie.de'+p['url'],h))
  if u.netloc not in ('wirkungsoekonomie.de','www.wirkungsoekonomie.de') or u.scheme not in ('http','https'):continue
  target=unquote(u.path).lstrip('/') or 'index.html'
  if target.endswith('/'):target+='index.html'
  elif not Path(target).suffix and (target+'/index.html') in existing:target+='/index.html'
  if target not in existing:
   if target.startswith(('api/','functions/')):continue
   broken.append({'from':rel,'href':h,'target':target,'main':link['main']});continue
  if target in pages:
   if link['main'] and target!=rel:incoming[target]+=1
   if u.fragment and unquote(u.fragment).lower()!='top' and unquote(u.fragment) not in pages[target]['ids'] and not u.fragment.startswith(':~:text='):anchors.append({'from':rel,'href':h,'target':target,'main':link['main']})
   if target==rel and not u.fragment and link['main']:selflinks.append({'from':rel,'href':h})
bytitle=collections.defaultdict(list);bybody=collections.defaultdict(list)
for rel,p in pages.items():
 if p['indexable']:
  bytitle[p['title']].append(rel)
  if p['word_count']>80:bybody[p['main_digest']].append(rel)
summary={'pages':len(pages),'indexable':sum(p['indexable'] for p in pages.values()),'redirects':sum(p['redirect'] for p in pages.values()),'groups':collections.Counter(p['url'].strip('/').split('/')[0] for p in pages.values() if p['indexable']),'broken_links':broken,'broken_anchors':anchors,'main_self_links':selflinks,'duplicate_titles':{k:v for k,v in bytitle.items() if len(v)>1},'duplicate_bodies':list(v for v in bybody.values() if len(v)>1),'no_h1':[r for r,p in pages.items() if p['indexable'] and p['h1_count']!=1],'missing_description':[r for r,p in pages.items() if p['indexable'] and not p['description']],'missing_main_incoming':[r for r,p in pages.items() if p['indexable'] and incoming[r]==0],'short_pages':[r for r,p in pages.items() if p['indexable'] and p['word_count']<80]}
for p in pages.values():p.pop('ids');p.pop('links');p.pop('text');p['main_incoming']=incoming[p['path']]
(OUT/'inventory.json').write_text(json.dumps(list(pages.values()),ensure_ascii=False,indent=2));(OUT/'findings.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps({k:(len(v) if isinstance(v,(list,dict)) else v) for k,v in summary.items()},indent=2));print('Largest content:',sorted([(p['word_count'],p['path']) for p in pages.values() if p['indexable']],reverse=True)[:20])
