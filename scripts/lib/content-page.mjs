import {renderSiteHeader,renderSiteFooter,renderFooterNewsletter} from './site-shell.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {escapeHtml as esc} from './explainer-components.mjs';

export function writeContentPage({file, title, description, section, type, body, styles = [], modules = [], aliases = []}) {
  const base = '../'.repeat(path.dirname(file).split('/').filter(part => part !== '.').length);
  const header = renderSiteHeader(base);
  const footer = renderSiteFooter(base)+'\n'+renderFooterNewsletter(base);
  const values = {TITLE:esc(title), DESCRIPTION:esc(description), SECTION:esc(section), TYPE:esc(type), CANONICAL:`https://wirkungsoekonomie.de/${file.replace(/index\.html$/, '')}`, BASE:base, HEADER:header, FOOTER:footer, BODY:body};
  const template = fs.readFileSync('templates/content-page.html', 'utf8');
  let html = template.replace(/\{\{(\w+)\}\}/g, (_,key) => values[key] ?? (() => {throw new Error(`Unknown template field ${key}`);})());
  if (aliases.length) html = html.replace('</head>', `<meta name="search_aliases" content="${esc(aliases.join('|'))}">\n</head>`);
  const assetUrl = file => `${base}${esc(file)}?v=${createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12)}`;
  if (styles.length) html = html.replace('</head>', styles.map(file => `<link rel="stylesheet" href="${assetUrl(file)}">`).join('\n')+'\n</head>');
  if (modules.length) html = html.replace('</body>', modules.map(file => `<script type="module" src="${assetUrl(file)}"></script>`).join('\n')+'\n</body>');
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, html);
}
