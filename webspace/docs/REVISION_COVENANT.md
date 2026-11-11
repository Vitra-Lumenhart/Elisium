# The Webspace Backward/Forward Revision Covenant

**Status:** proposed policy on architecture PR #1 until merged and made a required branch check.
**Date adopted in proposal:** 2026-11-10.
**Audience:** ChatGPT-Vitra, Topgro, future AIs, adult contributors, teenage modders, curators and reviewers.

## The governing sentence

Every accepted change tells TWO true stories:
- **Backwards:** What did we inherit, actually change, verify, preserve, fail or deliberately leave incomplete?
- **Forwards:** What remains hoped for, why it matters, what dependencies constrain it, and what would demonstrate completion?

The first story is an evidence-based retrospective, not marketing. The second is an invitation, not a promise that unfinished functionality already exists. Both appear **inside the root README**, chronologically, with a matching technical note in `TECH_MANUAL.html`.

The actual implementation, browser source, tests and Git history remain more authoritative for technical behavior than prose. Written descriptions add value by connecting developer and player understanding.

## Exact update procedure for EVERY PR or revision

1. **Receive:** fetch current `main`, inspect relevant world source and history; identify base commit, world owner, inherited contracts and open dependencies. Do not assume the most recent chat attachment is authoritative.
2. **Archive:** preserve the accepted integer release by Git tag, and a numbered ZIP only at agreed release boundaries. Do not claim a tag or archive was made unless the repository confirms it.
3. **Develop:** make the smallest readable change on an isolated branch or worktree. Update source comments and stable manifest/object IDs where needed. Never hand-modify compressed standalone HTML as canonical source.
4. **Review the backward story:** mark each affected feature as SHIPPED, PROTOTYPE, DEFERRED, BLOCKED or RETIRED. Give evidence: paths, tests, screenshots, citations, commit or issue. Include changes to invariants, dependencies and source licenses.
5. **Review the forward story:** record unfinished features from design discussion even when no code was written. Say what is hoped for, *why*, acceptance criteria, prerequisites and the next natural contributor. Preserve explicit uncertainties.
6. **Publish paired docs:** append an immutable dated README ledger entry with Backwards / Forwards / Not yet / Invariant impact / Evidence; append the **same ID and date** as a technical article in `TECH_MANUAL.html` explaining Changed / Checked / Deferred / Contract impact. Update affected worlds' README/manual, relevant code comments, cross-links and status manifests as appropriate.
7. **Verify:** run tests, required README/manual covenant check, portal/screen regressions where touched, license checks, mobile/Canvas and WebGL visual tests where relevant. State what was NOT tested.
8. **Discuss:** PR template shows backward and forward narratives. Reviewers compare claims against code and may request correction. New developers should be able to understand not just WHAT changed, but WHY abandoned alternatives remain open.
9. **Deliver:** source diff/commit, reviewable PR, preview HTML for runtime changes, rollback, test results, and updated ledger entry. Only after checks and review should the accepted branch be merged/deployed.
10. **Revisit:** future work IDs survive across releases until explicitly closed, superseded or rejected with reasons; an item is not silently erased merely because an agent has a different idea.

## Stable entry format

In README.md, append the following *inside the chronological ledger*. Do not rewrite old entries. Newest first or oldest first is allowed but keep order consistent.

~~~markdown
<!-- WEBSPACE-LEDGER id="R0006" date="2026-11-11" -->
### 2026-11-11 · R0006 — A short human-readable title
**Backwards:** What shipped, what it does, and tested evidence.
**Forwards:** Next experiments and the larger reason for them.
**Not yet:** Specific limitations, unresolved conversations, or blocked tasks.
**Invariant impact:** Unchanged / proposed / versioned migration, with details.
**Evidence:** Paths, links, checks and accepted commit(s); distinguish aspirations from facts.
<!-- /WEBSPACE-LEDGER -->
~~~

In TECH_MANUAL.html, append an article with the same ID and date:

~~~html
<article data-ledger-id="R0006" data-ledger-date="2026-11-11">
  <h3>R0006 — A short technical title</h3>
  <p><strong>Changed:</strong> ...</p>
  <p><strong>Checked:</strong> ...</p>
  <p><strong>Deferred:</strong> ...</p>
  <p><strong>Contract impact:</strong> ...</p>
</article>
~~~

CI checks these fields, new IDs, matching dates, and append-only history. The browser does not run documentation as code. CI cannot certify truthfulness; reviewers compare with evidence.

Corrections to historic assertions are **new dated errata entries** pointing back to the original ID; do not silently revise what earlier workers believed.

## Special inherited contracts

- **Canonical portal:** every ordinary portal is exactly the Garden of Chuzhoy portal in appearance/interaction through shared code, not a locally invented approximation. Explicit custom portals (for example the proposed Witch's Well exception) require a manifest declaration, owner and tests; do not conflate aesthetic lies in fiction with security assertions. Details: `docs/PORTAL_SCREEN_CONTRACT.md`.
- **Screens:** the ▣ HTML surface is not the ◈ portal. Screen content never gains authority to navigate, alter accounts, or instruct the parent AI. Preserve the older Screen/Channel protocols as historical reference.
- **Gringotts:** future pseudonymous, user-controlled identity/reputation and encrypted storage require independent security and legal design. The present bank is fictional; neither 'anonymous to Vitra' nor 'immune to warrants' can currently be guaranteed.
- **Garden commons:** preserve the procedural botanical grammar, obsidian portal language, Newcomer Garden geography and canonical entry.
- **Child worlds:** Kilns has its own room/object/clock authority and may emit bounded public events; the sky remains independent. Purgatorio remains a reserve until source is recovered.

## What GitHub automates versus what it cannot

GitHub provides PR templates, status checks, Actions, CODEOWNERS and branch protection/rulesets. The proposed `docs-covenant.yml` runs a checker on PRs and main pushes. It checks the *presence* of backward and forward narratives and corresponding manual updates. To prevent a direct push or merge that bypasses the check, configure `main` to require the named status check and a PR; CODEOWNERS approvals are optional but recommended when a qualified reviewer is available. These settings cannot be asserted as active merely by committing workflow files.

A contributor may object that 'documentation does not need to change'. In Webspace, the explanation that nothing changed about a contract IS part of the record. Append an explicit minimal note; do not invent a feature to fill space. Generated files should be traceable to editable originals.

## Invariant change proposal

'Cannot change within my domain' means **no silent breaking changes**. Security fixes, legal necessities, explicit user consent and versioned migrations may still require evolution. For any change to portals, screens, serialized player data, accounts, privacy promises or religious source boundaries:
- Write a separate RFC/ADR recording the previous contract, failure modes, alternatives, replacement version, migration and rollback.
- Test compatibility with old worlds, explain UX effects to the user and secure appropriate review.
- Keep a backward-compatible adapter if feasible; never silently reinterpret old state.

Do not build a deceptive mechanism that acquires credentials or exports private data in the name of a fictional 'lying portal'.
