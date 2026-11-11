'use strict';
/* A zero-dependency 2.5D painter when the host blocks WebGL2.
   Uses the same declared travel nodes and immutable portal destinations as the primary WebGL scene.
   Decorative only: not a secure credential/payment surface. */
(function(root){
root.WebspaceFallback={launch};
function launch(){
 const g=root.WebspacePreviewGraph, $=id=>document.getElementById(id);
 const canvas=$('view'), ctx=canvas.getContext('2d',{alpha:true}),over=$('navOverlay').getContext('2d');
 if(!ctx){$('status').textContent='Neither WebGL2 nor Canvas 2D is available in this browser.';return;}
 $('status').textContent='Canvas 2D view · portable navigation mode';
 const entries={'fortress-gate':['fortress','portal',Math.PI],'chuzhoy-north':['garden','arrival',Math.PI],'gringotts-gerudo':['gringotts','arrival',0],'fortress-bank-rear':['fortress','bank_gate',0]};
 const query=new URLSearchParams(location.search),tag=query.get('ws_v')==='1'&&query.getAll('ws_entry').length===1?query.get('ws_entry'):null;
 const start=Object.prototype.hasOwnProperty.call(entries,tag||'')?entries[tag]:(document.documentElement.dataset.startWorld==='gringotts'?entries['gringotts-gerudo']:['fortress','throne',0]);
 let world=start[0],id=start[1],yaw=start[2],pitch=0,pos=[...g[world].nodes[id].p],anim=null,history=[],pointer=null,markers=[],drawer='',turningPortal=false;
 let w=1,h=1,last=0;
 const TAU=2*Math.PI,clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function label(world,id){return g[world].nodes[id]?.label||id}
 function at(){return g[world].nodes[id]}
 function notify(s){const el=$('toast');el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1900)}
 function heading(a,b){return Math.atan2(-(b[0]-a[0]),-(b[2]-a[2]))}
 function step(to){if(anim||!g[world].nodes[to])return;const p=[...g[world].nodes[to].p];let target=heading(pos,p),delta=(target-yaw+3*Math.PI)%TAU-Math.PI;anim={from:[...pos],to:p,t:performance.now(),startYaw:yaw,endYaw:yaw+delta,toId:to};}
 function move(newWorld,newId,newYaw){world=newWorld;id=newId;pos=[...g[world].nodes[id].p];yaw=newYaw;pitch=0;anim=null;history.push({world,node:id,time:new Date().toISOString()});refresh()}
 function activate(){const n=at();if(!n.portal||anim||turningPortal)return;
  const entry=entries[n.portal.entryTag];if(!entry||entry[0]!==n.portal.world||entry[1]!==n.portal.node){notify('Unpublished portal destination');return;}
  turningPortal=true;$('main').classList.add('portal-wiggle');
  setTimeout(()=>{turningPortal=false;$('main').classList.remove('portal-wiggle');
   const targets={garden:'../chuzhoy/index.html?ws_v=1&ws_entry=chuzhoy-north',fortress:'../fortress/index.html?ws_v=1&ws_entry='+(world==='gringotts'?'fortress-bank-rear':'fortress-gate'),gringotts:'../gringotts/index.html?ws_v=1&ws_entry=gringotts-gerudo'};
   if(targets[entry[0]])location.assign(new URL(targets[entry[0]],location.href));
   else move(...entry);
  },380);
 }
 function refresh(){
  $('world').textContent=g[world].name;$('place').textContent=label(world,id);
  $('description').textContent=world==='gringotts'?({arrival:'An impossible banking hall shimmers ahead; the prismatic return gate waits at your back.',atrium:'Emerald lanterns, marble arches and an improbable goblin bureaucracy.',tellers:'Three emerald-eyed goblin tellers sit behind gilded cages. A paper guest contract awaits.',exchange:'A pair of brass scales measure only make-believe Aurics and Crescents.',post:'An enchanted gallery connects to official Proton services by explicit choice.',calendar:'Consult the animated calendar, or open Proton Calendar in its own tab.',vault:'Heavy bronze vault doors guard an unfinished exhibit.',privacy:'No actual money or private records are stored in this world.'}[id]||'Banking fairy tale'):
  world==='fortress'&&id==='throne'?'Continue down the procession, or turn behind the throne to find the new bank passage.':'A connected chapter of the Webspace. Use the destination ribbon to travel.';
  const ribbon=$('travelRibbon');ribbon.replaceChildren();const add=(name,fn,cls)=>{const b=document.createElement('button');b.type='button';b.className='ribbon-item '+cls;b.textContent=name;b.onclick=fn;ribbon.append(b)};
  for(const link of at().links)add('↗ '+label(world,link),()=>step(link),'walk');
  if(at().portal)add('◈ Enter '+g[at().portal.world].name,activate,'portal');
  if(at().interact)add('✧ '+({'directory':'Branch directory','contract':'Sign guest contract','ledger':'View mock ledger','proton':'Proton services','calendar':'Open wall calendar','vault':'Inspect vault doors','privacy':'Privacy charter'}[at().interact]||'Inspect'),()=>root.WebspaceBankDesk?.open(at().interact),'screen');
  if(world==='fortress'&&id==='hall')add('▣ VNN screen',()=>notify('VNN uses the WebGL Screen Kit in GPU mode'),'screen');
  $('portalAction').classList.toggle('visible',Boolean(at().portal));
  if(drawer)showDrawer(drawer);
 }
 function relative(p){const dx=p[0]-pos[0],dy=p[1]-pos[1],dz=p[2]-pos[2],r=dx*Math.cos(yaw)-dz*Math.sin(yaw),f=-dx*Math.sin(yaw)-dz*Math.cos(yaw);
  const ff=f*Math.cos(pitch)+dy*Math.sin(pitch),uu=dy*Math.cos(pitch)-f*Math.sin(pitch);
  if(ff<.12)return null;const focal=h/(2*Math.tan(70*Math.PI/360));return{x:w/2+focal*r/ff,y:h/2-focal*uu/ff,d:ff,s:focal/ff};}
 let painter=[];
 function poly(points,color,stroke=null,line=1){const pp=points.map(relative);if(pp.some(p=>!p))return;const depth=pp.reduce((v,p)=>v+p.d,0)/pp.length;painter.push({depth,paint(){ctx.beginPath();ctx.moveTo(pp[0].x,pp[0].y);for(let j=1;j<pp.length;j++)ctx.lineTo(pp[j].x,pp[j].y);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.lineWidth=line;ctx.strokeStyle=stroke;ctx.stroke()}}});}
 function line(a,b,color,thick=2){const A=relative(a),B=relative(b);if(!A||!B)return;painter.push({depth:(A.d+B.d)/2,paint(){ctx.strokeStyle=color;ctx.lineWidth=thick;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke()}});}
 function ellipse(p,rx,ry,color,glow=0){const q=relative(p);if(!q)return;const ax=Math.max(1,Math.min(380,rx*q.s)),ay=Math.max(1,Math.min(380,ry*q.s));painter.push({depth:q.d,paint(){if(glow){const rad=Math.max(ax,ay)*2;const grd=ctx.createRadialGradient(q.x,q.y,2,q.x,q.y,rad);grd.addColorStop(0,color);grd.addColorStop(1,'transparent');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(q.x,q.y,rad,0,TAU);ctx.fill()}ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(q.x,q.y,ax,ay,0,0,TAU);ctx.fill()}});}
 function text3(s,p,size,color='#f4dfaa'){const q=relative(p);if(!q)return;painter.push({depth:q.d,paint(){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#0e1429';ctx.shadowColor='#10101a';ctx.shadowBlur=10;ctx.font='bold '+clamp(size*q.s,8,72)+'px Georgia';ctx.strokeStyle='#151e27';ctx.lineWidth=3;ctx.strokeText(s,q.x,q.y);ctx.fillStyle=color;ctx.fillText(s,q.x,q.y);ctx.restore()}});}
 function box(x,y,z,dx,dy,dz,col,trim){const X=x-dx/2,Z=z-dz/2;poly([[X,y,Z],[X+dx,y,Z],[X+dx,y+dy,Z],[X,y+dy,Z]],col,trim);poly([[X,y,Z+dz],[X+dx,y,Z+dz],[X+dx,y+dy,Z+dz],[X,y+dy,Z+dz]],col,trim);poly([[X,y+dy,Z],[X+dx,y+dy,Z],[X+dx,y+dy,Z+dz],[X,y+dy,Z+dz]],col,trim);}
 function column(x,z,height,color='#c8b397'){for(let j=0;j<8;j++){const a=TAU*j/8,b=TAU*(j+1)/8,r=.85;poly([[x+r*Math.cos(a),0,z+r*Math.sin(a)],[x+r*Math.cos(b),0,z+r*Math.sin(b)],[x+r*Math.cos(b),height,z+r*Math.sin(b)],[x+r*Math.cos(a),height,z+r*Math.sin(a)]],j%2?color:'#b39b79');}box(x,height,z,2.5,.65,2.5,'#ac8349','#e8c779');box(x,0,z,2.7,.35,2.7,'#bda583');}
 function arch(z,width,height,col='#a28b79'){let coords=[];for(let i=0;i<=22;i++){const t=i/22,x=-width/2+width*t,y=height-1.4+2.8*(1-Math.abs(2*t-1))-2.4*Math.pow(Math.abs(2*t-1),2);coords.push([x,y,z]);}for(let i=0;i<coords.length-1;i++)line(coords[i],coords[i+1],col,4);}
 function floor(sizeZ,startZ,endZ,halfWidth,color){for(let z=startZ;z<endZ;z+=sizeZ)poly([[-halfWidth,-.08,z],[halfWidth,-.08,z],[halfWidth,-.08,z+sizeZ],[-halfWidth,-.08,z+sizeZ]],color,'#aa8c6940',.5);}
 function portal(x,z){const tm=performance.now()*.001;const a='#723b9a',b='#26afa6';box(x,0,z,9,8,.5,'#a68344','#ffdc82');
  const left=x-3.7,right=x+3.7;poly([[left,.5,z+.31],[right,.5,z+.31],[right,7.6,z+.31],[left,7.6,z+.31]],'#38215c','#a27ad2');
  for(let k=0;k<11;k++){const yy=.7+k*.58,phase=.5+.5*Math.sin(tm*2+k*2.8);line([left+.2,yy,z+.4],[right-.2,yy+.42*Math.sin(tm+k),z+.4],phase>.5?b:a,1.5+phase*2);}
  for(const xx of [left-.8,right+.8]){ellipse([xx,7.7,z],.45,.4,'#e8c577',6);ellipse([xx,.2,z],.36,.33,'#d8ad5c',4)};
 }
 function drawBank(){floor(4,-76,47,29,'#5a514e');box(0,.01,-7,8,.05,91,'#534254','#b99355');
  for(let z=-60;z<38;z+=11){for(const side of [-1,1]){
    const x=side*27.6;box(x,0,z,2.2,14,10.8,'#716c70','#9e8561');column(side*22,z,12.8,'#dfcbaa');
    line([side*22,13,z],[0,17,z],'#d6ae63',2);
    ellipse([side*23,9,z],.18,.24,'#efcc84',1);
   }arch(z,41,13.2,'#c6af86');
   for(const x of [-15,-7,0,7,15])ellipse([x,14.3,z],.13,.13,'#f0cd75',1);
  }
  for(let z=-58;z<=38;z+=6){line([-4,.04,z],[4,.04,z],'#a77d49',1.5);for(const x of [-26,-18,-10,10,18,26])line([x,.04,z],[x+2,.04,z+2],'#998269',1)}
  box(0,14,-10,50,.6,99,'#393846','#d2a85b');portal(0,41);
  for(const [x,z] of [[0,6],[0,-30],[16,-14],[-16,-14]]){
   ellipse([x,9.2,z],1.4,.46,'#f1be5b',5);
   for(let i=0;i<8;i++){const a=i*TAU/8;line([x,10.5,z],[x+2.6*Math.cos(a),8.3,z+2.6*Math.sin(a)],'#a98248');ellipse([x+2.6*Math.cos(a),8.3,z+2.6*Math.sin(a)],.22,.23,'#f9ce63',8)}
  }
  text3('GRINGOTTS  ·  GERUDO BRANCH',[0,9,-11],1.1,'#e7c584');
  for(const x of [-12,0,12]){
   box(x,.6,-11,9.5,2.2,3,'#55413b','#d2a155');
   for(let t=-4.25;t<=4.4;t+=1.1)line([x+t,2.7,-9.7],[x+t,5.4,-9.7],'#a9844b',1.9);
   ellipse([x,4.4,-12.4],.71,.67,'#72a16b');ellipse([x,3.3,-12.4],.7,1.0,'#48634c');
   ellipse([x-.82,4.52,-12.4],.48,.20,'#6c9b64');ellipse([x+.82,4.52,-12.4],.48,.20,'#6c9b64');
   for(const side of [-1,1])ellipse([x+side*.23,4.58,-11.96],.10,.10,'#f9d67f',2);
   ellipse([x,4.21,-11.91],.16,.22,'#93b281');
   box(x,2.9,-9,2,.07,1.6,'#f8e8bf','#b89551');line([x+.4,3,-8.6],[x+1.0,4,-8.4],'#f6c95a',2);
  }
  box(-16,.15,-25,15,2.1,2.5,'#51433e','#e9bd68');line([-21,7,-24],[-11,7,-24],'#d8b46c',4);line([-16,2.5,-24],[-16,8,-24],'#e4c072',4);
  for(const x of [-21,-11]){line([x,7,-24],[x,4.3,-24],'#d9bb7d',2);ellipse([x,4.3,-24],1,.35,'#f5d16f');}
  text3('EXCHANGE',[-16,9,-27],1.25,'#e4c383');
  for(let z=-33;z<-5;z+=5)for(let y=2;y<=6;y+=2){box(27, y,z,.7,1.5,3.7,'#23616b','#b7a471');text3('✉',[26.1,y+.8,z],.55,'#baf3db')}
  text3('CORRESPONDENCE',[15,9,-27],1.0,'#d1b7e5');
  for(let i=0;i<12;i++){const a=i*TAU/12;ellipse([26.5,6+3.0*Math.cos(a),9+3.0*Math.sin(a)],.13,.13,'#e4c676')}
  ellipse([26.1,6,9],.8,.75,'#e5c47b',3);text3('CALENDAR',[16,9,10],.86,'#d6f9e5');
  for(const x of [-27,27])for(let z=-35;z>=-59;z-=5.8){
   box(x,0,z,2.2,8,4.9,'#47434a','#bd9654');ellipse([x+(x<0?2:-2),4,z],.9,1.3,'#dec177');
  }
  text3('THE UNDERHALL · PRIVATE VAULTS',[0,10,-56],.8,'#e3cb98');
  ellipse([0,5,-64],2.0,2.0,'#44b6a5',6);box(0,0,-66,16,8,1.2,'#4e4650','#e3bc60');
 }
 function drawFortress(){floor(5,-96,46,15,'#7e6349');box(0,.02,-35,4,.07,114,'#744956','#d0a061');
  for(let z=-86;z<=33;z+=10){for(const side of [-1,1]){box(side*14.5,0,z,1.9,9,9.8,'#b58e5b','#c99c64');column(side*11.5,z,7.5,'#dbb77d')}arch(z,24,7.6,'#dec293')}
  for(let z=-82;z<=30;z+=12)for(const x of [-8,8])ellipse([x,6.7,z],.19,.29,'#f5c377',6);
  box(0,.1,8.4,8,1,4.5,'#b78d58','#e0ba75');box(0,1,9.3,4.2,4.3,1.0,'#543954','#d8aa5d');text3('ROYAL COURT',[0,7,11],1.0,'#e8c57e');
  text3('TO GRINGOTTS',[0,8,28],1.0,'#f4d99d');portal(0,38);portal(0,-84);
  for(let z=12;z<38;z+=5)for(const x of [-8,8])ellipse([x,4,z],.18,.21,'#f6c767',3);
 }
 function drawGarden(){floor(10,-80,80,70,'#23382d');
  for(let i=0;i<48;i++){const a=i*TAU/48,r=40+(i%5)*2.7,x=Math.cos(a)*r,z=Math.sin(a)*r;
   line([x,0,z],[x,10+i%7,z],'#394e3e',2.5);ellipse([x,12+i%7,z],3.0,4.0,i%3?'#214239':'#2b5148');
  }
  for(let i=0;i<32;i++){const a=i*TAU/32,r=22,x=Math.cos(a)*r,z=Math.sin(a)*r;ellipse([x,.07,z],.9,.2,'#76654d');}
  for(let i=0;i<12;i++){const a=i*TAU/12;column(35*Math.cos(a),35*Math.sin(a),5+i%4,'#c7d3d1')}
  ellipse([0,.1,0],6.5,.6,'#a3d5d2');ellipse([0,2.5,0],2.3,2.5,'#d5d5cd');ellipse([0,5.6,0],1.2,1.2,'#86cee9',5);
  for(let i=0;i<5;i++){const a=i*TAU/5;ellipse([5*Math.sin(a),3.0,5*Math.cos(a)],.25,.35,'#9ef0e7',3)}
  for(let i=0;i<17;i++){const a=i*TAU/17;ellipse([-31+4*Math.cos(a),10+3*Math.sin(a),-11],.13,.14,'#edbf84');}
  portal(14,-34);
 }
 function draw(t){requestAnimationFrame(draw);const dpr=Math.min(devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();if(rect.width!==w||rect.height!==h||canvas.width!==Math.round(rect.width*dpr)){w=rect.width;h=rect.height;canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));$('navOverlay').width=canvas.width;$('navOverlay').height=canvas.height;}
  ctx.setTransform(dpr,0,0,dpr,0,0);over.setTransform(dpr,0,0,dpr,0,0);
  const colors=world==='gringotts'?['#18233b','#4d4255','#8c6b55']:world==='garden'?['#101f44','#2c5867','#406057']:['#304c6c','#b79970','#946d54'];
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,colors[0]);bg.addColorStop(.54,colors[1]);bg.addColorStop(1,colors[2]);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  if(anim){const u=clamp((t-anim.t)/720,0,1),e=u*u*(3-2*u);pos=anim.from.map((n,k)=>n+(anim.to[k]-n)*e);yaw=anim.startYaw+(anim.endYaw-anim.startYaw)*e;
   if(u>=1){id=anim.toId;anim=null;history.push({world,node:id,time:new Date().toISOString()});refresh()}}
  painter=[];if(world==='gringotts')drawBank();else if(world==='fortress')drawFortress();else drawGarden();
  painter.sort((a,b)=>b.depth-a.depth);for(const obj of painter)obj.paint();
  over.clearRect(0,0,w,h);markers=[];
  if(!anim){for(const link of at().links){const n=g[world].nodes[link],p=relative([n.p[0],2.8,n.p[2]]);if(!p||p.x<14||p.x>w-14||p.y<60||p.y>h-130)continue;
   markers.push({x:p.x,y:p.y,link});over.beginPath();over.arc(p.x,p.y,15,0,TAU);over.fillStyle='#22393dbb';over.fill();over.strokeStyle='#efd59c';over.lineWidth=2;over.stroke();over.fillStyle='#fae6b7';over.textAlign='center';over.font='bold 19px system-ui';over.fillText('↑',p.x,p.y+7);
  }}
  over.fillStyle='#fbf2dbb3';over.textAlign='center';over.font='18px Georgia';over.fillText('✧',w/2,h/2);
 }
 function showDrawer(which){drawer=which;const d=$('drawer');d.classList.add('open');
  d.replaceChildren();const h=document.createElement('h2');h.textContent=which==='map'?'Navigation map':which==='history'?'Journey history':'How to play';d.append(h);
  if(which==='map')for(const [key,n] of Object.entries(g[world].nodes)){const b=document.createElement('button');b.textContent=(key===id?'● ':'○ ')+n.label;b.onclick=()=>{step(key);d.classList.remove('open');drawer=''};d.append(b);}
  else{const p=document.createElement('p');p.textContent=which==='history'?history.map(x=>g[x.world].name+' / '+label(x.world,x.node)).join(' → '):'Turn with ←/→ or drag the world. Use the always-visible destination ribbon to step through neighboring nodes. Behind the throne is the Gringotts entrance. Use ◈ for portals and ✧ to open a banker’s paper interface. The 2D renderer is an intentional fallback for browsers without WebGL2.';d.append(p)}
 }
 $('mapBtn').onclick=()=>showDrawer('map');$('historyBtn').onclick=()=>showDrawer('history');$('helpBtn').onclick=()=>showDrawer('help');
 $('forward').onclick=()=>{const links=at().links;if(links.length)step(links.find(x=>!history.length||x!==history.at(-2)?.node)||links[0]);else if(at().portal)activate()};
 $('back').onclick=()=>{const prev=history.at(-2)?.node;if(prev&&at().links.includes(prev))step(prev);else if(at().links.length)step(at().links.at(-1))};
 $('turnLeft').onclick=()=>{yaw+=Math.PI/7};$('turnRight').onclick=()=>{yaw-=Math.PI/7};
 $('portalAction').onclick=activate;
 $('reset').onclick=()=>{history=[];move('fortress','throne',0);notify('Returned to the throne')};
 $('export').onclick=()=>{const blob=new Blob([JSON.stringify({history,renderer:'Canvas2D',exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='webspace-journey.json';a.click();URL.revokeObjectURL(a.href)};
 canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.moved||=(Math.hypot(e.clientX-pointer.originX,e.clientY-pointer.originY)>7);if(pointer.moved){yaw+=dx*.005;pitch=clamp(pitch-dy*.004,-.7,1.1)}pointer.x=e.clientX;pointer.y=e.clientY});
 canvas.addEventListener('pointerup',e=>{if(pointer&&!pointer.moved){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;for(const m of markers)if(Math.hypot(m.x-x,m.y-y)<25){step(m.link);break}}pointer=null});
 root.addEventListener('keydown',e=>{if(root.WebspaceBankDesk?.isOpen?.())return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
  if(e.key==='ArrowLeft')yaw+=Math.PI/8;else if(e.key==='ArrowRight')yaw-=Math.PI/8;
  else if(e.key==='ArrowUp')$('forward').click();else if(e.key==='ArrowDown')$('back').click();else if(e.key.toLowerCase()==='e'&&at().interact)root.WebspaceBankDesk?.open(at().interact);
  else if(e.key==='Escape'){$('drawer').classList.remove('open');drawer=''};
 });
 history.push({world,node:id,time:new Date().toISOString()});refresh();requestAnimationFrame(draw);
}
})(window);
