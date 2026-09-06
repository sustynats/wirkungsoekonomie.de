export function stripEditorialHtmlNotes(content) {
  // Produktions- und Agentenhinweise sind weder Beleg noch Erklärung. Eine
  // veröffentlichte Seite darf nur fachlichen Inhalt, Quellen- und
  // Versionsinformationen für Leser:innen enthalten.
  const editorialPhrase = "(?:Live-Reference|Import-?Version|Source-Hash|PDF-Fassung in Produktion|Codex(?:-Anweisung|-Fassung)|Claude(?:-CI\\/CD)|CI\\/CD(?:-Satzfreigabe|-Freigabe)?|Erstellt nach[^<]{0,180}Vorlesung-Template|Quell-?Dokument für (?:Claude|Codex))";
  // Match one leaf block with its own closing tag. Never cross a paragraph,
  // section, list, heading or raw script/style boundary to reach a later note.
  const block = /<(p|li|aside|section)\b[^>]*>(?:(?!<\/?(?:p|li|aside|section|h[1-6]|div|ul|ol|script|style)\b)[\s\S])*?<\/\1>/gi;
  const phrase = new RegExp(editorialPhrase, 'i');
  return content
    .split(/(<(?:script|style|textarea)\b[^>]*>[\s\S]*?<\/(?:script|style|textarea)>)/gi)
    .map((part,i)=>i%2 ? part : part.replace(block, match => phrase.test(match.replace(/<[^>]+>/g, ' ')) ? '' : match))
    .join('')
    // These are legacy production labels, not headings that help a reader.
    // Keep the substantive section and give it a plain, meaningful label.
    .replace(/Auszug aus der umfangreichen Korrekturfassung\.?/gi, "Fachliche Vertiefung")
    .replace(/ergänzende\s+ergänzende/gi, "ergänzende");
}

