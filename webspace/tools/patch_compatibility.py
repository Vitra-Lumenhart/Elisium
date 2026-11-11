from pathlib import Path
from shutil import copy2
ROOT=Path('/mnt/data/webspace_unified')
garden=ROOT/'worlds/chuzhoy/index.html'
s=garden.read_text()
s=s.replace('</body>','''<script>if(!document.createElement('canvas').getContext('webgl2'))document.querySelector('iframe').src='../fortress/index.html?ws_v=1&ws_entry=chuzhoy-north';</script></body>''')
garden.write_text(s)
wich=ROOT/'worlds/witchs-hole'
(wich/'index.html').rename(wich/'witch_native.html')
copy2('/mnt/data/webspace_work/witch_fallback.html',wich/'witch_fallback.html')
(wich/'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Witch's Hole · Webspace v2</title><style>html,body,iframe{width:100%;height:100%;margin:0;border:0;background:#07191c;overflow:hidden}iframe{display:block}</style><iframe title="Witch's Hole game" src="witch_native.html" allow="fullscreen"></iframe><script>if(!document.createElement('canvas').getContext('webgl2'))document.querySelector('iframe').src='witch_fallback.html';</script><script src="../../shared/world-nav.js"></script></html>''')
readme=ROOT/'README.md';readme.write_text(readme.read_text().replace('Each has its own canvas/runtime and may be developed independently.','Each has its own canvas/runtime and may be developed independently. In GPU-restricted previews, Chuzhoy displays its older Canvas-compatible Garden and Witch’s Hole displays a simplified Canvas-based survey (including the root puzzle).'))
tech=ROOT/'TECH_MANUAL.html';tech.write_text(tech.read_text().replace('The modern Chuzhoy standalone and independent Witch/Elisium renderers are kept intact.','The modern Chuzhoy standalone and independent Witch/Elisium renderers are kept intact. A WebGL2 feature test selects older Garden Canvas fallback and a reduced Witch survey in GPU-restricted environments; these do not imply complete native feature parity.'))
print('Compatibility fallback installed')
