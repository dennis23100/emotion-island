import {readFile,writeFile,readdir,copyFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const index=await readFile(path.join(root,'index.html'),'utf8');
for(const alias of ['emotion_my_world.html','emotion_gallery.html','emotion_leader_world.html','emotion_score.html'])await writeFile(path.join(root,alias),index);
const modules=(await readdir(path.join(root,'src'))).filter(f=>f.endsWith('.js'));
for(const name of modules){const file=path.join(root,'src',name),source=await readFile(file,'utf8');execFileSync(process.execPath,['--check',file]);for(const m of source.matchAll(/from\s+['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))throw Error(`${name}: nonlocal import ${m[1]}`);await stat(path.resolve(path.dirname(file),m[1]));}if(name!=='cloud.js'&&/fetch\(|XMLHttpRequest|WebSocket\(/.test(source))throw Error(`${name}: unexpected data connection`);}
for(const html of ['index.html','emotion_links.html','emotion_island.html','emotion_gallery.html','emotion_leader_world.html','emotion_score.html']){const source=await readFile(path.join(root,html),'utf8');if(!source.includes("connect-src https://score-calculation-ef584-default-rtdb.firebaseio.com"))throw Error(html+': missing database connection policy');for(const m of source.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){if(m[1].startsWith('data:')||m[1].startsWith('http'))continue;await stat(path.join(root,m[1]));}}
console.log(`Verified ${modules.length} local modules, all page entry points, imports and database connection policy.`);
