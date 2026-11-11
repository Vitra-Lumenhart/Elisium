/*!
 * WEBSPACE SCREEN KIT v1 — world-space iframe, safe focus and sandboxed bridge.
 * Reuse this whole file. It has ZERO external dependencies and does not modify
 * the portal module. See SCREEN_PROTOCOL.md for authoring + security guidance.
 *
 * Important browser fact: foreign websites cannot be uploaded as WebGL textures
 * because of cross-origin protection. We project an ordinary iframe onto the
 * perspective-correct 2D quadrilateral using a CSS matrix3d homography.
 * The iframe remains a real DOM document, not a screenshot or fake 3D texture.
 * Depth limitation: DOM iframe cannot occlude correctly against arbitrary GPU
 * geometry. It should face its audience and be mounted on a clear wall.
 *
 * Strict defaults: HTTPS only, no live network until deliberate activation,
 * iframe sandbox `allow-scripts` ONLY, referrerpolicy=no-referrer,
 * no shared history, no credentials, no popups, no forms, no top navigation.
 *
 * Bridge treats 'null' postMessage origins as UNTRUSTED. A nonce + frame-source
 * check filters stray messages but is NOT AUTHENTICATION. Only screen:ready
 * status is processed; requests to navigate or grant capabilities are ignored.
 */
(function(root,factory){
 const kit=factory();if(typeof module==='object'&&module.exports)module.exports=kit;
 if(root)root.WebspaceScreen=kit;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const WIDTH=640,HEIGHT=360;
 // Solve the 8 parameter homography mapping source px -> projected viewport px.
 // x=(a*u+b*v+c)/(g*u+h*v+1); y=(d*u+e*v+f)/(g*u+h*v+1).
 function homography(points,w=WIDTH,h=HEIGHT){
  if(!Array.isArray(points)||points.length!==4||points.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
  const src=[[0,0],[w,0],[w,h],[0,h]];
  const A=[];
  for(let i=0;i<4;i++){
    const [u,v]=src[i],[x,y]=[points[i].x,points[i].y];
    A.push([u,v,1,0,0,0,-x*u,-x*v,x]);
    A.push([0,0,0,u,v,1,-y*u,-y*v,y]);
  }
  for(let col=0;col<8;col++){
    let k=col;for(let r=col+1;r<8;r++)if(Math.abs(A[r][col])>Math.abs(A[k][col]))k=r;
    if(Math.abs(A[k][col])<1e-8)return null;
    [A[col],A[k]]=[A[k],A[col]];
    const inv=1/A[col][col];for(let j=col;j<9;j++)A[col][j]*=inv;
    for(let r=0;r<8;r++)if(r!==col){const mul=A[r][col];for(let j=col;j<9;j++)A[r][j]-=mul*A[col][j];}
  }
  const [a,b,c,d,e,f,g,hh]=A.map(row=>row[8]);
  // CSS column-major matrix4 implements the 2D perspective homography.
  const m=[a,d,0,g,b,e,0,hh,0,0,1,0,c,f,0,1];
  return m.every(Number.isFinite)?'matrix3d('+m.map(v=>v.toPrecision(11)).join(',')+')':null;
 }
 function htmlEscape(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
 function standbyHTML(title,screenId){
  // srcdoc is intentionally original artwork and never claims to show live news.
  const t=htmlEscape(title),id=htmlEscape(screenId);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>*{box-sizing:border-box}body{margin:0;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 74% 20%,#2a5a77,#09131f 58%,#060b15);color:#e8e1c7;font:16px system-ui}
  main{height:100%;border:8px solid #173345;padding:22px 28px;display:flex;flex-direction:column;justify-content:space-between;position:relative}
  main:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 4px,#02081122 5px 6px)}
  .signal{font-size:12px;letter-spacing:.28em;color:#8de1d9}.main{font-size:62px;letter-spacing:.12em;font-weight:800;line-height:1.05;text-shadow:0 0 28px #5bbbd267}
  .sub{font-size:17px;letter-spacing:.14em;color:#b7c6c3}small{font-size:12px;color:#93adbf} .rules{height:2px;background:linear-gradient(90deg,#e2c186,#58d1d8,transparent)}
  </style></head><body><main><div class="signal">◈ WEBSPACE / SCREEN ${id}</div><div><div class="main">VNN</div><div class="rules"></div><div class="sub">${t.toUpperCase()}</div></div><small>STANDBY · Select “Load live VNN” to request news.vitra.ams</small></main>
  <script>window.addEventListener('message',e=>{let m=e.data;if(m&&m.protocol==='webspace/1'&&m.type==='screen:host-hello'&&m.screenId==='${id}')parent.postMessage({protocol:'webspace/1',kind:'screen',type:'screen:ready',screenId:'${id}',nonce:m.nonce,payload:{mode:'standby'}},'*');});<\/script></body></html>`;
 }
 function create(opts){
   const Ch=opts.channel||window.WebspaceChannel;if(!Ch)throw Error('Load webspace-channel.js before Screen');
   const id=opts.id,title=opts.title||'Webspace screen',root=opts.container;
   if(!Ch.safeId(id)||!root||!root.appendChild)throw Error('Invalid screen host');
   const remote=Ch.safeEmbedURL(opts.url,{localhost:opts.allowLocalhost===true});
   const token=Ch.nonce();let focused=false,loaded=false,bridgeReady=false;
   const scrim=document.createElement('div');scrim.className='ws-screen-scrim';
   const pane=document.createElement('div');pane.className='ws-screen-surface';pane.setAttribute('aria-label',title);
   const tools=document.createElement('div');tools.className='ws-screen-tools';
   const label=document.createElement('strong');label.textContent='▣ '+title;
   const load=document.createElement('button');load.type='button';load.textContent='Load live VNN';
   const open=document.createElement('button');open.type='button';open.textContent='Open website ↗';
   const close=document.createElement('button');close.type='button';close.textContent='Close ×';
   tools.append(label,load,open,close);
   const frame=document.createElement('iframe');frame.setAttribute('title',title);
   frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');
   frame.setAttribute('loading','lazy');frame.setAttribute('allow','');
   frame.srcdoc=standbyHTML(title,id);frame.setAttribute('aria-label','Embedded '+title);
   const foot=document.createElement('div');foot.className='ws-screen-foot';
   foot.textContent='Preview only · External site remains independent · Screen messages convey no player history';
   pane.append(tools,frame,foot);root.append(scrim,pane);
   const style=document.createElement('style');style.textContent=`
   .ws-screen-scrim{display:none;position:absolute;inset:0;background:#030a13d9;z-index:8}
   .ws-screen-surface{display:none;position:absolute;z-index:2;width:${WIDTH}px;height:${HEIGHT}px;transform-origin:0 0;backface-visibility:hidden;pointer-events:none;overflow:hidden;background:#0b1320;border:2px solid #b99959;box-shadow:inset 0 0 20px #60badb59}
   .ws-screen-surface:not(.focus){pointer-events:none!important} .ws-screen-surface iframe{border:0;width:100%;height:100%;display:block;pointer-events:none;background:#081520}
   .ws-screen-tools,.ws-screen-foot{display:none}
   .ws-screen-surface.focus{z-index:10;left:4%;top:5%;width:92%;height:87%;transform:none!important;pointer-events:auto;display:flex;flex-direction:column;border:2px solid #ad9e79;border-radius:11px;box-shadow:0 15px 80px #000c}
   .ws-screen-surface.focus iframe{flex:1;min-height:0;pointer-events:auto}
   .ws-screen-surface.focus .ws-screen-tools{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:10px 12px;background:#101c28}
   .ws-screen-tools strong{flex:1;font:600 13px system-ui;color:#e9e6cf;min-width:115px}
   .ws-screen-tools button{font:12px system-ui;background:#283949;color:#fff;border:1px solid #688193;border-radius:7px;padding:7px 10px;cursor:pointer}
   .ws-screen-tools button:first-of-type{background:#3b6470;border-color:#8dc6c4}
   .ws-screen-surface.focus .ws-screen-foot{display:block;padding:6px 10px;background:#15212d;font:11px system-ui;color:#b8c7ce}
   `;
   document.head.appendChild(style);
   const onMessage=e=>{
     // The sandbox intentionally creates opaque/null origins. The source-window
     // and nonce checks filter unrelated messages, but cannot authenticate VNN.
     if(e.source!==frame.contentWindow)return;
     const m=e.data;if(!Ch.valid(m)||m.screenId!==id||m.nonce!==token)return;
     if(m.type==='screen:ready'){bridgeReady=true;if(!loaded)foot.textContent='Webspace screen bridge ready · Standby artwork (not live news)';}
   };
   window.addEventListener('message',onMessage);
   frame.addEventListener('load',()=>{
     bridgeReady=false;
     try{frame.contentWindow.postMessage(Ch.envelope({kind:'screen',type:'screen:host-hello',screenId:id,nonce:token,payload:{capabilities:['display'],viewer:'webspace/1'}}),'*');}catch{}
   });
   function focus(){focused=true;scrim.style.display='block';pane.classList.add('focus');pane.style.display='flex';pane.style.transform='none';close.focus();}
   function unfocus(){focused=false;scrim.style.display='none';pane.classList.remove('focus');pane.style.display='none';pane.style.transform='none';}
   function loadLive(){
     // Only this explicit human interaction initiates a network request.
     if(loaded)return;
     loaded=true;frame.removeAttribute('srcdoc');frame.src=remote;
     load.textContent='Live request sent';load.disabled=true;
     foot.textContent='Live content is subject to private DNS, login and the site’s frame-ancestors/X-Frame-Options policy. If blank, use Open website ↗.';
   }
   function update(corners){if(focused)return;
     const matrix=homography(corners);
     if(!matrix){pane.style.display='none';return;}
     const area=Math.abs((corners[1].x-corners[0].x)*(corners[3].y-corners[0].y)-(corners[1].y-corners[0].y)*(corners[3].x-corners[0].x));
     pane.style.display=area<140?'none':'block';pane.style.transform=matrix;
   }
   load.onclick=loadLive;
   open.onclick=()=>window.open(remote,'_blank','noopener,noreferrer');
   close.onclick=unfocus;scrim.onclick=unfocus;
   return Object.freeze({id,focus,close:unfocus,loadLive,update,hide:()=>{if(!focused)pane.style.display='none';},destroy:()=>{window.removeEventListener('message',onMessage);pane.remove();scrim.remove();style.remove();},get loaded(){return loaded;},get bridgeReady(){return bridgeReady;}});
 }
 return Object.freeze({WIDTH,HEIGHT,homography,create,standbyHTML});
});
