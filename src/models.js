import * as THREE from '../vendor/three.module.js';
import {extraDecor} from './extra-models.js';

export { THREE };
const materialCache = new Map();
const sharedMaterials=new WeakSet();
export function mat(color, roughness = .83, metalness = 0) {
  const key = `${color}:${roughness}:${metalness}`;
  if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color: new THREE.Color(color).convertSRGBToLinear(), roughness, metalness }));
  const material=materialCache.get(key);sharedMaterials.add(material);return material;
}
const lightweight=typeof matchMedia!=='undefined'&&matchMedia('(pointer:coarse)').matches;
const sphereGeo = new THREE.SphereGeometry(1, lightweight?14:20, lightweight?10:14);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, lightweight?12:16);
const coneGeo = new THREE.ConeGeometry(1, 1, lightweight?16:24);
const roundGeo = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
const pos = roundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const v = new THREE.Vector3().fromBufferAttribute(pos, i);
  const inner = v.clone().clampScalar(-.42, .42);
  v.sub(inner).normalize().multiplyScalar(.08).add(inner);
  pos.setXYZ(i, v.x, v.y, v.z);
}
roundGeo.computeVertexNormals();
export const colors = { wood: '#a57249', darkWood: '#694d39', lightWood: '#d5b479', leaf: '#629b52', leafLight: '#9cc071', cream: '#f4e7c4', roof: '#4c8b7d', stone: '#999787', white: '#fff5db', terracotta: '#c38061' };
export function mesh(parent, geo, material, x=0,y=0,z=0, sx=1,sy=1,sz=1) {
  const m = new THREE.Mesh(geo, typeof material === 'string' ? mat(material) : material);
  m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; m.receiveShadow=true;m.userData.ownsGeometry=![sphereGeo,cylinderGeo,coneGeo,roundGeo].includes(geo);m.userData.ownsMaterial=!sharedMaterials.has(m.material); parent.add(m); return m;
}
export const ball = (p,c,x,y,z,sx=1,sy=sx,sz=sx) => mesh(p,sphereGeo,c,x,y,z,sx,sy,sz);
export const box = (p,c,x,y,z,sx=1,sy=1,sz=1) => mesh(p,roundGeo,c,x,y,z,sx,sy,sz);
export const cylinder = (p,c,x,y,z,r=.2,h=1) => mesh(p,cylinderGeo,c,x,y,z,r,h,r);
export function link(p,a,b,r,c) {
  const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);
  const o=cylinder(p,c,...va.clone().add(vb).multiplyScalar(.5).toArray(),r,d.length());
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return o;
}
export function curve(p,points,r,c) {
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a))),Math.max(12,points.length*5),r,6,false);
  return mesh(p,g,typeof c==='string'?mat(c):c);
}
export function leaf(p,c,x,y,z,size=1,angle=0) {
  const o=ball(p,c,x,y,z,.19*size,.06*size,.42*size);o.rotation.y=angle;o.rotation.z=.25;return o;
}
function torus(p,c,x,y,z,r,t=.04,rx=0) { const m=mesh(p,new THREE.TorusGeometry(r,t,8,32),c,x,y,z);m.rotation.x=rx;return m; }
export function seeded(seed=7) { return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}; }

export function makeTree(style='oak',seed=1) {
  const g=new THREE.Group(),rng=seeded(seed);
  const trunk=style==='cherry'?'#916a59':colors.darkWood;
  cylinder(g,trunk,0,1.8,0,.22,3.6);
  for(let i=0;i<4;i++){const a=i*Math.PI*.5+.3;link(g,[Math.cos(a)*.5,.03,Math.sin(a)*.5],[0,.8,0],.12,trunk);link(g,[0,2.1,0],[Math.cos(a)*1.1,3.6,Math.sin(a)*1.1],.12,trunk);}
  const palette=style==='cherry'?['#df9cb0','#f0b4bd','#e9a4b6','#f3c1c5']:['#6e9f58','#8cb365','#598951','#9eba6e','#789f51'];
  for(let layer=0;layer<3;layer++){
    const n=layer===2?3:6,r=layer===0?1.16:layer===1?.89:.45;
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+layer*.7,s=.82+rng()*.28;ball(g,palette[(i+layer)%palette.length],Math.cos(a)*r,3.05+layer*.7+rng()*.15,Math.sin(a)*r,s,s*.81,s*.97);}
  }
  if(style==='wish'){
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const x=Math.cos(a)*1.45,z=Math.sin(a)*1.45;link(g,[x,3.0,z],[x,2.25,z],.013,'#d7be81');const card=box(g,['#eac778','#f0ddd0','#d1e3c4'][i%3],x,2.2,z,.18,.29,.035);card.rotation.y=a;}
  }
  return g;
}
export function makePine() {
  const g=new THREE.Group();cylinder(g,colors.darkWood,0,1.8,0,.2,3.6);
  for(let i=0;i<4;i++){const m=mesh(g,coneGeo,mat(['#4c8060','#588b62','#6c9d69','#8caf72'][i]),0,1.8+i*.85,0,1.7-i*.29,2.15-i*.12,1.7-i*.29);m.rotation.y=i*.65;}
  return g;
}
export function flower(p,x,z,c='#f3cb67',scale=1) {
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);p.add(g);
  cylinder(g,'#678852',0,.25,0,.022,.5);leaf(g,'#77a45d',.09,.18,0,.55,-1);leaf(g,'#88ad68',-.08,.28,0,.5,1);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const petal=ball(g,c,Math.sin(a)*.105,.49+Math.cos(a)*.1,.015,.084,.13,.045);petal.rotation.z=-a;}
  ball(g,'#be8f3f',0,.49,.065,.065,.065,.035);g.rotation.y=Math.sin(x*17+z*3)*3;return g;
}
export function makeFlowers() {const g=new THREE.Group();for(let i=0;i<7;i++)flower(g,Math.sin(i*2.4)*.57,Math.cos(i*2.4)*.44,i%3?'#fff0bd':'#e9b85c',.7+(i%3)*.16);return g;}
export function makeShrub() {const g=new THREE.Group();for(let i=0;i<5;i++)ball(g,['#779e58','#92b366','#a6c379'][i%3],Math.sin(i*2.4)*.35,.32+(i%2)*.12,Math.cos(i*2.4)*.32,.5,.44,.44);return g;}
function pot(p,x=0,y=0,z=0,size=.5){const o=cylinder(p,colors.terracotta,x,y+size*.6,z,size*.58,size);o.scale.x*=.92;o.scale.z*=.92;torus(p,'#d79975',x,y+size*1.1,z,size*.54,.05,-Math.PI/2);cylinder(p,'#665343',x,y+size*1.04,z,size*.49,.035);return o;}
function windowFrame(g,x,y,z,w=1,h=1.1){box(g,'#40594c',x,y,z,w+.15,h+.14,.12);box(g,'#a7c5bb',x,y,z+.09,w,h,.05);box(g,colors.cream,x,y,z+.15,w+.22,.08,.1);box(g,colors.cream,x,y,z+.15,.07,h+.2,.1);box(g,colors.lightWood,x,y-h*.5-.07,z+.12,w+.3,.12,.25);for(const side of [-1,1]){box(g,colors.roof,x+side*(w*.5+.17),y,z,.2,h+.1,.13);for(let j=0;j<5;j++)box(g,'#649d89',x+side*(w*.5+.17),y-h*.4+j*h*.2,z+.08,.18,.04,.025);}}
export function makeCottage(variant='home') {
  const g=new THREE.Group();const roof=variant.startsWith('#')?variant:variant==='shop'?'#bf8561':variant==='star'?'#748398':colors.roof;
  box(g,'#aaa697',0,.15,0,4.4,.3,3.9);box(g,colors.cream,0,1.57,0,4.0,2.7,3.5);
  const sh=new THREE.Shape();sh.moveTo(-2,0);sh.lineTo(2,0);sh.lineTo(0,1.55);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:3.5,bevelEnabled:false});mesh(g,geo,mat(colors.cream),0,2.92,-1.75);
  for(const side of [-1,1]){const r=box(g,roof,side*1.12,3.76,0,2.72,.18,4.18);r.rotation.z=-side*.63;for(let row=0;row<5;row++)for(let col=0;col<9;col++){const x=side*(.13+row*.47),y=4.48-row*.34;const tile=box(g,row%2===0?roof:variant==='home'?'#609a87':roof,x,y,-1.92+col*.48, .61,.085,.5);tile.rotation.z=-side*.63;}}
  for(const x of [-1.92,1.92])box(g,colors.wood,x,1.6,1.82,.18,2.76,.17);
  box(g,colors.wood,0,.47,1.78,4,.17,.11);box(g,colors.wood,0,2.73,1.8,4,.17,.13);
  box(g,'#78563d',.58,1.17,1.81,1.03,2.05,.16);box(g,'#b58a54',.58,1.16,1.91,.91,1.97,.08);
  for(let i=0;i<5;i++)box(g,'#a37847',.21+i*.18,1.16,1.96,.018,1.86,.012);
  ball(g,'#dab45f',.86,1.16,2.01,.055);windowFrame(g,-1.02,1.78,1.83,.92,1.0);
  const circular=cylinder(g,colors.wood,0,3.43,1.82,.32,.1);circular.rotation.x=Math.PI/2;
  const glass=cylinder(g,'#b5d1c2',0,3.43,1.9,.25,.06);glass.rotation.x=Math.PI/2;
  box(g,colors.cream,0,3.43,1.95,.5,.04,.04);box(g,colors.cream,0,3.43,1.95,.04,.5,.04);
  for(let i=0;i<3;i++)box(g,['#bcac8c','#cfbd9c'][i%2],.58,.1+i*.1,2.43-i*.18,1.65,.19,.7);
  box(g,'#937a63',-1.1,4.0,-.55,.55,1.62,.64);box(g,'#aa9380',-1.1,4.78,-.55,.68,.14,.77);box(g,'#675e55',-1.1,4.86,-.55,.46,.04,.54);
  pot(g,-1.08,.8,2.0,.34);for(let i=0;i<3;i++)flower(g,-1.08+(i-1)*.13,2.03,'#dba280',.7).position.y=.96;
  pot(g,1.53,.29,2.04,.6);for(let i=0;i<5;i++)leaf(g,'#729364',1.5+Math.sin(i)*.25,1.13,2.04+Math.cos(i)*.18,1.25,i);
  // The side window makes orbiting the house as useful as looking at its front.
  const sideWindow=new THREE.Group();windowFrame(sideWindow,0,1.7,0,1.15,1.0);sideWindow.position.set(2.07,0,-.25);sideWindow.rotation.y=Math.PI/2;g.add(sideWindow);
  return g;
}
function makeBench() {
  const g=new THREE.Group();for(const x of [-.86,.86]){box(g,'#536b55',x,.4,0,.14,.8,.8);box(g,'#536b55',x,.94,-.42,.14,1.25,.14);box(g,colors.wood,x,.98,.1,.12,.11,.8);}
  for(let i=0;i<4;i++)box(g,i%2?colors.wood:colors.lightWood,0,.73,-.32+i*.2,2.05,.12,.17);
  for(let i=0;i<3;i++)box(g,i%2?colors.wood:colors.lightWood,0,1.06+i*.22,-.41,2.08,.18,.12);
  g.userData.seats=[[-.5,.82,.04],[.5,.82,.04]];return g;
}
function makeLantern() {
  const g=new THREE.Group();cylinder(g,'#526b59',0,.09,0,.34,.18);cylinder(g,'#5e7761',0,.83,0,.09,1.55);
  box(g,'#58715b',0,1.49,0,.52,.09,.52);const glow=new THREE.MeshStandardMaterial({color:new THREE.Color('#f5cf81').convertSRGBToLinear(),emissive:new THREE.Color('#f6b85c').convertSRGBToLinear(),emissiveIntensity:.35,roughness:.6});
  box(g,glow,0,1.82,0,.38,.54,.38);for(const x of [-.22,.22])for(const z of [-.22,.22])box(g,'#57715b',x,1.82,z,.045,.63,.045);
  mesh(g,coneGeo,mat('#5c8067'),0,2.22,0,.43,.35,.43);ball(g,'#d6b965',0,2.43,0,.085);g.userData.glow=true;return g;
}
function makeTea() {
  const g=new THREE.Group();cylinder(g,colors.wood,0,.92,0,.66,.13);cylinder(g,colors.darkWood,0,.45,0,.11,.9);link(g,[-.47,.1,0],[.47,.1,0],.075,colors.darkWood);link(g,[0,.1,-.47],[0,.1,.47],.075,colors.darkWood);
  for(const x of [-1.02,1.02]){cylinder(g,colors.wood,x,.48,0,.39,.12);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;link(g,[x+Math.cos(a)*.22,.43,Math.sin(a)*.22],[x+Math.cos(a)*.28,.05,Math.sin(a)*.28],.047,colors.darkWood);}ball(g,'#9fae7f',x,.56,0,.33,.07,.33);}
  for(const x of [-.33,.33]){cylinder(g,'#f1deb6',x,1.08,.05,.105,.17);cylinder(g,'#7b5742',x,1.176,.05,.076,.012);torus(g,'#f1deb6',x+.1,1.1,.05,.058,.022);}
  ball(g,'#b5c8a4',0,1.12,-.28,.15,.16,.15);g.userData.seats=[[-1.02,.61,0],[1.02,.61,0]];return g;
}
function makePicnic() {
  const g=new THREE.Group();box(g,'#edc39e',0,.03,0,2.5,.06,2);
  for(let x=0;x<6;x++)for(let z=0;z<5;z++)if((x+z)%2===0)box(g,'#f7e5bd',-1.035+x*.414,.066,-.8+z*.399,.413,.013,.398);
  box(g,'#ae804c',.68,.29,-.55,.59,.48,.48);for(let i=0;i<5;i++)box(g,'#d2a76d',.42+i*.13,.33,-.55,.04,.41,.5);curve(g,[[.4,.45,-.55],[.45,.8,-.55],[.9,.8,-.55],[.98,.45,-.55]],.04,colors.wood);
  const bread=ball(g,'#d5a055',.3,.12,.32,.37,.11,.18);bread.rotation.y=.35;for(let i=0;i<3;i++)box(g,'#f3d8a0',.11+i*.15,.216,.32,.045,.016,.18).rotation.y=.35;
  cylinder(g,'#f4e5ce',-.58,.1,-.14,.29,.05);ball(g,'#bf8060',-.6,.17,-.16,.13,.1,.13);
  for(const x of [-.7,.73])ball(g,['#d69377','#98aa78'][x<0?0:1],x,.17,.71,.37,.14,.28);
  return g;
}
function makeSwing() {const g=new THREE.Group();for(const x of [-1.08,1.08])for(const z of [-.58,.58])link(g,[x*1.16,0,z],[x,2.5,0],.095,colors.wood);link(g,[-1.35,2.52,0],[1.35,2.52,0],.13,colors.darkWood);const seat=new THREE.Group();seat.position.y=2.44;g.add(seat);for(const x of [-.53,.53])link(seat,[x,0,0],[x,-1.75,0],.022,'#c1ad83');box(seat,colors.lightWood,0,-1.74,0,1.34,.12,.58);g.userData.swing=seat;g.userData.seats=[[0,.78,0]];return g;}
function makePond(){const g=new THREE.Group();cylinder(g,'#8f9984',0,.12,0,1.52,.23);const m=cylinder(g,'#64afb0',0,.253,0,1.35,.025);m.material=mat('#64afb0',.24);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;ball(g,i%2?'#a5a997':'#b6b7a3',Math.cos(a)*1.4,.25,Math.sin(a)*1.4,.23,.14,.21);}for(let i=0;i<3;i++){const a=i*2.4;const p=cylinder(g,'#86a766',Math.sin(a)*.65,.3,Math.cos(a)*.65,.25,.025);p.scale.z=.8;if(i===1){for(let j=0;j<5;j++){const b=j/5*Math.PI*2;ball(g,'#e6b6c0',Math.sin(a)*.65+Math.sin(b)*.08,.36,Math.cos(a)*.65+Math.cos(b)*.08,.07,.08,.06);}}}return g;}
function makeCampfire(){const g=new THREE.Group();for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ball(g,i%2?'#939080':'#b2a491',Math.cos(a)*.68,.14,Math.sin(a)*.68,.2,.16,.18);}for(let i=0;i<4;i++){const a=i/4*Math.PI;link(g,[-Math.cos(a)*.47,.18,-Math.sin(a)*.47],[Math.cos(a)*.47,.2,Math.sin(a)*.47],.1,colors.darkWood);}for(let i=0;i<4;i++){const flame=ball(g,new THREE.MeshStandardMaterial({color:'#f1b954',emissive:'#dd7139',emissiveIntensity:.8,roughness:1}),Math.sin(i*4)*.16,.48+Math.cos(i)*.1,Math.cos(i*4)*.16,.16,.4,.16);g.userData.flames=(g.userData.flames||[]).concat(flame);}return g;}
function makeTent(){const g=new THREE.Group();const sh=new THREE.Shape();sh.moveTo(-1.4,0);sh.lineTo(0,2.0);sh.lineTo(1.4,0);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:2.7,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.04});mesh(g,geo,mat('#d7b777'),0,.02,-1.4);mesh(g,new THREE.ShapeGeometry(sh),mat('#665c46'),0,.03,1.35,.82,.9,1);for(const side of [-1,1]){link(g,[side*1.5,.05,1.43],[0,2.16,1.43],.047,colors.wood);link(g,[side*1.65,.03,-1.5],[side*.55,1.35,-1.4],.013,'#e9dfc2');}box(g,'#98a78a',0,.05,.82,1.9,.05,.6);const lantern=makeLantern();lantern.scale.setScalar(.4);lantern.position.set(-1.4,0,1.1);g.add(lantern);return g;}
function makeArch(){const g=new THREE.Group();for(const x of [-1.1,1.1]){box(g,colors.wood,x,1.25,0,.16,2.5,.18);box(g,colors.lightWood,x,2.2,0,.4,.08,.32);}curve(g,[[-1.1,2.1,0],[-1.03,2.8,0],[0,3.2,0],[1.03,2.8,0],[1.1,2.1,0]],.12,colors.wood);for(let i=0;i<12;i++){const a=i/11*Math.PI;const x=Math.cos(a)*1.17,y=2.1+Math.sin(a)*1.02;ball(g,i%2?'#9bad72':'#72955e',x,y,0,.3,.22,.3);if(i%2)ball(g,'#ddb0c1',x+.08,y+.04,.22,.14,.13,.13);}return g;}
function makeTelescope(){const g=new THREE.Group();for(let i=0;i<3;i++){const a=i/3*Math.PI*2;link(g,[Math.sin(a)*.55,.04,Math.cos(a)*.55],[0,1.12,0],.045,colors.wood);}ball(g,'#a7956e',0,1.22,0,.16);const scope=new THREE.Group();scope.position.y=1.37;scope.rotation.x=.97;g.add(scope);cylinder(scope,'#c2b080',0,.15,0,.19,1.2);cylinder(scope,'#756f62',0,.77,0,.23,.14);cylinder(scope,'#527b8c',0,.85,0,.185,.035);cylinder(scope,'#645f51',0,-.51,0,.1,.18);return g;}
function makeFountain(){const g=new THREE.Group();cylinder(g,'#b8b6a0',0,.15,0,1.02,.3);cylinder(g,'#91bebb',0,.316,0,.89,.03);cylinder(g,'#b9b49d',0,.6,0,.25,.88);const bowl=ball(g,'#c8c5ae',0,1.04,0,.62,.19,.62);cylinder(g,'#8bbabd',0,1.21,0,.51,.012);ball(g,'#d5c7a2',0,1.39,0,.17,.18,.21);ball(g,'#c6b58b',0,1.57,.09,.12);mesh(g,coneGeo,mat('#ad9254'),0,1.55,.25,.045,.15,.045).rotation.x=Math.PI/2;for(let i=0;i<4;i++){const a=i/4*Math.PI*2;curve(g,[[Math.sin(a)*.32,1.2,Math.cos(a)*.32],[Math.sin(a)*.72,1.14,Math.cos(a)*.72],[Math.sin(a)*.72,.36,Math.cos(a)*.72]],.025,'#a1ced0');}return g;}
function makeSign(){const g=new THREE.Group();cylinder(g,colors.darkWood,0,.62,0,.065,1.25);box(g,colors.lightWood,0,1.18,0,.9,.38,.13);box(g,'#f4e6c2',0,1.19,.079,.45,.055,.013);link(g,[.12,1.29,.09],[.23,1.19,.09],.018,'#f4e6c2');link(g,[.12,1.09,.09],[.23,1.19,.09],.018,'#f4e6c2');return g;}
function makeMailbox(){const g=new THREE.Group();box(g,colors.darkWood,0,.62,0,.13,1.24,.13);box(g,'#719385',0,1.23,0,.57,.43,.7);ball(g,'#719385',0,1.47,0,.285,.23,.35);box(g,'#354f45',0,1.31,.36,.39,.035,.018);box(g,'#edd397',.35,1.51,.06,.03,.3,.14);return g;}
function makeMushrooms(){const g=new THREE.Group();for(let i=0;i<3;i++){const x=Math.sin(i*2.5)*.32,z=Math.cos(i*2.5)*.23,s=i? .7:1;cylinder(g,'#efe1be',x,.2*s,z,.08*s,.4*s);ball(g,i===2?'#d4b585':'#c08c71',x,.43*s,z,.3*s,.17*s,.28*s);for(let j=0;j<4;j++)ball(g,'#f5e8c8',x+Math.sin(j*2.4)*.17*s,(.51+Math.cos(j)*.04)*s,z+Math.cos(j*2.4)*.15*s,.035*s,.017*s,.035*s);}return g;}
function makeStar(){const g=new THREE.Group();cylinder(g,colors.wood,0,.07,0,.3,.14);link(g,[0,.1,0],[0,1.09,0],.045,colors.wood);const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2+Math.PI/2,r=i%2?.2:.43;if(!i)sh.moveTo(Math.cos(a)*r,Math.sin(a)*r);else sh.lineTo(Math.cos(a)*r,Math.sin(a)*r);}sh.closePath();mesh(g,new THREE.ExtrudeGeometry(sh,{depth:.14,bevelEnabled:true,bevelSegments:3,bevelSize:.06,bevelThickness:.06,steps:1}),new THREE.MeshStandardMaterial({color:'#edc96e',emissive:'#d29433',emissiveIntensity:.5,roughness:.6}),0,1.3,0);g.userData.glow=true;return g;}
export function decor(id) {
  let g;
  switch(id){
    case 'bench':return makeBench();case 'lantern':return makeLantern();case 'flowerPatch':return makeFlowers();case 'cottage':return makeCottage();case 'sakura':g=makeTree('cherry',6);g.scale.setScalar(.73);return g;case 'giantTree':g=makeTree('wish',9);g.scale.setScalar(.9);return g;case 'shrub':return makeShrub();case 'teaTable':return makeTea();case 'picnic':return makePicnic();case 'swing':return makeSwing();case 'pond':return makePond();case 'campfire':return makeCampfire();case 'tent':return makeTent();case 'arch':return makeArch();case 'telescope':return makeTelescope();case 'fountain':return makeFountain();case 'sign':return makeSign();case 'mailbox':return makeMailbox();case 'mushroom':return makeMushrooms();case 'starLamp':return makeStar();
    case 'planter':g=new THREE.Group();pot(g,0,0,0,.65);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;leaf(g,i%2?'#7eab75':'#a4bd83',Math.sin(a)*.23,.87+(i%3)*.13,Math.cos(a)*.23,1.22,a);}return g;
    case 'fence':g=new THREE.Group();for(const x of [-.85,0,.85]){box(g,colors.wood,x,.57,0,.13,1.14,.13);ball(g,colors.lightWood,x,1.14,0,.09);}for(const y of [.43,.86])box(g,colors.lightWood,0,y,.04,1.94,.13,.1);return g;
    case 'cushion':g=new THREE.Group();ball(g,'#ddac86',0,.13,0,.58,.14,.48);box(g,'#efd2a2',0,.26,0,.77,.018,.62);return g;
    case 'rockGarden':g=new THREE.Group();for(let i=0;i<4;i++){const a=i*2.4,s=.28+i*.06;ball(g,['#a2a491','#b4b6a0'][i%2],Math.sin(a)*.45,s*.5,Math.cos(a)*.4,s,s*.7,s*.85);ball(g,'#809763',Math.sin(a)*.45,s*.97,Math.cos(a)*.4,s*.67,.045,s*.58);}return g;
    default:return extraDecor(id);
  }
}

export function makeCharacter(options={}) {
  const {skin='#efc39c',hair='#503b30',outfit='#ce9870',style='bob',npc}=options;
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const skinMat=mat(skin),hairMat=mat(hair),cloth=mat(outfit),eyeMat=mat('#364039');
  const torso=ball(body,cloth,0,.97,0,.34,.43,.23);
  // Collar, stitched seam, buttons and an actual shoulder bag give the silhouette detail.
  for(const side of [-1,1]){const collar=ball(body,'#efe6c8',side*.082,1.26,.206,.108,.045,.067);collar.rotation.z=side*.38;}
  for(let i=0;i<3;i++)ball(body,'#e8d3a1',0,1.11-i*.12,.236,.022,.022,.012);
  box(body,'#ae9c79',0,.68,0,.54,.07,.38);
  const legs=[],arms=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.145,.68,0);body.add(leg);ball(leg,'#667c74',0,-.19,0,.117,.24,.13);ball(leg,'#eee5c8',0,-.36,.01,.11,.07,.12);ball(leg,'#745948',0,-.47,.07,.135,.12,.215);box(leg,'#b6a287',0,-.55,.08,.27,.05,.37);legs.push(leg);
    const arm=new THREE.Group();arm.position.set(side*.32,1.2,0);body.add(arm);ball(arm,cloth,side*.05,-.12,0,.15,.24,.16);ball(arm,skinMat,side*.075,-.34,.025,.1,.14,.115);arms.push(arm);
  }
  const head=new THREE.Group();head.position.y=1.69;body.add(head);
  ball(head,skinMat,0,0,0,.47,.44,.39);
  for(const s of [-1,1]){ball(head,skinMat,s*.45,-.035,0,.09,.14,.08);ball(head,'#d9987a',s*.49,-.04,.023,.032,.065,.038);}
  // A scalp cap follows the head; locks are separate rounded sculptural forms.
  const hairShell=mesh(head,new THREE.SphereGeometry(1,24,16,0,Math.PI*2,0,1.67),hairMat,0,.055,-.028,.48,.47,.41);
  for(let i=0;i<5;i++){const x=-.32+i*.15;const lock=ball(head,hairMat,x,.22+Math.abs(x)*.02,.307,.137,.22-(i%2)*.05,.14);lock.rotation.z=-.23+i*.13;}
  if(style==='bob'){for(const side of [-1,1])ball(head,hairMat,side*.385,-.08,-.08,.14,.38,.31);}
  if(style==='bun'){ball(head,hairMat,-.12,.47,-.18,.23,.21,.22);torus(head,'#d7b172',-.12,.43,-.18,.165,.035,-Math.PI/2);}
  if(style==='crop'){ball(head,hairMat,-.14,.4,.04,.24,.17,.28);}
  const eyes=[];
  for(const side of [-1,1]){
    const eyeGroup=new THREE.Group();eyeGroup.position.set(side*.167,-.01,.356);head.add(eyeGroup);ball(eyeGroup,'#fff2d8',0,0,0,.078,.093,.033);ball(eyeGroup,eyeMat,-side*.003,.002,.027,.044,.066,.024);ball(eyeGroup,'#fff8e1',-side*.009-.013,.029,.046,.014,.019,.008);eyes.push(eyeGroup);
    const brow=ball(head,hairMat,side*.173,.12,.36,.074,.018,.022);brow.rotation.z=side*.08;
    ball(head,'#e7a186',side*.29,-.12,.308,.064,.035,.02);
  }
  ball(head,skinMat,0,-.105,.389,.048,.052,.045);
  curve(head,[[-.07,-.192,.352],[0,-.21,.37],[.07,-.192,.352]],.012,'#9e654e');
  // A cross-body satchel with leather strap, flap and brass clasp.
  curve(body,[[-.22,1.29,.18],[.01,1.04,.26],[.32,.72,.11]],.026,'#927047');
  box(body,'#c29b61',.32,.71,.13,.31,.3,.18);box(body,'#dfb979',.32,.81,.226,.32,.13,.05);ball(body,'#917349',.32,.74,.266,.023);
  if(npc==='moss'){
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ball(head,['#729560','#9aae78','#809f64'][i%3],Math.sin(a)*.4,.23+Math.cos(a)*.11,Math.cos(a)*.29,.2,.19,.22);}
    leaf(head,'#9eb679',.1,.57,0,1.0,-.6);flower(head,-.27,.22,'#efd191',.39).position.y=.19;
    box(body,'#d9d3aa',0,.91,.247,.47,.52,.055);box(body,'#aea782',0,.84,.284,.25,.16,.02);
  }
  if(npc==='star'){
    const hat=mesh(head,coneGeo,mat('#7595af'),0,.67,-.04,.45,.61,.45);hat.rotation.z=.12;
    torus(head,'#dad3ae',0,.4,-.03,.43,.047,-Math.PI/2);ball(head,'#e4c378',.04,.99,-.05,.056);
    box(body,'#a1bdc5',0,1.26,.235,.52,.16,.06);box(body,'#a1bdc5',-.18,1.03,.27,.1,.48,.045);
    for(const s of [-1,1])torus(head,'#a18b62',s*.165,-.012,.404,.097,.013);
    link(head,[-.075,-.015,.41],[.075,-.015,.41],.012,'#a18b62');
  }
  if(npc==='craft'){
    const brim=ball(head,'#b28b64',0,.36,.08,.5,.085,.43);ball(head,'#c49a6f',0,.47,-.06,.4,.22,.36);
    box(body,'#638d89',0,.94,.239,.47,.5,.06);box(body,'#406c69',0,.82,.279,.28,.16,.026);
    box(body,'#d8bc87',.12,.96,.284,.033,.27,.024).rotation.z=-.15;
  }
  if(npc==='music'){for(let i=0;i<8;i++){const a=i*Math.PI/4;ball(head,i%2?'#dbc3aa':'#b6bea0',Math.sin(a)*.41,.34,Math.cos(a)*.3,.075);}box(body,'#caa281',-.32,.75,.26,.28,.32,.1);link(body,[-.34,.88,.25],[-.42,1.18,.25],.035,'#9a7152');}
  if(npc==='explorer'){ball(head,'#aeb6a1',0,.42,-.02,.46,.21,.39);box(head,'#7f918a',0,.34,.38,.66,.075,.27);box(body,'#9b8768',0,.92,-.27,.45,.52,.23);for(const x of [-.19,.19])box(body,'#c7ba93',x,1.08,.245,.055,.35,.03);}
  for(const bone of [head,body,...legs,...arms,...eyes])mergeDirectMeshes(bone);
  root.userData={body,head,eyes,legs,arms,phase:Math.random()*6.28,torso};return root;
}

export function animateCharacter(root,time,speed=0,gesture='idle') {
  const u=root.userData;if(!u.body)return;
  const t=time*6+u.phase,walk=Math.min(1,speed/2);
  u.body.position.y=Math.abs(Math.sin(t))*walk*.065+Math.sin(time*1.6+u.phase)*.012;
  u.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(t+i*Math.PI)*.43*walk);
  u.arms.forEach((arm,i)=>{arm.rotation.x=-Math.sin(t+i*Math.PI)*.36*walk;arm.rotation.z=(i?-.08:.08);});
  if(gesture==='wave'){u.arms[1].rotation.z=-2.25+Math.sin(time*6)*.18;u.arms[1].rotation.x=.1;}
  if(gesture==='sit'){u.legs.forEach(l=>l.rotation.x=-Math.PI*.48);u.body.position.y=-.2;}
  if(gesture==='garden'){u.body.rotation.x=.15+Math.sin(time*2)*.05;u.arms[0].rotation.x=-.6+Math.sin(time*2)*.2;}else u.body.rotation.x=0;
  const blink=(time+u.phase)%4.6;u.eyes.forEach(e=>e.scale.y=blink>4.42?.09:1);
  u.head.rotation.z=Math.sin(time*.8+u.phase)*.025;
}

/** Consolidate stationary meshes by shared geometry/material. Dynamic actors stay separate. */
let characterVertexMaterial;
function mergeDirectMeshes(group){
  const children=group.children.filter(o=>o.isMesh&&!Array.isArray(o.material)&&o.material.color&&!o.material.map&&!o.material.transparent&&!o.userData.noBatch);
  if(children.length<2)return;
  if(!characterVertexMaterial){characterVertexMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.83});sharedMaterials.add(characterVertexMaterial);}
  const attributes={position:[],normal:[],uv:[],color:[]};
  for(const child of children){child.updateMatrix();const geo=(child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone()).applyMatrix4(child.matrix),count=geo.getAttribute('position').count,c=child.material.color;
    for(const name of ['position','normal','uv']){const attr=geo.getAttribute(name);if(attr)attributes[name].push(...attr.array);else attributes[name].push(...new Float32Array(count*(name==='uv'?2:3)));}
    for(let i=0;i<count;i++)attributes.color.push(c.r,c.g,c.b);
    geo.dispose();group.remove(child);if(child.userData.ownsGeometry)child.geometry.dispose();
  }
  const geo=new THREE.BufferGeometry();for(const [name,array]of Object.entries(attributes))geo.setAttribute(name,new THREE.Float32BufferAttribute(array,name==='uv'?2:3));geo.computeBoundingSphere();mesh(group,geo,characterVertexMaterial);
}
export function disposeModel(object){const geometries=new Set(),materials=new Set();object.traverse(o=>{if(o.geometry&&o.userData.ownsGeometry)geometries.add(o.geometry);if(o.material&&o.userData.ownsMaterial)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
export function batchStatic(group) {
  group.updateMatrixWorld(true);const buckets=new Map(),remove=[];
  group.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||o.userData.noBatch)return;for(let p=o.parent;p&&p!==group;p=p.parent)if(p.userData.noBatch)return;const key=o.geometry.uuid+':'+o.material.uuid;let b=buckets.get(key);if(!b){b={geo:o.geometry,material:o.material,ownsGeometry:o.userData.ownsGeometry,ownsMaterial:o.userData.ownsMaterial,list:[]};buckets.set(key,b);}b.list.push({matrix:o.matrixWorld.clone(),shadow:o.castShadow});remove.push(o);});
  const inv=new THREE.Matrix4().copy(group.matrixWorld).invert();
  for(const b of buckets.values()){if(b.list.length<2)continue;const instance=new THREE.InstancedMesh(b.geo,b.material,b.list.length);b.list.forEach((v,i)=>instance.setMatrixAt(i,inv.clone().multiply(v.matrix)));instance.userData.ownsGeometry=b.ownsGeometry;instance.userData.ownsMaterial=b.ownsMaterial;instance.castShadow=b.list.some(x=>x.shadow);instance.receiveShadow=true;instance.instanceMatrix.needsUpdate=true;group.add(instance);}
  for(const o of remove){const b=buckets.get(o.geometry.uuid+':'+o.material.uuid);if(b.list.length>=2)o.parent.remove(o);}
}
