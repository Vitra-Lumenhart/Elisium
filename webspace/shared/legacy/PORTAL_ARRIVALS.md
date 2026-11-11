# Webspace named portal entrances — v0.6.1

This extension sits on top of the original, unchanged `webspace-portal.js` module. It defines how a world **receives** travelers. Copy its principles into new worlds instead of accepting arbitrary camera coordinates.

## Invariant

**A URL may select only an explicitly published arrival tag. It may never supply an arbitrary XYZ coordinate, yaw, pitch, inventory, or history.** An arrival tag is just a route, not a claim of identity or a proof that the traveler came from a particular website.

This prototype publishes exactly two inbound tags:

| `ws_entry` | World | Fixed viewpoint | Heading |
|---|---|---|---|
| `fortress-gate` | Sandstone Fortress | `portal` at `[0, 1.72, -75]` | `Math.PI` — looks back into the fortress, away from its portal |
| `chuzhoy-north` | Garden of Chuzhoy | `arrival` at `[14, 1.72, -27]` | `Math.PI` — looks south into the garden, away from its northern portal |

Regular opening of the Webspace, without a valid published entry tag, starts at the throne-room origin `[0, 1.72, 0]`, facing down the hall (yaw zero). The browser's locally retained visit history does **not** override the initial spawn.

## Remote arrival URL

Example from a different author's website:

```text
https://example.com/webspace/?ws_v=1&ws_entry=chuzhoy-north
```

The destination validates with the existing Portal Kit:

```js
const ENTRY_POINTS = Object.freeze({
  'fortress-gate': {world:'fortress',node:'portal',yaw:Math.PI},
  'chuzhoy-north': {world:'garden',node:'arrival',yaw:Math.PI}
});

const tag=WebspacePortal.parseArrival(location.search, {
  validEntries:Object.keys(ENTRY_POINTS)
});
const arrival=tag?ENTRY_POINTS[tag]:DEFAULT_THRONE_ORIGIN;
```

The destination **owns** `ENTRY_POINTS` and cannot be talked into inventing a new camera location by an incoming URL. Duplicate, malformed, or unknown tags are discarded by `parseArrival`.

For outbound remote portals, author a descriptor with a published destination tag:

```js
{
  href:'https://another-author.example/world/',
  entry:'their-published-tag'
}
```

The unchanged Portal Kit will produce `ws_v=1&ws_entry=their-published-tag`, ask for cross-origin confirmation, and transmit no history. For same-page local portals, the author maps a local descriptor `{world:'garden',node:'arrival',entryTag:'chuzhoy-north'}` to the **same** allowlist.

## Transition behavior

When a traveler activates a local portal, the current frame wiggles using only CSS transforms (no geometry or camera movement). After ~440 ms the host **cuts directly** to the destination's fixed arrival viewpoint and heading. This avoids the old camera flight through `[0,0]`. The visual wiggle is disabled when `prefers-reduced-motion` is set; the cut still happens.

## Network, cookies and identity

Do not identify the sending world from `Referer`, a query string or self-asserted metadata; none is proof. Do not use cross-origin cookies as portal tickets. Cookies are origin-scoped and often blocked in third-party contexts. If a future federation needs real provenance, issue a short-lived destination-bound signed handoff with explicit visitor consent and verify it server-side. **That is a separate identity feature, not part of this public routing protocol.**

A site may choose to hide certain authored entrances behind authentication, but it must not treat merely knowing a public arrival tag as authorization to unlock privileged content. Incoming scripts, remote manifests and AI-authored descriptions remain untrusted.

## Test contract

- Opening without a valid tag starts at the throne origin.
- `?ws_v=1&ws_entry=chuzhoy-north` resolves to the garden's dedicated northern portal landing, regardless of previous local position.
- `?ws_v=1&ws_entry=fortress-gate` resolves to the fortress portal antechamber, oriented away from the gate.
- A request such as `?ws_v=1&ws_entry=treasury`, `?x=999&z=-42`, or duplicated `ws_entry` parameters cannot select a spawn.
- No portal may export or import the visit log implicitly.

On a portal arrival, pressing Up advances into the destination (the gate corridor or northern loggia). On an ordinary approach, pressing Up enters the portal. The diamond interaction button always remains available.

## Version 2 (Gerudo / Gringotts)

The registry now publishes two *additional* inbound tags. The existing two are unchanged.

| `ws_entry` | World | Fixed viewpoint | Heading |
|---|---|---|---|
| `gringotts-gerudo` | Gringotts · Gerudo Branch | `arrival` at `[0,1.72,31]` | `0` — into the bank, portal behind |
| `fortress-bank-rear` | Sandstone Fortress | `bank_gate` at `[0,1.72,30]` | `0` — into the fortress, portal behind |

The fortress `throne` is linked to the authored `royal_rear` node (behind the throne) and then to the `bank_gate`. The shared portal kit is unchanged. These entrances are public routes and convey no identity or funds.
