// Derived progress numbers used by the dashboard (and later, other sections).
import { getState } from './state.js';
import { totalLessons } from './data/curriculum.js';

export function progressSummary() {
  const progress = getState('progress');
  const total = totalLessons();
  const done = progress.completedLessons.length;
  return {
    total,
    done,
    percent: total ? Math.min(100, Math.round((done / total) * 100)) : 0,
    practiceSolved: progress.practiceSolved,
    placementResult: progress.placementResult,
    currentLessonId: progress.currentLessonId,
  };
}
