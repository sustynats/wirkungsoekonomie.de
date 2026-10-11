"""Permit only verified global navigation changes around a historical text.

The new components must equal the shared renderer byte for byte apart from
whitespace. Components inside main/article remain protected publication text.
All other lines still pass through the existing additions-only comparison.
"""
from html.parser import HTMLParser
import json,re,subprocess
from pathlib import PurePosixPath

def _normal(text):return re.sub(r'\s+',' ',text).strip()

class Components(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=False);self.text=text;self.stack=[];self.ranges=[]
        self.offsets=[0]
        for line in text.splitlines(keepends=True):self.offsets.append(self.offsets[-1]+len(line))
        self.feed(text)
    def source_offset(self):
        line,col=self.getpos();return self.offsets[line-1]+col
    def handle_starttag(self,tag,attrs):
        values=dict(attrs);classes=set(values.get('class','').split())
        kind=None
        if not any(t in {'main','article'} for t,_,_ in self.stack):
            if tag=='header' and 'site-header' in classes:kind='header'
            if tag=='footer' and classes.intersection({'footer','site-footer'}):kind='footer'
            if tag=='aside' and 'footer-newsletter-shell' in classes:kind='newsletter'
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append((tag,self.source_offset(),kind))
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:
                _,start,kind=self.stack[i];del self.stack[i:]
                if kind:
                    end=self.text.find('>',self.source_offset())+1
                    self.ranges.append((start,end,kind))
                return

def protected_publication(before,after,relative,root):
    """Return texts with exactly the verified global components removed."""
    base='../'*len(PurePosixPath(relative).parent.parts)
    expected=json.loads(subprocess.check_output(['node','scripts/site/render-site-shell.mjs','--json','--base='+base],cwd=root,text=True))
    old=Components(before);new=Components(after)
    for start,end,kind in new.ranges:
        if _normal(after[start:end])!=_normal(expected[kind]):
            raise AssertionError('Unverified global '+kind+' on historical publication '+relative)
    if sum(kind=='header' for _,_,kind in new.ranges)!=1 or sum(kind=='footer' for _,_,kind in new.ranges)!=1:
        raise AssertionError('Historical publication needs exactly one shared header and footer: '+relative)
    def remove(text,components):
        for start,end,_ in sorted(components.ranges,reverse=True):text=text[:start]+text[end:]
        return text
    return remove(before,old),remove(after,new)
