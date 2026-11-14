// Parses Luau tokens into a syntax tree. Type annotations are accepted and ignored.
import { tokenize, LuauSyntaxError } from './lexer.js';

const BINARY = {
  or: [1, 1], and: [2, 2],
  '<': [3, 3], '>': [3, 3], '<=': [3, 3], '>=': [3, 3], '~=': [3, 3], '==': [3, 3],
  '..': [9, 8], '+': [10, 10], '-': [10, 10],
  '*': [11, 11], '/': [11, 11], '//': [11, 11], '%': [11, 11], '^': [14, 13],
};
const UNARY_PRIORITY = 12;
const COMPOUND = { '+=': '+', '-=': '-', '*=': '*', '/=': '/', '//=': '//', '%=': '%', '^=': '^', '..=': '..' };

export function parse(source, { startLine = 1 } = {}) {
  const tokens = tokenize(source);
  if (startLine !== 1) tokens.forEach((t) => { t.line += startLine - 1; });
  let pos = 0;

  const peek = (k = 0) => tokens[Math.min(pos + k, tokens.length - 1)];
  const next = () => tokens[pos++];
  const isOp = (v, k = 0) => { const t = peek(k); return (t.type === 'op' || t.type === 'keyword') && t.value === v; };
  const accept = (v) => { if (isOp(v)) { pos++; return true; } return false; };
  const describe = (t) => (t.type === 'eof' ? 'the end of your script' : t.type === 'string' ? 'a string' : `"${t.value}"`);

  function fail(message, tok = peek()) { throw new LuauSyntaxError(message, tok.line); }
  function expect(v, where = '') {
    if (isOp(v)) return next();
    const t = peek();
    let msg = `I expected "${v}"${where ? ' ' + where : ''} but found ${describe(t)}`;
    if (t.type === 'eof' && v === 'end') msg += '. Check that every if, for, while and function has its own "end"';
    fail(msg, t);
  }
  function name(where = '') {
    const t = peek();
    if (t.type !== 'name') fail(`I expected a name${where ? ' ' + where : ''} but found ${describe(t)}`, t);
    pos++;
    return t.value;
  }

  // ---- types (skipped) ----
  function skipBalanced(open, close) {
    let depth = 0;
    do {
      const t = next();
      if (t.type === 'eof') fail('A type annotation was never closed', t);
      if (t.type === 'op' && t.value === open) depth++;
      else if (t.type === 'op' && t.value === close) depth--;
    } while (depth > 0);
  }
  function skipSimpleType() {
    const t = peek();
    if (isOp('(')) {
      skipBalanced('(', ')');
      if (accept('->')) skipType();
    } else if (isOp('{')) skipBalanced('{', '}');
    else if (t.type === 'name' || t.type === 'string' || ['nil', 'true', 'false'].includes(t.value)) {
      pos++;
      while (isOp('.')) { pos++; name(); }
      if (isOp('(') && t.value === 'typeof') skipBalanced('(', ')');
      if (isOp('<')) skipBalanced('<', '>');
    } else fail(`I expected a type here but found ${describe(t)}`, t);
    while (accept('?')) { /* optional marker */ }
  }
  function skipType() {
    skipSimpleType();
    while (isOp('|') || isOp('&')) { pos++; skipSimpleType(); }
  }

  // ---- expressions ----
  function parseArgs() {
    const t = peek();
    if (t.type === 'string') { pos++; return [{ t: 'String', value: t.value, line: t.line }]; }
    if (t.type === 'interp') return [primary()];
    if (isOp('{')) return [parseTable()];
    expect('(');
    const args = [];
    if (!isOp(')')) { do { args.push(parseExpr()); } while (accept(',')); }
    expect(')', 'to close the list of arguments');
    return args;
  }

  function primaryPrefix() {
    const t = peek();
    if (t.type === 'name') { pos++; return { t: 'Name', name: t.value, line: t.line }; }
    if (isOp('(')) {
      pos++;
      const e = parseExpr();
      expect(')', 'to close the bracket');
      return { t: 'Paren', e, line: t.line };
    }
    fail(`I did not expect ${describe(t)} here. I was looking for a value or a name`, t);
  }

  function suffixed() {
    let e = primaryPrefix();
    while (true) {
      const t = peek();
      if (isOp('.')) { pos++; const key = name('after the dot'); e = { t: 'Index', obj: e, key: { t: 'String', value: key, line: t.line }, line: t.line, field: key }; }
      else if (isOp('[')) { pos++; const key = parseExpr(); expect(']'); e = { t: 'Index', obj: e, key, line: t.line }; }
      else if (isOp(':') ) {
        pos++;
        const m = name('after the colon');
        e = { t: 'MethodCall', obj: e, name: m, args: parseArgs(), line: t.line };
      } else if (isOp('(') || t.type === 'string' || t.type === 'interp' || isOp('{')) {
        if (isOp('(') && t.line !== tokens[pos - 1].line && false) break;
        e = { t: 'Call', fn: e, args: parseArgs(), line: t.line };
      } else if (isOp('::')) { pos++; skipType(); }
      else break;
    }
    return e;
  }

  function parseTable() {
    const open = expect('{');
    const items = [];
    while (!isOp('}')) {
      const t = peek();
      if (isOp('[')) { pos++; const key = parseExpr(); expect(']'); expect('='); items.push({ kind: 'keyed', key, value: parseExpr() }); }
      else if (t.type === 'name' && isOp('=', 1)) { pos += 2; items.push({ kind: 'keyed', key: { t: 'String', value: t.value, line: t.line }, value: parseExpr() }); }
      else items.push({ kind: 'pos', value: parseExpr() });
      if (!accept(',') && !accept(';')) break;
    }
    expect('}', 'to close the table (did you forget a comma between items?)');
    return { t: 'Table', items, line: open.line };
  }

  function parseFunctionBody(isMethod, fname) {
    const line = peek().line;
    if (isOp('<')) skipBalanced('<', '>');
    expect('(', 'to start the parameter list');
    const params = isMethod ? ['self'] : [];
    let vararg = false;
    if (!isOp(')')) {
      do {
        if (accept('...')) { vararg = true; break; }
        params.push(name('as a parameter name'));
        if (accept(':')) skipType();
      } while (accept(','));
    }
    expect(')', 'to close the parameter list');
    if (accept(':')) skipType();
    const body = parseBlock();
    expect('end', `to finish the function${fname ? ` "${fname}"` : ''}`);
    return { t: 'Function', params, vararg, body, line, name: fname };
  }

  function primary() {
    const t = peek();
    switch (t.type) {
      case 'number': pos++; return { t: 'Number', value: t.value, line: t.line };
      case 'string': pos++; return { t: 'String', value: t.value, line: t.line };
      case 'interp': {
        pos++;
        const parts = t.value.map((p) => (typeof p === 'string' ? p : parse(`return ${p.expr}`, { startLine: p.line }).body[0].exprs[0]));
        return { t: 'Interp', parts, line: t.line };
      }
      case 'keyword':
        if (t.value === 'nil') { pos++; return { t: 'Nil', line: t.line }; }
        if (t.value === 'true' || t.value === 'false') { pos++; return { t: 'Bool', value: t.value === 'true', line: t.line }; }
        if (t.value === 'function') { pos++; return parseFunctionBody(false, null); }
        if (t.value === 'if') {
          pos++;
          const cond = parseExpr(); expect('then', 'after the condition');
          const a = parseExpr();
          let b;
          if (accept('elseif')) { pos--; tokens[pos] = { ...tokens[pos], value: 'if' }; b = primary(); }
          else { expect('else', 'in an if-expression (it needs a value for when the condition is false)'); b = parseExpr(); }
          return { t: 'IfExpr', cond, a, b, line: t.line };
        }
        break;
      case 'op':
        if (t.value === '...') { pos++; return { t: 'Vararg', line: t.line }; }
        if (t.value === '{') return parseTable();
        break;
      default:
    }
    return suffixed();
  }

  function parseExpr(limit = 0) {
    let left;
    const t = peek();
    if (isOp('not') || isOp('-') || isOp('#')) {
      pos++;
      left = { t: 'Unary', op: t.value, e: parseExpr(UNARY_PRIORITY), line: t.line };
    } else {
      left = primary();
      if (isOp('::')) { pos++; skipType(); }
    }
    while (true) {
      const op = peek();
      const pri = (op.type === 'op' || op.type === 'keyword') && BINARY[op.value];
      if (!pri || pri[0] <= limit) break;
      pos++;
      const right = parseExpr(pri[1]);
      left = { t: 'Binary', op: op.value, l: left, r: right, line: op.line };
    }
    return left;
  }

  // ---- statements ----
  const BLOCK_END = new Set(['end', 'else', 'elseif', 'until']);
  function parseBlock() {
    const body = [];
    while (true) {
      const t = peek();
      if (t.type === 'eof' || (t.type === 'keyword' && BLOCK_END.has(t.value))) break;
      if (isOp('return')) {
        pos++;
        const exprs = [];
        if (!(peek().type === 'eof' || (peek().type === 'keyword' && BLOCK_END.has(peek().value)) || isOp(';'))) {
          do { exprs.push(parseExpr()); } while (accept(','));
        }
        accept(';');
        body.push({ t: 'Return', exprs, line: t.line });
        break;
      }
      const s = parseStatement();
      if (s) body.push(s);
      accept(';');
    }
    return body;
  }

  function parseStatement() {
    const t = peek();
    if (t.type === 'keyword') {
      switch (t.value) {
        case 'if': {
          pos++;
          const clauses = [];
          let cond = parseExpr();
          expect('then', 'after the condition of the if');
          clauses.push({ cond, body: parseBlock() });
          let otherwise = null;
          while (true) {
            if (accept('elseif')) { cond = parseExpr(); expect('then', 'after the elseif condition'); clauses.push({ cond, body: parseBlock() }); }
            else if (accept('else')) { otherwise = parseBlock(); break; }
            else break;
          }
          expect('end', 'to finish the if statement');
          return { t: 'If', clauses, otherwise, line: t.line };
        }
        case 'while': { pos++; const cond = parseExpr(); expect('do', 'after the while condition'); const body = parseBlock(); expect('end', 'to finish the while loop'); return { t: 'While', cond, body, line: t.line }; }
        case 'repeat': { pos++; const body = parseBlock(); expect('until', 'to finish the repeat loop'); return { t: 'Repeat', body, cond: parseExpr(), line: t.line }; }
        case 'do': { pos++; const body = parseBlock(); expect('end', 'to finish the do block'); return { t: 'Do', body, line: t.line }; }
        case 'break': pos++; return { t: 'Break', line: t.line };
        case 'for': {
          pos++;
          const first = name('after "for"');
          if (isOp('=')) {
            pos++;
            const start = parseExpr(); expect(',', 'between the start and end of the for loop');
            const stop = parseExpr();
            const step = accept(',') ? parseExpr() : null;
            expect('do', 'after the for loop range');
            const body = parseBlock(); expect('end', 'to finish the for loop');
            return { t: 'NumFor', v: first, start, stop, step, body, line: t.line };
          }
          const names = [first];
          if (accept(':')) skipType();
          while (accept(',')) { names.push(name()); if (accept(':')) skipType(); }
          expect('in', 'in the for loop');
          const exprs = [];
          do { exprs.push(parseExpr()); } while (accept(','));
          expect('do', 'after the for loop list');
          const body = parseBlock(); expect('end', 'to finish the for loop');
          return { t: 'GenFor', names, exprs, body, line: t.line };
        }
        case 'function': {
          pos++;
          let target = { t: 'Name', name: name('after "function"'), line: t.line };
          let isMethod = false, full = target.name;
          while (isOp('.') || isOp(':')) {
            const colon = isOp(':'); pos++;
            const key = name();
            full += (colon ? ':' : '.') + key;
            target = { t: 'Index', obj: target, key: { t: 'String', value: key, line: t.line }, line: t.line };
            if (colon) { isMethod = true; break; }
          }
          return { t: 'Assign', targets: [target], exprs: [parseFunctionBody(isMethod, full)], line: t.line };
        }
        case 'local': {
          pos++;
          if (accept('function')) { const n = name(); return { t: 'LocalFunction', name: n, func: parseFunctionBody(false, n), line: t.line }; }
          const names = [];
          do { names.push(name('after "local"')); if (accept('<')) { name(); expect('>'); } if (accept(':')) skipType(); } while (accept(','));
          const exprs = [];
          if (accept('=')) { do { exprs.push(parseExpr()); } while (accept(',')); }
          return { t: 'Local', names, exprs, line: t.line };
        }
        case 'return': break;
        default: fail(`I did not expect ${describe(t)} here`, t);
      }
    }
    if (t.type === 'name') {
      if (t.value === 'continue' && !['(', '=', '.', ':', ',', '['].includes(peek(1).value)) { pos++; return { t: 'Continue', line: t.line }; }
      if ((t.value === 'type' && peek(1).type === 'name') || (t.value === 'export' && peek(1).value === 'type')) {
        if (t.value === 'export') pos++;
        pos++; name();
        if (isOp('<')) skipBalanced('<', '>');
        expect('='); skipType();
        return null;
      }
    }
    const e = suffixed();
    if (isOp('=') || isOp(',')) {
      const targets = [e];
      while (accept(',')) targets.push(suffixed());
      expect('=', 'in an assignment');
      const exprs = [];
      do { exprs.push(parseExpr()); } while (accept(','));
      for (const tg of targets) if (tg.t !== 'Name' && tg.t !== 'Index') fail('You can only assign a value to a variable or a table field', t);
      return { t: 'Assign', targets, exprs, line: t.line };
    }
    const cop = peek();
    if (cop.type === 'op' && COMPOUND[cop.value]) {
      pos++;
      if (e.t !== 'Name' && e.t !== 'Index') fail('You can only use += style operators on a variable or a table field', t);
      return { t: 'Compound', op: COMPOUND[cop.value], target: e, expr: parseExpr(), line: t.line };
    }
    if (e.t !== 'Call' && e.t !== 'MethodCall') fail(`This line does not do anything on its own. Did you mean to call a function, or assign a value with "="? (found ${describe(peek())} after the expression)`, t);
    return { t: 'CallStmt', expr: e, line: t.line };
  }

  const body = parseBlock();
  if (peek().type !== 'eof') fail(`I did not expect ${describe(peek())} here. There may be an extra "end", or a missing opening statement`, peek());
  return { t: 'Chunk', body };
}
