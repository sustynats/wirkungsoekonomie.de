from pathlib import Path
import json,hashlib,re,unicodedata,io
from html.parser import HTMLParser
from pypdf import PdfReader
B=Path(__file__).resolve().parents[2]/'outputs/wirkungslexikon/v9';S=json.loads((B/'store.json').read_text());I=json.loads((B/'review/index.json').read_text());T=I['tables'];R=json.loads((B/'review/SOURCE_ACCESS_CHECKS.json').read_text())['rows'];byurl={x['url']:x for x in R}
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,t):
  if not self.skip:self.parts.append(t)
def norm(t):return re.sub(r'\s+','',unicodedata.normalize('NFKC',t).casefold()).replace('-','').replace('­','').replace('–','')
pdf=Path(S['source'])/'07_ORIGINALQUELLEN/policy-paper-sachsen-anhalt.pdf';assert hashlib.sha256(pdf.read_bytes()).hexdigest()=='f8a79e008e7d0b15f618bafbf7a0f55a6d79ce9f89632a1b77fea805589dacda';reader=PdfReader(pdf);ifr=[]
for row in T['IFR_ORIGINALWORTLAUT_PDF_ABGLEICH_27']['rows']:
 n=int(row['PDF_Seite_1_basiert']);text=reader.pages[n-1].extract_text();ifr.append({'slug':row['slug'],'pdfPage':n,'printedPage':row['gedruckte_Seite'],'fragment':row['Originalfragment'],'normalizedMatchOnSpecifiedPage':norm(row['Originalfragment']) in norm(text),'humanContextApproved':False})
research=[]
for row in T['ORIGINALQUELLEN_RECHERCHEKANDIDATEN_20']['rows']:
 s=byurl.get(row['source_url']);result={'slug':row['slug'],'url':row['source_url'],'fragment':row['originalfragment'],'humanContextApproved':False,'normalizedFragmentFound':None,'sourceDateConfirmed':False}
 if s:
  result['httpStatus']=s.get('status');result['snapshotSha256']=s.get('sha256');p=B/s['snapshot'] if s.get('snapshot') else None
  if p and s.get('status')==200:
   data=p.read_bytes()
   if data.startswith(b'%PDF'):text='\n'.join(p.extract_text() for p in PdfReader(io.BytesIO(data)).pages)
   else:parser=Text();parser.feed(data.decode('utf-8',errors='replace'));text=' '.join(parser.parts)
   result['normalizedFragmentFound']=norm(row['originalfragment']) in norm(text)
   quotechars=str.maketrans('', '', '"„“‚‘’«»')
   result['typographyInsensitiveMatch']=norm(row['originalfragment']).translate(quotechars) in norm(text).translate(quotechars)
 research.append(result)
report={'status':'TEXT_LOCATOR_CHECK_ONLY','ifrPdfSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'ifr':ifr,'research20':research,'note':'Normalized literal search does not verify historical first use, authorship, date, context, rights or human approval. False means not found by this method, not proof of absence.'}
(B/'TESTNACHWEISE/FORTSETZUNG_ORIGINALFRAGMENTE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({'ifrTotal':len(ifr),'ifrMatches':sum(x['normalizedMatchOnSpecifiedPage'] for x in ifr),'researchTotal':len(research),'researchMatches':sum(x['normalizedFragmentFound'] is True for x in research),'researchNotFound':sum(x['normalizedFragmentFound'] is False for x in research),'researchBlocked':sum(x['normalizedFragmentFound'] is None for x in research)}))
