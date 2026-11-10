// localStorage wrapper. Falls back to memory when storage is blocked (private mode, strict settings),
// so the app keeps working for the current visit instead of throwing.

const PREFIX = 'luauAcademy:v1:';
const memory = new Map();

function checkPersistent() {
  try {
    const probe = `${PREFIX}__probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch (_) {
    return false;
  }
}

const persistent = checkPersistent();

export const storage = {
  isPersistent: persistent,

  get(key, fallback = null) {
    try {
      const raw = persistent ? localStorage.getItem(PREFIX + key) : memory.get(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  },

  set(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (persistent) localStorage.setItem(PREFIX + key, raw);
      else memory.set(key, raw);
      return true;
    } catch (_) {
      memory.set(key, raw);
      return false;
    }
  },

  remove(key) {
    try {
      if (persistent) localStorage.removeItem(PREFIX + key);
    } catch (_) { /* ignore */ }
    memory.delete(key);
  },
};
