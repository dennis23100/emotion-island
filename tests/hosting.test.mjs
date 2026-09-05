import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
test('static pages and module graph work from a GitHub Pages project subpath',async()=>{
  const server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,ISLAND_PREVIEW_PORT:'0',ISLAND_PREVIEW_BASE:'/emotion-island',ISLAND_PREVIEW_LAN:'0'},stdio:['ignore','pipe','pipe']});
  try{
    const origin=await new Promise((resolve,reject)=>{let output='';const timeout=setTimeout(()=>reject(Error('Preview server did not start')),8000);server.once('error',reject);server.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timeout);resolve(match[0]);}});});
    const base=origin+'/emotion-island/',seen=new Set();
    async function visit(url){
      if(seen.has(url))return;seen.add(url);assert.ok(url.startsWith(base),'Every dependency must stay under the project path');
      const response=await fetch(url);assert.equal(response.status,200,url);assert.match(response.headers.get('content-security-policy'),/connect-src https:\/\/score-calculation-ef584-default-rtdb\.firebaseio\.com/);
      const source=await response.text(),type=response.headers.get('content-type');
      if(type.startsWith('text/html')){
        assert.match(source,/<meta charset="utf-8">/i);assert.match(source,/connect-src https:\/\/score-calculation-ef584-default-rtdb\.firebaseio\.com/);
        for(const m of source.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){if(m[1].startsWith('data:'))continue;await visit(new URL(m[1],url).href);}
      }else if(type.startsWith('text/javascript')){
        for(const m of source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)){assert.ok(m[1].startsWith('.'),'No CDN or unresolved package import');await visit(new URL(m[1],url).href);}
      }
    }
    for(const file of ['emotion_links.html','emotion_island.html','emotion_my_world.html','emotion_gallery.html','emotion_leader_world.html','emotion_score.html'])await visit(base+file);
    assert.ok(seen.size>=20,'Pages, styles and all dependencies were traversed');
    assert.equal((await fetch(base+'emotion_links.html',{method:'HEAD'})).status,200);
    assert.equal((await fetch(base+'emotion_my_world.html',{method:'POST'})).status,405);
    assert.equal((await fetch(origin+'/emotion_links.html')).status,404);
    assert.equal((await fetch(base+'missing-file.js')).status,404);
    const invalid=await fetch(base+'..%2f..%2foutside');assert.equal(invalid.status,403);
  }finally{server.kill();}
});
