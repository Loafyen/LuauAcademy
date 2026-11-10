import { route } from '../utils.js';
import { icon } from '../icons.js';
import { getState } from '../state.js';
import { emptyState, laterStagePanel } from '../ui/components.js';

function introHtml() {
  return `
    <section class="card intro" aria-labelledby="placement-title">
      <div>
        <h2 id="placement-title">Find the right place to start</h2>
        <p style="margin-top:var(--space-3)">A short check of what you already know, so the course can suggest where to begin. Skip it if you would rather start from the first lesson.</p>
      </div>
      <div class="tile-grid">
        <div class="tile"><span class="quick-icon">${icon('clock')}</span><h3>Takes a few minutes</h3><p>Short enough to finish in one sitting.</p></div>
        <div class="tile"><span class="quick-icon">${icon('check')}</span><h3>No pressure</h3><p>It only sets a starting point. You can change course at any time.</p></div>
        <div class="tile"><span class="quick-icon">${icon('lock')}</span><h3>Stays on your device</h3><p>No account needed. Results are kept in your browser.</p></div>
      </div>
      <div class="intro-actions">
        <button type="button" class="btn btn-primary" data-action="start">Start Placement Test</button>
        <a class="btn btn-secondary" href="${route('curriculum')}">Skip to Curriculum</a>
      </div>
    </section>`;
}

function renderIntro(panel) {
  panel.innerHTML = introHtml();

  panel.querySelector('[data-action="start"]').addEventListener('click', () => {
    panel.innerHTML = laterStagePanel({
      title: 'The placement test is not ready yet',
      body: 'This page is set up and waiting for its questions. Until then, start from the first category in the Curriculum.',
      actions: [
        { label: 'Back', action: 'back' },
        { label: 'Open Curriculum', href: route('curriculum'), variant: 'primary' },
      ],
    });
    const heading = panel.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus();
    panel.querySelector('[data-action="back"]').addEventListener('click', () => renderIntro(panel));
  });
}

function renderExpect(panel) {
  panel.innerHTML = `
    <section class="card card-pad" aria-labelledby="expect-title" style="max-width:760px">
      <h2 class="card-title" id="expect-title">What to expect</h2>
      <ul class="check-list">
        <li>${icon('check', { size: 18 })}<span>A short series of questions about Luau and scripting basics.</span></li>
        <li>${icon('check', { size: 18 })}<span>A suggested starting lesson based on your answers.</span></li>
        <li>${icon('check', { size: 18 })}<span>The option to retake the test whenever you like.</span></li>
      </ul>
    </section>`;
}

function renderResults(panel) {
  const result = getState('progress').placementResult;
  if (result) {
    panel.innerHTML = `<section class="card card-pad"><h2>Your result</h2><p class="card-lead">Placement results will be shown here.</p></section>`;
    return;
  }
  panel.innerHTML = emptyState({
    iconName: 'placement',
    title: 'No result yet',
    body: 'Once you take the placement test, your suggested starting point will appear here.',
    actions: [{ label: 'Go to introduction', href: route('placement', 'intro'), variant: 'primary' }],
  });
}

export default {
  id: 'placement',
  title: 'Placement Test',
  icon: 'placement',
  description: 'Check what you know and find your starting point.',
  tabs: [
    { id: 'intro', label: 'Introduction', render: renderIntro },
    { id: 'expect', label: 'What to expect', render: renderExpect },
    { id: 'results', label: 'Results', render: renderResults },
  ],
};
