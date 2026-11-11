# Webspace publication: public website activation and recoverable source

**Status at 2026-11-11:** The complete physically navigable Kilns v7 source and fixed downloadable source ZIP are public GitHub content. GitHub Actions constructed and archived v7 successfully. The proposed `https://vitra-lumenhart.github.io/Webspace/worlds/elisium/kilns/index.html` URL is **not yet a verified deployed website** because the first site-enablement request returned GitHub HTTP 403 `Resource not accessible by integration`. This file records the external privilege boundary rather than treating a guessed URL as deployed.

## One-time repository administrator step, if public GitHub Pages is desired

1. Open [Webspace → Settings → Pages](https://github.com/Vitra-Lumenhart/Webspace/settings/pages) while signed in as Vitra-Lumenhart, with repository administration access.
2. Under **Build and deployment → Source**, choose **GitHub Actions**. Save/apply if GitHub offers a save control.
3. Open [Webspace GitHub Actions](https://github.com/Vitra-Lumenhart/Webspace/actions/workflows/deploy-pages.yml), select the workflow and run it manually (or let the next relevant accepted `main` commit trigger it).
4. Confirm the workflow's final **Verify published Kilns entrypoint** step returns HTTP success and open `https://vitra-lumenhart.github.io/Webspace/worlds/elisium/kilns/index.html` in a browser.

No art or model upload is necessary. The 20 Poly Haven artist models were separately archived in GitHub's fixed CC0 release; the gameplay engine has its own pinned MIT Three.js runtime and 24 local proxy GLBs.

**Why automation cannot perform step 2 with the current workflow token:** GitHub's official [configure-pages enablement parameter](https://github.com/actions/configure-pages/blob/main/action.yml) requires a token **other than** `GITHUB_TOKEN`; a personal token must have the applicable repo/Pages permissions, or a GitHub App token must have `administration:write` and `pages:write`. Merely adding `pages: write` to the workflow permissions does not grant repo-site-creation rights. Our GitHub-connected editing tools do not expose a Pages-settings mutation action. The resulting HTTP 403 is a permission boundary, not a failing game renderer. Do not add a privileged token merely to avoid one configuration click if it can be safely avoided.

## Public and reproducible links available without Pages

- [Complete Webspace v7 source ZIP](https://github.com/Vitra-Lumenhart/Webspace/releases/tag/webspace/v0007). This is the immutable tagged baseline. It contains a fully navigable 3D Kilns, a pinned same-origin Three.js ES module runtime, all authored fantasy fixtures and the illustrated fallback.
- [Current GitHub source for the 3D Kilns](https://github.com/Vitra-Lumenhart/Webspace/tree/main/worlds/elisium/kilns). This includes post-release source revisions subject to the README/manual forward-backward covenant.
- [Fixed 20-donor Poly Haven CC0 snapshot](https://github.com/Vitra-Lumenhart/Webspace/releases/tag/kilns-polyhaven-1k-2026-11-10). Models are downloaded automatically by clients when entering rooms if not blocked by the visitor's network; the original proxy geometry remains available locally.

The developer may serve the source ZIP locally via `python3 -m http.server 8000` and visit `http://localhost:8000/worlds/elisium/kilns/index.html`. ES modules cannot be reliably started from a bare `file://` page. This is a recovery option, not a requirement imposed on public visitors once Pages is enabled.

## Verification stages

1. Node syntax, manifest, default Chuzhoy portal registry and both documentation files.
2. Real WebGL Chromium navigation: doorway traverse, all 24 in-room H artifacts, historical source mounting, upstairs staircase, bounded journal.
3. Source-release artifact preserved at a GitHub tag.
4. GitHub Pages enabled by an account with sufficient permissions.
5. GitHub Pages deployment and HTTP success. **Steps 4–5 cannot be declared successful from a source commit or test pass.**

The Webspace v7 README and TECH_MANUAL R0011 documents track this distinction. Future workers should not misinterpret a source-repository link as an already active playable Pages URL.
