// HTML builders for patterns that repeat across sections.
import { esc } from '../utils.js';
import { icon } from '../icons.js';

function actionHtml(action) {
  const variant = action.variant || 'secondary';
  const attrs = action.href ? `href="${esc(action.href)}"` : `type="button" data-action="${esc(action.action || '')}"`;
  const tag = action.href ? 'a' : 'button';
  return `<${tag} class="btn btn-${variant}" ${attrs}>${esc(action.label)}</${tag}>`;
}

/** Centered empty state with an icon, short explanation and next actions. */
export function emptyState({ iconName = 'info', title, body, actions = [] }) {
  return `
    <div class="empty-state">
      <span class="empty-icon">${icon(iconName, { size: 24 })}</span>
      <h2>${esc(title)}</h2>
      <p>${esc(body)}</p>
      ${actions.length ? `<div class="empty-actions">${actions.map(actionHtml).join('')}</div>` : ''}
    </div>`;
}

/** Shown when a button leads to a feature that is built in a later stage. */
export function laterStagePanel({ title, body, actions = [] }) {
  return `<div class="card card-pad">${emptyState({ iconName: 'info', title, body, actions })}</div>`;
}

export function skeletonLines(widths = [80, 100, 60]) {
  return `<span class="skeleton-stack" aria-hidden="true">${widths.map((w) => `<span class="skeleton" style="width:${w}%"></span>`).join('')}</span>`;
}
