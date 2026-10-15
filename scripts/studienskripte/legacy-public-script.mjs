import { createHash } from 'node:crypto';
export function historicalHeadingTitle(title) {
  return String(title)
      .replace(/Video-\/Audio-Vorlesung/i, 'Kurzübersicht')
      .replace(/Transkript \(Gerüst\)|Transkript \/ Erklärgerüst/i, 'Erläuterung')
      .replace(/Quelltext und fachliche Grundlegung/i, 'Fachliche Grundlage')
      .replace(/V1-Finalisierung:\s*/i, '')
      .replace(/Tiefenskript-Erweiterung Sprint \d+/i, 'Vertiefung des Themas')
      .replace(/Finaler Leseauftrag/i, 'Leseauftrag')
      .replace(/^Interne Quellen$/i, 'WÖk-Quellen')
      .replace(/^Quellenanker:/i, 'Quelle:');
}

// Historical public view only; the archived Markdown originals remain untouched.
export function historicalPublicScriptBody(source, { publicPageExists = () => false } = {}) {
  const out = []; let skipLevel = null;
  const lines=String(source).split(/\r?\n/);
  for (let index=0;index<lines.length;index++) {
    let line=lines[index];
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (skipLevel !== null) {
      if (heading && heading[1].length <= skipLevel) skipLevel = null;
      else continue;
    }
    const planning=heading && /Konsequenzen f(?:ü|ue)r die WÖk-Architektur/i.test(heading[2]) && /CorrectAnswer|App-Lane|Reader\/PDF/.test(lines.slice(index+1,index+12).join(' '));
    if (planning) {skipLevel=heading[1].length;continue;}
    if (heading && /Prüfungsrelevanz|chart[- ]?spec|V1-Abschlussnotiz|Produktionshinweise|Satzfreigabe/i.test(heading[2])) { skipLevel=heading[1].length;continue; }
    if (/Codex|Claude|Markdown-Master|Word-Rohfassung|Reader-Spiegel|CI\/CD|Satzfreigabe|Medienintegration|PDF-Freigabe|App-Spiegel|Produktionslane|Inhaltsproduktion|CorrectAnswer|App-Lane|Reader\/PDF\s+sollte|Du liest die Onlinefassung|Diese Seite ist der öffentliche Einstieg|Die Downloadfassung und die Druckfunktion|\[Platzhalter\]|^\s*>?\s*\*\*Bildvorgabe:/i.test(line)) continue;
    if (/^\*\*(?:Track(?: \/ Kurscode)?|Kurscode|Vorlesungscode|Modul\/Abschnitt|Titel|Status|Wissensbasis|Führende Quellen \(Repo\)):\*\*/.test(line)) continue;
    if (/^\s*- \*\*(?:Titel|Länge|Medienquelle):\*\*/.test(line)) continue;
    line=line.replace(/ · \*\*Videolänge:\*\*.*/, '');
    if (heading) line=heading[1]+' '+historicalHeadingTitle(heading[2]);
    if (/^\s*(?:Onlinefassung|Du liest die Onlinefassung)\s*#?\s*$/.test(line))continue;
    line=line.replace(/Öffentliche Downloadfassung:\s*WÖK-CI-PDF\.?/gi,'').replace(/Interne Quelle:/g,'WÖk-Quelle:');
    if(line.includes('Maiwaldisierung'))line=line.split(/(?<=[.!?])\s+/).filter(sentence=>!sentence.includes('Maiwaldisierung')).join(' ');
    line=line.replace(/`((?:(?:referenz|werkzeuge|dokumente|wissen|beispiele|bibliothek|wirkungsfelder)\/[^`]+\.html|buch\.html))`/g,(_,file)=>{const name=file.replace(/\/index\.html$/,'').split('/').at(-1).replace(/\.html$/,'').replaceAll('-',' ');return publicPageExists(file)?`[${name}](../../../${file})`:name;});
    // Preserve the cited historical title/version without exposing repository paths.
    line=line.replace(/`(?:docs|assets|content|woek-akademie-app)\/([^`]+)`/g, (_, file) => file.split('/').at(-1).replace(/\.(?:md|docx|xlsx|pdf)$/i,'').replaceAll('_',' '));
    out.push(line);
  }
  return out.join('\n').replace(/\n{4,}/g,'\n\n\n');
}

export function legacyParagraphFingerprint(text) {
  let value=String(text).replace(/Öffentliche Downloadfassung:\s*WÖK-CI-PDF\.?/gi,'');
  if(value.includes('Maiwaldisierung'))value=value.split(/(?<=[.!?])\s+/).filter(sentence=>!sentence.includes('Maiwaldisierung')).join(' ');
  value=value.replace(/(?:Interne Quelle|WÖk-Quelle):/gi,'Quelle:')
    .replace(/(?:referenz|werkzeuge|dokumente|wissen|beispiele|bibliothek|wirkungsfelder)\/[^\s]+\.html/g,file=>file.replace(/\/index\.html$/,'').split('/').at(-1).replace(/\.html$/,'').replaceAll('-',' '))
    .replace(/(?:docs|assets|content|woek-akademie-app)\/[^\s]+\.(?:md|docx|xlsx|pdf)/g,file=>file.split('/').at(-1).replace(/\.(?:md|docx|xlsx|pdf)$/,'').replaceAll('_',' '))
    .replace(/(?:WÖk[-\s]+)?Netto[-\s]+Wirkungs[-\s]*Index|\bNWI\b/gi,'NWI')
    .normalize('NFKC').toLowerCase().replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\s+/g,'');
  return createHash('sha256').update(value).digest('hex');
}
export function historicalHtmlText(html) {
  const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return html.replace(/<[^>]+>/g,' ').replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi,(_,code)=>code[0]==='#'?String.fromCodePoint(parseInt(code.slice(code[1].toLowerCase()==='x'?2:1),code[1].toLowerCase()==='x'?16:10)):(entities[code.toLowerCase()]??_));
}
