// Numbers for the dashboard, derived from the curriculum and saved progress.
import { getState } from './state.js';
import { overallStats } from './lessons.js';

export function progressSummary() {
  const progress = getState('progress');
  const { total, done, percent } = overallStats();
  return {
    total,
    done,
    percent,
    practiceSolved: progress.practiceSolved,
    placementResult: progress.placementResult,
    currentLessonId: progress.currentLessonId,
  };
}
