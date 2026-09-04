from pathlib import Path
p=Path('/mnt/data/emotion_island_v23_biome_identity/emotion_my_world.html')
s=p.read_text(encoding='utf-8')

s=s.replace('v2.2.2 STABILITY · 拖曳旋轉 · 滾輪/雙指縮放','v2.3 BIOME IDENTITY · 八張真正不同的遊戲地圖')
s=s.replace('v2.2.2 STABILITY · 八組不同地形剪影 · 遊樂設施可搭乘 · 核心資料格式凍結','v2.3 BIOME IDENTITY · 灰階輪廓也能辨識八組 · 核心資料格式凍結')

needle="function addBiomeSilhouetteV21(id,th){"
pos=s.index(needle)
# insert new helpers before addBiomeSilhouetteV21
insert=r'''
const BIOME_LIGHT_V23={
 '1':{key:[-20,30,12],fill:[14,10,-18],keyI:1.16,fillI:.22,hemi:.34,exp:.98},
 '2':{key:[-15,24,16],fill:[12,8,-14],keyI:1.08,fillI:.25,hemi:.40,exp:.99},
 '3':{key:[-9,28,10],fill:[12,7,-10],keyI:.94,fillI:.18,hemi:.33,exp:.94},
 '4':{key:[-25,20,18],fill:[14,8,-12],keyI:1.34,fillI:.20,hemi:.35,exp:1.00},
 '5':{key:[-12,22,-15],fill:[15,7,12],keyI:.94,fillI:.20,hemi:.28,exp:.91},
 '6':{key:[-17,25,16],fill:[12,10,-12],keyI:1.08,fillI:.24,hemi:.40,exp:.99},
 '7':{key:[-8,25,18],fill:[16,8,-8],keyI:1.02,fillI:.24,hemi:.31,exp:.95},
 '8':{key:[-18,27,10],fill:[14,9,-17],keyI:1.06,fillI:.24,hemi:.34,exp:.97}
};
function biomeTerraceV23(th,x,z,rx,rz,surface,block=.76){const y=terrace(x,z,rx,rz,surface,th);addThemeBlocker(x,z,Math.max(rx,rz)*block);return y}
function addHeroV23(name,fallback,x,z,y,scale,accent){const h=gameAsset(name)||decorObject(fallback,accent);h.position.set(x,y,z);h.scale.setScalar(scale);root.add(h);return h}
function starChartV23(th,x=0,z=-.7,r=3.0){const g=new THREE.Group();const disk=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.96,.12,40),toon(new THREE.Color(th.rock).offsetHSL(0,-.02,.10).getHex()));disk.position.y=.02;g.add(disk);for(let k=0;k<3;k++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*(.42+k*.18),.025,7,64),new THREE.MeshBasicMaterial({color:k===2?th.accent:th.flower,transparent:true,opacity:.34-k*.06,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=.10;g.add(markGlow(ring))}for(let i=0;i<10;i++){const a=i/10*Math.PI*2,st=new THREE.Mesh(new THREE.OctahedronGeometry(.07+(i%3)*.025),toon(i%3?th.accent:0xffdfa1));st.position.set(Math.cos(a)*r*.72,.14,Math.sin(a)*r*.72);g.add(st)}g.position.set(x,1.63,z);root.add(g);addThemeBlocker(x,z,r*.82);return g}
function flowerMandalaV23(th,x=0,z=0,r=3.4){const g=new THREE.Group();for(let i=0;i<56;i++){const a=i*.61,rr=.55+(i%14)*r/14,f=new THREE.Mesh(new THREE.SphereGeometry(.075+(i%3)*.014,7,5),toon(i%4===0?th.accent:th.flower));f.position.set(Math.cos(a)*rr,.10,Math.sin(a)*rr*.72);g.add(f)}g.position.set(x,1.66,z);root.add(g);return g}
function crystalCanyonV23(th){for(let i=0;i<28;i++){const side=i<14?-1:1,z=-7.2+(i%14)*1.06,h=1.0+(i%5)*.42;const c=biomeSpire(th,side*(5.9+(i%4)*.48),z,h,i%3===0?0x8df4ff:(i%3===1?0x6ed7ef:0x94a9ff));c.scale.x*=.82;c.scale.z*=.82}for(let i=0;i<10;i++){const a=i/10*Math.PI*2;biomeSpire(th,Math.cos(a)*4.1,4.7+Math.sin(a)*1.75,.75+(i%3)*.28,0xa7f6ff)}}
function crescentLagoonV23(th,x=-2.2,z=-.5){const g=new THREE.Group();const water=new THREE.Mesh(new THREE.RingGeometry(2.1,5.0,80,1,.25,Math.PI*1.42),new THREE.MeshStandardMaterial({color:th.waterShallow,roughness:.16,metalness:.04,transparent:true,opacity:.90,side:THREE.DoubleSide}));water.rotation.x=-Math.PI/2;water.rotation.z=-.44;g.add(water);const rim=new THREE.Mesh(new THREE.RingGeometry(5.04,5.28,80,1,.25,Math.PI*1.42),toon(new THREE.Color(th.rock).offsetHSL(0,.01,.08).getHex()));rim.rotation.x=-Math.PI/2;rim.rotation.z=-.44;rim.position.y=-.01;g.add(rim);g.position.set(x,1.76,z);root.add(g);addThemeBlocker(x,z,4.4);return g}
function buildBiomeCoreV23(id,th){
 let t1=1.8,t2=1.8,t3=1.8;
 if(id==='1'){
   starChartV23(th,0,-1.0,3.1);
   t1=biomeTerraceV23(th,-7.0,3.6,3.0,2.0,3.05);t2=biomeTerraceV23(th,6.8,3.0,2.7,1.8,3.45);t3=biomeTerraceV23(th,0,7.6,4.7,2.55,5.65);
   stairs(-2.0,4.7,-.42,9,1.25,.28,.34,th.path);stairs(2.8,4.9,.42,8,1.15,.26,.34,th.path);biomeBridge(th,0,5.25,0,5.2,3.15);
   addHeroV23('hero_observatory','telescope',0,7.6,t3+.12,1.02,th.accent);const t=decorObject('telescope',th.accent);addAuto(t,7,-7.0,3.6,1.18,t1+.12);waterfall(4.25,t3-.05,8.0,7.1,.0,th.accent);
 }else if(id==='2'){
   biomePool(th,2.7,-.7,2.5,1.55,-.12);flowerMandalaV23(th,-3.4,-1.2,2.7);
   t1=biomeTerraceV23(th,-6.4,5.5,4.0,2.8,3.05);t2=biomeTerraceV23(th,6.7,4.1,2.8,2.15,2.55);t3=biomeTerraceV23(th,.6,8.4,2.45,1.75,3.55);
   stairs(-3.8,3.9,-.56,7,1.35,.22,.34,th.path);stairs(4.6,2.8,.55,5,1.2,.18,.34,th.path);addHeroV23('hero_tea_pavilion','gazebo',-6.4,5.5,t1+.10,1.02,th.accent);
   for(let i=0;i<5;i++){const gate=decorObject('torii',th.accent);gate.position.set(-1.0+i*.85,1.70,-5.4+i*.85);gate.scale.setScalar(.68);gate.rotation.y=-.75;root.add(gate)}
 }else if(id==='3'){
   t1=biomeTerraceV23(th,0,4.8,6.3,3.5,2.70);t2=biomeTerraceV23(th,-8.0,-.2,2.7,2.5,2.10);t3=biomeTerraceV23(th,8.0,-.4,2.7,2.4,2.15);
   addHeroV23('hero_world_tree','giantTree',0,4.8,t1+.08,.92,th.accent);const camp=decorObject('campfire',th.accent);addAuto(camp,5,0,-3.5,1.15,1.68);const cot=decorObject('cottage',th.accent);addAuto(cot,8,7.8,-.5,1.08,t3+.10);
   for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=10.5+(i%3)*.7,tr=tree(false,i%2?0x2d7447:0x397f4f,true);tr.position.set(Math.cos(a)*r,1.70,Math.sin(a)*r*.76);tr.scale.multiplyScalar(.72+(i%3)*.08);root.add(tr)}
 }else if(id==='4'){
   t1=biomeTerraceV23(th,-7.0,5.5,4.2,2.35,5.25);t2=biomeTerraceV23(th,0.3,5.0,3.6,2.0,3.95);t3=biomeTerraceV23(th,7.0,2.8,2.8,1.8,2.75);
   stairs(-3.8,3.8,-.48,10,1.25,.30,.32,th.path);stairs(3.8,3.2,.45,7,1.15,.23,.32,th.path);biomeBridge(th,-3.0,5.2,-.08,4.6,4.25);addHeroV23('hero_wind_shrine','windmill',-7.0,5.5,t1+.12,.98,th.accent);waterfall(-3.6,t1-.1,6.2,8.2,.08,th.accent);
 }else if(id==='5'){
   crescentLagoonV23(th,-2.8,-.6);t1=biomeTerraceV23(th,-7.2,4.4,3.2,2.2,3.45);t2=biomeTerraceV23(th,7.0,4.9,3.1,2.1,3.10);t3=biomeTerraceV23(th,.8,8.3,3.0,1.95,4.45);
   biomeBridge(th,-4.8,3.2,-.45,4.3,2.15);biomeBridge(th,4.8,3.5,.45,4.3,2.12);addHeroV23('hero_moon_shrine','gazebo',.8,8.3,t3+.10,.96,th.accent);const tel=decorObject('telescope',th.accent);addAuto(tel,7,7.0,4.9,1.15,t2+.12);
 }else if(id==='6'){
   flowerMandalaV23(th,0,-.4,4.5);t1=biomeTerraceV23(th,-6.3,4.8,3.6,2.3,2.45);t2=biomeTerraceV23(th,6.3,4.8,3.6,2.3,2.45);t3=biomeTerraceV23(th,0,8.2,4.1,2.0,3.15);
   addHeroV23('hero_flower_pavilion','gazebo',0,8.2,t3+.10,.94,th.accent);const stage=decorObject('musicStage',th.accent);addAuto(stage,8,0,4.2,1.18,1.70);for(const x of[-7,-4,4,7]){const sw=decorObject('starLamp',th.accent);addAuto(sw,5,x,-4.5,.78,1.68)}
 }else if(id==='7'){
   biomePool(th,0,-.2,5.3,3.15,0);crystalCanyonV23(th);t1=biomeTerraceV23(th,-7.4,2.8,3.0,4.5,4.35);t2=biomeTerraceV23(th,7.4,2.8,3.0,4.5,4.35);t3=biomeTerraceV23(th,0,8.6,3.4,2.0,3.20);
   biomeBridge(th,-4.4,1.4,-.10,4.2,2.05);biomeBridge(th,4.4,1.4,.10,4.2,2.05);addHeroV23('hero_crystal_cathedral','crystal',0,8.6,t3+.12,.88,th.accent);waterfall(-5.4,t1-.15,3.2,7.4,.02,th.accent);waterfall(5.4,t2-.15,3.2,7.4,-.02,th.accent);
 }else{
   starChartV23(th,0,-1.3,2.65);t1=biomeTerraceV23(th,-5.8,5.5,3.7,2.25,3.85);t2=biomeTerraceV23(th,5.8,5.5,3.7,2.25,3.85);t3=biomeTerraceV23(th,0,8.8,4.1,2.35,5.35);
   biomeBridge(th,-3.2,5.6,-.05,4.0,3.15);biomeBridge(th,3.2,5.6,.05,4.0,3.15);addHeroV23('hero_aurora_altar','musicStage',0,8.8,t3+.10,.94,th.accent);for(const q of[[-5.8,5.5],[5.8,5.5]]){const tr=decorObject('giantTree',th.accent);tr.position.set(q[0],t1+.12,q[1]);tr.scale.setScalar(.88);root.add(tr)}
 }
 return {t1,t2,t3};
}
function placeCenterpieceV23(id,th){const pos={
 '1':[0,10.8,1.10],'2':[3.5,7.0,.70],'3':[0,8.6,.48],'4':[-6.8,10.9,.70],'5':[-3.0,7.8,.62],'6':[0,7.1,.58],'7':[0,5.5,.40],'8':[0,11.0,.74]
 }[id]||[0,7.25,1];crown=groupCenterpiece(id,th);addAuto(crown,16,pos[0],0,pos[2],pos[1]);}
'''
s=s[:pos]+insert+s[pos:]

# Replace common light block
old="const hemi=new THREE.HemisphereLight(0xb9cfdf,0x18243a,.38);hemi.userData.envLight=1;scene.add(hemi);const dl=new THREE.DirectionalLight(th.sun,1.28);dl.position.set(-18,26,17);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);dl.shadow.camera.left=-22;dl.shadow.camera.right=22;dl.shadow.camera.top=22;dl.shadow.camera.bottom=-22;dl.userData.envLight=1;scene.add(dl);const fill=new THREE.DirectionalLight(th.accent,.30);fill.position.set(16,9,-16);fill.userData.envLight=1;scene.add(fill);const rimLight=new THREE.DirectionalLight(0x7189c2,.18);rimLight.position.set(-12,8,-20);rimLight.userData.envLight=1;scene.add(rimLight);const focalWarm=new THREE.PointLight(th.sun,.20,20,2);focalWarm.position.set(-5,7,4);focalWarm.userData.envLight=1;scene.add(focalWarm);const focalCool=new THREE.PointLight(th.accent,.16,18,2);focalCool.position.set(6,5,-4);focalCool.userData.envLight=1;scene.add(focalCool);"
new="const li=BIOME_LIGHT_V23[id]||BIOME_LIGHT_V23['1'];renderer.toneMappingExposure=li.exp;const hemi=new THREE.HemisphereLight(new THREE.Color(th.sun).lerp(new THREE.Color(0xc7ddff),.35).getHex(),0x16243a,li.hemi);hemi.userData.envLight=1;scene.add(hemi);const dl=new THREE.DirectionalLight(th.sun,li.keyI);dl.position.set(...li.key);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);dl.shadow.camera.left=-24;dl.shadow.camera.right=24;dl.shadow.camera.top=24;dl.shadow.camera.bottom=-24;dl.userData.envLight=1;scene.add(dl);const fill=new THREE.DirectionalLight(th.accent,li.fillI);fill.position.set(...li.fill);fill.userData.envLight=1;scene.add(fill);const rimLight=new THREE.DirectionalLight(new THREE.Color(th.accent).lerp(new THREE.Color(0x7189c2),.45).getHex(),id==='5'?.11:.16);rimLight.position.set(-12,8,-20);rimLight.userData.envLight=1;scene.add(rimLight);const focalWarm=new THREE.PointLight(th.sun,id==='4'?.28:.14,22,2);focalWarm.position.set(-5,7,4);focalWarm.userData.envLight=1;scene.add(focalWarm);const focalCool=new THREE.PointLight(th.accent,id==='7'?.24:.13,20,2);focalCool.position.set(6,5,-4);focalCool.userData.envLight=1;scene.add(focalCool);"
if old not in s: raise SystemExit('light block not found')
s=s.replace(old,new,1)

old_core="const plaza=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.52,.14,24),toon(th.path));plaza.position.set(0,1.62,-.6);plaza.receiveShadow=true;root.add(plaza);const fountain=decorObject('fountain',th.accent);addAuto(fountain,6,0,-.6,1.22,1.68);const stones=[];for(let i=0;i<13;i++)stones.push([-7.5+i*.68,-4.8+Math.sin(i*.42)*.42]);for(let i=0;i<11;i++)stones.push([-.4+i*.72,-.2+i*.49]);for(let i=0;i<9;i++)stones.push([-5.5+i*.75,4.3-Math.sin(i*.5)*.4]);pathPebbles(stones,th.path);\nconst t1=terrace(-4.7,5.5,3.75,2.6,3.35,th);const t2=terrace(5.3,4.25,3.15,2.45,2.95,th);const t3=terrace(1.1,7.0,3.25,2.1,4.05,th);stairs(-2.6,3.7,-.58,7,1.45,.23,.34,th.path);stairs(4.1,2.4,.55,6,1.25,.20,.34,th.path);stairs(.7,5.0,.10,9,1.35,.28,.32,th.path);fenceArc(-4.7,5.5,3.2,.15,2.8,9,0x724735,t1);fenceArc(5.3,4.25,2.7,-.1,2.5,8,0x724735,t2);fenceArc(1.1,7.0,2.7,.1,2.7,8,0x724735,t3);\naddTerraceLandmarks(id,th,t1,t2,t3);const treeSets={1:[[8.3,-.6,false],[-8.6,-.8,false],[-6.2,-6.0,false]],2:[[8.3,-.6,true],[-8.6,-.8,true],[6.9,-5.6,true]],3:[[8.3,-.6,false],[-8.6,-.8,false],[6.9,-5.6,false],[-6.2,-6.0,false]],4:[[8.3,-.6,false],[-8.6,-.8,false]],5:[[8.3,-.6,false],[-8.6,-.8,false],[-6.2,-6.0,false]],6:[[8.3,-.6,true],[-8.6,-.8,true],[6.9,-5.6,true]],7:[[8.3,-.6,false],[-8.6,-.8,false]],8:[[8.3,-.6,false],[-8.6,-.8,false],[6.9,-5.6,false]]};(treeSets[Number(id)]||[]).forEach((q,k)=>addAuto(tree(q[2],q[2]?0x4da45f:0x2f8f57),7+k,q[0],q[1],1.08+(k%2)*.12,1.62));\nfor(let i=0;i<44;i++){const a=i/44*Math.PI*2,r=4.2+(i%5)*1.45,f=new THREE.Mesh(new THREE.SphereGeometry(.10+(i%4)*.025,7,5),toon(i%3===0?th.flower:(i%3===1?th.accent:0xffd46e)));addAuto(f,1+Math.floor(i/10),Math.cos(a)*r,Math.sin(a)*r*.82,1,1.64)}for(let i=0;i<10;i++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(.22+.06*(i%3)),toon(i%2?th.accent:0x86f5ff,{emissive:th.accent,emissiveIntensity:.72}));addAuto(c,9+(i%3),5.0+(i%5)*.55,-1.8+Math.floor(i/5)*.55,1,1.68)}for(let i=0;i<6;i++)addAuto(decorObject('lantern',th.accent),8,-3.8+i*1.5,-6.8,.92,1.62);\nwaterfall(-4.3,t1-.1,7.7,7.9,.05,th.accent);waterfall(6.5,t2-.1,5.45,7.3,-.25,th.accent);let bridge=gameAsset('bridge');if(!bridge){bridge=new THREE.Group();for(let i=0;i<10;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.82,.12,1.25),toon(0x925d3d));plank.position.set((i-4.5)*.76,Math.sin((i/9)*Math.PI)*.42,0);plank.rotation.z=Math.sin((i/9)*Math.PI)*.08;bridge.add(plank)}for(const z of[-.72,.72])for(let i=0;i<5;i++){const post=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,.7,6),toon(0x674335));post.position.set((i-2)*1.55,.55,z);bridge.add(post)}}bridge.position.set(-.5,1.58,-8.9);bridge.rotation.y=.04;bridge.scale.setScalar(.96);root.add(bridge);"
new_core="const coreV23=buildBiomeCoreV23(id,th);const t1=coreV23.t1,t2=coreV23.t2,t3=coreV23.t3;const stones=[];const pathMode=Number(id);for(let i=0;i<12;i++){if(pathMode===1)stones.push([-8+i*.72,-5.1+Math.sin(i*.4)*.28]);else if(pathMode===7)stones.push([-7.2+i*1.25,-5.8+Math.sin(i*.62)*.55]);else if(pathMode===5)stones.push([-8+i*1.15,-6.3+Math.sin(i*.46)*.62]);else stones.push([-7.5+i*1.15,-5.0+Math.sin(i*.42+pathMode)*.50])}pathPebbles(stones,th.path);for(let i=0;i<26;i++){const a=i/26*Math.PI*2,r=5.0+(i%5)*1.55,f=new THREE.Mesh(new THREE.SphereGeometry(.085+(i%4)*.02,7,5),toon(i%3===0?th.flower:(i%3===1?th.accent:new THREE.Color(th.path).offsetHSL(0,.02,.08).getHex())));addAuto(f,1+Math.floor(i/7),Math.cos(a)*r,Math.sin(a)*r*.80,1,1.64)}for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(.19+.05*(i%3)),toon(i%2?th.accent:th.flower,{emissive:th.accent,emissiveIntensity:.30}));addAuto(c,9+(i%3),7.2+(i%3)*.55,-2.8+Math.floor(i/3)*.60,1,1.68)}let bridge=gameAsset('bridge');if(!bridge){bridge=new THREE.Group();for(let i=0;i<10;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.82,.12,1.25),toon(0x925d3d));plank.position.set((i-4.5)*.76,Math.sin((i/9)*Math.PI)*.42,0);bridge.add(plank)}}bridge.position.set(0,1.58,-9.6);bridge.rotation.y=id==='5'?-.16:(id==='7'?.12:.04);bridge.scale.setScalar(.96);root.add(bridge);"
if old_core not in s: raise SystemExit('core block not found')
s=s.replace(old_core,new_core,1)

old_crown="addAuto(decorObject('arch',th.accent),15,0,9.5,1.18,1.72);crown=groupCenterpiece(id,th);addAuto(crown,16,0,0,1,7.25);"
new_crown="placeCenterpieceV23(id,th);"
if old_crown not in s: raise SystemExit('crown block not found')
s=s.replace(old_crown,new_crown,1)

# placement blockers: remove obsolete common terrace blockers, rely on biome-specific blockers + keep known main features
old_pb="placementBlockers=[{x:0,z:-.6,r:2.95},{x:-4.9,z:5.6,r:1.7},{x:5.2,z:4.35,r:1.55},{x:1.1,z:7.05,r:1.75},{x:8.3,z:-.6,r:1.55},{x:-8.6,z:-.8,r:1.52},{x:6.9,z:-5.6,r:1.58},{x:-6.2,z:-6.0,r:1.52},{x:0,z:9.5,r:1.28},{x:-.5,z:-8.9,r:1.85},{x:-4.2,z:7.55,r:1.35},{x:6.45,z:5.45,r:1.28},{x:-3.2,z:3.45,r:.95},{x:3.9,z:2.5,r:.88}].concat(themeBlockers);"
new_pb="placementBlockers=[{x:0,z:-9.6,r:1.8},{x:8.3,z:-.6,r:1.40},{x:-8.6,z:-.8,r:1.40},{x:6.9,z:-5.6,r:1.42},{x:-6.2,z:-6.0,r:1.42}].concat(themeBlockers);"
if old_pb not in s: raise SystemExit('placement blocker block not found')
s=s.replace(old_pb,new_pb,1)

# more distinct view presets
old_view="const VIEW_PRESETS={\n '1':{yaw:.42,pitch:.47,dist:51},'2':{yaw:-.78,pitch:.49,dist:50},'3':{yaw:.96,pitch:.43,dist:52},'4':{yaw:-1.03,pitch:.47,dist:51},'5':{yaw:.82,pitch:.41,dist:51},'6':{yaw:-.88,pitch:.45,dist:51},'7':{yaw:.18,pitch:.42,dist:53},'8':{yaw:-.52,pitch:.44,dist:52}\n};"
if old_view in s:
    new_view="const VIEW_PRESETS={\n '1':{yaw:.18,pitch:.42,dist:53},'2':{yaw:-.92,pitch:.50,dist:51},'3':{yaw:.72,pitch:.38,dist:54},'4':{yaw:-1.12,pitch:.43,dist:53},'5':{yaw:.92,pitch:.38,dist:52},'6':{yaw:-.66,pitch:.47,dist:52},'7':{yaw:-.05,pitch:.58,dist:55},'8':{yaw:-.42,pitch:.40,dist:54}\n};"
    s=s.replace(old_view,new_view,1)
else:
    print('VIEW_PRESETS exact block not found; leaving current')

p.write_text(s,encoding='utf-8')
print('patched',len(s))
