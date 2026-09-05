import {BRIDGES} from './terrain.js';

// Roads and grass use the same shoreline. Fragment clipping avoids triangles
// stretching across a pond where a coarse mesh straddles the water's edge.
export function clipWaterMaterial(material,allowBridges=false){
  const crossings=BRIDGES.map(b=>`(vLandXZ.x>${b.x0.toFixed(3)}&&vLandXZ.x<${b.x1.toFixed(3)}&&abs(vLandXZ.y-${b.z.toFixed(3)})<${(b.width/2).toFixed(3)})`).join('||');
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vLandXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLandXZ=(modelMatrix*vec4(position,1.)).xz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vLandXZ;').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
      vec2 lake=(vLandXZ-vec2(13.,-1.))/vec2(5.6,7.1);
      float stream=10.2+sin((vLandXZ.y+3.)*.18)*2.2;
      bool water=dot(lake,lake)<1.||(vLandXZ.y>-22.&&abs(vLandXZ.x-stream)<1.43);
      if(water${allowBridges?`&&!(${crossings})`:''})discard;`);
  };
  material.customProgramCacheKey=()=>`island-water-mask-${allowBridges}`;
  return material;
}
