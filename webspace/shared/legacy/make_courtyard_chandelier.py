"""Generate a Persian-French chandelier as true STEP CAD and a GLB runtime mesh.

Local CAD axes: X,Y on horizontal plane; Z vertical (the hanging top is at Z=5.9).
Exported runtime GLB uses Y-up with the same local origin. Webspace places the object
at world X=0, Y=5.0, Z=-33. No light is emitted by this model (dormant state).

The design is most ornate on the underside: scalloped discs, radial rosettes,
faceted cut-glass teardrops, and a constellation of suspended pendants. Geometry
is all deterministic CadQuery B-reps; no stock models, photographs or textures.
"""
from pathlib import Path
import math
import cadquery as cq
import numpy as np
import trimesh

ROOT=Path(__file__).parent
PARTS=[]
GOLD=(148,111,65,255); OLD=(108,84,66,255); PALE=(202,179,135,255)
CRYSTAL=(156,200,207,255); AMETHYST=(148,128,174,255); SILVER=(192,197,191,255)

def add(name, shape, color): PARTS.append((name,shape,color))
def sphere(name,xyz,r,col): add(name,cq.Solid.makeSphere(r,cq.Vector(*xyz)),col)
def torus(name,R,r,z,col): add(name,cq.Solid.makeTorus(R,r,cq.Vector(0,0,z),cq.Vector(0,0,1)),col)
def cylinder(name,x,y,z,r,h,col): add(name,cq.Solid.makeCylinder(r,h,cq.Vector(x,y,z),cq.Vector(0,0,1)),col)
def segment(name,a,b,r,col):
    A=cq.Vector(*a); d=cq.Vector(*b)-A
    if d.Length>1e-5:add(name,cq.Solid.makeCylinder(r,d.Length,A,d.normalized()),col)
def revolve(name,p,col):
    # radius, Z points; sketch in XZ and turn around CAD Z.
    add(name,cq.Workplane('XZ').polyline(p).close().revolve(360,(0,0,0),(0,1,0)).val(),col)
def faceted_gem(name,x,y,z,r,h,col,n=8):
    # CAD hexagonal/octal double-point pendant, strong sparkle with no glass shader.
    vertices=[]
    verts=[cq.Vector(x,y,z-h*.53)]
    for height,radius in [(z-h*.3,r*.58),(z+h*.21,r),(z+h*.38,r*.53)]:
        for k in range(n):
            a=2*math.pi*k/n+math.pi/n;verts.append(cq.Vector(x+radius*math.cos(a),y+radius*math.sin(a),height))
    verts.append(cq.Vector(x,y,z+h*.53))
    faces=[]
    def face(a,b,c):
        w=cq.Wire.makePolygon([verts[a],verts[b],verts[c],verts[a]])
        faces.append(cq.Face.makeFromWires(w))
    for k in range(n):face(0,1+(k+1)%n,1+k)
    for level in range(2):
        for k in range(n):
            a=1+level*n+k;b=1+level*n+(k+1)%n;c=a+n;d=b+n
            face(a,b,d);face(a,d,c)
    last=1+3*n
    for k in range(n):face(last,1+2*n+k,1+2*n+(k+1)%n)
    try:add(name,cq.Solid.makeSolid(cq.Shell.makeShell(faces)),col)
    except Exception:
        # Independent solids preserve editable provenance even for difficult facets.
        add(name,cq.Workplane('XY').polygon(n,2*r).extrude(h*.65).val().translate((x,y,z-h*.35)),col)

# Crown and suspension basket, with narrow canopy above the broad lower assembly.
revolve('A00_scalloped_bowl',[(0,3.25),(.47,3.25),(.81,3.33),(.97,3.52),(.87,3.69),(.64,3.79),(.31,4.0),(.20,4.18),(0,4.18)],GOLD)
revolve('A01_underbelly_mandala',[(0,2.76),(.35,2.76),(.75,2.87),(1.24,3.04),(1.50,3.13),(1.62,3.28),(1.34,3.33),(.5,3.26),(0,3.26)],PALE)
for rad,z0 in [(1.49,3.19),(2.45,3.68),(3.45,4.08),(.75,3.08)]:
    torus(f'B00_hoop_{rad}',rad,.058,z0,GOLD)
# Tiered outer metallic arms. Low-poly tubular shapes connect with tuned curves.
for k in range(12):
    a=k*2*math.pi/12
    def at(r,z):return(r*math.cos(a),r*math.sin(a),z)
    path=[at(.72,3.65),at(1.30,3.40),at(2.05,3.39),at(2.62,3.77),at(3.46,4.08)]
    for j in range(len(path)-1):segment(f'C_{k:02}_arm_{j}',path[j],path[j+1],.096 if j>0 else .12,GOLD)
    # Fine secondary scroll underneath arm, visible from the floor.
    lower=[at(1.35,3.48),at(1.86,3.05),at(2.33,3.12),at(2.72,3.54)]
    for j in range(len(lower)-1):segment(f'D_{k:02}_curl_{j}',lower[j],lower[j+1],.045,OLD)
    x,y,_=at(3.46,4.08)
    sphere(f'E_{k:02}_outer_socket',(x,y,4.08),.22,OLD)
    cylinder(f'F_{k:02}_unlit_candle',x,y,4.11,.13,.45,PALE)
    # Originally future-light-ready, but no emissive shader or active flame.
    sphere(f'G_{k:02}_crystal_lens',(x,y,4.60),.14,CRYSTAL)
    # Hanging chandelier crystal, linked to its own curved arm.
    px,py,_=at(2.93,3.66)
    segment(f'H_{k:02}_pendant_chain',(px,py,3.72),(px,py,2.79),.027,SILVER)
    faceted_gem(f'I_{k:02}_large_teardrop',px,py,2.42,.28,.72,CRYSTAL)
    # Little beadwork on the inner ring adds dense underside detail with low memory.
    bx,by,_=at(1.36,3.11)
    sphere(f'J_{k:02}_gilt_bead',(bx,by,3.04),.13,PALE)
    if k%2==0:
        hx,hy,_=at(1.95,3.43)
        faceted_gem(f'K_{k:02}_violet_pendant',hx,hy,2.79,.16,.41,AMETHYST)
# Eight-point Persian geometric ornament under the central cup.
for k in range(8):
    a=k*math.pi/4
    segment(f'L_{k}_rosette_spoke',(.25*math.cos(a),.25*math.sin(a),2.82),(1.38*math.cos(a),1.38*math.sin(a),3.03),.058,GOLD)
    sphere(f'M_{k}_star_tip',(1.40*math.cos(a),1.40*math.sin(a),3.0),.125,CRYSTAL)
sphere('N00_major_finial',(0,0,2.49),.34,AMETHYST)
segment('N01_finial_stem',(0,0,2.49),(0,0,3.08),.07,GOLD)
# The hanging top is meant to be seen under open daylight sky; suspension remains subtle.
torus('O00_crown_loop',.21,.06,5.33,PALE)
for k in range(3):
    a=k*2*math.pi/3
    segment(f'O01_suspend_{k}',(.81*math.cos(a),.81*math.sin(a),3.84),(.12*math.cos(a),.12*math.sin(a),5.25),.047,OLD)

compound=cq.Compound.makeCompound([s for _,s,_ in PARTS]);out=ROOT/'courtyard_chandelier.step'
cq.exporters.export(compound,str(out),exportType='STEP')
scene=trimesh.Scene();nt=0
for i,(name,shape,color) in enumerate(PARTS):
    verts,fac=shape.tessellate(.070,.35)
    if not fac:continue
    pts=np.array([[v.x,v.z,v.y] for v in verts],dtype=np.float32)
    faces=np.array(fac,dtype=np.int32)[:,[0,2,1]]
    mesh=trimesh.Trimesh(vertices=pts,faces=faces,process=False,validate=False)
    mesh.visual.vertex_colors=np.tile(np.array(color,dtype=np.uint8),(len(pts),1))
    scene.add_geometry(mesh,geom_name=f'chandelier_{i}',node_name=name)
    nt+=len(mesh.faces)
data=trimesh.exchange.gltf.export_glb(scene)
(ROOT/'courtyard_chandelier.glb').write_bytes(data)
print(f'Chandelier STEP {out.stat().st_size} bytes; GLB {len(data)} bytes; {len(PARTS)} CAD parts, {nt} triangles')
