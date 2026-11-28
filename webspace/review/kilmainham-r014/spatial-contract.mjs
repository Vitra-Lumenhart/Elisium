// Proposed R012 geometry contract, intentionally independent of Three.js and Choir.
// Feet in right-handed metres (+Y up); +X is right when facing the apse (-Z).
// This module describes intended support, not existing rendered collision meshes.
export const HUMAN=Object.freeze({eye:1.70,height:1.82,radius:.32,stepLength:.75,stepUp:.20,margin:.12});
export const HALL=Object.freeze({half:8.8,inner:7.25,deckWidth:1.55,apseZ:-19,endZ:24,pitch:6.30,tiers:3,doorHeight:3.05,bayCount:15,arcCount:10,endCount:6});
export const STAIR=Object.freeze({run:9.1,rise:6.3,risers:35,width:1.35,cageWidth:1.46,spring:2.25,radius:.73,barWidth:.05,segments:12,startsAt:12,landingZ:-9.925});
export const DISTRICTS=Object.freeze([
 {id:'east',name:'East Wing',status:'existing-r010',epoch:1879},
 {id:'west',name:'West Wing',status:'planned-playable',epoch:1715},
 {id:'archive',name:'Archive',status:'planned-threshold',epoch:1582},
 {id:'cloister',name:'Cloister',status:'planned-playable',epoch:1120},
 {id:'undercroft',name:'Undercroft',status:'planned-threshold',epoch:1348}
]);
export const EPOCHS=Object.freeze([{year:1120,title:'The Well'},{year:1348,title:'The Infirmary'},{year:1582,title:'The College'},{year:1715,title:'The Crown'},{year:1879,title:'The Ninth Bell'}]);
export const OPEN_CELL='east:t1:right:06';
const bayZ=i=>HALL.apseZ+(i+.5)*(HALL.endZ-HALL.apseZ)/HALL.bayCount;
export function addresses(){
 const a=[];for(let tier=0;tier<HALL.tiers;tier++){
  for(const side of ['left','right'])for(let i=0;i<HALL.bayCount;i++)a.push({id:`east:t${tier}:${side}:${String(i).padStart(2,'0')}`,tier,wall:side,x:(side==='left'?-1:1)*HALL.half,y:tier*HALL.pitch,z:bayZ(i),leaf:'flat',state:'closed'});
  for(let i=0;i<HALL.arcCount;i++){const t=(i+.5)*Math.PI/HALL.arcCount;a.push({id:`east:t${tier}:apse:${String(i).padStart(2,'0')}`,tier,wall:'apse',x:HALL.half*Math.cos(t),y:tier*HALL.pitch,z:HALL.apseZ-HALL.half*Math.sin(t),leaf:'flat',state:'closed'});}
  for(let i=0;i<HALL.endCount;i++)a.push({id:`east:t${tier}:end:${String(i).padStart(2,'0')}`,tier,wall:'end',x:-HALL.half+(i+.5)*2*HALL.half/HALL.endCount,y:tier*HALL.pitch,z:HALL.endZ,leaf:'flat',state:'closed'});
 }
 return a.map(d=>d.id===OPEN_CELL?{...d,state:'open',destination:{kind:'local-room',id:'east:cell-06'}}:d);
}
export const DOOR_Z=bayZ(6);
export const NODES=Object.freeze({
 gate:[0,0,18],hall:[0,0,11],chapel:[0,0,3],hearing:[0,0,-24],
 stairBase:[0,0,0],landing:[0,6.3,STAIR.landingZ],
 rightBridge:[HALL.inner+HALL.deckWidth/2,6.3,STAIR.landingZ],
 rightGallery:[HALL.inner+HALL.deckWidth/2,6.3,DOOR_Z],
 threshold:[HALL.half,6.3,DOOR_Z],cell:[HALL.half+2.1,6.3,DOOR_Z]
});
const edge=(a,b,points,kind,support)=>({id:a+'--'+b,a,b,points,kind,support});
export function routes(){
 return [
 edge('gate','hall',[NODES.gate,NODES.hall],'walk','ground'),
 edge('hall','chapel',[NODES.hall,NODES.chapel],'walk','ground'),
 edge('chapel','hearing',[NODES.chapel,[-2.5,0,1],[-2.5,0,-22.8],NODES.hearing],'walk','ground'),
 edge('chapel','stairBase',[NODES.chapel,NODES.stairBase],'walk','ground'),
 edge('stairBase','landing',[NODES.stairBase,[0,STAIR.rise,-STAIR.run],NODES.landing],'stairs','first-flight'),
 edge('landing','rightBridge',[NODES.landing,NODES.rightBridge],'walk','bridge'),
 edge('rightBridge','rightGallery',[NODES.rightBridge,NODES.rightGallery],'walk','right-gallery'),
 edge('rightGallery','threshold',[NODES.rightGallery,NODES.threshold],'walk','cell-threshold'),
 edge('threshold','cell',[NODES.threshold,NODES.cell],'walk','cell-interior')
 ];
}
export const PLANNED_ASSETS=Object.freeze({
 stairCanopy:{id:'KIL-IRON-001',clearWidth:STAIR.cageWidth-STAIR.barWidth,headroomAtCenter:stairHeadroom(0)},
 galleryScreen:{id:'KIL-IRON-002',tier:1,lowerY:HALL.pitch,upperY:2*HALL.pitch-.21,gateAt:'rightBridge',status:'requires bridge opening and actual support'},
 dumbwaiter:{id:'KIL-IRON-003',side:'right',center:[6.1,0,-4.8],footprint:[1.52,1.20],landings:[-3.15,0,6.3,12.6],form:'two exposed poles and overhead pulley',status:'mounted visual prototype; service only; no passenger traversal'},
 doorLeaf:{id:'KIL-DOOR-001',shape:'flat',pivot:'hinge',sharedAcrossAllBays:true},
 openBay:{id:'KIL-DOOR-002',address:OPEN_CELL,clearWidth:1.24,clearHeight:2.8},
 cell:{id:'KIL-ROOM-001',floorY:6.3,depth:3.4,clearWidth:2.55}
});
export function routeLength(points){return points.slice(1).reduce((s,p,i)=>s+Math.hypot(...p.map((x,j)=>x-points[i][j])),0);}
export function sampleRoute(points,spacing=.15){let result=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],d=Math.hypot(...b.map((x,j)=>x-a[j])),n=Math.max(1,Math.ceil(d/spacing));for(let j=1;j<=n;j++)result.push(a.map((x,k)=>x+(b[k]-x)*j/n));}return result;}
export function routeById(id,reverse=false){const r=routes().find(r=>r.id===id);if(!r)return null;return reverse?{...r,a:r.b,b:r.a,points:r.points.slice().reverse()}:r;}
export function reachable(from,to){const seen=new Set([from]),q=[from];while(q.length){const p=q.shift();if(p===to)return true;for(const r of routes()){const other=r.a===p?r.b:r.b===p?r.a:null;if(other&&!seen.has(other)){seen.add(other);q.push(other);}}}return false;}
// Clearance at the widest point of an upright capsule, not just crown height.
// Sample the actual polygonal hoop (not an ideal semicircle). Subtract
// one riser for the worst tread-to-slope difference and bar diagonal.
export function stairHeadroom(lateral=HUMAN.radius){
 const x=Math.abs(lateral),w=STAIR.cageWidth/2;if(x>=w-STAIR.barWidth/2)return 0;
 const q=x+STAIR.barWidth/2;
 for(let i=0;i<STAIR.segments/2;i++){
  const a=i*Math.PI/STAIR.segments,b=(i+1)*Math.PI/STAIR.segments;
  const xa=w*Math.cos(a),xb=w*Math.cos(b);
  if(q<=xa+1e-9&&q>=xb-1e-9){
   const f=(xa-q)/(xa-xb),h=STAIR.spring+STAIR.radius*((1-f)*Math.sin(a)+f*Math.sin(b));
   return h-STAIR.rise/STAIR.risers-STAIR.barWidth/Math.sqrt(2);
  }
 }return STAIR.spring+STAIR.radius-STAIR.rise/STAIR.risers-STAIR.barWidth/Math.sqrt(2);
}
export const PUBLIC_ARRIVAL='kilmainham-intake';
export function publicArrival(tag){return tag===PUBLIC_ARRIVAL?{version:1,entry:PUBLIC_ARRIVAL,node:'gate'}:null;}
// No local room crossing is a federation portal, and closed addresses cannot route.
export function destinationFor(address){const d=addresses().find(x=>x.id===address);return d?.state==='open'?d.destination:null;}
