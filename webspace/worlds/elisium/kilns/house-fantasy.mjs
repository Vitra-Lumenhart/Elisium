/**
 * The 24 authored Kilns interpretations.
 *
 * Poly Haven supplies real historical component donors. These original
 * procedural attachments (brass, glass, paper, astronomical instruments,
 * letters, repaired wood, light) author the fantasy significance WITHOUT
 * altering an upstream CC0 artist mesh or confusing it with completed lore.
 *
 * All geometry is real world-space Three.js geometry, not an iframe/screen.
 * Activations animate a physical change and return the existing H inquiry.
 */
export function createFantasy(THREE, object, root) {
  const G=new THREE.Group();root.add(G);
  const gold=material('#caa46f',0.65,0.43), bronze=material('#92734e',0.45,0.6),
    ink=material('#251a1e',0.45), ivory=material('#f2e2bb',0.87),
    wine=material('#8a3447',0.6), leaf=material('#46695c',0.6),
    blue=material('#548ca8',0.4), glass=new THREE.MeshPhysicalMaterial({
      color:'#81bdc6',metalness:0.12,roughness:0.08,transmission:0.55,thickness:0.18,
      transparent:true,opacity:0.78,side:THREE.DoubleSide
    }),
    glow=new THREE.MeshBasicMaterial({color:'#f4c789',transparent:true,opacity:0.67,side:THREE.DoubleSide}),
    bright=new THREE.MeshBasicMaterial({color:'#b4e6ee',transparent:true,opacity:0.75,side:THREE.DoubleSide});
  function material(color,roughness=0.5,metalness=0.05){
    return new THREE.MeshStandardMaterial({color,roughness,metalness,side:THREE.DoubleSide});
  }
  const all=[];
  function make(geometry,material,parent=G,x=0,y=0,z=0){
    const m=new THREE.Mesh(geometry,material);
    m.position.set(x,y,z);parent.add(m);m.castShadow=false;m.receiveShadow=false;all.push(m);return m;
  }
  function box(w,h,d,mat,x=0,y=0,z=0,parent=G){return make(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z)}
  function ball(rad,mat,x=0,y=0,z=0,parent=G){return make(new THREE.SphereGeometry(rad,16,10),mat,parent,x,y,z)}
  function cyl(a,b,h,mat,x=0,y=0,z=0,parent=G){return make(new THREE.CylinderGeometry(a,b,h,12),mat,parent,x,y,z)}
  function ring(rad,tube,mat,x=0,y=0,z=0,parent=G){
    return make(new THREE.TorusGeometry(rad,tube,8,48),mat,parent,x,y,z);
  }
  function textLabel(label,scale=1, color='#efe1b6') {
    const c=document.createElement('canvas');c.width=512;c.height=128;
    const ctx=c.getContext('2d');ctx.fillStyle='#211e20';ctx.fillRect(0,0,512,128);
    ctx.strokeStyle='#ba9c64';ctx.lineWidth=5;ctx.strokeRect(4,4,504,120);
    ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 38px Georgia';
    ctx.fillText(label,256,77,488);
    const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const mat=new THREE.MeshBasicMaterial({map:tx,transparent:false,side:THREE.DoubleSide});
    const face=make(new THREE.PlaneGeometry(1.8*scale,.45*scale),mat,G,0,.83,.62);
    return face;
  }
  let animated=[],swaps=[];
  const pulse=(mesh,axes=['y'],amplitude=0.2,frequency=1.2,phase=0)=>{
    const original=mesh.position.clone();
    animated.push((time,active)=>{for(const axis of axes)mesh.position[axis]=original[axis]+Math.sin(time*frequency+phase)*(amplitude*(active?1.7:0.35))});
  };
  const rotate=(mesh,axis='y',speed=0.7)=>{
    animated.push((time,active)=>{mesh.rotation[axis]=time*speed*(active?1.7:0.33)});
  };
  const shine=(mesh,activeColor='#ffffff')=>{
    const orig=mesh.material.clone();
    animated.push((time,active)=>{
      mesh.material.opacity=Math.max(.15,Math.min(.96,(active?.65:.38)+.22*Math.sin(time*1.7)));
    });
  };
  const spark=(n,rad=0.56,material=glow)=>{
    const group=new THREE.Group();G.add(group);
    for(let i=0;i<n;i++){
      const phi=2*Math.PI*i/n, p=ball(.045,material,Math.cos(phi)*rad,1.46+0.18*Math.sin(i*2),Math.sin(phi)*rad,group);
      pulse(p,['y'],.1,1.1,i);
    }
    rotate(group);
    return group;
  };
  const paper=(w,h,x,y,z,angle=0)=>{
    const p=box(w,.018,h,ivory,x,y,z);p.rotation.y=angle;return p;
  };
  const eachString=(word,x,y,z)=>{
    textLabel(word,.6).position.set(x,y,z);
  };
  G.position.y=0.25;
  const n=Number(object.id.slice(1));
  const orb=()=>{const o=ring(.54,.012,gold,0,1.55,0);o.rotation.x=.85;rotate(o);};
  const gem=(c='#8bc5cf')=>new THREE.MeshPhysicalMaterial({color:c,roughness:.12,transmission:.43,transparent:true,opacity:.78});
  switch(n){
    case 1: { // Threshold: one door, two opposed visible inscriptions
      box(1.35,1.45,.1,ink,0,1.32,-.13);
      box(.07,1.46,.18,gold,-.71,1.32,-.13);box(.07,1.46,.18,gold,.71,1.32,-.13);
      const a=box(.68,.13,.05,gold,-.31,1.98,.02),b=box(.68,.13,.05,blue,.35,1.82,.04);
      textLabel('ASLAN',.52).position.set(-.34,2.03,.08);
      textLabel('TASH',.52).position.set(.34,1.85,.08);
      swaps.push(()=>{a.position.x*=-1;b.position.x*=-1;a.rotation.y+=Math.PI;b.rotation.y+=Math.PI});
      break;
    }
    case 2: { // Animated hospitality flame on an authored brick hearth
      box(1.45,.85,.36,bronze,0,1.06,-.12);
      const flame=ball(.23,glow,0,1.54,.15);flame.scale.set(.75,1.7,.6);
      pulse(flame,['y'],.13,3.1);shine(flame);spark(8,.31);
      break;
    }
    case 3: { // Spectral window uses twelve real panes, not an image mockup
      const paneColors=['#9d465a','#cc8a45','#e2c477','#6f9d72','#67a2ba','#8264a4'];
      const panes=[];
      for(let i=0;i<12;i++){const col=i%4,row=Math.floor(i/4);
        const mat=gem(paneColors[(col+row)%6]);
        const p=box(.32,.42,.025,mat,-.52+col*.35,1.17+row*.45,.08);panes.push(p);
      }
      swaps.push(()=>panes.forEach((p,i)=>{p.material.color.set(paneColors[(i+3)%6]);}));
      box(1.5,.07,.09,gold,0,2.58,.09);spark(5,.65,bright);break;
    }
    case 4: { // Self-writing previous reader's drawer
      box(1.3,.5,.75,bronze,0,1.08,0);const drawer=box(.95,.26,.45,ivory,0,1.12,.43);
      box(.16,.07,.05,gold,0,1.16,.69);
      paper(.7,.42,0,1.29,.28);swaps.push(()=>{drawer.position.z=drawer.position.z===.43?.77:.43});
      break;
    }
    case 5: { // Manuscript, two turning leaves
      box(1.2,.12,.84,wine,0,1.18,0);
      const pageA=paper(.52,.75,-.27,1.26,0),pageB=paper(.52,.75,.27,1.26,0);
      const inkstroke=box(.36,.015,.02,ink,-.28,1.287,-.16);
      swaps.push(()=>{pageB.rotation.z=pageB.rotation.z===0?.45:0;inkstroke.rotation.y+=.3});break;
    }
    case 6: { // Unsent letter: sealed, never transmitted by clicking
      const env=paper(1,.65,0,1.22,0);env.rotation.z=-.2;
      cyl(.12,.12,.025,wine,.12,1.26,0);
      const star=ring(.14,.016,gold,.12,1.29,0);star.rotation.x=Math.PI/2;
      swaps.push(()=>{env.rotation.z=env.rotation.z===-.2?.15:-.2});break;
    }
    case 7: { // The CC0 donor contains the cups; our rings tell the story
      const rings=[ring(.25,.018,gold,-.32,1.5,.12),ring(.25,.018,gold,.32,1.5,.12)];
      for(const r of rings)r.rotation.x=Math.PI/2;
      swaps.push(()=>rings.forEach(r=>r.scale.multiplyScalar(r.scale.x>1.1?.8:1.25)));
      break;
    }
    case 8: { // Artifact scale with the lines of a changed translation
      const scale=make(new THREE.IcosahedronGeometry(.46,0),gem('#7db7a6'),G,0,1.62,0);
      scale.scale.set(1,.3,1);rotate(scale,'y',.15);spark(5,.7);
      break;
    }
    case 9: { // Basis-changing portrait
      box(1.3,1.36,.07,gold,0,1.65,0);
      const painting=box(1.09,1.14,.06,material('#383f50'),0,1.65,.08);
      const basis=new THREE.Group();G.add(basis);
      const a=box(.035,.8,.04,bright,-.15,1.6,.14);
      const b=box(.8,.035,.04,glow,0,1.42,.15);
      swaps.push(()=>{basis.rotation.y+=.5;painting.rotation.y+=.13});break;
    }
    case 10: { // Map with visibly changing cheapest route
      paper(1.55,1.03,0,1.2,0);
      for(let i=0;i<5;i++){
        const dot=ball(.045,bronze,-.55+i*.28,1.26,Math.sin(i*1.4)*.28);
      }
      const route=box(1.19,.022,.022,wine,0,1.286,0);
      swaps.push(()=>route.rotation.y+=.7);break;
    }
    case 11: { // Correspondence window; sealed envelope and stamp
      box(1.5,1.1,.07,bronze,0,1.55,0);
      paper(.8,.6,0,1.29,.15);
      const stamp=box(.27,.045,.25,wine,.23,1.34,.3);
      swaps.push(()=>{stamp.position.y+=stamp.position.y>1.5?-.28:.28});
      break;
    }
    case 12: { // An old sentence remains under the new one
      box(1.5,.12,.8,bronze,0,1.14,0);
      const sheets=[paper(1.09,.7,0,1.24,-.06),paper(.88,.55,.1,1.275,.05)];
      const lower=box(.77,.009,.015,ink,-.1,1.26,-.13),top=box(.65,.009,.015,wine,.1,1.3,.06);
      swaps.push(()=>{sheets[1].position.x=sheets[1].position.x===.1?-.13:.1;top.rotation.y+=.14});break;
    }
    case 13: { // Not a security portal: miniature child cosmos inside wardrobe
      const door=box(1.1,1.55,.08,bronze,-.53,1.44,.01);
      box(.9,1.42,.05,ink,.45,1.44,-.02);
      const inner=ball(.38,bright,0,1.45,.12);shine(inner);
      swaps.push(()=>{door.rotation.y=door.rotation.y===0?-.85:0});break;
    }
    case 14: { // A low cost mirror of changing viewpoints
      const frame=box(1.1,1.4,.09,gold,0,1.6,0);
      const surf=box(.94,1.21,.06,gem('#75a9bd'),0,1.6,.09);
      swaps.push(()=>{surf.rotation.y=surf.rotation.y===0?.4:0});break;
    }
    case 15: { // Tiny chapel with fractal branching
      box(.91,.9,.72,ivory,0,1.26,0);
      const roof=make(new THREE.ConeGeometry(.75,.6,4),bronze,G,0,2.03,0);
      roof.rotation.y=Math.PI/4;const tree=cyl(.055,.1,.67,bronze,.53,1.58,.15);
      for(let k=0;k<6;k++){const b=box(.03,.36,.03,leaf,.53,1.74,.15);b.rotation.z=k*Math.PI/3}
      swaps.push(()=>roof.rotation.y+=Math.PI/4);break;
    }
    case 16: { // Honest exit is opt-in and never forces departure
      const door=box(1.16,1.6,.08,material('#4e4033'),0,1.4,-.07);
      box(.1,.1,.1,gold,.43,1.4,.06);
      swaps.push(()=>{door.rotation.y=door.rotation.y===0?-.58:0});break;
    }
    case 17: { // Actual rotating orrery: three tilted orbital paths
      const core=ball(.2,glow,0,1.68,0);shine(core);
      for(let i=0;i<3;i++){
        const rr=ring(.37+i*.17,.012,i%2?bronze:gold,0,1.68,0);
        rr.rotation.set(i*.33,i*.6,i*.16);rotate(rr,'y',.15+i*.13);
        const sat=ball(.04+i*.015,i%2?bright:ivory,rr.position.x,1.68,.37+i*.17);
        pulse(sat,['y'],.07,.9+i*.35,i);
      }
      break;
    }
    case 18: { // Printing press, actual paper sheets
      const roller=cyl(.2,.2,1.15,bronze,0,1.43,0);roller.rotation.z=Math.PI/2;
      const sheet=paper(1,.65,0,1.17,.1);swaps.push(()=>{sheet.position.z=sheet.position.z===.1?-.27:.1});
      break;
    }
    case 19: { // Compound frequency, two independent pendulums
      const a=cyl(.035,.035,.65,gold,-.25,1.62,.04),b=cyl(.035,.035,.65,bronze,.26,1.62,.04);
      const aa=ball(.15,gold,-.25,1.27,.04),bb=ball(.15,blue,.26,1.27,.04);
      animated.push((t,active)=>{aa.position.x=-.25+.18*Math.sin(t*(active?3.4:1.4));bb.position.x=.26+.17*Math.sin(t*(active?2.7:1.1))});break;
    }
    case 20: { // Rain gauge and probabilistic drops
      const tube=cyl(.21,.21,.78,glass,0,1.37,0);
      for(let i=0;i<8;i++){
        const drop=ball(.038,bright,-.22+i*.06,1.86+(i%3)*.21,0);
        animated.push((t,active)=>{drop.position.y=1.14+((i*.18-t*(active?.45:.13))%1.2+1.2)%1.2});
      }
      break;
    }
    case 21: { // Glass does not decide morality
      const arc=ring(.57,.025,gold,0,1.57,0);arc.rotation.x=.2;
      const cx=ball(.34,gem('#a3c9b3'),0,1.55,0);
      shine(cx);spark(7,.67,bright);break;
    }
    case 22: { // Wren is not obligated to return
      const bird=ball(.19,bronze,.03,1.49,.08);
      ball(.11,gold,.17,1.59,.09);
      const wing=make(new THREE.ConeGeometry(.16,.45,3),leaf,G,-.11,1.47,.06);
      wing.rotation.z=.7;
      pulse(bird,['y'],.09,1.4);
      swaps.push(()=>{bird.position.x=bird.position.x===.03?.39:.03});break;
    }
    case 23: { // Debate chairs face each other, not toward a grade
      const chairs=[];
      for(const x of [-.43,.43]){
        const c=new THREE.Group();G.add(c);c.position.set(x,1.08,0);
        box(.45,.08,.4,bronze,0,.1,0,c);
        box(.45,.55,.09,material('#713f44'),0,.33,-.18,c);chairs.push(c);
      }
      swaps.push(()=>chairs.forEach((c,i)=>c.rotation.y+=i?-.3:.3));
      break;
    }
    case 24: { // Real physical repair of a cracked mullion
      box(.12,1.4,.16,ivory,0,1.47,0);
      const crack=box(.04,.79,.18,ink,.014,1.49,.09);
      const brace=box(.36,.08,.2,bronze,0,1.25,.14);
      swaps.push(()=>{crack.visible=!crack.visible;brace.material=crack.visible?bronze:gold});break;
    }
    default: {orb();break}
  }
  // Present source geometry and lore side by side. The art stays clickable
  // even if Poly Haven is unavailable; the asset donor does not own the story.
  textLabel(object.id+'  '+object.name.slice(0,16),.62).position.set(0,.47,1.01);
  let activations=0;
  return {
    group:G,
    activate(){
      activations++;
      for(const f of swaps)f();
      return activations;
    },
    animate(seconds) {
      for(const fn of animated)fn(seconds,activations%2!==0);
    }
  };
}
