/* Text tools */
const live = (inputs, fn) => { inputs.forEach(i => i.on(fn)); fn(); };
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

T({
  id: 'word-counter', name: 'Word & Character Counter', cat: 'text', icon: '🔢', desc: 'Count words, characters, sentences and estimate reading time.',
  render(root) {
    const ta = ui.area('Your text', { rows: 10, placeholder: 'Type or paste text…' }), st = ui.stats(), kw = ui.out('Top keywords');
    live([ta], () => {
      const t = ta.v, words = t.match(/\S+/g) || [], sent = t.split(/[.!?]+(\s|$)/).filter(s => s && s.trim()).length, para = t.split(/\n\s*\n/).filter(s => s.trim()).length;
      st.set({ Words: words.length, Characters: t.length, 'No spaces': t.replace(/\s/g, '').length, Sentences: sent, Paragraphs: para, Lines: t ? t.split('\n').length : 0, 'Reading time': Math.ceil(words.length / 230) + ' min', 'Speaking time': Math.ceil(words.length / 130) + ' min' });
      const f = {}; words.map(w => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '')).filter(w => w.length > 3).forEach(w => f[w] = (f[w] || 0) + 1);
      kw.set(Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w, n]) => `${w} — ${n}`).join('\n'));
    });
    root.append(ta, st, kw);
  }
});

T({
  id: 'case-converter', name: 'Case Converter', cat: 'text', icon: '🔤', desc: 'UPPER, lower, Title, camelCase, snake_case, kebab-case and more.',
  render(root) {
    const ta = ui.area('Text', { rows: 4, value: 'The quick brown fox jumps over the lazy dog' }), list = h('div');
    const words = s => s.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const cap = w => w[0].toUpperCase() + w.slice(1).toLowerCase();
    const C = {
      'UPPER CASE': s => s.toUpperCase(), 'lower case': s => s.toLowerCase(), 'Title Case': s => s.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase()),
      'Sentence case': s => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()),
      camelCase: s => words(s).map((w, i) => i ? cap(w) : w.toLowerCase()).join(''), PascalCase: s => words(s).map(cap).join(''),
      snake_case: s => words(s).join('_').toLowerCase(), 'kebab-case': s => words(s).join('-').toLowerCase(), CONSTANT_CASE: s => words(s).join('_').toUpperCase(), 'dot.case': s => words(s).join('.').toLowerCase(),
      'aLtErNaTiNg': s => [...s].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join(''), 'iNVERT cASE': s => [...s].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')
    };
    live([ta], () => list.replaceChildren(...Object.entries(C).map(([n, f]) => { const r = f(ta.v); return h('div', { class: 'row c', style: { padding: '6px 0', borderBottom: '1px solid var(--bd)' } }, h('b', { style: { width: '130px' } }, n), h('span', { style: { flex: 1, wordBreak: 'break-word' } }, r), ui.btn('Copy', () => ui.copy(r), 'sm sec')); })));
    root.append(ta, list);
  }
});

T({
  id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', cat: 'text', icon: '📃', desc: 'Placeholder paragraphs, sentences or words.',
  render(root) {
    const W = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
    const n = ui.input('Amount', { type: 'number', value: 3, min: 1, max: 100 }), k = ui.select('Unit', ['paragraphs', 'sentences', 'words']), start = ui.check('Start with “Lorem ipsum…”', true), o = ui.out('');
    const rw = () => W[Math.floor(Math.random() * W.length)];
    const sentence = () => { const l = 6 + Math.floor(Math.random() * 10), a = Array.from({ length: l }, rw); a[0] = a[0][0].toUpperCase() + a[0].slice(1); return a.join(' ') + '.'; };
    const para = () => Array.from({ length: 3 + Math.floor(Math.random() * 4) }, sentence).join(' ');
    live([n, k, start], () => {
      let r; const c = n.v | 0;
      r = k.v === 'words' ? Array.from({ length: c }, rw).join(' ') : k.v === 'sentences' ? Array.from({ length: c }, sentence).join(' ') : Array.from({ length: c }, para).join('\n\n');
      if (start.v) r = 'Lorem ipsum dolor sit amet, ' + r.replace(/^\S+\s+\S+\s+\S+\s+\S+\s*/i, '').replace(/^./, m => m); o.set(r);
    });
    root.append(ui.row(n, k, start), o, ui.btn('Regenerate', () => n.c.dispatchEvent(new Event('input'))));
  }
});

T({
  id: 'text-diff', name: 'Text Diff Checker', cat: 'text', icon: '↔️', desc: 'Compare two texts line-by-line or word-by-word with highlights.',
  render(root) {
    const a = ui.area('Original', { rows: 8 }), b = ui.area('Changed', { rows: 8 }), mode = ui.select('Compare by', ['lines', 'words', 'characters']), out = h('pre', { style: { whiteSpace: 'pre-wrap', background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd)', margin: 0 } }), st = h('p', { class: 'muted' });
    const diff = (x, y) => {
      const n = x.length, m = y.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      const r = []; let i = 0, j = 0;
      while (i < n && j < m) { if (x[i] === y[j]) { r.push([0, x[i]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) r.push([-1, x[i++]]); else r.push([1, y[j++]]); }
      while (i < n) r.push([-1, x[i++]]); while (j < m) r.push([1, y[j++]]); return r;
    };
    live([a, b, mode], () => {
      const sp = mode.v === 'lines' ? s => s.split('\n') : mode.v === 'words' ? s => s.split(/(\s+)/) : s => [...s], join = mode.v === 'lines' ? '\n' : '';
      if (a.v.length * b.v.length > 4e7 && mode.v === 'characters') return st.textContent = 'Too large for character diff — use lines or words.';
      const d = diff(sp(a.v), sp(b.v)); let add = 0, del = 0;
      out.replaceChildren(...d.map(([t, s]) => { t > 0 ? add++ : t < 0 && del++; return h('span', { style: t ? { background: t > 0 ? 'rgba(22,163,74,.25)' : 'rgba(220,38,38,.25)', textDecoration: t < 0 ? 'line-through' : '' } : {} }, (t ? (mode.v === 'lines' ? (t > 0 ? '+ ' : '- ') : '') : (mode.v === 'lines' ? '  ' : '')) + s + join); }));
      st.textContent = `${add} added, ${del} removed`;
    });
    root.append(ui.cols(a, b), mode, st, out);
  }
});

T({
  id: 'line-tools', name: 'Sort & Dedupe Lines', cat: 'text', icon: '📑', desc: 'Sort, reverse, shuffle, remove duplicates/empty lines, number lines.',
  render(root) {
    const ta = ui.area('Lines', { rows: 8 }), op = ui.select('Operation', ['Sort A→Z', 'Sort Z→A', 'Sort numeric', 'Sort by length', 'Natural sort', 'Reverse order', 'Shuffle', 'Remove duplicates', 'Remove empty lines', 'Trim whitespace', 'Add line numbers', 'Join with comma', 'Keep only duplicates']), ci = ui.check('Case-insensitive'), o = ui.out('Result');
    const run = () => {
      let l = ta.v.split('\n'); const k = s => ci.v ? s.toLowerCase() : s;
      const F = {
        'Sort A→Z': () => l.sort((a, b) => k(a).localeCompare(k(b))), 'Sort Z→A': () => l.sort((a, b) => k(b).localeCompare(k(a))), 'Sort numeric': () => l.sort((a, b) => parseFloat(a) - parseFloat(b)),
        'Sort by length': () => l.sort((a, b) => a.length - b.length), 'Natural sort': () => l.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), 'Reverse order': () => l.reverse(), Shuffle: () => l.sort(() => Math.random() - .5),
        'Remove duplicates': () => { const s = new Set(); return l.filter(x => !s.has(k(x)) && s.add(k(x))); }, 'Remove empty lines': () => l.filter(x => x.trim()), 'Trim whitespace': () => l.map(x => x.trim()),
        'Add line numbers': () => l.map((x, i) => `${i + 1}. ${x}`), 'Join with comma': () => [l.join(', ')], 'Keep only duplicates': () => { const c = {}; l.forEach(x => c[k(x)] = (c[k(x)] || 0) + 1); const s = new Set(); return l.filter(x => c[k(x)] > 1 && !s.has(k(x)) && s.add(k(x))); }
      };
      const r = F[op.v](); o.set((r || l).join('\n'));
    };
    live([ta, op, ci], run); root.append(ta, ui.row(op, ci), o);
  }
});

T({
  id: 'slug-generator', name: 'Slug Generator', cat: 'text', icon: '🔗', desc: 'Make clean URL slugs from titles — handles accents.',
  render(root) {
    const ta = ui.area('Titles (one per line)', { rows: 4, value: 'Héllo Wörld! This is a Test — 2024' }), sep = ui.select('Separator', ['-', '_', '.']), max = ui.input('Max length (0 = none)', { type: 'number', value: 0 }), o = ui.out('Slugs');
    live([ta, sep, max], () => o.set(ta.v.split('\n').map(t => { let s = t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, sep.v).replace(new RegExp(`^\\${sep.v}+|\\${sep.v}+$`, 'g'), ''); if (+max.v) s = s.slice(0, +max.v).replace(new RegExp(`\\${sep.v}+$`), ''); return s; }).join('\n')));
    root.append(ta, ui.row(sep, max), o);
  }
});

function mdToHtml(src) {
  const safeUrl = u => /^\s*(javascript|data|vbscript):/i.test(u) ? '#' : u;
  let s = esc(src).replace(/"/g, '"'); const blocks = [];
  s = s.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, c) => { blocks.push(`<pre><code>${c}</code></pre>`); return `\u0000${blocks.length - 1}\u0000`; });
  const inl = t => t.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, a, u) => `<img alt="${a}" src="${safeUrl(u)}">`).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, u) => `<a href="${safeUrl(u)}" target="_blank" rel="noopener">${a}</a>`)
    .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<b>$1$2</b>').replace(/(^|[^*\w])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>').replace(/(^|[^_\w])_(?!\s)(.+?)_/g, '$1<i>$2</i>').replace(/~~(.+?)~~/g, '<s>$1</s>');
  const lines = s.split('\n'); let out = '', list = null, para = [];
  const flush = () => { if (para.length) out += `<p>${inl(para.join(' '))}</p>`; para = []; }, endList = () => { if (list) out += `</${list}>`; list = null; };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]; let m;
    if (/^\s*$/.test(l)) { flush(); endList(); }
    else if (m = l.match(/^(#{1,6})\s+(.*)$/)) { flush(); endList(); out += `<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`; }
    else if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { flush(); endList(); out += '<hr>'; }
    else if (m = l.match(/^\s*([-*+]|\d+\.)\s+(.*)$/)) { flush(); const t = /\d/.test(m[1]) ? 'ol' : 'ul'; if (list !== t) { endList(); out += `<${t}>`; list = t; } out += `<li>${inl(m[2].replace(/^\[ \]/, '☐').replace(/^\[x\]/i, '☑'))}</li>`; }
    else if (m = l.match(/^&gt;\s?(.*)$/)) { flush(); endList(); out += `<blockquote>${inl(m[1])}</blockquote>`; }
    else if (/^\|.*\|\s*$/.test(l) && /^\|?\s*:?-+/.test(lines[i + 1] || '')) {
      flush(); endList(); const row = (r, t) => '<tr>' + r.trim().replace(/^\||\|$/g, '').split('|').map(c => `<${t}>${inl(c.trim())}</${t}>`).join('') + '</tr>'; let tb = row(l, 'th'); i += 2;
      for (; i < lines.length && /^\|.*\|\s*$/.test(lines[i]); i++) tb += row(lines[i], 'td'); i--; out += `<table>${tb}</table>`;
    } else { endList(); para.push(l.trim()); }
  }
  flush(); endList();
  return out.replace(/\u0000(\d+)\u0000/g, (_, n) => blocks[n]);
}
T({
  id: 'markdown-preview', name: 'Markdown Preview', cat: 'text', icon: 'Ⓜ️', desc: 'Live Markdown editor with preview and HTML export.',
  render(root) {
    const ta = ui.area('Markdown', { rows: 16, value: '# Hello Markdown\n\nWrite **bold**, *italic*, `code` and [links](https://example.com).\n\n- Item one\n- Item two\n\n> A quote\n\n| Tool | Cool |\n|---|---|\n| This | Yes |\n\n```\nconsole.log("code block")\n```\n' });
    const prev = h('div', { class: 'card', style: { overflow: 'auto', maxHeight: '520px' } });
    live([ta], () => prev.innerHTML = mdToHtml(ta.v));
    root.append(ui.cols(ta, h('div', {}, h('span', { class: 'lb muted' }, 'Preview'), prev)), ui.row(ui.btn('Copy HTML', () => ui.copy(mdToHtml(ta.v))), ui.btn('Download .html', () => ui.dl('document.html', `<!doctype html><meta charset="utf-8"><body>${mdToHtml(ta.v)}`, 'text/html'), 'sec')));
  }
});

T({
  id: 'text-to-speech', name: 'Text to Speech', cat: 'text', icon: '🗣️', desc: 'Read text aloud with your browser’s built-in voices.',
  render(root, c) {
    const ta = ui.area('Text', { rows: 6, value: 'Hello! This is a text to speech demo running entirely in your browser.' }), v = ui.select('Voice', ['…']), rate = ui.range('Speed', 0.5, 2, 1, 0.1), pitch = ui.range('Pitch', 0, 2, 1, 0.1);
    const load = () => { const vs = speechSynthesis.getVoices(); v.c.replaceChildren(...vs.map((x, i) => h('option', { value: i }, `${x.name} (${x.lang})`))); const d = vs.findIndex(x => x.lang.startsWith(navigator.language.slice(0, 2))); if (d >= 0) v.v = d; };
    if (!window.speechSynthesis) return root.append('Speech synthesis is not supported in this browser.');
    load(); speechSynthesis.onvoiceschanged = load; c.cleanup(() => speechSynthesis.cancel());
    root.append(ta, v, ui.row(rate, pitch), ui.row(ui.btn('▶ Speak', () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(ta.v); u.voice = speechSynthesis.getVoices()[v.v]; u.rate = rate.v; u.pitch = pitch.v; speechSynthesis.speak(u); }), ui.btn('■ Stop', () => speechSynthesis.cancel(), 'sec')));
  }
});

T({
  id: 'morse-code', name: 'Morse Code Translator', cat: 'text', icon: '📡', desc: 'Translate text to Morse and back — with audio playback.',
  render(root) {
    const M = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '@': '.--.-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', '=': '-...-', '+': '.-.-.', '-': '-....-', '"': '.-..-.' };
    const R = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, k]));
    const t = ui.area('Text', { rows: 4, value: 'SOS HELLO' }), m = ui.area('Morse (letters separated by space, words by " / ")', { rows: 4 });
    t.on(() => m.v = t.v.toUpperCase().split(/\s+/).map(w => [...w].map(c => M[c] || '').filter(Boolean).join(' ')).join(' / '));
    m.on(() => t.v = m.v.trim().split(/\s*\/\s*/).map(w => w.split(/\s+/).map(c => R[c] || '').join('')).join(' '));
    t.c.dispatchEvent(new Event('input'));
    root.append(t, m, ui.btn('🔊 Play', () => {
      const ac = new AudioContext(), u = .08; let at = ac.currentTime; const g = ac.createGain(); g.connect(ac.destination);
      for (const ch of m.v) { if (ch === '.' || ch === '-') { const o = ac.createOscillator(); o.frequency.value = 650; o.connect(g); o.start(at); o.stop(at + (ch === '.' ? u : 3 * u)); at += (ch === '.' ? u : 3 * u) + u; } else if (ch === ' ') at += 2 * u; else if (ch === '/') at += 4 * u; }
      setTimeout(() => ac.close(), (at - ac.currentTime) * 1000 + 300);
    }));
  }
});

T({
  id: 'roman-numerals', name: 'Roman Numeral Converter', cat: 'text', icon: '🏛️', desc: 'Convert numbers to Roman numerals and vice versa.',
  render(root) {
    const n = ui.input('Number (1–3999)', { type: 'number', value: 2024 }), r = ui.input('Roman numeral', { value: 'MMXXIV' }), V = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    n.on(() => { let x = n.v | 0, s = ''; if (x < 1 || x > 3999) return r.v = 'Out of range'; for (const [v, l] of V) while (x >= v) { s += l; x -= v; } r.v = s; });
    r.on(() => { const s = r.v.toUpperCase(); if (!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s) || !s) return; let x = 0, i = 0; for (const [v, l] of V) while (s.startsWith(l, i)) { x += v; i += l.length; } n.v = x; });
    root.append(ui.row(n, r));
  }
});

T({
  id: 'find-replace', name: 'Regex Find & Replace', cat: 'text', icon: '🔍', desc: 'Bulk find and replace with plain text or regular expressions.',
  render(root) {
    const ta = ui.area('Text', { rows: 8 }), f = ui.input('Find'), rp = ui.input('Replace with (use $1 for groups)'), rx = ui.check('Regex', true), ci = ui.check('Ignore case'), st = h('p', { class: 'muted' }), o = ui.out('Result');
    live([ta, f, rp, rx, ci], () => {
      if (!f.v) { st.textContent = ''; return o.set(ta.v); }
      try { const re = new RegExp(rx.v ? f.v : f.v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g' + (ci.v ? 'i' : '')); st.textContent = (ta.v.match(re) || []).length + ' match(es)'; o.set(ta.v.replace(re, rp.v)); } catch (e) { st.textContent = e.message; }
    });
    root.append(ta, ui.row(f, rp), ui.row(rx, ci), st, o);
  }
});

T({
  id: 'unicode-text-styler', name: 'Fancy Text Generator', cat: 'text', icon: '✨', desc: '𝗕𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤, 𝓼𝓬𝓻𝓲𝓹𝓽, ⓒⓘⓡⓒⓛⓔⓓ and other Unicode styles for social bios.',
  render(root) {
    const range = (u, l, d, ex = {}) => s => [...s].map(c => { if (ex[c]) return String.fromCodePoint(ex[c]); const x = c.charCodeAt(0); if (u != null && x >= 65 && x <= 90) return String.fromCodePoint(u + x - 65); if (l != null && x >= 97 && x <= 122) return String.fromCodePoint(l + x - 97); if (d != null && x >= 48 && x <= 57) return String.fromCodePoint(d + x - 48); return c; }).join('');
    const S = {
      Bold: range(0x1D400, 0x1D41A, 0x1D7CE), Italic: range(0x1D434, 0x1D44E, null, { h: 0x210E }), 'Bold Italic': range(0x1D468, 0x1D482),
      Script: range(0x1D4D0, 0x1D4EA), Fraktur: range(0x1D504, 0x1D51E, null, { C: 0x212D, H: 0x210C, I: 0x2111, R: 0x211C, Z: 0x2128 }), 'Double-struck': range(0x1D538, 0x1D552, 0x1D7D8, { C: 0x2102, H: 0x210D, N: 0x2115, P: 0x2119, Q: 0x211A, R: 0x211D, Z: 0x2124 }),
      'Sans bold': range(0x1D5D4, 0x1D5EE, 0x1D7EC), Monospace: range(0x1D670, 0x1D68A, 0x1D7F6), Circled: range(0x24B6, 0x24D0, null, { 0: 0x24EA, ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [i, 0x245F + i])) }), Fullwidth: range(0xFF21, 0xFF41, 0xFF10),
      Strikethrough: s => [...s].map(c => c + '̶').join(''), Underline: s => [...s].map(c => c + '̲').join(''),
      'Upside down': s => [...s.toLowerCase()].reverse().map(c => ({ a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '.': '˙', ',': '\'', '?': '¿', '!': '¡' }[c] || c)).join('')
    };
    const ta = ui.area('Text', { rows: 3, value: 'Hello World 123' }), list = h('div');
    live([ta], () => list.replaceChildren(...Object.entries(S).map(([n, f]) => { const r = f(ta.v); return h('div', { class: 'row c', style: { padding: '6px 0', borderBottom: '1px solid var(--bd)' } }, h('span', { class: 'muted', style: { width: '110px' } }, n), h('span', { style: { flex: 1, fontSize: '18px', wordBreak: 'break-word' } }, r), ui.btn('Copy', () => ui.copy(r), 'sm sec')); })));
    root.append(ta, list);
  }
});
