# ELISIUM · The Names We Give

**Webspace 0.1.0 · An essay you can walk through**

A miniature, original browser world about the names we give to goodness, fear, and power. Its first question comes from C. S. Lewis's *The Last Battle*: what happens when someone insists that Aslan and Tash are the same?

This independent, unofficial literary experiment treats that claim as a **contested proposition**, not as Lewis's conclusion. Walk among ghost-gray trees, speak to two figures, and discover how a name can reveal or conceal.

**Play after publication:** [Enter Elisium](https://vitra-lumenhart.github.io/Elisium/) · **Browse source:** [Vitra-Lumenhart/elisium](https://github.com/Vitra-Lumenhart/Elisium). The playable URL goes live only after GitHub Pages is enabled. You can also open `index.html` locally in a modern browser.

## Explore

- **↑ / W:** Travel to an adjacent waypoint in the direction you're facing.
- **↓ / S:** Return to the preceding adjacent node.
- **← / A, → / D, or drag:** Turn your view.
- **E / Space:** Interact with an approachable sprite, dedication screen, or portal.
- **M / Graph:** Inspect the navigable node graph; click connected waypoints to travel.

Start facing a tribute to **C. S. Lewis and the Inklings**. The single exit portal lies behind you. Move through the meadow to encounter Aslan and Tash, each illustrated with an original three-panel sprite sheet whose state follows its own rules.

## The engine experiment

- **12 authored nodes** embedded in a Cartesian OpenGL/WebGL2 scene.
- **Independent, weighted edge times** rather than simple distance-based travel.
- **Locked transit:** the fictional clock advances *while* the camera travels between nodes.
- **Two sprite families:** each object uses one three-panel PNG atlas, with family-specific panel-selection logic.
- **Five procedural tree families** (cypress, umbrella pine, weeping willow, silver birch, broadleaf), each with three currently fixed growth stages; plus hedges, roots, flowers, and field plants.
- **Ghost-tone foliage:** translucent, grayscale vegetation with wind sway, shifting opacity, and view-dependent highlight.
- **WebGL2 rendering** with a projected Canvas2D compatibility mode for environments without GPU contexts.

No login, external service, tracking, or third-party JavaScript dependency is required to play.

## Project map

| Path | Description |
| --- | --- |
| `index.html` | Playable website entry point; dedication and controls |
| `engine.js` | Graph-native navigation, shaders, vegetation and sprites |
| `style.css` | World UI and interaction styling |
| `assets/*.png` | Two triptych atlases, one per character |
| `assets/*.svg` | Editable source illustrations |
| `world_manifest.json` | Design-time world topology and metadata |
| `TECH_MANUAL.html` | Technical architecture and next steps |
| `README.txt` | Longer first-walk/player notes |
| `COMPATIBILITY.md` | Relationship to the predecessor Chuzhoy |
| `make_sprites.py` | Rebuild PNG sprites from SVG sources |
| `build_preview.py` | Produce one-file offline HTML preview |
| `tests/test_manifest.mjs` | Node-based graph and atlas checks |

Run the graph tests with `node tests/test_manifest.mjs`. The multi-file site works on static web hosts including GitHub Pages.

## Publishing

Under Vitra's account (`Vitra-Lumenhart`), the website is published from this repository using **Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)`**. See [`PUBLISHING.md`](PUBLISHING.md) for the browser-only workflow.

Subsequent commits to `main` refresh the same public website URL after GitHub completes deployment. Gameplay runs entirely in visitors' browsers; GitHub Pages does not store shared game state or provide a game backend.

## Literary and authorship note

Elisium is an **independent, unofficial fan-fictional and critical interpretation** of themes and fictional characters associated with C. S. Lewis. It is not affiliated with or endorsed by the Lewis estate or any publisher. The writing and artwork created for this experiment are presented as original interpretations, not original excerpts from Lewis. Underlying fictional characters and names may remain protected by their respective rights holders.

**License:** This repository was initialized with an MIT License. That license covers original software included in the repository to the extent its copyright holder has the right to license it. It does **not** grant rights to C. S. Lewis’s characters, texts, titles, or other third-party material. This project is an independent, unofficial literary interpretation.
