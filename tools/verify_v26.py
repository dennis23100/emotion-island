from pathlib import Path
import re, hashlib, subprocess, json, tempfile, textwrap, sys
base=Path('/mnt/data/emotion_island_v25_final_asset_remaster/emotion_my_world.html')
newp=Path('/mnt/data/emotion_island_v26_biome_rebalance/emotion_my_world.html')
a=base.read_text(encoding='utf-8'); b=newp.read_text(encoding='utf-8')
report=[]
def ok(msg): report.append('[PASS] '+msg)
def bad(msg): report.append('[FAIL] '+msg)

# 1 syntax all inline scripts using Node Function constructor
scripts=[]
for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>', b, re.I): scripts.append(m.group(1))
js='const scripts='+json.dumps(scripts)+'; let bad=0; scripts.forEach((s,i)=>{try{new Function(s)}catch(e){bad++;console.error(i,e.message)}}); if(bad)process.exit(1); console.log(scripts.length);'
tmp=Path('/mnt/data/emotion_island_v26_biome_rebalance/.verify_inline_v26.js'); tmp.write_text(js,encoding='utf-8'); r=subprocess.run(['node',str(tmp)],capture_output=True,text=True)
if r.returncode==0: ok(f'{r.stdout.strip()} inline scripts parsed by Node Function constructor, 0 syntax errors.')
else: bad('inline JavaScript syntax errors: '+r.stderr.strip())

# 2 data IIFE exact freeze
pat=r"\(function \(global\) \{[\s\S]*?\}\)\(window\);"
ma=re.search(pat,a); mb=re.search(pat,b)
if ma and mb and ma.group(0)==mb.group(0): ok('Entire EmotionData module is byte-identical to v2.5 (score/Firebase/room/store/save data contract frozen).')
else: bad('EmotionData module changed unexpectedly.')

# 3 critical UI logic blocks unchanged
def extract_named_function(src,name):
    m=re.search(r'(?:async\s+)?function\s+'+re.escape(name)+r'\s*\(',src)
    if not m: return None
    brace=src.find('{',m.end())
    if brace<0: return None
    depth=0; i=brace; quote=None; esc=False; line=False; block=False
    while i<len(src):
        ch=src[i]; nx=src[i+1] if i+1<len(src) else ''
        if line:
            if ch=='\n': line=False
        elif block:
            if ch=='*' and nx=='/': block=False; i+=1
        elif quote:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
        else:
            if ch=='/' and nx=='/': line=True; i+=1
            elif ch=='/' and nx=='*': block=True; i+=1
            elif ch in "'\"`": quote=ch
            elif ch=='{': depth+=1
            elif ch=='}':
                depth-=1
                if depth==0: return src[m.start():i+1]
        i+=1
    return None
for name in ['selectGroup','renderPlaced','renderPeople','updateSpirits','updateRides','saveLayoutDraft']:
    x=extract_named_function(a,name); y=extract_named_function(b,name)
    if x and y and x==y: ok(name+' unchanged vs v2.5.')
    else: bad(name+' changed or missing.')
# submitScore is an arrow function; compare its full declaration up to the next event binding.
def extract_submit(src):
    m=re.search(r'const submitScore=async\(\)=>\{[\s\S]*?\};document\.getElementById\(\'setScoreBtn\'\)',src)
    return m.group(0)[:-len("document.getElementById('setScoreBtn')")] if m else None
x=extract_submit(a);y=extract_submit(b)
if x and y and x==y: ok('submitScore unchanged vs v2.5.')
else: bad('submitScore changed or missing.')

# 4 targeted v26 markers
markers=['v26StableCrystalBasin','v26ForestOpenSpace','v26DawnComposition','v26FlowerComposition','addV26BiomeRebalance']
for m in markers:
    if m in b: ok(m+' present.')
    else: bad(m+' missing.')
if "biomePool(th,0,-.2,5.3,3.15,0);crystalCanyonV23(th)" not in b: ok('Group 7 overlapping legacy center pool removed.')
else: bad('Group 7 overlapping legacy center pool still present.')
if "v24LakeRing(th,0,-.25,2.4,6.1,.72)" not in b: ok('Group 7 transparent overlapping lake ring removed.')
else: bad('Group 7 old transparent lake ring still present.')

# 5 catalog/storage compatibility
if "const STORAGE_KEY_PREFIX = 'emotionIslandV24:';" in b: ok('V24 storage key preserved for existing saved worlds.')
else: bad('Storage key changed.')
shop=re.search(r'const SHOP = \{([\s\S]*?)\n  \};',b)
if shop:
    costs=re.findall(r"cost:(\d+)",shop.group(1));
    if len(costs)==41 and set(costs)=={'100'}: ok('Shop catalog remains 41 items; every item remains 100 pt.')
    else: bad(f'Shop count/cost changed: count={len(costs)}, costs={sorted(set(costs))}')

# 6 composition checks
if "const grove=[[-10.2,6.1]" in b and "for(let i=0;i<18;i++)" not in re.search(r"\}else if\(id==='3'\)\{[\s\S]*?\}else if\(id==='4'\)",b).group(0): ok('Group 3 dense 18-tree ring replaced by perimeter grove/open layout.')
else: bad('Group 3 tree-density patch not detected.')
if "compactCloud=['3','4','6','7'].includes(id)" in b: ok('Targeted worlds use smaller/farther clouds to reduce foreground obstruction.')
else: bad('Cloud composition patch missing.')

Path('/mnt/data/emotion_island_v26_biome_rebalance/VERIFY_v26.txt').write_text('\n'.join(report)+'\n',encoding='utf-8')
print('\n'.join(report))
if any(x.startswith('[FAIL]') for x in report): sys.exit(1)
