// Confirmation dialog built on the native <dialog> element (focus trapping and Esc come built in).
import { esc } from '../utils.js';

/** Resolves true when the person confirms, false for cancel, Esc or a click outside. */
export function confirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
  if (typeof HTMLDialogElement === 'undefined') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog';
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.setAttribute('aria-describedby', 'dialog-message');
    dialog.innerHTML = `
      <form method="dialog" class="dialog-body">
        <h2 id="dialog-title">${esc(title)}</h2>
        <p id="dialog-message">${esc(message)}</p>
        <div class="dialog-actions">
          <button type="submit" class="btn btn-secondary" value="cancel">${esc(cancelLabel)}</button>
          <button type="submit" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" value="confirm">${esc(confirmLabel)}</button>
        </div>
      </form>`;

    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'confirm');
      dialog.remove();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close('cancel');
    });

    document.body.appendChild(dialog);
    dialog.showModal();
  });
}
