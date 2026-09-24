// Deterministic presentation of explicitly authored WÖK_VISUAL blocks.
// No YAML execution, inference, network, runtime chart library, or model calls.
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const shapes = {
  'system-loop': { arrays: ['nodes', 'counter_path'], strings: [], booleans: ['positive_feedback'] },
  'multi-input-path': { arrays: ['inputs', 'path', 'feedback'], strings: ['convergence'], booleans: [] },
  'dependency-network': { arrays: ['dependencies', 'protection_ring'], strings: ['center'], booleans: [] },
};
export function parseAuthoredVisual(block) {
  const match = /^<!-- WÖK_VISUAL\n([\s\S]+?)\n-->$/.exec(block);
  if (!match || block.length > 10000) throw Error('EDITORIAL_VISUAL_INVALID');
  const data = Object.create(null); let key;
  for (const line of match[1].split('\n')) {
    const item = /^  - (".*")$/.exec(line);
    if (item && key && Array.isArray(data[key])) { data[key].push(JSON.parse(item[1])); continue; }
    const field = /^([a-z_]+):(?: (".*"|true|false))?$/.exec(line);
    if (!field || ['__proto__', 'constructor', 'prototype'].includes(field[1]) || Object.hasOwn(data, field[1])) throw Error('EDITORIAL_VISUAL_INVALID');
    key = field[1]; data[key] = field[2] === undefined ? [] : JSON.parse(field[2]);
  }
  const shape = shapes[data.type];
  if (!shape || !/^[a-z][a-z0-9-]{1,80}$/.test(data.id || '')) throw Error('EDITORIAL_VISUAL_INVALID');
  const strings = ['id', 'type', 'title', 'subtitle', 'note', ...shape.strings];
  const allowed = [...strings, ...shape.arrays, ...shape.booleans];
  if (Object.keys(data).some(k => !allowed.includes(k))
    || strings.some(k => typeof data[k] !== 'string' || !data[k].trim() || data[k].length > 900)
    || shape.arrays.some(k => !Array.isArray(data[k]) || data[k].length < 2 || data[k].length > 12 || data[k].some(s => typeof s !== 'string' || !s.trim() || s.length > 300))
    || shape.booleans.some(k => typeof data[k] !== 'boolean')) throw Error('EDITORIAL_VISUAL_INVALID');
  return data;
}
export function renderAuthoredVisual(v, { label } = {}) {
  if (label !== undefined && (typeof label !== 'string' || !label.trim() || label.length > 900)) throw Error('EDITORIAL_VISUAL_LABEL_INVALID');
  const chips = values => `<ul class="news-authored-visual__chips">${values.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
  const chain = values => `<ol class="news-authored-visual__chain">${values.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
  let body;
  if (v.type === 'system-loop') {
    body = `<div class="news-authored-visual__loop">${chain(v.nodes)}<p class="news-authored-visual__return"><span aria-hidden="true">↶</span> Rückkopplung zum nächsten Auslöser</p></div><div class="news-authored-visual__counter"><h4>Gegenpfad</h4>${chain(v.counter_path)}</div>`;
  } else if (v.type === 'multi-input-path') {
    body = `<div><h4>Mehrere Eingänge</h4>${chips(v.inputs)}</div><p class="news-authored-visual__connector" aria-hidden="true">↓</p>${chain([v.convergence, ...v.path])}<div class="news-authored-visual__feedback"><h4>Mögliche Rückkopplung</h4>${chips(v.feedback)}<p class="news-authored-visual__return"><span aria-hidden="true">↶</span> Rückbezug auf die Gruppendynamik</p></div>`;
  } else {
    body = `<div class="news-authored-visual__ring"><h4>Schutzring</h4><div class="news-authored-visual__center">${esc(v.center)}</div><p class="news-authored-visual__connector" aria-hidden="true">↓</p><h4>Abhängige Bereiche</h4>${chips(v.dependencies)}<div class="news-authored-visual__counter"><h4>Schutz- und Rückfallebenen</h4>${chips(v.protection_ring)}</div></div>`;
  }
  const notice = label ? `<p class="news-method-note" id="visual-${esc(v.id)}-label">${esc(label)}</p>` : '';
  return `<figure class="news-systemic-visual news-authored-visual news-authored-visual--${esc(v.type)}" id="visual-${esc(v.id)}" data-editorial-explanatory-visual data-authored-visual="${esc(v.type)}" aria-labelledby="visual-${esc(v.id)}-title" aria-describedby="visual-${esc(v.id)}-note${label ? ` visual-${esc(v.id)}-label` : ''}"><figcaption id="visual-${esc(v.id)}-title">${esc(v.title)}</figcaption><p class="news-method-note">${esc(v.subtitle)}</p>${body}<p class="news-method-note" id="visual-${esc(v.id)}-note">${esc(v.note)}</p>${notice}</figure>`;
}
