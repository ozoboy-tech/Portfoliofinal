import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT || 4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
  try {
    if(!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.includes('\\') || pathname.split('/').some(p=>p.startsWith('.')||p.startsWith('_'))) {res.writeHead(404);res.end();return;}
    let path=resolve(root,`.${pathname}`);
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    try {if((await stat(path)).isDirectory()) path=resolve(path,'index.html');}catch{}
    let body,code=200;
    try {body=await readFile(path);}catch{body=await readFile(resolve(root,'404.html'));path='404.html';code=404;}
    res.writeHead(code,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(400);res.end('Requête invalide');}
}).listen(port,'127.0.0.1',()=>console.log(`Portfolio : http://127.0.0.1:${port}/ — Ctrl+C pour arrêter. Les en-têtes Netlify sont à tester sur Netlify.`));
