# Luau Academy

A static, interactive Luau learning dashboard designed for GitHub Pages.

## Features
- Dashboard and five-phase learning roadmap with goal-based ordering
- Five-section placement assessment
- Section-by-section submission and feedback
- Practice arena with guided code review
- Progress, placement answers, and selected learning goal saved with browser `localStorage`

## Publish with GitHub Pages
1. Create a new repository on GitHub (for example, `luau-academy`).
2. Upload `index.html`, `styles.css`, `app.js`, and this README to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site. The URL will appear in the Pages settings.

## Notes
- No build step or server is required.
- Progress is stored in the visitor's browser. It does not sync between devices or browsers.
- The placement test's code questions use simple keyword checks, not a real Luau interpreter.
- Google Fonts are loaded from an external provider; system fallbacks are included.

## Goal-based learning
Choose a built-in goal (fundamentals, gameplay, UI, multiplayer, data/progression, or full game) from the dashboard. The site reorders the recommended phase sequence and explains the focus. You can also save a custom goal; custom goals retain the general recommended course order in this starter version.
