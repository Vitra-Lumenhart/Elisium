# RFC 001 — The Threshold Covenant: Webspace as a readable federation

Date: 2026-11-10
Status: proposal, NOT implementation.
Owner: Vitra-Lumenhart/Webspace
Baseline audited: main, v5 federation (five playable world entrypoints, one reserved Purgatorio page, one nested illustrated Kilns).

## Intent

One GitHub monorepo should serve five perspectives on the SAME world: the player, the inquisitive fourteen-year-old, the contributor, the asset researcher, and the development agent. Explanations repeat from orthogonal angles but resolve to the same stable IDs, file paths, event schemas and Git history. The code is canonical; generated manuals and previews must be traceable to it.

Do not split the six pages into separate repositories by default. Monorepo paths are simpler for a novice, cross-world CI and portable GitHub Pages deployment. The separate existing Elisium repo should remain a historical upstream and then become an intentional mirror or be imported via a recorded migration; never silently overwrite divergent histories. Avoid submodules as the default learner experience.

## Proposed filesystem; paths below do not yet exist

~~~text
Webspace/
  index.html                         # Garden-first human landing
  README.md                          # Play -> explore -> hack -> contribute
  TECH_MANUAL.html                   # Accessible generated developer manual
  AGENTS.md                          # Guardrails for AI/humans
  LICENSE                           # MIT for independently authored code only
  ASSET_LICENSES.json               # Per-asset license and uncertainty
  .github/
    CODEOWNERS
    workflows/verify.yml            # Tests + previews + link/license audit
    workflows/deploy.yml            # Publish a generated dist/
    ISSUE_TEMPLATE/world-change.yml
    PULL_REQUEST_TEMPLATE.md
  worlds/
    chuzhoy/
      index.html
      world.json
      README.md
      TECH_MANUAL.html
      src/scene.js
      src/graph.json
      assets/                       # Local arrangements, not shared library
      tests/
    fortress/
    gringotts/
    witchs-hole/
    elisium/
      index.html
      world.json
      src/
      kilns/                         # Child world under parent address
        index.html
        world.json
        README.md
        objects/H01.json ... H24.json
        src/
        tests/
    purgatorio/
      index.html
      world.json                     # placeholder until actual concept arrives
  commons/
    portals/                         # canonical visual form + named entry
    navigation/                      # weighted graph + routes
    flora/                           # Chuzhoy MASTER botanical grammar
      index.js
      species.json
      README.md
      tests/
    geometry/                        # splines, wall recipes, shapes
    render/                          # glTF adapter, WebGL/Canvas boundaries
    contracts/                       # schema, events, clocks, security
  assets/
    registry.json                    # file IDs + provenance + integrity
    originals/                       # small original assets or references
    derived/                         # licensed, optimized web assets
    cathedral/                       # modular Chuzhoy sources, not rival map
  content/
    sources/                          # original-fiction/canon/history evidence
    interpretations/                 # competing witnesses, explicit boundaries
  docs/
    getting-started/
    player/
    developer/
    recipes/
    decisions/                       # RFCs / ADRs / source reconciliation
  tools/
    build.mjs
    generate-manual.mjs
    validate-assets.py
    preview.mjs
  tests/
  dist/                              # generated; do not edit by hand
~~~

Keep existing files in place until migration scripts, redirects and automated parity tests are present. The desired filesystem is an organizational plan, not a renaming instruction.

## Authority and inheritance

- Chuzhoy determines Garden geography, portal canon and shared botanical source. Commons/flora exports the grammar; Garden places species instances.
- Fortress and Gringotts have a shared historical renderer lineage, but separate scene and safety contexts.
- Witch's Hole determines ravine elevation, fog, strand puzzle and its authored path geometry.
- Elisium determines seven star points, rings, Aslan–Tash dedicated corridor, independent sky and Concordance Lens. Preserve theological disagreements and directional discoveries.
- Kilns is the child of Elisium: a separately navigable house, its own room graph and clock, twenty-four stable H objects, and a bounded contract to exterior/sky. It may influence what a traveler can observe; it does not dictate the sky's truth.
- Purgatorio is RESERVE ONLY until formative source is recovered.
- Cathedral CAD is reusable architectural source. Its own gigantic ground plan must NOT overwrite Chuzhoy's established fountain and ritual nodes.

## Contracts, not imports of each other's internals

Versioned world manifests name entrypoints, parent, arrival tags, source lineage, status and dependencies. Cross-world travel uses allowlisted named public arrivals, not arbitrary URLs, credentials or coordinates.

The nested event contract should specify kind, version, source world, target world, public payload schema, event ID and bounded fictional time. Validate origin and source and reject unknown event names; an iframe/postMessage is not secure merely because it lives in a subdirectory.

Example non-secret event:
~~~json
{
  "schema": "webspace.event/1",
  "id": "kilns:H17:pattern-learned",
  "from": "elisium/kilns",
  "to": "elisium",
  "kind": "constellation_pattern_learned",
  "object": "H17",
  "observation": "witness-garden"
}
~~~
This is illustrative, NOT a claim of present runtime support. A production receiver must use a dedicated validated schema and not trust fields supplied by arbitrary page scripts on the same origin. Distinguish scene clock, travel cost, observation timestamp and parent/child reconciliation explicitly.

## What documentation should repeat

Every feature receives ONE durable ID (e.g. FLORA/ROSE/01, PLACE/CHUZHOY/FOUNTAIN, H17, ROUTE/ELISIUM/ASLAN-TASH). Link that ID across:
1. Player: what happens and why the visitor might care.
2. Source: actual JavaScript function/data object and its limitations.
3. Developer: event contract, tests, drawing/physics algorithm, provenance.
4. Modder: the one smallest safe change and how to preview it.
5. Scholar: history, source notes, rival interpretations and uncertainty.
6. AI worker: owner, exact files, invariants, dependencies and accept criteria.

Generated cross-reference indexes should fail CI on broken IDs and links. Do not hand-copy gameplay prose into six contradictory manuals; document the same underlying data through different projections.

## Development workflow across threads and Topgro

Per-world branch + PR, even for ChatGPT threads. Suggested names: world/chuzhoy/*; world/witchs-hole/*; world/elisium/*; world/elisium-kilns/*; commons/*; docs/*.
Topgro uses local git clone or independent worktree(s), its own SSH deploy key/GitHub App with least privileges and runs validations/builds. Never give a public web visitor a GitHub write token. Do not run arbitrary public PR scripts on a privileged self-hosted Topgro runner. For untrusted PRs use isolated GitHub-hosted CI or restricted unprivileged containers.

Required PR evidence: source commit, tests, preview artifact, screenshot when relevant, asset provenance, known omissions, changed world(s), refreshed README + TECH_MANUAL, version bump and rollback tag. Protect main from untested concurrent direct changes; automatic merge only after required checks and review policy. Distinguish automatic CI on push from autonomous research/editing, which needs separately provisioned agents/tasks.

## Release / storage strategy

Git commits are incremental and immutable. Preserve historical releases by integer Git tags (webspace/v0005, v0006) and optionally one numbered source ZIP per accepted major release. Track world versions independently, e.g. elisium/4.6. The source of truth is readable Git, not old ZIPs or compressed inlined previews. Generate dist/ and a standalone HTML preview automatically.
Small binary assets can live in Git. Use artifact storage for big editable STEP/Blend masters, and optimized hashed GLB/texture files for runtime. Git LFS is not directly served by GitHub Pages. Keep private visitor-generated content in a separate consent-based server, never in public Git.
Pages is an appropriate static teaching/play layer; not an authentication, wallet, database or confidential communications backend.

## Known v5 gaps to resolve before claiming migration complete

- Current v5 has no root LICENSE or GitHub Actions workflow and its technical manual is brief.
- Multiple source versions arrive as bundled HTML rather than modular files.
- Kilns v5 is an illustrated graph, not fully furnished WebGL geometry; parent sky has no implemented event consumer.
- Poly Haven originals have not been acquired and placed; current 24 GLBs are placeholders.
- The cathedral Rev06 package exists, but full placement/material integration remains unresolved.
- No recovered Purgatorio gameplay or formative design was found in audited sources.
- GitHub Pages publication status must be checked independently of a successful repository commit.

## Minimum viable migration sequence

0. Tag and archive v5 first. Do not overwrite playable routes.
1. Add policies: rights manifest, AGENTS, CI checks, world ownership and a source-to-preview build contract.
2. Extract Chuzhoy flora and portal protocol into tested commons modules with a compatibility adapter.
3. Unbundle one world at a time and prove preview/route parity; run phone and GPU-fallback smoke tests.
4. Formalize Kilns child event contract and connect one real H17 observation to Elisium without changing its independent sky clock.
5. Build a small example mod and a source-instrumented browser inspector before adding opaque optimization layers.
6. Add deterministic asset acquisition, checksum, rights audit and optimized render derivatives.
7. Add Purgatorio only when a genuine design brief is available.

Acceptance: a beginner can open source and modify a flower; a world contributor can ship one PR without breaking another; a player can switch worlds; a saved build can be reproduced; no model appears in runtime without recorded rights and provenance.


## Addendum: Revision Covenant, Portal Canon and Screens (2026-11-10)

This RFC now inherits [docs/REVISION_COVENANT.md](REVISION_COVENANT.md) and [docs/CODE_STYLE.md](CODE_STYLE.md): every PR must add paired, append-only, dated backward and forward accounts in README and TECH_MANUAL, not merely keep two filenames present. A new GitHub Actions workflow checks paired IDs, timestamps, required headings and historical non-mutation. The status check becomes mandatory only if branch rulesets are configured to require it. [Portal/Screen/Identity contract](PORTAL_SCREEN_CONTRACT.md) defines P-001 Chuzhoy as the default portal across all worlds, S-001 Screen/Portal separation and I-001 privacy-minimizing (not warrant-proof) Gringotts identity aspirations.

The human story behind every change survives in these logs: what artists and earlier agents attempted but could not finish remains discoverable as durable future-work IDs. A future AI may change methods while preserving the promised outward semantics and source history. This addendum has not altered the accepted v5 game code.
