# Chuzhoy 6.2.8 · cathedral art inheritance and next steps

**Baseline:** `worlds/chuzhoy/garden_native.html` is the exact 6.2.8 wilderness source; see `QA_6_2_8.md` for SHA and acceptance list. **Status of new cathedral grammar:** library shipped for reuse on a review branch; no live geometry has been mounted inside Chuzhoy. The existing Garden remains the authority for its 2D geography and route graph.

## What the team has already earned

The Garden is more than an empty outdoor renderer: wilderness vegetation, southern arch ring, pasture, deer/ewe/jaguar and blue-jay sprites, marble Creeping Charlie, hidden-well approach, compass wing orientation, gold structural and pink sevenfold proposal switches, and inherited portal action semantics. These achievements must not be sacrificed for a larger prefab.

## Artistic obstacles to address instead of erasing

- The prior repeated double-arch system lacks credible *stone* construction. Use proper dressed voussoirs, mortar joints, granite cores and carved capitals from the shared grammar.
- Architectural proposals are visible but their relationships are not yet a coherent damaged building. The player should infer the absent high roof from surviving load-bearing members.
- Color projects from broken panes need a discoverable physical source and a consistent dusk / sky policy; emissive tricks must stay cheap.
- The fountain, well and sacred water purposes are independent: wudu near entry is not the baptismal immersion basin, and neither is a decorative swimming pool.
- The self-contained 6.2.8 runtime is large and currently reconstructed from its standalone HTML. Prefer a new modular adapter to direct text surgery on the compressed game.
- Game motion and fallbacks matter: wildlife sprites and gold/pink toggles have known desktop/GLES startup checks but do **not** yet have exhaustive real-device pixel/FPS evidence.

## Proposed first actual placement (NOT committed)

Use a single near-temple wall or roofless 3–6 m bay following *existing* 2D wall stations. Place one visibly broken high lancet and a shoulder-vault fragment. From a protected player viewpoint, look up and discover the glass projection; if the sightline is poor, change the **asset recipe**, not the Garden's fountain or travel nodes.

**Future-AI prompt embedded in the task:** “Find the source of color, find the weight of the stone, find the missing roof. What survives must make the vanished building imaginable.”

## Accept before scene mounting

1. Read `commons/cathedral/README.md` and run its tests.
2. Confirm the exact anchor points from the latest Chuzhoy source (6.2.8 or later).
3. Check player navigation, well three-knock, compass, portal roundtrip, wudu/baptism and gold/pink architectural toggles before/after.
4. Verify Canvas fallback and WebGL2 visually with screenshots; measure FPS before choosing LOD.
5. Record the new layout in the world README/manual and paired root ledger; do not silently rewrite prior art.

An artist for Purgatorio may import a single `vault_trapezoid` or `glass_screen` with its own mapping; that is why none of these recipes owns Chuzhoy's coordinates.


## Reconciliation update R0013 — planning for Garden 6.3 (2026-11-11)

Read [the detailed versioned source census and design plan](../../docs/CHUZHOY_6_3_ASSET_RECONCILIATION.md) before treating the R0010 grammar as a replacement model. There are multiple distinct source generations: the monumental Rev06 CAD/GLB master, Rev07 prototype sockets, the locally reconstructed Rev08 wall/part microkit already embedded in Garden 6.2.8, and the new R0010 *source-only* cathedral library. Full v9.2 artist binaries are not in this repository. The existing Garden's exterior arcade is a valued composition; do not delete it. Rebuild joints, material and support with the new grammar. The pink 6.2.8 study is a low heptagon with ~11m arches, not yet an elevated seven-point crown. First deliver one host-registered roofless cathedral bay with genuine stone, a high broken lancet and a discoverable glass light source; no new navigation, sacred water replacement or camera obstruction.
