/* WEBSPACE: CATHEDRAL/GRAMMAR/01 — independent original procedural asset grammar.
 * WORLD: commons | CONTRACT: no global origin, navigation, portal, plants or persistence.
 * WHY: the Garden's 2D plan owns placement; this module creates *parts* at local metre coordinates.
 * FUTURE-AI SEED 01: Join many bays through a host's wall graph. Never invent a new Chuzhoy footprint.
 * FUTURE-AI SEED 02: Split Gothic load ribs from the Alhambra's recursive muqarnas infill.
 * FUTURE-AI SEED 03: The ornamental star must remain SEVENfold; the structural crown is eight/sixteenfold.
 * Licence: original Webspace source, MIT. No external geometry or texture dependencies.
 */
export const VERSION = 'cathedral.catalogue/1';
export const PALETTES = Object.freeze({
  penitential_ember: ['#69232e','#d47d38','#9d4555','#e4c78c'],
  verdant_mercy: ['#125943','#74aa6a','#bacc75','#d8e6cb'],
  nocturne_sapphire: ['#193e88','#44427e','#98b7eb','#dedaf3']
});
export const MOODS = Object.freeze({
  shimmer: { diffusion: .76, thickness: .62, halo: .48, narrative: 'Near-field active light: living water, healing, unstable thresholds.' },
  glimmer: { diffusion: .28, thickness: .52, halo: .24, narrative: 'Distant beckoning intelligence: reading, astronomy, a promise becoming visible.' },
  blaze: { diffusion: .40, thickness: .80, halo: .92, narrative: 'Deliberately supernatural excess: warning, miracle, intervention.' }
});
const P = Math.PI, TAU = P * 2;
const lerp = (a,b,t) => a+(b-a)*t;
const finite = v => Number.isFinite(v);
const vadd = (a,b) => a.map((v,i)=>v+b[i]);
const vsub = (a,b) => a.map((v,i)=>v-b[i]);
const vmul = (v,f) => v.map(x=>x*f);
const norm = v => { const l=Math.hypot(...v)||1; return vmul(v,1/l); };
function hash(str){ let h=2166136261; for(const c of String(str)) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
function mesh(id){
  const triangles=[], sockets=[], effects=[], annotations=[];
  const tri=(a,b,c,material,part,system='structure')=>{
    if(![...a,...b,...c].every(finite)) throw Error('nonfinite '+part);
    triangles.push({a,b,c,material,part,system});
  };
  const quad=(a,b,c,d,mat,part,sys)=>{tri(a,b,c,mat,part,sys);tri(a,c,d,mat,part,sys);};
  const box=(a,b,mat,part,sys='stone')=>{
    const [x,y,z]=a,[X,Y,Z]=b; if(!(X>x&&Y>y&&Z>z))return;
    quad([x,y,z],[X,y,z],[X,Y,z],[x,Y,z],mat,part,sys);
    quad([x,y,Z],[x,Y,Z],[X,Y,Z],[X,y,Z],mat,part,sys);
    quad([x,y,z],[x,y,Z],[X,y,Z],[X,y,z],mat,part,sys);
    quad([x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z],mat,part,sys);
    quad([x,y,z],[x,Y,z],[x,Y,Z],[x,y,Z],mat,part,sys);
    quad([X,y,z],[X,y,Z],[X,Y,Z],[X,Y,z],mat,part,sys);
  };
  const result=()=>{
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(const t of triangles)for(const p of [t.a,t.b,t.c])for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}
    return {schema:'cathedral.mesh/1',id,units:'metres',axes:'x-east y-up z-south (host converts)',triangles,sockets,effects,annotations,
      bounds:triangles.length?{min,max}:{min:[0,0,0],max:[0,0,0]}, hostOwns:['2D map','collision approval','navigation','flora','story','portal','time','persistence']};
  };
  return {tri,quad,box,sockets,effects,annotations,result};
}
/** Two circular arcs meeting at one sharp apex. Never create a two-shoulder profile by accident. */
export function pointedY(x,span,spring,rise){
  if(!(span>0 && rise>0))throw Error('invalid arch');
  const a=span/2,c=(rise*rise-a*a)/(2*a),r=a+c,local=x-span/2,centre=local<=0?c:-c;
  return spring+Math.sqrt(Math.max(0,r*r-(local-centre)*(local-centre)));
}
/** Real arch masonry: each stone is a wedge with intrados, extrados, mortar gap, soffit and crown voussoir.
 * FUTURE-AI SEED 04: stone bonds should eventually propagate around wall corners and buttress thrust-lines.
 */
function arch(m,x0,x1,z,spring,rise,thickness=.26,depth=.55,id='arch',stones=15){
  const span=x1-x0;if(!(span>.4))throw Error('arch span too small');
  if(stones%2===0)stones++;
  for(let j=0;j<stones;j++){
    const gap=.012/span, l=j/stones+gap,r=(j+1)/stones-gap;if(r<=l)continue;
    const at=(t,dy,dz)=>[lerp(x0,x1,t),pointedY(t*span,span,spring,rise)+dy,z+dz];
    const a=at(l,0,-depth/2),b=at(r,0,-depth/2),c=at(r,thickness,-depth/2),d=at(l,thickness,-depth/2);
    const A=at(l,0,depth/2),B=at(r,0,depth/2),C=at(r,thickness,depth/2),D=at(l,thickness,depth/2);
    const key=j===(stones-1)/2, material=key?'caen_keystone':j%4?'caen_ashlar':'granite_weathered';
    const name=id+'/'+(key?'crown-keystone':'voussoir')+'-'+j;
    m.quad(a,b,c,d,material,name,'dressed-arch');m.quad(B,A,D,C,material,name,'dressed-arch');
    m.quad(a,A,B,b,'caen_shadow',name,'intrados');m.quad(d,c,C,D,'caen_shadow',name,'extrados');
    m.quad(a,d,D,A,'mortar',name,'joints');m.quad(b,B,C,c,'mortar',name,'joints');
  }
  m.sockets.push({id:id+'/spring-left',pos:[x0,spring,z],role:'bearing'}, {id:id+'/spring-right',pos:[x1,spring,z],role:'bearing'},
    {id:id+'/crown',pos:[(x0+x1)/2,spring+rise,z],role:'crown-stone'});
}
/** Intentional double shoulder: three related pointed spans, never accidental rounded shoulders. */
function shoulder(m,span,spring,height,depth,id){
  const a=span*.18;
  arch(m,-span/2,-a,0,spring*.63,height*.16,.18,depth,id+'/left',9);
  arch(m,a,span/2,0,spring*.63,height*.16,.18,depth,id+'/right',9);
  arch(m,-a,a,0,spring,height*.34,.24,depth,id+'/upper',13);
  for(const x of [-span/2,-a,a,span/2])m.box([x-.12,0,-depth/2],[x+.12,spring*.65,depth/2],'granite_weathered',id+'/jamb','masonry');
  m.annotations.push({id,style:'deliberate three-stage shoulder',roles:['spring','shoulder','pointed crown']});
}
function latheColumn(m,x,z,h,rad,id,detail=1){
  const sides=detail>1?24:12, courses=detail>1?6:4;
  m.box([x-rad*1.5,0,z-rad*1.5],[x+rad*1.5,rad*.32,z+rad*1.5],'granite_weathered',id+'/plinth');
  const profiles=[[.32,1.24],[.54,1.04],[h*.35,.99],[h*.66,1.01],[h-rad*1.2,.95],[h-rad*.68,1.27],[h-rad*.36,1.55],[h,1.62]];
  for(let k=0;k<profiles.length-1;k++){
    const [ya,ra]=profiles[k],[yb,rb]=profiles[k+1];
    for(let i=0;i<sides;i++){
      const at=(t,y,r)=>{const a=t*TAU/sides; const flute=detail>1?.027*Math.cos(a*12):0;return[x+rad*r*(1+flute)*Math.cos(a),y,z+rad*r*(1+flute)*Math.sin(a)];};
      m.quad(at(i,ya,ra),at(i+1,ya,ra),at(i+1,yb,rb),at(i,yb,rb),
        k>=5?'caen_carved':'purbeck_marble',id+'/shaft','column');
    }
  }
  // The capital is NOT a Lego cap: individual leaf reliefs and carved abacus remain separate source primitives.
  for(let i=0;i<8;i++){
    const a=i*TAU/8, p=(r,y)=>[x+r*Math.cos(a),y,z+r*Math.sin(a)];
    m.tri(p(rad*.95,h-rad*1.08),p(rad*1.47,h-rad*.30),
      [x+rad*1.15*Math.cos(a+.18),h-rad*.60,z+rad*1.15*Math.sin(a+.18)],'acanthus',id+'/leaf'+i,'capital');
  }
  m.box([x-rad*1.68,h-rad*.20,z-rad*1.68],[x+rad*1.68,h,z+rad*1.68],'caen_carved',id+'/abacus','capital');
  for(let j=1;j<courses;j++)m.annotations.push({id:id+'/drum-'+j,height:h*j/courses});
  m.sockets.push({id:id+'/capital',pos:[x,h,z],role:'arch-spring'});
}
function addGlass(m,poly,id,colour){
  for(let i=1;i<poly.length-1;i++)m.tri(poly[0],poly[i],poly[i+1],colour,id,'stained-glass');
}
function glass(m,shape,w,h,palette,mood,id){
  const colors=PALETTES[palette], fx=MOODS[mood];
  if(!colors||!fx)throw Error('unknown glass mood/palette');
  if(shape==='rose'){
    const y=h*.57,r=Math.min(w,h)*.35,n=14,pts=[];
    for(let i=0;i<n;i++)pts.push([r*Math.cos(TAU*i/n),y+r*Math.sin(TAU*i/n),0]);
    for(let i=0;i<n;i++){
      if(i===2||i===10)continue; // explicitly broken panes, no fake opaque mask
      addGlass(m,[[0,y,0],pts[i],pts[(i+1)%n]],id+'/pane'+i,colors[i%colors.length]);
      const next=(i+1)%n;m.box([pts[i][0]-.025,pts[i][1]-.025,-.025],[pts[i][0]+.025,pts[i][1]+.025,.025],'lead',id+'/lead'+next,'tracery');
    }
    for(let i=0;i<7;i++)m.annotations.push({id:id+'/sevenfold-'+i,structural:false,symbolic:true});
  } else if(shape==='lancet'){
    shoulder(m,w,h*.56,h*.7,.22,id+'/frame');
    for(let i=0;i<3;i++)for(let j=0;j<4;j++){
      const x=-w*.35+i*w*.24, y=h*.08+j*h*.15;
      addGlass(m,[[x,y,0],[x+w*.20,y,0],[x+w*.20,y+h*.13,0],[x,y+h*.13,0]],id+'/pane'+i+'-'+j,colors[(i+j)%colors.length]);
    }
  } else if(shape==='screen'){
    m.box([-w*.53,.06,-.12],[-w*.49,h*.84,.12],'granite_weathered',id+'/left','frame');
    m.box([w*.49,.06,-.12],[w*.53,h*.84,.12],'granite_weathered',id+'/right','frame');
    for(let i=0;i<4;i++)for(let j=0;j<3;j++){
      const x=-w*.46+i*w*.235, y=.15+j*h*.22;
      addGlass(m,[[x,y,0],[x+w*.21,y,0],[x+w*.21,y+h*.19,0],[x,y+h*.19,0]],
       id+'/pane'+i+'-'+j,colors[(i+2*j)%colors.length]);
    }
  } else throw Error('unknown glass shape');
  m.effects.push({id:id+'/projection',glass:id,shape,palette,mood,
    // These are *requests* to the host light renderer, never inferred as true spectral transport.
    diffusion:fx.diffusion,thickness:fx.thickness,haloMultiplier:1+fx.halo*2.4,
    fakeCaustics:true,shadowMapNeeded:false,visibility:'optional'});
  m.sockets.push({id:id+'/mount',pos:[0,h*.5,0],role:'stained-glass-frame'});
}
function vault(m,shape,w,d,spring,rise,id,seed=7){
  const n=shape==='octagon'?8:4,pts=[];
  if(shape==='octagon')for(let i=0;i<n;i++)pts.push([Math.cos(TAU*(i+.5)/n)*w*.5,Math.sin(TAU*(i+.5)/n)*w*.5]);
  else if(shape==='trapezoid')pts.push([-w*.5,-d*.5],[w*.5,-d*.5],[w*.35,d*.5],[-w*.35,d*.5]);
  else pts.push([-w*.5,-d*.5],[w*.5,-d*.5],[w*.5,d*.5],[-w*.5,d*.5]);
  for(let i=0;i<n;i++){
    const [x,z]=pts[i]; latheColumn(m,x,z,spring,w*.035,id+'/pier'+i,1);
    const [X,Z]=pts[(i+1)%n],mid=[(x+X)/2,(z+Z)/2],len=Math.hypot(X-x,Z-z);
    const a=mid.map(()=>0), yaw=Math.atan2(Z-z,X-x);
    const local=mesh(id+'/edge'+i);shoulder(local,len,spring,rise,.38,id+'/shoulder'+i);
    for(const t of local.result().triangles){const rot=p=>[mid[0]+p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),p[1],
      mid[1]+p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw)];m.tri(rot(t.a),rot(t.b),rot(t.c),t.material,t.part,t.system);}
    m.sockets.push({id:id+'/bay-edge'+i,pos:[mid[0],spring,mid[1]],role:'adjacent-bay'});
    const ringSamples=12;let last=null;
    for(let j=0;j<=ringSamples;j++){
      const t=j/ringSamples, p=[lerp(x,0,t),spring+Math.sin(P*t*.5)*rise,lerp(z,0,t)];
      if(last){const N=norm(vsub(p,last)),up=[0,0,.055]; // coarse rib frustum, not illuminated bars
        const a=vadd(last,up),b=vadd(p,up),c=vsub(p,up),d=vsub(last,up);m.quad(a,b,c,d,'caen_carved',id+'/structural-rib'+i,'vault-ribs');}
      last=p;
    }
  }
  // Faceted muqarnas are separate infill; open roof can lose sections without removing load ribs.
  for(let i=0;i<n;i++){
    if(hash(seed+'|'+i)%7===0)continue;
    const a=TAU*i/n,b=TAU*(i+1)/n;
    for(let layer=0;layer<3;layer++){
      const r1=w*(.12+layer*.075),r2=r1+w*.065,y=spring+rise*(.47-layer*.07);
      const p=t=>[Math.cos(t)*r1,y,Math.sin(t)*r1],q=t=>[Math.cos(t)*r2,y-.12,Math.sin(t)*r2];
      const tip=[Math.cos((a+b)/2)*(r1+r2)/2,y-.30-.10*layer,Math.sin((a+b)/2)*(r1+r2)/2];
      m.tri(p(a),p(b),tip,'caen_ashlar',id+'/muqarnas','vault-infill');
      m.tri(q(a),q(b),tip,'caen_shadow',id+'/muqarnas','vault-infill');
    }
  }
  m.annotations.push({id,shape,roof:'selectively open',history:'square altar -> French Gothic rib -> Moorish cellular infill -> circular communion floor'});
}
export function compile(spec){
  if(!spec||typeof spec!=='object')throw Error('asset specification required');
  const {id='catalogue-item',kind='dressed_arch'}=spec;
  if(!/^[a-z0-9][a-z0-9/_-]{0,100}$/i.test(id))throw Error('invalid asset ID');
  const w=spec.width??4,d=spec.depth??4,h=spec.height??5,spring=spec.spring??h*.53,rise=spec.rise??h*.36;
  if(![w,d,h,spring,rise].every(finite)||w<.5||d<.2||h<.5||w>100||d>100||h>100)throw Error('invalid dimensions');
  const m=mesh(id),lod=spec.lod??1;
  if(kind==='dressed_arch')arch(m,-w/2,w/2,0,spring,rise,Math.max(.2,w*.07),Math.max(.35,d*.2),id, lod===0?9:21);
  else if(kind==='shoulder_arch')shoulder(m,w,spring,rise,Math.max(.35,d*.2),id);
  else if(kind==='column')latheColumn(m,0,0,h,w*.10,id,lod);
  else if(kind==='vault_rect'||kind==='vault_octagon'||kind==='vault_trapezoid')
    vault(m,kind.slice(6),w,d,spring,rise,id,spec.ruinSeed??7);
  else if(kind==='glass_rose'||kind==='glass_lancet'||kind==='glass_screen')
    glass(m,kind.slice(6),w,h,spec.palette??'nocturne_sapphire',spec.mood??'glimmer',id);
  else throw Error('unknown part family '+kind);
  const out=m.result();out.kind=kind;out.parameters={width:w,depth:d,height:h,spring,rise,lod};return out;
}
/** This compiler intentionally has no host world import: geographical authority remains external.
 * FUTURE-AI SEED 05: connect numbered wall runs to bays, then add a geometry/line-of-sight regression.
 * FUTURE-AI SEED 06: derive an optional STEP B-rep from the same explicit voussoir solids.
 * FUTURE-AI SEED 07: let a Purgatorio chamber inherit this grammar without inheriting Christian iconography.
 */
export function compileLocalCatalogue(specs){
  if(!Array.isArray(specs)||specs.length>100)throw Error('local catalogue must be <=100 items');
  const ids=new Set();return specs.map(s=>{if(ids.has(s.id))throw Error('duplicate ID');ids.add(s.id);return compile(s);});
}
