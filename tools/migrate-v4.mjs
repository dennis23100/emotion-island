import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readRoom,migrateRoot,transaction,WORLD_VERSION,legacyInventory} from '../src/cloud.js';

const room=process.argv[2],apply=process.argv.includes('--apply');
if(!room||!/^[A-Za-z0-9_-]{1,80}$/.test(room))throw Error('Usage: node tools/migrate-v4.mjs ROOM [--apply]');
const before=await readRoom(room),groups=[1,2,3,4,5,6,7,8];
const summary=root=>groups.map(group=>({group,score:root.groups?.[group]?.score??0,points:root.groups?.[group]?.spendablePoints??1000,version:root.worldsV4?.[group]?.version??0}));
console.log(JSON.stringify({room,mode:apply?'apply':'preview',groups:summary(before)},null,2));
if(apply){
  // Backups are outside the Git working tree and Vercel's public output root.
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),backup=path.resolve(root,'../release-data-backups');
  mkdirSync(backup,{recursive:true});let attempt=0;
  const result=await transaction(room,raw=>{
    if(groups.every(id=>raw.worldsV4?.[id]?.version===WORLD_VERSION))return null;
    const filename=path.join(backup,`${room}-v4-${Date.now()}-${attempt++}.json`);writeFileSync(filename,JSON.stringify(raw,null,2));
    const next=migrateRoot(raw,room);
    for(const id of groups)if(raw.groups?.[id])for(const key of ['score','progressScore','spendablePoints','worldName','members','maxMembers','updatedAt'])assert.deepEqual(next.groups[id][key],raw.groups[id][key],`Preserve group ${id} ${key}`);
    for(const id of groups)if(raw.groups?.[id]&&raw.worldsV4?.[id]?.version!==WORLD_VERSION)assert.deepEqual(next.worldsV4[id].inventory,legacyInventory(raw.groups[id]),`Preserve all owned items for group ${id}`);
    console.log('Saved pre-migration backup: '+filename);return next;
  });
  assert.ok(groups.every(id=>result.worldsV4?.[id]?.version===WORLD_VERSION));
  console.log(JSON.stringify({room,migrated:true,scoresPreserved:true,groups:summary(result)},null,2));
}
