// Minimal hash router: "#/section/tab". Works on GitHub Pages with no server configuration.
import { esc, route } from './utils.js';
import { emptyState } from './ui/components.js';

const views = new Map();
let root = null;
let onRoute = () => {};
let current = { viewId: null };
let hasRendered = false;
let renderCounter = 0;

/**
 * A view looks like:
 * { id, title, description, icon, tabs: [{ id, label, render(panelElement, context) }], resolveParam? }
 * A view may define resolveParam(param) to fill in or correct the third URL segment
 * (My Course uses it so "#/course" becomes "#/course/lesson/<the lesson to resume>").
 */
export function registerViews(list) {
  list.forEach((view) => views.set(view.id, view));
}

function parseHash() {
  const [viewId = 'dashboard', tabId = null, rawParam = null] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  let param = rawParam;
  try { param = rawParam ? decodeURIComponent(rawParam) : null; } catch (_) { /* keep the raw value */ }
  return { viewId: viewId || 'dashboard', tabId, param };
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
  const { viewId, tabId, param: rawParam } = parseHash();
  const view = views.get(viewId) ?? notFoundView;
  const tab = view.tabs.find((t) => t.id === tabId) ?? view.tabs[0];
  const viewChanged = current.viewId !== view.id;

  let param = rawParam;
  if (view.resolveParam) {
    param = view.resolveParam(rawParam);
    if (param !== rawParam) history.replaceState(null, '', route(view.id, tab.id, param));
  }

  if (viewChanged) {
    root.innerHTML = headerHtml(view, tab.id);
  } else {
    root.querySelectorAll('.subnav-link').forEach((link) => {
      if (link.dataset.tab === tab.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  current = { viewId: view.id };

  // Keep every sub-navigation link pointing at the same item (for example the same lesson).
  if (view.resolveParam) {
    root.querySelectorAll('.subnav-link').forEach((link) => link.setAttribute('href', route(view.id, link.dataset.tab, param)));
  }

  const panel = root.querySelector('#view-panel');
  panel.innerHTML = '';
  const renderId = String(++renderCounter);
  panel.dataset.renderId = renderId;
  const isCurrent = () => panel.dataset.renderId === renderId;
  const showFailure = (error) => {
    console.error(`Could not render ${view.id}/${tab.id}`, error);
    if (!isCurrent()) return;
    panel.innerHTML = emptyState({
      iconName: 'info',
      title: 'Something went wrong',
      body: 'This page could not be displayed. Try reloading, or go back to the Dashboard.',
      actions: [{ label: 'Go to Dashboard', href: route('dashboard'), variant: 'primary' }],
    });
  };
  try {
    // A renderer may be async (My Course loads lesson text on demand). isCurrent() lets it stop if you navigate away.
    const result = tab.render(panel, { view, tab, param, isCurrent });
    if (result && typeof result.catch === 'function') result.catch(showFailure);
  } catch (error) {
    showFailure(error);
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
