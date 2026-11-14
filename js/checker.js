// Judges a learner's code against an exercise and explains what went wrong in plain language.
import { runLuau, toJS } from './luau/run.js';

export function stripComments(code) {
  return code.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, '').replace(/--.*$/gm, '');
}

/** Turn an interpreter error into a beginner-friendly explanation. */
export function friendlyError(error) {
  const m = error.message;
  if (error.kind === 'syntax') {
    return `Luau could not understand the code (a syntax error). ${m}. Read that line carefully: check brackets, quote marks, and words like then, do and end.`;
  }
  if (error.kind === 'timeout') return `${m} Check that every while or repeat loop has something inside it that eventually makes the condition stop.`;
  let tip = '';
  if (/attempt to index nil/.test(m)) tip = 'You tried to look inside something that is nil (it does not exist yet). This is usually a spelling mistake in a name, or a value that was never set.';
  else if (/attempt to call a nil value/.test(m)) tip = 'You tried to run a function that does not exist. Check the spelling and capital letters of the name, and that you created it before using it.';
  else if (/attempt to perform arithmetic/.test(m)) tip = 'Maths only works on numbers. One of the values is nil or is text that is not a number.';
  else if (/attempt to compare/.test(m)) tip = 'You can only compare two values of the same kind, for example number with number.';
  else if (/attempt to concatenate/.test(m)) tip = 'The .. operator joins text and numbers. One side is nil, true/false or a table. Convert it with tostring() first.';
  else if (/is not a valid member/.test(m)) tip = 'That name does not exist on this object. Roblox names are case sensitive: Part.Anchored works, part.anchored does not.';
  else if (/Unable to assign property/.test(m)) tip = 'A property only accepts one kind of value. Look at the kind it expects in the message.';
  else if (/stack overflow/.test(m)) tip = 'A function kept calling itself without ever stopping.';
  else if (/Infinite yield/.test(m)) tip = 'WaitForChild waits for something that never appeared. Check the name you asked for.';
  return `Your code stopped with an error: ${m}${tip ? ` ${tip}` : ''}`;
}

function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const norm = (s) => s.replace(/\t/g, ' ');

function describeOutputMismatch(rawGot, rawWant) {
  const got = rawGot.map(norm), want = rawWant.map(norm);
  if (!got.length) return 'Your code did not print anything. Use print(...) to show each required line.';
  for (let i = 0; i < Math.max(got.length, want.length); i++) {
    if (got[i] === want[i]) continue;
    if (got[i] === undefined) return `Your code printed ${got.length} line${got.length === 1 ? '' : 's'} but ${want.length} are expected. Line ${i + 1} should be “${want[i]}” and is missing.`;
    if (want[i] === undefined) return `Your code printed an extra line: “${got[i]}”. Only ${want.length} line${want.length === 1 ? ' is' : 's are'} expected.`;
    const spaceOnly = got[i].replace(/\s+/g, '') === want[i].replace(/\s+/g, '');
    return `Line ${i + 1} of the output should be “${want[i]}” but yours printed “${got[i]}”.${spaceOnly ? ' Check the spaces.' : ''}${got[i].toLowerCase() === want[i].toLowerCase() ? ' Check the capital letters.' : ''}`;
  }
  return '';
}

/**
 * Evaluate one exercise. Returns { pass, messages[], out[], error }.
 * Exercise test fields: out, need, avoid, calls, check.
 */
export function evaluateExercise(ex, code) {
  const result = runLuau(code);
  const res = { pass: false, messages: [], out: result.out, error: result.error };

  if (result.error) { res.messages.push(friendlyError(result.error)); return res; }

  for (const [re, what] of ex.rawNeed ?? []) {
    if (!re.test(code)) { res.messages.push(`The task asks you to include ${what}. I could not find it in your code.`); return res; }
  }
  const bare = stripComments(code);
  for (const [re, what] of ex.need ?? []) {
    if (!re.test(bare)) { res.messages.push(`Your code runs, but the task asks you to use ${what}. I could not find it in your code.`); return res; }
  }
  for (const [re, what] of ex.avoid ?? []) {
    if (re.test(bare)) { res.messages.push(`${what}`); return res; }
  }
  if (ex.out) {
    const msg = describeOutputMismatch(result.out, ex.out);
    if (msg) { res.messages.push(msg); return res; }
  }
  // "vary" re-runs the code with changed starting values, so printing a fixed answer is not enough.
  for (const v of ex.vary ?? []) {
    let changed = code, touched = false;
    for (const [re, rep] of v.set) { const next = changed.replace(re, rep); if (next !== changed) touched = true; changed = next; }
    if (!touched) continue;
    const again = runLuau(changed);
    const msg = again.error ? friendlyError(again.error) : describeOutputMismatch(again.out, v.out);
    if (msg) {
      res.messages.push(`Your code works for the starting values, but I tried changing them (${v.say ?? 'a different starting value'}) and then: ${msg} Make your code work out the answer from the variables instead of printing a fixed message.`);
      return res;
    }
  }
  try {
    for (const [fn, args, want] of ex.calls ?? []) {
      if (result.get(fn) === undefined) { res.messages.push(`I could not find a function called “${fn}”. Create it with exactly that name.`); return res; }
      const got = toJS(result.call(fn, ...args));
      if (!sameValue(got, want)) { res.messages.push(`Calling ${fn}(${args.map((a) => JSON.stringify(a)).join(', ')}) gave ${JSON.stringify(got)} but it should give ${JSON.stringify(want)}.`); return res; }
    }
    const custom = ex.check ? ex.check(result) : undefined;
    if (typeof custom === 'string') { res.messages.push(custom); return res; }
    if (result.world && result.world.errors.length) { res.messages.push(`Something in your code caused an error while the game was running: ${result.world.errors[0]}`); return res; }
  } catch (e) {
    if (e && e.value !== undefined) { res.messages.push(friendlyError({ kind: 'runtime', message: typeof e.value === 'string' ? e.value : 'error' })); return res; }
    // The test looked for something (a variable, function or object) that your code does not have.
    res.messages.push('I could not check your code because something the task needs is missing or has a different name. Keep the variable and function names given in the task, and make sure the starter lines you need are still there.');
    return res;
  }
  res.pass = true;
  return res;
}
