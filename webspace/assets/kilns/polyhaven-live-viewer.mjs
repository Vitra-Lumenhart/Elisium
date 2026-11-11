/**
 * Kilns optional Poly Haven live-model inspection.
 * Source: https://api.polyhaven.com/files/{slug} (current 1k glTF + includes).
 * Visual provenance is explicit. No data transmitted about the visitor's journal.
 * The room graph and user actions remain usable without the network / GPU.
 *
 * Contract: this module loads a HISTORICAL COMPONENT DONOR; it does not replace
 * the authored H01–H24 interpretations or imply that a GLB is spatially installed.
 */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const $ = id => document.getElementById(id);
const stage = $('model-stage');
const status = $('model-status');
const live = $('load-artist');
const proxy = $('load-proxy');
const source = $('model-source');
const download = $('model-proxy-link');
const note = $('model-note');
const canvas = $('model-canvas');
const API = 'https://api.polyhaven.com/files/';
const ALLOWED = /^https:\/\/dl\.polyhaven\.org\/file\/ph-assets\//;
const UID = /^[A-Za-z0-9_-]+$/;
let chosen = null, selectedEpoch = 0, active = null;
let renderer = null, scene, camera, controls, modelGroup, light;
const MATERIAL_NOTE = 'A Poly Haven component can serve several Kilns stories; its published object is not automatically our finished fantasy furniture.';

function tell(message) { status.textContent = message; }
function initialize() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#22242b');
  camera = new THREE.PerspectiveCamera(42,1,0.01,200);
  controls = new OrbitControls(camera,canvas);
  controls.enableDamping = false;
  controls.dampingFactor = 0.09;
  controls.autoRotate = false;
  controls.addEventListener('change',renderFrame);
  modelGroup = new THREE.Group();
  scene.add(modelGroup);
  scene.add(new THREE.HemisphereLight('#c0def9','#a17b61',2.4));
  light = new THREE.DirectionalLight('#fff2d6',3.0);
  light.position.set(4,7,6);scene.add(light);
  const resize = () => {
    const width = Math.max(1,stage.clientWidth);
    const height = Math.max(1,stage.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();renderFrame();
  };
  window.addEventListener('resize',resize);
  resize();
}
function renderFrame() {
  if (!renderer || !scene) return;
  renderer.render(scene,camera);
}
function disposeCurrent() {
  if(!active)return;
  modelGroup.remove(active);
  active.traverse(n=>{
    if(n.geometry)n.geometry.dispose();
    const mats=n.material ? (Array.isArray(n.material)?n.material:[n.material]) : [];
    for(const m of mats){
      for(const key of ['map','normalMap','metalnessMap','roughnessMap','aoMap','emissiveMap','alphaMap']){
        if(m[key])m[key].dispose();
      }
      m.dispose();
    }
  });
  active=null;
}
function showModel(asset) {
  disposeCurrent();
  active=asset.scene;
  modelGroup.add(active);
  const box=new THREE.Box3().setFromObject(active);
  const size=new THREE.Vector3(), center=new THREE.Vector3();
  box.getSize(size);box.getCenter(center);
  if(!Number.isFinite(size.length())||size.length()<1e-7)throw new Error('Empty or invalid geometry');
  active.position.sub(center);
  const radius=Math.max(size.x,size.y,size.z,0.25);
  controls.target.set(0,0,0);
  camera.near=Math.max(0.001,radius/1000);
  camera.far=Math.max(100,20*radius);
  const distance=1.9*radius/Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  camera.position.set(distance*0.55,distance*0.35,distance);
  camera.updateProjectionMatrix();
  controls.minDistance=radius*0.65;
  controls.maxDistance=radius*16;
  controls.update();
  renderFrame();
}
function validFile(url) {
  if(typeof url!=='string'||!ALLOWED.test(url)) throw new Error('Unrecognized Poly Haven file host');
  return url;
}
function loaderWithIncludes(record) {
  const entries = Object.entries(record.include||{}).map(([path,file])=>{
    if(!path||path.includes('..')||path.startsWith('/'))throw new Error('Unsafe relative dependency');
    return [path.replaceAll('\\','/'), validFile(file.url)];
  });
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(request => {
    const absolute = new URL(request,record.url);
    if (absolute.href === record.url) return record.url;
    const decoded = decodeURIComponent(absolute.pathname);
    for (const [path,url] of entries) if (decoded.endsWith('/'+path))return url;
    // Unlisted URLs in untrusted glTF may not silently reach arbitrary servers.
    return 'data:application/octet-stream,';
  });
  return new GLTFLoader(manager);
}
async function loadGLTF(loader, url) {
  return new Promise((resolve,reject) => loader.load(url,resolve,()=>{},reject));
}
function chooseRecord(files) {
  if(!files || typeof files!=='object')throw new Error('Poly Haven returned no model manifest');
  // Poly Haven publishes .gltf + .bin + textures, rather than a single .glb.
  const variants=files.gltf || {};
  const resolutions=['1k','2k','4k'];
  for(const res of resolutions) {
    const rec=variants[res]?.gltf;
    if(rec?.url&&rec?.include) return {record:rec,resolution:res};
  }
  throw new Error('No current glTF with included dependencies for this asset');
}
async function inspect(forceProxy) {
  if(!chosen)return;
  const e=++selectedEpoch;
  try {
    initialize();
    stage.hidden=false;
    live.disabled=proxy.disabled=true;
    tell(forceProxy ? 'Loading the Webspace low-poly fallback…' : 'Checking the live Poly Haven model and its dependencies…');
    let resolved;
    if (forceProxy) {
      resolved=await loadGLTF(new GLTFLoader(), '../../../assets/kilns/proxy/'+chosen.id+'.glb');
    } else {
      const slug=chosen.polyhaven_url.split('/a/')[1];
      if(!UID.test(slug))throw new Error('Invalid source asset identifier');
      // A fresh /files query every click means newer versions are requested
      // automatically, without changing the authored Kilns object contract.
      const response=await fetch(API+encodeURIComponent(slug),{
        mode:'cors',credentials:'omit',cache:'no-cache',referrerPolicy:'strict-origin-when-cross-origin'
      });
      if(!response.ok)throw new Error('Poly Haven API HTTP '+response.status);
      const files=await response.json();
      const {record,resolution}=chooseRecord(files);
      validFile(record.url);
      const bytes=record.size+Object.values(record.include).reduce((sum,v)=>sum+(v.size||0),0);
      if(bytes>16*1024*1024)tell('Downloading ~'+(bytes/1048576).toFixed(1)+' MiB, from Poly Haven ('+resolution+')…');
      else tell('Loading '+resolution+' artwork from Poly Haven…');
      resolved=await loadGLTF(loaderWithIncludes(record),record.url);
      if(e===selectedEpoch)tell('Poly Haven artist model ('+resolution+'), loaded live. Rotate or zoom to inspect; '+MATERIAL_NOTE);
    }
    if(e!==selectedEpoch){resolved.scene.traverse(n=>{});return;}
    showModel(resolved);
    if(forceProxy)tell('Webspace generated low-poly proxy: not Poly Haven artist geometry.');
  }catch(error){
    if(e===selectedEpoch) {
      tell((forceProxy?'Proxy unavailable: ':'Live artwork unavailable: ')+(error?.message||String(error))+
           (forceProxy?'':' · The original proxy and story remain available. Choose "Use proxy" for offline inspection.'));
    }
  }finally {
    if(e===selectedEpoch)live.disabled=proxy.disabled=false;
  }
}
window.addEventListener('webspace:kilns:selected', event=>{
  chosen = event.detail;
  selectedEpoch++;
  live.disabled=proxy.disabled=false;
  stage.hidden=true;
  disposeCurrent();
  live.textContent='Load current Poly Haven model for '+chosen.id;
  download.href='../../../assets/kilns/proxy/'+chosen.id+'.glb';
  download.download=chosen.id+'.glb';
  source.href=chosen.polyhaven_url;
  source.textContent='Original asset and author on Poly Haven';
  note.textContent='Source fit: '+chosen.fit+'. Downloaded original is component research; interactive gameplay remains the Kilns illustration.';
  tell('The source artist model loads only if you request it. The 24 original Webspace proxies remain available offline.');
});
live.addEventListener('click',()=>inspect(false));
proxy.addEventListener('click',()=>inspect(true));
