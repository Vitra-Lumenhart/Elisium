# Webspace invariants — Portals, Screens and Gringotts identity

**Status:** design contract, NOT proof of complete runtime enforcement. Audited against `shared/legacy/PORTAL_PROTOCOL.md`, `PORTAL_ARRIVALS.md`, `SCREEN_PROTOCOL.md`, `webspace-portal.js` and `webspace-screen.js`, plus the v5 federation docs.

## P-001: The ordinary portal has one face and one behavior

**Garden of Chuzhoy is canonical.** Any portal not explicitly registered as custom must present the same Minecraft-adjacent rectangular portal kit used by Chuzhoy: paired amethyst-colored stanchions, gilt corner seals/rungs, luminous inky purple/teal interference membrane with layered harmonics/scanlines, and the user-activated ◈ crossing control. Surrounding architecture can vary (pointed arches in Chuzhoy, Persianate arches in fortress) but the actual portal frame, animation meaning, interaction and URL semantics do not.

The existing portable prototype reference is `shared/legacy/webspace-portal.js`, with `shared/legacy/PORTAL_PROTOCOL.md`. Chuzhoy 6.2.5.1 is the newer visual acceptance reference. These sources have not yet been reconciled into one versioned shared renderer. Extract a canonical rendering/behavior module, create a screenshot reference from Chuzhoy on a real GPU, and test all default portals against it. Until then this is an **enforceable contribution policy**, not an achieved runtime guarantee.

**Contract data:** version `webspace.portal/1`; explicit user gesture; public allowlisted `ws_v=1&ws_entry=...` only; destination resolves a fixed published arrival tag to node and facing; unknown/malformed/duplicate tags ignored; no arbitrary coordinates, cookies, passwords, account state or silent visit-history export; cross-origin travel visibly confirmed; no automatic portal from a screen. On local travel use the established brief wiggle then direct cut, with reduced-motion accommodation. Portal visuals and travel are separate responsibilities.

**Never copy the shader by hand into six diverging branches.** A future shared renderer should accept world placement data while owning the common visual/behavioral recipe. Cross-engine adapters may change GL/WebGL plumbing, but a visual + event parity test must approve the result.

## P-002: Custom portals are explicit exceptions, not unreviewed divergence

A world may include an authored nonstandard threshold only if it has a durable ID, source owner, scope, player meaning, entry contract, supporting tests and a named exemption from P-001. The Witch's Well is a design example; its particular implementation and location must be verified in the relevant source before a manifest claims it is active. Proposed misleading thresholds (for instance in Witch's Hole) can surprise a CHARACTER without falsifying the host's security, disclosure or credential contract.

Suggested future manifest fragment — illustrative, not currently parsed by the runtime:

~~~json
{
  "portal_id": "PORTAL/WITCHS-WELL",
  "kind": "custom",
  "parent_world": "to_be_verified",
  "exception_to": "P-001/visual",
  "interaction_contract": "webspace.portal/1",
  "status": "design_candidate",
  "review_required": true
}
~~~

The exception must make it clear whether visual parity, activation rules, or destination behavior differs. Any exception to a privacy/security rule needs a separate approved threat model; the fantasy right to deceive the player is not permission to deceive the browser operator.

## S-001: Screens do not become portals

The default screen is a world-space rectangular HTML surface and a deliberate ▣ inspection control. The reference implementation `shared/legacy/webspace-screen.js` projects a sandboxed iframe to a quadrilateral via CSS `matrix3d`; `webspace-channel.js` restricts informational `postMessage` vocabulary. A screen may show a remote site only by opt-in, can fail from CSP/X-Frame-Options, and must preserve open-in-new-tab fallback. Never request new iframe privileges casually to make a screen work.

The Vitra News Network screen in the Ceremonial Hall is the historical model; the title VNN standby MUST NOT imply that a live network feed loaded. A screen cannot silently trigger a world transition, send visitor history, obtain private identity, acquire camera/microphone or become instructions for the host AI. The older documented `webspace/1` messages are low-authority status envelopes, not authentication.

## I-001: Pseudonymous identity and reputation are separate from navigation

Gringotts is the appropriate experimental home for a future user-held private identifier, reputation controls, signed consent and encrypted storage. **Current Gringotts UI is entirely fictional and has no real banking, vault custody or identity infrastructure.** Before an implementation can claim 'anonymous to Vitra' it must show that servers cannot read specified secrets and identify what metadata (IP addresses, timing, network logs, account links and device information) can still be observed. Zero-knowledge design and end-to-end encryption can reduce retained plaintext but do not create legal immunity; a valid warrant may still reach data or keys held by a provider, endpoint or user.

Separate:
- `public alias` and opt-in reputation from `private identity`;
- locally held secrets from server-held data;
- game credits from regulated financial assets or bank accounts;
- pseudonymous credentials from proof of personhood or legal identity;
- human-verifiable trust from automation scores or opaque rankings;
- deletion/access/export requests from immutable public Git history.

No real credentials, money, private correspondence or authentic bank data in a GitHub Pages prototype. Research legal obligations before any custody, real payment, ID or reputation deployment.

## T-001: A portal's promise is a compatibility contract, not metaphysical immutability

Every world may innovate freely internally, but must declare what comes out at its threshold. Every contract has a published version and a migration path. Security updates can change behavior with documented compatibility and justified consent; 'immutable' does not mean preserving a vulnerability for a thousand revisions.

## Acceptance work still missing

- Reconcile modern Chuzhoy 6.2.5.1 with the existing older Portal Kit.
- Inventory actual portals by level and distinguish ordinary, custom and narrative thresholds.
- Build a shared portal adapter and consistent GPU render snapshots, including Canvas fallback tests.
- Validate arrival tags from `WORLD_MANIFEST.json`, custom exceptions and alternate activations.
- Extract and test a shared Screen Kit across the independent engines.
- Conduct independent Gringotts privacy, threat-model, legal and usability reviews before any live personal-data system.

## Machine-readable policy in this RFC

[contracts/portal_registry.json](../contracts/portal_registry.json) declares P-001 as the default for every currently playable top-level world and Purgatorio as reserved/non-playable. It records the Witch's Well candidate as NOT ACTIVE until its exact world, implementation and tests are verified; a child-world doorway is not automatically a default portal. [tests/test_portal_registry.mjs](../tests/test_portal_registry.mjs) checks this declaration against WORLD_MANIFEST. It does **not** yet establish actual GLSL shader identity or screenshot parity. The latter remains FW-PORT-001.
