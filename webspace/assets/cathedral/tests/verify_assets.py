from pathlib import Path
import sys,json,math
import trimesh
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'temple_manifest_rev05.json').read_text())
assert m['CAD_axes']['z']=='up'
assert m['world_altar_CAD']==[96,168,0]
assert m['grid_module_m']==.5
for name,stats in m['scene_files'].items():
 p=ROOT/'public/assets'/f'{name}.glb'
 s=trimesh.load(p,force='scene')
 assert s.bounds.shape==(2,3) and len(s.graph.nodes_geometry)==stats['nodes']
 assert p.stat().st_size==stats['bytes']
 assert s.bounds[0,1]>-5 and s.bounds[1,1]<90
assert (ROOT/'public/assets/temple_full.glb').stat().st_size<1_500_000
assert (ROOT/'cad/temple_structural_master.step').stat().st_size>100_000
print('PASS: five registered GLBs, combined exports, CAD STEP, model bounds and stage sizes')
