import { cpSync,mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const source=path.dirname(fileURLToPath(import.meta.url));
const destination=path.resolve(source,'../dist/polls');
mkdirSync(destination,{recursive:true});
cpSync(source,destination,{recursive:true});
console.log('Versioned poll runtime copied to dist/polls.');
