# Kilmainham Asylum — R010 · The Long Neglect

R008 remains the approved architecture and is preserved on its own branch. R009 replaces the rejected procedural texture experiment. The three cell tiers and two structural interstories, axial stair system, four travel nodes, narrative choices and step-count pacing remain.

## R010 finish
Reference photographs show warm yellowed masonry, dark green-black doors, slate-blue ironwork and honey-brown roof boards. R010 keeps that hierarchy, imagining decades of deferred maintenance rather than reproducing the restored museum. World-space damp tide, gallery runoff, dirt patches, oxidized iron, clouded glazing, worn fabrics and subdued brass/lamps/paper. Scanned luminance-derived bump is a relief approximation, not measured displacement. Cooler overcast daylight, reduced fill and preserved rooflight. R009 remains archived on its own branch; geometry, flat doors, interaction graph and cage spacing are unchanged.

References: [East Wing axial view](https://www.ireland.com/things-to-do/attractions/kilmainham-gaol/), [close-up masonry and galleries](https://www.irelandbylocals.com/dublin-kilmainham-gaol-review/), [architectural inventory](https://www.buildingsofireland.ie/buildings-search/building/50080047/kilmainham-gaol-inchicore-road-kilmainham-dublin-8-co-dublin).

## What to inspect
- Open index.html through an HTTP server, then follow Material review / export for actual graded material maps and individual PNG export.
- Every cell uses the same flat door bay, including the faceted apse. Only the blank interstory and crown masonry retain radius-matched wedges.
- Masonry chips use the same material as the wall. Door timber, iron hardware, boards, flags, and masonry get independent projected UVs rather than stretched palette-atlas coordinates.
- Stair side handrails run continuously; overhead barrel cage begins at step 12. Gallery hoop module count drops from three to two in a typical 2.87 m bay; bridge cages are no longer doubled.
- Three optional original CC0 KayKit character models are recolored as Penitent, Warder, Scrivener. No new character rig, wardrobe geometry or complete cloth UV remake is claimed.
- Five optional material maps load after the playable scene starts. The HUD reports availability and fallbacks; missing external resources cannot stop navigation.

## Review only
The material workbench uses real Poly Haven CC0 source scans, not generated repetitive patterns. A map is requested at 2K, then 1K or 4K if unavailable. Source grade and projection are editable in kilmainham-materials.js. The color maps can be exported from art-review.html; the linen swatch is a material experiment and is not yet applied to character clothing. No Vitra Drive upload or production catalogue integration before approval. Live visual testing remains outstanding.

## R011 Choir of Consequences
Local voices react to arrivals and recorded testimony. Original architecture, routes and choices remain. Seven persistent powers and human witness responses use an explicit causal ledger. Preferred forms are lore proposals, not visible new models yet. See LORE_R011.md and test-choir.mjs. Canon Triangle remains unknown. No live URL or GPU QA verified.

## R011 embodiment and obligation increment
Nine original CC0 KayKit GLBs are vendored with embedded textures; no source animation clips are present. Five human identities use Rogue, Rogue_Hooded and Knight; the powers use Lorekeeper, Black Knight, Tiefling, Cleric, Paladin and Avian Swordsman according to their ledger form. Rig clones keep distinct skeletons. A fulfilled or withdrawn human commitment is a new event, not a retroactive rewrite. Only powers present to receive the event gain the momentum effect. The last four witnessed human replies also inform subsequent choices. Presentation uses smoothed movement between authored node-relative positions; no full NPC pathfinding or animation clips. Browser rendering still unverified.

## Director's commentary — forward direction
Ten design notes covering the five districts and historical ages, dramatic references, the Choir and the next playable release are preserved in [DIRECTORS_COMMENTARY.md](DIRECTORS_COMMENTARY.md) and [PR #24](https://github.com/Vitra-Lumenhart/Webspace/pull/24). These are plans, not shipped features.

## Classical Cinema School
[Read the twelve additional director notes and twenty-scene rehearsal](CLASSICAL_CINEMA_SCHOOL.md). Original forward creative objectives, not shipped features.

## Classical Cinema School — Book II
[Six further director's studies](CLASSICAL_CINEMA_SCHOOL_II.md): choreography, music, miniature theatre, historical epic, comedy and character. Forward artistic direction.

## R012 spatial and historical foundations — planning increment
[R012 scope](R012_SCOPE.md) specifies the expanded playable release. Candidate contracts and tests are committed; no new playable feature is claimed. Adult-scale traversal, one open cell, addressable districts, spatial testimony, object history and original sound are planned. R011 Choir and R010a remain intact.


## R012 hoist increment — 26 November 2026
The earlier speculative cage/shaft has been superseded by the documented two-pole food lift. See [FOOD_HOIST.md](FOOD_HOIST.md) for museum references, reconstruction limits and actual scene integration. The hoist is the first candidate for a reusable institutional maintenance contract: stable service asset ID, condition/wear, operation and custody events, repair requests, dated service and continuing history. Extend this to doors, stairs, iron screens, lamps and roofing as separate authored schedules, never as a generic random decay effect. Keep maintenance actors and responsibility explicit; repaired objects retain identity, and only witnessed events enter the Choir. Food delivery remains the first visible function. No new traversal or full historical reconstruction is implied. The code is committed to the review branch; browser/rendering and exported GLB remain pending.


## R013 — photographic ironwork correction
See [R013_IRONWORK.md](R013_IRONWORK.md). The food-hoist head now has a projecting four-spoke sheave and narrow pierced cast web instead of a generic pulley. The rendered stair/bridge cages use the shared STAIR profile (2.25m spring, .73m radius, 1.46m width, 12 facets), conservative clearance 2.59m with lateral margin. Previous behavior and architecture are preserved. 596 spatial and 4290 hoist assertions passed via JS adapter; visual rendering and actual collision sweep pending. No Pages deployment.


## R014 — Weather, iron and light
See [R014_LIGHT_FIELDS.md](R014_LIGHT_FIELDS.md). Implemented deeper roof lattice haunches, continuous elevation bands, named twin hoist arms, cached direct shadows, wrapped Gaussian cloud transmission, approximate precomputed lamp irradiance and optional oblique lightning / thunder / dust shafts. 65,550 numerical field assertions passed, 352,896 bytes CPU field arrays, 148,096 bytes GPU texels excluding existing shadow target, audio and renderer overhead. Live shader/visual verification outstanding. Original R010a release preserved.
