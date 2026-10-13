from pathlib import Path
from copy import deepcopy
import json,re
ROOT=Path(__file__).resolve().parents[3]
def json_file(path):return json.loads((ROOT/path).read_text())
def save(path,data):(ROOT/path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
path='content/documents/documents.json';d=json_file(path);rows=d['documents'];current=next(x for x in rows if x['id']=='woek-begriffsleitfaden-fuehrend')
if not any(x['id']=='woek-begriffsleitfaden-fuehrend-v1-7' for x in rows):
    old=deepcopy(current);old.update(id='woek-begriffsleitfaden-fuehrend-v1-7',slug='woek-begriffsleitfaden-fuehrend-v1-7',status='archiviert',isLeadingReference=False,section='Historische Referenzen',contentHtmlPath='content/documents/online/woek-begriffsleitfaden-v1-7.inc',replacedBy=current['id'],editorialNote='Historische Originalfassung v1.7 vom 21. August 2026. Für aktuelle Begriffe ist v1.8 maßgeblich.')
    rows.append(old)
current.update(title='WÖk-Begriffsleitfaden führend v1.8',fileName='WOeK_Begriffsleitfaden_fuehrend_v1.8.pdf',filePath='public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.8.pdf',version='v1.8',date='2026-10-01',pageCount=59,fileSize='884 KB',estimatedReadingTime='100 Min.',author='Natalie Weber',summaryShort='Führende Begriffsgrundlage v1.8: sieben überlagernde Blickwinkel, optionale IOOI-Methode, getrennte Register- und Evidenzrollen sowie aspektbezogene SDG+-Präzisierung.',editorialNote='Unveränderte Originalfassung v1.8 vom 1. Oktober 2026, anhand der SHA-256-Prüfsumme übernommen. Frühere Ausgaben bleiben historisch erhalten.',replaces=['woek-begriffsleitfaden-fuehrend-v1-7'])
for row in rows:
    if row['id'].startswith('woek-begriffsleitfaden-fuehrend-v1-'):
        for key in ['whatToExpect','keyQuestions']:
            v=row.get(key)
            if isinstance(v,str):row[key]=v.replace('aktuelle Fassung v1.7','aktuelle Fassung v1.8').replace('aktuellen Begriffsstand gilt v1.7','aktuellen Begriffsstand gilt v1.8')
            elif isinstance(v,list):row[key]=[x.replace('aktuelle Fassung v1.7','aktuelle Fassung v1.8') for x in v]
save(path,d)
path='content/site/reference-update.json';d=json_file(path);d['reviewedAt']='2026-10-09';d['description']=d['description'].replace('v1.7','v1.8')
for x in d['references']:
    if x['title']=='Begriffsleitfaden v1.7':x.update(title='Begriffsleitfaden v1.8',status='Führende Begriffsgrundlage · 01.10.2026',text='Maßgeblich für Wirkung, Evidenz, sieben überlagernde Blickwinkel, die optionale IOOI-Methode, getrennte Registerrollen, SDG+ und objektspezifische staatliche Prüfarchitektur.')
save(path,d)
path=ROOT/'scripts/review/live-reference-core.mjs';s=path.read_text().replace('WOeK_Begriffsleitfaden_fuehrend_v1.7.md','WOeK_Begriffsleitfaden_fuehrend_v1.8.md').replace('export const TERMINOLOGY_BASE_DATE = "2026-08-21"','export const TERMINOLOGY_BASE_DATE = "2026-10-01"');path.write_text(s)
path=ROOT/'scripts/glossary/build-glossary-registry.mjs';s=path.read_text().replace('version: "1.7",\n  title: "WÖk-Begriffsleitfaden führend v1.7"','version: "1.8",\n  title: "WÖk-Begriffsleitfaden führend v1.8"').replace('new Set(["1.0", "1.2", "1.3", "1.4", "1.5", "1.6"])','new Set(["1.0", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"])');path.write_text(s)
print('Synced actual v1.8 original and explicitly archived v1.7; historical bodies preserved.')
