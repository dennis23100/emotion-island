(function(global){
  'use strict';
  const FILES={
    oak:'tree_oak.glb', sakura:'tree_sakura.glb', pine:'tree_pine.glb', rocks:'rock_cluster.glb',
    cottage:'cottage.glb', gazebo:'gazebo.glb', bridge:'bridge.glb', bench:'bench.glb', lantern:'lantern.glb',
    crystal:'crystal_cluster.glb', telescope:'telescope.glb', gate:'shrine_gate.glb', campfire:'campfire.glb',
    hero_observatory:'hero_observatory.glb', hero_tea_pavilion:'hero_tea_pavilion.glb', hero_world_tree:'hero_world_tree.glb',
    hero_wind_shrine:'hero_wind_shrine.glb', hero_moon_shrine:'hero_moon_shrine.glb', hero_flower_pavilion:'hero_flower_pavilion.glb',
    hero_crystal_cathedral:'hero_crystal_cathedral.glb', hero_aurora_altar:'hero_aurora_altar.glb'
  };
  const templates={};
  let started=false, promise=null;
  function prep(root){
    root.traverse(function(o){
      if(!o.isMesh) return;
      o.castShadow=true; o.receiveShadow=true;
      if(o.material){
        const mats=Array.isArray(o.material)?o.material:[o.material];
        const cloned=mats.map(function(m){
          const c=m.clone();
          if('flatShading' in c)c.flatShading=true;
          if('roughness' in c)c.roughness=Math.max(.58,c.roughness==null?.78:c.roughness);
          if('metalness' in c)c.metalness=Math.min(.12,c.metalness||0);
          c.needsUpdate=true;
          return c;
        });
        o.material=Array.isArray(o.material)?cloned:cloned[0];
      }
    });
    return root;
  }
  function clone(name){
    const t=templates[name]; if(!t)return null;
    const c=t.clone(true);
    c.traverse(function(o){
      if(o.isMesh&&o.material){
        if(o.geometry)o.geometry=o.geometry.clone();
        const mats=Array.isArray(o.material)?o.material:[o.material];
        const cloned=mats.map(m=>m.clone());
        o.material=Array.isArray(o.material)?cloned:cloned[0];
        o.castShadow=true;o.receiveShadow=true;
      }
    });
    return c;
  }
  function load(base){
    if(promise)return promise;
    if(!global.THREE||!THREE.GLTFLoader){promise=Promise.resolve(false);return promise;}
    started=true;
    const loader=new THREE.GLTFLoader();
    const root=(base||'assets/models/').replace(/\/?$/,'/');
    promise=Promise.allSettled(Object.entries(FILES).map(([name,file])=>new Promise(resolve=>{
      loader.load(root+file,function(g){templates[name]=prep(g.scene);resolve(true)},undefined,function(){resolve(false)});
    }))).then(function(results){
      const ok=results.filter(x=>x.status==='fulfilled'&&x.value).length;
      bank.ready=ok>0; bank.loaded=ok; bank.total=Object.keys(FILES).length;
      global.dispatchEvent(new CustomEvent('emotion-assets-ready',{detail:{loaded:ok,total:bank.total}}));
      return bank.ready;
    });
    return promise;
  }
  const bank={FILES,templates,ready:false,loaded:0,total:Object.keys(FILES).length,clone,load,get started(){return started}};
  global.EmotionAssetBank=bank;
})(window);
