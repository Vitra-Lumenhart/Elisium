import * as THREE from 'three';
import {clone as cloneRig} from 'three/addons/utils/SkeletonUtils.js';
// Models never determine spiritual polarity. Visual state only reads the Choir ledger.
export function mountChoir(scene,loader,choir,nodes,report=()=>{}){
 const models=new Map(),objects=new Map(),desired=new Map(),pending=new Set();
 const actors=[...choir.c.humans.map(a=>({...a,kind:'human'})),...choir.c.powers.map(a=>({...a,kind:'power'}))];
 const load=form=>{if(!models.has(form))models.set(form,loader.loadAsync(new URL('./characters/'+form+'.glb',import.meta.url).href).catch(()=>loader.loadAsync('https://raw.githubusercontent.com/Vitra-Lumenhart/Webspace/91d374c6a14d0265e6ef2448b6cbfc6deb6849c4/worlds/katkit-kilmainham/characters/'+encodeURIComponent(form)+'.glb')).then(g=>g.scene));return models.get(form);};
 function request(a,form){if(pending.has(a.id))return;pending.add(a.id);
  load(form).then(template=>{if(desired.get(a.id)!==form)return;const rig=cloneRig(template);
   const box=new THREE.Box3().setFromObject(rig),height=box.max.y-box.min.y;if(!(height>.01))throw Error('Invalid '+form+' bounds');
   const scale=(a.kind==='human'?1.78:1.95)/height;rig.scale.setScalar(scale);rig.position.y=-box.min.y*scale;
   rig.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
   const root=new THREE.Group();root.add(rig);root.name=a.name;root.userData={actorId:a.id,kind:a.kind,form};const prior=objects.get(a.id);if(prior){root.position.copy(prior.position);scene.remove(prior);}scene.add(root);objects.set(a.id,root);report(objects.size,0);
  }).catch(e=>{console.warn('Choir character unavailable',a.id,e);report(objects.size,1)}).finally(()=>pending.delete(a.id));}
 function sync(dt){const counts={};for(const a of actors){const s=a.kind==='human'?a:choir.actors[a.id],node=s.node,form=s.form;const index=counts[node]||0;counts[node]=index+1;
   const side=index%2===0?-1:1,offset=2.8+Math.floor(index/2)*.75,z=nodes[node].z-1.4-Math.floor(index/2)*.65;
   if(desired.get(a.id)!==form){desired.set(a.id,form);request(a,form);}
   const o=objects.get(a.id);if(!o){if(!pending.has(a.id)&&models.has(form))continue;else continue;}if(o.userData.form!==form&&!pending.has(a.id))request(a,form);
   const target=new THREE.Vector3(side*offset,0,z);if(!o.userData.placed){o.position.copy(target);o.userData.placed=true;}else o.position.lerp(target,1-Math.exp(-2.4*dt));o.rotation.y=side===1?-Math.PI/2:Math.PI/2;
  }}
 return {sync,objects};
}
