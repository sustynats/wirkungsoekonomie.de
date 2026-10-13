import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {publicHtmlFiles} from '../lib/public-html.mjs';

const SITE = 'https://wirkungsoekonomie.de';

function routeFor(relative) {
  const normalized = relative.replaceAll('\\', '/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -10)}`;
  return `/${normalized}`;
}

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/\b([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
    result.set(match[1].toLowerCase(), match[3]);
  }
  return result;
}

function internalUrl(value, baseRoute) {
  const decoded = value.replaceAll('&amp;', '&');
  let url;
  try {
    url = new URL(decoded, `${SITE}${baseRoute}`);
  } catch {
    return null;
  }
  if (!['wirkungsoekonomie.de', 'www.wirkungsoekonomie.de'].includes(url.hostname)) return null;
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  return url;
}

function redirectTarget(html, route, resolveRoute) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (String(attrs.get('http-equiv') || '').toLowerCase() !== 'refresh') continue;
    const content = attrs.get('content') || '';
    const target = content.match(/(?:^|;)\s*url\s*=\s*(.+?)\s*$/i)?.[1]?.replace(/^["']|["']$/g, '');
    if (!target) return null;
    const url = internalUrl(target, route);
    return url ? {route: resolveRoute(url.pathname), search: url.search, hash: url.hash} : null;
  }
  return null;
}

export function inspectInternalRedirectLinks(root) {
  const pages = new Map();
  const aliases = new Map();
  for (const file of publicHtmlFiles(root)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const route = routeFor(relative);
    pages.set(route, {file, relative, route, html: fs.readFileSync(file, 'utf8')});
    aliases.set(`/${relative}`, route);
    if (relative.endsWith('/index.html')) aliases.set(`/${relative.slice(0, -11)}`, route);
  }
  const resolveRoute = pathname => pages.has(pathname)
    ? pathname
    : aliases.get(pathname)
      || aliases.get(`${pathname}.html`)
      || aliases.get(`${pathname.replace(/\/$/, '')}/index.html`)
      || null;
  const redirects = new Map();
  for (const page of pages.values()) {
    const target = redirectTarget(page.html, page.route, resolveRoute);
    if (target?.route) redirects.set(page.route, target);
  }
  const finalTarget = route => {
    const seen = new Set();
    let current = route;
    let search = '';
    let hash = '';
    while (redirects.has(current) && !seen.has(current)) {
      seen.add(current);
      const next = redirects.get(current);
      current = next.route;
      search = next.search || search;
      hash = next.hash || hash;
    }
    return seen.has(current) ? null : {route: current, search, hash};
  };
  const occurrences = [];
  for (const page of pages.values()) {
    if (redirects.has(page.route)) continue;
    for (const tag of page.html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([\s\S]*?)\1[^>]*>/gi)) {
      const url = internalUrl(tag[2], page.route);
      if (!url) continue;
      const linkedRoute = resolveRoute(url.pathname);
      if (!linkedRoute || !redirects.has(linkedRoute)) continue;
      const target = finalTarget(linkedRoute);
      if (!target || target.route === linkedRoute) continue;
      occurrences.push({
        file: page.relative,
        from: page.route,
        href: tag[2],
        redirect: linkedRoute,
        target: `${target.route}${url.search || target.search}${url.hash || target.hash}`,
      });
    }
  }
  return {pages, redirects, occurrences};
}

export function normalizeInternalRedirectLinks(root, {check = false, prefixes = []} = {}) {
  const audit = inspectInternalRedirectLinks(root);
  const selected = audit.occurrences.filter(item => !prefixes.length || prefixes.some(prefix => item.file.startsWith(prefix)));
  if (check) return {changedFiles: 0, changedLinks: 0, occurrences: selected};
  const byFile = new Map();
  for (const item of selected) {
    if (!byFile.has(item.file)) byFile.set(item.file, []);
    byFile.get(item.file).push(item);
  }
  let changedLinks = 0;
  for (const [relative, items] of byFile) {
    const page = audit.pages.get(routeFor(relative));
    const replacements = new Map(items.map(item => [item.href, item.target]));
    const after = page.html.replace(/(<a\b[^>]*\bhref\s*=\s*)(["'])([\s\S]*?)(\2)([^>]*>)/gi,
      (all, before, quote, href, closing, tail) => {
        const target = replacements.get(href);
        if (!target) return all;
        changedLinks += 1;
        return `${before}${quote}${target}${closing}${tail}`;
      });
    if (after !== page.html) fs.writeFileSync(page.file, after);
  }
  return {changedFiles: byFile.size, changedLinks, occurrences: selected};
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const root = process.argv.includes('--artifact') ? path.join(process.cwd(), '_site') : process.cwd();
  const check = process.argv.includes('--check');
  const prefixes = process.argv.filter(arg => arg.startsWith('--prefix=')).map(arg => arg.slice(9));
  const result = normalizeInternalRedirectLinks(root, {check, prefixes});
  if (check && result.occurrences.length) {
    console.error(`Internal redirect-link check failed: ${result.occurrences.length} link(s) still target Meta-Refresh pages.`);
    for (const item of result.occurrences.slice(0, 100)) {
      console.error(`- ${item.file}: ${item.href} -> ${item.target}`);
    }
    if (result.occurrences.length > 100) console.error(`... ${result.occurrences.length - 100} more`);
    process.exit(1);
  }
  if (check) console.log('Internal redirect-link check passed: 0 links to Meta-Refresh pages.');
  else console.log(`normalized internal redirect links: ${result.changedLinks} link(s) in ${result.changedFiles} file(s)`);
}
