export function historicalHeadingTitle(title) {
  return String(title)
      .replace(/Video-\/Audio-Vorlesung/i, 'Kurzübersicht')
      .replace(/Transkript \(Gerüst\)|Transkript \/ Erklärgerüst/i, 'Erläuterung')
      .replace(/Quelltext und fachliche Grundlegung/i, 'Fachliche Grundlage')
      .replace(/V1-Finalisierung:\s*/i, '')
      .replace(/Tiefenskript-Erweiterung Sprint \d+/i, 'Vertiefung des Themas')
      .replace(/Finaler Leseauftrag/i, 'Leseauftrag');
}

// Historical public view only; the archived Markdown originals remain untouched.
export function historicalPublicScriptBody(source) {
  const out = []; let skipLevel = null;
  for (let line of String(source).split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (skipLevel !== null) {
      if (heading && heading[1].length <= skipLevel) skipLevel = null;
      else continue;
    }
    if (heading && /chart[- ]?spec|V1-Abschlussnotiz|Produktionshinweise|Satzfreigabe/i.test(heading[2])) { skipLevel=heading[1].length;continue; }
    if (/Codex|Claude|Markdown-Master|Word-Rohfassung|Reader-Spiegel|CI\/CD|Satzfreigabe|Medienintegration|PDF-Freigabe|App-Spiegel|Produktionslane|Inhaltsproduktion|\[Platzhalter\]|^\s*>?\s*\*\*Bildvorgabe:/i.test(line)) continue;
    if (/^\*\*(?:Track(?: \/ Kurscode)?|Kurscode|Vorlesungscode|Modul\/Abschnitt|Titel|Status|Wissensbasis|Führende Quellen \(Repo\)):\*\*/.test(line)) continue;
    if (/^\s*- \*\*(?:Titel|Länge|Medienquelle):\*\*/.test(line)) continue;
    line=line.replace(/ · \*\*Videolänge:\*\*.*/, '');
    if (heading) line=heading[1]+' '+historicalHeadingTitle(heading[2]);
    // Preserve the cited historical title/version without exposing repository paths.
    line=line.replace(/`(?:docs|assets|content|woek-akademie-app)\/([^`]+)`/g, (_, file) => file.split('/').at(-1).replace(/\.(?:md|docx|xlsx|pdf)$/i,'').replaceAll('_',' '));
    out.push(line);
  }
  return out.join('\n').replace(/\n{4,}/g,'\n\n\n');
}
