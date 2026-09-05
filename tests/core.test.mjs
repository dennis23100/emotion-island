import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePreviewRoom,IslandStore,LayoutHistory,CATALOG,THEMES,QUESTS,LEADERS,leaderState,memberAppearance,growthFor,availableNpcs,validateState,STORAGE_PREFIX,clone} from '../src/state.js';
import {islandContains,canPlace,isWater,onBridge,terrainHeight,findPath,isWalkable} from '../src/terrain.js';
import {decor,THREE,makeCharacter,animateCharacter} from '../src/models.js';
import {animateDecor} from '../src/extra-models.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),map};};

test('only the 2027 event and its eight rooms are accepted',()=>{
  for(let i=1;i<=8;i++){const c=parsePreviewRoom('?room=2027'+String(i).padStart(2,'0'));assert.equal(c.group,i);assert.equal(c.room,'2027');}
  for(const room of ['2026','202601','202608','2028','202709','202701x','../2027','2027%00'])assert.throws(()=>parsePreviewRoom('?room='+room));
  assert.throws(()=>parsePreviewRoom('?room=2027&group=9'));assert.equal(parsePreviewRoom('?room=202701&view=1').viewer,true);assert.equal(parsePreviewRoom('?room=2027&scene=leader').viewer,true);
});
test('scores, progress, spendable points and group data remain separate',()=>{
  const storage=memory(),a=new IslandStore(storage,1),b=new IslandStore(storage,2);a.addScore(400);a.buy('ferrisWheel');assert.deepEqual([a.state.score,a.state.progressScore,a.state.spendablePoints],[400,400,1300]);assert.deepEqual([b.state.score,b.state.spendablePoints],[0,1000]);assert.deepEqual([...storage.map.keys()],[STORAGE_PREFIX+'1']);
  const before=clone(a.state);for(const n of [0,-1,1.2,'100',NaN,Infinity,100001])assert.throws(()=>a.addScore(n));assert.deepEqual(a.state,before);assert.throws(()=>a.buy('unknown'));a.addScore(2000);assert.equal(growthFor(a.state.progressScore).progress,1);assert.equal(a.state.score,2400);
});
test('all mutation paths reject a read-only visitor',()=>{
  const storage=memory(),owner=new IslandStore(storage,1);owner.addScore(100);owner.meet('mori');const visitor=new IslandStore(storage,1,true),before=storage.getItem(owner.key);
  for(const action of [()=>visitor.addScore(100),()=>visitor.buy('bench'),()=>visitor.saveLayout(visitor.layout()),()=>visitor.meet('mori'),()=>visitor.complete('hello'),()=>visitor.update({worldName:'更名'})])assert.throws(action,/唯讀/);
  assert.equal(storage.getItem(owner.key),before);
});
test('draft undo, redo, move and collection conserve furniture',()=>{
  const s=new IslandStore(memory(),3),h=new LayoutHistory(s.layout());h.apply(l=>{l.inventory.bench--;l.placements['0']={itemId:'bench',x:0,z:8,rot:0};});assert.equal(s.state.placements['0'],undefined);assert.equal(h.undo().inventory.bench,1);assert.ok(h.redo().placements['0']);s.saveLayout(h.present);const original=clone(s.state.placements);
  s.addScore(1600);assert.deepEqual(s.state.placements,original);h.apply(l=>{l.placements['0'].x=3;l.placements['0'].rot=Math.PI/2;});s.saveLayout(h.present);assert.equal(s.state.placements['0'].x,3);
  h.apply(l=>{delete l.placements['0'];l.inventory.bench++;});s.saveLayout(h.present);assert.equal(s.state.inventory.bench,1);const invalid=s.layout();invalid.inventory.bench++;assert.throws(()=>s.saveLayout(invalid),/家具數量/);
});
test('layout limits, invalid coordinates and malicious metadata do not write',()=>{
  const s=new IslandStore(memory(),4),before=clone(s.state);for(const p of [{itemId:'bench',x:Infinity,z:0,rot:0},{itemId:'bench',x:95,z:0,rot:0},{itemId:'unknown',x:0,z:0,rot:0}]){const l=s.layout();l.placements['0']=p;assert.throws(()=>s.saveLayout(l));}
  assert.throws(()=>s.update({maxMembers:31}));assert.throws(()=>s.update({worldName:''}));assert.throws(()=>s.update({members:{'1':{name:'朋友',hair:'url(evil)'}}}));assert.deepEqual(s.state,before);
  const l=s.layout();for(let i=0;i<129;i++)l.placements[String(i)]={itemId:'bench',x:0,z:0,rot:0};assert.throws(()=>s.saveLayout(l),/128/);
});
test('gifts require completed actions and award exactly 50 team points once per quest',()=>{
  const s=new IslandStore(memory(),5);assert.equal(s.complete('hello'),false);assert.throws(()=>s.meet('atlas'));s.meet('mori');assert.ok(s.complete('hello'));assert.equal(s.complete('hello'),false);assert.equal(s.complete('bench'),false);assert.equal(s.complete('photo'),false);assert.ok(s.complete('photo',{photographed:true}));
  const l=s.layout();l.inventory.bench--;l.placements['0']={itemId:'bench',x:0,z:8,rot:0};s.saveLayout(l);assert.ok(s.complete('bench'));assert.equal(s.state.inventory.cushion,1);assert.deepEqual([s.state.score,s.state.rewardScore,s.state.progressScore,s.state.spendablePoints],[0,150,150,1150]);
});
test('revision conflicts and failed storage writes preserve both versions',()=>{
  const storage=memory(),a=new IslandStore(storage,6),b=new IslandStore(storage,6);a.addScore(100);assert.throws(()=>b.addScore(200),/另一個分頁/);assert.equal(new IslandStore(storage,6).state.score,100);assert.equal(b.state.score,0);
  const bad=memory(),c=new IslandStore(bad,6);bad.setItem=()=>{throw Error('quota');};assert.throws(()=>c.addScore(100),/quota/);assert.equal(c.state.score,0);
});
test('spirits and five NPCs arrive at exact growth thresholds; names survive cap changes',()=>{
  assert.deepEqual([0,399,400,799,800,1199,1200,1599,1600].map(n=>availableNpcs(n).length),[1,1,2,2,3,3,4,4,5]);
  const s=new IslandStore(memory(),2);s.addScore(300);s.update({members:{'1':{name:'小雨',style:'bun',outfit:'#aa9988'}},maxMembers:1});s.update({maxMembers:10});assert.equal(memberAppearance(s.state,1).name,'小雨');assert.equal(memberAppearance(s.state,1).style,'bun');assert.equal(memberAppearance(s.state,2).name,'小精靈 2');
});
test('land grows monotonically without moving or shrinking original ground',()=>{
  let previous=0;const areas=[];for(const score of [0,400,800,1200,1600]){let area=0;for(let x=-89;x<=89;x++)for(let z=-74;z<=74;z++){if(islandContains(x,z,0,score))area++;if(score&&islandContains(x,z,0,score-400))assert.ok(islandContains(x,z,0,score));}assert.ok(area>previous);previous=area;areas.push(area);}
  assert.ok(areas[4]>areas[0]*1.5);assert.equal(canPlace(65,8,1,[],{},null,0).ok,false);assert.equal(canPlace(65,8,1,[],{},null,400).ok,true);
});
test('placement protects water, bridges, buildings and neighboring furniture',()=>{
  assert.equal(canPlace(13,-1,1).ok,false);assert.equal(canPlace(12,10,1).ok,false);assert.equal(canPlace(0,8,1,[{x:0,z:8,r:1}]).ok,false);const p={'0':{x:0,z:8,radius:1}};assert.equal(canPlace(0,8,1,[],p).ok,false);assert.equal(canPlace(0,8,1,[],p,'0').ok,true);assert.equal(canPlace(0,8,1).ok,true);
});
test('autonomous routes cross the real bridge and avoid water and blockers',()=>{
  const blocks=[{x:4,z:10,r:1}],route=findPath({x:3,z:7},{x:21,z:7},blocks);assert.ok(route.length>0);assert.ok(route.some(p=>onBridge(p.x,p.z)));for(const p of route){assert.ok(isWalkable(p.x,p.z,blocks));if(isWater(p.x,p.z))assert.ok(onBridge(p.x,p.z));assert.ok(Number.isFinite(terrainHeight(p.x,p.z)));}assert.equal(findPath({x:0,z:0},{x:99,z:99}).length,0);
});
test('original 45 shop identifiers remain available, with real finite 3D models',()=>{
  const original='flowerPatch shrub mushroom sakura pineTree giantTree rockGarden crystal cottage gazebo arch torii tent windmill bench picnic teaTable swing hammock signpost lantern starLamp moonLamp fireflyLamp fountain pond lotusPond telescope campfire musicStage easel ferrisWheel carousel teacups miniTrain skySwing slide trampoline balloonDock photoBooth cloudCoaster leaderPalace leaderMoonLake leaderStarFountain leaderWaterfall'.split(' ');assert.equal(original.length,45);for(const id of original)assert.ok(CATALOG[id],id);
  for(const [id,c]of Object.entries(CATALOG)){assert.equal(c.cost,100);const g=decor(id);g.userData.baseY=3.4;for(const t of [0,5,30]){animateDecor(g,t);g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);assert.ok(!b.isEmpty(),id);assert.ok([b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].every(Number.isFinite),id);}}
});
test('leader showcase has the original eight names and remains outside group scoring',()=>{
  assert.equal(THEMES.length,8);assert.equal(LEADERS.length,8);const s=leaderState();assert.equal(s.score,0);assert.equal(s.maxMembers,8);assert.equal(s.members['1'].name,'翁點傳師瑋鍼');assert.equal(s.members['8'].name,'陳小組長怡安');validateState(s);for(let i=1;i<=8;i++){const character=makeCharacter(memberAppearance(s,i));animateCharacter(character,4,1,'wave');assert.ok(character.children.length>0);}
});
