# Rev06 — optimization details and implementation contract

## The visual trick

Render genuine stained glass as a single alpha-masked double-sided plane mesh
containing 8 tangent bay panels. Geometry derives from the existing 32.15-m
sanctuary ring, with each 7.4 × 12.5-m window beginning at +8.8 m.
Every pane reuses a 256×512 RGBA micro-painting: colored lancets, black lead
cames, sevenfold rosette, internal scrapes, crack branches, missing-shard alpha.
This *is* a real embedded GLB texture, not a screenshot or external decal.

A second low-resolution precomputed 256×256 colored light painting is attached
to the surrounding ambulatory as eight artistically placed floor projection
quads merged into ONE mesh, with additive blending and depthWrite=false.
Small alpha halos around glass are similarly merged into ONE mesh. These two
meshes cost two additional draw calls, not sixteen. Other scene regions remain
neutral to increase the illusion of a fantastically luminous interior.

No simulated refraction, volumetric ray casting, physics-based caustics or
shadow-map cookie projection is turned on; those would be disproportionate in
WebGL. A projector cookie from Three.js SpotLight.map can modulate a texture,
but Three.js requires castShadow=true for this capability, so each cookie would
impose extra GPU overhead. This package deliberately avoids eight such lights.

Material-independent procedural world-space projected texture uses one small
atlas for marble / plaster / drafted ashlar / slate and a single sampling
axis selected by the dominant interpolated surface normal. It forgoes the
fuller 3-sample triplanar blending to cut memory fetches. Screen-space roughness
is adjusted from luma. The 1m course seams follow world-height modulo and
block phasing in the frag shader; no raised mortar geometry is downloaded.

## Performance options

Default 1024-square directional shadow map, high mode 2048 square.
WebGL pixelRatio capped at 1.6; idle render gated when camera stops.
Use loading of 00, 01, 02 and 05 first; 03 and 04 are optional deferred stages.
Use `temple_lite.glb` as stone-only fallback if a viewer cannot handle
alpha-cut embedded images. The `05` add-on is a separate 27.8 KB GLB.

### Tradeoffs and current limitations

- The caustic pools project only onto the flat annular ambulatory at CAD +.967 m;
  they do not dynamically conform to every sculpted stair, wall or seated person.
- Stained glass glows via emissive material. There is no full-scene bloom pass.
- The marble atlas is applied by a viewer shader. Ordinary third-party GLB
  viewers will see the same geometry and colored glass but not that shader effect.
- No normal map, POM, texture array, expensive transmissive PBR shader or
  procedural mesh microdisplacement is used. That is deliberate optimization.
- Native STEP retains analytic geometry, with 8 new window BRep reference
  envelopes. It cannot carry physically based viewer shader lighting.
- Live shader execution cannot be GPU-verified inside the current sandbox's
  browser network policy. GLB round-trip, manifest math, image alpha,
  standalone syntax and source integrity are independently checked.

## Resources reviewed

- Three.js `MeshStandardMaterial` emissiveMap, emissive intensity and textures:
  https://threejs.org/docs/pages/MeshStandardMaterial.html
- Three.js `MeshBasicMaterial` alpha/depth maps:
  https://threejs.org/docs/pages/MeshBasicMaterial.html
- Three.js `SpotLight.map` requires castShadow for projected cookie:
  https://threejs.org/docs/pages/SpotLight.html
- Three.js `InstancedMesh` minimizes repeated draw calls:
  https://threejs.org/docs/pages/InstancedMesh.html
- Khronos real-time asset creation guidelines, baked AO/roughness/emissive:
  https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md
- Khronos glTF KHR_texture_basisu extension for next-stage GPU compression:
  https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_texture_basisu/README.md

## Planned optional next stages

- 07: Low-poly vaulted reliefs with unique baked AO for near-camera capstones;
  keep distant stones shader-only.
- 08: WebP to KTX2/Basis ETC1S + packed ORM normal where hardware allows,
  but only if actual GPU/memory profiling justifies Basis transcoder overhead.
- 09: Distance-based single-glass billboard LOD, additional wing loading,
  GPU timing analysis, device-profile-specific art direction.

**No increase to structural stone wall thickness or pillar proportions.**
The architecture remains compatible with the previous Rev04/05 drawing datum.
