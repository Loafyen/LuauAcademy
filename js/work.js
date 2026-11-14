// Saved lesson activity progress: which questions and exercises are done, the learner's code, and how many tries.
import { getState, setState } from './state.js';

const empty = () => ({ done: {}, code: {}, attempts: {}, shown: {} });

export function getWork(lessonId) {
  const w = getState('work')[lessonId];
  return w ? { ...empty(), ...w } : empty();
}

export function updateWork(lessonId, mutate) {
  const current = getWork(lessonId);
  const next = { done: { ...current.done }, code: { ...current.code }, attempts: { ...current.attempts }, shown: { ...current.shown } };
  mutate(next);
  setState('work', { [lessonId]: next });
  return next;
}

/** Keys of every required activity in a lesson: c0.. (questions), e0.. (exercises), ch (final challenge). */
export function activityKeys(content) {
  return [...content.checks.map((_, i) => `c${i}`), ...content.exercises.map((_, i) => `e${i}`), 'ch'];
}

export function activityProgress(lessonId, content) {
  const keys = activityKeys(content);
  const done = getWork(lessonId).done;
  const count = (prefix) => keys.filter((k) => k.startsWith(prefix) && done[k]);
  return {
    total: keys.length,
    done: keys.filter((k) => done[k]).length,
    checks: { done: count('c').length, total: content.checks.length },
    exercises: { done: count('e').length, total: content.exercises.length },
    challenge: { done: done.ch ? 1 : 0, total: 1 },
  };
}
