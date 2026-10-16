from pathlib import Path
import json,hashlib,re,concurrent.futures,urllib.request,urllib.error,datetime,html
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'outputs/wirkungslexikon/v9';store=json.loads((BASE/'store.json').read_text());SRC=Path(store['source'])
read=lambda n:json.loads((SRC/n).read_text());v3=read('01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json');v8=read('01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json');dossiers=read('01_DATEN/SACHSEN_ANHALT_REGIERUNGSPROGRAMM_NARRATIVDOSSIER.json')['narrative'];h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=read('06_QA/MANIFEST_V9_SHA256.json');checks=[]
for item in manifest['files']:
 p=SRC/item['path'];checks.append({'path':item['path'],'size':p.stat().st_size,'sizeMatches':p.stat().st_size==item['bytes'],'sha256':h(p),'hashMatches':h(p)==item['sha256']})
(BASE/'INPUT_INTEGRITY.json').write_text(json.dumps({'files':checks,'allMatch':all(x['hashMatches'] and x['sizeMatches'] for x in checks)},ensure_ascii=False,indent=2))
rows=[];cards=[]
for e in v8['entries']:
 missing=[]
 for q in e['quellen']+e['wissenschaftliche_quellen']:
  issues=[]
  if not q.get('author'):issues.append('Urheber/Herausgeber fehlt')
  if not q.get('date'):issues.append('Datum/Abrufdatum fehlt')
  if not q.get('locator') or any(w in q.get('locator','').lower() for w in ['siehe quellenfundstelle','onlinequelle','im kontext','ff.']):issues.append('Fundstelle präzisieren')
  if issues:rows.append({'id':e['id'],'slug':e['slug'],'begriff':e['begriff'],'akteur_laut_datensatz':e['akteur'],'quelle_id':q['id'],'quelle_url':q['url'],'belegrolle':q['role'],'offene_nachweise':' | '.join(issues),'status':'quellenpruefung_offen','herkunft':'MASTER_V8_REDAKTIONSUEBERGABE_180.json','menschlich_bestaetigt':'nein'})
  missing+=issues
 own=e.get('qualitaet_v8',{});cards.append({'id':e['id'],'slug':e['slug'],'historicalStatus':e['pruefstatus'],'v8ReportedMetadataIssues':own.get('quellen_maengel',[]),'originalTextExplicit':own.get('belegter_originalwortlaut_vorhanden',False),'technicalIssuesIncludingMechanismReferences':list(set(missing)),'humanApproval':False})
 if not own.get('belegter_originalwortlaut_vorhanden'):
  rows.append({'id':e['id'],'slug':e['slug'],'begriff':e['begriff'],'akteur_laut_datensatz':e['akteur'],'quelle_id':e['originalnachweis'].get('quelle_id') or '', 'quelle_url':'','belegrolle':'Originalwortlaut','offene_nachweise':'Originalwortlaut nicht eindeutig erfasst','status':'quellenpruefung_offen','herkunft':'MASTER_V8_REDAKTIONSUEBERGABE_180.json','menschlich_bestaetigt':'nein'})
(BASE/'RESTLISTE_DATEN.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));(BASE/'QUELLEN_QA_180.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2))
urls=set(q['url'] for e in v8['entries'] for q in e['quellen']+e['wissenschaftliche_quellen'])
for folder in ['03_WEBSITE_TEXTE','11_QUELLEN_UND_ORIGINALE']:
 for p in (SRC/folder).glob('*.md'):urls.update(u.rstrip('.,;') for u in re.findall(r'https?://[^\s<>"\)]+',p.read_text()))
urls.add('https://afd-regierungsprogramm.de/')
cache=BASE/'sources';cache.mkdir(exist_ok=True)
def fetch(u):
 result={'url':u,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'contentVerified':False}
 try:
  req=urllib.request.Request(u,headers={'User-Agent':'WOEK-Source-QA/9.0 (technical availability check)'})
  with urllib.request.urlopen(req,timeout=22) as resp:
   body=resp.read(20000000);result.update(status=resp.status,finalUrl=resp.url,contentType=resp.headers.get('Content-Type'),bytes=len(body),sha256=hashlib.sha256(body).hexdigest())
   if u=='https://afd-regierungsprogramm.de/' or ('afd' in u and ('remigration' in u or u.endswith('.pdf'))):
    name=hashlib.sha256(u.encode()).hexdigest()+('.pdf' if body.startswith(b'%PDF') else '.html');(cache/name).write_bytes(body);result['localSnapshot']='sources/'+name
 except urllib.error.HTTPError as err:result.update(status=err.code,error='HTTP '+str(err.code))
 except Exception as err:result.update(status=None,error=type(err).__name__+': '+str(err)[:160])
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:results=list(ex.map(fetch,sorted(urls)))
(BASE/'QUELLEN_ERREICHBARKEIT.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
class Extract(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.links=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  if tag in ['script','style']:self.skip+=1
  if tag=='a':self.links.extend(v for k,v in attrs if k=='href')
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip:self.text.append(d)
programme=next(x for x in results if x['url']=='https://afd-regierungsprogramm.de/');ptext='';parser=Extract()
if programme.get('localSnapshot'):
 parser.feed((BASE/programme['localSnapshot']).read_text());ptext=' '.join(parser.text);(cache/'programm-text.txt').write_text(ptext)
norm=lambda s:re.sub(r'\s+',' ',s).casefold()
programqa=[]
for d in dossiers:
 needle=d['originalbegriff_kurz'];pos=norm(ptext).find(norm(needle));programqa.append({'id':d['id'],'type':'programm_narrativ_dossier','actor':d['quelle']['urheber'],'source':d['quelle'],'shortLemma':needle,'literalSearchFound':pos>=0,'machineContext':ptext[max(0,pos-180):pos+len(needle)+240] if pos>=0 else None,'exactQuoteApproved':False,'reviewStatus':'Originalkontext und Fassung menschlich prüfen','relatedCardIdsValid':all(any(e['slug']==s for e in v3['entries']) for s in d['verwandte_v3_slugs'])})
(BASE/'PROGRAMM_QA_21.json').write_text(json.dumps({'website':programme,'documentLinks':parser.links,'dossiers':programqa,'completeProgrammeAnalysis':False},ensure_ascii=False,indent=2))
print(json.dumps({'manifestFiles':len(checks),'allHashesMatch':all(x['hashMatches'] for x in checks),'cards':len(cards),'reportedMetadataGapCards':sum(bool(c['v8ReportedMetadataIssues']) for c in cards),'missingExplicitOriginalText':sum(not c['originalTextExplicit'] for c in cards),'sourceIssueRowsIncludingMechanismReferences':len(rows),'urls':len(results),'reachable':sum(x.get('status')==200 for x in results),'dossiers':len(programqa),'shortLemmaLiteralMatches':sum(x['literalSearchFound'] for x in programqa)},ensure_ascii=False))
