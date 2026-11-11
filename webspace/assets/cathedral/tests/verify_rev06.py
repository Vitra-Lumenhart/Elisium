#!/usr/bin/env python3
"""Independent integrity, registration and render-resource smoke tests.
Does not claim a GPU/browser screenshot test succeeded.
"""
import json,math,sys
from pathlib import Path
from PIL import Image
import numpy as np
import trimesh
R=Path(__file__).resolve().parents[1];A=R/'public/assets';T=A/'textures'
assert (T/'marble_micro_atlas.webp').exists()
assert Image.open(T/'marble_micro_atlas.webp').size==(512,512)
glass=Image.open(T/'sevenfold_broken_glass.png').convert('RGBA')
assert glass.size==(256,512)
a=np.asarray(glass)[:,:,3]
assert (a==0).sum()>int(a.size*.16), 'glass should include actual transparent broken areas'
assert (a>0).sum()>int(a.size*.4), 'glass must visibly retain rich colored panes'
model=trimesh.load(A/'05_stained_glass.glb',force='scene')
assert len(model.geometry)==1
mesh=next(iter(model.geometry.values()))
assert len(mesh.faces)==16, 'eight two-triangle panes in a single batch'
assert mesh.visual.material.baseColorTexture.size==(256,512)
assert mesh.visual.material.alphaMode=='MASK'
assert mesh.visual.uv.shape==(32,2)
full=trimesh.load(A/'temple_full.glb',force='scene')
assert any('stained_glass' in n for n in full.geometry), 'full portable GLB has painted glass'
old=trimesh.load(A/'temple_lite.glb',force='scene')
assert len(old.geometry)>0
geo=json.loads((R/'stained_glass_layout.json').read_text());assert geo['window_count']==8
for panel in geo['panes']:
 u,v=panel['cad_uv'];r=math.hypot(u-96,v-168)
 assert abs(r-32.15)<.02,'registered concentric pane radius'
assert (R/'cad/glass_bay_cad_envelopes.step').stat().st_size>3000
js=(R/'public/viewer.js').read_text()
for expected in ['marble_micro_atlas.webp','05_stained_glass','setGlassLight','AdditiveBlending','glass_caustic_fake.webp']:
 assert expected in js,expected
print('PASS 8 painted bays, broken glass alpha, embedded GLB maps, 512² stone atlas, CAD coordinates, additive single-batch caustics')
print('GLB bytes', (A/'05_stained_glass.glb').stat().st_size, 'standalone full bytes', (A/'temple_full.glb').stat().st_size)
