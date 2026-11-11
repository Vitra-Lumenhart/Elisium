# Architectural development plan — from paper geometry to a web-realistic ruin

## Governing story (nonnegotiable)

The temple is accreted, not stylistically blended into oblivion. Preserve the square altar and east-west Exodus access, the Moorish/Andalusian water courts, the preexisting pointed Franco-Moorish arches, the later Catholic gathering circle, the heptagonal crown, and the northwestern ruin breach. **The French high-architecture campaign now cites Mont Saint-Michel**, especially La Merveille's stacked levels, cliff-suspended cloister and dense inhabited structures, while retaining generic Gothic buttresses and rib vaults formerly associated with Notre-Dame. Taj moon-domes, pale marble funerary tenderness, Russian crystalline tent and flame lanterns are later symbolic silhouettes attached to load-path logic, not roof replacements. No Gaudí vegetal roof language, no decorative exterior shrubs or campus arches.

The old symbolic cross survives in cardinal procession aisles under the round communion seating; the 3×3 sanctuary bay grid remains faintly apparent through retained axial columns and ancient pier locations. The freestanding square Eucharistic altar is **not** the historical slaughter altar. The western octagonal immersion font is not a swimming pool or animal-sacrifice station. The Wudu fountains have separately fed clean water at the east entry.

## Authoritative coordinates

- Coordinate datum from revision 04: `u=0…192` north, `v=0…288` west, `z` up (metres); east at v=0. The altar centre is CAD `(96,168,0)`; four corner fiducials `(54,126) (138,126) (54,210) (138,210)`.
- Browser glTF is **Y-up** at the altar: `(x,y,z)=(u-96, height, 168-v)`. World north +x, east +z. Preserve this convention across future exports.
- Site width 192m, east-west length 288m. Sanctuary 84m square. Communion ring radius 7/22/26/32/42m. Galleries 9/21m. Ring transfer at +25m. Crown 65–84m, with 18m oculus and seven-point tracery. Don't reinterpret registration drawing axes as visual compass axes.

## Construction geometry contract

Invented *Temple masonry module* = **m=0.50m**, not falsely claimed as a historical standard. Retaining/core wall thicknesses must be `n*m` (1.0,1.5,2.0,2.5,3.0m as selected); architectural old courses default 1.00m high. Herodian influence is large ashlars with drafted margins; historical stones are limestone, not a universal Second Temple marble block dimension. The fantasy monument has marble-faced masonry and carved marble secondary surfaces.

**Column family A (garden)**: shaft radius 0.75m nominal; height 5.7m; eight- or fourteen-facet mesh; capital radius 1.0m, height 0.6m; apparent spring +6.2m. The parametric build and STEP export use these normalized nominal dimensions.

**B (ring gallery)**: radius 1.05m, height +21.4m (height deliberately spanning two occupied galleries). **C (original horn piers)**: 6m square foundation base with round-column family r=2.0m rising to +52m. Faceted French shafts r=0.55m punctuate the pier without organic branch metaphor. Column diameters and cap ratios must derive from master families, not local eyeballing.

**Garden arch**: span `s=12m`, rise `h=7m`, spring `z=6.2m`. Model two intersecting circle arcs, not a sketched gothic curve. With half-span `a=s/2=6`, the circle-center offset is `c=(h²-a²)/(2a)=13/12m`; arch radius `R=a+c=85/12m`. For each left half angle θ, `u = c + R cos θ`, `z = z_spring + R sin θ`; mirror for right half. Continuous clean apex; no ornamental boss or **projecting** keystone. Structural voussoirs and keystone/crown joint remain historically valid despite the pointed shape. Facet tessellation only at GLB export, B-rep circle in STEP if edited further.

**Crown**: sixteen primary ribs from the +25m transfer ring (radial r31m) towards the +65m lantern (radial r9m): `r(t)=31−22t`, `z(t)=25+40 sin(πt/2)^1.15` for `t∈[0,1]`. Outer geometry is given precedence; multiply subdividing ornamental muqarnas insets must not suppress rib read-through. 7-point star: heptagram `{7/2}` at r8m, z65.65m, 7 edges joining points `i` to `i+2(mod 7)`.

**Ruination must expose time**: remove parts of recent dome/roof skins first, then muqarnas secondary cells, leave major load-bearing piers and ribs relatively intact, show older square grid and circular overlay side by side. Recorded R1 roof breach in northwestern quadrant of sanctuary; R2 west/north-west wall; R3 missing arcade in eastern garden; R4 west baptistery roof loss. Rubble should follow plausible collapse vectors, not randomly float.

## Release stages and acceptance gates

| Milestone | Deliverable | Mathematical master / geometry | Browser acceptance | STEP acceptance |
|---|---|---|---|---|
| 0. Datum & import | Rev04 fiducials and world alignment | exact coordinate transforms | standalone gallery loads | placed analytic altar/pier blocks |
| 1. Foundational volume **included** | `00_foundations.glb` | rectilinear prism/courses | ~11KB; first paint almost instant | altar, piers in `temple_structural_master.step` |
| 2. Water & colonnade **included** | `01_courts_water.glb` | two-centered circles, cylinder masters, analytic annuli | garden and baptistery legible | CAD columns and basin |
| 3. High sanctuary **included** | `02_communion_crown.glb` | concentric arcs, sixteen meridian equations, seven-star edges | unmistakable upwards skyline | ring B-reps and some swept arches |
| 4. Stacked Mont skyline **included** | `03_mont_skyline.glb` | raised cloister, Gothic flying arches, parametric revolved domes | recognizable roof silhouette | CAD approximation; roof B-reps next |
| 5. Ornament/ruin **included, blocking pass** | `04_ornaments_ruins.glb` | jali linework, coursing, selective missing segments | deterioration visibly layered | component fragmentation schema next |
| 6. Sculptural master **next** | separate LOD0/1/2 GLBs, full STEP walls/roof | constructive solid geometry, analytic circles, NURBS surfaces | close inspection without faceting | **full** matching water/arch/vault B-reps |
| 7. Realism **next** | close-detail asset bundle | selective relief/displacement, noise PBR, localized normal maps only where needed | plausible marble microtexture and water, shadow stability, fog, warm/cool lamps | optional joinery and block ID families |
| 8. Mobile/final **next** | meshopt/Draco/KTX2 as measured | geometry weld/quantization, instancing & occlusion culling | p75 mobile 60fps aim, no blank initial frame | frozen canonical STEP + metadata |

## Data-transfer budgets (uncompressed prototype file sizes, actual)

Every stage may be downloaded and cached separately. Do **not** request the full GLB and stage GLBs together. All visual meshes are **per-material batched** within a stage: only 4 + 7 + 5 + 6 + 6 = **28** draw groups instead of hundreds of independently drawn pillars/blocks. Triangle count across all stages ~58,220; full GLB is ~1.07 MB, lite GLB (stages 0–2) ~693 KB, STEP ~669 KB. No photographs, environment cube maps, external geometry, PNG normal maps, or inlaid ornament atlases are shipped at first paint. Three.js renderer code comes from the pinned CDN, so include that cost unless your existing site already has it cached.

Potential new target (after measurement; aspirational, not achieved): ~300KB geometry before user moves, under 1MB for nearby full structural scene, keep high-detail splinters behind camera/distance tests. For aesthetics, maximize silhouettes and shadow-bearing geometry per byte; do not bake high-res masonry into PNGs unless a visual error justifies it.

## Safe transfer to Webspace Development

A. Preserve the host map's active scene state and old roof as a rollback. B. Register origin and scale with a visible debug altar marker. C. Import stage0 and inspect boundaries. D. Enable stage1/2 in a new `THOUSAND_HEAVENS` group; hide roof only after successful raycast/camera/occlusion checks. E. Enable Mont skyline and ruin features by proximity or quality tier. F. Only then retrofit collision meshes and replacement roof surfaces, separating visual from walkable meshes.

A non-Three.js host renderer must treat `temple_full.glb` as interchange data and use its own importer. **Nothing in this package proves compatibility with the unseen host source**.

## Quality control

Check GLB bounds after import: overall stage 0+ has x ~−94…+94, z ~−116…+164, elevation y ~−2.4…+84.16. STEP import must yield **61 analytic solids**. Re-render at low pixel density and mobile size; verify transparent water, temporal artifact overlays and no drawn ornament contrary to each sacred use. Script `tests/verify_assets.py` checks reference alignment, asset existence, unit bounds and material-batched draw-group count.
