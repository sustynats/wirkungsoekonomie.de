import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {escape} from './editorial-markdown.mjs';
import {assetSize} from './asset-size.mjs';
import {episodeDateLabel} from './feed-order.mjs';

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

const assetSizes = new Map();
export function showAssetSize(asset) {
  if (assetSizes.has(asset)) return assetSizes.get(asset);
  let size = null;
  try { size = assetSize(new URL('../..' + asset, import.meta.url)); } catch { size = null; }
  assetSizes.set(asset, size);
  return size;
}

export function renderShowIdentity(media, options = {}) {
  if (!media?.show) return '';
  const show = showIdentity(media, options);
  // Eigene Reihenkennung, kein nachgebautes Fremdlogo. Auch unbekannte Reihen
  // behalten denselben Akzent; ein neuer Name braucht keinen Asset-/KI-Auftrag.
  const palette = ['#32634e', '#834367', '#305b81', '#856024', '#a14f36'];
  const fallbackAccent = palette[parseInt(createHash('sha256').update(normalize(media.show)).digest('hex').slice(0, 4), 16) % palette.length];
  const accent = /^#[a-f0-9]{6}$/i.test(show?.stable_accent || '') ? show.stable_accent : fallbackAccent;
  // Die Massangaben kommen aus der Datei: pauschale 800x800 liessen den Browser
  // fuer jedes Logo ein Quadrat reservieren, obwohl vier von sechs im Verhaeltnis
  // 16:9 oder 1,63:1 liegen - beim Laden ruckte die Karte zurecht. Und die
  // Freigabe erlaubt ausschliesslich proportionale Skalierung, kein Beschnitt:
  // ein falsches Verhaeltnis im Markup ist deshalb nicht nur unruhig.
  const size = show?.usable_asset ? showAssetSize(show.usable_asset) : null;
  const dimensions = size ? ` width="${size.width}" height="${size.height}"` : '';
  if (show?.usable_asset) return `<figure class="news-show-identity" style="--show-accent:${accent}"><img src="${escape(show.usable_asset)}" alt="Offizielles Logo: ${escape(show.show_name)}"${dimensions} loading="lazy" decoding="async"><figcaption>${escape(show.credit)}</figcaption></figure>`;
  const kind = options.kind;
  const label = kind === 'watched' ? 'Nachgesehen' : kind === 'listened' ? 'Nachgehört' : 'Sendungsbesprechung';
  const date = episodeDateLabel({subtype:kind, source_media:media});
  const icon = kind === 'listened'
    ? '<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 13H3v7h4v-7Zm16 0h1v7h-4v-7Z"/>'
    : '<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M8 22h8M12 18v4"/>';
  return `<figure class="news-show-identity news-show-identity--text" style="--show-accent:${accent}" aria-label="${escape(label)}: ${escape(show?.show_name || media.show)}"><div class="news-show-identity__fallback"><div class="news-show-identity__kicker"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icon}</svg><span>${label}</span></div><strong class="news-show-identity__name">${escape(show?.show_name || media.show)}</strong>${media.episode_title ? `<p class="news-show-identity__episode">${escape(media.episode_title)}</p>` : ''}${date ? `<p class="news-show-identity__date">${escape(date)}</p>` : ''}<p class="news-show-identity__signature">WÖk · Einordnung von Natalie Weber</p></div></figure>`;
}
