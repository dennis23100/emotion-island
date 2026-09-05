export const PREVIEW_ROOM = '2027';
export const STORAGE_PREFIX = 'emotion-island:local-preview:2027:v1:';
export const MAX_PLACEMENTS = 128;
export const clone = value => JSON.parse(JSON.stringify(value));

export function parsePreviewRoom(search = '') {
  const q = new URLSearchParams(search);
  const raw = q.get('room') || '202703';
  if (!/^2027(?:0[1-8])?$/.test(raw)) throw new Error('這個預覽只開放 2027 測試房間。');
  const group = raw.length === 6 ? Number(raw.slice(4)) : Number(q.get('group') || 3);
  if (!Number.isInteger(group) || group < 1 || group > 8) throw new Error('組別必須是 1 到 8。');
  return { room: PREVIEW_ROOM, group, code: `2027${String(group).padStart(2, '0')}`, viewer: q.get('view') === '1' || q.get('mode') === 'gallery' || q.get('scene')==='leader', gallery:q.get('mode')==='gallery',leader:q.get('scene')==='leader' };
}

export const THEMES = [
 {id:1,name:'星瀑島',title:'星辰觀測所',subtitle:'星圖廣場與瀑布之間',color:'#7d9bbd',grass:'#788e7f',roof:'#667c9c',sky:'#9eafb9',trees:'oak',landmark:'observatory'},
 {id:2,name:'櫻光島',title:'櫻風庭園',subtitle:'花信、水庭與午後茶席',color:'#ce94a4',grass:'#8da779',roof:'#aa797f',sky:'#b6c9bd',trees:'cherry',landmark:'garden'},
 {id:3,name:'森語島',title:'溪光小徑',subtitle:'沿著溪水，慢慢生活',color:'#658968',grass:'#7b9f60',roof:'#4c8b7d',sky:'#8bbfb0',trees:'oak',landmark:'forest'},
 {id:4,name:'晨曦島',title:'晨光山居',subtitle:'風車、麥穗與山稜',color:'#c59d65',grass:'#aaa368',roof:'#ac8255',sky:'#c3c7b2',trees:'oak',landmark:'windmill'},
 {id:5,name:'月汐島',title:'月灣水庭',subtitle:'一彎月色，兩岸燈火',color:'#9199ba',grass:'#819b91',roof:'#7e89a8',sky:'#9dabbf',trees:'cherry',landmark:'moon'},
 {id:6,name:'花風島',title:'花野會客室',subtitle:'花園、舞台與小小的慶典',color:'#ce9d83',grass:'#8fa568',roof:'#b88665',sky:'#b8c9b7',trees:'cherry',landmark:'flowers'},
 {id:7,name:'晶語島',title:'晶湖秘境',subtitle:'晶石與層疊的湖岸',color:'#7caeb3',grass:'#839d8c',roof:'#688e95',sky:'#9abfc0',trees:'pine',landmark:'crystal'},
 {id:8,name:'希望島',title:'星願聖境',subtitle:'為每一個心願，留一盞燈',color:'#ac99bd',grass:'#909e83',roof:'#9391ac',sky:'#b4bdc6',trees:'oak',landmark:'hope'}
];
export function growthFor(score){const value=Math.max(0,Number(score)||0),stage=Math.min(4,Math.floor(value/400));return {stage,level:Math.min(16,Math.floor(value/100)),progress:Math.min(1,value/1600),npcCount:Math.min(5,1+stage),label:['初遇','甦醒','繁盛','奇境','完整'][stage],next:stage<4?(stage+1)*400:null};}
export function availableNpcs(score){return NPCS.filter(n=>(n.unlock||0)<=score);}

const items = [
  ['bench', '橡木長椅', '休憩', 1.5, '給路過的心情，一個坐下的位置。'],
  ['flowerPatch', '晴日花叢', '自然', .85, '奶油白與金黃色的小花，開得剛剛好。'],
  ['lantern', '暖光庭園燈', '燈飾', .55, '天暗以後，一盞溫柔的光就夠了。'],
  ['picnic', '午後野餐', '休憩', 1.65, '把點心、好天氣和喜歡的人放在一起。'],
  ['cottage', '溪畔小木屋', '建築', 3.1, '青綠屋瓦、木窗和一座小小的門廊。'],
  ['sakura', '花信櫻樹', '自然', 1.5, '風起的時候，花瓣會替你寫一封信。'],
  ['teaTable', '雙人茶席', '休憩', 1.6, '兩只杯子，留給你和下一位朋友。'],
  ['shrub', '圓葉灌木', '自然', .8, '圓圓的葉子，適合放在步道轉角。'],
  ['mushroom', '小傘蘑菇', '自然', .65, '在不起眼的地方，藏一點驚喜。'],
  ['arch', '藤花拱門', '建築', 1.7, '走過這裡，就進入自己的小花園。'],
  ['swing', '森林鞦韆', '休憩', 1.65, '慢慢晃，讓今天的煩惱輕一點。'],
  ['pond', '睡蓮小池', '水景', 1.7, '一片葉子、一朵花，和慢慢散開的漣漪。'],
  ['campfire', '星下營火', '休憩', 1.25, '等到傍晚，大家會想來這裡坐坐。'],
  ['tent', '週末帳篷', '建築', 2.0, '今晚不趕路，就住在星空底下。'],
  ['fence', '木作矮圍籬', '建築', 1.1, '把小花園圍起來，留一個歡迎的入口。'],
  ['planter', '陶盆綠意', '自然', .55, '手捏的陶盆，裝著一點新生活。'],
  ['fountain', '小鳥噴泉', '水景', 1.3, '聽見水聲的時候，記得放慢腳步。'],
  ['telescope', '星野望遠鏡', '休憩', .9, '把視線交給更遠一點的地方。'],
  ['sign', '森林路牌', '建築', .55, '不管繞了多遠，總有回家的方向。'],
  ['signpost', '小世界路牌', '休憩', .55, '把最喜歡的角落，指給朋友看。'],
  ['mailbox', '寫信的日子', '建築', .55, '每一份想念，都有可以抵達的地方。'],
  ['giantTree', '心願樹', '自然', 1.7, '枝葉間的心願卡，會記得你的每一個願望。'],
  ['cushion', '草地坐墊', '休憩', .65, '挑一塊喜歡的草地，就能好好待著。'],
  ['starLamp', '晚安星燈', '燈飾', .7, '把一顆星星放在身邊。'],
  ['rockGarden', '苔石小景', '自然', .95, '石頭上的小小森林，也在慢慢長大。'],
  ['pineTree','山林松樹','自然',1.4,'一層一層，把風的形狀留下。'],
  ['crystal','共感水晶','自然',1.1,'日光穿過晶面，映出一點溫柔的顏色。'],
  ['gazebo','花園亭','建築',2.2,'下雨也能坐著聊天的地方。'],
  ['torii','森之鳥居','建築',1.8,'走過木門，心情也慢慢安靜。'],
  ['windmill','小風車','建築',2.1,'轉動的葉片，記錄今天的風。'],
  ['hammock','樹間吊床','休憩',1.8,'把午後留給樹蔭和微風。'],
  ['moonLamp','月牙燈','燈飾',.9,'圓潤的月牙，陪著每一個夜晚。'],
  ['fireflyLamp','螢光精靈燈','燈飾',.65,'把一點微光，留在花園裡。'],
  ['lotusPond','睡蓮池','水景',1.9,'花瓣落下，水面替它留了座位。'],
  ['musicStage','小小音樂台','活動',2.4,'有音樂的地方，就會有人相聚。'],
  ['easel','風景畫架','活動',.8,'畫下今天最想記住的風景。'],
  ['ferrisWheel','星願摩天輪','遊樂',3.0,'緩緩升高，一起看看整座島。'],
  ['carousel','夢境旋轉木馬','遊樂',2.7,'小馬轉著圈，快樂也回來了。'],
  ['teacups','月光咖啡杯','遊樂',2.5,'坐進小茶杯，讓笑聲轉一圈。'],
  ['miniTrain','小世界觀光列車','遊樂',3.6,'沿著軌道，經過每一個喜歡的角落。'],
  ['skySwing','天空飛椅','遊樂',2.6,'讓風輕輕把心情托起來。'],
  ['slide','彩虹溜滑梯','遊樂',2.0,'從期待滑進一個開心的下午。'],
  ['trampoline','雲朵彈跳床','遊樂',1.6,'踩上軟軟的雲，跳得比煩惱高。'],
  ['balloonDock','熱氣球驛站','遊樂',2.3,'在風裡，寄一封給天空的信。'],
  ['photoBooth','星願拍照亭','遊樂',1.7,'把大家的笑容，好好收進相片。'],
  ['cloudCoaster','雲端迷你軌道','遊樂',3.8,'小車沿著雲端起伏，下一站是驚喜。'],
  ['leaderPalace','星宮瞭望台','建築',2.5,'從小小的星宮，看見更大的世界。'],
  ['leaderMoonLake','月鏡湖','水景',2.3,'讓月色停在自己的花園。'],
  ['leaderStarFountain','星環光泉','水景',2.0,'光與水，繞著心願慢慢流動。'],
  ['leaderWaterfall','星河瀑布','水景',2.5,'讓一條小小星河，流進生活裡。']
];
export const CATALOG = Object.fromEntries(items.map(([id, name, category, radius, description]) => [id, { id, name, category, radius, description, cost: 100 }]));
export const CATEGORIES = ['全部', '自然', '建築', '休憩', '燈飾', '水景', '活動', '遊樂'];
export const NPCS = [
  { id: 'mori', name: '苔米', role: '花園照顧員', color: '#598768', x: -15, z: 8, style: 'moss', greeting: '你來啦。我剛剛發現，這裡的花開得比昨天多了一點。\n一起替島上留個能坐下來的角落，好嗎？', request: '放一張長椅，讓路過的人歇歇腳。', item: 'bench' },
  { id: 'lumi', name: '露朵', role: '星空記錄員', color: '#698bb4', x: 15, z: -9, style: 'star', greeting: '嗨！我在收集這座島每個時刻的光。\n白天的溪水、傍晚的樹影，還有你點亮的第一盞燈。', request: '放一盞庭園燈，晚上一起看星星。', item: 'lantern' },
  { id: 'coco', name: '小陶', role: '島上的木作師', color: '#c18755', x: -7, z: -2, style: 'craft', greeting: '歡迎回來！茶已經泡好了。\n家具放在哪裡都行，重要的是，你看了會不會開心。', request: '替小島擺一張茶桌，邀朋友來坐。', item: 'teaTable',unlock:400 },
  { id: 'fleur', name: '花穗', role: '風裡的音樂家',color:'#bb8d99',x:-19,z:17,style:'music',greeting:'我帶著一首新曲子來了。\n聽說這裡的居民，都願意替彼此留一點時間。',request:'佈置一座音樂台，讓大家聚在一起。',item:'musicStage',unlock:1200 },
  { id: 'atlas', name: '阿嵐', role: '星海旅行家',color:'#8e9cad',x:21,z:3,style:'explorer',greeting:'從海的另一邊，就看得見你們的光。\n這裡長成了一座，讓人想留下來的島。',request:'放一個望遠鏡，看看更遠的風景。',item:'telescope',unlock:1600 }
];
NPCS.find(n=>n.id==='lumi').unlock=800;
export const QUESTS = [
  { id: 'hello', title: '認識一位新朋友', detail: '和島上的居民聊聊天', reward: '晴日花叢 × 1', gift: 'flowerPatch' },
  { id: 'bench', title: '留一個歇腳的地方', detail: '佈置並儲存一張橡木長椅', reward: '草地坐墊 × 1', gift: 'cushion' },
  { id: 'explore', title: '留一片小小花園', detail: '佈置並儲存兩叢晴日花叢', reward: '睡蓮小池 × 1', gift: 'pond' },
  { id: 'lantern', unlock:800, title: '點亮第一個夜晚', detail: '佈置並儲存一盞庭園燈', reward: '晚安星燈 × 1', gift: 'starLamp' },
  { id: 'teaTable', unlock:400, title: '下一次見面的地方', detail: '佈置並儲存一張雙人茶席', reward: '午後野餐 × 1', gift: 'picnic' },
  { id: 'photo', title: '把喜歡的瞬間留下', detail: '拍一張自己的小島照片', reward: '陶盆綠意 × 1', gift: 'planter' },
  { id:'musicStage',title:'把音樂留給大家',detail:'1200 分後為花穗佈置一座音樂台',reward:'森林鞦韆 × 1',gift:'swing',unlock:1200 },
  { id:'telescope',title:'看見更遠的心願',detail:'1600 分後為阿嵐佈置一個望遠鏡',reward:'星河瀑布 × 1',gift:'leaderWaterfall',unlock:1600 }
];
for(const quest of QUESTS)quest.scoreReward=50;
export function totalScore(s){return s.score+(s.rewardScore||0);}
export function awardPoints(s,amount){s.rewardScore??=0;for(const key of ['rewardScore','progressScore','spendablePoints']){if(!Number.isSafeInteger(s[key]+amount))throw Error('分數超過可儲存範圍。');s[key]+=amount;}}
export function islandElevation(score){const progress=Math.min(1,Math.max(0,score)/1600);return {height:-.65+progress*20.5,connected:score>=1600};}
export function chatDay(now=Date.now()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));}
export function chatReady(s,id,now=Date.now()){return availableNpcs(s.progressScore).some(n=>n.id===id)&&s.chats?.[id]!==chatDay(now);}
export function awardChat(s,id,now=Date.now()){if(!chatReady(s,id,now))return false;s.chats??={};s.chats[id]=chatDay(now);awardPoints(s,5);return {npc:id,amount:5};}

export function initialState(group = 3, room = PREVIEW_ROOM) {
  return { schema: 1, room, group, revision: 0, worldName: THEMES[group-1].name, score: 0, rewardScore: 0, progressScore: 0, spendablePoints: 1000, maxMembers: 10, members: {}, inventory: { bench: 1, flowerPatch: 2, lantern: 1 }, placements: {}, met: [], quests: {}, chats: {}, avatar: { name: '旅人', outfit: '#dd9069', hair: '#4d332b', skin: '#f1c6a0', style: 'bob' }, time: 'day', updatedAt: 0 };
}
export function memberAppearance(state,id){const i=Number(id)-1;return {name:`小精靈 ${id}`,outfit:['#b2a07d','#9caf92','#a4a8ba','#cfab94','#8caaa7','#c5b780'][i%6],hair:['#554536','#70554a','#b5916d','#79877c'][i%4],skin:['#f1c6a0','#dfae87','#bd8967'][i%3],style:['bob','bun','crop'][i%3],...(state.members[String(id)]||{})};}
export const LEADERS=[['翁點傳師瑋鍼','#ce9fb0','bun'],['翁點傳師瑋聰','#b5a0bb','bob'],['翁點傳師晟航','#89b8bf','crop'],['林點傳師瑋揚','#8fa5c2','crop'],['蔡講師維宸','#92b49a','crop'],['胡講師定宇','#a29bb8','crop'],['王講師施今','#c5ad83','bun'],['陳小組長怡安','#a6c1af','bob']];
export function leaderState(){const s=initialState(8);s.leader=true;s.worldName='星願神境';s.progressScore=1600;s.maxMembers=8;s.members=Object.fromEntries(LEADERS.map(([name,outfit,style],i)=>[String(i+1),{name,outfit,style,hair:i%2?'#64505a':'#544a47',skin:'#edc6a5'}]));return s;}
export function questReady(s,id,evidence={}){const q=QUESTS.find(q=>q.id===id);if(!q||s.quests[id]||s.progressScore<(q.unlock||0))return false;const has=kind=>Object.values(s.placements).filter(p=>p.itemId===kind).length;if(id==='hello')return s.met.length>0;if(id==='photo')return evidence.photographed===true;if(id==='explore')return has('flowerPatch')>=2;return has(id)>0;}

export function counts(layout) {
  const out = { ...layout.inventory };
  for (const p of Object.values(layout.placements)) out[p.itemId] = (out[p.itemId] || 0) + 1;
  return out;
}
export function sameOwnership(a, b) {
  const ac = counts(a), bc = counts(b);
  return [...new Set([...Object.keys(ac), ...Object.keys(bc)])].every(k => (ac[k] || 0) === (bc[k] || 0));
}
export function validateLayout(layout) {
  if (!layout || !layout.inventory || !layout.placements) throw new Error('佈置資料不完整。');
  if (Object.keys(layout.placements).length > MAX_PLACEMENTS) throw new Error('這座島最多可佈置 128 件家具。');
  for (const [id, amount] of Object.entries(layout.inventory)) if (!CATALOG[id] || !Number.isSafeInteger(amount) || amount < 0) throw new Error('庫存數量不正確。');
  for (const [key,p] of Object.entries(layout.placements)) {
    if(!/^(0|[1-9]\d?)$|^1[01]\d$|^12[0-7]$/.test(key))throw new Error('家具編號不正確。');
    if (!CATALOG[p.itemId] || ![p.x, p.z, p.rot].every(Number.isFinite) || Math.abs(p.x) > 90 || Math.abs(p.z) > 75) throw new Error('家具的位置不正確。');
  }
}
export function validateState(s,group=s?.group,room=PREVIEW_ROOM){validateLayout(s);if(s.schema!==1||s.room!==room||s.group!==group||!Number.isInteger(group)||group<1||group>8)throw new Error('這不是此活動與組別的小島存檔。');for(const k of ['score','progressScore','spendablePoints','revision'])if(!Number.isSafeInteger(s[k])||s[k]<0)throw new Error('本機存檔的數值不正確。');if(!Number.isInteger(s.maxMembers)||s.maxMembers<1||s.maxMembers>30||typeof s.worldName!=='string'||s.worldName.trim().length<1||s.worldName.length>24||!['day','sunset','night'].includes(s.time))throw new Error('小島設定不完整。');if(!Array.isArray(s.met)||s.met.some(id=>!NPCS.some(n=>n.id===id))||!s.quests||Object.entries(s.quests).some(([k,v])=>!QUESTS.some(q=>q.id===k)||v!==true)||!s.members||typeof s.members!=='object')throw new Error('居民記錄不正確。');for(const [id,m]of Object.entries(s.members)){if(!/^(?:[1-9]|[12]\d|30)$/.test(id)||!m||typeof m.name!=='string'||m.name.length>18)throw new Error('小精靈資料不正確。');for(const k of ['skin','outfit','hair'])if(m[k]&&!/^#[0-9a-fA-F]{6}$/.test(m[k]))throw new Error('小精靈配色不正確。');if(m.style&&!['bob','bun','crop'].includes(m.style))throw new Error('小精靈髮型不正確。');}if(s.rewardScore!==undefined&&(!Number.isSafeInteger(s.rewardScore)||s.rewardScore<0))throw Error('獎勵分數不正確。');if(s.chats&&Object.entries(s.chats).some(([id,day])=>!NPCS.some(n=>n.id===id)||!/^\d{4}-\d{2}-\d{2}$/.test(day)))throw Error('聊天紀錄不正確。');return s;}
export class IslandStore {
  constructor(storage, group, readOnly=false) {
    this.storage = storage;
    if(!Number.isInteger(group)||group<1||group>8)throw new Error('組別必須是 1 到 8。');
    this.group = group;
    this.readOnly=readOnly;
    this.key = STORAGE_PREFIX + group;
    this.state = this.read() || initialState(group);
  }
  read() {
    const raw = this.storage.getItem(this.key);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.schema !== 1 || s.room !== PREVIEW_ROOM || s.group !== this.group) throw new Error('本機預覽存檔無法辨識，原始資料已保留。');
    validateState(s,this.group);
    for (const k of ['score', 'progressScore', 'spendablePoints', 'revision']) if (!Number.isSafeInteger(s[k]) || s[k] < 0) throw new Error('本機預覽存檔的數值不正確，原始資料已保留。');
    return s;
  }
  transact(fn) {
    if(this.readOnly)throw new Error('唯讀參觀不能修改小島資料。');
    const current = this.read();
    if (current && current.revision !== this.state.revision) throw new Error('另一個分頁已更新小島。請先匯出目前佈置，再重新整理。');
    const next = clone(this.state);
    fn(next);
    validateState(next,this.group);
    next.revision++;
    next.updatedAt = Date.now();
    this.storage.setItem(this.key, JSON.stringify(next));
    this.state = next;
    return next;
  }
  buy(id) {
    if (!CATALOG[id]) throw new Error('找不到這件家具。');
    return this.transact(s => { if (s.spendablePoints < 100) throw new Error('點數還差一點，先看看收納裡的家具吧。'); s.spendablePoints -= 100; s.inventory[id] = (s.inventory[id] || 0) + 1; });
  }
  addScore(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000) throw new Error('請輸入 1 到 100000 的整數。');
    return this.transact(s => { for(const k of ['score','progressScore','spendablePoints']){if(!Number.isSafeInteger(s[k]+amount))throw new Error('分數超過可儲存範圍。');s[k]+=amount;} });
  }
  saveLayout(layout) {
    validateLayout(layout);
    return this.transact(s => { if (!sameOwnership(s, layout)) throw new Error('家具數量已改變，請重新確認收納。'); s.inventory = clone(layout.inventory); s.placements = clone(layout.placements); });
  }
  meet(id) { if(!availableNpcs(this.state.progressScore).some(n=>n.id===id))throw new Error('這位居民還沒搬來。');return this.transact(s => { if (!s.met.includes(id)) s.met.push(id); }); }
  complete(id,evidence={}) {
    const q = QUESTS.find(q => q.id === id);
    if (!q || !questReady(this.state,id,evidence)) return false;
    this.transact(s => { s.quests[id] = true; s.inventory[q.gift] = (s.inventory[q.gift] || 0) + 1;awardPoints(s,q.scoreReward); });
    return q;
  }
  chat(id,now=Date.now()){if(this.readOnly)throw Error('唯讀參觀不能領取聊天分數。');if(!chatReady(this.state,id,now))return false;let result;this.transact(s=>{result=awardChat(s,id,now);});return result;}
  update(values) { return this.transact(s => { for (const k of ['avatar', 'worldName', 'time', 'members', 'maxMembers']) if (values[k] !== undefined) s[k] = clone(values[k]); }); }
  layout() { return clone({ inventory: this.state.inventory, placements: this.state.placements }); }
}

export class LayoutHistory {
  constructor(layout) { this.present = clone(layout); this.past = []; this.future = []; }
  apply(fn) { const next = clone(this.present); fn(next); validateLayout(next); this.past.push(clone(this.present)); if (this.past.length > 40) this.past.shift(); this.present = next; this.future = []; return next; }
  undo() { if (!this.past.length) return false; this.future.push(clone(this.present)); this.present = this.past.pop(); return this.present; }
  redo() { if (!this.future.length) return false; this.past.push(clone(this.present)); this.present = this.future.pop(); return this.present; }
  rebase(layout) { this.present = clone(layout); this.past = []; this.future = []; }
}
