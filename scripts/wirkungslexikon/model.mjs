import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTENT = path.join(ROOT, 'content/wirkungslexikon');
export const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export function atomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file);
}
export const reserved = new Set(['kategorien', 'afd', 'institut-fuer-remigration', 'cdu-csu', 'umdeutungen', 'zivilgesellschaft', 'methodik', 'fuer-redaktionen', 'fuer-buerger', 'fuer-wissenschaft', 'redaktion', 'offene-recherche', 'data', 'suche', 'share']);
export function approvedV9(data) {
  if(data.releaseVersion!=='V9')return false;
  const policy=read(path.join(CONTENT,'publication-policy.json')).lexikon;
  const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
  if(!policy.released||policy.person!=='Natalie Weber'||!policy.dataSha256||sha(canonical(data))!==policy.dataSha256)throw Error('V9_REVISION_APPROVAL_MISMATCH');
  return true;
}
export function validate(data, {allowSubset=false}={}) {
  const v9Approved=approvedV9(data);
  if (data.version !== '3.0' || !Array.isArray(data.entries) || (!allowSubset && data.entries.length < 150)) throw Error('Ungültiger V3-Master');
  const ids = new Set(), slugs = new Set(), cats = new Set(data.kategorien.map(c => c.name));
  for (const e of data.entries) {
    if (!e.id || ids.has(e.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug) || slugs.has(e.slug) || reserved.has(e.slug)) throw Error(`ID/Slug ungültig oder doppelt: ${e.slug}`);
    ids.add(e.id); slugs.add(e.slug);
    for (const k of ['begriff','akteur','korpus','dokumentiertes_ziel','moegliche_kommunikative_funktion','pruefstatus','version','geprueft_am']) if (typeof e[k] !== 'string' || !e[k].trim()) throw Error(`${e.slug}: ${k} fehlt`);
    if (!e.kategorien?.length || e.kategorien.some(c => !cats.has(c))) throw Error(`${e.slug}: Kategorie unbekannt`);
    if (!e.originalnachweis || !e.psychologischer_effekt || !e.wirkungspotenzial || !e.bedeutungsverschiebung || !e.redaktionelle_alternativen?.length || !Array.isArray(e.quellen)) throw Error(`${e.slug}: Pflichtstruktur fehlt`);
    for (const key of ['adressaten','moegliche_veraenderung','bedingungen','gegenwirkung']) if (typeof e.wirkungspotenzial[key] !== 'string' || !e.wirkungspotenzial[key].trim()) throw Error(`${e.slug}: Wirkungspotenzial.${key} fehlt`);
    for (const q of [...e.quellen, ...e.wissenschaftliche_quellen]) {
      if (!q.id || !q.title || !q.role || !/^https?:$/.test(new URL(q.url).protocol)) throw Error(`${e.slug}: ungültige Quelle`);
    }
    if (e.beobachtete_wirkung && (!e.beobachtete_wirkung.beleg_ids?.length || e.beobachtete_wirkung.beleg_ids.some(id => !e.quellen.some(q=>q.id===id) && !data.quellenregister[id]))) throw Error(`${e.slug}: Wirkungsbeleg fehlt`);
    if (e.pruefstatus === 'freigegeben' && !v9Approved) {
      const missing = approvalProblems(e);
      if (missing.length) throw Error(`${e.slug}: Freigabe gesperrt: ${missing.join('; ')}`);
    }
  }
  return data;
}
export function approvalProblems(e) {
  const p = [];
  if (e.korpus.startsWith('Offene Recherche') || e.slug.startsWith('offen-')) p.push('Recherchekandidat bleibt privat; belegten eigenen Eintrag anlegen');
  if (!e.quellen.length || !e.originalnachweis.quelle_id || !e.quellen.some(q=>q.id===e.originalnachweis.quelle_id)) p.push('Originalquelle fehlt');
  if (!e.freigabe || e.freigabe.person !== 'Natalie Weber' || !e.freigabe.am || !e.freigabe.nachweis) p.push('ausdrückliche Freigabe Natalie Weber fehlt');
  if(e.quellen.some(q=>q.role?.includes('Sekundäranalyse')) && e.korpus.includes('Policy Paper')) p.push('Originalpapier noch nicht geprüft');
  if(e.slug==='afd-remigration' && !e.redaktionelle_klaerung?.includes('AfD-Original')) p.push('A1: IFR-Verschiebungstext auf AfD-Karte ungeklärt');

  return p;
}
export function loadModel() {
  const bytes = fs.readFileSync(path.join(CONTENT, 'wirkungslexikon_master_v3.json'));
  const master = validate(JSON.parse(bytes));
  const editorialFile = path.join(CONTENT, 'editorial.json');
  const editorial = fs.existsSync(editorialFile) ? read(editorialFile) : { revision: 0, overrides: {}, history: {} };
  const additions=fs.existsSync(path.join(CONTENT,'additions.json'))?read(path.join(CONTENT,'additions.json')):[];
  const entries = [...master.entries,...additions].map(e=>editorial.overrides[e.slug] || e);
  validate({...master, entries});
  return {master, editorial, data:{...master, entries}, checksum:sha(bytes)};
}
export function publicData(data) {
  if(approvedV9(data))return data;
  const entries = data.entries.filter(e=>e.pruefstatus==='freigegeben' && !approvalProblems(e).length);
  const sourceIds = new Set(entries.flatMap(e=>[...e.quellen.map(q=>q.id), ...(e.beobachtete_wirkung?.beleg_ids || [])]));
  return {titel:data.titel, version:data.version, stand:data.stand, kategorien:data.kategorien, entries,
    quellenregister:Object.fromEntries(Object.entries(data.quellenregister).filter(([id])=>sourceIds.has(id)))};
}
