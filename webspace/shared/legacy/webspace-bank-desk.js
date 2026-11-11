'use strict';
/* Webspace Bank Desk 0.1. Purely diegetic/fictional, no third-party SDK, no credentials,
   no wallet signing, no promises of end-to-end encryption or monetary custody.
   All Proton service launches are deliberate top-level navigation to official domains. */
(function(root){
const $=id=>document.getElementById(id);
const entries=[
 ['Mail','Sealed letters','https://account.proton.me/mail','✉'],
 ['Calendar','Appointments & moon phases','https://account.proton.me/calendar','▦'],
 ['Drive','Private file library','https://account.proton.me/drive','◫'],
 ['Docs','Living manuscripts','https://account.proton.me/docs','▤'],
 ['Sheets','Enchanted ledgers','https://account.proton.me/sheets','▥'],
 ['Meet','Looking-glass meetings','https://account.proton.me/meet','◇'],
 ['Pass','Keys & secret phrases','https://account.proton.me/pass','⚿'],
 ['VPN','Traveler’s invisibility cloak','https://account.protonvpn.com','◎'],
 ['Wallet','External wallet service','https://account.proton.me/wallet','◈'],
 ['Lumo','Library familiar · AI','https://lumo.proton.me','✧']
];
const knownOrigins=new Set(['https://account.proton.me','https://account.protonvpn.com','https://lumo.proton.me']);
let screen='directory',person='',aur=0,crescents=0,month=new Date().getMonth(),year=new Date().getFullYear();
function node(tag,attrs={},children=[]){const el=document.createElement(tag);for(const [key,val] of Object.entries(attrs)){
 if(key==='class')el.className=val;else if(key==='text')el.textContent=val;else if(key==='type'||key==='placeholder'||key==='maxLength'||key==='aria-label')el.setAttribute(key,val);
}for(const c of children)el.append(c);return el;}
function div(klass,text){return node('div',{class:klass,text});}
function para(text){return node('p',{text});}
function makeButton(text,fn,klass=''){const e=node('button',{class:klass,text,type:'button'});e.addEventListener('click',fn);return e;}
function open(link){try{const u=new URL(link);if(u.protocol!=='https:'||!knownOrigins.has(u.origin))return;window.open(u.href,'_blank','noopener,noreferrer');}catch{}}
const routes={directory:'The Branch Directory',contract:'The Guest Contract',ledger:'The Fictional Exchange',proton:'The Correspondence Gallery',calendar:'The Chronomancer’s Wall',vault:'The Vault Registry',privacy:'The Privacy Charter'};
function render(){const body=$('bankDeskBody');if(!body)return;body.replaceChildren();$('bankDeskHeading').textContent=routes[screen]||routes.directory;
 const eyebrow=div('desk-eyebrow','GRINGOTTS · GERUDO BRANCH · INTERACTIVE EXHIBIT');body.append(eyebrow);
 if(screen==='directory'){
  body.append(para('The tellers bow toward seven departments. Every chamber is explorable in 3D; these parchments provide a second, accessible way to use the exhibits.'));
  const grid=div('desk-grid');for(const [key,desc,ico] of [
   ['contract','Register an imaginary guest','✒'],['ledger','Open the practice ledger','◇'],['calendar','Turn the enchanted calendar','▦'],['proton','Correspondence & Proton services','✉'],['vault','Inspect vault mechanisms','⚙'],['privacy','Read the privacy covenant','⚿']]){
   const b=makeButton(ico+'  '+desc,()=>{screen=key;render()},'desk-tile');grid.append(b);
  }body.append(grid,div('desk-fine','Nothing here can register a real user, hold funds or store private secrets. No service requests run until you open the official Proton site.'));
 } else if(screen==='contract'){
  body.append(div('parchment-title','A visitor’s contract, in violet ink'));
  body.append(para('The goblin points to one field. Sign a playful alias—or enter anonymously. This is a role-play guest pass in memory only, not account registration or authentication.'));
  const label=node('label',{class:'desk-label',text:'Guest alias — not an email address or password'});
  const inp=node('input',{class:'desk-input',type:'text',placeholder:'The Wandering Stranger',maxLength:'26','aria-label':'Demo guest alias'});inp.autocomplete='off';inp.value=person;label.append(inp);body.append(label);
  const controls=div('desk-controls');controls.append(makeButton('✒ Sign the page',()=>{person=inp.value.trim().slice(0,26)||'Anonymous visitor';render()},'desk-primary'),makeButton('Continue anonymously',()=>{person='Anonymous visitor';render()}));body.append(controls);
  body.append(div('desk-result',person?'Registry illustration: '+person+' has a fictional guest pass.':'No visitor name recorded. Both choices are equivalent.'));
  body.append(div('desk-fine','Never type a real password, seed phrase, recovery code, wallet key, or private information into this mock contract.'));
 }else if(screen==='ledger'){
  body.append(div('parchment-title','The Gold-in-Glass Ledger'));
  body.append(para('A demonstration of a future currency interface, not a bank balance. Aurics and Crescents are invented units; nothing is transferable, redeemable, or written to a blockchain.'));
  const stats=div('coin-stats');stats.append(div('coin-stat','AURICS  ◈\n'+aur.toFixed(0)),div('coin-stat','CRESCENTS  ☽\n'+crescents.toFixed(0)));body.append(stats);
  const controls=div('desk-controls');controls.append(makeButton('Mint 10 pretend AUR',()=>{aur+=10;render()},'desk-primary'),makeButton('Exchange 5 AUR → 25 ☽',()=>{if(aur>=5){aur-=5;crescents+=25;render()}else{body.append(div('desk-fine','Not enough imaginary Aurics to exchange.'))}}),makeButton('Reset pretend ledger',()=>{aur=0;crescents=0;render()}));body.append(controls);
  body.append(div('desk-fine','Prototype-only. No login, blockchain, real money, wallet, transaction signing, backend ledger, or persistent custody.'));
 }else if(screen==='calendar'){
  body.append(para('Behind the wall clock the calendar pages turn. This calendar reads only the browser date; it is not linked to Proton, and it saves no appointments.'));
  const top=div('calendar-controls');top.append(makeButton('‹',()=>shift(-1)),div('calendar-month',new Date(year,month,1).toLocaleDateString(undefined,{month:'long',year:'numeric'})),makeButton('›',()=>shift(1)));body.append(top);
  const grid=div('calendar-grid');for(const day of ['Su','Mo','Tu','We','Th','Fr','Sa'])grid.append(div('calendar-dow',day));
  const first=new Date(year,month,1).getDay(),count=new Date(year,month+1,0).getDate(),today=new Date();
  for(let i=0;i<first;i++)grid.append(div('calendar-empty',''));
  for(let day=1;day<=count;day++){
   const d=makeButton(String(day),()=>{const line=$('selectedBankDate');if(line)line.textContent='Selected: '+new Date(year,month,day).toDateString()+' · no appointment saved.';},'calendar-day');
   if(year===today.getFullYear()&&month===today.getMonth()&&day===today.getDate())d.classList.add('today');grid.append(d);
  }body.append(grid,div('desk-result','Touch a date to inspect its place in the ledger.'));body.lastChild.id='selectedBankDate';
  body.append(makeButton('Open official Proton Calendar',()=>open('https://account.proton.me/calendar'),'desk-primary'));
 }else if(screen==='proton'){
  body.append(para('Goblins emboss their labels on sealed pigeonholes. Choosing a pigeonhole opens the real Proton product in a separate tab; Proton handles authentication on its own website. Nothing is embedded in the bank.'));
  const grid=div('proton-grid');for(const [name,description,url,icon] of entries){const b=makeButton(icon+'  '+name,()=>open(url),'proton-link');b.append(div('proton-desc',description));grid.append(b);}body.append(grid);
  body.append(div('desk-fine','These links are independent of the Webspace Screen iframe and portal protocols. This fan-built scene is not affiliated with or endorsed by Proton.'));
 }else if(screen==='vault'){
  body.append(div('parchment-title','Ten doors, no keys'));
  body.append(para('The goblin holds up an empty key ring: the row of safes is artwork. The visible mechanical seals do not encrypt, store, or protect information.'));
  body.append(div('desk-result','VAULT STATE · VISUAL MOCKUP\nStorage allocation: not implemented\nCryptographic keys: not generated\nAccess controls: not implemented'));
  body.append(makeButton('Read the privacy covenant',()=>{screen='privacy';render()},'desk-primary'));
 }else if(screen==='privacy'){
  body.append(div('parchment-title','The privacy covenant'));
  for(const line of [
   'Portal crossings share only a local, allowlisted world destination. Your browsing history and bank mock balances are never handed to a portal.',
   'The guest alias and fantasy currency demonstration live only in this page’s JavaScript memory and disappear when this page reloads.',
   'There is no account server, encrypted vault, authenticator, exchange, Proton API connection, or wallet integration in this version.',
   'Future real financial or storage functions must use audited, purpose-built services and explicit user authentication—not the decorative forms shown here.'
  ])body.append(para(line));
 }
 body.append(makeButton('◈ Back to branch directory',()=>{screen='directory';render()},'desk-return'));
}
function shift(amount){month+=amount;if(month<0){month=11;year--}else if(month>11){month=0;year++}render();}
function openDesk(s='directory'){screen=routes[s]?s:'directory';const desk=$('bankDesk');desk.hidden=false;render();$('bankDeskClose').focus();}
function close(){const desk=$('bankDesk');if(desk)desk.hidden=true;}
function init(){const desk=$('bankDesk');if(!desk)return;$('bankDeskClose').addEventListener('click',close);desk.addEventListener('click',e=>{if(e.target===desk)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!desk.hidden){e.preventDefault();close()}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
root.WebspaceBankDesk={open:openDesk,close,isOpen:()=>!$('bankDesk')?.hidden};
})(window);
