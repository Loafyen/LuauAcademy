// Curriculum data. Stage 1 only defines the layout: the categories below are PLACEHOLDERS
// and every lessons array is empty. Real lessons are added in a later stage.

export const levels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const categories = [
  { id: 'foundations', title: 'Foundations', level: 'beginner', summary: 'First steps with the language.', lessons: [] },
  { id: 'core-scripting', title: 'Core scripting', level: 'beginner', summary: 'The everyday tools of writing scripts.', lessons: [] },
  { id: 'studio-workflow', title: 'Working in Roblox Studio', level: 'intermediate', summary: 'Connecting scripts to a real project.', lessons: [] },
  { id: 'game-systems', title: 'Building game systems', level: 'intermediate', summary: 'Putting the pieces together.', lessons: [] },
  { id: 'polish-performance', title: 'Polish and performance', level: 'advanced', summary: 'Making your work reliable and fast.', lessons: [] },
];

export function totalLessons() {
  return categories.reduce((sum, category) => sum + category.lessons.length, 0);
}
