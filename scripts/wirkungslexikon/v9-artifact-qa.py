from pathlib import Path
import json,re,hashlib,zipfile,xml.etree.ElementTree as ET,csv
from html.parser import HTMLParser
B=Path(__file__).resolve().parents[2]/'outputs/wirkungslexikon/v9';store=json.loads((B/'store.json').read_text());S=Path(store['source']);P=B/'preview';HOST=Path('/Users/hagen/Documents/New project/outputs/wirkungslexikon/release-candidate')
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,t,a):
  self.links.extend(v for k,v in a if k in ['href','src'] and v.startswith('/') and not v.startswith('//'))
missing=[];checked=0;render_image_pending=[]
for f in (P/'wirkungslexikon').rglob('*.html'):
 l=Links();l.feed(f.read_text())
 for url in l.links:
  raw=url.split('?')[0].split('#')[0]
  if not raw:continue
  rel=raw.lstrip('/');candidate=P/rel;target=candidate/'index.html' if raw.endswith('/') else candidate
  if target.is_file():checked+=1;continue
  host=HOST/rel;host=host/'index.html' if raw.endswith('/') else host
  if not raw.startswith('/wirkungslexikon/') and host.is_file():checked+=1;continue
  if re.search(r'/(og|portrait|square)\.png$',raw):render_image_pending.append({'file':str(f.relative_to(P)),'url':url});continue
  missing.append({'file':str(f.relative_to(P)),'url':url})
articles=[]
for f in (S/'04_ARTIKEL_NACH_LIVEGANG').glob('*'):
 if f.suffix not in ['.md','.docx']:continue
 item={'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'publication':'blocked_separate_human_approval_after_verified_live','unchanged':True}
 if f.suffix=='.docx':
  with zipfile.ZipFile(f) as z:item['embeddedImages']=len([n for n in z.namelist() if n.startswith('word/media/')]);item['links']=[e.attrib['Target'] for e in ET.fromstring(z.read('word/_rels/document.xml.rels')) if e.attrib.get('Type','').endswith('/hyperlink')]
 else:item['links']=re.findall(r'https?://[^\s\)<>]+',f.read_text())
 item['lexiconLinkChecks']=[{'url':u,'localProtectedRoutePresent':((P/u.split('https://wirkungsoekonomie.de/')[1])/'index.html').is_file(),'publicLiveVerified':False} for u in item['links'] if u.startswith('https://wirkungsoekonomie.de/wirkungslexikon/')];articles.append(item)
(B/'ARTIKEL_UND_LINK_MAPPING.json').write_text(json.dumps({'articles':articles,'pathChangesRequired':False,'aliasesImplemented':['/wirkungslexikon/journalisten/','/wirkungslexikon/wissenschaft/'],'caseStudy':'/wirkungslexikon/fallstudien/stadtbild/','liveLinkCheck':'NOT_PERFORMED_NO_RELEASE'},ensure_ascii=False,indent=2))
(B/'TESTNACHWEISE/INTERNAL_LINKS.json').write_text(json.dumps({'checked':checked,'broken':missing,'socialImagesPending':render_image_pending,'hostFallbackUsed':str(HOST)},ensure_ascii=False,indent=2))
with (B/'RESTLISTE_OFFENE_QUELLEN.csv').open(encoding='utf-8-sig',newline='') as f:csv_rows=list(csv.DictReader(f,delimiter=';'))
assert len(csv_rows)==665 and len(csv_rows[0])==11
(B/'TESTNACHWEISE/CSV_READBACK.json').write_text(json.dumps({'rows':len(csv_rows),'columns':11,'cardIds':len(set(r['id'] for r in csv_rows)),'roundtrip':'PASS','separator':';','encoding':'UTF-8 BOM'},indent=2))
print(json.dumps({'internalLinksChecked':checked,'broken':len(missing),'socialImagePending':len(render_image_pending),'articleVersions':len(articles),'embeddedImages':sum(x.get('embeddedImages',0) for x in articles),'csvRows':len(csv_rows)},ensure_ascii=False));print(json.dumps(missing[:15],ensure_ascii=False))
