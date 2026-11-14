import { esc, route, delegate } from '../utils.js';
import { icon } from '../icons.js';
import { getState, setState } from '../state.js';
import {
  getLesson, getSection, getStatus, completedSet, missingPrerequisites, lockReason, neighbors,
  lessonHref, openLesson, markComplete, markIncomplete, resumeLessonId, formatMinutes, joinTitles,
} from '../lessons.js';
import { showToast } from '../ui/toast.js';
import { confirmDialog } from '../ui/dialog.js';
import { emptyState, statusIcon, statusLabel, lessonPills, difficultyLabel, progressBar } from '../ui/components.js';
import { loadLessonContent } from '../content/index.js';
import { activityProgress } from '../work.js';
import { fmt, explanationHtml, checkHtml, exerciseHtml, wireActivities } from '../ui/activities.js';

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

function lockedPanel(lesson, missing, done) {
  return `
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
}

const STEP_LABELS = [
  ['sec-intro', 'Introduction'],
  ['sec-explain', 'Explanation'],
  ['sec-checks', 'Knowledge Check'],
  ['sec-practice', 'Practical Exercises'],
  ['sec-challenge', 'Final Challenge'],
  ['sec-complete', 'Completion'],
];

function progressHeaderHtml(p) {
  const percent = Math.round((p.done / p.total) * 100);
  return `
    <div class="lesson-progress">
      <span class="lesson-progress-text" data-testid="lesson-progress"><strong>${p.done} of ${p.total}</strong> activities done</span>
      ${progressBar(percent, 'Lesson progress')}
    </div>`;
}

function asideStepsHtml(p, lesson) {
  const counts = { 'sec-checks': p.checks, 'sec-practice': p.exercises, 'sec-challenge': p.challenge };
  const completed = getStatus(lesson.id) === 'completed';
  return `<ol class="lesson-steps plain-list">${STEP_LABELS.map(([id, label]) => {
    const c = counts[id];
    const tracked = Boolean(c) || id === 'sec-complete';
    const finished = c ? c.done === c.total : (id === 'sec-complete' ? completed : false);
    const marker = tracked ? statusIcon(finished ? 'completed' : 'available') : '<span class="step-dot" aria-hidden="true"></span>';
    return `<li><button type="button" data-jump="${id}">${marker}<span>${esc(label)}${c ? ` <small>${c.done}/${c.total}</small>` : ''}</span></button></li>`;
  }).join('')}</ol>`;
}

function completionHtml(lesson, p, status, next) {
  const ready = p.done === p.total;
  if (status === 'completed') {
    return `
      <p class="completion-msg is-pass">${icon('checkCircle', { size: 20 })}<span><strong>Lesson complete.</strong> Great work. ${next ? `Up next: ${esc(next.title)}.` : 'You have finished the whole curriculum!'}</span></p>
      <div class="completion-actions">
        ${next ? `<a class="btn btn-primary" href="${lessonHref(next.id)}" data-nav="next-complete">Continue to ${esc(next.title)} ${icon('arrowRight', { size: 18 })}</a>` : ''}
        <button type="button" class="btn btn-ghost" data-action="incomplete">Mark as not complete</button>
      </div>`;
  }
  return `
    <p class="completion-msg">${ready ? `${icon('checkCircle', { size: 20 })}<span>You have finished every activity. You can complete the lesson now.</span>` : `${icon('info', { size: 20 })}<span>Finish all ${p.total} activities to complete this lesson. You have done ${p.done} so far: ${p.checks.done}/${p.checks.total} questions, ${p.exercises.done}/${p.exercises.total} exercises and ${p.challenge.done}/${p.challenge.total} final challenge.</span>`}</p>
    <div class="completion-actions">
      <button type="button" class="btn btn-primary" data-action="complete"${ready ? '' : ' disabled'}>${icon('check', { size: 18 })} Mark lesson complete</button>
    </div>`;
}

async function renderLesson(panel, { param, isCurrent }) {
  const lesson = getLesson(param);
  if (!lesson) return notFound(panel, param);

  const done = completedSet();
  const status = getStatus(lesson.id, done);
  const section = getSection(lesson.sectionId);
  const { previous, next } = neighbors(lesson.id);
  const missing = missingPrerequisites(lesson.id, done);
  openLesson(lesson.id);

  let content = null;
  if (status !== 'locked') {
    panel.innerHTML = `<p class="loading" role="status">Loading lesson&hellip;</p>`;
    content = await loadLessonContent(lesson);
    if (!isCurrent()) return;
    if (!content) throw new Error(`No content for ${lesson.id}`);
  }
  const p = content ? activityProgress(lesson.id, content) : null;

  const body = status === 'locked' ? lockedPanel(lesson, missing, done) : `
    <section class="lesson-sec" id="sec-intro" aria-labelledby="h-intro"><h3 id="h-intro" tabindex="-1">1. Introduction</h3><p class="lead">${fmt(content.intro)}</p></section>
    <section class="lesson-sec" id="sec-explain" aria-labelledby="h-explain"><h3 id="h-explain" tabindex="-1">2. Explanation</h3>${explanationHtml(content.explain)}</section>
    <section class="lesson-sec" id="sec-checks" aria-labelledby="h-checks"><h3 id="h-checks" tabindex="-1">3. Knowledge Check</h3><p class="sec-note">Answer each question. Take your time: a wrong answer just shows you why.</p>${content.checks.map((c, i) => checkHtml(c, i)).join('')}</section>
    <section class="lesson-sec" id="sec-practice" aria-labelledby="h-practice"><h3 id="h-practice" tabindex="-1">4. Practical Exercises</h3><p class="sec-note">Write the code yourself, then press Run and check. If it is not right, you will get an explanation of what to fix.</p>${content.exercises.map((ex, i) => exerciseHtml(ex, `e${i}`, `Exercise ${i + 1}`, 'exercise')).join('')}</section>
    <section class="lesson-sec" id="sec-challenge" aria-labelledby="h-challenge"><h3 id="h-challenge" tabindex="-1">5. Final Challenge</h3><p class="sec-note">One bigger task that brings this lesson together with things you learned before.</p>${exerciseHtml(content.challenge, 'ch', 'Final Challenge', 'challenge')}</section>
    <section class="lesson-sec" id="sec-complete" aria-labelledby="h-complete"><h3 id="h-complete" tabindex="-1">6. Completion</h3><div id="completion-body">${completionHtml(lesson, p, status, next)}</div></section>`;

  const nextLink = next ? `<a class="btn btn-secondary" href="${lessonHref(next.id)}" data-nav="next">Next lesson ${icon('arrowRight', { size: 18 })}<span class="visually-hidden">: ${esc(next.title)}</span></a>` : '';
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
            <span class="pill">Section ${section.number}: ${esc(section.title)}</span>
            ${lessonPills(lesson)}
          </div>
          <p class="lesson-description">${esc(lesson.description)}</p>
          ${p ? `<div id="header-progress">${progressHeaderHtml(p)}</div>` : ''}
        </header>
        ${body}
        <footer class="lesson-foot">
          ${previousLink}
          <span class="spacer"></span>
          <a class="btn btn-ghost" href="${route('curriculum', 'all')}" data-nav="curriculum">${icon('curriculum', { size: 18 })} Curriculum</a>
          ${nextLink}
        </footer>
      </article>

      <aside class="course-aside" aria-label="Lesson tools">
        ${p ? `<section class="card card-pad" aria-labelledby="steps-title"><h2 class="card-title" id="steps-title">In this lesson</h2><div id="aside-steps">${asideStepsHtml(p, lesson)}</div></section>` : ''}
        <section class="card card-pad" aria-labelledby="details-title">
          <h2 class="card-title" id="details-title">Lesson details</h2>
          <dl class="stat-list">
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

  const layout = panel.querySelector('.course-layout');

  const refreshProgress = () => {
    const q = activityProgress(lesson.id, content);
    layout.querySelector('#header-progress').innerHTML = progressHeaderHtml(q);
    layout.querySelector('#aside-steps').innerHTML = asideStepsHtml(q, lesson);
    layout.querySelector('#completion-body').innerHTML = completionHtml(lesson, q, getStatus(lesson.id), next);
  };

  if (content) {
    wireActivities(layout, lesson, content, () => {
      refreshProgress();
      const q = activityProgress(lesson.id, content);
      if (q.done === q.total && getStatus(lesson.id) !== 'completed') showToast('Every activity is done. You can mark the lesson complete.');
    });
  }

  delegate(layout, 'click', '[data-jump]', (_event, button) => {
    const target = layout.querySelector(`#${button.dataset.jump}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const heading = target?.querySelector('h3');
    heading?.focus({ preventScroll: true });
  });

  const rerender = () => {
    const y = window.scrollY;
    return renderLesson(panel, { param, isCurrent }).then(() => window.scrollTo(0, y));
  };

  delegate(layout, 'click', '[data-action="complete"]', () => {
    if (content && activityProgress(lesson.id, content).done < activityProgress(lesson.id, content).total) return;
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
