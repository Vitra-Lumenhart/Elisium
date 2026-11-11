from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from shutil import copy2, copytree, rmtree
from html import escape
from urllib.parse import urlparse
import re, json, datetime, hashlib, os, math
import trimesh
import numpy as np

BASE=Path('/mnt/data')
S=BASE/'webspace_sources'
IN=BASE/'webspace_work/_incoming'
ROOT=BASE/'webspace_unified'
if ROOT.exists(): rmtree(ROOT)
ROOT.mkdir()
for d in ['worlds/chuzhoy','worlds/fortress','worlds/gringotts','worlds/witchs-hole','worlds/elisium', 'shared/legacy', 'shared', 'assets/kilns/proxy', 'assets/kilns', 'assets/cathedral', 'docs', 'tests', 'history']:
 (ROOT/d).mkdir(parents=True,exist_ok=True)

# Preserve immutable predecessor before modifying any source.
copy2(S/'webspace_github_upload.zip', ROOT/'history/version_0003.zip')
# Copy legacy graph runtime / documentation into a shared engine leaf.
legacy=IN/'v3'
for p in legacy.iterdir():
 if p.is_file() and p.suffix not in ('.zip',): copy2(p,ROOT/'shared/legacy'/p.name)

# The canonical modern Chuzhoy standalone, with its own fully embedded renderer.
copy2(S/'Garden_of_Chuzhoy_6_2_5_1_QA_PLAY.txt', ROOT/'worlds/chuzhoy/garden_native.html')
# Elisium 4.6 is an independently packed HTML engine, supplied by project Library.
copy2(S/'elisium_v4_6_compact_preview.txt',ROOT/'worlds/elisium/elisium_native.html')
# Previous independently-authored Witch's Hole with true root/puzzle state.
witch=IN/'witch/witchs_hole'
for p in witch.iterdir():
 if p.is_file() and p.name !='witchs-hole.js.orig':copy2(p,ROOT/'worlds/witchs-hole'/p.name)
wp=ROOT/'worlds/witchs-hole/witchs-hole.js'
w=wp.read_text()
old="location.pathname.includes('/witchs_hole/')?'../webspace_v6_1_2/index.html':'./webspace_v6_1_2/index.html'"
assert old in w
w=w.replace(old,"'../chuzhoy/index.html'")
w=w.replace('The packaged edition includes the previous Webspace in its sibling folder.', 'The unified edition routes back through the published Garden entrance.')
wp.write_text(w)
wi=ROOT/'worlds/witchs-hole/index.html'
w=wi.read_text().replace('</body>','<script src="../../shared/world-nav.js"></script>\n</body>')
wi.write_text(w)

# Fortess/Gringotts same source lineage but separate launcher pages, shared versioned code.
# Keep original file names timeless. Do not create fragile duplicate JS copies.
idx=(legacy/'index.html').read_text()
# Relative webspace source references are rooted in the repository rather than in a world.
for fn in ['webspace-channel.js','webspace-portal.js','webspace-screen.js','webspace-bank-desk.js','worlds-runtime.js','webspace-fallback.js','webspace.js']:
 idx=idx.replace('src="'+fn+'"','src="../../shared/legacy/'+fn+'"')
idx=idx.replace('</body>', '<script src="../../shared/world-nav.js"></script>\n</body>')
(ROOT/'worlds/fortress/index.html').write_text(idx)
# This is its own page and entry, not the throne room masquerading as a separate build.
startbank='<script>if(!new URLSearchParams(location.search).has("ws_entry")){history.replaceState(null,"",location.pathname+"?ws_v=1&ws_entry=gringotts-gerudo"+location.hash)}</script>\n'
(ROOT/'worlds/gringotts/index.html').write_text(idx.replace('<script src="../../shared/legacy/webspace-channel.js"></script>',startbank+'<script src="../../shared/legacy/webspace-channel.js"></script>'))

# Modify the legacy renderer's portal cross-world handoff to a sibling webspace rather
# than changing the shared runtime's own in-memory node graph. It still uses native
# portal activation and published arrival tags, and sends no saved session history.
js=ROOT/'shared/legacy/webspace.js'
s=js.read_text()
needle='onLocal:(world,entry)=>{'
assert s.count(needle)==1
patch="""onLocal:(world,entry)=>{
       const crossWorldPages={
         garden:'../chuzhoy/index.html?ws_v=1&ws_entry=chuzhoy-north',
         fortress:'../fortress/index.html?ws_v=1&ws_entry='+(state.world==='gringotts'?'fortress-bank-rear':'fortress-gate'),
         gringotts:'../gringotts/index.html?ws_v=1&ws_entry=gringotts-gerudo'
       };
       if(crossWorldPages[world]){
         location.assign(new URL(crossWorldPages[world],location.href));
         return;
       }
"""
s=s.replace(needle,patch)
js.write_text(s)

# Common world portal navigation. No credentials, history, stored data or camera
# coordinates travel with links. This is additive to each world's native mechanics.
nav='''/* Webspace root portal navigator 1.0 — explicit location-only handoff. */
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
})();'''
(ROOT/'shared/world-nav.js').write_text(nav)

# Wrappers isolate independent engine boot and avoid rewriting the native code.
wrapper='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>html,body,iframe{{width:100%;height:100%;margin:0;border:0;background:#101827;overflow:hidden}}iframe{{display:block}}</style></head><body><iframe title="{title}" src="{native}" allow="fullscreen"></iframe><script src="../../shared/world-nav.js"></script></body></html>'''
(ROOT/'worlds/chuzhoy/index.html').write_text(wrapper.format(title='Garden of Chuzhoy · Webspace 6.2.5.1',native='garden_native.html'))
(ROOT/'worlds/elisium/index.html').write_text(wrapper.format(title='Elisium · Living Concordance 4.6',native='elisium_native.html'))

# Original cathedral source is a reusable, not fabricated as the sixth traversable world.
with ZipFile(BASE/'Cathedral_of_a_Thousand_Heavens_Rev06_Stained_Glass_Lightweight.zip') as z:
 for info in z.infolist():
  if info.is_dir():continue
  rel=Path(info.filename)
  if '..' in rel.parts:continue
  out=ROOT/'assets/cathedral'/Path(*rel.parts[1:])
  out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(z.read(info))

# Parse real 24-object specification table; sources are candidates not downloaded models.
curator=(S/'CURATOR_TABLE.txt').read_text()
rows=[]
for line in curator.splitlines():
 if not line.startswith('| H'):continue
 cells=[x.strip() for x in line.strip().strip('|').split('|')]
 if len(cells)<6:continue
 id_,obj,action,inquiry,link,fit=cells[:6]
 url=re.search(r'\]\((https://polyhaven.com/a/[^)]+)\)',link)
 obj_name,room=(obj.split(' · ',1)+[''])[:2]
 rows.append({'id':id_,'name':obj_name,'room':room,'action':action,'inquiry':inquiry,'polyhaven_url':url.group(1) if url else '', 'fit':fit,'asset_status':'original_low_poly_proxy', 'external_artist_model_included':False,'proxy_path':f'proxy/{id_}.glb'})
assert len(rows)==24

# Deterministic GLB shapes: original engineering placeholders, not Poly Haven downloads.
# Each object includes distinguishable shapes, small triangle budgets and no external textures.
def box(extents,at,color,parts):
 m=trimesh.creation.box(extents=extents);m.apply_translation(at);m.visual.face_colors=color;parts.append(m)
def cyl(rad,height,at,color,parts,sections=10):
 m=trimesh.creation.cylinder(radius=rad,height=height,sections=sections);m.apply_translation(at);m.visual.face_colors=color;parts.append(m)
def ball(rad,at,color,parts,subdivisions=1):
 m=trimesh.creation.icosphere(radius=rad,subdivisions=subdivisions);m.apply_translation(at);m.visual.face_colors=color;parts.append(m)
def frame(parts,w=1.4,h=1.7):
 for x in [-w/2,w/2]:box([.12,.13,h],[x,0,h/2],bronze,parts)
 for z in [.07,h-.07]:box([w+.13,.16,.12],[0,0,z],bronze,parts)
bronze=[175,131,71,255];wood=[93,61,43,255];stone=[142,139,134,255];paper=[221,202,158,255];glass=[100,169,167,180];blue=[70,99,147,255];red=[164,70,64,255]
for row in rows:
 id_=row['id'];n=int(id_[1:]);parts=[]
 box([1.5,1.0,.11],[0,0,.04],stone,parts) # shared stand
 if n in (1,16):
  frame(parts);box([1.1,.10,1.45],[0,0,.80],wood,parts);ball(.07,[.37,-.09,.80],bronze,parts)
 elif n in (2,14):
  box([1.2,.55,.75],[0,0,.42],stone,parts);box([.76,.15,.12],[0,-.28,.64],red,parts);ball(.27,[0,-.2,.95],bronze,parts)
 elif n in (3,21):
  frame(parts);[box([.07,.1,1.45],[x,0,.8],bronze,parts) for x in [-.25,.25]]
  [box([1.25,.1,.07],[0,0,z],bronze,parts) for z in [.45,.9,1.35]]
 elif n in (4,24):
  for i in range(4):box([1.1-i*.15,.4,.22],[-.05,i*.16,.2+i*.24],wood,parts)
 elif n in (5,6,11,12,18):
  box([1.05,.65,.63],[0,0,.40],wood,parts)
  box([.75,.55,.07],[0,0,.77],paper,parts)
  if n in (5,18):box([.06,.5,.24],[0,0,.94],red,parts)
 elif n in (7,23):
  for x in (-.36,.36):cyl(.18,.31,[x,0,.4],bronze,parts)
  if n==23:box([.6,.12,.8],[.3,.3,.63],wood,parts)
 elif n in (8,13):
  box([.85,.38,1.26],[0,0,.71],wood,parts);box([.10,.45,1.22],[0,0,.71],bronze,parts)
 elif n in (9,10):
  box([.95,.12,1.14],[0,0,.75],wood,parts);box([.67,.07,.88],[0,-.10,.76],glass,parts)
 elif n in (15,17):
  cyl(.42,.07,[0,0,.42],bronze,parts);ball(.27,[0,0,.84],blue,parts)
  for ang in (0,math.pi/2):
   for x in [-.35,.35]: box([.06,.04,.78],[x*math.cos(ang),x*math.sin(ang),.83],bronze,parts)
 elif n in (19,20):
  cyl(.33,.18,[0,0,.35],wood,parts);cyl(.055,.8,[0,0,.77],bronze,parts);ball(.15,[.20,0,1.1],blue,parts)
 elif n==22:
  ball(.27,[0,0,.8],wood,parts);ball(.17,[.16,0,1.03],bronze,parts)
 else:
  box([1,.6,.8],[0,0,.5],wood,parts)
 scene=trimesh.Scene()
 for i,m in enumerate(parts):scene.add_geometry(m,node_name=f'{id_}_part_{i}')
 blob=scene.export(file_type='glb')
 (ROOT/'assets/kilns/proxy'/f'{id_}.glb').write_bytes(blob)
 row['proxy_size_bytes']=len(blob)

(ROOT/'assets/kilns/OBJECTS.json').write_text(json.dumps({'schema':'webspace/kilns-objects/1','origin':'Kilns curator v0.3; 24 candidate Poly Haven links; generated CC0-independent proxies','latest_library_package_not_materialized':'Elisium_Kilns_Concordance_PolyHaven_Bank_v0_6.zip','objects':rows},indent=2,ensure_ascii=False))
(ROOT/'assets/kilns/CURATOR_TABLE.md').write_text(curator)
# A source-compatible download helper. No on-page hotlinks or unconsented downloads.
(ROOT/'assets/kilns/acquire_polyhaven.py').write_text('''#!/usr/bin/env python3
"""List/download exact upstream Poly Haven originals (optional, offline safe by default).
API access requires a Powered by Poly Haven acknowledgement in tools built on it.
Run: python acquire_polyhaven.py --list
     python acquire_polyhaven.py --download --ids H01,H02
Downloads only explicit GLB/GLTF file candidates if the API advertises them.
"""
import argparse, json, urllib.request, pathlib, os, urllib.parse
P=pathlib.Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--list',action='store_true');parser.add_argument('--download',action='store_true');parser.add_argument('--ids',default='');a=parser.parse_args()
manifest=json.loads((P/'OBJECTS.json').read_text())['objects']
want=set(x.strip().upper() for x in a.ids.split(',') if x.strip())
for row in manifest:
 if want and row['id'] not in want:continue
 asset=row['polyhaven_url'].split('/a/')[-1]
 print(f"{row['id']}: {row['name']} — {row['polyhaven_url']}")
 if not a.download:continue
 req=urllib.request.Request(f'https://api.polyhaven.com/files/{asset}',headers={'User-Agent':'Webspace-KilnsAssetImporter/1.0'})
 try:
  with urllib.request.urlopen(req,timeout=25) as r:files=json.load(r)
  # File formats and download links are published by the upstream API; never guess.
  formats=[(k,v) for k,v in files.items() if k.lower() in ('gltf','glb') and isinstance(v,dict)]
  options=[]
  for fmt,variants in formats:
   for res,v in variants.items():
    if not isinstance(v,dict):continue
    for key,record in v.items():
     if isinstance(record,dict) and isinstance(record.get('url'),str):options.append((fmt,res,key,record['url']))
  if not options:
   print('  No direct GLB/GLTF in API response. Download manually in browser:',row['polyhaven_url']);continue
  fmt,res,key,url=sorted(options,key=lambda x:('1k' not in x[1].lower(),x[0]!='glb'))[0]
  dest=P/'imports'/row['id'];dest.mkdir(parents=True,exist_ok=True)
  name=pathlib.Path(urllib.parse.urlparse(url).path).name
  if not name or not name.lower().endswith(('.glb','.gltf')):print('  Unknown filename, inspect URL manually');continue
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Webspace-KilnsAssetImporter/1.0'}),timeout=120) as r:
   (dest/name).write_bytes(r.read())
  print('  Downloaded',dest/name)
 except Exception as e:print('  Needs manual review:',type(e).__name__,str(e)[:140])
''')

# Compact interactive 24-object index (not yet physically placing artist models in Kilns).
cards='\n'.join(f'<article><b>{r["id"]} · {escape(r["name"])}</b><small>{escape(r["room"])}</small><p>{escape(r["action"])}</p><a href="proxy/{r["id"]}.glb" download>Low-poly GLB</a> · <a target="_blank" rel="noopener noreferrer" href="{r["polyhaven_url"]}">Poly Haven candidate</a></article>' for r in rows)
(ROOT/'assets/kilns/index.html').write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Kilns · 24 objects</title><style>body{{background:#0e1923;color:#e9dec7;font:15px/1.5 system-ui;margin:0;padding:26px}}h1{{font-family:Georgia}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}}article{{background:#1b2b35;padding:17px;border:1px solid #7e80735c;border-radius:12px}}b,small{{display:block}}small{{color:#aebdb9}}a{{color:#efcf93}}</style></head><body><p><a href="../../index.html">◈ Webspace root</a></p><h1>The Kilns · 24-object asset bank</h1><p>Each object has a generated, importable low-poly GLB proxy. Poly Haven artist-original models are not included; the source candidates and an optional acquisition script are retained.</p><div class="grid">{cards}</div></body></html>''')

# Shared 5-world topology with distinct arrival tags and explicit no-auth semantics.
worlds=[
 {'id':'chuzhoy','name':'Garden of Chuzhoy','entry':'worlds/chuzhoy/index.html','version':'6.2.5.1 QA standalone','engine':'Embedded 6.2.5.1 runtime','arrival_tag':'chuzhoy-north'},
 {'id':'fortress','name':'Gerudo Fortress','entry':'worlds/fortress/index.html','version':'Gringotts-era v3','engine':'Chuzhoy legacy WebGL2/Canvas fallback','arrival_tag':'fortress-gate'},
 {'id':'gringotts','name':'Gringotts Gerudo Branch','entry':'worlds/gringotts/index.html?ws_v=1&ws_entry=gringotts-gerudo','version':'Gringotts-era v3','engine':'Chuzhoy legacy WebGL2/Canvas fallback','arrival_tag':'gringotts-gerudo'},
 {'id':'witchs-hole','name':"Witch's Hole",'entry':'worlds/witchs-hole/index.html','version':'v2 Ravine Cliff','engine':'Independent Witch WebGL2','arrival_tag':'witch-arrival'},
 {'id':'elisium','name':'Elisium · Living Concordance','entry':'worlds/elisium/index.html','version':'4.6 compact playable','engine':'Independent Elisium WebGL2/Canvas compatible','arrival_tag':'elisium-first-footfall'}]
manifest={'schema':'webspace/federation/1.0','release_integer':4,'source_lineage':'Chuzhoy 6.2.5.1 + legacy v3 Gerudo/Gringotts + Witch v2 + Elisium v4.6','worlds':worlds,'portal_contract':{'query':'?ws_v=1&ws_entry=<published-tag>','transfer':['public arrival tag'],'prohibited_transfer':['credentials','private correspondence','balances','player history','camera coordinates'],'cross_world_sessions':'per-world only'},'asset_bank':{'kilns_proxy_count':24,'actual_polyhaven_artist_files':0,'cathedral_revision':'Rev06'}}
(ROOT/'WORLD_MANIFEST.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))

# Root hub that opens an ACTUAL running world immediately, not a brochure.
buttons=''.join(f'<button type="button" data-id="{w["id"]}" data-target="{escape(w["entry"],quote=True)}">{escape(w["name"])}</button>' for w in worlds)
root='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#071323"><title>WEBSPACE · Five Worlds</title><style>html,body{height:100%;margin:0;background:#070f1c;color:#ecdfc3;overflow:hidden;font-family:system-ui,sans-serif}*{box-sizing:border-box}#frame{display:block;border:0;width:100%;height:100%;background:#101522}#bar{position:fixed;z-index:9999;top:0;left:0;right:0;background:linear-gradient(#071423ee,#102037bc);border-bottom:1px solid #d1b27855;display:flex;align-items:center;gap:10px;padding:8px 13px;box-shadow:0 6px 26px #0008}#brand{font:bold 12px Georgia,serif;letter-spacing:.11em;color:#edd8ae;white-space:nowrap}#tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:thin;flex:1}button,a{white-space:nowrap}#tabs button{font:11px system-ui,sans-serif;border:1px solid #c2b39366;background:#1a3042ce;color:#e9e4d8;border-radius:5px;padding:7px 10px;cursor:pointer}#tabs button[aria-current=page]{background:#bea474;color:#101b23;font-weight:750}#tools{font:11px system-ui}#tools a{color:#f3d6a2;text-decoration:none}#status{position:fixed;z-index:20;bottom:9px;left:12px;background:#071c2ccf;color:#d8c8a6;font:10px system-ui;padding:5px 9px;border-radius:5px;pointer-events:none}#bar button:focus-visible,#bar a:focus-visible{outline:2px solid #ffe2a4}@media(max-width:720px){#bar{flex-wrap:wrap;gap:6px}#brand{display:none}#tabs{width:100%;flex:auto}#tabs button{padding:7px 8px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body><div id="bar"><div id="brand">✧ WEBSPACE</div><nav id="tabs" aria-label="Choose a world">__BUTTONS__</nav><div id="tools"><a href="assets/kilns/index.html" target="_blank" rel="noopener">24 OBJECTS</a></div></div><iframe id="frame" title="Interactive Webspace world" allow="fullscreen" src="worlds/chuzhoy/index.html"></iframe><div id="status">Five distinct webspaces · One root · Travel through named portals</div><script>(function(){'use strict';const tabs=[...document.querySelectorAll('#tabs button')],f=document.getElementById('frame'),qs=new URLSearchParams(location.search);function load(id,record){const b=tabs.find(x=>x.dataset.id===id)||tabs[0];f.src=b.dataset.target;tabs.forEach(t=>t.setAttribute('aria-current',t===b?'page':'false'));if(record)history.replaceState(null,'','?world='+encodeURIComponent(b.dataset.id));}tabs.forEach(b=>b.onclick=()=>load(b.dataset.id,true));load(qs.get('world')||'chuzhoy',false);})();</script></body></html>'''.replace('__BUTTONS__',buttons)
(ROOT/'index.html').write_text(root)
(ROOT/'garden-of-chuzhoy.html').write_text('''<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=worlds/chuzhoy/index.html"><title>Garden of Chuzhoy</title><p><a href="worlds/chuzhoy/index.html">Enter Garden of Chuzhoy</a></p>''')
(ROOT/'.nojekyll').write_text('')
(ROOT/'.gitignore').write_text('''# Intermediate development outputs, never visitor state\n__pycache__/\n*.pyc\n.DS_Store\nassets/kilns/imports/\n''')

readme='''# Webspace · five independent worlds under one root

> **Revision covenant for human and AI collaborators:** Before changing a release, archive the entire old codebase under the next integer revision. In EVERY revision update `README.md` (player experience) and `TECH_MANUAL.html` (developer architecture and tests); preserve timeless active filenames and provide a full-screen HTML preview.

## Version 4 · 9 November 2026

The root `index.html` launches a playable Garden immediately with a five-world selector. For direct launch use the separate entrypoints below. Each has its own canvas/runtime and may be developed independently.

| World | Direct page | Engine/source | What the visitor does |
| --- | --- | --- | --- |
| Garden of Chuzhoy | `worlds/chuzhoy/index.html` | Chuzhoy 6.2.5.1 self-contained QA build | Explore the canonical Garden, flora, portal connections and route mechanics |
| Gerudo Fortress | `worlds/fortress/index.html` | Preserved Gringotts-era v3 renderer | Approach the throne and its rear banking portal |
| Gringotts Gerudo Branch | `worlds/gringotts/index.html` | Same code lineage but separate launch / initial node | Visit tellers, paper contracts, calendar, fictional ledger and Proton service gallery |
| Witch's Hole | `worlds/witchs-hole/index.html` | Independent Ravine Cliff v2 engine | Traverse 10 sites, break roots, follow the fog, return to Garden |
| Elisium | `worlds/elisium/index.html` | Independent v4.6 compact playable HTML | Explore the star, the Kilns, Concordance Lens and its independent sky |

**Controls:** Use each world's visible travel and look controls. The compact `◈ WORLDS` button near the bottom right opens a cross-world directory. External transitions use only public named arrival tags, not identity, credits, browsing history or passwords. Worlds do not pretend to share an authentication server.

### The Kilns: twenty-four models

`assets/kilns/index.html` lists all H01–H24 with their names, room locations, behavior, optional Poly Haven candidate links and an **actual low-poly GLB proxy** each, generated for this release. These placeholders are not the original Poly Haven artist assets and are not automatically placed into the Elisium v4.6 interior.

No download is needed **before publishing this package** to GitHub. If you want realistic Poly Haven furnishings, you do need to download the selected models (unique models can serve multiple H objects) or allow an authenticated download workflow with a reachable network. Poly Haven originals have not been fetched into this package. An explicit optional `assets/kilns/acquire_polyhaven.py` script records the acquisition method.

### Release limitations

- These are five valid browser entry points and a shared navigation hub, not yet a single reconciled physics/graphics engine. Chuzhoy 6.2.5.1 and the older Gringotts-era renderer have intentionally not had their different botanical/geometry branches silently merged.
- Gringotts's registration, digital currency, secure storage and Proton service controls are creative demonstration UI, not real banking or private storage. **Never enter real credentials.**
- Elisium 4.6 was recovered as a complete self-contained compact playable HTML, but its separate 8.3 MB source archive and Kilns v0.6 ZIP were indexed in the Library without authorized downloadable backing bytes. They remain separately tracked as upstream sources, NOT dishonestly represented as present here.
- Poly Haven catalog entries are source references. This package contains 24 generated original low-poly proxies, not Poly Haven original binary downloads.
- Cathedral Rev06 is included as independent reusable asset source with STEP, GLB, and stained-glass textures; not installed as a sixth playable world.
- Static GitHub Pages is not a trusted backend. Persistent multiuser identity/private vaults require separate secure architecture.

### Publish

Publish this **root directory**, not its outer ZIP folder, to `Vitra-Lumenhart/Webspace` on `main`. Settings → Pages → deploy from branch `main` → `/(root)`. Expected URL: `https://vitra-lumenhart.github.io/Webspace/`. A successful GitHub commit and Pages deployment must be separately verified before anyone calls the site live.

## Source provenance

Predecessor `history/version_0003.zip` is the complete earlier Gringotts-era source. The Garden native build came from the newest retrievable 6.2.5.1 QA HTML; Witch from the actual v2 Ravine Cliff ZIP; Elisium from v4.6 compact playable HTML. See `TECH_MANUAL.html`, `WORLD_MANIFEST.json`, `assets/kilns/OBJECTS.json` and the source-history integrity test.
'''
(ROOT/'README.md').write_text(readme)
tech='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Webspace Unified v4 · Technical Manual</title><style>body{background:#111f2b;color:#e1e4e3;font:16px/1.58 system-ui;max-width:980px;margin:auto;padding:24px}h1,h2{color:#e7c993;font-family:Georgia}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #50606c;padding:8px;text-align:left}code{color:#bbdad5}a{color:#eed095}pre{background:#07121c;padding:16px;overflow:auto}</style></head><body><small>Developer manual · 2026-11-09 · immutable integer snapshot</small><h1>Webspace Federation · revision 4</h1><h2>1. Architectural isolation</h2><p>The five entry points share a GitHub Pages root and explicit named-arrival protocol. They do NOT share global mutable JavaScript contexts, WebGL resources, browser storage keys or any backend. Legacy Gerudo and Gringotts share immutable engine source files but have distinct HTML launches. The modern Chuzhoy standalone and independent Witch/Elisium renderers are kept intact.</p><pre>index.html → iframe(worlds/*/index.html)
worlds/chuzhoy/index.html → garden_native.html (6.2.5.1)
worlds/fortress/index.html → shared/legacy/*.js (v3)
worlds/gringotts/index.html → shared/legacy/*.js (?ws_entry=gringotts-gerudo)
worlds/witchs-hole/index.html → witchs-hole.js (v2)
worlds/elisium/index.html → elisium_native.html (v4.6)</pre><h2>2. Portal protocol</h2><p>The shared UI uses explicit navigation to named worlds; the native legacy portal onLocal handler was minimally adapted to load sibling world pages. Witch's exit now loads <code>../chuzhoy/index.html?ws_v=1&amp;ws_entry=chuzhoy-north</code>. Only public arrival names travel. Source world time, saved journal and login state are not transmitted. Custom world mechanisms remain their own authority.</p><h2>3. Geometry and provenance</h2><p>H01–H24 proxy GLBs are generated with primitive triangle meshes and guaranteed to be real glTF binaries, not symbolic filenames. All source URLs are candidates from the 24-object curator table, with asset-status set explicitly to placeholder. No original Poly Haven binaries are included. Upstream v0.6 package is known by filename and size but could not be exported from the project Library on this run. Cathedral Rev06 is archived unmodified inside <code>assets/cathedral/</code> with model and original CAD.</p><h2>4. Reproducibility and validation</h2><p>Run <code>node tests/test_unified.mjs</code> and run existing legacy JS tests inside <code>shared/legacy</code>. Run <code>python -m http.server 8000</code> at repository root and test the Garden, fortress, bank, Witch and Elisium in Chromium. WebGL contexts may be disabled by browser policy; Canvas fallback exists for the relevant engines. Check browser console and navigation behavior before claiming complete GPU validation.</p><h2>5. Hosted deployment</h2><p>Upload full repository root to the Webspace repository. GitHub Pages from <code>main/(root)</code>. Prefer coherent, atomic commits. Preserve this README and TECH_MANUAL covenant. Avoid checking private keys, customer data, and drafts into a public repo.</p></body></html>'''
(ROOT/'TECH_MANUAL.html').write_text(tech)
(ROOT/'docs/RECONCILIATION.md').write_text('''# Source reconciliation and missing binaries

- Modern Chuzhoy 6.2.5.1: restored as a self-contained complete QA HTML, no full editable ZIP v6.2.5 retrievable.
- Fortress + Gringotts: v3 old codebase restored in full from `webspace_github_upload.zip` and used as a separate native renderer. Keep bank/Proton UI as fictional prototypes.
- Witch's Hole v2: restored from complete ZIP, root-break mechanic and portal route patched to Garden target.
- Elisium v4.6: restored as complete self-contained compact playable HTML, but not as multi-file v4.6 archive. The v4.6 source ZIP is indexed in the Project Library, not materializable; reattach it to replace native preview with editable source.
- Kilns asset bank v0.6: indexed in Project Library, not materializable; 24 independent low-poly proxy GLBs generated now with 24 candidate Poly Haven URLs. Reattach v0.6 ZIP when possible for source-to-source reconciliation.
- 24 individual upstream Poly Haven artist models: **not downloaded**, not required to push proxies to GitHub. Need explicit model downloads when realistic furnished house is desired.
- Cathedral: Rev06 reusable binary and STEP source bundled; newer v7 appears in Library, but binary v7 was not materializable.
''')
(ROOT/'GITHUB_PUBLISHING.md').write_text('''# GitHub target — Vitra-Lumenhart/Webspace

Repository: https://github.com/Vitra-Lumenhart/Webspace
Pages: https://vitra-lumenhart.github.io/Webspace/

This is a public static game source; it must not contain credentials, real proton tokens or real bank ledger data.

1. Archive current `main` before replacing; preserve `history/version_0003.zip` and the new integer archive.
2. Upload the CONTENTS of the unified release ZIP, not the outer folder.
3. Commit the complete tree atomically to `main` (or review on a PR before merging).
4. Settings → Pages → Deploy from branch → main → /(root).
5. Open all five direct routes, confirm asset requests, both portal directions, 24 GLBs, and that all prototype finance actions are clearly labeled.
6. Re-check `README.md` and `TECH_MANUAL.html` every change.

Until a successful commit is verified, this file is a staging plan, not proof of a deployment.
''')

# Absolute portable preview root outside the ZIP. It remains a game, not a static thumbnail.
(BASE/'webspace_preview.html').write_text(root.replace('src="worlds/chuzhoy/index.html"','src="webspace_unified/worlds/chuzhoy/index.html"').replace('data-target="worlds/','data-target="webspace_unified/worlds/').replace('href="assets/kilns/','href="webspace_unified/assets/kilns/'))

(ROOT/'tests/test_unified.mjs').write_text('''import {readFileSync,existsSync,statSync} from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');const load=p=>readFileSync(path.join(root,p),'utf8');const m=JSON.parse(load('WORLD_MANIFEST.json'));
assert.equal(m.worlds.length,5);assert.equal(new Set(m.worlds.map(w=>w.id)).size,5);
for(const w of m.worlds){const rel=w.entry.split('?')[0];assert(existsSync(path.join(root,rel)),rel);const data=load(rel);assert(data.includes('<html'),rel)}
assert(load('index.html').includes('worlds/chuzhoy/index.html'));
assert(load('worlds/fortress/index.html').includes('../../shared/legacy/webspace.js'));
assert(load('worlds/gringotts/index.html').includes('gringotts-gerudo'));
assert(load('shared/legacy/webspace.js').includes('crossWorldPages'));
assert(load('worlds/witchs-hole/witchs-hole.js').includes("'../chuzhoy/index.html'"));
const assets=JSON.parse(load('assets/kilns/OBJECTS.json')).objects;assert.equal(assets.length,24);
for(let i=1;i<=24;i++){const id='H'+String(i).padStart(2,'0');const item=assets.find(x=>x.id===id);assert(item,id);const fn=path.join(root,'assets/kilns/proxy',id+'.glb');assert(existsSync(fn));const b=readFileSync(fn);assert.equal(b.subarray(0,4).toString(),'glTF');assert(item.polyhaven_url.startsWith('https://polyhaven.com/a/'));assert.equal(item.external_artist_model_included,false)}
assert(existsSync(path.join(root,'history/version_0003.zip')));
for(const fn of ['README.md','TECH_MANUAL.html','GITHUB_PUBLISHING.md']) assert(existsSync(path.join(root,fn)));
console.log('PASS: five independent webspaces, portal route rewrites, version history, 24 real proxy GLBs and documentation.');''')

print('Built',ROOT,'files',sum(p.is_file() for p in ROOT.rglob('*')))
