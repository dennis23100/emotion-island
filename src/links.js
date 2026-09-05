import {sessionConfig,pageHref} from './session.js';
import {THEMES,parsePreviewRoom} from './state.js';
import {icon} from './icons.js';
const $=id=>document.getElementById(id),labels=['第一組','第二組','第三組','第四組','第五組','第六組','第七組','第八組'];let mode='edit',links={},timer,config;
const url=(file,params)=>{const u=new URL(file,location.href);for(const [k,v]of Object.entries(params))u.searchParams.set(k,v);return u.href;};
function render(){
  const full=(file,group=null,view=false)=>new URL(pageHref(config,file,group,view),location.href).href;links={main:full('emotion_island.html'),gallery:full('emotion_gallery.html',null,true),leader:full('emotion_leader_world.html')};
  for(const k of ['main','gallery','leader']){$(k+'Url').textContent=links[k];$(k+'Open').href=links[k];}
  $('mainMeta').textContent='房號 '+config.room;$('hint').textContent=config.cloud?'主畫面與八組共用活動資料；各組分數和佈置會自動同步。':'本機測試房間 2027，資料只存在目前瀏覽器。';
  $('groupNote').textContent=mode==='edit'?'每組只進入自己的小世界，可加分與佈置':'八組皆為唯讀，可以欣賞與拍照';
  $('grid').innerHTML=THEMES.map((t,i)=>{const code=/^\d{4}$/.test(config.room)?config.room+String(t.id).padStart(2,'0'):config.room+' · '+t.id;links[t.id]=full('emotion_my_world.html',t.id,mode==='view');return `<article class="card"><div class="top"><span class="dot" style="color:${t.color};background:${t.color}"></span><span class="nm">${labels[i]} · ${t.name}</span><span class="meta">房號 ${code}</span></div><div class="url">${links[t.id]}</div><div class="row"><button class="btn" data-copy="${t.id}" aria-label="複製${labels[i]}${mode==='view'?'唯讀':'編輯'}連結">複製連結</button><a class="btn" href="${links[t.id]}" target="_blank" rel="noopener" aria-label="開啟${labels[i]}${mode==='view'?'唯讀小世界':'編輯小世界'}">開啟</a></div></article>`;}).join('');
  $('textOut').value=['情緒不孤島 · '+config.room+' '+(mode==='view'?'唯讀參觀':'各組編輯'),'共感大世界：'+links.main,'群島參觀：'+links.gallery,'主領班 · 星願神境：'+links.leader,...THEMES.map((t,i)=>labels[i]+' · '+t.name+'：'+links[t.id])].join('\n\n');
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copy(links[b.dataset.copy],b));
}
async function copy(value,button){try{await navigator.clipboard.writeText(value);if(button){const old=button.textContent;button.textContent='已複製';button.classList.add('ok');setTimeout(()=>{button.textContent=old;button.classList.remove('ok');},1700);}status('連結已複製。');}catch{$('textOut').classList.remove('hidden');$('textOut').focus();$('textOut').select();status('已展開清單，可以選取後複製。');}}
function status(text){clearTimeout(timer);$('copyStatus').textContent=text;timer=setTimeout(()=>$('copyStatus').textContent='',3200);}
try{config=sessionConfig(location.search,location.hostname);$('room').value=config.room;$('room').readOnly=!config.cloud;render();}catch(e){$('hint').textContent=e.message;$('grid').replaceChildren();}
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(c=>{c.classList.toggle('on',c===b);c.setAttribute('aria-pressed',String(c===b));});render();};
$('copyAll').onclick=()=>copy($('textOut').value,$('copyAll'));$('toggleText').onclick=()=>{const showing=$('textOut').classList.toggle('hidden');$('toggleText').textContent=showing?'顯示純文字清單':'收起純文字清單';};
if(location.protocol==='file:'){$('fileWarn').classList.remove('hidden');$('fileWarn').textContent='請先執行「開啟本機預覽.ps1」，再透過本機網址開啟。';}
const bgm=new Audio('assets/island-music.mp3');bgm.loop=true;bgm.volume=.18;$('linkMusic').innerHTML=icon('sound-off');$('linkMusic').onclick=async()=>{try{if(bgm.paused){await bgm.play();$('linkMusic').innerHTML=icon('sound');$('linkMusic').setAttribute('aria-label','關閉島嶼音樂');}else{bgm.pause();$('linkMusic').innerHTML=icon('sound-off');$('linkMusic').setAttribute('aria-label','開啟島嶼音樂');}}catch{status('音樂暫時無法播放。');}};

$('room').addEventListener('change',()=>{try{const q=new URLSearchParams(location.search);q.set('room',$('room').value.trim());config=sessionConfig('?'+q,location.hostname);render();}catch(e){$('hint').textContent=e.message;}});
