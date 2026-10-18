import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {injectGuide, validateGuide} from '../lib/website-guides.mjs';

const root = process.cwd();
const flag = process.argv.indexOf('--artifact');
const target = flag === -1 ? root : path.resolve(process.argv[flag + 1] || '_site');
const data = JSON.parse(fs.readFileSync('content/site/website-guides.json', 'utf8'));
const ids = new Set();
let count = 0;
for (const guide of data.guides) {
  if (ids.has(guide.id)) throw Error('Duplicate website guide: ' + guide.id);
  ids.add(guide.id);
  if (!validateGuide(guide)) continue;
  for (const asset of [guide.poster, guide.captions].filter(Boolean)) {
    if (!/^\/assets\/website-guides\/[a-z0-9.-]+$/.test(asset)) throw Error('Invalid guide support asset');
    const source = path.join(root, asset.slice(1));
    if (!fs.existsSync(source)) throw Error('Missing guide support asset: ' + asset);
    if (target !== root) { const dest = path.join(target, asset.slice(1)); fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.copyFileSync(source, dest); }
  }
  for (const route of guide.pages) {
    if (route.startsWith('/') || route.includes('..') || !route.endsWith('.html')) throw Error('Invalid guide page');
    const file = path.join(target, route);
    const html = fs.readFileSync(file, 'utf8');
    let rendered = injectGuide(html, guide);
    for (const asset of ['css/website-guides.css', 'js/website-guides.js']) {
      const hash = createHash('sha256').update(fs.readFileSync(path.join(root, 'assets', asset))).digest('hex').slice(0, 12);
      rendered = rendered.replaceAll('/assets/' + asset + '"', '/assets/' + asset + '?v=' + hash + '"');
    }
    fs.writeFileSync(file, rendered);
    count += 1;
  }
}
console.log('Website guides: ' + count + ' checked media player(s) inserted. Drafts remain private.');
