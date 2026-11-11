# Chuzhoy 6.3 — Cathedral asset reconciliation

**Status:** Planning and inventory only. The playable Garden remains the exact 6.2.8 Wilderness release; no 6.3 scene update has been published. **Authority:** Garden 2D travel graph, fountain, well, portal, rituals, forest and compass. Asset generators propose local components; none may change coordinates or collisions without explicit world registration.

## Source inventory (11 November 2026)

| Generation | Where found | What it contributes | Existing status |
|---|---|---|---|
| Rev05/06 master | Webspace GitHub `assets/cathedral/` and the older Elisium publishing mirror | Original 288 × 192 m CAD master, STEP subsets, stage 00–05 GLBs, glass shaders and texture atlases | Preserved in repo; monumental geometry is not Chuzhoy geography. Do not load it wholesale. |
| Rev07 | Attached archival tar.gz `Cathedral of a Thousand Heavens 7(1).gz` | Ten external `EXT_*` proxy modules with asset sockets, STEP, GLBs and artist request/rights list | Ten prototypes and commission briefs, **not** ten finished artist commissions. Mostly not committed to canonical game. |
| Rev08 microkit | Attached `cathedral_v8(1).zip`, also embedded in Garden 6.2.8 standalone | 21 parametric part families; wall compiler; Chuzhoy sample plan (5 wall runs, 2 ribs, 12 props; 3,941 triangles); separate crown, baptism, well and Purgatorio samples | Actually powers the playable Golden proposal (~28,500 triangles in 6.2.8); original v8 lost archive was reconstructed from a preview, not byte-for-byte recovered. |
| Chuzhoy 6.2.7–6.2.8 | `worlds/chuzhoy/garden_native.html` | Existing southern arch ring, broken dome, marble depth etch + three-stain wash, Creeping Charlie, narrative actions, foliage/wildlife, navigation and Golden/Pink toggles | Playable current Garden. Keep as the exact rollback baseline. |
| New cathedral grammar / R0010 | `commons/cathedral/grammar.mjs`, `catalogue.json`, `worlds/chuzhoy/cathedral-catalogue.mjs`, `tests/test_cathedral_catalogue.mjs` | Nine families: dressed_arch, shoulder_arch, column, vault_rect, vault_octagon, vault_trapezoid, glass_rose, glass_lancet, glass_screen; materials, sockets, three glass palettes and glimmer/shimmer/blaze descriptors | Source compiler in GitHub, NOT in the playable Garden. Host adapter still required. |
| Full artist v9/v9.2 exports | No complete GLB/STEP archive found among available uploads or the GitHub main tree | Potential later revisions unknown | Do not represent the pink 6.2.8 study or R0010 grammar as delivered v9 GLB parity. Pending actual archive. |

**Additional references inspected:** Rev07 handoff and art direction, Rev08 JSON plans and reconstructed manifest, root README/manual, old project conversation notes, Chuzhoy 6.2.8 runtime, R0010 cathedral team's Chuzhoy handoff. A separately indexed `garden_cathedral_sockets.step` exists in older project files, but raw bytes were not retrievable here; exclude it from accepted geometry inventory.

## Key comparison and design decision

**Keep the native Garden's arch positions and asymmetrical ruin composition.** The eastern rose walk and southern garden arcade are particularly successful, but their arch/pier joint is too weak. Improve columns with R0010 carved capitals, wedge-shaped dressed-stone voussoirs and authentic spring joints. The Rev07 `EXT_ARCH_03` and Rev08 pointed arches remain useful artistic and parametric references, not duplicate parallel arch rings.

**Build cathedral massing from v8's host-registered wall routes.** Its Chuzhoy showcase spans approximately X = -61.6 to -33.6 m and reaches 15.4 m. Use the R0010 masonry grammar and its sockets to detail the load-bearing skeleton and window apertures, while retaining the successful v8/6.2.7 uneven top-line, missing roof and ruins. The historical Rev06 master is about 288 × 192 m with an 84 m skyline, and has a different CAD/GLB datum; do not substitute it for Garden geography.

**The present pink design is a heptagon, not an expressive heptagram.** In 6.2.8 `buildHeptagonStudy()` uses a 15 m radius centered near (-47,0), arches topping out around 11.2 m and spokes around 9.6 m. It is shorter than even the v8 Chuzhoy sample and buried by the treeline. Proposed silhouette experiment: separated surviving masonry reaching roughly 20–24 m, lifting an incomplete star crown to roughly 24–28 m, retaining broad open-sky gaps. These are *design targets*, to be adjusted in camera tests, not surveyed dimensions.

**The sevenfold star is an interpretive crown, not a replacement for structural mathematics.** Rev07's art direction explicitly distinguishes the 7-point luminous/symbolic layer from older 4/8/16 part Gothic/muqarnas load divisions. In 6.3 construct a recognizable seven-pointed star or heptagram above structurally plausible ribs; avoid covering the sky with an opaque dome. The R0010 octagonal vault can be the underlying structure, not the geometric identity of the sevenfold crown.

**Window/light integration must be causal.** Replace floating black/blue placeholder rectangles with damaged walls containing actual arched apertures, cut stone tracery, partial broken glass, missing polygon sectors and colored light projections on surfaces attributable to those same windows. R0010 glass effects are descriptors, not installed renderer physics. Rev06 atlas and cheap floor decals can serve the existing WebGL2 pipeline without Three.js or extra shadow-casting lights.

## Site placement matrix

| Location | Preserve | 6.3 architectural inheritance |
|---|---|---|
| East rose walk / southern ring | Native arch cadence, roses, stars, southern circulation | R0010 dressed_arch + stone capitals and mortar joints; selective Rev08 ruins and Rev07 proxy silhouettes. Extend varied piers rather than instancing one identical prefab. |
| Cathedral forecourt and nave | Nodes, open sky, exterior asymmetry, Golden comparison | v8 plan-to-wall compiler + R0010 vault_rect/trapezoid, columns and lancet; broken bay 3–6 m prototype before full wall conversion. |
| Elevated crown | Pink toggle and distinct 7-point reading | Real elevated sevenfold star in broken crown, from v8 dome_crown/large_crown_optional and Rev07 sevenfold art direction; 8/16 structure below. |
| Baptism side chapel | Physical font and existing God-specific text and action | Near-field dressed piers, open-air framing and legitimate glass source; no second pool or displaced interaction. |
| North astrarium | Existing sculpture, Polaris view, Russian flora | Small roofless observatory using the same masonry family, Rev07 ASTRO dial only as adjunct; no new high obstructing roof. |
| Well approach | Three-knock dark-to-violet ritual, hidden route and outer thickets | Partial ruined wall, debris and woodland columns; Rev07 octagonal ornamental well is *not* a replacement for the existing hero well. |
| Forest edge | Blue jays, deer, ewes, pasture, jaguar, fauna hero clues | Low-poly weathered ruins, unevenly broken heights, fallen drums and vine adoption; avoid blocking node arrival cameras. |

## Technical integration contract

1. Freeze the exact 6.2.8 playable Garden and keep its checksum. Extract readable runtime from the standalone via tools/extract_chuzhoy_runtime.py. Preserve 6.2.5.1 archive and 6.2.8 Git history.
2. Implement one opt-in **CathedralHostAdapter** in Garden using the EXISTING WebGL2 context. The adapter accepts R0010 compile() triangles/sockets/effect descriptors and v8 wall spans, applies an explicit [x,z] world anchor and yaw, and maps local materials to the existing Garden's vertex material and shared marble maps. No Three.js second canvas.
3. Give every proposal component an immutable ID, generation, provenance/license, original plan station, actual placement, damage age, LOD and collision policy; never infer the same coordinate origin for Rev06, Rev07, Rev08 and R0010.
4. Prototype *one* 3–6 m near-temple wall bay: registered pier, two-centred arch with connected voussoirs, broken high lancet, residual rib, worn stone wash, and projected glass light. Verify first-person perspective at Temple forecourt, Temple nave and Baptismal station before replication.
5. Expand deterministically from host 2D wall paths, with explicit openings and a stable broken-height/noise seed. Use non-colliding comparison meshes first; require route clearance before enabling collisions.
6. Keep independent toggles: Golden = coherent load-bearing cathedral + garden ring; Pink = sevenfold elevated interpretive experiment, 50% alpha if comparison enabled. Neither implies full v9 asset import until validated.
7. Keep a tight material budget and batched meshes. New low-end mobile tests must measure shader linking, draw calls, first paint, GPU timing, actual phone FPS, alpha overdraw, and navigation. Initial *goal*, not promise: only modest growth over the current 1.64 MB single-file preview; no 4K texture bundles.

## 6.3 priority and proof

- **P0 provenance:** recover all required source, identify missing 9.2 originals, preserve checksum/rollback; run v8 suite and GitHub cathedral catalogue tests.
- **P1 first wall and glass:** one credible 3–6 m bay, actual pier-to-spring contact, no floating window, no apparent second renderer, no graph changes.
- **P1 skyline:** four camera shots (fountain approach, forecourt, nave looking up, baptism precinct) show elevated star identity and broken moon/star vista. Star distinct from a plain heptagon.
- **P1 Garden arches:** retain asymmetry and ring geography while improving joints and materials; portal and Secret Well remain discoverable.
- **P2 micro-demonstrations:** North astrarium arc and well-screen use the same components without replacing their hero assets.
- **P2 regressions:** one-way Obsidian-to-East, secret path hitbox, well three knocks, cross-world return, wudu/baptism actions, gold/pink toggles, flora clock, wildlife and screen/portal contracts.
- **P3 shipped QA:** exact compiled HTML loads in ChatGPT preview and GitHub Pages; native GLES shader compile/link, mobile/desktop screenshots and frame rate measurements; root README and TECH_MANUAL ledger and player/technical views both updated.

**This file is an asset-and-integration proposal, not an assertion that Chuzhoy 6.3 or v9.2 geometry has been shipped.**