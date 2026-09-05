import test from 'node:test';
import assert from 'node:assert/strict';
import {migrateRoot,stateFromRoot,CloudIslandStore,transaction} from '../src/cloud.js';
import {sessionConfig,visitScope,islandHref,pageHref} from '../src/session.js';
import {initialState,clone,NPCS,questReady,totalScore,islandElevation} from '../src/state.js';
import {lifeFor,nextGreeting,npcDialogue,npcRequest} from '../src/life.js';

function legacy(){const groups=[null];for(let i=1;i<=8;i++)groups[i]={id:String(i),score:i*100+30,progressScore:i*100+50,spendablePoints:i*90,worldName:'第'+i+'組的小島',maxMembers:15,members:{1:{name:'夥伴'+i,gender:'other'}},inventory:{ferrisWheel:3,bench:1},placements:{8:{itemId:'sakura',slot:8}},updatedAt:17};return {groups,unrelated:{keep:true}};}
function backend(initial,options={}){
  let root=clone(initial),version=1,lost=false,denied=false,writes=0;
  const fetcher=async(url,request={})=>{
    if(request.method==='PUT'){
      if(options.deny)return new Response('denied',{status:403});
      if(request.headers['if-match']!=='"'+version+'"')return new Response('conflict',{status:412});
      root=JSON.parse(request.body);version++;writes++;
      if(options.loseResponse&&!lost){lost=true;throw new TypeError('network disconnected after commit');}
      return new Response(JSON.stringify(root),{status:200});
    }
    return new Response(JSON.stringify(root),{status:200,headers:{ETag:'"'+version+'"'}});
  };
  return {fetcher,get:()=>clone(root),writes:()=>writes,set:fn=>{fn(root);version++;}};
}

test('V4 replaces decorations exactly once and preserves every original score and personal field',()=>{
  const source=legacy(),original=clone(source),next=migrateRoot(source,'2026');
  assert.deepEqual(source,original);assert.deepEqual(next.unrelated,source.unrelated);
  for(let i=1;i<=8;i++){
    for(const key of ['score','progressScore','spendablePoints','members','maxMembers','worldName','updatedAt'])assert.deepEqual(next.groups[i][key],source.groups[i][key],key);
    assert.equal(next.groups[i].placements,null);assert.equal(next.groups[i].inventory,null);
    const s=stateFromRoot(next,'2026',i);assert.deepEqual(s.placements,{});assert.deepEqual(s.inventory,{ferrisWheel:3,bench:1,sakura:1});assert.equal(s.room,'2026');
  }
  next.worldsV4[1].placements={0:{itemId:'bench',x:2,z:10,rot:0}};
  assert.deepEqual(migrateRoot(next,'2026'),next,'a later page load must not reset new decorations');
});

test('Firebase sparse arrays and missing empty maps do not restore free inventory',()=>{
  const root=migrateRoot(legacy(),'2026');root.worldsV4[1].inventory=null;root.worldsV4[1].placements=[{itemId:'bench',x:0,z:12,rot:0},null,{itemId:'flowerPatch',x:2,z:12,rot:0}];root.worldsV4[1].quests=null;root.worldsV4[1].met=null;
  const s=stateFromRoot(root,'2026',1);assert.deepEqual(s.inventory,{});assert.equal(Object.keys(s.placements).length,2);assert.deepEqual(s.quests,{});
});

test('concurrent scoring retries preserve both contributions and old-path compatibility',async()=>{
  const db=backend(legacy()),a=new CloudIslandStore('2026',1,false,db),b=new CloudIslandStore('2026',1,false,db);
  await Promise.all([a.load(),b.load()]);await Promise.all([a.addScore(100),b.addScore(70)]);
  assert.equal(db.get().groups[1].score,300);assert.equal(db.get().groups[1].spendablePoints,260);assert.deepEqual(db.get().groups[2],legacy().groups[2]);
  db.set(root=>{root.groups[1]={...legacy().groups[1],score:350,progressScore:370,spendablePoints:310};});
  await a.load();assert.equal(a.state.score,350);assert.equal(a.state.inventory.bench,2);
});

test('a lost successful response never awards score twice',async()=>{
  const db=backend(legacy(),{loseResponse:true}),s=new CloudIslandStore('2026',1,false,db);await s.load();await s.addScore(100);
  assert.equal(s.state.score,230);assert.equal(db.writes(),1);
});

test('denied writes preserve the current state and read-only stores never send mutations',async()=>{
  const db=backend(legacy(),{deny:true}),s=new CloudIslandStore('2026',1,false,db);await s.load();const before=clone(s.state);
  await assert.rejects(s.addScore(100),/403/);assert.deepEqual(s.state,before);
  const view=new CloudIslandStore('2026',1,true,db);await view.load();
  for(const fn of [()=>view.addScore(50),()=>view.buy('bench'),()=>view.update({worldName:'wrong'}),()=>view.saveLayout(view.layout())])await assert.rejects(fn(),/唯讀/);
  assert.equal(db.writes(),0);
});

test('concurrent placement changes are not overwritten even when item counts match',async()=>{
  const db=backend(migrateRoot(legacy(),'2026')),a=new CloudIslandStore('2026',1,false,db),b=new CloudIslandStore('2026',1,false,db);await Promise.all([a.load(),b.load()]);
  const layout=a.layout();layout.inventory.bench--;layout.placements[0]={itemId:'bench',x:0,z:12,rot:0};await a.saveLayout(layout);
  const stale=b.layout();stale.inventory.bench--;stale.placements[0]={itemId:'bench',x:3,z:12,rot:0};await assert.rejects(b.saveLayout(stale),/其他人/);
  assert.equal(db.get().worldsV4[1].placements[0].x,0);
});

test('NPC gifts require saved buildings and award exactly 50 points once across clients',async()=>{
  const db=backend(migrateRoot(legacy(),'2026')),a=new CloudIslandStore('2026',1,false,db),b=new CloudIslandStore('2026',1,false,db);await a.load();
  assert.equal(await a.complete('bench'),false);const layout=a.layout();layout.inventory.bench--;layout.placements[0]={itemId:'bench',x:0,z:12,rot:0};await a.saveLayout(layout);await b.load();
  const gifts=await Promise.all([a.complete('bench'),b.complete('bench')]);assert.equal(gifts.filter(Boolean).length,1);assert.equal(db.get().worldsV4[1].inventory.cushion,1);assert.equal(db.get().groups[1].score,130);assert.equal(db.get().worldsV4[1].rewardScore,50);assert.equal(db.get().groups[1].progressScore,150);assert.equal(totalScore(stateFromRoot(db.get(),'2026',1)),180);assert.equal(db.get().groups[1].spendablePoints,140);
});

test('editing entrance only restores its own group; direct read-only links remain read-only',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
  const owner=visitScope(sessionConfig('?room=202601','example.com'),storage,'?room=202601',true,()=> 'known-trip');
  const other=new URL(islandHref(owner,2),'https://example.com/');assert.equal(other.searchParams.get('view'),'1');
  const visit=visitScope(sessionConfig(other.search,'example.com'),storage,other.search);assert.equal(visit.ownerGroup,1);assert.equal(visit.viewer,true);
  const back=new URL(islandHref(visit,1),'https://example.com/');assert.equal(back.searchParams.get('view'),null);assert.equal(back.searchParams.get('room'),'202601');
  const readOnly=visitScope(sessionConfig('?room=202601&view=1','example.com'),storage,'?room=202601&view=1');
  for(let i=1;i<=8;i++)assert.equal(new URL(islandHref(readOnly,i),'https://example.com/').searchParams.get('view'),'1');
  const copied=visitScope(sessionConfig(other.search,'example.com'),{getItem:()=>null,setItem:()=>{}},other.search);assert.equal(copied.ownerGroup,null);
  assert.throws(()=>sessionConfig('?room=202601&cloud=1','127.0.0.1'),/2027/);assert.equal(sessionConfig('?room=202701','127.0.0.1').cloud,false);
  assert.equal(new URL(pageHref({room:'camp-a'},'emotion_my_world.html',3,true),'https://a/').searchParams.get('group'),'3');
});

test('growth increases ambient activity with bounded intervals and varied contextual dialogue',()=>{
  for(let stage=0;stage<5;stage++){const p=lifeFor(stage*400);assert.equal(nextGreeting(stage*400,()=>0),p.min);assert.equal(nextGreeting(stage*400,()=>1),p.max);if(stage)assert.ok(p.max<lifeFor((stage-1)*400).max);}
  for(const npc of NPCS){const s=initialState();const lines=new Set(Array.from({length:7},(_,i)=>npcDialogue(npc,s,i)));assert.ok(lines.size>=6);assert.match(npcRequest(npc,s),/儲存/);s.quests[npc.item]=true;assert.match(npcRequest(npc,s),/已完成/);}
  const s=initialState();s.placements={0:{itemId:'lantern',x:0,z:0,rot:0}};assert.equal(questReady(s,'lantern'),false);s.progressScore=800;assert.equal(questReady(s,'lantern'),true);
});


test('daily chat points are once per NPC across devices and use Taiwan midnight',async()=>{
  const db=backend(migrateRoot(legacy(),'2026')),a=new CloudIslandStore('2026',1,false,db),b=new CloudIslandStore('2026',1,false,db);await Promise.all([a.load(),b.load()]);
  const now=Date.parse('2026-09-05T15:59:00Z');const rewards=await Promise.all([a.chat('mori',now),b.chat('mori',now)]);assert.equal(rewards.filter(Boolean).length,1);assert.equal(db.get().groups[1].score,130);assert.equal(db.get().worldsV4[1].rewardScore,5);
  assert.equal(await a.chat('mori',now+30000),false);assert.ok(await a.chat('mori',now+60000));assert.equal(db.get().groups[1].score,130);assert.equal(db.get().worldsV4[1].rewardScore,10);
  assert.equal(await a.chat('atlas',now),false);assert.equal(db.get().groups[1].score,130);assert.equal(db.get().worldsV4[1].rewardScore,10);
  const view=new CloudIslandStore('2026',1,true,db);await view.load();await assert.rejects(view.chat('mori',now),/唯讀/);
});


test('islands emerge continuously but connections only appear at 1600 total points',()=>{
  let previous=-Infinity;for(const score of [0,100,399,800,1599,1600]){const e=islandElevation(score);assert.ok(e.height>previous);assert.equal(e.connected,score>=1600);previous=e.height;}
  assert.equal(islandElevation(9999).height,islandElevation(1600).height);assert.equal(totalScore({score:1500,rewardScore:100}),1600);
});


test('purchases from an old tab during rollout are also retained without duplication',async()=>{
  const db=backend(migrateRoot(legacy(),'2026'));db.set(root=>{root.groups[1].inventory={cottage:1};root.groups[1].placements={3:{itemId:'pond'}};});
  const a=new CloudIslandStore('2026',1,false,db);await a.load();assert.equal(a.state.inventory.cottage,1);assert.equal(a.state.inventory.pond,1);
  await a.addScore(10);await a.load();assert.equal(a.state.inventory.cottage,1);assert.equal(a.state.inventory.pond,1);assert.equal(db.get().groups[1].inventory,null);
});
