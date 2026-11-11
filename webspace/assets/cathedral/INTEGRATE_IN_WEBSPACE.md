# Webspace Development integration handoff — Rev05

**Status:** browser prototype and genuine architectural B-rep STEP, **not a surgical patch** to the unavailable Webspace Development source code. This package cannot guarantee a direct replacement until the host renderer code/scale/camera and existing roof scene group are inspected.

## Quick launch

Run `python run_local.py` in this folder, open `http://localhost:8765/` and toggle scene components. Uses Three.js **0.164.1** from jsDelivr through the `importmap` of `public/index.html`. No npm, bundler, or screenshot masks. Internet is needed for the Three.js module unless the host already vendors the library. The geometry is entirely local after extraction.

## Minimal integration into an existing Three.js webpage

Copy `public/assets/*.glb` to your existing asset directory; use the **existing renderer, scene, lights, OrbitControls, camera, and animation loop** if available; load the GLBs with GLTFLoader, and add gltf.scene to your existing scene. Do not create a second Three WebGL context unless using the standalone viewer or a separate showcase region. For a drop-in standalone region, add `<div id="temple-root" style="height:70vh"></div>` and import `mountTemple` from `public/viewer.js` within a `type="module"` script; ensure the existing importmap has `three` and `three/addons/` aliases.

```js
import { mountTemple } from './temple/viewer.js';
const temple=mountTemple(document.getElementById('temple-root'), {assetBase:'./temple/assets/'});
await temple.showPhase('03_mont_skyline',true);
// temple.dispose() when changing pages / scenes.
```

## Replacing the double-arch roof

1. **Do not overwrite original ceiling mesh yet**. Save the host renderer source/asset and its camera transform first.
2. Disable only the old double-arch roof group (retain world, collision, walkability, and map background).
3. Spawn Stage00 `00_foundations.glb` as placement/debug model; align its **altar origin**, entrance vector and metre scale to the old map.
4. Add stages01 and 02; inspect possible intersections with existing map walls. Only then remove the old roof.
5. Enable 03 (`Mont skyline`) for raised rooms, clustered towers, buttresses, Taj subdomes and Russian lanterns.
6. Enable 04 for detail/ruin debris, optional only for near-field view; exclude from first paint.
7. Use the `temple_manifest_rev05.json` CAD→GLB mapping to keep all scene axes registered. **CAD** (x=u, y=v, z=elevation), **GLB** (x=u-96,y=elevation,z=168-v). Entrance east, which is positive WebGL Z.
8. Use loading-screen screenshot tests from (a) front approach (b) garden (c) inside under lantern (d) behind western baptismal court. Verify no camera clips through walls and no depth-fighting from the old ceiling.

## Browser loading & rendering

- Initial geometry = stages **00 + 01 + 02**, ~697KB GLB binary total (material-batched), with stage 00 just ~11KB. Defer stages 03 and 04 until needed. Separate GLBs are cached separately.
- Real-world web transfer varies with gzip/Brotli configuration; serve `.glb` as `model/gltf-binary`; use immutable hashed names and cache-control once frozen. HTTP range requests optional.
- GPU: shared primitive definitions for bricks, pillars, capitals in the generator. Export merges objects by material within each stage: only **28 draw groups** for the entire five-stage model. This sacrifices per-brick picking; true instancing would be a later optimization if interactive selection is necessary.
- Auto-cap devicePixelRatio at 1.6, 2048² key shadow map in reference viewer (consider 1024² for mobile), cheap PBR, mild fog, two direct lights, no costly postprocessing stack.
- Optional on-device procedural marble shading (button). Avoid 4K image maps on the initial load. Reserve tileable baked normal/roughness for rare near-field carvings only.
- For real game realism: first improve perceptual realism through overhang shadows, roughness response, plausible water/glass, camera speed, atmospheric perspective, and selective near-field microrelief. Then consider lightmaps or KTX2 for fixed geometry.
- **Geometry buffers are not compressed with Meshopt/Draco in this prototype**, but files are already small. Add `gltfpack -cc` or meshoptimizer in release workflow if the host supports the decoder. No decoder required in included demo.

## STEP and GLB roles

`cad/temple_structural_master.step` contains genuine analytic B-rep solids: altar, corner piers, column families, true circular ring bodies, baptismal basin and a couple spline-swept pointed arches. It is an **engineering-like structural subset**, not every visual detail in five GLBs. The `.step` is useful for subsequent FreeCAD/CadQuery subdivision and drawings.

`src/build_temple.py` regenerates the GLBs and STEP in one deterministic pass, with independent expressive/detail stages. Requires `numpy`, `trimesh`, `cadquery`, `OCP`. `python src/build_temple.py`.

**Disclaimer**: 288m × 192m × 84m monumental fantasy massing, not buildable without architectural/structural design. The model's marble structural backing is conceptual. Original Second Temple ashlars were largely limestone and *did not* follow one universally standardized thickness; the **0.5m kit module** is this world's invented standard, derived from the 1m courses of the historical inspiration.
