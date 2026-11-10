# Luau Academy

An interactive learning site for Luau programming (Roblox development).
Stage 1: foundation, layout, navigation and visual design.
Stage 2: the curriculum structure and lesson database (7 sections, 64 lessons). Lesson content, the placement test and practice exercises are still to come.

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
- js/data/curriculum.js: THE curriculum database. Edit SECTION_SPECS to add or change lessons
- js/data/validate.js: checks the data (unique ids, prerequisites, order). Runs on startup and logs problems to the console
- js/lessons.js: lesson status, locking, navigation and completion
- js/ui/: toast, dialog, moon progress indicator, shared components

## Saved data (localStorage, prefix luauAcademy:v1:)
settings, profile, progress, notes

## Lessons
- Every lesson has: id, title, description, difficulty, prerequisites, estimated minutes, section, a content placeholder and a default status.
- Ids look like `foundations-variables` (section id + slug of the title) and are generated, so they stay consistent.
- A lesson is available when all its prerequisites are complete; otherwise it is locked. Locked lessons can still be opened to see what is needed.
- Lesson URLs look like `#/course/lesson/<id>`. `#/course` resumes the current lesson.
- Completed lessons are saved in `progress.completedLessons`; notes are saved per lesson id.
