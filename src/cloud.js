import {IslandStore,initialState,validateState,clone,QUESTS,questReady,awardPoints,chatReady,awardChat,CATALOG} from './state.js';

export const DATABASE_URL='https://score-calculation-ef584-default-rtdb.firebaseio.com';
export const WORLD_VERSION=4;
const object=value=>value&&typeof value==='object'?value:{};
const worldFields=['inventory','placements','quests','met','avatar','time','revision','chats','rewardScore'];
const groupFields=['score','progressScore','spendablePoints','maxMembers','members','worldName'];
const layoutKey=s=>JSON.stringify({inventory:s.inventory,placements:s.placements});

export function legacyInventory(group) {
  const inventory={};
  for(const [id,count]of Object.entries(object(group.inventory))){
    if(!CATALOG[id]||!Number.isSafeInteger(count)||count<0)throw Error('舊倉庫有無法辨識的物品，原資料保持不變。');
    inventory[id]=count;
  }
  for(const placement of Object.values(object(group.placements))){
    if(!placement)continue;
    const id=placement.itemId;if(!CATALOG[id])throw Error('舊佈置有無法辨識的物品，原資料保持不變。');
    inventory[id]=(inventory[id]||0)+1;
  }
  return inventory;
}

// Scores remain at their original V3 paths. V4 scenery lives alongside groups,
// so an older scoring page cannot overwrite the new furniture or quest data.
export function stateFromRoot(root,room,group) {
  const g=object(root?.groups?.[group]),w=object(root?.worldsV4?.[group]);
  const s=initialState(group,room);
  for(const key of groupFields)if(g[key]!==undefined&&g[key]!==null)s[key]=clone(g[key]);
  s.members=object(s.members);s.members=Object.fromEntries(Object.entries(s.members).filter(([,v])=>v&&typeof v==='object'));
  s.updatedAt=Math.max(Number(g.updatedAt)||0,Number(w.updatedAt)||0);
  if(w.version!==WORLD_VERSION&&Object.keys(g).length)s.inventory=legacyInventory(g);
  if(w.version===WORLD_VERSION){for(const key of worldFields)if(w[key]!==undefined&&w[key]!==null)s[key]=clone(w[key]);
    // Realtime Database removes empty collections and returns sparse numeric maps as arrays.
    for(const key of ['inventory','placements','quests'])s[key]=Object.fromEntries(Object.entries(object(w[key])).filter(([,v])=>v!==null));
    s.met=Array.isArray(w.met)?w.met.filter(Boolean):[];
    // A still-open V3 tab may make a purchase during the rollout. Keep those
    // newly owned items as well, and absorb them on the next V4 transaction.
    for(const [id,count]of Object.entries(legacyInventory(g)))s.inventory[id]=(s.inventory[id]||0)+count;
  }
  s.progressScore+=s.rewardScore;
  return validateState(s,group,room);
}

export function migrateRoot(raw,room,groups=[1,2,3,4,5,6,7,8],now=Date.now()) {
  const root=clone(raw||{});root.groups={...object(root.groups)};root.worldsV4={...object(root.worldsV4)};
  for(const group of groups){
    if(root.worldsV4[group]?.version===WORLD_VERSION)continue;
    const s=stateFromRoot(root,room,group),g=root.groups[group];
    if(g){root.groups[group]={...g,inventory:null,placements:null};}
    else root.groups[group]=Object.fromEntries(groupFields.map(key=>[key,clone(s[key])]));
    root.worldsV4[group]={version:WORLD_VERSION,migratedAt:now,...Object.fromEntries(worldFields.map(key=>[key,clone(s[key])]))};
  }
  return root;
}

function saveState(root,group,state) {
  const g=root.groups[group];
  for(const key of groupFields)g[key]=clone(state[key]);
  g.progressScore=state.progressScore-state.rewardScore;
  g.inventory=null;g.placements=null;
  g.updatedAt=state.updatedAt;
  const w=root.worldsV4[group];
  for(const key of worldFields)w[key]=clone(state[key]??{});
  w.updatedAt=state.updatedAt;
}
async function request(url,options={},fetcher=fetch) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{return await fetcher(url,{...options,cache:'no-store',signal:controller.signal});}
  finally{clearTimeout(timer);}
}
export function roomURL(room){if(!/^[A-Za-z0-9_-]{1,80}$/.test(room))throw Error('活動房號不正確。');return `${DATABASE_URL}/rooms/${room}/emotionV3.json`;}
export async function readRoom(room,fetcher=fetch) {
  const response=await request(roomURL(room),{},fetcher);
  if(!response.ok)throw Error(`小島連線失敗（${response.status}），請檢查網路後重新整理。`);
  return await response.json()||{};
}

// Conditional writes retry against the latest root; the same receipt makes a lost
// response safe to retry without awarding a score, purchase or gift twice.
export async function transaction(room,mutate,{fetcher=fetch,operationId=crypto.randomUUID(),attempts=5}={}) {
  let uncertain=false;
  for(let attempt=0;attempt<attempts;attempt++){
    try{
      const response=await request(roomURL(room),{headers:{'X-Firebase-ETag':'true'}},fetcher);
      if(!response.ok)throw Error(`無法讀取活動資料（${response.status}）。`);
      const raw=await response.json()||{};
      if(raw.v4Operations?.[operationId])return raw;
      const etag=response.headers.get('ETag');if(!etag)throw Error('無法確認資料版本，這次沒有寫入。');
      const next=mutate(clone(raw));if(!next)return raw;
      next.v4Operations={...object(next.v4Operations),[operationId]:Date.now()};
      const receipts=Object.entries(next.v4Operations).sort((a,b)=>b[1]-a[1]).slice(0,256);next.v4Operations=Object.fromEntries(receipts);
      uncertain=true;
      const saved=await request(roomURL(room),{method:'PUT',headers:{'Content-Type':'application/json','if-match':etag},body:JSON.stringify(next)},fetcher);
      if(saved.status===412){uncertain=false;continue;}
      if(!saved.ok){uncertain=false;throw Error(`雲端未接受儲存（${saved.status}）。`);}
      return next;
    }catch(error){
      if(error.name!=='AbortError'&&!(error instanceof TypeError))throw error;
      if(attempt===attempts-1)throw Error(uncertain?'網路中斷，請重新整理確認剛才的結果，再操作一次。':'目前無法連線，資料未送出，請稍後再試。');
    }
  }
  throw Error('同時更新的人較多，請稍後重試；目前佈置仍保留在畫面上。');
}

export class CloudIslandStore extends IslandStore {
  constructor(room,group,readOnly=false,options={}) {
    super({getItem:()=>null,setItem:()=>{}},group,readOnly);
    this.room=room;this.cloud=true;this.options=options;this.state=initialState(group,room);this.pending=0;
  }
  async load(){this.state=stateFromRoot(await readRoom(this.room,this.options.fetcher),this.room,this.group);return this.state;}
  async transact(fn) {
    if(this.readOnly)throw Error('唯讀參觀不能修改小島資料。');
    if(this.pending)throw Error('正在儲存，請等候完成再操作。');
    this.pending++;
    try{
      const root=await transaction(this.room,raw=>{
        const next=migrateRoot(raw,this.room,[this.group]),s=stateFromRoot(next,this.room,this.group);
        fn(s);validateState(s,this.group,this.room);s.revision++;s.updatedAt=Date.now();saveState(next,this.group,s);return next;
      },this.options);
      this.state=stateFromRoot(root,this.room,this.group);return this.state;
    }finally{this.pending--;}
  }
  saveLayout(layout) {
    const before=layoutKey(this.state);
    return this.transact(s=>{
      if(layoutKey(s)!==before)throw Error('其他人已更新佈置，請先匯出這份草稿，再重新整理。');
      const local=new IslandStore({getItem:()=>null,setItem:()=>{}},this.group);
      local.state={...clone(s),room:'2027'};local.saveLayout(layout);
      s.inventory=clone(layout.inventory);s.placements=clone(layout.placements);
    });
  }
  update(values) {
    const before=clone(this.state.members);
    return this.transact(s=>{
      for(const key of ['avatar','worldName','time','maxMembers'])if(values[key]!==undefined)s[key]=clone(values[key]);
      if(values.members)for(const [id,member]of Object.entries(values.members))if(JSON.stringify(before[id])!==JSON.stringify(member))s.members[id]=clone(member);
    });
  }
  async complete(id,evidence={}) {
    const q=QUESTS.find(q=>q.id===id);if(!q||!questReady(this.state,id,evidence))return false;
    let awarded=false;
    await this.transact(s=>{awarded=false;if(!questReady(s,id,evidence))return;awarded=true;s.quests[id]=true;s.inventory[q.gift]=(s.inventory[q.gift]||0)+1;awardPoints(s,q.scoreReward);});
    return awarded?q:false;
  }
  async chat(id,now=Date.now()){
    if(this.readOnly)throw Error('唯讀參觀不能領取聊天分數。');if(!chatReady(this.state,id,now))return false;
    let result;await this.transact(s=>{result=awardChat(s,id,now);});return result;
  }
}

export function watchRoom(room,onData,onError,{interval=4000,fetcher=fetch}={}) {
  let stopped=false,timer,last='',busy=false;
  const tick=async()=>{
    if(stopped||busy||document.hidden)return;
    busy=true;clearTimeout(timer);
    try{const root=await readRoom(room,fetcher);if(stopped)return;const next=JSON.stringify(root);if(next!==last){last=next;onData(root);}}
    catch(e){if(!stopped)onError?.(e);}finally{busy=false;if(!stopped)timer=setTimeout(tick,interval);}
  };
  const visibility=()=>{if(document.hidden)clearTimeout(timer);else tick();};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('focus',tick);tick();
  return ()=>{stopped=true;clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('focus',tick);};
}
