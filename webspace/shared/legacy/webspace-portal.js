/*
 * WEBSPACE PORTAL KIT 0.1 -- portable, dependency-free, reusable across worlds.
 *
 * PURPOSE
 *   (1) A recognizably rectangular, brass-cornered prismatic doorway;
 *   (2) its shader and lightweight two-plane WebGL mesh;
 *   (3) a minimal cross-website travel contract with deliberately NO implicit trust.
 *
 * EXPLICIT TRUST BOUNDARY
 *   A portal is an ordinary outbound link chosen by the traveler. It NEVER sends
 *   history, cookies, wallet identifiers, saved state, identity, or credentials.
 *   A receiving world reads `ws_v=1&ws_entry=<public node id>` merely as a hint.
 *   External destinations need HTTPS; a v3-shaped Tor .onion HTTP address is also
 *   supported for browsers configured for Tor. Localhost HTTP is development only.
 *   Cross-origin travel requires a clear confirmation showing the actual host.
 *   Browsers keep each site's storage separate; there is NO central server here.
 *   A later federation should use opt-in, short-lived, audience-bound credentials.
 *   NEVER run scripts, import meshes, or accept permissions from arrival params.
 *
 * ART DIRECTION
 *   Minecraft-like unmistakable rectangle; Webspace-specific gilt nodes and a
 *   purple/teal 5-term Fourier + CRT interference veil. No expensive texture,
 *   raymarcher, image, audio, network dependency, or particle allocation.
 *
 * PUBLIC API
 *   WebspacePortal.frame(builder, {x,z,width,height}) -> portal surface descriptor
 *   WebspacePortal.vertexShader / fragmentShader   -> GLSL ES 3.00 strings
 *   WebspacePortal.createMesh(gl, locations, surface) -> GPU surface, call deleteMesh
 *   WebspacePortal.draw(gl, {program, locations, surfaces, view, projection, time})
 *   WebspacePortal.resolve(portal,{worlds,baseURL}) -> local/external description
 *   WebspacePortal.activate(portal,{worlds,onLocal,onExternal,confirmExternal,baseURL})
 *   WebspacePortal.parseArrival(search,{validEntries}) -> entry string or null
 *
 * Portals are objects: {world:'garden',node:'south'} (local)
 *                or {href:'https://example.org/world',entry:'arrival'} (remote).
 * Invalid descriptors throw before navigation or GPU allocation.
 * UMD global works with a <script> tag; also works as CommonJS for testing.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.WebspacePortal=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const VERSION='webspace-portal/0.1';
 const IDENTIFIER=/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
 // RFC 7686 onion names are special-use; this strict pattern admits v3 names only.
 const ONION_V3=/^[a-z2-7]{56}\.onion$/i;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function id(value,label='identifier'){
   if(typeof value!=='string'||!IDENTIFIER.test(value))throw new TypeError('Invalid '+label);
   return value;
 }
 function safeURL(href,baseURL){
   if(typeof href!=='string'||href.length>2048||href.trim()!==href||!href)throw new TypeError('Invalid portal href');
   const url=new URL(href,baseURL||'https://webspace.invalid/');
   if(url.username||url.password)throw new TypeError('Embedded URL credentials forbidden');
   const host=url.hostname.replace(/^\[|\]$/g,'').toLowerCase();
   const loopback=['localhost','127.0.0.1','::1'].includes(host);
   if(url.protocol!=='https:' && !(url.protocol==='http:'&&(loopback||ONION_V3.test(host)))){
     throw new TypeError('Remote portals require HTTPS, v3 .onion, or localhost development HTTP');
   }
   return url;
 }
 function resolve(portal,options={}){
   if(!portal||typeof portal!=='object'||Array.isArray(portal))throw new TypeError('Portal must be an object');
   if(own(portal,'href')){
     const url=safeURL(portal.href,options.baseURL);
     const entry=id(portal.entry,'remote entry');
     // Set *only* public routing metadata. Never serialize the player object.
     url.searchParams.set('ws_v','1');
     url.searchParams.set('ws_entry',entry);
     url.hash='';
     return Object.freeze({type:'external',url:url.toString(),entry,host:url.host,origin:url.origin});
   }
   const world=id(portal.world,'local world'),node=id(portal.node,'local entry');
   const worlds=options.worlds;
   if(!worlds||!own(worlds,world)||!worlds[world]||!worlds[world].nodes||!own(worlds[world].nodes,node)){
     throw new Error('Unknown local world or entry node');
   }
   return Object.freeze({type:'local',world,node});
 }
 function parseArrival(search,options={}){
   let params;
   try{params=new URLSearchParams(search||'');}catch{return null;}
   if(params.getAll('ws_v').length!==1||params.get('ws_v')!=='1'||params.getAll('ws_entry').length!==1)return null;
   const entry=params.get('ws_entry');
   if(!entry||!IDENTIFIER.test(entry))return null;
   if(Array.isArray(options.validEntries)&&!options.validEntries.includes(entry))return null;
   return entry;
 }
 function activate(portal,options={}){
   const dest=resolve(portal,options);
   if(dest.type==='local'){
     if(typeof options.onLocal!=='function')throw new TypeError('Missing local navigation handler');
     options.onLocal(dest.world,dest.node);
     return dest;
   }
   // Require an actual user action (the application calls activate from click/tap).
   const base=options.baseURL||((typeof location!=='undefined')?location.href:undefined);
   const here=base?new URL(base):null;
   const external=!(here&&here.origin===dest.origin);
   if(external){
     // Never silently leave the current origin. If no confirmation is wired, deny.
     if(typeof options.confirmExternal!=='function')return Object.freeze({...dest,blocked:true});
     if(options.confirmExternal('Leave this world for '+dest.host+'? This is a different website and may be unsafe.',dest)!==true){
       return Object.freeze({...dest,blocked:true});
     }
   }
   if(typeof options.onExternal==='function') options.onExternal(dest.url,dest);
   else if(typeof location!=='undefined'&&typeof location.assign==='function')location.assign(dest.url);
   else throw new TypeError('Missing external navigation handler');
   return dest;
 }
 // Same frame profile can be used by a tiny hand-written renderer or a full engine.
 function frame(builder,{x=0,z=0,width=7.7,height=7.7}={}){
   if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(width)||!Number.isFinite(height)||width<3||height<3||width>100||height>100)throw new RangeError('Invalid portal frame dimensions');
   if(!builder||typeof builder.box!=='function'||typeof builder.ellipsoid!=='function')throw new TypeError('Frame builder needs box and ellipsoid');
   const purple=[.18,.11,.26],gilt=[.70,.55,.31];
   const box=builder.box,oval=builder.ellipsoid;
   // Dark volcanic-looking stanchions form a simple, unmistakable rectangle.
   box(x-width/2+.43,0,z,.86,height,1.05,purple,5);
   box(x+width/2-.43,0,z,.86,height,1.05,purple,5);
   box(x,0,z,width,.7,1.12,purple,5);
   box(x,height-.72,z,width,.72,1.12,purple,5);
   // Four repeatable gilt 'world-link' seals -- a motif independent of Minecraft.
   for(const y of [.35,height-.25])for(const off of [-width/2+.36,width/2-.36]){
     oval(x+off,y,z,.35,.34,.68,4,8,gilt,5);
   }
   for(let j=0;j<7;j++){
     const y=.95+j*.82;
     if(y>=height-1.1)break;
     box(x-width/2+.43,y,z-.58,.34,.07,.13,gilt,5);
     box(x+width/2-.43,y,z-.58,.34,.07,.13,gilt,5);
   }
   box(x,height+.15,z,width+.4,.19,1.4,gilt,5);
   return Object.freeze({x,y:.42,z,w:width-1.58,h:height-1.12});
 }
 const vertexShader=`#version 300 es
precision highp float;
in vec3 aPos;in vec2 aUV;uniform mat4 uView;uniform mat4 uProj;
out vec2 vUV;
void main(){vUV=aUV;gl_Position=uProj*uView*vec4(aPos,1.0);}`;
 const fragmentShader=`#version 300 es
precision highp float;
in vec2 vUV;uniform float uTime;uniform float uLayer;out vec4 fragColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 p=vUV*2.0-1.0;
  float t=uTime*.65+uLayer*.45;
  // Five harmonics, amplitude 1/n^2: coherent Fourier interference at low cost.
  float field=0.0;
  for(int i=1;i<=5;i++){
    float h=float(i);
    field+=(1.0/(h*h))*sin((p.y*8.0+p.x*3.2)*h+t*(.95+1.1/h)+sin(p.x*h*2.0+t*.3));
  }
  float wobble=.05*field+.017*sin(19.0*p.y+t*2.4);
  // A rolling CRT-like scanline lattice gives texture without any image asset.
  float scan=.79+.21*sin((vUV.y+wobble)*620.0+t*13.0);
  float crt=.5+.5*sin((vUV.y+vUV.x*.19)*113.0-t*5.0+field*2.2);
  float noise=hash(floor(vUV*vec2(240.0,390.0))+floor(t*25.0));
  float edge=max(abs(p.x),abs(p.y));
  float wash=pow(clamp(1.0-edge,0.0,1.0),1.5);
  float grit=hash(floor(vUV*vec2(36.0,80.0))+floor(t*2.0));
  vec3 ink=vec3(.025,.020,.075);
  vec3 violet=vec3(.42,.16,.84),teal=vec3(.13,.82,.86);
  vec3 spectral=mix(violet,teal,clamp(.52+.46*sin(field*2.5+t*.75+p.x*8.0),0.0,1.0));
  // Film-like shadow wash adds apparent depth; second translucent plane adds parallax.
  float shadow=.18+.50*wash;
  vec3 col=mix(ink,spectral,shadow+.22*crt);
  col*=scan*(.84+.22*grit);
  col+=vec3(.09,.06,.17)*noise*.4;
  col+=vec3(.26,.27,.45)*pow(clamp(edge,0.0,1.0),9.0);
  float depthTint=.13*sin(field*3.1+p.x*8.0+t+uLayer*1.6);
  col+=vec3(depthTint*.4,-depthTint*.15,depthTint*.6);
  fragColor=vec4(clamp(col,0.0,1.0),.88);
}`;
 function createMesh(gl,locations,surface){
   if(!surface||![surface.x,surface.y,surface.z,surface.w,surface.h].every(Number.isFinite))throw new TypeError('Invalid portal surface');
   const {x,y,z,w,h}=surface,vertices=[];
   for(const dz of [0,.22]){
     const zz=z+dz;
     vertices.push(x-w/2,y,zz,0,0, x+w/2,y,zz,1,0, x+w/2,y+h,zz,1,1,
       x-w/2,y,zz,0,0, x+w/2,y+h,zz,1,1, x-w/2,y+h,zz,0,1);
   }
   const vao=gl.createVertexArray(),vbo=gl.createBuffer();
   gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
   gl.enableVertexAttribArray(locations.pos);gl.vertexAttribPointer(locations.pos,3,gl.FLOAT,false,5*4,0);
   gl.enableVertexAttribArray(locations.uv);gl.vertexAttribPointer(locations.uv,2,gl.FLOAT,false,5*4,3*4);
   gl.bindVertexArray(null);
   return Object.freeze({vao,vbo,count:12});
 }
 function deleteMesh(gl,mesh){gl.deleteVertexArray(mesh.vao);gl.deleteBuffer(mesh.vbo);}
 function draw(gl,{program,locations,surfaces,view,projection,time}){
   gl.useProgram(program);
   gl.uniformMatrix4fv(locations.view,false,view);
   gl.uniformMatrix4fv(locations.projection,false,projection);
   gl.uniform1f(locations.time,time);
   // Depth test remains enabled to keep the portal inside its architectural frame.
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
   for(const mesh of surfaces){
     gl.bindVertexArray(mesh.vao);
     for(let layer=0;layer<2;layer++){
       gl.uniform1f(locations.layer,layer);
       gl.drawArrays(gl.TRIANGLES,layer*6,6);
     }
   }
   gl.bindVertexArray(null);gl.depthMask(true);gl.disable(gl.BLEND);
 }
 return Object.freeze({VERSION,vertexShader,fragmentShader,frame,createMesh,deleteMesh,draw,resolve,activate,parseArrival});
});
