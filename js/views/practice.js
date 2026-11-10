import { esc, route } from '../utils.js';
import { icon } from '../icons.js';
import { emptyState, laterStagePanel } from '../ui/components.js';

const MODES = [
  { icon: 'bolt', title: 'Quick drills', text: 'Short exercises to build speed with the basics.' },
  { icon: 'search', title: 'Debugging', text: 'Find and fix the problem in a broken script.' },
  { icon: 'layers', title: 'Mini projects', text: 'Combine several ideas into one small build.' },
];

function renderOverview(panel) {
  panel.innerHTML = `
    <section class="card intro" aria-labelledby="arena-title">
      <div>
        <h2 id="arena-title">Practice what you learn</h2>
        <p style="margin-top:var(--space-3)">The Practice Arena is where lessons turn into skill. Challenges will arrive in different formats, so you can train the way that suits you.</p>
      </div>
      <div class="tile-grid">
        ${MODES.map((mode) => `
          <div class="tile">
            <span class="quick-icon">${icon(mode.icon)}</span>
            <h3>${esc(mode.title)}</h3>
            <p>${esc(mode.text)}</p>
          </div>`).join('')}
      </div>
      <div class="intro-actions">
        <button type="button" class="btn btn-primary" data-action="start">Start Practice</button>
        <a class="btn btn-secondary" href="${route('curriculum')}">Review lessons first</a>
      </div>
    </section>`;

  panel.querySelector('[data-action="start"]').addEventListener('click', () => {
    panel.innerHTML = laterStagePanel({
      title: 'Challenges are not ready yet',
      body: 'The arena is set up and waiting for its exercises. Until then, the Curriculum is the best place to keep learning.',
      actions: [
        { label: 'Back', action: 'back' },
        { label: 'Open Curriculum', href: route('curriculum'), variant: 'primary' },
      ],
    });
    const heading = panel.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus();
    panel.querySelector('[data-action="back"]').addEventListener('click', () => renderOverview(panel));
  });
}

function renderChallenges(panel) {
  panel.innerHTML = emptyState({
    iconName: 'practice',
    title: 'No challenges yet',
    body: 'Challenges you can attempt will be listed here, grouped by format.',
    actions: [{ label: 'Back to overview', href: route('practice', 'overview'), variant: 'primary' }],
  });
}

function renderHistory(panel) {
  panel.innerHTML = emptyState({
    iconName: 'clock',
    title: 'No attempts yet',
    body: 'The challenges you try will be recorded here so you can see how you are improving.',
    actions: [{ label: 'Back to overview', href: route('practice', 'overview'), variant: 'primary' }],
  });
}

export default {
  id: 'practice',
  title: 'Practice Arena',
  icon: 'practice',
  description: 'Challenges that turn lessons into skill.',
  tabs: [
    { id: 'overview', label: 'Overview', render: renderOverview },
    { id: 'challenges', label: 'Challenges', render: renderChallenges },
    { id: 'history', label: 'History', render: renderHistory },
  ],
};
