# Webspace · six world addresses and one nested indoor world under one root

> **Revision covenant for human and AI collaborators:** Before changing a release, archive the entire old codebase under the next integer revision. In EVERY revision update `README.md` (player experience) and `TECH_MANUAL.html` (developer architecture and tests); preserve timeless active filenames and provide a full-screen HTML preview.

## Version 7 · November 11, 2026 — A House You May Enter

The Kilns inside Elisium is now a **connected first-person 3D Victorian house**, not solely an illustrated room-selection screen. Open the [Kilns 3D world](worlds/elisium/kilns/index.html), move through doors by walking W/A/S/D or arrow keys and dragging to look, examine objects with E or clicking, and ascend the physical spiral staircase to the attic. A ten-space architectural model (nine connected ground-floor rooms and an upstairs attic) is built from original procedural geometry: wainscot, bookcases, patterned floors, coffered ceilings, hearths, windows and a stained-glass oratory. The original nine-room story graph and 24 H-object identities are preserved, and the previous [illustrated house](worlds/elisium/kilns/illustrated.html) remains publicly accessible as a fallback.

The 20 distinct verified original Poly Haven CC0 model sources now become **physical furniture and artifacts positioned on plinths in their story rooms**. They load as the player enters a room, not just in a separate inspection panel. Each of the 24 roles also carries its own original 3D fantasy treatment and visible animation when activated: inscriptions that swap, stained panes, a writing drawer, book leaves, an unsent seal, an astronomical orrery, rain gauge, repeated dialogue chairs, and repaired mullions among others. The original Webspace proxy GLBs and authored decorative sculpture remain when a source model cannot load. The v6 complete fixed [source asset release](https://github.com/Vitra-Lumenhart/Webspace/releases/tag/kilns-polyhaven-1k-2026-11-10) remains available for reproducible offline art work; the 3D house instead requests the latest upstream 1K source metadata on first entering the relevant room.

The player still encounters the inherited C. S. Lewis-oriented hermeneutic inquiries rather than a moral ranking or authoritative sky verdict. The local house clock and observation journal remain child-owned, with no forced sharing with Gringotts or Elisium's sky. No download, login or file upload is needed to visit the public world, although GPU/WebGL, a connection to the pinned Three.js runtime and optional Poly Haven source assets are used. The main Webspace portal and Screen protocols were not changed. [House source and controls](worlds/elisium/kilns/README.md) · [Technical manual](TECH_MANUAL.html).

---

## Version 6 · November 10, 2026 — The objects acquire their own provenance

**New optional Kilns feature:** Select any H01–H24 object within the independently navigable [Kilns child world](worlds/elisium/kilns/index.html). Choose **Load current Poly Haven model** to inspect the real CC0 historical component donor in a live 3D viewer with orbit/zoom and original glTF materials. The browser queries the official Poly Haven API *on each request*, follows the current 1k model's geometry and texture URLs, and displays a Powered by Poly Haven credit. **Use Webspace proxy** offers the original small local GLB without an upstream asset request. Merely looking at art does not write a journal event.

This adds source-art inspection inside the existing **illustrated** room graph; it does not claim that original artist furniture is placed in a physically modeled Victorian house or that fantasy mechanisms are finished. Twenty distinct Poly Haven model sources serve twenty-four object roles. All twenty sources were verified available by GitHub Actions, with model and API cross-origin headers confirmed; Chromium loaded a genuine H07 Brass Goblets artist model and local proxy. A separate GitHub Actions workflow downloaded and hash-verified all original 1k model sets as **one ~42 MB batch archive**, including the source manifest for all twenty-four roles. It is provided as an Actions artifact and, upon release publication, as a single public GitHub Release. **No user uploads or Poly Haven account are necessary** for this original donor set.

The live upstream version can change or disappear and needs internet and WebGL; the one-time batch ZIP is a fixed snapshot. For your own future adaptations, imported STEP/BLEND/GLB artwork still needs explicit source and license provenance. Full scene placement, shader parity with native Garden, and the Kilns → Elisium independent-sky event handler remain forward work. See [live artist-source design](assets/kilns/LIVE_ART_AND_BATCH.md), [asset bank](assets/kilns/index.html), [object manifest](assets/kilns/OBJECTS.json) and [technical manual](TECH_MANUAL.html).

---

## Version 5 · 10 November 2026

The root `index.html` launches a playable Garden immediately with a seven-entry selector. The additional `webspace_standalone_preview.html` is a **single-file** seven-entry preview for ChatGPT; it embeds independent engines and uses Canvas compatibility versions in GPU-restricted panels. For direct launch use the separate entrypoints below. Each has its own canvas/runtime and may be developed independently. In GPU-restricted previews, Chuzhoy displays its older Canvas-compatible Garden and Witch’s Hole displays a simplified Canvas-based survey (including the root puzzle).

| World | Direct page | Engine/source | What the visitor does |
| --- | --- | --- | --- |
| Garden of Chuzhoy | `worlds/chuzhoy/index.html` | Chuzhoy 6.2.5.1 self-contained QA build | Explore the canonical Garden, flora, portal connections and route mechanics |
| Gerudo Fortress | `worlds/fortress/index.html` | Preserved Gringotts-era v3 renderer | Approach the throne and its rear banking portal |
| Gringotts Gerudo Branch | `worlds/gringotts/index.html` | Same code lineage but separate launch / initial node | Visit tellers, paper contracts, calendar, fictional ledger and Proton service gallery |
| Witch's Hole | `worlds/witchs-hole/index.html` | Independent Ravine Cliff v2 engine | Traverse 10 sites, break roots, follow the fog, return to Garden |
| Elisium | `worlds/elisium/index.html` | Independent v4.6 compact playable HTML | Explore the star, the Kilns, Concordance Lens and its independent sky |

**Controls:** Use each world's visible travel and look controls. The compact `◈ WORLDS` button near the bottom right opens a cross-world directory. External transitions use only public named arrival tags, not identity, credits, browsing history or passwords. Worlds do not pretend to share an authentication server.

### The Kilns: twenty-four models

`assets/kilns/index.html` lists all H01–H24 with their names, room locations, behavior, optional Poly Haven candidate links and an **actual low-poly GLB proxy** each, generated for this release. These placeholders are not the original Poly Haven artist assets and are not automatically placed into the Elisium v4.6 interior.

No download is needed **before publishing this package** to GitHub. If you want realistic Poly Haven furnishings, you do need to download the selected models (unique models can serve multiple H objects) or allow an authenticated download workflow with a reachable network. Poly Haven originals have not been fetched into this package. An explicit optional `assets/kilns/acquire_polyhaven.py` script records the acquisition method.

### Release limitations

- These are five valid browser entry points and a shared navigation hub, not yet a single reconciled physics/graphics engine. Chuzhoy 6.2.5.1 and the older Gringotts-era renderer have intentionally not had their different botanical/geometry branches silently merged.
- Gringotts's registration, digital currency, secure storage and Proton service controls are creative demonstration UI, not real banking or private storage. **Never enter real credentials.**
- Elisium 4.6 was recovered as a complete self-contained compact playable HTML, but its separate 8.3 MB source archive and Kilns v0.6 ZIP were indexed in the Library without authorized downloadable backing bytes. They remain separately tracked as upstream sources, NOT dishonestly represented as present here.
- Poly Haven catalog entries are source references. This package contains 24 generated original low-poly proxies, not Poly Haven original binary downloads.
- Cathedral Rev06 is included as independent reusable asset source with STEP, GLB, and stained-glass textures; not installed as a sixth playable world.
- Static GitHub Pages is not a trusted backend. Persistent multiuser identity/private vaults require separate secure architecture.

### Publish

Publish this **root directory**, not its outer ZIP folder, to `Vitra-Lumenhart/Webspace` on `main`. Settings → Pages → deploy from branch `main` → `/(root)`. Expected URL: `https://vitra-lumenhart.github.io/Webspace/`. A successful GitHub commit and Pages deployment must be separately verified before anyone calls the site live.

## Source provenance

Predecessor `history/version_0003.zip` is the complete earlier Gringotts-era source. The Garden native build came from the newest retrievable 6.2.5.1 QA HTML; Witch from the actual v2 Ravine Cliff ZIP; Elisium from v4.6 compact playable HTML. See `TECH_MANUAL.html`, `WORLD_MANIFEST.json`, `assets/kilns/OBJECTS.json` and the source-history integrity test.

### Child world: The Kilns

`worlds/elisium/kilns/index.html` is now a navigable **illustrated indoor room graph** (ten room names, 24 selectable object interpretations, local observation journal and explicit return to parent). The exterior Elisium page exposes an Enter the Kilns threshold. It is NOT yet a furnished 3D space or fully connected to its parent sky. Object proxy GLBs are still in `assets/kilns/proxy/`; the optional v0.6 external Kilns source archive could not be exported from the Library and is not represented as included. The child is independent at URL and runtime level; a bounded `postMessage` can announce observations when hosted, and the parent does not yet apply their effects.

### Labyrinth of Purgatorio

`worlds/purgatorio/` reserves a **non-playable** world with an index page and manifest. No detailed mythology, navigation, or mechanics were present in the accessible source materials, so none have been invented.

### Storage and collaboration

GitHub `Vitra-Lumenhart/Webspace` is the public canonical source. Preserve previous release archives and both manuals. Project ChatGPT files are reference material, not an automatically synchronized bidirectional workspace. Save editable code and manifests in Git; place large artist originals/texture libraries in Git LFS or versioned object storage; write mutable visitor journals to a separate opt-in backend with retention/export/delete controls (do not commit personal journals or credentials). GitHub Pages is static and cannot implement multi-user guestbook persistence alone. See `docs/STORAGE_ARCHITECTURE.md` and `docs/CONTRIBUTOR_ACCESS.md`.


## Architectural RFC (proposed; no runtime migration yet)

The [Threshold Covenant architecture proposal](docs/ARCHITECTURE_RFC.md), [asset publishing workflow](docs/ASSET_PUBLISHING.md), [beginner modding guide](docs/HACK_A_WORLD.md), and [AI/human contributor contract](AGENTS.md) describe a possible next repository organization. They are documentation under review, **not implemented features**. The existing v5 world URLs, HTML previews, engine lines and release behavior remain unchanged. Any accepted restructuring must preserve the complete prior release, refresh this player README and the HTML developer manual together, and supply a browser preview and test evidence.


---

## Revision chronicle — backwards, forwards, and our long hope

This is part of the **Webspace game contract**, not an optional changelog. Every revision records what was truly accomplished **and** what future builders were trying to make possible. Its reader may be the next ChatGPT-Vitra thread, Topgro, a collaborating artist, a skeptical maintainer, a child editing their first HTML, or a stranger a century after the original developers.

Our long hope is a federation of beautiful, dangerous, kind, confusing and learnable places that makes the workings of the browser **inspectable as part of the world**. A flower is a reusable function, a cathedral is geometry with evidence, an in-world Screen is safely bounded HTML, a portal is a recognizably honest contract between independent places, and a narrative choice can teach how contradictory accounts are preserved without being collapsed. Everything transmitted to the visitor should offer a pathway back to comprehensible source. Visitors and their AIs ought to be able to improve the world with ordinary language while keeping other travelers' autonomy and private lives intact.

**Policy:** For every pull request, append one new timestamped entry below with the exact fields Backwards, Forwards, Not yet, Invariant impact and Evidence. Append a paired technical entry with **the same ID and date** inside TECH_MANUAL.html. Update the touched world's README/manual, code comments, issue links and contracts where needed. Preserve previous entries as written: corrections are later errata, never silent rewrites. GitHub CI checks the paired format; code owners and reviewers check whether the prose tells the truth. See [Revision Covenant](docs/REVISION_COVENANT.md), [Portal/Screen contracts](docs/PORTAL_SCREEN_CONTRACT.md), [Contributor instructions](AGENTS.md) and [PR template](.github/PULL_REQUEST_TEMPLATE.md).

<!-- WEBSPACE-LEDGER id="RFC-002" date="2026-11-10" -->
### 2026-11-10 · RFC-002 — Preserve our unfinished intentions as carefully as our code

**Backwards:** The accepted v5 federation has playable Chuzhoy 6.2.5.1, legacy Gerudo Fortress and Gringotts, the Witch's Hole v2 Ravine Cliff engine, and bundled Elisium 4.6, with independent world entrypoints. The Kilns now has a separately navigable **illustrated** child-world and H01–H24 proxies; Purgatorio has an explicitly non-playable reserved doorway. The Garden-centered portal route protocol and the older reusable Portal and Screen Kits have source documentation. Cathedral Rev06 CAD and GLB source has been preserved. On this **unmerged architecture branch**, we have added a proposed revision covenant, contributor template, code ownership, paired-documentation checker and RFCs. These are governance changes, NOT new features in the playable engine.

**Forwards:** Make each world independently editable via Git while preserving a shared language of named arrivals, stable IDs, botanical inheritance, canvas/3D projections, signed provenance, bounded nested-world events and source-linked learning. Make Chuzhoy's rectangular Minecraft-adjacent portal the standard everywhere except declared custom thresholds such as a future Witch's Well exception. Preserve Screens as independent HTML viewing surfaces, never portals. Refine high-soul narrative discovery in Elisium, build a genuine furnished Kilns, and let a first-time teenage modder ask an AI to edit a flower or a story without understanding syntax beforehand. Permit Topgro and multiple future Vitra/human workers to submit separate reviewed branches. Record success by gameplay and source evidence, not merely by attractive written proposals.

**Not yet:** The canonical portal shader and behavior are NOT yet unified across the independent renderers or GPU image-parity tested. Screen Kit integration is not consistent across all levels. Chuzhoy's master flora still needs a clean commons export; the obsidian #notMinecraft portal graffiti needs the bolder visual treatment previously requested. Witch's Hole's Ravine Cliff root puzzle has a v2 engine, but fog sightlines, terrain/elevation and further mysterious or deceptive thresholds require continued playtesting. Elisium's concentric routes, Aslan–Tash directional corridor, Concordance Lens, and 24 Kilns objects remain incompletely unified with the independent sky and fully staged human narratives. Cathedral Rev06 is not a finished roofless cathedral experience in the Garden. Purgatorio's formative mythology and gameplay are not present in the audited sources. The real Poly Haven models were not imported. No production account, private vault, persistent guestbook, anonymous reputation network or financially regulated banking service exists. Browser code, service providers and legal processes prevent any absolute promise of warrant immunity.

**Invariant impact:** This RFC proposes a lasting **review process**, not a silent runtime rewrite: (P-001) default Chuzhoy portal appearance/gesture/public arrival; (S-001) Screen and Portal have distinct authorities; (T-001) nested worlds own clocks and publish bounded events; (A-001) shared flora and art have stable provenance; (I-001) future private identities are separated from navigation and server-operator visibility wherever technically possible; (D-001) every revision tells a backward and forward story in both README and technical manual. Existing accepted v5 world behavior is unchanged. Any future breaking contract needs a versioned RFC, migration and tests.

**Evidence:** [WORLD_MANIFEST.json](WORLD_MANIFEST.json), [TECH_MANUAL.html](TECH_MANUAL.html), [shared portal notes](shared/legacy/PORTAL_PROTOCOL.md), [canonical portal registry](contracts/portal_registry.json), [screen notes](shared/legacy/SCREEN_PROTOCOL.md), [architecture RFC](docs/ARCHITECTURE_RFC.md), [revision checker](tools/check_docs_covenant.mjs), [reconciliation](docs/RECONCILIATION.md). Verification of the proposed checker and ruleset is distinct from real-world GPU tests, source reconciliation and a protected-branch setting; do not claim those have happened because this proposal exists.

#### A living catalogue of hopes (proposed, not shipped)

| Durable ID | What future builders should preserve and attempt |
| --- | --- |
| **FW-PORT-001** | One canonical Chuzhoy portal frame, membrane, activation and arrival contract across default worlds, plus a reviewed registry of genuinely custom portals; preserve the possibility of narratively dishonest thresholds without violating a security promise. |
| **FW-SCR-001** | World-space HTML Screens, readable focus/close, opt-in VNN and safe cross-origin framing; experiments with multiple screens, projection, and screen-to-world meaning without unintended privileges. |
| **FW-CHU-001** | Extract the master floral grammar; keep Garden geography canonical; strengthen the obsidian #notMinecraft graffiti; register ruined Cathedral modules, mathematical architecture, stained glass and the unblocked view of the sky without overwriting the Garden. |
| **FW-WIT-001** | Continue the Ravine Cliff root strands, mist seen from the overlook, S-shaped stream, elevation, secret passages, ambient sound, and optional misleading custom thresholds. |
| **FW-ELI-001** | Restore the full dramatic Aslan–Tash way, two rings and seven perspective stations; enrich witness conversations, comparative flood/preservation myths, ethical disagreements, independently timed heavens and living Concordance without turning theology into a numerical grade. |
| **FW-KIL-001** | Complete a physically furnished Victorian House with all H01–H24 and exact source linkage; use the orrery, correspondence, book, portraits, glass and repaired objects to change a visitor's knowledge and sometimes their outside opportunities—not to dictate celestial truth. |
| **FW-CAT-001** | Reconcile Cathedral STEP, GLB, materials, scaling and ruptured stone vaults with Chuzhoy; demonstrate authentic stained glass in architectural frames and an open-sky ruined nave. |
| **FW-GRG-001** | Research a genuinely user-controlled, privacy-minimizing pseudonymous identity and reputation/vault design with explicit threat models, consent, recovery, moderation and legal review. Current fictional bank screens must not solicit real data. |
| **FW-PURG-001** | Recover the original Labyrinth of Purgatorio conception and sources before inventing a level in its name. |
| **FW-MOD-001** | Build inspectable mod examples, one-file preview generation, Git PR previews, an optional AI explanatory layer and consistent source links so humans and agents can extend the tree without copying opaque bundles. |

A roadmap entry is **not permission** to change the scope of another world. Each world keeps its own authorial narrative, while reusing shared contracts. Close an item only with an accepted implementation, evidence and a dated successor entry; otherwise it remains a live invitation.
<!-- /WEBSPACE-LEDGER -->


<!-- WEBSPACE-LEDGER id="R0006" date="2026-11-10" -->
### 2026-11-10 · R0006 — Live CC0 artwork enters the Kilns, without swallowing the story

**Backwards:** The v5 illustrated nested Kilns graph already held all H01–H24 inquiries and independent local journal. Revision v6 adds an optional current Poly Haven 1k glTF model viewer in the Kilns reading panel, a local GLB proxy inspection button, complete API dependency resolution, a source-art catalogue link, strict upstream host checks, and a hash-verified download script. Official API and CDN CORS checks verified 20 distinct models serving 24 H-object roles. Chromium verified that both the H07 Poly Haven artist model and Webspace proxy render and that simply inspecting an object does not create a journal event. GitHub Actions also built the 20-model original-source ZIP with MD5 checking, a manifest, and complete textures. Original v5 world navigation and story systems remain intact.

**Forwards:** Physically furnish the Kilns as a spatially authored 3D house while preserving each object's narrative and mathematical experiment; build fantasy adaptations from the 20 real historical donors and original procedural geometry rather than confusing source objects with completed magical furnishings. Extend the source-bank viewer to a curatorial/modding workflow with editable scale/rotation, stable provenance, art comparisons, small LODs and indexed cross-world asset use. Unify native WebGL material semantics and house-to-sky bounded event handling. Explore carefully reviewed optional source updates and frozen releases so artists can reproduce a past composition despite changing upstream URLs.

**Not yet:** The artistic models are not committed as binary files to this Git repository, not installed as permanent in-scene furnishing, and not proven on every GPU/browser. Live mode depends on Poly Haven, the public CDN for Three.js and network/CORS availability. Offline only has the original proxy GLBs and illustrated story; the downloadable artist-source ZIP is a fixed batch snapshot. The rest of the unfinished v5 themes (Garden flora, canonical portals, Witch's Hole fog, cathedral roofline, complete Concordance and Purgatorio) are unchanged and remain tracked in RFC-002.

**Invariant impact:** No changes to the P-001 Chuzhoy portal standard, S-001 Screen boundary, public arrival routing, H01–H24 object IDs, or Elisium independent sky. Remote art cannot instruct the world or publish private player records. Three.js viewer is an optional presentation separate from the source-of-truth game logic. Accepted release history is preserved by Git; versioned tags/source ZIPs remain separate from the immutable per-file histories.

**Evidence:** [Kilns interactive viewer](worlds/elisium/kilns/index.html), [live loader source](assets/kilns/polyhaven-live-viewer.mjs), [20-model archive builder](tools/package_polyhaven_batch.py), [browser test](tools/test_kilns_polyhaven.mjs), [Poly Haven source protocol](assets/kilns/LIVE_ART_AND_BATCH.md), [asset mapping](assets/kilns/OBJECTS.json), [WORLD_MANIFEST.json](WORLD_MANIFEST.json), [VERSION.json](VERSION.json). Release publication requires actual merge and successful workflow execution; a staging artifact is not proof of the GitHub Release.
<!-- /WEBSPACE-LEDGER -->

<!-- WEBSPACE-LEDGER id="R0007" date="2026-11-11" -->
### 2026-11-11 · R0007 — The Kilns returns its discoveries to Elisium (feature-branch candidate)
**Backwards:** Inherit Webspace v6's nested illustrated Kilns, 24 H-object IDs, original proxy models and opt-in Poly Haven study without replacing them. Give the house its own bounded fictional event duration. On return, Elisium displays a one-time projection of H-object observations and elapsed house minutes as House echoes; no theological verdict is assigned.

**Forwards:** Build a parent-owned, authenticated-by-design event receiver for non-sensitive events, and reconcile the native exterior travel clock with the interior clock under a new reviewed schema. Make the window and orrery help visitors actually recognize star patterns while the sky retains its independence. Eventually furnish a navigable 3D interior.

**Not yet:** This is a draft PR, not a merged release. The native Elisium sky is not accelerated or re-phased, the parent learns no private journal text, and no login, shared visitor storage, secure origin separation, WebGL2 visual parity or server backend is delivered. A same-origin sessionStorage handoff is not a security guarantee.

**Invariant impact:** Parent-world hierarchy stays Webspace → Elisium → Kilns. The existing P-001 Chuzhoy portal, S-001 screen, H01–H24 identifiers, optional Poly Haven art inspection, and independent sky remain unchanged. The new child-only contract does not change ordinary root-world named-arrival URLs.

**Evidence:** worlds/elisium/threshold.js, worlds/elisium/index.html, worlds/elisium/kilns/index.html, worlds/elisium/kilns/world.json, worlds/elisium/kilns/tests/test_threshold.mjs and .github/workflows/docs-covenant.yml. CI, review and main deployment remain prerequisites.
<!-- /WEBSPACE-LEDGER -->


<!-- WEBSPACE-LEDGER id="R0008" date="2026-11-11" -->
### R0008 · Garden of Chuzhoy 6.2.8 Wilderness merge
**Backwards:** Preserves the original Garden 6.2.5.1 HTML as `history/chuzhoy/6.2.5.1/garden_native.html`; the complete v7 repository remains recoverable in Git history at `c6ebe2205a0e322b68585d6bd23307d5606ba761`.
**Forwards:** The canonical Garden at `worlds/chuzhoy/garden_native.html` now uses the exact 6.2.8 standalone wilderness build: southern garden arch ring, layered outer-forest vegetation, deer/ewe/jaguar and two blue-jay ambient sprites, pasture, hidden-well approach, growing marble Creeping Charlie, pink sevenfold and gold structural proposal switches, and camera-facing compass wings. The Garden landing URL and the other world entry points are unchanged.
**Not yet:** Real-device frame-rate and complete WebGL visual acceptance; the artist's cathedral v9 and original Purgatorio wildlife meshes were not present in the 6.2.8 release and have not been fabricated for this merge. Ambient wildlife remains lightweight sprite geometry. The included v8 reconstruction remains a proposal layer.
**Invariant impact:** Portal and action consent rules are preserved by the upstream 6.2.8 game; only the Garden entry's HTML changes. Fortress, Gringotts, Witch's Hole, Elisium, The Kilns, Purgatorio and their files are deliberately not replaced. Distinct native world engines are still allowed to diverge.
**Evidence:** Exact imported 6.2.8 HTML is 1,636,170 UTF-8 bytes, SHA-256 `3fad552d8711e6b46cd199811debb7cc177742104f7cc575d5d66fe1d6446a4d`; see `worlds/chuzhoy/QA_6_2_8.md`. Source recovery script: `tools/extract_chuzhoy_runtime.py`.
<!-- /WEBSPACE-LEDGER -->

<!-- WEBSPACE-LEDGER id="R0009" date="2026-11-11" -->
### 2026-11-11 · R0009 — The illustrated house becomes a place to walk

**Backwards:** Webspace v6 offered a genuine optional Poly Haven 3D study viewer but no walkable interior; H01–H24 were in a separate illustrated navigation graph. v7 preserves that entire illustrated playable source as `worlds/elisium/kilns/illustrated.html`. New editable scene files implement a nine-cell ground-floor Victorian plan with real door openings and wall collision, an upstairs attic reached from a sculpted spiral stair, keyboard/mouse/touch motion, procedural timber/marble/wallpaper/glass/lighting geometry, physical artifact stands, and dedicated bespoke animated fantasy extensions for every H object. The 20 original Poly Haven 1k model sources are now automatically mounted as physically situated objects in their story rooms on entry, with generated GLB proxies retained for failed remote access. The house session remains local.

**Forwards:** Deepen each artifact's narrative puzzle beyond first action, make all 24 objects visually curated with precise size/rotation/material and ambient audio, add authored interactions between different H artifacts, enrich corridors with character and domestic history, tune low-powered/offline/assistive modes, adapt original architectural CAD and stained-glass color simulation, and finish a geographically convincing stair route. Separate further-advanced source assets from public static releases; freeze approved compositions while allowing optional current-source inspection. Establish meaningful but explicitly bounded echoes from house to Elisium, never automatic theological assessment of the sky.

**Not yet:** The detailed Poly Haven source files are loaded live on demand by room and are not committed as 24 bespoke fantasy GLB binaries. A historical model is an artist original donor: its narrative changes are Webspace-authored procedure layered around it, not an assertion that every texture/material is perfectly remodeled. Full all-device, all-twenty-model visual QA, dialogue voiceovers, complex articulated rigs, and outside sky reactions remain forward work. The illustrated edition and the downloadable v6 fixed source asset bank remain independently accessible. A successful source merge, a green browser CI result, and an independently verified public Pages response are separate publication facts.

**Invariant impact:** All published portal entry tags, P-001 Chuzhoy portal semantics, S-001 Screen separation, 24 H IDs, chapter/inquiry prose, and parent Elisium clock authority are preserved. The Kilns adds geometry, local movement and revised presentation but no new login, persistent public journal, identity sharing or bank dependency. New code continues to meet the backward/forward documentation covenant and source-style contract.

**Evidence:** [3D Kilns source](worlds/elisium/kilns/index.html), [3D engine](worlds/elisium/kilns/house3d.mjs), [physical layout](worlds/elisium/kilns/house-layout.mjs), [24 original interactive fantasies](worlds/elisium/kilns/house-fantasy.mjs), [current CC0 donor mount loader](worlds/elisium/kilns/house-assets.mjs), [historical illustrated fallback](worlds/elisium/kilns/illustrated.html), [browser walk/collision/art tests](tools/test_kilns_house3d.mjs), [world metadata](worlds/elisium/kilns/world.json). Browser-tested and public deployment status must be updated only on real verification.
<!-- /WEBSPACE-LEDGER -->


<!-- WEBSPACE-LEDGER id="R0010" date="2026-11-11" -->
### 2026-11-11 · R0010 — Cathedral grammar becomes reusable world commons
**Backwards:** The Rev05/06 temple STEP/GLB and stained-glass works were already in `assets/cathedral/`; v9.2 design discussions added detailed arches, shouldered vaults, colored glass and narrative light moods, but their repository-level compiler and Chuzhoy integration were not present on main. This revision adds `commons/cathedral/grammar.mjs`, `catalogue.json`, an independent Chuzhoy opt-in adapter, source provenance/architecture docs, a nine-family geometry regression, and a CI workflow. The current Garden 6.2.8 native HTML and routes are unchanged.
**Forwards:** Attach dressed stone and a broken high stained-glass bay to *measured existing* Chuzhoy 2D wall stations; let one credible surviving vault reveal the missing high temple instead of replacing the forest. Improve recursive muqarnas, analytic STEP solids, tiny atlas/baked lighting and mobile performance; adapt single parts for Purgatorio and nonreligious ruins. Future developers should find hints at the generator functions and follow the art handoff, not paste the original 288 × 192 m temple over the Garden.
**Not yet:** No in-game cathedral mounting, no new Chuzhoy navigation/collision, no Purgatorio level or new portal. The source-first compiler here is an incremental bridge, NOT a full mirror of the separately developed v9.2 GLB/STEP package. Its light effects are descriptors; true WebGL2 rendering, pixel fidelity, device FPS and main-branch deployment require separate verification. The ancient-source stone module is a fictional 0.5 m design unit, not a universal historical Second Temple stone size.
**Invariant impact:** Existing canonical portal/screen distinctions, arrival tags, Garden route graph, fountain, wudu, baptism, hidden well, astrarium, wildlife, flora, compass and gold/pink architecture toggles unchanged. Each world owns coordinates, collision approval and narrative; shared cathedral geometry is opt-in.
**Evidence:** `commons/cathedral/grammar.mjs`, `commons/cathedral/README.md`, `commons/cathedral/catalogue.json`, `worlds/chuzhoy/cathedral-catalogue.mjs`, `worlds/chuzhoy/CATHEDRAL_ART_HANDOFF.md`, `tests/test_cathedral_catalogue.mjs`, `.github/workflows/cathedral-catalogue.yml`. Tests are included; CI and real-world validation must be reported from actual runs.
<!-- /WEBSPACE-LEDGER -->

<!-- WEBSPACE-LEDGER id="R0011" date="2026-11-11" -->
### 2026-11-11 · R0011 — Reconcile a test's fleeting message with lasting house evidence

**Backwards:** The accepted v7 full GitHub source release is public and recoverable; the 3D house has ten connected spatial areas, preserved H01–H24 interpretations, real in-room historical model mounts, its own local clock and the original illustrated fallback. GitHub's real-browser run established 1,481 physical scene meshes, a keyboard-driven crossing from Vestibule to Common Room, and successful installation of the original H07 Brass Goblets artist geometry in Dining Room. The test then wrongly required a temporary notification to retain the text H07 even though asynchronous original-art loading may replace it. This patch tests the persistent session marginalia instead. It also removes a GitHub Pages configuration request that GitHub's ordinary workflow token lacks permission to execute; the deploy workflow is ready once Pages is enabled in repository settings. No world geometry, portal semantics or object narrative is modified by this revision.

**Forwards:** Finish end-to-end browser regression coverage of all twenty-four fantasy activations, upstairs movement and source-fallback conditions, retain screenshot evidence as art direction improves, and make the public GitHub Pages URL a first-class verified delivery link. Once the account administrator selects GitHub Actions under Settings → Pages, the existing publication workflow can deploy each accepted update without a repeated upload. Continue developing bespoke art and in-house physical affordances rather than confusing an upstream Poly Haven asset with a complete authored interaction.

**Not yet:** GitHub Pages first-time activation has not been proven possible through the current GitHub connection; the earlier deployment run failed with `Resource not accessible by integration`. The public site URL is **not verified live** and must not be advertised as working. The source GitHub release and original CC0 model-bank release already exist publicly. Passing the documentation checker or any single representative model test is not equivalent to full all-device artistic QA; a fresh browser run must establish whether the H-object and staircase tests also pass.

**Invariant impact:** This patch alters a test assertion and an administrative deployment workflow only. It preserves the Garden of Chuzhoy 6.2.8, the v7 house geometry, H01–H24 stable IDs, the Elisium threshold, independent sky, player-held session observations, P-001 portal default and S-001 Screen separation. The v7 public source-release tag is immutable; follow-up main commits remain independently inspectable.

**Evidence:** [GitHub v7 source release](https://github.com/Vitra-Lumenhart/Webspace/releases/tag/webspace/v0007), [browser acceptance test](tools/test_kilns_house3d.mjs), [GitHub Pages workflow](.github/workflows/deploy-pages.yml), [explicit site activation limitation](docs/GITHUB_PAGES_ACTIVATION.md), [3D Kilns](worlds/elisium/kilns/index.html) and [illustrated fallback](worlds/elisium/kilns/illustrated.html). Actual public site availability requires a later successful Pages deployment and HTTP check.
<!-- /WEBSPACE-LEDGER -->
