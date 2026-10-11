import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {normalizePublicationTypography, isFrozenPublicationSource} from '../lib/public-typography.mjs';

const args=process.argv.slice(2);
const root=path.resolve(args.find(a=>!a.startsWith('--')) || '.');
const check=args.includes('--check');
const source=args.includes('--tracked');
const excludedSourcePrefixes=args.filter(a=>a.startsWith('--exclude-source-prefix=')).map(a=>a.slice('--exclude-source-prefix='.length));
// This scopes a source-writing projection job. It is deliberately unavailable
// to artifact normalization or the release-blocking typography check.
if(excludedSourcePrefixes.length && (!source || check))throw new Error('Source exclusions are allowed only for a tracked source mutation, never for artifact/check mode');
if(excludedSourcePrefixes.some(p=>!p.endsWith('/') || p.startsWith('/') || p.includes('..')))throw new Error('Invalid source projection prefix');
const extensions=new Set(['.html','.inc','.md','.mdx','.json','.jsonl','.yaml','.yml','.csv','.tsv','.txt','.svg','.xml','.atom','.bib','.srt','.vtt','.js','.mjs','.css','.py']);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=source?execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).split('\0').filter(Boolean).map(f=>path.join(root,f)):walk(root);
let changed=0;
for(const file of files){
  if(!extensions.has(path.extname(file)) || !fs.existsSync(file))continue;
  if(source && excludedSourcePrefixes.some(prefix=>path.relative(root,file).replaceAll('\\','/').startsWith(prefix)))continue;
  // Frozen source/audit records retain their signed bytes. Formatting belongs
  // to their public projection; the artifact pass below has no such exemption.
  if(source && isFrozenPublicationSource(path.relative(root,file)))continue;
  if(source && ['.mjs','.js','.py'].includes(path.extname(file)) && !path.relative(root,file).startsWith('assets/js/'))continue;
  // Test fixtures and the normalizer encode the very characters being tested.
  if(source && /(?:^|\/)(?:tests|test)\//.test(path.relative(root,file)))continue;
  const input=fs.readFileSync(file,'utf8');
  const output=normalizePublicationTypography(input);
  if(input!==output){changed++;if(!check)fs.writeFileSync(file,output);}
}
console.log(`${check?'Checked':'Normalized'} publication typography: ${changed} files ${check?'with nonstandard dashes':'updated'}.`);
if(check && changed)process.exitCode=1;
