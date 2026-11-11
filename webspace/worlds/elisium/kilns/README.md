# The Kilns · House of Inherited Light — walkable 3D edition (v7)

**The main entry is now the 3D house:** [index.html](index.html). The [illustrated edition](illustrated.html) has been preserved intact for accessibility, low-GPU machines, recovery and study of v6. The room graph and H01–H24 titles, interactive actions and inquiries are inherited rather than rewritten.

## What you may now walk through

The physical house is built of nine adjacent ground-floor cells (Oratory, Library, Study, Stair Landing, Common Room, Dining Room, Picture Gallery, Vestibule, Kitchen), and a separate upstairs Attic reached by an animated spiral staircase from the landing. Wood floors, patterned carpets, coffered ceilings, timber wainscot, bookcases, glass windows, spectral Oratory panes, fireplaces, dining furniture and attic rafters are **procedural Three.js geometry in meters**, not a painted flat panorama. Doors are cut into inter-room walls at real world positions. Walk across them; wall collision blocks your progress outside the doorway. Walk with WASD, arrow controls or on-screen buttons, drag to look, E to examine or use the stairs. The room index provides an accessibility shortcut; it is not a substitute for the walkable geometry.

## Twenty-four historical donors become physically placed fantasy artifacts

The 20 distinct Poly Haven source models are now directly **mounted onto spatially located plinths** serving the 24 H objects as visitors enter each room. The house loads official current 1k glTF geometry and textures from Poly Haven, with slug deduplication. Each H object is a world-space interactive group containing the source artist model (or local GLB proxy on failure) *and* its own original procedural fantasy additions (brass plaques, spectrally colored glass, manuscripts, correspondence, doors, miniature chapel, orrery, pendulum, rain gauge, wren, restored mullion, etc.). Interacting activates a distinct physical transformation and the inherited written inquiry.

This is a new visual and mechanical treatment of the authored object, not proof that the original source sculpture was created for a Lewis narrative. Artist provenance is preserved through the Poly Haven source pages and the fixed verified source ZIP from Webspace v6.

## Spatial sovereignty and privacy

The child owns its clock (+3 minutes to change room, +6 to examine), coordinates and narrative. The guest journal stays local in sessionStorage unless explicitly exported. The only parent-facing event is the established bounded, public H-object observation. Screens are not portals, staircases are not hidden account transfers, and the exterior Elisium sky remains independent.

The house does not ask for an identity, bank account, password or permission to access local files. A public Poly Haven request discloses standard browser network metadata to upstream hosts. No untrusted glTF asset receives authority to run arbitrary Webspace JavaScript or alter the narrative. Source URLs in the loader are restricted to official Poly Haven file hosts.

## Source files and maintenance

| File | Role |
| --- | --- |
| `index.html` | Live 3D entrypoint and UI with illustrated fallback link |
| `house-layout.mjs` | Shared coordinate definitions, door and room graph rules, attic plan |
| `house3d.mjs` | Three.js building architecture, navigation, time, object inspection and session journal |
| `house-fantasy.mjs` | 24 original procedural fantasy ornaments and interaction animations |
| `house-assets.mjs` | Live original artist donor mounting, current API fetch and local GLB fallback |
| `illustrated.html` | Frozen playable v6 illustrated route graph |
| `world.json` | World topology, contract and object IDs |
| `tools/test_kilns_house3d.mjs` | Browser spatial, real-source, attic and interaction acceptance tests (repo root) |

**Next:** review all 24 artist model scales/placements on real hardware, evolve bespoke animations into deeper puzzles, optimize LOD and offline distribution, improve the physical attic stair movement, extend the authorable semantic object contracts, and integrate the allowed public house echoes into Elisium without commanding its sky. See root README R0009 and matching technical manual. The child world is not a banking or login authority.

## Validation statement

Live GPU acceptance and public Pages publication must be checked separately from source creation. The test workflow verifies real 3D geometry, a walkable door, live art physically mounted in the dining room, stair passage and all H01–H24 effects; do not claim a complete graphics review of all Poly Haven models merely because one selected representative passes.

## v8 · Exterior quest giver and retained parent world (candidate)

Elisium now owns the twelve-sign sky comparison, the seven-point route and the summons to this house. Entering from the outdoor v8 shell opens this existing *3D house* as a nested child, without unloading the original v4.6 outdoor simulation. The source at \`house3d.mjs\`, \`house-fantasy.mjs\`, \`house-assets.mjs\` and the optional illustrated fallback remains unchanged. The bounded threshold projects explicit H-object observations (no private journal, account, simulated belief score or religious verdict), and the parent reads them after the player returns.

See [SGM_OBJECT_LAB_v8.md](SGM_OBJECT_LAB_v8.md) for all 24 recommended mathematical investigations, the twelve inherited object pairs, comparison boundaries and an educational example concerning seven billion hypothetical Matrix/Synapse records. Most object-specific math exercises are **recommendations**, not implemented 3D object behavior. The implemented numeric sampling exercise lives outdoors in the Sky Atlas. Do not equate a sampled message with a person's consciousness.

**Known contract debt:** v7 room clock (+3 per changed room) and object-exam clock (+6) remain in the house. The v8 wrapper preserves native Elisium's state while the child is open, but does not yet advance Elisium's travel clock by the child's fictional minutes, and does not persist a full native 4.6 session across a browser reload. If a parent is absent, the standalone \`index.html\` and its regular return navigation remain available.
