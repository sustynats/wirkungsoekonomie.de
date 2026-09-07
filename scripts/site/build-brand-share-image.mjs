// Explicit asset build, not a per-page image-generation service.
// Keep the established vector signet and embedded local CI fonts unchanged.
import fs from 'node:fs';
import path from 'node:path';
import {rasterize} from '../news/title-image/rasterize.mjs';

const root=path.resolve(import.meta.dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file));
const font=(name,file)=>`@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${read(`assets/fonts/${file}`).toString('base64')}) format('woff2')}`;
const signet=read('assets/img/brand/signet.svg').toString().replace('<svg ', '<svg x="88" y="154" width="300" height="300" ');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="share-title share-description">
<title id="share-title">Wirkungsökonomie</title>
<desc id="share-description">Das Logo der Wirkungsökonomie. Mensch, Planet und Demokratie.</desc>
<defs><style>${font('WOek Serif','source-serif-4-600.woff2')}${font('WOek Sans','source-sans-3-400.woff2')}</style></defs>
<rect width="1200" height="630" fill="#f5f1e8"/>
<path d="M0 0H1200" stroke="#c7a14b" stroke-width="12"/>
${signet}
<text x="444" y="290" fill="#0b1830" font-family="WOek Serif" font-size="58">Wirkungsökonomie</text>
<path d="M446 323H520" stroke="#c7a14b" stroke-width="3"/>
<text x="444" y="372" fill="#2f705b" font-family="WOek Sans" font-size="29" letter-spacing="1">Mensch · Planet · Demokratie</text>
<path d="M90 509H1110" stroke="#d7d0c1" stroke-width="1"/>
<text x="1110" y="551" text-anchor="end" fill="#52605f" font-family="WOek Sans" font-size="21" letter-spacing=".5">wirkungsoekonomie.de</text>
</svg>`;
const base=path.join(root,'assets/img/brand/wirkungsoekonomie-share-v2');
fs.writeFileSync(`${base}.svg`,svg);
const {rasterizer}=await rasterize(svg,{width:1200,height:630,prefer:'chrome',outFile:`${base}.png`});
console.log(`Brand share image: 1200 x 630, existing signet, local fonts, ${rasterizer}.`);
