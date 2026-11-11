/**
 * The Kilns — House of Inherited Light, fully navigable 3D edition.
 * v7: 9 connected ground-floor cells + an upstairs attic via stair flight.
 *
 * World geometry, time, route graph and narrative are owned by this CHILD
 * world. No implicit login, bank reputation, visitor-data export, or
 * automatic change to Elisium's independent sky is introduced.
 */
import * as THREE from 'three';
import {ROOM_ORDER,BY_NAME,START_ROOM,FLOOR_HEIGHT,CELL,roomForPosition,canStep,placeForObject,reachableRooms} from './house-layout.mjs';
import {createFantasy} from './house-fantasy.mjs';
import {mountHistoricalDonor,watchAssetState} from './house-assets.mjs';

const $=id=>document.getElementById(id);
const canvas=$('house-canvas');
const roomTitle=$('room-title'),hint=$('hint'),proximity=$('proximity');
const roomButtons=$('room-list'),story=$('story'),sourceState=$('sources');
const count=$('count'),clock=$('clock'),notice=$('notice'),activeObject=$('active-object');
const journalKey='webspace.kilns.v7.session';
const bridge=window.ElisiumThreshold;
if(!bridge)throw Error('Elisium threshold bridge was not loaded');
bridge.start(sessionStorage);
const MAX_EVENTS=240, PLAYER_HEIGHT=1.69;
const items=new Map(),fixtures=new Map(),fantasyPieces=new Map();
const colliders=[],interactables=[],assetRooms=new Set(),labels=[];
let renderer,scene,camera,raycaster,modelRoot,clockLight;
let data=[],journal=[],currentRoom=START_ROOM,roomMinutes=0,selected=null;
let player={x:0,z:10,y:PLAYER_HEIGHT,yaw:0,pitch:0,level:0};
let animations=[],keys=new Set(),pointer={down:false,moved:0,x:0,y:0};
let lastTime=performance.now(),renderTime=0,autoplayStarted=false,stairFlight=false,lastUiRefresh=0;
const ACTIVE_COLOR='#f8c88a';
const WOOD=new THREE.MeshStandardMaterial({color:'#654b3f',roughness:.79}),
  MAHOGANY=new THREE.MeshStandardMaterial({color:'#402c2b',roughness:.62}),
  GOLD=new THREE.MeshStandardMaterial({color:'#b99761',metalness:.72,roughness:.38}),
  DARK=new THREE.MeshStandardMaterial({color:'#171c29',roughness:.84}),
  STONE=new THREE.MeshStandardMaterial({color:'#74717a',roughness:.9}),
  STAIN=new THREE.MeshStandardMaterial({color:'#7d4660',roughness:.46}),
  WHITE=new THREE.MeshStandardMaterial({color:'#e9d8ad',roughness:.75}),
  EMIT=new THREE.MeshBasicMaterial({color:'#ffd69b'}),
  LAMP=new THREE.MeshBasicMaterial({color:'#f4c37b',transparent:true,opacity:.91});
const paint=(hex,roughness=.75)=>new THREE.MeshStandardMaterial({color:hex,roughness});
const add=(p,geo,material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);p.add(o);return o};
const block=(p,w,h,d,m,x=0,y=0,z=0)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
const rod=(p,r0,r1,height,m,x=0,y=0,z=0)=>add(p,new THREE.CylinderGeometry(r0,r1,height,10),m,x,y,z);
const orb=(p,r,m,x=0,y=0,z=0)=>add(p,new THREE.SphereGeometry(r,14,10),m,x,y,z);
const torus=(p,r,t,m,x=0,y=0,z=0)=>add(p,new THREE.TorusGeometry(r,t,8,32),m,x,y,z);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const clean=(value)=>String(value||'').slice(0,350);
function isObjectId(id){return /^H(0[1-9]|1\d|2[0-4])$/.test(id)}
function report(message){notice.textContent=message}
function newTexture(kind='wood'){
 const c=document.createElement('canvas');c.width=256;c.height=256;
 const g=c.getContext('2d');
 const pattern=kind==='wood';
 g.fillStyle=pattern?'#594235':'#343c45';g.fillRect(0,0,256,256);
 for(let i=0;i<32;i++){
   const t=(i*61)%256;g.fillStyle=pattern?((i%3)?'#604738':'#49362d'):((i%2)?'#4c4a50':'#323541');
   if(pattern){g.fillRect(0,t,256,2);g.fillStyle='#9d7660';g.fillRect(0,t+2,256,1)}
   else {g.beginPath();g.ellipse((t*7)%256,t,8,17,.24,0,Math.PI*2);g.fill();}
 }
 const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.colorSpace=THREE.SRGBColorSpace;tex.repeat.set(pattern?4:2,pattern?6:2);
 return tex;
}
const parquet=new THREE.MeshStandardMaterial({map:newTexture('wood'),roughness:.78});
const wallpaper=new THREE.MeshStandardMaterial({map:newTexture('wall'),roughness:.93});
const HALL_CORRIDOR=new THREE.MeshStandardMaterial({color:'#39323a',roughness:.87});
const windowGlass=new THREE.MeshPhysicalMaterial({color:'#648e99',transparent:true,opacity:.59,metalness:.19,roughness:.24,side:THREE.DoubleSide});
const transparentGlass=(color)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:.69,side:THREE.DoubleSide});
function caption(label,w=2.4,h=.36) {
 const c=document.createElement('canvas');c.width=512;c.height=96;
 const g=c.getContext('2d');
 g.fillStyle='#211d26';g.fillRect(0,0,512,96);g.strokeStyle='#b99761';g.lineWidth=4;g.strokeRect(4,4,504,88);
 g.fillStyle='#f0d8ad';g.font='bold 35px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(label,256,48,490);
 const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide});
 return new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
}
function floorAndShell(room){
 const group=new THREE.Group();group.name='ROOM/'+room.name;group.position.set(room.x,room.y,room.z);
 modelRoot.add(group);
 const c=room.signature==='spectral'?'#60444d':room.signature==='supper'?'#4f4035':room.signature==='books'?'#423b37':'#4a4240';
 // Floorboards, inlaid brass compass rose, and a patterned entrance rug.
 block(group,9.95,.17,9.95,parquet,0,-.1,0);
 block(group,7.2,.025,5.3,paint('#42313b'),0,.008,0);
 block(group,7.0,.026,5.1,paint(c),0,.016,0);
 for(let i=0;i<5;i++){
    const outline=block(group,6.93-i*.20,.007,.025,GOLD,0,.033,(-2.44+i*.15));
    outline.rotation.y=0;
 }
 block(group,9.92,.19,9.92,paint('#3c3035'),0,4.10,0);
 // Vault shadows: beam frames, decorative crown, and ceiling coffers.
 for(const edge of [-4.63,4.63]){
   block(group,.21,.29,9.8,MAHOGANY,edge,3.94,0);
   block(group,9.8,.29,.21,MAHOGANY,0,3.94,edge);
 }
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){
   const m=block(group,2.35,.035,2.35,paint(i===0&&j===0?'#55443f':'#42353b'),i*2.9,4.0,j*2.9);
   const metal=block(group,2.12,.02,.06,GOLD,i*2.9,3.971,j*2.9);
 }
 const chand=new THREE.Group();group.add(chand);chand.position.set(0,3.35,0);
 rod(chand,.018,.018,.77,GOLD,0,.44,0);
 const hoop=torus(chand,.86,.035,GOLD,0,0,0);hoop.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){
   const theta=i*2*Math.PI/8;
   orb(chand,.085,EMIT,.85*Math.cos(theta),-.04,.85*Math.sin(theta));
   rod(chand,.035,.05,.19,GOLD,.85*Math.cos(theta),-.13,.85*Math.sin(theta));
 }
 // One shared physical plane of light and an actual ceiling ornament.
 for(const axis of ['west','north']){
   const isWest=axis==='west';
   const wallX=isWest?-5:0,wallZ=isWest?0:-5;
   const outside=isWest?room.col===0:room.row===0;
   buildWall(group,isWest,wallX,wallZ,outside,room);
 }
 if(room.col===2)buildWall(group,true,5,0,true,room);
 if(room.row===2)buildWall(group,false,0,5,true,room);
 const name=caption(room.name,2.55,.38);
 name.position.set(0,2.95,-4.78);
 group.add(name);labels.push(name);
 decorateRoom(room,group);
 return group;
}
function buildWall(group,onX,posX,posZ,isOutside,room){
 const w=onX?posX:posZ,sideWidth=10,doorWidth=2.75,wallH=3.96;
 const wallMat=wallpaper;
 function put(wid,hei,dep,mat,along,atY=.0,offAxis=0){
   if(onX)return block(group,dep,hei,wid,mat,w+offAxis,atY,along);
   return block(group,wid,hei,dep,mat,along,atY,w+offAxis);
 }
 if(!isOutside){
   const a=(sideWidth-doorWidth)/2;
   put(a,wallH,.19,wallMat,-(doorWidth+a)/2,wallH/2);
   put(a,wallH,.19,wallMat,(doorWidth+a)/2,wallH/2);
   put(doorWidth,wallH-2.65,.19,wallMat,0,2.65+(wallH-2.65)/2);
   put(.18,2.68,.33,MAHOGANY,-doorWidth/2,1.34);
   put(.18,2.68,.33,MAHOGANY,doorWidth/2,1.34);
   put(doorWidth+.25,.19,.33,MAHOGANY,0,2.73);
   put(doorWidth+.34,.055,.41,GOLD,0,2.84);
   // The step is traversable (no collider mesh).
   put(doorWidth,.03,.55,STONE,0,.05);
 } else {
   // Exterior wall includes a real stained or dark glass window.
   const opening=2.08;
   const side=(sideWidth-opening)/2;
   put(side,wallH,.2,wallMat,-(opening+side)/2,wallH/2);
   put(side,wallH,.2,wallMat,(opening+side)/2,wallH/2);
   put(opening,1.12,.2,wallMat,0,.56);
   put(opening,.47,.2,wallMat,0,3.73);
   put(opening,2.24,.055,windowGlass,0,2.16);
   put(.13,2.32,.3,GOLD,-opening/2,2.15);
   put(.13,2.32,.3,GOLD,opening/2,2.15);
   put(opening+.21,.15,.32,MAHOGANY,0,3.3);
   put(opening+.21,.16,.32,MAHOGANY,0,1.06);
   for(let k=1;k<3;k++)put(.045,2.24,.15,GOLD,-opening/2+k*opening/3,2.16,.15);
   put(opening,.043,.15,GOLD,0,2.16,.15);
   if(room.name==='Oratory') {
     // Stained glazing across the evening-blue window, visibly distinct
     // from a standard portal (this has no travel gesture).
     const panes=['#9e4662','#5795a4','#e9b856','#5a8e69','#8270a5','#aa755f'];
     for(let row=0;row<3;row++)for(let col=0;col<3;col++){
       put(.58,.66,.012,transparentGlass(panes[(row*3+col)%panes.length]),-.68+col*.69,1.43+row*.7,.19);
     }
   }
 }
 // Wainscoting and brass guardrail along the lower walls.
 if(isOutside){
   for(const left of [-4.3,-3.3,3.3,4.3]){
     put(.92,.85,.07,MAHOGANY,left,.49,.2);
     put(.7,.54,.08,paint('#795f50'),left,.51,.26);
   }
 }
 put(10,.18,.33,MAHOGANY,0,.12,.12);
 put(10,.08,.3,GOLD,0,3.82,.13);
}
function decorateRoom(room,group){
  const name=room.name;
  if(name==='Library'||name==='Study'){
    for(const side of [-3.6,3.6]){
      const shelf=block(group,1.65,2.7,.64,MAHOGANY,side,1.56,-3.68);
      for(let row=0;row<4;row++){
        block(group,1.55,.07,.75,WOOD,side,.55+row*.59,-3.68);
        for(let col=0;col<8;col++){
          const color=['#8a5343','#4f6473','#74634c','#4b6758','#714957'][(row+col)%5];
          block(group,.1+((col+row)%3)*.025,.38+col%3*.047,.27,paint(color),side-.66+col*.18,.81+row*.59,-3.56);
        }
      }
    }
  }
  if(name==='Common Room'){
    // Warming hearth, sculpted mantle and independent fire (not a portal).
    block(group,2.25,1.55,.72,STONE,0,.88,-4.24);
    block(group,1.55,.99,.73,DARK,0,.65,-3.88);
    block(group,2.8,.17,.91,WOOD,0,1.71,-4.17);
    for(let i=0;i<6;i++){
      const flame=orb(group,.13,EMIT,-.48+i*.18,.48,-3.43);
      flame.scale.set(.7,1.5+(i%3)*.3,.8);
      animations.push(t=>flame.position.y=.47+.11*Math.sin(t*2+i));
    }
  }
  if(name==='Dining Room'){
    block(group,4.0,.18,2.2,WOOD,0,.84,0);
    for(const x of [-1.7,1.7])for(const z of [-.75,.75]){
      block(group,.18,.78,.18,MAHOGANY,x,.41,z);
    }
    for(const z of [-1.47,1.47])for(const x of [-1.3,1.3]){
      block(group,.67,.14,.7,STAIN,x,.61,z);
      block(group,.68,.95,.17,WOOD,x,1.09,z+(z<0?-.32:.32));
    }
  }
  if(name==='Kitchen'){
    block(group,3,.88,.72,WOOD,0,.45,-3.74);
    for(const x of [-1.05,0,1.05]){
      block(group,.87,.56,.09,GOLD,x,.54,-3.32);
    }
    const pan=rod(group,.43,.43,.13,STONE,2.3,1.16,-3.57);
    pan.rotation.x=.1;
  }
  if(name==='Oratory'){
    const altar=block(group,1.9,.84,1.1,STONE,0,.46,-3.55);
    for(const x of [-.77,.77]){
      rod(group,.06,.08,.73,GOLD,x,1.19,-3.48);
      orb(group,.09,EMIT,x,1.61,-3.48);
    }
  }
  if(name==='Vestibule'){
    const rug=block(group,2.6,.031,3.2,STAIN,0,.039,2.05);
    for(const x of [-1.12,1.12])block(group,.035,.05,3.05,GOLD,x,.07,2.05);
    const door=block(group,2.2,2.8,.15,WOOD,0,1.51,4.81);
    block(group,.13,.18,.08,GOLD,.88,1.51,4.7);
    const plaque=caption('ELISIUM · THE KILNS',2.5,.33);
    plaque.position.set(0,3.31,4.65);plaque.rotation.y=Math.PI;group.add(plaque);
  }
  if(name==='Stair Landing'){
    // Curving timber staircase has individual physical treads. The visitor
    // uses E on the staircase to complete an ascension along these steps.
    const center=new THREE.Group();group.add(center);
    for(let i=0;i<21;i++){
      const a=i*.225,rad=2.1;
      const step=block(center,1.18,.14,1.04,WOOD,Math.cos(a)*rad,.1+i*(FLOOR_HEIGHT/21),Math.sin(a)*rad);
      step.rotation.y=-a;
      rod(center,.035,.035,.92,GOLD,Math.cos(a)*2.68,.67+i*FLOOR_HEIGHT/21,Math.sin(a)*2.68);
    }
    rod(center,.11,.14,5,MAHOGANY,0,2.5,0);
    const sign=caption('STAIRS · E TO ASCEND',2.65,.36);
    sign.position.set(0,2.8,-4.78);group.add(sign);
  }
  if(name==='Attic'){
    // Open rafters & repaired window; loft is above Stair Landing.
    for(let x of [-3.9,-2,0,2,3.9]){
      const beam=block(group,.21,.21,9.2,WOOD,x,3.61,0);
      beam.rotation.z=x%2===0?.035:-.035;
    }
    for(const z of [-3.6,3.6])block(group,7.7,.19,.2,MAHOGANY,0,3.35,z);
    block(group,1.8,1.3,.75,MAHOGANY,2.9,.74,-2.95);
  }
  if(name==='Picture Gallery'){
    for(let i=0;i<3;i++){
      const frame=block(group,.96,1.38,.07,GOLD,-2.2+i*2.2,2.1,-4.61);
      const art=block(group,.81,1.19,.075,paint(['#31475b','#66484a','#65714f'][i]),-2.2+i*2.2,2.1,-4.53);
      const portrait=orb(group,.2,WHITE,-2.2+i*2.2,2.21,-4.43);
      portrait.scale.y=1.55;
    }
  }
}
function buildAtticShell(){
  const r=BY_NAME.Attic;
  const group=new THREE.Group();group.position.set(r.x,r.y,r.z);modelRoot.add(group);
  block(group,9.7,.18,9.7,parquet,0,-.1,0);
  block(group,9.7,.18,9.7,WOOD,0,3.76,0);
  for(const x of [-4.83,4.83]){
    block(group,.18,3.73,9.73,wallpaper,x,1.86,0);
  }
  for(const z of [-4.83,4.83])block(group,9.7,3.73,.18,wallpaper,0,1.86,z);
  for(const x of [-3.3,0,3.3]){
    const rafter=block(group,.18,.19,9.4,WOOD,x,3.49,0);rafter.rotation.z=x/40;
  }
  for(const z of [-3.5,3.5])block(group,8.9,.23,.22,WOOD,0,3.22,z);
  const desc=caption('THE ATTIC · QUIET REPAIR',3.1,.4);desc.position.set(0,3.04,-4.61);group.add(desc);
  decorateRoom(r,group);
  return group;
}
function standAndArt(object,room,index){
  const pos=placeForObject(room,index);
  const plinth=new THREE.Group();
  plinth.position.set(pos.x,pos.y,pos.z);
  plinth.userData.objectId=object.id;
  scene.add(plinth);interactables.push(plinth);fixtures.set(object.id,plinth);
  block(plinth,2.34,.18,2.18,STONE,0,.13,0);
  block(plinth,2.25,.57,2.05,MAHOGANY,0,.49,0);
  block(plinth,2.37,.12,2.13,GOLD,0,.79,0);
  for(const x of [-1.06,1.06])for(const z of [-.98,.98])rod(plinth,.045,.045,.65,GOLD,x,.46,z);
  const artist=new THREE.Group();plinth.add(artist);
  const fantasy=createFantasy(THREE,object,plinth);
  fantasyPieces.set(object.id,fantasy);
  const front=caption(object.id+' · '+object.name,2.13,.28);
  front.position.set(0,.52,1.102);plinth.add(front);
  const rune=torus(plinth,.22,.018,EMIT,0,2.73,0);rune.rotation.x=Math.PI/2;
  animations.push(t=>{rune.rotation.z=t*.36;rune.position.y=2.68+.12*Math.sin(t+index)});
  const tracking={object,room:room.name,artist,status:'waiting'};
  items.set(object.id,tracking);
  return tracking;
}
function ensureRoomSources(name){
 if(assetRooms.has(name))return;
 assetRooms.add(name);
 const targets=[...items.values()].filter(x=>x.room===name);
 // Materialize all source objects physically within the requested room,
 // not in a separate item inspector. Limit simultaneous network work.
 let sequence=Promise.resolve();
 for(const record of targets){
   sequence=sequence.then(async()=>{
     record.status='loading';
     await mountHistoricalDonor(record.object,record.artist,(state,detail)=>{
       record.status=state;
       record.details=detail;
       if(selected===record.object.id)showObject(record.object.id,false);
       report('Kilns source art: '+record.object.id+' · '+state);
     });
   });
 }
 return sequence;
}
function buildWorld(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#101625');
 scene.fog=new THREE.FogExp2('#151922',.013);
 modelRoot=new THREE.Group();scene.add(modelRoot);
 scene.add(new THREE.HemisphereLight('#b8cade','#6b4539',2.2));
 const moon=new THREE.DirectionalLight('#c1caec',.72);moon.position.set(-8,15,-17);scene.add(moon);
 clockLight=new THREE.PointLight('#ffc98b',11,16,1.5);scene.add(clockLight);
 for(const r of ROOM_ORDER.filter(r=>!r.level))floorAndShell(r);
 buildAtticShell();
 // Curated roles are the ONLY link between historic source and story.
 for(const r of ROOM_ORDER){
   const inRoom=data.filter(o=>o.room===r.name);
   inRoom.forEach((o,i)=>standAndArt(o,r,i));
 }
 raycaster=new THREE.Raycaster();
 camera=new THREE.PerspectiveCamera(69,2,.07,160);
 camera.rotation.order='YXZ';
 const c=canvas.getContext('webgl2')||canvas.getContext('webgl');
 if(!c)throw Error('WebGL is unavailable');
 renderer=new THREE.WebGLRenderer({canvas,context:c,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.22;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 const resize=()=>{
   const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
   renderer.setSize(width,height,false);
   camera.aspect=width/height;camera.updateProjectionMatrix();
 };
 new ResizeObserver(resize).observe(canvas);resize();
}
function positionCamera(){
 camera.position.set(player.x,player.y,player.z);
 camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
 clockLight.position.set(player.x,player.y+.65,player.z);
}
function roomChange(next,teleported=false){
 if(next===currentRoom)return;
 const before=currentRoom;
 currentRoom=next;
 roomMinutes=Math.min(2880,roomMinutes+3);
 bridge.advance(sessionStorage,3);
 report((teleported?'Surveyed':'Entered')+' '+next+' from '+before+'. House clock +3 minutes.');
 refreshUI();
 ensureRoomSources(next);
}
function movePlayer(dx,dz) {
 const from={x:player.x,z:player.z};
 const next={x:player.x+dx,z:player.z+dz};
 if(canStep(from,next,player.level)){
   player.x=next.x;player.z=next.z;
   const current=roomForPosition(player.x,player.z,player.level).name;
   if(current!==currentRoom)roomChange(current);
 } else {
   const nx={x:player.x+dx,z:player.z};
   const nz={x:player.x,z:player.z+dz};
   if(canStep(from,nx,player.level))player.x=nx.x;
   if(canStep(from,nz,player.level))player.z=nz.z;
   const name=roomForPosition(player.x,player.z,player.level).name;
   if(name!==currentRoom)roomChange(name);
 }
}
function navigateRoom(name) {
 const dest=BY_NAME[name];if(!dest)return;
 player.level=dest.level;
 player.x=dest.x;player.z=dest.z+1.5;player.y=dest.y+PLAYER_HEIGHT;
 player.yaw=0;player.pitch=-.08;
 roomChange(name,true);refreshUI();
}
function ascendOrDescend(){
 if(currentRoom!=='Stair Landing'&&currentRoom!=='Attic')return;
 if(stairFlight)return;
 const dest=currentRoom==='Stair Landing'?BY_NAME.Attic:BY_NAME['Stair Landing'];
 stairFlight=true;
 const origin={...player},target={
   x:dest.x,z:dest.z+1.5,y:dest.y+PLAYER_HEIGHT,level:dest.level
 };
 const begin=performance.now(),duration=1100;
 const f=t=>{
   const p=clamp((t-begin)/duration,0,1),smooth=p*p*(3-2*p);
   player.x=origin.x+(target.x-origin.x)*smooth;
   player.z=origin.z+(target.z-origin.z)*smooth;
   player.y=origin.y+(target.y-origin.y)*smooth;
   player.yaw=origin.yaw+Math.PI*smooth*.65;
   if(p>=1){
     player.level=dest.level;stairFlight=false;
     roomChange(dest.name);refreshUI();return;
   }
   requestAnimationFrame(f);
 };
 requestAnimationFrame(f);
}
function proximityObject(){
 let nearest=null,minDist=2.55;
 for(const entry of items.values()){
   if(entry.room!==currentRoom)continue;
   const root=fixtures.get(entry.object.id);
   const d=Math.hypot(player.x-root.position.x,player.z-root.position.z);
   if(d<minDist){minDist=d;nearest=entry.object}
 }
 return nearest;
}
function showObject(id,open=true){
 const item=items.get(id);if(!item)return;
 selected=id;
 const o=item.object;
 activeObject.textContent=id+' · '+o.name;
 $('object-action').textContent=o.action;
 $('object-reading').textContent=o.inquiry;
 $('object-provenance').textContent='Physical donor: '+(item.status==='original'?'CC0 Poly Haven artist model':item.status==='proxy'?'original Webspace GLB proxy':item.status==='loading'?'loading live original geometry':'authored fantasy sculpture')+' · Fit: '+o.fit;
 $('source-link').href=o.polyhaven_url;
 $('object-panel').hidden=false;
 if(open)report('Interpreting '+id+'. '+o.name);
}
function recordObject(id) {
 const entry=items.get(id);if(!entry)return;
 const o=entry.object,root=fixtures.get(id);
 if(!root)return;
 if(entry.room!==currentRoom){report('That object belongs to '+entry.room+'.');return}
 const distance=Math.hypot(player.x-root.position.x,player.z-root.position.z);
 if(distance>3.4){report('Move closer to '+id+' or use the room index.');return}
 const pulse=fantasyPieces.get(id);
 const nth=pulse?.activate()||1;
 roomMinutes=Math.min(2880,roomMinutes+6);
 bridge.observe(sessionStorage,o.id);
 const rec={id:o.id,name:o.name,room:o.room,event:'kilns.object.observed',minute:roomMinutes,sequence:journal.length+1};
 journal.push(rec);journal=journal.slice(-MAX_EVENTS);
 try{sessionStorage.setItem(journalKey,JSON.stringify(journal))}catch{}
 // Parent receives no credentials or personal comments; this is a bounded
 // public object ID from the established child event protocol.
 if(window.parent!==window){
   const msg={protocol:'webspace/threshold/1',type:'webspace:child-event',
     from:'elisium/kilns',event:'kilns.object.observed',object_id:rec.id,
     sequence:rec.sequence};
   window.parent.postMessage(msg,location.origin==='null'?'*':location.origin);
 }
 report(o.id+' · '+o.action+' — the world has moved ('+nth+').');
 showObject(id,false);refreshUI();
}
function readLocal(){
 roomMinutes=bridge.read(sessionStorage)?.elapsed_minutes??0;
 try{
  const saved=JSON.parse(sessionStorage.getItem(journalKey)||sessionStorage.getItem('webspace.kilns.v5.session')||'[]');
  if(Array.isArray(saved))journal=saved.filter(x=>x&&isObjectId(x.id)&&Number.isInteger(x.sequence)).slice(-MAX_EVENTS);
 }catch{journal=[]}
}
function refreshUI(){
 roomTitle.textContent=currentRoom;
 hint.textContent='Connected rooms: '+reachableRooms(currentRoom).join(' · ');
 count.textContent=new Set(journal.map(x=>x.id)).size+' / 24';
 clock.textContent=String(Math.floor(roomMinutes/60)).padStart(2,'0')+':'+String(roomMinutes%60).padStart(2,'0');
 const r=BY_NAME[currentRoom];
 for(const btn of roomButtons.querySelectorAll('button'))btn.setAttribute('aria-current',String(btn.dataset.room===currentRoom));
 $('stair-button').hidden=!(currentRoom==='Stair Landing'||currentRoom==='Attic');
 $('stair-button').textContent=currentRoom==='Attic'?'Descend staircase':'Climb staircase';
 const nearby=proximityObject();
 proximity.textContent=nearby?'E · Examine '+nearby.id+' — '+nearby.name:
   (currentRoom==='Stair Landing'||currentRoom==='Attic'?'E · Use staircase':'WASD / arrows to move · drag to look · click to inspect');
 $('marginalia').replaceChildren(...journal.slice(-8).reverse().map(j=>{
   const item=document.createElement('div');item.className='journal-entry';
   item.textContent=j.id+' · '+j.name+' · '+j.minute+' min';return item;
 }));
}
function roomList(){
 roomButtons.replaceChildren(...ROOM_ORDER.map(r=>{
   const button=document.createElement('button');
   button.className='room-button';button.type='button';button.dataset.room=r.name;
   button.textContent=(r.level?'↟ ':'◈ ')+r.name+' · '+data.filter(o=>o.room===r.name).length;
   button.addEventListener('click',()=>navigateRoom(r.name));
   return button;
 }));
}
function doPointerSelection(e){
 const bounds=canvas.getBoundingClientRect();
 const point=new THREE.Vector2(((e.clientX-bounds.left)/bounds.width)*2-1,-((e.clientY-bounds.top)/bounds.height)*2+1);
 raycaster.setFromCamera(point,camera);
 const hits=raycaster.intersectObjects(interactables,true);
 for(const hit of hits){
   let obj=hit.object;
   while(obj&&!obj.userData.objectId)obj=obj.parent;
   if(obj&&isObjectId(obj.userData.objectId)){
     const id=obj.userData.objectId;
     showObject(id);
     const d=Math.hypot(player.x-obj.position.x,player.z-obj.position.z);
     if(d<=3.4)recordObject(id);
     else report(id+' is in reach of sight, but not of hand. Move closer.');
     return;
   }
 }
}
function bindControls(){
 canvas.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;
   pointer={down:true,x:e.clientX,y:e.clientY,moved:0};
   canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
   if(!pointer.down||stairFlight)return;
   const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
   pointer.moved+=Math.abs(dx)+Math.abs(dy);
   pointer.x=e.clientX;pointer.y=e.clientY;
   if(pointer.moved>3){
     player.yaw-=dx*.004;
     player.pitch=clamp(player.pitch-dy*.004,-1.22,1.22);
   }
 });
 canvas.addEventListener('pointerup',e=>{
   if(pointer.down&&pointer.moved<5)doPointerSelection(e);
   pointer.down=false;
 });
 canvas.addEventListener('pointercancel',()=>pointer.down=false);
 document.addEventListener('keydown',e=>{
   const k=e.key.toLowerCase();
   if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e','q','shift'].includes(k)){
     if(!e.target.closest('input,textarea'))e.preventDefault();
     keys.add(k);
   }
   if(k==='e'&&!e.repeat){
     const nearby=proximityObject();
     if(nearby)recordObject(nearby.id);
     else ascendOrDescend();
   }
   if(k==='escape')$('object-panel').hidden=true;
 });
 document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 window.addEventListener('blur',()=>keys.clear());
 for(const b of document.querySelectorAll('[data-nav]')){
   const k=b.dataset.nav;
   b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId)});
   for(const type of ['pointerup','pointercancel','pointerleave'])b.addEventListener(type,()=>keys.delete(k));
 }
 $('stair-button').addEventListener('click',ascendOrDescend);
 $('observe-button').addEventListener('click',()=>selected&&recordObject(selected));
 $('object-close').addEventListener('click',()=>$('object-panel').hidden=true);
 $('export-button').addEventListener('click',()=>{
   const data=JSON.stringify({schema:'webspace/kilns-journal/1',events:journal},null,2);
   const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='kilns-3d-local-journal.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 $('clear-button').addEventListener('click',()=>{journal=[];try{sessionStorage.removeItem(journalKey)}catch{}bridge.clear(sessionStorage);roomMinutes=0;refreshUI();report('This house session has been cleared.');});
 const overview=$('overview-button');
 if(overview)overview.addEventListener('click',()=>{
   const hidden=$('room-index').hidden;
   $('room-index').hidden=!hidden;
   overview.setAttribute('aria-expanded',String(hidden));
 });
}
function update(t,dt) {
 if(!stairFlight){
  const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
  const strafe=(keys.has('d')?1:0)-(keys.has('a')?1:0);
  player.yaw+=((keys.has('arrowleft')||keys.has('q')?1:0)-(keys.has('arrowright')?1:0))*dt*1.7;
  const speed=(keys.has('shift')?5.0:2.8)*dt;
  const magnitude=Math.max(1,Math.hypot(forward,strafe));
  const dx=(forward*-Math.sin(player.yaw)+strafe*Math.cos(player.yaw))*speed/magnitude;
  const dz=(forward*-Math.cos(player.yaw)-strafe*Math.sin(player.yaw))*speed/magnitude;
  if(dx||dz)movePlayer(dx,dz);
 }
 positionCamera();
 const sec=t*.001;
 for(const fn of animations)fn(sec);
 for(const f of fantasyPieces.values())f.animate(sec);
 if(!stairFlight && t-lastUiRefresh>240){lastUiRefresh=t;refreshUI();}
 renderer.render(scene,camera);
}
function loop(now){
 const dt=Math.min(.07,Math.max(0,(now-lastTime)/1000));lastTime=now;
 update(now,dt);requestAnimationFrame(loop);
}
async function start(){
 readLocal();
 report('Building the house geometry…');
 const response=await fetch('../../../assets/kilns/OBJECTS.json');
 if(!response.ok)throw Error('Cannot find the H01–H24 source list');
 const parsed=await response.json();
 data=parsed.objects.filter(o=>isObjectId(o.id));
 if(data.length!==24||new Set(data.map(x=>x.id)).size!==24)throw Error('The 24 stable Kilns object IDs are incomplete');
 buildWorld();
 roomList();bindControls();
 watchAssetState(s=>sourceState.textContent=s.loaded+' original sources · '+s.pending+' loading · '+s.failed+' unavailable');
 refreshUI();positionCamera();
 ensureRoomSources(currentRoom);
 report('The doors are open. Follow the passage or choose a room.');
 window.__KILNS_TEST__={room:()=>currentRoom,objectCount:()=>items.size,sourceCount:()=>[...items.values()].filter(x=>x.status==='original').length,
    testVisit:n=>navigateRoom(n),testObserve:n=>{const found=items.get(n);if(!found)return; navigateRoom(found.room);const root=fixtures.get(n);player.x=root.position.x;player.z=root.position.z+1.27;player.y=BY_NAME[found.room].y+PLAYER_HEIGHT;recordObject(n)},
    physicalRoomCount:()=>ROOM_ORDER.length,graph:n=>reachableRooms(n),place:id=>fixtures.get(id)?.position.toArray(),sourceStatus:id=>items.get(id)?.status,
    geometryCount:()=>{let c=0;scene.traverse(o=>{if(o.isMesh)c++});return c}, getPlayer:()=>({...player})};
 requestAnimationFrame(loop);
}
start().catch(error=>{
 console.error('Kilns 3D initialization failed:',error);
 $('fatal').hidden=false;
 $('fatal').textContent='The 3D renderer could not start: '+clean(error.message)+'. The illustrated Kilns remains available below.';
 report('3D renderer unavailable. Choose the preserved illustrated house.');
});
