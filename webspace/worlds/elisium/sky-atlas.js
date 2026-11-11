/* Elisium sovereign-sky v8: authored adjunct to the ORIGINAL 4.6 runtime.
 * Ownership: the parent owns its native sky and story; Kilns owns rooms, art and journal.
 * Neither Zodiac nor twelve Iranian month dedications are interchangeable calendars.
 * No credentials, remote Matrix feeds, or agent tool execution.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const gameFrame=$('elisiumGame'),houseFrame=$('houseFrame'),panel=$('atlasPanel');
const houseSheet=$('kilnsPocket'),quietDialog=$('secularDialogue');
const KEY='webspace.elisium.sky-atlas.v8',HKEY='webspace.elisium.kilns.handoff.v1';
let DATA=null,g=null,cw=null,selected=0,mode='atlas',quietVisited=false,houseOpen=false,lastNode='',skyPatched=false;
const escapeText=s=>String(s);
const empty=()=>({observed:[],concordances:[],exitChoices:[],houseVisits:0,houseObjects:[],notes:[]});
let S=empty();
try{const old=JSON.parse(sessionStorage.getItem(KEY)||'null');if(old&&typeof old==='object'){S.observed=Array.isArray(old.observed)?old.observed.filter(x=>Number.isInteger(x)&&x>=0&&x<12).slice(0,12):[];S.concordances=Array.isArray(old.concordances)?old.concordances.filter(x=>typeof x==='string').slice(0,12):[];S.exitChoices=Array.isArray(old.exitChoices)?old.exitChoices.filter(x=>['leave','question','remain'].includes(x)).slice(0,8):[];S.houseVisits=Math.max(0,Math.min(999,old.houseVisits|0));S.houseObjects=Array.isArray(old.houseObjects)?old.houseObjects.filter(x=>/^H(?:0[1-9]|1[0-9]|2[0-4])$/.test(x)).slice(0,24):[];}}catch{}
function persist(){try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch{}}
function notify(msg){$('atlasNote').textContent=msg;}
function content(n,v){n.textContent=String(v)}
const pt=id=>DATA?.points.find(p=>p.id===id);
function game(){return gameFrame?.contentWindow?.ELISIUM||null}
function escapeEsc(s){return String(s).replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[k]));}
function boot(){
 cw=gameFrame?.contentWindow;g=game();if(!g||!DATA||!cw?.document?.getElementById('hudLayer'))return;
 if(!skyPatched){patchSky();addQuietCircle();installNativeThreshold();skyPatched=true;}
 updateQuest();
}
function patchSky(){
 const sky=g.sky,original=sky.render;
 if(typeof original!=='function'||typeof sky.projectDirection!=='function')return;
 // The addon renders a positional SCHEMATIC on the same sky canvas. The stars
 // are artistic sign shapes, not IAU surveyed coordinates or an ephemeris.
 sky.render=function(ctx,w,h,t,camera){original.call(this,ctx,w,h,t,camera);drawSigns(ctx,w,h,t,camera)};
}
function drawSigns(ctx,w,h,t,camera){
 if(!DATA)return;
 const projection=g.sky.projectDirection;const found=new Set(S.observed);
 ctx.save();
 DATA.months.forEach((m,i)=>{
  const az=m.az,el=m.el;const p=projection(az,el,camera,w,h);
  if(!p||p.x<45||p.x>w-45||p.y<40||p.y>h-45)return;
  const radius=i===4?23:15,glow=found.has(i),phi=(t*.004+i*.71),verts=[];
  for(let j=0;j<6;j++){const a=j*Math.PI*2/6+phi;verts.push([p.x+radius*Math.cos(a)*(j%2?.62:1),p.y+radius*.67*Math.sin(a)])}
  ctx.strokeStyle=glow?'#ffe0a4':'#a8b9ce';ctx.lineWidth=i===4?2.1:1;ctx.globalAlpha=glow?.87:.46;
  ctx.beginPath();ctx.moveTo(...verts[0]);for(let j=1;j<verts.length;j++)ctx.lineTo(...verts[j]);ctx.closePath();ctx.stroke();
  for(const [x,y] of verts){ctx.fillStyle=glow?'#ffeac1':'#d7e8f0';ctx.beginPath();ctx.arc(x,y,i===4?2.2:1.3,0,Math.PI*2);ctx.fill();}
  ctx.font='12px Georgia';ctx.textAlign='center';ctx.fillStyle=glow?'#ffeabf':'#c4cbdb';ctx.fillText(m.zodiac+(i===4?' · lion':i===3?' · Sirius':''),p.x,p.y-27);
 });
 ctx.restore();
}
function addQuietCircle(){
 const nodes=g.nodes,edges=g.edgeList,id='quietCircle';if(nodes[id])return;
 nodes[id]={name:'The Dwarfs’ Quiet Circle',kind:'secular',desc:'An out-of-the-way circle near the portal. Skepticism, atheism, fear of manipulation, and the right to depart are not the same thing.',p:[14,1.7,97],links:['tip0']};
 if(!nodes.tip0.links.includes(id))nodes.tip0.links.push(id);
 if(!edges.some(([a,b])=>(a===id&&b==='tip0')||(b===id&&a==='tip0')))edges.push(['quietCircle','tip0']);
 const hud=cw.document.getElementById('hudLayer'),btn=cw.document.createElement('button'),ground=cw.document.createElement('div');
 btn.id='quietWaypoint';btn.type='button';btn.hidden=true;btn.textContent='◇ Quiet Circle · a way aside';btn.style.cssText='position:absolute;z-index:99;transform:translate(-50%,-50%);background:#1c2c3cf2;color:#f4e5be;padding:9px 12px;border:1px solid #bcaa85;border-radius:9px;font:14px Georgia;cursor:pointer;pointer-events:auto;';
 btn.onclick=()=>g.go(id);hud.append(btn);
 ground.id='quietGround';ground.hidden=true;ground.style.cssText='position:absolute;left:44%;top:63%;width:160px;height:55px;border:3px dotted #c3b18b77;border-radius:50%;transform:perspective(230px) rotateX(57deg);pointer-events:none;';hud.append(ground);
}
function installNativeThreshold(){
 const doc=cw.document,button=doc.getElementById('interact');
 // The House of Books has its own legacy 4.6 inner modal. Entering the
 // actual child-world is offered explicitly as a physical doorway.
 if(button)button.addEventListener('click',ev=>{if(!houseOpen&&g.getState().current==='house'){ev.preventDefault();ev.stopImmediatePropagation();openHouse()}},true);
 doc.addEventListener('keydown',ev=>{if(!houseOpen&&g.getState().current==='house'&&['e','E'].includes(ev.key)){ev.preventDefault();ev.stopImmediatePropagation();openHouse()}},true);
}
function updateQuest(){
 if(!g||!DATA||houseOpen)return;
 let state=g.getState(),id=state.current||'tip0';
 let msg=id==='tip6'?'Asha’s Orchard: follow Tir and Sirius, or Dey and the Creator; the zodiac is a separate layer. Open the Sky Atlas.':
 id==='tip4'?'Aslan and the Lion: seek Leo as an analogy, not evidence of a shared deity.':
 id==='tip0'?'The portal offers an honest exit. Look behind you for a little circle that asks why one might leave.':
 id==='quietCircle'?'An optional secular conversation awaits; neither assent nor departure is scored.':
 id==='house'||id==='vestibule'?'The Kilns keeps tools, books and alternate witnesses. Open its physical house when invited.':
 id.startsWith('tip')?'A different tradition stands here. Open the Sky Atlas for a comparison that preserves distinctions.':
 S.observed.length?'You have witnessed '+S.observed.length+' of twelve schematic signs. Revisit a tip or investigate the house.':
 'The garden issues the questions; its smaller library offers instruments. Explore the seven points.';
 content($('atlasHint'),msg);
 if(id==='quietCircle'&&lastNode!==id&&!quietVisited){quietVisited=true;quietDialog.hidden=false;}
 lastNode=id;
 const btn=cw.document.getElementById('quietWaypoint'),ground=cw.document.getElementById('quietGround');
 if(btn){
  const v=g.getState(),atTip=v.current==='tip0',dx=14,dz=11,heading=Math.atan2(-dx,-dz);
  const error=Math.atan2(Math.sin(heading-v.yaw),Math.cos(heading-v.yaw));
  btn.hidden=!(atTip&&Math.abs(error)<.68);
  if(!btn.hidden){const canvas=cw.document.getElementById('world'),rect=canvas?.getBoundingClientRect();btn.style.left=(rect?rect.width/2+error*rect.width*.35:250)+'px';btn.style.top=(rect?rect.height*.59:390)+'px';}
 }
 if(ground)ground.hidden=id!=='quietCircle';
}
function showPanel(){panel.hidden=false;renderSelected()}
function hidePanel(){panel.hidden=true}
function textNode(tag,text,cls){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=text;return el}
function renderList(){
 $('monthList').replaceChildren(...DATA.months.map((m,i)=>{
  const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(selected===i));b.append(textNode('span',String(i+1).padStart(2,'0')+' · '+m.name),textNode('small',m.zodiac+(S.observed.includes(i)?' · witnessed':'')));b.onclick=()=>{selected=i;renderSelected()};return b
 }));
}
function renderSelected(){
 if(!DATA)return;renderList();
 const m=DATA.months[selected],p=pt(m.vantage),objs=DATA.objects.filter(o=>m.objects.includes(o.id));
 content($('atlasTitle'),m.name+' / '+m.zodiac);
 content($('atlasDetail'),m.dedication+'. In a separate Pahlavi zodiac lineage this sign was called '+m.pahlavi+'. '+m.note);
 content($('atlasWhere'),p.name+' · '+p.question);
 content($('atlasPair'),m.pair+' · '+objs.map(o=>o.id+' / SGM '+o.chapter+' '+o.method).join(' · '));
 content($('atlasCounter'),S.observed.length+' / 12 sky observations · '+S.concordances.length+' / 12 paired house discoveries');
 content($('atlasMathLabel'),'H'+String(selected+1).padStart(2,'0')+' · '+DATA.objects[selected].method);
 content($('atlasMathDescription'),DATA.objects[selected].experiment+' Chapter '+DATA.objects[selected].chapter+' of the *proposed* SGM textbook.');
 content($('atlasNote'),'');
 content($('atlasSource'),'Iranian month dedication and an illustrated zodiac sign are shown side-by-side, NOT asserted to fall in the same historical calendar month.');
 const button=$('atlasObserve');button.disabled=S.observed.includes(selected);
 content(button,S.observed.includes(selected)?'✦ Recorded in the witness ledger':'✧ Witness this sign outdoors');
 updateNumerics();
}
function route(){
 const state=g?.getState(),target=DATA.months[selected].vantage;if(!g||!state)return notify('The outdoor world is not ready.');
 if(state.transit)return notify('Finish the current walk first.');
 if(state.current===target)return notify('You are at the requested point. Raise your gaze with SKYWARD and face the sign.');
 const r=g.fastestRoute(state.current,target);
 if(!r||r.path.length<2)return notify('No authorized route to '+target);
 const n=r.path[1];
 if(g.go(n))notify('Walking to '+g.nodes[n].name+'. Remaining route: '+r.path.join(' → ')+'.');
}
function observe(){
 const m=DATA.months[selected],state=g?.getState();
 if(!g||!state)return notify('The native Elisium world is still opening.');
 if(state.transit)return notify('Wait until your journey concludes.');
 if(state.current!==m.vantage)return notify('This sign is studied from '+pt(m.vantage).name+'. Use WALK TOWARD VANTAGE.');
 if(!state.skywatch)return notify('Use SKYWARD in the outdoor scene before trying to observe.');
 const canvas=cw.document.getElementById('sky'),p=g.sky.projectDirection(m.az,m.el,{yaw:state.yaw,pitch:state.pitch,fovY:68},canvas.width,canvas.height);
 if(!p||p.x<40||p.x>canvas.width-40||p.y<40||p.y>canvas.height-40)return notify('Turn the skyward view until the sign is visible. A diagram does not count as a sighting.');
 if(!S.observed.includes(selected)){S.observed.push(selected);persist();g.sky.apply({witness:1,discernment:1},'bounded player sky observation');}
 notify(m.zodiac+' witnessed from '+pt(m.vantage).name+'. A sky reading is evidence, not agreement with an interpretation.');renderList();content($('atlasCounter'),S.observed.length+' / 12 sky observations · '+S.concordances.length+' / 12 paired house discoveries');$('atlasObserve').disabled=true;
}
function getHouseRecord(){
 const b=cw?.ElisiumThreshold||window.ElisiumThreshold;
 if(!b)return null;
 try{return b.consume(sessionStorage)}catch{return null}
}
function returnHouse(){
 if(!houseOpen)return;
 houseOpen=false;houseSheet.hidden=true;
 const r=getHouseRecord();if(!r)return;
 S.houseVisits++;for(const item of r.observations)if(!S.houseObjects.includes(item.id))S.houseObjects.push(item.id);const H=g?.houseMemory;
 for(const item of r.observations){if(H&&g){H.mark(item.id,'seen',g.getState().clockMin);H.mark(item.id,'studied',g.getState().clockMin);}}
 const discovered=DATA.pairs.filter(p=>S.houseObjects.includes(p.a)&&S.houseObjects.includes(p.b));
 for(const p of discovered)if(!S.concordances.includes(p.title))S.concordances.push(p.title);
 persist();
 const text=r.observations.length+' house instruments examined · '+r.elapsed_minutes+' fictional house minutes. '+discovered.length+' pairs recognized. Parent narrative state was kept alive.';
 $('houseReturnText').textContent=text;$('houseReturn').hidden=false;
 const holder=$('houseTuning');holder.replaceChildren();
 for(const p of discovered){const b=textNode('button','Tune '+p.title+' → '+p.lens);b.onclick=()=>{
  if(!g)return;const ev=g.houseLens.arm(p.lens,g.getState().clockMin);
  if(ev&&g.sky.tuneSignal(ev)){$('houseReturnText').textContent='Sky relation armed: '+p.title+'. Travel to its valid vantage, look skyward, and witness. The house cannot command the star.';}
 };holder.append(b);}
 updateQuest();
}
function openHouse(){
 if(!houseFrame)return;
 hidePanel();houseSheet.hidden=false;houseOpen=true;
 if(!houseFrame.getAttribute('src'))houseFrame.src='kilns/index.html?ws_embed=1&ws_v=1&ws_entry=elisium-kilns-door';
}
function hookHouseLink(){
 try{
  const doc=houseFrame.contentDocument;if(!doc)return;
  doc.addEventListener('click',ev=>{
   const a=ev.target.closest('a[href]');if(!a)return;
   const u=new URL(a.href,location.href);
   if(u.pathname.replace(/\/+$/,'')===location.pathname.replace(/\/+$/,'')){ev.preventDefault();returnHouse();}
  },true);
  doc.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!doc.querySelector('#fatal:not([hidden])')){ev.preventDefault();returnHouse();}});
 }catch{}
}
function setQuietChoice(kind){
 if(!['leave','question','remain'].includes(kind))return;
 S.exitChoices.push(kind);S.exitChoices=S.exitChoices.slice(-8);persist();
 const messages={
 leave:'You may leave religion without becoming a caricature of unbelief. The portal remains a real option, not a punishment.',
 question:'You reject being deceived without declaring every believer dishonest. The circle remains quiet; inquiry remains possible.',
 remain:'You stay in the conversation without surrendering the right to walk away. No authority has been earned by your hesitation.'
 };
 $('secularNote').textContent=messages[kind];quietVisited=true; // no hidden moral score
}
function updateNumerics(){
 const n=+$('sampleN').value,p=+$('sampleP').value/100,rho=+$('sampleRho').value/100;
 // Simulated population size N=7e9 is a user's thought experiment, not measured persons.
 const N=7000000000,cluster=20,deff=1+(cluster-1)*rho,neff=n/deff;
 const se=Math.sqrt(p*(1-p)/neff)*Math.sqrt((N-n)/(N-1)),ci=1.96*se;
 const bits=(N*128/8/1e12).toFixed(2);
 content($('populationReadout'),n.toLocaleString()+' hypothetical accounts · effective n≈'+Math.round(neff).toLocaleString()+' · 95% illustrative margin ±'+(100*ci).toFixed(2)+' percentage points · 128 bits/person ≈'+bits+' TB raw (before metadata/indexing).');
 content($('populationWarning'),'Even a census of messages is not access to private experience. Accounts ≠ people, events ≠ consciousness, sampling ≠ universal knowledge. A shared Matrix homeserver is not all of Matrix federation; no actual messages are sampled here.');
}
function attach(){
 $('atlasOpen').onclick=showPanel;$('atlasClose').onclick=hidePanel;$('atlasObserve').onclick=observe;
 $('atlasWalk').onclick=route;$('atlasHouse').onclick=openHouse;
 $('atlasSkyward').onclick=()=>{if(g&&cw){if(!g.getState().skywatch)cw.document.getElementById('skywatchBtn')?.click();hidePanel();cw.focus();}};
 $('openReaders').onclick=()=>{hidePanel();g?.showAuthors()};
 $('pocketOpen').onclick=openHouse;$('pocketClose').onclick=returnHouse;
 $('houseReturnClose').onclick=()=>{$('houseReturn').hidden=true};
 $('secularClose').onclick=()=>{quietDialog.hidden=true};
 for(const b of document.querySelectorAll('[data-secular]'))b.addEventListener('click',()=>setQuietChoice(b.dataset.secular));
 for(const id of ['sampleN','sampleP','sampleRho'])$(id).addEventListener('input',updateNumerics);
 houseFrame.addEventListener('load',hookHouseLink);
 $('atlasMathAll').onclick=()=>{
  $('mathList').replaceChildren(...DATA.objects.map(o=>textNode('li',o.id+' · SGM §'+o.chapter+' '+o.method+' — '+o.experiment)));
  $('mathList').hidden=!$('mathList').hidden;
 };
}
async function run(){
 attach();
 try{const response=await fetch('atlas-data.json',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);DATA=await response.json();if(DATA.months.length!==12||DATA.objects.length!==24||DATA.points.length!==7||DATA.pairs.length!==12)throw Error('Atlas schema cardinality mismatch');renderSelected();}catch(err){notify('Atlas data unavailable: '+err.message);return}
 const t=setInterval(()=>{boot();if(g){clearInterval(t);setInterval(updateQuest,650)}},210);
}
window.ELISIUM_ATLAS=Object.freeze({
 ready:()=>!!g&&!!DATA,
 monthCount:()=>DATA?.months?.length||0,
 sevenPoints:()=>DATA?.points.map(x=>x.id)||[],
 observed:()=>S.observed.slice(),
 houseObjects:()=>S.houseObjects.slice(),
 houseVisits:()=>S.houseVisits,
 isHouseOpen:()=>houseOpen,
 hasQuietCircle:()=>!!g?.nodes.quietCircle,
 openHouse,returnHouse,renderSelected
});
run();
})();