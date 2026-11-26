import * as THREE from 'three';
import { distress } from './weathering.js?v=101';

// Kilmainham+: photographed material scans, graded to a coherent preindustrial palette.
// Source assets are CC0; the grade is deliberately restrained to preserve KayKit silhouettes.
export const MATERIALS={
 masonry:{source:'plastered_stone_wall',target:[186,170,139],contrast:1.06,scale:3.15,rough:.98,bump:.042},
 oak:{source:'dark_wooden_planks',target:[53,63,57],contrast:.66,scale:2,rough:.94,bump:.025},
 boarding:{source:'wooden_planks',target:[148,116,77],contrast:.90,scale:2,rough:.96,bump:.024},
 iron:{source:'metal_plate_02',target:[92,108,122],contrast:.81,scale:1.25,rough:.85,metal:.30,bump:.009},
 flags:{source:'pavement_01',target:[130,123,114],contrast:.96,scale:1.5,rough:.96,bump:.035},
 linen:{source:'rough_linen',target:[115,109,90],contrast:.78,scale:.30,rough:1,bump:.008}
};
const path=(id,res,kind='diff')=>'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/'+res+'/'+id+'/'+id+'_'+kind+'_'+res+'.jpg';
export function sourceURLs(key){const id=MATERIALS[key].source;return ['2k','1k','4k'].map(r=>path(id,r));}
function canvasFor(image){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);return [c,ctx]}
async function imageFrom(url){const img=new Image();img.crossOrigin='anonymous';img.src=url;await img.decode();return img;}
export async function gradedCanvas(key){
 const spec=MATERIALS[key];let image,last;const local=new URL('./textures/'+spec.source+'_diff_2k.jpg',import.meta.url).href;
 for(const url of [local,...sourceURLs(key)]){try{image=await imageFrom(url);break}catch(e){last=e}}
 if(!image)throw last||new Error('Missing '+key);
 const [c,ctx]=canvasFor(image),data=ctx.getImageData(0,0,c.width,c.height),p=data.data;let avg=0;
 for(let i=0;i<p.length;i+=4)avg+=.2126*p[i]+.7152*p[i+1]+.0722*p[i+2];avg/=p.length/4;
 for(let i=0;i<p.length;i+=4){const l=.2126*p[i]+.7152*p[i+1]+.0722*p[i+2];for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,spec.target[k]+(l-avg)*spec.contrast+(p[i+k]-l)*.13));}
 ctx.putImageData(data,0,0);return c;
}
export function material(key,extra={}){const s=MATERIALS[key];return distress(new THREE.MeshStandardMaterial({name:'Kilmainham+ / '+key,color:new THREE.Color().setRGB(...s.target.map(c=>c/255),THREE.SRGBColorSpace),roughness:s.rough,metalness:s.metal||0,...extra}),key);}
export async function applyMaterialMaps(groups,renderer,onProgress=()=>{}){
 const keys=Object.keys(groups);let loaded=0,failed=[];
 await Promise.all(keys.map(async key=>{try{const canvas=await gradedCanvas(key),t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());const bump=t.clone();bump.colorSpace=THREE.NoColorSpace;bump.needsUpdate=true;for(const m of groups[key]){m.color.set(m.userData.scanTint??0xffffff);m.map=t;m.bumpMap=bump;m.bumpScale=MATERIALS[key].bump;m.needsUpdate=true;}loaded++}catch(e){failed.push(key);console.warn('Kilmainham material fallback:',key,e)}finally{onProgress(loaded,keys.length,[...failed])}}));
 return {loaded,failed};
}
// Remap actual triangles, not gradient atlas coordinates, into metric surface UVs.
// For horizontal plank source, U tracks grain direction and V tracks board seams.
function uvAt(x,y,z,nx,ny,nz,key){
 const s=MATERIALS[key].scale;
 if(key==='oak')return [y/3.15,x/1.55]; // upright door grain
 if(key==='boarding')return [z/2,x/2]; // longitudinal boarding
 if(Math.abs(ny)>Math.max(Math.abs(nx),Math.abs(nz)))return [x/s,z/s];
 if(Math.abs(nx)>Math.abs(nz))return [z/s,y/s];
 return [x/s,y/s];
}
export function projectUV(g,key){const p=g.attributes.position,n=g.attributes.normal;if(!n)g.computeVertexNormals();const nn=g.attributes.normal,uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++)uv.set(uvAt(p.getX(i),p.getY(i),p.getZ(i),nn.getX(i),nn.getY(i),nn.getZ(i),key),i*2);
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}
export function reskinMesh(mesh,key,library){
 let g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;
 if(!u||!n)return;
 const custom=key.includes('Bay')||key.includes('Blank')||key.includes('Crown')||key.includes('Cage');
 const keys=['masonry','oak','iron','boarding','flags','recess'];const buckets=keys.map(()=>({p:[],n:[],u:[]}));
 for(let i=0;i<p.count;i+=3){const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,atlasX=(u.getX(i)+u.getX(i+1)+u.getX(i+2))/3;let kind='masonry';
  if(key.includes('Cage'))kind='iron';
  else if(custom){if(key.includes('Cell_Bay')&&atlasX>.85)kind='oak';
    else if(key.includes('Cell_Bay')&&Math.abs(x)<.68&&y>.05&&atlasX<.10)kind='iron';
    else if(key.includes('Cell_Bay')&&Math.abs(atlasX-.425)<.03)kind='iron';
    else if(key.includes('Crown_Arch')&&Math.abs(atlasX-.425)<.03)kind='recess';
    // Both pale and formerly dark masonry chips are the same material.
  } else if(key==='floor_tile_large')kind='flags';
  else if(key==='table_medium')kind='boarding';
  else if(key==='chest')kind=(atlasX<.24||atlasX>.36&&atlasX<.49)?'iron':'boarding';
  const b=buckets[keys.indexOf(kind)],uvKey=kind==='recess'?'masonry':kind;
  for(let j=i;j<i+3;j++){const xyz=[p.getX(j),p.getY(j),p.getZ(j)],nor=[n.getX(j),n.getY(j),n.getZ(j)];b.p.push(...xyz);b.n.push(...nor);b.u.push(...uvAt(...xyz,...nor,uvKey))}
 }
 const P=[],N=[],U=[],out=new THREE.BufferGeometry();let start=0;
 buckets.forEach((b,i)=>{const count=b.p.length/3;if(!count)return;P.push(...b.p);N.push(...b.n);U.push(...b.u);out.addGroup(start,count,i);start+=count;});
 out.setAttribute('position',new THREE.Float32BufferAttribute(P,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));out.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));out.computeBoundingSphere();
 mesh.geometry=out;mesh.material=keys.map(k=>library[k]);g.dispose();
}

// Actual CC0 KayKit character meshes; original atlas remapped to role palette,
// retaining skin contrast and facial detail. No new rigs or accessories claimed.
const CHAR_ROOT='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/';
export const CHARACTERS=[
 {role:'Penitent',file:'Rogue_Hooded.glb',position:[-3.7,0,12.7],tone:[99,94,78]},
 {role:'Warder',file:'Knight.glb',position:[4.1,0,8.1],tone:[62,70,70]},
 {role:'Scrivener',file:'Rogue.glb',position:[3.8,0,.6],tone:[94,75,56]}
];
function recolorAtlas(texture,tone){if(!texture?.image)return texture;const [c,ctx]=canvasFor(texture.image),d=ctx.getImageData(0,0,c.width,c.height),a=d.data;
 for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2],l=.2126*r+.7152*g+.0722*b;const skin=r>g&&g>b&&r-g<65&&g-b<65&&l>130;if(skin)continue;const saturation=Math.max(r,g,b)-Math.min(r,g,b);const weight=saturation>28?.65:.30;for(let k=0;k<3;k++)a[i+k]=Math.max(0,Math.min(255,l*(1-weight)+(tone[k]+(l-128)*.72)*weight));}
 ctx.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.flipY=texture.flipY;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;
}
export async function addCharacters(scene,loader,mixers,onProgress=()=>{}){
 let count=0,failed=0;await Promise.all(CHARACTERS.map(async c=>{try{
 const local=new URL('./characters/'+c.file,import.meta.url).href;let gltf;try{gltf=await loader.loadAsync(local)}catch{gltf=await loader.loadAsync(CHAR_ROOT+c.file)}
 const root=gltf.scene;root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;const original=Array.isArray(o.material)?o.material:[o.material];const recolored=original.map(m=>{const clone=m.clone();try{clone.map=recolorAtlas(m.map,c.tone)}catch{clone.color.multiply(new THREE.Color(0xb0a394))}clone.roughness=.97;distress(clone,'character');clone.needsUpdate=true;return clone});o.material=Array.isArray(o.material)?recolored:recolored[0]});
 root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),height=bounds.max.y-bounds.min.y;if(!Number.isFinite(height)||height<.01)throw Error('invalid character height');root.scale.setScalar(1.78/height);root.position.set(c.position[0],-bounds.min.y*1.78/height,c.position[2]);root.rotation.y=Math.PI/2;root.name=c.role;scene.add(root);
 const idle=gltf.animations.find(a=>/idle/i.test(a.name));if(idle){const mixer=new THREE.AnimationMixer(root);mixer.clipAction(idle).play();mixers.push(mixer)}count++;
 }catch(e){failed++;console.warn('Optional character unavailable',c.role,e)}finally{onProgress(count,failed)}}));
}
