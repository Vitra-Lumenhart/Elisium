"""Create ONE reusable CAD conference chair, copied by transforms in the renderer.

Coordinate system for STEP: (X lateral, Y depth, Z up).
Runtime GLB: (X lateral, Y up, Z depth). Front of the chair is toward negative runtime Z.
The ornate outline, rivets and upholstery are separate editable B-rep solids; geometry
remains modest because the same source model is repeated many times in the room.
"""
from pathlib import Path
import math, base64
import cadquery as cq
import numpy as np
import trimesh
P=Path(__file__).parent
PARTS=[]
WOOD=(93,64,53,255); GOLD=(183,146,87,255); FABRIC=(32,54,75,255); LIGHT=(139,135,120,255)
def add(name, solid, color):PARTS.append((name,solid,color))
def box(name,w,d,h,center,col):
    s=cq.Workplane('XY').box(w,d,h).val().translate(center);add(name,s,col)
def cyl(name,xyz,rad,h,col):add(name,cq.Solid.makeCylinder(rad,h,cq.Vector(*xyz),cq.Vector(0,0,1)),col)
def beam(name,a,b,r,col):
    A=cq.Vector(*a);B=cq.Vector(*b);d=B-A
    add(name,cq.Solid.makeCylinder(r,d.Length,A,d.normalized()),col)
# Seat base, piping and fabric cushion.
box('seat_carved_frame',1.12,1.05,.13,(0,0,.93),WOOD)
box('seat_cushion',1.025,.95,.12,(0,-.01,1.06),FABRIC)
for x in [-.56,.56]:
    for y in [-.43,.43]:
        beam(f'tapered_leg_{x}_{y}',(x*.94,y*.96,.0),(x,y,.91),.052,WOOD)
        cyl(f'leg_foot_{x}_{y}',(x*.94,y*.96,0),.065,.08,GOLD)
# Curving back with separate wood stiles and a fabric panel, ornamental crest.
for x in [-.48,.48]:
    beam(f'back_post_{x}',(x,.40,.96),(x,.45,2.0),.065,WOOD)
    cyl(f'finial_{x}',(x,.45,1.96),.083,.18,GOLD)
box('back_lower_rail',1.08,.11,.13,(0,.43,1.22),WOOD)
box('back_upper_rail',1.06,.13,.16,(0,.46,1.93),GOLD)
box('upholstered_back',.93,.105,.72,(0,.44,1.59),FABRIC)
box('back_panel_gilt_bead',.70,.14,.07,(0,.44,1.91),GOLD)
# Armrests for conference grandeur, subtle gilt caps.
for sign in [-1,1]:
    x=sign*.59
    beam(f'arm_support_front_{sign}',(x,-.28,.99),(x,-.28,1.38),.048,WOOD)
    beam(f'arm_rail_{sign}',(x,-.33,1.37),(x,.35,1.41),.068,WOOD)
    cyl(f'arm_pin_front_{sign}',(x,-.31,1.36),.071,.047,GOLD)
    cyl(f'arm_pin_back_{sign}',(x,.32,1.38),.071,.047,GOLD)
for i in range(8):
    x=-.37+(i%4)*.245; z=1.43+(i//4)*.31
    # Four tiny head-on crest studs are visible when looking along the aisle.
    cyl(f'back_stud_{i}',(x,.515,z),.021,.022,GOLD)
compound=cq.Compound.makeCompound([p[1] for p in PARTS]);cq.exporters.export(compound,str(P/'correspondents_chair.step'),exportType='STEP')
scene=trimesh.Scene();count=0
for i,(name,solid,color) in enumerate(PARTS):
    vertices,faces=solid.tessellate(.10,.45)
    if not faces:continue
    pts=np.asarray([[v.x,v.z,v.y] for v in vertices],dtype=np.float32)
    face=np.asarray(faces,dtype=np.int32)[:,[0,2,1]]
    mesh=trimesh.Trimesh(vertices=pts,faces=face,process=False,validate=False)
    mesh.visual.vertex_colors=np.tile(np.array(color,dtype=np.uint8),(len(pts),1))
    scene.add_geometry(mesh,geom_name='chair_part_'+str(i),node_name=name)
    count+=len(mesh.faces)
b=trimesh.exchange.gltf.export_glb(scene)
(P/'correspondents_chair.glb').write_bytes(b)
(P/'correspondents_chair_asset.js').write_text('window.WEBSPACE_CHAIR_GLB="'+base64.b64encode(b).decode()+'";\n')
print(f'Chair: {len(PARTS)} CAD parts, {count} triangles, {len(b)} GLB bytes, STEP {(P/"correspondents_chair.step").stat().st_size} bytes')
