# Webspace v0.6 · Contrasting worldbuilding systems

The same WebGL2 renderer carries **two deliberately incompatible-looking floor grammars**. This is intentional. A world author should be free to replace the philosophy of a physical world without replacing portals, screens, node navigation, or the CAD loading contract.

## Interior: Sandstone Fortress

Three distinct **shader-only** floor looks use zero photographic texture files and no runtime network requests. They have their own material numbers, not a hidden atlas:

| Material | Function | Concept | Typical placement |
|---|---|---|---|
| 6 | `uMat==6` | staggered timber parquet with sine-wave grain, hashed knots and board seams | base processional walkway |
| 7 | `uMat==7` | blue-charcoal woven ceremonial runner with gold-ish diamond field | central aisle |
| 8 | `uMat==8` | inlaid stone threshold tiles with geometric stars and mortar | periodic room thresholds and conference stage |

All three use simple 2D coordinate math on `vPos.xz`. Their visible detail does **not** increase the geometry count. The actual wall shader still uses material 1, independently.

### Correspondents' Den

The Den is the first viewpoint after the throne at `(0,0)`.

- A formal wood-and-gilt podium faces back toward the approaching traveler.
- Behind it is an **intentionally blank dark rear display**, not a live screen. The `vnn-wall` iframe remains a separate object to the right.
- 18 chairs make six seats per row across three rows, with a central walking aisle left clear.
- **Every chair comes from one `correspondents_chair.glb`**, whose editable solids are in `correspondents_chair.step`. They are turned and placed by one JavaScript instancer. The runtime batches them into one vertex buffer and one draw call; it does not send repeated GLB downloads.
- `make_correspondents_chair.py` is the deterministic CAD generation source.

## Exterior: Garden of Chuzhoy

Three wholly different outdoor floor systems are also procedural and texture-file-free:

| Material | Function | Concept | Typical placement |
|---|---|---|---|
| 9 | `uMat==9` | continuous dark earth with moss bands and coarse leaf litter | forest glen |
| 10 | `uMat==10` | fine crystalline marble with repeatedly folded, branching aqua veins and pinprick sparkles | circular court and fountain apron |
| 11 | `uMat==11` | outdoor mineral gravel and ribboned calcite, irregular pebbles rather than tile seams | diamond-shaped walking path, east radial fountain approach |

### Structural marble (material 2)

The facade, column shafts, broken caps, and pointed arch rings use a **fourth coherent marble shading field**. Its detail comes from *domain-warped trigonometric waves* computed at every fragment in **world coordinates**. It is not plastered on as a bitmap or sliced along mesh UV seams.

The runtime cylinder uses **smooth radial vertex normals** for all `material==2` columns. This suppresses distracting vertical faceting. In particular, a long cylindrical strip can be perceived as a continuously curved surface even though it remains tessellated into GPU triangles. Its world-coordinate veining naturally continues along the entire circumference.

The glen uses fourteen possible bays in a radial cloister, with missing bays replaced by jagged cylindrical stumps and toppled fragments. The ring is sufficiently open to view the tall trees through actual *voids* in the pointed arch profiles. Repeated arches are two-centered and sculpted from individual curved voussoirs. The fortress retains the lower four-centered profiles.

The sculpture assets, portal, and screen protocols do not depend on a given floor style. This is **precisely** how a later independently authored world can swap its visual reality while reusing Webspace interoperability.

## Theme seeds

Keep these for future art passes:

- **Fortress:** processional geometry, politics, subtext, architectural ceremony, perfectly measured craft, the feeling of a late-afternoon announcement that nobody can quite explain.
- **Garden:** French ecclesiastical cloisters, graceful decay, fantasy marble, moonlit trees, the echo of Charn, an accidental enchanted conservatory.
- **No photogrammetric texture dependence:** use curves, shading functions, B-reps, explicit ruin silhouettes, and selective high-detail CAD for narratively important landmarks.

The “three textures per scene” refer to three **floor-specific** generators each. Sandstone fortress bricks and the garden's marble are separate wall/structural treatments.
