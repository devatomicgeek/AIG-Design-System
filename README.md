# Design System v3.9

Static, GitHub Pages-ready brand library for 10 outlets. Open `index.html` locally, or publish the **contents** of this folder to the root of a GitHub repository and enable GitHub Pages (main branch, root). Links are relative.

## Outlet settings

Open an outlet and click **Settings** at the top right. Edit logo variations and their formats, clear space, incorrect-usage logo selection, colors, font families/ZIPs and hierarchy, and icons. Each outlet is independent. Icons have no visible labels. Settings are saved in the current browser using localStorage; uploads are stored as data URLs, so very large files can exceed browser storage limits. Use **Export changes ZIP** frequently to preserve edits. ZIP font uploads extract TTF, OTF, WOFF and WOFF2, and display actual font previews where supported.

**GitHub Pages is static**: changing Settings does not automatically change the deployed site or other visitors' views. To publish changes:

1. In the outlet's Settings, click **Export changes ZIP**.
2. Extract this website folder to your computer.
3. With Python 3 installed, run `python tools/apply_brand_update.py /path/to/fuze-cafe-brand-update.zip` from anywhere. The script uses its own location to find the website folder.
4. Commit and push the updated website folder to GitHub Pages. Other visitors will now see the updated assets and configuration.

You can also **Import ZIP** into an outlet's Settings to restore a previously exported package locally.

## Important notes

- Original uploaded logo artwork is not altered. Incorrect-usage previews apply browser-only CSS transformations to demonstrate what not to do.
- Clear-space controls are *visual guidance*, not a replacement for official brand measurements. Existing values are editable starting examples and should be confirmed against each brand's official guidelines.
- The Babiole PDF remains available in `outlets/babiole/assets/guidelines/` and its Arrow fonts are **not included**, because original font files were not supplied.
- Some browsers restrict local file access and clipboard operations under `file://`. For the most consistent experience, serve the folder locally with `python -m http.server 8000`, then visit `http://localhost:8000/`.
- ZIP extraction and ZIP generation use a bundled JSZip library and do not require a network connection.
- Verify you have the appropriate licenses before publishing fonts or other assets.
