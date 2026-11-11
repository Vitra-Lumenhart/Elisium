#!/usr/bin/env python3
"""Rev05 procedural museum-kit: shared architectural coordinate system for STEP and GLB.
CAD coordinates: X=north/u, Y=west/v, Z=height, metres.
GLB coordinates: x=u-96, y=z, z=168-v (Y-up), altar is origin.
Authorial geometry is analytical; polylines are sampled solely at export boundary.
"""
from __future__ import annotations
import json, math, hashlib, os, sys
from pathlib import Path
import numpy as np
import trimesh
import cadquery as cq

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT/'public'/'assets'; CAD=ROOT/'cad'
ASSET.mkdir(parents=True,exist_ok=True); CAD.mkdir(parents=True,exist_ok=True)
ORIGIN = np.array([96.,168.,0.])
TRANSFORM = np.array([[1,0,0,-96],[0,0,1,0],[0,-1,0,168],[0,0,0,1]],dtype=float)
STAGE_NAMES=['00_foundations','01_courts_water','02_communion_crown','03_mont_skyline','04_ornaments_ruins']
COLOR={
 'marble':[225,218,198,255], 'pale':[240,234,217,255], 'ashlar':[196,180,150,255],
 'shadow':[130,125,119,255], 'aged':[166,152,134,255], 'gold':[180,143,77,255],
 'bronze':[99,86,70,255], 'water':[61,128,137,205], 'malachite':[65,105,86,255],
 'slate':[104,112,116,255], 'inlay':[143,106,77,255], 'fresco':[118,91,104,255],
 'glass':[90,159,166,180], 'debris':[192,175,148,255]
}
scenes={n:trimesh.Scene() for n in STAGE_NAMES}
meshbank={}
counts={n:0 for n in STAGE_NAMES}
current=STAGE_NAMES[0]

def stage(name):
 global current
 current=name

def appearance(mesh, material):
 mesh.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
  name=material, baseColorFactor=COLOR[material], metallicFactor=(.46 if material in ('bronze','gold') else 0.), roughnessFactor=(.28 if material in ('marble','pale','gold') else .74), alphaMode='BLEND' if material in ('water','glass') else 'OPAQUE', doubleSided=True))
 return mesh

def add(mesh, name, material='marble', M=None, cached=None):
 global counts
 if M is None:M=np.eye(4)
 key=(cached,material) if cached else None
 if key and key in meshbank: geo=meshbank[key]
 else:
  geo=appearance(mesh.copy(),material)
  if key: meshbank[key]=geo
 scenes[current].add_geometry(geo, geom_name=(cached+'_'+material if cached else name), node_name=f'{current}_{counts[current]:04d}_{name}', transform=TRANSFORM @ M)
 counts[current]+=1

def T(x,y,z,scale=(1,1,1)):
 M=np.eye(4);M[:3,3]=[x,y,z];M[:3,:3]=np.diag(scale);return M

CUBE=trimesh.creation.box(extents=[1,1,1]); CYL=trimesh.creation.cylinder(radius=1,height=1,sections=14)
def box(x,y,z,sx,sy,sz,mat='marble',name='block'):
 add(CUBE,name,mat,T(x,y,z,(sx,sy,sz)),cached='UNIT_CUBE')
def col(x,y,z,r,h,mat='marble',name='pillar'):
 add(CYL,name,mat,T(x,y,z+h/2,(r,r,h)),cached='CYL_14')

def annular(cx,cy,r0,r1,z0,h,theta0=0,theta1=2*math.pi,segments=None):
 # approximate smooth circular surfaces only on mesh export
 n=segments or max(12,int(abs(theta1-theta0)*r1/2.1))
 a=np.linspace(theta0,theta1,n+1)
 pts=[]
 for z in (z0,z0+h):
  for r in (r0,r1):
   pts.extend([[cx+r*np.cos(t),cy+r*np.sin(t),z] for t in a])
 pts=np.array(pts)
 n1=n+1
 faces=[]
 def band(i,j,flip=False):
  for k in range(n):
   a,b=i*n1+k,i*n1+k+1;c,d=j*n1+k,j*n1+k+1
   faces.extend([[a,c,d],[a,d,b]] if not flip else [[a,d,c],[a,b,d]])
 band(0,1);band(2,3,True);band(0,2,True);band(1,3)
 faces.extend([[0,n1,3*n1],[0,3*n1,2*n1],[n,2*n1+n,3*n1+n],[n,3*n1+n,n1+n]])
 return trimesh.Trimesh(vertices=pts,faces=faces,process=False)

def arc_ring(cx,cy,r0,r1,z,h,material,name,theta0=0,theta1=2*math.pi,n=None):
 add(annular(cx,cy,r0,r1,z,h,theta0,theta1,n),name,material)

def tube(path, radius, material='marble', name='rib', sections=6, axes=None):
 """Sweep 6-sided circular section using a parallel-ish stabilized moving reference frame."""
 P=np.asarray(path,float); verts=[]
 for i,p in enumerate(P):
  tangent=P[min(len(P)-1,i+1)]-P[max(0,i-1)]
  tangent=tangent/max(np.linalg.norm(tangent),1e-8)
  ref=np.array([0,0,1.]) if abs(tangent[2])<.88 else np.array([0,1.,0])
  N=np.cross(tangent,ref);N=N/max(np.linalg.norm(N),1e-8)
  B=np.cross(tangent,N)
  rr=radius(i/(len(P)-1)) if callable(radius) else radius
  verts.extend([p+rr*(N*math.cos(2*math.pi*k/sections)+B*math.sin(2*math.pi*k/sections)) for k in range(sections)])
 faces=[]
 for i in range(len(P)-1):
  for k in range(sections):
   a=i*sections+k;b=i*sections+(k+1)%sections;c=(i+1)*sections+k;d=(i+1)*sections+(k+1)%sections
   faces.extend([[a,c,d],[a,d,b]])
 for k in range(1,sections-1):
  faces.extend([[0,k+1,k],[(len(P)-1)*sections,(len(P)-1)*sections+k,(len(P)-1)*sections+k+1]])
 add(trimesh.Trimesh(vertices=verts,faces=faces,process=False),name,material)

def pointed_arch(span, rise, resolution=20):
 """Exact two-centred circle construction before segmentation; outputs (horizontal,z-rise)."""
 a=span/2.;c=(rise*rise-a*a)/(2*a);R=a+c
 start=math.pi;end=math.atan2(rise,-c)
 left=[(c+R*math.cos(t),R*math.sin(t)) for t in np.linspace(start,end,resolution)]
 right=[(-x,z) for x,z in left[::-1]]
 return left+right[1:]

def arch_across(axis, x,y, spring, span, rise, radius=.25,mat='pale',name='pointed_arch'):
 samples=pointed_arch(span,rise)
 p=[(x+a,y,spring+z) if axis=='X' else (x,y+a,spring+z) for a,z in samples]
 tube(p,radius,mat,name)

def dome(cx,cy,z0,base_r,height,kind='mughal',mat='pale',name='dome',resolution=10,segments=18):
 levels=np.linspace(0,1,resolution+1)
 if kind=='mughal':
  rr=lambda t:base_r*(.72 + .45*np.sin(math.pi*t)**.8)*(1-t**3)**.55
 elif kind=='flame':
  rr=lambda t:base_r*(.78+.3*np.sin(1.3*math.pi*t))*(1-t)**.75
 elif kind=='tent':
  rr=lambda t:base_r*(1-t)**.85
 else:rr=lambda t:base_r*np.sqrt(max(0,1-t*t))
 vertices=[]
 for t in levels:
  r=max(.035,rr(t))
  vertices.extend([[cx+r*math.cos(2*math.pi*i/segments),cy+r*math.sin(2*math.pi*i/segments),z0+height*t] for i in range(segments)])
 fs=[]
 for j in range(resolution):
  for k in range(segments):
   a=j*segments+k;b=j*segments+(k+1)%segments;c=(j+1)*segments+k;d=(j+1)*segments+(k+1)%segments
   fs.extend([[a,b,d],[a,d,c]])
 for k in range(1,segments-1):fs.append([0,k,k+1])
 add(trimesh.Trimesh(vertices=vertices,faces=fs,process=False),name,mat)

# ------------------------- STAGE 00: ancient stone datum -------------------------
stage(STAGE_NAMES[0]);
# Boundary/base: avoid a flat opaque slab as the only volumetric object.
box(96,144,-.64,188,280,1.15,'aged','stone_pavement_base')
for x in (6,186):
 for y0,y1 in [(7,44),(49,122),(132,208),(218,260),(269,282)]:
  if x==6 and y0==269:continue  # ruin breach
  box(x,(y0+y1)/2,2.6,2.,y1-y0,5.2,'ashlar','outer_perimeter')
for y in (6,282):
 for x0,x1 in [(6,78),(114,186)]:
  box((x0+x1)/2,y,2.5,x1-x0,2.5,5.0,'ashlar','east_west_enclosure')
# Cross-altar foundation and exposed undercroft stairs, datum preserved.
box(96,168,-1.2,13,13,2.4,'shadow','abrahamic_altar_foundation')
box(96,168,.5,7,7,1.,'ashlar','altar_step')
box(96,168,1.12,3,3,.76,'pale','freestanding_square_altar')
# Structural pier foundations retained from registered fiducials.
for x in (54,138):
 for y in (126,210):
  box(x,y,3.0,6,6,6.,'ashlar','herodian_horn_pier_base')
  box(x,y,6.35,5.5,5.5,.7,'aged','transition_plinth')
# Processional pathway and wudu thresholds
box(96,28,.04,13,47,.12,'pale','entry_processional_path')
box(96,88,.045,11,74,.13,'pale','garden_processional_path')
box(96,231,.06,7,42,.13,'pale','west_court_processional_path')
# Tiered Monastic support wing near western edge, access stair trace
for i in range(5):
 box(28+1.25*i,226+1.25*i,.35+.5*i,19-2*i,20-2*i,.7,'aged','monastic_terrace')

# ------------------------- STAGE 01: courtyards and liturgical water ----------
stage(STAGE_NAMES[1]);
for cx in (45,147):
 box(cx,27,.22,33,20,.45,'pale','wudu_washing_enclosure')
 for dx in (-10,-5,0,5,10):
  col(cx+dx,27,.5,.7,5.4,'marble','ablution_column')
  box(cx+dx,26,1.0,2.2,1.6,.35,'malachite','ablution_basin')
# entrance fountain separate from 4 river garden
arc_ring(96,24,2.2,3.5,.1,.4,'marble','entry_fountain_wall')
arc_ring(96,24,0,2.2,.10,.03,'water','entry_fountain_surface',n=26)
# Four river channels, garden crossings
box(96,87,.085,3.3,66,.17,'water','garden_main_water_channel')
box(96,87,.092,130,1.6,.18,'water','garden_cross_channel')
arc_ring(96,87,0,4.5,.12,.06,'water','four_rivers_cistern',n=24)
arc_ring(96,87,4.5,5.25,.17,.55,'pale','four_rivers_rim',n=24)
# low edging: no exterior shrubs or landscaping
for x in (22.5,169.5):
 box(x,87,1,1.5,70,2,'aged','garden_low_wall')
# garden arcade piers symmetrical; low diameter, col:capital:arch proportion = .7 : 1 : 8 m
for x in range(28,165,12):
 for y in (55,119):
  col(x,y,0,.75,5.7,'marble','court_column')
  col(x,y,5.7,1.00,.6,'gold','court_capital')
for y in (55,119):
 for x in range(34,155,12):
  arch_across('X',x,y,6.2,12,7.0,.27,'pale','garden_pointed_arch')
# western water is explicitly a baptismal font, not a pool
arc_ring(96,252,6.2,7.5,.2,.85,'ashlar','baptistry_outer_walk',n=36)
arc_ring(96,252,4.5,6.2,-.35,.85,'pale','baptistry_inner_stair',n=30)
arc_ring(96,252,0,4.5,-1.4,.19,'water','baptism_water_surface',n=30)
arc_ring(96,252,4.40,4.55,-1.42,1.1,'marble','baptism_basin_lining',n=30)
for yy in [245,247,249]:
 box(96,yy,-.15,4.0,1.35,.27,'pale','baptism_step')
# old western chapel surround, kept axial but not modern altar
for x in (76,116):
 box(x,222,4.,2.,19,8,'aged','old_chapel_wall')
arch_across('X',96,229,7,40,18,.75,'ashlar','retained_chapel_arched_opening')
# suspended garden court of the Merveille: stacked rooms, no organic garden art
box(43,243,14.5,35,32,2.0,'ashlar','mont_raised_cloister_base')
for xx in (30,38,46,54):
 for yy in (232,242,251):
  col(xx,yy,15,.52,4.8,'pale','mont_cloister_offset_pair')
box(43,243,20,33,30,.7,'pale','mont_upper_walkway')

# ------------------------- STAGE 02: assembly and crystalline crown -----------
stage(STAGE_NAMES[2]);
# circular settlement; leave the central crossing clear
arc_ring(96,168,7,22,.20,.50,'marble','communion_floor',n=85)
for j in range(12):
 th0=j*(2*math.pi/12)+.035; th1=(j+1)*(2*math.pi/12)-.04
 for r in (10.0,13.5,17.,20.5):
  arc_ring(96,168,r,r+1.15,.7+.045*(r-10),.65,'aged','radial_assembly_bench',th0,th1,n=6)
arc_ring(96,168,22,26,.23,.72,'pale','inner_ambulatory',n=92)
arc_ring(96,168,26,32,9,1.2,'marble','upper_gallery_nine',n=100)
arc_ring(96,168,26,32,21,1.1,'marble','upper_gallery_twentyone',n=100)
for i in range(16):
 a=2*math.pi*i/16
 x=96+29*math.cos(a);y=168+29*math.sin(a)
 col(x,y,0,1.05,21.4,'pale','ring_colonnettes')
 col(x,y,21.4,1.55,.8,'gold','ring_capital')
# inherited 4 piers and vertical stone-shaft ladders
for x in (54,138):
 for y in (126,210):
  col(x,y,6.7,2.0,45.3,'ashlar','corner_pier')
  for dx,dy in [(-2.7,0),(2.7,0),(0,-2.7),(0,2.7)]:
   col(x+dx,y+dy,7.0,.55,41.,'pale','corner_pier_shaft')
# ring of sixteen pointed ribs; old square to octagon to 16-faced crown
arc_ring(96,168,30.1,32.0,24.5,2.,'ashlar','transfer_ring',n=100)
for i in range(16):
 a=2*math.pi*i/16; path=[]
 for t in np.linspace(0,1,30):
  r=31-(22.0*t);z=25+40*math.sin(t*math.pi/2)**1.15
  path.append((96+r*math.cos(a),168+r*math.sin(a),z))
 tube(path,lambda t:.8*(1-t)+.24,'marble','vault_primary_meridian')
 # subsidiary rhythmic transverse rings are narrower, hollow visual joints
 for f in [.22,.50,.77]:
  rr=31-22*f;zz=25+40*math.sin(f*math.pi/2)**1.15
  # small segments between neighboring primary ribs
  aa=np.linspace(a,a+2*math.pi/16,8)
  tube([(96+rr*math.cos(t),168+rr*math.sin(t),zz) for t in aa],.12,'gold','muqarnas_cross_seam')
# seven-star interlaced stone-inlaid oculus
arc_ring(96,168,8.5,9.45,64.5,1.0,'pale','oculus_ring',n=60)
starpoints=[(96+8*math.cos(2*math.pi*i/7),168+8*math.sin(2*math.pi*i/7),65.65) for i in range(7)]
for i in range(7):
 tube([starpoints[i],starpoints[(i+2)%7]],.22,'gold','heptagram_sevenfold_tracery')
# central roof lantern framed in eightfold alternating panels without roof cap
for i in range(8):
 a=2*math.pi*i/8; x=96+9.2*math.cos(a); y=168+9.2*math.sin(a)
 tube([(x,y,65),(x,y,79)],.5,'pale','openwork_lantern_pier')
 tube([(x,y,79),(96+5.8*math.cos(a),168+5.8*math.sin(a),84)],.32,'marble','lantern_pointed_crown')
# sparse piers around original three-by-three grid, visible under late gathering layer
for x in (68,124):
 for y in (140,196):
  col(x,y,0,.95,8.,'aged','old_bay_column_stump')

# ------------------------- STAGE 03: fortified Mont roof-cities + Taj/Rus ----
stage(STAGE_NAMES[3]);
# flying buttress arches in orthogonal planes, some deliberately incomplete
for x in (54,138):
 for y in (126,210):
  for side in (-1,1):
   to_x=x+side*19
   # sweep elevated pointed arc from pier toward outer pier; white rib looks like Gothic/Mont support
   coords=pointed_arch(19,7,15)
   path=[(x+side*9.5+side*q,y,32+h) for q,h in coords]
   tube(path,.76,'ashlar','flying_buttress_rib')
   col(to_x,y,0,1.5,27.,'aged','flying_buttress_counterpier')
   box((x+to_x)/2,y,47.,19,1.3,.55,'slate','flying_aqueduct_spine')
# big horn-towers using same pier platform and distinctive flame crown
for x in (54,138):
 for y in (126,210):
  col(x,y,51.5,3.75,7.5,'aged','mont_tower_drums')
  for z in (55.0,57.7,59.0):arc_ring(x,y,3.6,4.8,z,.6,'pale','kokoshnik_abstracted_collars',n=12)
  dome(x,y,59.2,5.4,16.,'flame','slate','russian_flame_lantern',resolution=14)
  tube([(x,y,74.8),(x,y,78.2)],.25,'gold','flame_finial')
# four marble moon-domes on subsidiary corners (retain central star as summit)
for x,y in [(42,114),(150,114),(42,222),(150,222)]:
 col(x,y,25,3.2,8,'ashlar','mughal_subdome_drum')
 dome(x,y,33.,5.8,10.8,'mughal','pale','taj_marble_moon_dome',resolution=15,segments=18)
 col(x,y,43.8,.17,2,'gold','subdome_finial')
 # smaller chhatri pavilions on battlement and flying support ledges
for x,y in [(26,126),(166,126),(26,210),(166,210),(27,278),(165,278)]:
 box(x,y,21.4,8.5,8.5,1.0,'marble','chhatri_platform')
 for a in np.linspace(0,2*math.pi,8,endpoint=False):
  col(x+2.7*math.cos(a),y+2.7*math.sin(a),21.9,.31,5.9,'pale','chhatri_colonnette')
 dome(x,y,27.6,4.7,4.6,'mughal','pale','mughal_chhatri_roof',resolution=8,segments=12)
# roof stepped verticality of Mont wing rather than a Notre-Dame single nave
for xx,yy in [(30,222),(56,254)]:
 for z,r in [(21.,6.0),(25.,4.8),(29.,3.4)]:
  arc_ring(xx,yy,r-.8,r,z,1.6,'ashlar','mont_stepped_terrace',n=20)
 dome(xx,yy,30.2,3.6,11,'tent','slate','mont_tent_spire',resolution=9,segments=8)

# ------------------------- STAGE 04: selective ornate microdetails and damage ----
stage(STAGE_NAMES[4]);
# keep quality from deliberate structure, not an ocean of unique geometry
# Herodian-style drafted margins, only 2 major exposed walls (not every block)
for x in (6,186):
 for z in np.arange(.7,5.2,1.0):
  for y0,y1 in [(50,120),(133,206)]:
   box(x+(.04 if x==6 else -.04), (y0+y1)/2,z,.085,y1-y0,.055,'shadow','course_mortar_reveal')
# bronze calligraphic bands: geometry not literal text, no misappropriated scripture
for j in range(12):
 a=2*math.pi*j/12
 r=24;u=96+r*math.cos(a);v=168+r*math.sin(a)
 col(u,v,22.3,.27,1.25,'bronze','gallery_lamp')
# Rosette jali as 8-point perforation outlined with lines; no raster mask
for v in (56,118):
 for u in range(44,157,16):
  for k in range(8):
   th=2*math.pi*k/8
   p0=(u+2.3*math.cos(th),v,8.1+2.3*math.sin(th))
   p1=(u+2.3*math.cos(th+3*math.pi/4),v,8.1+2.3*math.sin(th+3*math.pi/4))
   tube([p0,p1],.09,'gold','jali_star_lattice')
# abstracted inner side pointed ribs
for x in (62,130):
 for y in (134,202):
  arch_across('X',x,y,11,10,6,.21,'pale','inner_vault_seams')
# ruin damage: intentional absent stone courses at specific recorded sectors; rubble at registered centres.
for j,(x,y) in enumerate([(126,179),(134,184),(125,193),(130,191),(9,274),(45,269)]):
 for i in range(4):
  theta=(j*7+i*17)*math.pi/180
  M=T(x+math.cos(theta)*i*1.15,y+math.sin(theta)*i*.9,.6+i*.2,((2.+.7*(i%2)),(1.+.4*(j%2)),(.6+.1*i)))
  add(CUBE,'fallen_ashlar','debris',M,cached='UNIT_CUBE')
# perimeter roofline missing panels signaled by fragments rather than opaque giant roof
for i,a in enumerate(np.linspace(0,2*math.pi,17)[:-1]):
 if 0.05<a<.88:continue # crown breach in R1
 r=38
 p0=(96+r*math.cos(a),168+r*math.sin(a),27)
 p1=(96+(r+3)*math.cos(a),168+(r+3)*math.sin(a),33)
 tube([p0,p1],.53,'ashlar','broken_old_vault_spring')

# ------------------------- EXPORT -------------------------
files=[];stats={};batched_scenes={}
for stage_name,scene in scenes.items():
 # Web GLB optimization: concatenate same-material primitives within each phase.
 # Retain the original reusable procedural source and fully editable CAD subset.
 groups={}
 for node in scene.graph.nodes_geometry:
  mtx,gn=scene.graph[node]
  geo=scene.geometry[gn]
  material=geo.visual.material.name
  copy=geo.copy();copy.apply_transform(mtx)
  groups.setdefault(material,[]).append(copy)
 packed=trimesh.Scene()
 for material,component in groups.items():
  merged=trimesh.util.concatenate(component)
  appearance(merged,material)
  packed.add_geometry(merged,geom_name='batch_'+stage_name+'_'+material,node_name='batch_'+material)
 batched_scenes[stage_name]=packed
 dest=ASSET/(stage_name+'.glb')
 dest.write_bytes(trimesh.exchange.gltf.export_glb(packed))
 files.append(dest)
 loaded=trimesh.load(dest,force='scene')
 triangles=sum(len(g.faces) for g in loaded.geometry.values())
 stats[stage_name]={'bytes':dest.stat().st_size,'meshes':len(loaded.geometry),
  'nodes':len(loaded.graph.nodes_geometry),'triangles':triangles,
  'objects_authored':counts[stage_name],'batched_by_material':True}
# Convenience combined scene assets; streamed phase GLBs remain canonical.
for destination,subset in [ ('temple_lite.glb',STAGE_NAMES[:3]), ('temple_full.glb',STAGE_NAMES) ]:
 allscene=trimesh.Scene()
 for name in subset:
  source=batched_scenes[name]
  for node in source.graph.nodes_geometry:
   mat,geom=source.graph[node]
   allscene.add_geometry(source.geometry[geom], node_name=f"{name}_{node}", geom_name=f"{name}_{geom}", transform=mat)
 (ASSET/destination).write_bytes(trimesh.exchange.gltf.export_glb(allscene))

# CAD exported native analytic B-reps for principal architecture, NOT triangulated mesh renamed .step
parts=[]
def cadbox(name,x,y,z,sx,sy,sz):
 parts.append((name,cq.Workplane('XY').box(sx,sy,sz).translate((x,y,z)).val()))
def cadcyl(name,x,y,z,r,h):
 parts.append((name,cq.Solid.makeCylinder(r,h,cq.Vector(x,y,z))))
cadbox('main_foundation_platform',96,168,-1.2,13,13,2.4)
cadbox('sanctuary_altar_step',96,168,.5,7,7,1)
cadbox('freestanding_altar',96,168,1.12,3,3,.76)
for x in (54,138):
 for y in (126,210):
  cadbox(f'horn_pier_{x}_{y}',x,y,3,6,6,6)
  cadcyl(f'corner_pier_{x}_{y}',x,y,6.7,2,45.3)
for x in range(28,165,12):
 for y in (55,119):cadcyl(f'court_column_{x}_{y}',x,y,0,.75,5.7)
for i in range(16):
 a=2*math.pi*i/16
 cadcyl(f'gallery_column_{i}',96+29*math.cos(a),168+29*math.sin(a),0,1.05,21.4)
# Native CAD toroidal cylinders: annular rings as boolean cylinders (curved surfaces remain analytic!)
def cadering(name,cx,cy,z,r0,r1,height):
 outer=cq.Solid.makeCylinder(r1,height,cq.Vector(cx,cy,z))
 inner=cq.Solid.makeCylinder(r0,height+1,cq.Vector(cx,cy,z-.5)) if r0>0 else None
 parts.append((name, outer.cut(inner) if inner is not None else outer))
cadering('communion_floor',96,168,.2,7,22,.50)
cadering('inner_ambulatory',96,168,.23,22,26,.72)
cadering('upper_gallery_09',96,168,9,26,32,1.2)
cadering('upper_gallery_21',96,168,21,26,32,1.1)
cadering('transfer_ring',96,168,24.5,30.1,32,2)
cadering('sevenfold_oculus_ring',96,168,64.5,8.5,9.45,1)
cadering('baptistry_outer_rim',96,252,.2,6.2,7.5,.85)
cadering('baptism_basin',96,252,-1.42,4.40,4.55,1.1)
# Genuine analytic swept circular rib from the same two-centred arch equation
for ind, (cx,cy,axis) in enumerate([(96,55,'X'),(96,119,'X')]):
 samples=pointed_arch(12,7,30)
 pts=[cq.Vector(cx+a if axis=='X' else cx,cy if axis=='X' else cy+a,6.2+h) for a,h in samples]
 try:
  edge=cq.Edge.makeSpline(pts)
  wire=cq.Wire.assembleEdges([edge])
  tangent=(pts[1]-pts[0]).normalized(); section=cq.Wire.makeCircle(.27,pts[0],tangent)
  solid=cq.Solid.sweep(section,[],wire,makeSolid=True,isFrenet=False)
  parts.append((f'pointed_arch_BREP_{ind}',solid))
 except Exception as exc:print('STEP rib skip',exc)

assy=cq.Assembly(name='Temple_Rev05_native_CAD')
for name,part in parts:
 try:assy.add(part,name=name)
 except Exception as exc:print('STEP part skipped',name,str(exc))
step=CAD/'temple_structural_master.step';assy.save(str(step))

# geometry contract manifest for integration; phase-accurate registered original
contract={
 'revision':'05 parametric architectural vertical slice','status':'concept visual model, not construction-ready',
 'source':'Registered Revision04 coordinates and manifest','unit':'metre',
 'site':{'u':[0,192],'v':[0,288],'entry':'east v=0','rear':'west v=288'},
 'CAD_axes':{'x':'north/u','y':'west/v','z':'up'},
 'GLB_axes':{'x':'north/u minus 96','y':'up (CAD z)','z':'east (168 minus CAD v)'},
 'CAD_to_GLB_matrix_row_major':TRANSFORM.tolist(),
 'world_altar_CAD':[96,168,0],
 'grid_module_m':.5,'coarse_registration_grid_m':12,'course_height_m':1.0,
 'authenticity':'Herodian-style limestone/ashlar reference, not an actual universal Second Temple marble standard',
 'column_families':{'garden':{'radius':.75,'height':5.7,'capital_radius':1.00,'capital_h':.6},'gallery':{'radius':1.05,'height':21.4},'corner':{'radius':2.,'height':45.3}},
 'pointed_arch_master':{'type':'two circular arcs','span_m':12,'rise_m':7,'spring_m':6.2,'projecting_keystone':False,'crown_joint_note':'Do not claim masonry arches are keystoneless by structural necessity'},
 'central':{'center_u_v':[96,168],'square_size_m':84,'altar_size_m':[3,3],'radial_seating_banks':12,'major_ribs':16,'heptagram_points':7,'oculus_diameter_m':18,'roof_elevation_m':84},
 'water':{'wudu':'eastern dedicated basins','baptism':'western immersion font; not swimming pool','garden':'independent reflecting water rills'},
 'focus_shift':'Mont Saint-Michel: staggered tiered crypt/rooms and elevated cloister, while retaining existing Gothic geometry',
 'later_collage':'Taj-derived marble domes + chhatris; Russian-derived flame lanterns and geometric kokoshnik collars',
 'ruin_breaches':['north-northeast crown roof sector R1','western wall broken at v269-282','western baptistry lost rim roof','unfinished garden arcade'],
 'scene_files':stats,'STEP':{'path':'cad/temple_structural_master.step','b_rep_solids':len(parts),'excludes':'tiny ornament, textures, seating, most lattice ribs; all in procedural GLB generator'},
 'LOD_policy':'stage 00 initially, stage 01 and 02 next; stages 03 and 04 opt-in; share GLB geometries through nodes and reference components',
 'provenance':{'r04_manifest':'reference/rev04_geometry_manifest.json'}
}
(ROOT/'temple_manifest_rev05.json').write_text(json.dumps(contract,indent=2))
print(json.dumps({'stats':stats,'step_size':step.stat().st_size,'cad_parts':len(parts)},indent=2))
