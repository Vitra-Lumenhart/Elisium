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


---

## 2026-11-11 · The Webspace Kilns arrives in the Elisium Pages house

**Backwards:** Elisium's existing stand-alone C. S. Lewis-inspired world and its original MIT source remain unchanged. The separate, canonical [Vitra-Lumenhart/Webspace](https://github.com/Vitra-Lumenhart/Webspace) project finished its Webspace v7 indoor Kilns, a genuinely walkable 3D Victorian house with ten spaces, twenty-four interactive H01–H24 historical/fantasy artifacts, real Poly Haven CC0 model mounts and its own local journal. GitHub's 3D browser suite passed. Because Webspace's own Pages activation requires a repository-administration operation not exposed to the available connection, we **mirror only this child-world's runtime and art** at the already-active Elisium Pages site, under `webspace/`, without replacing Elisium's index page.

**Play the 3D Kilns:** [Enter the walkable House of Inherited Light](https://vitra-lumenhart.github.io/Elisium/webspace/worlds/elisium/kilns/index.html). The original [Webspace GitHub source](https://github.com/Vitra-Lumenhart/Webspace/tree/main/worlds/elisium/kilns) and the [immutable v7 source release](https://github.com/Vitra-Lumenhart/Webspace/releases/tag/webspace/v0007) remain authoritative; the deployment mirror is not a second editor's branch. Source file hashes and origin commit are recorded in [webspace/README.md](webspace/README.md).

**Forwards:** Restore a canonical Webspace-root Pages address when an administrator enables it; deepen the narrative interactions between the twenty-four Kilns objects and Elisium's independent sky; develop more detailed custom furniture and smaller preprocessed physical assets without silently changing H IDs, historical attribution or the bounded event protocol. The mirrored site's link to the older standalone Elisium entry is a deliberate bridge, not an assertion that their rendering engines have been merged.

**Not yet:** This Pages mirror is a static public copy, not a server, persistent guestbook, bank, identity authority or general automatic cross-repository synchronization. Updating the mirror requires a reviewed new source revision and matching documentation. Its real public HTTP/visual deployment must be confirmed by the Pages build and browser, not inferred merely from Git objects.


## The seven-address Webspace atlas — publishing all worlds

**Backwards (2026-11-11):** The Kilns already appeared as a playable, 3D child-world on this GitHub Pages site, while the other Webspace worlds remained browseable through the canonical [Webspace codebase](https://github.com/Vitra-Lumenhart/Webspace/tree/main) but not yet published together as a public multiworld entry. A new intentionally triggered GitHub Actions workflow now stages **all six top-level world entries** from Webspace's canonical `main`, plus the nested Kilns. The existing Elisium home and separate historical source are preserved.

**Play all Webspace worlds:** [Enter the Webspace seven-tab atlas](https://vitra-lumenhart.github.io/Elisium/webspace/index.html) (this link becomes live **only after** the sync action completes and GitHub Pages rebuilds successfully). The menu is Garden of Chuzhoy, Gerudo Fortress, Gringotts, Witch's Hole, Elisium, the Kilns child-world and the **reserved, not yet playable** Labyrinth of Purgatorio.

**Forwards:** Move publication under Webspace's own domain/repository when GitHub Pages is activated there; at that time retire this external deployment mirror without losing public-world access. Protect the versioned archive, source provenance, shared portal semantics and authored H-object interactions. The mirror never becomes a competing second game repository; authored updates and README/manual revisions belong in Webspace first.

**Not yet:** The first synchronization and public Pages rebuild must complete before the atlas is described as deployed; Purgatorio remains a placeholder. The old standalone Elisium repo is still needed as a hosting environment until a new site replaces it.
