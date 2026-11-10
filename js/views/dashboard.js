import { esc, route } from '../utils.js';
import { icon } from '../icons.js';
import { getState } from '../state.js';
import { progressSummary } from '../progress.js';
import { moonSvg, phaseName } from '../ui/moon.js';
import { getLesson, getSection, lessonHref, resumeLessonId } from '../lessons.js';
import { emptyState, lessonPills } from '../ui/components.js';

let moonHasRisen = false; // the moon rises once per visit, not on every tab change

const QUICK_ACCESS = [
  { view: 'course', icon: 'course', title: 'My Course', text: 'Pick up your current lesson.' },
  { view: 'curriculum', icon: 'curriculum', title: 'Curriculum', text: 'See every lesson by category.' },
  { view: 'placement', icon: 'placement', title: 'Placement Test', text: 'Find the right place to start.' },
  { view: 'practice', icon: 'practice', title: 'Practice Arena', text: 'Sharpen your skills with challenges.' },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function recommendedHtml(progress) {
  const lesson = getLesson(resumeLessonId());
  const finished = progress.total > 0 && progress.done >= progress.total;
  if (!lesson || finished) {
    return `
      <section class="card card-pad recommend" aria-labelledby="recommend-title">
        <h2 id="recommend-title">Recommended lesson</h2>
        <p class="card-lead">${finished ? 'You have completed every lesson. Revisit any of them from the Curriculum.' : 'No lessons are available yet.'}</p>
        <div><a class="btn btn-secondary" href="${route('curriculum')}">Browse Curriculum</a></div>
      </section>`;
  }
  const started = progress.done > 0;
  return `
    <section class="card card-pad recommend" aria-labelledby="recommend-title">
      <h2 id="recommend-title">${started ? 'Up next' : 'Recommended lesson'}</h2>
      <div class="recommend-box">
        <div class="recommend-top">
          <span class="pill pill-accent">${esc(getSection(lesson.sectionId).title)}</span>
        </div>
        <h3>${esc(lesson.title)}</h3>
        <p class="card-lead">${esc(lesson.description)}</p>
        <div class="pill-row">${lessonPills(lesson)}</div>
      </div>
      <div><a class="btn btn-primary" href="${lessonHref(lesson.id)}">${started ? 'Continue lesson' : 'Start lesson'} ${icon('arrowRight', { size: 18 })}</a></div>
    </section>`;
}

function renderOverview(panel) {
  const progress = progressSummary();
  const name = getState('profile').name.trim();
  const hasStarted = progress.done > 0 || Boolean(progress.currentLessonId);
  const intro = hasStarted
    ? 'Pick up where you left off.'
    : 'Your course is ready when you are. Start with a lesson, or take the placement test to find your level.';
  const moonClass = moonHasRisen ? '' : ' moon-rise';
  moonHasRisen = true;

  panel.innerHTML = `
    <section class="card hero" aria-labelledby="welcome-title">
      <div class="hero-copy">
        <h2 class="hero-title" id="welcome-title">${esc(greeting())}${name ? `, ${esc(name)}` : ''}.</h2>
        <p>${esc(intro)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${route('course')}">Continue Learning ${icon('arrowRight', { size: 18 })}</a>
          <a class="btn btn-secondary" href="${route('curriculum')}">Browse Curriculum</a>
        </div>
      </div>
      <figure class="hero-moon${moonClass}">
        ${moonSvg(progress.percent)}
        <figcaption>
          <strong>${esc(phaseName(progress.percent))}</strong>
          <span>${progress.percent}% of the course complete</span>
        </figcaption>
      </figure>
    </section>

    <div class="two-col">
      <section class="card card-pad" aria-labelledby="progress-title">
        <h2 class="card-title" id="progress-title">Progress overview</h2>
        <dl class="stat-list">
          <div class="stat-row">
            <dt>Lessons completed</dt>
            <dd>${progress.done} of ${progress.total}</dd>
          </div>
          <div class="stat-row">
            <dt>Practice challenges solved</dt>
            <dd>${progress.practiceSolved}</dd>
          </div>
          <div class="stat-row">
            <dt>Placement Test</dt>
            <dd>${progress.placementResult ? 'Completed' : 'Not taken yet'}</dd>
          </div>
        </dl>
      </section>

      ${recommendedHtml(progress)}
    </div>

    <section aria-labelledby="quick-title">
      <h2 class="section-title" id="quick-title">Quick access</h2>
      <div class="quick-grid">
        ${QUICK_ACCESS.map((item) => `
          <a class="card quick-card" href="${route(item.view)}">
            <span class="quick-icon">${icon(item.icon)}</span>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.text)}</p>
          </a>`).join('')}
      </div>
    </section>`;
}

function renderActivity(panel) {
  const recent = getState('progress').completedLessons.map(getLesson).filter(Boolean).reverse().slice(0, 10);
  if (!recent.length) {
    panel.innerHTML = emptyState({
      iconName: 'clock',
      title: 'No activity yet',
      body: 'Lessons you complete will show up here.',
      actions: [
        { label: 'Open My Course', href: route('course'), variant: 'primary' },
        { label: 'Back to overview', href: route('dashboard', 'overview') },
      ],
    });
    return;
  }
  panel.innerHTML = `
    <section class="card card-pad" aria-labelledby="recent-title" style="max-width:760px">
      <h2 class="card-title" id="recent-title">Recently completed</h2>
      <ul class="link-list plain-list">
        ${recent.map((lesson) => `
          <li><a class="link-row" href="${lessonHref(lesson.id)}">
            <span class="status-icon status-completed" aria-hidden="true">${icon('checkCircle', { size: 22 })}</span>
            <span class="link-row-text">${esc(lesson.title)}<small>${esc(getSection(lesson.sectionId).title)}</small></span>
          </a></li>`).join('')}
      </ul>
    </section>`;
}

export default {
  id: 'dashboard',
  title: 'Dashboard',
  icon: 'dashboard',
  description: 'Your learning at a glance.',
  tabs: [
    { id: 'overview', label: 'Overview', render: renderOverview },
    { id: 'activity', label: 'Activity', render: renderActivity },
  ],
};
