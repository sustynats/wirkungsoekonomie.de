import fs from 'node:fs';
import path from 'node:path';
import {applyReferenceLinks} from '../wirkungslexikon/reference-links.mjs';

const args=process.argv.slice(2), at=args.indexOf('--artifact');
const root=at<0 ? process.cwd() : path.resolve(args[at+1] || '_site');
const {blocks}=JSON.parse(fs.readFileSync('content/site/related-reading.json','utf8'));
const ids=new Set();
for (const block of blocks) {
  if (!/^[a-z0-9-]+$/.test(block.id) || ids.has(block.id) || !block.paths?.length || !block.title || !block.paragraphs?.length) throw Error('Invalid related reading block');
  ids.add(block.id);
  if (block.paths.some(file=>file.startsWith('/') || file.includes('..') || !file.endsWith('.html'))) throw Error('Invalid related reading path');
  if ((block.links || []).some(link=>!link.label || !/^\/(?!\/)[^\s"<>]*$/.test(link.href) || link.href.includes('..'))) throw Error('Invalid related reading link');
}
const missing=[];
let count=0;
for (const rel of new Set(blocks.flatMap(block=>block.paths))) {
  const file=path.join(root,rel);
  if (!fs.existsSync(file)) { if (at<0 && rel.startsWith('wirkungslexikon/')) {missing.push(rel);continue;} throw Error('Missing related reading host: '+rel); }
  const before=fs.readFileSync(file,'utf8'), result=applyReferenceLinks(before,rel,blocks);
  let restored=result.html;
  for (const edit of [...result.edits].reverse()) restored=restored.replace(edit.after,edit.before);
  if (restored!==before) throw Error('Unrelated content changed: '+rel);
  if (applyReferenceLinks(result.html,rel,blocks).html!==result.html) throw Error('Non-idempotent related reading: '+rel);
  if (result.html!==before) fs.writeFileSync(file,result.html);
  count++;
}
console.log('Related reading: '+count+' host pages; original content preserved.'+(missing.length ? ' Awaiting approved artifact: '+missing.join(', ') : ''));
