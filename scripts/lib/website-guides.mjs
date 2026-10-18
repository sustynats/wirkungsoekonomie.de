import {escapeHtml as e} from './explainer-components.mjs';

const checks = ['content', 'audio', 'cast', 'duration', 'transcript'];
export function validateGuide(guide) {
  if (!guide.id || !/^[a-z0-9-]+$/.test(guide.id)) throw Error('Invalid guide id');
  if (guide.status !== 'ready') return false;
  if (guide.anchor && !/^[a-z][a-z0-9-]*$/.test(guide.anchor)) throw Error('Invalid guide anchor');
  if (guide.legacyMedia && (guide.legacyMedia.anchor !== guide.anchor || !guide.legacyMedia.src?.startsWith('https://github.com/sustynats/wirkungsoekonomie.de/releases/download/'))) throw Error('Invalid legacy media replacement');
  for (const check of checks) if (guide.review?.[check] !== 'passed') throw Error(guide.id + ': missing ' + check + ' review');
  if (!(guide.seconds >= 60 && guide.seconds <= 90) && guide.format === 'overview') throw Error(guide.id + ': overview must last 60-90 seconds');
  if (!(Number.isFinite(guide.seconds) && guide.seconds > 0)) throw Error('Missing measured duration');
  if (!/^https:\/\/github\.com\/sustynats\/wirkungsoekonomie\.de\/releases\/download\/[^/]+\/[^/?#]+\.(mp3|mp4|m4a)$/.test(guide.src)) throw Error('Guide media must use a pinned GitHub release');
  if (guide.kind === 'video' && (!/^\/assets\/website-guides\/[a-z0-9-]+\.(png|svg|webp)$/.test(guide.poster) || !/^\/assets\/website-guides\/[a-z0-9-]+\.vtt$/.test(guide.captions))) throw Error('Video requires a local poster and captions');
  if (!guide.transcript?.length || !guide.sources?.length) throw Error('Missing transcript or sources');
  for (const turn of guide.transcript) if ((turn.speaker && !['Mara', 'Jonas'].includes(turn.speaker)) || !turn.text?.trim()) throw Error('Invalid speaker or empty turn');
  for (const source of guide.sources) if (!/^https:\/\/wirkungsoekonomie\.de\//.test(source.url)) throw Error('Use published primary sources');
  for (const link of guide.links || []) if (!/^\/(?!\/)[a-z0-9/._#-]*$/i.test(link.href)) throw Error('Invalid local next link');
  return true;
}

export function renderGuide(guide) {
  if (!validateGuide(guide)) return '';
  return guideMarkup(guide);
}

// Internal review only. The public build exclusively calls renderGuide.
export function renderGuidePreview(guide) {
  return '<p role="status" class="website-guide-review-note">Entwurf: Hörprüfung und Veröffentlichung stehen noch aus.</p>' + guideMarkup(guide);
}

function guideMarkup(guide) {
  const duration = Math.round(guide.seconds);
  const time = Math.floor(duration / 60) + ':' + String(duration % 60).padStart(2, '0');
  const type = guide.kind === 'video' ? 'video' : 'audio';
  const mime = type === 'video' ? 'video/mp4' : guide.src.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg';
  const media = '<' + type + ' controls preload="none"' + (type === 'video' ? ' playsinline poster="' + e(guide.poster) + '"' : '') + ' aria-label="' + e(guide.title) + '"><source src="' + e(guide.src) + '" type="' + mime + '">' + (guide.captions ? '<track kind="captions" src="' + e(guide.captions) + '" srclang="de" label="Deutsch">' : '') + '<a href="' + e(guide.src) + '">Aufnahme öffnen</a></' + type + '>';
  return '<section class="website-guide"' + (guide.anchor ? ' id="' + e(guide.anchor) + '"' : '') + ' data-website-guide="' + e(guide.id) + '" aria-labelledby="guide-' + e(guide.id) + '"><div class="website-guide-intro"><p class="website-guide-meta">Kurz erklärt · ' + time + ' · Mara &amp; Jonas</p><h2 id="guide-' + e(guide.id) + '">' + e(guide.title) + '</h2><p>' + e(guide.description) + '</p></div>' + media + '<details><summary>Mitlesen</summary><div class="website-guide-transcript">' + guide.transcript.map(turn => '<p>' + (turn.speaker ? '<strong>' + e(turn.speaker) + ':</strong> ' : '') + e(turn.text) + '</p>').join('') + '</div></details>' + (guide.links?.length ? '<nav class="website-guide-next" aria-label="Nach der Erklärung">' + guide.links.map(link => '<a href="' + e(link.href) + '">' + e(link.label) + ' <span aria-hidden="true">→</span></a>').join('') + '</nav>' : '') + '<details class="website-guide-production"><summary>Quellen &amp; Produktion</summary><ul>' + guide.sources.map(source => '<li><a href="' + e(source.url) + '">' + e(source.title) + '</a></li>').join('') + '</ul><p>Grundlage: veröffentlichte Texte von Natalie Weber. Mara und Jonas sind die synthetischen Stimmen dieses Website-Formats. Mara: weibliche Stimme; Jonas: männliche Stimme. Eigenständiges Format neben dem persönlichen Podcast.</p><p>Fassung: ' + e(guide.date) + '.</p></details></section>';
}

export function injectGuide(html, guide) {
  const start = '<!-- website-guide:' + guide.id + ':start -->';
  const end = '<!-- website-guide:' + guide.id + ':end -->';
  const from = html.indexOf(start), to = html.indexOf(end);
  if (from !== -1 && to === -1 || from === -1 && to !== -1) throw Error('Incomplete guide block');
  if (from !== -1) html = html.slice(0, from > 0 && html[from - 1] === '\n' ? from - 1 : from) + html.slice(to + end.length);
  const block = renderGuide(guide);
  if (!block) return html;
  if (guide.legacyMedia) {
    const old = guide.legacyMedia;
    // Replace only the named former player. The versioned explainer/PDF generator stays intact.
    const details = new RegExp('<details\\b[^>]*\\bid="' + old.anchor + '"[^>]*>[\\s\\S]*?</details>', 'g');
    html = html.replace(details, previous => {
      if (!previous.includes('src="' + old.src + '"')) throw Error('Unexpected media at legacy anchor: ' + old.anchor);
      return '<p><a class="text-link" href="#' + e(guide.anchor) + '">' + e(old.label) + '</a></p>';
    });
  }
  const main = /<main\b[^>]*>/.exec(html);
  if (!main) throw Error('Guide target has no main element');
  const mainEnd = html.indexOf('</main>', main.index);
  if (mainEnd === -1) throw Error('Guide target has no closing main element');
  const tokens = /<\/?section\b[^>]*>/g;
  tokens.lastIndex = main.index + main[0].length;
  let depth = 0, position = null, token;
  while ((token = tokens.exec(html)) && token.index < mainEnd) {
    if (token[0].startsWith('</')) { depth -= 1; if (depth === 0) { position = tokens.lastIndex; break; } }
    else depth += 1;
  }
  if (position === null) {
    // Prose entry pages have a lead paragraph followed by headings rather than a hero section.
    const heading = /<h2\b/.exec(html.slice(main.index + main[0].length, mainEnd));
    if (heading) position = main.index + main[0].length + heading.index;
  }
  if (position === null) throw Error('Guide target requires an opening section or a prose lead');
  html = html.slice(0, position) + '\n' + start + block + end + html.slice(position);
  if (!html.includes('/assets/css/website-guides.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/website-guides.css">\n</head>');
  if (!html.includes('/assets/js/website-guides.js')) html = html.replace('</body>', '<script defer src="/assets/js/website-guides.js"></script>\n</body>');
  return html;
}
