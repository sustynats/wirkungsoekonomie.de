import fs from 'node:fs';

const homepageFile = 'index.html';
const sourceFile = 'verstehen/index.html';
const marker = /<!-- two-shirts-entry:start -->[\s\S]*?<!-- two-shirts-entry:end -->/;
const homepage = fs.readFileSync(homepageFile, 'utf8');
const source = fs.readFileSync(sourceFile, 'utf8');
const entry = source.match(marker)?.[0];
if (!entry) throw new Error('Canonical T-shirt entry is missing from verstehen/index.html');
if (marker.test(homepage)) {
  console.log('Homepage T-shirt entry already present.');
  process.exit(0);
}
const updated = homepage.replace(
  /(<section class="hero home-journey-hero"[\s\S]*?<\/section>)/,
  `$1\n${entry}`,
);
if (updated === homepage) throw new Error('Homepage hero not found while restoring T-shirt entry');
fs.writeFileSync(homepageFile, updated);
console.log('Restored canonical T-shirt entry directly below the homepage hero.');
