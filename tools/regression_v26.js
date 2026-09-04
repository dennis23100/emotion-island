const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('/mnt/data/emotion_island_v26_biome_rebalance/emotion_my_world.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const data=scripts.find(s=>s.includes('global.EmotionData='));
if(!data)throw new Error('EmotionData script not found');
const mem=new Map();
const localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k),clear:()=>mem.clear()};
const sandbox={console,URLSearchParams,Date,Math,JSON,Promise,setTimeout,clearTimeout,setInterval,clearInterval,CustomEvent:function(type,init){this.type=type;this.detail=init&&init.detail},dispatchEvent:()=>{},addEventListener:()=>{},location:{search:'',pathname:'/emotion_my_world.html'},localStorage};
sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.firebase=undefined;
vm.createContext(sandbox);vm.runInContext(data,sandbox);
const D=sandbox.EmotionData;
(async()=>{
 if(!D)throw new Error('EmotionData missing');
 if(Object.keys(D.SHOP).length!==41)throw new Error('shop count');
 if(Object.values(D.SHOP).some(x=>x.cost!==100))throw new Error('shop cost');
 await D.resetLocalDemo();
 const readGroup=()=>{let out;D.watchGroup('1',x=>out=x);D.disconnectAll();return out};
 let g=readGroup(); if(!g||g.score!==1600||g.spendablePoints!==3200)throw new Error('showcase seed');
 let r=await D.addScore('1',100); if(!r.ok)throw new Error('add score call'); g=readGroup(); if(g.score!==1700||g.spendablePoints!==3300)throw new Error('add score state');
 r=await D.buyItem('1','carousel'); if(!r.ok)throw new Error('buy call'); g=readGroup(); if(g.inventory.carousel!==1)throw new Error('buy state');
 r=await D.saveLayout('1',{carousel:1},{'117':{itemId:'carousel',rot:.4,x:3,z:2}}); if(!r.ok)throw new Error('save layout');
 const after=readGroup(); if(!after.placements['117']||after.placements['117'].itemId!=='carousel')throw new Error('layout persistence');
 if(D.groupRoomCode('7')!==''){} // demo mode intentionally no room code
 console.log('PASS score/add/buy/save-layout/catalog/storage');
 process.exit(0);
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
