// Light syntax colouring for Luau code samples. Output is HTML-safe.
import { esc } from '../utils.js';

const KEYWORDS = new Set(['and', 'break', 'continue', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while']);
const BUILTINS = new Set(['print', 'warn', 'error', 'assert', 'pcall', 'type', 'typeof', 'tostring', 'tonumber', 'ipairs', 'pairs', 'require', 'setmetatable', 'getmetatable', 'task', 'game', 'workspace', 'script', 'Instance', 'Vector3', 'Color3', 'UDim2', 'math', 'string', 'table', 'os']);

const TOKEN = /(--\[\[[\s\S]*?\]\]|--[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\\n])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

export function highlight(code) {
  let out = '';
  let last = 0;
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [text, comment, string, number, word] = m;
    if (comment) out += `<span class="tok-com">${esc(text)}</span>`;
    else if (string) out += `<span class="tok-str">${esc(text)}</span>`;
    else if (number) out += `<span class="tok-num">${esc(text)}</span>`;
    else if (KEYWORDS.has(word)) out += `<span class="tok-kw">${esc(text)}</span>`;
    else if (BUILTINS.has(word)) out += `<span class="tok-fn">${esc(text)}</span>`;
    else out += esc(text);
    last = TOKEN.lastIndex;
  }
  return out + esc(code.slice(last));
}
