from pathlib import Path
import re, subprocess, json, hashlib
base=Path('/mnt/data/emotion_island_v23_biome_identity')
report=[]
# JS syntax
node_script=r'''const fs=require('fs');let ok=true;for(const f of process.argv.slice(1)){const t=fs.readFileSync(f,'utf8');const ss=[...t.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);for(let i=0;i<ss.length;i++){try{new Function(ss[i])}catch(e){console.error(f+' script '+i+': '+e.message);ok=false}}}if(!ok)process.exit(1);'''
files=[str(base/'emotion_my_world.html'),str(base/'emotion_island.html'),str(base/'emotion_score.html')]
r=subprocess.run(['node','-e',node_script,*files],capture_output=True,text=True)
report.append('JS syntax: '+('PASS' if r.returncode==0 else 'FAIL'))
if r.stderr.strip(): report.append(r.stderr.strip())
# duplicate IDs
for f in files:
    t=Path(f).read_text(encoding='utf-8')
    ids=re.findall(r'\bid=["\']([^"\']+)["\']',t)
    dup=sorted({x for x in ids if ids.count(x)>1})
    report.append(f'{Path(f).name} duplicate DOM IDs: {len(dup)}'+((' '+','.join(dup)) if dup else ''))
# core freeze
old=(base/'emotion_my_world.v222.backup.html').read_text(encoding='utf-8')
new=(base/'emotion_my_world.html').read_text(encoding='utf-8')
def fn(txt,name):
    m=re.search(r'(?:(?:async\s+)?function\s+'+re.escape(name)+r'\([^)]*\)\s*\{)',txt)
    if not m:return None
    brace=txt.find('{',m.start());depth=0
    for j in range(brace,len(txt)):
        if txt[j]=='{':depth+=1
        elif txt[j]=='}':
            depth-=1
            if depth==0:return txt[m.start():j+1]
for name in ['addScore','buyItem','saveLayout','placeItem','setWorldName','saveMember','selectGroup','renderPlaced','renderPeople']:
    report.append(f'Core freeze {name}: '+('UNCHANGED' if fn(old,name)==fn(new,name) else 'CHANGED'))
# feature / uniqueness checks
checks={
 'v23 biome core':'function buildBiomeCoreV23',
 'v23 per-biome lighting':'const BIOME_LIGHT_V23',
 'group1 observatory summit':"hero_observatory",
 'group2 tea garden':"hero_tea_pavilion",
 'group3 world tree basin':"hero_world_tree",
 'group4 wind ridge':"hero_wind_shrine",
 'group5 crescent lagoon':'crescentLagoonV23',
 'group6 flower mandala':'flowerMandalaV23',
 'group7 crystal canyon':'crystalCanyonV23',
 'group8 aurora altar':"hero_aurora_altar",
 'cumulative score hook':'addScore(gid,delta)',
 'shop preserved':'cloudCoaster: { name:',
 'group switching preserved':'switchShowcaseGroup',
 'layout save preserved':'saveLayoutDraft',
}
for name,needle in checks.items(): report.append(f'{name}: '+('PASS' if needle in new else 'FAIL'))
# verify eight branch ids in core function segment
m=re.search(r'function buildBiomeCoreV23\(id,th\)\{([\s\S]*?)\n\}\nfunction placeCenterpieceV23',new)
seg=m.group(1) if m else ''
for i in range(1,9):
    needle=("if(id==='1')" if i==1 else ("}else if(id==='"+str(i)+"')" if i<8 else '}else{'))
    report.append(f'Biome branch {i}: '+('PASS' if needle in seg else 'FAIL'))
# lightweight data regression
rr=subprocess.run(['node',str(base/'regression_v23.js')],capture_output=True,text=True,timeout=20)
report.append('Data regression: '+('PASS' if rr.returncode==0 else 'FAIL'))
report.extend('  '+line for line in rr.stdout.strip().splitlines())
if rr.stderr.strip(): report.append('  stderr: '+rr.stderr.strip())
(base/'VERIFY_v23.txt').write_text('\n'.join(report),encoding='utf-8')
print('\n'.join(report))
