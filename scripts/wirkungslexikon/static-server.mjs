import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]),port=Number(process.argv[3]||8797);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.gz':'application/gzip','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{try{const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==root&&!file.startsWith(root+path.sep))throw Error('not found');if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('not found');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404);res.end('Nicht gefunden');}}).listen(port,'127.0.0.1',()=>console.log('Öffentlicher Release Candidate lokal: http://127.0.0.1:'+port+'/wirkungslexikon/'));
