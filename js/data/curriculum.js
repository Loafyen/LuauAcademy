// The curriculum database. This is the single source of truth for every section and lesson.
// Views never hardcode lessons: they read from the exports at the bottom of this file.
//
// To add or change a lesson, edit SECTION_SPECS only. Each lesson row is:
//   [title, difficulty, estimated minutes, description, prerequisite slugs]
// - difficulty: 'b' beginner, 'i' intermediate, 'a' advanced
// - a slug is the lowercase, hyphenated title (for example "Printing and comments" -> "printing-and-comments")
// - a lesson id is "<section id>-<slug>" and is generated, so ids stay consistent everywhere
// - prerequisites must point to lessons that appear EARLIER in this file
//   (js/data/validate.js checks this and everything else about the data)

const DIFFICULTY_CODES = { b: 'beginner', i: 'intermediate', a: 'advanced' };

export const difficulties = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const SECTION_SPECS = [
  {
    id: 'foundations',
    title: 'Programming Foundations',
    summary: 'The core ideas of programming, learned through Luau.',
    lessons: [
      ['Introduction to Luau', 'b', 8, 'What Luau is, where it runs, and how it relates to Lua and Roblox.', []],
      ['Printing and comments', 'b', 8, 'Show output with print and leave notes for yourself in your code.', ['introduction-to-luau']],
      ['Variables', 'b', 10, 'Store values under names so you can reuse and change them.', ['printing-and-comments']],
      ['Data types', 'b', 12, 'Meet numbers, strings, booleans, nil and the other basic kinds of value.', ['variables']],
      ['Strings', 'b', 12, 'Join, measure and reshape text with string operations and methods.', ['data-types']],
      ['Arithmetic and operators', 'b', 12, 'Do maths with operators and understand the order they run in.', ['data-types']],
      ['Conditionals', 'b', 12, 'Make code choose a path with if, elseif and else.', ['arithmetic-and-operators']],
      ['Boolean logic', 'b', 12, 'Combine conditions with and, or and not.', ['conditionals']],
      ['Loops', 'b', 15, 'Repeat work with while, for and repeat loops.', ['boolean-logic']],
      ['Functions', 'b', 18, 'Package code into reusable pieces with parameters and return values.', ['loops']],
      ['Scope', 'b', 12, 'Learn where a variable can be seen, and why that matters.', ['functions']],
      ['Tables', 'b', 18, 'Group values together using arrays and dictionaries.', ['loops']],
      ['Iterating through tables', 'i', 15, 'Walk through arrays and dictionaries with for loops, ipairs and pairs.', ['tables']],
      ['Error handling', 'i', 15, 'Catch problems safely with pcall and raise your own errors.', ['functions', 'iterating-through-tables']],
    ],
  },
  {
    id: 'studio',
    title: 'Roblox Studio Fundamentals',
    summary: 'Find your way around Studio and learn how Roblox games are put together.',
    lessons: [
      ['Introduction to Roblox Studio', 'b', 12, 'Tour the editor, create a place and run your first test.', ['introduction-to-luau']],
      ['Explorer and Properties', 'b', 12, 'Use the two windows you will rely on every day to inspect a game.', ['introduction-to-roblox-studio']],
      ['Instances', 'b', 12, 'Understand that everything in a game is an instance in a tree.', ['explorer-and-properties', 'variables']],
      ['Properties and methods', 'b', 15, 'Read and change instance properties, and call methods from scripts.', ['instances', 'functions']],
      ['Events', 'i', 18, 'React to things that happen in a game by connecting functions to events.', ['properties-and-methods']],
      ['Creating and manipulating objects', 'i', 18, 'Create, clone, move and remove instances entirely from code.', ['properties-and-methods', 'loops']],
      ['Services', 'i', 12, 'Access the built-in services Roblox provides and know what each one is for.', ['instances', 'tables']],
      ['Workspace', 'b', 12, 'Work with the container that holds everything players can see and touch.', ['services']],
      ['Players', 'i', 15, 'Find players, react to them joining and leaving, and reach their characters.', ['services', 'events']],
      ['ReplicatedStorage', 'i', 12, 'Share assets and modules between the server and the client.', ['services']],
      ['ServerScriptService', 'i', 12, 'Keep server code in the place where server scripts are meant to live.', ['services']],
      ['Script types and execution contexts', 'i', 18, 'Choose between Script, LocalScript and ModuleScript, and know where each one runs.', ['serverscriptservice', 'replicatedstorage']],
    ],
  },
  {
    id: 'gameplay',
    title: 'Gameplay Programming',
    summary: 'Turn scripting skills into the mechanics players actually feel.',
    lessons: [
      ['Player movement', 'i', 20, 'Control walking, jumping and speed by working with the Humanoid.', ['players', 'script-types-and-execution-contexts']],
      ['Health systems', 'i', 20, 'Track, change and react to a character\u2019s health.', ['players', 'events']],
      ['Damage systems', 'i', 25, 'Apply damage safely and consistently from any source.', ['health-systems', 'workspace']],
      ['Combat systems', 'i', 35, 'Combine hit detection, damage and feedback into a working attack.', ['damage-systems', 'player-movement']],
      ['Cooldowns', 'i', 18, 'Limit how often an action can be used with timers and timestamps.', ['events', 'tables']],
      ['Abilities', 'i', 30, 'Build reusable abilities with costs, cooldowns and effects.', ['cooldowns', 'combat-systems']],
      ['Tools and weapons', 'i', 30, 'Create tools that players can hold, equip and use.', ['events', 'creating-and-manipulating-objects', 'damage-systems']],
      ['NPCs', 'i', 25, 'Add non-player characters that can stand, move and be spawned by code.', ['creating-and-manipulating-objects', 'health-systems']],
      ['Basic enemy AI', 'a', 40, 'Give enemies simple behaviour: notice a player, chase and attack.', ['npcs', 'damage-systems']],
    ],
  },
  {
    id: 'interfaces',
    title: 'User Interfaces',
    summary: 'Show players what is happening and let them respond.',
    lessons: [
      ['ScreenGui', 'b', 12, 'Create the container that puts interface elements on a player\u2019s screen.', ['players', 'instances']],
      ['Frames and buttons', 'b', 15, 'Build layouts with frames and add buttons that players can press.', ['screengui']],
      ['TextLabels and TextButtons', 'b', 15, 'Display and style text, and make text clickable.', ['frames-and-buttons']],
      ['UI events', 'i', 18, 'Respond to clicks, hovers and input on interface elements.', ['textlabels-and-textbuttons', 'events']],
      ['Updating interface elements', 'i', 18, 'Change what the interface shows as the game state changes.', ['ui-events']],
      ['Health bars', 'i', 25, 'Show a player\u2019s health with a bar that updates smoothly.', ['updating-interface-elements', 'health-systems']],
      ['Inventory interfaces', 'i', 30, 'Display a list of items and let players select them.', ['updating-interface-elements', 'iterating-through-tables']],
      ['Menus', 'i', 25, 'Build menus that open, close and move between screens.', ['ui-events']],
    ],
  },
  {
    id: 'networking',
    title: 'Multiplayer and Networking',
    summary: 'Make the client and server work together, and keep them honest.',
    lessons: [
      ['Client and server', 'i', 15, 'Understand what runs where, and why Roblox splits the two.', ['script-types-and-execution-contexts']],
      ['RemoteEvents', 'i', 20, 'Send one-way messages between the client and the server.', ['client-and-server', 'replicatedstorage']],
      ['RemoteFunctions', 'i', 20, 'Ask the other side a question and wait for the answer.', ['remoteevents']],
      ['Client/server communication', 'i', 25, 'Choose the right tool and design clean messages between both sides.', ['remoteevents', 'remotefunctions']],
      ['Server-side validation', 'a', 25, 'Check every request on the server before acting on it.', ['client-server-communication']],
      ['Exploit prevention', 'a', 30, 'Design systems that stay safe when a client cannot be trusted.', ['server-side-validation']],
      ['Multiplayer systems', 'a', 40, 'Build features that behave correctly for many players at once.', ['exploit-prevention', 'health-systems']],
    ],
  },
  {
    id: 'data',
    title: 'Data and Progression',
    summary: 'Remember players between sessions and reward them for playing.',
    lessons: [
      ['Saving player data', 'i', 15, 'Plan what to save and when, before writing any code.', ['players', 'error-handling', 'serverscriptservice']],
      ['DataStores', 'i', 30, 'Read and write persistent data safely with DataStoreService.', ['saving-player-data', 'tables']],
      ['Inventories', 'i', 30, 'Store and restore the items a player owns.', ['datastores', 'iterating-through-tables']],
      ['Currency systems', 'a', 30, 'Track, spend and protect in-game currency.', ['datastores', 'server-side-validation']],
      ['Experience and leveling', 'i', 30, 'Award experience and turn it into levels.', ['datastores', 'arithmetic-and-operators']],
      ['Progression systems', 'a', 40, 'Tie levels, items and currency into a long-term journey.', ['experience-and-leveling', 'inventories', 'currency-systems']],
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Systems',
    summary: 'Architecture, performance and the skills of a professional scripter.',
    lessons: [
      ['ModuleScripts', 'i', 25, 'Share and organise code by splitting it into modules.', ['script-types-and-execution-contexts', 'tables']],
      ['Object-oriented programming patterns', 'a', 35, 'Model things in your game as objects that own their data and behaviour.', ['modulescripts']],
      ['Metatables', 'a', 30, 'Customise how tables behave, and see how object patterns work underneath.', ['object-oriented-programming-patterns']],
      ['State machines', 'a', 30, 'Manage complex behaviour as a set of clear states and transitions.', ['modulescripts', 'conditionals']],
      ['Advanced combat architecture', 'a', 50, 'Structure a combat system so it stays easy to extend and fix.', ['combat-systems', 'state-machines', 'object-oriented-programming-patterns']],
      ['Performance optimization', 'a', 35, 'Find what is slow and make scripts do less work.', ['modulescripts', 'iterating-through-tables']],
      ['Debugging', 'i', 30, 'Track down bugs methodically with the tools Studio gives you.', ['error-handling', 'script-types-and-execution-contexts']],
      ['Complete gameplay systems', 'a', 90, 'Bring combat, progression, networking and polish together in one project.', ['advanced-combat-architecture', 'progression-systems', 'multiplayer-systems', 'performance-optimization', 'debugging']],
    ],
  },
];

/** Lowercase, hyphenated version of a title. "Client/server communication" -> "client-server-communication". */
export function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ---- Build step: turns the compact rows above into full lesson objects ----

const slugToId = new Map();
for (const spec of SECTION_SPECS) {
  for (const row of spec.lessons) slugToId.set(slugify(row[0]), `${spec.id}-${slugify(row[0])}`);
}

export const sections = [];
export const lessons = [];
export const sectionsById = new Map();
export const lessonsById = new Map();

SECTION_SPECS.forEach((spec, sectionIndex) => {
  const section = {
    id: spec.id,
    number: sectionIndex + 1,
    title: spec.title,
    summary: spec.summary,
    lessons: [],
  };

  spec.lessons.forEach(([title, code, minutes, description, requires], indexInSection) => {
    const slug = slugify(title);
    const lesson = Object.freeze({
      id: `${spec.id}-${slug}`,
      slug,
      title,
      description,
      difficulty: DIFFICULTY_CODES[code],
      minutes,
      sectionId: spec.id,
      indexInSection,
      order: lessons.length,
      // Unknown slugs are kept as "missing:<slug>" so validateCurriculum() can report them.
      prerequisites: Object.freeze(requires.map((slug) => slugToId.get(slug) ?? `missing:${slug}`)),
      // Default completion status. The real status comes from saved progress (see js/lessons.js).
      status: 'not-started',
      // Placeholder until the educational content is written in a later stage.
      content: Object.freeze({ state: 'placeholder', objectives: [], body: [] }),
    });
    section.lessons.push(lesson);
    lessons.push(lesson);
    lessonsById.set(lesson.id, lesson);
  });

  sections.push(section);
  sectionsById.set(section.id, section);
});

export function totalLessons() {
  return lessons.length;
}
