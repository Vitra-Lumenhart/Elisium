/* Witch's Hole — original WebGL2 webspace. Reuses the Webspace Portal Kit 0.1.
   No third-party runtimes, fonts, textures, telemetry, or network calls.
   A reduced-dimensional density / velocity field supplies interactive brook fog.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id), Portal=window.WebspacePortal, TAU=Math.PI*2;
if(!Portal)throw Error('Webspace Portal Kit must be loaded first');
const scene=$('scene'), gl=scene.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'default',depth:true});
if(!gl){$('site').textContent='The glen is closed';$('narration').textContent='This browser needs WebGL2. Try current Chrome, Firefox, Safari, or Edge.';return;}
const skyCanvas=$('sky'),sky=skyCanvas.getContext('2d'),hudCanvas=$('hud'),hud=hudCanvas.getContext('2d');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const hash=n=>{let x=Math.sin(n*127.1+17.371)*43758.5453;return x-Math.floor(x)};
const brookX=z=>9*Math.sin((z+5)/21)+4.5*Math.sin((z-6)/11);
function terrain(x,z){const bx=brookX(z),d=Math.abs(x-bx);
 const bank=21*(1-Math.exp(-Math.pow(Math.max(0,d-2.6)/18,1.30)));
 const ridges=1.5*Math.sin(x*.10+z*.07)+.85*Math.sin(x*.27-z*.18)*Math.min(1,d/7.5)+.45*Math.sin(x*.93+z*.41);
 const gullies=.55*Math.sin(z*.42+x*.16)+.28*Math.sin(z*.86-x*.31);
 return 1.9+(z+91)*.19 +bank+ridges+gullies-1.65*Math.exp(-Math.pow(d/6.2,2));}
function bed(z){return terrain(brookX(z),z);}
// Ten named sites and exactly one outward portal, located at the arrival cairn.
// X/Z follows the conceptual watershed; Y comes from physical topography.
const SITES=[
 {id:'arrival',name:'The Arrival Cairn',x:-22,z:73,yaw:.05,kind:'ridge',mode:'step',desc:'Under crooked hemlocks, a survey cairn overlooks a ravine that exhales. The one return portal stands behind you.',links:['lookout','cleft'],fact:'A published portal tag determines where a traveler may arrive; it is not proof of identity.'},
 {id:'lookout',name:'The Overlook',x:-30,z:52,yaw:-.25,kind:'ridge',mode:'scramble',desc:'From this high shelf you can trace pale currents threading below. If the root tunnel is opened, the Ravine Cliff exhales visibly from here.',links:['arrival','bridge'],fact:'Fog displays the motion of air. It is not evidence that a gap is safe for a person.'},
 {id:'cleft',name:'The Cold Cleft',x:31,z:43,yaw:.26,kind:'fissure',mode:'scramble',desc:'A fractured wall exhales refrigerated air. A copper thermometer gives a better answer than folklore, but the needle still jumps from pocket to pocket.',links:['arrival','basin'],fact:'Dense cold air can drain downslope through fractures and low terrain.'},
 {id:'bridge',name:'The Ravine Cliff',x:-33,z:17,yaw:.28,kind:'roots',mode:'scramble',desc:'After a long descent from the Overlook, the trail ends at a ravine cliff choked with storm-thrown roots. A thin seep of water disappears into the tangle, hinting that the crossing lies within it.',links:['lookout'],fact:'A hidden route may first announce itself through water or air rather than a visible footpath.'},
 {id:'hollow',name:'The Root Hollow',x:-22,z:9,yaw:.38,kind:'hollow',mode:'crawl',hidden:true,desc:'Inside the cleared root-tunnel, amber shelf fungi and cold mist line a hollow trunk spanning the ravine. The Basin exhales somewhere just beneath you.',links:['bridge','brook','basin'],fact:'Water can betray a traversable seam long before the eye recognizes it.'},
 {id:'basin',name:"The Witch's Basin",x:24,z:12,yaw:-.5,kind:'basin',mode:'wade',desc:'A plunge pool keeps its cold. Sheets of vapor skim the basin, collecting against rocks before they escape upward through every weakness in the ravine.',links:['cleft','hollow','hut'],fact:'The densest fog is often where temperature, moisture and low terrain meet.'},
 {id:'brook',name:'The Whispering Brook',x:-15,z:-4,yaw:.2,kind:'stream',mode:'wade',desc:'Water chatters below the mist, much faster than the pale current traveling just above it. One thread slips away toward the root hollow.',links:['hollow','hut','siphon'],fact:'Moving water and moving air are different fluids, with different speeds and boundaries.'},
 {id:'hut',name:'The Huckleberry Hut',x:29,z:-23,yaw:.75,kind:'hut',mode:'step',desc:'A crooked field-station leans among the trees. Someone has left a letter, a journal and an unlit lantern.',links:['basin','brook','weir'],fact:'A convincing appearance is not the same as a verified source.'},
 {id:'siphon',name:'The Stone Siphon',x:-34,z:-38,yaw:-.1,kind:'siphon',mode:'duck',desc:'The brook goes beneath the boulders. Cold vapor takes another seam—too narrow for any traveler.',links:['brook','outflow'],fact:'The path air can travel is not necessarily the path humans can travel.'},
 {id:'weir',name:'The Old Weir',x:22,z:-54,yaw:-.35,kind:'weir',mode:'step',desc:'The sluice gate is stiff but still movable. Its setting subtly changes the water, humidity and outflow.',links:['hut','outflow'],fact:'An experiment is stronger when you can predict and then verify the downstream result.'},
 {id:'outflow',name:'The Outflow',x:-23,z:-67,yaw:-.1,kind:'outflow',mode:'scramble',desc:'The forest opens. Two white streams of fog diverge between rocks and fade into warmer morning air.',links:['siphon','weir'],fact:'The same phenomenon can look entirely different from a different elevation.'}
];
for(const n of SITES){n.g=terrain(n.x,n.z);n.p=[n.x,n.g+1.68,n.z];}
const S=Object.fromEntries(SITES.map(s=>[s.id,s]));
const VISIBLE_SITES=SITES.filter(s=>!s.hidden);
const ROOT_TOTAL=12;
function rootOpen(){return clamp(modifications.root/ROOT_TOTAL,0,1);}
function rootCleared(){return modifications.root>=ROOT_TOTAL;}
function siteLinks(id=current){
 if(id==='bridge')return rootCleared()?['lookout','hollow']:['lookout'];
 return (S[id]?.links||[]).filter(dest=>!S[dest].hidden || rootCleared());
}
function visibleIndexOf(site){return VISIBLE_SITES.findIndex(s=>s.id===site.id);}
function visibleVisitedCount(){let n=0;for(const s of VISIBLE_SITES)if(visited.has(s.id))n++;return n;}
const ENTRY=Object.freeze({'witches-hole-ridge':Object.freeze({node:'arrival',yaw:0})});
const arrivalTag=Portal.parseArrival(location.search,{validEntries:Object.keys(ENTRY)});
let current='arrival',cameFrom=null,yaw=arrivalTag?ENTRY[arrivalTag].yaw:S.arrival.yaw,pitch=-.14,camera=S.arrival.p.slice();
let anim=null, survey=false, wantSound=false, width=1,height=1,dpr=1,targets=[],pointer=null,selection=null;
let modifications={sluice:0,vent:0,root:0,lantern:0,rootHint:0},visited=new Set(['arrival']),activePanel='',frameCount=0;
let hoverScene={x:0,y:0};
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(msg){const el=$('message');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.remove('show'),2600);}
function fmtElev(v){return (v>=0?'+':'')+v.toFixed(1)+' m';}
function refresh(){const n=S[current];$('site').textContent=n.name;$('narration').textContent=n.desc;
 $('elevation').textContent='Ground '+fmtElev(n.g-S.outflow.g)+' above outflow · '+(n.kind==='stream'?'wet stones':n.kind==='siphon'?'narrow footing':n.kind==='ridge'?'high shelf':n.kind==='roots'?'ravine scramble':n.kind==='hollow'?'crawl tunnel':'uneven ground');
 $('chapter').textContent=(n.hidden?'04a':String(visibleIndexOf(n)+1).padStart(2,'0'))+' / The crooked watershed';
 $('interact').hidden=!['cleft','bridge','hut','weir','basin','brook'].includes(current);
 $('interact').textContent=current==='cleft'?(modifications.vent?'✧ Narrow cold vent':'✧ Test cold vent'):current==='bridge'?(rootCleared()?'✧ Root tunnel cleared':'✧ Clear root tangle '+modifications.root+'/'+ROOT_TOTAL):current==='weir'?'✧ Adjust sluice':current==='hut'?'▤ Read the desk':current==='basin'?'✧ Stir basin air':'✧ Examine water';
 $('exit').hidden=current!=='arrival';
 const links=siteLinks(current);$('advance').disabled=!links.length;
 $('advance').textContent=selection&&links.includes(selection)?'Go '+symbolFor(S[selection].mode):'Traverse ↑';
 if(activePanel==='map')showPanel('map');
}
function symbolFor(mode){return {step:'↗',scramble:'⤴',wade:'≈',duck:'⌄',climb:'⇧',crawl:'⇢'}[mode]||'↑';}
function approach(a,b){return Math.atan2(-(b[0]-a[0]),-(b[2]-a[2]));}
function wrapAngle(from,to){let d=(to-from+Math.PI)%TAU;if(d<0)d+=TAU;return from+d-Math.PI;}
function project(p){const dx=p[0]-camera[0],dy=p[1]-camera[1],dz=p[2]-camera[2];
 const right=dx*Math.cos(yaw)-dz*Math.sin(yaw);const horiz=-dx*Math.sin(yaw)-dz*Math.cos(yaw);
 const f=horiz*Math.cos(pitch)+dy*Math.sin(pitch);const up=dy*Math.cos(pitch)-horiz*Math.sin(pitch);
 if(f<=.08)return null;const focal=height/(2*Math.tan(66*Math.PI/360));return {x:width/2+right*focal/f,y:height/2-up*focal/f,depth:f};}
function viewMatrix(pos,theta,phi){const f=[-Math.sin(theta)*Math.cos(phi),Math.sin(phi),-Math.cos(theta)*Math.cos(phi)],r=[Math.cos(theta),0,-Math.sin(theta)],u=[Math.sin(theta)*Math.sin(phi),Math.cos(phi),Math.cos(theta)*Math.sin(phi)];return new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-r[0]*pos[0]-r[1]*pos[1]-r[2]*pos[2],-u[0]*pos[0]-u[1]*pos[1]-u[2]*pos[2],f[0]*pos[0]+f[1]*pos[1]+f[2]*pos[2],1]);}
function projectionMatrix(aspect){const f=1/Math.tan(66*Math.PI/360),near=.075,far=250;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function compileShader(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('GLSL '+gl.getShaderInfoLog(shader));return shader;}
function program(v,f){const p=gl.createProgram();gl.attachShader(p,compileShader(gl.VERTEX_SHADER,v));gl.attachShader(p,compileShader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('GL program '+gl.getProgramInfoLog(p));return p;}
const VERT=`#version 300 es
precision highp float;
in vec3 aPos; in vec3 aNorm; in vec3 aColor; in vec2 aUV;
uniform mat4 uView; uniform mat4 uProj;
out vec3 vWorld;out vec3 vNorm;out vec3 vColor;out vec2 vUV;
void main(){vWorld=aPos;vNorm=aNorm;vColor=aColor;vUV=aUV;gl_Position=uProj*uView*vec4(aPos,1.0);}`;
const FRAG=`#version 300 es
precision highp float;
in vec3 vWorld;in vec3 vNorm;in vec3 vColor;in vec2 vUV;
uniform vec3 uEye;uniform float uTime;uniform int uMat;uniform float uWaterGate;
out vec4 fragColor;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.0),f.x),f.y);}
void main(){vec3 n=normalize(vNorm);if(uMat==0||uMat==4||uMat==5)n.y=abs(n.y);float lam=max(dot(n,normalize(vec3(-0.45,0.84,-0.30))),0.0);
 float lum=.46+.53*lam;vec3 col=vColor;
 if(uMat==0){float g=noise(vWorld.xz*.25);float speck=noise(vWorld.xz*3.0);col*=.76+.33*g+.09*speck;}
 if(uMat==1){float grain=sin(vWorld.y*13.0+noise(vWorld.xz*4.0)*4.0);col*=.88+.13*grain;}
 if(uMat==2){float vein=noise(vWorld.xz*.65+vWorld.y*.32);col*=.83+.33*vein;}
 if(uMat==3){float grain=noise(vWorld.xz*.6);float fleck=step(.89,noise(vWorld.xz*4.0));col*=.79+.34*grain+.1*fleck;}
 if(uMat==4){float stitch=abs(sin(vUV.y*2.0+vWorld.x*.35));col*=.77+.22*noise(vWorld.xz*2.2)+.05*stitch;}
 if(uMat==5){float ripple=sin(vUV.y*(5.2+uWaterGate*1.0)-uTime*(3.5+uWaterGate*.9)+sin(vUV.x*10.0+uTime*.8)*.6);float thread=sin(vUV.y*18.0-uTime*8.0+vUV.x*21.0);float edge=smoothstep(.43,.5,abs(vUV.x-.5));col=mix(col,col*1.12+vec3(.08,.13,.20),.5+.5*ripple);col+=vec3(.08,.11,.1)*pow(max(thread,0.0),10.0)+vec3(.24,.31,.32)*edge*(.5+.5*ripple);lum=.65+.30*lam;}
 if(uMat==6){col*=.90+.15*noise(vWorld.xz*1.1);}
 if(uMat==7){col*=1.15+.12*sin(uTime*1.3+vWorld.y*3.0);lum=.91;}
 vec3 lit=col*lum+vec3(.022,.042,.044);float dist=length(vWorld-uEye);
 float atmospheric=clamp((dist-22.0)/125.0,0.0,.55);lit=mix(lit,vec3(.36,.49,.48),atmospheric);
 float nearMist=exp(-abs(vWorld.y-uEye.y+1.4)*.22)*clamp((dist-16.0)/115.0,0.0,.12);lit=mix(lit,vec3(.49,.63,.61),nearMist);
 fragColor=vec4(lit,1.0);
}`;
const FOGVERT=`#version 300 es
precision highp float;
in vec3 aPos;in vec2 aUV;uniform mat4 uView;uniform mat4 uProj;uniform float uLayer;uniform float uTime;
out vec2 vUV;out vec3 vWorld;
void main(){vec3 p=aPos;p.y+=uLayer+sin(p.x*.19+p.z*.08+uTime*.14+uLayer)*.17;vWorld=p;vUV=aUV;gl_Position=uProj*uView*vec4(p,1.0);}`;
const FOGFRAG=`#version 300 es
precision highp float;
in vec2 vUV;in vec3 vWorld;uniform sampler2D uDensity;uniform vec3 uEye;uniform float uLayer;uniform float uTime;uniform float uLight;
out vec4 fragColor;
float hash2(vec2 p){return fract(sin(dot(p,vec2(27.19,82.71)))*53183.14);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),mix(hash2(i+vec2(0,1)),hash2(i+1.0),f.x),f.y);}
void main(){float d=texture(uDensity,vUV).r;float spread=noise(vWorld.xz*.31+vec2(uTime*.12,-uTime*.22));float detail=noise(vWorld.xz*1.7+vec2(uTime*.31,-uTime*.42));
 float tendril=smoothstep(.12,.68,d*(.84+.70*spread)+.20*(detail-.45));
 float alpha=tendril*(.24+.34*spread)*exp(-uLayer*.11);
 float around=length(vWorld-uEye);alpha*=1.0-clamp((around-84.0)/88.0,0.0,.65);
 vec3 c=mix(vec3(.53,.69,.69),vec3(.89,.95,.89),.35+.5*spread);c+=vec3(.14,.14,.08)*uLight;
 fragColor=vec4(c,clamp(alpha,0.0,.48));
}`;
const solidProgram=program(VERT,FRAG), fogProgram=program(FOGVERT,FOGFRAG),portalProgram=program(Portal.vertexShader,Portal.fragmentShader);
function locs(p,portal=false){return {pos:gl.getAttribLocation(p,'aPos'),norm:portal?-1:gl.getAttribLocation(p,'aNorm'),color:portal?-1:gl.getAttribLocation(p,'aColor'),uv:gl.getAttribLocation(p,'aUV'),view:gl.getUniformLocation(p,'uView'),proj:gl.getUniformLocation(p,'uProj'),time:gl.getUniformLocation(p,'uTime'),eye:gl.getUniformLocation(p,'uEye'),mat:gl.getUniformLocation(p,'uMat'),waterGate:gl.getUniformLocation(p,'uWaterGate'),layer:gl.getUniformLocation(p,'uLayer'),density:gl.getUniformLocation(p,'uDensity'),light:gl.getUniformLocation(p,'uLight')};}
const SL=locs(solidProgram),FL=locs(fogProgram),PL=locs(portalProgram,true);
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
// Geometry-builder conventions adapted from the existing Webspace procedural/CAD renderer.
function builder(){const batches=new Map();const batch=m=>{if(!batches.has(m))batches.set(m,[]);return batches.get(m)};
 function tri(mat,a,b,c,color,uvs=[[0,0],[1,0],[1,1]]){const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]),cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],mag=Math.hypot(...cross)||1,n=cross.map(v=>v/mag),out=batch(mat);for(let i=0;i<3;i++)out.push(...[a,b,c][i],...n,...color,...uvs[i]);}
 function quad(mat,a,b,c,d,color,uv=[[0,0],[1,0],[1,1],[0,1]]){tri(mat,a,b,c,color,uv.slice(0,3));tri(mat,a,c,d,color,[uv[0],uv[2],uv[3]]);}
 function box(x,y,z,w,h,d,color,mat=6){const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,p=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[x0,y+h,z0],[x1,y+h,z0],[x1,y+h,z1],[x0,y+h,z1]];for(const f of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[0,3,2,1]])quad(mat,...f.map(i=>p[i]),color);}
 function rod(a,b,r,rr,color,mat=1,sides=6){const d=b.map((v,i)=>v-a[i]),m=Math.hypot(...d)||1,v=d.map(x=>x/m),base=Math.abs(v[1])<.89?[0,1,0]:[1,0,0];let side=[v[1]*base[2]-v[2]*base[1],v[2]*base[0]-v[0]*base[2],v[0]*base[1]-v[1]*base[0]],sm=Math.hypot(...side)||1;side=side.map(x=>x/sm);const up=[v[1]*side[2]-v[2]*side[1],v[2]*side[0]-v[0]*side[2],v[0]*side[1]-v[1]*side[0]];for(let i=0;i<sides;i++){const t=TAU*i/sides,q=TAU*(i+1)/sides;const off=(angle,size)=>side.map((s,k)=>s*Math.cos(angle)*size+up[k]*Math.sin(angle)*size);const add=(p,o)=>p.map((v,k)=>v+o[k]);quad(mat,add(a,off(t,r)),add(a,off(q,r)),add(b,off(q,rr)),add(b,off(t,rr)),color);}}
 function ellipsoid(x,y,z,rx,ry,rz,color,mat=3,seed=0){const rings=5,sides=9;for(let j=0;j<rings;j++){const a=-Math.PI/2+Math.PI*j/rings,b=-Math.PI/2+Math.PI*(j+1)/rings;for(let k=0;k<sides;k++){const t=TAU*k/sides,q=TAU*(k+1)/sides;const p=(p0,t0)=>{const wob=1+.10*Math.sin(t0*3.0+seed*7.0)*Math.cos(p0*3);return [x+rx*Math.cos(p0)*Math.cos(t0)*wob,y+ry*Math.sin(p0),z+rz*Math.cos(p0)*Math.sin(t0)*wob]};quad(mat,p(a,t),p(a,q),p(b,q),p(b,t),color);}}}
 function cone(x,y,z,r,h,color,mat=2,sides=7){for(let j=0;j<sides;j++){const a=TAU*j/sides,b=TAU*(j+1)/sides;tri(mat,[x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],[x,y+h,z],color);}}
 return {batches,tri,quad,box,rod,ellipsoid,cone};}
const B=builder();
function rand(seed){let v=seed|0;return ()=>((v=Math.imul(v,1664525)+1013904223|0)>>>0)/4294967296;}
const rng=rand(702643);
const COL={soil:[.18,.27,.23],soilHi:[.30,.38,.27],path:[.46,.39,.26],bark:[.25,.24,.25],barkHi:[.38,.31,.31],needles:[.12,.27,.23],needles2:[.20,.35,.28],rock:[.43,.49,.46],rock2:[.31,.38,.40],rockHi:[.61,.62,.52],wood:[.47,.34,.28],roof:[.22,.32,.40],witch:[.70,.64,.48],glow:[.98,.72,.43],water:[.23,.53,.61]};
function pick(arr){return arr[Math.floor(rng()*arr.length)];}
function ribbon(points,w,color,mat=4){for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz)||1,nx=-dz/length,nz=dx/length,r=w/2;B.quad(mat,[a[0]+nx*r,a[1],a[2]+nz*r],[a[0]-nx*r,a[1],a[2]-nz*r],[b[0]-nx*r,b[1],b[2]-nz*r],[b[0]+nx*r,b[1],b[2]+nz*r],color,[[0,i*.4],[1,i*.4],[1,(i+1)*.4],[0,(i+1)*.4]]);}}
function pathPoints(a,b){const out=[];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;const count=Math.max(36,Math.round(18+l));for(let i=0;i<=count;i++){const t=i/count,side=Math.sin(Math.PI*t)*Math.sin(2*Math.PI*t+(a.x+b.z)*.07)*(3.5+Math.min(9,l*.12));const curl=Math.sin(t*Math.PI*4+a.z*.1)*Math.sin(Math.PI*t)*1.2;const x=mix(a.x,b.x,t)-dz/l*(side+.35*curl),z=mix(a.z,b.z,t)+dx/l*(side+.35*curl);out.push([x,terrain(x,z)+.18+Math.sin(t*Math.PI)*(.08+Math.abs(a.g-b.g)*.018),z]);}return out;}
const edges=[];for(const a of VISIBLE_SITES)for(const id of a.links){const b=S[id];if(!b||b.hidden)continue;if(VISIBLE_SITES.indexOf(a)<VISIBLE_SITES.indexOf(b))edges.push([a,b]);}
// Landscape and brushwork: ground is actual triangulated S-valley, not a flat scene.
for(let iz=0;iz<110;iz++)for(let ix=0;ix<94;ix++){
 const x0=-86+ix*172/94,x1=-86+(ix+1)*172/94,z0=-102+iz*204/110,z1=-102+(iz+1)*204/110;
 const corners=[[x0,terrain(x0,z0)-.15,z0],[x1,terrain(x1,z0)-.15,z0],[x1,terrain(x1,z1)-.15,z1],[x0,terrain(x0,z1)-.15,z1]];
 const d=Math.abs((x0+x1)*.5-brookX((z0+z1)*.5));let tone=(.78+.30*hash(ix*234+iz*87)),color=d<5?[.17*tone,.32*tone,.32*tone]:d<16?[.24*tone,.32*tone,.26*tone]:[.22*tone,.30*tone,.25*tone];
 B.quad(0,...corners,color,[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]);
}
// An independently animated S-shaped waterway, with small bright stones and foam.
const river=[];for(let i=0;i<=310;i++){const z=90-i*(180/310),x=brookX(z),y=bed(z)+.08;river.push([x,y,z]);}
for(let i=0;i<river.length-1;i++){const a=river[i],b=river[i+1],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,w=2.35+.45*Math.sin(i*.21);
 B.quad(5,[a[0]+nx*w,a[1],a[2]+nz*w],[a[0]-nx*w,a[1],a[2]-nz*w],[b[0]-nx*w,b[1],b[2]-nz*w],[b[0]+nx*w,b[1],b[2]+nz*w],COL.water,[[0,i*.05],[1,i*.05],[1,(i+1)*.05],[0,(i+1)*.05]]);
}
for(const [a,b] of edges){const points=pathPoints(a,b);ribbon(points,1.4,COL.path,4);for(let i=3;i<points.length-2;i+=5){const p=points[i];B.ellipsoid(p[0]+(rng()-.5)*1.2,p[1]-.15,p[2],.55,.16,.45,pick([COL.rockHi,COL.rock,COL.wood]),3,2+i);}}
// Hand-crafted-looking hemlocks, with lopsided branches, button-knot details and roots.
function hemlock(x,z,scale,seed=1){const y=terrain(x,z);let xx=x,zz=z;const h=(10+rng()*12)*scale;
 const drift=(rng()-.5)*2.2*scale,top=[x+drift,y+h,z+(rng()-.5)*2.0*scale],mid=[x+drift*.55,y+h*.52,z+(top[2]-z)*.55];
 B.rod([x,y-.2,z],mid,.54*scale,.36*scale,COL.bark,1,7);B.rod(mid,top,.36*scale,.04*scale,COL.barkHi,1,6);
 for(let k=0;k<5;k++){let a=TAU*k/5+seed;B.rod([x,y+.15,z],[x+Math.cos(a)*2*scale,y-.1,z+Math.sin(a)*2*scale],.20*scale,.06*scale,COL.bark,1,5);}
 for(let j=0;j<5;j++){const lev=.34+j*.115,cy=y+h*lev,rad=(4.4-(j*.68))*scale,off=drift*lev;B.cone(x+off,cy,z,rad,3.8*scale,j%2?COL.needles:COL.needles2,2,8);
  for(let k=0;k<6;k++){const a=TAU*k/6+j*.28;B.rod([x+off,cy+.1,z],[x+off+Math.cos(a)*rad*.90,cy-1.1*scale,z+Math.sin(a)*rad*.90],.12*scale,.025*scale,COL.bark,1,4);}
 }
 if(seed%5===0){const ky=y+h*.27;B.ellipsoid(x+.50*scale,ky,z,.25*scale,.36*scale,.15*scale,[.69,.66,.53],3,seed);B.ellipsoid(x+.62*scale,ky,z,.085*scale,.08*scale,.09*scale,[.09,.12,.13],7,seed);}
}
function rock(x,z,r){const y=terrain(x,z);const col=pick([COL.rock,COL.rock2,COL.rockHi]);B.ellipsoid(x,y+r*.28,z,r*(.9+rng()*.3),r*(.37+rng()*.55),r*(.65+rng()*.4),col,3,rng()*40);}
function fern(x,z,s){const y=terrain(x,z),col=pick([COL.needles,COL.needles2,[.31,.43,.30]]);for(let k=0;k<5;k++){const a=k*TAU/5+hash(x*3+z),r=(.7+rng()*.65)*s,p0=[x,y+.06,z],p1=[x+Math.cos(a)*r*.5,y+.42*s,z+Math.sin(a)*r*.5],p2=[x+Math.cos(a)*r,y+.20*s,z+Math.sin(a)*r],s1=[-Math.sin(a)*.25*s,0,Math.cos(a)*.25*s];B.tri(2,p0,[p1[0]+s1[0],p1[1],p1[2]+s1[2]],p2,col);B.tri(2,p0,p2,[p1[0]-s1[0],p1[1],p1[2]-s1[2]],col);}}
for(let i=0;i<205;i++){const x=(rng()-.5)*170,z=(rng()-.5)*199;if(Math.abs(x-brookX(z))<7)continue;const nearSite=SITES.some(s=>Math.hypot(s.x-x,s.z-z)<6.3);if(nearSite)continue;
 if(rng()<.84)hemlock(x,z,.55+rng()*.64,i);}
for(let i=0;i<460;i++){const x=(rng()-.5)*165,z=(rng()-.5)*195;if(SITES.some(s=>Math.hypot(s.x-x,s.z-z)<2.8))continue;const d=Math.abs(x-brookX(z));if(rng()<.52)rock(x,z, .45+rng()*(d<7?2.8:2.0));else fern(x,z,.5+rng()*1.6);}
// Manmade objects: incongruous domestic needlework set within large-scale geology.
function lantern(x,y,z,size=1){B.box(x,y,z,.36*size,.69*size,.36*size,COL.wood,6);B.ellipsoid(x,y+.43*size,z,.27*size,.42*size,.27*size,COL.glow,7);B.rod([x,y+.89*size,z],[x,y+1.24*size,z],.095*size,.08*size,COL.wood,6);}
function sign(x,z,txtScale=1){const y=terrain(x,z);B.rod([x,y,z],[x,y+2.0*txtScale,z],.11,.11,COL.wood,6);B.box(x,y+1.3*txtScale,z,1.7*txtScale,.39*txtScale,.15,COL.wood,6);}
// Arrival stones and one exit portal, adapted from the reusable portal art kit.
const arrival=S.arrival;
for(let j=0;j<6;j++){B.ellipsoid(arrival.x-3.7+(rng()-.5)*.8,terrain(arrival.x-3.7,arrival.z)+j*.37,arrival.z-2+(rng()-.5)*.8,.8-j*.08,.29,.7,COL.rock,3,j);}
sign(arrival.x+3,arrival.z-2);
const PORTALBASE=terrain(arrival.x,arrival.z+8.6);
const portalFrameBuilder={box:(x,y,z,w,h,d,col,mat)=>B.box(x,PORTALBASE+y,z,w,h,d,col,6),ellipsoid:(x,y,z,rx,ry,rz,col,mat,seed)=>B.ellipsoid(x,PORTALBASE+y,z,rx,ry,rz,COL.witch,7,seed)};
const portalSurface=Portal.frame(portalFrameBuilder,{x:arrival.x,z:arrival.z+8.6,width:5.6,height:6.7});
const finalSurface={...portalSurface,y:portalSurface.y+PORTALBASE};
// Creek crossings and site-specific silhouettes.
const lookout=S.lookout;B.box(lookout.x,lookout.g+.1,lookout.z-1.8,4,.18,1.1,COL.wood,6);sign(lookout.x-3,lookout.z-2);
const cleft=S.cleft;for(let i=0;i<8;i++)rock(cleft.x+Math.cos(i*.8)*3,cleft.z+Math.sin(i*.8)*3,1.6+rng()*2.8);B.box(cleft.x+.7,cleft.g+.2,cleft.z+.3,.18,1.65,.18,COL.witch,6);B.ellipsoid(cleft.x+.7,cleft.g+1.65,cleft.z+.3,.12,.12,.12,COL.glow,7);
const bridge=S.bridge;B.rod([bridge.x-5,terrain(bridge.x-5,bridge.z)+1.1,bridge.z-1],[bridge.x+5,terrain(bridge.x+5,bridge.z)+1,bridge.z+2],1.0,.82,COL.barkHi,1,9);
for(let i=0;i<8;i++){const a=i*TAU/8;B.rod([bridge.x,bridge.g+1,bridge.z],[bridge.x+Math.cos(a)*3.4,bridge.g+.25,bridge.z+Math.sin(a)*3.4],.23,.035,COL.bark,1,5);}
const basin=S.basin;for(let i=0;i<9;i++){const a=TAU*i/9;rock(basin.x+Math.cos(a)*6,basin.z+Math.sin(a)*5,1.5+rng()*1.3);}
const brook=S.brook;for(let i=0;i<8;i++){const z=brook.z-6+i*1.4,x=brookX(z)+(i%2?1:-1)*2.7;B.ellipsoid(x,bed(z)+.32,z,.66,.38,.88,COL.rockHi,3,i);}
const hut=S.hut;const HX=hut.x+3.2,HZ=hut.z-7.0,HY=terrain(HX,HZ)+.15;
B.box(HX,HY,HZ,8,4.3,6.1,COL.wood,6);
// deliberately asymmetric steep gable, a storybook house rather than generic cabin
for(let side of [-1,1]){const x=HX+side*4.1;B.rod([HX,HY+7,HZ-3.6],[x,HY+4.15,HZ-3.6],.19,.19,COL.roof,6);B.rod([HX,HY+7,HZ+3.6],[x,HY+4.15,HZ+3.6],.19,.19,COL.roof,6);B.quad(6,[HX,HY+7,HZ-3.6],[HX,HY+7,HZ+3.6],[x,HY+4.15,HZ+3.6],[x,HY+4.15,HZ-3.6],COL.roof);}
B.box(HX-1.45,HY+.15,HZ+3.13,1.7,2.7,.14,[.15,.18,.20],6);B.box(HX+2.2,HY+2,HZ+3.17,1.3,1.5,.14,[.94,.62,.31],7);
for(let j=0;j<5;j++){B.rod([HX-4,HY+.2,HZ-2+j],[HX+4,HY+.2,HZ-2+j],.065,.065,COL.barkHi,6,4);}
lantern(HX+1.2,HY+1.9,HZ+3.7,.7);
const siphon=S.siphon;for(let i=0;i<11;i++){const a=TAU*i/11;rock(siphon.x+Math.cos(a)*4,siphon.z+Math.sin(a)*4,1.5+rng()*3.1);}
const weir=S.weir;const WY=weir.g;for(let i=-3;i<=3;i++)B.box(weir.x+i*1.2,WY-.1,weir.z-2,.95,2.2,2.4,COL.rock,3);
B.box(weir.x,WY+.8,weir.z-2,6.1,2.6,.35,COL.wood,6);
for(let i=0;i<4;i++)B.rod([weir.x-2.3+i*1.5,WY+.8,weir.z-2.4],[weir.x-2.3+i*1.5,WY+3.65,weir.z-2.4],.16,.16,COL.barkHi,6,6);
const outflow=S.outflow;for(let i=0;i<6;i++)rock(outflow.x-4+i*1.6,outflow.z+3*Math.sin(i),1.2+rng()*1.3);sign(outflow.x+3,outflow.z);
// A single interwoven line of golden 'stitches' marks old footpath repairs, not automatic waypoint arrows.
for(const [a,b] of edges){const pp=pathPoints(a,b);for(let k=3;k<pp.length-2;k+=6){const p=pp[k];B.rod([p[0]-.19,p[1]+.07,p[2]],[p[0]+.19,p[1]+.07,p[2]],.038,.038,COL.witch,7,4);}}
function upload(arr,loc){const vao=gl.createVertexArray(),vbo=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);
 for(const [name,size,offset] of [['pos',3,0],['norm',3,3],['color',3,6],['uv',2,9]]){const a=loc[name];if(a>=0){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,44,offset*4);}}gl.bindVertexArray(null);return {vao,vbo,count:arr.length/11};}
const solids=[...B.batches.entries()].map(([mat,array])=>({...upload(array,SL),mat}));
// CPU field / GPU fog, deliberately lower-resolution than the polygonal terrain.
const GW=66,GH=88,MINX=-79,MAXX=79,MINZ=-94,MAXZ=91,DX=(MAXX-MINX)/(GW-1),DZ=(MAXZ-MINZ)/(GH-1);
let density=new Float32Array(GW*GH),scratch=new Float32Array(GW*GH),fogPixels=new Uint8Array(GW*GH*4),fieldSteps=0,localFog=0;
const fogTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,fogTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
function gridIdx(ix,iz){return iz*GW+ix;}
function coord(ix,iz){return [MINX+ix*DX,MINZ+iz*DZ];}
function diffuseSample(arr,x,z){const gx=clamp((x-MINX)/DX,0,GW-1.001),gz=clamp((z-MINZ)/DZ,0,GH-1.001),i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j;
 return mix(mix(arr[gridIdx(i,j)],arr[gridIdx(i+1,j)],fx),mix(arr[gridIdx(i,j+1)],arr[gridIdx(i+1,j+1)],fx),fz);}
function flowAt(x,z,time){const bx=brookX(z),d=x-bx,shove=clamp(d/18,-1.0,1.0);let vx=-.46*shove+1.0*Math.cos((z+4)/21)/1.8 +.19*Math.sin(x*.18+time*.27),vz=-1.46-.30*Math.sin(z*.09+time*.22);
 const near=(p,r)=>Math.exp(-Math.pow(Math.hypot(x-p.x,z-p.z)/r,2));
 const cleft=near(S.cleft,12),bridge=near(S.bridge,15),hollow=near(S.hollow,10),basin=near(S.basin,20),weir=near(S.weir,16),siphon=near(S.siphon,14);
 const spin=(p,strength)=>{const ddx=x-p.x,ddz=z-p.z;vx+=-ddz*strength;vz+=ddx*strength;};
 if(bridge>.004)spin(S.bridge,(.012+rootOpen()*.026)*bridge);
 if(hollow>.004)spin(S.hollow,(.010+rootOpen()*.020)*hollow);
 if(basin>.004)spin(S.basin,.031*basin);
 if(siphon>.004)spin(S.siphon,.013*siphon);
 if(cleft>.004){vx-=.78*cleft*(1+modifications.vent*.6);vz-=.27*cleft;}
 if(rootCleared()){vx+=.22*hollow;vz-=.18*hollow;}
 if(weir>.004){vx+=.33*modifications.sluice*weir;vz-=(modifications.sluice*.26)*weir;}
 return [vx,vz];}
function updateField(dt,time){dt=Math.min(dt,.090);for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){
 const idx=gridIdx(i,j),[x,z]=coord(i,j),[vx,vz]=flowAt(x,z,time);const prev=diffuseSample(density,x-vx*dt*3.0,z-vz*dt*3.0);
 const d=Math.abs(x-brookX(z));const brookSource=Math.exp(-Math.pow(d/7.2,2))*(.030+.008*Math.sin(z*.18+time*.48));
 const cleftSource=.030*(1+modifications.vent*.55)*Math.exp(-Math.pow(Math.hypot(x-S.cleft.x,z-S.cleft.z)/9.5,2));
 const basinSource=.020*Math.exp(-Math.pow(Math.hypot(x-S.basin.x,z-S.basin.z)/12.0,2));
 const hollowSource=rootOpen()*.018*Math.exp(-Math.pow(Math.hypot(x-S.hollow.x,z-S.hollow.z)/8.5,2));
 const weirSource=modifications.sluice*.016*Math.exp(-Math.pow(Math.hypot(x-S.weir.x,z-S.weir.z)/13,2));
 const pocket=.010*(Math.exp(-Math.pow(Math.hypot(x+10,z-33)/9.5,2))+Math.exp(-Math.pow(Math.hypot(x+18,z-4)/7.5,2)));
 const loss=.006+.004*Math.max(0,d-14)/34;const diffuse=.070*(diffuseSample(density,x+DX,z)+diffuseSample(density,x-DX,z)+diffuseSample(density,x,z+DZ)+diffuseSample(density,x,z-DZ)-4*prev);
 scratch[idx]=clamp(prev+dt*3*(brookSource+cleftSource+basinSource+hollowSource+weirSource+pocket-loss)+dt*diffuse,0,.98);
 }[density,scratch]=[scratch,density];fieldSteps++;}
for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const [x,z]=coord(i,j),d=Math.abs(x-brookX(z));density[gridIdx(i,j)]=clamp(.78*Math.exp(-(d*d)/210)+.34*Math.exp(-Math.pow(Math.hypot(x-S.cleft.x,z-S.cleft.z)/12,2))+.15*Math.sin(z*.1+i*.2)**2,0,.84);}
function uploadFog(){for(let i=0;i<density.length;i++){const k=i*4;fogPixels[k]=Math.round(density[i]*255);fogPixels[k+1]=fogPixels[k+2]=0;fogPixels[k+3]=255;}gl.bindTexture(gl.TEXTURE_2D,fogTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,GW,GH,0,gl.RGBA,gl.UNSIGNED_BYTE,fogPixels);}
uploadFog();
const fogVerts=[];for(let j=0;j<GH-1;j++)for(let i=0;i<GW-1;i++){
 const add=(k,l)=>{const [x,z]=coord(k,l);return [x,bed(z)+.36,z,k/(GW-1),l/(GH-1)];};
 const a=add(i,j),b=add(i+1,j),c=add(i+1,j+1),d=add(i,j+1);
 for(const p of [a,b,c,a,c,d])fogVerts.push(...p);
}
const fogVAO=gl.createVertexArray(),fogVBO=gl.createBuffer();gl.bindVertexArray(fogVAO);gl.bindBuffer(gl.ARRAY_BUFFER,fogVBO);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(fogVerts),gl.STATIC_DRAW);
for(const [attribute,count,strideOffset] of [['pos',3,0],['uv',2,3]]){const a=FL[attribute];if(a>=0){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,count,gl.FLOAT,false,20,strideOffset*4);}}
gl.bindVertexArray(null);
const portalMesh=Portal.createMesh(gl,{pos:PL.pos,uv:PL.uv},finalSurface);
const portalLoc={view:PL.view,projection:PL.proj,time:PL.time,layer:PL.layer};
function resize(){const rect=scene.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<760?1.35:1.8);
 for(const c of [scene,skyCanvas,hudCanvas]){c.width=Math.floor(width*dpr);c.height=Math.floor(height*dpr);}sky.setTransform(dpr,0,0,dpr,0,0);hud.setTransform(dpr,0,0,dpr,0,0);gl.viewport(0,0,scene.width,scene.height);}
window.addEventListener('resize',resize);resize();
function skyDraw(t){sky.clearRect(0,0,width,height);const g=sky.createLinearGradient(0,0,0,height);g.addColorStop(0,'#132730');g.addColorStop(.47,'#58716b');g.addColorStop(.84,'#9d9d7f');g.addColorStop(1,'#415b5a');sky.fillStyle=g;sky.fillRect(0,0,width,height);
 const moonX=width*.77-Math.sin(yaw)*width*.13,moonY=height*.23+pitch*100;const glow=sky.createRadialGradient(moonX,moonY,0,moonX,moonY,Math.min(350,width*.45));glow.addColorStop(0,'rgba(241,229,184,.15)');glow.addColorStop(1,'rgba(184,194,180,0)');sky.fillStyle=glow;sky.fillRect(0,0,width,height);
 sky.beginPath();sky.arc(moonX,moonY,20,0,TAU);sky.fillStyle='rgba(241,228,190,.74)';sky.fill();
 // Cut-paper distant canopies: a dozen panoramic silhouettes, not bitmaps.
 const drift=yaw/TAU*width;for(let layer=0;layer<3;layer++){sky.beginPath();sky.moveTo(-50,height);for(let i=-2;i<=26;i++){const x=i*width/23-((drift*(.19+layer*.17))%(width/23));const h=height*(.58+layer*.07)+22*Math.sin(i*.9+layer)+10*Math.sin(i*2.8+layer);sky.lineTo(x,h);sky.lineTo(x+width/43,h-12-18*hash(i*23+layer*8));sky.lineTo(x+width/35,h+6);}sky.lineTo(width+100,height);sky.closePath();sky.fillStyle=['#354d4a99','#263e3eb0','#1b3238a3'][layer];sky.fill();}
 for(let i=0;i<24;i++){const x=hash(i*18)*width,y=hash(i*31+2)*height*.6,s=.5+hash(i*45);sky.fillStyle=`rgba(235,239,199,${.07+.1*Math.sin(t*.12+i)**2})`;sky.beginPath();sky.arc(x,y,s,0,TAU);sky.fill();}
}
function fogAt(x,z){return diffuseSample(density,x,z);}
function drawScene(time){const view=viewMatrix(camera,yaw,pitch),proj=projectionMatrix(width/height);
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.useProgram(solidProgram);gl.uniformMatrix4fv(SL.view,false,view);gl.uniformMatrix4fv(SL.proj,false,proj);gl.uniform3fv(SL.eye,camera);gl.uniform1f(SL.time,time);gl.uniform1f(SL.waterGate,modifications.sluice);
 for(const mesh of solids){gl.uniform1i(SL.mat,mesh.mat);gl.bindVertexArray(mesh.vao);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
 // Fog rises in layered terrain-following sheets, the same evolving density texture shared by each.
 gl.useProgram(fogProgram);gl.uniformMatrix4fv(FL.view,false,view);gl.uniformMatrix4fv(FL.proj,false,proj);gl.uniform3fv(FL.eye,camera);gl.uniform1f(FL.time,time);gl.uniform1f(FL.light,modifications.lantern*.6);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fogTexture);gl.uniform1i(FL.density,0);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.bindVertexArray(fogVAO);
 for(const layer of [4.5,2.6,.7]){gl.uniform1f(FL.layer,layer);gl.drawArrays(gl.TRIANGLES,0,fogVerts.length/5);}gl.depthMask(true);gl.disable(gl.BLEND);
 // The ONLY portal in the level lives behind the Arrival Cairn.
 Portal.draw(gl,{program:portalProgram,locations:{...portalLoc,pos:PL.pos,uv:PL.uv},surfaces:[portalMesh],view,projection:proj,time});
 gl.bindVertexArray(null);
}
function arrowShape(x,y,tilt,size,alpha,selected){hud.save();hud.translate(x,y);hud.rotate(tilt);hud.globalAlpha=alpha;hud.beginPath();hud.moveTo(0,-size*.72);hud.lineTo(size*.48,size*.25);hud.lineTo(size*.13,size*.16);hud.lineTo(size*.13,size*.62);hud.lineTo(-size*.13,size*.62);hud.lineTo(-size*.13,size*.16);hud.lineTo(-size*.48,size*.25);hud.closePath();hud.fillStyle=selected?'#f1d5a1':'#b6ddd0';hud.fill();hud.restore();}
function drawHUD(t){hud.clearRect(0,0,width,height);targets=[];const n=S[current];let possible=siteLinks(current).map(id=>S[id]);
 for(const dest of possible){const world=[dest.p[0],dest.p[1]+.38,dest.p[2]];let p=project(world),behind=!p,offscreen=behind||p.x<46||p.x>width-46||p.y<65||p.y>height-98;
 const heading=approach(camera,dest.p),rel=((heading-yaw+Math.PI*3)%TAU)-Math.PI;
 let x=p?.x??width/2+Math.sin(rel)*width*.42,y=p?.y??height*.56;
 if(offscreen){x=clamp(x,49,width-49);y=clamp(y,66,height-112);if(behind){x=width/2+Math.sin(rel)*width*.40;y=height*.58;}}
 const selected=selection===dest.id;const size=selected?25:19;let reveal=survey||!offscreen;const alpha=reveal?1:.72;
 // Locators are trustworthy UI, deliberately distinct from unreliable fog currents.
 hud.save();hud.globalAlpha=alpha;hud.shadowColor=selected?'#f2d191':'#6ec9bb';hud.shadowBlur=selected?24:12;
 hud.beginPath();hud.arc(x,y,size+8,0,TAU);hud.fillStyle=selected?'#5a4b35d9':'#102c31ce';hud.fill();hud.strokeStyle=selected?'#ffe3a8':'#9bc8be';hud.lineWidth=selected?2.4:1.3;hud.stroke();hud.shadowBlur=0;
 const elevation=dest.g-n.g;arrowShape(x,y,0,size,1,selected);
 hud.textAlign='center';hud.font='11px system-ui';hud.fillStyle='#fbf0d9';const name=dest.name.replace('The ','');const label=name+'  '+(elevation>=0?'↑':'↓')+Math.abs(elevation).toFixed(1)+'m';const measure=hud.measureText(label).width;
 hud.fillStyle='#11252be8';hud.fillRect(clamp(x-measure/2-8,3,width-measure-19),y+size+7,measure+16,23);hud.fillStyle='#f2e6d1';hud.fillText(label,clamp(x,width*.14,width*.86),y+size+22);hud.restore();
 targets.push({id:dest.id,x,y,r:size+15,offscreen});
 }
 // A camera-level reticle is intentionally subtle.
 hud.strokeStyle='#e7efd27a';hud.lineWidth=1;hud.beginPath();hud.moveTo(width/2-7,height/2);hud.lineTo(width/2-3,height/2);hud.moveTo(width/2+3,height/2);hud.lineTo(width/2+7,height/2);hud.moveTo(width/2,height/2-7);hud.lineTo(width/2,height/2-3);hud.moveTo(width/2,height/2+3);hud.lineTo(width/2,height/2+7);hud.stroke();
 if(survey){hud.font='12px system-ui';hud.textAlign='center';hud.fillStyle='#e7e5bb';hud.fillText('SURVEY MODE · SELECT AN ADJACENT LANDING',width/2,36);}
 if(current==='bridge')drawRootPuzzle();
 $('fogMeter').textContent=(fogAt(n.x,n.z)*100).toFixed(0)+'% density';$('waterMeter').textContent=Math.round(Math.hypot(n.x-brookX(n.z),0))+'m to brook';
 if($('tempMeter'))$('tempMeter').textContent=thermometerAt(n.x,n.z,t).toFixed(1)+'°F';
}
function thermometerAt(x,z,t){const fog=fogAt(x,z),ambient=58-.12*(terrain(x,z)-S.outflow.g);const pockets=(current==='cleft'?9:0)+(current==='bridge'?5*rootOpen():0)+(current==='basin'?6:0)+(current==='siphon'?4:0);return ambient-(fog*18)-pockets+1.1*Math.sin(t*.6+z*.08);} 
function rootHotspot(step){const pts=[[width*.54,height*.57],[width*.58,height*.50],[width*.62,height*.55],[width*.49,height*.48],[width*.66,height*.61],[width*.57,height*.66]];return pts[step%pts.length];}
function drawRootPuzzle(){const progress=modifications.root,remaining=Math.max(0,ROOT_TOTAL-progress),pt=rootHotspot(progress),hx=pt[0],hy=pt[1],hover=Math.hypot(hoverScene.x-hx,hoverScene.y-hy)<44;hud.save();hud.lineCap='round';for(let i=0;i<remaining;i++){const base=i+progress,sx=width*(.26+.045*(base%6)),sy=height*(.40+.05*Math.floor((base%12)/2)),ex=width*(.72+.04*Math.sin(base*.9)),ey=height*(.58+.07*Math.sin(base*.61)),mx=(sx+ex)/2+Math.sin(base*1.7)*48,my=(sy+ey)/2-28-18*Math.cos(base*.7);hud.beginPath();hud.moveTo(sx,sy);hud.quadraticCurveTo(mx,my,ex,ey);hud.strokeStyle=base===progress&&hover?'#e9c78b':'#5f4f3be8';hud.lineWidth=13-(i%4)*1.7;hud.stroke();if(base%3===0){hud.beginPath();hud.fillStyle='rgba(216,196,136,.65)';hud.ellipse((sx+mx)/2+8,(sy+my)/2,8,4,base,0,TAU);hud.fill();}}
 hud.globalAlpha=.7+.3*Math.sin(performance.now()*.008);hud.fillStyle=hover?'rgba(239,211,146,.34)':'rgba(145,201,190,.10)';hud.beginPath();hud.ellipse(hx,hy,44,32,0,0,TAU);hud.fill();hud.strokeStyle=hover?'#f0d295':'#7fb3a6';hud.lineWidth=1.2;hud.stroke();
 const open=rootOpen();if(open>0){hud.fillStyle='rgba(232,216,182,'+(0.10+.28*open)+')';hud.beginPath();hud.ellipse(width*.66,height*.63,30+open*60,20+open*38,.1,0,TAU);hud.fill();hud.strokeStyle='rgba(196,231,235,'+(.22+.45*open)+')';hud.lineWidth=2.0;hud.beginPath();hud.moveTo(width*.67,height*.62);hud.quadraticCurveTo(width*.61,height*.56,width*.49,height*.45);hud.stroke();}
 if(!rootCleared()){hud.font='11px system-ui';hud.textAlign='center';hud.fillStyle='#e8e0c3';hud.fillText('Find the strained fork and break the root web strand by strand.',width/2,height-120);}hud.restore();}

function samplePath(path,u){const segs=path.length-1;if(segs<=0)return path[0]||camera;const f=clamp(u,0,1)*segs,idx=Math.min(segs-1,Math.floor(f)),t=f-idx,a=path[idx],b=path[idx+1];return [mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];}
function performGo(id){if(anim||!siteLinks(current).includes(id))return;const src=S[current],dest=S[id],travel=pathPoints(src,dest),heading=approach(src.p,dest.p);const duration=prefersReduced?280:Math.min(4600,1200+len(src.p,dest.p)*34+travel.length*12);
 selection=null;anim={id,from:camera.slice(),to:dest.p.slice(),path:travel,yawFrom:yaw,yawTo:wrapAngle(yaw,heading),pitchFrom:pitch,started:performance.now(),duration,src:current};$('advance').disabled=true;}
function endGo(){const a=anim;current=a.id;cameFrom=a.src;camera=a.to.slice();yaw=a.yawTo;pitch=0;anim=null;visited.add(current);refresh();toast('Arrived: '+S[current].name);}
function tickAnimation(t){if(!anim)return;const a=anim,u=clamp((t-a.started)/a.duration,0,1),ease=u*u*(3-2*u),pathEase=.5-.5*Math.cos(ease*Math.PI);camera=samplePath(a.path,pathEase);camera[1]+=Math.sin(u*Math.PI)*(.22+.18*Math.min(1,Math.abs(a.to[1]-a.from[1])/12));yaw=mix(a.yawFrom,a.yawTo,ease);pitch=mix(a.pitchFrom,-.03+.04*Math.sin(u*Math.PI),ease);if(u>=1)endGo();}
function selectLink(id){if(!siteLinks(current).includes(id))return;selection=id;refresh();}
function advance(){const links=siteLinks(current);if(selection&&links.includes(selection)){performGo(selection);return;}const choices=links.map(id=>{const p=S[id].p,a=approach(camera,p),d=Math.abs(wrapAngle(yaw,a)-yaw);return {id,score:d+(id===cameFrom?.22:0)}}).sort((a,b)=>a.score-b.score);if(choices.length)performGo(choices[0].id);}
function back(){if(cameFrom&&siteLinks(current).includes(cameFrom))performGo(cameFrom);else toast('Choose a visible landing or open the survey map.');}
function tryRootPuzzle(x,y){if(current!=='bridge' || rootCleared())return false;const [hx,hy]=rootHotspot(modifications.root);const dist=Math.hypot(x-hx,y-hy);if(dist<44){modifications.root=Math.min(ROOT_TOTAL,modifications.root+1);modifications.rootHint=0;selection=rootCleared()?'hollow':selection;if(rootCleared())toast('The last tensed strand breaks. Mist exhales from the newly opened root hollow.');else toast('A taut root strand snaps free ('+modifications.root+'/'+ROOT_TOTAL+').');refresh();return true;}if(dist<130){modifications.rootHint++;toast(modifications.rootHint>2?'The hidden tension point lies where the seep disappears into the roots.':'The thicket shifts, but that was not the sweet spot.');return true;}return false;}
function clickHUD(x,y){for(const hit of targets.slice().reverse())if(Math.hypot(hit.x-x,hit.y-y)<hit.r){selectLink(hit.id);performGo(hit.id);return true;}return false;}
// Mouse/touch: drag to look in 3D, tap a confirmed endpoint to traverse.
scene.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};scene.setPointerCapture(e.pointerId);const bounds=scene.getBoundingClientRect();hoverScene={x:e.clientX-bounds.left,y:e.clientY-bounds.top};});
scene.addEventListener('pointermove',e=>{const bounds=scene.getBoundingClientRect();hoverScene={x:e.clientX-bounds.left,y:e.clientY-bounds.top};if(!pointer)return;const dx=e.clientX-pointer.lastX,dy=e.clientY-pointer.lastY;pointer.lastX=e.clientX;pointer.lastY=e.clientY;if(Math.abs(e.clientX-pointer.x)+Math.abs(e.clientY-pointer.y)>6)pointer.moved=true;if(pointer.moved){yaw-=dx*.0044;pitch=clamp(pitch-dy*.0040,-1.10,1.00);}});
scene.addEventListener('pointerup',e=>{if(!pointer)return;const moved=pointer.moved;pointer=null;if(!moved){const bounds=scene.getBoundingClientRect();const x=e.clientX-bounds.left,y=e.clientY-bounds.top;if(clickHUD(x,y))return;tryRootPuzzle(x,y);}});
scene.addEventListener('pointercancel',()=>pointer=null);
$('advance').onclick=advance;$('stepBack').onclick=back;$('turnL').onclick=()=>{yaw+=.34;selection=null;};$('turnR').onclick=()=>{yaw-=.34;selection=null;};
$('survey').onclick=()=>{survey=!survey;$('survey').classList.toggle('active',survey);toast(survey?'Survey sight enabled. Destination markers are confirmed nodes.':'Survey sight hidden.');};
$('map').onclick=()=>showPanel('map');$('journal').onclick=()=>showPanel('journal');$('help').onclick=()=>showPanel('help');
$('reset').onclick=()=>{if(!window.confirm('Restart your visit at the Cairn? Field experiments and fog will reset.'))return;current='arrival';cameFrom=null;camera=S.arrival.p.slice();yaw=S.arrival.yaw;pitch=0;selection=null;modifications={sluice:0,vent:0,root:0,lantern:0,rootHint:0};visited=new Set(['arrival']);density.fill(.40);refresh();toast('The glen begins to breathe again.');};
window.addEventListener('keydown',e=>{if(activePanel){if(e.key==='Escape')closePanel();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','m','M','f','F'].includes(e.key))e.preventDefault();if(e.key==='ArrowUp'||e.key==='w')advance();else if(e.key==='ArrowDown'||e.key==='s')back();else if(e.key==='ArrowLeft'||e.key==='a')yaw+=.21;else if(e.key==='ArrowRight'||e.key==='d')yaw-=.21;else if(e.key==='m'||e.key==='M')showPanel('map');else if(e.key==='f'||e.key==='F')$('survey').click();else if(e.key==='Escape')closePanel();});
// Web Audio synthesis: two distinct SFX stems, entirely local; opt-in only.
let audio=null;
function soundSetup(){const context=new (window.AudioContext||window.webkitAudioContext)();const rate=context.sampleRate,buffer=context.createBuffer(1,rate*4,rate),out=buffer.getChannelData(0);let seed=13214;for(let i=0;i<out.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;out[i]=(((seed>>>0)/4294967296)*2-1)*.45;}
 const master=context.createGain();master.gain.value=.7;master.connect(context.destination);
 const fogSource=context.createBufferSource();fogSource.buffer=buffer;fogSource.loop=true;const fogFilter=context.createBiquadFilter();fogFilter.type='lowpass';fogFilter.frequency.value=225;const fogGain=context.createGain();fogGain.gain.value=.02;fogSource.connect(fogFilter).connect(fogGain).connect(master);
 const brookSource=context.createBufferSource();brookSource.buffer=buffer;brookSource.loop=true;const brookBand=context.createBiquadFilter();brookBand.type='bandpass';brookBand.frequency.value=1100;brookBand.Q.value=.65;const brookGain=context.createGain();brookGain.gain.value=.04;brookSource.connect(brookBand).connect(brookGain).connect(master);
 const trickle=context.createOscillator();trickle.type='sine';trickle.frequency.value=278;const trickleGain=context.createGain();trickleGain.gain.value=.0015;trickle.connect(trickleGain).connect(master);
 fogSource.start();brookSource.start();trickle.start();return {context,fogGain,brookGain,brookBand,trickleGain,master};}
$('sound').onclick=async()=>{try{if(!audio)audio=soundSetup();wantSound=!wantSound;await audio.context.resume();$('sound').textContent=wantSound?'♫ Sound on':'♫ Sound off';$('sound').classList.toggle('active',wantSound);toast(wantSound?'Two distinct fluid stems: low fog wind and bright brook chatter.':'Environmental audio muted.');}catch(e){toast('Audio is not supported in this browser.');console.warn(e);}};
function updateSound(t){if(!audio)return;const n=S[current],toBrook=Math.abs(n.x-brookX(n.z));const wet=clamp(1-toBrook/46,0,1),fog=fogAt(n.x,n.z);
 const v=wantSound?1:0,tm=audio.context.currentTime;audio.fogGain.gain.setTargetAtTime(v*(.035+.085*fog)*(1+.12*Math.sin(t*.7)),tm,.3);
 audio.brookGain.gain.setTargetAtTime(v*(.014+.14*wet),tm,.3);audio.brookBand.frequency.setTargetAtTime(690+230*Math.sin(t*.62)+70*wet,tm,.35);audio.trickleGain.gain.setTargetAtTime(v*(.001+.003*wet)*(.6+.4*Math.sin(t*2.6)**2),tm,.4);}
function closePanel(){activePanel='';$('panel').classList.remove('open');$('panelShade').classList.remove('open');$('panelBody').innerHTML='';}
$('panelShade').onclick=closePanel;$('closePanel').onclick=closePanel;
function htmlEscape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function panel(title,body,type='notes'){$('panelTitle').textContent=title;$('panelBody').innerHTML=body;activePanel=type;$('panel').classList.add('open');$('panelShade').classList.add('open');$('panelBody').scrollTop=0;
 $('panelBody').querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>panelAction(b.dataset.action,b.dataset.value||'')));}
function makeMap(){const W=350,H=390,X=x=>W/2+x*1.94,Z=z=>H/2-z*1.92;
 let contours='';for(let i=0;i<9;i++){const x=18+i*34;contours+=`<path class="relief" d="M${x-25} -10 Q${x+28} 130 ${x-15} 205 T${x+30} 405"/>`;}
 let river=`M ${X(brookX(88)).toFixed(1)} ${Z(88).toFixed(1)}`;for(let z=86;z>=-86;z-=2)river+=` L ${X(brookX(z)).toFixed(1)} ${Z(z).toFixed(1)}`;
 let trails='';for(const [a,b] of edges){const pp=pathPoints(a,b);trails+=`<polyline class="trail" points="${pp.map(p=>X(p[0]).toFixed(1)+','+Z(p[2]).toFixed(1)).join(' ')}"/>`;}
 let nodes=VISIBLE_SITES.map((s,i)=>{const adjacent=siteLinks(current).includes(s.id);const col=adjacent?'#d9bc85':'#8aa99a';return `<g data-mapnode="${s.id}" style="cursor:${adjacent?'pointer':'default'}"><circle cx="${X(s.x)}" cy="${Z(s.z)}" r="13" fill="transparent" stroke="none"/><circle cx="${X(s.x)}" cy="${Z(s.z)}" r="${s.id===current?8:5.6}" class="node ${s.id===current?'current':''}" stroke="${col}"/><text x="${X(s.x)+(s.x<0?-7:8)}" y="${Z(s.z)-8}" class="label" text-anchor="${s.x<0?'end':'start'}">${i+1}. ${htmlEscape(s.name.replace('The ',''))}</text></g>`;}).join('');
 return `<div class="mapnote">One watershed · 10 named sites · 1 hidden crossing beneath the roots · 1 exit at the Cairn. Dashed lines are footpaths; blue is the brook. Select an adjacent stop to traverse.</div><svg id="mapSvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Interactive S-shaped ravine and switchback routes"><defs><linearGradient id="mapG" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#28433d"/><stop offset="1" stop-color="#101f27"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#mapG)"/>${contours}<path class="river" d="${river}"/>${trails}${nodes}<text x="15" y="23" class="label">HIGH RIDGE · +ELEVATION</text><text x="15" y="376" class="label">LOWER RAVINE ↓</text></svg><p><small>Current: ${htmlEscape(S[current].name)} · ${fmtElev(S[current].g-S.outflow.g)} above outflow. A creek or air current is not necessarily a walkable path.</small></p><p><button data-action="survey">${survey?'Hide':'Show'} Survey Sight</button><button data-action="resetMap">Recenter at current site</button></p>`;}
function showPanel(type){if(type==='map'){panel('The watershed',makeMap(),'map');$('panelBody').querySelectorAll('[data-mapnode]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.mapnode;if(id===current){toast('You are already here.');return;}if(!siteLinks(current).includes(id)){toast('This landing is not adjacent. Follow the switchback trails.');return;}closePanel();performGo(id);}));}
 else if(type==='journal'){panel('The field journal',`<p><em>Some maps record places. This notebook records questions.</em></p><h3>What you have seen</h3><p>${visibleVisitedCount()} of 10 named sites examined. Fog flow is continually simulated. Your experiments persist across the walk while this page remains open.</p><p><strong>Cold vent:</strong> ${modifications.vent?'Opened farther':'Natural opening'}<br><strong>Root tangle:</strong> ${rootCleared()?'Cleared ('+ROOT_TOTAL+'/'+ROOT_TOTAL+')':modifications.root+'/'+ROOT_TOTAL+' strands broken'}<br><strong>Sluice:</strong> ${modifications.sluice?'Raised':'Lowered'}<br><strong>Lantern:</strong> ${modifications.lantern?'Lit':'Unlit'}</p><h3>Three questions</h3><ul><li>Which parts of the ravine collect dense fog?</li><li>Can air cross a passage that you cannot?</li><li>Do you know the difference between an attractive invitation and a trusted destination?</li></ul><p><small>The notebook is local. No account, analytics, or location services are used.</small></p>`,'journal');}
 else if(type==='help'){panel('How to travel',`<h3>Looking & moving</h3><p>Drag the scene to look around. Tap an illuminated landing, or turn toward a route and press <strong>Traverse ↑</strong>. The down arrow returns to your previous stop; the curled arrows turn. Arrow keys and W/A/S/D work on a keyboard.</p><p><strong>Elevation is physical.</strong> A marker may be high above you or below your feet. It displays a reliable up/down difference. Paths are connected, and all movement lands on stable footing.</p><h3>Fog isn't a pathfinder</h3><p>Cold air flows through crevices that are not walkable. Choose the <strong>Survey</strong> sight or open the <strong>Map</strong> whenever the forest obscures a valid route.</p><h3>The physics</h3><p>The Breath Field updates a low-resolution 2D density grid with semi-Lagrangian advection, local diffusion, fog sources, gravitationally biased drainage and changing flow obstacles. The world renders layered fog volumes over 3D terrain. This is Navier–Stokes-inspired rather than a full 3D incompressible Navier–Stokes solver.</p><h3>Audio & privacy</h3><p>Use <strong>Sound on</strong> to hear two independent synthesized effects: low airy fog and brighter brook water. Everything runs in the browser without fetching sound files. The only exit is the portal at the Cairn. No visits or secrets are transmitted through it.</p>`,'help');}
}
function panelAction(action,value){if(action==='survey'){$('survey').click();showPanel('map');return;}if(action==='resetMap'){showPanel('map');return;}
 if(action==='lesson'){showLesson(value);return;}if(action==='answer'){const answer=window.__lessonAnswer?.[value];if(answer){const spot=$('lessonFeedback');if(spot){spot.textContent=answer.text;spot.style.color=answer.correct?'#c4eac5':'#f0bf9f';}}return;}
 if(action==='return'){closePanel();performExit();return;}if(action==='journal'){showPanel('journal');}}
const LESSONS={
 phishing:{title:'I. The Letter in the Hut',sub:'Phishing, urgency, and origin verification',story:'A letter claims the park survey is about to expire. It asks you to enter your survey password immediately at a web address ending in <strong>witchsh0le.example</strong> (with a zero). A matching emblem and a reassuring padlock icon are printed above it.',q:'What is the strongest next action?',answers:[['A','Enter the password quickly; the padlock shows it is trusted.'],['B','Open the known official page independently and verify the request.'],['C','Reply with your password to ask whether the letter is genuine.']],right:'B',explain:'Correct. HTTPS does not establish that the operator is trustworthy; a lookalike hostname and urgency are strong warning signs. Navigate independently rather than following the supplied link.'},
 privacy:{title:'II. The Surveyor’s Journal',sub:'Metadata and privacy',story:'A decades-old notebook records no passwords or addresses. It lists where visitors stop, approximately when they arrive, and which path they prefer. The combined pattern could still single out a regular visitor.',q:'What does the journal reveal?',answers:[['A','Behavioral patterns can be identifying even without names.'],['B','Only the visitor’s actual name would make the notebook sensitive.'],['C','Routines are private only if stored behind a password.']],right:'A',explain:'Correct. Several harmless-looking observations can become identifying when correlated. Minimize unnecessary collection and retention.'},
 routing:{title:'III. The Three Signposts',sub:'Addresses, lookalikes, and trusted entry points',story:'Three wooden signs lead toward what looks like the same station. In the computer simulation they contain URLs: <strong>forest-survey.example</strong>, <strong>f0rest-survey.example</strong>, and <strong>survey-login.example</strong>. All show plausible page titles.',q:'Which information establishes the genuine service?',answers:[['A','The page’s visual polish.'],['B','Whichever link has HTTPS.'],['C','A domain confirmed through an independent, trusted reference.']],right:'C',explain:'Correct. An attractive page, a secure connection, and a plausible name do not prove who operates the site. The addresses here are fictional .example domains.'},
 social:{title:'IV. The Lantern Across the Glen',sub:'Social pressure and safer communication',story:'A stranger messages that they possess a secret map. They insist you must leave the public discussion, keep the exchange hidden, and immediately send personal information before they will help.',q:'Which choice preserves your agency and safety?',answers:[['A','Refuse the secrecy and disclosure demands; disengage or verify independently.'],['B','Send limited details as a gesture of good faith.'],['C','Agree to move privately, provided they promise not to share anything.']],right:'A',explain:'Correct. High-pressure secrecy and unverified identity are warning signs. A refusal needs no elaborate justification.'},
 onion:{title:'V. The Shadow Network',sub:'Understanding the dark web',story:'The term “dark web” generally refers to services that require specialized software or configurations to access, including Tor onion services. Some are used for legitimate privacy and resistance to surveillance; others host fraud or illegal markets.',q:'What does anonymity software guarantee?',answers:[['A','That every destination is safe.'],['B','Nothing absolute: a deceptive site or voluntary disclosure can still expose you.'],['C','That every operator has a verified identity.']],right:'B',explain:'Correct. Network anonymity, encrypted transport, trustworthy operators, and safe personal conduct are different properties. The lesson links to no actual onion service.'}
};
function showLesson(id){const L=LESSONS[id];if(!L)return;window.__lessonAnswer={};for(const [key] of L.answers)window.__lessonAnswer[key]={correct:key===L.right,text:key===L.right?L.explain:'Not quite. '+L.explain};
 panel(L.title,`<p><small>${L.sub}</small></p><p>${L.story}</p><h3>${L.q}</h3>${L.answers.map(([key,text])=>`<button data-action="answer" data-value="${key}">${key}. ${text}</button>`).join('')}<p id="lessonFeedback" aria-live="polite"></p><hr style="border:0;border-top:1px solid #7b9e9451"><p><small>All addresses and identities here are fictional; no form captures personal information and no remote URL is opened.</small></p><button data-action="returnDesk">Return to desk</button>`, 'lesson');
 // Refresh panel() wiring and add the one local-back control.
 const b=$('panelBody').querySelector('[data-action="returnDesk"]');if(b)b.onclick=()=>showDesk();}
function showDesk(){panel('The Huckleberry Hut',`<p><em>The ranger’s lantern throws a small amber circle over a field desk. Four loose leaves, and a fifth tucked beneath a stone, are safe to examine.</em></p><h3>Whitehat field investigations</h3><p>These are offline, fictional exercises. They ask for judgment and careful verification—not for passwords, real browsing, or hazardous experimentation.</p>
 <button data-action="lesson" data-value="phishing">I · The suspicious letter</button><button data-action="lesson" data-value="privacy">II · The surveyor's journal</button><button data-action="lesson" data-value="routing">III · Three signposts</button><button data-action="lesson" data-value="social">IV · Lantern across the glen</button><button data-action="lesson" data-value="onion">V · The shadow network</button>
 <h3>The shuttered lantern</h3><p>Lighting the lantern changes the way near-surface mist catches light. It does not reveal safe routes automatically.</p><button data-action="toggleLantern">${modifications.lantern?'Extinguish':'Light'} the lantern</button>`,'desk');}
const oldPanelAction=panelAction; // Route two hut-specific actions without introducing inline handlers.
function showExperiment(){const n=S[current];switch(n.kind){
 case 'fissure':modifications.vent=1-modifications.vent;toast(modifications.vent?'The colder seam opens. New tendrils spill along the brook bed and the thermometer drops sharply.':'The loose stone settles back. The plume narrows, but the cold logic remains.');break;
 case 'roots':if(rootCleared())toast('The crawl-tunnel is open. The mist now escapes upward from the Basin.');else toast('Study the water thread and click the strained fork where the seep disappears into the roots.');break;
 case 'weir':modifications.sluice=1-modifications.sluice;toast(modifications.sluice?'The sluice rises. Moist air collects behind the weir.':'The sluice descends; the downstream stream resumes.');break;
 case 'basin':modifications.vent=1-modifications.vent;toast('The basin responds slowly. Watch for rearranged tendrils.');break;
 case 'hut':showDesk();break;
 case 'stream':panel('Two different fluids',`<p>The brook rushes downhill faster than the low air above it. The water shader's traveling bands follow the streambed, while a separate density field governs the fog.</p><p>Open the sound controls to hear two distinct locally synthesized sound sources.</p><p><strong>Observe:</strong> how does the moving water slip between boulders? Does the fog select the same opening?</p>`,'notes');break;
 }}
$('interact').onclick=showExperiment;
// Hotwire extra lesson actions only through the normal delegated panel, not external scripts.
$('panelBody').addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(!t)return;if(t.dataset.action==='toggleLantern'){modifications.lantern=1-modifications.lantern;showDesk();}else if(t.dataset.action==='returnDesk')showDesk();});
function showExit(){panel('The way back',`<p><em>The portal stands where you first entered Witch's Hole. On its other side lies the Garden of Chuzhoy.</em></p><p>This is the <strong>only exit portal</strong> in the level. Crossing is an explicit action; no journey log, camera coordinates, or private data are transmitted.</p><p>The unified edition routes back through the published Garden entrance. The standalone page can also use your browser's Back control to return to the page from which you arrived.</p><button id="returnGarden">◈ Return to Garden of Chuzhoy</button><button id="returnBrowser">↶ Go back to previous page</button><p><small>Only the published arrival tag <code>chuzhoy-north</code> is sent to the Garden.</small></p>`,'exit');
 $('returnGarden').onclick=()=>{const gardenPath='../chuzhoy/index.html';const url=new URL(gardenPath+'?ws_v=1&ws_entry=chuzhoy-north',location.href);if(confirm('Cross the portal into the Garden of Chuzhoy? No travel history will be sent.'))location.assign(url.href);};
 $('returnBrowser').onclick=()=>{if(history.length<=1){toast('No previous page was found. The Garden is available in the packaged edition.');return;}if(confirm('Leave Witch’s Hole and return to the previous browser page?'))history.back();};}
$('exit').onclick=showExit;
if(arrivalTag)toast('You have arrived through the published Witch’s Hole portal.');
// One rendering path, with adaptive update caps for phone thermal budgets.
let lastTime=0,lastDraw=0,lastField=0,lastAudio=0;
function frame(now){requestAnimationFrame(frame);if(!document.hidden){const dt=Math.min(.1,Math.max(.001,(now-lastTime)/1000||.017));lastTime=now;tickAnimation(now);
 const t=now/1000;if(now-lastField>65){updateField((now-lastField)/1000||.07,t);lastField=now;uploadFog();}
 const ms=window.innerWidth<760?34:23;if(now-lastDraw>ms){lastDraw=now;skyDraw(t);drawScene(t);drawHUD(t);frameCount++;}
 if(now-lastAudio>185){updateSound(t);lastAudio=now;}
 }else{lastTime=now;lastField=now;}}
refresh();requestAnimationFrame(frame);
})();
