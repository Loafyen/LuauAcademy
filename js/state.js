// Central app state. Each slice is saved under its own localStorage key so later stages
// (curriculum, placement test, practice) can add data without touching the others.
import { storage } from './storage.js';

export const DEFAULTS = {
  settings: { theme: 'dark', reduceMotion: false },
  profile: { name: '' },
  progress: { completedLessons: [], currentLessonId: null, practiceSolved: 0, placementResult: null },
  notes: {},
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const state = {};
const listeners = new Set();

for (const slice of Object.keys(DEFAULTS)) {
  const saved = storage.get(slice, {});
  state[slice] = { ...clone(DEFAULTS[slice]), ...(isPlainObject(saved) ? saved : {}) };
}

export function getState(slice) {
  return state[slice];
}

/** Merge a patch into a slice, save it, and tell subscribers which slice changed. */
export function setState(slice, patch) {
  state[slice] = { ...state[slice], ...patch };
  storage.set(slice, state[slice]);
  listeners.forEach((fn) => fn(slice, state[slice]));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Reset lesson, practice and placement progress. Settings, profile and notes are kept. */
export function resetProgress() {
  state.progress = clone(DEFAULTS.progress);
  storage.set('progress', state.progress);
  listeners.forEach((fn) => fn('progress', state.progress));
}
