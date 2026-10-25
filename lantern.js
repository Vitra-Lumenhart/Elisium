/* Elisium Writer's Lantern v0.2 — decorative world geometry and two-page screen controller.
   This module intentionally has no dependency on Chuzhoy or external services. */
(function(root){
'use strict';
const BASE={book:[2.05,2.42,-2.45],lamppost:[-3.42,0,-2.45]};
const STORE='elisium-guestbook-v1';
const $=id=>document.getElementById(id);
const books=[{name:'THE COMPANY OF WRITERS',pages:2},{name:'THE GUEST BOOK',pages:2}];
const state={book:0,spread:0,draft:'',entries:readEntries(),note:''};
let mounted=false;
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function readEntries(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.text==='string').slice(0,18):[];}catch{return [];}}
function saveEntries(){try{localStorage.setItem(STORE,JSON.stringify(state.entries.slice(0,18)));return true;}catch{return false;}}
function showWriters(){
 if(state.spread===0) return [
  '<span class="book-eyebrow">THE COMPANY OF WRITERS</span><h3>C. S. Lewis <small>1898–1963</small></h3><p>Scholar, storyteller, friend. In Oxford he shared old books, new worlds, and spirited conversation with writers called the <em>Inklings</em>.</p><p class="book-whisper">One may wander far beyond a wardrobe and still be walking toward a friend.</p>',
  '<span class="book-eyebrow">OXFORD, IN FRIENDSHIP</span><h3>For the Inklings</h3><p>They read their work aloud, disagreed, revised, and encouraged one another. Even an enchanted world can begin with someone listening.</p><p class="book-links"><a href="https://en.wikipedia.org/wiki/C._S._Lewis" target="_blank" rel="noopener noreferrer">C. S. Lewis ↗</a><a href="https://en.wikipedia.org/wiki/Inklings" target="_blank" rel="noopener noreferrer">The Inklings ↗</a></p><p class="book-whisper">For the makers of impossible doors.</p>'
 ];
 return [
  '<span class="book-eyebrow">THE LAMP IN THE WOOD</span><h3>A familiar light</h3><p>Iron, glass, and a small crossbar: a London object mysteriously at home beyond the fur coats, where the lamplight is a promise to travelers.</p><p class="book-whisper">A threshold need not be grand to be beloved.</p>',
  '<span class="book-eyebrow">ABOUT THIS BOOK</span><h3>Two pages, one voice</h3><p>The pages change together. Turn this spread, or choose another book; there is no separate reading window.</p><p>The guest book can answer your words as you write them.</p><p><button class="book-inline-action" type="button" data-book="guest">Open the guest book</button></p>'
 ];
}
function showGuest(){
 if(state.spread===0) return [
  '<span class="book-eyebrow">THE LISTENING PAGE</span><h3>An answering page</h3><p>As you write at the right, your sentence appears here. The two leaves belong to one conversation.</p><div id="guestMirror" class="guest-mirror" aria-live="polite"></div><p class="book-whisper" id="guestCount">0 / 480 characters</p>',
  '<span class="book-eyebrow">THE WRITING PAGE</span><h3>Leave a line</h3><label class="guest-label" for="guestInput">What would you say to the next walker?</label><textarea id="guestInput" maxlength="480" inputmode="text" enterkeyhint="done" autocapitalize="sentences" spellcheck="true" placeholder="I passed the lamp, and I wondered…"></textarea><div class="book-actions"><button id="guestSave" type="button">Sign this page</button><button id="guestErase" type="button">Clear</button></div><p class="book-whisper">Private to this browser; no server receives your words.</p>'
 ];
 return [
  '<span class="book-eyebrow">LEAVES ALREADY TURNED</span><h3>The visitors’ lines</h3><div id="guestEntries" class="guest-entries" aria-live="polite"></div>',
  '<span class="book-eyebrow">RETURNING TO THE PAGE</span><h3>The book remembers here</h3><p>These words are held in this browser alone. They are not a public message board; strangers elsewhere will not see them.</p><div class="book-actions"><button id="guestAgain" type="button">Write another</button><button id="guestWipe" type="button">Erase local notes</button></div><p class="book-whisper">A real shared guestbook would require an opt-in server and moderation.</p>'
 ];
}
function mirror(){
 const target=$('guestMirror');if(target){target.textContent=state.draft||'The page is listening…';}
 const n=$('guestCount');if(n)n.textContent=state.draft.length+' / 480 characters';
}
function showEntries(){
 const list=$('guestEntries');if(!list)return;
 list.textContent='';
 if(!state.entries.length){const p=document.createElement('p');p.textContent='No entries in this browser yet.';list.append(p);return;}
 for(const entry of state.entries){const article=document.createElement('article'),stamp=document.createElement('small'),body=document.createElement('p');stamp.textContent=entry.when||'A moment in Elisium';body.textContent=entry.text;article.append(stamp,body);list.append(article);}
}
function save(){
 const text=state.draft.trim();if(!text){state.note='This page is still empty.';render();return;}
 state.entries.unshift({text:text.slice(0,480),when:new Date().toLocaleDateString()});
 state.entries=state.entries.slice(0,18);state.draft='';state.spread=1;
 state.note=saveEntries()?'Your words remain in this browser.':'Saved for this visit; browser storage is unavailable.';
 render();
}
function render(){
 if(!mounted)return;
 const page=state.book===0?showWriters():showGuest();
 $('bookLeft').innerHTML=page[0];$('bookRight').innerHTML=page[1];
 $('bookKind').textContent=books[state.book].name;
 $('bookPrev').disabled=state.spread===0;$('bookNext').disabled=state.spread===books[state.book].pages-1;
 $('bookMeta').textContent=books[state.book].name+' · SPREAD '+(state.spread+1)+' OF '+books[state.book].pages+(state.note?' · '+state.note:'');
 const input=$('guestInput');
 if(input){input.value=state.draft;input.addEventListener('input',()=>{state.draft=input.value.slice(0,480);mirror();});
   input.addEventListener('pointerdown',()=>{state.note='Your keyboard belongs to the page.';});
   $('guestSave').onclick=save;$('guestErase').onclick=()=>{state.draft='';input.value='';mirror();input.focus();};
   mirror();
 }
 $('guestAgain')?.addEventListener('click',()=>{state.spread=0;render();$('guestInput')?.focus();});
 $('guestWipe')?.addEventListener('click',()=>{state.entries=[];saveEntries();state.note='The local leaves have been cleared.';render();});
 $('bookRight').querySelector('[data-book=guest]')?.addEventListener('click',()=>{state.book=1;state.spread=0;state.note='';render();});
 showEntries();
}
function switchBook(){state.book=(state.book+1)%books.length;state.spread=0;state.note='';render();}
function turn(delta){state.spread=Math.max(0,Math.min(books[state.book].pages-1,state.spread+delta));state.note='';render();}
function mount(){
 if(mounted)return;mounted=true;
 $('bookSwitch').addEventListener('click',switchBook);
 $('bookPrev').addEventListener('click',()=>turn(-1));
 $('bookNext').addEventListener('click',()=>turn(1));
 render();
}
function interact(){
 if(!mounted)return;
 if(state.book===1&&state.spread===0){$('guestInput')?.focus({preventScroll:true});}
 else{$('bookSwitch').focus({preventScroll:true});}
 state.note=state.book===1?'You may write directly into the right page.':'Turn the page, or switch books at this lectern.';
 $('bookMeta').textContent=books[state.book].name+' · SPREAD '+(state.spread+1)+' OF '+books[state.book].pages+' · '+state.note;
}
function action(){return state.book===1&&state.spread===0?'WRITE':'READ';}
function near(player){return Math.hypot(player[0]-BASE.book[0],player[2]-BASE.book[2])<8.5;}
function projectBook(project,player,w,h,inTransit){
 const el=$('worldBook');if(!el)return;
 const c=project(BASE.book),l=project([BASE.book[0]-2.75,BASE.book[1],BASE.book[2]]),r=project([BASE.book[0]+2.75,BASE.book[1],BASE.book[2]]);
 if(!c||!l||!r||c.depth<2.1||c.depth>24||c.x< -150||c.x>w+150||c.y< -230||c.y>h+230){el.hidden=true;el.style.pointerEvents='none';return;}
 let scale=Math.min(1.45,Math.max(.27,Math.abs(r.x-l.x)/640),Math.max(.3,(w-32)/640));
 el.hidden=false;el.style.left=c.x+'px';el.style.top=c.y+'px';el.style.transform='translate(-50%,-50%) scale('+scale+')';
 el.style.opacity=Math.min(1,Math.max(0,(c.depth-2.1)/1.5));
 el.style.pointerEvents=near(player)&&!inTransit&&scale>.33?'auto':'none';
}
function occludes(p,project){
 const c=project(BASE.book),l=project([BASE.book[0]-2.75,BASE.book[1],BASE.book[2]]),r=project([BASE.book[0]+2.75,BASE.book[1],BASE.book[2]]);
 if(!c||!l||!r||p.depth<=c.depth)return false;
 const scale=Math.min(1.45,Math.max(.27,Math.abs(r.x-l.x)/640));
 return Math.abs(p.x-c.x)<340*scale&&Math.abs(p.y-c.y)<205*scale;
}
function geometry(g){
 const box=g.box,rod=g.rod,ico=g.ico,tri=g.tri;
 const x=BASE.lamppost[0],z=BASE.lamppost[2],iron=[.24,.25,.27],steel=[.37,.35,.31],brass=[.80,.64,.37],stone=[.46,.44,.43],glass=[.98,.82,.46],ivory=[.91,.82,.64];
 function ring(y,r,t,col=brass){for(let i=0;i<28;i++){const a=i*Math.PI/14,b=(i+1)*Math.PI/14;rod([x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],t,t,col,1,false,7);}}
 function scroll(cx,cy,cz,rad,offset=0){let prev=null;for(let i=0;i<=30;i++){let t=i/30,ang=offset+t*Math.PI*2.7,R=rad*(1-.83*t);let p=[cx+R*Math.cos(ang),cy+R*Math.sin(ang),cz];if(prev)rod(prev,p,.028,.021,brass,1,false,7);prev=p;}}
 // Squared flagstones, four stepped collars and hand-worked floral rosettes.
 box(x,.10,z,1.36,.20,1.36,stone);box(x,.26,z,1.05,.15,1.05,steel);
 box(x,.42,z,.82,.20,.82,iron);ring(.53,.43,.035);
 rod([x,.53,z],[x,5.15,z],.20,.105,iron,1,false,24);
 for(let i=0;i<8;i++){const y=.82+i*.49;ring(y,.18-i*.006,.026,i%2?steel:brass);}
 for(let i=0;i<48;i++){const t=i/48,a=i*Math.PI*.31;
 const p=[x+.187*Math.cos(a),.8+t*4.06,z+.187*Math.sin(a)],q=[x+.187*Math.cos(a+.31),.8+(t+1/48)*4.06,z+.187*Math.sin(a+.31)];
 rod(p,q,.012,.012,brass,.93,false,6);}
 for(let i=0;i<4;i++){const a=i*Math.PI/2;ico(x+.41*Math.cos(a),.41,z+.41*Math.sin(a),.11,.13,.06,brass,1,false,0,6,11);}
 ring(4.97,.22,.050);ring(5.23,.25,.057);
 // The unmistakable transverse arm: little scroll-work curls at both tips.
 rod([x-1.30,4.88,z],[x+1.30,4.88,z],.082,.061,iron,1,false,16);
 rod([x-1.10,4.78,z],[x+1.10,4.78,z],.030,.030,brass,1,false,10);
 for(let side of [-1,1]){scroll(x+side*1.15,4.87,z,.29,side===1?0:Math.PI);ico(x+side*1.30,4.88,z,.12,.12,.12,brass,1,false,0,7,13);}
 for(let i=0;i<3;i++){const a=(i+.5)*Math.PI/5;scroll(x+(i-1)*.43,4.72,z,.17,a);}
 // Gas lantern cage: twelve ribs, warm translucent glass, beveled canopy and finial.
 rod([x,5.13,z],[x,5.57,z],.096,.072,iron,1,false,16);
 box(x,5.72,z,.78,.12,.78,iron);box(x,6.82,z,.83,.14,.83,iron);
 ico(x,6.25,z,.34,.58,.34,glass,.24,true,0,11,18);
 for(let i=0;i<8;i++){const a=i*Math.PI/4,dx=.34*Math.cos(a),dz=.34*Math.sin(a);
 rod([x+dx,5.79,z+dz],[x+dx,6.74,z+dz],.027,.024,iron,1,false,9);}
 for(let i=0;i<4;i++){const a=(i+.5)*Math.PI/2;ico(x+.29*Math.cos(a),6.25,z+.29*Math.sin(a),.10,.39,.08,[.85,.67,.35],.29,true,0,8,12);}
 ico(x,6.23,z,.18,.28,.18,[1.0,.86,.46],.88,false,0,10,20);
 ring(6.86,.42,.050);rod([x,6.9,z],[x,7.16,z],.15,.055,iron,1,false,17);
 ico(x,7.20,z,.145,.145,.145,brass,1,false,0,10,18);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;ico(x+.23*Math.cos(a),6.9,z+.23*Math.sin(a),.10,.08,.10,brass,1,false,0,6,10);}
 // Charming small vine below lantern, with separate individual leaves.
 for(let i=0;i<20;i++){const t=i/20,a=t*Math.PI*3.0;
 let p=[x+.26*Math.cos(a),1.05+t*2.2,z+.26*Math.sin(a)];
 let q=[x+.43*Math.cos(a+.2),1.07+t*2.2,z+.43*Math.sin(a+.2)];
 rod(p,q,.015,.009,steel,.95,false,7);
 if(i%2===0)ico(q[0],q[1],q[2],.11,.045,.07,[.57,.55,.42],.98,false,a,6,12);}
 // Book stand: ebony foot, tapered brass neck, sloped oak lectern, leather and paper folios.
 const bx=BASE.book[0],bz=BASE.book[2];
 box(bx,.13,bz,1.36,.25,1.10,stone);box(bx,.32,bz,.94,.18,.75,brass);
 rod([bx,.38,bz],[bx,1.54,bz],.20,.13,iron,1,false,20);
 box(bx,1.53,bz,1.13,.12,.65,brass);box(bx,1.69,bz,1.35,.23,.92,[.47,.31,.22]);
 // Tilted binding panel and visible layered paper signatures.
 const q=(xx,yy,zz)=>[bx+xx,yy,bz+zz];
 const backL=q(-1.69,2.04,-.36),backR=q(1.69,2.04,-.36),frontL=q(-1.69,2.53,.42),frontR=q(1.69,2.53,.42);
 tri(backL,backR,frontR,[.42,.26,.17]);tri(backL,frontR,frontL,[.42,.26,.17]);
 for(let i=0;i<12;i++){
 const off=i*.015;
 const p1=q(-1.58,2.11+off,-.29),p2=q(1.58,2.11+off,-.29),p3=q(1.58,2.54+off,.39),p4=q(-1.58,2.54+off,.39);
 tri(p1,p2,p3,ivory);tri(p1,p3,p4,ivory);
 }
 rod(q(0,2.14,-.30),q(0,2.57,.42),.055,.055,brass,1,false,10);
 for(let side of [-1,1])for(let i=0;i<5;i++){const a=i/5,xx=side*(1.52-.13*i);
 ico(bx+xx,2.18+.36*a,bz+.10,.055,.036,.075,brass,1,false,0,5,10);}
}
function paintFallback(ctx,project){
 // Only for non-WebGL compatibility. Primary art uses the high-detail mesh above.
 const foot=project([BASE.lamppost[0],0,BASE.lamppost[2]]);
 const top=project([BASE.lamppost[0],7.1,BASE.lamppost[2]]);
 if(!foot||!top)return;
 const h=foot.y-top.y;
 ctx.save();ctx.strokeStyle='#8b774f';ctx.lineCap='round';ctx.lineWidth=Math.max(2,h*.024);
 ctx.beginPath();ctx.moveTo(foot.x,foot.y);ctx.lineTo(top.x,top.y+Math.max(10,h*.15));ctx.stroke();
 ctx.lineWidth=Math.max(2,h*.015);ctx.beginPath();ctx.moveTo(foot.x-h*.21,top.y+h*.30);ctx.lineTo(foot.x+h*.21,top.y+h*.30);ctx.stroke();
 ctx.fillStyle='rgba(255,218,146,.85)';ctx.shadowColor='#efcc89';ctx.shadowBlur=22;ctx.beginPath();ctx.ellipse(top.x,top.y+h*.16,h*.075,h*.12,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
root.ElisiumLantern=Object.freeze({mount,geometry,projectBook,occludes,near,interact,action,paintFallback,getState:()=>({book:state.book,spread:state.spread,entries:state.entries.length,draftLength:state.draft.length})});
})(window);
