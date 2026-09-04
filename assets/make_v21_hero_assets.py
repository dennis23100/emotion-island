import trimesh, numpy as np
from pathlib import Path
from trimesh.transformations import translation_matrix, rotation_matrix, scale_matrix

OUT=Path('/mnt/data/emotion_island_v21/assets/models'); OUT.mkdir(parents=True,exist_ok=True)

def mat(name, rgb, rough=.72, metal=.0, emissive=None):
    m=trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=[rgb[0],rgb[1],rgb[2],255], roughnessFactor=rough, metallicFactor=metal)
    if emissive:
        m.emissiveFactor=[emissive[0]/255,emissive[1]/255,emissive[2]/255]
    return m

def apply(mesh, material, T=None):
    if T is not None: mesh.apply_transform(T)
    mesh.visual=trimesh.visual.TextureVisuals(material=material)
    return mesh

def box(ext, pos, material, rot_y=0):
    m=trimesh.creation.box(extents=ext)
    T=translation_matrix(pos)
    if rot_y: T=T@rotation_matrix(rot_y,[0,1,0])
    return apply(m,material,T)

def cyl(r,h,pos,material,sections=18,rot=None):
    m=trimesh.creation.cylinder(radius=r,height=h,sections=sections)
    T=translation_matrix(pos)
    if rot is not None: T=T@rotation_matrix(rot[0],rot[1])
    return apply(m,material,T)

def cone(r,h,pos,material,sections=12):
    m=trimesh.creation.cone(radius=r,height=h,sections=sections)
    return apply(m,material,translation_matrix(pos))

def sphere(r,pos,material,sub=2,scale=None):
    m=trimesh.creation.icosphere(subdivisions=sub,radius=r)
    if scale is not None:
        m.apply_transform(np.diag([scale[0],scale[1],scale[2],1.0]))
    return apply(m,material,translation_matrix(pos))

def torus(R,r,pos,material,rot_x=np.pi/2):
    m=trimesh.creation.torus(major_radius=R,minor_radius=r,major_sections=48,minor_sections=8)
    T=translation_matrix(pos)@rotation_matrix(rot_x,[1,0,0])
    return apply(m,material,T)

def export(name, parts):
    scene=trimesh.Scene(parts)
    scene.export(OUT/name)
    print(name, (OUT/name).stat().st_size)

# shared materials
wood=mat('wood',(126,82,54)); wood2=mat('wood_dark',(87,55,42)); stone=mat('stone',(104,112,132),.88); cream=mat('cream',(236,225,198));

# 1 Observatory
blue=mat('obs_blue',(58,95,150),.42,.04); cyan=mat('obs_cyan',(102,210,230),.30,.06,(35,96,120));
parts=[cyl(1.65,.22,(0,.11,0),stone),cyl(1.1,.85,(0,.63,0),cream),sphere(1.05,(0,1.15,0),blue,2,scale=[1,0.62,1]),torus(1.28,.05,(0,1.35,0),cyan,0),cyl(.10,1.25,(1.25,.95,.25),wood,10,rot=(np.pi/2.8,[0,0,1])),cyl(.18,1.3,(1.35,1.23,.25),blue,12,rot=(np.pi/2,[0,0,1]))]
for a in np.linspace(0,2*np.pi,6,endpoint=False): parts.append(cyl(.04,.75,(np.cos(a)*1.45,.48,np.sin(a)*1.45),wood,8))
export('hero_observatory.glb',parts)

# 2 Sakura tea pavilion
pink=mat('sakura_roof',(214,123,157)); blush=mat('sakura_trim',(243,181,204));
parts=[cyl(1.65,.18,(0,.09,0),stone)]
for a in np.linspace(0,2*np.pi,6,endpoint=False): parts.append(cyl(.06,1.75,(np.cos(a)*1.2,.95,np.sin(a)*1.2),wood,8))
parts += [cone(1.65,.62,(0,2.05,0),pink,6), cone(1.15,.48,(0,2.42,0),blush,6), cyl(.05,.4,(0,2.82,0),wood,8)]
export('hero_tea_pavilion.glb',parts)

# 3 World tree shrine
green1=mat('leaf_dark',(62,139,84)); green2=mat('leaf_light',(108,180,104)); bark=mat('bark',(105,72,56));
parts=[cyl(.58,4.2,(0,2.1,0),bark,12),cyl(1.4,.16,(0,.08,0),stone)]
for x,y,z,r,c in [(-.9,4.1,0,.9,green1),(.7,4.25,.2,1.0,green2),(0,4.8,-.4,1.1,green1),(1.0,4.9,-.2,.8,green2),(-1.0,4.8,.5,.78,green2),(0,5.55,.1,.85,green1)]: parts.append(sphere(r,(x,y,z),c,2,scale=[1.25,.8,1]))
for a in np.linspace(0,2*np.pi,8,endpoint=False): parts.append(cyl(.035,.85,(np.cos(a)*1.55,.62,np.sin(a)*1.55),wood,6))
export('hero_world_tree.glb',parts)

# 4 Wind shrine
warm=mat('warm_plaster',(227,190,132)); roof=mat('roof',(177,93,69)); gold=mat('gold',(222,171,78),.45,.08)
parts=[cyl(1.5,.16,(0,.08,0),stone),cyl(.72,2.5,(0,1.33,0),warm,12),cone(.92,.55,(0,2.85,0),roof,10),cyl(.12,.45,(0,2.55,.76),wood,8,rot=(np.pi/2,[1,0,0]))]
for a in [0,np.pi/2,np.pi,3*np.pi/2]:
    blade=box((.16,1.7,.08),(0,2.55,.9),gold,0); blade.apply_transform(rotation_matrix(a,[0,0,1])); parts.append(blade)
export('hero_wind_shrine.glb',parts)

# 5 Moon shrine
moon=mat('moonstone',(173,188,218),.48,.04,(36,48,72)); indigo=mat('indigo',(74,82,132));
parts=[cyl(1.6,.18,(0,.09,0),stone),cyl(.12,2.0,(-.9,1.0,0),wood,10),cyl(.12,2.0,(.9,1.0,0),wood,10),box((2.1,.12,.14),(0,1.95,0),wood2),torus(.92,.18,(0,1.78,.05),moon,0),sphere(.44,(.34,1.93,.08),indigo,2)]
export('hero_moon_shrine.glb',parts)

# 6 Flower pavilion
lav=mat('lavender',(183,136,205)); rose=mat('rose',(225,141,170));
parts=[cyl(1.55,.16,(0,.08,0),stone)]
for a in np.linspace(0,2*np.pi,6,endpoint=False): parts.append(cyl(.05,1.5,(np.cos(a)*1.1,.8,np.sin(a)*1.1),wood,8))
parts += [cone(1.48,.55,(0,1.78,0),lav,10),torus(1.02,.07,(0,1.60,0),rose,0)]
for a in np.linspace(0,2*np.pi,10,endpoint=False): parts.append(sphere(.12,(np.cos(a)*1.32,.24,np.sin(a)*1.32),rose,1,scale=[1.15,.65,1]))
export('hero_flower_pavilion.glb',parts)

# 7 Crystal cathedral
cyan2=mat('crystal_cyan',(92,216,224),.22,.15,(23,89,102)); violet=mat('crystal_violet',(128,149,222),.28,.10,(45,50,90));
parts=[cyl(1.55,.18,(0,.09,0),stone)]
for i,(x,z,h) in enumerate([(-.8,0,3.8),(.8,0,3.4),(0,.7,4.7),(0,-.75,2.8),(-.55,.75,2.5),(.55,.75,2.7)]):
    m=trimesh.creation.icosahedron(); m.apply_transform(np.diag([.48,h,.48,1.0])); apply(m,cyan2 if i%2==0 else violet,translation_matrix((x,.25+h*.42,z))); parts.append(m)
parts.append(torus(1.4,.06,(0,1.05,0),cyan2,0))
export('hero_crystal_cathedral.glb',parts)

# 8 Aurora altar
purple=mat('aurora_purple',(143,121,199)); aqua=mat('aurora_aqua',(105,216,205)); gold2=mat('aurora_gold',(222,191,117));
parts=[cyl(1.8,.18,(0,.09,0),stone),cyl(1.25,.18,(0,.35,0),purple),cyl(.08,2.2,(-1.2,1.2,0),aqua,8),cyl(.08,2.2,(1.2,1.2,0),aqua,8),torus(1.2,.09,(0,2.25,0),purple,0),torus(.86,.05,(0,2.25,0),aqua,np.pi/2)]
for a in np.linspace(0,2*np.pi,8,endpoint=False): parts.append(sphere(.10,(np.cos(a)*1.45,.55,np.sin(a)*1.45),gold2,1))
export('hero_aurora_altar.glb',parts)
