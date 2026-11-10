# Luau Academy

An interactive learning site for Luau programming (Roblox development).
Stage 1: foundation, layout, navigation and visual design. No curriculum, test or exercises yet.

## Run locally
The site uses ES modules, so open it through a local server (not by double-clicking index.html):

    python3 -m http.server 8000

Then visit http://localhost:8000

## Deploy
Upload the contents of this folder to a GitHub Pages repository. No build step.

## Structure
- index.html: page shell
- css/: tokens (colors, type, spacing), base, layout, components, pages
- js/main.js: entry point
- js/router.js: hash router (#/section/tab)
- js/state.js, storage.js, progress.js, theme.js: saved data and theme
- js/views/: one file per section (dashboard, course, curriculum, placement, practice, settings)
- js/data/curriculum.js: placeholder categories; add real lessons here in the curriculum stage
- js/ui/: toast, dialog, moon progress indicator, shared components

## Saved data (localStorage, prefix luauAcademy:v1:)
settings, profile, progress, notes
