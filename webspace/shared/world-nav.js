/* Webspace root portal navigator 1.0 — explicit location-only handoff. */
(()=>{'use strict';
 const pages=[
  ['chuzhoy','Garden of Chuzhoy','../chuzhoy/index.html?ws_v=1&ws_entry=chuzhoy-north'],
  ['fortress','Gerudo Fortress','../fortress/index.html'],
  ['gringotts','Gringotts Gerudo Branch','../gringotts/index.html?ws_v=1&ws_entry=gringotts-gerudo'],
  ['witchs-hole',"Witch's Hole",'../witchs-hole/index.html'],
  ['elisium','Elisium · Concordance','../elisium/index.html']
 ];
 const curr=(location.pathname.split('/').filter(Boolean).slice(-2)[0]||'');
 const holder=document.createElement('div');holder.id='ws-federation';
 holder.innerHTML='<style>#ws-federation{position:fixed;z-index:9999;right:11px;bottom:12px;font:12px system-ui,sans-serif;color:#f0e7d6}#ws-federation *{box-sizing:border-box}#ws-federation button{background:#111f31eb;color:#eed5a3;border:1px solid #cfb57c88;border-radius:8px;padding:10px 13px;cursor:pointer;box-shadow:0 4px 18px #0008;font:600 12px system-ui}#ws-federation .ws-menu{display:none;position:absolute;right:0;bottom:44px;width:240px;background:#102333f5;border:1px solid #bda46d9c;border-radius:9px;box-shadow:0 20px 50px #000a;padding:9px}#ws-federation.open .ws-menu{display:block}#ws-federation a{display:block;color:#e8e5d7;text-decoration:none;padding:9px;border-radius:5px}#ws-federation a:hover,#ws-federation a[aria-current]{background:#485366}#ws-federation small{display:block;color:#aec5c6;font-size:10px;line-height:1.4;padding:7px 8px}#ws-federation button:focus-visible,#ws-federation a:focus-visible{outline:2px solid gold}</style><div class="ws-menu" role="navigation" aria-label="Cross-world portals"><small>WEBSpace · Named arrivals only. No account or visit history transferred.</small><div class="ws-links"></div><a href="../../index.html">◈ Federation root</a></div><button type="button" aria-expanded="false" aria-label="Other Webspace worlds">◈ WORLDS</button>';
 const links=holder.querySelector('.ws-links');
 pages.forEach(([id,title,target])=>{const a=document.createElement('a');a.href=target;a.textContent=title;if(curr===id)a.setAttribute('aria-current','page');links.append(a)});
 const btn=holder.querySelector('button');btn.addEventListener('click',()=>{const open=holder.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){holder.classList.remove('open');btn.setAttribute('aria-expanded','false')}});
 document.body.append(holder);
})();