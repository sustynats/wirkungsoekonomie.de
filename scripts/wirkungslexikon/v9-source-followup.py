from pathlib import Path
import json,subprocess,hashlib,datetime,re,unicodedata
from pypdf import PdfReader
B=Path(__file__).resolve().parents[2]/'outputs/wirkungslexikon/v9';s=json.loads((B/'store.json').read_text());S=Path(s['source']);rows=json.loads((B/'QUELLEN_ERREICHBARKEIT.json').read_text())
for r in rows:
 if 'CERTIFICATE_VERIFY_FAILED' in r.get('error',''):
  dest=B/'sources'/('retry-'+hashlib.sha256(r['url'].encode()).hexdigest());p=subprocess.run(['curl','-L','--max-time','25','-sS','-o',str(dest),'-w','%{http_code}',r['url']],capture_output=True,text=True)
  r['retryMethod']='macOS curl/system trust store';r['retryStatus']=p.stdout;r['retryError']=p.stderr[:180]
  if p.returncode==0:r['status']=int(p.stdout);r['sha256']=hashlib.sha256(dest.read_bytes()).hexdigest();r['bytes']=dest.stat().st_size;r['localSnapshot']=str(dest.relative_to(B));r.pop('error',None)
(B/'QUELLEN_ERREICHBARKEIT.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
entries=json.loads((S/'01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json').read_text())['entries'];norm=lambda t:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',t.casefold()).encode('ascii','ignore').decode())
pdf=PdfReader(S/'07_ORIGINALQUELLEN/policy-paper-sachsen-anhalt.pdf');pages=[p.extract_text() or '' for p in pdf.pages];patches=json.loads((S/'02_QUELLENPRUEFUNG_48/C_JSON_AENDERUNGSVORSCHLAEGE_48.json').read_text())['vorschlaege'];matches=[]
for x in patches:
 if x['gruppe']!='27_IFR_POLICY_PAPER':continue
 e=x['vorgeschlagene_karte'];text=e['originalnachweis']['text'];found=[i+1 for i,p in enumerate(pages) if norm(text) in norm(p)];matches.append({'id':x['id'],'lemma':e['begriff'],'proposedOriginalText':text,'proposedLocator':e['originalnachweis']['fundstelle'],'machineNormalizedMatchingPdfPages':found,'humanContextVerification':False,'approvalChanged':False})
(B/'IFR_ORIGINALABGLEICH_27_TECHNISCH.json').write_text(json.dumps({'pdfPages':len(pages),'originalSha256':hashlib.sha256((S/'07_ORIGINALQUELLEN/policy-paper-sachsen-anhalt.pdf').read_bytes()).hexdigest(),'method':'Unicode-/Interpunktionsnormalisierte Textsuche; weder Zitatgenauigkeit noch Kontextfreigabe','cards':matches},ensure_ascii=False,indent=2))
afd=next(r for r in rows if '2024-01-31-_' in r['url']);afd_result={'source':afd,'humanReview':False}
if afd.get('localSnapshot') and afd.get('status')==200:
 p=B/afd['localSnapshot'];reader=PdfReader(p);texts=[q.extract_text() or '' for q in reader.pages];(B/'sources/afd-positionspapier-remigration-text.txt').write_text('\n\f\n'.join(texts));afd_result.update(pages=len(reader.pages),textSha256=hashlib.sha256('\n'.join(texts).encode()).hexdigest())
(B/'AFD_REMIGRATION_QUELLENSTATUS.json').write_text(json.dumps(afd_result,ensure_ascii=False,indent=2))
print(json.dumps({'http200':sum(r.get('status')==200 for r in rows),'http203':sum(r.get('status')==203 for r in rows),'urls':len(rows),'ifrReviewedTechnically':len(matches),'ifrSearchMatches':sum(bool(m['machineNormalizedMatchingPdfPages']) for m in matches),'afdOriginalPdfPages':afd_result.get('pages')},ensure_ascii=False))
