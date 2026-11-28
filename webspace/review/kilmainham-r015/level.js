import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { material, projectUV, reskinMesh, applyMaterialMaps, addCharacters } from './kilmainham-materials.js';
import { weatherScene } from './weathering.js';
import { Choir } from './choir.mjs';
import { mountChoir } from './choir-embodiments.js';
import { FoodHoist, HOIST } from './food-hoist.mjs';
import { mountFoodHoist } from './food-hoist-view.js';
import { STAIR as STAIR_PROFILE } from './spatial-contract.mjs';
import { mountLightFields } from './light-fields.js';
let fieldLight=null;const fieldFixtures=[],fallbackLamps=[];
const hoist=new FoodHoist();let hoistView=null,hoistClock=0,hoistStarted=false;
let choirCast=null;
const choir = new Choir(await fetch(new URL('./choir-canon.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Choir canon unavailable');return r.json()}));

// Architectural revision R010, photo-based geometry and alternating structural bands:
// - only two interior testimony nodes remain (hall and chapel)
// - three door tiers separated by two full-height doorless structural bands
// - bridge trusses, overhead roof cage, buttresses, roof arches, oval oculus, cage lights
// - torches and magic-user props removed

const NODES={
  gate:{name:'Intake',x:0,z:18,dx:-2.8,dz:-1.4},
  hall:{name:'The Crossing',x:0,z:11,dx:2.6,dz:-1.4},
  chapel:{name:'The Chapel of Names',x:0,z:3,dx:2.8,dz:-1.5},
  hearing:{name:'The Ninth Bell',x:0,z:-24,dx:3.0,dz:-1.5}
};
const EDGES=[['gate','hall'],['hall','chapel'],['chapel','hearing']];
const CASES={
  gate:{title:'The intake register',person:'Clerk Eamon Vale',story:'In 1879, in a Dublin that never existed, Kilmainham Asylum received prisoners whose testimony threatened established order. Tonight you are entered into the register as a temporary witness. Vale asks whether your testimony should be tied to your true name or preserved under a pseudonym until the city is ready to examine the record responsibly.',choices:[['Sign your own name','name','Your testimony remains open to challenge, but no one can deny who stood behind it.'],['Sign as a pseudonym','alias','Your identity is shielded. The public record will need corroboration from others.']]},
  hall:{title:'The crossing ledger',person:'Warden Rowan Pike',story:'Below the iron galleries a ledger records which prisoners crossed between wards during the disturbances. The book is incomplete. Pike urges you to fill the missing lines from memory so the administration can claim order has been restored. A rival clerk argues that the blanks themselves are evidence and should remain visible.',choices:[['Preserve the blanks and mark the ledger incomplete','blanks','The hall keeps a truthful record of uncertainty. Administrators lose the convenience of a clean story.'],['Reconstruct the missing passages from witness memory','reconstruct','The ledger becomes easier to read, but later readers may mistake remembered order for documented fact.']]},
  chapel:{title:'The chapel of names',person:'Brother Aidan',story:'The chapel wall carries the names of prisoners whose cases still divide the city. Some families want the names spoken aloud in public hearings; others want them held in confidence until independent review is possible. Aidan asks whether the bell should toll each name now or wait until consent and verification are both stronger.',choices:[['Read only the names backed by consent and verification','verified','The hearing becomes narrower, but those named are less likely to be used without permission.'],['Read every disputed name as a call for investigation','allnames','The city receives a fuller list of grievances, but some families may feel exposed before they are ready.']]},
  hearing:{title:'The ninth bell',person:'The public hearing',story:'The hall opens to the city. Light falls through the roof oculus and across the stacked galleries. No instrument in this building can decide what is true. It can only preserve who spoke, what was omitted, and how carefully the record was handled.',choices:[['Deliver the record with its limits stated plainly','deliver',''],['Request adjournment for independent review','adjourn','']]}
};
const REQUIRED=['hall','chapel'];
const state={node:'gate',trip:null,steps:0,answers:{},results:{}};

const STEP_LENGTH=.75, DEBUG_STEPS_PER_SECOND=24;
const STORY_COUNT=5, CELL_TIERS=3, BAND=3.15, DOOR_HEIGHT=3.05, LEVEL_PITCH=2*BAND;
const HALL_HALF_WIDTH=8.8, GALLERY_WIDTH=1.55, INNER=HALL_HALF_WIDTH-GALLERY_WIDTH;
const APSE_Z=-19, Z_MAX=24, Z_MIN=APSE_Z-HALL_HALF_WIDTH;
const CLERESTORY_Y=STORY_COUNT*BAND, CROWN_HEIGHT=1.85, ROOF_SPRING_Y=CLERESTORY_Y+CROWN_HEIGHT, ROOF_APEX_Y=ROOF_SPRING_Y+3.6;
const EYE=1.70;

// Ground-level detour avoids the central staircase; distances count actual path segments.
function pathFor(a,b){const start=[NODES[a].x,NODES[a].z],end=[NODES[b].x,NODES[b].z];if(a==='chapel'&&b==='hearing')return [start,[-2.5,1],[-2.5,-22.8],end];if(a==='hearing'&&b==='chapel')return pathFor(b,a).reverse();return [start,end];}
function routeLength(points){return points.slice(1).reduce((d,p,i)=>d+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);}
const stepCost=(a,b)=>Math.ceil(routeLength(pathFor(a,b))/STEP_LENGTH);
const neighbors=id=>EDGES.filter(e=>e[0]===id||e[1]===id).map(([a,b])=>({id:a===id?b:a,steps:stepCost(a,b)})).filter(n=>n.id!=='hearing'||REQUIRED.every(k=>state.answers[k]));
const pos=(id,y=EYE)=>new THREE.Vector3(NODES[id].x,y,NODES[id].z), objpos=id=>new THREE.Vector3(NODES[id].x+NODES[id].dx,0,NODES[id].z+NODES[id].dz);

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xb5bdc0);
scene.fog=new THREE.Fog(0x9fa7a8,49,120);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.05,150);camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({antialias:true});
let shaderFallback=false;
renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{
 console.error('Kilmainham shader error',gl.getProgramInfoLog(program),gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment));
 if(shaderFallback)return;shaderFallback=true;
 requestAnimationFrame(()=>{scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
 if(!m?.userData?.weathering&&!m?.userData?.lightFields)continue;m.onBeforeCompile=()=>{};m.customProgramCacheKey=()=> 'kilmainham-safe';m.needsUpdate=true;
 }});});
};
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.querySelector('#view').append(renderer.domElement);
const ambient=new THREE.HemisphereLight(0xd3dde3,0x82705b,1.48);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xe7e5d9,1.85);sun.position.set(-4,ROOF_APEX_Y+9,3);sun.target.position.set(0,2,-2);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-26,right:26,top:42,bottom:-42,near:.5,far:130});sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00055;scene.add(sun,sun.target);

const stone=material('masonry'), floorMat=material('flags');
const iron=material('iron'),trim=material('iron'),steelBlue=material('iron'),rustSteel=material('iron');
const gold=new THREE.MeshStandardMaterial({color:0x9d895c,emissive:0x715424,emissiveIntensity:.24,metalness:.48});
const glass=new THREE.MeshStandardMaterial({color:0xa6bfd0,transparent:true,opacity:.24,roughness:.34,metalness:.1,side:THREE.DoubleSide,depthWrite:false});
const lampGlow=new THREE.MeshStandardMaterial({color:0xc4b28a,emissive:0xb48c4c,emissiveIntensity:.82});
const paperMat=new THREE.MeshStandardMaterial({color:0xb5a485,roughness:1});

const architecturalMeshes=[];
function mesh(g,m,x,y,z,shadow=true){const o=new THREE.Mesh(g,m); architecturalMeshes.push(o);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o;}
function box(x,y,z,w,h,d,m=stone,shadow=true){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,shadow);}
function cyl(x,y,z,r,h,m=iron,radial=12,shadow=true){return mesh(new THREE.CylinderGeometry(r,r,h,radial),m,x,y,z,shadow);}
function beam(a,b,width,mat=iron){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),mid=A.clone().add(B).multiplyScalar(.5);const o=box(mid.x,mid.y,mid.z,width,d.length(),width,mat);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
function lamp(x,y,z,color,intensity=7,range=16,decay=1.7){const l=new THREE.PointLight(color,intensity,range,decay);l.position.set(x,y,z);scene.add(l);fallbackLamps.push(l);return l;}

const loader=new GLTFLoader(), models={};
let embedded={};
const ASSETS=['floor_tile_large','table_medium','chest'];
const CUSTOM=['Cell_Bay_Tall_A','Interstory_Blank_A','Crown_Arch_A','Crown_Blank_A','Apse_Interstory_Blank_A','Apse_Crown_Arch_A','Apse_Crown_Blank_A','Gallery_Cage_Barrel_A'];
const instances=new Map();
async function load(){
  const response=await fetch(new URL('./assets/r008-models.json',import.meta.url));
  if(!response.ok)throw new Error(`Model registry: HTTP ${response.status}`);
  embedded=await response.json();
  await Promise.all([...ASSETS,...CUSTOM].map(async key=>{
    const g=CUSTOM.includes(key)?(embedded[key]?.glb?await loader.parseAsync(Uint8Array.from(atob(embedded[key].glb),c=>c.charCodeAt(0)).buffer,''):await loader.loadAsync(`./assets/${key}.glb`)):(embedded[key]?await loader.parseAsync(JSON.stringify(embedded[key]),''):await loader.loadAsync(`./assets/${key}.gltf`));
    models[key]=g.scene;
    g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;reskinMesh(o,key,library);}});
  }));
}
function place(key,x,y,z,s=1,yaw=0,ground=true){const o=models[key].clone(true);o.scale.setScalar(s);o.rotation.y=yaw;o.position.set(x,y,z);o.updateMatrixWorld(true);if(ground)o.position.y+=y-new THREE.Box3().setFromObject(o).min.y;scene.add(o);return o;}

// R005 architectural asset families. All dimensions are scene metres, not surveyed dimensions.
const wood=material('boarding',{side:THREE.DoubleSide});
const roofWood=material('boarding',{side:THREE.DoubleSide});
const bridgeWood=material('boarding',{side:THREE.DoubleSide});
roofWood.userData.scanTint=0xe6ddce;bridgeWood.userData.scanTint=0xc1b7a2;wood.userData.scanTint=0xd6cbb7;
for(const m of [roofWood,bridgeWood,wood])m.color.multiply(new THREE.Color(m.userData.scanTint));
const doorMat=material('oak');
const recess=new THREE.MeshStandardMaterial({color:0x292923,roughness:1,side:THREE.DoubleSide});
const surround=material('masonry');
const shadeMat=material('iron');
const library={masonry:stone,oak:doorMat,iron,boarding:wood,flags:floorMat,recess};
const materialGroups={masonry:[stone,surround],oak:[doorMat],iron:[iron,trim,steelBlue,rustSteel,shadeMat],boarding:[wood,roofWood,bridgeWood],flags:[floorMat]};
const uvKinds=new Map(Object.entries(materialGroups).flatMap(([key,materials])=>materials.map(m=>[m,key])));

const mixers=[];let previousTime=0;
const review={maps:0,failed:[],characters:0,characterFailed:0};
const roofGlass=new THREE.MeshStandardMaterial({color:0xc1c9c6,transparent:true,opacity:.21,roughness:.48,side:THREE.DoubleSide,depthWrite:false});
const weatherKinds=new Map(uvKinds);for(const [m,k] of [[paperMat,'paper'],[gold,'brass'],[lampGlow,'lamp'],[glass,'glass'],[roofGlass,'glass'],[recess,'recess']])weatherKinds.set(m,k);
const cache={};
function poly(points){const s=new THREE.Shape(); points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
function archShape(w,h,head){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-head);s.absellipse(0,h-head,w/2,head,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function extrusion(shape,depth){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});g.translate(0,0,-depth/2);return g;}
function wallPoint(angle,z,r=HALL_HALF_WIDTH){return [r*Math.cos(angle),z-r*Math.sin(angle)];}
// R008: imported textured GLB modules, shared geometry and instanced transforms.
function queueAsset(key,x,y,z,rot=0,sx=1,sy=1,sz=1){
 const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.y=rot;o.scale.set(sx,sy,sz);o.updateMatrix();
 if(!instances.has(key))instances.set(key,[]);instances.get(key).push(o.matrix.clone());
}
function flushAssets(){for(const [key,matrices] of instances){const root=models[key];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;const batch=new THREE.InstancedMesh(o.geometry,o.material,matrices.length);matrices.forEach((m,i)=>batch.setMatrixAt(i,m.clone().multiply(o.matrixWorld)));batch.instanceMatrix.needsUpdate=true;batch.castShadow=true;batch.receiveShadow=true;batch.computeBoundingSphere();scene.add(batch);});}}
function fullWall(x,z,rotation,width,apse=false,crownOpen=true){
 const pre=apse?'Apse_':'',scale=apse?1:width/(43/15);
 // All doors use one FLAT cell module. At the apse, chord facets follow the curve;
 // the surrounding blank bands and crown retain their curved wedge geometry.
 const chordScale=apse?(2*HALL_HALF_WIDTH*Math.sin(Math.PI/20)+.012)/(43/15):scale;
 const inward=apse?HALL_HALF_WIDTH*(1-Math.cos(Math.PI/20)):0;
 const flatX=x+Math.sin(rotation)*inward,flatZ=z+Math.cos(rotation)*inward;
 for(let f=0;f<CELL_TIERS;f++){
  queueAsset('Cell_Bay_Tall_A',flatX,f*LEVEL_PITCH,flatZ,rotation,chordScale);
  if(f<CELL_TIERS-1)queueAsset(pre+'Interstory_Blank_A',x,f*LEVEL_PITCH+BAND,z,rotation,scale);
 }
 queueAsset(pre+(crownOpen?'Crown_Arch_A':'Crown_Blank_A'),x,CLERESTORY_Y,z,rotation,scale);
}
// A: continuous, curved-bottom transverse bridge web, actual oval voids. Not side-gallery cantilevers.
function bridgeWebGeometry(span){const key='bridge:'+span;if(cache[key])return cache[key];const depth=x=>.82+.86*Math.pow(Math.abs(x)/(span/2),1.6);const pts=[[-span/2,0],[span/2,0]];for(let i=24;i>=0;i--){let x=-span/2+span*i/24;pts.push([x,-depth(x)]);}const shape=poly(pts);const n=Math.floor(span/.77);for(let i=0;i<n;i++){let x=-span/2+(i+.5)*span/n,d=depth(x);const path=new THREE.Path();path.absellipse(x,-d*.51,.28,Math.min(d*.35,.60),0,Math.PI*2,false);shape.holes.push(path);}return cache[key]=extrusion(shape,.10);}
// B/C/D/E revised again for R007: the gallery-front enclosures become tall anti-suicide cages, while bridges and stairs keep the half-cylinder jungle-gym profile.
function lowRail(a,b,y,h=1.02){const [x,z]=a,[X,Z]=b;beam([x,y+h,z],[X,y+h,Z],.038,iron);beam([x,y+.54,z],[X,y+.54,Z],.028,trim);const d=Math.hypot(X-x,Z-z),n=Math.max(1,Math.ceil(d/.56));for(let j=0;j<=n;j++){const f=j/n;beam([x+(X-x)*f,y,z+(Z-z)*f],[x+(X-x)*f,y+h,z+(Z-z)*f],.034,iron);}}
function cageTunnel3D(A,B,width=1.30,sideH=1.00,radius=.66,hoopStep=.72,longBars=5,arcSegments=12){
 const [x0,y0,z0]=A,[x1,y1,z1]=B; const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz); if(len<.001)return;
 const ux=dx/len, uz=dz/len, px=-uz, pz=ux; const hoops=Math.max(1,Math.ceil(len/hoopStep)); const profiles=[];
 function hoop(f){const cx=x0+dx*f, cy=y0+(y1-y0)*f, cz=z0+dz*f; const pts=[]; const left=[cx-px*width/2,cy,cz-pz*width/2], right=[cx+px*width/2,cy,cz+pz*width/2]; const leftTop=[left[0],cy+sideH,left[2]], rightTop=[right[0],cy+sideH,right[2]]; beam(left,leftTop,.05,steelBlue); beam(right,rightTop,.05,steelBlue); pts.push(leftTop); for(let i=1;i<arcSegments;i++){const a=Math.PI-(Math.PI*i/arcSegments); const u=(width/2)*Math.cos(a), v=sideH+radius*Math.sin(a); pts.push([cx+px*u,cy+v,cz+pz*u]);} pts.push(rightTop); for(let i=1;i<pts.length;i++)beam(pts[i-1],pts[i],.048,steelBlue); return pts; }
 for(let i=0;i<=hoops;i++)profiles.push(hoop(i/hoops));
 const indices=[]; for(let i=0;i<longBars;i++) indices.push(Math.round((profiles[0].length-1)*i/(longBars-1)));
 for(let h=1;h<profiles.length;h++){ for(const idx of indices) beam(profiles[h-1][idx],profiles[h][idx],.026,trim); }
}
function galleryCage(A,B,deckY,width=1.37){
 const mid=[(A[0]+B[0])/2,(A[1]+B[1])/2];let a=A,b=B;
 let rot=Math.atan2(b[0]-a[0],b[1]-a[1]);const outward=[mid[0],Math.min(0,mid[1]-APSE_Z)];
 if(Math.cos(rot)*outward[0]-Math.sin(rot)*outward[1]<0){a=B;b=A;rot=Math.atan2(b[0]-a[0],b[1]-a[1]);}
 const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/1.22));
 for(let i=0;i<n;i++){const f=i/n;queueAsset('Gallery_Cage_Barrel_A',a[0]+(b[0]-a[0])*f,deckY,a[1]+(b[1]-a[1])*f,rot,width/1.37,1,len/n);}
}
function bridge(y,z,hasUpperFlight){
 const half=Math.min(INNER,wallHalf(z)-GALLERY_WIDTH+.08),span=2*half+.15;
 box(0,y-.10,z,span,.20,1.65,bridgeWood);
 for(const side of [-1,1]){mesh(bridgeWebGeometry(span),steelBlue,0,y-.18,z+side*.78);box(0,y-.19,z+side*.78,span,.075,.20,steelBlue);}
 // One cage per span, not one identical cage per girder. Preserve open stair arrival.
 for(const [a,b] of [[-half,-.83],[.83,half]])cageTunnel3D([a,y,z],[b,y,z],1.46,STAIR_PROFILE.spring,STAIR_PROFILE.radius,1.05,7,STAIR_PROFILE.segments);
}
// F: curved wall-mounted gallery bracket (the actual small cantilever, distinct from bridge web).
function buttress(x,z,angle,y){const d=[Math.sin(angle),Math.cos(angle)];const P=(u,v)=>[x+d[0]*u,y+v,z+d[1]*u];beam(P(0,-1.02),P(0,-.10),.095,iron);beam(P(0,-.10),P(GALLERY_WIDTH,-.10),.075,iron);const pts=[];for(let i=0;i<=9;i++){let f=i/9;pts.push(P(GALLERY_WIDTH*(1-Math.cos(f*Math.PI/2)), -1.02+.92*Math.sin(f*Math.PI/2)));}for(let i=1;i<pts.length;i++)beam(pts[i-1],pts[i],.065,iron);}
// G: photograph-derived shallow metal shade on a discreet side bracket, no chandelier.
function cageLight(x,y,z,angle){const dx=Math.sin(angle),dz=Math.cos(angle),X=x+dx*.28,Z=z+dz*.28;fieldFixtures.push([X,y-.10,Z]);beam([x,y+.28,z],[X,y+.28,Z],.026,iron);beam([X,y+.28,Z],[X,y,Z],.025,iron);mesh(new THREE.CylinderGeometry(.045,.19,.09,16,1,false),shadeMat,X,y-.045,Z,false);mesh(new THREE.CircleGeometry(.16,16),lampGlow,X,y-.095,Z,false).rotation.x=Math.PI/2;}
function roofY(x,z){let q=z<APSE_Z?z-APSE_Z:0;return ROOF_SPRING_Y+(ROOF_APEX_Y-ROOF_SPRING_Y)*Math.sqrt(Math.max(0,1-(x*x+q*q)/(HALL_HALF_WIDTH*HALL_HALF_WIDTH)));}
function wallHalf(z){return Math.sqrt(Math.max(0,HALL_HALF_WIDTH**2-Math.min(0,z-APSE_Z)**2));}
// Long oval rooflight in plan, integrated into a curved timber roof rather than a floating ring.
function openingHalf(z){const v=(z+1.5)/25;return Math.min(wallHalf(z),2.65*Math.sqrt(Math.max(0,1-v*v)));}
function surface(fn,z0,z1,nZ,nX,mat,shadow=true){const ps=[],idx=[];for(let j=0;j<=nZ;j++){let z=z0+(z1-z0)*j/nZ;for(let i=0;i<=nX;i++){let x=fn(z,i/nX);ps.push(x,roofY(x,z),z);}}for(let j=0;j<nZ;j++)for(let i=0;i<nX;i++){let a=j*(nX+1)+i,b=a+nX+1;idx.push(a,b,a+1,a+1,b,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,mat,0,0,0,shadow);}
// H: curved open-lattice arch. Twin curved chords with alternating diagonal bars.
// Deep haunches reach the clerestory sill; lattice depth tapers towards the glass spine.
function roofHalfRib(point){
 const top=[],lower=[],n=16;
 for(let i=0;i<=n;i++){const t=i/n*Math.PI/2,r=HALL_HALF_WIDTH*Math.cos(t),[x,z]=point(r);
 const y=roofY(x,z)-.055,depth=.28+1.56*Math.pow(Math.cos(t),3);
 const [lx,lz]=point(r*.977);top.push([x,y,z]);lower.push([lx,y-depth,lz]);}
 for(let i=1;i<=n;i++){beam(top[i-1],top[i],.075,steelBlue);beam(lower[i-1],lower[i],.075,steelBlue);beam(top[i-1],lower[i],.033,steelBlue);beam(lower[i-1],top[i],.033,steelBlue);}
 beam(top[0],lower[0],.085,steelBlue);const p=lower[0];box(p[0],p[1]-.10,p[2],.25,.25,.25,steelBlue);const [wx,wz]=point(HALL_HALF_WIDTH);beam([p[0],p[1],p[2]],[wx,p[1]-.28,wz],.10,steelBlue);box(wx*.995,p[1]-.23,wz,.24,.44,.24,iron);
}
function roofRib(z){for(const side of [-1,1])roofHalfRib(r=>[side*r,z]);}
function horizontalCourse(y,radius,width,height,mat){
 for(const side of [-1,1])box(side*radius,y,(APSE_Z+Z_MAX)/2,width,height,Z_MAX-APSE_Z,mat);
 for(let i=0;i<30;i++){const a=wallPoint(i*Math.PI/30,APSE_Z,radius),b=wallPoint((i+1)*Math.PI/30,APSE_Z,radius);beam([a[0],y,a[1]],[b[0],y,b[1]],height,mat);}
 box(0,y,Z_MAX-.15,2*radius,height,width,mat);
}
function deckSegment(a,b,y){const [x,z]=a,[X,Z]=b,d=Math.hypot(X-x,Z-z),theta=Math.atan2(-(Z-z),X-x);const o=box((x+X)/2,y-.11,(z+Z)/2,d+.025,.20,GALLERY_WIDTH,wood);o.rotation.y=theta;}
// Reusable, photo-inspired open iron stair. 35 risers at ~180mm; wood treads and perforated risers.
const STAIR_RUN=STAIR_PROFILE.run, STAIR_RISERS=STAIR_PROFILE.risers, STAIR_WIDTH=STAIR_PROFILE.width;
function stairRiserGeometry(){if(cache.riser)return cache.riser;const dy=LEVEL_PITCH/STAIR_RISERS;const sh=poly([[-STAIR_WIDTH/2,0],[STAIR_WIDTH/2,0],[STAIR_WIDTH/2,dy],[-STAIR_WIDTH/2,dy]]);for(let k=0;k<9;k++){const hole=new THREE.Path();hole.absellipse(-.60+k*.15,dy*.50,.057,.062,0,Math.PI*2,false);sh.holes.push(hole);}return cache.riser=extrusion(sh,.025);}
function stairFlight(y,z){const dy=LEVEL_PITCH/STAIR_RISERS,dz=STAIR_RUN/STAIR_RISERS;
 for(let i=0;i<STAIR_RISERS;i++){const yy=y+i*dy,zz=z-i*dz;mesh(stairRiserGeometry(),steelBlue,0,yy,zz);box(0,yy+dy-.025,zz-dz/2,STAIR_WIDTH,.05,dz+.016,wood);}
 for(const side of [-1,1]){
  beam([side*.70,y+.02,z],[side*.70,y+LEVEL_PITCH+.02,z-STAIR_RUN],.14,steelBlue);
  // Continuous handrail and supported lower side bars; curved overhead cage begins farther up.
  for(let h=.28;h<1.10;h+=.19)beam([side*.72,y+h,z],[side*.72,y+LEVEL_PITCH+h,z-STAIR_RUN],.022,trim);
  beam([side*.72,y+1.10,z],[side*.72,y+LEVEL_PITCH+1.10,z-STAIR_RUN],.055,iron);
  for(let i=0;i<=STAIR_RISERS;i+=3){const f=Math.min(i/STAIR_RISERS,1),zz=z-f*STAIR_RUN,yy=y+f*LEVEL_PITCH;beam([side*.72,yy,zz],[side*.72,yy+1.10,zz],.038,iron);}
 }
 const cageStart=STAIR_PROFILE.startsAt/STAIR_RISERS;
 cageTunnel3D([0,y+LEVEL_PITCH*cageStart,z-STAIR_RUN*cageStart],[0,y+LEVEL_PITCH,z-STAIR_RUN],STAIR_PROFILE.cageWidth,STAIR_PROFILE.spring,STAIR_PROFILE.radius,.76,7,STAIR_PROFILE.segments);
}

function figure(x,z,c){const m=new THREE.MeshStandardMaterial({color:c,roughness:.9});mesh(new THREE.CylinderGeometry(.27,.38,.95,7),m,x,.78,z);mesh(new THREE.SphereGeometry(.22,8,6),m,x,1.49,z);}
function build(){
 // D-shaped hall: straight nave plus semicircular eastern apse. Floor tiles restricted to footprint.
 // Actual opening in the ground slab for the exposed food hoist. The kitchen
 // below is a visual recess, not a navigable room in this increment.
 const [hx,,hz]=HOIST.position,hw=.76,hd=.60;
 function floorRect(x0,x1,z0,z1){box((x0+x1)/2,-.20,(z0+z1)/2,x1-x0,.35,z1-z0,floorMat);}
 floorRect(-HALL_HALF_WIDTH,hx-hw,APSE_Z,Z_MAX);
 floorRect(hx+hw,HALL_HALF_WIDTH,APSE_Z,Z_MAX);
 floorRect(hx-hw,hx+hw,APSE_Z,hz-hd);floorRect(hx-hw,hx+hw,hz+hd,Z_MAX);
 box(hx,-3.38,hz,1.52,.35,1.20,floorMat);
 for(const side of [-1,1]){box(hx+side*.81,-1.7,hz,.10,3.4,1.32,stone);box(hx,-1.7,hz+side*.65,1.62,3.4,.10,stone);}
 // Small service ledges toward existing galleries; no passenger route or screen opening yet.
 for(const y of [LEVEL_PITCH,2*LEVEL_PITCH])box((hx+.46+INNER)/2,y-.11,hz,INNER-hx-.46,.20,1.06,wood);
 const apseFloor=mesh(new THREE.CylinderGeometry(HALL_HALF_WIDTH,HALL_HALF_WIDTH,.35,48,1,false,Math.PI/2,Math.PI),floorMat,0,-.20,APSE_Z);apseFloor.rotation.y=0;
 for(let z=Z_MIN+2;z<Z_MAX;z+=4)for(let x=-6;x<=6;x+=4){if(Math.abs(x)+2<wallHalf(z-2)&&!(Math.abs(x-hx)<2+hw&&Math.abs(z-hz)<2+hd))place('floor_tile_large',x,-.06,z,1,0,false);}
 // side elevations: three door courses separated by two full-height blank bands, plus shallow arched roof crown.
 const n=15,step=(Z_MAX-APSE_Z)/n;
 for(const side of [-1,1])for(let i=0;i<n;i++){const z=APSE_Z+(i+.5)*step,angle=-side*Math.PI/2,x=side*HALL_HALF_WIDTH;
   fullWall(x,z,angle,step,false,i%2===0);
   for(let f=1;f<CELL_TIERS;f++){const y=f*LEVEL_PITCH;const centerX=side*(HALL_HALF_WIDTH-GALLERY_WIDTH/2);box(centerX,y-.11,z,GALLERY_WIDTH,.2,step+.025,wood);galleryCage([centerX,z-step/2],[centerX,z+step/2],y,GALLERY_WIDTH-.18);buttress(x-side*.18,z,angle,y);if(i%3===1)cageLight(side*INNER,y-.38,z,angle);}
 }
 const nArc=10;for(let i=0;i<nArc;i++){let a=(i+.5)*Math.PI/nArc,da=Math.PI/nArc;let [x,z]=wallPoint(a,APSE_Z);let rot=a-Math.PI/2; // local +Z points toward centre
 const width=2*HALL_HALF_WIDTH*Math.tan(da/2)+.025;fullWall(x,z,rot,width,true,i%2===0);
 for(let f=1;f<CELL_TIERS;f++){const y=f*LEVEL_PITCH;const A=wallPoint(a-da/2,APSE_Z,INNER),B=wallPoint(a+da/2,APSE_Z,INNER);const C=wallPoint(a-da/2,APSE_Z,HALL_HALF_WIDTH),D=wallPoint(a+da/2,APSE_Z,HALL_HALF_WIDTH);const M=wallPoint(a-da/2,APSE_Z,HALL_HALF_WIDTH-GALLERY_WIDTH/2),N=wallPoint(a+da/2,APSE_Z,HALL_HALF_WIDTH-GALLERY_WIDTH/2);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([A[0],y-.08,A[1],B[0],y-.08,B[1],C[0],y-.08,C[1],D[0],y-.08,D[1]],3));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();mesh(g,wood,0,0,0);galleryCage(M,N,y,GALLERY_WIDTH-.20);buttress(x,z,rot,y);if(i%3===1)cageLight((A[0]+B[0])/2,y-.38,(A[1]+B[1])/2,rot);}}
 // west end: masonry and arched openings at each level; no cells at fourth band.
 for(let i=0;i<6;i++){let x=-HALL_HALF_WIDTH+(i+.5)*2*HALL_HALF_WIDTH/6;fullWall(x,Z_MAX,Math.PI,2*HALL_HALF_WIDTH/6,false,i%2===0);}
 // Close the west gable above the masonry; the only overhead opening is the rooflight.
 const gablePoints=[[-HALL_HALF_WIDTH,0]];for(let i=0;i<=32;i++){const t=-Math.PI/2+i*Math.PI/32;gablePoints.push([HALL_HALF_WIDTH*Math.sin(t),3.6*Math.cos(t)]);}gablePoints.push([HALL_HALF_WIDTH,0]);mesh(extrusion(poly(gablePoints),.3),stone,0,ROOF_SPRING_Y,Z_MAX);
 // continuous cornices across the masonry at gallery and clerestory lines.
 for(const y of [LEVEL_PITCH,2*LEVEL_PITCH,CLERESTORY_Y,ROOF_SPRING_Y])horizontalCourse(y-.055,8.63,.32,.13,surround);
 horizontalCourse(.09,8.65,.16,.16,iron);
 for(const y of [LEVEL_PITCH,2*LEVEL_PITCH])horizontalCourse(y-.12,INNER,.16,.16,steelBlue);
 // Longitudinal purlins divide the timber soffit into broad bands.
 for(const side of [-1,1])for(const r of [4.65,7.05]){
  const y=roofY(r,0)-.06;beam([side*r,y,APSE_Z],[side*r,y,Z_MAX],.085,steelBlue);
 }
 for(const r of [4.65,7.05])for(let i=0;i<24;i++){const a=wallPoint(i*Math.PI/24,APSE_Z,r),b=wallPoint((i+1)*Math.PI/24,APSE_Z,r);beam([a[0],roofY(...a)-.06,a[1]],[b[0],roofY(...b)-.06,b[1]],.075,steelBlue);}
 // Central two-flight stair and transverse bridges: each flight ends at the next gallery landing.
 stairFlight(0,0);bridge(LEVEL_PITCH,-9.925,true);stairFlight(LEVEL_PITCH,-10.75);bridge(2*LEVEL_PITCH,-20.675,false);
 // Curved timber soffits and genuine oval aperture. Glazing spans the opening, with metal mullions.
 for(const side of [-1,1])surface((z,f)=>side*(openingHalf(z)+(wallHalf(z)-openingHalf(z))*f),Z_MIN+.005,Z_MAX,88,12,roofWood);
 surface((z,f)=>openingHalf(z)*(2*f-1),-26.5,23.5,80,10,roofGlass,false);
 for(let z=-26;z<=23;z+=1.15){const w=openingHalf(z);if(w<.08)continue;let prev=null;for(let i=0;i<=10;i++){let x=-w+2*w*i/10,P=[x,roofY(x,z)+.02,z];if(prev)beam(prev,P,.035,trim);prev=P;}}
 for(const sign of [-1,0,1]){let prev=null;for(let z=-26.4;z<=23.4;z+=.6){let x=sign*openingHalf(z),P=[x,roofY(x,z)+.02,z];if(prev)beam(prev,P,sign===0?.06:.11,steelBlue);prev=P;}}
 for(let z=APSE_Z;z<Z_MAX;z+=6.2)roofRib(z);
 // apse fan ribs, each radial half-arch terminates at crown.
 for(let i=1;i<6;i++){const a=i*Math.PI/6;roofHalfRib(r=>wallPoint(a,APSE_Z,r));}
 // Roof boarding joints along nave, subtle rather than dark floating shafts.
 for(let z=APSE_Z+1;z<Z_MAX;z+=1.2)for(const side of [-1,1]){let prev=null;for(let i=0;i<=8;i++){let x=side*(openingHalf(z)+(HALL_HALF_WIDTH-openingHalf(z))*i/8),P=[x,roofY(x,z)-.02,z];if(prev)beam(prev,P,.018,rustSteel);prev=P;}}
 // Four nodes, two central; keep center route clear and detour around iron stair.
 for(const [a,b] of EDGES){let points=pathFor(a,b);for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[X,Z]=points[i];const o=box((x+X)/2,.008,(z+Z)/2,.06,.015,Math.hypot(X-x,Z-z),trim,false);o.rotation.y=Math.atan2(X-x,Z-z);}}
 for(const id of Object.keys(NODES)){const p=pos(id,.045);mesh(new THREE.RingGeometry(.64,.70,40),gold,p.x,p.y,p.z,false).rotation.x=-Math.PI/2;}
 const gp=objpos('gate');place('table_medium',gp.x,0,gp.z,.85);place('chest',gp.x,.85,gp.z,.42);
 for(const id of ['hall','chapel']){const p=objpos(id);place('table_medium',p.x,0,p.z,.92);box(p.x,.9,p.z,.56,.035,.37,paperMat);}
 const p=objpos('hearing');place('table_medium',p.x,0,p.z,.85);mesh(new THREE.CylinderGeometry(.3,.57,.65,12),gold,p.x,1.25,p.z);mesh(new THREE.SphereGeometry(.10,10,8),gold,p.x,.92,p.z);
 // Daylight dominates. A few soft fill lights near the galleries, not giant visible lamps.
 for(const z of [-18,0,18])lamp(0,6.5,z,0xe1c69a,2.6,15,2);
}
// Merge static procedural meshes by material and shadow policy for reasonable GPU draw counts.
function batchArchitecture(){scene.updateMatrixWorld(true);const buckets=new Map();for(const o of architecturalMeshes){if(o.material.transparent)continue;let key=o.material.uuid+':'+o.castShadow;let list=buckets.get(key);if(!list)buckets.set(key,list=[]);list.push(o);}for(const list of buckets.values()){if(list.length<2){const o=list[0],kind=uvKinds.get(o.material);if(kind){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);projectUV(g,kind);const replacement=new THREE.Mesh(g,o.material);replacement.castShadow=o.castShadow;replacement.receiveShadow=true;scene.add(replacement);scene.remove(o);}continue;}const geos=list.map(o=>{let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);for(const name of Object.keys(g.attributes))if(name!=='position'&&name!=='normal'&&name!=='uv')g.deleteAttribute(name);if(!g.attributes.normal)g.computeVertexNormals();const kind=uvKinds.get(o.material);if(kind){projectUV(g,kind);if(o.material===bridgeWood){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const a=uv.getX(i);uv.setXY(i,uv.getY(i),a);}}}else g.deleteAttribute('uv');return g;});const merged=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());if(!merged)continue;const o=new THREE.Mesh(merged,list[0].material);o.castShadow=list[0].castShadow;o.receiveShadow=true;scene.add(o);list.forEach(x=>scene.remove(x));}}

const $=s=>document.querySelector(s), marks=$('#marks'), dialog=$('#dialog');
let yaw=0,pitch=0,markers=[];
camera.position.copy(pos('gate'));
const compass='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15.5 5.5 13.7 13.7 5.5 15.5 10.3 10.3Z" fill="currentColor" stroke="none"/><path d="M8.5 18.5 10.3 10.3 18.5 8.5 13.7 13.7" opacity=".55"/></svg>';

function progress(){return REQUIRED.filter(k=>state.answers[k]).length;}
function refresh(){
  const voices=choir.publicAt(state.node);const pane=document.querySelector('#voices');pane.replaceChildren();for(const voice of voices){const p=document.createElement('p');p.textContent=voice.name+': '+voice.line;pane.append(p);}

  const id=state.node;
  $('#location').textContent=NODES[id].name;
  $('#clock').textContent=`${progress()} / ${REQUIRED.length} interior testimonies · ${state.steps} steps travelled`;
  $('#status').textContent=id==='chapel' && progress()<REQUIRED.length ? 'The Ninth Bell remains sealed until the remaining testimony is taken.' : 'Turn to discover connected routes and local testimony.';
  marks.replaceChildren(); markers=[];
  for(const n of neighbors(id)){
    const b=document.createElement('button'); b.className='marker travel'; b.innerHTML=compass; const t=document.createElement('span'); t.textContent=`${NODES[n.id].name} · ${n.steps} steps`; b.append(t); b.onclick=()=>travel(n.id); marks.append(b); markers.push({el:b,world:pos(n.id,1.28)});
  }
  const b=document.createElement('button'); b.className='marker local'+(state.answers[id]?' done':''); b.textContent=state.answers[id]?'Review testimony':CASES[id].title; b.onclick=()=>interact(id); marks.append(b); const p=objpos(id); p.y=1.7; markers.push({el:b,world:p});
 if(id==='chapel'||id==='hall'){const h=document.createElement('button');h.className='marker local';h.textContent='Inspect food hoist';h.onclick=inspectHoist;marks.append(h);markers.push({el:h,world:new THREE.Vector3(HOIST.position[0],1.6,HOIST.position[2])});}
}
function inspectHoist(){if(state.trip||dialog.open)return;const h=hoist.inspect();$('#eyebrow').textContent='East Wing · institutional service';$('#question').textContent='The food hoist';$('#story').textContent='Two slender iron poles, an overhead pulley and a hatch to the kitchen. Meals pass through the court before going up to the galleries. This mechanism has a history of work and care.';$('#choices').replaceChildren();$('#outcome').hidden=false;$('#outcome').textContent='Rounds completed: '+h.rounds+' · '+(h.servicePending?'Maintenance due':h.phase)+'\nLast service: '+(h.lastService===null?'not yet recorded':'tick '+h.lastService);$('#endnote').textContent='Fictional mechanism; no passenger travel.';for(const [label,act] of [['Request another meal round',()=>hoist.start()],['Arrange maintenance',()=>hoist.service()]]){const b=document.createElement('button');b.textContent=label;b.disabled=h.phase!=='idle'||(label.startsWith('Request')&&h.servicePending);b.onclick=()=>{if(act()){hoistStarted=true;dialog.close();}else $('#outcome').textContent='The hoist is not ready for that operation.';};$('#choices').append(b);}dialog.showModal();}
function travel(id){const edge=neighbors(state.node).find(n=>n.id===id);if(!edge||state.trip||dialog.open)return;const points=pathFor(state.node,id).map(([x,z])=>new THREE.Vector3(x,EYE,z));const length=routeLength(pathFor(state.node,id));state.trip={id,points,length,steps:edge.steps,duration:edge.steps/DEBUG_STEPS_PER_SECOND,start:performance.now()};pitch=0;$('#status').textContent=`Travelling to ${NODES[id].name}…`;markers.forEach(m=>m.el.hidden=true);}
function tick(now){if(!state.trip)return;const t=state.trip,frac=Math.min(1,(now-t.start)/(t.duration*1000));let remaining=t.length*frac;for(let i=1;i<t.points.length;i++){let a=t.points[i-1],b=t.points[i],d=a.distanceTo(b);if(remaining<=d||i===t.points.length-1){camera.position.lerpVectors(a,b,Math.min(1,remaining/d));yaw=Math.atan2(a.x-b.x,a.z-b.z);break;}remaining-=d;}camera.position.y+=Math.sin(frac*Math.PI*2*t.steps)*.026*Math.sin(Math.PI*frac);$('#clock').textContent=`${progress()} / ${REQUIRED.length} interior testimonies · ${state.steps+Math.floor(frac*t.steps)} steps travelled`;if(frac===1){state.steps+=t.steps;state.node=t.id;state.trip=null;choir.travelPowers(EDGES);choir.advance(t.steps,state.node);refresh();}}
function dilemma(id,key){
  if(id==='hearing'){
    const a=state.answers;
    const hall=a.hall==='blanks'?'The crossing ledger still displays its gaps; uncertainty has not been concealed.':'The missing crossings were reconstructed from witness memory and must now be tested carefully.';
    const chapel=a.chapel==='verified'?'Only verified and consented names are spoken in public.':'Every disputed name is sounded as a summons for investigation.';
    const intake=a.gate==='name'?'Your true name accompanies the testimony.':a.gate==='alias'?'Your testimony enters the record under a pseudonym.':'No intake signature was recorded.';
    return `${key==='deliver'?'The bell sounds and the record is delivered with its cautions intact.':'The hearing pauses before proclamation. Independent review is requested before the bell is allowed to sound.'}\n\n${hall}\n${chapel}\n${intake}\n\nThere is no morality score. What survives is a chain of custodial decisions: how openly the record was signed, how honestly uncertainty was preserved, and how publicly the disputed names were carried into the city.`;
  }
  return CASES[id].choices.find(c=>c[1]===key)[2];
}
function interact(id){
  if(state.trip||state.node!==id)return; const c=CASES[id]; $('#eyebrow').textContent=c.person; $('#question').textContent=c.title; $('#story').textContent=c.story; $('#choices').replaceChildren(); $('#endnote').textContent=''; $('#outcome').hidden=true;
  if(state.answers[id]){const ch=c.choices.find(q=>q[1]===state.answers[id]); $('#outcome').textContent=`Your choice: ${ch[0]}\n\n${state.results[id]}`; $('#outcome').hidden=false;}
  else{for(const [label,key] of c.choices){const b=document.createElement('button'); b.textContent=label; b.onclick=()=>{if(state.answers[id])return; state.answers[id]=key; choir.commit(id,key); state.results[id]=dilemma(id,key); $('#choices').replaceChildren(); $('#outcome').textContent=state.results[id]; $('#outcome').hidden=false; $('#endnote').textContent=id==='hearing'?'End of this session. Reload to explore another branch.':'Testimony recorded. You may review it when you return.'; refresh();}; $('#choices').append(b);}}
  dialog.showModal();
}
$('#close').onclick=()=>dialog.close();
const canvas=renderer.domElement; let drag=false,lastX=0,lastY=0;
canvas.addEventListener('pointerdown',e=>{if(dialog.open)return;drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return; yaw-=(e.clientX-lastX)*.005; pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.005,-1.15,1.15); lastX=e.clientX; lastY=e.clientY});
for(const e of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(e,()=>drag=false);
addEventListener('keydown',e=>{if(dialog.open||/^(INPUT|SELECT|BUTTON|SUMMARY)$/.test(e.target?.tagName||''))return; if(!e.key.startsWith('Arrow'))return; e.preventDefault(); if(e.key==='ArrowLeft')yaw+=.19; if(e.key==='ArrowRight')yaw-=.19; if(e.key==='ArrowUp')pitch=Math.min(1.15,pitch+.12); if(e.key==='ArrowDown')pitch=Math.max(-1.15,pitch-.12)});
function updateMarkers(){const r=canvas.getBoundingClientRect(),f=camera.getWorldDirection(new THREE.Vector3()); for(const m of markers){const delta=m.world.clone().sub(camera.position),p=m.world.clone().project(camera); const visible=!state.trip&&!dialog.open&&delta.dot(f)>.1&&p.z>=-1&&p.z<=1&&Math.abs(p.x)<.9&&Math.abs(p.y)<.85; m.el.hidden=!visible; if(visible){m.el.style.left=`${r.left+(p.x+1)*r.width/2}px`; m.el.style.top=`${r.top+(1-p.y)*r.height/2}px`;}}}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function animate(now){const dt=previousTime?Math.min(.05,(now-previousTime)/1000):0;previousTime=now;
 if(fieldLight&&!shaderFallback)fieldLight.update(now);else if(shaderFallback){fieldLight?.disable?.();sun.intensity=1.85;ambient.intensity=1.48;for(const l of fallbackLamps)l.intensity=2.6;}
 if(hoistView){hoistClock+=dt;while(hoistClock>=.1){hoistClock-=.1;hoist.advance();}if(!hoistStarted&&hoist.tick>=30){hoistStarted=true;hoist.start();}hoistView.update(hoist.inspect(),dt);}for(const mixer of mixers)mixer.update(dt);tick(now);if(choirCast)choirCast.sync(dt); camera.rotation.set(pitch,yaw,0,'YXZ'); camera.updateMatrixWorld(); updateMarkers(); renderer.render(scene,camera)}
function reportArt(){const failed=review.failed.length?' · '+review.failed.length+' map fallbacks':'';$('#assets').textContent='R015 chiaroscuro · '+review.maps+'/5 material maps'+failed+' · '+review.characters+' characters'+(review.characterFailed?' ('+review.characterFailed+' unavailable)':'');}
try{
 await load();build();flushAssets();batchArchitecture();hoistView=mountFoodHoist(scene,{iron:steelBlue,dark:iron,wood});hoistView.update(hoist.inspect());for(const moving of [hoistView.tray,hoistView.hatch,hoistView.wheel])moving.traverse(o=>{if(o.isMesh)o.castShadow=false;});weatherScene(scene,weatherKinds);
 // Keep optional lighting independent of the base scene. A failure restores original lights.
 try{fieldLight=mountLightFields({scene,renderer,sun,ambient,fixtures:fieldFixtures,lamps:fallbackLamps,lampGlow,roofGlass,getActors:()=>choirCast?[...choirCast.objects.values()]:[]});}catch(e){console.warn('Light field fallback',e);}
 choir.advance(1,'gate','arrival of the witness');refresh();reportArt();renderer.setAnimationLoop(animate);
 window.KilmainhamChoir={get state(){return {node:state.node,steps:state.steps,events:choir.events.length}},get frames(){return renderer.info.render.frame},get embodied(){return choirCast?.objects.size||0},get hoist(){return hoist.snapshot()},get light(){return fieldLight?.state||null},get local(){return choir.publicAt(state.node)}};
 // Texture and character availability must never gate the playable scene.
 applyMaterialMaps(materialGroups,renderer,(n,total,failed)=>{review.maps=n;review.failed=failed;reportArt()}).catch(console.warn);
 choirCast=mountChoir(scene,loader,choir,NODES,(n,failed)=>{review.characters=n;review.characterFailed=failed;reportArt()});
}catch(e){console.error(e); $('#assets').textContent='Asset loading failed: '+e.message; $('#status').textContent='Check the asset error above. For the source project, serve the entire folder over HTTP.';}