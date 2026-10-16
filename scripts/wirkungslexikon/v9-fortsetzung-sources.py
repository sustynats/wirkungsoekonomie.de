from pathlib import Path
import json,re,subprocess,hashlib,datetime,concurrent.futures
B=Path(__file__).resolve().parents[2]/'outputs/wirkungslexikon/v9';index=json.loads((B/'review/index.json').read_text());S=Path(index['source']);OUT=B/'review/sources';OUT.mkdir(exist_ok=True)
urls=set()
for p in S.rglob('*'):
 if p.suffix in ['.md','.json','.csv']:
  urls.update(x.rstrip('.,;:`') for x in re.findall(r'https?://[^\s<>"\)\]\};|`\\]+',p.read_text()))
urls={u for u in urls if not any(x in u for x in ['json-schema.org','example.org','wirkungsoekonomie.de/'])}
def fetch(url):
 key=hashlib.sha256(url.encode()).hexdigest();dest=OUT/(key+'.body');row={'url':url,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'humanApproved':False}
 try:
  p=subprocess.run(['/usr/bin/curl','--silent','--show-error','--location','--max-time','35','--retry','1','--output',str(dest),'--write-out','%{http_code}\n%{url_effective}\n%{content_type}',url],capture_output=True,text=True,timeout=80)
  lines=p.stdout.splitlines();row.update(status=int(lines[0]) if lines and lines[0].isdigit() else None,finalUrl=lines[1] if len(lines)>1 else None,contentType=lines[2] if len(lines)>2 else None)
  if p.returncode:row['error']=p.stderr[:250]
  if dest.exists():
   data=dest.read_bytes();row.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest());row['snapshot']=str(dest.relative_to(B));row['accessOnlyNotClaimVerification']=True
  return row
 except Exception as e:row['error']=str(e)[:250];return row
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:rows=list(ex.map(fetch,sorted(urls)))
(B/'review/SOURCE_ACCESS_CHECKS.json').write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':rows,'note':'HTTP response and exact bytes only, no human quote or rights approval. Cookies/interstitials may return HTTP 200.'},ensure_ascii=False,indent=2))
from collections import Counter
print(json.dumps({'urls':len(rows),'httpStatusCounts':dict(Counter(str(x.get('status')) for x in rows))}))
