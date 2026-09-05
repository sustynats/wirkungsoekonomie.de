// Shared, semantic explanation blocks. Text remains readable without JS or CSS.
export function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function ImpactProcess({label, steps, caption}) {
  return `<figure class="impact-process"><ol class="impact-process-steps" aria-label="${escapeHtml(label)}">${steps.map(step => `<li><span class="impact-process-symbol" aria-hidden="true">${escapeHtml(step.symbol)}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join('')}</ol><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}

export function ExampleCards(examples) {
  return `<div class="card-grid three">${examples.map(example => `<article class="card"><p class="card-kicker">${escapeHtml(example.label)}</p><h3 class="card-title">${escapeHtml(example.title)}</h3><p>${escapeHtml(example.text)}</p></article>`).join('')}</div>`;
}

export function ComparisonTable({caption, columns, rows}) {
  return `<div class="table-wrap" role="region" aria-label="${escapeHtml(caption)}" tabindex="0"><table class="data-table"><caption>${escapeHtml(caption)}</caption><thead><tr>${columns.map(column => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell,i) => i === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function FeedbackLoop({title, text, action}) {
  return `<aside class="feedback-loop"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p><p><strong>${escapeHtml(action)}</strong></p></aside>`;
}
