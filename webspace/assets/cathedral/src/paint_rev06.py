#!/usr/bin/env python3
"""Generate tiny handmade/algorithmic art maps and a textured translucent stained-glass mesh.
All glass model positions derive from Rev05 CAD coordinate system.
"""
import math, json, random, pathlib, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import trimesh
ROOT=pathlib.Path(__file__).resolve().parents[1]
AS=ROOT/'public/assets'; TX=AS/'textures'; TX.mkdir(parents=True,exist_ok=True)
random.seed(7447)
rng=np.random.default_rng(7447)
# Marble atlas: 4 contiguous painted mineral studies, sampled with inset UVs and repeated in shader.
W=512; tile=256
arr=np.zeros((W,W,3),dtype=np.uint8)
materials=[
  ('MARBLE_WHITE',np.array([221,211,193.])),
  ('PALE_ALABASTER',np.array([234,228,204.])),
  ('AGED_ASHLAR',np.array([172,155,126.])),
  ('DARK_SLATE',np.array([115,123,125.])),
]
# generate low frequency fractal 1/f noise once, reuse with different palettes
for j,(name,base) in enumerate(materials):
  ix=j%2; iy=j//2
  yy,xx=np.mgrid[:tile,:tile].astype(float)
  noise=np.zeros((tile,tile),float)
  for freq,amp in [(1,18),(2,9),(4,5),(8,3),(16,2),(32,1)]:
    source=rng.normal(0,1,(freq+1,freq+1)); small=Image.fromarray(np.uint8(np.clip((source+2)*60,0,255)))
    large=np.array(small.resize((tile,tile),Image.Resampling.BICUBIC)).astype(float)
    noise+=(large-large.mean())*amp/75
  vein=np.sin((xx*.11+yy*.04)+4*np.sin(yy*.023+np.sin(xx*.018))+noise*.16)
  vein2=np.sin(xx*.075-yy*.041 +4*np.sin(yy*.014)+noise*.30)
  grain=rng.normal(0,2.7,(tile,tile))
  mottled=noise*.51+4.0*vein+1.9*vein2+grain
  if j==2: # drafted masonry courses, old chiselled faces
    mortar=((yy+8)%64<2.2).astype(float)*(-33.)
    mortar+=((xx+((yy//64)%2)*31)%96<1.8).astype(float)*(-22.)
    mottled+=mortar
    arr_tile=np.clip(base[None,None,:]+mottled[:,:,None]+rng.normal(0,1,(tile,tile,1)),0,255)
  elif j==3:
    mottled+=np.sin(xx*.37+yy*.13)*4
    arr_tile=np.clip(base[None,None,:]+mottled[:,:,None],0,255)
  else:arr_tile=np.clip(base[None,None,:]+mottled[:,:,None],0,255)
  arr[iy*tile:(iy+1)*tile,ix*tile:(ix+1)*tile,:]=arr_tile.astype('uint8')
# tiny fine crack hairlines, unambiguously a tileable optical texture
img=Image.fromarray(arr,'RGB');d=ImageDraw.Draw(img,'RGBA')
for offx,offy in [(0,0),(256,0),(0,256),(256,256)]:
 for n in range(12):
  x=random.randint(0,255)+offx;y=random.randint(0,255)+offy
  direction=random.uniform(-.8,.8);length=random.randint(8,46)
  d.line([(x,y),(x+direction*length,y+length)],fill=(42,35,29,random.randint(9,27)),width=1)
img.save(TX/'marble_micro_atlas.webp','WEBP',quality=76,method=6)
# stained glass painted RGBA texture: 7-fold central star, lancets, translucent flaws, fractured upper-right panel
W,H=256,512
im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
colors=[(12,166,218,255),(14,102,205,255),(38,213,194,255),(205,38,110,255),(247,129,27,255),(250,201,39,255),(127,72,199,255),(70,217,78,255)]
# pointed silhouette determined by an exponent curve rather than freehand mask
silhouette=[]
for y in range(6,214,4):
 frac=max(0,(y-6)/208)
 hw=int(113*math.sin(min(frac*math.pi/2,math.pi/2))**.68)
 silhouette.append((128-hw,y))
silhouette +=[(15,H-8),(241,H-8)]
for y in range(210,5,-4):
 frac=max(0,(y-6)/208);hw=int(113*math.sin(min(frac*math.pi/2,math.pi/2))**.68)
 silhouette.append((128+hw,y))
mask=Image.new('L',(W,H));ImageDraw.Draw(mask).polygon(silhouette,fill=255)
# first rich gradient glass pieces, with lead came lines later
for band in range(9):
 y0=10+band*57;y1=min(H-5,y0+59)
 step=43 if band%2 else 38
 for cell in range(-2,10):
  x0=cell*step+((band%2)*21)-5;x1=x0+step+5
  c=colors[(cell*3+band*5)%len(colors)]
  d.polygon([(x0,y0),(x1,y0+random.randrange(0,18)),(x1,y1),(x0,y1-10)],fill=c)
  # internal glaze waviness giving painterly lively microvariation
  cx=(x0+x1)/2;cy=(y0+y1)/2
  d.line([(cx-6,cy-7),(cx+6,cy+7)],fill=(255,255,255,33),width=random.choice([2,3]))
# thin traceries and rosette
for y in range(65,H,57):d.line([(0,y),(W,y+8)],fill=(18,22,35,255),width=5)
for x in range(3,W,40):
 d.line([(x,0),(x+random.randrange(-20,21),H)],fill=(16,25,35,255),width=4)
# 7-gon rosette, located where strongest jewel treatment is required
cx,cy,R=128,248,58
for rr in (60,44,26):d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),outline=(9,18,26,255),width=5)
P=[(cx+R*math.cos(-math.pi/2+2*math.pi*i/7),cy+R*math.sin(-math.pi/2+2*math.pi*i/7)) for i in range(7)]
for i in range(7):d.line((P[i],P[(i+2)%7]),fill=(6,15,28,255),width=5)
d.ellipse((cx-15,cy-15,cx+15,cy+15),fill=(254,216,66,255),outline=(13,18,35,255),width=5)
# broken missing shards: sections absent with jagged cutouts on right upper/middle and lower-left
hole=Image.new('L',(W,H)); h=ImageDraw.Draw(hole)
h.polygon([(207,130),(258,98),(258,262),(222,245),(202,209),(226,177)],fill=255)
h.polygon([(12,362),(65,382),(46,429),(8,443)],fill=255)
h.polygon([(178,455),(217,435),(239,490),(219,510),(171,510)],fill=255)
h.polygon([(47,80),(75,102),(61,119),(42,110)],fill=255)
# spider cracks only in retained pieces
for i in range(34):
 x=random.randint(20,235);y=random.randint(53,505)
 length=random.randint(12,28);theta=random.uniform(0,2*math.pi)
 d.line([(x,y),(x+math.cos(theta)*length,y+math.sin(theta)*length)],fill=(11,19,35,240),width=1)
# add repeated tiny chips and bubbles
for i in range(220):
 x=random.randint(0,W-1);y=random.randint(0,H-1);r=random.choice([1,1,2])
 d.ellipse((x-r,y-r,x+r,y+r),fill=(250,246,213,random.randint(25,75)))
# external silhouette & breaks override all alpha
p=np.array(im);ms=np.array(mask); ho=np.array(hole)
p[:,:,3]=np.where((ms>0)&(ho==0),p[:,:,3],0).astype('uint8')
im=Image.fromarray(p,'RGBA')
im.save(TX/'sevenfold_broken_glass.png',optimize=True)
# stained splash: distorted downward projected window rays with blur and hue-shifted fragments
proj=Image.new('RGBA',(256,256),(0,0,0,0));pd=ImageDraw.Draw(proj,'RGBA')
# ellipse arrangement of multi-colored shadows: central 7-star and six fractured slashes
for i in range(7):
 a=-math.pi/2+i*math.tau/7
 x=128+87*math.cos(a);y=128+87*math.sin(a)
 col=colors[(i*3+2)%len(colors)]
 pd.ellipse((x-27,y-42,x+27,y+42),fill=(*col[:3],100))
for i in range(12):
 a=random.uniform(0,math.tau);r=random.uniform(10,86)
 x=128+r*math.cos(a);y=128+r*math.sin(a)
 c=colors[i%len(colors)]
 pd.polygon([(x-24,y-6),(x+8,y-35),(x+24,y+26),(x-12,y+10)],fill=(*c[:3],120))
for i in range(7):pd.line([P[i] if False else (128+55*math.cos(-math.pi/2+i*math.tau/7),128+55*math.sin(-math.pi/2+i*math.tau/7)),(128+55*math.cos(-math.pi/2+((i+2)%7)*math.tau/7),128+55*math.sin(-math.pi/2+((i+2)%7)*math.tau/7))],fill=(11,18,35,150),width=4)
proj=proj.filter(ImageFilter.GaussianBlur(radius=6));proj.save(TX/'glass_caustic_fake.webp','WEBP',quality=78,method=6)
# Create glass GLB. In textured mesh UV v is inverted by glTF convention; direct tests in viewer may flip vertically.
scene=trimesh.Scene(); vertices=[];faces=[];uv=[];node_data=[]
# based on CAD center and ring; only sectors with existing large gallery spaces
angles=[(k+.45)*math.tau/12 for k in [0,1,3,4,6,7,9,10]]
for idx,a in enumerate(angles):
 # pane at r=32.2 near gallery colonnettes with a +8.5 to 21.5 height
 U=96+32.15*math.cos(a);V=168+32.15*math.sin(a)
 tangent=np.array([-math.sin(a),math.cos(a),0]);width=7.4;height=12.5
 def vtx(dx,z):
  q=np.array([U,V,z])+tangent*dx
  # CAD -> GLB: x=u-96 y=z z=168-v
  return [q[0]-96,q[2],168-q[1]]
 off=len(vertices)
 vertices += [vtx(-width/2,8.8),vtx(width/2,8.8),vtx(width/2,21.3),vtx(-width/2,21.3)]
 uv += [[0,1],[1,1],[1,0],[0,0]]
 faces += [[off,off+1,off+2],[off,off+2,off+3]]
 node_data.append({'index':idx,'angle_rad':round(a,5),'cad_uv':[round(U,3),round(V,3)],'height_m':[8.8,21.3],'width_m':width})
# one DRAW; paint window surfaces textured inside GLB
material=trimesh.visual.material.PBRMaterial(name='REV06_BROKEN_SEVENFOLD_EMISSIVE_GLASS',
 baseColorTexture=im,baseColorFactor=[255,255,255,255],emissiveFactor=[.7,.7,.7],
 metallicFactor=0,roughnessFactor=.32,alphaMode='MASK',alphaCutoff=.45,doubleSided=True)
mesh=trimesh.Trimesh(vertices=vertices,faces=faces,process=False)
mesh.visual=trimesh.visual.TextureVisuals(uv=np.array(uv),material=material)
scene.add_geometry(mesh,node_name='broken_stained_glass_eight_bays',geom_name='stained_glass_painted_atlas')
glb=AS/'05_stained_glass.glb';glb.write_bytes(trimesh.exchange.gltf.export_glb(scene))
# Make full combined GLB with physical panes, but leave lite untouched to maintain fast initial load
full=trimesh.load(AS/'temple_full.glb',force='scene')
for node in scene.graph.nodes_geometry:
 mtx,gn=scene.graph[node]
 full.add_geometry(scene.geometry[gn],node_name=f'05_stained_glass_{node}',geom_name=f'05_stained_glass_{gn}',transform=mtx)
(AS/'temple_full.glb').write_bytes(trimesh.exchange.gltf.export_glb(full))
# copy necessary artist metadata
info={'stage':'05_stained_glass','window_count':len(angles),'CAD_coords':'u north, v west, z up','GLB_coords':'x north, y up, z east','panes':node_data,'technique':'painted RGBA masked non-intersecting quad surfaces; luminous shader and screen-space fake caustics only in viewer','colors':'cyan, amber, lapis, emerald, magenta, garnet','exaggeration':'prismatic fantasy color spilling onto marble, not physical raytracing'}
(ROOT/'stained_glass_layout.json').write_text(json.dumps(info,indent=2))
print('generated',[(p.name,p.stat().st_size) for p in TX.iterdir()]);print('GLB',glb.stat().st_size)
