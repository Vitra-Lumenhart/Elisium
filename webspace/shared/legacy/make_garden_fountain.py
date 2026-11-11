"""Garden of Chuzhoy: generate editable CAD STEP and runtime glTF GLB fountain assets.
Python 3 with cadquery, numpy, trimesh. CAD is Z-up; render asset is Y-up.
All geometry is original and created from deterministic mathematical descriptions.
"""
from pathlib import Path
import math
import numpy as np
import cadquery as cq
import trimesh

ROOT = Path(__file__).resolve().parent
PARTS=[]

# Durable CAD source: each item is an independently labeled BRep solid.
def add(name,shape,color):
    PARTS.append((name,shape,color))

def revolve(name, profile, color):
    """Lathe a radial-Z profile around the global CAD Z axis."""
    wp=cq.Workplane('XZ').polyline(profile).close().revolve(360, (0,0,0),(0,1,0))
    add(name,wp.val(),color)

def torus(name,major,minor,z,color):
    # A torus generated as the revolve of a circular CAD profile.
    shape=cq.Solid.makeTorus(major,minor,cq.Vector(0,0,z),cq.Vector(0,0,1))
    add(name,shape,color)

def sphere(name,center,r,color):
    shape=cq.Workplane('XY').sphere(r).val().translate(center)
    add(name,shape,color)

def cylinder(name,x,y,z,r,h,color):
    shape=cq.Solid.makeCylinder(r,h,cq.Vector(x,y,z),cq.Vector(0,0,1))
    add(name,shape,color)

ivory=(222,219,209,255); pearl=(235,231,222,255); limestone=(190,190,181,255)
gold=(183,151,93,255); sea=(91,158,178,255); patina=(127,163,155,255)

# Old French estate commissioned in an era of extravagant, very delicate ornament.
revolve('A01_six_step_plinth',[
    (0,0),(3.82,0),(4.04,.055),(4.10,.115),(4.06,.18),(3.96,.23),
    (4.18,.28),(4.26,.35),(4.17,.43),(3.97,.48),(0,.48)],limestone)
torus('A02_base_gold_inlay',4.11,.052,.25,gold)

# Cut-away water basin: closed profile explicitly returns along the basin interior.
revolve('B01_foliated_primary_basin',[
    (0,.44),(3.8,.44),(4.18,.51),(4.48,.67),(4.75,.83),(4.90,1.01),
    (4.92,1.13),(4.81,1.24),(4.61,1.22),(4.43,1.12),(4.25,1.02),
    (4.02,.95),(3.55,.90),(2.0,.88),(0,.88)],ivory)
torus('B02_basin_lip_beading',4.70,.082,1.20,pearl)
torus('B03_basin_underside_band',4.15,.055,.54,gold)

# Water is a true separate material; the 3D renderer can animate its shader.
revolve('B04_deep_azure_water_surface',[(0,.88),(4.04,.88),(4.04,.91),(0,.91)],sea)

# Slender decorated support, with gently swelling profile and gold bands.
revolve('C01_reeded_pedestal',[
    (0,.9),(.82,.9),(1.18,1.02),(1.15,1.16),(.84,1.35),(.76,1.6),
    (.72,2.03),(.80,2.42),(1.05,2.60),(1.10,2.72),(.85,2.8),(0,2.8)],ivory)
for i,z in enumerate([1.18,1.48,2.22,2.67]):
    torus(f'C02_reed_gold_band_{i:02}',.89 if z not in (1.18,2.67) else 1.04,.041,z,gold)

# Higher upper bowl, with inward wet basin and underturned acanthus rim.
revolve('D01_upper_bowl',[
    (0,2.72),(.94,2.72),(1.05,2.91),(1.48,3.04),(1.92,3.17),
    (2.38,3.34),(2.65,3.52),(2.72,3.63),(2.63,3.73),(2.46,3.72),
    (2.26,3.59),(1.95,3.49),(1.24,3.45),(0,3.45)],pearl)
torus('D02_upper_gilt_bead',2.55,.052,3.68,gold)
revolve('D03_upper_water_disk',[(0,3.46),(2.05,3.46),(2.05,3.48),(0,3.48)],sea)
revolve('E01_fluted_crown_and_finial',[
    (0,3.46),(.55,3.46),(.66,3.64),(.55,3.79),(.36,4.15),(.34,4.65),
    (.56,4.88),(.67,5.02),(.5,5.23),(.32,5.38),(.20,5.72),(.13,5.96),
    (0,6.07)],pearl)
torus('E02_finial_neck_gold',.35,.035,4.56,gold)
torus('E03_finial_collar_gold',.57,.037,5.04,gold)

# Acanthus buds, mascaron bosses, and softly geometric floral relief.
# The high polygon count is concentrated in this single narratively important asset.
for i in range(24):
    a=(i+.5)*2*math.pi/24
    r=4.18; x=r*math.cos(a); y=r*math.sin(a)
    sph=cq.Workplane('XY').sphere(.24).val().translate((x,y,.86))
    add(f'F01_outer_petal_{i:02}',sph,pearl if i%3 else gold)
for i in range(16):
    a=i*2*math.pi/16
    x=2.1*math.cos(a);y=2.1*math.sin(a)
    shape=cq.Workplane('XY').sphere(.18).val().translate((x,y,3.32))
    add(f'F02_upper_leaf_{i:02}',shape,limestone)
for i in range(12):
    a=i*2*math.pi/12
    x=.79*math.cos(a);y=.79*math.sin(a)
    sh=cq.Workplane('XY').sphere(.17).val().translate((x,y,2.07))
    add(f'F03_pedestal_flower_{i:02}',sh,gold)

# Small finial and spouts around rim. Webspace supplies the animated water arcs.
for i in range(8):
    a=i*2*math.pi/8
    x=2.53*math.cos(a);y=2.53*math.sin(a)
    sphere(f'G01_upper_spout_{i:02}',(x,y,3.64),.105,patina)

# STEP is precise editable B-rep CAD: source of truth.
compound=cq.Compound.makeCompound([s for _,s,_ in PARTS])
step_path=ROOT/'garden_fountain.step'
cq.exporters.export(compound,str(step_path),exportType='STEP')
print('Wrote STEP',step_path.stat().st_size)

# Tessellate source B-reps for GPU rendering. Assign per-object vertex colors.
# Render axes: CAD (X,Y,Z) -> Webspace (X,Z,Y), which is left/right-handed flip;
# wind triangle order is also flipped so normals remain consistently outward.
triangles=[]
for name,shape,color in PARTS:
    verts,faces=shape.tessellate(.075,.42)
    if not faces: continue
    pts=np.array([[v.x,v.z,v.y] for v in verts],dtype=np.float32)
    faces=np.array(faces,dtype=np.int32)[:,[0,2,1]]
    mesh=trimesh.Trimesh(vertices=pts,faces=faces,process=False,validate=False)
    mesh.visual.vertex_colors=np.tile(np.array(color,dtype=np.uint8),(len(pts),1))
    triangles.append(mesh)
scene=trimesh.Scene()
for i,m in enumerate(triangles):
    scene.add_geometry(m,geom_name=f'piece_{i}',node_name=PARTS[i][0])
# Export with actual mesh primitives and one externally addressable glb asset.
glb=trimesh.exchange.gltf.export_glb(scene)
(ROOT/'garden_fountain.glb').write_bytes(glb)
print('GLB size',len(glb),'mesh pieces',len(triangles),'triangles',sum(len(m.faces) for m in triangles))
