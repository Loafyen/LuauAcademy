// HTML builders for patterns that repeat across sections.
import { esc } from '../utils.js';
import { icon } from '../icons.js';
import { difficulties } from '../data/curriculum.js';
import { formatMinutes, STATUS_LABELS } from '../lessons.js';

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

// ---- Lesson-related builders (used by Curriculum, My Course and the Dashboard) ----

export function difficultyLabel(id) {
  return difficulties.find((d) => d.id === id)?.label ?? id;
}

/** Round status marker: check for completed, lock for locked, open circle for available. */
export function statusIcon(status) {
  const name = status === 'completed' ? 'checkCircle' : status === 'locked' ? 'lock' : 'circle';
  return `<span class="status-icon status-${status}" aria-hidden="true">${icon(name, { size: 22 })}</span>`;
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

/** Difficulty and time pills for a lesson. */
export function lessonPills(lesson) {
  return `<span class="pill">${esc(difficultyLabel(lesson.difficulty))}</span><span class="pill">${icon('clock', { size: 14 })} ${esc(formatMinutes(lesson.minutes))}</span>`;
}

export function progressBar(percent, label) {
  return `<div class="progress-bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>`;
}
