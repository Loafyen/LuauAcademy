// Sidebar navigation, theme button, and the slide-in drawer used on phones.
import { esc, route } from '../utils.js';
import { icon } from '../icons.js';
import { effectiveTheme } from '../theme.js';

const phoneQuery = window.matchMedia('(max-width: 719.98px)');

let els = {};
let drawerOpen = false;

function setDrawer(open, { restoreFocus = true } = {}) {
  drawerOpen = open;
  els.sidebar.classList.toggle('is-open', open);
  els.scrim.hidden = !open;
  els.menuButton.setAttribute('aria-expanded', String(open));
  els.menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('no-scroll', open && phoneQuery.matches);
  syncInert();

  if (open) {
    els.navList.querySelector('a')?.focus();
  } else if (restoreFocus && phoneQuery.matches) {
    els.menuButton.focus();
  }
}

/** On phones, hide the closed drawer from keyboards and screen readers; hide the page behind an open one. */
function syncInert() {
  const onPhone = phoneQuery.matches;
  els.sidebar.inert = onPhone && !drawerOpen;
  els.content.inert = onPhone && drawerOpen;
}

export function closeDrawer(options) {
  if (drawerOpen) setDrawer(false, options);
}

export function setActiveNav(viewId) {
  els.navList.querySelectorAll('a').forEach((link) => {
    if (link.dataset.view === viewId) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

export function updateThemeButton() {
  const isDark = effectiveTheme() === 'dark';
  els.themeToggle.innerHTML = `${icon(isDark ? 'sun' : 'moon')}<span class="nav-label">${isDark ? 'Switch to light theme' : 'Switch to dark theme'}</span>`;
  els.themeToggle.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
}

export function initShell({ views, onToggleTheme }) {
  els = {
    sidebar: document.getElementById('sidebar'),
    scrim: document.getElementById('scrim'),
    content: document.getElementById('content'),
    navList: document.getElementById('nav-list'),
    menuButton: document.getElementById('menu-button'),
    themeToggle: document.getElementById('theme-toggle'),
    skipLink: document.getElementById('skip-link'),
  };

  els.navList.innerHTML = views.map((view) => `
    <li>
      <a class="nav-link" href="${route(view.id)}" data-view="${esc(view.id)}" title="${esc(view.title)}">
        ${icon(view.icon)}<span class="nav-label">${esc(view.title)}</span>
      </a>
    </li>`).join('');

  els.menuButton.innerHTML = icon('menu');
  updateThemeButton();

  els.menuButton.addEventListener('click', () => setDrawer(!drawerOpen));
  els.scrim.addEventListener('click', () => setDrawer(false));
  els.themeToggle.addEventListener('click', onToggleTheme);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawerOpen) setDrawer(false);
  });
  phoneQuery.addEventListener('change', () => {
    if (!phoneQuery.matches) setDrawer(false, { restoreFocus: false });
    syncInert();
  });

  // The skip link would change the hash and confuse the router, so move focus directly.
  els.skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('main').focus();
  });

  syncInert();
}
