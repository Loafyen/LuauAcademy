// Applies the saved theme preference ("dark", "light" or "system") and the reduce-motion switch.
import { getState, setState, subscribe } from './state.js';

const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

export function effectiveTheme() {
  const { theme } = getState('settings');
  if (theme === 'system') return lightQuery.matches ? 'light' : 'dark';
  return theme === 'light' ? 'light' : 'dark';
}

export function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = effectiveTheme();
  if (getState('settings').reduceMotion) root.dataset.motion = 'reduced';
  else delete root.dataset.motion;
}

export function initTheme() {
  applyTheme();
  lightQuery.addEventListener('change', applyTheme);
  subscribe((slice) => { if (slice === 'settings') applyTheme(); });
}

/** Quick toggle from the sidebar: switches between dark and light. */
export function toggleTheme() {
  setState('settings', { theme: effectiveTheme() === 'dark' ? 'light' : 'dark' });
}
