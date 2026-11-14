// Tree-walking evaluator for the Luau subset taught in Luau Academy.
import { parse } from './parser.js';

let nextId = 0x1000;

export class LuaTable {
  constructor() { this.arr = []; this.hash = new Map(); this.meta = null; this.id = nextId += 0x20; }
  get(k) {
    if (typeof k === 'number' && Number.isInteger(k) && k >= 1 && k <= this.arr.length) return this.arr[k - 1];
    return this.hash.get(k);
  }
  set(k, v) {
    if (typeof k === 'number' && Number.isInteger(k) && k >= 1) {
      const n = this.arr.length;
      if (k <= n) {
        this.arr[k - 1] = v;
        if (v === undefined && k === n) { while (this.arr.length && this.arr[this.arr.length - 1] === undefined) this.arr.pop(); }
        return;
      }
      if (k === n + 1 && v !== undefined) {
        this.arr.push(v);
        while (this.hash.has(this.arr.length + 1)) { const nk = this.arr.length + 1; this.arr.push(this.hash.get(nk)); this.hash.delete(nk); }
        return;
      }
    }
    if (v === undefined) this.hash.delete(k); else this.hash.set(k, v);
  }
  length() { return this.arr.length; }
  /** [key, value] pairs in iteration order. */
  entries() {
    const out = [];
    this.arr.forEach((v, i) => { if (v !== undefined) out.push([i + 1, v]); });
    for (const [k, v] of this.hash) out.push([k, v]);
    return out;
  }
  toArray() { return [...this.arr]; }
}

export class LuaFunction { constructor(node, scope) { this.node = node; this.scope = scope; } }
export class Host { typeofName() { return 'userdata'; } toString() { return 'userdata'; } }

export class LuaError extends Error {
  constructor(value) { super(typeof value === 'string' ? value : 'error object'); this.value = value; }
}
export class LuauTimeout extends Error {}

class Scope {
  constructor(parent) { this.vars = new Map(); this.parent = parent; }
  find(name) { for (let s = this; s; s = s.parent) if (s.vars.has(name)) return s; return null; }
}

const BREAK = { t: 'break' }, CONTINUE = { t: 'continue' };

export function fmtNumber(n) {
  if (Number.isNaN(n)) return 'nan';
  if (n === Infinity) return 'inf';
  if (n === -Infinity) return '-inf';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(Number(n.toPrecision(14)));
}

export class Interpreter {
  constructor({ maxSteps = 400000 } = {}) {
    this.globals = new LuaTable();
    this.out = [];
    this.steps = 0;
    this.maxSteps = maxSteps;
    this.line = 0;
    this.callLines = [];
    this.topScope = new Scope(null);
    this.stringMeta = null;
  }

  // ---------- public API ----------
  run(code) {
    const ast = parse(code);
    const sig = this.execBlock(ast.body, this.topScope, true);
    return sig && sig.t === 'return' ? sig.vals : [];
  }
  /** Look up a top-level local first, then a global. */
  lookup(name) {
    const s = this.topScope.find(name);
    return s ? s.vars.get(name) : this.globals.get(name);
  }
  callByName(name, args = []) { return this.call(this.lookup(name), args); }

  // ---------- helpers ----------
  err(msg, line = this.line) { return new LuaError(`Script:${line}: ${msg}`); }
  tick() { if (++this.steps > this.maxSteps) throw new LuauTimeout('Script timeout: the code ran for too long. A loop may never finish.'); }
  truthy(v) { return v !== undefined && v !== false; }
  type(v) {
    if (v === undefined) return 'nil';
    const t = typeof v;
    if (t === 'boolean' || t === 'number' || t === 'string') return t;
    if (t === 'function' || v instanceof LuaFunction) return 'function';
    if (v instanceof LuaTable) return 'table';
    return 'userdata';
  }
  typeOf(v) { return v instanceof Host ? v.typeofName() : this.type(v); }
  tostr(v) {
    if (v === undefined) return 'nil';
    if (typeof v === 'number') return fmtNumber(v);
    if (typeof v === 'string') return v;
    if (typeof v === 'boolean') return String(v);
    if (v instanceof LuaTable) {
      const h = v.meta && v.meta.get('__tostring');
      if (h !== undefined) return this.tostr(this.call(h, [v])[0]);
      return `table: 0x${v.id.toString(16).padStart(8, '0')}`;
    }
    if (v instanceof Host) return v.toString();
    return `function: 0x${(0x4000).toString(16).padStart(8, '0')}`;
  }
  tonum(v) {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') { const s = v.trim(); if (s !== '' && /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$|^0[xX][0-9a-fA-F]+$/.test(s)) return Number(s); }
    return undefined;
  }
  metaOf(v) { return v instanceof LuaTable ? v.meta : v instanceof Host && v.meta ? v.meta : (typeof v === 'string' ? this.stringMeta : null); }

  // ---------- calling ----------
  call(fn, args, node) {
    if (fn instanceof LuaFunction) return this.callLua(fn, args, node);
    if (typeof fn === 'function') { const r = fn(args, this); return r === undefined ? [] : r; }
    const h = fn instanceof LuaTable && fn.meta && fn.meta.get('__call');
    if (h !== undefined && h !== false) return this.call(h, [fn, ...args], node);
    throw this.err(`attempt to call a ${this.type(fn)} value${node ? this.describe(node.fn ?? node) : ''}`);
  }
  describe(n) {
    if (!n) return '';
    if (n.t === 'Name') return ` (global '${n.name}')`;
    if (n.t === 'Index' && n.field) return ` (field '${n.field}')`;
    if (n.t === 'MethodCall') return ` (method '${n.name}')`;
    return '';
  }
  callLua(fn, args, node) {
    if (this.callLines.length > 180) throw this.err('stack overflow: a function keeps calling itself without stopping');
    const f = fn.node, scope = new Scope(fn.scope);
    for (let i = 0; i < f.params.length; i++) scope.vars.set(f.params[i], args[i]);
    scope.varargs = f.vararg ? args.slice(f.params.length) : [];
    this.callLines.push(node ? node.line : this.line);
    try {
      this.tick();
      const sig = this.execBlock(f.body, scope);
      return sig && sig.t === 'return' ? sig.vals : [];
    } finally { this.callLines.pop(); }
  }

  // ---------- statements ----------
  execBlock(body, scope, noNewScope = false) {
    const s = noNewScope ? scope : new Scope(scope);
    for (const st of body) { const sig = this.exec(st, s); if (sig) return sig; }
    return undefined;
  }

  exec(n, scope) {
    this.tick();
    this.line = n.line;
    switch (n.t) {
      case 'Local': {
        const vals = this.evalList(n.exprs, scope);
        n.names.forEach((nm, i) => scope.vars.set(nm, vals[i]));
        return;
      }
      case 'LocalFunction': {
        const fn = new LuaFunction(n.func, scope);
        scope.vars.set(n.name, fn);
        return;
      }
      case 'Assign': {
        const vals = this.evalList(n.exprs, scope);
        n.targets.forEach((tg, i) => this.assign(tg, vals[i], scope));
        return;
      }
      case 'Compound': {
        if (n.target.t === 'Name') { this.assign(n.target, this.arith(n.op, this.eval(n.target, scope), this.eval(n.expr, scope), n), scope); return; }
        const obj = this.eval(n.target.obj, scope), key = this.eval(n.target.key, scope);
        this.setIndex(obj, key, this.arith(n.op, this.index(obj, key, n.target), this.eval(n.expr, scope), n), n);
        return;
      }
      case 'CallStmt': this.evalMulti(n.expr, scope); return;
      case 'Do': return this.execBlock(n.body, scope);
      case 'If': {
        for (const c of n.clauses) if (this.truthy(this.eval(c.cond, scope))) return this.execBlock(c.body, scope);
        if (n.otherwise) return this.execBlock(n.otherwise, scope);
        return;
      }
      case 'While':
        while (this.truthy(this.eval(n.cond, scope))) {
          this.tick();
          const sig = this.execBlock(n.body, scope);
          if (sig) { if (sig === BREAK) break; if (sig !== CONTINUE) return sig; }
        }
        return;
      case 'Repeat':
        while (true) {
          this.tick();
          const inner = new Scope(scope);
          const sig = this.execBlock(n.body, inner, true);
          if (sig) { if (sig === BREAK) break; if (sig !== CONTINUE) return sig; }
          if (this.truthy(this.eval(n.cond, inner))) break;
        }
        return;
      case 'NumFor': {
        const a = this.tonumStrict(this.eval(n.start, scope), 'initial value'), b = this.tonumStrict(this.eval(n.stop, scope), 'limit');
        const step = n.step ? this.tonumStrict(this.eval(n.step, scope), 'step') : 1;
        if (step === 0) throw this.err("'for' step is zero");
        for (let i = a; step > 0 ? i <= b : i >= b; i += step) {
          this.tick();
          const inner = new Scope(scope);
          inner.vars.set(n.v, i);
          const sig = this.execBlock(n.body, inner, true);
          if (sig) { if (sig === BREAK) break; if (sig !== CONTINUE) return sig; }
        }
        return;
      }
      case 'GenFor': return this.genFor(n, scope);
      case 'Return': return { t: 'return', vals: this.evalList(n.exprs, scope) };
      case 'Break': return BREAK;
      case 'Continue': return CONTINUE;
      default: throw this.err(`unknown statement ${n.t}`);
    }
  }
  tonumStrict(v, what) {
    const x = typeof v === 'number' ? v : undefined;
    if (x === undefined) throw this.err(`'for' ${what} must be a number`);
    return x;
  }

  genFor(n, scope) {
    let [f, s, c] = this.evalList(n.exprs, scope);
    if (f instanceof LuaTable && !(f.meta && f.meta.get('__call'))) { s = f; f = this.globals.get('next'); c = undefined; }
    const body = (vals) => {
      this.tick();
      const inner = new Scope(scope);
      n.names.forEach((nm, i) => inner.vars.set(nm, vals[i]));
      const sig = this.execBlock(n.body, inner, true);
      if (sig) { if (sig === BREAK) return 'break'; if (sig !== CONTINUE) return sig; }
      return undefined;
    };
    const finish = (r) => (r === 'break' ? undefined : r);
    if (f === this.globals.get('next') && s instanceof LuaTable && c === undefined) {
      for (const [k] of s.entries()) {
        const v = s.get(k);
        if (v === undefined) continue;
        const r = body([k, v]); if (r) return finish(r);
      }
      return;
    }
    if (f === this.ipairsIter && s !== undefined) {
      for (let i = 1; ; i++) {
        const v = this.index(s, i, n);
        if (v === undefined) break;
        const r = body([i, v]); if (r) return finish(r);
      }
      return;
    }
    if (typeof f !== 'function' && !(f instanceof LuaFunction)) throw this.err(`attempt to iterate over a ${this.type(f)} value. Use pairs(table) or ipairs(table) to loop through a table`);
    while (true) {
      const vals = this.call(f, [s, c], n);
      if (vals[0] === undefined) break;
      c = vals[0];
      const r = body(vals); if (r) return finish(r);
    }
  }

  assign(target, value, scope) {
    if (target.t === 'Name') {
      const s = scope.find(target.name);
      if (s) s.vars.set(target.name, value); else this.globals.set(target.name, value);
      return;
    }
    this.setIndex(this.eval(target.obj, scope), this.eval(target.key, scope), value, target);
  }

  // ---------- expressions ----------
  evalList(exprs, scope) {
    const out = [];
    exprs.forEach((e, i) => {
      if (i === exprs.length - 1 && (e.t === 'Call' || e.t === 'MethodCall' || e.t === 'Vararg')) out.push(...this.evalMulti(e, scope));
      else out.push(this.eval(e, scope));
    });
    return out;
  }
  evalMulti(e, scope) {
    if (e.t === 'Vararg') { let s = scope; while (s && !s.varargs) s = s.parent; return s ? s.varargs : this.topVarargs ?? []; }
    this.line = e.line;
    if (e.t === 'Call') {
      const fn = this.eval(e.fn, scope);
      const args = this.evalList(e.args, scope);
      this.line = e.line;
      return this.call(fn, args, e);
    }
    const obj = this.eval(e.obj, scope);
    const fn = this.index(obj, e.name, e);
    const args = this.evalList(e.args, scope);
    this.line = e.line;
    return this.call(fn, [obj, ...args], e);
  }

  eval(e, scope) {
    switch (e.t) {
      case 'Number': case 'String': case 'Bool': return e.value;
      case 'Nil': return undefined;
      case 'Name': { const s = scope.find(e.name); return s ? s.vars.get(e.name) : this.globals.get(e.name); }
      case 'Paren': return this.eval(e.e, scope);
      case 'Function': return new LuaFunction(e, scope);
      case 'Interp': return e.parts.map((p) => (typeof p === 'string' ? p : this.tostr(this.eval(p, scope)))).join('');
      case 'Index': this.line = e.line; return this.index(this.eval(e.obj, scope), this.eval(e.key, scope), e);
      case 'Call': case 'MethodCall': case 'Vararg': return this.evalMulti(e, scope)[0];
      case 'Table': return this.table(e, scope);
      case 'IfExpr': return this.truthy(this.eval(e.cond, scope)) ? this.eval(e.a, scope) : this.eval(e.b, scope);
      case 'Unary': return this.unary(e, scope);
      case 'Binary': return this.binary(e, scope);
      default: throw this.err(`unknown expression ${e.t}`);
    }
  }

  table(e, scope) {
    const t = new LuaTable();
    let i = 1;
    e.items.forEach((it, idx) => {
      if (it.kind === 'keyed') { const k = this.eval(it.key, scope); if (k === undefined) throw this.err('table index is nil'); t.set(k, this.eval(it.value, scope)); }
      else if (idx === e.items.length - 1 && ['Call', 'MethodCall', 'Vararg'].includes(it.value.t)) this.evalMulti(it.value, scope).forEach((v) => t.set(i++, v));
      else t.set(i++, this.eval(it.value, scope));
    });
    return t;
  }

  unary(e, scope) {
    const v = this.eval(e.e, scope);
    this.line = e.line;
    if (e.op === 'not') return !this.truthy(v);
    if (e.op === '-') {
      const n = typeof v === 'number' ? v : this.tonum(v);
      if (n !== undefined) return -n;
      const h = this.metaOf(v)?.get?.('__unm');
      if (h) return this.call(h, [v])[0];
      throw this.err(`attempt to perform arithmetic (unm) on ${this.type(v)}`);
    }
    if (typeof v === 'string') return v.length;
    if (v instanceof LuaTable) { const h = v.meta && v.meta.get('__len'); return h ? this.call(h, [v])[0] : v.length(); }
    throw this.err(`attempt to get length of a ${this.type(v)} value`);
  }

  binary(e, scope) {
    const op = e.op;
    if (op === 'and') { const l = this.eval(e.l, scope); return this.truthy(l) ? this.eval(e.r, scope) : l; }
    if (op === 'or') { const l = this.eval(e.l, scope); return this.truthy(l) ? l : this.eval(e.r, scope); }
    const l = this.eval(e.l, scope), r = this.eval(e.r, scope);
    this.line = e.line;
    switch (op) {
      case '==': return this.equals(l, r);
      case '~=': return !this.equals(l, r);
      case '<': return this.less(l, r, false);
      case '<=': return this.less(l, r, true);
      case '>': return this.less(r, l, false, l, r);
      case '>=': return this.less(r, l, true, l, r);
      case '..': return this.concat(l, r);
      default: return this.arith(op, l, r, e);
    }
  }

  equals(a, b) {
    if (a === b) return true;
    if (a instanceof LuaTable && b instanceof LuaTable) {
      const h = (a.meta && a.meta.get('__eq')) || (b.meta && b.meta.get('__eq'));
      return h ? this.truthy(this.call(h, [a, b])[0]) : false;
    }
    if (a instanceof Host && typeof a.equals === 'function') return a.equals(b);
    return false;
  }
  less(a, b, orEqual, oa = a, ob = b) {
    if (typeof a === 'number' && typeof b === 'number') return orEqual ? a <= b : a < b;
    if (typeof a === 'string' && typeof b === 'string') return orEqual ? a <= b : a < b;
    const h = this.metaOf(a)?.get?.(orEqual ? '__le' : '__lt') ?? this.metaOf(b)?.get?.(orEqual ? '__le' : '__lt');
    if (h) return this.truthy(this.call(h, [a, b])[0]);
    throw this.err(`attempt to compare ${this.type(oa)} ${orEqual ? '<=' : '<'} ${this.type(ob)}. Both sides of a comparison must be the same kind of value`);
  }
  concat(a, b) {
    const ok = (v) => typeof v === 'string' || typeof v === 'number';
    if (ok(a) && ok(b)) return this.tostr(a) + this.tostr(b);
    const h = this.metaOf(a)?.get?.('__concat') ?? this.metaOf(b)?.get?.('__concat');
    if (h) return this.call(h, [a, b])[0];
    throw this.err(`attempt to concatenate ${this.type(a)} with ${this.type(b)}. The .. operator joins text and numbers only`);
  }
  arith(op, a, b, node) {
    const NAMES = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '//': 'idiv', '%': 'mod', '^': 'pow' };
    const x = typeof a === 'number' ? a : (typeof a === 'string' ? this.tonum(a) : undefined);
    const y = typeof b === 'number' ? b : (typeof b === 'string' ? this.tonum(b) : undefined);
    if (x !== undefined && y !== undefined) {
      switch (op) {
        case '+': return x + y; case '-': return x - y; case '*': return x * y; case '/': return x / y;
        case '//': return Math.floor(x / y); case '%': return y === 0 ? NaN : x - Math.floor(x / y) * y; case '^': return x ** y;
        case '..': return this.concat(a, b);
        default:
      }
    }
    if (op === '..') return this.concat(a, b);
    const key = `__${NAMES[op]}`;
    const h = this.metaOf(a)?.get?.(key) ?? this.metaOf(b)?.get?.(key);
    if (h) return this.call(h, [a, b])[0];
    if (a instanceof Host && typeof a.arith === 'function') return a.arith(op, a, b, this);
    if (b instanceof Host && typeof b.arith === 'function') return b.arith(op, a, b, this);
    throw this.err(`attempt to perform arithmetic (${NAMES[op]}) on ${this.type(a)} and ${this.type(b)}. Maths needs numbers`, node?.line ?? this.line);
  }

  index(obj, key, node) {
    if (obj instanceof LuaTable) {
      const v = obj.get(key);
      if (v !== undefined || !obj.meta) return v;
      const h = obj.meta.get('__index');
      if (h === undefined) return undefined;
      if (h instanceof LuaFunction || typeof h === 'function') return this.call(h, [obj, key])[0];
      return this.index(h, key, node);
    }
    if (typeof obj === 'string') return this.stringMeta ? this.stringMeta.get(key) : undefined;
    if (obj instanceof Host) return obj.get(key, this);
    throw this.err(`attempt to index ${this.type(obj)} with '${this.tostr(key)}'`);
  }
  setIndex(obj, key, value, node) {
    if (obj instanceof LuaTable) {
      if (key === undefined) throw this.err('table index is nil');
      if (obj.meta && obj.get(key) === undefined) {
        const h = obj.meta.get('__newindex');
        if (h !== undefined) {
          if (h instanceof LuaFunction || typeof h === 'function') { this.call(h, [obj, key, value]); return; }
          this.setIndex(h, key, value, node); return;
        }
      }
      obj.set(key, value);
      return;
    }
    if (obj instanceof Host) { obj.set(key, value, this); return; }
    throw this.err(`attempt to index ${this.type(obj)} with '${this.tostr(key)}'`);
  }
}
