"""Resolve glossary references from actual public HTML, independent of search cache."""
from pathlib import Path
from html.parser import HTMLParser
import json,re

ROOT=Path(__file__).resolve().parents[2]
EXCLUDED={'.git','.github','.claude','.next','.vercel','.codex-backup','_debug','_internal','_site','assets','components','content','data','docs','export','lib','manifest','node_modules','outputs','ops','public','reports','scripts','source-assets','src','templates','tests','tmp','tiktok_archive','tiktok_library','tools','woek-akademie-app','woek-institut-app','woek-parlament-app'}
class Metadata(HTMLParser):
    def __init__(self):super().__init__();self.meta={};self.h1=[];self.heading=False;self.main=False;self.text=[];self.refresh=False;self.private=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='meta':
            if a.get('name'):self.meta[a['name'].lower()]=a.get('content','')
            if a.get('http-equiv','').lower()=='refresh':self.refresh=True
            if a.get('name')=='woek-private-interaction':self.private=True
        if tag=='h1':self.heading=True
        if tag=='main':self.main=True
    def handle_endtag(self,tag):
        if tag=='h1':self.heading=False
        if tag=='main':self.main=False
    def handle_data(self,data):
        if self.heading:self.h1.append(data)
        if self.main:self.text.append(data)
def entries(root=ROOT):
    result=[]
    files=sorted([p for p in root.glob('*.html')]+[p for d in root.iterdir() if d.is_dir() and d.name not in EXCLUDED and not d.name.startswith('.') for p in d.rglob('*.html')])
    for file in files:
        parser=Metadata();parser.feed(file.read_text(errors='replace'))
        if parser.refresh or parser.private:continue
        route='/'+file.relative_to(root).as_posix();route=route[:-10] if route.endswith('index.html') else route
        title=parser.meta.get('search_title') or ' '.join(parser.h1)
        if not title:continue
        result.append({'url':route,'title':title,'description':parser.meta.get('search_description') or parser.meta.get('description',''),'type':parser.meta.get('search_type',''),'section':parser.meta.get('search_section',''),'wordCount':len(re.findall(r'\S+',' '.join(parser.text)))})
    return result
if __name__=='__main__':
    target=ROOT/'public/data/content-reference-catalog.json';target.write_text(json.dumps(entries(),ensure_ascii=False,indent=2)+'\n');print('Canonical content references:',len(json.loads(target.read_text())))
