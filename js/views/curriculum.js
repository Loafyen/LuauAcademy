import { esc, route } from '../utils.js';
import { icon } from '../icons.js';
import { categories, levels } from '../data/curriculum.js';
import { emptyState, skeletonLines } from '../ui/components.js';

const PLACEHOLDER_ROWS = 3;

function levelLabel(id) {
  return levels.find((level) => level.id === id)?.label ?? id;
}

function categoryHtml(category, isOpen) {
  const count = category.lessons.length;
  const rows = count
    ? '' // Real lesson rows are added in the curriculum stage.
    : Array.from({ length: PLACEHOLDER_ROWS }, () => `
        <li>
          <a class="lesson-row" href="${route('course', 'lesson')}">
            <span class="status-dot" aria-hidden="true"></span>
            ${skeletonLines([55])}
            <span class="visually-hidden">Lesson title placeholder, open in My Course</span>
            <span class="pill">Not started</span>
          </a>
        </li>`).join('');

  return `
    <details class="card category"${isOpen ? ' open' : ''}>
      <summary>
        <span class="category-info">
          <h3>${esc(category.title)}</h3>
          <p>${esc(category.summary)}</p>
        </span>
        <span class="category-meta">
          <span class="pill">${esc(levelLabel(category.level))}</span>
          <span class="pill">${count} ${count === 1 ? 'lesson' : 'lessons'}</span>
        </span>
        ${icon('chevronDown')}
      </summary>
      <ul class="lesson-rows plain-list">${rows}</ul>
    </details>`.replace(/(<svg class=")icon("[^>]*>)(?=\s*<\/summary>)/, '$1icon chevron$2');
}

function makeTab(levelId) {
  return (panel) => {
    const visible = levelId === 'all' ? categories : categories.filter((c) => c.level === levelId);

    if (!visible.length) {
      panel.innerHTML = emptyState({
        iconName: 'list',
        title: 'No categories at this level',
        body: 'Try another level, or view every category together.',
        actions: [{ label: 'Show all levels', href: route('curriculum', 'all'), variant: 'primary' }],
      });
      return;
    }

    panel.innerHTML = `
      <div class="toolbar">
        <p>${visible.length} ${visible.length === 1 ? 'category' : 'categories'}. Category names and lesson rows are placeholders for now.</p>
        <div class="toolbar-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-expand="all">Expand all</button>
          <button type="button" class="btn btn-secondary btn-sm" data-expand="none">Collapse all</button>
        </div>
      </div>
      <div class="category-list">${visible.map((c, i) => categoryHtml(c, i === 0)).join('')}</div>`;

    panel.querySelectorAll('[data-expand]').forEach((button) => {
      button.addEventListener('click', () => {
        const open = button.dataset.expand === 'all';
        panel.querySelectorAll('details.category').forEach((d) => { d.open = open; });
      });
    });
  };
}

export default {
  id: 'curriculum',
  title: 'Curriculum',
  icon: 'curriculum',
  description: 'Every lesson, grouped by category and level.',
  tabs: [
    { id: 'all', label: 'All levels', render: makeTab('all') },
    ...levels.map((level) => ({ id: level.id, label: level.label, render: makeTab(level.id) })),
  ],
};
