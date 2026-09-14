// Programme plots can contain fictional crimes or political decisions. Keep
// this format check lightweight so the paid API boundary uses the same rule.
export function isProgrammeListing(source = {}) {
  const title = String(source.title || '').normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').toLowerCase().trim();
  return /^(?:vorschau\s*:\s*)?(?:tv|fernseh|streaming)[\s-]tipps?(?:\s*:|\s+(?:am|fur|zum|der|heute|morgen|diese[snr]?)\b|$)/.test(title);
}
