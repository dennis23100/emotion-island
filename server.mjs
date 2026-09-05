import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=process.env.ISLAND_PREVIEW_PORT===undefined?2027:Number(process.env.ISLAND_PREVIEW_PORT);
const base=(process.env.ISLAND_PREVIEW_BASE||'').replace(/\/$/,'');
const host=process.env.ISLAND_PREVIEW_LAN==='1'?'0.0.0.0':'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.mp3':'audio/mpeg','.png':'image/png','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{const url=new URL(req.url,'http://localhost');if(base&&url.pathname!==base&&!url.pathname.startsWith(base+'/')){res.writeHead(404);res.end();return;}const requested=decodeURIComponent(url.pathname.slice(base.length)||'/');let rel=requested==='/'?'index.html':requested.replace(/^\//,'');if(rel==='emotion_my_world.html')rel='index.html';
    const target=path.resolve(root,rel);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"connect-src https://score-calculation-ef584-default-rtdb.firebaseio.com; frame-ancestors 'self'"});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('找不到這個本機預覽檔案。');}
});
server.listen(port,host,()=>console.log(`Emotion Island local preview: http://127.0.0.1:${server.address().port}${base}/emotion_links.html?room=2027`));
