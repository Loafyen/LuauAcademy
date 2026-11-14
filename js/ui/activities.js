// Interactive lesson parts: explanation blocks, knowledge checks, code exercises and the final challenge.
import { esc, copyText } from '../utils.js';
import { icon } from '../icons.js';
import { highlight } from './highlight.js';
import { evaluateExercise } from '../checker.js';
import { getWork, updateWork } from '../work.js';
import { showToast } from './toast.js';

/** Text markup: `code` and **bold**. Everything else is escaped. */
export const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const paragraphs = (s) => s.split('\n').filter((line) => line.trim() !== '').map((line) => `<p>${fmt(line)}</p>`).join('');

export function codeBlock(code, caption = '') {
  return `
    <figure class="code-example">
      <div class="code-block">
        <div class="code-head"><span>Luau</span><button type="button" class="btn btn-ghost btn-sm" data-copy>${icon('copy', { size: 16 })} Copy</button></div>
        <pre><code>${highlight(code)}</code></pre>
      </div>
      ${caption ? `<figcaption>${fmt(caption)}</figcaption>` : ''}
    </figure>`;
}

export function explanationHtml(blocks) {
  return blocks.map(([kind, text, caption]) => {
    if (kind === 'p') return `<p>${fmt(text)}</p>`;
    if (kind === 'h') return `<h4>${fmt(text)}</h4>`;
    if (kind === 'tip') return `<aside class="callout-tip"><strong>Tip.</strong> ${fmt(text)}</aside>`;
    return codeBlock(text, caption);
  }).join('');
}

// ---------- knowledge checks ----------
export function checkHtml([question, options, , ], index) {
  return `
    <article class="activity activity-check" data-key="c${index}" data-kind="check">
      <header class="activity-head">
        <span class="activity-tag tag-question">Question ${index + 1}</span>
        <span class="activity-state" data-state></span>
      </header>
      <fieldset class="options">
        <legend class="activity-title">${fmt(question)}</legend>
        ${options.map((opt, i) => `<label class="option"><input type="radio" name="check-${index}" value="${i}"><span>${fmt(opt)}</span></label>`).join('')}
      </fieldset>
      <p class="feedback" data-feedback aria-live="polite"></p>
    </article>`;
}

// ---------- exercises and challenge ----------
export function exerciseHtml(ex, key, label, kind) {
  const lines = ex.starter.split('\n').length;
  return `
    <article class="activity activity-${kind}" data-key="${key}" data-kind="${kind}">
      <header class="activity-head">
        <span class="activity-tag tag-${kind}">${esc(label)}</span>
        <span class="activity-state" data-state></span>
      </header>
      <h4 class="activity-title">${esc(ex.title)}</h4>
      <div class="activity-task">${paragraphs(ex.task)}</div>
      ${ex.out ? `<div class="expected"><span class="console-label">Expected output</span><pre>${esc(ex.out.join('\n'))}</pre></div>` : ''}
      <label class="visually-hidden" for="editor-${key}">Your code for ${esc(ex.title)}</label>
      <textarea class="code-editor" id="editor-${key}" data-editor rows="${Math.min(Math.max(lines + 1, 5), 22)}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea>
      <p class="editor-note">Press Tab to indent. Press Esc, then Tab, to move on without indenting.</p>
      <div class="activity-actions">
        <button type="button" class="btn btn-primary" data-run>${icon('practice', { size: 18 })} Run and check</button>
        <button type="button" class="btn btn-ghost" data-reset>Reset code</button>
        <span data-hint-slot></span>
      </div>
      <div class="console" data-console aria-live="polite"></div>
      <div data-solution-slot></div>
    </article>`;
}

function consoleHtml(res, attempts) {
  let html = '';
  if (res.out.length) html += `<div class="console-out"><span class="console-label">Output</span><pre>${esc(res.out.join('\n'))}</pre></div>`;
  else if (!res.error) html += `<div class="console-out"><span class="console-label">Output</span><pre class="is-empty">(nothing was printed)</pre></div>`;
  if (res.pass) {
    html += `<p class="console-msg is-pass">${icon('checkCircle', { size: 18 })}<span><strong>Correct!</strong> Your code does what the task asks.${attempts > 1 ? ` You got there on try ${attempts}. Fixing mistakes is a real part of programming.` : ' First try!'}</span></p>`;
  } else {
    html += res.messages.map((m) => `<p class="console-msg is-fail">${icon('info', { size: 18 })}<span>${esc(m)}</span></p>`).join('');
  }
  return html;
}

/**
 * Attach behaviour to a lesson's activities.
 * root: element containing the activity markup. onProgress() is called whenever an activity is completed.
 */
export function wireActivities(root, lesson, content, onProgress) {
  const exercises = new Map();
  content.exercises.forEach((ex, i) => exercises.set(`e${i}`, ex));
  exercises.set('ch', content.challenge);

  const setDone = (card, done) => {
    card.classList.toggle('is-done', done);
    card.querySelector('[data-state]').innerHTML = done ? `${icon('check', { size: 16 })} Done` : '';
  };

  // Restore saved state.
  const work = getWork(lesson.id);
  root.querySelectorAll('.activity-check').forEach((card) => {
    const key = card.dataset.key;
    if (work.done[key]) {
      const [, options, answer, why] = content.checks[+key.slice(1)];
      const input = card.querySelector(`input[value="${answer}"]`);
      input.checked = true;
      card.querySelectorAll('input').forEach((i) => { i.disabled = true; });
      card.querySelector('[data-feedback]').innerHTML = `<span class="is-pass">Correct.</span> ${fmt(why)}`;
      void options;
      setDone(card, true);
    }
  });
  root.querySelectorAll('[data-editor]').forEach((editor) => {
    const card = editor.closest('.activity');
    const key = card.dataset.key;
    const ex = exercises.get(key);
    editor.value = work.code[key] ?? ex.starter;
    setDone(card, Boolean(work.done[key]));
    renderHelp(card, key);
  });

  function renderHelp(card, key) {
    const w = getWork(lesson.id);
    const attempts = w.attempts[key] ?? 0;
    const hintSlot = card.querySelector('[data-hint-slot]');
    const solSlot = card.querySelector('[data-solution-slot]');
    const ex = exercises.get(key);
    if (w.done[key]) { hintSlot.innerHTML = ''; } else if (attempts === 0) {
      hintSlot.innerHTML = '<span class="help-note">A hint unlocks after your first try.</span>';
    } else if (w.shown['h' + key]) {
      hintSlot.innerHTML = '';
    } else {
      hintSlot.innerHTML = '<button type="button" class="btn btn-secondary" data-hint>Show a hint</button>';
    }
    let slot = '';
    if (w.shown['h' + key]) slot += `<div class="hint-box" role="note"><strong>Hint.</strong> ${fmt(ex.hint)}</div>`;
    if (!w.done[key] && attempts >= 2) {
      if (w.shown['s' + key]) {
        slot += `<div class="solution-box"><p><strong>One way to solve it.</strong> Read it, then try to understand why each line is there.</p>${codeBlock(ex.solution)}<button type="button" class="btn btn-secondary btn-sm" data-use-solution>Put this in the editor</button></div>`;
      } else {
        slot += `<p class="help-note">Stuck? You have tried ${attempts} times. <button type="button" class="btn btn-ghost btn-sm" data-solution>Show the solution</button></p>`;
      }
    }
    solSlot.innerHTML = slot;
  }

  const saveCode = (() => {
    const timers = new Map();
    return (key, value) => {
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => updateWork(lesson.id, (w) => { w.code[key] = value; }), 350));
    };
  })();

  function run(card) {
    const key = card.dataset.key;
    const ex = exercises.get(key);
    const editor = card.querySelector('[data-editor]');
    const code = editor.value;
    const consoleEl = card.querySelector('[data-console]');
    if (code.trim() === ex.starter.trim()) {
      consoleEl.innerHTML = `<p class="console-msg is-fail">${icon('info', { size: 18 })}<span>You have not changed the starter code yet. Read the task above, then write your answer in the editor.</span></p>`;
      return;
    }
    const res = evaluateExercise(ex, code);
    let attempts = 0;
    updateWork(lesson.id, (w) => {
      w.code[key] = code;
      w.attempts[key] = (w.attempts[key] ?? 0) + 1;
      attempts = w.attempts[key];
      if (res.pass) w.done[key] = true;
    });
    consoleEl.innerHTML = consoleHtml(res, attempts);
    setDone(card, res.pass);
    renderHelp(card, key);
    if (res.pass) onProgress(key);
  }

  root.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target || !root.contains(target)) return;
    const card = target.closest('.activity');
    if (target.hasAttribute('data-copy')) {
      const ok = await copyText(target.closest('.code-block').querySelector('code').textContent);
      showToast(ok ? 'Code copied.' : 'Could not copy. Select the code and copy it by hand.');
    } else if (target.hasAttribute('data-run')) run(card);
    else if (target.hasAttribute('data-reset')) {
      const key = card.dataset.key;
      card.querySelector('[data-editor]').value = exercises.get(key).starter;
      updateWork(lesson.id, (w) => { delete w.code[key]; });
      card.querySelector('[data-console]').innerHTML = '';
    } else if (target.hasAttribute('data-hint')) {
      updateWork(lesson.id, (w) => { w.shown['h' + card.dataset.key] = true; });
      renderHelp(card, card.dataset.key);
    } else if (target.hasAttribute('data-solution')) {
      updateWork(lesson.id, (w) => { w.shown['s' + card.dataset.key] = true; });
      renderHelp(card, card.dataset.key);
    } else if (target.hasAttribute('data-use-solution')) {
      card.querySelector('[data-editor]').value = exercises.get(card.dataset.key).solution;
      showToast('Solution placed in the editor. Press Run and check to see it work.');
    }
  });

  root.addEventListener('input', (event) => {
    if (event.target.matches('[data-editor]')) saveCode(event.target.closest('.activity').dataset.key, event.target.value);
  });

  let escapePressed = false;
  root.addEventListener('keydown', (event) => {
    const editor = event.target.closest('[data-editor]');
    if (!editor) return;
    if (event.key === 'Escape') { escapePressed = true; return; }
    if (event.key === 'Tab' && !escapePressed && !event.shiftKey) {
      event.preventDefault();
      const { selectionStart: a, selectionEnd: b, value } = editor;
      editor.value = `${value.slice(0, a)}  ${value.slice(b)}`;
      editor.selectionStart = editor.selectionEnd = a + 2;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); run(editor.closest('.activity')); }
    if (event.key !== 'Escape') escapePressed = false;
  });

  root.addEventListener('change', (event) => {
    const input = event.target.closest('.activity-check input');
    if (!input) return;
    const card = input.closest('.activity');
    const key = card.dataset.key;
    const [, , answer, why] = content.checks[+key.slice(1)];
    const feedback = card.querySelector('[data-feedback]');
    if (Number(input.value) === answer) {
      card.querySelectorAll('input').forEach((i) => { i.disabled = true; });
      feedback.innerHTML = `<span class="is-pass">Correct.</span> ${fmt(why)}`;
      updateWork(lesson.id, (w) => { w.done[key] = true; });
      setDone(card, true);
      onProgress(key);
    } else {
      feedback.innerHTML = `<span class="is-fail">Not quite.</span> ${fmt(why)} Pick again when you are ready.`;
      updateWork(lesson.id, (w) => { w.attempts[key] = (w.attempts[key] ?? 0) + 1; });
    }
  });
}
