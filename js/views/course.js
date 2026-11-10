import { esc, route, delegate } from '../utils.js';
import { icon } from '../icons.js';
import { getState, setState } from '../state.js';
import {
  getLesson, getSection, getStatus, completedSet, missingPrerequisites, lockReason, dependents, neighbors,
  lessonHref, openLesson, markComplete, markIncomplete, resumeLessonId, formatMinutes, joinTitles,
} from '../lessons.js';
import { showToast } from '../ui/toast.js';
import { confirmDialog } from '../ui/dialog.js';
import { emptyState, skeletonLines, statusIcon, statusLabel, lessonPills, difficultyLabel } from '../ui/components.js';

/** Shown when the address points at a lesson id that does not exist. */
function notFound(panel, id) {
  panel.innerHTML = emptyState({
    iconName: 'search',
    title: 'Lesson not found',
    body: `There is no lesson called "${id}". The link may be out of date.`,
    actions: [
      { label: 'Open Curriculum', href: route('curriculum', 'all'), variant: 'primary' },
      { label: 'Resume learning', href: route('course') },
    ],
  });
}

function lessonLinkList(items, done) {
  return `<ul class="link-list plain-list">${items.map((item) => {
    const status = getStatus(item.id, done);
    return `
      <li><a class="link-row" href="${lessonHref(item.id)}">
        ${statusIcon(status)}
        <span class="link-row-text"><span class="visually-hidden">${esc(statusLabel(status))}: </span>${esc(item.title)}<small>${esc(getSection(item.sectionId).title)}</small></span>
      </a></li>`;
  }).join('')}</ul>`;
}

function sectionNav(lesson, done) {
  const section = getSection(lesson.sectionId);
  return `
    <ol class="section-nav plain-list">
      ${section.lessons.map((item) => {
        const status = getStatus(item.id, done);
        return `<li><a href="${lessonHref(item.id)}"${item.id === lesson.id ? ' aria-current="true"' : ''}>
          ${statusIcon(status)}<span><span class="visually-hidden">${esc(statusLabel(status))}: </span>${esc(item.title)}</span></a></li>`;
      }).join('')}
    </ol>`;
}

function renderLesson(panel, { param }) {
  const lesson = getLesson(param);
  if (!lesson) return notFound(panel, param);

  const done = completedSet();
  const status = getStatus(lesson.id, done);
  const section = getSection(lesson.sectionId);
  const { previous, next } = neighbors(lesson.id);
  const missing = missingPrerequisites(lesson.id, done);
  const prerequisites = lesson.prerequisites.map(getLesson);
  const unlocks = dependents(lesson.id);
  openLesson(lesson.id);

  const lockedBody = () => `
    <section class="lock-panel" aria-labelledby="lock-title" data-testid="lock-panel">
      <span class="lock-icon">${icon('lock', { size: 24 })}</span>
      <div>
        <h3 id="lock-title">This lesson is locked</h3>
        <p>${esc(lockReason(lesson.id, done))} Lessons build on each other, so these come first:</p>
        ${lessonLinkList(missing, done)}
        <p class="lock-actions">
          <a class="btn btn-primary" href="${lessonHref(missing[0].id)}">Go to ${esc(missing[0].title)} ${icon('arrowRight', { size: 18 })}</a>
          <a class="btn btn-secondary" href="${route('course')}">Open the lesson I can start now</a>
        </p>
      </div>
    </section>`;

  const unlockedBody = `
    <section aria-labelledby="h-content">
      <h3 id="h-content">Lesson content</h3>
      <div class="content-placeholder">
        <p><strong>Lesson content placeholder.</strong> The full written lesson for &ldquo;${esc(lesson.title)}&rdquo; will appear here in a later stage.</p>
        ${skeletonLines([90, 100, 75, 95, 60])}
      </div>
    </section>
    ${prerequisites.length ? `<section aria-labelledby="h-prereq"><h3 id="h-prereq">Prerequisites</h3>${lessonLinkList(prerequisites, done)}</section>` : ''}
    ${unlocks.length ? `<section aria-labelledby="h-unlocks"><h3 id="h-unlocks">Completing this lesson helps unlock</h3>${lessonLinkList(unlocks, done)}</section>` : ''}`;

  const completeButton = status === 'locked' ? '' : status === 'completed'
    ? `<button type="button" class="btn btn-ghost" data-action="incomplete">Mark as not complete</button>`
    : `<button type="button" class="btn btn-primary" data-action="complete">${icon('check', { size: 18 })} Mark lesson complete</button>`;

  const nextLink = next ? `<a class="btn ${status === 'completed' ? 'btn-primary' : 'btn-secondary'}" href="${lessonHref(next.id)}" data-nav="next">Next lesson ${icon('arrowRight', { size: 18 })}<span class="visually-hidden">: ${esc(next.title)}</span></a>` : '';
  const previousLink = previous ? `<a class="btn btn-secondary" href="${lessonHref(previous.id)}" data-nav="previous">${icon('arrowLeft', { size: 18 })} Previous lesson<span class="visually-hidden">: ${esc(previous.title)}</span></a>` : '';

  panel.innerHTML = `
    <div class="course-layout" data-lesson-id="${esc(lesson.id)}" data-status="${status}">
      <article class="card lesson" aria-labelledby="lesson-title">
        <header class="lesson-head">
          <nav aria-label="Breadcrumb">
            <ol class="breadcrumb">
              <li><a href="${route('curriculum', 'all')}">Curriculum</a></li>
              <li>${esc(section.title)}</li>
              <li aria-current="page">${esc(lesson.title)}</li>
            </ol>
          </nav>
          <h2 id="lesson-title" tabindex="-1">${esc(lesson.title)}</h2>
          <div class="pill-row">
            <span class="pill ${status === 'completed' ? 'pill-accent' : ''}" data-testid="status-pill">${esc(statusLabel(status))}</span>
            ${lessonPills(lesson)}
          </div>
          <p class="lesson-description">${esc(lesson.description)}</p>
        </header>

        ${status === 'locked' ? lockedBody() : unlockedBody}

        <footer class="lesson-foot">
          ${previousLink}
          ${completeButton}
          <span class="spacer"></span>
          ${nextLink}
        </footer>
      </article>

      <aside class="course-aside" aria-label="Lesson tools">
        <section class="card card-pad" aria-labelledby="details-title">
          <h2 class="card-title" id="details-title">Lesson details</h2>
          <dl class="stat-list">
            <div class="stat-row"><dt>Section</dt><dd>${section.number}. ${esc(section.title)}</dd></div>
            <div class="stat-row"><dt>Difficulty</dt><dd>${esc(difficultyLabel(lesson.difficulty))}</dd></div>
            <div class="stat-row"><dt>Estimated time</dt><dd>${esc(formatMinutes(lesson.minutes))}</dd></div>
            <div class="stat-row"><dt>Notes</dt><dd><a href="${route('course', 'notes', lesson.id)}">Open notes</a></dd></div>
          </dl>
        </section>
        <section class="card card-pad" aria-labelledby="section-nav-title">
          <h2 class="card-title" id="section-nav-title">In this section</h2>
          ${sectionNav(lesson, done)}
        </section>
      </aside>
    </div>`;

  const rerender = () => {
    renderLesson(panel, { param });
    panel.querySelector('#lesson-title')?.focus({ preventScroll: true });
  };

  const layout = panel.querySelector('.course-layout');

  delegate(layout, 'click', '[data-action="complete"]', () => {
    const unlocked = markComplete(lesson.id);
    if (unlocked === null) return showToast('Finish the prerequisites before completing this lesson.');
    showToast(unlocked.length ? `Lesson complete. Unlocked: ${joinTitles(unlocked)}.` : 'Lesson complete.');
    rerender();
  });

  delegate(layout, 'click', '[data-action="incomplete"]', () => {
    markIncomplete(lesson.id);
    showToast('Lesson marked as not complete.');
    rerender();
  });
}

function renderNotes(panel, { param }) {
  const lesson = getLesson(param);
  if (!lesson) return notFound(panel, param);

  const saved = getState('notes')[lesson.id] ?? '';
  panel.innerHTML = `
    <section class="card card-pad notes-card" aria-labelledby="notes-title">
      <h2 id="notes-title">Notes: ${esc(lesson.title)}</h2>
      <p class="card-lead">Write anything you want to remember. Notes save automatically on this device.</p>
      <div class="field notes-field">
        <label for="notes-input">Your notes for this lesson</label>
        <textarea class="textarea" id="notes-input" placeholder="Type your notes here">${esc(saved)}</textarea>
        <div class="notes-foot">
          <span class="save-state" id="notes-status">${saved ? 'Saved on this device.' : 'Nothing saved yet.'}</span>
          <span class="notes-actions">
            <a class="btn btn-ghost btn-sm" href="${lessonHref(lesson.id)}">Back to lesson</a>
            <button type="button" class="btn btn-secondary btn-sm" id="notes-clear">Clear notes</button>
          </span>
        </div>
      </div>
    </section>`;

  const input = panel.querySelector('#notes-input');
  const status = panel.querySelector('#notes-status');

  input.addEventListener('input', () => {
    setState('notes', { [lesson.id]: input.value });
    status.textContent = 'Saved on this device.';
  });

  panel.querySelector('#notes-clear').addEventListener('click', async () => {
    if (!input.value) return showToast('There are no notes to clear.');
    const confirmed = await confirmDialog({
      title: 'Clear these notes?',
      message: 'Your notes for this lesson will be deleted from this device.',
      confirmLabel: 'Clear notes',
      danger: true,
    });
    if (!confirmed) return;
    input.value = '';
    setState('notes', { [lesson.id]: '' });
    status.textContent = 'Nothing saved yet.';
    showToast('Notes cleared.');
  });
}

function renderResources(panel, { param }) {
  const lesson = getLesson(param);
  if (!lesson) return notFound(panel, param);
  panel.innerHTML = emptyState({
    iconName: 'link',
    title: 'No resources yet',
    body: `Reference links and downloads for "${lesson.title}" will be listed here.`,
    actions: [{ label: 'Back to lesson', href: lessonHref(lesson.id), variant: 'primary' }],
  });
}

export default {
  id: 'course',
  title: 'My Course',
  icon: 'course',
  description: 'Work through your lessons, keep notes and see what comes next.',
  // "#/course" has no lesson in it, so fill in the one to resume. Unknown ids are kept so they can show "not found".
  resolveParam: (param) => param || resumeLessonId(),
  tabs: [
    { id: 'lesson', label: 'Lesson', render: renderLesson },
    { id: 'notes', label: 'Notes', render: renderNotes },
    { id: 'resources', label: 'Resources', render: renderResources },
  ],
};
