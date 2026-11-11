# Witch's Hole — Webspace III / The Breathing Underdark

**Status:** playable, standalone original WebGL2 prototype. No external JS, image textures, fonts, APIs, analytics, or paid services. Designed for desktop and modern mobile browsers with WebGL2. All visual art is newly generated geometry/procedural shading; the shared portal machinery is copied, unchanged, from the attached Webspace v0.6.1.2.

## Start

- For **the simplest preview**, open `Witchs_Hole.html` at the top level of the package. Everything needed to play Witch's Hole is embedded in that one HTML file; no local server or internet is required.
- For **development**, open `witchs_hole/index.html`, which references `witchs_hole/witchs-hole.js` and the portable `webspace-portal.js` as separate source files. A local server is optional.
- The ZIP also includes `webspace_v6_1_2/`, the attached original project, unchanged. The Cairn's **sole return portal** goes to its published `chuzhoy-north` entry when the folder structure stays intact.

The website uses a fixed inbound tag `?ws_v=1&ws_entry=witches-hole-ridge` (unrecognized/duplicated tags are ignored). It cannot be sent arbitrary XYZ, pitch, inventory, URL, or history from an incoming link.

## Ten sites

1. Arrival Cairn — portal, upper ridge, survey stones
2. Overlook — see cold air flowing over the switchbacks
3. Cold Cleft — toggled cold-air outflow
4. Root Bridge — toggle a root screen that modifies vortex motion
5. Witch's Basin — natural vortex and pooling fog
6. Whispering Brook — compare clear-water animation with fog density advection
7. Huckleberry Hut — crooked building, lantern, five opt-in safe internet exercises
8. Stone Siphon — fog passes a gap impassable to people
9. Old Weir — toggle sluice, changes both water-band animation and fog density/source
10. Outflow — downstream physical consequence, then footpath routes back

S-shaped stream, switchback trails and *real node elevations* are represented as a linked 3D waypoint graph. The map matches the same X/Z coordinates used to build the scene. The player's camera follows a finite eased arc between stable landing positions, with a gentle vertical step on climbs. No accidental falls or unavoidable dead ends.

## Controls

- Drag/touch-drag to turn and pitch the camera.
- Tap an illuminated route marker to travel; its label displays elevation difference. Use **Traverse** to follow the most closely facing linked route, or select the target with a click first.
- **Left/right** arrows turn, **down** returns toward the previous site. **Up/W** advances, **M** map, **F** survey.
- **Survey** illuminates verified traversable nodes even when terrain or fog reduces visual clarity. The fog itself is an honest *fluid-flow indicator*, not a safe walking indicator.
- Open **Map** to inspect the complete 10-site layout and travel to directly adjacent landings.
- **Sound on** opts into synthesized low-pass moving wind for fog and a distinct mid/high-band bubbling-water layer for the brook. The amplitudes vary with fog density and distance to the water; audio remains off by default for browser autoplay compliance.
- At the Cleft, Bridge, Basin and Weir, use **Investigate** to alter the field and watch a developing response.
- At the Hut, use **Read the desk** to explore simulated whitehat lessons. All domains end in `.example`; no live remote pages or data transmission.

## Fluid approximation and effects

A coarse Eulerian **66 × 88** field evolves at roughly 15 Hz, with semi-Lagrangian backward advection, neighbor diffusion, creek/crevice/basin source terms, slow losses and wind derived from topography. Branch/root/sluice interactions modify an underlying analytic flow field. This is *Navier–Stokes-inspired* velocity/density transport, not a full incompressible 3D pressure projection or physically complete weather model.

Density uploads as a 66 × 88 RGBA texture; three low-cost terrain-following fog sheets share it. Wisps are synthesized in the fragment shader using two spatial scales of noise. The independently animated brook is a mathematical mesh following the S-curve with distinct wave/foam material and independent Web Audio synthesis. Neither fluid requires particle meshes, video textures, audio files or network transfers. Mobile rendering is capped to around 30 FPS with a modest device pixel ratio; desktop around 40 FPS in this prototype.

## Art direction

Original crooked hemlocks, asymmetrical conifer silhouettes, tilted bark/root networks, button-like trunk knots, stray golden stitches on trails, antiquated instruments, lopsided miniature hut, glowing amber window, rocky crevices and a cold silver/teal fog palette. Storybook uncanny atmosphere inspired by *Coraline*, without copying any film art, characters, or textures. All are analytically generated on load; no raster source artwork.

## Whitehat safety content

Five fictional/offline scenarios: phishing, metadata and privacy, spoofed destinations, high-pressure social contact, and the distinction between anonymity, confidentiality and trusted operators. No live phishing links, credential forms, actual onion destinations, cookies, visitor logs, tracking or outbound fetches. Untrusted fictional documents receive no authority over movement or site controls. The Garden return portal requires explicit confirmation and transmits only the known public arrival tag.

## QA and limitations

- JavaScript syntax checked with Node 22.
- WebGL2 scene, fog and shared portal shaders successfully compiled and linked against Mesa's surfaceless EGL / OpenGL ES 3 context.
- Playwright exercised startup UI, map with exactly ten nodes, navigation, journal and help using a mocked GL renderer; no JS exceptions.
- **Visual rendering exercised** in software-backed WebGL2 inside Chromium under a virtual display; the entrance, overlook, hut and map were inspected and successful. Performance, touch feel, and sound still need a final hands-on pass on a physical phone.
- Topography and locations are fictional, based on the earlier conceptual level plan, **not a safe walking route or a topographic survey of the actual Witch's Hole**. The fog's persistent behavior is art-directed; it is not claimed as a verified local meteorological observation.

## Design/ownership

Only the shared `webspace-portal.js` is carried forward from the attached work; all Witch's Hole source/geometry/shaders/SFX and world content are new. Older Garden and Fortress files are unchanged for easy rollback.
