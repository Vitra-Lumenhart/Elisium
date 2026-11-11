# Publish Webspace as a separate GitHub repository

This guide is for Vitra's **Chuzhoy / Gerudo Fortress / Gringotts** Webspace, not the independent `Vitra-Lumenhart/Elisium` repository. Do not overwrite or fold this code into the Elisium root. Github Pages is public static web hosting, not a private-data backend.

## 1 — Establish the separate destination

Log into the **Vitra-Lumenhart** GitHub account and create a **public** repository named **Webspace**, without initializing it with a README or license. (The game contains third-party fantasy-setting references, so a sweeping license has not been added automatically.)

Repository after creation: `https://github.com/Vitra-Lumenhart/Webspace`.

If you are using ChatGPT's connected GitHub app, tell ChatGPT when the empty repository is created. The connection can assist with repository content and text changes, but this release also contains binary CAD/GLB assets; the most reliable way to upload the **entire** package is GitHub's browser uploader or authenticated Git/GitHub CLI. The current connection cannot provision a new repository, and do not paste credentials into chat.

## 2 — Upload the repository contents

Extract `webspace_github_upload.zip`, and upload **the files inside the ZIP to the repository root** rather than uploading only the ZIP or an enclosing folder. The root must show `index.html`, `webspace.js`, `webspace-portal.js`, `webspace-bank-desk.js`, `worlds.json`, `README.md` and the `.glb`/`.step` files. Hidden `.nojekyll` should be preserved. GitHub's site doesn't require a bundler or Node server.

Alternatively, on a computer with GitHub CLI authenticated, run these steps **before** manually creating the repository:

```sh
unzip webspace_github_upload.zip -d webspace-upload
cd webspace-upload
git init -b main
git add .
git commit -m "Publish independent Webspace v3: Chuzhoy, Gerudo and Gringotts"
gh repo create Vitra-Lumenhart/Webspace --public --source=. --remote=origin --push
```

## 3 — Enable GitHub Pages

In `Vitra-Lumenhart/Webspace`, choose **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**. Once deployed and confirmed by GitHub, the anticipated public site is:

`https://vitra-lumenhart.github.io/Webspace/`

The site URL is only an expectation until Pages is enabled and deployment succeeds. Use the **Visit site** link in Settings → Pages to confirm it.

The default site enters at Gerudo Fortress's throne room. To begin directly at Gringotts, use `?ws_v=1&ws_entry=gringotts-gerudo`. The bank route back to the fortress uses its fixed allowed entry tag `fortress-bank-rear`.

## 4 — Testing

Serve locally with `python3 -m http.server 8000` from the repository root and open `http://localhost:8000/`.

Run (requires Node.js):

```sh
node test_geometry.js
node test_assets.js
node test_art_direction.js
node test_portal.js
node test_screen.js
node test_screen_projection.js
node test_bank.js
node test_v61.js
```

`python3 build_preview.py` creates portable single-file offline previews in the parent folder. Native GPU/WebGL appearance needs a browser with WebGL2; the Canvas 2D mode is a compatibility fallback.

## Security, copyright, and data scope

- **No real banking or privacy storage:** contract signing, balance conversion, and vault are theatrical interactions; no passwords, wallet keys or private records should be entered.
- **No Proton API integration:** official Proton links only. Never submit Proton credentials to an in-world panel.
- **Public repository:** everyone can inspect the source and assets. Do not commit API tokens, account keys, passwords, personal records, private VNN data, or secrets.
- **Fan-fictional settings:** Gerudo, Gringotts, goblins and Proton branding are independent/unofficial artistic references; publication does not grant rights to protected characters, trademarks or third-party assets. Review for trademark/copyright implications before promotion or monetization.
- **GitHub Pages is static:** to introduce real accounts, currency, or private storage later requires independently authenticated, security-reviewed infrastructure and appropriate legal/compliance review.
- **Version preservation:** store prior complete archives outside the live site. See `VERSION.json` for the current immutable integer release number.

## Simple single-file Pages edition

`webspace_pages_singlefile.zip` is an alternative **deployment-only** artifact: it contains one self-contained `index.html` plus `.nojekyll`, with all source scripts and art data embedded. This is convenient for quick static publication, but the full `webspace_github_upload.zip` remains the authoritative editable source repository. Do not upload the two ZIP files directly as GitHub Pages sites; **extract** their contents and place `index.html` at repository root.
