from pathlib import Path
import re
p=Path('/mnt/data/emotion_island_v26_biome_rebalance/emotion_my_world.html')
s=p.read_text(encoding='utf-8')
orig=s

# Version labels only. Keep storage/data contract unchanged.
s=s.replace('<title>情緒不孤島｜我的小世界 v2.3</title>','<title>情緒不孤島｜我的小世界 v2.6</title>')
s=s.replace('v2.5 FINAL ASSET REMASTER · 最終物件美術版','v2.6 BIOME REBALANCE · 場景構圖精修版')
s=s.replace('v2.5 FINAL · 物件資產重製 · 核心功能凍結','v2.6 BIOME REBALANCE · 空間 / 構圖 / 舒適度精修')

# --- Group 3: reduce tree wall and preserve real editable clearings ---
old=""" }else if(id==='3'){
   t1=biomeTerraceV23(th,0,4.8,6.3,3.5,2.70);t2=biomeTerraceV23(th,-8.0,-.2,2.7,2.5,2.10);t3=biomeTerraceV23(th,8.0,-.4,2.7,2.4,2.15);
   addHeroV23('hero_world_tree','giantTree',0,4.8,t1+.08,.92,th.accent);const camp=decorObject('campfire',th.accent);addAuto(camp,5,0,-3.5,1.15,1.68);const cot=decorObject('cottage',th.accent);addAuto(cot,8,7.8,-.5,1.08,t3+.10);
   for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=10.5+(i%3)*.7,tr=tree(false,i%2?0x2d7447:0x397f4f,true);tr.position.set(Math.cos(a)*r,1.70,Math.sin(a)*r*.76);tr.scale.multiplyScalar(.72+(i%3)*.08);root.add(tr)}
"""
new=""" }else if(id==='3'){
   t1=biomeTerraceV23(th,0,5.2,5.5,3.0,2.70);t2=biomeTerraceV23(th,-8.2,2.0,2.45,2.15,2.05);t3=biomeTerraceV23(th,8.2,1.7,2.45,2.10,2.10);
   addHeroV23('hero_world_tree','giantTree',0,5.2,t1+.08,.92,th.accent);const camp=decorObject('campfire',th.accent);addAuto(camp,5,-3.8,-2.7,1.12,1.68);const cot=decorObject('cottage',th.accent);addAuto(cot,8,7.9,2.0,1.04,t3+.10);
   // Keep the forest identity on the back/perimeter, not across every buildable ring.
   const grove=[[-10.2,6.1],[-7.8,8.0],[-3.8,9.4],[3.7,9.5],[7.7,8.0],[10.3,5.8],[-10.6,1.5],[10.7,1.2]];
   grove.forEach((q,i)=>{const tr=tree(false,i%2?0x2d7447:0x397f4f,true);tr.position.set(q[0],1.70,q[1]);tr.scale.multiplyScalar(.68+(i%3)*.07);root.add(tr)});
"""
if old not in s: raise SystemExit('buildBiomeCore group3 block not found')
s=s.replace(old,new)

old="""  }else if(id==='3'){
    for(const q of[[-7,2.8,2.8],[6.4,3.4,2.5],[-5.8,-4.4,2.3],[6.6,-4.5,2.5]])productionDisc(q[0],q[1],q[2],q[2]*.72,1.70,darker);
    for(let i=0;i<15;i++){const a=i/15*Math.PI*2,r=10.0+(i%3)*.8;const o=tree(false,i%2?0x2f754a:0x3c8d55,1);o.position.set(Math.cos(a)*r,1.68,Math.sin(a)*r*.78);o.scale.multiplyScalar(.68+(i%2)*.12);productionGroup.add(o)}
"""
new="""  }else if(id==='3'){
    for(const q of[[-7.4,3.9,2.6],[6.8,4.2,2.35],[-6.8,-4.7,2.05],[7.2,-4.8,2.15]])productionDisc(q[0],q[1],q[2],q[2]*.70,1.70,darker);
    // A lighter perimeter grove leaves the center and front half intentionally usable.
    const edgeTrees=[[-10.4,7.4],[-6.7,9.0],[0,10.2],[6.7,9.0],[10.4,7.2],[-11.0,-2.2],[11.1,-2.0],[-9.4,-6.6],[9.6,-6.4]];
    edgeTrees.forEach((q,i)=>{const o=tree(false,i%2?0x2f754a:0x3c8d55,1);o.position.set(q[0],1.68,q[1]);o.scale.multiplyScalar(.66+(i%2)*.10);productionGroup.add(o)})
"""
if old not in s: raise SystemExit('addProductionTerrain group3 block not found')
s=s.replace(old,new)

old="""  if(id==='3'){for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=8.4+(i%2)*1.0;add(tree(false,i%2?0x2f8f57:0x3fa065),4,Math.cos(a)*r,Math.sin(a)*r*.82,.95)}add(decorObject('cottage',0x78c98b),10,-6.2,4.8,.9)}
"""
new="""  if(id==='3'){for(const q of[[-9.1,5.3],[9.0,5.0],[-9.5,-3.6],[9.4,-3.4]])add(tree(false,q[0]<0?0x2f8f57:0x3fa065),4,q[0],q[1],.82);add(decorObject('cottage',0x78c98b),10,-7.2,5.4,.86)}
"""
if old not in s: raise SystemExit('addThemeSignature group3 line not found')
s=s.replace(old,new)

old="""  }else if(id==='3'){
    // Deep forest village: dense grove, camp, cabin, mushrooms.
    for(let i=0;i<13;i++){const a=i/13*Math.PI*2,r=6.2+(i%3)*1.2;add(i%4===0?'pineTree':'shrub',4+Math.floor(i/4),Math.cos(a)*r,Math.sin(a)*r*.78,i%4===0?1.1:.88)}add('giantTree',12,-5.8,3.5,1.2);add('cottage',9,5.6,4.0,1.1);add('campfire',7,0,-4.1,1.1);ring(0,-4.1,1.45,8,'mushroom',.62,6);add('hammock',11,-6.4,-3.7,1.0);add('fireflyLamp',10,6.7,-3.6,1.0);
"""
new="""  }else if(id==='3'){
    // Forest village with breathing room: activity pockets frame three open buildable lawns.
    for(const q of[[-9.0,5.8,'pineTree',1.0],[-7.6,7.1,'shrub',.82],[8.8,5.6,'pineTree',1.0],[7.4,7.0,'shrub',.82],[-9.2,-4.2,'shrub',.78],[9.0,-4.0,'shrub',.78]])add(q[2],5,q[0],q[1],q[3]);
    add('cottage',9,6.8,4.9,1.02);add('campfire',7,-4.1,-2.8,1.04);ring(-4.1,-2.8,1.18,5,'mushroom',.54,6);add('hammock',11,-7.6,1.4,.92);add('fireflyLamp',10,7.7,-2.9,.90);
"""
if old not in s: raise SystemExit('addBiomeSetPieces group3 block not found')
s=s.replace(old,new)

# Reduce yet another group-3 outer tree ring from final layer.
old="""    for(const spec of[[0,-.5,6.2,4.1,0x284e38],[-7,4,3.1,2.0,0x315d40],[7,3.6,3.0,1.8,0x315b42]]){const d=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.11,34),productionMat(spec[5],.94,0));d.scale.set(spec[2],1,spec[3]);d.position.set(spec[0],1.70,spec[1]);root.add(d)}v24Walkway([[-9,-5],[-6,-3.5],[-3,-2.4],[0,-1.5],[3,.5],[5.5,3],[7.5,5.8]],th,.62);for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=11.2+(i%2)*1.3,tr=tree(false,i%2?0x285b39:0x346c43,true);tr.position.set(Math.cos(a)*r,1.72,Math.sin(a)*r*.72);tr.scale.multiplyScalar(.82);root.add(tr)}
"""
new="""    for(const spec of[[0,.1,5.5,3.5,0x315c3e],[-6.9,4.6,2.7,1.7,0x3b6846],[7.0,4.4,2.7,1.7,0x3a6648]]){const d=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.085,34),productionMat(spec[4],.94,0));d.scale.set(spec[2],1,spec[3]);d.position.set(spec[0],1.665,spec[1]);root.add(d)}v24Walkway([[-9,-5],[-6.4,-3.8],[-3.2,-2.6],[0,-1.6],[3.2,.3],[5.8,2.8],[7.6,5.6]],th,.62);for(const q of[[-10.8,7.0],[-5.3,9.0],[5.3,9.1],[10.8,6.8],[-11.4,-1.5],[11.4,-1.4]]){const tr=tree(false,q[0]<0?0x285b39:0x346c43,true);tr.position.set(q[0],1.72,q[1]);tr.scale.multiplyScalar(.74);root.add(tr)}
"""
if old not in s: raise SystemExit('final layer group3 inner line not found')
s=s.replace(old,new)

# Group 7: remove the overlapping large transparent pool from the core to eliminate animated z-fighting.
s=s.replace("   biomePool(th,0,-.2,5.3,3.15,0);crystalCanyonV23(th);t1=biomeTerraceV23(th,-7.4,2.8,3.0,4.5,4.35);",
            "   crystalCanyonV23(th);t1=biomeTerraceV23(th,-7.4,2.8,3.0,4.5,4.35);")

# Insert v2.6 visual-only helpers before final world layer.
needle="function addFinalWorldLayerV24(id,th){"
if needle not in s: raise SystemExit('final layer function marker not found')
helpers=r'''function v26GroundPatch(th,x,z,rx,rz,color,rot=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.055,34),productionMat(color,.92,0));m.scale.set(rx,1,rz);m.position.set(x,1.667,z);m.rotation.y=rot;m.receiveShadow=true;root.add(m);return m}
function v26Stream(th,points,width=.82,color=null){for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),w=new THREE.Mesh(new THREE.PlaneGeometry(len+.45,width),new THREE.MeshStandardMaterial({color:color||th.waterShallow,roughness:.30,metalness:.02,transparent:false,side:THREE.DoubleSide}));w.rotation.x=-Math.PI/2;w.rotation.z=-Math.atan2(dz,dx);w.position.set((a[0]+b[0])*.5,1.693,(a[1]+b[1])*.5);root.add(w)}}
function v26FlowerBand(th,cx,cz,rx,rz,count=40,palette=[]){const cols=palette.length?palette:[th.flower,th.accent,th.sun];for(let i=0;i<count;i++){const a=i*2.399963,r=Math.sqrt((i+.45)/count),x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r,f=new THREE.Mesh(new THREE.IcosahedronGeometry(.065+(i%3)*.012,0),toon(cols[i%cols.length]));f.position.set(x,1.72,z);f.scale.set(1,.68,1);root.add(f)}}
function v26SunCourt(th,x,z,r=2.15){const g=new THREE.Group(),base=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.96,.09,36),productionMat(new THREE.Color(th.path).offsetHSL(0,-.12,.12).getHex(),.88,0));base.position.y=.045;g.add(base);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.38,.46,.12,24),toon(new THREE.Color(th.sun).offsetHSL(0,.04,-.08).getHex()));hub.position.y=.12;g.add(hub);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,ray=new THREE.Mesh(new THREE.BoxGeometry(r*.72,.045,.12),toon(i%2?th.sun:th.accent));ray.position.set(Math.cos(a)*r*.46,.11,Math.sin(a)*r*.46);ray.rotation.y=-a;g.add(ray)}g.position.set(x,1.685,z);root.add(g);addThemeBlocker(x,z,r*.82);return g}
function v26Ribbon(th,points,color,opacity=.48){const pts=points.map(p=>new THREE.Vector3(p[0],p[1],p[2])),curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'),tube=new THREE.Mesh(new THREE.TubeGeometry(curve,72,.035,6,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(markGlow(tube));return tube}
function v26StableCrystalBasin(th,x=0,z=-.25,inner=2.55,outer=6.0,scaleZ=.72){const g=new THREE.Group(),bed=new THREE.Mesh(new THREE.CircleGeometry(outer,72),productionMat(new THREE.Color(th.rock).offsetHSL(0,-.06,.04).getHex(),.92,0));bed.rotation.x=-Math.PI/2;bed.scale.z=scaleZ;bed.position.y=0;g.add(bed);const waterMatStable=new THREE.MeshStandardMaterial({color:new THREE.Color(th.waterShallow).lerp(new THREE.Color(th.accent),.18).getHex(),roughness:.34,metalness:.04,transparent:false,depthWrite:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const lake=new THREE.Mesh(new THREE.RingGeometry(inner,outer-.18,96),waterMatStable);lake.rotation.x=-Math.PI/2;lake.scale.z=scaleZ;lake.position.y=.035;g.add(lake);const outerRim=new THREE.Mesh(new THREE.TorusGeometry(outer-.08,.11,8,96),toon(new THREE.Color(th.accent).offsetHSL(0,-.08,-.10).getHex()));outerRim.rotation.x=Math.PI/2;outerRim.scale.z=scaleZ;outerRim.position.y=.075;g.add(outerRim);const island=new THREE.Mesh(new THREE.CylinderGeometry(inner*.86,inner*.94,.20,28),productionMat(new THREE.Color(th.grass2).offsetHSL(0,-.05,-.10).getHex(),.85,0));island.scale.z=scaleZ;island.position.y=.14;g.add(island);const innerRim=new THREE.Mesh(new THREE.TorusGeometry(inner*.90,.08,8,72),toon(new THREE.Color(th.rock).offsetHSL(0,-.02,.13).getHex()));innerRim.rotation.x=Math.PI/2;innerRim.scale.z=scaleZ;innerRim.position.y=.245;g.add(innerRim);g.position.set(x,1.665,z);root.add(g);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;addThemeBlocker(x+Math.cos(a)*(inner+outer)*.48,z+Math.sin(a)*(inner+outer)*.48*scaleZ,(outer-inner)*.30)}return g}
function v26ForestOpenSpace(th){v26GroundPatch(th,-1.3,-2.1,3.3,2.2,new THREE.Color(th.grass2).offsetHSL(.01,-.08,.055).getHex(),-.08);v26GroundPatch(th,4.8,-3.3,2.3,1.55,new THREE.Color(th.grass).offsetHSL(.02,-.06,.04).getHex(),.12);v26GroundPatch(th,-6.0,1.2,1.8,1.25,new THREE.Color(th.grass2).offsetHSL(-.01,-.04,.02).getHex(),-.18);v26Stream(th,[[-7.8,-5.4],[-5.8,-4.7],[-3.8,-4.1],[-1.7,-3.8],[.4,-3.1],[2.5,-2.2]],.52,new THREE.Color(th.waterShallow).offsetHSL(0,-.02,.02).getHex());v26FlowerBand(th,2.8,-3.6,1.7,.70,30,[0xd7e5a3,0xa4d892,0xb9ead1])}
function v26DawnComposition(th){v26SunCourt(th,4.6,-1.2,2.05);v26Stream(th,[[8.7,4.3],[7.2,2.8],[6.0,1.4],[5.1,.0],[4.7,-1.7],[5.2,-3.5],[6.5,-5.4]],.62,0x68aeb5);for(let i=0;i<4;i++){v26GroundPatch(th,-8.2+i*1.55,-3.3+i*.72,1.45,.58,new THREE.Color(i%2?0xd7a652:0xc58d43).offsetHSL(0,-.03,.02).getHex(),-.42);v26FlowerBand(th,-8.2+i*1.55,-3.3+i*.72,1.15,.34,18,[0xf3c567,0xe9a95b,0xffdf91])}const gate=decorObject('arch',th.accent);gate.position.set(7.1,1.70,5.0);gate.scale.setScalar(.92);gate.rotation.y=-.35;root.add(gate);addThemeBlocker(7.1,5.0,1.15);v26Ribbon(th,[[-9,5.9,5],[-6,7.0,3],[-2,7.8,1],[2,7.4,-1],[6,6.3,-3]],0xf6c16f,.28)}
function v26FlowerComposition(th){v26Stream(th,[[-8.6,4.0],[-6.4,2.8],[-4.5,1.6],[-2.3,.8],[0,.2],[2.5,-.8],[5.0,-2.1],[8.4,-3.5]],.70,0x67b8b2);v26FlowerBand(th,-5.0,-1.9,3.1,1.45,70,[0xe58fb7,0xf3b5d0,0xe1b2ef,0xffd38f]);v26FlowerBand(th,5.4,2.0,3.0,1.55,72,[0xf2a5c8,0xc69be7,0xf5cf83,0xa5d49a]);for(const q of[[-7.8,5.1],[7.6,5.0]]){const ar=decorObject('arch',th.accent);ar.position.set(q[0],1.70,q[1]);ar.scale.setScalar(.82);ar.rotation.y=q[0]<0?.35:-.35;root.add(ar);addThemeBlocker(q[0],q[1],1.02)}v26Ribbon(th,[[-9,7,3],[-5,8.5,1],[-1,8,-1],[3,8.7,-2],[8,7.2,-4]],0xf0a7cf,.35);v26Ribbon(th,[[-8,6.2,-2],[-4,7.4,-4],[0,6.8,-5],[4,7.5,-3],[8,6.4,-1]],0xb998e4,.28)}
function addV26BiomeRebalance(id,th){if(id==='3')v26ForestOpenSpace(th);else if(id==='4')v26DawnComposition(th);else if(id==='6')v26FlowerComposition(th);else if(id==='7'){for(const q of[[-4.9,-3.8],[-2.8,-4.7],[2.7,-4.7],[5.0,-3.7]]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.24,.28,.08,10),productionMat(new THREE.Color(th.path).offsetHSL(0,-.08,.10).getHex(),.9,0));st.scale.z=.72;st.position.set(q[0],1.72,q[1]);root.add(st)}}}
'''
s=s.replace(needle,helpers+needle,1)

# Group 7 final lake replacement: no transparent overlapping geometry.
old="""  }else if(id==='7'){
    // Crystal canyon: central lake ring + narrow inner island. Almost no generic green center remains.
    const base=new THREE.Mesh(new THREE.CylinderGeometry(6.5,6.8,.18,28),productionMat(0x294f56,.9,0));base.position.set(0,1.68,-.25);base.scale.z=.80;root.add(base);v24LakeRing(th,0,-.25,2.4,6.1,.72);const inner=new THREE.Mesh(new THREE.CylinderGeometry(2.15,2.35,.22,24),productionMat(0x536f70,.82,0));inner.position.set(0,1.80,-.25);inner.scale.z=.82;root.add(inner);for(let i=0;i<30;i++){const side=i<15?-1:1,z=-7+(i%15)*.95,h=1.2+(i%5)*.55;biomeSpire(th,side*(6.5+(i%4)*.55),z,h,i%3===0?0xa6fbff:(i%3===1?0x64dce8:0x8ca6ff))}v24Walkway([[0,-7],[0,-5.4],[0,-3.7],[0,-2.5]],th,.48);addThemeBlocker(0,-.25,5.7);
"""
new="""  }else if(id==='7'){
    // Crystal canyon: one stable opaque basin. No overlapping transparent water layers -> no black shimmer / z-fighting.
    v26StableCrystalBasin(th,0,-.25,2.55,6.05,.72);for(let i=0;i<24;i++){const side=i<12?-1:1,z=-6.5+(i%12)*1.06,h=1.10+(i%5)*.48;biomeSpire(th,side*(6.7+(i%4)*.52),z,h,i%3===0?0xa6fbff:(i%3===1?0x64dce8:0x8ca6ff))}v24Walkway([[0,-7.0],[0,-5.6],[0,-4.2],[0,-3.0]],th,.48);addThemeBlocker(0,-.25,5.55);
"""
if old not in s: raise SystemExit('final group7 block not found')
s=s.replace(old,new)

# Add v2.6 visual layer after final V24 layer, before milestone rings.
s=s.replace('addFinalWorldLayerV24(id,th);addMilestoneLayer(id,th);','addFinalWorldLayerV24(id,th);addV26BiomeRebalance(id,th);addMilestoneLayer(id,th);',1)

# More flattering best views for the four changed worlds; leave group 8 untouched as benchmark.
s=s.replace("'1':{yaw:.18,pitch:.43,dist:51},'2':{yaw:-.82,pitch:.50,dist:49},'3':{yaw:.70,pitch:.39,dist:52},'4':{yaw:-1.03,pitch:.43,dist:51},\n'5':{yaw:.90,pitch:.39,dist:50},'6':{yaw:-.62,pitch:.48,dist:50},'7':{yaw:-.04,pitch:.58,dist:53},'8':{yaw:-.40,pitch:.40,dist:52}}",
"'1':{yaw:.18,pitch:.43,dist:51},'2':{yaw:-.82,pitch:.50,dist:49},'3':{yaw:.62,pitch:.36,dist:48},'4':{yaw:-.94,pitch:.39,dist:49},\n'5':{yaw:.90,pitch:.39,dist:50},'6':{yaw:-.56,pitch:.40,dist:48},'7':{yaw:.18,pitch:.43,dist:49},'8':{yaw:-.40,pitch:.40,dist:52}}",1)

# Update only visible group-7 biome subtitle; data theme name remains compatible.
s=s.replace('第七組 · 晶語島 · 晶湖大峽谷','第七組 · 晶語島 · 晶湖靜谷')

p.write_text(s,encoding='utf-8')
print('patched', len(orig), '->', len(s))
