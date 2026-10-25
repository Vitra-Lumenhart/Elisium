# Publishing Elisium with GitHub Pages

These instructions apply to this stand-alone Elisium repository, **not** the Chuzhoy source tree.

1. **Repository already created.** Open [Vitra-Lumenhart/Elisium](https://github.com/Vitra-Lumenhart/Elisium) and keep the existing MIT `LICENSE` file.
2. Extract the **contents** of this ZIP on your computer. In the GitHub repository click **Add file → Upload files**. Drag the extracted files and folders (not the ZIP itself, not an extra enclosing directory) into the uploader. Replace the starter `README.md` with the new one if prompted; **leave `LICENSE` intact**. Commit directly to `main` with the message `Publish Elisium webspace v0.1.0`.
3. Confirm `index.html`, `engine.js`, `style.css`, `assets/`, and `world_manifest.json` are visible at repository root. The `assets/` folder should contain both Aslan and Tash images. A `.nojekyll` file is included; if hidden files were missed, it is not immediately fatal for this version.
4. Open **Settings → Pages → Build and deployment**. Set Source to **Deploy from a branch**, Branch to **main**, folder to **/(root)**, and click **Save**.
5. Back on **Settings → Pages**, use the **Visit site** link GitHub provides to verify the canonical URL. The expected URL for the capitalized repository is **`https://vitra-lumenhart.github.io/Elisium/`**.
6. In the repository About sidebar, click the gear to set the **Website** field to the public Pages URL so visitors can discover the game.

### Updating the world

Upload/commit changed files to `main` (or merge a pull request) to refresh the published website. The public site keeps the same URL. Refresh the browser after deployment; caches can delay a new version.

### Local preview

Open `index.html` locally; for a local HTTP URL use `python -m http.server 8000` from the repository folder and visit `http://localhost:8000/`.

To generate a **self-contained** HTML preview for ChatGPT or offline sharing:

```
python build_preview.py
```

This writes `elisium_webspace_preview.html` beside `index.html`. It is generated output and is excluded from the source repository by `.gitignore`.

### Scope, security and limitations

- This repository contains only the Elisium 0.1 files; it does **not** publish Chuzhoy.
- GitHub Pages provides **static** hosting: HTML, CSS, JavaScript, artwork, and browser-side WebGL. It does not provide databases, server-side sessions, matchmaking, or arbitrary persistent writes.
- The public repository exposes the source and assets to everyone. Inspect new content for secrets, private data, or copyrighted third-party material before each commit.
- A public Pages site can be visited without signing in to GitHub.
- The exit portal cannot always close a user-opened tab; it instead ends the in-page session when the browser blocks closing.

GitHub documentation:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
