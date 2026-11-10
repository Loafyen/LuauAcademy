import { esc, route } from '../utils.js';
import { icon } from '../icons.js';
import { sections } from '../data/curriculum.js';
import {
  completedSet, getStatus, lockReason, lessonHref, sectionStats, overallStats, resumeLessonId, getLesson, formatMinutes,
} from '../lessons.js';
import { emptyState, statusIcon, statusLabel, lessonPills, progressBar } from '../ui/components.js';

const FILTERS = {
  all: { label: 'All lessons', matches: () => true },
  available: { label: 'Available', matches: (status) => status === 'available' },
  completed: { label: 'Completed', matches: (status) => status === 'completed' },
  locked: { label: 'Locked', matches: (status) => status === 'locked' },
};

const EMPTY_MESSAGES = {
  available: { title: 'Nothing available right now', body: 'Every lesson you can start is already complete, or is waiting on a prerequisite.' },
  completed: { title: 'No completed lessons yet', body: 'Lessons you finish will be collected here.' },
  locked: { title: 'No locked lessons', body: 'Every lesson is unlocked. Nicely done.' },
};

function lessonRow(lesson, status, done) {
  const reason = status === 'locked' ? lockReason(lesson.id, done) : '';
  return `
    <li>
      <a class="lesson-row is-${status}" href="${lessonHref(lesson.id)}" data-lesson-id="${esc(lesson.id)}" data-status="${status}">
        ${statusIcon(status)}
        <span class="lesson-row-body">
          <span class="lesson-row-title"><span class="visually-hidden">${esc(statusLabel(status))}: </span>${esc(lesson.title)}</span>
          <span class="lesson-row-desc">${esc(lesson.description)}</span>
          ${reason ? `<span class="lesson-row-lock">${icon('lock', { size: 14 })} Locked. ${esc(reason)}</span>` : ''}
        </span>
        <span class="lesson-row-meta">${lessonPills(lesson)}</span>
      </a>
    </li>`;
}

function sectionHtml(section, filterId, done, openIds) {
  const rows = section.lessons
    .map((lesson) => ({ lesson, status: getStatus(lesson.id, done) }))
    .filter(({ status }) => FILTERS[filterId].matches(status));
  if (!rows.length) return '';

  const stats = sectionStats(section.id, done);
  const shown = filterId === 'all' ? '' : ` &middot; showing ${rows.length}`;
  return `
    <details class="card category" data-section-id="${esc(section.id)}"${openIds.has(section.id) ? ' open' : ''}>
      <summary>
        <span class="category-info">
          <h3><span class="section-number">Section ${section.number}</span>${esc(section.title)}</h3>
          <p>${esc(section.summary)}</p>
          ${progressBar(stats.percent, `${section.title} progress`)}
        </span>
        <span class="category-meta">
          <span class="pill ${stats.done === stats.total ? 'pill-accent' : ''}">${stats.done} of ${stats.total} complete${shown}</span>
          <span class="pill">${icon('clock', { size: 14 })} ${esc(formatMinutes(stats.minutes))}</span>
        </span>
        ${icon('chevronDown').replace('class="icon"', 'class="icon chevron"')}
      </summary>
      <ul class="lesson-rows plain-list">${rows.map(({ lesson, status }) => lessonRow(lesson, status, done)).join('')}</ul>
    </details>`;
}

function makeTab(filterId) {
  return (panel) => {
    const done = completedSet();
    const overall = overallStats(done);
    const resume = getLesson(resumeLessonId());

    // Open the section holding the lesson to resume; when filtering, open everything that matches.
    const openIds = new Set(filterId === 'all' ? [resume?.sectionId] : sections.map((s) => s.id));
    const html = sections.map((section) => sectionHtml(section, filterId, done, openIds)).join('');

    const summary = `
      <section class="card card-pad curriculum-summary" aria-labelledby="overall-title">
        <div class="curriculum-summary-main">
          <h2 id="overall-title">${overall.done} of ${overall.total} lessons complete</h2>
          <p class="card-lead">About ${esc(formatMinutes(overall.minutesLeft))} of learning left across ${sections.length} sections.</p>
          ${progressBar(overall.percent, 'Overall course progress')}
        </div>
        ${resume && overall.done < overall.total ? `<a class="btn btn-primary" href="${lessonHref(resume.id)}">${overall.done ? 'Continue' : 'Start'}: ${esc(resume.title)} ${icon('arrowRight', { size: 18 })}</a>` : ''}
      </section>`;

    let body;
    if (!html) {
      const message = EMPTY_MESSAGES[filterId];
      body = emptyState({
        iconName: 'list',
        title: message.title,
        body: message.body,
        actions: [{ label: 'Show all lessons', href: route('curriculum', 'all'), variant: 'primary' }],
      });
    } else {
      body = `
        <div class="toolbar">
          <p>${filterId === 'all' ? 'Locked lessons open once their prerequisites are complete. You can still open them to see what is needed.' : `Showing ${esc(FILTERS[filterId].label.toLowerCase())} lessons.`}</p>
          <div class="toolbar-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-expand="all">Expand all</button>
            <button type="button" class="btn btn-secondary btn-sm" data-expand="none">Collapse all</button>
          </div>
        </div>
        <div class="category-list">${html}</div>`;
    }

    panel.innerHTML = summary + body;

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
  description: 'Every lesson in order, with what you need before you start each one.',
  tabs: Object.entries(FILTERS).map(([id, filter]) => ({ id, label: filter.label, render: makeTab(id) })),
};
