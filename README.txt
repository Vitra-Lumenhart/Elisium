ELISIUM · The Names We Give
Webspace 0.1.0 · October 25, 2026

START HERE
  Open index.html in a browser (playable multi-file project) or visit the
  GitHub Pages site when deployed. To create a single-file offline edition,
  run python build_preview.py inside the project directory.

CONTROLS
  Arrow Up / W    Traverse the graph neighbor closest to your gaze.
  Arrow Down / S  Return to the preceding node, if adjacent.
  Arrow Left / A  Turn left.
  Arrow Right / D Turn right.
  Mouse / touch   Drag the world to change your gaze.
  E / Space       Interact with an approachable object.
  M               View clickable graph.
  Click           Select a glowing, connected viewpoint.

FIRST WALK
  The C. S. Lewis and Inklings dedication screen faces you at the start.
  Behind you is the sole exit portal; approaching and using it attempts to
  close the tab and, where browser restrictions prevent that, ends the world
  within the tab.
  Advance to A Writer's Lantern, then The Unsettled Meadow. Take either
  branch to meet Aslan or Tash. Interact with both and inspect the differing
  sprite-state behaviors. Routes have different fictional minute costs.

WHAT THIS BUILD DEMONSTRATES
  * Original graph-native traversal: Cartesian camera, discrete nodes, and
    weighted edges; each crossing locks traversal as the world's clock
    advances concurrently with the character's visible movement.
  * TWO sprite families; each runtime sprite uses exactly ONE transparent
    horizontal three-panel image, cropped via WebGL2 atlas UVs.
  * State logic differs by sprite family:
      Aslan = responsive to questions (insight score).
      Tash  = proximity and skeptical-question state (doubt score).
  * Five Chuzhoy-derived tree families completely rebuilt with tapered stems,
    branch patterns, leaf canopies, ghost opacity, wind, and grayscale light.
  * Three fixed stages for every family: sapling, juvenile, mature.
  * Rebuilt hedge sections, rose thickets, leaves, ferns, shrub rings, roots,
    and low-poly faceted field.
  * A real in-world HTML dedication with two functional Wikipedia links.
  * A local-only exit threshold; no remote portal / world identity handoff.
  * HTML preview retains a projected Canvas2D compatibility scene when a
    preview browser disables WebGL; WebGL2 is the primary renderer.

PROJECT FILES
  index.html                      Editable HTML shell and screen markup.
  style.css                       Scene UI and in-world screen styling.
  engine.js                       Custom WebGL2 + graph-navigation engine.
  assets/aslan_triptych.png       Single-image, 3-state sprite atlas.
  assets/tash_triptych.png        Single-image, 3-state sprite atlas.
  assets/*_triptych.svg          Fully editable illustration sources.
  make_sprites.py                 Regenerate sprite PNGs from editable SVGs.
  build_preview.py                Rebuild single-file HTML preview.
  world_manifest.json             Machine-readable topology and scene metadata.
  TECH_MANUAL.html                Detailed engine and art design reference.
  COMPATIBILITY.md                Relationship to Chuzhoy, security notes.
  tests/test_manifest.mjs         Node-based structure and graph tests.

The source is a separate work in the Chuzhoy family, with its own traversal
engine and no dependency on Chuzhoy's source files or CAD assets.

All dialogue is original fanfictional interpretation, not C. S. Lewis text.
The contested formula is presented as Shift's deceptive assertion, not
as the author's settled teaching. This is an independent, noncommercial
literary experiment with no affiliation to the Lewis estate.

PUBLIC WEBSPACE ADDRESS (upon publication)
  Source: https://github.com/Vitra-Lumenhart/Elisium
  Game:   https://vitra-lumenhart.github.io/Elisium/
  Both require Vitra to create the repository and enable GitHub Pages.
