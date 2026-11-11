# Hack a World — the first ten minutes

Status: RFC guide. Proposed source paths are not all present in main yet.

Welcome. You do not need to know the difference between HTML and JavaScript to start. The entire game is intended to be inspectable, and asking an AI an awkward question is a valid development method.

## What the browser receives

HTML declares elements such as buttons and the canvas; CSS colors and lays them out; JavaScript computes movement, objects and interactions; JSON is descriptive data; WebGL paints 3D graphics on the GPU. A GLB is a compact model; a STEP file is an editable CAD engineering master. The source sent to your browser is readable or reverse-engineerable. Rust compiled to WebAssembly can obscure implementation details but does not make a shipped algorithm secret. Truly private logic and credentials belong on a server.

## Three ways to start

- **Just play:** use the root page and the WORLDS directory; start in Garden of Chuzhoy.
- **Inspect:** open your browser developer tools (usually F12), look at Elements for HTML and Sources for JavaScript; choose View Page Source to see the initial document. GitHub exposes every authored file and its history.
- **Mod:** copy/fork the GitHub repository, edit a world file, launch a local static server, and test a branch before making a PR. You can also ask an AI to walk through this and explain each command.

## A small, safe first hack

The intended first mod after migration will be a Chuzhoy flower instance chosen from commons/flora/species.json. Change a clearly documented color or growth parameter in your own copy. Test that only the intended species changes; do not rewrite the entire master library to modify one planting. Until this migration lands, inspect the Garden source carefully rather than expecting this exact example path to exist.

## Ask your AI in ordinary words

"I want the flowers on the north side to bloom later, but I don't know where the code is. Show me one file, tell me what the words mean, make a copy on a new branch, don't break any other world, and give me an HTML preview I can open. Update the player README and the developer manual and explain why."

If the request is ambiguous, a helpful AI should inspect existing place IDs, find the smallest change, explain assumptions and perform reproducible tests. It should not create an unreviewed security-sensitive feature or invent source missing from the repository.

## Why explanations repeat

One object or place has several readings: something you SEE as a player, something you EDIT as a programmer, something you TEST as a developer and something you DISCUSS as a scholar. These are not contradictory copies: each reading points to a single durable ID and source location. Expect each interface to offer glance, inquiry and archive, with links between them.

## Making changes public

Commit to a world-specific branch, use a PR, inspect the automatic preview, read the tests and accept help from reviewers. For comments use Discussions/Issues; code review happens in PRs. Never paste credentials, private letters or real bank information into the project. All Webspace banking screens are fictional demonstrations.

Reference: docs/ARCHITECTURE_RFC.md, docs/ASSET_PUBLISHING.md and AGENTS.md.
