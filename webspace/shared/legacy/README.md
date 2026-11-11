# Webspace — Current Version 3: GitHub-ready Chuzhoy / Gringotts (2026-10-25)

**Version 3 publishing update:** This revision adds a GitHub Pages-ready repository root, `.nojekyll`, `.gitignore`, and `GITHUB_PUBLISHING.md`. Game controls, renderer, node graph, portals and fictional bank desks retain Version 2 behavior. Keep this project in a **different GitHub repository** from [Elisium](https://github.com/Vitra-Lumenhart/Elisium), which is a separate authored Webspace. GitHub Pages can host the browser experience, but **cannot** provide actual secure authentication, custody or Proton service APIs.

**Launch:** `index.html` for the complete modular project; `../webspace_preview.html` for the portable, self-contained HTML preview, or `../webspace_bank_preview.html` to land directly in the Gringotts portico. The main Webspace remains based on the original v0.6.1.2 engine, with a new Gringotts fan-fiction bank branch behind the fortress throne. The two original worlds and CAD models remain intact.

**Visit the branch:** starting at the throne room, select **Behind the throne**, then **Gerudo bank threshold**, then **◈ Enter Gringotts · Gerudo Branch**. Move through the atrium to the goblin tellers and side galleries. Every available destination is in a translucent scrolling ribbon above the navigation controls, including on browsers unable to render in-world markers.

**Renderer:** genuine WebGL2 is primary. When WebGL2 is blocked/unavailable, a procedural Canvas 2D projection keeps the same graph, both bank portal links and the parchment interfaces functional. It is a simpler illustrated renderer, not pixel-identical to WebGL2.

**Safety:** contract, pretend money and vault are fictional interactive prototypes. No user authentication, custody, encryption, Proton login or financial service is implemented. Proton products are reached via user-initiated links to their **official websites**; the bank does not frame Proton or solicit real passwords. See `BANK_ARCHITECTURE.md` for explicit boundary and future milestones.

**Version discipline:** full original source archived in `../webspace_history/version_0001.zip`. Version 2 archived in `../webspace_history/version_0002.zip`; publishing-only Version 3 in `../webspace_history/version_0003.zip`. Active source names remain timeless, with `../webspace_current.zip` as the most recent complete package.

---

# Hotfix v0.6.1.2 — The actual startup regression

The WebGL2 fragment shader used `float patch`, but `patch` is a reserved GLSL word.
The GPU shader failed to compile. The application exited initialization before
setting up navigation, while the VNN iframe had already been constructed and
was visible by default. This explains the full-screen VNN and unresponsive buttons.

Three narrow repairs, with no scene/art/portal geometry changes:

1. Rename the fragment-shader variable `patch` to `meadowPatch` (verified with Mesa EGL ES 3 shader compiler).
2. Create the VNN iframe only **after** WebGL and controls initialize, then explicitly hide it.
3. Make the screen surface `display:none` by default; unfocusing now hides it.

The original v0.6 is still the stable rollback. The v0.6.1.2 test build
retains the crossroads and garden experiments while fixing initialization.

Validation: shader compiled with Mesa GLES 3; CPU geometry tests, portal +
Screen protocol tests, CAD parsing, and simulated-WebGL UI startup/Forward/History
checks completed. Native WebGL visuals have not been reviewed in this execution environment.

---

# Webspace v0.6 — Correspondents' Den & the Garden Cloister

Webspace is an original WebGL2 prototype combining **discrete point-to-point traversal**, a private VNN iframe Screen, a reusable rectangular Portal Kit, procedural architecture and genuinely external CAD assets. No subscription or account is needed. It does **not** contain the original Nintendo game files or depend on a hosted game engine.

## Play

**One-file preview:** open `../webspace_prototype.html` from the download link. It embeds byte-for-byte GLB copies to support file-open browser playtesting.

**Project folder:** unzip, keep the files together, and double-click `index.html` in a WebGL2-capable browser. For development, `python3 -m http.server 8000` serves the individual `.glb` files. Offline `file://` mode uses the included `*_asset.js` byte-identical sidecars because fetch of local binary files is normally blocked.

- ↑/↓ moves between linked inhabitable viewpoints; the **up arrow** also marks ordinary destinations in the 3D scene.
- ←/→ rotate, drag to look laterally or vertically; entering a new node levels the gaze automatically.
- ◈ activates a world portal, a deliberately separate action from moving. ▣ inspects the VNN wall screen.
- Reset returns to the **Throne Room** at `(x,z)=(0,0)`.
- Garden has four cardinal walk-around viewpoints, and only East accesses the fountain. Fortress remains strictly linear.

## Art pass in v0.6

The one-stop-after-throne location is now the **Correspondents' Den**: formal podium, empty screen behind it, separate Vitra News Network wall screen, and 18 identical **external CAD chairs** across three rows on either side of a clear aisle. The chandelier is still in the sky courtyard and remains unlit.

The Garden of Chuzhoy has a circular, broken **pointed-arch cloister**: repeated slender marble columns, irregular broken caps, and open windows onto a much taller tree line. The 23-unit-wide crude arch was replaced. Marble is now domain-warped, more finely veined and micro-sparkled; intact columns have smooth per-vertex normals for a continuous cylindrical look. The Singing Astrarium and original high-detail fountain are preserved.

**Three independent floor treatments exist for each world.** The fortress uses parquet, fabric aisle, and stone inlay; the garden uses mossy earth, crystalline marble apron, and mineral gravel paths. All six are independent shader functions—no images, UV atlases or subscriptions. See [ART_SYSTEMS.md](ART_SYSTEMS.md) for full implementation notes and formulas.

## File overview

| File | Purpose |
|---|---|
| `index.html`, `webspace.js` | WebGL2 game, navigation, and scene assembly |
| `webspace-portal.js`, `PORTAL_PROTOCOL.md` | Reusable portal visual renderer and cross-world travel standard |
| `webspace-screen.js`, `SCREEN_PROTOCOL.md` | Reusable screen iframe projection and communications |
| `webspace-channel.js` | Shared conservative message vocabulary (no implicit history sharing) |
| `worlds.json` | Descriptive world-graph reference, not yet the runtime scene manifest |
| `garden_fountain.step` / `.glb` | Editable fountain CAD + runtime mesh |
| `courtyard_chandelier.step` / `.glb` | Editable unlit chandelier CAD + runtime mesh |
| `correspondents_chair.step` / `.glb` | **New:** single repeatable 34-part CAD chair + runtime mesh |
| `make_*.py` | CAD generation recipes (CadQuery + trimesh) |
| `*_asset.js` | Byte-for-byte offline sidecar copies of runtime GLBs |
| `ART_SYSTEMS.md` | Material mathematics, deliberate indoor/outdoor differences |
| `test_*.js` | Node CPU checks for geometry, loaders, communications and contracts |

## Testing status

Run `node test_geometry.js && node test_assets.js && node test_art_direction.js && node test_portal.js && node test_screen.js` from inside this folder. These tests validate finite geometry, intact arch openings, GLB accessors and parts, material definitions, and portal/screen standards. **Live WebGL drawing could not be fully tested inside the current browser automation environment** because that environment disables WebGL contexts; the playable file therefore still requires a visual playtest on a normal GPU-equipped browser.

### Security boundary

The VNN screen never contacts `news.vitra.ams` unless the visitor elects to load it, and it uses an opaque-origin sandboxed iframe. Portals never silently export visit history, and explicit confirmation is required to cross to another website. If the VNN server rejects iframe embedding, use its standalone link. These are prototype safeguards, not a promise of security against malicious cross-site content.

## v0.6.1 focused patch (from the original v0.6 renderer)

- Reversed the Correspondents' Den furniture and repositioned its VNN screen and modest lectern toward the throne; the chair remains a single externally loaded 3D CAD design, instanced 18 times.
- Added a true corridor crossroads at Z=-43, a left-hand noninteractive dungeon-door sprite, and a right-hand empty treasury alcove with a low chest pedestal and three empty display coves. No later v0.8 props or 2D fallback renderer are imported.
- Kept the existing CAD fountain file, imported at 1.33× scale. Shrunk the hedges and bushes to about two-thirds of their prior size; rose bushes are generated with deterministic pipewire stems, two leaf shapes, and three bud densities.
- Increased the outer forest's canopy silhouettes and added a second tree layer. Added brighter fixed Polaris and seven-star Big Dipper guides, anchored to world north (negative Z).
- Replaced garden sidewalk geometry with an irregular narrow circular dirt path and east-side footpath. GPU material ID 9 = groomed grass, ID 10 = dirt footpath, ID 11 = ungroomed grass; garden columns remain shader ID 2 fantasy marble.
- Published only two inbound portal tags (see `PORTAL_ARRIVALS.md`). Portal crossings use a small CSS wiggle, then an immediate camera cut to a fixed arrival node facing away from the portal.
- Kept all original Portal, Channel, Screen, GLB loading and external STEP source files intact.
