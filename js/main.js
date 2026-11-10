// Entry point: wires state, theme, navigation and the router together.
import { subscribe } from './state.js';
import { initTheme, toggleTheme } from './theme.js';
import { registerViews, startRouter } from './router.js';
import { validateCurriculum } from './data/validate.js';
import { initShell, setActiveNav, closeDrawer, updateThemeButton } from './ui/shell.js';

import dashboard from './views/dashboard.js';
import course from './views/course.js';
import curriculum from './views/curriculum.js';
import placement from './views/placement.js';
import practice from './views/practice.js';
import settings from './views/settings.js';

// Order here is the order of the sidebar.
const views = [dashboard, course, curriculum, placement, practice, settings];

const curriculumProblems = validateCurriculum();
if (curriculumProblems.length) console.error('Curriculum data problems:\n- ' + curriculumProblems.join('\n- '));

registerViews(views);
initTheme();
initShell({ views, onToggleTheme: toggleTheme });
subscribe((slice) => { if (slice === 'settings') updateThemeButton(); });

startRouter(document.getElementById('view-root'), {
  onRouteChange: ({ viewId }) => {
    setActiveNav(viewId);
    closeDrawer({ restoreFocus: false });
  },
});
