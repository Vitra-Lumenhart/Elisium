# Webspace source and style guide — how to extend a world

**Status:** proposed contribution standard for all humans, ChatGPT-Vitra threads and Topgro workers. Read with [AGENTS.md](../AGENTS.md) and [Revision Covenant](REVISION_COVENANT.md).

## The source is the accurate reference; the commentary gives it meaning

HTML declares the public browser contract, CSS its visual arrangement, JavaScript its interactive algorithms, and scene data its particular places, inhabitants and objects. Preserve the readable original even if producing minimized, compressed or WebAssembly distribution derivatives. Every visible object should have a trail back to its editable source. The player README, HTML technical manual, comments, diagrams and educational text are **orthogonal explanations**, not rival copies of the underlying algorithm.

## Minimal-change grammar

- **One feature, one owning world or commons module.** An Elisium narrative change belongs in Elisium; a general portal renderer belongs in commons. Do not silently import the whole Garden into Witch's Hole.
- **Deterministic where possible.** Favor seeded mathematical geometry, explicit units/axes, splines, instance reuse and stable IDs over duplicated meshes or inscrutable shader magic. Record source generator, seed and asset checksum when reproducing outputs.
- **No accidental global state.** A level owns its graph, camera, time and local notes; cross-world facts flow only through versioned bounded events and accepted public arrival tags.
- **Stable names.** Preserve H01–H24, published arrivals and authored route/node IDs. New IDs should describe permanent referents, not their first screen position or array offset.
- **No blanket rewrite.** Fix and test the smallest subsystem; preserve authored prose, physical geometry, route timing and other worlds' semantics.
- **Accessibility.** Keyboard/touch alternatives, readable controls, reduced-motion crossing and Canvas fallbacks must be recorded; GPU and fallback appearance need not be pixel-identical, but their meaningful interactions should agree.
- **No false security promises.** The Screen Kit remains a low-authority iframe; no portal or remote page grants access to private credentials, wallet balances or reputation state. Every security-sensitive addition requires threat modeling and independent tests.

## Comment style (useful rather than ornamental)

Write comments at points where a reader might ask **why**, not to narrate each line of obvious code. The recommended format is:

~~~js
// WORLD: chuzhoy | ID: FLORA/ROSE/01
// INVARIANT: same growth grammar in every dependent world.
// WHY: stable seed preserves object identity across screenshot tests.
// CONTRACT: the scene may change flower placement; not the library rules.
function growRose(seed, parameters) { /* ... */ }
~~~

Public data and functions should document what they accept, return and refuse. Do not put secret access assumptions in comments or infer that AI authors can see a connected service simply because they can edit the public repo.

## Separating method and manifestation

Use Chuzhoy's floral generator as a shared grammar; let each world instance choose distributions and textures. Use a canonical portal renderer, not a cloned shade of purple. Use Screen Kit for inspectable HTML, not travel. Preserve CAD/STEP high-level curve source and produce optimized GLB runtime derivatives. A custom world can override a visual result but cannot silently claim the common interface while replacing its meaning.

## Readiness vocabulary

- **SHIPPED:** in the accepted playable artifact; name actual test/evidence.
- **PROTOTYPE:** demonstrable but not integrated, secure or production ready.
- **PLACEHOLDER:** names, proxy art, or planned address, not gameplay.
- **DEFERRED:** source exists or design discussed but work intentionally postponed.
- **BLOCKED:** needs specific missing source, permission, right, test equipment or external decision.
- **RETIRED:** deliberately superseded with a recorded successor and rollback path.

Do not call a static demo a working account, a procedurally generated proxy an imported Poly Haven model, or a discussion of a theorem a fully authored drama.

## Definition of done

Source change, manifest update as relevant, minimal targeted regression tests, no broken worlds, asset provenance, one-click HTML preview for runtime revisions, a matched *new* dated backward-forward README/manual ledger entry, and a reviewed PR. The documentation check only proves presence and append-only continuity; it cannot substitute for a careful human/artistic review.

Use **one PR per coherent change**. Reusable assets can serve several worlds, but the parent world must not automatically acquire the authority to rewrite a child world's creative logic. For a breaking change propose a versioned contract before changing the code.
