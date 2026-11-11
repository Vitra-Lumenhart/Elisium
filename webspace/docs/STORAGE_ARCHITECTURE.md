# Webspace storage architecture · 2026-11-10

## Tier 1 — GitHub source of truth (public)

The canonical repository is `Vitra-Lumenhart/Webspace` (branch `main`). Keep JavaScript/HTML/CSS, node graphs, source generators, `world.json`, event contracts, licenses, attribution, small GLB proxies, build scripts, tests, player README, and developer technical manual in Git. Maintain monotonic integer release snapshots; do not rewrite earlier snapshots. Mirror Elisium's independent repo by deliberate synchronization, never silent overwrite.

## Tier 2 — Large immutable art masters

STEP, Blender project originals, high-poly GLBs, source textures, reference libraries, complete Cathedral revisions, v0.6 Kilns external acquisitions and high-resolution renders should use Git LFS (only if budget/hosting and deployment constraints are acceptable) or S3-compatible object storage with hash manifests, license records and versioned provenance. Serve only optimized publishable formats to visitors. Avoid duplicating every 8 MB bundle per tiny edit. DO NOT upload artist files whose redistribution license is unclear. Existing Kilns 24 GLBs are *proxies*, not paid or CC0 artist downloads.

## Tier 3 — Static publication

GitHub Pages can deploy browser-facing HTML/CSS/JS from the public repository. Generated minified standalones and public assets may be deployed from CI, preferably separate from original source; Pages cannot execute a database/backend process. For any `fetch` use same-origin public URLs or configured CORS. Test actual nested base paths and browser storage.

## Tier 4 — Player state and private records

Local scratch: sessionStorage or IndexedDB for opt-in local drafts with explicit clear/export. Shared state: private backend for accounts, visitor notes, letters, shared writings, chat, correspondence, permissions and moderation. Define consent, retention periods, data portability, access control, content limits and deletion before enabling public submission. Never push real personal data, API keys, wallets, auth cookies, Proton credentials or private guestbooks into the public repository. Only bounded publicly intended event IDs can transit world thresholds.

## Tier 5 — AI development operations

Prompts, issue briefs and research evidence are reference material. ChatGPT Project files and Library uploads are not a Git remote and should not be assumed to auto-update. Connected GitHub write permissions allow repository edits in supported chats while the connection exists, not perpetual autonomous operation. CI can test, preview and publish after a human-approved configuration. Consider pull-request previews, protected main, external backups, release tags and branch per substantial change.

## Inventory and unresolved needs

Baseline v4 ZIP: 135 entries including five world entry points, 24 small GLB proxies, Cathedral Rev06 CAD/assets, tests, source and history v3. New v5 adds child Kilns and Purgatorio. Project Library indexing described v4.6 Elisium and v0.6 Kilns bank; raw binary export of the latter was inaccessible in earlier review. Native Elisium 4.6 compact preview is present, not guaranteed to contain the exact latest external artist source. Outstanding: 24 finished external art binaries, genuine placed 3D Kilns interior, full sky event adapter, public guestbook server, license audit, LFS/object-storage decision, and data-retention policy. No evidence the Labyrinth of Purgatorio design exists in currently accessible project sources.
