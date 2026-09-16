import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {escape} from './editorial-markdown.mjs';

const config = JSON.parse(fs.readFileSync(new URL('../../data/news/show-visual-identities.json', import.meta.url)));
// Ein freigegebenes Logo darf nicht an einer Schreibweise scheitern. Die
// Freigabe lautet auf „Lanz + Precht", die Ausgabe vom 16.09. schrieb
// „Lanz & Precht" - gleiche Sendung, gleiches Recht, und trotzdem stand die
// Platzhalterkachel in der App. Verglichen wird deshalb eine kanonische Form:
// Verbindungszeichen und Bindewörter fallen weg, Interpunktion wird zu Leerraum.
// Die Gleichheit bleibt strikt (kein Teilstringvergleich), damit kein Logo an
// die falsche Sendung gerät - ein Rechtefehler waere schwerer als ein Platzhalter.
const CONNECTORS = /\b(?:und|mit|der|die|das)\b/g;
export const canonicalShowName = value => String(value || '').normalize('NFKC').toLocaleLowerCase('de')
  .replace(/[&+]/g, ' und ').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(CONNECTORS, ' ').replace(/\s+/g, ' ').trim();
const normalize = canonicalShowName;

// Zwei Sendungen dürfen nach der Angleichung nicht dieselbe Form tragen; sonst
// entscheidet die Reihenfolge der Liste, welches Logo erscheint.
export function showNameCollisions(shows = config.shows) {
  const seen = new Map(), collisions = [];
  for (const show of shows) {
    for (const name of [show.show_name, ...(show.aliases || [])]) {
      const key = normalize(name);
      if (!key) continue;
      if (seen.has(key) && seen.get(key) !== show.id) collisions.push({ key, shows: [seen.get(key), show.id] });
      seen.set(key, show.id);
    }
  }
  return collisions;
}
export function showIdentity(media, {use = 'website', now = Date.now(), shows = config.shows} = {}) {
  const name = normalize(media?.show);
  if (!name) return null;
  const matches = shows.filter(s => [s.show_name, ...(s.aliases || [])].some(a => normalize(a) === name));
  // Bei einer mehrdeutigen Schreibweise lieber die Platzhalterkachel als das
  // Logo der falschen Sendung.
  if (matches.length !== 1) return null;
  const show = matches[0];
  let valid = ['CLEARED','LICENSED','CC_LICENSED','PERMISSION_GRANTED'].includes(show.rights_status)
    && show[`allow_${use}`] === true && show.allow_archive === true
    && (!show.expires_at || Number.isFinite(Date.parse(show.expires_at)) && Date.parse(show.expires_at) > now)
    && /^\/assets\/img\/shows\/[a-z0-9-]+\.(jpg|png|webp|svg)$/.test(show.asset || '')
    && show.credit && show.rights_checked_at && show.source_url;
  if (valid) {
    try {
      const bytes=fs.readFileSync(new URL('../..'+show.asset,import.meta.url));
      valid=createHash('sha256').update(bytes).digest('hex')===show.asset_sha256;
    } catch { valid=false; }
  }
  return {...show, usable_asset: valid ? show.asset : null};
}
// Die amtliche Schreibweise einer bekannten Sendung, sonst null.
export function officialShowName(value, { shows = config.shows } = {}) {
  const name = normalize(value);
  if (!name) return null;
  const matches = shows.filter(s => [s.show_name, ...(s.aliases || [])].some(a => normalize(a) === name));
  return matches.length === 1 ? matches[0].show_name : null;
}

export function renderShowIdentity(media, options) {
  if (!media?.show) return '';
  const show = showIdentity(media, options);
  const accent = /^#[a-f0-9]{6}$/i.test(show?.stable_accent || '') ? show.stable_accent : '#32634e';
  return `<figure class="news-show-identity" style="--show-accent:${accent}">${show?.usable_asset
    ? `<img src="${escape(show.usable_asset)}" alt="Offizielles Logo: ${escape(show.show_name)}" width="800" height="800" loading="lazy" decoding="async"><figcaption>${escape(show.credit)}</figcaption>`
    : `<div class="news-show-identity__fallback"><span aria-hidden="true">◌</span><strong>${escape(media.show)}</strong></div>`}</figure>`;
}
