import {renderSiteHeader} from './site-shell.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {escapeHtml as esc} from './explainer-components.mjs';

export function writeContentPage({file, title, description, section, type, body}) {
  const base = '../'.repeat(path.dirname(file).split('/').filter(part => part !== '.').length);
  const nav = JSON.parse(fs.readFileSync('assets/data/navigation.json', 'utf8'));
  const link = item => `<a href="${base}${esc(item.href)}" data-nav-match="${esc((item.match || [item.href]).join('|'))}">${esc(item.label)}</a>`;
  const header = renderSiteHeader(base);
  const footer = fs.readFileSync('templates/footer.html', 'utf8').replaceAll('{{BASE}}', base).replaceAll('{{FOOTER_NAV}}', nav.footerGroups.map(group => `<div class="footer-nav-group"><h3>${esc(group.title)}</h3><div class="footer-nav-links">${group.items.map(link).join('\n')}</div></div>`).join('\n')).replaceAll('{{FOOTER_LEGAL_NAV}}', (nav.footerLegal || []).map(link).join('\n'));
  const values = {TITLE:esc(title), DESCRIPTION:esc(description), SECTION:esc(section), TYPE:esc(type), CANONICAL:`https://wirkungsoekonomie.de/${file.replace(/index\.html$/, '')}`, BASE:base, HEADER:header, FOOTER:footer, BODY:body};
  const template = fs.readFileSync('templates/content-page.html', 'utf8');
  const html = template.replace(/\{\{(\w+)\}\}/g, (_,key) => values[key] ?? (() => {throw new Error(`Unknown template field ${key}`);})());
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, html);
}
