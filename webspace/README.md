# Webspace Kilns v7 — static deployment mirror in Elisium

**Public entry:** [Enter the walkable Kilns](https://vitra-lumenhart.github.io/Elisium/webspace/worlds/elisium/kilns/index.html)

**Canonical source, not this mirror:** [Vitra-Lumenhart/Webspace](https://github.com/Vitra-Lumenhart/Webspace), main commit `17fe45e2423a04b9de447ec1079bf5a3d6136a21`. [Immutable v7 release](https://github.com/Vitra-Lumenhart/Webspace/releases/tag/webspace/v0007). The cross-repository deployment exists only because Elisium GitHub Pages was already active while the Webspace site awaited first-time GitHub Pages activation.

The mirror contains exactly the required runtime: `worlds/elisium/kilns/` including H01–H24 declarative descriptions, `worlds/elisium/threshold.js`, `assets/kilns/OBJECTS.json` and original 24 low-poly GLB proxies, Poly Haven source-art acquisition notes, and the unmodified MIT Three.js r168 ES modules, loaders and license under `assets/vendor/three/`. The live original CC0 Poly Haven models load on entering their rooms. This is an **in-world model**, not v6's isolated study canvas; a bespoke fantasy behavior accompanies each historical donor.

Nine connected 10m ground-floor cells and an attic form ten navigable areas. The 24 H roles retain their original inquiries and child-only fictional clock. The illustrated v6 world remains at `worlds/elisium/kilns/illustrated.html`. The return link reaches the pre-existing Elisium root site through `worlds/elisium/index.html`, a clearly marked redirect bridge.

**Provenance:** The mirrored executable and art blobs are recreated in the Elisium Git object store with the same SHA-1 identifiers as the canonical Webspace source. Do not hand-edit or treat this as a second authoritative project. Future source updates should explicitly synchronize the mirror after testing and document the changed source commit. Source rights: Three.js MIT, Poly Haven original donor models CC0; Webspace authored narrative has its own rights. No real identity, passwords, private session journal or banking details are transmitted by this static mirror.

**QA:** `tools/test_kilns_house3d.mjs` is the preserved Chromium physical-world acceptance test, running the mirror with a local HTTP server. Production readiness additionally requires the existing Elisium Pages build to finish successfully and the live HTTP URL to respond. The public server remains static and does not support unreviewed persistent visitors' state.
