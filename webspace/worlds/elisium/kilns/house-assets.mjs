/**
 * Model mounting adapter: Poly Haven historical components are now embedded
 * in physically situated H01–H24 artifacts in the navigable Victorian house.
 * Unlike the v6 study inspector, this module replaces a spatial proxy with
 * the genuine donor geometry ON ITS ORIGINAL PLINTH.
 *
 * The current 1k glTF record is fetched once per unique source during visit,
 * its declared binary/texture URLs are resolved directly by browser CORS.
 * There is NO silent guestbook, identity or history transfer in this loader.
 *
 * The model may change upstream; authored fantasy overlay and collision,
 * H IDs and room narrative do not. Failed loads preserve local authored
 * sculpture & small GLB stand-ins.
 */
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

const BASE = 'https://api.polyhaven.com/files/';
const HOST = /^https:\/\/dl\.polyhaven\.org\/file\/ph-assets\//;
const ID = /^[A-Za-z0-9_-]+$/;
const inFlight = new Map();
const cache = new Map();
let count=0, failures=0;
const stateListeners = new Set();
export const getAssetState=()=>({loaded:count,failed:failures,pending:inFlight.size});
export function watchAssetState(fn){stateListeners.add(fn);fn(getAssetState());return ()=>stateListeners.delete(fn)}
function announce(){for(const f of stateListeners)f(getAssetState())}
function allowed(url){if(typeof url!=='string'||!HOST.test(url))throw Error('Untrusted asset source');return url}
function load(loader,url) {
  return new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject));
}
async function fetchDonor(slug) {
  if(cache.has(slug))return cache.get(slug);
  if(inFlight.has(slug))return inFlight.get(slug);
  if(!ID.test(slug))throw Error('Invalid Poly Haven asset slug');
  const task=(async()=>{
    const response=await fetch(BASE+encodeURIComponent(slug),{cache:'no-cache',mode:'cors',credentials:'omit'});
    if(!response.ok)throw Error('Poly Haven API HTTP '+response.status);
    const files=await response.json();
    const record=files?.gltf?.['1k']?.gltf;
    if(!record?.url||!record?.include)throw Error('No 1k glTF source');
    allowed(record.url);
    const include=Object.entries(record.include).map(([path,desc])=>{
      if(path.includes('..')||path.startsWith('/')||path.includes('\\'))throw Error('Unsafe source path');
      return {path,url:allowed(desc.url)};
    });
    const manager=new THREE.LoadingManager();
    manager.setURLModifier(url=>{
      if(url===record.url)return url;
      const name=decodeURIComponent(new URL(url,record.url).pathname);
      for(const item of include)if(name.endsWith('/'+item.path))return item.url;
      // Never follow an unlisted URL in a remote glTF.
      return 'data:application/octet-stream,';
    });
    const result=await load(new GLTFLoader(manager),record.url);
    const model=result.scene;
    model.traverse(n=>{
      if(n.isMesh){n.castShadow=false;n.receiveShadow=true}
    });
    cache.set(slug,model);
    count++;announce();
    return model;
  })();
  inFlight.set(slug,task);announce();
  try{return await task}
  catch(e){failures++;announce();throw e}
  finally{inFlight.delete(slug);announce()}
}
function normalizeInto(source,mount,kind='artist') {
  const scene=source.clone(true);
  const box=new THREE.Box3().setFromObject(scene);
  const size=box.getSize(new THREE.Vector3());
  const mid=box.getCenter(new THREE.Vector3());
  const maxDimension=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(maxDimension)||maxDimension<.0001)throw Error('Empty artist geometry');
  // The donor is positioned on its world-space story pedestal. A large
  // door and a tiny cup use consistent authored physical scale: no donor
  // acquires the right to change movement or block the player.
  const scale=Math.min(2.25/maxDimension,kind==='artist'?5:5);
  scene.scale.setScalar(scale);
  scene.position.set(-mid.x*scale,.86-box.min.y*scale,-mid.z*scale);
  mount.add(scene);
  return scene;
}
export async function mountHistoricalDonor(object, mount, update) {
  const slug=object.polyhaven_url?.split('/a/')[1];
  if(!slug||!ID.test(slug))return update('unavailable','invalid source');
  try {
    const source=await fetchDonor(slug);
    if(!mount.parent) return update('skipped','room no longer mounted');
    const model=normalizeInto(source,mount);
    update('original',slug);
    return model;
  } catch(error) {
    // Retain the world and authored fantasy additions. A generated GLB
    // is still real geometry, but not an original Poly Haven artist source.
    try {
      const fallback=await load(new GLTFLoader(),'../../../assets/kilns/proxy/'+object.id+'.glb');
      normalizeInto(fallback.scene,mount,'proxy');
      update('proxy',String(error?.message||error));
    } catch(inner) {
      update('sculpture',String(inner?.message||inner));
    }
  }
}
