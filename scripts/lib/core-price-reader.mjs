import {renderEditorialMarkdown} from '../news/editorial-markdown.mjs';

// Adapt only the reviewed production wording in the supplied primary source.
// The source file itself stays byte-identical and remains authoritative.
const wording = [
  ['Die bisherige Kurzfassung ließ die fondsfinanzierte Entlastung zu wenig sichtbar werden. Die Originalgrundlagen nennen sie ausdrücklich:',
   'Die Grundlagen der Wirkungsökonomie nennen die fondsfinanzierte Entlastung ausdrücklich:'],
  ['Für das vom Nutzer festgelegte Produktbeispiel muss diese Entlastung die tatsächliche Zahlung beim Kauf gegenüber vorher senken. Eine lediglich relativ günstigere Stellung reicht hier nicht aus.',
   'Eine aktive Produktentlastung senkt die tatsächliche Zahlung beim Kauf gegenüber vorher. Eine lediglich relativ günstigere Stellung zeigt diese Entlastung noch nicht.'],
  ['Für den zuletzt festgelegten Umsetzungspfad bleibt das reguläre Umsatzsteuersystem bestehen.',
   'Im T-Shirt-Lernmodell bleibt das reguläre Umsatzsteuersystem bestehen.'],
];

export function renderCorePriceSections(reference) {
  return ['9.1', '9.3', '9.4'].map(number => {
    const marker = `### ${number} `;
    const start = reference.indexOf(marker);
    if (start < 0 || reference.indexOf(marker, start + marker.length) >= 0)
      throw new Error('Missing or ambiguous provided core section ' + number);
    const next = reference.indexOf('\n### ', start + 1);
    let text = reference.slice(start, next < 0 ? reference.length : next).trim();
    if (number === '9.1') for (const [original, reader] of wording) {
      if (text.split(original).length !== 2)
        throw new Error('Provided core wording changed; review the source before adapting it');
      text = text.replace(original, reader);
    }
    // Use the existing Markdown renderer for actual lists and paragraphs.
    return `<section>${renderEditorialMarkdown(text.replace(/^### /, '## '), {automaticArrowDiagrams:false}).html}</section>`;
  }).join('\n');
}
