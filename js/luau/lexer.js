// Turns Luau source text into tokens. Part of the in-browser Luau interpreter used to check exercises.

export class LuauSyntaxError extends Error {
  constructor(message, line) { super(message); this.line = line; this.isSyntax = true; }
}

export const KEYWORDS = new Set(['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while']);
const OPERATORS = ['...', '..=', '//=', '==', '~=', '<=', '>=', '..', '//', '+=', '-=', '*=', '/=', '%=', '^=', '::', '->',
  '+', '-', '*', '/', '%', '^', '#', '&', '|', '<', '>', '=', '(', ')', '{', '}', '[', ']', ';', ':', ',', '.', '?', '~'];
const ESCAPES = { n: '\n', t: '\t', r: '\r', a: '\x07', b: '\b', f: '\f', v: '\v', '\\': '\\', '"': '"', "'": "'", '`': '`', '{': '{' };

function readEscape(src, i, line) {
  const c = src[i + 1];
  if (c in ESCAPES) return [ESCAPES[c], i + 2];
  if (c === 'x') return [String.fromCharCode(parseInt(src.substr(i + 2, 2), 16)), i + 4];
  if (c === 'u' && src[i + 2] === '{') {
    const end = src.indexOf('}', i);
    return [String.fromCodePoint(parseInt(src.slice(i + 3, end), 16)), end + 1];
  }
  if (/\d/.test(c)) { const m = /^\d{1,3}/.exec(src.slice(i + 1)); return [String.fromCharCode(+m[0]), i + 1 + m[0].length]; }
  if (c === '\n') return ['\n', i + 2];
  throw new LuauSyntaxError(`Unknown escape sequence "\\${c}" in a string`, line);
}

export function tokenize(src) {
  const tokens = [];
  let i = 0, line = 1;
  const n = src.length;
  const push = (type, value, extra) => tokens.push({ type, value, line, ...extra });

  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }

    if (c === '-' && src[i + 1] === '-') {
      const m = /^--\[(=*)\[/.exec(src.slice(i, i + 40));
      if (m) {
        const close = `]${m[1]}]`;
        const end = src.indexOf(close, i + m[0].length);
        if (end < 0) throw new LuauSyntaxError('A multi-line comment was never closed', line);
        line += (src.slice(i, end).match(/\n/g) || []).length;
        i = end + close.length;
      } else {
        while (i < n && src[i] !== '\n') i++;
      }
      continue;
    }

    if (c === '[') {
      const m = /^\[(=*)\[/.exec(src.slice(i, i + 40));
      if (m) {
        const close = `]${m[1]}]`;
        const end = src.indexOf(close, i + m[0].length);
        if (end < 0) throw new LuauSyntaxError('A multi-line string was never closed', line);
        let text = src.slice(i + m[0].length, end);
        if (text[0] === '\n') text = text.slice(1);
        push('string', text);
        line += (src.slice(i, end).match(/\n/g) || []).length;
        i = end + close.length;
        continue;
      }
    }

    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      const m = /^(0[xX][0-9a-fA-F_]+|0[bB][01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)/.exec(src.slice(i));
      const raw = m[0].replace(/_/g, '');
      push('number', /^0[bB]/.test(raw) ? parseInt(raw.slice(2), 2) : Number(raw));
      i += m[0].length;
      continue;
    }

    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
      push(KEYWORDS.has(m[0]) ? 'keyword' : 'name', m[0]);
      i += m[0].length;
      continue;
    }

    if (c === '"' || c === "'") {
      let s = '';
      const start = line;
      i++;
      while (true) {
        if (i >= n || src[i] === '\n') throw new LuauSyntaxError('A string was started but never closed. Strings need a matching quote mark on the same line', start);
        if (src[i] === c) { i++; break; }
        if (src[i] === '\\') { const [ch, next] = readEscape(src, i, line); s += ch; i = next; } else s += src[i++];
      }
      push('string', s);
      continue;
    }

    if (c === '`') {
      const parts = [];
      const start = line;
      let s = '';
      i++;
      while (true) {
        if (i >= n) throw new LuauSyntaxError('A backtick string was started but never closed', start);
        if (src[i] === '`') { i++; break; }
        if (src[i] === '\\') { const [ch, next] = readEscape(src, i, line); s += ch; i = next; continue; }
        if (src[i] === '{') {
          let depth = 1, j = i + 1;
          while (j < n && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
          if (depth) throw new LuauSyntaxError('A { inside a backtick string was never closed with }', line);
          if (s) parts.push(s);
          s = '';
          parts.push({ expr: src.slice(i + 1, j - 1), line });
          i = j;
          continue;
        }
        if (src[i] === '\n') line++;
        s += src[i++];
      }
      if (s || !parts.length) parts.push(s);
      push('interp', parts);
      continue;
    }

    const op = OPERATORS.find((o) => src.startsWith(o, i));
    if (!op) throw new LuauSyntaxError(`I do not recognise the character "${c}"`, line);
    push('op', op);
    i += op.length;
  }
  push('eof', '<end of script>');
  return tokens;
}
