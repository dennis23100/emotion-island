from pathlib import Path
import re, subprocess, json, hashlib, trimesh
base=Path('/mnt/data/emotion_island_v21')
report=[]
# JS syntax
node_script="""
const fs=require('fs');let ok=true;
for(const f of process.argv.slice(1)){const t=fs.readFileSync(f,'utf8');const ss=[...t.matchAll(/<script[^>]*>([\\s\\S]*?)<\\/script>/g)].map(m=>m[1]);for(let i=0;i<ss.length;i++){try{new Function(ss[i])}catch(e){console.error(f,i,e.message);ok=false}}}if(!ok)process.exit(1);
"""
files=[str(base/'emotion_my_world.html'),str(base/'emotion_island.html'),str(base/'emotion_score.html')]
r=subprocess.run(['node','-e',node_script,*files],capture_output=True,text=True)
report.append(f'JS syntax: {"PASS" if r.returncode==0 else "FAIL"}')
if r.stderr: report.append(r.stderr.strip())
# glb validity
heroes=sorted((base/'assets/models').glob('hero_*.glb'))
valid=[]
for f in heroes:
    try:
        sc=trimesh.load(f,force='scene')
        valid.append((f.name,len(sc.geometry),f.stat().st_size))
    except Exception as e:
        report.append(f'GLB FAIL {f.name}: {e}')
report.append(f'Hero GLB: {len(valid)}/{len(heroes)} valid')
for name,n,size in valid: report.append(f'  {name}: {n} meshes, {size} bytes')
# asset bank parse
ab=(base/'assets/assetbank.js').read_text()
for key in ['hero_observatory','hero_tea_pavilion','hero_world_tree','hero_wind_shrine','hero_moon_shrine','hero_flower_pavilion','hero_crystal_cathedral','hero_aurora_altar']:
    report.append(f'AssetBank {key}: {"PASS" if key in ab else "FAIL"}')
# feature checks
html=(base/'emotion_my_world.html').read_text()
checks={
'biome silhouette pass':'addBiomeSilhouetteV21(id,th)',
'ride seat anchors':'seatAnchors',
'ride first animate':'updateRides(t);updateSpirits(t)',
'room-code parser':"match(/^(\\d{4})(0[1-8])$/)",
'cumulative scoring':'addScore(gid,delta)',
'shop preserved 41':'cloudCoaster: { name:',
'placement save preserved':'saveLayout',
'group switching preserved':'switchShowcaseGroup',
}
for name,needle in checks.items(): report.append(f'{name}: {"PASS" if needle in html else "FAIL"}')
# Compare critical data API function bodies v20/v21
old=(Path('/mnt/data/emotion_island_v20/emotion_my_world.html')).read_text()
def fn(txt,name):
    m=re.search(r'(?:(?:async\s+)?function\s+'+re.escape(name)+r'\([^)]*\)\{)',txt)
    if not m:return None
    i=m.start(); brace=txt.find('{',m.start()); depth=0
    for j in range(brace,len(txt)):
        if txt[j]=='{': depth+=1
        elif txt[j]=='}':
            depth-=1
            if depth==0:return txt[i:j+1]
for name in ['addScore','buyItem','saveLayout','placeItem','setWorldName','saveMember']:
    a=fn(old,name);b=fn(html,name)
    same=a==b
    report.append(f'Core freeze {name}: {"UNCHANGED" if same else "CHANGED"}')
(base/'VERIFY_v21.txt').write_text('\n'.join(report),encoding='utf-8')
print('\n'.join(report))
