import fs from 'node:fs';
import path from 'node:path';
const data=JSON.parse(fs.readFileSync(new URL('../../../content/grundlagen/reference-corrections-20261009.json',import.meta.url),'utf8'));
const escape=(s)=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const marker='woek-core-revision-20261009';

export function applyReferenceCorrections(html, {withNotice=true}={}) {
  let next=html;let changed=false;
  for(const e of data.entries) {
    const re=new RegExp(`(<p\\b[^>]*\\bid="${escape(e.paragraphId)}"[^>]*>)([\\s\\S]*?)(</p>)`,'g');
    next=next.replace(re,(all,open,body,close)=>{
      if(body===e.newHtml)return all;
      // An upstream textual change requires review, never a silent overwrite.
      if(body!==e.oldHtml)throw new Error(`Paragraph changed upstream: ${e.paragraphId}`);
      changed=true;return open+e.newHtml+close;
    });
  }
  if(withNotice && (changed || next.includes(marker))) {
    const note=`<!-- ${marker}:start --><aside class="publication-current-note" id="${marker}" data-search-exclude><p><strong>Überarbeitete Online-Lesefassung: 9. Oktober 2026.</strong> Die SDG+-Passagen wurden anhand des Begriffsleitfadens v1.8, Abschnitt 4.2, präzisiert. Historische Druck- und PDF-Ausgaben behalten ihren ausgewiesenen Stand.</p></aside><!-- ${marker}:end -->`;
    const old=new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`,'g');
    next=next.includes(`<!-- ${marker}:start -->`)
      ? next.replace(old, note)
      : next.replace(/(<main\b[^>]*>)/,`$1\n${note}\n`);
  }
  return next;
}

export function applyCurrentScopeNotice(html) {
  const mark='woek-current-scope-20261009';
  const note=`<!-- ${mark}:start --><section class="section section-soft" id="${mark}"><h2>Wirtschaft und Gesellschaft</h2><p>Die Wirkungsökonomie ist ein umfassendes Wirtschafts- und Gesellschaftsmodell. Neben Produkten und Kapital gehören Medien, Wohnen, Gesundheit, Bildung, Pflege und demokratische Institutionen dazu. Relevante direkte, indirekte und zeitverzögerte Folgen werden geprüft; eine vollständige Kenntnis sämtlicher Wirkungen wird damit nicht behauptet.</p><p>Die Begriffsgrundlage ist der Leitfaden v1.8 vom 1. Oktober 2026. IOOI ist eine optionale externe Ergebniskette. SDG+ konkretisiert und ergänzt vorhandene UN-Bezüge; Demokratie und Rechtsstaatlichkeit sind in Agenda 2030 und SDG 16 bereits verankert.</p><h3>Aktionsplan Nachhaltigkeit vom 30. September 2026</h3><p>Der im Bundeskabinett beschlossene Aktionsplan konkretisiert die Umsetzung der Agenda 2030 und der Deutschen Nachhaltigkeitsstrategie in 20 Missionen mit Bezügen zu fünf Handlungsfeldern. Er ersetzt weder bestehende Folgenprüfungen noch notwendige Einzelgesetze und Haushaltsentscheidungen. Beschluss, Umsetzung und nachgewiesene Wirkung bleiben verschiedene Schritte. <a href="https://www.bundesregierung.de/breg-de/aktuelles/aktionsplan-nachhaltigkeit-2440506">Amtliche Veröffentlichung und Beschlussdokument</a>.</p><p>Bereits seit 2009 besteht nach amtlicher Darstellung die Nachhaltigkeitsprüfung bei Gesetzes- und Verordnungsentwürfen; eNAP steht seit 2018 zur Verfügung. Die WÖk schließt an diese Verfahren an. Eine Pflicht zur Prüfung ist keine Garantie, dass nur Vorhaben mit positiver Gesamtwirkung beschlossen werden. <a href="https://www.bundesregierung.de/breg-de/schwerpunkte/wirksam-regieren/steuerung-nachhaltigkeitsstrategie-419776">Amtliche Einordnung der bestehenden Verfahren</a>.</p><p>Die Rechenregel für T-SROI wird in v1.1 beschrieben. Der WStG-3.0-Entwurf ist kein geltendes Gesetz.</p></section><!-- ${mark}:end -->`;
  const re=new RegExp(`<!-- ${mark}:start -->[\\s\\S]*?<!-- ${mark}:end -->`,'g');
  return html.includes(`<!-- ${mark}:start -->`) ? html.replace(re,note) : html.replace('</main>',note+'\n</main>');
}

if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)) {
  let changed=0,chapters=0;
  for(const d of fs.readdirSync('referenz',{withFileTypes:true})) {
    if(!d.isDirectory()||!/^kapitel-\d{3}-/.test(d.name))continue;
    const file=path.join('referenz',d.name,'index.html');
    const s=fs.readFileSync(file,'utf8');const n=applyReferenceCorrections(s);chapters++;
    if(n!==s){fs.writeFileSync(file,n);changed++;}
  }
  const full='referenz/volltext/index.html';
  if(fs.existsSync(full)){const s=fs.readFileSync(full,'utf8');fs.writeFileSync(full,applyReferenceCorrections(s));}
  const update='referenz/aktualisierung/index.html';
  fs.writeFileSync(update,applyCurrentScopeNotice(fs.readFileSync(update,'utf8')));
  console.log(`Explicit paragraph revision: scanned ${chapters} chapter pages, changed ${changed}; current state/action-plan note updated.`);
}
