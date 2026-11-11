#!/usr/bin/env python3
"""Native BRep guide plates for eight parametric tangent stained glass bays.
Glass lead and individual missing shards remain visual GLB components at this stage.
"""
import math
from pathlib import Path
import cadquery as cq
root=Path(__file__).resolve().parents[1]
assy=cq.Assembly(name='Rev06_broken_stained_glass_bay_envelopes')
for i,k in enumerate([0,1,3,4,6,7,9,10]):
    a=(k+.45)*math.tau/12
    u=96+32.15*math.cos(a)
    v=168+32.15*math.sin(a)
    # Tangent in plane XY is (-sin(a), cos(a)). Rectangular extents are guides only.
    plate=cq.Workplane('XY').box(7.4,.12,12.5).val()
    plate=plate.rotate((0,0,0),(0,0,1),math.degrees(a)+90).translate((u,v,(8.8+21.3)/2))
    assy.add(plate,name=f'glass_tangent_envelope_{i:02d}')
root.joinpath('cad').mkdir(exist_ok=True)
assy.save(str(root/'cad'/'glass_bay_cad_envelopes.step'))
print('STEP glass guide count:',8)
