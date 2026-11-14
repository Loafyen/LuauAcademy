// Loads lesson content on demand. Each section has its own file, so a learner only downloads what they open.
const cache = new Map();

export async function loadLessonContent(lesson) {
  const file = lesson.content.module;
  if (!cache.has(file)) cache.set(file, import(`./${file}.js`).then((m) => m.default));
  const all = await cache.get(file);
  return all[lesson.id] ?? null;
}
