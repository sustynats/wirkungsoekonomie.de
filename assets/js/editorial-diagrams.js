// Presentation-only diagrams. The caller supplies the existing, escaped inline
// Markdown renderer; no model, network request or factual inference is involved.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export const EDITORIAL_VISUAL_RULE = 'Jede Analyse braucht eine bewusste Visual-Prüfung. Ein MPD-Profil, Titelbild, Portrait oder Logo zählt nicht als erklärende Grafik. Nutze mindestens einen passenden Wirkpfad, Ablauf, Vergleich oder eine Systemübersicht, soweit der Inhalt dies trägt. Kurze Abläufe als eigenen Absatz mit mindestens drei durch → getrennten Schritten schreiben; keine Aufzählung als Kausalität ausgeben. Bedingungen, Belegstatus und Unsicherheit unmittelbar davor oder danach benennen. Für komplexe Vergleiche bestehende Tabellen verwenden. Keine erfundenen Zahlen, keine generativen Dekorationsbilder. Inhaltlich ergänzte Grafiken gehören in die private Vorschau und zur gleichen abschließenden Freigabe wie der Text.';

export function arrowSteps(text) {
  let value = text.trim().replace(/^> ?/gm, '').replace(/\s*\n\s*/g, ' ');
  // Only a complete standalone chain. Never split URLs, prose introducing a
  // chain, Markdown links, or incomplete bold markup into speculative nodes.
  if (value.startsWith('**') && value.endsWith('**') && (value.match(/\*\*/g) || []).length === 2) value = value.slice(2, -2);
  const steps = value.split(/\s*→\s*/);
  if (steps[0].length > 160) return null;
  if (steps.length < 3 || steps.length > 9 || steps.some(s => !s.trim() || s.length > 420 || /https?:|\]\(/.test(s))) return null;
  if (steps.some(s => ((s.match(/\*\*/g) || []).length % 2) !== 0)) return null;
  return steps;
}

export function renderTextDiagram({caption, items, mode = 'sequence', note = ''}, inline) {
  const tag = mode === 'sequence' ? 'ol' : 'ul';
  return `<figure class="news-systemic-visual news-editorial-diagram news-editorial-diagram--${esc(mode)}" data-editorial-explanatory-visual><figcaption>${esc(caption)}</figcaption><${tag}>${items.map((item, i) => `<li class="news-systemic-node"><span class="news-editorial-diagram__marker" aria-hidden="true">${mode === 'sequence' ? i + 1 : '•'}</span>${inline(item)}</li>`).join('')}</${tag}>${note ? `<p class="news-method-note">${esc(note)}</p>` : ''}</figure>`;
}

export function renderArrowDiagram(text, inline) {
  const items = arrowSteps(text);
  return items ? renderTextDiagram({caption:'Zusammenhang auf einen Blick',items,note:'Die Pfeile zeigen den im Text beschriebenen Zusammenhang. Bedingungen und Belegstatus stehen in der zugehörigen Einordnung; die Grafik ist kein zusätzlicher Wirkungsnachweis.'},inline) : '';
}

export function renderTableDiagram(rows, plan, inline) {
  const [labels, , ...values] = rows;
  if (!values.length || !['steps','lanes','comparison'].includes(plan.mode)) throw Error('EDITORIAL_DIAGRAM_PLAN_INVALID');
  const cell = (label, value) => `<div class="news-editorial-diagram__cell"><span class="news-editorial-diagram__label">${inline(label)}</span><div>${inline(value)}</div></div>`;
  const branch = plan.branch_last ? values.slice(-1) : [];
  const main = plan.branch_last ? values.slice(0,-1) : values;
  const row = values => `<li class="news-systemic-node">${values.map((value,i)=>cell(labels[i],value)).join('')}</li>`;
  const tag = plan.mode === 'steps' ? 'ol' : 'ul';
  const widthClass = labels.length === 2 && plan.mode === 'steps' ? ' news-editorial-diagram--two-columns' : '';
  return `<figure class="news-systemic-visual news-editorial-diagram news-editorial-diagram--${plan.mode}${widthClass}" data-editorial-explanatory-visual><figcaption>${esc(plan.caption)}</figcaption><${tag}>${main.map(row).join('')}</${tag}>${branch.length ? `<div class="news-editorial-diagram__branch"><p class="news-editorial-diagram__label">Alternativer Risikopfad</p><ul>${branch.map(row).join('')}</ul></div>` : ''}<p class="news-method-note">${esc(plan.note || 'Lesebild der im Beitrag beschriebenen Zusammenhänge. Bedingte Folgen bleiben bedingt; die Grafik belegt keinen zusätzlichen Kausalzusammenhang.')}</p></figure>`;
}

// Explicit label -> explanation pairs form an authored diagram, not an
// inferred causal chain. Original words and order stay intact.
export function labeledArrowItem(text) {
  return /^\*\*([^*\n]{3,100})\*\*\n→ ([^\n]{3,600})$/.exec(text.trim());
}

export function renderLabeledArrowDiagram(items, inline) {
  return renderTextDiagram({caption:'Wirkpfade und zu prüfende Risiken',items,
    note:'Die Grafik stellt die im Text beschriebene Steuerungslogik dar, keine gemessenen Wirkungen.'},inline)
    .replace('news-editorial-diagram--sequence', 'news-editorial-diagram--sequence news-editorial-diagram--labeled');
}

// The private server can be one release behind Pages. Enhance only its exact
// escaped Markdown label/arrow paragraphs; never interpret HTML as commands.
export function enhancePrivateEditorialHtml(html) {
  const block = '<p><strong>[^<\\n]{3,150}</strong>\\n→ [^<\\n]{3,900}</p>';
  return html.replace(new RegExp('(?:'+block+'\\s*){3,9}', 'g'), group => {
    const items = [...group.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
    return renderLabeledArrowDiagram(items, safeHtml => safeHtml);
  });
}
