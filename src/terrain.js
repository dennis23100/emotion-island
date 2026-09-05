export const ZONES = [
  { id:'home',name:'溪光小徑',subtitle:'小木屋與回家的路',x:-8,z:0,zoom:1.35 },
  { id:'garden',name:'晴日花園',subtitle:'花香、樹蔭和一點慢生活',x:-18,z:8,zoom:1.6 },
  { id:'cove',name:'月光溪灣',subtitle:'沿著水聲，走到另一邊',x:16,z:6,zoom:1.45 },
  { id:'stars',name:'風信高地',subtitle:'把視線交給更遠的地方',x:11,z:-13,zoom:1.45 },
  { id:'wish',name:'心願之森',subtitle:'讓心事在枝葉間休息',x:-12,z:-15,zoom:1.4 },
  { id:'market',name:'風信市集',subtitle:'麵包、選物與街角咖啡',x:-33,z:1,zoom:1.25 },
  { id:'orchard',name:'森野莊園',subtitle:'玻璃溫室與果樹田園',x:-30,z:25,zoom:1.1 },
  { id:'arts',name:'花野藝文街',subtitle:'書屋、畫室與戶外樂台',x:28,z:22,zoom:1.05 },
  { id:'ridge',name:'雲端觀測所',subtitle:'沿著山徑，抵達更遠的風景',x:27,z:-28,zoom:1.05 },
  { id:'all',name:'看看整座島',subtitle:'每條路，都能慢慢走',x:0,z:0,zoom:.8 }
];
export const PATHS = [
  [[-13,21],[-10,16],[-5,10],[-5,3],[-9,-4],[-9,-9],[-3,-12],[5,-13],[14,-12],[20,-7]],
  [[-5,3],[0,7],[6,10],[11,10],[17,10],[21,5]],
  [[-5,8],[-11,6],[-17,7],[-22,12]],
  [[-10,-7],[-14,-11],[-13,-17]]
];
export const ISLAND_RADIUS_X=54,ISLAND_RADIUS_Z=42;
export function outline(a,scale=1){const r=1+.055*Math.sin(a*3+.4)+.035*Math.cos(a*5-1)+.018*Math.sin(a*9);return {x:Math.cos(a)*ISLAND_RADIUS_X*r*scale,z:Math.sin(a)*ISLAND_RADIUS_Z*r*scale};}
export const EXPANSIONS=[{score:400,x:52,z:8,rx:30,rz:24,name:'東岸新草坪'},{score:800,x:-51,z:4,rx:30,rz:24,name:'西邊花園地'},{score:1200,x:4,z:-40,rx:34,rz:26,name:'後山觀星地'},{score:1600,x:-2,z:39,rx:34,rz:26,name:'南岸慶典地'}];
export function grownOutline(a,scale=1,score=0){const p=outline(a);let t=1;for(const e of EXPANSIONS){if(score<e.score)continue;const A=(p.x/e.rx)**2+(p.z/e.rz)**2,B=-2*(p.x*e.x/e.rx**2+p.z*e.z/e.rz**2),C=(e.x/e.rx)**2+(e.z/e.rz)**2-1,D=B*B-4*A*C;if(D<0)continue;const start=(-B-Math.sqrt(D))/(2*A),end=(-B+Math.sqrt(D))/(2*A);if(start<=t+.1&&end>t)t=end;}return {x:p.x*t*scale,z:p.z*t*scale};}
export function islandContains(x,z,margin=0,score=0){const a=Math.atan2(z/ISLAND_RADIUS_Z,x/ISLAND_RADIUS_X),o=grownOutline(a,1,score);return (Math.hypot(x/ISLAND_RADIUS_X,z/ISLAND_RADIUS_Z)+margin/46)<Math.hypot(o.x/ISLAND_RADIUS_X,o.z/ISLAND_RADIUS_Z);}
export const riverX = z => 10.2+Math.sin((z+3)*.18)*2.2;
export function isWater(x,z){return Math.pow((x-13)/5.6,2)+Math.pow((z+1)/7.1,2)<1 || (z>-22 && Math.abs(x-riverX(z))<1.43);}
export const BRIDGES=[{x0:7.1,x1:16.2,z:10,width:2.28},{x0:4.5,x1:13.7,z:29,width:2.8}];
export function onBridge(x,z){return BRIDGES.some(b=>x>b.x0&&x<b.x1&&Math.abs(z-b.z)<b.width/2);}
export function groundHeight(x,z){return 3.4+Math.exp(-((x+10)**2/120+(z+16)**2/32))*2.15+Math.exp(-((x-15)**2/110+(z+15)**2/55))*1.8+.06*Math.sin(x*.41)*Math.sin(z*.32);}
export function terrainHeight(x,z){
  const bridge=BRIDGES.find(b=>x>b.x0&&x<b.x1&&Math.abs(z-b.z)<b.width/2);
  if(bridge)return 3.55+Math.sin((x-bridge.x0)/(bridge.x1-bridge.x0)*Math.PI)*.22;
  if(isWater(x,z))return 1.4;
  return groundHeight(x,z);
}
export function isWalkable(x,z,blockers=[],radius=.35,score=0){
  if(!islandContains(x,z,radius+1.25,score) || (isWater(x,z)&&!onBridge(x,z)))return false;
  return !blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+radius);
}
export function canPlace(x,z,r,blockers=[],placements={},ignore=null,score=0){
  if(!Number.isFinite(x)||!Number.isFinite(z)||!islandContains(x,z,r+1.5,score))return {ok:false,reason:'離岸邊太近了，再往草地裡一點。'};
  if(isWater(x,z)||onBridge(x,z))return {ok:false,reason:'把水面與橋留給散步吧。'};
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;if(isWater(xx,zz)||onBridge(xx,zz))return {ok:false,reason:'把水面與橋留給散步吧。'};if(Math.abs(terrainHeight(xx,zz)-terrainHeight(x,z))>.58)return {ok:false,reason:'這裡坡度有點大，找塊平坦的草地吧。'};}
  if(blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+r+.12))return {ok:false,reason:'碰到樹木或建築了，稍微挪開一點。'};
  for(const [key,p] of Object.entries(placements))if(key!==ignore&&Math.hypot(x-p.x,z-p.z)<r+p.radius+.12)return {ok:false,reason:'家具靠得太近了，留點空間。'};
  return {ok:true,reason:'這裡很適合，隨時可以放下。'};
}
export function findPath(start,end,blockers=[],score=0){
  const STEP=1,encode=(x,z)=>`${x},${z}`,sx=Math.round(start.x),sz=Math.round(start.z),ex=Math.round(end.x),ez=Math.round(end.z);
  if(!isWalkable(end.x,end.z,blockers,.35,score))return [];
  const key=encode(sx,sz),open=[{x:sx,z:sz,g:0,f:Math.hypot(ex-sx,ez-sz),key}],best=new Map([[key,0]]),came=new Map(),closed=new Set();
  const walkCache=new Map(),walk=(x,z)=>{const key=encode(x,z);if(!walkCache.has(key))walkCache.set(key,isWalkable(x,z,blockers,.35,score));return walkCache.get(key);};
  const push=node=>{open.push(node);let i=open.length-1;while(i>0){const p=(i-1)>>1;if(open[p].f<=node.f)break;open[i]=open[p];i=p;}open[i]=node;};
  const pop=()=>{const first=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let c=i*2+1;if(c+1<open.length&&open[c+1].f<open[c].f)c++;if(last.f<=open[c].f)break;open[i]=open[c];i=c;}open[i]=last;}return first;};
  let final=null;
  for(let n=0;open.length&&n<7000;n++){
    const c=pop();if(closed.has(c.key))continue;closed.add(c.key);
    if(Math.hypot(c.x-end.x,c.z-end.z)<1.05){final=c;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const x=c.x+dx*STEP,z=c.z+dz*STEP,k=encode(x,z);if(closed.has(k)||!walk(x,z))continue;
      if(dx&&dz&&(!walk(c.x+dx,c.z)||!walk(c.x,c.z+dz)))continue;
      const g=c.g+Math.hypot(dx,dz);if(g>=(best.get(k)??Infinity))continue;
      best.set(k,g);came.set(k,c);push({x,z,g,f:g+Math.hypot(end.x-x,end.z-z),key:k});
    }
  }
  if(!final)return [];
  const route=[{x:end.x,z:end.z}];let c=final;while(c.key!==key){route.push({x:c.x,z:c.z});c=came.get(c.key);if(!c)break;}
  return route.reverse();
}
