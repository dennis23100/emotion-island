import {lifeFor,nextGreeting,ambientLine} from './life.js';
import {clipWaterMaterial} from './surface.js';
import { THREE,mat,mesh,ball,box,cylinder,link,curve,makeTree,makePine,makeCottage,makeShrub,makeFlowers,flower,decor,makeCharacter,animateCharacter,batchStatic,seeded,disposeModel } from './models.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { NPCS,CATALOG,THEMES,availableNpcs,growthFor,memberAppearance } from './state.js';
import { ZONES,PATHS,outline,grownOutline,islandContains,terrainHeight,isWater,onBridge,riverX,isWalkable,canPlace,findPath,EXPANSIONS,BRIDGES,groundHeight } from './terrain.js';
import {animateDecor,palace,gazebo,moonSculpture,crystalCluster,musicStage,windmill} from './extra-models.js';
import {makeDistricts,makeLeaderGrounds} from './districts.js';

const clamp=THREE.MathUtils.clamp;
export function npcAppearance(n){return {skin:n.id==='coco'?'#dca880':'#f0ccaa',hair:{mori:'#739265',lumi:'#657f93',coco:'#73523c',fleur:'#956d61',atlas:'#697887'}[n.id],outfit:{mori:'#799065',lumi:'#859bb0',coco:'#c19a79',fleur:'#c69f96',atlas:'#97a7a5'}[n.id],style:['mori','lumi','fleur'].includes(n.id)?'bob':'crop',npc:n.style};}
export class IslandWorld extends EventTarget {
  constructor(host,state){
    super();this.host=host;this.state=state;this.theme=THEMES[state.group-1];this.mode='walk';this.time=0;this.blockers=[];this.placed={};this.npcs=[];this.keys=new Set();this.path=[];this.greetingDue=nextGreeting(state.progressScore);this.greetingTurn=0;this.socialCooldown=0;this.follow=false;this.ghost=null;this.ghostChosen=false;this.isReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mobile=innerWidth<700||(matchMedia('(pointer:coarse)').matches&&innerWidth<1180);this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#83beb3');this.scene.fog=new THREE.Fog('#99c7b6',125,245);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:false});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,this.mobile?1.3:1.6));this.renderer.outputEncoding=THREE.sRGBEncoding;this.renderer.toneMapping=THREE.LinearToneMapping;this.renderer.toneMappingExposure=1.0;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.setClearColor('#8ec6ba');host.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-label','3D 小島：拖曳旋轉；右鍵或雙指平移；滾輪縮放；點居民聊天');this.renderer.domElement.tabIndex=0;
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.dispatchEvent(new CustomEvent('error',{detail:'畫面暫時失去連線，請重新整理。已儲存的本機佈置仍會保留。'}));});
    this.camera=new THREE.OrthographicCamera(-30,30,20,-20,.1,280);this.camera.position.set(39,48,59);this.camera.zoom=this.mobile?1.1:1.05;
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(-2,3.7,2);this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.minPolarAngle=.33;this.controls.maxPolarAngle=1.24;this.controls.minZoom=.16;this.controls.maxZoom=3.8;this.controls.rotateSpeed=.48;this.controls.zoomSpeed=.85;this.controls.maxDistance=170;
    this.controls.addEventListener('start',()=>{this.follow=false;this.focusTarget=null;});
    this.staticRoot=new THREE.Group();this.scene.add(this.staticRoot);this.terrainRoot=new THREE.Group();this.scene.add(this.terrainRoot);this.dynamicRoot=new THREE.Group();this.scene.add(this.dynamicRoot);this.placedRoot=new THREE.Group();this.scene.add(this.placedRoot);this.attractions=[];
    this.setupLighting();this.makeTerrain();this.makeWater();this.makePaths();this.makeScenery();batchStatic(this.staticRoot);this.makeActors(state);this.makeButterflies();this.makeClouds();this.setupEvents();this.resize();this.setTime(state.time);this.renderPlacements(state.placements);this.makeMarker();
    this.clock=new THREE.Clock();this.labelTimer=0;this.frame=0;this.renderMean=0;this.draw=(now=performance.now())=>{if((document.hidden&&this.frame>0)||(this.mobile&&now-(this.lastDraw||0)<32)){this.raf=requestAnimationFrame(this.draw);return;}this.lastDraw=now;const begin=performance.now();this.tick();this.renderMean=this.renderMean*.97+(performance.now()-begin)*.03;if(this.frame>180&&this.frame%180===0&&this.renderMean>(this.mobile?26:23)&&this.renderer.getPixelRatio()>(this.mobile?.85:1)){this.renderer.setPixelRatio(Math.max(this.mobile?.85:1,this.renderer.getPixelRatio()*.85));}this.raf=requestAnimationFrame(this.draw);};this.draw();
  }
  emit(name,detail){this.dispatchEvent(new CustomEvent(name,{detail}));}
  setupLighting(){
    this.hemi=new THREE.HemisphereLight('#d9e3d4','#7b8b7b',.72);this.scene.add(this.hemi);
    this.sun=new THREE.DirectionalLight('#fff0d1',1.04);this.sun.position.set(-55,85,48);this.sun.castShadow=true;this.sun.shadow.mapSize.set(this.mobile?1024:2048,this.mobile?1024:2048);Object.assign(this.sun.shadow.camera,{left:-88,right:88,top:82,bottom:-75,near:1,far:230});this.sun.shadow.bias=-.00025;this.sun.shadow.normalBias=.065;this.sun.shadow.radius=3;this.scene.add(this.sun);
    this.fill=new THREE.DirectionalLight('#a9d1de',.35);this.fill.position.set(32,20,-30);this.scene.add(this.fill);
  }
  makeTerrain(){
    const N=160,R=38,vertices=[],uvs=[],indices=[],colors=[];
    for(let r=0;r<=R;r++)for(let i=0;i<=N;i++){
      const a=i/N*Math.PI*2,p=grownOutline(a,r/R,this.state.progressScore),y=groundHeight(p.x,p.z);vertices.push(p.x,y,p.z);uvs.push(p.x/12,p.z/12);
      const f=.96+.035*Math.sin(p.x*.32)+.045*Math.sin(p.z*.36+p.x*.16);colors.push(f,f,f*.97);
      if(r<R&&i<N){const k=r*(N+1)+i;indices.push(k,k+1,k+N+1,k+1,k+N+2,k+N+1);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d'),rng=seeded(391);ctx.fillStyle=this.theme.grass;ctx.fillRect(0,0,512,512);
    for(let i=0;i<3000;i++){ctx.fillStyle=i%3===0?'#80a45c20':'#c8d59728';const x=rng()*512,y=rng()*512;ctx.beginPath();ctx.ellipse(x,y,1+rng()*5,.7+rng()*2,rng()*3,0,Math.PI*2);ctx.fill();}
    const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;
    this.terrain=mesh(this.terrainRoot,geo,new THREE.MeshStandardMaterial({map:texture,vertexColors:true,roughness:1}));this.terrain.castShadow=false;
    clipWaterMaterial(this.terrain.material);
    // A sculpted, continuous coast, with separate soil, stone and pale sand strata.
    const rings=[{s:1.0,y:3.1,c:'#899565'},{s:1.018,y:2.65,c:'#b9aa78'},{s:1.02,y:.95,c:'#a29375'},{s:1.045,y:.45,c:'#c4b28d'},{s:1.082,y:.12,c:'#e0d1a5'}];
    for(let layer=0;layer<rings.length-1;layer++){
      const a=rings[layer],b=rings[layer+1],v=[],ind=[];
      for(let i=0;i<=N;i++){const angle=i/N*Math.PI*2,p=grownOutline(angle,a.s,this.state.progressScore),q=grownOutline(angle,b.s,this.state.progressScore),jitter=Math.sin(angle*7)*.12;v.push(p.x,a.y+jitter,p.z,q.x,b.y+jitter*.3,q.z);if(i<N){const k=i*2;ind.push(k,k+1,k+2,k+2,k+1,k+3);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ind);g.computeVertexNormals();const m=mat(a.c).clone();m.side=THREE.DoubleSide;mesh(this.terrainRoot,g,m);
    }
    const shoreShape=new THREE.Shape();for(let i=0;i<=N;i++){const p=grownOutline(i/N*Math.PI*2,1.082,this.state.progressScore);if(!i)shoreShape.moveTo(p.x,-p.z);else shoreShape.lineTo(p.x,-p.z);}const shore=mesh(this.terrainRoot,new THREE.ShapeGeometry(shoreShape),mat('#cabb97'),0,.08,0);shore.rotation.x=-Math.PI/2;
    // Recessed banks follow exactly the same water predicate used for navigation.
    const bankSegment=points=>{if(points.length>1)curve(this.terrainRoot,points,.085,'#a2ac89');};
    for(const side of [-1,1]){let points=[];for(let z=-21.8;z<72;z+=.23){const x=riverX(z)+side*1.49;if(!islandContains(x,z,.3,this.state.progressScore))break;const insideLake=((x-13)/5.66)**2+((z+1)/7.16)**2<1;if(insideLake){bankSegment(points);points=[];}else points.push([x,3.08,z]);}bankSegment(points);}
    let lakeBank=[];for(let i=0;i<=240;i++){const a=i/240*Math.PI*2,x=13+Math.cos(a)*5.65,z=-1+Math.sin(a)*7.15;if(Math.abs(x-riverX(z))<1.5){bankSegment(lakeBank);lakeBank=[];}else lakeBank.push([x,3.12,z]);}bankSegment(lakeBank);
    for(const e of EXPANSIONS)if(this.state.progressScore>=e.score){const p=decor('sign');p.position.set(e.x,terrainHeight(e.x,e.z),e.z);this.terrainRoot.add(p);}
  }
  makeWater(){
    const shader=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uDeep:{value:new THREE.Color('#4caaa8').convertSRGBToLinear()},uLight:{value:new THREE.Color('#79c6b9').convertSRGBToLinear()},uOpacity:{value:1}},vertexShader:`varying vec3 vPos; void main(){vPos=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform float uTime;uniform vec3 uDeep;uniform vec3 uLight;varying vec3 vPos;void main(){vec2 p=vPos.xz;float a=sin(p.y*1.8+sin(p.x*.21+uTime*.12)*2.6+uTime*.52);float b=sin(p.y*3.5+p.x*.25+sin(p.x*.45-uTime*.18)+uTime*.32);float lines=smoothstep(.94,1.,a)*.16+smoothstep(.976,1.,b)*.065;float shade=sin(p.x*.12+p.y*.08+uTime*.1)*.1+.45;vec3 col=mix(uDeep,uLight,shade+lines);gl_FragColor=vec4(col,1.);#include <tonemapping_fragment>\n#include <encodings_fragment>}`.replace(';#include',';\n#include')});
    this.waterMaterial=shader;const ocean=new THREE.Mesh(new THREE.PlaneGeometry(600,600),shader);ocean.rotation.x=-Math.PI/2;ocean.position.y=-.02;this.scene.add(ocean);
    this.makeRiver();
    const pond=new THREE.Mesh(new THREE.CircleGeometry(1,96),shader);pond.rotation.x=-Math.PI/2;pond.scale.set(5.63,7.13,1);pond.position.set(13,3.035,-1);this.scene.add(pond);
    this.ripples=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2,p=outline(a,1.14+i%3*.022);const arc=new THREE.EllipseCurve(0,0,2.6+i%3,.25,0,Math.PI,false,0);const geom=new THREE.BufferGeometry().setFromPoints(arc.getPoints(20));const lm=new THREE.LineBasicMaterial({color:'#acdacc',transparent:true,opacity:.38});const line=new THREE.Line(geom,lm);line.rotation.x=-Math.PI/2;line.rotation.z=a-Math.PI/2;line.position.set(p.x,.06,p.z);this.scene.add(line);this.ripples.push(line);}
    for(let i=0;i<8;i++){const a=i*2.3,x=13+Math.sin(a)*(2+i%3),z=-1+Math.cos(a)*4;if(Math.abs(x-riverX(z))<1)continue;const pad=cylinder(this.staticRoot,'#73995e',x,3.1,z,.36+i%3*.08,.025);pad.scale.z=.84;if(i%3===0){for(let j=0;j<5;j++)ball(this.staticRoot,'#ecd0cc',x+Math.cos(j*1.257)*.08,3.18,z+Math.sin(j*1.257)*.08,.06,.09,.06);}}
  }
  makeRiver(){if(this.river){this.scene.remove(this.river);this.river.geometry.dispose();}const v=[],idx=[];let n=0;for(let z=-21.2;z<72;z+=.5){const x=riverX(z);if(!islandContains(x,z,.25,this.state.progressScore))break;v.push(x-1.46,3.03,z,x+1.46,3.03,z);if(n){const k=(n-1)*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}n++;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();this.river=new THREE.Mesh(g,this.waterMaterial);this.scene.add(this.river);}
  pathCurve(path){return new THREE.CatmullRomCurve3(path.map(([x,z])=>new THREE.Vector3(x,terrainHeight(x,z)+.035,z)));}
  makePaths(){
    if(this.state.leader){this.pathCurves=[];return;}
    this.pathCurves=PATHS.map(p=>this.pathCurve(p));
    for(const c of this.pathCurves){const verts=[],uv=[],idx=[],n=140;for(let i=0;i<=n;i++){const t=i/n,p=c.getPoint(t),d=c.getTangent(t),normal=new THREE.Vector3(-d.z,0,d.x).normalize();for(const side of [-1,1]){const q=p.clone().addScaledVector(normal,1.23*side);verts.push(q.x,terrainHeight(q.x,q.z)+.035,q.z);uv.push(t*14,side);}if(i<n){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const path=mesh(this.staticRoot,g,clipWaterMaterial(mat('#baa782').clone(),true));path.castShadow=false;}
    // Hand-laid stones at the house and the shore are irregular, not a fixed editing grid.
    for(let i=0;i<6;i++){const x=-11+i*.48,z=-2.5+i*.36;const p=ball(this.staticRoot,i%2?'#d0c8ac':'#baba9f',x,terrainHeight(x,z)+.025,z,.46,.07,.29);p.rotation.y=i*.32;}
  }
  addScenery(object,x,z,scale=1,rot=0,block=0){if(!this.state.leader&&Object.values(this.state.placements).some(p=>Math.hypot(x-p.x,z-p.z)<Math.max(block,.3)+CATALOG[p.itemId].radius+.15)){disposeModel(object);return null;}object.position.set(x,terrainHeight(x,z),z);object.scale.multiplyScalar(scale);object.rotation.y=rot;object.userData.baseY=object.position.y;object.traverse(n=>{if(n!==object&&(n.userData.rotor||n.userData.cars||n.userData.swing)){n.userData.noBatch=true;this.attractions.push(n);}});if(object.userData.rotor||object.userData.cars||object.userData.swing||object.userData.activity==='float'){this.dynamicRoot.add(object);this.attractions.push(object);}else this.staticRoot.add(object);if(object.userData.seats||object.userData.ride){this.furniture??=[];this.furniture.push(object);object.userData.radius=block||2;}if(block)this.blockers.push({x,z,r:block});return object;}
  nearPath(x,z,dist=2.1){for(const c of this.pathCurves)for(let i=0;i<=65;i++){const p=c.getPoint(i/65);if(Math.hypot(p.x-x,p.z-z)<dist)return true;}return false;}
  makeBridges(){for(const data of BRIDGES){const b=new THREE.Group(),length=data.x1-data.x0;for(let i=0;i<29;i++){const x=data.x0+i*length/28,y=3.55+Math.sin(i/28*Math.PI)*.22;box(b,i%3?'#b99768':'#c7aa79',x,y+.01,data.z,length/28*.92,.16,data.width);}for(const z of [data.z-data.width/2,data.z+data.width/2]){const points=[];for(let i=0;i<9;i++){const x=data.x0+i*length/8,y=3.55+Math.sin(i/8*Math.PI)*.22;box(b,'#8a704e',x,y+.5,z,.1,1.07,.11);points.push([x,y+.91,z]);}curve(b,points,.065,'#a48a5c');curve(b,points.map(p=>[p[0],p[1]-.46,p[2]]),.028,'#c3ab77');}this.staticRoot.add(b);}}
  makeScenery(){
    if(this.state.leader){makeLeaderGrounds(this);this.makeBridges();return;}
    if(!this.state.leader)this.addScenery(makeCottage(this.theme.roof),-10,-7,1.25,-.1,3.1);this.addScenery(makeCottage('shop'),-22,1,.79,.5,2.2);
    const observatory=new THREE.Group();cylinder(observatory,'#b1ac95',0,.17,0,2.6,.34);cylinder(observatory,'#dfd3b0',0,.4,0,2.34,.18);const scope=decor('telescope');scope.scale.setScalar(1.65);scope.position.y=.51;scope.rotation.y=.5;observatory.add(scope);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;if(i<4)continue;link(observatory,[Math.sin(a)*2.45,.4,Math.cos(a)*2.45],[Math.sin(a)*2.45,1.15,Math.cos(a)*2.45],.035,'#788579');}this.addScenery(observatory,18,-15,1,0,2.2);
    const wish=makeTree('wish',4);this.addScenery(wish,-12,-17,1.75,.2,1.45);
    // A real curved footbridge links both banks; nav and height share this geometry.
    this.makeBridges();
    // Fenced garden beds around the village, with an accessible open foreground.
    for(const [x,z] of [[-18,9],[-21,10],[-19,13]]){box(this.staticRoot,'#a88858',x,terrainHeight(x,z)+.03,z,2.0,.1,1.15);for(let i=0;i<8;i++){const fx=x+(i%4-.5)*.42-.45,fz=z+(Math.floor(i/4)-.5)*.45;const fl=flower(this.staticRoot,fx,fz,i%3?'#f3d383':'#dfb1b3',.78);fl.position.y=terrainHeight(fx,fz)+.04;}}
    for(let i=0;i<5;i++)this.addScenery(decor('fence'),-23+i*1.8,14.5,1,0,0);
    for(const [id,x,z,s,r] of [['mailbox',-7.5,-3.5,1,.2],['sign',-5,13,1.3,.3],['sign',16,12.5,1.2,-.4],['lantern',-5.9,-5.2,1.1,0],['lantern',6.8,11.7,1.1,0],['lantern',16.7,8.4,1.1,0],['bench',19,3,1.05,-Math.PI/2],['teaTable',-15,-3.7,1,.2],['picnic',-17,16,1,.3],['planter',-21,3.8,1,0],['rockGarden',21,-3,1.4,0],['mushroom',-16,-13,1.2,0]])this.addScenery(decor(id),x,z,s,r,id==='bench'?1.1:0);
    this.makeThemeLandmarks();makeDistricts(this);
    const rng=seeded(202703),trees=[];
    for(let i=0;i<600&&trees.length<(this.state.leader?30:62);i++){
      const x=(rng()-.5)*64,z=(rng()-.5)*48;if(!islandContains(x,z,3)||isWater(x,z)||this.nearPath(x,z,3)||this.blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+3))continue;
      if(z>0&&x>-15&&x<20)continue;if(x<-14&&z>3&&z<18)continue;if(Math.hypot(x+2,z+18)<6)continue;if(trees.some(p=>Math.hypot(x-p.x,z-p.z)<3.2))continue;
      if(this.state.leader&&Math.abs(x)<16&&z<7)continue;trees.push({x,z});const cherry=this.theme.trees==='cherry'||(x<-17&&z>-8);const t=this.theme.trees==='pine'||i%7===0?makePine():makeTree(cherry?'cherry':'oak',i+1);this.addScenery(t,x,z,.69+rng()*.36,rng()*6.28,.55);
    }
    for(let i=0;i<130;i++){const x=(rng()-.5)*63,z=(rng()-.5)*47;if(!islandContains(x,z,2.5)||isWater(x,z)||this.nearPath(x,z,1.5)||this.blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+1))continue;if(i%4===0)this.addScenery(makeShrub(),x,z,.5+rng()*.7);else{const o=makeFlowers();this.addScenery(o,x,z,.5+rng()*.4,rng()*6.28);}}
    // Small grass blades use one shared geometry and become instanced meshes.
    const bladeGeo=new THREE.PlaneGeometry(.035,.19);bladeGeo.translate(0,.095,0);const grassMat=mat('#7c9b54').clone();grassMat.side=THREE.DoubleSide;
    for(let i=0;i<1300;i++){const x=(rng()-.5)*65,z=(rng()-.5)*50;if(!islandContains(x,z,1.5)||isWater(x,z)||this.nearPath(x,z,1.45)||this.blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r))continue;for(let j=0;j<3;j++){const m=mesh(this.staticRoot,bladeGeo,grassMat,x+j*.04,terrainHeight(x,z),z+j*.03);m.rotation.y=rng()*6.28;m.rotation.z=(rng()-.5)*.5;m.castShadow=false;}}
    for(let i=0;i<30;i++){const a=rng()*Math.PI*2,p=outline(a,1.057);ball(this.staticRoot,i%3?'#c6baa0':'#a6a690',p.x,.24,p.z,.36+rng()*.5,.16+rng()*.3,.3+rng()*.35);}
  }
  makeThemeLandmarks(){
    if(this.state.leader)return;
    const add=(id,x,z,s=1,r=0,b=2)=>this.addScenery(decor(id),x,z,s,r,b);

    switch(this.theme.landmark){
      case'observatory':add('leaderStarFountain',-2,-18,1.8,0,2.4);add('leaderWaterfall',23,-10,1.5,0,2.1);break;
      case'garden':add('torii',-2,-18,1.6,0,2.8);add('lotusPond',-21,19,1.2,0,2.3);add('gazebo',21,16,1.3,0,2.8);break;
      case'forest':add('hammock',-23,-9,1.2,.2,2.2);add('gazebo',-1,-19,1.4,0,2.8);break;
      case'windmill':add('windmill',-2,-18,2.1,0,3.3);add('easel',-18,17,1.3,0,.9);for(let i=0;i<7;i++)add('flowerPatch',-25+i*1.1,-5,1,0,0);break;
      case'moon':add('moonLamp',-2,-18,3.0,0,2.1);add('leaderMoonLake',22,15,1.3,0,2.8);break;
      case'flowers':add('musicStage',-1,-18,1.5,0,3.3);add('arch',-22,17,1.35,.2,2.1);for(let i=0;i<6;i++)add('flowerPatch',18+i*1.3,15,1.3,0,0);break;
      case'crystal':for(const [x,z,s] of [[-2,-18,3],[-22,18,2],[23,15,1.8]])add('crystal',x,z,s,0,s*.8);add('leaderWaterfall',24,-7,1.8,0,2.5);break;
      case'hope':add('leaderPalace',-1,-19,1.65,0,3.6);add('leaderStarFountain',21,16,1.3,0,1.8);break;
    }
  }
  makeSkyWhale(){const g=new THREE.Group();ball(g,'#a2bcc1',0,0,0,3.5,1.15,1.15);ball(g,'#dce0cf',.4,-.44,.07,2.8,.64,.9);for(const s of [-1,1]){const fin=ball(g,'#88a9b1',-2.85,.15,s*.7,1.3,.18,.6);fin.rotation.x=s*.35;const wing=ball(g,'#91afb3',.1,-.2,s*1.3,1.1,.12,.6);wing.rotation.z=-.2;}ball(g,'#405a62',2.5,.1,.87,.11,.11,.05);ball(g,'#f3eacf',2.52,.13,.9,.035);g.position.set(0,26,-25);this.scene.add(g);this.whale=g;}
  makeActors(state){this.updateNpcs(state);this.updateMembers(state);}
  actorLabel(name,member=false){const label=document.createElement('div');label.className='npc-label'+(member?' member-label':'');const dot=document.createElement('i');dot.textContent=member?'✧':'···';label.append(dot,document.createTextNode(name));document.getElementById('labels').appendChild(label);return label;}
  updateNpcs(state){const available=state.leader?[]:availableNpcs(state.progressScore);for(const npc of available){if(this.npcs.some(n=>n.id===npc.id))continue;const o=makeCharacter(npcAppearance(npc));o.position.set(npc.x,terrainHeight(npc.x,npc.z),npc.z);o.rotation.y=.6;this.dynamicRoot.add(o);this.npcs.push({...npc,object:o,label:this.actorLabel(npc.name),path:[],wait:1+this.npcs.length*.8,gesture:'idle',talking:false});}}
  updateMembers(state){this.state=state;for(const n of this.members||[]){this.dynamicRoot.remove(n.object);disposeModel(n.object);n.label.remove();}this.members=[];const count=Math.min(state.maxMembers,Math.floor(state.progressScore/100),30);for(let i=0;i<count;i++){const a=i*2.4;let x=-2+Math.sin(a)*(3+i%4),z=13+Math.cos(a)*3;const appearance=memberAppearance(state,i+1),o=makeCharacter(appearance);o.scale.setScalar(.86);if(!isWalkable(x,z,this.allBlockers(),.35,state.progressScore)){x=-3;z=15+i*.4;}o.position.set(x,terrainHeight(x,z),z);o.rotation.y=a;this.dynamicRoot.add(o);const homes=this.state.leader?[[-18,18],[24,19],[-30,4],[4,26]]:[[-15,9],[-32,6],[-27,23],[25,20],[25,-21]];const home=homes[i%homes.length];this.members.push({id:String(i+1),name:appearance.name,object:o,label:this.actorLabel(appearance.name,true),x:home[0],z:home[1],path:[],wait:.5+i*.7,gesture:'idle',talking:false});}}
  updateAvatar(){this.updateMembers(this.state);}
  updateProgress(state){const memberKey=s=>JSON.stringify([Math.min(s.maxMembers,Math.floor(s.progressScore/100)),s.members]),peopleChanged=memberKey(this.state)!==memberKey(state);const before=growthFor(this.state.progressScore).stage,after=growthFor(state.progressScore).stage;this.state=state;if(before!==after){this.terrain.geometry.dispose();this.terrain.material.map.dispose();this.terrain.material.dispose();disposeModel(this.terrainRoot);this.terrainRoot.clear();this.makeTerrain();this.makeRiver();this.emit('hint',`小島進入「${growthFor(state.progressScore).label}」階段，新土地已長出來。`);this.greetingDue=Math.min(this.greetingDue,nextGreeting(state.progressScore));this.home();}this.updateNpcs(state);if(peopleChanged)this.updateMembers(state);}
  makeButterflies(){this.butterflies=[];const rng=seeded(51);for(let i=0;i<16;i++){const g=new THREE.Group();const wings=[];for(const s of [-1,1]){const w=ball(g,['#f7df93','#e6b9b5','#c3d9cc'][i%3],s*.09,0,0,.11,.016,.16);wings.push(w);}this.dynamicRoot.add(g);this.butterflies.push({g,wings,x:(rng()-.5)*40,z:(rng()-.5)*32,phase:rng()*7});}}
  makeClouds(){this.clouds=[];const cm=mat('#dfebe2');for(let i=0;i<7;i++){const g=new THREE.Group();for(let j=0;j<4;j++)ball(g,cm,(j-1.5)*2.0,Math.sin(j)*.7,0,2.6,1,1.35);g.position.set(-95+i*32,26+i%3*4,-62-i%2*24);g.scale.setScalar(1.2+i%3*.2);this.scene.add(g);this.clouds.push(g);}}
  makeMarker(){const m=new THREE.Mesh(new THREE.RingGeometry(.25,.29,40),new THREE.MeshBasicMaterial({color:'#f5e1a8',transparent:true,opacity:.9,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;this.scene.add(m);this.walkMarker=m;}
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h);const aspect=w/h,span=Math.max(35,40/aspect);this.camera.left=-span*aspect/2;this.camera.right=span*aspect/2;this.camera.top=span/2;this.camera.bottom=-span/2;this.camera.updateProjectionMatrix();}
  setupEvents(){
    window.addEventListener('resize',()=>this.resize());this.ray=new THREE.Raycaster();this.mouse=new THREE.Vector2();const canvas=this.renderer.domElement,pointers=new Set();let down=null;
    canvas.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);down=pointers.size===1?{x:e.clientX,y:e.clientY,button:e.button}:null;canvas.focus({preventScroll:true});});
    canvas.addEventListener('pointermove',e=>{if(this.mode==='decorate'&&this.ghost&&!this.ghostChosen&&(!e.buttons)){const p=this.groundPoint(e);if(p)this.moveGhost(p.x,p.z);}});
    canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;});
    canvas.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);if(!down||down.button!==0||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;if(document.querySelector('dialog[open]'))return;
      this.setRay(e);if(this.mode==='decorate'){
        if(this.ghost){const p=this.groundPoint(e);if(p){this.moveGhost(p.x,p.z);this.ghostChosen=true;this.emit('ghostchange',this.ghostState());}}
        else{const hits=this.ray.intersectObjects(this.placedRoot.children,true);if(hits.length){let o=hits[0].object;while(o&&o.parent!==this.placedRoot)o=o.parent;if(o?.userData.placementKey)this.emit('selectitem',o.userData.placementKey);}}
      }else{for(const n of this.npcs)if(this.ray.intersectObject(n.object,true).length){this.emit('npc',n.id);return;}for(const n of this.members)if(this.ray.intersectObject(n.object,true).length){this.emit('member',n.id);return;}}
    });
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||document.querySelector('dialog[open]'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.code)){this.keys.add(e.code);e.preventDefault();}});
    window.addEventListener('keyup',e=>this.keys.delete(e.code));window.addEventListener('blur',()=>this.keys.clear());
  }
  setRay(e){const r=this.renderer.domElement.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.mouse,this.camera);}
  groundPoint(e){this.setRay(e);const p=new THREE.Vector3();if(!this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-3.4),p))return null;for(let i=0;i<2;i++){const h=isWater(p.x,p.z)?3.4:terrainHeight(p.x,p.z);this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-h),p);}return p;}
  allBlockers(ignore){return this.blockers.concat(Object.entries(this.placed).filter(([k])=>k!==ignore).map(([,p])=>({x:p.x,z:p.z,r:CATALOG[p.itemId].radius*.82})));}
  walkTo(x,z){this.focus({x,z,zoom:1.5});}
  setMode(mode){this.mode=mode;this.path=[];this.keys.clear();this.controls.maxPolarAngle=mode==='decorate'?1.08:1.24;if(mode==='decorate'){this.focus({x:0,z:6,zoom:1.2});}this.renderer.domElement.style.cursor=mode==='decorate'?'crosshair':'grab';}
  focus(zone){this.follow=false;this.focusTarget=new THREE.Vector3(zone.x,zone.y??terrainHeight(zone.x,zone.z),zone.z);this.focusZoom=zone.zoom||1.1;this.emit('zone',zone.name||'溪光小徑');}
  home(){const right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),center=new THREE.Vector3(0,5,2);let extentX=1,extentY=1;for(let i=0;i<96;i++){const p=grownOutline(i/96*Math.PI*2,1.09,this.state.progressScore);for(const y of [0,this.state.leader?25:13]){const v=new THREE.Vector3(p.x,y,p.z).sub(center);extentX=Math.max(extentX,Math.abs(v.dot(right)));extentY=Math.max(extentY,Math.abs(v.dot(up)));}}const zoom=clamp(Math.min((this.camera.right-this.camera.left)/(extentX*2.2),(this.camera.top-this.camera.bottom)/(extentY*2.35)),.16,1);this.focus({x:0,z:2,y:5,zoom,name:this.state.leader?'整座星願神境':'整座小島'});}
  zoom(factor){this.camera.zoom=clamp(this.camera.zoom*factor,.16,3.8);this.camera.updateProjectionMatrix();this.focusZoom=null;}
  rotate(){const p=this.camera.position.clone().sub(this.controls.target);p.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);this.camera.position.copy(this.controls.target).add(p);this.controls.update();}
  setTime(time){this.timeOfDay=time;const settings={day:{bg:this.theme.sky,sun:'#ffedd0',power:1.04,hemi:.68,fill:.35,exposure:1},sunset:{bg:'#9daaa7',sun:'#ffd1a0',power:.84,hemi:.61,fill:.35,exposure:.95},night:{bg:'#344e63',sun:'#b7cff1',power:.48,hemi:.53,fill:.32,exposure:.88}}[time]||{};this.scene.background.set(settings.bg);this.scene.fog.color.set(settings.bg);this.sun.color.set(settings.sun);this.sun.intensity=settings.power;this.hemi.intensity=settings.hemi;this.fill.intensity=settings.fill;this.renderer.toneMappingExposure=settings.exposure;this.waterMaterial.uniforms.uDeep.value.set(time==='night'?'#345e79':time==='sunset'?'#679994':'#4caaa8').convertSRGBToLinear();this.waterMaterial.uniforms.uLight.value.set(time==='night'?'#508e9c':time==='sunset'?'#9eb6a2':'#86c7b6').convertSRGBToLinear();}
  renderPlacements(placements){for(const n of [...this.npcs,...(this.members||[])]){if(n.activity){const p=n.activity.exit;n.object.position.set(p.x,terrainHeight(p.x,p.z),p.z);}n.activity=null;n.path=[];n.wait=1;}this.placedRoot.children.forEach(disposeModel);this.placedRoot.clear();this.placed=JSON.parse(JSON.stringify(placements));for(const [key,p] of Object.entries(placements)){const o=decor(p.itemId);o.position.set(p.x,terrainHeight(p.x,p.z),p.z);o.rotation.y=p.rot;Object.assign(o.userData,{placementKey:key,itemId:p.itemId,baseY:o.position.y,radius:CATALOG[p.itemId].radius});this.placedRoot.add(o);}for(const n of [...this.npcs,...(this.members||[])]){const p=n.object.position;if(!isWalkable(p.x,p.z,this.allBlockers(),.35,this.state.progressScore)){let found=false;for(let r=1;r<9&&!found;r++)for(let i=0;i<12;i++){const x=p.x+Math.sin(i*Math.PI/6)*r,z=p.z+Math.cos(i*Math.PI/6)*r;if(isWalkable(x,z,this.allBlockers(),.35,this.state.progressScore)){p.set(x,terrainHeight(x,z),z);found=true;break;}}}}}
  startGhost(id,position=null,rot=0,ignore=null){this.clearGhost();this.ghost=decor(id);this.ghostId=id;this.ghostIgnore=ignore;this.ghost.rotation.y=rot;this.ghostChosen=false;this.snap=true;this.ghost.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.72;o.castShadow=false;}});this.scene.add(this.ghost);const size=CATALOG[id].radius*2;
    const footprint=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({color:'#a1d3a1',transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}));footprint.rotation.x=-Math.PI/2;this.scene.add(footprint);this.footprint=footprint;
    const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-size/2,0,-size/2),new THREE.Vector3(size/2,0,-size/2),new THREE.Vector3(size/2,0,size/2),new THREE.Vector3(-size/2,0,size/2)]),new THREE.LineBasicMaterial({color:'#f7f4cd',transparent:true,opacity:1,depthTest:false}));this.scene.add(ring);this.footprintRing=ring;
    let initial=position;if(!initial){for(let z=6;z<18&&!initial;z+=2)for(let x=-4;x<8;x+=2)if(this.checkPlacement(x,z).ok){initial={x,z};break;}}
    initial=initial||{x:0,z:7};this.moveGhost(initial.x,initial.z);this.focus({x:initial.x,z:initial.z-3,zoom:1.65});if(ignore){const o=this.placedRoot.children.find(o=>o.userData.placementKey===ignore);if(o)o.visible=false;}
  }
  checkPlacement(x,z){return canPlace(x,z,CATALOG[this.ghostId].radius,this.blockers,Object.fromEntries(Object.entries(this.placed).map(([k,p])=>[k,{...p,radius:CATALOG[p.itemId].radius}])),this.ghostIgnore,this.state.progressScore);}
  moveGhost(x,z){if(!this.ghost)return;if(this.snap){x=Math.round(x*2)/2;z=Math.round(z*2)/2;}this.ghost.position.set(x,terrainHeight(x,z),z);this.footprint.position.set(x,terrainHeight(x,z)+.065,z);this.footprintRing.position.set(x,terrainHeight(x,z)+.075,z);const valid=this.checkPlacement(x,z);this.ghostValid=valid;this.footprint.material.color.set(valid.ok?'#7fca9c':'#dc8979');this.footprintRing.material.color.set(valid.ok?'#f8f1b3':'#ffd4cb');this.emit('ghostchange',this.ghostState());}
  ghostState(){if(!this.ghost)return null;return {id:this.ghostId,x:this.ghost.position.x,z:this.ghost.position.z,rot:this.ghost.rotation.y,chosen:this.ghostChosen,...this.ghostValid};}
  rotateGhost(){if(this.ghost){this.ghost.rotation.y+=Math.PI/4;this.emit('ghostchange',this.ghostState());}}
  clearGhost(){if(this.ghost){this.scene.remove(this.ghost);disposeModel(this.ghost);this.ghost.traverse(o=>{if(o.material)o.material.dispose();});this.ghost=null;}for(const key of ['footprint','footprintRing'])if(this[key]){this.scene.remove(this[key]);this[key].geometry.dispose();this[key].material.dispose();this[key]=null;}if(this.ghostIgnore){const o=this.placedRoot.children.find(o=>o.userData.placementKey===this.ghostIgnore);if(o)o.visible=true;}this.ghostIgnore=null;}
  talk(id,on=true){const n=this.npcs.find(n=>n.id===id);if(!n)return;n.talking=on;n.path=[];n.gesture=on?'wave':'idle';n.wait=4;this.keys.clear();this.path=[];if(on){this.focus({x:n.object.position.x,z:n.object.position.z+1,zoom:2.2,name:ZONES.reduce((a,b)=>Math.hypot(b.x-n.x,b.z-n.z)<Math.hypot(a.x-n.x,a.z-n.z)?b:a).name});n.object.rotation.y=Math.atan2(this.camera.position.x-n.object.position.x,this.camera.position.z-n.object.position.z);}}
  moveActor(o,path,dt,speed){if(!path.length)return 0;const p=path[0],dx=p.x-o.position.x,dz=p.z-o.position.z,d=Math.hypot(dx,dz),step=speed*dt;if(d<step+.04){o.position.x=p.x;o.position.z=p.z;path.shift();}else{o.position.x+=dx/d*step;o.position.z+=dz/d*step;const angle=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(angle-o.rotation.y),Math.cos(angle-o.rotation.y));o.rotation.y+=diff*Math.min(1,dt*9);}o.position.y=terrainHeight(o.position.x,o.position.z);return speed;}
  activityTargets(){const result=[...(this.furniture||[]),...this.placedRoot.children];return result.filter(o=>o.visible&&(o.userData.seats||o.userData.ride||o.userData.activity||['flowerPatch','campfire','telescope','easel'].includes(o.userData.itemId)));}
  planActor(n){
    if(!this.isReduced&&this.time>this.socialCooldown&&Math.random()<lifeFor(this.state.progressScore).encounter){
      const friend=[...this.npcs,...this.members].find(a=>a!==n&&!a.talking&&!a.activity&&!a.path.length&&a.object.position.distanceTo(n.object.position)<5);
      if(friend){for(const [a,b]of [[n,friend],[friend,n]]){a.path=[];a.activity=null;a.wait=5;a.socialUntil=this.time+4.5;a.object.rotation.y=Math.atan2(b.object.position.x-a.object.position.x,b.object.position.z-a.object.position.z);}this.socialCooldown=this.time+12;return;}
    }
    const targets=this.activityTargets(),occupied=[...this.npcs,...this.members].filter(a=>a!==n&&a.activity).map(a=>a.activity.object);let target=targets.filter(o=>!occupied.includes(o));target=target.length&&Math.random()<.78?target[Math.floor(Math.random()*target.length)]:null;
    let dest;if(target){const r=target.userData.radius||CATALOG[target.userData.itemId]?.radius||2;for(let i=0;i<12;i++){const a=target.rotation.y+i*Math.PI/6;const p={x:target.position.x+Math.sin(a)*(r+1),z:target.position.z+Math.cos(a)*(r+1)};if(isWalkable(p.x,p.z,this.allBlockers(),.35,this.state.progressScore)){dest=p;break;}}}
    if(!dest){target=null;const a=Math.random()*Math.PI*2,r=3+Math.random()*9;dest={x:n.x+Math.sin(a)*r,z:n.z+Math.cos(a)*r};}
    n.path=findPath(n.object.position,dest,this.allBlockers(),this.state.progressScore);n.wait=3+Math.random()*4;
    n.activity=target&&n.path.length?{object:target,exit:dest,elapsed:0,duration:target.userData.ride?23:9}:null;n.gesture='idle';
  }
  animateActorLife(n,dt,t){
    if(n.talking||n.socialUntil>t){animateCharacter(n.object,t,0,'wave');return;}
    let speed=0;const act=n.activity;
    if(n.path.length){speed=this.moveActor(n.object,n.path,dt,n.id.length>2?1.05:1.25);}
    else if(act&&act.object.parent){
      act.elapsed+=dt;const g=act.object,u=g.userData,slot=0;g.updateMatrixWorld(true);let seat=null;
      if(u.cabins){const c=u.cabins[slot];c.updateMatrixWorld(true);seat=c.localToWorld(new THREE.Vector3(0,u.axis==='z'?-.43:u.axis==='y'?.28:0,0));}
      else if(u.cars){const c=u.cars[1];c.updateMatrixWorld(true);seat=c.localToWorld(new THREE.Vector3(0,.1,0));}
      else if(u.swing){u.swing.updateMatrixWorld(true);seat=u.swing.localToWorld(new THREE.Vector3(0,-2.25,0));}
      else if(u.seats){const p=u.seats[slot];seat=g.localToWorld(new THREE.Vector3(p[0],p[1]-.5,p[2]));}
      else if(u.activity==='jump')seat=g.localToWorld(new THREE.Vector3(0,.53+Math.abs(Math.sin(t*3))*.7,0));
      if(seat){const blend=Math.min(1,dt*4);n.object.position.lerp(seat,blend);n.object.rotation.y=g.rotation.y+(u.rotor&&u.axis==='y'?u.rotor.rotation.y:0);n.gesture=u.activity==='jump'?'wave':'sit';}
      else{n.object.rotation.y=Math.atan2(g.position.x-n.object.position.x,g.position.z-n.object.position.z);n.gesture=u.itemId==='flowerPatch'?'garden':u.activity==='music'?'wave':'idle';}
      if(act.elapsed>act.duration){n.object.position.set(act.exit.x,terrainHeight(act.exit.x,act.exit.z),act.exit.z);n.activity=null;n.wait=3+Math.random()*3;n.gesture='idle';}
    }else{n.activity=null;n.wait-=dt;if(n.wait<=0&&!this.plannedFrame){this.plannedFrame=true;this.planActor(n);}}
    animateCharacter(n.object,t,speed,n.path.length?'idle':n.gesture);
  }
  tick(){
    const dt=Math.min(.05,this.clock?.getDelta()||.016);this.time+=dt;this.frame++;const t=this.time;this.plannedFrame=false;
    for(const g of [...this.attractions,...this.placedRoot.children]){animateDecor(g,this.isReduced?0:t);if(g.userData.swing)g.userData.swing.rotation.x=Math.sin(t*.85)*.13;if(g.userData.flames)g.userData.flames.forEach((f,i)=>f.scale.y=.4+Math.sin(t*5+i)*.05);}
    for(const n of [...this.npcs,...this.members])this.animateActorLife(n,dt,t);
    if(this.mode==='walk'&&!this.npcs.some(n=>n.talking)&&!document.querySelector('dialog[open]')){
      this.greetingDue-=dt;
      if(this.greetingDue<=0&&this.npcs.length){const n=this.npcs[this.greetingTurn%this.npcs.length];this.greetingTurn++;this.emit('ambient',{id:n.id,name:n.name,line:ambientLine(n,this.state,Math.floor(this.greetingTurn/this.npcs.length))});this.greetingDue=nextGreeting(this.state.progressScore);}
    }

    if(!this.isReduced){this.waterMaterial.uniforms.uTime.value=t;for(const b of this.butterflies){b.g.position.set(b.x+Math.sin(t*.4+b.phase)*2,terrainHeight(b.x,b.z)+1.1+Math.sin(t*.8+b.phase)*.4,b.z+Math.cos(t*.3+b.phase)*1.4);b.g.rotation.y=t*.3+b.phase;b.wings.forEach((w,i)=>w.rotation.z=Math.sin(t*14+b.phase)*(i?1:-1)*.8);}for(const c of this.clouds)c.position.x+=dt*.035;this.ripples.forEach((r,i)=>r.material.opacity=.2+Math.sin(t*.6+i)*.12);if(this.whale){this.whale.position.x=Math.sin(t*.036)*30;this.whale.position.y=25+Math.sin(t*.3)*.65;this.whale.rotation.y=Math.cos(t*.036)>0?0:Math.PI;}}
    if(this.keys.size){const delta=new THREE.Vector3();if(this.keys.has('ArrowLeft')||this.keys.has('KeyA'))delta.x-=dt*13;if(this.keys.has('ArrowRight')||this.keys.has('KeyD'))delta.x+=dt*13;if(this.keys.has('ArrowUp')||this.keys.has('KeyW'))delta.z-=dt*13;if(this.keys.has('ArrowDown')||this.keys.has('KeyS'))delta.z+=dt*13;this.controls.target.add(delta);this.camera.position.add(delta);this.focusTarget=null;}
    if(this.focusTarget){const delta=this.focusTarget.clone().sub(this.controls.target).multiplyScalar(Math.min(1,dt*4));this.controls.target.add(delta);this.camera.position.add(delta);if(delta.length()<.001)this.focusTarget=null;}
    if(this.focusZoom){this.camera.zoom+=(this.focusZoom-this.camera.zoom)*Math.min(1,dt*4);this.camera.updateProjectionMatrix();if(Math.abs(this.camera.zoom-this.focusZoom)<.001)this.focusZoom=null;}
    this.controls.target.x=clamp(this.controls.target.x,-85,85);this.controls.target.z=clamp(this.controls.target.z,-72,72);this.controls.update();
    if(this.frame%3===0)this.updateLabels();if(this.frame%24===0)this.drawArchipelagoMap(document.getElementById('mini-map-canvas'));
    this.renderer.shadowMap.needsUpdate=this.frame%3===1;this.renderer.render(this.scene,this.camera);
  }
  updateLabels(){const w=this.host.clientWidth,h=this.host.clientHeight,used=[];for(const n of [...this.npcs,...this.members]){const p=n.object.position.clone();p.y+=2.65;p.project(this.camera);const x=Math.round((p.x*.5+.5)*w),y=Math.round((-p.y*.5+.5)*h),wide=Math.max(60,n.name.length*12+32);let show=this.mode==='walk'&&p.z<1&&Math.abs(p.x)<.94&&Math.abs(p.y)<.85&&(!this.members.includes(n)||this.camera.zoom>1.65);if(show&&used.some(r=>Math.abs(r.x-x)<(r.w+wide)/2&&Math.abs(r.y-y)<30))show=false;if(show)used.push({x,y,w:wide});n.label.style.left=x+'px';n.label.style.top=y+'px';n.label.style.display=show?'flex':'none';}}
  drawArchipelagoMap(canvas){if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#a8cbbd';ctx.fillRect(0,0,w,h);for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,x=w/2+Math.cos(a)*w*.32,y=h/2+Math.sin(a)*h*.33;ctx.strokeStyle='#dce3c1';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#d9cba2';ctx.beginPath();ctx.ellipse(x,y+2,22,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=THEMES[i].grass;ctx.beginPath();ctx.ellipse(x,y,20,15,0,0,Math.PI*2);ctx.fill();if(i+1===this.state.group&&!this.state.leader){ctx.strokeStyle='#fff7d1';ctx.lineWidth=3;ctx.stroke();}ctx.fillStyle='#fcf8e2';ctx.font='600 13px "Microsoft JhengHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),x,y);}ctx.fillStyle='#e6d4a2';ctx.beginPath();ctx.arc(w/2,h/2,9,0,Math.PI*2);ctx.fill();}
  drawMiniMap(canvas,large=false){if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,s=Math.min(w/178,h/155);const point=(x,z)=>[w/2+x*s,h/2+z*s];ctx.clearRect(0,0,w,h);ctx.fillStyle='#a5cfc3';ctx.fillRect(0,0,w,h);for(const [scale,col] of [[1.065,'#d1c39c'],[1,this.theme.grass]]){ctx.beginPath();for(let i=0;i<=160;i++){const p=grownOutline(i/160*Math.PI*2,scale,this.state.progressScore),[x,y]=point(p.x,p.z);if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.fillStyle=col;ctx.fill();}ctx.save();ctx.clip();ctx.strokeStyle='#6caeaa';ctx.lineWidth=2.9*s;ctx.beginPath();for(let z=-22;z<72;z+=.5){const [x,y]=point(riverX(z),z);if(z===-22)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();const [px,py]=point(13,-1);ctx.beginPath();ctx.ellipse(px,py,5.6*s,7.1*s,0,0,Math.PI*2);ctx.fillStyle='#6caeaa';ctx.fill();ctx.restore();ctx.strokeStyle='#d5c39b';ctx.lineWidth=1.7*s;ctx.lineCap='round';for(const c of this.pathCurves){ctx.beginPath();c.getPoints(75).forEach(({x,z},i)=>{const [a,b]=point(x,z);if(!i)ctx.moveTo(a,b);else ctx.lineTo(a,b);});ctx.stroke();}for(const b of this.blockers){const [x,y]=point(b.x,b.z);ctx.fillStyle=b.r>2?'#a88e66':'#597b59';ctx.beginPath();ctx.arc(x,y,Math.max(1,b.r*.6)*s,0,Math.PI*2);ctx.fill();}for(const p of Object.values(this.placed)){const [x,y]=point(p.x,p.z);ctx.fillStyle='#b79664';ctx.fillRect(x-1.5,y-1.5,3,3);}for(const n of [...this.npcs,...this.members]){const [x,y]=point(n.object.position.x,n.object.position.z);ctx.fillStyle=n.color||'#f5e7bd';ctx.beginPath();ctx.arc(x,y,large?4:2,0,Math.PI*2);ctx.fill();}const [x,y]=point(this.controls.target.x,this.controls.target.z);ctx.strokeStyle='#fdf4d3';ctx.lineWidth=1.5;ctx.strokeRect(x-5,y-4,10,8);}
  photo(){this.renderer.render(this.scene,this.camera);return this.renderer.domElement.toDataURL('image/png');}
  dispose(){cancelAnimationFrame(this.raf);this.controls.dispose();this.renderer.dispose();[...this.npcs,...this.members].forEach(n=>n.label.remove());}
}

export class Thumbnails {
  constructor(){this.cache=new Map();this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:false});this.renderer.setSize(256,280);this.renderer.setPixelRatio(1);this.renderer.outputEncoding=THREE.sRGBEncoding;this.renderer.toneMapping=THREE.LinearToneMapping;this.renderer.setClearColor(0x000000,0);this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight('#fff4d8','#b5c9a5',1.2));const sun=new THREE.DirectionalLight('#ffe6c5',.75);sun.position.set(-3,6,5);this.scene.add(sun);this.camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,40);}
  render(object,portrait=false){this.scene.add(object);object.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(object),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());const span=Math.max(size.x,size.y,size.z)*.74;const aspect=256/280;this.camera.left=-span*aspect;this.camera.right=span*aspect;this.camera.top=span;this.camera.bottom=-span;this.camera.position.copy(center).add(new THREE.Vector3(portrait?.8:3.4,portrait?.5:2.8,6));this.camera.lookAt(center);this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);const url=this.renderer.domElement.toDataURL('image/png');this.scene.remove(object);disposeModel(object);return url;}
  item(id){if(!this.cache.has(id))this.cache.set(id,this.render(decor(id)));return this.cache.get(id);}
  avatar(options){const key='avatar:'+JSON.stringify(options);if(!this.cache.has(key)){if(this.cache.size>180)this.cache.clear();this.cache.set(key,this.render(makeCharacter(options),true));}return this.cache.get(key);}
  npc(n){const key='npc:'+n.id;if(!this.cache.has(key))this.cache.set(key,this.avatar(npcAppearance(n)));return this.cache.get(key);}
}

export class ModelPreview {
  constructor(host,id){this.thumbnails=new Thumbnails();const t=this.thumbnails;const w=host.clientWidth||220,h=245;t.renderer.setSize(w,h);host.appendChild(t.renderer.domElement);this.object=typeof id==='string'?decor(id):makeCharacter(id);t.scene.add(this.object);const b=new THREE.Box3().setFromObject(this.object),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z)*.79;t.camera.left=-span*w/h;t.camera.right=span*w/h;t.camera.top=span;t.camera.bottom=-span;t.camera.position.copy(center).add(new THREE.Vector3(4,3,6));t.camera.lookAt(center);t.camera.updateProjectionMatrix();this.controls=new OrbitControls(t.camera,t.renderer.domElement);this.controls.target.copy(center);this.controls.enableZoom=false;this.controls.enablePan=false;this.controls.enableDamping=true;this.controls.autoRotate=true;this.controls.autoRotateSpeed=.6;this.controls.minPolarAngle=.3;this.controls.maxPolarAngle=1.45;this.controls.addEventListener('start',()=>this.controls.autoRotate=false);const draw=()=>{this.controls.update();t.renderer.render(t.scene,t.camera);this.frame=requestAnimationFrame(draw);};draw();}
  dispose(){cancelAnimationFrame(this.frame);this.controls.dispose();disposeModel(this.object);this.thumbnails.renderer.dispose();this.thumbnails.renderer.domElement.remove();}
}
