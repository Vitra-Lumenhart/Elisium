# Cathedral of a Thousand Heavens — Revision 06 | Microtextures + stained glass

A portable follow-on kit to Rev05, preserving the CAD datum, mathematical curves,
Mont-Saint-Michel massing, 0.5m masonry module and registered Rev04 plan reference.

## Run
```bash
python run_local.py
```
Open `http://localhost:8765/` in a WebGL2-capable browser. The standalone demo
uses the same pinned Three.js CDN as Rev05; the package does **not** bundle the
Three.js library. For fully offline use, vendor a compatible module and addons.

The initial loader streams the three main structural GLBs plus a small optional
stained-glass stage. `Load all` requests the Mont skyline and ruined ornament
stages separately. `Colored light` toggles the faked 8-plane prismatic reflections;
`Stone detail` increases shadow resolution to 2048 for close camera inspection.

## What's newly implemented
- A 512x512 four-quadrant painted micro-atlas `marble_micro_atlas.webp`.
- World-space dominant-axis projected marble/ashlar grain and 1m joint rhythm,
  shared by all compatible material batches; no new structural mesh drawcalls.
- Four colors of dressed masonry and age/patina, plus analytic height-weathering.
- Eight individually placed, mathematically aligned broken stained-glass bays:
  a real glTF mesh with embedded alpha-cut RGBA painting, sevenfold rosette,
  leading, bubble speckles and broken shards. Also embedded in `temple_full.glb`.
- Matte glass textures and emissive color in the exported GLB, enhanced in viewer
  with a material emissive map, one batched translucent halo and eight baked
  light projections on the circular ambulatory. Realistic **appearance**, not
  physically accurate spectral refraction or ray-traced caustics.
- Colored projected light is artwork, in the WebGL viewer only. It is **not**
  baked into the native CAD STEP solids or the GLB as physically interacting light.
- GPU rendering sleeps when the static viewer is idle; desktop can opt into
  larger shadow-map resolution, initial texture download is tiny.

## Asset hierarchy
`public/assets/00...04.glb` — unchanged Rev05 stage geometry. 
`public/assets/05_stained_glass.glb` — newly colored panes, native GLB paint.
`public/assets/temple_full.glb` — all six stages merged including glass.
`public/assets/temple_lite.glb` — original ultra-fast stone-only first 3 stages.
`public/assets/textures/*.webp/png` — shared viewer-renderer images.
`cad/temple_structural_master.step` — original Rev05 analytic structural solids.
`cad/glass_bay_cad_envelopes.step` — new native-BRep pane position guides (8 solids).
`stained_glass_layout.json` — per-window analytical placement in CAD coordinates.

## Rebuild
Run from extracted project root:
```bash
python src/build_temple.py
python src/paint_rev06.py
python src/export_glass_cad.py
python tests/verify_assets.py
python tests/verify_rev06.py
```
Packages: `numpy`, `Pillow`, `trimesh`, `cadquery`. If your environment lacks
CADQuery, keep the included STEP files and only rerun `paint_rev06.py`.
**Important:** the Rev05 `build_temple.py` rebuilds the prior GLBs; always run
`paint_rev06.py` immediately afterward to restore the embedded Rev06 panes.

## Performance / implementation
The 1-file atlas uses about 4.5 KB, broken stained-glass artwork 22.9 KB,
caustic art about 10.6 KB, and the optional GLB 27.8 KB, prior to ZIP.
The eight fake stained-glass floor projections are merged into one draw call;
the eight soft glass halos into another. All broad masonry materials share one
texture atlas; GLSL samples it with a cheap single-axis UV formula. No normal
or displacements meshes and no screen-space refraction shader are required.
Baked fake caustic projections do not dynamically respond to moving sun or
occluders. The color is intentionally boosted above realistic transmission
for a fantasy cathedral. Foreground garden areas deliberately remain neutral.

## Safety of integration
Copy the public module and six stages alongside the existing site; call
`mountTemple(...)` within the intended scene group and align the *altar*
point at GLB (0,0,0). Rev05 plan coordinates unchanged. Do not overwrite
existing map, exterior landscape, navigation or event handlers.
