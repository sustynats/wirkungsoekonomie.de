import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {escape} from './editorial-markdown.mjs';

const config = JSON.parse(fs.readFileSync(new URL('../../data/news/show-visual-identities.json', import.meta.url)));
const normalize = value => String(value || '').normalize('NFKC').trim().toLocaleLowerCase('de');
export function showIdentity(media, {use = 'website', now = Date.now(), shows = config.shows} = {}) {
  const name = normalize(media?.show);
  const show = shows.find(s => [s.show_name, ...(s.aliases || [])].some(a => normalize(a) === name));
  if (!show) return null;
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
export function renderShowIdentity(media, options) {
  if (!media?.show) return '';
  const show = showIdentity(media, options);
  const accent = /^#[a-f0-9]{6}$/i.test(show?.stable_accent || '') ? show.stable_accent : '#32634e';
  return `<figure class="news-show-identity" style="--show-accent:${accent}">${show?.usable_asset
    ? `<img src="${escape(show.usable_asset)}" alt="Offizielles Logo: ${escape(show.show_name)}" width="800" height="800" loading="lazy" decoding="async"><figcaption>${escape(show.credit)}</figcaption>`
    : `<div class="news-show-identity__fallback"><span aria-hidden="true">◌</span><strong>${escape(media.show)}</strong></div>`}</figure>`;
}
