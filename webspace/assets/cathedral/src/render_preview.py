#!/usr/bin/env python3
"""Offline inspection rendering using VTK; not required for web viewing."""
from pathlib import Path
from collections import defaultdict
import numpy as np
import trimesh
from vtkmodules.vtkCommonDataModel import vtkPolyData, vtkCellArray
from vtkmodules.vtkCommonCore import vtkPoints
from vtkmodules.vtkRenderingCore import vtkRenderer,vtkRenderWindow,vtkActor,vtkPolyDataMapper,vtkLight
from vtkmodules.vtkIOImage import vtkPNGWriter
from vtkmodules.vtkRenderingCore import vtkWindowToImageFilter
from vtkmodules.vtkRenderingOpenGL2 import vtkOpenGLRenderer, vtkOpenGLRenderWindow
from vtkmodules.util.numpy_support import numpy_to_vtk, numpy_to_vtkIdTypeArray
src=Path(__file__).resolve().parents[1]/'public'/'assets'/'temple_full.glb'
scene=trimesh.load(src,force='scene')
geom=defaultdict(list)
for node in scene.graph.nodes_geometry:
 trans,name=scene.graph[node]; mesh=scene.geometry[name]
 mat=mesh.visual.material
 label=getattr(mat,'name','marble')
 transformed=mesh.copy();transformed.apply_transform(trans)
 geom[label].append(transformed)
colors={'marble':(0.84,0.81,0.73),'pale':(0.94,0.92,0.83),'ashlar':(0.70,0.65,0.55),'aged':(0.58,0.54,0.47),'shadow':(.48,.48,.48),'gold':(.77,.58,.27),'bronze':(.42,.34,.24),'water':(.21,.44,.49),'malachite':(.24,.42,.34),'slate':(.35,.40,.46),'debris':(.64,.56,.44),'fresco':(.47,.33,.38),'inlay':(.52,.38,.31),'glass':(.3,.56,.60)}
renderer=vtkRenderer();renderer.SetBackground(.035,.06,.085);renderer.SetBackground2(.18,.21,.24);renderer.GradientBackgroundOn()
for label,meshes in geom.items():
 merged=trimesh.util.concatenate(meshes)
 verts=merged.vertices.astype(np.float32);faces=merged.faces.astype(np.int64)
 pd=vtkPolyData();pts=vtkPoints();pts.SetData(numpy_to_vtk(verts,deep=True));pd.SetPoints(pts)
 packed=np.concatenate((np.full((len(faces),1),3,dtype=np.int64),faces),axis=1).ravel()
 ca=vtkCellArray();ca.SetCells(len(faces),numpy_to_vtkIdTypeArray(packed,deep=True));pd.SetPolys(ca)
 mapper=vtkPolyDataMapper();mapper.SetInputData(pd)
 actor=vtkActor();actor.SetMapper(mapper)
 prop=actor.GetProperty();prop.SetColor(*colors.get(label,colors['marble']));prop.SetInterpolationToPhong()
 prop.SetAmbient(.34);prop.SetDiffuse(.66);prop.SetSpecular(.22);prop.SetSpecularPower(23)
 if label=='water':prop.SetOpacity(.78)
 renderer.AddActor(actor)
window=vtkRenderWindow();window.SetOffScreenRendering(True);window.AddRenderer(renderer);window.SetSize(1600,1080);window.SetMultiSamples(4)
camera=renderer.GetActiveCamera();camera.SetFocalPoint(0,17,3);camera.SetPosition(195,154,240);camera.SetViewUp(0,1,0);camera.SetClippingRange(1,1000)
renderer.ResetCameraClippingRange()
window.Render()
w2i=vtkWindowToImageFilter();w2i.SetInput(window);w2i.Update()
writer=vtkPNGWriter();writer.SetInputConnection(w2i.GetOutputPort());writer.SetFileName(str(src.parents[2]/'temple_preview.png'));writer.Write()
print(src.parents[2]/'temple_preview.png')
