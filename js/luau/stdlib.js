// Standard library: print, string, math, table, os and friends.
import { LuaTable, LuaFunction, LuaError, LuauTimeout, Host, fmtNumber } from './interpreter.js';

// ---- Lua patterns -> JavaScript regular expressions ----
const CLASSES = { a: 'A-Za-z', d: '0-9', l: 'a-z', u: 'A-Z', w: 'A-Za-z0-9', s: '\\s', p: '!-\\/:-@\\[-`{-~', x: '0-9A-Fa-f', c: '\\x00-\\x1f' };
const esc = (c) => c.replace(/[\\^$.*+?()[\]{}|/-]/g, '\\$&');

export function patternToRegex(pat, flags = '') {
  let re = '', i = 0;
  const atom = () => {
    const c = pat[i];
    if (c === '%') {
      const d = pat[i + 1]; i += 2;
      if (d === 'b' || d === 'f') throw new LuaError('Patterns using %b or %f are not supported in Luau Academy');
      if (CLASSES[d]) return `[${CLASSES[d]}]`;
      if (CLASSES[d.toLowerCase()]) return `[^${CLASSES[d.toLowerCase()]}]`;
      return esc(d);
    }
    if (c === '[') {
      let j = i + 1, set = '[';
      if (pat[j] === '^') { set += '^'; j++; }
      while (j < pat.length && (pat[j] !== ']' || j === i + 1 || (set === '[^' && j === i + 2))) {
        if (pat[j] === '%') { const d = pat[j + 1]; set += CLASSES[d] ?? (CLASSES[d.toLowerCase()] ? '' : esc(d)); j += 2; }
        else { set += pat[j] === '-' && j > i + 1 && pat[j + 1] !== ']' ? '-' : esc(pat[j]); j++; }
      }
      i = j + 1;
      return `${set}]`;
    }
    if (c === '.') { i++; return '[\\s\\S]'; }
    i++;
    return esc(c);
  };
  while (i < pat.length) {
    const c = pat[i];
    if (c === '^' && i === 0) { re += '^'; i++; }
    else if (c === '$' && i === pat.length - 1) { re += '$'; i++; }
    else if (c === '(') { re += '('; i++; }
    else if (c === ')') { re += ')'; i++; }
    else {
      re += atom();
      const q = pat[i];
      if (q === '*' || q === '+' || q === '?') { re += q; i++; } else if (q === '-') { re += '*?'; i++; }
    }
  }
  return new RegExp(re, flags);
}

function formatString(interp, fmt, args) {
  let ai = 0;
  return fmt.replace(/%([-+ 0#]*)(\d+)?(?:\.(\d+))?([a-zA-Z%])/g, (m, flags, width, prec, spec) => {
    if (spec === '%') return '%';
    const arg = args[ai++];
    let s;
    switch (spec) {
      case 'd': case 'i': { const n = interp.tonum(arg); if (n === undefined) throw interp.err(`bad argument to 'format' (number expected, got ${interp.type(arg)})`); s = String(Math.trunc(n)); if (flags.includes('+') && n >= 0) s = '+' + s; break; }
      case 'f': case 'F': { const n = interp.tonum(arg); if (n === undefined) throw interp.err(`bad argument to 'format' (number expected, got ${interp.type(arg)})`); s = n.toFixed(prec === undefined ? 6 : +prec); break; }
      case 'g': { const n = interp.tonum(arg); s = fmtNumber(n); break; }
      case 'e': s = Number(interp.tonum(arg)).toExponential(prec === undefined ? 6 : +prec).replace(/e([+-])(\d)$/, 'e$10$2'); break;
      case 'x': s = Math.trunc(interp.tonum(arg)).toString(16); break;
      case 'X': s = Math.trunc(interp.tonum(arg)).toString(16).toUpperCase(); break;
      case 'o': s = Math.trunc(interp.tonum(arg)).toString(8); break;
      case 'c': s = String.fromCharCode(interp.tonum(arg)); break;
      case 'q': s = JSON.stringify(interp.tostr(arg)); break;
      case 's': s = interp.tostr(arg); if (prec !== undefined) s = s.slice(0, +prec); break;
      default: throw interp.err(`invalid option '%${spec}' to 'format'`);
    }
    if (width) {
      const w = +width;
      if (flags.includes('-')) s = s.padEnd(w);
      else if (flags.includes('0') && spec !== 's') s = (s[0] === '-' ? '-' + s.slice(1).padStart(w - 1, '0') : s.padStart(w, '0'));
      else s = s.padStart(w);
    }
    return s;
  });
}

export function installStdlib(interp) {
  const G = interp.globals;
  const def = (t, name, fn) => t.set(name, fn);
  const num = (v, fname, i = 1) => {
    const n = interp.tonum(v);
    if (n === undefined) throw interp.err(`bad argument #${i} to '${fname}' (number expected, got ${interp.type(v)})`);
    return n;
  };
  const str = (v, fname, i = 1) => {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return fmtNumber(v);
    throw interp.err(`bad argument #${i} to '${fname}' (string expected, got ${interp.type(v)})`);
  };
  const tbl = (v, fname, i = 1) => {
    if (!(v instanceof LuaTable)) throw interp.err(`bad argument #${i} to '${fname}' (table expected, got ${interp.type(v)})`);
    return v;
  };

  // ---- base functions ----
  def(G, 'print', (a) => { interp.out.push(a.map((v) => interp.tostr(v)).join('\t')); });
  def(G, 'warn', (a) => { interp.out.push('Warning: ' + a.map((v) => interp.tostr(v)).join('\t')); });
  def(G, 'type', (a) => [interp.type(a[0])]);
  def(G, 'typeof', (a) => [interp.typeOf(a[0])]);
  def(G, 'tostring', (a) => [interp.tostr(a[0])]);
  def(G, 'tonumber', (a) => {
    if (a[1] !== undefined) { const n = parseInt(String(a[0]), a[1]); return [Number.isNaN(n) ? undefined : n]; }
    return [interp.tonum(a[0])];
  });
  def(G, 'assert', (a) => {
    if (!interp.truthy(a[0])) throw new LuaError(a[1] !== undefined ? a[1] : 'assertion failed!');
    return a;
  });
  def(G, 'error', (a) => {
    const level = a[1] === undefined ? 1 : a[1];
    if (typeof a[0] === 'string' && level > 0) {
      const line = level === 1 ? interp.line : (interp.callLines[interp.callLines.length - (level - 1)] ?? interp.line);
      throw new LuaError(`Script:${line}: ${a[0]}`);
    }
    throw new LuaError(a[0]);
  });
  const guard = (fn) => {
    try { return [true, ...fn()]; } catch (e) {
      if (e instanceof LuaError) return [false, e.value];
      if (e instanceof LuauTimeout || e.isSyntax) throw e;
      if (e instanceof RangeError) return [false, 'stack overflow'];
      throw e;
    }
  };
  def(G, 'pcall', (a) => { const depth = interp.callLines.length; const r = guard(() => interp.call(a[0], a.slice(1))); interp.callLines.length = depth; return r; });
  def(G, 'xpcall', (a) => {
    const depth = interp.callLines.length;
    try { return [true, ...interp.call(a[0], a.slice(2))]; } catch (e) {
      if (!(e instanceof LuaError)) throw e;
      interp.callLines.length = depth;
      return [false, ...interp.call(a[1], [e.value])];
    }
  });
  def(G, 'select', (a) => {
    if (a[0] === '#') return [a.length - 1];
    const n = num(a[0], 'select');
    return n < 0 ? a.slice(a.length + n) : a.slice(n);
  });
  def(G, 'rawget', (a) => [a[0].get(a[1])]);
  def(G, 'rawset', (a) => { a[0].set(a[1], a[2]); return [a[0]]; });
  def(G, 'rawequal', (a) => [a[0] === a[1]]);
  def(G, 'rawlen', (a) => [a[0] instanceof LuaTable ? a[0].length() : String(a[0]).length]);
  def(G, 'setmetatable', (a) => { tbl(a[0], 'setmetatable'); a[0].meta = a[1] instanceof LuaTable ? a[1] : null; return [a[0]]; });
  def(G, 'getmetatable', (a) => { const m = interp.metaOf(a[0]); return [m ?? undefined]; });
  const next = (a) => {
    const t = tbl(a[0], 'next');
    const es = t.entries();
    if (a[1] === undefined) return es.length ? es[0] : [undefined];
    const i = es.findIndex(([k]) => k === a[1]);
    return i >= 0 && i + 1 < es.length ? es[i + 1] : [undefined];
  };
  def(G, 'next', next);
  def(G, 'pairs', (a) => {
    const h = a[0] instanceof LuaTable && a[0].meta && a[0].meta.get('__iter');
    if (h) return interp.call(h, [a[0]]);
    tbl(a[0], 'pairs');
    return [next, a[0], undefined];
  });
  interp.ipairsIter = (a) => { const v = interp.index(a[0], a[1] + 1); return v === undefined ? [undefined] : [a[1] + 1, v]; };
  def(G, 'ipairs', (a) => { if (a[0] === undefined) throw interp.err("bad argument #1 to 'ipairs' (table expected, got nil)"); return [interp.ipairsIter, a[0], 0]; });
  def(G, 'unpack', (a) => { const t = tbl(a[0], 'unpack'); const i = a[1] ?? 1, j = a[2] ?? t.length(); const r = []; for (let k = i; k <= j; k++) r.push(t.get(k)); return r; });
  G.set('_G', G);
  G.set('_VERSION', 'Luau');

  // ---- string ----
  const S = new LuaTable();
  interp.stringMeta = S;
  G.set('string', S);
  def(S, 'len', (a) => [str(a[0], 'len').length]);
  def(S, 'upper', (a) => [str(a[0], 'upper').toUpperCase()]);
  def(S, 'lower', (a) => [str(a[0], 'lower').toLowerCase()]);
  def(S, 'reverse', (a) => [[...str(a[0], 'reverse')].reverse().join('')]);
  def(S, 'rep', (a) => { const n = num(a[1], 'rep', 2); const sep = a[2] ?? ''; return [Array(Math.max(0, n)).fill(str(a[0], 'rep')).join(sep)]; });
  def(S, 'sub', (a) => {
    const s = str(a[0], 'sub'); const len = s.length;
    let i = a[1] === undefined ? 1 : Math.trunc(num(a[1], 'sub', 2)), j = a[2] === undefined ? -1 : Math.trunc(num(a[2], 'sub', 3));
    if (i < 0) i = Math.max(len + i + 1, 1); else if (i === 0) i = 1;
    if (j < 0) j = len + j + 1; else if (j > len) j = len;
    return [i > j ? '' : s.slice(i - 1, j)];
  });
  def(S, 'byte', (a) => { const s = str(a[0], 'byte'); const i = a[1] ?? 1; const j = a[2] ?? i; const r = []; for (let k = i; k <= j; k++) if (s[k - 1] !== undefined) r.push(s.charCodeAt(k - 1)); return r; });
  def(S, 'char', (a) => [a.map((n) => String.fromCharCode(num(n, 'char'))).join('')]);
  def(S, 'format', (a) => [formatString(interp, str(a[0], 'format'), a.slice(1))]);
  def(S, 'split', (a) => { const t = new LuaTable(); str(a[0], 'split').split(a[1] ?? ',').forEach((p, i) => t.set(i + 1, p)); return [t]; });
  const find = (a, wantMatch) => {
    const s = str(a[0], wantMatch ? 'match' : 'find'), pat = str(a[1], wantMatch ? 'match' : 'find', 2);
    let init = a[2] === undefined ? 1 : a[2]; if (init < 0) init = Math.max(s.length + init + 1, 1);
    if (!wantMatch && interp.truthy(a[3])) { const k = s.indexOf(pat, init - 1); return k < 0 ? [undefined] : [k + 1, k + pat.length]; }
    const re = patternToRegex(pat, 'g'); re.lastIndex = init - 1;
    const m = re.exec(s);
    if (!m) return [undefined];
    if (pat[0] === '^' && m.index !== init - 1) return [undefined];
    const caps = m.slice(1);
    if (wantMatch) return caps.length ? caps : [m[0]];
    return [m.index + 1, m.index + m[0].length, ...caps];
  };
  def(S, 'find', (a) => find(a, false));
  def(S, 'match', (a) => find(a, true));
  def(S, 'gmatch', (a) => {
    const s = str(a[0], 'gmatch'); const re = patternToRegex(str(a[1], 'gmatch', 2), 'g');
    return [() => { const m = re.exec(s); if (!m) return [undefined]; if (m[0] === '') re.lastIndex++; const caps = m.slice(1); return caps.length ? caps : [m[0]]; }];
  });
  def(S, 'gsub', (a) => {
    const s = str(a[0], 'gsub'); const re = patternToRegex(str(a[1], 'gsub', 2), 'g'); const rep = a[2]; const max = a[3] ?? Infinity;
    let count = 0;
    const out = s.replace(re, (...m) => {
      const caps = m.slice(1, m.findIndex((x) => typeof x === 'number'));
      const whole = m[0];
      if (count >= max) return whole;
      count++;
      let r;
      if (typeof rep === 'string' || typeof rep === 'number') r = String(rep).replace(/%(\d|%)/g, (_, d) => (d === '%' ? '%' : d === '0' ? whole : caps[+d - 1] ?? ''));
      else if (rep instanceof LuaTable) r = rep.get(caps[0] ?? whole);
      else r = interp.call(rep, caps.length ? caps : [whole])[0];
      return r === undefined || r === false ? whole : interp.tostr(r);
    });
    return [out, count];
  });

  // ---- math ----
  const M = new LuaTable();
  G.set('math', M);
  M.set('pi', Math.PI); M.set('huge', Infinity);
  const m1 = (name, f) => def(M, name, (a) => [f(num(a[0], name))]);
  m1('floor', Math.floor); m1('ceil', Math.ceil); m1('abs', Math.abs); m1('sqrt', Math.sqrt); m1('sin', Math.sin); m1('cos', Math.cos);
  m1('tan', Math.tan); m1('exp', Math.exp); m1('deg', (x) => x * 180 / Math.PI); m1('rad', (x) => x * Math.PI / 180);
  m1('round', (x) => (x < 0 ? -Math.round(-x) : Math.round(x))); m1('sign', Math.sign);
  def(M, 'log', (a) => [a[1] === undefined ? Math.log(num(a[0], 'log')) : Math.log(num(a[0], 'log')) / Math.log(num(a[1], 'log', 2))]);
  def(M, 'max', (a) => [Math.max(...a.map((v, i) => num(v, 'max', i + 1)))]);
  def(M, 'min', (a) => [Math.min(...a.map((v, i) => num(v, 'min', i + 1)))]);
  def(M, 'fmod', (a) => [num(a[0], 'fmod') % num(a[1], 'fmod', 2)]);
  def(M, 'pow', (a) => [num(a[0], 'pow') ** num(a[1], 'pow', 2)]);
  def(M, 'clamp', (a) => [Math.min(Math.max(num(a[0], 'clamp'), num(a[1], 'clamp', 2)), num(a[2], 'clamp', 3))]);
  def(M, 'random', (a) => {
    const r = Math.random();
    if (a.length === 0) return [r];
    const lo = a.length === 1 ? 1 : num(a[0], 'random'), hi = num(a[a.length - 1], 'random');
    if (lo > hi) throw interp.err("bad argument to 'random' (interval is empty)");
    return [Math.floor(r * (hi - lo + 1)) + lo];
  });
  def(M, 'randomseed', () => {});

  // ---- table ----
  const T = new LuaTable();
  G.set('table', T);
  def(T, 'insert', (a) => {
    const t = tbl(a[0], 'insert');
    if (a.length === 2) t.set(t.length() + 1, a[1]);
    else if (a.length === 3) { const pos = num(a[1], 'insert', 2); for (let i = t.length(); i >= pos; i--) t.set(i + 1, t.get(i)); t.set(pos, a[2]); }
    else throw interp.err("wrong number of arguments to 'insert'");
  });
  def(T, 'remove', (a) => {
    const t = tbl(a[0], 'remove'); const n = t.length();
    if (n === 0) return [undefined];
    const pos = a[1] === undefined ? n : num(a[1], 'remove', 2);
    const v = t.get(pos);
    for (let i = pos; i < n; i++) t.set(i, t.get(i + 1));
    t.set(n, undefined);
    return [v];
  });
  def(T, 'concat', (a) => {
    const t = tbl(a[0], 'concat'); const parts = [];
    const i = a[2] ?? 1, j = a[3] ?? t.length();
    for (let k = i; k <= j; k++) {
      const v = t.get(k);
      if (typeof v !== 'string' && typeof v !== 'number') throw interp.err(`invalid value (${interp.type(v)}) at index ${k} in table for 'concat'`);
      parts.push(interp.tostr(v));
    }
    return [parts.join(a[1] ?? '')];
  });
  def(T, 'sort', (a) => {
    const t = tbl(a[0], 'sort'); const cmp = a[1];
    const lt = cmp === undefined ? (x, y) => interp.less(x, y, false) : (x, y) => interp.truthy(interp.call(cmp, [x, y])[0]);
    const arr = t.arr.slice();
    arr.sort((x, y) => (lt(x, y) ? -1 : lt(y, x) ? 1 : 0));
    arr.forEach((v, i) => { t.arr[i] = v; });
  });
  def(T, 'find', (a) => { const t = tbl(a[0], 'find'); for (let i = a[2] ?? 1; i <= t.length(); i++) if (interp.equals(t.get(i), a[1])) return [i]; return [undefined]; });
  def(T, 'unpack', (a) => G.get('unpack')(a));
  def(T, 'clear', (a) => { const t = tbl(a[0], 'clear'); t.arr = []; t.hash = new Map(); });
  def(T, 'clone', (a) => { const t = tbl(a[0], 'clone'); const c = new LuaTable(); t.entries().forEach(([k, v]) => c.set(k, v)); c.meta = t.meta; return [c]; });
  def(T, 'pack', (a) => { const t = new LuaTable(); a.forEach((v, i) => t.set(i + 1, v)); t.set('n', a.length); return [t]; });
  def(T, 'freeze', (a) => [a[0]]);
  def(T, 'isfrozen', () => [false]);

  // ---- os ----
  const O = new LuaTable();
  G.set('os', O);
  def(O, 'time', () => [1700000000 + Math.floor(interp.clock ? interp.clock() : 0)]);
  def(O, 'clock', () => [interp.clock ? interp.clock() : 0]);
  def(O, 'date', () => ['2024-01-01 00:00:00']);
}

export { LuaFunction, Host };
