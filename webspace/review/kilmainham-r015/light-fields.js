import * as THREE from 'three';
import {CLOUD,ELECTRIC,cloudBake,electricBake,skyState,budget} from './light-field-bake.mjs';
const params=new URLSearchParams(location.search);
export function mountLightFields({scene,renderer,sun,ambient,fixtures,lamps,lampGlow,roofGlass,getActors=()=>[]}){
 const safe=params.has('safe'),gentle=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(safe)return {update(){},attach(){},mode:'safe'};
 const c=cloudBake(),e=electricBake(fixtures),g=ELECTRIC,ew=g.x+2,eh=g.z+2;
 const atlas=new Uint8Array(ew*4*eh*4);
 for(let y=0;y<g.y;y++)for(let z=-1;z<=g.z;z++)for(let x=-1;x<=g.x;x++){
  const sx=Math.max(0,Math.min(g.x-1,x)),sz=Math.max(0,Math.min(g.z-1,z));
  atlas[(Math.floor(y/4)*eh+z+1)*ew*4+(y%4)*ew+x+1]=e[(y*g.z+sz)*g.x+sx];
 }
 function tex(data,w,h){const t=new THREE.DataTexture(data,w,h,THREE.RedFormat,THREE.UnsignedByteType);t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}
 const cloud=tex(c.atlas,c.width,c.height),electric=tex(atlas,ew*4,eh*4);
 const uniforms={fCloud:{value:cloud},fElectric:{value:electric},fDrift:{value:new THREE.Vector2()},fDepth:{value:2},fOn:{value:0},fFlash:{value:0},fSunDir:{value:sun.position.clone().sub(sun.target.position).normalize()}};
 // Optional low-cost shaft slices: one batched transparent mesh; no raymarch,
 // extra shadow map or render target. Opaque geometry supplies depth testing.
 const rayUniforms={...uniforms,fRayGain:{value:0}};
 const rayMaterial=new THREE.ShaderMaterial({uniforms:rayUniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
 vertexShader:`varying vec3 rWorld;varying vec2 rUV;void main(){rUV=uv;rWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(rWorld,1.);}`,
 fragmentShader:`varying vec3 rWorld;varying vec2 rUV;uniform sampler2D fCloud;uniform vec2 fDrift;uniform float fDepth,fFlash,fRayGain;uniform vec3 fSunDir;
 float layerAt(vec2 p,float k){vec2 tile=vec2(mod(k,4.),floor(k/4.))*66.;return texture2D(fCloud,(tile+1.5+p*64.-.5)/264.).r;}
 void main(){vec2 q=fract((rWorld.xz+fSunDir.xz/max(.1,fSunDir.y)*(21.-rWorld.y)+fDrift)/vec2(64.,96.));float k=clamp(fDepth,0.,15.),a=floor(k);float tr=mix(layerAt(q,a),layerAt(q,min(a+1.,15.)),fract(k));tr=mix(tr,1.,fFlash);
 float edge=pow(max(0.,sin(3.14159*rUV.x)),.7)*sin(3.14159*rUV.y);
 gl_FragColor=vec4(mix(vec3(.65,.62,.50),vec3(.55,.70,1.),fFlash),max(0.,edge)*tr*fRayGain);
 }`});
 const rays=new THREE.Mesh(new THREE.BufferGeometry(),rayMaterial);rays.name='KIL optional dust-light sheets';rays.frustumCulled=false;scene.add(rays);
 function rebuildRays(){const d=uniforms.fSunDir.value,p=[],u=[],idx=[];const n=40;
 for(const slice of [-.8,-.4,0,.4,.8]){const base=p.length/3;for(let i=0;i<=n;i++){let t=i/n,z=-26.3+t*49.6,w=2.65*Math.sqrt(Math.max(0,1-((z+1.5)/25)**2)),x=slice*w;
 for(const y of [.08,21]){p.push(x-d.x/d.y*(21-y),y,z-d.z/d.y*(21-y));u.push(t,y/21);}
 if(i<n){const j=base+i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));geo.setIndex(idx);rays.geometry.dispose();rays.geometry=geo;}
 const ordinarySun=sun.position.clone(),ordinaryColor=sun.color.clone(),ordinaryAmbient=ambient.color.clone();let stormDirection=false,shadowActors=false;const flashColor=new THREE.Color(0xadc8ff),nightColor=new THREE.Color(0x9ab5d4);
 function setDirection(storm){if(storm===stormDirection)return;stormDirection=storm;if(storm)sun.position.set(-13,37,-17);else sun.position.copy(ordinarySun);
 uniforms.fSunDir.value.copy(sun.position).sub(sun.target.position).normalize();renderer.shadowMap.needsUpdate=true;rebuildRays();}
 rebuildRays();
 // A distant branching discharge above the glass; never a fullscreen flash.
 const boltPoints=[];let x=-3,z=-19,y=25;
 for(let i=0;i<18;i++){const X=x+.32*Math.sin(i*2.3),Z=z+1.7,Y=y+.32*Math.sin(i*3.1);boltPoints.push(x,y,z,X,Y,Z);if(i===5||i===11)boltPoints.push(X,Y,Z,X+2.1,Y-.7,Z+2.8);x=X;y=Y;z=Z;}
 const boltGeo=new THREE.BufferGeometry();boltGeo.setAttribute('position',new THREE.Float32BufferAttribute(boltPoints,3));
 const boltMat=new THREE.LineBasicMaterial({color:0xc8dcff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
 const bolt=new THREE.LineSegments(boltGeo,boltMat);bolt.name='Distant storm discharge';bolt.visible=false;scene.add(bolt);
 const baseSky=scene.background.clone();const duskSky=new THREE.Color(0x414b59),flashSky=new THREE.Color(0x9caccc);let disabled=false;
 const done=new WeakSet();let mode=params.get('sky')||'cycle',start=null,nowState=null,lastThunder=-1,audio=null,noise=null;
 if(!['day','cycle','twilight','storm'].includes(mode))mode='cycle';
 function attach(m){if(!m?.isMeshStandardMaterial||done.has(m)||m.transparent)return;done.add(m);m.userData.lightFields=true;
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(shader,render){before.call(this,shader,render);Object.assign(shader.uniforms,uniforms);
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 fWorld;').replace('#include <project_vertex>',`#include <project_vertex>
 vec4 fp=vec4(transformed,1.);
 #ifdef USE_INSTANCING
 fp=instanceMatrix*fp;
 #endif
 fWorld=(modelMatrix*fp).xyz;`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 fWorld;
 uniform sampler2D fCloud,fElectric;
 uniform vec2 fDrift;
 uniform float fDepth,fOn,fFlash;
 uniform vec3 fSunDir;
 float fTile(sampler2D t,vec2 p,float k,vec2 dim){
 vec2 cell=vec2(mod(k,4.),floor(k/4.));vec2 size=dim+2.;
 return texture2D(t,(cell*size+1.5+p*(dim-1.))/(size*4.)).r;}
 float fLayers(sampler2D t,vec2 p,float k,vec2 dim){float a=floor(clamp(k,0.,15.));return mix(fTile(t,p,a,dim),fTile(t,p,min(a+1.,15.),dim),fract(k));}
 `).replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 // Project receiver back towards the roof plane along the same shadow-map direction.
 vec2 aperture=fWorld.xz+fSunDir.xz/max(.1,fSunDir.y)*(21.0-fWorld.y);
 vec2 coord=fract((aperture+fDrift)/vec2(64.,96.));
 // Repeat interpolation across periodic texel centers (padded wrap gutters).
 vec2 cell=coord*64.-.5;
 float layer=clamp(fDepth,0.,15.);float a=floor(layer);
 vec2 off0=vec2(mod(a,4.),floor(a/4.))*66.;
 float b=min(a+1.,15.);vec2 off1=vec2(mod(b,4.),floor(b/4.))*66.;
 float trans=mix(texture2D(fCloud,(off0+1.5+cell)/264.).r,texture2D(fCloud,(off1+1.5+cell)/264.).r,fract(layer));
 trans=mix(.12+.88*trans,1.,fFlash);
 reflectedLight.directDiffuse*=trans;
 reflectedLight.directSpecular*=trans;
 vec3 ep=clamp((fWorld-vec3(-9.,0.,-28.))/vec3(18.,21.5,52.),0.,1.);
 float warmth=fLayers(fElectric,ep.xz,ep.y*15.,vec2(48.,96.))*fOn;
 // Favor illuminated surfaces facing the interior; prevent uniform luminous walls.
 vec3 wn=normalize(inverseTransformDirection(normal,viewMatrix));
 vec3 inward=normalize(vec3(-fWorld.x*.16,.55,0.01));
 float facing=.25+.75*max(0.,dot(wn,inward));
 reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(1.,.67,.39)*warmth*facing*1.55;
 `);
 };m.customProgramCacheKey=()=>cache()+'|KIL-FIELD-015';m.needsUpdate=true;
 }
 function scan(){scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])attach(m);});}
 scan();
 // The glazing is a distinct receiver: show the SAME slowly drifting optical
 // field outside the dirty glass rather than painting a motionless cloudy sky.
 if(roofGlass){const before=roofGlass.onBeforeCompile,cache=roofGlass.customProgramCacheKey.bind(roofGlass);
 roofGlass.userData.lightFields=true;
 roofGlass.onBeforeCompile=function(shader,r){before.call(this,shader,r);Object.assign(shader.uniforms,uniforms);
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 skyWorld;').replace('#include <project_vertex>','#include <project_vertex>\nskyWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 skyWorld;uniform sampler2D fCloud;uniform vec2 fDrift;uniform float fDepth,fFlash;
 float skyTile(vec2 p,float k){vec2 cell=vec2(mod(k,4.),floor(k/4.))*66.;return texture2D(fCloud,(cell+1.5+p*64.-.5)/264.).r;}
 `).replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=fract((skyWorld.xz+fDrift)/vec2(64.,96.));float a=floor(clamp(fDepth,0.,15.));float tr=mix(skyTile(q,a),skyTile(q,min(15.,a+1.)),fract(clamp(fDepth,0.,15.)));
 diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.18,.23,.29),vec3(.63,.72,.79),tr),.62);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.78,.86,1.),fFlash*.6);
 diffuseColor.a=clamp(diffuseColor.a+.16*(1.-tr),0.,.65);
 `);};roofGlass.customProgramCacheKey=()=>cache()+'|KIL-SKY-015';roofGlass.needsUpdate=true;}
 // One static shadow-map bake, including the real roof aperture and ironwork.
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const panel=document.createElement('div');panel.style.cssText='pointer-events:auto;font-size:12px;margin-top:6px';
 const label=document.createElement('label');label.textContent='Sky ';const sel=document.createElement('select');
 for(const [v,n] of [['cycle','Drifting day → dusk'],['day','Daylight'],['twilight','Twilight'],['storm','Storm · lightning']]){const op=document.createElement('option');op.value=v;op.textContent=n;sel.append(op);}
 sel.value=mode;sel.onchange=()=>{mode=sel.value;start=null;lastThunder=-1;lastScan=-10;};label.append(sel);panel.append(label);
 const soft=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=gentle;soft.append(check,' Gentle lightning');panel.append(document.createElement('br'),soft);const rayLabel=document.createElement('label'),rayCheck=document.createElement('input');rayCheck.type='checkbox';rayCheck.checked=params.has('rays');rayLabel.append(rayCheck,' Dust shafts (experimental)');panel.append(document.createElement('br'),rayLabel);
 const button=document.createElement('button');button.textContent='Enable thunder';button.onclick=async()=>{try{audio ||= new (window.AudioContext||window.webkitAudioContext)();await audio.resume();noise=audio.createBuffer(1,audio.sampleRate*5,audio.sampleRate);const d=noise.getChannelData(0);let prev=0;for(let i=0;i<d.length;i++){prev=.96*prev+.04*(Math.random()*2-1);d[i]=prev*3;}button.textContent='Thunder enabled';button.disabled=true;}catch(e){button.textContent='Audio unavailable';}};panel.append(button);
 const status=document.createElement('div');panel.append(status);const disclosure=document.createElement('details');disclosure.className='field-controls';const summary=document.createElement('summary');summary.textContent='Sky & sound';disclosure.append(summary,panel);document.querySelector('#hud').append(disclosure);
 function thunder(){if(!audio||!noise)return;const src=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain(),t=audio.currentTime;src.buffer=noise;filter.type='lowpass';filter.frequency.value=180;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.36,t+.55);gain.gain.exponentialRampToValueAtTime(.001,t+4.9);src.connect(filter).connect(gain).connect(audio.destination);src.start();}
 let lastScan=-10;
 function setActorShadows(enabled){if(enabled===shadowActors)return;shadowActors=enabled;for(const root of getActors())root.traverse(o=>{if(o.isMesh&&!o.userData.noStrikeShadow)o.castShadow=enabled;});renderer.shadowMap.needsUpdate=true;}
 function update(now){if(disabled)return;if(start===null)start=now;const t=(now-start)/1000;nowState=skyState(t,mode,check.checked);
 const s=nowState;setDirection(s.storm);scene.background.copy(baseSky).lerp(duskSky,s.phase).lerp(flashSky,s.flash*.55);bolt.visible=s.storm&&s.flash>.1;boltMat.opacity=s.flash*.8;rays.visible=rayCheck.checked;rayUniforms.fRayGain.value=.008*s.sun+.025*s.flash;uniforms.fDepth.value=s.depth;uniforms.fDrift.value.set(...s.drift);uniforms.fOn.value=s.electric;uniforms.fFlash.value=s.flash;
 // Cold reflected light preserves the iron silhouette during darkness.
 sun.color.copy(ordinaryColor).lerp(flashColor,s.storm?.60+s.flash*.40:0);
 ambient.color.copy(ordinaryAmbient).lerp(nightColor,s.phase*.65);
 sun.intensity=s.sun+5.4*s.flash;ambient.intensity=s.ambient+.32*s.flash;lampGlow.emissiveIntensity=s.electric?1.25:.035;
 // Re-bake only at strike onset/end to put the actual cast into the lightning shadow.
 // Frozen poses within the brief pulse are intentional; never a per-frame shadow pass.
 setActorShadows(s.storm&&s.flash>.035);
 // The baked electric field replaces all legacy point-light loops.
 if(s.storm&&s.thunder&&lastThunder!==s.strike){lastThunder=s.strike;thunder();}
 if(t-lastScan>1){scan();lastScan=t;status.textContent=(s.electric?'Lamps on':'Lamps off')+' · '+Math.round(s.phase*100)+'% dusk · '+Math.round((c.volume.byteLength+c.atlas.byteLength+atlas.byteLength+e.byteLength)/1024)+' KiB field arrays';}
 }
 for(const l of lamps)scene.remove(l);
 return {update,attach,disable(){if(disabled)return;disabled=true;rays.visible=false;bolt.visible=false;setActorShadows(false);setDirection(false);sun.color.copy(ordinaryColor);ambient.color.copy(ordinaryAmbient);scene.background.copy(baseSky);for(const l of lamps)scene.add(l);renderer.shadowMap.autoUpdate=true;},get mode(){return mode},get state(){return nowState},bytes:c.volume.byteLength+c.atlas.byteLength+atlas.byteLength+e.byteLength};
}
