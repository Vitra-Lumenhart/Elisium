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
