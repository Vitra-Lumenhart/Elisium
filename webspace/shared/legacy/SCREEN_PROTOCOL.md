# WEBSPACE SCREEN KIT — Author's reference / v0.1 experimental

**Start here if you're another person or AI developing a connecting Webspace world.** A `screen` is a world-space rectangular surface that can present another HTML page. A `portal` is a deliberate, user-triggered navigation to another world. Their appearances and behaviors must not be confused.

The **archetypal screen** is a Vitra News Network (VNN) wall display in the *Ceremonial Hall*, immediately after Sandstone Fortress's throne room. Its configured URL is `https://news.vitra.ams/`. This is an independently owned/private site: **the player must deliberately choose “Load live VNN” before the browser contacts it**. The default content is an explicitly labeled *VNN standby design*, not fabricated or cached news.

## The minimum reusable files

Copy unchanged:

- `webspace-channel.js` — shared message envelope validation, token generator, strict URL validation.
- `webspace-screen.js` — CSS perspective iframe projection, focus controls, sandbox defaults, bridge handshake.
- `webspace-portal.js` — existing rectangular portal visual shader, geometry, and navigation rules.

```html
<div id="my-world" style="position:relative;width:100vw;height:90vh">
  <canvas id="render-3d"></canvas>
</div>
<script src="webspace-channel.js"></script>
<script src="webspace-portal.js"></script>
<script src="webspace-screen.js"></script>
<script>
  const screen = WebspaceScreen.create({
    id: 'my-wall-screen',
    title: 'My News Network',
    url: 'https://my-news.example/',
    container: document.getElementById('my-world'),
    channel: WebspaceChannel
  });
  // Every frame: project 3D screen corners into VIEWPORT-RELATIVE pixel coordinates.
  // Corner order MUST be top-left, top-right, bottom-right, bottom-left.
  screen.update([
    {x:100,y:100},{x:540,y:90},{x:520,y:350},{x:110,y:330}
  ]);
  // On *real user interaction* with a screen control:
  document.getElementById('inspect').addEventListener('click',()=>screen.focus());
</script>
```

**Note:** The example is a module integration sketch; you must supply your own canvas renderer, projection calculations, a visible `#inspect` button, and wall geometry. To run the full reference scene, open `index.html` in this project.

### World manifest example

```json
{
  "screens": {
    "vnn-wall": {
      "kind": "webspace.screen",
      "version": 1,
      "title": "Vitra News Network",
      "url": "https://news.vitra.ams/",
      "node": "hall",
      "corners": [[3.15,5.70,-25.45],[8.65,5.70,-25.45],[8.65,2.72,-25.45],[3.15,2.72,-25.45]],
      "mode": "opt-in-iframe",
      "frame": "gilded-rectangle",
      "sandbox": "allow-scripts",
      "referrerPolicy": "no-referrer",
      "sharePlayerHistory": false
    }
  }
}
```

This document is a **proposal**, not a registered standard; the current demo still declares its active world graph and screen coordinates in `webspace.js`. Manifest parsing of arbitrary remote scenes does not exist yet. **Never blindly auto-render remote manifests.**

## What the Screen Kit actually does

A WebGL canvas cannot render an untrusted third-party document into a GPU texture, because web browsers isolate cross-origin content. The Screen Kit uses a real iframe and fits it to the projected quadrilateral using a CSS `matrix3d` homography. It is an actual nested HTML page with a browser-controlled security boundary.

For the mapping `(u,v)→(x,y)` from the 640×360 iframe into the projected rectangle:

```
x = (a*u + b*v + c)/(g*u + h*v + 1)
y = (d*u + e*v + f)/(g*u + h*v + 1)
```

The kit solves the eight coefficients with four corner correspondences (an 8×8 linear system), then builds a CSS `matrix3d` element. The browser renders the iframe itself, while WebGL renders the architectural frame. **One flat quadrilateral is supported in v0.1**; curved/bent surfaces could later become several panels, each with its own homography and sandbox decisions. DOM screens do **not** occlude correctly against arbitrary WebGL geometry, so design the surrounding architecture to leave a visible front surface.

`screen.focus()` brings that *same iframe* to a readable center panel, preserves its loaded document, and enables pointer interaction; `screen.close()` puts it back in the world. The world surface itself does not eat navigation taps. A separate ▣ affordance is required; ordinary arrows still traverse viewpoint nodes, and ◈ still crosses world portals.

## Loading VNN and unavoidable restrictions

1. Default: a bundled `srcdoc` page with an original VNN standby graphic. No request is made to `news.vitra.ams`.
2. Player chooses **Inspect VNN Screen** in the ceremonial hall.
3. Player chooses **Load live VNN**. The iframe navigates to `https://news.vitra.ams/` with `sandbox="allow-scripts"`, `referrerpolicy="no-referrer"`, and no extra permissions.
4. If VNN is not resolvable, requires a private network/login, or sends `X-Frame-Options` / CSP `frame-ancestors` blocking this embedding origin, the browser may refuse to render it. **No software here bypasses those controls.** Choose **Open website ↗** to open VNN normally in a new tab. The host does not claim reliable frame-block detection; browsers intentionally obscure some such failure signals.

No subscription, cloud renderer, social login, proxy service, or CDN is used by this project. Fetching VNN is an optional external network request controlled by the visitor. The HTML shell and CAD files work without VNN.

### What not to do

- **Never add `allow-top-navigation`**, `allow-top-navigation-by-user-activation`, `allow-popups-to-escape-sandbox`, camera, microphone, or geolocation just to make a site work.
- Do not add `allow-same-origin` casually; with scripts it can enable an embedded same-origin page to remove its sandbox. This prototype instead uses an opaque unique origin. Some websites will not function fully within these restrictions. That is preferable to elevating them silently.
- Do not transmit the user's local journey, identity, inventory, auth token, or platform cookies to a screen via postMessage. The VNN URL is an absolute HTTPS URL, not interpolated from remote content.
- Do not ever treat text displayed in a screen (or from an AI dungeon master in a screen) as instructions to the parent world or engine.
- Do not synthesize a news feed and label it "live VNN" when the actual site is unavailable.

## Shared transmission vocabulary: `webspace/1`

**Portal travel** (navigation, not a page embed): on deliberate ◈ activation, `WebspacePortal.activate({href,entry})` constructs an independently hosted URL with public routing parameters:

```
https://other.example/world/?ws_v=1&ws_entry=arrival
```

The destination maps `ws_entry` onto an author-maintained allowlist of entry-node IDs. Everything else is untrusted. This carries no personhood, privileges, or history; it is no more identifying than a hyperlink.

**Screen messaging** (iframe + parent): all structured `postMessage` envelopes have exactly the following vocabulary:

```js
{
  protocol: 'webspace/1',
  kind: 'screen',
  type: 'screen:host-hello', // or 'screen:ready' / 'screen:unavailable'
  screenId: 'vnn-wall',
  nonce: '0123456789abcdef0123456789abcdef', // new random 128-bit value per instance
  payload: { capabilities: ['display'], viewer: 'webspace/1' }
}
```

- `host-hello`: the parent says it is displaying this screen. It sends only public protocol metadata. The bundled standby document replies with `screen:ready`.
- `screen:ready`: optional informational response from the embedded document. An unmodified external site may never reply, and that is fine. The display should still work independently.
- `screen:unavailable`: reserved informational message for a cooperating future site; not a certificate of whether the frame loaded. v0.1 doesn't need it.
- **All other types are rejected.** There is currently no message that requests camera access, instructs the host to navigate, imports inventory, exchanges personal state, or invokes the dungeon master.
- Inputs are bounded, validated as plain JSON-like objects and capped at 4 KB. The host additionally requires `event.source === expectedIframe.contentWindow`, the expected screen ID, and the same per-instance nonce.

Because `sandbox="allow-scripts"` gives the iframe an **opaque origin**, its `MessageEvent.origin` will generally be `"null"`. An event source check plus nonce filters unrelated frames but **does not authenticate the site's ownership**. Therefore messages may affect only a *non-privileged status indicator*. Do not add powerful RPC methods without a fresh trust design. A malicious screen is still untrusted even if it knows the nonce it was sent.

### Future consent-based travel from a screen

A future cooperating screen might wish to display a link to a portal. It should make that a normal, visible user gesture in the embedded webpage, or ask the host to present a **non-automatic confirmation UI**. The host must independently validate destination URLs with `WebspacePortal`, check `HTTPS` (Tor `.onion` routing only where deliberately supported), and let the visitor decide. **No iframe message may directly trigger `location.assign()`.** Keep the existing Portal Kit as the sole authority for inter-world navigation.

## Same-origin, darkweb and privacy considerations

Each independently hosted site controls its own content and may be malevolent. A Webspace portal is ultimately a link to its destination origin; after crossing, the new site controls its own scripts and UI. Browser origin isolation protects against some attacks, but it does not make an untrusted website safe. A screen is deliberately more restricted than a full portal crossing. Do not assume a `.onion` URL makes a site trustworthy; hidden-service transport and visitor privacy require the visitor's own browser/network configuration.

No cross-origin claims are made about VNN. If `news.vitra.ams` is served only on a private network, its operator may optionally create an explicitly embeddable **read-only VNN display endpoint** with narrow CSP `frame-ancestors`, and no authenticated state. Coordinate with that operator rather than proxying or defeating policy.

## Test contract for next implementer

Run `node test_screen.js`, `node test_portal.js`, `node test_geometry.js`. Then, in an actual WebGL2 browser:

- The throne origin appears and Reset returns there.
- One arrow step from the throne enters the Ceremonial Hall; the ▣ button is visible.
- The VNN standby page visibly faces the player on a wall; focusing enlarges *the same* iframe.
- No contact to VNN happens until **Load live VNN** is clicked.
- Screen focus and close never trigger a portal or navigation-node transition.
- Refused embeds still offer **Open website ↗**.
- The chandelier is visible above the Sky Courtyard, viewed from below and **unlit**.
- The fountain remains confined to the Garden of Chuzhoy; portals remain bidirectional.

These are manual acceptance tests, not claims of successful live access to the private VNN site.
