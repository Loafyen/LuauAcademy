// Minimal hash router: "#/section/tab". Works on GitHub Pages with no server configuration.
import { esc, route } from './utils.js';
import { emptyState } from './ui/components.js';

const views = new Map();
let root = null;
let onRoute = () => {};
let current = { viewId: null };
let hasRendered = false;

/**
 * A view looks like:
 * { id, title, description, icon, tabs: [{ id, label, render(panelElement, context) }] }
 */
export function registerViews(list) {
  list.forEach((view) => views.set(view.id, view));
}

function parseHash() {
  const [viewId = 'dashboard', tabId = null] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { viewId: viewId || 'dashboard', tabId };
}

function headerHtml(view, activeTabId) {
  const tabs = view.tabs.map((tab) => `
    <a class="subnav-link" href="${route(view.id, tab.id)}" data-tab="${esc(tab.id)}"${tab.id === activeTabId ? ' aria-current="page"' : ''}>${esc(tab.label)}</a>`).join('');
  return `
    <header class="page-header">
      <div class="page-heading">
        <h1 id="page-title" tabindex="-1">${esc(view.title)}</h1>
        <p>${esc(view.description)}</p>
      </div>
      <nav class="subnav" aria-label="${esc(view.title)} sections">${tabs}</nav>
    </header>
    <div class="view-panel" id="view-panel"></div>`;
}

const notFoundView = {
  id: 'not-found',
  title: 'Page not found',
  description: 'That address does not match any page in Luau Academy.',
  tabs: [{
    id: 'main',
    label: 'Not found',
    render(panel) {
      panel.innerHTML = emptyState({
        iconName: 'search',
        title: 'Nothing here',
        body: 'The link may be out of date. Head back to the Dashboard to keep learning.',
        actions: [{ label: 'Go to Dashboard', href: route('dashboard'), variant: 'primary' }],
      });
    },
  }],
};

function render() {
  const { viewId, tabId } = parseHash();
  const view = views.get(viewId) ?? notFoundView;
  const tab = view.tabs.find((t) => t.id === tabId) ?? view.tabs[0];
  const viewChanged = current.viewId !== view.id;

  if (viewChanged) {
    root.innerHTML = headerHtml(view, tab.id);
  } else {
    root.querySelectorAll('.subnav-link').forEach((link) => {
      if (link.dataset.tab === tab.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  current = { viewId: view.id };

  const panel = root.querySelector('#view-panel');
  panel.innerHTML = '';
  try {
    tab.render(panel, { view, tab });
  } catch (error) {
    console.error(`Could not render ${view.id}/${tab.id}`, error);
    panel.innerHTML = emptyState({
      iconName: 'info',
      title: 'Something went wrong',
      body: 'This page could not be displayed. Try reloading, or go back to the Dashboard.',
      actions: [{ label: 'Go to Dashboard', href: route('dashboard'), variant: 'primary' }],
    });
  }

  document.title = `${view.title}: ${tab.label} | Luau Academy`;
  document.body.dataset.view = view.id;
  onRoute({ viewId: view.id, tabId: tab.id });

  if (viewChanged && hasRendered) {
    window.scrollTo(0, 0);
    root.querySelector('#page-title')?.focus({ preventScroll: true });
  }
  hasRendered = true;
}

export function startRouter(outlet, { onRouteChange } = {}) {
  root = outlet;
  if (onRouteChange) onRoute = onRouteChange;
  window.addEventListener('hashchange', render);
  render();
}
