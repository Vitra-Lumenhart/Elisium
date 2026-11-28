import * as THREE from 'three';
import {clone as cloneRig} from 'three/addons/utils/SkeletonUtils.js';
// Models never determine spiritual polarity. Visual state only reads the Choir ledger.
export function mountChoir(scene,loader,choir,nodes,report=()=>{}){
 const models=new Map(),objects=new Map(),desired=new Map(),pending=new Set();
 // Presentation only; preserve Choir forms, identities, ledger and heights.
 const original=new URLSearchParams(location.search).has('originalcast');
 // Shader grade keeps the original shared atlas: no duplicate GPU texture.
 function gradeMaterial(m){const c=m.clone(),before=c.onBeforeCompile;c.onBeforeCompile=function(shader,renderer){before.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float castLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
 diffuseColor.rgb=mix(vec3(castLuma),diffuseColor.rgb,.47);
 `);};c.customProgramCacheKey=()=> 'kilmainham-cast-grade-015';c.roughness=.93;return c;}
 function lowerArms(rig){if(original)return;rig.updateMatrixWorld(true);
 for(const side of ['l','r']){const a=rig.getObjectByName('upperarm.'+side),b=rig.getObjectByName('lowerarm.'+side);if(!a?.isBone||!b?.isBone||!a.parent)continue;
 const A=a.getWorldPosition(new THREE.Vector3()),B=b.getWorldPosition(new THREE.Vector3()),v=B.sub(A).normalize();if(Math.abs(v.y)>.65)continue;
 const target=new THREE.Vector3(Math.sign(v.x||1)*.24,-.96,.09).normalize(),delta=new THREE.Quaternion().setFromUnitVectors(v,target),parent=a.parent.getWorldQuaternion(new THREE.Quaternion());
 a.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent));rig.updateMatrixWorld(true);
 }}
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=32;const ctx=shadowCanvas.getContext('2d'),g=ctx.createRadialGradient(16,16,1,16,16,15);g.addColorStop(0,'rgba(0,0,0,.43)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,32,32);
 const shadowTex=new THREE.CanvasTexture(shadowCanvas),shadowMat=new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,opacity:.62});
 const shadowGeometry=new THREE.PlaneGeometry(1.18,.84);
 const actors=[...choir.c.humans.map(a=>({...a,kind:'human'})),...choir.c.powers.map(a=>({...a,kind:'power'}))];
 const load=form=>{if(!models.has(form))models.set(form,loader.loadAsync(new URL('./characters/'+form+'.glb',import.meta.url).href).catch(()=>loader.loadAsync('https://raw.githubusercontent.com/Vitra-Lumenhart/Webspace/91d374c6a14d0265e6ef2448b6cbfc6deb6849c4/worlds/katkit-kilmainham/characters/'+encodeURIComponent(form)+'.glb')).then(g=>g.scene));return models.get(form);};
 function request(a,form){if(pending.has(a.id))return;pending.add(a.id);
  load(form).then(template=>{if(desired.get(a.id)!==form)return;const rig=cloneRig(template);lowerArms(rig);
   const box=new THREE.Box3().setFromObject(rig),height=box.max.y-box.min.y;if(!(height>.01))throw Error('Invalid '+form+' bounds');
   const scale=(a.kind==='human'?1.78:1.95)/height;rig.scale.setScalar(scale);rig.position.y=-box.min.y*scale;
   rig.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;if(!original){o.material=Array.isArray(o.material)?o.material.map(gradeMaterial):gradeMaterial(o.material);}}});
   const root=new THREE.Group();root.add(rig);const contact=new THREE.Mesh(shadowGeometry,shadowMat);contact.name='contact shade';contact.userData.noStrikeShadow=true;contact.rotation.x=-Math.PI/2;contact.position.y=.018;root.add(contact);root.name=a.name;root.userData={actorId:a.id,kind:a.kind,form};const prior=objects.get(a.id);if(prior){root.position.copy(prior.position);scene.remove(prior);}scene.add(root);objects.set(a.id,root);report(objects.size,0);
  }).catch(e=>{console.warn('Choir character unavailable',a.id,e);report(objects.size,1)}).finally(()=>pending.delete(a.id));}
 function sync(dt){const counts={};for(const a of actors){const s=a.kind==='human'?a:choir.actors[a.id],node=s.node,form=s.form;const index=counts[node]||0;counts[node]=index+1;
   const side=index%2===0?-1:1,rank=Math.floor(index/2),offset=node==='hearing'?3.0+rank%2*1.35:4.1+rank%2*1.35,z=nodes[node].z+(node==='hearing'?1.3:-.8)+(Math.floor(rank/2)*2.0)+(rank%2)*1.15;
   if(desired.get(a.id)!==form){desired.set(a.id,form);request(a,form);}
   const o=objects.get(a.id);if(!o){if(!pending.has(a.id)&&models.has(form))continue;else continue;}if(o.userData.form!==form&&!pending.has(a.id))request(a,form);
   const target=new THREE.Vector3(side*offset,0,z);if(!o.userData.placed){o.position.copy(target);o.userData.placed=true;}else o.position.lerp(target,1-Math.exp(-2.4*dt));o.rotation.y=(side===1?-Math.PI/2:Math.PI/2)+(index%3-1)*.24;
  }}
 return {sync,objects};
}
