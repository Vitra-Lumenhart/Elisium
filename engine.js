'use strict';
/* ELISIUM 0.1: a graph-native world renderer, evolved from Chuzhoy's WebGL2/art language.
   No shared runtime or cross-world portal handoff; this is its own authored engine.
   A vertex represents a camera destination, NOT a distance unit. Edge costs belong
   to the topological graph and advance a separate diegetic clock during locked transit.
   Exactly two sprite families. Each has ONE triptych texture (three UV regions).
   All foliage uses ghost material: grayscale, translucency, time-dependent sway/glow.
*/
(() => {
const $=id=>document.getElementById(id), C=$('world'),SKY=$('sky'),HUD=$('hudLayer');
// WebGL2 is authoritative. A restrained 2D projected compatibility renderer keeps
// the HTML preview interactive where embedded browsers disable GPU contexts.
const realGL=C.getContext('webgl2',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false});
const cpuMode=!realGL;
const dummyGL=new Proxy({}, {get(_t,p){
 if(p==='getShaderParameter'||p==='getProgramParameter')return()=>true;
 if(['createShader','createProgram','createBuffer','createVertexArray','createTexture','getUniformLocation'].includes(p))return()=>({});
 if(p==='getShaderInfoLog'||p==='getProgramInfoLog')return()=>'';
 if(typeof p==='string'&&p===p.toUpperCase())return 1;
 return()=>{};
}});
const gl=realGL||dummyGL;
const cpu=cpuMode?C.getContext('2d',{alpha:true}):null;
if(cpuMode)document.querySelector('#bottomLine div:first-child').textContent+=' · COMPATIBILITY VIEW';
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const xyDist=(p,a,b)=>{let v=[b[0]-a[0],b[2]-a[2]],q=[p[0]-a[0],p[1]-a[2]],t=clamp((q[0]*v[0]+q[1]*v[1])/(v[0]*v[0]+v[1]*v[1]),0,1);return Math.hypot(q[0]-v[0]*t,q[1]-v[1]*t)};
const rndGen=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const rand=rndGen(332081);
// Nonuniform graph topology: changing vertex positions does NOT automatically change
// travel weights. Factors encode subjective time and can later be edited independently.
const nodes={
  gate:{name:'The Quiet Door',p:[0,1.7,18],desc:'One exit, facing the world you are leaving.',links:['birth'],kind:'portal'},
  birth:{name:'The First Footfall',p:[0,1.7,10],desc:'The grass is colorless, but the world is not.',links:['gate','letters'],kind:'start'},
  letters:{name:'A Writer’s Lantern',p:[0,1.7,2],desc:'A screen offers thanks to a writer and his friends.',links:['birth','glade'],kind:'screen'},
  glade:{name:'The Unsettled Meadow',p:[0,1.7,-14],desc:'Two figures stand at opposite ends of an unfinished argument.',links:['letters','lion','bird'],kind:'fork'},
  lion:{name:'Aslan’s Listening Place',p:[-18,1.7,-27],desc:'Here, assurance is asked to make room for scrutiny.',links:['glade','brook','bird'],kind:'aslan'},
  bird:{name:'Tash’s Long Shadow',p:[18,1.7,-27],desc:'Here, fear disguises itself in the grammar of truth.',links:['glade','thorn','lion'],kind:'tash'},
  brook:{name:'The Pale Brook',p:[-17,1.7,-44],desc:'Neither bank can explain the meaning of the crossing.',links:['lion','cairn','roots'],kind:'wild'},
  thorn:{name:'The Court of Thorns',p:[18,1.7,-44],desc:'Nothing in the forest grows more carefully than a thorn.',links:['bird','cairn','echo'],kind:'wild'},
  cairn:{name:'A Cairn of Two Names',p:[0,1.7,-50],desc:'An intersection where a short journey may take a long time.',links:['brook','thorn','far'],kind:'wild'},
  roots:{name:'The Root Archive',p:[-31,1.7,-62],desc:'Older branches carry younger stories.',links:['brook','far'],kind:'wild'},
  echo:{name:'The Answering Wood',p:[31,1.7,-62],desc:'The echo speaks with a borrowed voice.',links:['thorn','far'],kind:'wild'},
  far:{name:'The Edge of the Essay',p:[0,1.7,-75],desc:'Beyond the last sentence waits another question.',links:['cairn','roots','echo'],kind:'end'}
};
const EDGE_FACTORS={'bird|lion':2.25,'cairn|thorn':1.78,'cairn|far':.66,'far|roots':1.65,'far|echo':.83,'birth|gate':.62,'glade|lion':1.15,'glade|bird':1.13};
const edgeKey=(a,b)=>[a,b].sort().join('|');
const edgeCost=(a,b)=>{
 const d=dist(nodes[a].p,nodes[b].p),factor=EDGE_FACTORS[edgeKey(a,b)]??1;
 return Math.max(4,Math.round((Math.pow(d,.90)*2.6+3)*factor));
};
const edgeList=[];for(const [a,n] of Object.entries(nodes))for(const b of n.links)if(a<b)edgeList.push([a,b]);
for(const [a,b] of edgeList)if(!nodes[b].links.includes(a))throw Error(`Graph is not symmetric: ${a}-${b}`);
let current='birth',prior=null,clockMin=6*60+14,visits=0,insight=0,doubt=0,player=[...nodes.birth.p],yaw=0,pitch=-.015,transit=null,last=performance.now(),travelHistory=[];
const spriteDefs={
 aslan:{pos:[-18,0,-33],width:4.25,height:5.28,src:'assets/aslan_triptych.png',panel:0,family:'ethics of listening'},
 tash:{pos:[18,0,-33],width:3.72,height:5.48,src:'assets/tash_triptych.png',panel:0,family:'rhetoric of certainty'}
};
let activeDialog=null;
const glyph=(s)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const clockText=()=>`DAY ${['I','II','III','IV'][Math.min(3,Math.floor(clockMin/1440))]} · ${String(Math.floor(clockMin/60)%24).padStart(2,'0')}:${String(Math.floor(clockMin%60)).padStart(2,'0')}`;
function refreshUI(){const n=nodes[current];$('place').textContent=n.name;$('placeDesc').textContent=n.desc;$('sector').textContent=n.kind==='aslan'?'CHAPTER II · THE LISTENING LION':n.kind==='tash'?'CHAPTER II · THE SHADOW’S CLAIM':current==='far'?'CHAPTER III · THE UNFINISHED END':'CHAPTER I · A COMMON FIELD';$('clock').textContent=clockText();$('steps').textContent=`${visits} PASSAGES`;$('stepBack').disabled=!!transit||!prior||!n.links.includes(prior);$('stepAhead').disabled=!!transit;$('interact').disabled=!!transit||!nearestInteractable();let k=nearestInteractable();$('interact').querySelector('span').textContent=k==='aslan'||k==='tash'?'SPEAK':k==='screen'?'READ':k==='portal'?'EXIT':'INTERACT';}
// ------------ GPU plumbing: custom GLSL ES 3.00, no third-party engine ------------
const vScene=`#version 300 es
precision highp float;
in vec3 aP;in vec3 aN;in vec3 aC;in float aA;
uniform mat4 uV,uP;uniform float uT,uGhost;
out vec3 vC,vN,vW;out float vA;
void main(){vec3 p=aP;if(uGhost>.5){float k=min(max(p.y,0.0),16.0);p.x+=sin(uT*.85+aP.x*.24+aP.z*.17+aP.y*.73)*k*.010;p.z+=cos(uT*.70+aP.z*.26+aP.y*.48)*k*.007;}
 vW=p;vN=aN;vC=aC;vA=aA;gl_Position=uP*uV*vec4(p,1.);}`;
const fScene=`#version 300 es
precision highp float;
in vec3 vC,vN,vW;in float vA;
uniform float uT,uGhost;uniform vec3 uEye;
out vec4 outColor;
void main(){vec3 n=normalize(vN);float sun=max(.0,dot(n,normalize(vec3(-.42,.84,.29))));float lit=.58+.42*sun;vec3 col=vC*lit;
 float alpha=vA;
 if(uGhost>.5){float gray=dot(vC,vec3(.299,.587,.114));float phase=sin(uT*1.20+vW.x*.67+vW.y*.82+vW.z*.39);float veil=.73+.20*phase;float edge=pow(1.0-abs(dot(n,normalize(uEye-vW))),2.0);col=vec3(gray*(.77+.18*sun)+edge*.20+phase*.047);alpha=vA*veil;}
 float fog=clamp((distance(uEye,vW)-16.)/108.,0.,.75);
 col=mix(col,vec3(.50,.54,.57),fog);outColor=vec4(col,alpha*(1.-fog*.36));}`;
const vSprite=`#version 300 es
precision highp float;
in vec2 aP;in vec2 aUV;
uniform mat4 uV,uP;uniform vec3 uCenter,uRight;uniform float uW,uH,uPanel;
out vec2 vUV;out float vShade;
void main(){vec3 p=uCenter+vec3(0.,aP.y*uH,0.)+uRight*(aP.x*uW);gl_Position=uP*uV*vec4(p,1.);vUV=vec2((uPanel+aUV.x)/3.,aUV.y);vShade=aP.y;}`;
const fSprite=`#version 300 es
precision highp float;
uniform sampler2D uTex;uniform float uT;
in vec2 vUV;in float vShade;out vec4 outColor;
void main(){vec4 p=texture(uTex,vUV);if(p.a<.025)discard;
 outColor=vec4(p.rgb*(.92+.05*sin(uT*.9+vShade*8.)),p.a);}`;
function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function program(v,f,attribs){const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,v));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,f));attribs.forEach((a,i)=>gl.bindAttribLocation(p,i,a));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
let sceneShader,spriteShader;
try{sceneShader=program(vScene,fScene,['aP','aN','aC','aA']);spriteShader=program(vSprite,fSprite,['aP','aUV']);}catch(err){$('error').hidden=false;$('error').textContent='WebGL shader initialization failed: '+err.message;return;}
const SL=Object.fromEntries(['uV','uP','uT','uGhost','uEye'].map(k=>[k,gl.getUniformLocation(sceneShader,k)]));
const BL=Object.fromEntries(['uV','uP','uT','uCenter','uRight','uW','uH','uPanel','uTex'].map(k=>[k,gl.getUniformLocation(spriteShader,k)]));
function viewMat(pos,theta,phi){let f=[-Math.sin(theta)*Math.cos(phi),Math.sin(phi),-Math.cos(theta)*Math.cos(phi)];let r=[Math.cos(theta),0,-Math.sin(theta)];let u=[Math.sin(theta)*Math.sin(phi),Math.cos(phi),Math.cos(theta)*Math.sin(phi)];return new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-(r[0]*pos[0]+r[1]*pos[1]+r[2]*pos[2]),-(u[0]*pos[0]+u[1]*pos[1]+u[2]*pos[2]),f[0]*pos[0]+f[1]*pos[1]+f[2]*pos[2],1]);}
function projMat(aspect){const f=1/Math.tan(68*Math.PI/360),near=.08,far=260;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
let width=1,height=1,dpr=1,V,P;
function project(p){let dx=p[0]-player[0],dy=p[1]-player[1],dz=p[2]-player[2],right=dx*Math.cos(yaw)-dz*Math.sin(yaw),front=-dx*Math.sin(yaw)-dz*Math.cos(yaw),f=front*Math.cos(pitch)+dy*Math.sin(pitch),up=dy*Math.cos(pitch)-front*Math.sin(pitch);if(f<=.16)return null;let focal=height/(2*Math.tan(68*Math.PI/360));return{x:width/2+focal*right/f,y:height/2-focal*up/f,depth:f};}
function resize(){let r=C.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(2,window.devicePixelRatio||1);C.width=Math.floor(width*dpr);C.height=Math.floor(height*dpr);SKY.width=C.width;SKY.height=C.height;if(!cpuMode)gl.viewport(0,0,C.width,C.height);if(cpuMode)cpu.setTransform(dpr,0,0,dpr,0,0);P=projMat(width/height);drawSky();}
window.addEventListener('resize',resize);
// ------------ Faceted mesh construction ------------
const opaque=[],ghost=[];
const add=(arr,a,b,c,color,alpha=1)=>{let u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;n=n.map(x=>x/l);for(const p of [a,b,c])arr.push(...p,...n,...color,alpha);};
const tri=(a,b,c,color,alpha=1,spirit=false)=>add(spirit?ghost:opaque,a,b,c,color,alpha);
const quad=(a,b,c,d,color,alpha=1,spirit=false)=>{tri(a,b,c,color,alpha,spirit);tri(a,c,d,color,alpha,spirit);};
function box(x,y,z,w,h,d,col,alpha=1,spirit=false){const x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-d/2,z1=z+d/2;
 const p=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
 for(const ids of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])quad(...ids.map(i=>p[i]),col,alpha,spirit);
}
function rod(a,b,r0,r1,col,alpha=1,spirit=false,sides=6){const dir=b.map((v,i)=>v-a[i]);const L=Math.hypot(...dir);if(L<.001)return;let d=dir.map(v=>v/L);let helper=Math.abs(d[1])<.93?[0,1,0]:[1,0,0];let u=[d[1]*helper[2]-d[2]*helper[1],d[2]*helper[0]-d[0]*helper[2],d[0]*helper[1]-d[1]*helper[0]],ul=Math.hypot(...u);u=u.map(v=>v/ul);let v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
 for(let i=0;i<sides;i++){let t=i*TAU/sides,q=(i+1)*TAU/sides;let pt=(origin,r,ang)=>origin.map((k,j)=>k+r*(u[j]*Math.cos(ang)+v[j]*Math.sin(ang)));quad(pt(a,r0,t),pt(a,r0,q),pt(b,r1,q),pt(b,r1,t),col,alpha,spirit);}}
function ico(x,y,z,rx,ry,rz,col,alpha=1,spirit=false,rot=0,rings=5,segs=8){const p=(a,b)=>{let t=a*Math.PI/rings,h=b*TAU/segs+rot;return[x+rx*Math.sin(t)*Math.cos(h),y+ry*Math.cos(t),z+rz*Math.sin(t)*Math.sin(h)];};for(let a=0;a<rings;a++)for(let b=0;b<segs;b++){let k=p(a,b),l=p(a+1,b),m=p(a+1,b+1),n=p(a,b+1);if(a>0)tri(k,l,n,col,alpha,spirit);if(a<rings-1)tri(l,m,n,col,alpha,spirit);}}
function cone(x,yy,z,r,h,c,alpha=1,spirit=false,segs=9){let top=[x,yy+h,z],bottom=[x,yy,z];for(let i=0;i<segs;i++){let a=i*TAU/segs,b=(i+1)*TAU/segs;tri([x+Math.cos(a)*r,yy,z+Math.sin(a)*r],[x+Math.cos(b)*r,yy,z+Math.sin(b)*r],top,c,alpha,spirit);}}
function rng(seed){let r=rndGen(seed);return [r,()=>r()*2-1];}
const gray=t=>[t,t,t];
const gr=(r,min=.40,max=.72)=>gray(min+(max-min)*r());
// Stage 0 = sapling, 1 = juvenile, 2 = mature. Stages are generated once, never animated.
const TREE_FAMILIES=['cypress','umbrella pine','weeping willow','silver birch','broadleaf'];
const GROWTH=['sapling','juvenile','mature'];
const foliageRegistry=[];
function createTree(x,z,type,stage,seed,scale=1){let [r,sym]=rng(seed);let growth=[.34,.64,1][stage];let H=[13,13.5,11.5,12,13][type]*growth*scale,base=[x,0,z];let bark=gr(r,.43,.61),leaf=gr(r,.45,.66),a=.43+r()*.12;
 // Branched trunks are genuinely tapered, and each family has a specific branch grammar.
 let trunk=[x,H*(type===1?.82:.70),z];rod(base,trunk,.42*growth*scale,.18*growth*scale,bark,a,true,8);
 const branch=(start,end,radius,shade)=>rod(start,end,radius,.025*growth*scale,gray(shade),a*.89,true,5);
 const crown=(px,py,pz,w,h,d,tint=0)=>ico(px,py,pz,w*growth*scale,h*growth*scale,d*growth*scale,gray(clamp(leaf[0]+tint,.32,.88)),a,true,r()*6,5,8);
 if(type===0){ // Cypress: twisted vertical spine and nested asymmetric whorls.
   rod(trunk,[x+sym()*.31,H,z+sym()*.28],.18*growth*scale,.035*growth*scale,bark,a,true,7);
   for(let level=0;level<5+stage;level++){let t=(level+.5)/(5+stage),cy=H*(.29+t*.65),R=(1-t)*2.05+.32;
     for(let j=0;j<6;j++){let ang=j*TAU/6+seed*.13+level*.33,end=[x+R*Math.cos(ang)*growth*scale,cy+.16*R,z+R*Math.sin(ang)*growth*scale];branch([x,cy-.5,z],end,.13*growth*scale,.45+r()*.13);crown(end[0],end[1],end[2],.55,.85,.50,(r()-.5)*.13);}}
   crown(x,H*.89,z,.85,2.1,.85,.08);
 } else if(type===1){ // Umbrella pine: bare crooked stem supports a broad flat crown.
   for(let j=0;j<9;j++){let an=j*TAU/9+seed*.04,len=(2.3+r()*2.7)*growth*scale,sy=H*(.74+r()*.19),end=[x+Math.cos(an)*len,sy+r()*.7,z+Math.sin(an)*len];branch([x,H*.72,z],end,.21*growth*scale,.48);crown(...end,1.58,.71,1.44,(r()-.5)*.10);}
   crown(x,H*.97,z,2.25,.85,2.18,.08);
 }else if(type===2){ // Willow: down-curving branching boughs and fine dangling strands.
   crown(x,H*.80,z,2.68,1.65,2.7,.015);
   for(let j=0;j<18;j++){let an=j*TAU/18+seed*.1,R=(2+r()*2)*growth*scale,ey=H*(.73+r()*.17),end=[x+Math.cos(an)*R,ey,z+Math.sin(an)*R];branch([x,H*.82,z],end,.12*growth*scale,.53);
     const lowest=ey-(1.7+r()*3.4)*growth*scale;rod(end,[end[0]+Math.cos(an)*.22,lowest,end[2]+Math.sin(an)*.22],.043*growth*scale,.005*growth*scale,gr(r,.46,.72),a*.88,true,4);
     for(let k=0;k<4;k++){let sy=lerp(ey,lowest,k/4);crown(end[0],sy,end[2],.15,.34,.19,.04);}}
 }else if(type===3){ // Birch: fractured pale bark and tiny isolated leaf clusters.
   for(let j=0;j<8;j++){let y=H*(.15+j*.10);box(x,y,z,.48*growth*scale,.054*growth*scale,.40*growth*scale,gray(.27+r()*.12),.45,true);}
   for(let j=0;j<9;j++){let an=j*2.399+seed*.09,sy=H*(.51+r()*.40),len=(1.3+r()*2.1)*growth*scale,end=[x+Math.cos(an)*len,sy+1.2*growth*scale,z+Math.sin(an)*len];branch([x,sy-.8*growth*scale,z],end,.13*growth*scale,.56);crown(...end,.78,1.04,.76,(r()-.5)*.19);}
 }else{ // Broadleaf: explicit branching fork anatomy + scattered lobed foliage.
   for(let j=0;j<11;j++){let an=j*2.399+seed*.17,sy=H*(.44+r()*.29),len=(1.1+r()*3)*growth*scale,mid=[x+Math.cos(an)*len*.65,sy+1.0*growth*scale,z+Math.sin(an)*len*.65];branch([x,sy,z],mid,.21*growth*scale,.48);let end=[mid[0]+Math.cos(an+.3)*len*.37,mid[1]+(1.2+r())*growth*scale,mid[2]+Math.sin(an+.3)*len*.37];branch(mid,end,.11*growth*scale,.49);crown(...end,1.05,1.35,1.07,(r()-.5)*.18);}
   crown(x,H*.92,z,1.55,1.35,1.5,.04);
 }
 foliageRegistry.push({kind:TREE_FAMILIES[type],growth:GROWTH[stage],stage,x,z,seed});
}
function hedge(x,z,rot,scale,seed){let r=rndGen(seed),col=gr(r,.40,.63),a=.38+r()*.13;for(let i=0;i<4;i++){let k=(i-1.5)*.7*scale,px=x+Math.cos(rot)*k,pz=z+Math.sin(rot)*k;ico(px,.67*scale,pz,.57*scale,.76*scale,.55*scale,col,a,true,rot,4,7)}foliageRegistry.push({kind:'box hedges',x,z});}
function roses(x,z,seed,scale=1){let [r,sym]=rng(seed),bark=gray(.44),a=.53;for(let k=0;k<7;k++){let an=TAU*k/7+seed*.4,re=(.34+r()*.68)*scale,H=(.66+r()*.80)*scale,tip=[x+Math.cos(an)*re,H,z+Math.sin(an)*re];rod([x,.08,z],tip,.032*scale,.006*scale,bark,a,true,4);
  for(let j=1;j<4;j++){let t=j/4,side=an+(j%2?Math.PI/2:-Math.PI/2),p=[lerp(x,tip[0],t),H*t,lerp(z,tip[2],t)],q=[p[0]+Math.cos(side)*.22*scale,p[1]+.16*scale,p[2]+Math.sin(side)*.22*scale];tri([p[0]-.02,p[1],p[2]],q,[p[0]+.07,p[1]+.05,p[2]+.05],gr(r,.47,.70),.51,true);}
  const bud=[tip[0],tip[1]+.05*scale,tip[2]];ico(...bud,.09*scale,.12*scale,.09*scale,gr(r,.57,.80),.58,true,0,3,6);
 }foliageRegistry.push({kind:'three-stage rose thicket',x,z});}
function groundPlant(x,z,seed,scale=1){let r=rndGen(seed);for(let j=0;j<5;j++){let ang=j*TAU/5+seed*.1,len=(.36+r()*.47)*scale,tip=[x+Math.cos(ang)*len,.16+r()*.65*scale,z+Math.sin(ang)*len];let base=[x,.02,z];tri(base,tip,[tip[0]+Math.cos(ang+1.2)*.25*scale,tip[1]-.13,tip[2]+Math.sin(ang+1.2)*.25*scale],gr(r,.36,.66),.43,true);}}
function roots(x,z,scale=1){for(let k=0;k<9;k++){let t=k*TAU/9,rr=2.3+.5*Math.sin(t*4.2),b=[x+Math.cos(t)*rr,.10,z+Math.sin(t)*rr],c=[x+Math.cos(t)*rr*.45,.38,z+Math.sin(t)*rr*.45];rod(b,c,.20*scale,.065*scale,gray(.58),.55,true,5);}}
function layGround(){// Explicit low-poly facets, physically level field, varied illumination per triangle.
  const step=5,N=36;for(let i=-N/2;i<N/2;i++)for(let j=-N/2;j<N/2;j++){
   let x=i*step,z=j*step-17,grain=rand();let c=[.23+grain*.035,.31+grain*.045,.30+grain*.042];let A=[x,-.052,z],B=[x+step,-.052,z],D=[x,-.052,z+step],E=[x+step,-.052,z+step];tri(A,B,E,c);tri(A,E,D,c.map(v=>v*(.91+.09*rand())));
  }
  // Path graph rendered as low-poly inlays; DOES NOT define pathfinding or time.
  for(const [a,b] of edgeList){let p=nodes[a].p,q=nodes[b].p,dx=q[0]-p[0],dz=q[2]-p[2],d=Math.hypot(dx,dz),ux=-dz/d,uz=dx/d;let w=.67;
   const pt=(c,side,y=.008)=>[c[0]+ux*side,y,c[2]+uz*side];quad(pt(p,-w),pt(q,-w),pt(q,w),pt(p,w),[.44,.445,.405],.86);
   quad(pt(p,-.08,.02),pt(q,-.08,.02),pt(q,.08,.02),pt(p,.08,.02),[.69,.60,.43],.53);
  }
  for(const [key,n] of Object.entries(nodes)){
   let p=n.p;for(let j=0;j<12;j++){let a=TAU*j/12,b=TAU*(j+1)/12;tri([p[0],.025,p[2]],[p[0]+Math.cos(a)*1.1,.025,p[2]+Math.sin(a)*1.1],[p[0]+Math.cos(b)*1.1,.025,p[2]+Math.sin(b)*1.1],key===current?[.84,.74,.53]:[.50,.51,.47],.9);}
   if(n.kind==='wild'||n.kind==='end'){
    for(let j=0;j<3;j++){let a=j*TAU/3,xx=p[0]+Math.cos(a)*2.7,zz=p[2]+Math.sin(a)*2.7;box(xx,.48,zz,.55,.96,.56,[.46,.48,.49]);ico(xx,1.15,zz,.49,.24,.49,[.56,.57,.55]);}
   }
  }
  // Screen pedestal and subtly luminous ornamental frame; the true content is DOM.
  box(0,2.82,-.05,10.4,5.7,.27,[.18,.22,.27]);box(0,2.82,.11,10.0,5.28,.25,[.61,.48,.31]);box(0,2.82,.28,9.71,4.99,.13,[.12,.22,.30]);
  box(-4.89,2.82,.43,.12,5.1,.20,[.82,.64,.39]);box(4.89,2.82,.43,.12,5.1,.20,[.82,.64,.39]);
  // Exit portal behind the player; no inbound URL, no federation, no carry-over.
  box(-2.2,3.2,18,.45,6.4,.55,[.62,.61,.70]);box(2.2,3.2,18,.45,6.4,.55,[.62,.61,.70]);box(0,6.35,18,4.9,.48,.6,[.65,.62,.72]);
  box(0,3.2,18.1,3.9,5.7,.13,[.26,.30,.40]);box(0,3.2,18.2,3.45,5.25,.14,[.28,.29,.43]);
  for(let k=0;k<5;k++)for(let s of [-1,1])ico(s*2.2,.8+k*1.2,18,.21,.22,.23,[.78,.67,.50]);
  // Distant megaliths make the flat terrain legible as a designed level.
  for(let i=0;i<29;i++){let an=i*TAU/29,rr=69+rand()*20,x=Math.cos(an)*rr,z=-28+Math.sin(an)*rr;if(z>27)continue;
   box(x,1.4+rand()*2,z,.95+rand(),3+rand()*4,1+rand(),[.30,.35,.39]);}
  roots(-31,-62,1.2);roots(31,-62,1.1);
}
function scatterFoliage(){// Reuses Chuzhoy's species/hedges/roses as a grammar, but all meshes are new.
 const seeds=[];for(let i=0;i<132;i++){
  let x=(rand()-.5)*151,z=-84+rand()*130;if(Math.abs(x)>72||z>41)continue;
  if(Object.values(nodes).some(n=>Math.hypot(x-n.p[0],z-n.p[2])<7.1))continue;
  if(edgeList.some(([a,b])=>xyDist([x,z],nodes[a].p,nodes[b].p)<4.0))continue;
  seeds.push([x,z,i]);
 }
 for(const [x,z,i] of seeds){let type=i%5,stage=i%11===0?0:i%4===0?1:2,scale=.70+rand()*.64;
   createTree(x,z,type,stage,710+i*43,scale);
   if(i%3===0)hedge(x+3.0,z-1.5,rand()*TAU,1.1,610+i);
   if(i%4===0)roses(x-1.9,z+1.3,111+i*7,1.1);
   for(let j=0;j<2;j++)groundPlant(x+(rand()-.5)*5,z+(rand()-.5)*5,i*16+j,.6+rand());
 }
 // Stage showcase by paths without occluding passage lines.
 for(let i=0;i<8;i++){let x=-39+i*8,z=-9+Math.sin(i)*3;groundPlant(x,z,380+i,1.1);}
 // The Chuzhoy shrub-ring grammar survives here as a broken, ghostly bower.
 for(let i=0;i<15;i++){if(i===3||i===4||i===11)continue;let a=i*TAU/15;hedge(-47+Math.cos(a)*8,-33+Math.sin(a)*7,a+.4,.83,7001+i);if(i%5===0)roses(-47+Math.cos(a)*6,-33+Math.sin(a)*5,800+i,.78);}
}
layGround();scatterFoliage();
function bindMesh(data){const buffer=gl.createBuffer(),vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const stride=10*4;for(let i=0;i<4;i++){let loc=i,len=[3,3,3,1][i],offset=[0,3,6,9][i]*4;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,len,gl.FLOAT,false,stride,offset);}gl.bindVertexArray(null);return{vao,count:data.length/10};}
// Attributes were pinned before link, keeping uniform handles valid.
const opaqueMesh=bindMesh(opaque),ghostMesh=bindMesh(ghost);
const spriteBuf=gl.createBuffer(),spriteVAO=gl.createVertexArray();gl.bindVertexArray(spriteVAO);gl.bindBuffer(gl.ARRAY_BUFFER,spriteBuf);
const spriteVerts=new Float32Array([-.5,0,0,0,.5,0,1,0,.5,1,1,1,-.5,0,0,0,.5,1,1,1,-.5,1,0,1]);gl.bufferData(gl.ARRAY_BUFFER,spriteVerts,gl.STATIC_DRAW);
// Sprite shader attributes were pinned before program link.
for(let i=0;i<2;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,2,gl.FLOAT,false,4*4,i*2*4);}gl.bindVertexArray(null);
function textureFromURL(url){const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,0]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);const img=new Image();img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);};img.src=url;return tex;}
for(let s of Object.values(spriteDefs)){s.texture=textureFromURL(s.src);if(cpuMode){s.image=new Image();s.image.src=s.src;}}
const canvasSky=SKY.getContext('2d');const stars=Array.from({length:105},(_,i)=>({x:rand(),y:rand()*.56,r:.3+rand()*.95,s:rand()*TAU}));
function drawSky(){let ctx=canvasSky,w=SKY.width,h=SKY.height;ctx.clearRect(0,0,w,h);let grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#141c35');grad.addColorStop(.40,'#46516e');grad.addColorStop(.68,'#b0a29a');grad.addColorStop(.81,'#3b5155');grad.addColorStop(1,'#182c34');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 for(let s of stars){ctx.fillStyle=`rgba(252,235,206,${.2+.55*s.r})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r*dpr,0,TAU);ctx.fill();}
 let hz=ctx.createRadialGradient(w*.72,h*.57,2,w*.72,h*.57,w*.31);hz.addColorStop(0,'#ffe1ad63');hz.addColorStop(1,'#d3ad9b00');ctx.fillStyle=hz;ctx.fillRect(0,0,w,h);
 for(let k=0;k<4;k++){ctx.fillStyle=['#69727b55','#555f7055','#515d6a55','#35465266'][k];ctx.beginPath();let y=h*(.67+.018*k);ctx.moveTo(0,h);ctx.lineTo(0,y);for(let x=0;x<=w+20;x+=21){ctx.lineTo(x,y+Math.sin(x/w*16+k*7)*7*dpr+Math.sin(x/w*45+k*2)*4*dpr);}ctx.lineTo(w,h);ctx.closePath();ctx.fill();}
}
function draw(t){if(cpuMode){drawCompatibility(t);return;}V=viewMat(player,yaw,pitch);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);
 gl.useProgram(sceneShader);gl.uniformMatrix4fv(SL.uV,false,V);gl.uniformMatrix4fv(SL.uP,false,P);gl.uniform3fv(SL.uEye,player);gl.uniform1f(SL.uT,t);
 gl.uniform1f(SL.uGhost,0);gl.bindVertexArray(opaqueMesh.vao);gl.drawArrays(gl.TRIANGLES,0,opaqueMesh.count);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);
 gl.uniform1f(SL.uGhost,1);gl.bindVertexArray(ghostMesh.vao);gl.drawArrays(gl.TRIANGLES,0,ghostMesh.count);
 gl.useProgram(spriteShader);gl.uniformMatrix4fv(BL.uV,false,V);gl.uniformMatrix4fv(BL.uP,false,P);gl.uniform1f(BL.uT,t);gl.uniform1i(BL.uTex,0);gl.bindVertexArray(spriteVAO);
 // Every sprite billboard faces the camera; only cropped UVs select the visible panel.
 gl.uniform3fv(BL.uRight,new Float32Array([Math.cos(yaw),0,-Math.sin(yaw)]));
 for(const [kind,s] of Object.entries(spriteDefs)){let nodeKey=kind==='aslan'?'lion':'bird',near=dist(player,nodes[nodeKey].p);s.panel=kind==='aslan'?(insight>=2?2:insight>0?1:0):(doubt>=2?2:near<11?1:0);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,s.texture);gl.uniform3fv(BL.uCenter,new Float32Array(s.pos));gl.uniform1f(BL.uW,s.width);gl.uniform1f(BL.uH,s.height);gl.uniform1f(BL.uPanel,s.panel);gl.drawArrays(gl.TRIANGLES,0,6);
 }
 gl.depthMask(true);gl.bindVertexArray(null);
}
// ------------ Optional Canvas compatibility projection (only without WebGL2) ------------
function drawCompatibility(t){
 const ctx=cpu;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 const forward=[-Math.sin(yaw),-Math.cos(yaw)],right=[Math.cos(yaw),-Math.sin(yaw)];
 const coord=(x,z,y=0)=>project([x,y,z]);
 const along=(a,b)=>[player[0]+forward[0]*a+right[0]*b,player[2]+forward[1]*a+right[1]*b];
 // A faceted but rigorously horizontal 3D ground plane, in camera-space bands.
 for(let layer=17;layer>=0;layer--){let d0=3+Math.pow(layer/18,1.45)*138,d1=3+Math.pow((layer+1)/18,1.45)*138;
   for(let k=-7;k<7;k++){let a=along(d0,k*15),b=along(d0,(k+1)*15),c=along(d1,(k+1)*15),d=along(d1,k*15),points=[a,b,c,d].map(v=>coord(v[0],v[1]));
    if(points.some(p=>!p))continue;if(points.every(p=>p.x< -80)||points.every(p=>p.x>width+80)||points.every(p=>p.y>height+75)||points.every(p=>p.y< -80))continue;ctx.beginPath();ctx.moveTo(clamp(points[0].x,-100,width+100),clamp(points[0].y,-50,height+60));for(let m=1;m<4;m++)ctx.lineTo(clamp(points[m].x,-100,width+100),clamp(points[m].y,-50,height+60));ctx.closePath();
    let tone=.25+.035*Math.sin(k*7.31+layer*4.93),shade=Math.floor(tone*255);ctx.fillStyle=`rgb(${Math.floor(shade*.87)},${shade},${Math.floor(shade*.97)})`;ctx.fill();}
 }
 // Physical path ribbons, independent of graph edge minute costs.
 for(const [a,b] of edgeList){let A=nodes[a].p,B=nodes[b].p,dir=[B[0]-A[0],B[2]-A[2]],l=Math.hypot(...dir),normal=[-dir[1]/l,dir[0]/l];let pp=[];
  for(let [p,sg] of [[A,-1],[B,-1],[B,1],[A,1]])pp.push(coord(p[0]+normal[0]*sg*.76,p[2]+normal[1]*sg*.76,.015));
  if(pp.every(Boolean)){ctx.beginPath();ctx.moveTo(pp[0].x,pp[0].y);pp.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.fillStyle='#989585a4';ctx.fill();}
 }
 // Depth sorted artist-friendly tree silhouettes: same species, stage, ghost state.
 const entries=[];
 for(const obj of foliageRegistry){let base=coord(obj.x,obj.z,.02);if(!base||base.depth>118||base.depth<.3||base.x< -330||base.x>width+330)continue;entries.push({z:base.depth,kind:'plant',obj,base});}
 for(const [kind,s] of Object.entries(spriteDefs)){let b=coord(s.pos[0],s.pos[2],0);if(b&&b.depth>0&&b.depth<118)entries.push({z:b.depth,kind,s,base:b});}
 entries.sort((a,b)=>b.z-a.z);
 const ghostFade=(obj,z)=>clamp(.49+.12*Math.sin(t*.8+obj.x*.15+obj.z*.22),.25,.68)*clamp((120-z)/85,.15,1);
 for(const entry of entries){let {obj,base,z}=entry;
 if(entry.kind!=='plant'){const s=spriteDefs[entry.kind],img=s.image;let panel=s.panel;
  const nodeKey=entry.kind==='aslan'?'lion':'bird',distance=dist(player,nodes[nodeKey].p);
  panel=entry.kind==='aslan'?(insight>=2?2:insight>0?1:0):(doubt>=2?2:distance<11?1:0);s.panel=panel;
  if(img&&img.complete&&img.naturalWidth){let heightPx=height/(2*Math.tan(68*Math.PI/360))*s.height/z,w=heightPx*s.width/s.height;ctx.globalAlpha=clamp((122-z)/38,.1,1);ctx.drawImage(img,panel*img.width/3,0,img.width/3,img.height,base.x-w/2,base.y-heightPx,w,heightPx);ctx.globalAlpha=1;}continue;}
 const type=TREE_FAMILIES.indexOf(obj.kind),stage=obj.stage??2,scale=[.34,.64,1][stage];let tone=Math.floor(165+14*Math.sin(obj.seed??obj.x)),opacity=ghostFade(obj,z);ctx.strokeStyle=`rgba(${tone},${tone},${tone},${opacity})`;ctx.fillStyle=`rgba(${tone},${tone},${tone},${opacity*.72})`;
 let h=(type>=0?[13,13.5,11.5,12,13][type]*scale:1.5);let top=coord(obj.x,obj.z,h);if(!top)continue;
 let H=Math.max(1,base.y-top.y),W=H*(type===0?.20:type===1?.65:type===2?.59:type===3?.48:.62);
 let x=base.x,by=base.y,ty=top.y;
 if(type>=0){ctx.lineWidth=Math.max(1,H*.035);ctx.beginPath();ctx.moveTo(x,by);ctx.lineTo(x+Math.sin(t*.7+obj.x)*H*.014,ty+H*.21);ctx.stroke();
  function blob(cx,cy,rx,ry,shade=0){ctx.fillStyle=`rgba(${clamp(tone+shade,80,232)},${clamp(tone+shade,80,232)},${clamp(tone+shade,80,232)},${opacity*.60})`;ctx.beginPath();for(let k=0;k<11;k++){let a=k*TAU/11,R=(k%3===0?1.17:.86);let p=[cx+Math.cos(a)*rx*R,cy+Math.sin(a)*ry*R];if(k===0)ctx.moveTo(...p);else ctx.lineTo(...p);}ctx.closePath();ctx.fill();}
  if(type===0){for(let k=0;k<5;k++)blob(x,ty+H*(.16+k*.12),W*(.22+k*.055),H*.18,10-k*3);}
  if(type===1){for(let k=0;k<6;k++){let a=k*TAU/6;blob(x+Math.cos(a)*W*.30,ty+H*(.07+Math.sin(a)*.04),W*.24,H*.10,k*4);}}
  if(type===2){blob(x,ty+H*.15,W*.52,H*.17,9);for(let k=0;k<13;k++){let a=k*TAU/13,xx=x+Math.cos(a)*W*.38,yy=ty+H*.16;ctx.beginPath();ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+Math.cos(a)*W*.11,yy+H*.27,xx+Math.cos(a)*W*.10,yy+H*.55);ctx.stroke();}}
  if(type===3){for(let k=0;k<7;k++){let a=k*2.399;blob(x+Math.cos(a)*W*.28,ty+H*(.18+Math.sin(a)*.13),W*.18,H*.15,(k%3-1)*10);}}
  if(type===4){for(let k=0;k<8;k++){let a=k*2.399;blob(x+Math.cos(a)*W*.28,ty+H*(.17+Math.sin(a)*.1),W*.25,H*.16,k%3*4);}}
 }else{for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(x+(k-1)*H*.14,by-H*.18,H*.23,H*.28,0,0,TAU);ctx.fill();}}}
 // The farewell frame sits to the south, behind the starting direction.
 const corners=[[ -2.3,0,18],[2.3,0,18],[2.3,6.5,18],[-2.3,6.5,18]].map(a=>project(a));
 if(corners.every(Boolean)){ctx.beginPath();ctx.moveTo(corners[0].x,corners[0].y);corners.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.strokeStyle='#d0c3d7';ctx.lineWidth=8;ctx.stroke();ctx.fillStyle='#8d80ab42';ctx.fill();}
 ctx.globalAlpha=1;
}

// ------------ navigation, world-projected UI, touch, dialogue ------------
const waypoints={};for(const id of Object.keys(nodes)){const btn=document.createElement('button');btn.type='button';btn.className='waypoint';btn.innerHTML='<span class="dot"></span><span class="caption"></span><span class="cost"></span>';HUD.appendChild(btn);waypoints[id]=btn;btn.addEventListener('click',()=>go(id));}
const names={};for(const [id,text] of [['lion','ASLAN'],['bird','TASH']]){const el=document.createElement('div');el.className='nameplate';el.innerHTML=`${text}<span>${id==='lion'?'A LISTENING PRESENCE':'THE SHADOW OF CERTAINTY'}</span>`;HUD.appendChild(el);names[id]=el;}
function refreshAnchors(){const placed=[];for(const [id,btn] of Object.entries(waypoints)){const n=nodes[id],available=!transit&&current!==id&&nodes[current].links.includes(id),p=project([n.p[0],.28,n.p[2]]);
 // Adjacent links only, genuinely in front and within safe viewport bounds.
 if(!available||!p||p.depth<1||p.depth>88||p.x<85||p.x>width-85||p.y<80||p.y>height-135){btn.hidden=true;continue;}
 // A screen in front of the node must obscure its HUD marker as well.
 const sc=project([0,2.82,.53]),sl=project([-4.85,2.82,.53]),sr=project([4.85,2.82,.53]);
 if(sc&&sl&&sr&&sc.depth>3.7&&sc.depth<28&&p.depth>sc.depth){
  const scale=clamp(Math.abs(sr.x-sl.x)/560,.24,1.55);
  if(Math.abs(p.x-sc.x)<290*scale+48&&Math.abs(p.y-sc.y)<160*scale+43){btn.hidden=true;continue;}
 }
 // Protect the chapter text and action controls from labels.
 if((p.x<Math.min(415,width*.33)&&p.y<410)||p.y>height-155){btn.hidden=true;continue;}
 btn.hidden=false;btn.style.left=p.x+'px';btn.style.top=p.y+'px';btn.querySelector('.caption').textContent=n.name;btn.querySelector('.cost').textContent=edgeCost(current,id)+' min';
 }
 // Closest reachable markers win when two world points project to one label area.
 const valid=Object.entries(waypoints).filter(([id,btn])=>!btn.hidden).sort((a,b)=>dist(player,nodes[a[0]].p)-dist(player,nodes[b[0]].p));
 for(const [id,btn] of valid){const x=parseFloat(btn.style.left),y=parseFloat(btn.style.top),w=Math.max(125,nodes[id].name.length*7),h=66;
  const area={x1:x-w/2-7,x2:x+w/2+7,y1:y-21,y2:y+h};
  if(placed.some(b=>area.x1<b.x2&&area.x2>b.x1&&area.y1<b.y2&&area.y2>b.y1))btn.hidden=true;
  else placed.push(area);
 }
 for(const [id,el] of Object.entries(names)){const s=spriteDefs[id==='lion'?'aslan':'tash'],p=project([s.pos[0],s.height+1.1,s.pos[2]]);if(!p||p.depth>85||p.x<0||p.x>width){el.hidden=true;}else{el.hidden=false;el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.opacity=clamp((90-p.depth)/75,.2,1);}}
 // Screen DOM is a real interactive web surface, not baked into the sprite pipeline.
 // Its world anchor is updated in the perspective projection, including distance scale.
 const c=project([0,2.82,.53]),l=project([-4.85,2.82,.53]),r=project([4.85,2.82,.53]);let s=$('worldScreen');if(!c||!l||!r||c.depth<3.7||c.depth>28||Math.abs(c.x-width/2)>width*.74){s.hidden=true;}
 else{s.hidden=false;let sc=clamp(Math.abs(r.x-l.x)/560,.24,1.55);s.style.left=c.x+'px';s.style.top=c.y+'px';s.style.transform=`translate(-50%,-50%) scale(${sc})`;s.style.opacity=clamp((c.depth-3.7)/2.2,0,1);s.style.pointerEvents=(sc>.54)?'auto':'none';}
}
function directedTarget(){let n=nodes[current],dir=nodes[current].links.map(id=>{let p=nodes[id].p,heading=Math.atan2(-(p[0]-player[0]),-(p[2]-player[2]));let error=Math.abs(Math.atan2(Math.sin(heading-yaw),Math.cos(heading-yaw)));return{id,error};}).sort((a,b)=>a.error-b.error);return dir[0]?.id;}
function go(id){if(transit||activeDialog||!nodes[current].links.includes(id))return false;let cost=edgeCost(current,id),start=[...player],end=[...nodes[id].p],duration=clamp(.80+Math.sqrt(cost)*.23,1.25,3.0);
 transit={from:current,to:id,cost,start,end,duration,progress:0,startClock:clockMin};$('travelBanner').classList.add('active');$('travelLabel').textContent=`${nodes[current].name}  →  ${nodes[id].name}`;$('travelElapsed').textContent=`0 / ${cost} MIN`;$('travelFill').style.width='0%';$('hintText').textContent='Travelling: the world clock advances with each locked step.';refreshUI();return true;}
function updateTransit(dt){if(!transit)return;let a=transit;let progress=clamp(a.progress+dt/a.duration,0,1),smooth=progress*progress*(3-2*progress),travelClock=progress<.5?2*progress*progress:1-2*(1-progress)*(1-progress);a.progress=progress;
 player=[lerp(a.start[0],a.end[0],smooth),lerp(a.start[1],a.end[1],smooth),lerp(a.start[2],a.end[2],smooth)];clockMin=a.startClock+a.cost*travelClock;$('clock').textContent=clockText();$('travelFill').style.width=progress*100+'%';$('travelElapsed').textContent=`${Math.floor(a.cost*travelClock)} / ${a.cost} MIN`;
 if(progress>=1){clockMin=a.startClock+a.cost;prior=a.from;current=a.to;player=[...a.end];transit=null;visits++;travelHistory.push({from:prior,to:current,cost:a.cost});$('travelBanner').classList.remove('active');$('hintText').textContent=nodes[current].kind==='aslan'?'Aslan waits here. Press E or INTERACT.':nodes[current].kind==='tash'?'Tash is near. Press E or INTERACT.':current==='gate'?'The departure portal is open behind you. Press E.':'Choose a new luminous waypoint; time has passed.';
 refreshUI();}}
function nearestInteractable(){if(transit)return null;let arr=[{key:'aslan',p:spriteDefs.aslan.pos,threshold:9},{key:'tash',p:spriteDefs.tash.pos,threshold:9},{key:'screen',p:[0,0,.53],threshold:11.5},{key:'portal',p:[0,0,18],threshold:4.9}].map(k=>({...k,d:Math.hypot(player[0]-k.p[0],player[2]-k.p[2])})).filter(o=>o.d<=o.threshold).sort((a,b)=>a.d-b.d);return arr[0]?.key||null;}
function interact(){if(transit||activeDialog)return;let what=nearestInteractable();if(!what)return;if(what==='portal')return exitWorld();if(what==='screen')return showScreen();return talk(what);}
function modal(html){activeDialog=true;$('modalBody').innerHTML=html;$('veil').hidden=false;}
function closeModal(){activeDialog=null;$('veil').hidden=true;}
$('closeModal').onclick=closeModal;$('veil').addEventListener('click',e=>{if(e.target===$('veil'))closeModal();});
function talk(kind,answer=''){const lion=kind==='aslan',s=spriteDefs[kind],name=lion?'Aslan':'Tash',caption=lion?'THE ETHICS OF ATTENTION':'THE POLITICS OF A NAME';
 const intro=lion?'A light too old to demand obedience settles on the meadow. The lion seems to be listening for a question you have not yet found.':'The air moves across four outstretched arms. Tash watches your hesitation as though uncertainty were a coin that might be spent.';
 const quotation=lion?'“Do not mistake the name you pronounce for the life you have learned to recognize.”':'“Two names are one, says the speaker who profits by binding them. Will you ask who gave him that authority?”';
 const answerOpts=lion?[['name','Does a shared name make two beings the same?'],['emeth','What of Emeth, the sincere Calormene?'],['tirian','Why does Tirian reject the equation?']]:[['speaker','Who gains when Aslan and Tash are fused?'],['face','Must fear always wear a borrowed face?'],['words','Can a word determine what is true?']];
 let response={name:'Plato’s Cratylus asks how a name comes to fit what it names. Here, ask a second question: what does this name permit its speaker to do? A bridge and a disguise can have exactly the same words.',emeth:'Emeth makes the easy categories difficult. The sincerity of his service complicates the tidy borders of the story. This is not Shift’s convenient equivalence; it is a more demanding moral paradox.',tirian:'Tirian hears the threat beneath Shift’s formula. The false unity conceals command and exploitation. And yet Emeth’s welcome complicates any answer that merely reverses the categories.',speaker:'Ask who speaks, who must obey, and who is forbidden to disagree. A forced equation can be a technology of rule.',face:'I would rather be questioned as myself than used as a mask for someone else’s commands.',words:'Wittgenstein turned attention toward the uses of words. Watch this language-game carefully: who may contradict the speaker, and what act of power follows the claimed definition?'};
 const banner=`<div class="characterLayout"><div class="portrait" style="background-image:url('${s.src}');background-position:${s.panel*50}% 50%"></div><div class="characterCopy"><span class="tinycaps">${caption} · PANEL ${s.panel+1} OF 3</span><h2>${name}</h2><p class="lead">${intro}</p><blockquote>${quotation}</blockquote>${answer?`<div class="answer">${response[answer]}</div>`:''}</div></div>`;
 modal(banner+`<div class="choices">${answerOpts.map(([k,title])=>`<button data-answer="${k}" data-who="${kind}">◇ ${title}</button>`).join('')}</div><p class="footnote">Original, transformative dialogue, not quotations from C. S. Lewis. The disputed equation comes from Shift in <i>The Last Battle</i>; this world invites scrutiny rather than presenting it as Lewis's own view.</p>`);
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{let k=b.dataset.answer;if(lion)insight=Math.min(3,insight+1);else doubt=Math.min(3,doubt+1);talk(kind,k);});
}
function showScreen(){modal(`<span class="tinycaps">IN-WORLD SCREEN · THE DEDICATION</span><h2>For C. S. Lewis and the Inklings</h2><p class="lead">Clive Staples Lewis (1898–1963) taught literature, imagined Narnia, and wrote about belief and doubt. At Oxford he belonged to the Inklings, a gathering of friends—including J. R. R. Tolkien—who read, disagreed, and encouraged one another’s stories.</p><p>To build an essay-world in this tradition is to welcome serious disagreement without extinguishing wonder.</p><div class="choices"><a class="modalAction" target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/C._S._Lewis">Read about C. S. Lewis on Wikipedia ↗</a><a class="modalAction" target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Inklings">Read about the Inklings on Wikipedia ↗</a></div>`);}
function exitWorld(){// Browsers normally refuse window.close() for a tab not opened by script.
 $('closed').hidden=false;try{window.close();}catch{} }
$('again').onclick=()=>{window.location.reload()};
function showHelp(){modal(`<span class="tinycaps">HOW TO READ THIS WORLD</span><h2>Movement is a proposition.</h2><p>Click a glowing waypoint or use ↑ to take the path most closely aligned with your gaze. Rotate using ←/→, drag the scene to look around, or press A/D. ↓ returns to your last adjacent node. Choose <strong>GRAPH</strong> to inspect the connected network.</p><p>Every connection has a <strong>fictional minute cost</strong>. During travel you are locked between nodes, although you may still look around. The clock advances concurrently with your visible 3D movement. The graph controls motion; the Cartesian field only displays it. Some physically similar journeys deliberately cost different amounts.</p><p>Approach Aslan or Tash and press <strong>E</strong> or <strong>INTERACT</strong>. Their single three-panel sprite sheets respond to distinct rules: Aslan to your questions; Tash to proximity and your skeptical challenges. The foliage is translucent and monochrome, with a shared wavering “ghost tone” shader. Each of the five tree families has fixed sapling, juvenile, and mature forms.</p><p>Behind the beginning is the one-way exit portal. The literary screen ahead has real links that open Wikipedia in new tabs.</p><p class="footnote">An unofficial original fan-work and literary experiment. No affiliation with Lewis's estate. No navigation or interaction data leaves this page.</p>`);}
function showMap(){let xs=Object.values(nodes).map(n=>n.p[0]),zs=Object.values(nodes).map(n=>n.p[2]),minX=Math.min(...xs)-9,maxX=Math.max(...xs)+9,minZ=Math.min(...zs)-8,maxZ=Math.max(...zs)+8;
 const x=v=>35+(v-minX)/(maxX-minX)*530,y=v=>22+(v-minZ)/(maxZ-minZ)*550;
 let edges=edgeList.map(([a,b])=>`<line class="edge ${a===current||b===current?'available':''}" x1="${x(nodes[a].p[0])}" y1="${y(nodes[a].p[2])}" x2="${x(nodes[b].p[0])}" y2="${y(nodes[b].p[2])}"/>`).join('');
 let dots=Object.entries(nodes).map(([id,n])=>{let avail=nodes[current].links.includes(id),classN=id===current?'current':avail?'available':'';return `<g class="mapNode ${classN}" data-target="${id}"><circle cx="${x(n.p[0])}" cy="${y(n.p[2])}" r="${id===current?9:7}"/><text x="${x(n.p[0])+12}" y="${y(n.p[2])-9}">${glyph(n.name)}${avail?' · '+edgeCost(current,id)+'m':''}</text></g>`}).join('');
 modal(`<span class="tinycaps">CARTESIAN POINTS · INDEPENDENT TOPOLOGICAL COSTS</span><h2>The field, as a graph</h2><p class="mapKey">Gold = immediately reachable. Lines indicate permission to travel, not merely physical proximity. Select a neighboring point to travel.</p><div class="mapWrap"><svg viewBox="0 0 600 600" role="img" aria-label="Interactive graph of Elisium nodes">${edges}${dots}</svg></div><p class="mapKey">Travel costs are weighted edge attributes. The field itself remains flat and Euclidean.</p>`);
 document.querySelectorAll('[data-target]').forEach(el=>el.addEventListener('click',()=>{let to=el.dataset.target;if(nodes[current].links.includes(to)){closeModal();go(to);}}));}
$('helpBtn').onclick=showHelp;$('mapBtn').onclick=showMap;$('interact').onclick=interact;
$('turnL').onclick=()=>{if(!activeDialog)yaw-=Math.PI/7};$('turnR').onclick=()=>{if(!activeDialog)yaw+=Math.PI/7};$('stepAhead').onclick=()=>go(directedTarget());$('stepBack').onclick=()=>{if(prior)go(prior)};
window.addEventListener('keydown',e=>{if(activeDialog){if(e.key==='Escape')closeModal();return;}if($('closed').hidden===false)return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','e','E','a','A','d','D','m','M'].includes(e.key))e.preventDefault();if(e.repeat&&['ArrowUp','ArrowDown','e','E',' '].includes(e.key))return;
 if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')go(directedTarget());else if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){if(prior)go(prior);}else if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')yaw-=Math.PI/8;else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')yaw+=Math.PI/8;else if(e.key==='e'||e.key==='E'||e.key===' ')interact();else if(e.key==='m'||e.key==='M')showMap();});
let pointer=null;C.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY};C.setPointerCapture(e.pointerId)});C.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||activeDialog)return;let dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;yaw-=dx*.0058;pitch=clamp(pitch-dy*.0045,-.75,.68);pointer.x=e.clientX;pointer.y=e.clientY;});C.addEventListener('pointerup',()=>{pointer=null});C.addEventListener('pointercancel',()=>{pointer=null});
// Explicit developer API supports deterministic inspection and regression tests.
window.ELISIUM={version:'0.1.0',nodes,edgeCost,edgeList,treeFamilies:TREE_FAMILIES,growthStages:GROWTH,foliageRegistry,sprites:spriteDefs,getState:()=>({current,prior,clockMin,visits,insight,doubt,transit:transit&&{...transit},yaw,pitch}),go,interact,showMap};
function frame(now){let dt=Math.min(.40,(now-last)/1000);last=now;updateTransit(dt);let secs=now/1000;draw(secs);refreshAnchors();$('interact').disabled=!!transit||!nearestInteractable();requestAnimationFrame(frame);}
resize();refreshUI();requestAnimationFrame(frame);
})();
