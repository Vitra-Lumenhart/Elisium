# The Webspace Portal Kit — experimental version 0.1

This file is written for **another person and another AI** authoring an independently hosted, connected world. Copy `webspace-portal.js` intact. The module has **no third-party dependencies**, uses GLSL ES 3.00 for WebGL2, and can be loaded by a regular `<script src="webspace-portal.js"></script>` tag, or imported by Node/CommonJS for automated tests. It is **not yet an internet-standard protocol** and should not be confused with a vetted identity or security platform.

## First principle: a portal is a link, not an identity transfer

A player chooses to enter another world. The source world constructs an outbound URL carrying **only public routing data**: `?ws_v=1&ws_entry=arrival`. The destination must *treat this as untrusted input*. It may use it to choose a predefined viewpoint, but **not** to run code, fetch arbitrary addresses, grant privileges, restore a player identity, or import data. No player history, location trail, cookie, account token, or inventory is transmitted. Browser storage is origin-scoped. This is intentional.

For on-site scene transitions:

```js
WebspacePortal.activate(
  { world: 'garden', node: 'south' },
  { worlds, onLocal: (world, node) => navigateToViewpoint(world, node) }
);
```

For a future cross-site link that the traveler deliberately activates:

```js
button.addEventListener('click', () => {
  WebspacePortal.activate(
    { href: 'https://other-author.example/world/', entry: 'arrival' },
    {
      baseURL: location.href,
      confirmExternal: question => window.confirm(question),
      onExternal: url => window.location.assign(url)
    }
  );
});
```

The target will receive `https://other-author.example/world/?ws_v=1&ws_entry=arrival` (assuming no other query values). A robust receiver uses:

```js
const entry = WebspacePortal.parseArrival(location.search, {
  validEntries: ['arrival', 'fountain', 'balcony']
});
const spawn = entry ?? 'arrival';
```

The valid entry set comes from the **destination world's own authored manifest**, never from the incoming URL. No hidden redirects. `https` is required, except localhost HTTP for development and 56-character v3-shaped `.onion` hostnames over Tor HTTP. Supporting `.onion` does not automatically provide Tor access; the traveler needs a correctly configured browser and should judge the destination independently.

## Reuse the visual language, too

The portal aesthetic has two separately portable pieces:

1. `WebspacePortal.frame(builder, {x,z,width,height})`: the **recognizable rectangular frame**, with paired amethyst-color stanchions, gilt corners, and small rung details. The builder supplies `box` and `ellipsoid` primitives. The function returns the location of the luminous opening.
2. `WebspacePortal.vertexShader`, `.fragmentShader`, `.createMesh(gl,locations,surface)` and `.draw(gl, ...)`: a **two-plane membrane** using five Fourier harmonics, jittered CRT scanlines, shadow wash, grit and purple/teal spectral mixing. It uses no textures and does not raymarch. Another engine can use the same GLSL and geometry interface, or adapt the minimal WebGL2 calls while preserving recognizable appearance.

Rendering and travel are deliberately **separate concerns**. No animation loop automatically navigates. A site must call `activate()` from a clear user action. A specific inter-world marker uses the ◈ icon; normal viewpoint links use arrows. Do not conflate the two.

### Future rule for a multi-author Darkweb

Treat remote manifests, narratives, user-made objects, and AI dungeon-master text as **untrusted content**. Nothing from another world gets to change the traveler's account permissions, send the journey log elsewhere, or become an instruction to the host AI. An AI may narrate a malicious character or dangerous realm, but that fiction is not permission for actual cross-site actions. A later central identity service should use revocable, short-lived, audience-bound handoffs, requested with explicit consent rather than long-lived tokens in query strings.

## Design notes for illustrators

The rectangle is purposely an unmistakable transition object: an homage to a familiar game grammar, but differentiated by corner seals, an inky purple/teal interference veil, CRT grain, and subdued brass hardware. Garden doorways use **A — two-centered pointed arches**. Fortress passages use **B — four-centered Persianate arches**. Neither changes the portal into an arch-shaped object.

## What has actually been tested

- `node test_portal.js`: local graph resolution, destination validation, no silent cross-origin travel, arrival-input checks, route URL construction, host restrictions, geometry contract and shader constants.
- `node test_geometry.js`: two authored worlds produce finite mesh vertices within a modest geometry budget and both A/B arch openings remain unobstructed.
- Scripts were syntax-checked with Node. Automated live WebGL screenshot verification is not available in this development environment, so test GPU composition and browser-specific shader behavior on a real device before publicly deploying.

**This is a promising prototype, not a security audit.** Any public federation, remote content import or multiplayer identity layer requires a further security review.

## Companion Screen Kit (Webspace 0.5)

The shared `webspace-channel.js` vocabulary lives alongside the Portal Kit. **A portal is deliberate full-world navigation** carrying `ws_v=1&ws_entry=...` URL routing data. **A screen is a sandboxed iframe** that optionally uses `webspace/1` informational `postMessage` envelopes. Neither automatically transfers player history. There is no screen-to-portal automatic navigation RPC; future screens may display user-activated links or present explicitly confirmed travel proposals, but may never auto-trigger navigation.

For the in-world Vitra News Network reference implementation, perspective geometry, and hostile-web-content threat model, see [SCREEN_PROTOCOL.md](SCREEN_PROTOCOL.md). Copy `webspace-channel.js` and `webspace-screen.js` intact alongside the Portal Kit.

## v0.6.1: inbound published entry tags

See [PORTAL_ARRIVALS.md](PORTAL_ARRIVALS.md) for the host-side route allowlist, the direct-visit throne origin, the corrected garden→fortress landing, and the CSS wiggle-and-cut behavior. The underlying Portal Kit API is unchanged; destinations no longer put every arbitrary navigation node in the incoming-URL allowlist.
