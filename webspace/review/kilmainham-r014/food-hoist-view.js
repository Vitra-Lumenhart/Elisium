import * as THREE from 'three';
import {HOIST} from './food-hoist.mjs';
// Original reusable geometry based on the museum's two-pole, overhead-pulley
// food lift. Dimensions and carrier/rope details are interpretive game art.
export function mountFoodHoist(parent,materials={}){
 const iron=materials.iron||new THREE.MeshStandardMaterial({color:0x596671,roughness:.87,metalness:.28});
 const dark=materials.dark||new THREE.MeshStandardMaterial({color:0x333b3e,roughness:.95,metalness:.15});
 const timber=materials.wood||new THREE.MeshStandardMaterial({color:0x6e5034,roughness:.94});
 const ropeMat=new THREE.MeshStandardMaterial({color:0x76684e,roughness:1});
 const potMat=new THREE.MeshStandardMaterial({color:0x46413b,roughness:.91});
 const lidMat=materials.dark||dark,root=new THREE.Group();root.name=HOIST.id+' / exposed food hoist';parent.add(root);
 root.position.set(...HOIST.position);
 const staticGroup=new THREE.Group();staticGroup.name='two poles and decorative support';root.add(staticGroup);
 const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const box=(p,x,y,z,w,h,d,m=iron)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(p,a,b,r,m=iron)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=add(p,new THREE.CylinderGeometry(r,r,d.length(),10),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;};
 const half=HOIST.poleSpacing/2,H=HOIST.headY;
 for(const x of [-half,half]){
  rod(staticGroup,[x,-3.3,0],[x,H+.1,0],HOIST.poleRadius);
  for(const y of [0,6.3,12.6,H]){add(staticGroup,new THREE.CylinderGeometry(.068,.068,.12,12),dark,x,y,0);}
 }
 // KIL-IRON-003A. Main Hall photographic silhouette: a large, open
 // spoked sheave at the projecting end of a narrow iron lattice head.
 // Lamp shades in the reference are separate fittings, not a solid drum.
 const head=new THREE.Group();head.name='KIL-IRON-003A / openwork crosshead';root.add(head);
 const R=HOIST.pulleyRadius, wx=-R, wallX=2.66;
 const wheel=new THREE.Group();wheel.name='KIL-IRON-003A / rotating sheave';wheel.position.set(wx,H,0);root.add(wheel);
 // Twin cheeks with an open rope groove and four cast spokes.
 for(const z of [-.047,.047])add(wheel,new THREE.TorusGeometry(R,.029,10,48),iron,0,0,z);
 add(wheel,new THREE.TorusGeometry(R-.038,.032,10,48),dark);
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2;rod(wheel,[Math.cos(a)*.075,Math.sin(a)*.075,0],[Math.cos(a)*(R-.035),Math.sin(a)*(R-.035),0],.027,iron);
 }
 const axial=(p,x,y,z,r,len,m=iron)=>{const o=add(p,new THREE.CylinderGeometry(r,r,len,16),m,x,y,z);o.rotation.x=Math.PI/2;return o;};
 axial(wheel,0,0,0,.085,.19,dark);
 // The axle and collars stay fixed while the sheave rotates.
 axial(head,wx,H,0,.045,.54,dark);
 for(const z of [-.21,.21]){
  axial(head,wx,H,z,.10,.075,iron);
  // In Colin's Main Hall image the sheave projects left of the two poles.
  // TWO independent pierced side arms (near and far), each with a rounded nose,
  // rather than an X-braced truss or enclosed gearbox.
  const web=new THREE.Shape();
  web.moveTo(wx-.13,H-.28);web.quadraticCurveTo(wx-.20,H-.48,wx+.18,H-.48);
  web.lineTo(wallX,H-.48);web.lineTo(wallX,H-.24);web.lineTo(wx+.16,H-.24);web.closePath();
  for(let x=wx+.28;x<wallX-.15;x+=.23){const hole=new THREE.Path();hole.absellipse(x,H-.36,.071,.066,0,2*Math.PI,true);web.holes.push(hole);}
  const arm=add(head,new THREE.ExtrudeGeometry(web,{depth:.045,bevelEnabled:false,curveSegments:10}),iron,0,0,z-.0225);arm.name=z<0?'KIL-IRON-003A / far pierced side arm':'KIL-IRON-003A / near pierced side arm';
  box(head,(wx+wallX)/2,H+.16,z,wallX-wx,.065,.065);
  for(const x of [wx,1.03,2.11,wallX])box(head,x,H-.035,z,.054,.38,.06);
  const curve=new THREE.CatmullRomCurve3([[wx+.10,H+.13,z],[wx+.33,H+.31,z],[wx+.64,H+.21,z],[wx+.84,H+.15,z]].map(p=>new THREE.Vector3(...p)));
  add(head,new THREE.TubeGeometry(curve,22,.028,8,false),iron);
  box(head,wallX,H-.12,z,.10,.76,.18);
  for(const y of [H+.18,H-.39]){const bolt=add(head,new THREE.CylinderGeometry(.041,.041,.055,6),dark,wallX-.065,y,z);bolt.rotation.z=Math.PI/2;}
 }
 for(const x of [wx,1.03,1.57,2.11,wallX]){
  rod(head,[x,H+.16,-.21],[x,H+.16,.21],.025);
  rod(head,[x,H-.36,-.21],[x,H-.36,.21],.025);
 }
 // Crosshead ties the exposed guide poles to the frame.
 box(head,0,H-.35,0,HOIST.poleSpacing+.13,.10,.13);
 rod(head,[half,H-.36,0],[1.57,H-.36,0],.039);
 // Rope is visibly wrapped over the sheave; both legs leave tangentially.
 const ropeArc=new THREE.CatmullRomCurve3(Array.from({length:25},(_,i)=>{const a=Math.PI-i*Math.PI/24;return new THREE.Vector3(wx+R*Math.cos(a),H+R*Math.sin(a),0);}));
 add(head,new THREE.TubeGeometry(ropeArc,32,.014,7,false),ropeMat);
 // Small open carrier, no passenger cage; carrier form is a reconstruction.
 const tray=new THREE.Group();tray.name='food carrier pivot';root.add(tray);
 box(tray,0,.055,0,HOIST.trayWidth,.10,HOIST.trayDepth,timber);
 for(const x of [-.37,.37]){box(tray,x,.17,0,.035,.19,.65);rod(tray,[x,.10,0],[0,.82,0],.017);}
 for(const z of [-.31,.31])box(tray,0,.14,z,.76,.15,.035);
 const loads=[];for(let i=0;i<3;i++){
  const g=new THREE.Group();g.position.set((i-1)*.23,.12,0);tray.add(g);loads.push(g);
  add(g,new THREE.CylinderGeometry(.095,.075,.15,12),potMat,0,.075,0);
  add(g,new THREE.CylinderGeometry(.10,.10,.025,12),dark,0,.16,0);
  add(g,new THREE.SphereGeometry(.022,8,6),iron,0,.187,0);
 }
 const cable=add(root,new THREE.CylinderGeometry(.013,.013,1,8),ropeMat);
 const tail=rod(root,[-2*R,H,0],[.78,.9,.50],.013,ropeMat);
 const hatch=new THREE.Group();hatch.name='kitchen trapdoor pivot';hatch.position.set(0,.012,-.56);root.add(hatch);
 box(hatch,0,0,.56,1.46,.075,1.12,lidMat);
 for(const x of [-.47,.47])box(hatch,x,.044,.56,.07,.012,1.05,iron);
 for(const x of [-.76,.76])box(staticGroup,x,.01,0,.07,.08,1.22,dark);
 for(const z of [-.60,.60])box(staticGroup,0,.01,z,1.54,.08,.07,dark);
 const end=new THREE.Vector3(),start=new THREE.Vector3(0,H,0),axis=new THREE.Vector3(0,1,0);
 function update(state,dt=0){
  tray.position.y=state.y;
  // Effective animation ratio for visual continuity, not a mechanical specification.
  wheel.rotation.z=(state.y-HOIST.stops[0])/HOIST.pulleyRadius;
  end.set(0,state.y+.82,0);const d=end.clone().sub(start);cable.position.copy(start).add(end).multiplyScalar(.5);cable.scale.y=d.length();cable.quaternion.setFromUnitVectors(axis,d.normalize());
  loads.forEach((g,i)=>g.visible=i<state.cargo.length);
  const open=state.phase!=='idle'||state.y>-.2;
  hatch.rotation.x=THREE.MathUtils.lerp(hatch.rotation.x,open?-Math.PI*.54:0,dt?1-Math.exp(-5*dt):1);
 }
 return {root,staticGroup,wheel,tray,hatch,update,parts:{head,wheel,tray,hatch,tail}};
}
