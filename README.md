# ELISIUM · The Names We Give

> **Revision covenant — contributors and AI coding agents:** Every change to the game must update both documents from distinct viewpoints: **`README.md` for players** (what changed, how it feels, and how to use it) and **`TECH_MANUAL.html` for developers** (implementation, rationale, limitations, and tests). Keep them synchronized with the code in every revision; `README.md` is the sole player manual.


**Webspace 0.2.0 · An essay you can walk through**

A miniature, original browser world about the names we give to goodness, fear, and power. Its first question comes from C. S. Lewis's *The Last Battle*: what happens when someone insists that Aslan and Tash are the same?

This independent, unofficial literary experiment treats that claim as a **contested proposition**, not as Lewis's conclusion. Walk among ghost-gray trees, speak to two figures, and discover how a name can reveal or conceal.

**Play:** [Enter Elisium](https://vitra-lumenhart.github.io/Elisium/) · **Browse source:** [Vitra-Lumenhart/elisium](https://github.com/Vitra-Lumenhart/Elisium). The public world runs on GitHub Pages. You can also open `index.html` locally in a modern browser.

## v0.2.0 · A Writer’s Lantern

The floating dedication has become an object you can visit: a lovingly ornamented, nineteenth-century London-inspired lamp-post, complete with a distinctive crossbar, beside a small writing pedestal holding an open book. The two pages face the walker at eye level.

- The **Company of Writers** book now holds the C. S. Lewis and Inklings tribute and its two Wikipedia links.
- **Change Book** switches to a guestbook without leaving the field. **Previous** and **Next** turn the paired pages together.
- On the writing spread, **type directly into the right-hand page**. The left-hand page reflects the text as you write. Touch devices use their ordinary keyboard and text-input method.
- **Sign this page** keeps a note in this browser's local storage; the next spread displays your own entries. These are **not shared publicly between visitors**, since GitHub Pages does not provide a database.
- This is an original procedural mesh and local DOM book, not an external 3D model, a separate editor window, or a new game server.

README.md remains the player guide. Developers should update **both** this guide and TECH_MANUAL.html for every revision.
## v0.1.2 · Waypoint visibility repair

- Fixed a CSS error that kept hidden waypoints and nameplates visible even when the navigation engine had filtered them out. Only actual reachable neighbors in view now render as waypoints.
- Waypoints no longer print through the C. S. Lewis memorial screen, cover the location summary or bottom controls, or pile overlapping labels on each other. Turning and using **Graph** still exposes all connected routes.

## v0.1.1 · Clearer navigation

- Waypoint labels appear only for reachable nodes in the forward viewing hemisphere. Nodes behind the player no longer appear as confusing markers near the screen edge; turn around to reveal them.
- `README.md` is now the sole player-facing guide. Every revision must also update the developer-facing technical manual.

## Explore

- **↑ / W:** Travel to an adjacent waypoint in the direction you're facing.
- **↓ / S:** Return to the preceding adjacent node.
- **← / A, → / D, or drag:** Turn your view.
- **E / Space:** Interact with an approachable sprite, the book, or the exit portal.
- **M / Graph:** Inspect the navigable node graph; click connected waypoints to travel.

Start facing the path to **A Writer’s Lantern**. Its lamp-post and book hold the dedication to **C. S. Lewis and the Inklings**. The single exit portal lies behind you. Move through the meadow to encounter Aslan and Tash, each illustrated with an original three-panel sprite sheet whose state follows its own rules.

## The engine experiment

- **12 authored nodes** embedded in a Cartesian OpenGL/WebGL2 scene.
- **Independent, weighted edge times** rather than simple distance-based travel.
- **Locked transit:** the fictional clock advances *while* the camera travels between nodes.
- **Two sprite families:** each object uses one three-panel PNG atlas, with family-specific panel-selection logic.
- **Five procedural tree families** (cypress, umbrella pine, weeping willow, silver birch, broadleaf), each with three currently fixed growth stages; plus hedges, roots, flowers, and field plants.
- **Ghost-tone foliage:** translucent, grayscale vegetation with wind sway, shifting opacity, and view-dependent highlight.
- **WebGL2 rendering** with a projected Canvas2D compatibility mode for environments without GPU contexts.
- **Writer’s Lantern** adds a richly faceted iron street lamp, a pedestal book, two synchronized page surfaces, and local guestbook entries.

No login, external service, tracking, or third-party JavaScript dependency is required to play.

## Project map

| Path | Description |
| --- | --- |
| `index.html` | Playable website and in-world book surface |
| `engine.js` | Graph-native navigation, shaders, vegetation and sprites |
| `style.css` | World UI and interaction styling |
| `lantern.js` | Procedural lamp and pedestal geometry; two-page book controller and local writing |
| `lantern.css` | Parchment page styling and world-book layout |
| `assets/*.png` | Two triptych atlases, one per character |
| `assets/*.svg` | Editable source illustrations |
| `world_manifest.json` | Design-time world topology and metadata |
| `TECH_MANUAL.html` | Technical architecture and next steps |
| `README.md` | Canonical player-facing guide and release notes |
| `COMPATIBILITY.md` | Relationship to the predecessor Chuzhoy |
| `make_sprites.py` | Rebuild PNG sprites from SVG sources |
| `build_preview.py` | Produce one-file offline HTML preview |
| `tests/test_manifest.mjs` | Node-based graph and atlas checks |
| `tests/test_lantern.mjs` | Lamp geometry, rendering hooks, and book behavior checks |

Run graph tests with `node tests/test_manifest.mjs` and lamp/book tests with `node tests/test_lantern.mjs`. The multi-file site works on static web hosts including GitHub Pages.

## Publishing

Under Vitra's account (`Vitra-Lumenhart`), the website is published from this repository using **Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)`**. See [`PUBLISHING.md`](PUBLISHING.md) for the browser-only workflow.

Subsequent commits to `main` refresh the same public website URL after GitHub completes deployment. Gameplay runs entirely in visitors' browsers; GitHub Pages does not store shared game state or provide a game backend.

## Literary and authorship note

Elisium is an **independent, unofficial fan-fictional and critical interpretation** of themes and fictional characters associated with C. S. Lewis. It is not affiliated with or endorsed by the Lewis estate or any publisher. The writing and artwork created for this experiment are presented as original interpretations, not original excerpts from Lewis. Underlying fictional characters and names may remain protected by their respective rights holders.

**License:** This repository was initialized with an MIT License. That license covers original software included in the repository to the extent its copyright holder has the right to license it. It does **not** grant rights to C. S. Lewis’s characters, texts, titles, or other third-party material. This project is an independent, unofficial literary interpretation.
