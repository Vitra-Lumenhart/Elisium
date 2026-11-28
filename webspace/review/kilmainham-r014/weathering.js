import * as THREE from 'three';

// R010 weathering: spatially anchored dirt over photographed base maps.
// One world-space field across instanced walls and procedural steel, no per-bay stripes.
const profiles={
 masonry:[1.0,.80,.62,.12],oak:[.75,.46,.75,.17],boarding:[.65,.50,.66,.12],
 iron:[.62,.32,.42,.72],flags:[.85,.78,.34,.08],linen:[.62,.25,.28,.06],
 paper:[.42,.15,.18,.06],brass:[.55,.20,.22,.48],glass:[.55,.14,.40,.05],
 character:[.44,.15,.18,.06],recess:[.25,.16,.12,.05],lamp:[.30,.12,.16,.08]
};
const applied=new WeakSet();
const weatheringEnabled=!new URLSearchParams(location.search).has('safe');
export function distress(m,kind){
 if(!weatheringEnabled||!m||applied.has(m))return m;applied.add(m);
 const p=profiles[kind]||profiles.masonry;
 m.userData.weathering=kind;
 m.onBeforeCompile=shader=>{
  shader.uniforms.kWeather={value:new THREE.Vector4(...p)};
  shader.uniforms.kKind={value:kind==='masonry'?1:kind==='flags'?2:kind==='iron'||kind==='brass'?3:kind==='glass'?4:kind==='oak'?5:kind==='boarding'?6:0};
  shader.vertexShader=shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 kWorld;')
   .replace('#include <project_vertex>',`#include <project_vertex>
     vec4 kw=vec4(transformed,1.0);
     #ifdef USE_INSTANCING
       kw=instanceMatrix*kw;
     #endif
     kWorld=(modelMatrix*kw).xyz;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 kWorld;
 uniform vec4 kWeather;
 uniform float kKind;
 float kHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
 float kNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(kHash(i),kHash(i+vec3(1,0,0)),f.x),mix(kHash(i+vec3(0,1,0)),kHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(kHash(i+vec3(0,0,1)),kHash(i+vec3(1,0,1)),f.x),mix(kHash(i+vec3(0,1,1)),kHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float kFbm(vec3 p){return .57*kNoise(p)+.28*kNoise(p*2.11+5.3)+.15*kNoise(p*4.37-9.4);}
 `).replace('#include <color_fragment>',`#include <color_fragment>
 vec3 kp=kWorld;
 float cloud=kFbm(kp*0.56);
 float dirtPatch=smoothstep(.36,.70,kFbm(kp*1.7+17.0));
 float streak=smoothstep(.47,.77,kFbm(vec3(kp.x*4.2,kp.y*.38,kp.z*4.2)+8.0));
 float grit=kNoise(kp*33.0);
 float low=exp(-max(kp.y,0.0)*.58);
 float dirt=clamp((cloud*.40+dirtPatch*.26+streak*.25+grit*.09)*kWeather.x,0.0,1.0);
 if(kKind==1.0){
   // Uneven damp tide near the floor and dirty runoff beneath gallery levels.
   float under=0.0;
   for(int j=1;j<=2;j++){float dy=float(j)*6.30-kp.y;under+=step(0.0,dy)*exp(-abs(dy)*1.6);}
   float tide=exp(-max(kp.y-(.35+cloud*.65),0.0)*1.4);
   dirt=clamp(dirt+tide*kWeather.y*.52+under*streak*.33,0.0,1.0);
 }else if(kKind==2.0){
   float traffic=exp(-abs(kp.x)*.65);
   dirt=clamp(dirt+low*.08+(.24*(1.0-traffic))*dirtPatch,0.0,1.0);
 }else if(kKind==5.0){
   float sill=mod(max(kp.y,0.0),6.30);
   float threshold=exp(-sill*1.35);
   dirt=clamp(dirt+threshold*.23+streak*.18,0.0,1.0);
 }
 // Soot and damp are low-chroma. Keep the existing scanned surface readable.
 vec3 stain=mix(vec3(.145,.112,.077),vec3(.092,.113,.092),smoothstep(.35,.69,cloud));
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.50,.48,.43),dirt*.62);
 diffuseColor.rgb=mix(diffuseColor.rgb,stain*max(.20,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))*1.25),dirt*.22);
 diffuseColor.rgb*=mix(.91,1.06,grit);
 if(kKind==3.0){
   // Speckled exposed oxide within otherwise slate-blue painted iron.
   float oxide=smoothstep(.54,.80,kFbm(kp*5.2+32.0))*kWeather.w;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.155,.069,.031),oxide*.75);
 }
 if(kKind==4.0){
   // Dirty glazing, still transparent and daylight-bearing.
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.24,.26,.20),dirtPatch*.46);
   diffuseColor.a=clamp(diffuseColor.a*(.75+dirtPatch*1.7),0.0,.62);
 }
 `);
 };
 m.customProgramCacheKey=()=> 'kilmainham-r010-'+kind;
 m.needsUpdate=true;
 return m;
}
export function weatherScene(scene,materialKinds){
 scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
 if(!m?.isMeshStandardMaterial)continue;
 distress(m,materialKinds.get(m)||(m.transparent?'glass':'character'));
 }});
}
