# Kilmainham Asylum — R009 (second attempt)

R008 remains the approved architecture and is preserved on its own branch. R009 replaces the rejected procedural texture experiment. The three cell tiers and two structural interstories, axial stair system, four travel nodes, narrative choices and step-count pacing remain.

## What to inspect
- Open index.html through an HTTP server, then follow Material review / export for actual graded material maps and individual PNG export.
- Every cell uses the same flat door bay, including the faceted apse. Only the blank interstory and crown masonry retain radius-matched wedges.
- Masonry chips use the same material as the wall. Door timber, iron hardware, boards, flags, and masonry get independent projected UVs rather than stretched palette-atlas coordinates.
- Stair side handrails run continuously; overhead barrel cage begins at step 12. Gallery hoop module count drops from three to two in a typical 2.87 m bay; bridge cages are no longer doubled.
- Three optional original CC0 KayKit character models are recolored as Penitent, Warder, Scrivener. No new character rig, wardrobe geometry or complete cloth UV remake is claimed.
- Five optional material maps load after the playable scene starts. The HUD reports availability and fallbacks; missing external resources cannot stop navigation.

## Review only
The new material workbench uses real Poly Haven CC0 source scans, not generated repetitive patterns. A map is requested at 2K, then 1K or 4K if unavailable. Source grade and projection are editable in kilmainham-materials.js. The color maps can be exported from art-review.html; the linen swatch is a material experiment and is not yet applied to character clothing. No Vitra Drive upload or production catalogue integration before approval. Live visual testing remains outstanding.
