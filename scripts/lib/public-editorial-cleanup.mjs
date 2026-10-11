export function stripAiTrackingParameters(content) {
  // Repair separators only inside a removed parameter. A global ?& cleanup
  // corrupts prose such as “Frage?&quot;” into the visible text “Frage?quot;”.
  const parameter = /([?&](?:amp;)*)(?:utm_source|utm_medium|utm_campaign)=(?:chatgpt|openai|claude|anthropic|gemini|copilot)(?:\.com)?(?=(?:&(?:amp;)*|#|["')\s<>]|$))(&(?:amp;)*(?!(?:[a-z][a-z0-9]*|#(?:x[0-9a-f]+|[0-9]+));))?/gi;
  let previous;
  do {
    previous = content;
    content = content.replace(parameter, (_match, separator, followingSeparator) =>
      followingSeparator ? separator : "",
    );
  } while (content !== previous);
  return content;
}

export function stripEditorialHtmlNotes(content) {
  // Produktions- und Agentenhinweise sind weder Beleg noch Erklärung. Eine
  // veröffentlichte Seite darf nur fachlichen Inhalt, Quellen- und
  // Versionsinformationen für Leser:innen enthalten.
  const editorialPhrase = "(?:Live-Reference|Import-?Version|Source-Hash|PDF-Fassung in Produktion|Codex(?:-Anweisung|-Fassung)|Claude(?:-CI\\/CD)|CI\\/CD(?:-Satzfreigabe|-Freigabe)?|Erstellt nach[^<]{0,180}Vorlesung-Template|Quell-?Dokument für (?:Claude|Codex)|Eine Software darf feste Regeln anwenden|Glossarseiten und Toolseiten auf führende Definitionen bringen|Das Template soll nicht schematisch wirken\\. Es dient als redaktioneller Unterbau|Keine technischen TODOs in öffentlichen Online-Volltexten)";
  // Match one leaf block with its own closing tag. Never cross a paragraph,
  // section, list, heading or raw script/style boundary to reach a later note.
  const block = /<(p|li|aside|section|div)\b[^>]*>(?:(?!<\/?(?:p|li|aside|section|h[1-6]|div|ul|ol|script|style|table|tr|td|th)\b)[\s\S])*?<\/\1>/gi;
  const phrase = new RegExp(editorialPhrase, 'i');
  return content
    .split(/(<(?:script|style|textarea)\b[^>]*>[\s\S]*?<\/(?:script|style|textarea)>)/gi)
    .map((part,i)=>i%2 ? part : replaceReaderFacingText(part.replace(block, match => phrase.test(match.replace(/<[^>]+>/g, ' ')) ? '' : match)))
    .join('')
    // These are legacy production labels, not headings that help a reader.
    // Keep the substantive section and give it a plain, meaningful label.
    .replace(/Auszug aus der umfangreichen Korrekturfassung\.?/gi, "Fachliche Vertiefung")
    .replace(/ergänzende\s+ergänzende/gi, "ergänzende");
}

// Only reviewed production wording is changed. Bibliographic dates, draft
// status, evidence gaps, consent notices and technical subject matter remain.
function replaceReaderFacingText(html) {
  return html.replace(/>([^<]+)</g, (match, value) => '>'+value
    .replace(/Redaktionshinweis für die nächste Fassung/g, 'Öffentlicher Wirkungsraum und Wirkungsökonomie')
    .replace(/Redaktionshinweis für die nächste Fa(?=\s*(?:→|$))/g, 'Öffentlicher Wirkungsraum')
    .replace(/(?:Status:\s*)?fachlicher Master in Ausarbeitung\s*[·-]\s*vor Veröffentlichung redaktionell prüfen/g, 'Modellhaftes Lernmaterial · Entwurf')
    .replace(/Einige Detailseiten enthalten noch generische oder unpräzise Definitionen, etwa Platzhalter beim NWI oder Formulierungen wie „tatsächliche oder erwartbare Wirkung“\. Version 1\.5 liefert den verbindlichen Korrekturmaßstab\./g, 'Wirkung bezeichnet eine tatsächliche Zustandsveränderung. Wirkungspotenzial und Wirkungsrisiko sind davon zu unterscheiden.')
    .replace(/Für die nächste Fassung sollte das Dossier redaktionell neu sortiert werden:[\s\S]*?stärker belegt werden\./g, 'Die beschriebenen Wirkpfade sind Modellannahmen. Für ihre empirische Prüfung braucht es geeignete wissenschaftliche Belege aus Medienforschung und Demokratietheorie.')
    .replace(/Jede Seite enthält eine Kernaussage, erläuternde Absätze, Prüffragen oder Anwendungen und einen Merksatz\. Dadurch kann das Dossier später leicht in Website-Bausteine, Seminarfolien, Glossartexte oder Debattenkarten-Templates zerlegt werden\./g, 'Die Kapitel verbinden Kernaussagen mit Erklärungen, Prüffragen und Anwendungen.')
    .replace(/Hinweis: Diese Fassung ist als umfangreiche Arbeitsgrundlage angelegt\. Je nach Satz, Schriftgröße, Tabellenanteil und Layout kann daraus ein Dossier von etwa 80 bis 110 Druckseiten entstehen\. Die vorliegende Datei priorisiert argumentative Dichte, Anschlussfähigkeit an die WÖk-Begriffe und praktische Verwendbarkeit für Website, Akademie, Medienarbeit und politische Kommunikation\./g, 'Das Dossier erklärt die Wellen der Wirkungsentfaltung und ihre Bedeutung für öffentliche Debatten.')
    .replace(/Da kein Formular-Backend vorhanden ist, läuft die erste Kontaktaufnahme über E-Mail oder den bestehenden Mitmachen-Pfad\./g, 'Beschreibe deine Pilotidee kurz per E-Mail oder melde dich über die Mitmachen-Seite.')
    .replace(/Externe Zahlen müssen vor Veröffentlichung aktualisiert werden\./g, 'Für die Einordnung ist der Zeitraum der verwendeten Daten entscheidend.')
    .replace(/Medienquelle:\s*\[Platzhalter\]/g, 'Wähle für diese Übung eine belegte Medienquelle.')
    .replace(/Glossarseiten und Toolseiten auf führende Definitionen bringen; IOOI\/IOI-Suchkonflikt vermeiden; NWI-Platzhalter ersetzen\./g, 'Wirkung, Wirkungspotenzial und Wirkungsrisiko unterscheiden; IOI und IOOI sowie die beiden NWI-Begriffe getrennt erklären.')
    .replace(/interne Arbeitsanweisungen(?:\s+Redaktion)+\s+Redaktionshinweis/g, '')
    .replace(/Onlinefassung-Template/g, 'Online-Buch')
    .replace(/Online-Volltext-Template/g, 'Online-Volltext')
    .replace(/Wirkungsoekonomie akademie master template/gi, 'WÖk-Akademie: Lehrkonzept')
    +'<')
    .replace(/(<strong>Medienquelle:<\/strong>)\s*\[Platzhalter\]/g, '$1 Wähle für diese Übung eine belegte Medienquelle.');
}

export function findPublicEditorialResidue(html) {
  const visible = html.replace(/<!--[^]*?-->/g, ' ')
    .replace(/<(script|style|textarea)\b[^>]*>[^]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const patterns = [
    /Eine Software darf feste Regeln anwenden/i,
    /Für das vom Nutzer festgelegte Produktbeispiel/i,
    /Für den zuletzt festgelegten Umsetzungspfad/i,
    /Backend später/i,
    /kein Formular-Backend vorhanden/i,
    /(?:Live-Reference|Import-?Version|Source-Hash|PDF-Fassung in Produktion)/i,
    /(?:Codex(?:-Anweisung|-Fassung)|Claude-CI\/CD|CI\/CD-(?:Satzfreigabe|Freigabe))/i,
    /vor Veröffentlichung redaktionell prüfen/i,
    /Redaktionshinweis für die nächste Fassung/i,
    /Das Template soll nicht schematisch wirken\. Es dient als redaktioneller Unterbau/i,
    /Glossarseiten und Toolseiten auf führende Definitionen bringen/i,
    /Medienquelle:\s*\[Platzhalter\]/i,
    /Alle Inhalte starten redaktionell/i,
    /Importvorbereitung und redaktionelles Backend wurden im Repository umgesetzt/i,
    /Website 1\.0 erst nach Linkcheck, Downloadcheck, Mobile-QA und Sichtpruefung freigeben/i,
    /Integrationsgrundlage Website 1\.0 ausfuehren/i,
  ];
  return patterns.flatMap(pattern => {const match=visible.match(pattern); return match ? [match[0]] : [];});
}
