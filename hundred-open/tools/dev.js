/* Developer tools */
const safe = (o, fn) => { try { fn(); } catch (e) { ui.err(o, e); } };
const io = (root, { inLabel = 'Input', outLabel = 'Output', value = '', rows = 8, actions }) => {
  const i = ui.area(inLabel, { rows, value }), o = ui.out(outLabel); root.append(i); return [i, o];
};

T({
  id: 'json-formatter', name: 'JSON Formatter & Validator', cat: 'dev', icon: '{ }', desc: 'Beautify, minify, validate and sort JSON with clear error messages.',
  render(root) {
    const i = ui.area('JSON', { rows: 10, value: '{"name":"Hundred Tools","tags":["json","format"],"nested":{"a":1,"b":[1,2,3]}}' }), ind = ui.select('Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['\t', 'Tab']]), sort = ui.check('Sort keys'), o = ui.out('Result');
    const sortK = v => Array.isArray(v) ? v.map(sortK) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortK(v[k])])) : v;
    const run = min => safe(o, () => { let v = JSON.parse(i.v); if (sort.v) v = sortK(v); o.set(min ? JSON.stringify(v) : JSON.stringify(v, null, ind.v === '\t' ? '\t' : +ind.v)); });
    live([i, ind, sort], () => run(false));
    root.append(i, ui.row(ind, sort, ui.btn('Beautify', () => run(false)), ui.btn('Minify', () => run(true), 'sec')), o);
  }
});

T({
  id: 'json-csv', name: 'JSON ⇄ CSV Converter', cat: 'dev', icon: '📊', desc: 'Convert arrays of JSON objects to CSV and CSV back to JSON.',
  render(root) {
    const parseCSV = (t, d) => { const rows = []; let r = [], f = '', q = false; for (let k = 0; k < t.length; k++) { const c = t[k]; if (q) { if (c === '"') { if (t[k + 1] === '"') { f += '"'; k++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === d) { r.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[k + 1] === '\n') k++; r.push(f); rows.push(r); r = []; f = ''; } else f += c; } if (f || r.length) { r.push(f); rows.push(r); } return rows; };
    const j = ui.area('JSON', { rows: 8, value: '[{"name":"Ann","age":30},{"name":"Bob","age":25}]' }), c = ui.area('CSV', { rows: 8 }), d = ui.select('Delimiter', [[',', 'Comma'], [';', 'Semicolon'], ['\t', 'Tab']]), err = h('p', { class: 'err' });
    const q = v => { v = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n\r]|^$/.test(v) || v.includes(d.v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    j.on(() => { err.textContent = ''; try { let a = JSON.parse(j.v); if (!Array.isArray(a)) a = [a]; const keys = [...new Set(a.flatMap(Object.keys))]; c.v = [keys.map(q).join(d.v), ...a.map(o => keys.map(k => q(o[k])).join(d.v))].join('\n'); } catch (e) { err.textContent = e.message; } });
    c.on(() => { err.textContent = ''; try { const r = parseCSV(c.v.trim(), d.v), [hd, ...rest] = r; j.v = JSON.stringify(rest.map(x => Object.fromEntries(hd.map((k, i) => [k, isNaN(x[i]) || x[i] === '' ? x[i] : +x[i]]))), null, 2); } catch (e) { err.textContent = e.message; } });
    j.c.dispatchEvent(new Event('input'));
    root.append(d, ui.cols(j, c), err, ui.row(ui.btn('Download CSV', () => ui.dl('data.csv', c.v, 'text/csv'), 'sec'), ui.btn('Download JSON', () => ui.dl('data.json', j.v, 'application/json'), 'sec')));
  }
});

T({
  id: 'html-xml-formatter', name: 'HTML / XML Formatter', cat: 'dev', icon: '🏷️', desc: 'Indent messy HTML or XML so it is readable.',
  render(root) {
    const [i, o] = io(root, { value: '<div><p>Hello <b>world</b></p><ul><li>One</li><li>Two</li></ul></div>' }), ind = ui.input('Indent size', { type: 'number', value: 2, min: 1, max: 8 });
    const inline = /^(a|b|i|u|em|strong|span|code|small|sub|sup|label|abbr|mark|s)$/i, voidT = /^(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)$/i;
    live([i, ind], () => {
      const toks = i.v.replace(/>\s+</g, '><').match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []; let lvl = 0, out = '', pad = ' '.repeat(ind.v | 0);
      toks.forEach(t => {
        if (t.startsWith('</')) { lvl = Math.max(0, lvl - 1); out += pad.repeat(lvl) + t + '\n'; }
        else if (t.startsWith('<') && !t.startsWith('<!') && !t.startsWith('<?') && !t.endsWith('/>') && !voidT.test(t.match(/<([\w:-]+)/)?.[1] || '')) { out += pad.repeat(lvl) + t + '\n'; lvl++; }
        else out += pad.repeat(lvl) + t.trim() + '\n';
      });
      o.set(out.replace(/\n(\s*)([^<\n][^\n]*)\n\s*(<\/[^>]+>)/g, '\n$1$2$3').replace(/(<([\w-]+)[^>]*>)\n\s*([^<\n]+)\n\s*(<\/\2>)/g, '$1$3$4'));
    });
    root.append(ind, o);
  }
});

T({
  id: 'code-minifier', name: 'CSS / JS / HTML Minifier', cat: 'dev', icon: '📦', desc: 'Strip comments and whitespace from CSS, JavaScript or HTML (basic, safe).',
  render(root) {
    const lang = ui.select('Language', ['CSS', 'JavaScript', 'HTML']), [i, o] = io(root, { value: '/* demo */\n.btn {\n  color: red;\n  margin: 0 auto;\n}\n', rows: 10 }), st = h('p', { class: 'muted' });
    live([lang, i], () => {
      let s = i.v;
      if (lang.v === 'CSS') s = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>])\s*/g, '$1').replace(/;}/g, '}').trim();
      else if (lang.v === 'HTML') s = s.replace(/<!--(?!\[)[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
      else { s = s.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|(^|[^:\\])\/\/[^\n]*/g, (m, str, pre) => str || (pre ?? '')).split('\n').map(l => l.trim()).filter(Boolean).join('\n'); }
      o.set(s); st.textContent = `${i.v.length} → ${s.length} chars (${i.v.length ? Math.round((1 - s.length / i.v.length) * 100) : 0}% smaller)`;
    });
    root.prepend(lang); root.append(st, o);
  }
});

T({
  id: 'base64-text', name: 'Base64 Encode / Decode', cat: 'dev', icon: '🧬', desc: 'UTF-8 safe Base64 encoding and decoding (with URL-safe option).',
  render(root) {
    const [i, o] = io(root, { value: 'Hello, 世界!' }), url = ui.check('URL-safe'), mode = ui.select('Mode', ['Encode', 'Decode']);
    live([i, url, mode], () => safe(o, () => {
      if (mode.v === 'Encode') { let b = btoa(String.fromCharCode(...new TextEncoder().encode(i.v))); if (url.v) b = b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); o.set(b); }
      else { let b = i.v.trim().replace(/-/g, '+').replace(/_/g, '/'); b += '='.repeat((4 - b.length % 4) % 4); o.set(new TextDecoder().decode(Uint8Array.from(atob(b), c => c.charCodeAt(0)))); }
    }));
    root.prepend(ui.row(mode, url)); root.append(o);
  }
});

T({
  id: 'url-tools', name: 'URL Encoder & Parser', cat: 'dev', icon: '🌐', desc: 'Encode/decode URL components and break a URL into its parts.',
  render(root) {
    const [i, o] = io(root, { value: 'https://example.com:8080/path/to/page?search=hello world&lang=en#section', rows: 3 }), parts = ui.stats(), tb = h('div');
    const e1 = ui.btn('encodeURIComponent', () => o.set(encodeURIComponent(i.v)), 'sec sm'), e2 = ui.btn('decodeURIComponent', () => safe(o, () => o.set(decodeURIComponent(i.v))), 'sec sm'), e3 = ui.btn('encodeURI', () => o.set(encodeURI(i.v)), 'sec sm');
    live([i], () => {
      try { const u = new URL(i.v.trim()); parts.set({ Protocol: u.protocol, Host: u.hostname, Port: u.port || '(default)', Path: u.pathname, Hash: u.hash || '—' });
        tb.replaceChildren(h('table', {}, h('tr', {}, h('th', {}, 'Param'), h('th', {}, 'Value')), [...u.searchParams].map(([k, v]) => h('tr', {}, h('td', {}, k), h('td', {}, v)))));
      } catch { parts.set({ Status: 'Not a full URL' }); tb.replaceChildren(); }
    });
    root.append(ui.row(e1, e2, e3), o, parts, tb);
  }
});

T({
  id: 'html-entities', name: 'HTML Entity Encoder', cat: 'dev', icon: '&;', desc: 'Escape or unescape HTML special characters and entities.',
  render(root) {
    const [i, o] = io(root, { value: '<a href="x">Tom & "Jerry" © 2024</a>' }), nonAscii = ui.check('Encode non-ASCII as &#NNN;');
    root.append(ui.row(ui.btn('Encode', () => o.set(i.v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])).replace(nonAscii.v ? /[^\x00-\x7f]/gu : /$^/g, c => `&#${c.codePointAt(0)};`))), ui.btn('Decode', () => o.set(h('textarea', { innerHTML: i.v }).value), 'sec'), nonAscii), o);
  }
});

T({
  id: 'jwt-decoder', name: 'JWT Decoder', cat: 'dev', icon: '🪪', desc: 'Inspect header, payload and expiry of a JSON Web Token (no verification, local only).',
  render(root) {
    const i = ui.area('JWT', { rows: 4, value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature' }), hd = ui.out('Header'), pl = ui.out('Payload'), st = h('p');
    const dec = s => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0))));
    live([i], () => { try { const [a, b] = i.v.trim().split('.'), p = dec(b); hd.set(JSON.stringify(dec(a), null, 2)); pl.set(JSON.stringify(p, null, 2)); const now = Date.now() / 1000; st.className = p.exp && p.exp < now ? 'err' : 'ok'; st.textContent = p.exp ? (p.exp < now ? '⛔ Expired ' : '✅ Valid until ') + new Date(p.exp * 1000).toLocaleString() : 'No expiry claim'; } catch (e) { hd.set('Invalid token'); pl.set(''); st.textContent = ''; } });
    root.append(i, st, ui.cols(hd, pl));
  }
});

T({
  id: 'regex-tester', name: 'Regex Tester', cat: 'dev', icon: '🎯', desc: 'Test regular expressions with live highlighting and capture groups.',
  render(root) {
    const re = ui.input('Pattern', { value: '(\\w+)@(\\w+)\\.com' }), fl = ui.input('Flags', { value: 'g' }), t = ui.area('Test string', { rows: 6, value: 'Contact: alice@example.com, bob@test.com' }), hl = h('pre', { style: { margin: 0, whiteSpace: 'pre-wrap', padding: '12px', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: '8px' } }), list = h('div'), st = h('p', { class: 'muted' });
    live([re, fl, t], () => {
      try {
        const r = new RegExp(re.v, fl.v.includes('g') ? fl.v : fl.v + 'g'), ms = [...t.v.matchAll(r)]; let last = 0; const parts = [];
        ms.forEach(m => { if (!m[0]) return; parts.push(t.v.slice(last, m.index), h('mark', { style: { background: 'rgba(250,204,21,.5)', color: 'inherit' } }, m[0])); last = m.index + m[0].length; }); parts.push(t.v.slice(last));
        hl.replaceChildren(...parts); st.textContent = ms.length + ' match(es)'; st.className = 'muted';
        list.replaceChildren(h('table', {}, h('tr', {}, ['#', 'Match', 'Index', 'Groups'].map(x => h('th', {}, x))), ms.slice(0, 200).map((m, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, h('code', {}, m[0])), h('td', {}, m.index), h('td', {}, m.slice(1).map(g => g ?? '∅').join(' | '))))));
      } catch (e) { st.textContent = e.message; st.className = 'err'; hl.textContent = t.v; list.replaceChildren(); }
    });
    root.append(ui.row(re, h('div', { style: { maxWidth: '120px' } }, fl)), t, st, hl, list);
  }
});

T({
  id: 'cron-helper', name: 'Cron Expression Helper', cat: 'dev', icon: '⏰', desc: 'Validate cron schedules and preview the next run times.',
  render(root) {
    const c = ui.input('Cron (min hour day month weekday)', { value: '*/15 9-17 * * 1-5' }), o = ui.out('Next 10 runs'), st = h('p');
    const rng = (f, lo, hi) => { const s = new Set(); for (const p of f.split(',')) { const [r, step] = p.split('/'), n = step ? +step : 1; let a, b; if (r === '*') [a, b] = [lo, hi]; else if (r.includes('-')) [a, b] = r.split('-').map(Number); else { a = +r; b = step ? hi : a; } if ([a, b, n].some(isNaN) || a < lo || b > hi || n < 1) throw Error('Invalid field: ' + f); for (let v = a; v <= b; v += n) s.add(v); } return s; };
    live([c], () => {
      try {
        const f = c.v.trim().split(/\s+/); if (f.length !== 5) throw Error('Need 5 fields: minute hour day-of-month month day-of-week');
        const [mi, ho, dom, mo, dow] = [rng(f[0], 0, 59), rng(f[1], 0, 23), rng(f[2], 1, 31), rng(f[3], 1, 12), new Set([...rng(f[4].replace(/7/g, '0'), 0, 6)])];
        const d = new Date(); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1); const res = []; let guard = 0;
        while (res.length < 10 && guard++ < 600000) { const dayOk = (f[2] !== '*' && f[4] !== '*') ? (dom.has(d.getDate()) || dow.has(d.getDay())) : dom.has(d.getDate()) && dow.has(d.getDay()); if (mo.has(d.getMonth() + 1) && dayOk && ho.has(d.getHours()) && mi.has(d.getMinutes())) res.push(d.toLocaleString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })); d.setMinutes(d.getMinutes() + 1); }
        o.set(res.join('\n') || 'No run in the next ~1 year'); st.className = 'ok'; st.textContent = '✅ Valid';
      } catch (e) { st.className = 'err'; st.textContent = e.message; o.set(''); }
    });
    root.append(c, st, ui.row(['* * * * *', '0 * * * *', '0 0 * * *', '0 9 * * 1-5', '*/5 * * * *', '0 0 1 * *'].map(x => ui.btn(x, () => { c.v = x; c.c.dispatchEvent(new Event('input')); }, 'sec sm'))), o);
  }
});

T({
  id: 'timestamp-converter', name: 'Unix Timestamp Converter', cat: 'dev', icon: '🕒', desc: 'Convert epoch seconds/milliseconds to dates and back.',
  render(root, ctx) {
    const ts = ui.input('Unix timestamp (s or ms)', { value: Math.floor(Date.now() / 1000) }), dt = ui.input('Date/time (local)', { type: 'datetime-local', step: 1 }), o = ui.out('Formats'), now = h('b');
    const fmt = d => isNaN(d) ? 'Invalid' : `ISO 8601: ${d.toISOString()}\nUTC:      ${d.toUTCString()}\nLocal:    ${d.toString()}\nSeconds:  ${Math.floor(d / 1000)}\nMillis:   ${+d}\nRelative: ${new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round((d - Date.now()) / 86400000), 'day')}`;
    const loc = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 19);
    ts.on(() => { const n = +ts.v, d = new Date(Math.abs(n) < 1e11 ? n * 1000 : n); o.set(fmt(d)); if (!isNaN(d)) dt.v = loc(d); });
    dt.on(() => { const d = new Date(dt.v); if (!isNaN(d)) { ts.v = Math.floor(d / 1000); o.set(fmt(d)); } });
    ts.c.dispatchEvent(new Event('input'));
    const iv = setInterval(() => now.textContent = Math.floor(Date.now() / 1000), 500); ctx.cleanup(() => clearInterval(iv));
    root.append(h('p', {}, 'Current timestamp: ', now), ui.row(ts, dt), o);
  }
});

T({
  id: 'uuid-generator', name: 'UUID / ID Generator', cat: 'dev', icon: '🆔', desc: 'Generate UUID v4, v7, ULID-style and NanoID-like random identifiers in bulk.',
  render(root) {
    const kind = ui.select('Type', ['UUID v4', 'UUID v7', 'ULID', 'NanoID (21)', 'Short ID (8)']), n = ui.input('Count', { type: 'number', value: 5, min: 1, max: 1000 }), up = ui.check('Uppercase'), o = ui.out('IDs');
    const rb = n => crypto.getRandomValues(new Uint8Array(n)), hex = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
    const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ', alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    const G = {
      'UUID v4': () => crypto.randomUUID(),
      'UUID v7': () => { const b = rb(16), t = BigInt(Date.now()); for (let i = 0; i < 6; i++) b[i] = Number((t >> BigInt(8 * (5 - i))) & 255n); b[6] = b[6] & 15 | 0x70; b[8] = b[8] & 63 | 128; const x = hex(b); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; },
      ULID: () => { let t = Date.now(), s = ''; for (let i = 0; i < 10; i++) { s = A[t % 32] + s; t = Math.floor(t / 32); } return s + [...rb(16)].map(x => A[x % 32]).join(''); },
      'NanoID (21)': () => [...rb(21)].map(x => alpha[x & 63]).join(''), 'Short ID (8)': () => [...rb(8)].map(x => alpha[x & 63]).join('')
    };
    live([kind, n, up], () => { const r = Array.from({ length: Math.min(1000, n.v | 0) }, G[kind.v]).join('\n'); o.set(up.v ? r.toUpperCase() : r); });
    root.append(ui.row(kind, n, up), ui.btn('Regenerate', () => n.c.dispatchEvent(new Event('input'))), o);
  }
});

function md5(str) {
  const b = new TextEncoder().encode(str), n = b.length, w = new Uint32Array((((n + 8) >> 6) + 1) * 16);
  for (let i = 0; i < n; i++) w[i >> 2] |= b[i] << (i % 4 * 8); w[n >> 2] |= 0x80 << (n % 4 * 8); w[w.length - 2] = n * 8;
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0), S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let o = 0; o < w.length; o += 16) {
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g; if (i < 16) { F = B & C | ~B & D; g = i; } else if (i < 32) { F = D & B | ~D & C; g = (5 * i + 1) % 16; } else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; } else { F = C ^ (B | ~D); g = 7 * i % 16; }
      F = (F + A + K[i] + w[o + g]) >>> 0; A = D; D = C; C = B; const s = S[(i >> 4) * 4 + i % 4]; B = (B + ((F << s) | (F >>> (32 - s)))) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  return [a0, b0, c0, d0].map(x => [0, 8, 16, 24].map(s => ((x >>> s) & 255).toString(16).padStart(2, '0')).join('')).join('');
}
const hexOf = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
T({
  id: 'hash-generator', name: 'Hash Generator (MD5, SHA)', cat: 'dev', icon: '#️⃣', desc: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512 of any text — plus HMAC.',
  render(root) {
    const i = ui.area('Text', { rows: 5, value: 'hello world' }), key = ui.input('HMAC secret key (optional)'), o = ui.out('Hashes');
    live([i, key], async () => {
      const d = new TextEncoder().encode(i.v), lines = [`MD5      ${md5(i.v)}`];
      for (const a of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) lines.push(`${a.padEnd(8)} ${hexOf(await crypto.subtle.digest(a, d))}`);
      if (key.v) { const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key.v), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); lines.push('', `HMAC-SHA256 ${hexOf(await crypto.subtle.sign('HMAC', k, d))}`); }
      o.set(lines.join('\n'));
    });
    root.append(i, key, o);
  }
});

T({
  id: 'sql-formatter', name: 'SQL Formatter', cat: 'dev', icon: '🗃️', desc: 'Pretty-print SQL queries with keyword casing and indentation.',
  render(root) {
    const [i, o] = io(root, { value: "select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.active=1 and o.total>100 group by u.id,u.name having count(o.id)>2 order by orders desc limit 10;" }), up = ui.check('Uppercase keywords', true);
    live([i, up], () => {
      const kws = ['select', 'from', 'where', 'group by', 'order by', 'having', 'limit', 'offset', 'left join', 'right join', 'inner join', 'full join', 'cross join', 'join', 'union all', 'union', 'insert into', 'values', 'update', 'set', 'delete from'];
      let s = i.v.replace(/\s+/g, ' ').trim();
      const strs = []; s = s.replace(/'(?:''|[^'])*'/g, m => { strs.push(m); return `\u0001${strs.length - 1}\u0001`; });
      kws.forEach(k => { s = s.replace(new RegExp(`\\b${k.replace(' ', '\\s+')}\\b`, 'gi'), m => (up.v ? m.toUpperCase() : m.toLowerCase()).replace(/\s+/g, ' ')); });
      const brk = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
      s = s.replace(new RegExp(`\\s*\\b(${brk.join('|')})\\b`, 'gi'), (m, u) => '\n' + (up.v ? u.toUpperCase() : u.toLowerCase()));
      s = s.replace(/\s+(AND|OR)\s+/gi, (m, a) => `\n  ${up.v ? a.toUpperCase() : a.toLowerCase()} `).replace(/^SELECT\s+(.*)$/gim, (m, c) => 'SELECT\n  ' + c.split(/,\s*(?![^(]*\))/).join(',\n  '));
      o.set(s.trim().replace(/\u0001(\d+)\u0001/g, (_, n) => strs[n]));
    });
    root.append(up, o);
  }
});

T({
  id: 'number-base-converter', name: 'Number Base Converter', cat: 'dev', icon: '🔟', desc: 'Binary, octal, decimal, hex and any base 2–36 (BigInt-safe).',
  render(root) {
    const f = { Binary: 2, Octal: 8, Decimal: 10, Hex: 16, 'Base 36': 36 }, ins = {}, err = h('p', { class: 'err' });
    const digits = '0123456789abcdefghijklmnopqrstuvwxyz', parse = (s, b) => { let n = 0n; for (const c of s.toLowerCase().replace(/^0[xbo]/, '')) { const d = digits.indexOf(c); if (d < 0 || d >= b) throw Error(`Invalid digit “${c}” for base ${b}`); n = n * BigInt(b) + BigInt(d); } return n; };
    for (const [k, b] of Object.entries(f)) ins[k] = ui.input(`${k} (base ${b})`).on(() => { err.textContent = ''; try { const n = parse(ins[k].v.trim() || '0', b); for (const [k2, b2] of Object.entries(f)) if (k2 !== k) ins[k2].v = n.toString(b2).toUpperCase(); } catch (e) { err.textContent = e.message; } });
    ins.Decimal.v = '255'; ins.Decimal.c.dispatchEvent(new Event('input'));
    root.append(ui.cols(...Object.values(ins)), err);
  }
});

T({
  id: 'http-status-codes', name: 'HTTP Status Codes', cat: 'dev', icon: '📶', desc: 'Searchable reference of HTTP response codes with meanings.',
  render(root) {
    const D = '100 Continue|101 Switching Protocols|200 OK|201 Created|202 Accepted|204 No Content|206 Partial Content|301 Moved Permanently|302 Found|303 See Other|304 Not Modified|307 Temporary Redirect|308 Permanent Redirect|400 Bad Request|401 Unauthorized (authentication required)|402 Payment Required|403 Forbidden (authenticated but not allowed)|404 Not Found|405 Method Not Allowed|406 Not Acceptable|408 Request Timeout|409 Conflict|410 Gone|411 Length Required|412 Precondition Failed|413 Payload Too Large|414 URI Too Long|415 Unsupported Media Type|416 Range Not Satisfiable|418 I\'m a teapot|422 Unprocessable Content|425 Too Early|426 Upgrade Required|428 Precondition Required|429 Too Many Requests|431 Request Header Fields Too Large|451 Unavailable For Legal Reasons|500 Internal Server Error|501 Not Implemented|502 Bad Gateway|503 Service Unavailable|504 Gateway Timeout|505 HTTP Version Not Supported|511 Network Authentication Required'.split('|');
    const q = ui.input('Filter by code or text', { placeholder: 'e.g. 404 or timeout' }), t = h('div'), col = { 1: '#0ea5e9', 2: '#16a34a', 3: '#ca8a04', 4: '#ea580c', 5: '#dc2626' };
    live([q], () => t.replaceChildren(h('table', {}, D.filter(x => x.toLowerCase().includes(q.v.toLowerCase())).map(x => h('tr', {}, h('td', { style: { width: '70px', fontWeight: 700, color: col[x[0]] } }, x.slice(0, 3)), h('td', {}, x.slice(4)))))));
    root.append(q, t);
  }
});

T({
  id: 'chmod-calculator', name: 'Chmod Calculator', cat: 'dev', icon: '🔒', desc: 'Compute Unix file permissions in octal and symbolic notation.',
  render(root) {
    const who = ['Owner', 'Group', 'Others'], bits = ['Read', 'Write', 'Execute'], boxes = who.map(() => bits.map(b => ui.check(b)));
    const o = ui.out('Result'), oct = ui.input('Octal', { value: '644', maxlength: 3 });
    const calc = () => { const n = boxes.map(r => r.reduce((s, c, i) => s + (c.v ? 4 >> i : 0), 0)).join(''); const sym = boxes.map(r => r.map((c, i) => c.v ? 'rwx'[i] : '-').join('')).join(''); oct.v = n; o.set(`chmod ${n} file\nchmod u=${rwx(0)},g=${rwx(1)},o=${rwx(2)} file\n-${sym}`); };
    const rwx = k => boxes[k].map((c, i) => c.v ? 'rwx'[i] : '').join('') || '';
    boxes.flat().forEach(c => c.on(calc));
    oct.on(() => { if (/^[0-7]{3}$/.test(oct.v)) { [...oct.v].forEach((d, k) => boxes[k].forEach((c, i) => c.v = !!(d & (4 >> i)))); const t = oct.v; calc(); oct.v = t; } });
    oct.c.dispatchEvent(new Event('input'));
    root.append(h('div', { class: 'cols' }, who.map((w, k) => h('div', { class: 'card' }, h('b', {}, w), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'flex-start', marginTop: '8px' } }, boxes[k])))), oct, o);
  }
});

T({
  id: 'browser-info', name: 'Browser & Device Info', cat: 'dev', icon: '🖥️', desc: 'See what your browser reveals: user agent, screen, language, features.',
  render(root) {
    const n = navigator, tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const d = { 'User agent': n.userAgent, Platform: n.userAgentData?.platform || n.platform, Language: n.languages.join(', '), Timezone: tz, 'Screen': `${screen.width}×${screen.height} @${devicePixelRatio}x`, 'Viewport': `${innerWidth}×${innerHeight}`, 'CPU cores': n.hardwareConcurrency, 'Memory (GB)': n.deviceMemory || 'n/a', 'Color scheme': matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light', 'Touch points': n.maxTouchPoints, Online: n.onLine, Cookies: n.cookieEnabled, 'Do Not Track': n.doNotTrack || 'unset', WebGL: !!document.createElement('canvas').getContext('webgl'), WebAssembly: typeof WebAssembly === 'object', 'Service Worker': 'serviceWorker' in n, 'Secure context': isSecureContext };
    const o = ui.out('Info'); o.set(Object.entries(d).map(([k, v]) => `${k.padEnd(16)} ${v}`).join('\n'));
    root.append(o);
  }
});

T({
  id: 'string-escaper', name: 'String Escape / Unescape', cat: 'dev', icon: '🧷', desc: 'Escape text for JSON, JavaScript, regex, CSV or shell — and reverse it.',
  render(root) {
    const [i, o] = io(root, { value: 'He said "hi"\nTab\there \\ back' }), k = ui.select('Format', ['JSON string', 'JavaScript (single quotes)', 'Regex', 'CSV field', 'Shell (single quotes)']), dir = ui.select('Direction', ['Escape', 'Unescape']);
    live([i, k, dir], () => safe(o, () => {
      const s = i.v, e = dir.v === 'Escape';
      o.set({
        'JSON string': () => e ? JSON.stringify(s) : JSON.parse(s.trim().startsWith('"') ? s.trim() : `"${s}"`),
        'JavaScript (single quotes)': () => e ? "'" + s.replace(/[\\'\n\r\t]/g, c => ({ '\\': '\\\\', "'": "\\'", '\n': '\\n', '\r': '\\r', '\t': '\\t' }[c])) + "'" : s.replace(/^'|'$/g, '').replace(/\\(.)/g, (m, c) => ({ n: '\n', r: '\r', t: '\t' }[c] || c)),
        Regex: () => e ? s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') : s.replace(/\\(.)/g, '$1'),
        'CSV field': () => e ? '"' + s.replace(/"/g, '""') + '"' : s.replace(/^"|"$/g, '').replace(/""/g, '"'),
        'Shell (single quotes)': () => e ? "'" + s.replace(/'/g, "'\\''") + "'" : s.replace(/^'|'$/g, '').replace(/'\\''/g, "'")
      }[k.v]());
    }));
    root.prepend(ui.row(k, dir)); root.append(o);
  }
});
