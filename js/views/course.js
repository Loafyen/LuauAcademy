import { esc, route, delegate, copyText } from '../utils.js';
import { icon } from '../icons.js';
import { getState, setState } from '../state.js';
import { PLACEHOLDER_LESSON_ID } from '../config.js';
import { showToast } from '../ui/toast.js';
import { confirmDialog } from '../ui/dialog.js';
import { emptyState } from '../ui/components.js';

const OUTLINE = [
  { id: 'lesson-goals', label: 'What you will learn' },
  { id: 'lesson-concept', label: 'The idea' },
  { id: 'lesson-example', label: 'Example' },
  { id: 'lesson-practice', label: 'Try it yourself' },
];

function renderLesson(panel) {
  panel.innerHTML = `
    <div class="course-layout">
      <article class="card lesson" aria-labelledby="lesson-title">
        <header class="lesson-head">
          <nav aria-label="Breadcrumb">
            <ol class="breadcrumb">
              <li><a href="${route('curriculum')}">Curriculum</a></li>
              <li>Module name</li>
              <li aria-current="page">Lesson title</li>
            </ol>
          </nav>
          <h2 id="lesson-title">Lesson title goes here</h2>
          <div><span class="pill pill-accent">Placeholder lesson</span></div>
        </header>

        <section id="lesson-goals" aria-labelledby="h-goals">
          <h3 id="h-goals">What you will learn</h3>
          <p>A short summary of the lesson goals appears here, so learners know what to expect before they start reading.</p>
          <ul>
            <li>First thing the learner will be able to do</li>
            <li>Second thing the learner will be able to do</li>
          </ul>
        </section>

        <section id="lesson-concept" aria-labelledby="h-concept">
          <h3 id="h-concept">The idea</h3>
          <p>The main explanation goes in this area. Real lessons will use short paragraphs, clear definitions and plain language.</p>
          <p>Longer lessons can split the explanation across several sections, and each one will appear in the outline beside this article.</p>
        </section>

        <section id="lesson-example" aria-labelledby="h-example">
          <h3 id="h-example">Example</h3>
          <p>Code examples sit in blocks like this one. The copy button works already.</p>
          <div class="code-block">
            <div class="code-head">
              <span>Luau</span>
              <button type="button" class="btn btn-ghost btn-sm" data-action="copy-code">${icon('copy', { size: 16 })} Copy</button>
            </div>
<pre><code id="sample-code"><span class="code-comment">-- Placeholder example</span>
print(<span class="code-string">"Hello from Luau Academy!"</span>)</code></pre>
          </div>
        </section>

        <section id="lesson-practice" aria-labelledby="h-practice">
          <h3 id="h-practice">Try it yourself</h3>
          <p>A short prompt for the learner to work through on their own will go here.</p>
        </section>

        <footer class="lesson-foot">
          <button type="button" class="btn btn-secondary" data-action="previous-lesson">${icon('arrowLeft', { size: 18 })} Previous lesson</button>
          <button type="button" class="btn btn-primary" data-action="next-lesson">Next lesson ${icon('arrowRight', { size: 18 })}</button>
          <span class="spacer"></span>
          <a class="btn btn-ghost" href="${route('curriculum')}">Back to Curriculum</a>
        </footer>
      </article>

      <aside class="course-aside" aria-label="Lesson tools">
        <section class="card card-pad" aria-labelledby="outline-title">
          <h2 class="card-title" id="outline-title">In this lesson</h2>
          <div class="outline">
            ${OUTLINE.map((item) => `<button type="button" data-jump="${esc(item.id)}">${esc(item.label)}</button>`).join('')}
          </div>
        </section>
        <section class="card card-pad" aria-labelledby="details-title">
          <h2 class="card-title" id="details-title">Lesson details</h2>
          <dl class="stat-list">
            <div class="stat-row"><dt>Status</dt><dd>Not started</dd></div>
            <div class="stat-row"><dt>Level</dt><dd>Beginner</dd></div>
            <div class="stat-row"><dt>Notes</dt><dd><a href="${route('course', 'notes')}">Open notes</a></dd></div>
          </dl>
        </section>
      </aside>
    </div>`;

  delegate(panel, 'click', '[data-jump]', (_event, button) => {
    const target = panel.querySelector(`#${button.dataset.jump}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.querySelector('h3')?.setAttribute('tabindex', '-1');
    target?.querySelector('h3')?.focus({ preventScroll: true });
  });

  delegate(panel, 'click', '[data-action="copy-code"]', async (_event, button) => {
    const text = panel.querySelector('#sample-code').textContent;
    const ok = await copyText(text);
    showToast(ok ? 'Code copied to your clipboard.' : 'Could not copy. Select the code and copy it manually.');
    if (ok) {
      button.innerHTML = `${icon('check', { size: 16 })} Copied`;
      setTimeout(() => { button.innerHTML = `${icon('copy', { size: 16 })} Copy`; }, 1800);
    }
  });

  const noNeighbor = 'There are no other lessons yet. These buttons will move through the curriculum once it exists.';
  delegate(panel, 'click', '[data-action="previous-lesson"], [data-action="next-lesson"]', () => showToast(noNeighbor));
}

function renderNotes(panel) {
  const saved = getState('notes')[PLACEHOLDER_LESSON_ID] ?? '';
  panel.innerHTML = `
    <section class="card card-pad" aria-labelledby="notes-title" style="max-width:760px">
      <h2 id="notes-title">Lesson notes</h2>
      <p class="card-lead">Write anything you want to remember. Notes save automatically on this device.</p>
      <div class="field" style="margin-top:var(--space-4)">
        <label for="notes-input">Notes for this lesson</label>
        <textarea class="textarea" id="notes-input" placeholder="Type your notes here">${esc(saved)}</textarea>
        <div style="display:flex;justify-content:space-between;gap:var(--space-3);flex-wrap:wrap;align-items:center">
          <span class="save-state" id="notes-status">${saved ? 'Saved on this device.' : 'Nothing saved yet.'}</span>
          <button type="button" class="btn btn-secondary btn-sm" id="notes-clear">Clear notes</button>
        </div>
      </div>
    </section>`;

  const input = panel.querySelector('#notes-input');
  const status = panel.querySelector('#notes-status');

  input.addEventListener('input', () => {
    setState('notes', { [PLACEHOLDER_LESSON_ID]: input.value });
    status.textContent = 'Saved on this device.';
  });

  panel.querySelector('#notes-clear').addEventListener('click', async () => {
    if (!input.value) {
      showToast('There are no notes to clear.');
      return;
    }
    const confirmed = await confirmDialog({
      title: 'Clear these notes?',
      message: 'Your notes for this lesson will be deleted from this device.',
      confirmLabel: 'Clear notes',
      danger: true,
    });
    if (!confirmed) return;
    input.value = '';
    setState('notes', { [PLACEHOLDER_LESSON_ID]: '' });
    status.textContent = 'Nothing saved yet.';
    showToast('Notes cleared.');
  });
}

function renderResources(panel) {
  panel.innerHTML = emptyState({
    iconName: 'link',
    title: 'No resources yet',
    body: 'Reference links and downloads for each lesson will be listed here.',
    actions: [{ label: 'Back to lesson', href: route('course', 'lesson'), variant: 'primary' }],
  });
}

export default {
  id: 'course',
  title: 'My Course',
  icon: 'course',
  description: 'Read the lesson, keep notes and pick up where you stopped.',
  tabs: [
    { id: 'lesson', label: 'Lesson', render: renderLesson },
    { id: 'notes', label: 'Notes', render: renderNotes },
    { id: 'resources', label: 'Resources', render: renderResources },
  ],
};
