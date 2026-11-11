# Gringotts — Gerudo Branch (Version 2)

## What works now

- New physical rear arcade from the existing fortress throne to the Gringotts portal, with a two-way named-entry contract and unchanged original fortress→garden portal.
- New original WebGL2 scene using shared engine, with a self-contained Canvas 2D fallback for restricted browser preview, procedural bank floor/arches, repeated goblin teller sculptures, brass fixtures, mail gallery, calendar chamber, ledger exhibition, safes and a strongroom.
- Travel ribbon exposing **all** of the current node's linked destinations irrespective of camera orientation. World-space arrows remain decorative/clickable secondary affordances.
- Local-only diegetic paper document panel (`webspace-bank-desk.js`) for **fictional** identity contract, ledger simulator, browsable animated-feeling calendar and direct official Proton links.

## Explicit not-implemented boundary

This is an artwork and interaction prototype. It has **no** real authentication, anonymity assurance, cryptocurrency ledger, asset custody, payment execution, password storage, private server, data vault, Proton OAuth/API integration, Proton calendar sync, or end-to-end encryption. The mock guest alias, Auric and Crescent amounts exist **only in JavaScript memory** and disappear on refresh. Never enter credentials or secrets in the branch.

Proton is a separate company. The Gringotts work is unofficial, not affiliated with or endorsed by Proton. For Mail, Calendar, Drive, Docs, Sheets, Meet, Pass, Wallet, VPN and Lumo, the buttons launch official Proton web apps *in a new tab* by explicit user gesture. No service is embedded in an iframe (many services prohibit framing, and it would be a confusing credential-origin boundary).

## Proposed future architecture — outside current scope

1. Independent identity/auth gateway: audited cryptographic login (passkeys/WebAuthn or verified third-party OAuth **only if officially supported**). Anonymous use must be distinguished from pseudonymous accounts. No plaintext credential collection in decorative contract forms.
2. Financial service: regulated custodian or user-owned wallet, audited server-side balances, signed nonces, canonical assets and rates, replay resistance, transaction previews/receipts. Never reuse the current client-side pretend balance as monetary state.
3. Private records: client-side authenticated encryption with documented key custody, server-backed encrypted storage, recovery/access policies, threat model and review.
4. Proton integrations: official SDKs/APIs, scopes and consent once available. Prefer opening first-party services on their own origins over attempted credential relay or iframe wrapping. Do not ask players for Proton account passwords.
5. Progressive art overlays: turn letters, calendars and ledger state into optional diegetic screens without weakening the above security boundaries.

## Build / snapshot discipline

Keep active filenames timeless: `index.html`, `webspace.js`, `webspace-bank-desk.js`, etc. Snapshots are immutable integer-version archives in `webspace_history/version_0001.zip` and `version_0002.zip`. `webspace_preview.html` is the standalone original-start preview, `webspace_bank_preview.html` is the direct bank-start preview, and `webspace_current.zip` the latest complete source. Each future revision must first snapshot the current complete source as the next integer version, then modify the new working copy.

`build_preview.py` assembles the standalone file with inline scripts and CAD mesh byte arrays. The distributed `index.html` keeps the original separate files for development.
