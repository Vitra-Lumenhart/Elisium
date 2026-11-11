'use strict';
/*
  WEBSPACE 0.6 / MEMORY PALACE EXPERIMENT
  Original browser-based renderer: WebGL2, no external libraries, no subscriptions.

  ART DNA — carry these seeds into every future art pass:
  01. Moonlight, self-conscious fairy-tale elegance, softly heroic silhouettes.
  02. An elfin, gender-bending wanderer's delightful not-Zelda sense of wonder.
  03. Intrigue from implication: ruins hint at a richly inhabited earlier century.
  04. Asymmetry is human; fine detail belongs to focal objects, not every rock.
  05. Château fantasy meets Persian astronomy, botanical cloisters and violet twilight.
  06. Texture should be a mathematical description whenever possible, not a bitmap.
  07. The portal is a link, not a wall: obvious enough for a child, strange enough for a myth.
  08. Interior floors are patterned craft; exterior floors are geological processes.
  09. A ruin is more romantic when the column breaks before the forest does.

  TECHNICAL INVARIANTS:
  - Fortress local floor plane X/Z, throne-room center at (0,0), Y=up.
  - Garden navigation is a four-station circular diamond; fountain only accessed from EAST.
  - Direction changes to graph edges determine the camera yaw on arrival; pitch is always 0.
  - Portal crossings NEVER transmit the node log. It remains local to this origin.
  - Portable portal visuals, GPU plumbing and safe outbound links live in webspace-portal.js.
  - External CAD assets: garden_fountain.glb + courtyard_chandelier.glb (editable STEP sources).
  - A Screen is a true iframe, visually projected into a room by webspace-screen.js.
  - A Screen is passive until the player explicitly requests remote content.
*/

(() => {
const Portal=window.WebspacePortal, Channel=window.WebspaceChannel, Screen=window.WebspaceScreen;
if(!Portal || !Channel || !Screen)throw Error('Load channel, portal, screen kits before webspace.js');
const $=id=>document.getElementById(id);
const canvas=$('view'), gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false});
const skyCanvas=$('sky'), sky=skyCanvas.getContext('2d');
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
if(!gl){window.WebspaceFallback?.launch();return;}

const worlds={
  fortress:{
    name:'Sandstone Fortress',sky:['#385877','#d4bd98','#b08b67'],start:'throne',style:'fortress',
    // The throne-room is the world authoring origin, (x,z)=(0,0).
    nodes:{
      throne:{label:'Throne room · origin',p:[0,1.72,0],yaw:0,desc:'The royal avenue leads forward. Beyond the throne, a previously overlooked arch opens into the private Gerudo banking passage.',links:['hall','royal_rear']},
      royal_rear:{label:'Behind the throne',p:[0,1.72,18],yaw:Math.PI,desc:'Gold sand drifts through a secret rear arch. A brass arrow names the newest foreign enterprise: Gringotts, Gerudo branch.',links:['throne','bank_gate']},
      bank_gate:{label:'Gerudo bank threshold',p:[0,1.72,30],yaw:Math.PI,desc:'A prismatic doorway is contracted to the Gringotts branch. Your journey does not travel with you.',links:['royal_rear'],portal:{world:'gringotts',node:'arrival',entryTag:'gringotts-gerudo'}},
      hall:{label:'Correspondents’ Den',p:[0,1.72,-22],yaw:0,desc:'A restrained podium sits on the throne-side left; turn around to see the monitors and rows of chairs facing the throne.',links:['throne','court']},
      court:{label:'Sky courtyard',p:[0,1.72,-33],yaw:0,desc:'An unlit Persian-French chandelier hangs in the open day sky, waiting for a future dramatic lighting cue.',links:['hall','crossroads']},
      crossroads:{label:'Four-way crossroads',p:[0,1.72,-43],yaw:0,desc:'A small crossing: the dungeon cell is left, an empty treasury alcove is right, and the arcaded passage continues ahead.',links:['court','cell','treasury','cloister']},
      cell:{label:'Dungeon cell',p:[-18.5,1.72,-43],yaw:Math.PI/2,desc:'A severe steel door is only a painted promise. The keyhole and chains are not yet functional.',links:['crossroads']},
      treasury:{label:'Treasury alcove',p:[19.6,1.72,-43],yaw:-Math.PI/2,desc:'An empty low pedestal waits for a chest; three niches await objects from another century.',links:['crossroads']},
      cloister:{label:'Arcaded passage',p:[0,1.72,-51],yaw:0,desc:'Light passes through deliberately patterned stone arches on the way to the portal.',links:['crossroads','gate']},
      gate:{label:'Fortress gate',p:[0,1.72,-66],yaw:0,desc:'The final arches lead to a single luminous threshold.',links:['cloister','portal']},
      portal:{label:'Portal chamber',p:[0,1.72,-75],yaw:0,desc:'The prismatic threshold opens into the Garden of Chuzhoy. Select the diamond portal icon to cross.',links:['gate'],portal:{world:'garden',node:'arrival',entryTag:'chuzhoy-north'}}
    }
  },
  gringotts:{
    name:'Gringotts · Gerudo Branch',sky:['#111c2d','#473d4b','#b08d5c'],start:'arrival',style:'bank',
    nodes:{
      arrival:{label:'Portico of the seal',p:[0,1.72,31],yaw:0,desc:'The portal seals behind you. Ahead: an impossible vaulted hall, an emerald-lit grand clock, and goblin tellers in tall brass cages.',links:['atrium'],portal:{world:'fortress',node:'bank_gate',entryTag:'fortress-bank-rear'}},
      atrium:{label:'Grand banking atrium',p:[0,1.72,13],yaw:0,desc:'A stone mosaic divides the banking floor into exchange, correspondence, and secure archives. The goblins dislike queues.',links:['arrival','tellers','calendar'],interact:'directory'},
      tellers:{label:'The goblin teller row',p:[0,1.72,-4],yaw:0,desc:'Behind ornate cage bars, three goblins motion you toward a contract, not a password box. The ledger here is a fictional demonstration.',links:['atrium','exchange','post','vault'],interact:'contract'},
      exchange:{label:'Coin and currency exchange',p:[-16,1.72,-20],yaw:-Math.PI/2,desc:'A celestial brass exchange board glitters above bowls of imaginary Aurics and silver crescents. No real assets exist in this prototype.',links:['tellers','vault'],interact:'ledger'},
      post:{label:'Encrypted correspondence gallery',p:[16,1.72,-20],yaw:Math.PI/2,desc:'Quills write the names of Proton services over luminous pigeonholes. Real services open only at their official websites.',links:['tellers','calendar','vault'],interact:'proton'},
      calendar:{label:'Chronomancer’s calendar',p:[16,1.72,10],yaw:Math.PI/2,desc:'An enchanted wall calendar turns its dates by itself. It is an artistic local calendar, not yet synced to Proton Calendar.',links:['atrium','post'],interact:'calendar'},
      vault:{label:'Underhall of private vaults',p:[0,1.72,-39],yaw:0,desc:'A rank of monumental bronze doors awaits a future audited vault service. For now these doors are an art installation.',links:['tellers','exchange','post','privacy'],interact:'vault'},
      privacy:{label:'The silent strongroom',p:[0,1.72,-57],yaw:0,desc:'A glass prism promises privacy only in the fairy tale. No private data, credentials, or real money are collected here.',links:['vault'],interact:'privacy'}
    }
  },
  garden:{
    name:'Garden of Chuzhoy',sky:['#0a1536','#213d5c','#3c5b60'],start:'south',style:'garden',
    nodes:{
      south:{label:'Southern landing',p:[0,1.72,21],yaw:0,desc:'An overgrown villa court. Through cloister and shrubbery, glimpses of the fountain, portal and Astrarium persist.',links:['east','west']},
      east:{label:'East rose walk',p:[21,1.72,0],yaw:Math.PI/2,desc:'The sole opening through the box hedges to the central fountain lies here.',links:['south','north','fountain']},
      north:{label:'Northern loggia',p:[0,1.72,-21],yaw:Math.PI,desc:'The violet prismatic portal stands just beyond the moonlit cloister.',links:['east','west','arrival']},
      arrival:{label:'Northern portal landing',p:[14,1.72,-27],yaw:Math.PI,desc:'You have stepped out of the northern portal. The moonlit garden opens ahead; the return threshold is behind you.',links:['north'],portal:{world:'fortress',node:'portal',entryTag:'fortress-gate'}},
      west:{label:'West Astrarium walk',p:[-21,1.72,0],yaw:-Math.PI/2,desc:'The Singing Astrarium moves slowly among blue-washed ruins and high, wind-bent trees.',links:['north','south']},
      fountain:{label:'Chuzhoy fountain · CAD',p:[5.6,1.72,0],yaw:Math.PI/2,desc:'A precise, external CAD fountain model: imported GLB geometry derived from editable STEP solids.',links:['east']}
    }
  }
};

// Stored graph is intentionally simple enough to publish as a federation manifest later.
const storageKey='webspace_v4_player';
const saved=(()=>{try{return JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem('webspace_v3_player'))}catch{return null}})();
// Portal landing protocol v0.2: public, named arrival TAGS, never coordinates or node IDs.
// A URL may request only one of these manifest-published entrances. Neither URL query
// strings nor cookies can set arbitrary camera positions, world IDs or view angles.
// A published tag is a route, NOT authentication of the visitor's claimed origin.
const PORTAL_ENTRIES=Object.freeze({
  'fortress-gate':Object.freeze({world:'fortress',node:'portal',yaw:Math.PI}),
  'chuzhoy-north':Object.freeze({world:'garden',node:'arrival',yaw:Math.PI}),
  'gringotts-gerudo':Object.freeze({world:'gringotts',node:'arrival',yaw:0}),
  'fortress-bank-rear':Object.freeze({world:'fortress',node:'bank_gate',yaw:0})
});
const entryHint=Portal.parseArrival(location.search,{validEntries:Object.keys(PORTAL_ENTRIES)});
const initialBank=document.documentElement.dataset.startWorld==='gringotts';
const fallback={world:initialBank?'gringotts':'fortress',node:initialBank?'arrival':'throne',yaw:0,pitch:0,history:[]};
// Restore history without silently restoring an old camera pose at the wrong entrance.
let state={...fallback,history:(saved&&Array.isArray(saved.history))?saved.history.slice(-300):[]};
if(entryHint){const landing=PORTAL_ENTRIES[entryHint];state.world=landing.world;state.node=landing.node;state.yaw=landing.yaw;}
let arrivedViaPortal=Boolean(entryHint);
let cameraP=[...worlds[state.world].nodes[state.node].p],yaw=state.yaw,pitch=state.pitch;
let width=1,height=1,dpr=1,anim=null,targets=[],pointer=null,drawerType='',loadedFountain=null,loadedChandelier=null,loadedChairs=null,loadingStatus='Preparing external CAD geometry…';
// This is a *separate* iframe projected into a front-facing world-space quad.
// A future CAD bend/curve may use several panels with individual homographies,
// or a WebGL texture for same-origin authored content. Foreign sites remain DOM.
const VNN_SCREEN={id:'vnn-wall',title:'Vitra News Network',url:'https://news.vitra.ams/',world:'fortress',
  corners:[[3.15,5.70,-8.45],[8.65,5.70,-8.45],[8.65,2.72,-8.45],[3.15,2.72,-8.45]]};
// Do not create a DOM iframe before the shader, geometry, and controls succeed.
// A failed WebGL initialization must NEVER leave a large iframe blocking the page.
let vnn={focus(){},hide(){},update(){}};
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}}
function node(){return worlds[state.world].nodes[state.node]}
function saveVisit(){state.history.push({world:state.world,node:state.node,time:new Date().toISOString()});state.history=state.history.slice(-300);persist()}
if(entryHint||!state.history.length)saveVisit();
function toast(s){const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2100)}

// --- Math and linear algebra (column-major, WebGL-friendly) ---
function viewMatrix(pos,theta,phi){
  const f=[-Math.sin(theta)*Math.cos(phi),Math.sin(phi),-Math.cos(theta)*Math.cos(phi)];
  const r=[Math.cos(theta),0,-Math.sin(theta)];
  const u=[Math.sin(theta)*Math.sin(phi),Math.cos(phi),Math.cos(theta)*Math.sin(phi)];
  return new Float32Array([r[0],u[0],-f[0],0, r[1],u[1],-f[1],0, r[2],u[2],-f[2],0,
    -(r[0]*pos[0]+r[1]*pos[1]+r[2]*pos[2]),-(u[0]*pos[0]+u[1]*pos[1]+u[2]*pos[2]),(f[0]*pos[0]+f[1]*pos[1]+f[2]*pos[2]),1]);
}
function projectionMatrix(aspect){const f=1/Math.tan((70*Math.PI/180)/2),near=.07,far=280;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function project(p){
  const dx=p[0]-cameraP[0],dy=p[1]-cameraP[1],dz=p[2]-cameraP[2];
  const right=dx*Math.cos(yaw)-dz*Math.sin(yaw);
  const horiz=-dx*Math.sin(yaw)-dz*Math.cos(yaw);
  const forward=horiz*Math.cos(pitch)+dy*Math.sin(pitch);
  const up=dy*Math.cos(pitch)-horiz*Math.sin(pitch);
  if(forward<=.09)return null;
  const focal=height/(2*Math.tan(70*Math.PI/360));
  return{x:width/2+focal*right/forward,y:height/2-focal*up/forward,depth:forward};
}
function distance(a,b){return Math.hypot(a[0]-b[0],a[2]-b[2])}
function heading(a,b){return Math.atan2(-(b[0]-a[0]),-(b[2]-a[2]))}
function shortenAngle(a,b){let d=(b-a+Math.PI)%TAU;if(d<0)d+=TAU;return a+d-Math.PI}

// --- WebGL shaders: procedural stone, marble, flora, water, and portal CRT/Fourier field ---
const VERT=`#version 300 es
precision highp float;
in vec3 aPos;in vec3 aNorm;in vec3 aColor;in vec2 aUV;
uniform mat4 uView;uniform mat4 uProj;
out vec3 vPos;out vec3 vNorm;out vec3 vColor;out vec2 vUV;
void main(){vPos=aPos;vNorm=aNorm;vColor=aColor;vUV=aUV;gl_Position=uProj*uView*vec4(aPos,1.0);}`;
const FRAG=`#version 300 es
precision highp float;
in vec3 vPos;in vec3 vNorm;in vec3 vColor;in vec2 vUV;
uniform float uTime;uniform int uMat;uniform vec3 uEye;out vec4 fragColor;
float hash21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}
float h3(vec3 p){return hash21(p.xy+p.z*vec2(5.23,8.41));}
void main(){
 vec3 base=vColor; vec3 N=normalize(vNorm);
 float light=.68+.32*abs(dot(N,normalize(vec3(.45,.89,.44))));
 if(uMat==1){ // A mathematical running-bond brick wall, independent of photographic textures.
   float course=vUV.y*2.52;
   float row=floor(course);
   float brickU=vUV.x/2.12+mod(row,2.0)*.5;
   vec2 seam=fract(vec2(brickU,course));
   float mortar=min(min(seam.x,1.0-seam.x)*2.12,min(seam.y,1.0-seam.y)*.77);
   float seamMix=1.0-smoothstep(.018,.060,mortar);
   float grain=hash21(floor(vec2(brickU,course))+vec2(7.0,3.0));
   float scratch=sin(vUV.x*21.7+vUV.y*1.3)*sin(vUV.y*25.0+vUV.x*.8);
   base *= .89+.22*grain+.027*scratch;
   base = mix(base,vec3(.25,.20,.18),seamMix*.46);
   // Fine relief stripe just under the mortar makes edges legible at a distance.
   light*=1.0-.055*seamMix;
 }
 if(uMat==2){ // Fantasy marble: near-continuous triaxial veining, no raster texture or UV seam.
   // Domain warping creates folds within folds, independent of how many polygons made a column.
   vec3 q=vPos*vec3(.80,.55,.84);
   float warp=sin(q.x*.94+sin(q.z*1.17+q.y*.30)*1.15)+.50*sin(q.z*1.91-q.y*.57);
   float stream=q.x*1.36+q.z*.61+q.y*.32+warp*2.15+sin(q.x*2.35+q.z*.57)*.62;
   float thin=pow(1.0-abs(sin(stream*2.80)),15.0);
   float curl=pow(1.0-abs(sin(stream*.94+.35*sin(q.z*3.8))),7.0);
   float billow=sin(stream*.56+q.z*.75)*sin(q.y*1.7+q.x*.6);
   vec3 pearl=mix(vec3(.74,.79,.79),vec3(.59,.72,.75),.5+.5*billow);
   pearl=mix(pearl,vec3(.37,.56,.65),clamp(thin*.46+curl*.27,0.0,.75));
   // A small warm tone catches the vein edges; marble is aged, not clinical white.
   pearl+=vec3(.045,.029,.011)*pow(clamp(sin(stream*3.5),0.0,1.0),10.0);
   base=mix(base,pearl,.82);
   vec3 cell=floor(vPos*vec3(14.0,13.0,14.0));
   vec3 microDelta=fract(vPos*vec3(14.0,13.0,14.0))-.5;
   float rng=h3(cell);
   float speck=step(.970,rng)*(1.0-smoothstep(.06,.26,length(microDelta)));
   float shimmer=.73+.27*sin(uTime*1.8+rng*30.0);
   base+=vec3(.18,.20,.17)*speck*shimmer;
   // Smooth microvariation breaks broad, synthetic white expanses cheaply.
   base+=.018*sin(dot(vPos,vec3(11.3,6.7,8.9)));
 }
 if(uMat==3){ // Foliage: canopy tonal complexity from positional cellular noise.
   float d=sin(vPos.x*3.1+vPos.y*1.7)*sin(vPos.z*4.3-vPos.y*1.9);
   base *= .88+.11*d+.09*hash21(floor(vPos.xz*4.0)+vPos.y*.4);
 }
 if(uMat==4){ // Gently rippling basin water, entirely mathematical.
   float rip=sin(length(vPos.xz)*12.0-uTime*2.7)+.34*sin(vPos.x*15.0+vPos.z*10.0+uTime*1.1);
   base=mix(base,vec3(.50,.77,.82),.3+.18*rip);
   light=1.0;
 }
 if(uMat==5){ // Blackened bronze/gilt supports gleam without heavy PBR textures.
   float etch=sin(vUV.x*16.0+vUV.y*12.0)*sin(vUV.y*20.0);
   base*=.85+.12*etch;
   light*=1.2;
 }
 // Six separate low-memory floor grammars. Nothing depends on a shared floor texture asset.
 if(uMat==6){ // FORTRESS 1: cross-grained timber parquet, normalized by measured board rows.
   vec2 p=vPos.xz*vec2(.77,.95);
   float band=floor(p.y);
   float shift=mod(band,2.0)*.50;
   vec2 b=fract(vec2(p.x*.45+shift,p.y));
   float joint=1.0-smoothstep(.012,.045,min(min(b.x,1.0-b.x),min(b.y,1.0-b.y)));
   float knot=sin(vPos.x*8.2+sin(vPos.z*.33)*2.1)*sin(vPos.z*2.1+vPos.x*.5);
   float grain=sin(vPos.x*29.0+sin(vPos.z*1.5)*1.8)*.025;
   base=vec3(.33,.235,.166)*(1.05+.11*knot+grain);
   base=mix(base,vec3(.12,.09,.08),joint*.44);
 }
 if(uMat==7){ // FORTRESS 2: woven center aisle runner, repetitive textile—not disguised marble.
   vec2 p=vPos.xz;float weave=sin(p.x*27.0)*sin(p.y*24.0);
   float diamond=abs(sin(p.x*1.28)+sin(p.y*1.28));
   float goldline=1.0-smoothstep(.10,.22,abs(diamond-.50));
   base=mix(vec3(.17,.22,.27),vec3(.30,.24,.27),goldline*.60)+weave*.024;
 }
 if(uMat==8){ // FORTRESS 3: stone inset threshold tiles, offset mortar and geometric stars.
   vec2 p=vPos.xz*.68;vec2 tile=floor(p);vec2 f=fract(p)-.5;
   float mortar=step(.46,max(abs(f.x),abs(f.y)));
   float inlay=pow(max(0.0,1.0-abs(abs(f.x)+abs(f.y)-.29)*19.0),2.0);
   float tint=hash21(tile);
   base=mix(vec3(.47,.39,.34),vec3(.59,.48,.34),tint*.7);
   base=mix(base,vec3(.75,.61,.40),inlay*.75);
   base=mix(base,vec3(.17,.17,.19),mortar*.45);
 }
 if(uMat==9){ // GARDEN 1 · COMBED LAWN: directional grass blades, clipped at an even height.
   // One stochastic blade cell + a low-frequency mowing stripe; no bitmap atlas.
   vec2 p=vPos.xz;
   vec2 cell=floor(p*vec2(12.0,18.0)); vec2 f=fract(p*vec2(12.0,18.0))-.5;
   float blade=exp(-abs(f.x+.16*sin(f.y*3.5))*18.0)*(1.0-smoothstep(.05,.5,abs(f.y)));
   float mowing=.5+.5*sin(p.x*.55+sin(p.y*.12)*.19);
   float litter=hash21(cell)*.12;
   base=mix(vec3(.18,.32,.22),vec3(.27,.43,.24),.38+.38*mowing);
   base+=vec3(.035,.072,.018)*blade*(.42+.58*hash21(cell)) + litter*.10;
 }
 if(uMat==10){ // GARDEN 2 · WELL-TRODDEN DIRT: broken mineral aggregates + damp shoe-worn ribbon.
   vec2 p=vPos.xz;
   vec2 cell=floor(p*11.0),f=fract(p*11.0)-.5;
   float grit=hash21(cell),pebble=1.0-smoothstep(.10,.35,length(f));
   float damp=.5+.5*sin(p.x*.49+sin(p.y*.66)*1.3)*sin(p.y*.35-p.x*.23);
   float scuff=sin(p.x*4.7+p.y*1.9)*sin(p.y*7.1-p.x*1.2);
   base=mix(vec3(.29,.235,.18),vec3(.43,.34,.235),.30+.55*damp);
   base+=vec3(.10,.088,.072)*pebble*step(.81,grit) + vec3(.02,.016,.008)*scuff;
 }
 if(uMat==11){ // GARDEN 3 · UNGROOMED MEADOW: clover islands, taller wild blades, tiny seed-heads.
   vec2 p=vPos.xz;
   float meadowPatch=.5+.5*sin(p.x*.21+sin(p.y*.39)*1.4)*cos(p.y*.26+sin(p.x*.33));
   vec2 cell=floor(p*vec2(8.5,13.4));vec2 f=fract(p*vec2(8.5,13.4))-.5;
   float stalk=(1.0-smoothstep(.015,.10,abs(f.x+.18*f.y)))*smoothstep(-.48,.1,f.y);
   float blossom=step(.975,hash21(cell))*(1.0-smoothstep(.08,.21,length(f-vec2(.0,.26))));
   base=mix(vec3(.12,.22,.17),vec3(.30,.39,.24),.22+.65*meadowPatch);
   base+=vec3(.012,.09,.012)*stalk*(.5+.5*hash21(cell));
   base+=blossom*vec3(.19,.15,.10);
 }
 float dist=length(uEye-vPos);
 float fog=smoothstep(68.0,200.0,dist)*.24;
 base=mix(base,vec3(.41,.49,.52),fog);
 fragColor=vec4(clamp(base*light,0.0,1.0),1.0);
}`;
// The portable portal module owns the GLSL. Host worlds MUST NOT fork the effect.
const PORTAL_VERT=Portal.vertexShader,PORTAL_FRAG=Portal.fragmentShader;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function program(v,f){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
let solidProgram,portalProgram;
try{solidProgram=program(VERT,FRAG);portalProgram=program(PORTAL_VERT,PORTAL_FRAG);}catch(e){$('status').textContent='GPU shader unavailable, switching to Canvas 2D';const old=$('view'),replacement=old.cloneNode(false);old.replaceWith(replacement);window.WebspaceFallback?.launch();return;}
function locs(p,portal=false){return {
  pos:gl.getAttribLocation(p,'aPos'),normal:portal?-1:gl.getAttribLocation(p,'aNorm'),color:portal?-1:gl.getAttribLocation(p,'aColor'),uv:gl.getAttribLocation(p,'aUV'),
  view:gl.getUniformLocation(p,'uView'),projection:gl.getUniformLocation(p,'uProj'),time:gl.getUniformLocation(p,'uTime'),mat:portal?null:gl.getUniformLocation(p,'uMat'),eye:portal?null:gl.getUniformLocation(p,'uEye'),layer:portal?gl.getUniformLocation(p,'uLayer'):null
};}
const SL=locs(solidProgram),PL=locs(portalProgram,true);
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);

// --- A geometry builder that shares one shader across widely different worlds. ---
// One immutable GPU mesh per world means huge apparent detail for very little CPU per frame.
function builder(){
 const batches=new Map();
 let localTransform=null;
 // Local XY architecture may be placed radially on the garden ring without
 // duplicating the arch generator or pre-baking bespoke art assets.
 function withRotation(cx,cz,phi,callback){
   const prev=localTransform;localTransform={cx,cz,c:Math.cos(phi),s:Math.sin(phi)};
   try{callback();}finally{localTransform=prev;}
 }
 function worldPoint(p){
   if(!localTransform)return p;
   const t=localTransform;return[t.cx+p[0]*t.c-p[2]*t.s,p[1],t.cz+p[0]*t.s+p[2]*t.c];
 }
 function group(mat){if(!batches.has(mat))batches.set(mat,[]);return batches.get(mat);}
 function emit(mat,a,b,c,color,uvA=[0,0],uvB=[0,0],uvC=[0,0]){
   a=worldPoint(a);b=worldPoint(b);c=worldPoint(c);
   const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
   let n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
   const l=Math.hypot(...n)||1;n=n.map(v=>v/l);
   const out=group(mat);for(const [p,uv] of [[a,uvA],[b,uvB],[c,uvC]])out.push(...p,...n,...color,...uv);
 }
 function quad(a,b,c,d,col,mat=0,uv){
   const u=uv||[[a[0],a[1]],[b[0],b[1]],[c[0],c[1]],[d[0],d[1]]];
   emit(mat,a,b,c,col,u[0],u[1],u[2]);emit(mat,a,c,d,col,u[0],u[2],u[3]);
 }
 function box(x,y,z,w,h,d,col,mat=0){
   let X=x-w/2,Z=z-d/2;
   const p=[ [X,y,Z],[X+w,y,Z],[X+w,y,Z+d],[X,y,Z+d], [X,y+h,Z],[X+w,y+h,Z],[X+w,y+h,Z+d],[X,y+h,Z+d]];
   // UV perimeter coordinate runs continuously around brickwork, including corners.
   const rect=(a,b,c,d,u0,u1,y0=y,y1=y+h)=>quad(p[a],p[b],p[c],p[d],col,mat,[[u0,y0],[u1,y0],[u1,y1],[u0,y1]]);
   rect(0,1,5,4,X,X+w);rect(1,2,6,5,X+w,X+w+d);rect(2,3,7,6,X+w+d,X+2*w+d);rect(3,0,4,7,X+2*w+d,X+2*w+2*d);
   quad(p[4],p[5],p[6],p[7],col,mat);
 }
 function disk(cx,y,cz,rad,n,col,mat=0){for(let i=0;i<n;i++){
   const a=TAU*i/n,b=TAU*(i+1)/n;emit(mat,[cx,y,cz],[cx+rad*Math.cos(a),y,cz+rad*Math.sin(a)],[cx+rad*Math.cos(b),y,cz+rad*Math.sin(b)],col);
 }}
 function cylinder(x,y,z,r,h,sides,col,mat=0){
   if(mat===2 && !localTransform){
     // Smooth per-vertex radial normals prevent polygon facets from slicing marble veins.
     // Trigonometric surface itself is still a real cylinder, not a warped bitmap.
     const arr=group(mat);const n=Math.max(24,sides);
     for(let i=0;i<n;i++){
       const a=i*TAU/n,b=(i+1)*TAU/n;
       const push=(t,yy)=>arr.push(x+r*Math.cos(t),yy,z+r*Math.sin(t),Math.cos(t),0,Math.sin(t),...col,t,yy);
       push(a,y);push(b,y);push(b,y+h);
       push(a,y);push(b,y+h);push(a,y+h);
     }
     disk(x,y+h,z,r,n,col,mat);
     return;
   }
   for(let i=0;i<sides;i++){
     const a=i*TAU/sides,b=(i+1)*TAU/sides;
     const q=[[x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],
       [x+r*Math.cos(b),y+h,z+r*Math.sin(b)],[x+r*Math.cos(a),y+h,z+r*Math.sin(a)]];
     quad(...q,col,mat,[[i/sides*TAU,y],[(i+1)/sides*TAU,y],[(i+1)/sides*TAU,y+h],[i/sides*TAU,y+h]]);
   }
   disk(x,y+h,z,r,sides,col,mat);
 }
 function ring(x,y,z,inner,outer,segments,col,mat=0){for(let i=0;i<segments;i++){
   const a=i*TAU/segments,b=(i+1)*TAU/segments;
   quad([x+inner*Math.cos(a),y,z+inner*Math.sin(a)],[x+outer*Math.cos(a),y,z+outer*Math.sin(a)],
     [x+outer*Math.cos(b),y,z+outer*Math.sin(b)],[x+inner*Math.cos(b),y,z+inner*Math.sin(b)],col,mat);
 }}
 function ellipsoid(x,y,z,rx,ry,rz,nlat,nlon,col,mat=3,phase=0){
   const point=(i,j)=>{
     const th=(i/nlat)*Math.PI,fi=(j/nlon)*TAU+phase;
     return [x+rx*Math.sin(th)*Math.cos(fi),y+ry*Math.cos(th),z+rz*Math.sin(th)*Math.sin(fi)];
   };
   for(let i=0;i<nlat;i++)for(let j=0;j<nlon;j++)quad(point(i,j),point(i,j+1),point(i+1,j+1),point(i+1,j),col,mat);
 }
 function cone(x,y,z,r,h,sides,col,mat=3,rTop=0){
   for(let i=0;i<sides;i++){
     let a=TAU*i/sides,b=TAU*(i+1)/sides;
     const p=[x+r*Math.cos(a),y,z+r*Math.sin(a)],q=[x+r*Math.cos(b),y,z+r*Math.sin(b)],
     q1=[x+rTop*Math.cos(b),y+h,z+rTop*Math.sin(b)],p1=[x+rTop*Math.cos(a),y+h,z+rTop*Math.sin(a)];quad(p,q,q1,p1,col,mat);
   }
 }
 function lineTube(a,b,r,col,mat=0,sides=5){
   const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz)||1;
   const ux=dx/len,uy=dy/len,uz=dz/len;let v=[-uz,0,ux],vl=Math.hypot(...v)||1;v=v.map(t=>t/vl);
   const w=[uy*v[2]-uz*v[1],uz*v[0]-ux*v[2],ux*v[1]-uy*v[0]];
   for(let i=0;i<sides;i++){
     const p=i*TAU/sides,q=(i+1)*TAU/sides;
     const cross=(center,theta)=>center.map((t,j)=>t+r*(v[j]*Math.cos(theta)+w[j]*Math.sin(theta)));
     quad(cross(a,p),cross(a,q),cross(b,q),cross(b,p),col,mat);
   }
 }
 function arch(x,y,z,span=14,opening=8,wallH=9,depth=1.5,col=[.70,.51,.36],style='fourCenter'){
   /*
    * REAL OPENING, NOT AN OVERLAID GABLE.
    * Webspace geometry contract:
    *  A (Garden): two-centered pointed circular arcs. Asymmetrical centers are
    *              mirrored to make a sharp crown, with a tall, rising profile.
    *  B (Fortress): FOUR centers; two smaller lower spring arcs meet two large
    *              upper arcs with C1 tangent continuity. The mirrored halves
    *              meet at an intentional pointed crown.
    *  The wall outside the arch and each wedge-shaped voussoir are separate,
    *  depth-bearing solids. The soffit is real geometry: no opaque slab across
    *  the doorway. Tiled wall material on spandrels, cut-stone on voussoirs.
    *  This generator can be reused at many scales from 1-2 stone profiles.
    */
   const a=opening/2,ringThickness=style==='pointed'?.68:.78;
   const archWallMaterial=style==='pointed'?2:1, archStoneMaterial=style==='pointed'?2:0;
   const base=style==='pointed'?y+1.58:y+3.45;
   const rise=style==='pointed'?Math.min(a*1.42,wallH-1.9):Math.min(4.45,wallH-4.35);
   const jamb=(span-opening)/2;
   // Outside piers align with the edges of the opening; no wall across opening.
   box(x-span/2+jamb/2,y,z,jamb,wallH,depth,col,archWallMaterial);
   box(x+span/2-jamb/2,y,z,jamb,wallH,depth,col,archWallMaterial);
   let leftHalf;
   if(style==='pointed'){
     // Left circular arc through (-a,0) and (0,rise), tangent vertically at spring.
     // Rise >= half-span makes this genuinely pointed with monotonic height.
     const c=(rise*rise-a*a)/(2*a),R=a+c;
     const crownAngle=Math.atan2(rise,-c);
     leftHalf=u=>{
       const theta=Math.PI+(crownAngle-Math.PI)*u;
       return[c+R*Math.cos(theta),R*Math.sin(theta)];
     };
   }else{
     // Derive the upper circle from endpoint + tangent at the lower-circle join.
     const r=.17*a,turn=1.1;
     const J=[-a+r*(1-Math.cos(turn)),r*Math.sin(turn)];
     const n=[-Math.cos(turn),Math.sin(turn)];
     const d=[-J[0],rise-J[1]];
     const scalar=(d[0]*d[0]+d[1]*d[1])/(2*(n[0]*d[0]+n[1]*d[1]));
     const C=[J[0]+n[0]*scalar,J[1]+n[1]*scalar],R=Math.abs(scalar);
     const from=Math.atan2(J[1]-C[1],J[0]-C[0]);
     const to=Math.atan2(rise-C[1],-C[0]);
     leftHalf=u=>{
       if(u<.19){const alpha=turn*u/.19;return[-a+r*(1-Math.cos(alpha)),r*Math.sin(alpha)];}
       const alpha=from+(to-from)*(u-.19)/.81;
       return[C[0]+R*Math.cos(alpha),C[1]+R*Math.sin(alpha)];
     };
   }
   const sample=t=>{
     let q=t<=.5?leftHalf(2*t):leftHalf(2*(1-t));
     return[t<=.5?q[0]:-q[0],base+q[1]];
   };
   const normal=t=>{
     const e=.0002,A=sample(Math.max(0,t-e)),B=sample(Math.min(1,t+e));
     const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1;
     return[-dy/l,dx/l];
   };
   const point=(t,offset,sideZ)=>{
     const q=sample(t),n=normal(t);
     return[x+q[0]+n[0]*offset,q[1]+n[1]*offset,z+sideZ];
   };
   // 28 wedge stones on the fortress arch, 24 on the garden's taller profile.
   const stones=style==='pointed'?24:28,segments=2;
   const faceFront=-depth/2-.018,faceBack=depth/2+.018;
   for(let i=0;i<stones;i++){
     const t0=i/stones,t1=(i+1)/stones;
     const tint=.965+.052*(Math.sin(i*27.73+span*3.14)*.5+.5);
     const stone=col.map((v,k)=>clamp(v*tint+(k===0?.055:.025),0,1));
     if(i===stones/2-1||i===stones/2)stone[0]=Math.min(.99,stone[0]+.08);
     for(let sub=0;sub<segments;sub++){
       const u=t0+(t1-t0)*sub/segments,v=t0+(t1-t0)*(sub+1)/segments;
       for(const side of [faceFront,faceBack]){
         // Radially-set front/back stone faces. Stone color variations, not running bond.
         quad(point(u,0,side),point(v,0,side),point(v,ringThickness,side),point(u,ringThickness,side),stone,archStoneMaterial);
       }
       // Curved soffit, outer ledge and two wall-spandrel surfaces at the same x positions.
       quad(point(u,0,faceFront),point(v,0,faceFront),point(v,0,faceBack),point(u,0,faceBack),stone,archStoneMaterial);
       quad(point(u,ringThickness,faceFront),point(v,ringThickness,faceFront),point(v,ringThickness,faceBack),point(u,ringThickness,faceBack),stone,archStoneMaterial);
       for(const side of [-depth/2,depth/2]){
         const A=point(u,ringThickness,side),B=point(v,ringThickness,side);
         // Cap above the ring; clipped out below its real curved silhouette.
         const T=[B[0],y+wallH,side],U=[A[0],y+wallH,side];
         quad(A,B,T,U,col,archWallMaterial,[[A[0],A[1]],[B[0],B[1]],[T[0],T[1]],[U[0],U[1]]]);
       }
     }
     // Mortar joint at each voussoir's actual depth, shadowed not a painted wedge.
     const cut=t0;
     if(i>0){
       quad(point(cut,.015,faceFront-.006),point(cut,ringThickness-.012,faceFront-.006),point(cut,ringThickness-.012,faceBack+.006),point(cut,.015,faceBack+.006),style==='pointed'?[.46,.56,.57]:[.34,.26,.20],archStoneMaterial);
     }
   }
   // Flat top cornice, above the masonry spandrel, deliberately NOT through the arch.
   box(x,y+wallH-.23,z,span,.23,depth+.22,style==='pointed'?[.68,.75,.75]:[.67,.49,.35],style==='pointed'?2:5);
 }
 function ruinedColumn(x,y,z,r,height,col,seed=0){
   // Column shaft is analytically cylindrical, but its *broken cap* is irregular.
   // The geometry is watertight without flat disk artifacts, and its shared world-
   // space marble field flows seamlessly into both curved shaft and fractured top.
   const n=32,ring=[],base=[];
   const top=(i)=>height+.27*Math.sin(i*1.61+seed)+.19*Math.sin(i*3.13+seed*1.9);
   for(let i=0;i<n;i++){
     const a=TAU*i/n;
     ring.push([x+r*Math.cos(a),y+top(i),z+r*Math.sin(a)]);
     base.push([x+r*Math.cos(a),y,z+r*Math.sin(a)]);
   }
   for(let i=0;i<n;i++){
     const j=(i+1)%n;
     quad(base[i],base[j],ring[j],ring[i],col,2);
     emit(2,[x,y+height-.22,z],ring[i],ring[j],col);
   }
   ringFn(x,y+.17,z,r*.94,r*1.16,24,col,2);
 }
 function ringFn(x,y,z,ri,ro,n,col,mat){ring(x,y,z,ri,ro,n,col,mat);}
 function hedgeBox(x,z,w,d,h=1.9){box(x,0,z,w,h,d,[.18,.35,.29],3);box(x,.15,z,w-.3,h-.55,d-.3,[.27,.43,.32],3);}
 function shrubRing(radius,startAngle,endAngle,segments,opening=false){
   for(let i=0;i<segments;i++){
     const a=startAngle+(endAngle-startAngle)*(i+.5)/segments;
     const x=radius*Math.cos(a),z=radius*Math.sin(a);
     // Entrances in an approximate circle: the East opening is the only fountain approach.
     if(opening && Math.abs(a)<.24) continue;
     ellipsoid(x,1.4,z,1.45,1.55,1.34,5,8,[.19+.04*(i%3),.35+.035*(i%2),.26],3,a);
   }
 }
 function roseBush(x,z,seed=1,size=1){
   /* ROSE BUSH v1: a tiny procedural wire sculpture, not a GLB dependency.
    * Pipewire branches follow bent polylines; alternating leaves have TWO silhouettes
    * (slender lancet and heart-ish leaflet); three rosebud complexities represent
    * unopened bud / five folded petals / ruffled mature flower.
    * Pseudorandomness is deterministic from seed: repeatable world builds.
    */
   let h=(seed*1664525+1013904223)>>>0;
   const random=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};
   const twig=[.21,.27,.17],leafA=[.20,.36,.22],leafB=[.29,.43,.27];
   const budColors=[[.69,.20,.28],[.76,.33,.38],[.86,.60,.52],[.45,.12,.27]];
   const stems=7+(seed%5);
   for(let s=0;s<stems;s++){
     const a=TAU*(s+.15*random())/stems,reach=(.52+random()*.72)*size;
     const height=(.77+random()*1.18)*size;
     const side=[Math.cos(a),Math.sin(a)];let last=[x,.13,z];
     for(let j=1;j<=6;j++){
       const t=j/6,wind=.11*size*Math.sin(seed*1.7+t*9+s*1.31);
       const next=[x+side[0]*(reach*t)+wind,.13+height*t,z+side[1]*reach*t-wind*.45];
       lineTube(last,next,.018*size*(1.16-.45*t),twig,3,4);
       // Flat leaves stick out to both sides of the stem. Two deliberately different shapes.
       if(j===2||j===4||j===5){
         const flip=((j+s)%2)?1:-1,leafLen=(.24+random()*.14)*size;
         const perp=[-side[1]*flip,side[0]*flip],p=[next[0],next[1]-.02*size,next[2]];
         const tip=[p[0]+perp[0]*leafLen,p[1]+leafLen*.17,p[2]+perp[1]*leafLen];
         const center=[p[0]+perp[0]*leafLen*.56,p[1]+leafLen*.09,p[2]+perp[1]*leafLen*.56];
         const thickness=.08*size;
         const q1=[center[0]+side[0]*thickness,center[1],center[2]+side[1]*thickness];
         const q2=[center[0]-side[0]*thickness,center[1],center[2]-side[1]*thickness];
         if((s+j)%2===0){ // lancet, sharp two-triangle leaf
           emit(3,p,q1,tip,leafA);emit(3,p,tip,q2,leafA);
         }else{ // notched heart-shaped leaflet formed from four separate facets
           const notch=[tip[0]-perp[0]*.08*size,tip[1]-.04*size,tip[2]-perp[1]*.08*size];
           const lobe1=[q1[0]+perp[0]*.09*size,q1[1]+.07*size,q1[2]+perp[1]*.09*size];
           const lobe2=[q2[0]+perp[0]*.09*size,q2[1]+.07*size,q2[2]+perp[1]*.09*size];
           emit(3,p,lobe1,notch,leafB);emit(3,p,notch,lobe2,leafB);
           emit(3,notch,lobe1,tip,leafA);emit(3,notch,tip,lobe2,leafA);
         }
       }
       last=next;
     }
     const col=budColors[(s+seed)%budColors.length],level=s%3;
     const [bx,by,bz]=last,rad=(level===0?.085:level===1?.11:.145)*size;
     ellipsoid(bx,by,bz,rad,rad*(1.2+level*.10),rad,3+level,6+level*2,col,3,s*.33);
     if(level>=1){
       for(let k=0;k<5+level*2;k++){
         const a=TAU*k/(5+level*2),r=rad*.74;
         const p0=[bx+Math.cos(a)*r,by-rad*.25,bz+Math.sin(a)*r];
         const p1=[bx+Math.cos(a+.31)*rad*1.50,by+rad*.26,bz+Math.sin(a+.31)*rad*1.50];
         const p2=[bx+Math.cos(a+.07)*rad*.18,by+rad*.84,bz+Math.sin(a+.07)*rad*.18];
         emit(3,p0,p1,p2,col.map(v=>Math.min(1,v*(.90+.16*(k%2)))));
       }
     }
     if(level===2){
       for(let k=0;k<8;k++){
         const a=TAU*(k+.3)/8;
         const p0=[bx+Math.cos(a)*rad*.8,by-rad*.12,bz+Math.sin(a)*rad*.8];
         const p1=[bx+Math.cos(a+.21)*rad*1.70,by+rad*.22,bz+Math.sin(a+.21)*rad*1.70];
         const p2=[bx+Math.cos(a+.05)*rad*.16,by+rad*.99,bz+Math.sin(a+.05)*rad*.16];
         emit(3,p0,p1,p2,col);
       }
     }
   }
 }
 function tree(x,z,scale,type,rotation=0){
   // Five silhouette families, all deterministic variants of a few formulas.
   const trunk=[.29,.24,.22],fol=[ [.17,.33,.25],[.27,.43,.29],[.22,.38,.35],[.36,.37,.20],[.40,.28,.22] ][type%5];
   if(type===0){ // Cypress / elegant spire
     cylinder(x,0,z,.40*scale,7*scale,7,trunk,0);
     cone(x,2.2*scale,z,2.7*scale,16.5*scale,9,fol,3,.09*scale);
     cone(x,8.3*scale,z,1.9*scale,8.9*scale,9,fol.map(v=>v*.86),3,.1*scale);
   } else if(type===1){ // Umbrella pine / tufted broad crown
     cylinder(x,0,z,.37*scale,11*scale,7,trunk);
     ellipsoid(x,11.3*scale,z,6.9*scale,2.6*scale,5.0*scale,5,9,fol,3,rotation);
     ellipsoid(x+2.2*scale,11.7*scale,z,3.0*scale,2.1*scale,3.9*scale,4,9,fol.map(v=>v*.89),3);
   } else if(type===2){ // Willow / cascades by explicit branch tubes
     cylinder(x,0,z,.52*scale,9.0*scale,7,trunk);
     ellipsoid(x,9.3*scale,z,4.4*scale,3.7*scale,4.2*scale,5,10,fol,3);
     for(let j=0;j<12;j++){
       const a=TAU*j/12+rotation,rr=3.7*scale;
       const X=x+rr*Math.cos(a),Z=z+rr*Math.sin(a);
       lineTube([x+Math.cos(a)*1.5*scale,9.5*scale,z+Math.sin(a)*1.5*scale],[X,5.4*scale+(j%3)*scale,Z],.09*scale,fol,3,3);
     }
   } else if(type===3){ // Pale birch / small pointillist clouds
     cylinder(x,0,z,.31*scale,10.3*scale,7,[.68,.67,.60]);
     for(let j=0;j<5;j++){
       const a=rotation+j*2.4, r=(1.6+(j%2)*1.5)*scale;
       ellipsoid(x+Math.cos(a)*r, (8.1+(j%3))*scale,z+Math.sin(a)*r,2.1*scale,3.0*scale,2.0*scale,4,8,fol.map(v=>clamp(v+(j%2)*.07,0,1)),3,a);
     }
   } else { // Autumn broadleaf / five displaced lobes
     cylinder(x,0,z,.53*scale,8.5*scale,9,trunk);
     for(let j=0;j<6;j++){
       const a=rotation+j*TAU/6,r=(j%2?2.8:3.5)*scale;
       ellipsoid(x+Math.cos(a)*r,(9.2+(j%3)*1.0)*scale,z+Math.sin(a)*r,3.4*scale,3.5*scale,3.2*scale,5,9,fol.map((v,k)=>clamp(v+(j%3-1)*.05,0,1)),3,a);
     }
   }
 }
 // Portal kit owns the frame geometry; no duplicate, divergent implementations.
 const emitPortalFrame=(x,z,w,h)=>Portal.frame({box,ellipsoid},{x,z,width:w,height:h});
 return{batches,emit,quad,box,disk,cylinder,ring,ellipsoid,cone,lineTube,arch,withRotation,ruinedColumn,hedgeBox,shrubRing,tree,roseBush,emitPortalFrame};
}

// --- Authored worlds, assembled entirely from equations and primitive solids. ---
const worldGpu={},portalGpu={};
function geometryFor(world){
 const b=builder();const portals=[];
 const sand=[.70,.50,.33],bright=[.78,.61,.40],bone=[.81,.76,.68],gilt=[.73,.57,.30],deep=[.18,.27,.31];
 if(world==='fortress'){
   // Fortress is a deliberate straight-line procession; the origin is the throne at XZ=(0,0).
   b.box(0,-.18,-35,29,.17,123,[.61,.46,.32],6);
   // Fortress floor set A/B/C: timber parquet, ceremonial textile, geometric stone.
   b.box(0,-.003,-35,4.3,.016,101,[.35,.26,.22],7);
   for(const z of [0,-15,-33,-51,-66,-75]){
     b.box(0,.007,z,15.2,.018,1.18,[.44,.39,.30],8);
   }
   // Continuous cylindrical pilasters and brick arches stage the repeated depth cues.
   for(const sign of [-1,1]){
     // Open 8-world-unit cross passages through *both* side walls at Z=-43.
     // Physical geometry is removed, not covered with black quads or decals.
     for(const [mid,len] of [[-8.5,61],[-67.5,41]]){
       b.box(sign*15,0,mid,2.5,8.9,len,sand,1);
       b.box(sign*13.5,0,mid,1.05,1.35,len,[.57,.37,.24],1);
     }
     for(let z=7;z>=-81;z-=9){
       if(z<-38.5&&z>-47.5)continue; // don't block the crossing
       b.box(sign*13.25,0,z,1.7,8.2,1.65,bright,1);
       b.box(sign*12.7,5.2,z,1.2,.30,2.5,gilt,5);
       b.box(sign*13.14,0,z,2,.38,2.0,[.62,.43,.29],5);
     }
   }
   for(const z of [-7,-25,-53,-61,-72]){
     b.arch(0,0,z,27,17.8,9.15,1.45,sand,'fourCenter');
     // Fine architectural relief above lintels—periodic but not a sprite texture.
     for(let i=-5;i<=5;i++)b.box(i*2.0,8.47,z,1.4,.37,1.82,(i%2)?gilt:[.65,.48,.32],5);
   }
   // The throne chamber is visually behind the camera at start; origin plaque faces forward.
   b.box(0,0,8.4,7.6,.8,4.4,[.62,.44,.31],1);
   b.box(0,.8,9.5,4.0,4.6,1.0,[.31,.28,.40],5);
   b.box(0,.82,7.4,3.8,1.4,3,[.58,.33,.39]);
   b.box(0,5.38,9.5,5.3,.48,1.7,gilt,5);
   for(const s of [-1,1]){
     b.cylinder(s*2.6,.8,9.4,.35,4.5,10,gilt,5);
     b.cone(s*2.6,4.9,9.4,.75,1.2,9,gilt,5);
   }
   b.box(0,-.02,0,3,.05,3,[.47,.38,.30],5);
   // Hidden Gerudo rear arcade: paved physical space rather than a menu-only shortcut.
   b.box(0,-.17,25,22,.18,29,[.53,.38,.29],8);
   b.box(0,.012,24,3.9,.03,25,[.40,.24,.29],7);
   for(const sign of [-1,1]){
     b.box(sign*11.1,0,27.5,1.4,9.0,25,[.65,.44,.30],1);
     for(const zz of [14,21,28,35]){
       b.cylinder(sign*9.0,.05,zz,.42,8.45,14,[.76,.56,.34],1);
       b.ring(sign*9,8.5,zz,.45,.76,16,gilt,5);
       b.box(sign*9,8.7,zz,1.4,.3,1.4,gilt,5);
     }
   }
   b.arch(0,0,16,19,12,10.2,1.15,[.77,.54,.36],'fourCenter');
   b.arch(0,0,32,19,12,10.2,1.15,[.74,.49,.30],'fourCenter');
   for(let i=0;i<7;i++){
     const zz=15+i*3.1;
     b.box(-5.5,.02,zz,.15,.035,1.0,gilt,5);
     b.box(5.5,.02,zz,.15,.035,1.0,gilt,5);
   }
   // The throne's main furniture stays in place; a discoverable procession skirts it.
   b.box(0,8.6,23,20,.65,20,[.40,.31,.33],5);
   b.ellipsoid(0,8.5,23,2.2,.38,2.2,5,10,[.89,.73,.33],5);
   portals.push(b.emitPortalFrame(0,38,7.4,8.2));
   // Hanging tapestries, warm gilt axes, and raised cheek stones.
   for(let j=0;j<10;j++){
     const z=3-j*8.0;
     for(const s of [-1,1]){
       b.box(s*13.1,4.3,z,0.14,3.1,2.6,(j%2)?[.40,.23,.32]:[.26,.42,.48]);
       b.box(s*13.0,7.55,z,.3,.24,2.9,gilt,5);
     }
   }
   // CORRESPONDENTS' DEN reverses its civic orientation toward the THRONE.
   // The speaker and media faces are now close to the throne-side end at z~-8,
   // and the podium is at negative X: on your left when spawning at (0,0).
   // Looking BACK from the hall reveals the whole tableau. The live VNN screen
   // remains the same hardened Webspace Screen object, merely re-positioned.
   const screenX=5.9,screenZ=-8.60;
   b.box(screenX,2.41,screenZ,6.25,3.66,.30,[.19,.17,.21],5);
   b.box(screenX,2.40,screenZ+.18,6.65,.26,.52,gilt,5);
   b.box(screenX,5.87,screenZ+.18,6.65,.26,.52,gilt,5);
   b.box(2.74,2.41,screenZ+.18,.28,3.78,.52,gilt,5);
   b.box(9.07,2.41,screenZ+.18,.28,3.78,.52,gilt,5);
   b.box(screenX,2.0,screenZ,3.6,.26,.52,[.33,.27,.29],5);
   // EMPTY central presentation screen: a simple black rectangle, no remote iframe.
   b.box(-1.5,1.05,-8.45,4.2,3.25,.24,[.12,.14,.18],5);
   b.box(-1.5,1.02,-8.24,4.52,.15,.47,gilt,5);
   b.box(-1.5,4.22,-8.24,4.52,.15,.47,gilt,5);
   for(const x of [-3.73,.73])b.box(x,1.05,-8.25,.14,3.3,.46,gilt,5);
   // Diminished lectern, arranged front-left relative to player at the throne.
   b.box(-6.7,.15,-7.5,1.0,1.38,.62,[.35,.27,.25],5);
   b.box(-6.7,1.50,-7.55,1.42,.12,.87,[.60,.43,.31],5);
   b.box(-6.7,.66,-7.16,.45,.23,.08,gilt,5);
   b.box(-6.7,.11,-7.55,1.38,.20,1.04,[.69,.54,.33],5);
   // Day-sky courtyard chandelier is a separate imported STEP/GLB CAD asset.
   // Its world center is X=0, Z=-33, physically suspended between stonework.
   for(const sign of [-1,1])b.lineTube([sign*11.7,9.0,-33],[0,10.25,-33],.025,[.66,.59,.48],5,4);
   b.box(0,-.06,-85,29,.06,13,sand,1);
   // The portal is framed by a final arch and its opening sits on the ground.
   // Portal frames stay unmistakably rectangular, without a competing over-arch.
   // The approach is framed by regular masonry buttresses instead.
   b.box(-9,0,-82.6,2.3,8.5,2.0,bright,1);
   b.box(9,0,-82.6,2.3,8.5,2.0,bright,1);
   portals.push(b.emitPortalFrame(0,-84.2,7.7,7.7));
   // FOUR-WAY INTERSECTION: modest wings are physically open onto the hallway.
   // Everything here is structural preview geometry: no armor, chest or relics yet.
   for(const side of [-1,1]){
     // Branch floor + enclosing masonry, centered at x=±23 and z=-43.
     b.box(side*23.1,-.15,-43,16.0,.16,13.2,[.56,.42,.30],8);
     b.box(side*23.0,0,-49.3,15.5,7.3,1.2,sand,1);
     b.box(side*23.0,0,-36.7,15.5,7.3,1.2,sand,1);
     b.box(side*30.2,0,-43,1.3,7.3,13.2,sand,1);
     b.box(side*23.0,7.2,-43,16.5,.65,13.5,bright,1);
     for(const z of [-48.0,-38.0])b.box(side*15.5,0,z,1.8,6.5,.45,bright,1);
   }
   // LEFT: theatrical steel door sprite—one almost-flat plate with modeled shadow,
   // nail heads, service slit and chained pitcher handle. Not an operable door.
   b.box(-29.45,.36,-43, .16,5.65,4.25,[.18,.21,.25],5);
   b.box(-29.55,.43,-43, .065,5.48,4.07,[.39,.45,.50],5);
   b.box(-29.65,3.43,-43,.07,.28,1.45,[.065,.077,.092],5);
   b.box(-29.69,3.30,-43,.09,.07,1.50,[.70,.76,.78],5);
   for(const y of [.85,2.1,3.4,4.9])for(const z of [-44.55,-41.45])
     b.ellipsoid(-29.68,y,z,.065,.065,.065,4,7,[.76,.77,.76],5);
   b.lineTube([-29.72,2.15,-42.7],[-29.85,2.6,-42.7],.084,[.65,.69,.72],5,8);
   b.lineTube([-29.85,2.6,-42.7],[-29.74,2.58,-43.34],.084,[.65,.69,.72],5,8);
   for(let j=0;j<7;j++){
     const t=j/6,p=[-29.75+.14*Math.sin(Math.PI*t),2.45-.65*Math.sin(Math.PI*t),-42.95-3.05*t];
     b.ellipsoid(...p,.105,.14,.085,4,8,[.56,.60,.63],5);
   }
   // RIGHT: three EMPTY framed wall coves and a short center pedestal.
   b.box(24.2,0,-43,2.7,.65,2.7,[.45,.40,.32],8);
   b.box(24.2,.65,-43,2.1,.18,2.1,[.73,.60,.40],5);
   for(const z of [-47.0,-43,-39.0]){
     b.box(29.46,1.18,z,.16,3.05,2.8,[.17,.16,.18],5);
     b.box(29.36,1.12,z-1.60,.42,3.20,.21,gilt,5);
     b.box(29.36,1.12,z+1.60,.42,3.20,.21,gilt,5);
     b.box(29.36,4.27,z,.45,.20,3.4,gilt,5);
     b.box(29.36,1.00,z,.50,.22,3.45,gilt,5);
   }
   // Ancient wall buttresses, with cellular mortar shader carrying most surface detail.
   for(let i=0;i<18;i++){
     const z=10-i*5.2;
     for(const s of [-1,1]) b.box(s*15.5,0,z,1.1,7.1,1.0,[.64+.012*(i%3),.45,.30],1);
   }
 }else if(world==='gringotts'){
   // Gringotts' Gerudo branch: lightweight mathematical splines, regular stonework,
   // gilded copper, no imported image textures and no remotely hosted assets.
   const stone=[.59,.54,.52],ivory=[.84,.78,.65],bronze=[.72,.52,.25],ink=[.11,.17,.20],jade=[.20,.62,.54];
   b.box(0,-.22,-11,58,.22,103,[.42,.37,.35],8);
   b.box(0,.005,-10,10,.025,87,[.24,.21,.28],7);
   b.box(0,.01,13,32,.027,21,[.56,.46,.40],2);
   // High columns frame a cathedral-sized hall; an open central view down the nave.
   for(const s of [-1,1]){
     b.box(s*28.4,0,-11,2.0,14,101,stone,1);
     for(let z=-52;z<=35;z+=11){
       b.cylinder(s*22.2,0,z,1.08,12.8,16,ivory,2);
       b.ring(s*22.2,12.9,z,1.10,1.6,18,bronze,5);
       b.box(s*22.2,13.0,z,3.4,.40,3.4,bronze,5);
       b.box(s*22.2,.03,z,2.9,.55,2.9,ivory,2);
     }
   }
   b.box(0,14,-10,57,1.0,99,[.31,.34,.41],2);
   for(let z=-50;z<=33;z+=11){
     b.arch(0,7,z,42,33,7.8,1.2,ivory,'pointed');
     for(const s of [-1,1]){
       b.lineTube([s*21.8,12.9,z],[s*5.0,17.3,z],.19,bronze,5,7);
     }
   }
   // Golden tessellated ceiling coffer lines, with crystalline pendant chandelier.
   for(let z=-50;z<=33;z+=5.5){
     b.box(0,14.9,z,45,.09,.21,bronze,5);
     for(const x of [-15,-8,0,8,15])b.ellipsoid(x,14.8,z,.25,.07,.25,4,7,[.91,.78,.42],5);
   }
   for(const [cx,cz] of [[0,6],[0,-31],[16,-14],[-16,-14]]){
     b.cylinder(cx,10.1,cz,.11,3.8,8,bronze,5);
     b.ellipsoid(cx,9.9,cz,1.15,.45,1.15,6,12,bronze,5);
     for(let k=0;k<9;k++){
       const a=k*TAU/9;
       b.lineTube([cx,9.7,cz],[cx+3.5*Math.cos(a),8.2,cz+3.5*Math.sin(a)],.075,bronze,5,5);
       b.ellipsoid(cx+3.5*Math.cos(a),8.2,cz+3.5*Math.sin(a),.40,.66,.4,5,8,[.90,.78,.45],5);
     }
   }
   // Portal departure surface uses unchanged shared GPU portal component.
   portals.push(b.emitPortalFrame(0,41,7.3,8.0));
   b.arch(0,0,40.1,18,10,10.3,1.3,ivory,'pointed');
   // Engraved coin inlay in the entrance and a bas-relief vault-seal disc.
   for(let i=0;i<26;i++){
     const a=i*TAU/26;
     b.lineTube([5.8*Math.cos(a),.045,16+5.8*Math.sin(a)],
       [5.8*Math.cos(a+.24),.045,16+5.8*Math.sin(a+.24)],.10,bronze,5,5);
   }
   b.ellipsoid(0,.08,16,.86,.05,.86,5,13,bronze,5);
   // TELLER COUNTER: three cages, modeled ear / nose / cap silhouettes.
   for(const x of [-12,0,12]){
     b.box(x,.2,-10,10.5,2.35,3,[.42,.28,.22],5);
     b.box(x,2.54,-9.9,10.5,.24,3.3,bronze,5);
     b.box(x,4.93,-9.9,10.7,.35,3.4,bronze,5);
     for(let i=0;i<8;i++){
       const px=x-4.6+i*1.32;
       b.cylinder(px,2.76,-8.45,.077,2.1,6,bronze,5);
     }
     b.ellipsoid(x,3.25,-11.3,.72,1.05,.70,6,10,[.38,.56,.44],3);
     b.ellipsoid(x,4.33,-11.1,.65,.65,.60,6,10,[.48,.66,.46],3);
     for(const s of [-1,1]){
       b.cone(x+s*.73,4.27,-11.12,.43,.62,6,[.49,.68,.48],3);
       b.ellipsoid(x+s*.24,4.45,-10.55,.13,.14,.09,5,8,[.94,.85,.52],5);
     }
     b.cone(x,4.12,-10.39,.24,.61,8,[.50,.67,.41],3);
     b.cone(x,4.73,-11.1,.78,.94,10,[.36,.31,.39],5,.18);
     b.box(x,5.66,-11.1,1.65,.18,1.55,bronze,5);
     // Paper contract held between gold quills; animation provided by HTML UI.
     b.box(x,2.8,-8.3,1.65,.026,1.25,[.88,.79,.59],2);
     b.lineTube([x+.75,2.9,-7.8],[x+1.14,4.1,-7.4],.075,[.95,.82,.43],5,6);
   }
   // Exchange chamber: brass balance and stacks of fictional coins on the west.
   b.box(-16,.0,-22,21,.15,19,[.51,.41,.33],8);
   b.box(-16,.1,-24,17,2.15,2.6,[.35,.29,.27],5);
   b.cylinder(-16,2.4,-24,.24,5.2,10,bronze,5);
   b.lineTube([-21,7.3,-24],[-11,7.3,-24],.22,bronze,5,9);
   for(const s of [-1,1]){
     const x=-16+s*5;
     for(const t of [-1,1])b.lineTube([x,7.3,-24],[x+s*t*.2,4.9,-24+t*.6],.045,ivory,5,5);
     b.disk(x,4.85,-24,1.48,20,bronze,5);
     for(let j=0;j<13;j++){
       const xp=x+2.5*Math.cos(j*2.39),zp=-19+1.4*Math.sin(j*1.3);
       b.cylinder(xp,2.3,zp,.37,.24+.16*(j%4),12,[.94,.71,.30],5);
     }
   }
   // Post gallery: rows of miniature letter slots plus emerald stained-glass panels.
   for(let k=0;k<7;k++)for(let j=0;j<4;j++){
     const x=11+k*1.9,z=-24+j*3.2;
     b.box(x,2.2,z,1.5,1.16,.24,[.23,.29,.36],5);
     b.box(x,3.35,z,1.5,.14,.28,bronze,5);
     b.box(x,2.83,z,1.37,.08,.3,[.64,.77,.76],5);
   }
   for(const zz of [-38,-29,-20,-11]){
     b.box(27.5,2.4,zz,.25,7.0,6.5,[.11,.43,.46],4);
     for(let i=0;i<6;i++)b.box(27.28,2.8+i,zz,.09,.06,6.6,bronze,5);
     for(let i=0;i<5;i++)b.box(27.27,3,zz-2.8+i*1.4,.09,6.3,.09,bronze,5);
   }
   // Calendar pavilion with a tall round clock, gear ring and twelve numerals marked in gold.
   b.box(16,0,9,20,.45,18,stone,2);
   b.box(25.6,.5,9,.8,10,16,ivory,2);
   b.cylinder(25.12,5.9,9,.40,1.2,16,bronze,5);
   for(let i=0;i<12;i++){
     const a=i*TAU/12;
     b.ellipsoid(24.7,6+3.3*Math.cos(a),9+3.3*Math.sin(a),.15,.21,.22,5,8,[.95,.76,.33],5);
   }
   b.lineTube([24.4,6,9],[24.15,7.6,10.2],.18,bronze,5,7);
   b.lineTube([24.3,6,9],[24.2,4.3,8.4],.10,[.36,.69,.57],5,7);
   // Vault arch, columns and heavy bronze safes in the terminal underhall.
   b.arch(0,0,-34,22,14,12.1,1.7,ivory,'pointed');
   b.box(0,.05,-59,38,.30,33,[.28,.29,.34],8);
   for(const s of [-1,1])for(let k=0;k<5;k++){
     const zz=-36-k*5.5,x=s*17.3;
     b.box(x,.4,zz,1.5,7.4,4.5,[.37,.36,.34],5);
     b.box(x-s*.3,1.3,zz,1.32,5.5,3.9,[.65,.49,.30],5);
     b.ring(x-s*.99,3.95,zz,.58,.81,24,ivory,5);
     b.cylinder(x-s*1.05,3.9,zz,.25,.12,12,[.29,.40,.44],5);
   }
   for(let r=0;r<3;r++){
     const z=-50-r*3.7;
     b.ring(0,.09,z,1.4+r*.45,1.51+r*.45,44,[.86,.68,.37],5);
   }
   b.box(0,.4,-66,14,8.7,1.8,[.31,.30,.35],5);
   for(let j=0;j<8;j++)b.ring(0,4.8,-64.92,j*.52+.8,j*.52+.9,28,bronze,5);
   b.ellipsoid(0,4.8,-64.6,1.25,1.25,.5,7,18,[.25,.80,.73],4);
 }else{
   // GARDEN OF CHUZHOY — no sidewalks, no shared indoor floor material.
   // Three independent image-free GPU grammars: wild grass 11 on the horizon,
   // closely kept turf 9 inside the cloister, and a thin trampled dirt path 10.
   b.box(0,-.14,0,152,.13,152,[.27,.38,.35],11);
   b.disk(0,.037,0,34.6,96,[.25,.42,.30],9);
   // The charming ring is genuinely curved soil, not a four-segment stone sidewalk.
   // Radial path is 1.7-2.2m wide, fading into the clover with shader dithering.
   for(let i=0;i<96;i++){
     const a=i*TAU/96,q=(i+1)*TAU/96,ra=21.0+.44*Math.sin(i*.29),rb=21.0+.44*Math.sin((i+1)*.29);
     const wa=1.03+.20*Math.sin(i*.51),wb=1.03+.20*Math.sin((i+1)*.51);
     b.quad([Math.cos(a)*(ra-wa),.066,Math.sin(a)*(ra-wa)],
            [Math.cos(a)*(ra+wa),.066,Math.sin(a)*(ra+wa)],
            [Math.cos(q)*(rb+wb),.066,Math.sin(q)*(rb+wb)],
            [Math.cos(q)*(rb-wb),.066,Math.sin(q)*(rb-wb)],
            [.51,.38,.26],10);
   }
   // A narrow worn footpath leaves the East rose walk and curls toward the CAD fountain.
   for(let j=0;j<20;j++){
     const t=j/20,u=(j+1)/20;
     const point=v=>[21.4-15.0*v, 1.0*Math.sin(Math.PI*v)*Math.sin(2.2*v)];
     const [x,z]=point(t),[X,Z]=point(u),w=.85+.16*Math.sin(j*.6),W=.85+.16*Math.sin((j+1)*.6);
     b.quad([x,.08,z-w],[x,.08,z+w],[X,.08,Z+W],[X,.08,Z-W],[.54,.40,.27],10);
   }
   const marble=[.76,.78,.75], faded=[.68,.73,.72];
   // Botanical baffle: the central fountain is discovered from the East only.
   for(let i=0;i<38;i++){
     const angle=i*TAU/38;
     if(Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<.27)continue;
     const x=14.0*Math.cos(angle),z=14.0*Math.sin(angle);
     b.ellipsoid(x,.83,z,.78,.99,.79,5,9,[.22+.04*(i%4),.38+.02*(i%3),.29],3,angle);
   }
   for(const [x,z] of [[-9,10],[-5,11],[-1.3,11.6],[3.2,11.1],[7.8,11]]){
     b.hedgeBox(x,z,2.3,.88,1.78);
   }
   // Four cardinal camera stations remain on a circle, but NO marble sidewalks.
   // Navigation logic is the graph; the physical path is the winding dirt ring above.

   // An imperfect, discontinuous cloister: 14 narrow pointed arches on a circular
   // perimeter, not one huge ceiling mesh. Passages frame the tall, distant trees.
   // Cardinal gaps / collapsed bays provide Narnian Charn-like silhouettes.
   const arcCount=14, radius=35.5, missing=new Set([2,5,9,12]);
   for(let i=0;i<arcCount;i++){
     const a=i*TAU/arcCount, cx=radius*Math.cos(a),cz=radius*Math.sin(a);
     const tangent=a+Math.PI/2;
     if(missing.has(i)){
       for(const sign of [-1,1]){
         const x=cx+Math.cos(tangent)*sign*4.5,z=cz+Math.sin(tangent)*sign*4.5;
         b.ruinedColumn(x,.10,z,.59,2.2+(i+sign+10)%4*1.15,marble,i*3+sign);
       }
       // A fallen spandrel fragment is a memory of the missing arch, not a wall.
       b.withRotation(cx,cz,tangent,()=>b.box(2.0,.10,0,4.1,.72,1.4,faded,2));
     }else{
       b.withRotation(cx,cz,tangent,()=>b.arch(0,.10,0,12.4,9.25,10.2,1.25,marble,'pointed'));
       for(const sign of [-1,1]){
         const x=cx+Math.cos(tangent)*sign*5.35,z=cz+Math.sin(tangent)*sign*5.35;
         b.cylinder(x,.1,z,.58,8.05,28,marble,2);
         b.ring(x,8.17,z,.59,.88,20,faded,2);
         b.box(x,0,z,1.6,.42,1.6,faded,2);
       }
     }
   }
   // Garden's northern loggia: repeated arches, no 23-unit-long low-poly arch roof.
   b.box(14,.01,-33,28,.095,9.5,[.48,.38,.27],10);
   for(const cx of [4.3,14,23.7]){
     if(cx===4.3){ // one bay collapsed, visible undercuts and free-standing stump
       b.ruinedColumn(0,.62,-32,.55,5.2,marble,33);
       b.ruinedColumn(8,.62,-32,.61,7.3,marble,12);
     }else{
       b.arch(cx,.62,-32,9.6,7.1,9.15,1.25,marble,'pointed');
       for(const sign of [-1,1])b.cylinder(cx+sign*4.27,.62,-32,.48,7.30,28,marble,2);
     }
   }
   // Retain formal rectangular portal shape, nested in the northern arcade.
   portals.push(b.emitPortalFrame(14,-34,7.2,7.8));
   b.quad([-1,.13,-19.1],[1.2,.13,-22.7],[13.6,.13,-34],[10.4,.13,-34],[.53,.40,.27],10);
   // Shattered cloister fragments jut into view at odd angles, but never form a
   // full enclosing curtain: forest is supposed to be the garden's horizon.
   for(const [x,z,h,seed] of [[-26,-12,5.8,3],[-26,11,4.3,4],[26,10,5.9,7],[-19,23,3.7,9],[-11,-25,4.8,11],[28,18,2.8,17]]){
     b.ruinedColumn(x,.08,z,.55,h,marble,seed);
     b.ring(x,.18,z,.68,.87,22,faded,2);
   }
   // Trees beyond the last masonry bay grow taller than the arch crown.
   // The core stays sky-open; mixed species create wildly different silhouettes.
   // Singing Astrarium: feature three, newly invented; the only mechanically animated garden landmark.
   // A ruined astronomy instrument capable of hearing the stars, geometry shared with a later CAD hero pipeline.
   const ax=-31,az=-11;
   b.box(ax,0,az,9,.9,9,[.67,.72,.71],2);
   for(const sx of [-1,1])for(const sz of [-1,1]){
     b.cylinder(ax+sx*3.1,.9,az+sz*3.1,.38,6.2,10,[.72,.78,.78],2);
     b.cone(ax+sx*3.1,7.1,az+sz*3.1,.68,1.0,8,gilt,5);
   }
   b.cylinder(ax,.9,az,.92,8.3,14,[.40,.42,.44],5);
   b.ellipsoid(ax,9.9,az,1.15,1.18,1.15,6,10,[.67,.57,.29],5);
   for(let k=0;k<3;k++){
     for(let i=0;i<64;i++){
       const t=TAU*i/64,v=TAU*(i+1)/64,R=(k===0?5.2:k===1?3.9:2.8);
       const pt=(ang)=>{
         const x=Math.cos(ang)*R,z=Math.sin(ang)*R;
         if(k===0)return[ax+x,10.1+z*.75,az+z*.35];
         if(k===1)return[ax+x*.42,10.1+z,az+x*.85];
         return[ax+x*.9,10.1+z*.25,az+z];
       };
       b.lineTube(pt(t),pt(v),.07,[.80,.67,.37],5,4);
     }
   }
   for(let i=0;i<6;i++){
     const a=TAU*i/6;b.ellipsoid(ax+Math.cos(a)*5.1,10+Math.sin(a)*2.8,az,.17,.17,.17,5,7,[.88,.90,.79],5);
   }
   // Five radically different silhouettes form a sky-clearing woodland perimeter.
   for(let i=0;i<56;i++){
     const angle=i*TAU/56+.13*Math.sin(i*1.93),r=53+5*Math.sin(i*2.31);
     const x=Math.cos(angle)*r,z=Math.sin(angle)*r;
     const kind=i%5,scale=1.64+.52*((i*13%19)/18);
     b.tree(x,z,scale,kind,i*.64);
   }
   // Sparse second ring adds silhouette parallax without duplicating any tree mesh files.
   for(let i=0;i<10;i++){
     const a=(i+.38)*TAU/10,r=72+4*Math.sin(i*1.6);
     b.tree(Math.cos(a)*r,Math.sin(a)*r,1.55+.25*(i%3), (i+2)%5, i*.41);
   }
   // Several winding, individually seeded rose thickets outside the eastern dirt walk;
   // not obstacles to our discrete-point path, and never a shared texture atlas.
   for(let i=0;i<17;i++){
     const z=-18.8 + i*2.35;
     const x=24.5+2.25*Math.sin(i*1.71)+(i%3)*.53;
     b.roseBush(x,z,81+i*17,.85+.24*(i%4));
   }
   // Sparse forest-floor stones and flower islands; seed art for later character-spawn scene.
   for(let i=0;i<39;i++){
     const a=i*2.4,r=29.8+(i%4)*2.7;
     b.ellipsoid(Math.cos(a)*r,.13,Math.sin(a)*r,1.0+.3*(i%3),.24,.7,3,7,i%3?[.52,.57,.54]:[.64,.64,.60],9);
   }
   // FOUNTAIN IS NOT BUILT HERE: it comes from garden_fountain.glb, a separate CAD export.
 }
 return {batches:b.batches,portals};
}

function createSolidGpu(data){
 const result=[];
 for(const [material,arr] of data.batches){
   const verts=new Float32Array(arr),vbo=gl.createBuffer(),vao=gl.createVertexArray();
   gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,verts,gl.STATIC_DRAW);
   const stride=11*4;
   for(const [idx,size,offset] of [[SL.pos,3,0],[SL.normal,3,3*4],[SL.color,3,6*4],[SL.uv,2,9*4]]){
     if(idx<0)continue;gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,size,gl.FLOAT,false,stride,offset);
   }
   gl.bindVertexArray(null);
   result.push({vao,vbo,count:verts.length/11,material});
 }
 return result;
}
// Portal mesh allocation also belongs to the portable kit.
const createPortalGpu=(surface)=>Portal.createMesh(gl,PL,surface);
for(const w of Object.keys(worlds)){
 const data=geometryFor(w);worldGpu[w]=createSolidGpu(data);portalGpu[w]=data.portals.map(createPortalGpu);
}

// --- External GLB loader. The hero fountain is never reconstructed from scene JavaScript. ---
function parseGLB(buffer){
 const dv=new DataView(buffer);
 if(dv.getUint32(0,true)!==0x46546c67)throw Error('Not a glTF binary (GLB)');
 if(dv.getUint32(4,true)!==2)throw Error('Expected glTF 2.0');
 let cursor=12,json=null,binBase=null;
 while(cursor<buffer.byteLength){
   const len=dv.getUint32(cursor,true),type=dv.getUint32(cursor+4,true);
   if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,cursor+8,len)));
   if(type===0x004e4942)binBase=cursor+8;
   cursor+=len+8;
 }
 if(!json||binBase===null)throw Error('Malformed GLB: missing JSON/BIN chunks');
 function readAccessor(idx){
   const a=json.accessors[idx],v=json.bufferViews[a.bufferView],size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
   const bp={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[a.componentType];
   const stride=v.byteStride||size*bp;
   const base=binBase+(v.byteOffset||0)+(a.byteOffset||0);
   const out=new Float32Array(a.count*size);
   for(let i=0;i<a.count;i++)for(let j=0;j<size;j++){
     const o=base+i*stride+j*bp;let value;
     switch(a.componentType){case 5120:value=dv.getInt8(o);break;case 5121:value=dv.getUint8(o);break;case 5122:value=dv.getInt16(o,true);break;case 5123:value=dv.getUint16(o,true);break;case 5125:value=dv.getUint32(o,true);break;case 5126:value=dv.getFloat32(o,true);break;default:throw Error('Unsupported accessor type');}
     if(a.normalized)value/=a.componentType===5121?255:a.componentType===5123?65535:1;
     out[i*size+j]=value;
   }
   return{data:out,size};
 }
 const packed=[];let triangles=0;
 for(const mesh of json.meshes){
   for(const prim of mesh.primitives){
     const positions=readAccessor(prim.attributes.POSITION).data;
     const n=positions.length/3;
     const idx=readAccessor(prim.indices).data;
     const col=prim.attributes.COLOR_0!==undefined?readAccessor(prim.attributes.COLOR_0).data:null;
     const normals=new Float32Array(positions.length);
     for(let j=0;j<idx.length;j+=3){
       const ia=idx[j]*3,ib=idx[j+1]*3,ic=idx[j+2]*3;
       const a=[positions[ia],positions[ia+1],positions[ia+2]],b=[positions[ib],positions[ib+1],positions[ib+2]],c=[positions[ic],positions[ic+1],positions[ic+2]];
       const u=b.map((t,k)=>t-a[k]),v=c.map((t,k)=>t-a[k]);
       const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
       for(const ix of [ia,ib,ic])for(let k=0;k<3;k++)normals[ix+k]+=normal[k];
     }
     for(let j=0;j<n;j++){
       let l=Math.hypot(normals[3*j],normals[3*j+1],normals[3*j+2])||1;
       for(let k=0;k<3;k++)normals[3*j+k]/=l;
     }
     for(let j=0;j<idx.length;j++){
       const ix=idx[j];
       const r=col?col[ix*4]:.85,g=col?col[ix*4+1]:.85,b=col?col[ix*4+2]:.85;
       packed.push(positions[ix*3],positions[ix*3+1],positions[ix*3+2],normals[ix*3],normals[ix*3+1],normals[ix*3+2],r,g,b,
         positions[ix*3],positions[ix*3+2]);
     }
     triangles+=idx.length/3;
   }
 }
 return{packed:new Float32Array(packed),triangles,parts:json.meshes.length};
}
function mountModel(buf,location=[0,0,0],scale=1){
 const raw=parseGLB(buf),vbo=gl.createBuffer(),vao=gl.createVertexArray();
 // Uniform scale preserves surface normals and source CAD file fidelity.
 for(let i=0;i<raw.packed.length;i+=11){raw.packed[i]=raw.packed[i]*scale+location[0];raw.packed[i+1]=raw.packed[i+1]*scale+location[1];raw.packed[i+2]=raw.packed[i+2]*scale+location[2];}
 gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,raw.packed,gl.STATIC_DRAW);
 for(const [idx,size,offset] of [[SL.pos,3,0],[SL.normal,3,12],[SL.color,3,24],[SL.uv,2,36]]){
   gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,size,gl.FLOAT,false,44,offset);
 }
 gl.bindVertexArray(null);
 return {vao,count:raw.packed.length/11,triangles:raw.triangles,parts:raw.parts};
}
function mountFountain(buf){
 loadedFountain=mountModel(buf,[0,0,0],1.33);
 $('status').textContent=`Fountain CAD · ${loadedFountain.triangles.toLocaleString()} triangles`;
}
function mountChandelier(buf){
 loadedChandelier=mountModel(buf,[0,5.0,-33]);
 $('status').textContent=`CAD chandelier · ${loadedChandelier.triangles.toLocaleString()} triangles · UNLIT`;
}
function mountChairs(buf){
  // Import ONCE, expand transformed vertices into one batched VBO. No per-chair draw call.
  // The CAD is 34 editable parts; all instances retain identical design and shading.
  const raw=parseGLB(buf),src=raw.packed,instances=[];
  for(const z of [-12.0,-15.5,-19.0])for(const x of [-8.8,-6.25,-3.65,3.65,6.25,8.8]){
    instances.push({x,y:0,z,angle:Math.PI+(x<0?-.055:.055)});
  }
  const packed=new Float32Array(src.length*instances.length);
  for(let j=0;j<instances.length;j++){
    const {x,y,z,angle}=instances[j],c=Math.cos(angle),s=Math.sin(angle);
    const offset=j*src.length;
    for(let i=0;i<src.length;i+=11){
      const X=src[i],Z=src[i+2],NX=src[i+3],NZ=src[i+5];
      const dst=offset+i;
      for(let k=0;k<11;k++)packed[dst+k]=src[i+k];
      packed[dst]=x+X*c-Z*s;packed[dst+1]=y+src[i+1];packed[dst+2]=z+X*s+Z*c;
      packed[dst+3]=NX*c-NZ*s;packed[dst+5]=NX*s+NZ*c;
      packed[dst+9]=packed[dst];packed[dst+10]=packed[dst+2];
    }
  }
  const vbo=gl.createBuffer(),vao=gl.createVertexArray();
  gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,packed,gl.STATIC_DRAW);
  for(const [idx,size,off] of [[SL.pos,3,0],[SL.normal,3,12],[SL.color,3,24],[SL.uv,2,36]]){
    gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,size,gl.FLOAT,false,44,off);
  }
  gl.bindVertexArray(null);
  loadedChairs={vao,vbo,count:packed.length/11,instances:instances.length,triangles:raw.triangles};
}
async function loadFountain(){
 try{
   if(location.protocol==='file:' || window.WEBSPACE_FOUNTAIN_GLB){
     // Browsers prohibit fetch(file://). A generated JS sidecar carries the *same GLB bytes*.
     // This makes an extracted ZIP double-clickable without a local server or a subscription.
     if(!window.WEBSPACE_FOUNTAIN_GLB){
       await new Promise((resolve,reject)=>{
         const tag=document.createElement('script');tag.src='garden_fountain_asset.js';tag.onload=resolve;tag.onerror=reject;document.head.appendChild(tag);
       });
     }
     const text=window.WEBSPACE_FOUNTAIN_GLB;
     if(!text)throw Error('Missing external model sidecar');
     const binary=atob(text),bytes=new Uint8Array(binary.length);
     for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
     mountFountain(bytes.buffer);
     delete window.WEBSPACE_FOUNTAIN_GLB;
   }else{
     const response=await fetch('./garden_fountain.glb');
     if(!response.ok)throw Error('HTTP '+response.status);
     mountFountain(await response.arrayBuffer());
   }
 }catch(err){
   loadingStatus='CAD model unavailable: '+(err&&err.message||String(err));
   $('status').textContent=loadingStatus;toast('Cannot load garden_fountain.glb. Keep the files together.');
   console.error(err);
 }
}
loadFountain();loadChandelier();loadChairs();

// --- Drawing, stars, environment landmarks, and player interface ---

async function loadChandelier(){
 try{
   if(location.protocol==='file:' || window.WEBSPACE_CHANDELIER_GLB){
     if(!window.WEBSPACE_CHANDELIER_GLB){
       await new Promise((resolve,reject)=>{
         const tag=document.createElement('script');tag.src='courtyard_chandelier_asset.js';tag.onload=resolve;tag.onerror=reject;document.head.appendChild(tag);
       });
     }
     const b64=window.WEBSPACE_CHANDELIER_GLB;
     if(!b64)throw Error('Missing chandelier sidecar');
     const decoded=atob(b64),bytes=new Uint8Array(decoded.length);
     for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);
     mountChandelier(bytes.buffer);
     delete window.WEBSPACE_CHANDELIER_GLB;
   }else{
     const response=await fetch('./courtyard_chandelier.glb');
     if(!response.ok)throw Error('HTTP '+response.status);
     mountChandelier(await response.arrayBuffer());
   }
 }catch(err){
   console.error('Courtyard CAD chandelier unavailable',err);
   $('status').textContent='Chandelier CAD unavailable · '+String(err.message||err);
 }
}

async function loadChairs(){
 try{
   if(location.protocol==='file:' || window.WEBSPACE_CHAIR_GLB){
     if(!window.WEBSPACE_CHAIR_GLB)await new Promise((resolve,reject)=>{
       const tag=document.createElement('script');tag.src='correspondents_chair_asset.js';tag.onload=resolve;tag.onerror=reject;document.head.appendChild(tag);
     });
     const base64=window.WEBSPACE_CHAIR_GLB,bin=atob(base64),bytes=new Uint8Array(bin.length);
     for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
     mountChairs(bytes.buffer);delete window.WEBSPACE_CHAIR_GLB;
   }else{
     const r=await fetch('./correspondents_chair.glb');if(!r.ok)throw Error('HTTP '+r.status);
     mountChairs(await r.arrayBuffer());
   }
 }catch(err){console.error('Chair CAD unavailable',err);toast('Correspondents chair CAD could not load.');}
}

const overlay=$('navOverlay'),over=overlay.getContext('2d');
let starfield=[];
function seedStars(){
 let v=1291;const rng=()=>((v=Math.imul(v,1664525)+1013904223|0)>>>0)/4294967296;
 starfield=Array.from({length:240},()=>({theta:rng()*TAU,pitch:.08+rng()*1.35,radius:.5+rng()*1.45,tw:rng()*TAU}));
}
seedStars();
function resize(){
 const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(window.devicePixelRatio||1,2);
 for(const c of [canvas,skyCanvas,overlay]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}
 sky.setTransform(dpr,0,0,dpr,0,0);over.setTransform(dpr,0,0,dpr,0,0);
 gl.viewport(0,0,canvas.width,canvas.height);
}
new ResizeObserver(resize).observe(canvas);resize();
// Navigation astronomy stays anchored in world-space (north = -Z, east = +X).
// Polaris: one bright anchor star close to the north celestial direction;
// Big Dipper: seven brighter points connected by subtle lines for legibility.
// These are an illustrative constellation, not an astronomical ephemeris.
const NAVIGATION_STARS=Object.freeze({
 polaris:[-.02,.77],
 dipper:[[-.74,.96],[-.60,.86],[-.42,.77],[-.24,.81],[-.29,1.04],[-.46,1.12],[-.60,1.02]]
});
function skyDirection(azimuth,altitude){
 return [-Math.sin(azimuth)*Math.cos(altitude),Math.sin(altitude),-Math.cos(azimuth)*Math.cos(altitude)];
}
function skyPoint(azimuth,altitude){
 const d=skyDirection(azimuth,altitude);
 return project([cameraP[0]+d[0]*210,cameraP[1]+d[1]*210,cameraP[2]+d[2]*210]);
}
function drawNavigationStars(){
 const pts=NAVIGATION_STARS.dipper.map(([az,alt])=>skyPoint(az,alt));
 sky.strokeStyle='rgba(213,228,252,.22)';sky.lineWidth=1.15;
 sky.beginPath();let started=false;
 for(const q of pts){
   if(!q){started=false;continue;}
   if(!started){sky.moveTo(q.x,q.y);started=true;}else sky.lineTo(q.x,q.y);
 }sky.stroke();
 for(const q of pts){
   if(!q||q.x<0||q.x>width||q.y<0||q.y>height)continue;
   sky.shadowBlur=10;sky.shadowColor='#d9e9ff';sky.fillStyle='rgba(247,250,255,.98)';
   sky.beginPath();sky.arc(q.x,q.y,2.75,0,TAU);sky.fill();sky.shadowBlur=0;
 }
 const pol=skyPoint(...NAVIGATION_STARS.polaris);
 if(pol&&pol.x>=6&&pol.x<=width-6&&pol.y>=5&&pol.y<=height-5){
   sky.shadowBlur=16;sky.shadowColor='#e5f2ff';sky.fillStyle='#ffffff';
   sky.beginPath();sky.arc(pol.x,pol.y,4.1,0,TAU);sky.fill();sky.shadowBlur=0;
   sky.textAlign='left';sky.font='11px system-ui';sky.fillStyle='rgba(233,244,255,.86)';
   sky.fillText('N · POLARIS',pol.x+11,pol.y-9);
 }
 // East and West are *directions of the same fixed sky*, not heads-up compass labels.
 for(const [az,label] of [[-Math.PI/2,'E · EAST'],[Math.PI/2,'W · WEST']]){
   const q=skyPoint(az,.17);
   if(q&&q.x>28&&q.x<width-28&&q.y>45&&q.y<height*.65){
     sky.fillStyle='rgba(209,221,240,.64)';sky.font='10px system-ui';
     sky.textAlign='center';sky.fillText(label,q.x,q.y);
   }
 }
}
function drawSky(t){
 const garden=state.world==='garden';
 sky.clearRect(0,0,width,height);
 const colors=worlds[state.world].sky;
 const g=sky.createLinearGradient(0,0,0,height);g.addColorStop(0,colors[0]);g.addColorStop(.56,colors[1]);g.addColorStop(1,colors[2]);
 sky.fillStyle=g;sky.fillRect(0,0,width,height);
 if(!garden)return;
 for(const st of starfield){
   const direction=[-Math.sin(st.theta)*Math.cos(st.pitch),Math.sin(st.pitch),-Math.cos(st.theta)*Math.cos(st.pitch)];
   const p=[cameraP[0]+direction[0]*200,cameraP[1]+direction[1]*200,cameraP[2]+direction[2]*200];
   const q=project(p);if(!q||q.x<-10||q.x>width+10||q.y<-10||q.y>height+10)continue;
   sky.beginPath();sky.arc(q.x,q.y,st.radius,0,TAU);
   sky.fillStyle=`rgba(231,235,247,${(.35+.25*Math.sin(t*.0007+st.tw)).toFixed(3)})`;
   sky.fill();
 }
 drawNavigationStars();
}
function drawSolid(w){
 gl.useProgram(solidProgram);
 gl.uniformMatrix4fv(SL.view,false,viewMatrix(cameraP,yaw,pitch));
 gl.uniformMatrix4fv(SL.projection,false,projectionMatrix(width/height));
 gl.uniform3fv(SL.eye,cameraP);
 gl.uniform1f(SL.time,performance.now()/1000);
 for(const batch of worldGpu[w]){
   gl.uniform1i(SL.mat,batch.material);gl.bindVertexArray(batch.vao);
   gl.drawArrays(gl.TRIANGLES,0,batch.count);
 }
 if(w==='garden'&&loadedFountain){
   gl.uniform1i(SL.mat,0);gl.bindVertexArray(loadedFountain.vao);
   gl.drawArrays(gl.TRIANGLES,0,loadedFountain.count);
 }
 if(w==='fortress'&&loadedChandelier){
   gl.uniform1i(SL.mat,0);gl.bindVertexArray(loadedChandelier.vao);
   gl.drawArrays(gl.TRIANGLES,0,loadedChandelier.count);
 }
 if(w==='fortress'&&loadedChairs){
   gl.uniform1i(SL.mat,0);gl.bindVertexArray(loadedChairs.vao);
   gl.drawArrays(gl.TRIANGLES,0,loadedChairs.count);
 }
 gl.bindVertexArray(null);
}
function drawPortal(time){
  // One stable call site for all worlds. Other authors can reuse the same kit.
  Portal.draw(gl,{program:portalProgram,locations:PL,surfaces:portalGpu[state.world],
    view:viewMatrix(cameraP,yaw,pitch),projection:projectionMatrix(width/height),time:time/1000});
}
function drawMarkers(t){
 over.clearRect(0,0,width,height);targets=[];
 const w=worlds[state.world],n=node();
 const items=n.links.map(id=>({id,label:w.nodes[id].label,p:w.nodes[id].p}));
 if(state.world==='fortress'&&state.node==='hall')items.push({screen:true,label:'Inspect VNN Screen',p:[5.9,4.3,-25.45]});
 if(n.interact)items.push({interact:true,label:'Inspect '+n.label,p:[n.p[0]+1.5,n.p[1]+2.8,n.p[2]-3.6]});
 if(n.portal)items.push({portal:true,world:n.portal.world,id:n.portal.node,label:'ENTER '+worlds[n.portal.world].name,p:state.world==='fortress'?[0,3.7,-84]:[14,4.4,-34]});
 // Nearby viewpoint nodes only; landmark compass stays visible and doesn't pretend teleporting is arbitrary.
 for(const item of items){
   const anchor=item.portal?item.p:[item.p[0],item.p[1]+.75,item.p[2]];
   const p=project(anchor);
   if(!p||p.x<20||p.x>width-20||p.y<40||p.y>height-42)continue;
   const portal=item.portal,r=portal?26:item.screen?23:item.interact?21:19;
   targets.push({...item,x:p.x,y:p.y,r});
   const beat=portal?1+.07*Math.sin(t*.004):1;
   over.shadowBlur=portal?24:10;over.shadowColor=portal?'#ba6aff':item.screen||item.interact?'#81cfe6':'#d4ab68';
   over.beginPath();over.arc(p.x,p.y,(r+3)*beat,0,TAU);
   over.fillStyle=portal?'rgba(60,29,98,.90)':item.screen||item.interact?'rgba(25,73,95,.94)':'rgba(24,47,54,.89)';over.fill();
   over.lineWidth=portal?3:2;over.strokeStyle=portal?'#d1a7fa':item.screen||item.interact?'#a6edfc':'#f7dca9';over.stroke();
   over.shadowBlur=0;over.textAlign='center';over.textBaseline='middle';over.fillStyle='#f9fbff';over.font=portal?'bold 25px system-ui':'bold 20px system-ui';
   over.fillText(portal?'◈':item.screen||item.interact?'▣':'↑',p.x,p.y);
   const label=item.label;over.font='12px system-ui';const tw=over.measureText(label).width;
   const rectX=clamp(p.x-tw/2-11,4,Math.max(4,width-tw-26));
   // Legible, full labels are persistent in #travelRibbon (not clipped here).
   if(portal||item.interact){over.fillStyle='rgba(9,25,35,.84)';over.fillRect(rectX,p.y+r+9,tw+22,23);over.fillStyle='#e6cbff';over.textAlign='left';over.fillText(label,rectX+11,p.y+r+20);}
 }
 // Subtle location-independent crosshair.
 over.textAlign='center';over.textBaseline='middle';over.font='14px system-ui';over.fillStyle='rgba(245,248,255,.55)';over.fillText('＋',width/2,height/2);
}
function showPortalControl(){
 const n=node(),b=$('portalAction');
 if(n.portal){b.classList.add('visible');b.textContent='◈ Enter '+worlds[n.portal.world].name;}
 else b.classList.remove('visible');
}
function refresh(){
 const w=worlds[state.world],n=node();
 $('world').textContent=w.name;$('place').textContent=n.label;$('description').textContent=n.desc;
 showPortalControl();$('screenAction').classList.toggle('visible',state.world==='fortress'&&state.node==='hall');renderTravelRibbon();persist();if(drawerType)openDrawer(drawerType);
}
function renderTravelRibbon(){
 const ribbon=$('travelRibbon');if(!ribbon)return;
 ribbon.replaceChildren();const n=node(),w=worlds[state.world];
 const add=(text,fn,kind='walk')=>{
   const button=document.createElement('button');button.type='button';button.className='ribbon-item '+kind;button.textContent=text;button.addEventListener('click',fn);ribbon.append(button);
 };
 for(const id of n.links)add('↗ '+w.nodes[id].label,()=>go(id),'walk');
 if(n.portal)add('◈ Enter '+worlds[n.portal.world].name,activateCurrentPortal,'portal');
 if(state.world==='fortress'&&state.node==='hall')add('▣ VNN screen',()=>vnn.focus(),'screen');
 if(n.interact)add('✧ '+({directory:'Branch directory',contract:'Sign guest contract',ledger:'View mock ledger',proton:'Proton services',calendar:'Open wall calendar',vault:'Inspect vault doors',privacy:'Privacy charter'}[n.interact]||'Inspect'),()=>openBankDesk(n.interact),'screen');
}
function openBankDesk(route){
 if(!window.WebspaceBankDesk)return toast('Bank desk currently unavailable');
 window.WebspaceBankDesk.open(route);
}
function go(id,world=state.world){
 if(anim||portalTransition||!worlds[world]?.nodes[id])return;
 arrivedViaPortal=false;
 const from=cameraP.slice(),dest=worlds[world].nodes[id].p,changing=world!==state.world;
 const endYaw=changing?worlds[world].nodes[id].yaw:heading(from,dest);
 const route=shortenAngle(yaw,endYaw);
 anim={from,to:dest.slice(),world,id,start:performance.now(),duration:changing?900:680,yawFrom:yaw,yawTo:route,pitchFrom:pitch,changing};
 if(changing)toast('Crossing a Webspace threshold…');
}
function finish(a){
 state.world=a.world;state.node=a.id;cameraP=a.to.slice();yaw=a.yawTo;pitch=0;
 state.yaw=yaw;state.pitch=0;anim=null;arrivedViaPortal=false;saveVisit();refresh();
 if(a.changing)toast('Welcome to '+worlds[state.world].name);
}
function step(forward){
 const n=node();
 if(portalTransition)return;
 // On arrival, Up walks *away* from the portal into the destination world.
 // On approach from within a world, Up traverses the portal as before.
 if(forward&&n.portal&&!arrivedViaPortal){activateCurrentPortal();return;}
 if(forward){
   // A crossroads is not a listicle: keypad Up continues the PROCESSION.
   // Side rooms are discovered by turning and selecting their spatial markers.
   if(state.world==='fortress'&&state.node==='crossroads'){go('cloister');return;}
   const candidates=n.links.filter(id=>id!==previousNode());
   if(candidates.length)go(candidates[0]);else if(n.links.length)go(n.links[0]);
 }else{
   const prev=previousNode();if(prev&&n.links.includes(prev))go(prev);
   else if(n.links.length)go(n.links[n.links.length-1]);
 }
}
function previousNode(){const h=state.history;for(let i=h.length-2;i>=0;i--){if(h[i].world===state.world&&h[i].node!==state.node)return h[i].node;}return null;}
function rotate(d){yaw+=d;state.yaw=yaw;persist();}
function tilt(d){pitch=clamp(pitch+d,-.72,1.18);state.pitch=pitch;persist();}
function clickTarget(x,y){
 for(const item of [...targets].reverse())if(Math.hypot(x-item.x,y-item.y)<=item.r+11){if(item.portal)activateCurrentPortal();else if(item.screen)vnn.focus();else if(item.interact)openBankDesk(node().interact);else go(item.id,item.world||state.world);return true;}
 return false;
}
canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
 if(!pointer)return;
 const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
 if(Math.hypot(e.clientX-pointer.originX,e.clientY-pointer.originY)>7)pointer.moved=true;
 if(pointer.moved&&!anim){
   // Opposite direction from the earlier prototype, per observed player preference.
   rotate(dx*.0055);tilt(-dy*.005);
 }
 pointer.x=e.clientX;pointer.y=e.clientY;
});
canvas.addEventListener('pointerup',e=>{if(pointer&&!pointer.moved){const r=canvas.getBoundingClientRect();clickTarget(e.clientX-r.left,e.clientY-r.top);}pointer=null;});
$('turnLeft').onclick=()=>rotate(Math.PI/7);$('turnRight').onclick=()=>rotate(-Math.PI/7);
$('back').onclick=()=>step(false);$('forward').onclick=()=>step(true);
let portalTransition=false;
function landAtPortalTag(world,tag){
 const anchor=PORTAL_ENTRIES[tag];
 if(!anchor||anchor.world!==world||!worlds[anchor.world]?.nodes[anchor.node])throw Error('Unpublished portal entry');
 // Do not fly between unrelated coordinate systems or rotate via the origin.
 // Cut once, *after* the screen-space wiggle, facing away from arrival portal.
 anim=null;state.world=anchor.world;state.node=anchor.node;arrivedViaPortal=true;
 cameraP=worlds[anchor.world].nodes[anchor.node].p.slice();
 yaw=anchor.yaw;pitch=0;state.yaw=yaw;state.pitch=0;
 saveVisit();refresh();
}
function activateCurrentPortal(){
 const p=node().portal;if(!p||anim||portalTransition)return;
 try{
   Portal.activate(p,{
     worlds,baseURL:location.href,
     onLocal:(world,entry)=>{
       const crossWorldPages={
         garden:'../chuzhoy/index.html?ws_v=1&ws_entry=chuzhoy-north',
         fortress:'../fortress/index.html?ws_v=1&ws_entry='+(state.world==='gringotts'?'fortress-bank-rear':'fortress-gate'),
         gringotts:'../gringotts/index.html?ws_v=1&ws_entry=gringotts-gerudo'
       };
       if(crossWorldPages[world]){
         location.assign(new URL(crossWorldPages[world],location.href));
         return;
       }

       const anchor=PORTAL_ENTRIES[p.entryTag];
       if(!anchor||anchor.world!==world||anchor.node!==entry)throw Error('Unpublished local portal destination');
       portalTransition=true;
       const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
       $('main').classList.add('portal-wiggle');
       setTimeout(()=>{
         try{landAtPortalTag(world,p.entryTag);}
         catch(err){toast('Portal refused: '+err.message);}
         finally{$('main').classList.remove('portal-wiggle');portalTransition=false;}
       },reduced?80:440);
     },
     // External destinations are independent origins, never sent a player history.
     confirmExternal:(message)=>window.confirm(message),
     onExternal:(href)=>location.assign(href)
   });
 }catch(e){toast('Portal refused: '+e.message);}
}
$('portalAction').onclick=activateCurrentPortal;
$('screenAction').onclick=()=>vnn.focus();
window.addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))e.preventDefault();
 if(window.WebspaceBankDesk?.isOpen?.()){if(e.key==='Escape')window.WebspaceBankDesk.close();return;}
 if(document.activeElement&&['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
 if(e.key==='ArrowLeft'||e.key==='4')rotate(Math.PI/8);
 if(e.key==='ArrowRight'||e.key==='6')rotate(-Math.PI/8);
 if(e.key==='ArrowUp'||e.key==='8')step(true);
 if(e.key.toLowerCase()==='e'&&node().interact)openBankDesk(node().interact);
 if(e.key==='ArrowDown'||e.key==='2')step(false);
 if(e.key==='Escape'){$('drawer').classList.remove('open');drawerType='';vnn.hide();}
});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function openDrawer(type){
 drawerType=type;const d=$('drawer');d.classList.add('open');
 if(type==='help')d.innerHTML='<h2>How to explore</h2><p>Drag left/right to look around; drag vertically to look up or down. The camera always levels and faces the direction of travel after moving to another location.</p><p>↑ or the gold arrow moves between points. ↓ returns toward an earlier point. The separate <b>◈ portal button</b> crosses into another world. Cross-site travel requires a confirmation and never shares your journey or identity.</p><p><b>Garden:</b> four stations form a ring over groomed grass and curved dirt trails; the fountain is reached only through the opening at the East rose walk. North is marked by Polaris and the Big Dipper.</p><p><b>Crossroads:</b> Up continues straight along the fortress; turn left/right and tap an in-world marker for the cell or empty treasury alcove.</p><p><b>Portal arrivals:</b> only publicly named entrances fortress-gate and chuzhoy-north are accepted, never coordinates from URL parameters. Direct opening starts at throne (0,0); portal arrivals face into the destination.</p><p><b>Fountain:</b> an externally stored, editable STEP CAD model, tessellated into its own GLB asset and loaded by the WebGL engine. The marble and fortress bricks are computed in GPU shaders; no texture files are used.</p><p><b>▣ VNN Screen:</b> In the Correspondents’ Den after the throne, select Inspect VNN. A real sandboxed iframe displays a Webspace standby page. Loading the remote site requires a deliberate click and may be blocked by the site’s iframe policy. Portals transfer worlds; screens embed documents. Neither exchanges private journey history.</p><p><b>Chandelier:</b> The Courtyard features a separate STEP/GLB CAD asset, not yet lit. A future switch will animate it.</p>';
 else if(type==='history')d.innerHTML='<h2>Player journey</h2><p>Local to this browser; exported JSON is yours to keep.</p><ol>'+(state.history||[]).slice().reverse().map(x=>`<li>${escapeHTML(worlds[x.world].name)} · ${escapeHTML(worlds[x.world].nodes[x.node].label)}<br><small>${new Date(x.time).toLocaleString()}</small></li>`).join('')+'</ol>';
 else d.innerHTML='<h2>Navigation graph · '+escapeHTML(worlds[state.world].name)+'</h2><p>World coordinates are local. Fortress throne room is X=0, Z=0.</p>'+Object.entries(worlds[state.world].nodes).map(([id,n])=>`<p><button data-node="${id}">${id===state.node?'●':'○'} ${escapeHTML(n.label)}</button> <small>${n.links.map(escapeHTML).join(' ↔ ')}${n.portal?' · ◈ portal':''}</small></p>`).join('')+'<p>The four garden stations form a ring. Only the East rose walk connects to the central fountain. Crossroads side rooms are optional.</p>';
 d.querySelectorAll('[data-node]').forEach(b=>b.onclick=()=>{go(b.dataset.node);d.classList.remove('open');drawerType='';});
}
for(const [id,type] of [['mapBtn','map'],['historyBtn','history'],['helpBtn','help']])$(id).onclick=()=>{
 if(drawerType===type){$('drawer').classList.remove('open');drawerType='';}else openDrawer(type);
};
$('export').onclick=()=>{
 const body=JSON.stringify({protocol:'webspace/0.6.1',world:state.world,node:state.node,history:state.history,exportedAt:new Date().toISOString()},null,2);
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'application/json'}));a.download='webspace-journey.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
$('reset').onclick=()=>{
 state={world:'fortress',node:'throne',yaw:0,pitch:0,history:[]};cameraP=[0,1.72,0];yaw=0;pitch=0;anim=null;arrivedViaPortal=false;
 saveVisit();refresh();toast('Returned to throne-room origin (0, 0).');
};
refresh();
// Screen initialization is intentionally last. All core game controls now exist.
try {
  vnn=Screen.create({id:VNN_SCREEN.id,title:VNN_SCREEN.title,url:VNN_SCREEN.url,container:$('main'),channel:Channel});
  vnn.hide();
} catch (err) {
  console.warn('Optional VNN screen unavailable; navigation remains functional',err);
}
function frame(t){
 requestAnimationFrame(frame);
 if(anim){
  const a=anim,u=clamp((t-a.start)/a.duration,0,1),ease=u*u*(3-2*u);
  cameraP=a.from.map((v,k)=>v+(a.to[k]-v)*ease);yaw=a.yawFrom+(a.yawTo-a.yawFrom)*ease;pitch=a.pitchFrom*(1-ease);
  if(u>=1)finish(a);
 }
 drawSky(t);
 // Only show live HTML on the front of the panel (viewed from inside the Den).
 // Only project the HTML screen from the Den, when facing its FRONT (+Z).
 // Without this guard, a perspective-transformed iframe can expand across the
 // entire viewport at grazing angles and steal input from the game controls.
 const screenVisible=state.world===VNN_SCREEN.world && state.node==='hall' &&
   cameraP[2]<-15 && Math.cos(yaw)<-0.35 && !anim;
 if(screenVisible){
   const corners=VNN_SCREEN.corners.map(project);
   const sane=corners.every(p=>p && p.depth>1.5 &&
     p.x>-width*.6 && p.x<width*1.6 && p.y>-height*.6 && p.y<height*1.6);
   if(sane)vnn.update(corners);else vnn.hide();
 }else vnn.hide();
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 drawSolid(state.world);drawPortal(t);drawMarkers(t);
}
requestAnimationFrame(frame);
})();
