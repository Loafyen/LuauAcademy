// Checks the curriculum data for mistakes. Returns a list of problems (empty means the data is sound).
// main.js runs this on startup and logs problems to the console, so a typo in a prerequisite is caught immediately.
import { sections, lessons, lessonsById, sectionsById, difficulties } from './curriculum.js';

export function validateCurriculum() {
  const problems = [];
  const validDifficulties = new Set(difficulties.map((d) => d.id));
  const seenIds = new Set();
  const seenSlugs = new Set();

  if (!sections.length) problems.push('No sections defined.');

  for (const section of sections) {
    if (!section.id || !section.title) problems.push(`Section ${section.number} needs an id and a title.`);
    if (!section.lessons.length) problems.push(`Section "${section.title}" has no lessons.`);
  }

  lessons.forEach((lesson, index) => {
    const where = `Lesson "${lesson.title ?? lesson.id}"`;
    if (!lesson.id) problems.push(`${where} has no id.`);
    if (seenIds.has(lesson.id)) problems.push(`${where}: duplicate id ${lesson.id}.`);
    seenIds.add(lesson.id);
    if (seenSlugs.has(lesson.slug)) problems.push(`${where}: duplicate slug ${lesson.slug}.`);
    seenSlugs.add(lesson.slug);

    if (!lesson.title) problems.push(`${where} has no title.`);
    if (!lesson.description) problems.push(`${where} has no description.`);
    if (!validDifficulties.has(lesson.difficulty)) problems.push(`${where}: unknown difficulty "${lesson.difficulty}".`);
    if (!Number.isInteger(lesson.minutes) || lesson.minutes <= 0) problems.push(`${where}: estimated time must be a positive whole number.`);
    if (!sectionsById.has(lesson.sectionId)) problems.push(`${where}: unknown section "${lesson.sectionId}".`);
    if (!lesson.content || lesson.content.state !== 'placeholder') problems.push(`${where}: missing content placeholder.`);
    if (lesson.status !== 'not-started') problems.push(`${where}: default status must be "not-started".`);
    if (lesson.id !== `${lesson.sectionId}-${lesson.slug}`) problems.push(`${where}: id does not match section and slug.`);
    if (lesson.order !== index) problems.push(`${where}: order value is out of step.`);

    const seenPrereqs = new Set();
    for (const prereq of lesson.prerequisites) {
      const target = lessonsById.get(prereq);
      if (!target) problems.push(`${where}: unknown prerequisite "${prereq}".`);
      else if (target.id === lesson.id) problems.push(`${where}: lists itself as a prerequisite.`);
      else if (target.order > lesson.order) problems.push(`${where}: prerequisite "${target.title}" appears later in the curriculum.`);
      if (seenPrereqs.has(prereq)) problems.push(`${where}: duplicate prerequisite "${prereq}".`);
      seenPrereqs.add(prereq);
    }
  });

  if (!lessons.some((l) => l.prerequisites.length === 0)) problems.push('No lesson can be started: every lesson has prerequisites.');
  return problems;
}
