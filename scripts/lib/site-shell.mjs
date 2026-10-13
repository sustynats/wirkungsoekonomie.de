import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loadNavigation(root=ROOT){return JSON.parse(fs.readFileSync(path.join(root,'assets/data/navigation.json'),'utf8'));}
export function pageBase(file){const dir=path.posix.dirname(file.replaceAll('\\','/'));return dir==='.'?'':'../'.repeat(dir.split('/').length);}
export function pageLocale(file){return file.replaceAll('\\','/').startsWith('en/')?'en':'de';}
export function renderSiteHeaderForSource(source){
  const asset=source.match(/\bsrc=["']([^"']*)assets\/img\/brand\/signet\.svg/)
    || source.match(/\bhref=["']([^"']*)assets\/css\/style\.css/);
  if(!asset)throw new Error('Source shell has no identifiable public asset prefix');
  const locale=/<html\b[^>]*\blang=["']en(?:-[^"']*)?["']/.test(source)?'en':'de';
  if(locale==='en'){
    const existing=source.match(/<header\b[^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'][^>]*>[\s\S]*?<\/header>/);
    if(!existing)throw new Error('Deferred locale has no existing header');
    return existing[0];
  }
  return renderSiteHeader(asset[1],locale);
}
const token=item=>(item.match||[item.href]).join('|');
const utilityClass=item=>item.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function renderSiteHeader(base='',locale='de',navigation=loadNavigation()){
  if(locale!=='de')throw new Error('This migration covers only the German publication');
  const language=navigation.locales?.[locale]||{};
  const items=language.header||navigation.header||[];
  const more=language.more||navigation.more||[];
  const english=locale==='en';
  const labels=language.labels||{};
  const utilityLabel=labels.utility||(english?'Quick links':'Schnellzugriffe');
  const utility=more.map(item=>{
    const primary=item.primary||item.label==='Mein Wirkungsraum'||item.label==='My Impact Space';
    return `        <a class="site-utility-link site-utility-link--${esc(item.class||utilityClass(item))}" href="${esc(base+item.href)}" data-nav-match="${esc(token(item))}" data-utility-label="${esc(item.utilityLabel||item.label)}"${primary?' data-utility-primary="true"':''}>${esc(item.label)}</a>`;
  }).join('\n');
  const main=items.map(item=>`        <a href="${esc(base+item.href)}" data-nav-match="${esc(token(item))}">${esc(item.label)}</a>`).join('\n');
  return `<header class="site-header" data-search-exclude>
      <a class="brand" href="${esc(base+(english?'en/':'index.html'))}" aria-label="${esc(labels.brand||(english?'Wirkungsökonomie English homepage':'Wirkungsökonomie Startseite'))}">
        <span class="brand-mark"><img src="${esc(base)}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="${esc(utilityLabel)}" data-search-exclude>
${utility}
      </nav>
      <button class="nav-toggle" type="button" aria-label="${esc(labels.open||(english?'Open menu':'Menü öffnen'))}" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">${esc(labels.menu||(english?'Menu':'Menü'))}</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="${esc(labels.main||(english?'Main navigation':'Hauptnavigation'))}" data-search-exclude>
${main}
        <div class="site-nav-utility" aria-label="${esc(utilityLabel)}" aria-hidden="true" inert>
${utility}
        </div>
      </nav>
      <script src="${esc(base)}assets/js/site-navigation.js?v=20261013-a11y" defer></script>
    </header>`;
}

// The global footer has the same navigation on every public page. Newsletter
// interaction is a separate component, so private polls keep this exact footer
// without acquiring a form or a cross-page runtime.
export function renderSiteFooter(base='',navigation=loadNavigation()){
  const seen=new Set();
  const unique=items=>(items||[]).filter(item=>{
    const key=item.href.replace(/index\.html(?=[?#]|$)/,'');
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
  const link=item=>`<a href="${esc(base+item.href)}" data-nav-match="${esc(token(item))}">${esc(item.label)}</a>`;
  const legal=unique(navigation.footerLegal).map(link).join('\n');
  const groups=(navigation.footerGroups||[]).map(group=>{
    const items=unique(group.items);if(!items.length)return '';
    return `<div class="footer-nav-group"><h3>${esc(group.title)}</h3><div class="footer-nav-links">${items.map(link).join('\n')}</div></div>`;
  }).filter(Boolean).join('\n');
  return fs.readFileSync(path.join(ROOT,'templates/footer-shell.html'),'utf8')
    .replaceAll('{{BASE}}',base).replace('{{FOOTER_NAV}}',groups).replace('{{FOOTER_LEGAL_NAV}}',legal).trimEnd();
}

export function renderFooterNewsletter(base=''){
  return fs.readFileSync(path.join(ROOT,'templates/footer-newsletter.html'),'utf8').replaceAll('{{BASE}}',base).trimEnd();
}

export function renderFormerFooterLinks(file,base=''){
  const definitions=JSON.parse(fs.readFileSync(path.join(ROOT,'content/site/navigation-footer-migrations.json'),'utf8'));
  const migration=definitions.migrations.find(item=>item.sources.some(source=>source.path===file));
  if(!migration)return '';
  return `<nav class="publication-links" data-footer-links-migration="${esc(migration.id)}" aria-label="${esc(migration.label)}" data-search-exclude><h2>${esc(migration.label)}</h2><div>${migration.links.map(item=>`<a href="${esc(base+item.href)}">${esc(item.label)}</a>`).join(' ')}</div></nav>`;
}
