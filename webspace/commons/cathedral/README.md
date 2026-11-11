# Cathedral grammar — reuse before spectacle

**Status:** source-first architectural asset catalogue; available to Chuzhoy by opt-in import, not installed in its playable scene. Owner: `commons/cathedral`. Coordinates: local metres, `x/z` floor, `y` elevation. Licence for new source: MIT. Historic Rev05/06 STEP/GLB materials remain in `assets/cathedral` under their recorded project provenance.

## Try an individually reusable part

```js
import {compile, PALETTES, MOODS} from './grammar.mjs';
const a = compile({id:'ruin/west-lancet',kind:'glass_lancet',
  width:3.0,depth:.6,height:6.0,palette:'penitential_ember',mood:'shimmer'});
// a.triangles is host-neutral; a.effects contains optional light rendering hints.
// No scene, route graph, Three.js instance, portal or private player state is created.
```

The `compile()` families are `dressed_arch`, `shoulder_arch`, `column`, `vault_rect`, `vault_octagon`, `vault_trapezoid`, `glass_rose`, `glass_lancet`, `glass_screen`. These generate actual triangle geometry, stable part identifiers, optional effects and placement sockets. `compileLocalCatalogue()` builds several independent parts without a compulsory site footprint. Run `node tests/test_cathedral_catalogue.mjs` from repository root. See `catalogue.json` for provenance and family taxonomy.

## What is stylistically non-negotiable

The Alhambra conceals infinity in cellular detail and intimate reflecting courts; the French Gothic line (later Mont Saint-Michel) reveals infinity through ribs, buttresses and altitude. **Fuse their functions**, not merely their ornament. A pointed voussoir arch is stone, not a rectangular neon tube. The double-shoulder arch is an intentional *interior* profile. Corinthian/Corinthian-inspired capital anatomy and varied masonry courses matter as much as the curve itself.

At grand scale: Exodus-based square foundation → long ceremonial court → structurally legible Gothic bays → cellular muqarnas → later Catholic assembly circle → distinct seven-point luminous crown. Above, hollow towers and flying aqueducts expose one another's workings. The full Rev05 canonical precinct remains **192 × 288 m**, 84 × 84 m sanctuary, 12 m grid, 0.5 m design increment; those dimensions are NOT the size of any host level or this kit's footprint.

At small scale: a Purgatorio chamber can borrow one two-centred arch, three stone courses, one shoulder vault, or a fragment of a colored window. Purgatorio presently has only a GitHub placeholder. No Dante level, maze graph or quests are asserted here.

## Light as narrative, not expensive optics

- **Glimmer:** distant invitation / intelligible hope. Low diffusion, restrained halo, celestial window.
- **Shimmer:** atmospheric activity / waterborne, living mercy. Softer projection, saturation variation, moving-feeling edges.
- **Blaze:** deliberately impossible amplification / miracle or warning, never claimed as physically simulated refraction.

In `grammar.mjs`, `effects` are *descriptors*, not a shader already installed in the Garden. Future teams can implement cheap floor decals, vertex color masks and additive light projections, keyed by window and palette. Prefer one shared tiny texture atlas; avoid multiple real shadow-casting stained-glass spotlights on low-end devices. Broken glass must be actual missing polygon sectors, not a magical black raster mask.

## Future builders: what to grow next

1. **BAY-01** — Snap structural arches to host wall polylines, with truly closed dressed-stone voussoirs. Verify collisions and openings using the host graph.
2. **VAULT-02** — Replace coarse muqarnas wedges with recursive recessed, self-shadowing cells; choose subdivision by projected screen size, not just distance.
3. **STONE-03** — Add credible granite cores, Caen dressed limestone ornament and dark polished shaft material; preserve seams, mortar and the crown joint.
4. **GLASS-04** — Make missing shards and sevenfold traceries produce colored *discoverable* projections attributable to a visible high window. Respect reduced motion.
5. **HERITAGE-05** — Build exposed archaeology of square altar, cross-axis, circle and sevenfold crown without asserting all traditions use the same rite.
6. **PERF-06** — Measure silhouette continuity, CPU compilation, draw calls, downloads and low-end phone FPS. Count *distinct structures per generator*, not GLB count.
7. **HOST-07** — Let Garden, Purgatorio, and future nonreligious worlds supply coordinates and select symbolism. Never let the cathedral override their topology.

These are invitations, not claims of completed features. Each change inherits the [revision covenant](../../docs/REVISION_COVENANT.md): retrospective evidence + prospective invitation, paired in root README and TECH_MANUAL.

## Chuzhoy

Import the optional `worlds/chuzhoy/cathedral-catalogue.mjs`; it prepares proposed assets but **requires the host to return 2D anchor coordinates**, and all returned placements remain `approved:false`. The existing Garden 6.2.8 HTML, wilderness, marble Creeping Charlie, wildlife, well, fountain, compass and architectural proposal toggles remain untouched.

## Source fidelity / limitation

This is an initial **repository-level bridge** for the v9.2 architectural grammar, not a claim of GLB asset parity with the separately developed v9.2 archive or of fully analytic STEP for every new part. This is also not a playable Chuzhoy integration. Future contributors may port verified detailed part generators and GLB exports into this namespace while keeping the contract stable.
