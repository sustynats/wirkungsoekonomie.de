// Read-only localhost acceptance server; no production analytics, votes or logins.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
const root=process.cwd();
const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1:8790');
  const route=decodeURIComponent(url.pathname);
  const file=path.resolve(root,`.${route.endsWith('/')?`${route}index.html`:route}`);
  if(!file.startsWith(`${root}/`)||!fs.existsSync(file)||!fs.statSync(file).isFile()||(!route.startsWith('/assets/')&&!file.endsWith('.html'))){res.writeHead(404);res.end();return;}
  if(file.endsWith('.html')){
    const html=fs.readFileSync(file,'utf8').replace(/<script\b[\s\S]*?<\/script>/gi,'').replace('</body>',`<script type="module">import {mountContextualQuestions} from '/assets/js/contextual-questions.js';mountContextualQuestions(document,location.pathname);</script></body>`);
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);return;
  }
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(8790,'127.0.0.1',()=>console.log('Read-only contextual-question preview: http://127.0.0.1:8790/umfragen/wirkungsticker-feedback/'));
