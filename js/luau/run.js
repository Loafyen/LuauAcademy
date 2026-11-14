// Runs a learner's code and returns everything a test needs to judge it.
import { Interpreter, LuaTable, LuaError, LuauTimeout, LuaFunction, Host } from './interpreter.js';
import { LuauSyntaxError } from './lexer.js';
import { installStdlib } from './stdlib.js';
import { installRoblox } from './roblox.js';

/** Convert a Luau value to plain JavaScript (tables of 1..n become arrays). */
export function toJS(v, seen = new Set()) {
  if (v instanceof LuaTable) {
    if (seen.has(v)) return '[circular]';
    seen.add(v);
    const es = v.entries();
    if (es.length === v.length()) return es.map(([, x]) => toJS(x, seen));
    return Object.fromEntries(es.map(([k, x]) => [String(k), toJS(x, seen)]));
  }
  if (v instanceof LuaFunction || typeof v === 'function') return '[function]';
  if (v instanceof Host) return v.toString();
  return v;
}

export function toLua(v) {
  if (Array.isArray(v)) { const t = new LuaTable(); v.forEach((x, i) => t.set(i + 1, toLua(x))); return t; }
  if (v && typeof v === 'object' && !(v instanceof Host) && !(v instanceof LuaTable)) { const t = new LuaTable(); Object.entries(v).forEach(([k, x]) => t.set(k, toLua(x))); return t; }
  return v;
}

export function runLuau(code, { roblox = true, maxSteps } = {}) {
  const interp = new Interpreter({ maxSteps });
  installStdlib(interp);
  const world = roblox ? installRoblox(interp) : null;
  const result = { code, interp, world, out: interp.out, error: null, returned: [] };
  try {
    result.returned = interp.run(code);
  } catch (e) {
    if (e instanceof LuaError) result.error = { kind: 'runtime', message: typeof e.value === 'string' ? e.value : interp.tostr(e.value) };
    else if (e instanceof LuauTimeout) result.error = { kind: 'timeout', message: e.message };
    else if (e instanceof LuauSyntaxError) result.error = { kind: 'syntax', message: `Line ${e.line}: ${e.message}`, line: e.line };
    else if (e instanceof RangeError) result.error = { kind: 'runtime', message: 'stack overflow: a function keeps calling itself without stopping' };
    else throw e;
  }
  result.ok = !result.error;
  // Helpers for tests
  result.get = (name) => interp.lookup(name);
  result.call = (name, ...args) => {
    const fn = interp.lookup(name);
    if (fn === undefined) throw new LuaError(`The test could not find "${name}". Is it defined in your code with exactly that name?`);
    return interp.call(fn, args.map(toLua))[0];
  };
  result.callAll = (name, ...args) => interp.call(interp.lookup(name), args.map(toLua));
  result.throws = (name, ...args) => { try { result.call(name, ...args); return null; } catch (e) { if (e instanceof LuaError) return typeof e.value === 'string' ? e.value : 'error'; throw e; } };
  result.mk = toLua;
  result.ret = () => result.returned[0];
  result.field = (obj, name) => interp.index(obj, name);
  result.method = (obj, name, ...args) => interp.call(interp.index(obj, name), [obj, ...args.map(toLua)])[0];
  result.js = toJS;
  return result;
}
