from pathlib import Path
import re

root = Path('/mnt/data/emotion_island_v17')
small = root/'emotion_my_world.html'
score = root/'emotion_score.html'
main = root/'emotion_island.html'

# ---------------- small world ----------------
t = small.read_text(encoding='utf-8')
t = t.replace('v1.6', 'v1.7')
t = t.replace("emotionIslandV16:", "emotionIslandV17:")
t = t.replace("emotionIslandEditorLockV16:", "emotionIslandEditorLockV17:")

# Score pane: single submission workflow, no deductions.
t = re.sub(
    r'<div class="score-quick">[\s\S]*?</div><div class="score-set"><input id="scoreInput" type="number" inputmode="numeric" min="0" placeholder="直接輸入總分"><button id="setScoreBtn">設定</button></div><div class="score-note">[\s\S]*?</div>',
    '<div class="score-set"><input id="scoreInput" type="number" inputmode="numeric" min="0" placeholder="輸入新的總分（只能增加）"><button id="setScoreBtn">送出</button></div><div class="score-note">分數只會增加，不提供扣分。輸入新的總分後按「送出」；若要歸零，請由主辦方使用主畫面的重置功能。</div>',
    t, count=1)

# Add a proper local toast function. IDs can otherwise create a window.toast element in browser globals.
needle = "let gid='',group=null,allGroups=D.normalizeAll({}),shopCategory='全部',selectedItem='',layoutDraft=null,layoutDirty=false,ghostObject=null,ghostSlot=-1,ghostValid=false,ghostRot=0,placementSurface=null,placementBlockers=[],previewRenderer=null,previewScene=null,previewCamera=null,previewObject=null,previewItemId='';"
insert = needle + "\nconst toastNode=document.getElementById('toast');let toastTimer=0;function toast(message){if(!toastNode)return;toastNode.textContent=String(message||'');toastNode.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('show'),1800)}"
if needle not in t:
    raise SystemExit('small state needle missing')
t = t.replace(needle, insert, 1)

# Balanced mid-bright art target: brighter base, less bloom wash.
t = t.replace("renderer.toneMappingExposure=.84", "renderer.toneMappingExposure=.96")
t = t.replace("renderer.domElement.style.filter='saturate(1.16) contrast(1.08) brightness(.93)'", "renderer.domElement.style.filter='saturate(1.20) contrast(1.07) brightness(.985)'")
t = t.replace("new Uint8Array([24,26,36,74,78,91,145,151,164,210,216,226])", "new Uint8Array([30,32,42,86,90,104,160,166,180,228,233,240])")
t = t.replace("bloomPass=new THREE.UnrealBloomPass(res,mobile?.20:.30,.52,.72)", "bloomPass=new THREE.UnrealBloomPass(res,mobile?.16:.24,.46,.82)")
t = t.replace("gl_FragColor=b+g*.34;", "gl_FragColor=b+g*.24;")

# Harmonize palettes. Keep group identity but align value/saturation to the successful group-8 feel.
themes_new = """const THEMES={
'1':{name:'星辰山水',sky:[0x0b2450,0x4267a2],water:0x1b789e,waterDeep:0x0b456b,waterShallow:0x59b7c2,grass:0x4a9464,grass2:0x7bc38a,rock:0x3b4762,path:0xd3b981,accent:0x72d7e8,flower:0xbac7f5,sun:0xcbd7ea,fog:0x213956,special:'stars',tree:'pine'},
'2':{name:'櫻霞庭園',sky:[0x29345c,0x956f91],water:0x267e9f,waterDeep:0x194f70,waterShallow:0x66bac1,grass:0x548f62,grass2:0x89bc79,rock:0x594755,path:0xd8b789,accent:0xe692b7,flower:0xefb8cf,sun:0xe8c6b3,fog:0x4c4055,special:'sakura',tree:'sakura'},
'3':{name:'翡翠森境',sky:[0x163b43,0x5c806e],water:0x207f90,waterDeep:0x104b58,waterShallow:0x63b6a6,grass:0x3e8450,grass2:0x75ae6c,rock:0x3c4a42,path:0xcdb47f,accent:0x86d6a0,flower:0xcfe8ab,sun:0xd7dfb8,fog:0x2b4540,special:'forest',tree:'oak'},
'4':{name:'晨曦山谷',sky:[0x25476c,0xa77a68],water:0x267fa1,waterDeep:0x154f70,waterShallow:0x68b6ba,grass:0x55905d,grass2:0x8abd78,rock:0x604b50,path:0xdcb77e,accent:0xe9ad68,flower:0xe9ca8e,sun:0xe8c88f,fog:0x4c515d,special:'dawn',tree:'oak'},
'5':{name:'月汐夜海',sky:[0x111d42,0x455e91],water:0x1d648c,waterDeep:0x0d375e,waterShallow:0x4a93ad,grass:0x487d65,grass2:0x6fa283,rock:0x3b4159,path:0xbcae83,accent:0xa9b8e8,flower:0xc8c3eb,sun:0xbecbe1,fog:0x263450,special:'moon',tree:'pine'},
'6':{name:'花風原野',sky:[0x30375f,0x806f99],water:0x267d9a,waterDeep:0x124c65,waterShallow:0x68b5b9,grass:0x55915e,grass2:0x86bb75,rock:0x544858,path:0xd7b27f,accent:0xc59ee0,flower:0xe8aac7,sun:0xe7c8b5,fog:0x41435f,special:'flowers',tree:'sakura'},
'7':{name:'晶湖秘境',sky:[0x12354c,0x397486],water:0x1a839c,waterDeep:0x0d465b,waterShallow:0x5cc7c1,grass:0x42866b,grass2:0x70b493,rock:0x334855,path:0xcab98d,accent:0x74dfe2,flower:0xaee9df,sun:0xcbe8e7,fog:0x23434d,special:'crystal',tree:'oak'},
'8':{name:'希望極光',sky:[0x151f43,0x53669d],water:0x247697,waterDeep:0x103f61,waterShallow:0x62b5bd,grass:0x518d60,grass2:0x84bd7c,rock:0x44425b,path:0xd9b67f,accent:0xb6a8e3,flower:0xd7b5e8,sun:0xe5cfa0,fog:0x303b57,special:'hope',tree:'pine'}}"""
t = re.sub(r"const THEMES=\{[\s\S]*?\}\nconst renderer=", themes_new+"\nconst renderer=", t, count=1)

# Lighting: between v1.5 and v1.6, with slightly warm focal key + cool fill.
t = t.replace("scene.fog=new THREE.Fog(th.fog,78,150)", "scene.fog=new THREE.Fog(th.fog,92,172)")
t = t.replace("const hemi=new THREE.HemisphereLight(0xa9c6d9,0x111b2f,.28)", "const hemi=new THREE.HemisphereLight(0xb9cfdf,0x18243a,.38)")
t = t.replace("const dl=new THREE.DirectionalLight(th.sun,1.08)", "const dl=new THREE.DirectionalLight(th.sun,1.28)")
t = t.replace("const fill=new THREE.DirectionalLight(th.accent,.20)", "const fill=new THREE.DirectionalLight(th.accent,.30)")
t = t.replace("const rimLight=new THREE.DirectionalLight(0x607bd2,.13)", "const rimLight=new THREE.DirectionalLight(0x7189c2,.18)")

# Add gentle focal lights after rim light.
old_light_tail = "rimLight.position.set(-12,8,-20);rimLight.userData.envLight=1;scene.add(rimLight);"
new_light_tail = old_light_tail + "const focalWarm=new THREE.PointLight(th.sun,.20,20,2);focalWarm.position.set(-5,7,4);focalWarm.userData.envLight=1;scene.add(focalWarm);const focalCool=new THREE.PointLight(th.accent,.16,18,2);focalCool.position.set(6,5,-4);focalCool.userData.envLight=1;scene.add(focalCool);"
t = t.replace(old_light_tail, new_light_tail, 1)

# Centerpiece glow should be selective, not entire object.
t = t.replace("const ring=(r,tube,color,rx=.0,rz=.0,op=.66)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,tube,10,72),new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false}));o.rotation.x=rx;o.rotation.z=rz;g.add(o);return o};", "const ring=(r,tube,color,rx=.0,rz=.0,op=.66)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,tube,10,72),new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false}));o.rotation.x=rx;o.rotation.z=rz;g.add(markGlow(o));return o};")
t = t.replace("const star=(x,y,z,scale,color=accent)=>{const o=new THREE.Mesh(new THREE.OctahedronGeometry(scale,0),toon(color,{emissive:color,emissiveIntensity:.18}));o.position.set(x,y,z);g.add(o);return o};", "const star=(x,y,z,scale,color=accent)=>{const o=new THREE.Mesh(new THREE.OctahedronGeometry(scale,0),toon(color,{emissive:color,emissiveIntensity:.12}));o.position.set(x,y,z);g.add(markGlow(o));return o};")
t = t.replace("g.userData.centerpiece=true;markGlow(g);\n  return g;", "g.userData.centerpiece=true;\n  return g;")

# Replace group 5 moon centerpiece with a stable pearl moon orb.
old_group5 = """  }else if(id==='5'){
    const cres=new THREE.Mesh(new THREE.TorusGeometry(1.45,.42,14,72,Math.PI*1.58),coreMaterial(0xbacbff,0x5b77c8,.16));cres.rotation.z=.48;g.add(cres);
    for(let i=0;i<13;i++){const a=i/13*Math.PI*2;star(Math.cos(a)*2.15,Math.sin(a)*1.45,(i%3-.8)*.16,.06,i%2?0xcbd6ff:0x8da7ff)}
    ring(2.35,.025,0x9faeff,Math.PI/2.35,-.22,.35);
"""
new_group5 = """  }else if(id==='5'){
    const moon=new THREE.Mesh(new THREE.SphereGeometry(1.34,34,24),coreMaterial(0xaebcda,0x314b78,.08));moon.rotation.y=.28;g.add(moon);
    const craterMat=coreMaterial(0x7181a6,0x000000,0);for(const q of[[.52,.34,1.17,.17],[-.42,.50,1.19,.14],[.18,-.48,1.23,.12],[-.55,-.22,1.17,.10]]){const c=new THREE.Mesh(new THREE.SphereGeometry(q[3],12,8),craterMat);c.position.set(q[0],q[1],q[2]);c.scale.z=.22;g.add(c)}
    ring(1.95,.035,0xa8b9e8,Math.PI/2.45,.25,.55);ring(2.32,.022,0x6f8fc4,Math.PI/1.92,-.35,.26);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;star(Math.cos(a)*2.30,Math.sin(a*.8)*.58,Math.sin(a)*2.30,.052,i%2?0xc7d2ed:0x8fa7d4)}
"""
if old_group5 not in t:
    raise SystemExit('group5 centerpiece block not found')
t = t.replace(old_group5, new_group5, 1)

# Add richer micro-detail helper and call it.
anchor = "function pathPebbles(points,col){points.forEach((p,i)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.38+(i%3)*.08,.42+(i%3)*.08,.08,9),toon(col));m.scale.z=.72;m.position.set(p[0],1.55,p[1]);m.rotation.y=(i%4)*.35;root.add(m)})}\n"
micro = anchor + """function addGroundStoryDetails(id,th){
  const colors=[th.grass2,th.flower,th.accent,th.path];
  for(let i=0;i<38;i++){
    const a=i*2.399963+Number(id)*.41,r=5.0+(i%11)*.48,x=Math.cos(a)*r,z=Math.sin(a)*r*.79;
    if(Math.hypot(x,z)<3.3)continue;
    if(i%4===0){const tuft=new THREE.Group();for(let k=0;k<3;k++){const blade=new THREE.Mesh(new THREE.ConeGeometry(.045,.38+(k%2)*.12,5),toon(new THREE.Color(th.grass2).offsetHSL((k-1)*.015,.02,-.02).getHex()));blade.position.set((k-1)*.09,.19,Math.sin(k)*.06);blade.rotation.z=(k-1)*.16;tuft.add(blade)}tuft.position.set(x,1.70,z);root.add(tuft)}
    else if(i%4===1){const peb=new THREE.Mesh(new THREE.DodecahedronGeometry(.10+(i%3)*.035,0),toon(new THREE.Color(th.rock).offsetHSL(0,-.02,.10+(i%2)*.03).getHex()));peb.position.set(x,1.66,z);peb.scale.set(1,.72,1.3);root.add(peb)}
    else {const f=new THREE.Mesh(new THREE.SphereGeometry(.055+(i%2)*.012,7,5),toon(colors[i%colors.length]));f.position.set(x,1.74,z);root.add(f)}
  }
}
"""
t = t.replace(anchor, micro, 1)
t = t.replace("addThemeSignature(id,th);\nwaterG=", "addThemeSignature(id,th);addGroundStoryDetails(id,th);\nwaterG=", 1)

# Improve demo layouts: all 8 are full final showcases, 16 spirits, richer decor.
layouts_new = """    const layouts={
      '1':['telescope','crystal','starLamp','bench','pineTree','rockGarden','moonLamp','picnic','pond','teaTable','mushroom','giantTree','lantern','easel','signpost','campfire'],
      '2':['sakura','sakura','flowerPatch','bench','gazebo','mushroom','lantern','picnic','shrub','arch','lotusPond','teaTable','moonLamp','easel','signpost','fountain'],
      '3':['giantTree','cottage','bench','campfire','shrub','fireflyLamp','pineTree','hammock','rockGarden','gazebo','mushroom','pond','signpost','easel','teaTable','lantern'],
      '4':['lantern','starLamp','gazebo','bench','torii','flowerPatch','fountain','teaTable','windmill','signpost','picnic','telescope','cottage','campfire','easel','pond'],
      '5':['telescope','crystal','moonLamp','pond','lantern','bench','gazebo','rockGarden','picnic','fireflyLamp','arch','hammock','lotusPond','starLamp','easel','teaTable'],
      '6':['flowerPatch','mushroom','sakura','gazebo','picnic','bench','lotusPond','shrub','lantern','fountain','teaTable','arch','swing','hammock','easel','signpost'],
      '7':['crystal','rockGarden','crystal','fountain','arch','starLamp','bench','pond','gazebo','telescope','crystal','lotusPond','fireflyLamp','moonLamp','easel','teaTable'],
      '8':['giantTree','starLamp','telescope','gazebo','bench','crystal','torii','campfire','flowerPatch','moonLamp','tent','musicStage','fountain','easel','signpost','teaTable']
    };
    const slots=[28,32,36,40,44,48,52,56,60,64,69,73,77,81,85,89];"""
t = re.sub(r"    const layouts=\{[\s\S]*?\n    \};\n    const slots=\[[^\]]+\];", layouts_new, t, count=1)
t = t.replace("g.score=1600;g.progressScore=1600;g.spendablePoints=3600;g.maxMembers=16;", "g.score=1600;g.progressScore=1600;g.spendablePoints=2400;g.maxMembers=16;")

# Monotonic score functions (no deductions).
setscore_new = """  async function setScore(id, value) {
    value=clamp(Math.round(Number(value)||0),0,999999);
    if (ensureFirebase()) {
      const ref=db.ref(`${basePath()}/${id}`); let reason='';
      const r=await ref.transaction(raw=>{
        const g=normalizeGroup(raw,id); if(value<g.score){reason='分數只能增加，不能扣分';return;}
        const diff=value-g.score;g.score=value;g.progressScore=Math.max(g.progressScore,value);if(diff>0)g.spendablePoints+=diff;g.updatedAt=now();return g;
      });
      return r.committed?{ok:true}:{ok:false,error:reason||'送出失敗'};
    }
    const current=readLocal()[id]; if(value<current.score)return {ok:false,error:'分數只能增加，不能扣分'};
    return mutateLocalGroup(id,g=>{const diff=value-g.score;g.score=value;g.progressScore=Math.max(g.progressScore,value);if(diff>0)g.spendablePoints+=diff;});
  }
  async function addScore(id, delta) {
    delta=Math.round(Number(delta)||0);if(delta<=0)return {ok:false,error:'分數只能增加'};
    if (ensureFirebase()) {
      const ref=db.ref(`${basePath()}/${id}`);const r=await ref.transaction(raw=>{const g=normalizeGroup(raw,id);g.score+=delta;g.progressScore=Math.max(g.progressScore,g.score);g.spendablePoints+=delta;g.updatedAt=now();return g;});return r.committed?{ok:true}:{ok:false,error:'送出失敗'};
    }
    return mutateLocalGroup(id,g=>{g.score+=delta;g.progressScore=Math.max(g.progressScore,g.score);g.spendablePoints+=delta;});
  }
"""
t = re.sub(r"  async function setScore\(id, value\) \{[\s\S]*?\n  async function setWorldName", setscore_new+"  async function setWorldName", t, count=1)

# Remove quick delta binding, make Send work + Enter key.
t = re.sub(r"document\.querySelectorAll\('\[data-score-delta\]'\)[\s\S]*?document\.getElementById\('setScoreBtn'\)\.onclick=async\(\)=>\{if\(viewer\|\|!gid\)return;const v=Math\.max\(0,Number\(document\.getElementById\('scoreInput'\)\.value\)\|\|0\),r=await D\.setScore\(gid,v\);toast\(r\.ok\?'[^']*':'[^']*'\)\};", "const submitScore=async()=>{if(viewer||!gid||!group)return;const input=document.getElementById('scoreInput'),v=Math.max(0,Number(input.value)||0);if(v<group.score){toast('分數不能低於目前總分');input.value=group.score;return}const btn=document.getElementById('setScoreBtn');btn.disabled=true;const r=await D.setScore(gid,v);btn.disabled=false;toast(r.ok?'分數已送出 ✓':(r.error||'送出失敗'))};document.getElementById('setScoreBtn').onclick=submitScore;document.getElementById('scoreInput').addEventListener('keydown',e=>{if(e.key==='Enter')submitScore()});", t, count=1)

small.write_text(t, encoding='utf-8')

# ---------------- backup score page ----------------
t = score.read_text(encoding='utf-8')
t = t.replace('SCORE CONTROL · v1.0', 'SCORE CONTROL · v1.7')
t = t.replace('v1.0 建議', 'v1.7 建議')
t = t.replace("emotionIslandV16:", "emotionIslandV17:")
# remove quick buttons, rename set
old_quick = '<div class="quick"><button class="btn primary" data-add="50">+50</button><button class="btn primary" data-add="100">+100</button><button class="btn" data-add="-50">-50</button><button class="btn" data-add="-100">-100</button></div><div class="manual"><input id="manual" type="number" min="0" step="50"><button class="btn primary" id="setBtn">設定分數</button></div>'
new_quick = '<div class="manual"><input id="manual" type="number" min="0" step="50" placeholder="輸入新的總分（只能增加）"><button class="btn primary" id="setBtn">送出</button></div>'
t = t.replace(old_quick,new_quick)
t = t.replace('這頁只顯示正在操作的那一組。若要經營世界、填小精靈與佈置，請進入完整小世界。','這頁只顯示正在操作的那一組。分數只能增加，不提供扣分；若要歸零請使用主辦方重置。')
# monotonic data functions same pattern
score_set_new = setscore_new
# score file has same functions but line variants; replace block
if re.search(r"  async function setScore\(id, value\) \{", t):
    t = re.sub(r"  async function setScore\(id, value\) \{[\s\S]*?\n  async function setWorldName", score_set_new+"  async function setWorldName", t, count=1)
# replace UI tail
old_tail_re = r"buttons\.forEach\(b=>b\.onclick=\(\)=>select\(b\.dataset\.group\)\);document\.querySelectorAll\('\[data-add\]'\)[\s\S]*?document\.getElementById\('setBtn'\)\.onclick=async\(\)=>\{if\(!gid\)return;await D\.setScore\(gid,Number\(document\.getElementById\('manual'\)\.value\)\)\};"
new_tail = "buttons.forEach(b=>b.onclick=()=>select(b.dataset.group));const submit=async()=>{if(!gid||!group)return;const input=document.getElementById('manual'),v=Math.max(0,Number(input.value)||0);if(v<group.score){alert('分數只能增加，不能扣分');input.value=group.score;return}const btn=document.getElementById('setBtn');btn.disabled=true;const r=await D.setScore(gid,v);btn.disabled=false;if(!r.ok)alert(r.error||'送出失敗')};document.getElementById('setBtn').onclick=submit;document.getElementById('manual').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});"
t = re.sub(old_tail_re,new_tail,t,count=1)
score.write_text(t,encoding='utf-8')

# ---------------- main world version / local demo key sync only ----------------
t = main.read_text(encoding='utf-8')
t = t.replace('v1.6','v1.7')
t = t.replace('emotionIslandV16:', 'emotionIslandV17:')
main.write_text(t,encoding='utf-8')

print('patched v17')
