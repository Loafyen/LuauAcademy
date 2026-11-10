// Short status messages. The region is an aria-live area, so screen readers announce them.

export function showToast(message, { duration = 3400 } = {}) {
  const region = document.getElementById('toast-region');
  if (!region) return;

  while (region.children.length >= 3) region.firstElementChild.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  region.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 260);
  }, duration);
}
