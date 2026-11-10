// Lesson logic: statuses, locking, navigation and completion. This is the only module
// (besides the data file) that knows how lessons relate to saved progress.
import { getState, setState } from './state.js';
import { sections, lessons, lessonsById, sectionsById } from './data/curriculum.js';
import { route } from './utils.js';

export const STATUS_LABELS = { completed: 'Completed', available: 'Available', locked: 'Locked' };

export const lessonHref = (id, tab = 'lesson') => route('course', tab, id);

export function getLesson(id) {
  return lessonsById.get(id) ?? null;
}

export function getSection(id) {
  return sectionsById.get(id) ?? null;
}

/** Ids of completed lessons, ignoring anything that is no longer in the curriculum. */
export function completedSet() {
  return new Set(getState('progress').completedLessons.filter((id) => lessonsById.has(id)));
}

export function missingPrerequisites(id, done = completedSet()) {
  const lesson = lessonsById.get(id);
  return lesson ? lesson.prerequisites.map((p) => lessonsById.get(p)).filter((p) => p && !done.has(p.id)) : [];
}

/** "completed", "available" (all prerequisites done) or "locked". */
export function getStatus(id, done = completedSet()) {
  if (done.has(id)) return 'completed';
  return missingPrerequisites(id, done).length ? 'locked' : 'available';
}

/** "A", "A and B", "A, B and C" */
export function joinTitles(items) {
  const titles = items.map((item) => item.title);
  if (titles.length <= 1) return titles.join('');
  return `${titles.slice(0, -1).join(', ')} and ${titles[titles.length - 1]}`;
}

/** Plain-language explanation of why a lesson is locked ("" when it is not locked). */
export function lockReason(id, done = completedSet()) {
  const missing = missingPrerequisites(id, done);
  if (!missing.length || done.has(id)) return '';
  return `Complete ${joinTitles(missing)} first.`;
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function sectionStats(sectionId, done = completedSet()) {
  const list = sectionsById.get(sectionId)?.lessons ?? [];
  const completed = list.filter((l) => done.has(l.id)).length;
  return {
    total: list.length,
    done: completed,
    minutes: list.reduce((sum, l) => sum + l.minutes, 0),
    percent: list.length ? Math.round((completed / list.length) * 100) : 0,
  };
}

export function overallStats(done = completedSet()) {
  const completed = lessons.filter((l) => done.has(l.id)).length;
  return {
    total: lessons.length,
    done: completed,
    minutes: lessons.reduce((sum, l) => sum + l.minutes, 0),
    minutesLeft: lessons.filter((l) => !done.has(l.id)).reduce((sum, l) => sum + l.minutes, 0),
    percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
  };
}

/** The lessons immediately before and after this one in curriculum order (either may be null). */
export function neighbors(id) {
  const lesson = lessonsById.get(id);
  if (!lesson) return { previous: null, next: null };
  return { previous: lessons[lesson.order - 1] ?? null, next: lessons[lesson.order + 1] ?? null };
}

/** Lessons that list this lesson as a prerequisite. */
export function dependents(id) {
  return lessons.filter((l) => l.prerequisites.includes(id));
}

/** The lesson "Continue Learning" should open: the current one, else the first one still available. */
export function resumeLessonId() {
  const done = completedSet();
  const { currentLessonId } = getState('progress');
  if (currentLessonId && lessonsById.has(currentLessonId) && getStatus(currentLessonId, done) === 'available') return currentLessonId;
  const firstAvailable = lessons.find((l) => getStatus(l.id, done) === 'available');
  return (firstAvailable ?? lessons[0])?.id ?? null;
}

/** Remember which lesson the learner is on. Locked lessons are never "current". */
export function openLesson(id) {
  if (getStatus(id) === 'locked') return;
  if (getState('progress').currentLessonId !== id) setState('progress', { currentLessonId: id });
}

/** Mark a lesson complete. Returns the lessons it newly unlocked, or null if it was not allowed. */
export function markComplete(id) {
  const done = completedSet();
  if (!lessonsById.has(id) || getStatus(id, done) === 'locked') return null;
  if (done.has(id)) return [];

  const before = new Set(lessons.filter((l) => getStatus(l.id, done) === 'available').map((l) => l.id));
  const next = new Set(done).add(id);
  const completedLessons = [...getState('progress').completedLessons.filter((x) => lessonsById.has(x)), id];
  setState('progress', { completedLessons });
  return lessons.filter((l) => getStatus(l.id, next) === 'available' && !before.has(l.id));
}

export function markIncomplete(id) {
  const completedLessons = getState('progress').completedLessons.filter((x) => x !== id);
  setState('progress', { completedLessons });
}

export { sections, lessons };
