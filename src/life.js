import {growthFor,QUESTS,CATALOG} from './state.js';

export const LIFE_STAGES=[
  {min:45,max:60,encounter:.12,label:'45～60 秒'},
  {min:35,max:48,encounter:.20,label:'35～48 秒'},
  {min:28,max:38,encounter:.28,label:'28～38 秒'},
  {min:22,max:32,encounter:.36,label:'22～32 秒'},
  {min:16,max:24,encounter:.45,label:'16～24 秒'}
];
export function lifeFor(score){return LIFE_STAGES[growthFor(score).stage];}
export function nextGreeting(score,random=Math.random){const p=lifeFor(score);return p.min+(p.max-p.min)*random();}
const stories={
  mori:['今天替花澆水的時候，遇見了一隻很小的蝴蝶。','不一定要把每個角落填滿。留片草地，也很好看。','我喜歡你們留下的小徑，走著走著就想笑。','我把落葉收在一起，準備替小花做新的被子。'],
  coco:['新的家具聞起來，有一點陽光曬過木頭的味道。','我試坐了島上的椅子。下次想帶一杯熱茶來。','工具收好了，現在是散步的時間。','把喜歡的東西放在一起，就會變成自己的風景。'],
  lumi:['我在溪邊看到一片星星形狀的葉子。','夜裡留一盞燈，遠方的朋友就找得到回來的路。','今天的雲很像一封還沒寄出的信。','你也有想對星空說的話嗎？我會替你記住。'],
  fleur:['剛才的風聲，很適合寫成一段新旋律。','有人在小徑上哼歌，我跟著唱了一小段。','等大家聚在一起，我們來辦一場小小的音樂會吧。','花開的聲音很輕，要慢慢聽才會發現。'],
  atlas:['在海的另一邊，也有人正想著你們。','今天想去新開放的草地，找一個適合看夕陽的位置。','走過許多地方，還是想回到有朋友的小島。','島上每一件新佈置，都像一則旅行的故事。']
};
export function npcDialogue(npc,state,turn=0){
  const lines=[...(stories[npc.id]||[npc.greeting]),
    state.time==='night'?'夜深了，島上的燈光真溫柔。一起慢慢走一會吧。':state.time==='sunset'?'夕陽把小徑染成了蜂蜜色，今天也辛苦了。':'今天很適合在島上走走，你想先佈置哪個角落？',
    growthFor(state.progressScore).stage>0?'新土地開放以後，散步的路也變長了。謝謝你們一起努力。':'這裡剛開始有了生活的樣子。我們慢慢把它變成家。'];
  if(state.quests[npc.item])lines.push(`你送給小島的${CATALOG[npc.item].name}，我每天經過都會想起你們。`);
  return turn===0?npc.greeting:lines[(turn-1)%lines.length];
}
export function npcRequest(npc,state){
  const quest=QUESTS.find(q=>q.id===npc.item),done=state.quests[npc.item];
  return done?'小心願已完成，禮物與 50 獎勵分數都已領取。':`${npc.request}\n佈置並儲存後，小禮物是「${quest?.reward||'家具'}」，並獲得 50 獎勵分數。`;
}
export function ambientLine(npc,state,turn=0){return npcDialogue(npc,state,turn+1).split('。')[0]+'。';}
