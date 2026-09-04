from pathlib import Path
import re
p=Path('/mnt/data/emotion_island_v21/emotion_my_world.html')
s=p.read_text(encoding='utf-8')
# version/storage only; preserve data API names and schemas
s=s.replace('emotionIslandV20:', 'emotionIslandV21:')
s=s.replace('emotionIslandEditorLockV20:', 'emotionIslandEditorLockV21:')
s=s.replace('v2.0 PRODUCTION', 'v2.1 ART PRODUCTION')

# Insert ride seat helper before ride builders
needle="function ridePaint(th,i=0){const cols=[th.accent,th.flower,th.path,th.grass2,0xf1c56f,0x6bbbd1];return cols[i%cols.length]}"
replacement=needle+"\nfunction rideSeat(parent,x,y,z){const a=new THREE.Object3D();a.position.set(x,y,z);a.userData.rideSeat=true;parent.add(a);return a}\nfunction finalizeRide(g,moving,seats,kind){g.userData.ride=kind;g.userData.moving=moving;g.userData.seatAnchors=seats||[];return g}"
if needle not in s: raise SystemExit('ridePaint needle missing')
s=s.replace(needle,replacement,1)

# Replace ride builder functions with seat anchors
patterns={
'makeFerrisWheel':'''function makeFerrisWheel(th){const g=new THREE.Group(),frame=toon(0x6a5160),wheel=new THREE.Group(),seats=[];for(const x of[-.78,.78]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,2.7,8),frame);p.position.set(x,1.35,0);p.rotation.z=x>0?-.22:.22;g.add(p)}const axle=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.55,10),toon(0x665466));axle.rotation.x=Math.PI/2;axle.position.y=2.15;g.add(axle);const tor=new THREE.Mesh(new THREE.TorusGeometry(1.35,.075,8,48),toon(th.accent));wheel.add(tor);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,sp=new THREE.Mesh(new THREE.BoxGeometry(2.55,.035,.04),toon(new THREE.Color(th.accent).offsetHSL(0,-.08,-.15).getHex()));sp.rotation.z=a;wheel.add(sp);const x=Math.cos(a)*1.35,y=Math.sin(a)*1.35,cab=new THREE.Mesh(new THREE.BoxGeometry(.32,.28,.32),toon(ridePaint(th,i)));cab.position.set(x,y,0);wheel.add(cab);seats.push(rideSeat(wheel,x,y+.18,0))}wheel.position.y=2.15;g.add(wheel);return finalizeRide(g,wheel,seats,'ferris')}''',
'makeCarousel':'''function makeCarousel(th){const g=new THREE.Group(),base=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.35,.18,20),toon(th.path));base.position.y=.09;g.add(base);const spin=new THREE.Group(),seats=[];const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.2,10),toon(0x795448));pole.position.y=1.18;g.add(pole);const canopy=new THREE.Mesh(new THREE.ConeGeometry(1.36,.62,16),toon(th.flower));canopy.position.y=2.18;g.add(canopy);for(let i=0;i<6;i++){const a=i/6*Math.PI*2,x=Math.cos(a)*.82,z=Math.sin(a)*.82,p=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,1.25,6),toon(0xd8b17a));p.position.set(x,1.05,z);spin.add(p);const seat=new THREE.Mesh(new THREE.SphereGeometry(.18,9,7),toon(ridePaint(th,i)));seat.scale.set(1.2,.7,.75);seat.position.set(x,.55,z);spin.add(seat);seats.push(rideSeat(spin,x,.78,z))}g.add(spin);return finalizeRide(g,spin,seats,'carousel')}''',
'makeTeacups':'''function makeTeacups(th){const g=new THREE.Group(),base=new THREE.Mesh(new THREE.CylinderGeometry(1.22,1.28,.14,20),toon(th.path));base.position.y=.07;g.add(base);const spin=new THREE.Group(),seats=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2,x=Math.cos(a)*.75,z=Math.sin(a)*.75,cup=new THREE.Mesh(new THREE.CylinderGeometry(.28,.22,.34,12),toon(ridePaint(th,i)));cup.position.set(x,.26,z);spin.add(cup);seats.push(rideSeat(spin,x,.52,z))}g.add(spin);return finalizeRide(g,spin,seats,'teacups')}''',
'makeMiniTrain':'''function makeMiniTrain(th){const g=new THREE.Group(),track=new THREE.Mesh(new THREE.TorusGeometry(1.25,.045,8,44),toon(0x705849));track.rotation.x=Math.PI/2;track.position.y=.08;g.add(track);const spin=new THREE.Group(),seats=[];for(let i=0;i<3;i++){const z=(i-1)*.42,car=new THREE.Mesh(new THREE.BoxGeometry(.45,.34,.34),toon(ridePaint(th,i)));car.position.set(1.25,.26,z);spin.add(car);seats.push(rideSeat(spin,1.25,.52,z))}g.add(spin);return finalizeRide(g,spin,seats,'train')}''',
'makeSkySwing':'''function makeSkySwing(th){const g=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.10,.15,2.7,10),toon(0x6d5360));pole.position.y=1.35;g.add(pole);const top=new THREE.Mesh(new THREE.ConeGeometry(1.05,.45,14),toon(th.accent));top.position.y=2.55;g.add(top);const spin=new THREE.Group(),seats=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2,string=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.15,5),toon(0xb8a58d));string.position.set(Math.cos(a)*.75,1.72,Math.sin(a)*.75);string.rotation.z=Math.cos(a)*.14;spin.add(string);const x=Math.cos(a)*1.02,z=Math.sin(a)*1.02,seat=new THREE.Mesh(new THREE.BoxGeometry(.24,.08,.22),toon(ridePaint(th,i)));seat.position.set(x,1.15,z);spin.add(seat);seats.push(rideSeat(spin,x,1.30,z))}g.add(spin);return finalizeRide(g,spin,seats,'skySwing')}''',
'makeBalloonDock':'''function makeBalloonDock(th){const g=new THREE.Group(),dock=new THREE.Mesh(new THREE.CylinderGeometry(.78,.86,.14,16),toon(th.path));dock.position.y=.07;g.add(dock);const bob=new THREE.Group(),seats=[];const basket=new THREE.Mesh(new THREE.BoxGeometry(.32,.25,.32),toon(0x8c6548));basket.position.y=.55;bob.add(basket);const balloon=new THREE.Mesh(new THREE.SphereGeometry(.62,16,12),toon(th.flower));balloon.scale.set(1,.9,.82);balloon.position.y=1.65;bob.add(balloon);for(const x of[-.18,.18]){const rope=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.85,5),toon(0x6d5848));rope.position.set(x,1.05,0);bob.add(rope)}seats.push(rideSeat(bob,0,.78,0));g.add(bob);g.userData.baseY=0;return finalizeRide(g,bob,seats,'balloon')}''',
'makeCloudCoaster':'''function makeCloudCoaster(th){const g=new THREE.Group(),track=new THREE.Mesh(new THREE.TorusGeometry(1.45,.06,8,52),toon(new THREE.Color(th.accent).offsetHSL(0,-.08,-.15).getHex()));track.rotation.x=Math.PI/2;track.scale.z=.72;track.position.y=.55;g.add(track);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,p=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.55,6),toon(0x6d4e46));p.position.set(Math.cos(a)*1.45,.28,Math.sin(a)*1.04);g.add(p)}const spin=new THREE.Group(),seats=[];const cart=new THREE.Mesh(new THREE.BoxGeometry(.48,.30,.34),toon(th.flower));cart.position.set(1.45,.62,0);spin.add(cart);seats.push(rideSeat(spin,1.45,.85,0));g.add(spin);return finalizeRide(g,spin,seats,'coaster')}'''
}
for name,new in patterns.items():
    pat=r"function "+re.escape(name)+r"\(th\)\{.*?return g\}"
    s2,n=re.subn(pat,new,s,count=1,flags=re.S)
    if n!=1: raise SystemExit(f'failed replace {name}: {n}')
    s=s2

# Add deep biome silhouette helpers after productionLanternPath
needle="function productionLanternPath(points,th){points.forEach((p,i)=>{const o=decorObject(i%3===0?'starLamp':'lantern',th.accent);o.position.set(p[0],1.70,p[1]);o.scale.setScalar(.68);productionGroup.add(o)})}"
if needle not in s: raise SystemExit('productionLanternPath missing')
helpers=r'''
function biomeShelf(th,x,z,rx,rz,rot=0,depth=4.8,topLift=0){
  const g=new THREE.Group(),rockCol=new THREE.Color(th.rock).offsetHSL(0,.02,-.035).getHex(),edgeCol=new THREE.Color(th.grass).offsetHSL(0,.04,-.08).getHex();
  const side=new THREE.Mesh(warpedCylinderGeometry(1,.68,depth,22,Math.abs(x*.37+z*.19)+2.1,.08),productionMat(rockCol,.92,0));side.scale.set(rx,1,rz);side.position.y=1.45+topLift-depth*.50;side.castShadow=side.receiveShadow=true;g.add(side);
  const edge=new THREE.Mesh(warpedCylinderGeometry(1.02,.96,.46,22,Math.abs(x*.19-z*.31)+4.4,.055),productionMat(edgeCol,.86,0));edge.scale.set(rx,1,rz);edge.position.y=1.42+topLift;edge.receiveShadow=true;g.add(edge);
  const top=new THREE.Mesh(warpedCylinderGeometry(.96,1.0,.24,22,Math.abs(z*.23)+5.1,.045),productionMat(th.grass2,.80,0));top.scale.set(rx,1,rz);top.position.y=1.72+topLift;top.receiveShadow=true;g.add(top);
  g.position.set(x,0,z);g.rotation.y=rot;productionGroup.add(g);return g
}
function biomeBridge(th,x,z,rot,len=4.8,y=1.82){let b=gameAsset('bridge');if(!b){b=new THREE.Group();for(let i=0;i<8;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.58,.10,1.08),toon(new THREE.Color(th.path).offsetHSL(0,-.08,-.10).getHex()));plank.position.x=(i-3.5)*.56;b.add(plank)}}b.position.set(x,y,z);b.rotation.y=rot;b.scale.set(len/4.5,.82,.82);productionGroup.add(b);return b}
function biomePool(th,x,z,rx,rz,rot=0){const g=new THREE.Group();const rim=new THREE.Mesh(new THREE.RingGeometry(.82,1,56),productionMat(new THREE.Color(th.rock).offsetHSL(0,-.05,.08).getHex(),.88,0));rim.scale.set(rx,rz,1);rim.rotation.x=-Math.PI/2;g.add(rim);const water=new THREE.Mesh(new THREE.CircleGeometry(.84,56),new THREE.MeshStandardMaterial({color:th.waterShallow,roughness:.18,metalness:.05,transparent:true,opacity:.92}));water.scale.set(rx,rz,1);water.rotation.x=-Math.PI/2;water.position.y=.02;g.add(water);g.position.set(x,1.82,z);g.rotation.y=rot;productionGroup.add(g);addThemeBlocker(x,z,Math.max(rx,rz)*.88);return g}
function biomeSpire(th,x,z,h=2.2,col=th.accent){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.48,0),new THREE.MeshStandardMaterial({color:col,roughness:.28,metalness:.10,emissive:new THREE.Color(col).multiplyScalar(.14),emissiveIntensity:.18}));m.scale.set(.72,h,.72);m.position.set(x,1.74+h*.42,z);m.castShadow=true;productionGroup.add(m);return m}
function addBiomeSilhouetteV21(id,th){
  // These macro shelves live mostly outside the editable core, so the stable placement data model stays untouched.
  if(id==='1'){
    biomeShelf(th,-14.0,4.2,3.3,2.3,-.18,5.8,.3);biomeShelf(th,13.8,-2.2,2.7,2.0,.24,4.8,.1);biomeBridge(th,-11.8,3.3,-.27,4.5,1.95);
    const obs=decorObject('telescope',th.accent);obs.position.set(-14.2,2.25,4.2);obs.scale.setScalar(1.35);productionGroup.add(obs);for(let i=0;i<7;i++)biomeSpire(th,12.6+Math.cos(i*.9)*1.5,-2.2+Math.sin(i*.9)*1.0,.9+(i%3)*.3,i%2?0x8be9ff:0x9ea8ff)
  }else if(id==='2'){
    biomeShelf(th,-13.2,-1.2,3.4,2.7,.28,4.9,.1);biomeShelf(th,12.6,4.7,3.0,2.1,-.18,4.2,.25);biomeBridge(th,10.8,3.7,.40,4.4,1.9);
    for(const q of[[-14.0,-.6],[-12.3,-2.0],[11.8,4.1],[13.3,5.1]]){const tr=tree(true,0x58a962,true);tr.position.set(q[0],1.85,q[1]);tr.scale.multiplyScalar(.86);productionGroup.add(tr)}biomePool(th,-13.2,-1.2,1.55,1.05,.3)
  }else if(id==='3'){
    for(const q of[[-13.8,4.8,3.6,2.4],[-14.2,-4.6,3.0,2.2],[13.8,4.2,3.2,2.2],[13.7,-4.8,3.5,2.3]]){biomeShelf(th,q[0],q[1],q[2],q[3],q[0]>0?.16:-.16,5.2,.12);for(let k=0;k<3;k++){const tr=tree(false,k%2?0x2d7248:0x3b8e55,true);tr.position.set(q[0]+(k-1)*1.0,1.9,q[1]+Math.sin(k*2)*.7);tr.scale.multiplyScalar(.78);productionGroup.add(tr)}}
  }else if(id==='4'){
    biomeShelf(th,-13.5,4.7,3.9,2.1,-.24,6.0,.65);biomeShelf(th,13.2,2.8,3.0,1.8,.22,4.8,.38);biomeBridge(th,-11.3,3.8,-.25,4.4,2.1);const wm=decorObject('windmill',th.accent);wm.position.set(-13.5,2.75,4.7);wm.scale.setScalar(1.5);productionGroup.add(wm);for(let i=0;i<6;i++)biomeSpire(th,12.0+(i%3)*.9,2.1+Math.floor(i/3)*1.1,1.1+(i%2)*.25,0xe7b66c)
  }else if(id==='5'){
    biomeShelf(th,-13.6,-2.0,4.0,2.7,-.30,5.2,.0);biomeShelf(th,12.8,5.0,3.2,2.0,.18,4.6,.22);biomeBridge(th,10.8,4.0,.34,4.5,1.95);biomePool(th,-13.5,-2.0,2.35,1.45,-.3);for(let i=0;i<6;i++)biomeSpire(th,-15.3+i*.75,-.15-Math.sin(i*.7)*.4,.7+(i%3)*.3,0x91a9e6);const tel=decorObject('telescope',th.accent);tel.position.set(12.8,2.20,5.0);tel.scale.setScalar(1.35);productionGroup.add(tel)
  }else if(id==='6'){
    biomeShelf(th,-13.6,3.7,4.4,2.5,-.20,4.7,.12);biomeShelf(th,13.5,-3.5,4.0,2.5,.20,4.7,.10);biomeBridge(th,-11.0,2.8,-.25,4.5,1.9);for(let i=0;i<22;i++){const a=i*.78,r=.5+(i%6)*.32,f=new THREE.Mesh(new THREE.SphereGeometry(.09,7,5),toon(i%3?th.flower:th.accent));f.position.set(-13.6+Math.cos(a)*r,1.95,3.7+Math.sin(a)*r*.7);productionGroup.add(f)}const gz=decorObject('gazebo',th.accent);gz.position.set(13.5,2.05,-3.5);gz.scale.setScalar(1.3);productionGroup.add(gz)
  }else if(id==='7'){
    biomeShelf(th,-14.0,1.7,3.0,5.0,-.06,5.7,.18);biomeShelf(th,14.0,1.7,3.0,5.0,.06,5.7,.18);biomePool(th,0,-9.0,3.1,1.4,0);for(let i=0;i<18;i++){const side=i<9?-1:1,z=-4.8+(i%9)*1.3;biomeSpire(th,side*(13.3+(i%3)*.55),z,1.1+(i%4)*.45,i%2?0x6fe5ee:0x8ea9ff)}
  }else{
    biomeShelf(th,-13.4,4.5,3.5,2.2,-.17,5.0,.30);biomeShelf(th,13.4,4.5,3.5,2.2,.17,5.0,.30);biomeShelf(th,0,-12.0,4.3,2.0,0,4.2,.12);biomeBridge(th,-11.0,3.7,-.30,4.4,2.05);biomeBridge(th,11.0,3.7,.30,4.4,2.05);for(const q of[[-13.4,4.5],[13.4,4.5]]){const tr=decorObject('giantTree',th.accent);tr.position.set(q[0],2.15,q[1]);tr.scale.setScalar(1.15);productionGroup.add(tr)}const st=decorObject('musicStage',th.accent);st.position.set(0,1.95,-12);st.scale.setScalar(1.45);productionGroup.add(st)
  }
}
'''
s=s.replace(needle,needle+helpers,1)

# Call the silhouette pass after existing production terrain
old="addThemeSignature(id,th);addBiomeSetPieces(id,th);addProductionTerrain(id,th);addGroundStoryDetails(id,th);addFinalThemeEdge(id,th);addMilestoneLayer(id,th);"
new="addThemeSignature(id,th);addBiomeSetPieces(id,th);addProductionTerrain(id,th);addBiomeSilhouetteV21(id,th);addGroundStoryDetails(id,th);addFinalThemeEdge(id,th);addMilestoneLayer(id,th);"
if old not in s: raise SystemExit('build call needle missing')
s=s.replace(old,new,1)

# Deepen best-view presets to show the new silhouette
old="const VIEW_PRESETS={\n'1':{yaw:.58,pitch:.54,dist:40},'2':{yaw:.70,pitch:.49,dist:39},'3':{yaw:.46,pitch:.52,dist:40},'4':{yaw:.76,pitch:.48,dist:41},\n'5':{yaw:.56,pitch:.46,dist:39},'6':{yaw:.66,pitch:.50,dist:40},'7':{yaw:.52,pitch:.51,dist:41},'8':{yaw:.60,pitch:.48,dist:40}}"
new="const VIEW_PRESETS={\n'1':{yaw:.73,pitch:.51,dist:44},'2':{yaw:.92,pitch:.50,dist:44},'3':{yaw:.43,pitch:.54,dist:45},'4':{yaw:.86,pitch:.47,dist:45},\n'5':{yaw:.68,pitch:.45,dist:44},'6':{yaw:.82,pitch:.51,dist:45},'7':{yaw:.54,pitch:.52,dist:46},'8':{yaw:.66,pitch:.48,dist:45}}"
if old in s:s=s.replace(old,new,1)

# Make attraction point carry a reference to the placed ride/furniture object
old="if(interest[p.itemId])attractionPoints.push({x:o.position.x,z:o.position.z,symbol:interest[p.itemId],kind:p.itemId,r:itemFootprint(p.itemId)})"
new="if(interest[p.itemId])attractionPoints.push({x:o.position.x,z:o.position.z,symbol:interest[p.itemId],kind:p.itemId,r:itemFootprint(p.itemId),ref:o})"
s=s.replace(old,new)

# Replace riding motion block with true moving seat anchors when available
old="""if(usingProp&&ud.activityPoint){const ap=ud.activityPoint,phase=t*.001+i*.73;if(['carousel','teacups','skySwing','cloudCoaster'].includes(kind)){const rr=Math.max(.55,ap.r*.55);sp.position.x=ap.x+Math.cos(phase*.7)*rr;sp.position.z=ap.z+Math.sin(phase*.7)*rr*.72;rideYOffset=.05+Math.abs(Math.sin(phase*.9))*.08}else if(kind==='miniTrain'){const rr=Math.max(.75,ap.r*.72);sp.position.x=ap.x+Math.cos(phase*.35)*rr;sp.position.z=ap.z+Math.sin(phase*.35)*rr*.72;rideYOffset=.04}else if(kind==='ferrisWheel'){sp.position.x=ap.x+Math.cos(phase*.42)*Math.max(.35,ap.r*.25);sp.position.z=ap.z;rideYOffset=.45+Math.sin(phase*.42)*.72}else if(kind==='trampoline'){rideYOffset=.12+Math.abs(Math.sin(phase*1.7))*.48}else if(kind==='slide'){sp.position.x+=(Math.sin(phase*.8))*0.035;rideYOffset=Math.abs(Math.sin(phase*.8))*.18}else if(kind==='balloonDock'){rideYOffset=.20+Math.sin(phase*.55)*.22}}"""
new="""if(usingProp&&ud.activityPoint){const ap=ud.activityPoint,phase=t*.001+i*.73,rideRef=ap.ref,seats=rideRef&&rideRef.userData&&rideRef.userData.seatAnchors;if(riding&&seats&&seats.length){rideRef.updateMatrixWorld(true);peopleGroup.updateMatrixWorld(true);const anchor=seats[i%seats.length],worldPos=new THREE.Vector3();anchor.getWorldPosition(worldPos);const localPos=peopleGroup.worldToLocal(worldPos.clone());sp.position.x=localPos.x;sp.position.z=localPos.z;sp.position.y=localPos.y+.04;walking=false;rideYOffset=0}else if(['carousel','teacups','skySwing','cloudCoaster'].includes(kind)){const rr=Math.max(.55,ap.r*.55);sp.position.x=ap.x+Math.cos(phase*.7)*rr;sp.position.z=ap.z+Math.sin(phase*.7)*rr*.72;rideYOffset=.05+Math.abs(Math.sin(phase*.9))*.08}else if(kind==='miniTrain'){const rr=Math.max(.75,ap.r*.72);sp.position.x=ap.x+Math.cos(phase*.35)*rr;sp.position.z=ap.z+Math.sin(phase*.35)*rr*.72;rideYOffset=.04}else if(kind==='ferrisWheel'){sp.position.x=ap.x+Math.cos(phase*.42)*Math.max(.35,ap.r*.25);sp.position.z=ap.z;rideYOffset=.45+Math.sin(phase*.42)*.72}else if(kind==='trampoline'){rideYOffset=.12+Math.abs(Math.sin(phase*1.7))*.48}else if(kind==='slide'){sp.position.x+=(Math.sin(phase*.8))*0.035;rideYOffset=Math.abs(Math.sin(phase*.8))*.18}else if(kind==='balloonDock'){rideYOffset=.20+Math.sin(phase*.55)*.22}}"""
if old not in s: raise SystemExit('ride interaction block missing')
s=s.replace(old,new,1)

# Rides animate first, spirits then snap to seat anchors
s=s.replace("camera.position.lerp(desired,.075);camera.lookAt(look);updateSpirits(t);updateRides(t);", "camera.position.lerp(desired,.075);camera.lookAt(look);updateRides(t);updateSpirits(t);",1)

# Add a compact art-pass badge
s=s.replace("<div class=\"corner-note\">拖曳旋轉 · 滾輪/雙指縮放 · 小精靈會自由散步與聊天。</div>","<div class=\"corner-note\">v2.1 ART PRODUCTION · 八組不同地形剪影 · 遊樂設施可搭乘 · 核心資料格式凍結</div>",1)

p.write_text(s,encoding='utf-8')
print('patched',p)
