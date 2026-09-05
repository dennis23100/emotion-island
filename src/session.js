import {parsePreviewRoom} from './state.js';

export function sessionConfig(search='',hostname='') {
  const q=new URLSearchParams(search),local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname);
  if(local&&q.get('cloud')!=='1')return {...parsePreviewRoom(search),cloud:false};
  const raw=q.get('room')||'2026';
  if(!/^[A-Za-z0-9_-]{1,80}$/.test(raw))throw Error('活動房號只能包含英數字、底線與連字號。');
  const decoded=raw.match(/^(\d{4})(0[1-8])$/),room=decoded?decoded[1]:raw;
  const group=Number(q.get('group')||(decoded?decoded[2]:1));
  if(!Number.isInteger(group)||group<1||group>8)throw Error('組別必須是 1 到 8。');
  if(local&&room!=='2027')throw Error('本機雲端測試只開放 2027 房間。');
  return {room,group,cloud:true,gallery:q.get('mode')==='gallery',leader:q.get('scene')==='leader',viewer:q.get('view')==='1'||q.get('mode')==='gallery'||q.get('scene')==='leader',cloudTest:local};
}
export function pageHref(config,file,group=null,viewer=false) {
  const q=new URLSearchParams({room:config.room});
  if(group!==null){if(/^\d{4}$/.test(config.room))q.set('room',config.room+String(group).padStart(2,'0'));else q.set('group',group);}
  if(viewer){q.set('view','1');q.set('mode','gallery');}
  if(config.cloudTest)q.set('cloud','1');
  if(config.trip)q.set('trip',config.trip);
  return file+'?'+q.toString();
}

// A visit inherits edit access only from an editing entrance in this tab.
// Opening a plain read-only link never retrieves a previous editing scope.
export function visitScope(config,storage,search='',allowEntry=true,token=()=>crypto.randomUUID()) {
  const trip=new URLSearchParams(search).get('trip'),key='emotion-island:visit-scope';
  let saved;try{saved=JSON.parse(storage.getItem(key)||'null');}catch{}
  if(trip&&saved?.trip===trip&&saved.room===config.room)return {...config,trip,ownerGroup:saved.ownerGroup};
  if(allowEntry&&!config.viewer){
    const value={trip:token(),room:config.room,ownerGroup:config.group};
    try{storage.setItem(key,JSON.stringify(value));return {...config,...value};}catch{}
  }
  return {...config,ownerGroup:null,trip:null};
}
export function islandHref(config,group){return pageHref(config,'emotion_my_world.html',group,config.ownerGroup!==group);}
