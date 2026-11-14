import { esc } from '../utils.js';
import { icon } from '../icons.js';
import { getState, setState, resetProgress } from '../state.js';
import { storage } from '../storage.js';
import { showToast } from '../ui/toast.js';
import { confirmDialog } from '../ui/dialog.js';
import { APP_NAME, APP_VERSION, APP_STAGE } from '../config.js';

const THEMES = [
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'system', label: 'System', icon: 'dashboard' },
];

function storageWarning() {
  return storage.isPersistent ? '' : `
    <div class="callout" role="note">Your browser is blocking local storage, so settings and progress will be forgotten when you close this tab.</div>`;
}

function renderAppearance(panel) {
  const settings = getState('settings');
  panel.innerHTML = `
    <div class="settings-stack">
      ${storageWarning()}
      <section class="card card-pad" aria-labelledby="appearance-title">
        <h2 class="card-title" id="appearance-title">Appearance</h2>
        <div class="setting-row">
          <div class="setting-text">
            <h3 id="theme-label">Theme</h3>
            <p>Dark is the default. System follows your device.</p>
          </div>
          <fieldset class="segmented" aria-labelledby="theme-label">
            ${THEMES.map((t) => `
              <label>
                <input type="radio" name="theme" value="${t.id}"${settings.theme === t.id ? ' checked' : ''}>
                <span>${icon(t.icon, { size: 16 })}${esc(t.label)}</span>
              </label>`).join('')}
          </fieldset>
        </div>
        <div class="setting-row">
          <div class="setting-text">
            <h3 id="motion-label">Reduce motion</h3>
            <p>Turns off animations and transitions. Luau Academy also follows your device setting.</p>
          </div>
          <label class="switch">
            <input type="checkbox" role="switch" aria-labelledby="motion-label"${settings.reduceMotion ? ' checked' : ''}>
            <span class="switch-track"></span>
          </label>
        </div>
      </section>
    </div>`;

  panel.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.addEventListener('change', () => {
      setState('settings', { theme: input.value });
      showToast(`Theme set to ${THEMES.find((t) => t.id === input.value).label.toLowerCase()}.`);
    });
  });

  panel.querySelector('input[role="switch"]').addEventListener('change', (event) => {
    setState('settings', { reduceMotion: event.target.checked });
    showToast(event.target.checked ? 'Motion reduced.' : 'Motion restored.');
  });
}

function renderProfile(panel) {
  panel.innerHTML = `
    <div class="settings-stack">
      <section class="card card-pad" aria-labelledby="profile-title">
        <h2 class="card-title" id="profile-title">Profile</h2>
        <form class="form-row" id="profile-form">
          <div class="field">
            <label for="display-name">Display name</label>
            <input class="input" id="display-name" name="name" type="text" maxlength="30" autocomplete="nickname" value="${esc(getState('profile').name)}" placeholder="What should we call you?">
            <span class="field-hint">Shown in your Dashboard greeting. Stored only on this device.</span>
          </div>
          <button type="submit" class="btn btn-primary">Save name</button>
        </form>
      </section>
    </div>`;

  panel.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = new FormData(event.target).get('name').toString().trim();
    setState('profile', { name });
    showToast(name ? 'Name saved.' : 'Name removed.');
  });
}

function renderProgress(panel) {
  panel.innerHTML = `
    <div class="settings-stack">
      ${storageWarning()}
      <section class="card card-pad" aria-labelledby="reset-title">
        <h2 class="card-title" id="reset-title">Progress</h2>
        <div class="setting-row">
          <div class="setting-text">
            <h3>Reset progress</h3>
            <p>Clears completed lessons, your saved exercise answers, practice results and your placement result. Your settings, name and notes are kept.</p>
          </div>
          <button type="button" class="btn btn-danger" id="reset-progress">Reset progress</button>
        </div>
      </section>
    </div>`;

  panel.querySelector('#reset-progress').addEventListener('click', async () => {
    const confirmed = await confirmDialog({
      title: 'Reset all progress?',
      message: 'This clears your lesson progress, saved exercise answers, practice and placement progress on this device. It cannot be undone.',
      confirmLabel: 'Reset progress',
      danger: true,
    });
    if (!confirmed) return;
    resetProgress();
    showToast('Progress reset.');
  });
}

function renderAbout(panel) {
  panel.innerHTML = `
    <div class="settings-stack">
      <section class="card card-pad" aria-labelledby="about-title">
        <h2 class="card-title" id="about-title">About ${esc(APP_NAME)}</h2>
        <dl class="stat-list">
          <div class="stat-row"><dt>Version</dt><dd>${esc(APP_VERSION)}</dd></div>
          <div class="stat-row"><dt>Build</dt><dd>${esc(APP_STAGE)}</dd></div>
          <div class="stat-row"><dt>Your data</dt><dd>${storage.isPersistent ? 'Saved in this browser' : 'Kept for this visit only'}</dd></div>
        </dl>
      </section>
    </div>`;
}

export default {
  id: 'settings',
  title: 'Settings',
  icon: 'settings',
  description: 'Choose how Luau Academy looks and manage what it saves.',
  tabs: [
    { id: 'appearance', label: 'Appearance', render: renderAppearance },
    { id: 'profile', label: 'Profile', render: renderProfile },
    { id: 'progress', label: 'Progress', render: renderProgress },
    { id: 'about', label: 'About', render: renderAbout },
  ],
};
