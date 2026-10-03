/* Core: DOM helper, UI kit, registry, router. No dependencies. */
const h = (tag, a = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const k in a) {
    const v = a[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (['value', 'checked', 'disabled', 'selected', 'textContent', 'innerHTML'].includes(k)) e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(x => x != null && x !== false && e.append(x.nodeType ? x : document.createTextNode(x)));
  return e;
};
const TOOLS = [];
const T = def => TOOLS.push(def);
const CATS = {
  image: ['🖼️', 'Image'], text: ['📝', 'Text'], dev: ['💻', 'Developer'], sec: ['🔐', 'Security'],
  math: ['🧮', 'Math & Finance'], design: ['🎨', 'Design & CSS'], media: ['🎧', 'Audio & Video'],
  prod: ['⏱️', 'Productivity'], misc: ['🧩', 'Files & Fun']
};

const ui = {
  _wrap(label, c) {
    const w = h('label', { class: 'f' }, label ? h('span', { class: 'lb' }, label) : null, c);
    w.c = c;
    Object.defineProperty(w, 'v', {
      get: () => c.type === 'checkbox' ? c.checked : (c.type === 'number' || c.type === 'range') ? +c.value : c.value,
      set: x => { c.type === 'checkbox' ? c.checked = x : c.value = x; }
    });
    w.on = fn => { c.addEventListener('input', fn); return w; };
    return w;
  },
  input: (label, o = {}) => ui._wrap(label, h('input', { type: 'text', ...o })),
  area: (label, o = {}) => ui._wrap(label, h('textarea', { rows: 6, spellcheck: 'false', ...o })),
  select(label, opts, val) {
    const c = h('select', {}, opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v }, l); }));
    if (val != null) c.value = val;
    return ui._wrap(label, c);
  },
  check(label, on = false) {
    const c = h('input', { type: 'checkbox', checked: on });
    const w = h('label', { class: 'chk' }, c, label);
    w.c = c;
    Object.defineProperty(w, 'v', { get: () => c.checked, set: x => c.checked = x });
    w.on = fn => { c.addEventListener('input', fn); return w; };
    return w;
  },
  range(label, min, max, val, step = 1) {
    const c = h('input', { type: 'range', min, max, step, value: val });
    const s = h('b', {}, val);
    const w = ui._wrap(null, c);
    w.prepend(h('span', { class: 'lb' }, label + ': ', s));
    c.addEventListener('input', () => s.textContent = c.value);
    return w;
  },
  btn: (text, fn, cls = '') => h('button', { class: 'btn ' + cls, type: 'button', onclick: fn }, text),
  row: (...k) => h('div', { class: 'row' }, k),
  cols: (...k) => h('div', { class: 'cols' }, k),
  card: (...k) => h('div', { class: 'card' }, k),
  out(label, o = {}) {
    const pre = h('pre', o.pre || {});
    const d = h('div', { class: 'out' }, label ? h('span', { class: 'lb' }, label) : null, pre,
      h('button', { class: 'btn sm sec', type: 'button', onclick: () => ui.copy(pre.textContent) }, 'Copy'));
    d.set = t => { pre.textContent = t; return d; };
    d.get = () => pre.textContent;
    d.pre = pre;
    return d;
  },
  stats(init = {}) {
    const d = h('div', { class: 'stats' });
    d.set = o => { d.replaceChildren(...Object.entries(o).map(([k, v]) => h('div', { class: 'stat' }, h('b', {}, v), h('span', {}, k)))); return d; };
    d.set(init);
    return d;
  },
  file(label, accept, cb, multiple = false) {
    const inp = h('input', { type: 'file', accept, multiple, style: { display: 'none' } });
    const d = h('div', { class: 'drop', tabindex: 0 }, label || 'Drop a file here or click to choose', inp);
    const go = fs => { fs = [...fs]; if (fs.length) cb(multiple ? fs : fs[0], fs); };
    d.onclick = () => inp.click();
    d.onkeydown = e => e.key === 'Enter' && inp.click();
    inp.onchange = () => { go(inp.files); inp.value = ''; };
    d.ondragover = e => { e.preventDefault(); d.classList.add('over'); };
    d.ondragleave = () => d.classList.remove('over');
    d.ondrop = e => { e.preventDefault(); d.classList.remove('over'); go(e.dataTransfer.files); };
    return d;
  },
  dl(name, data, type = 'application/octet-stream') {
    const url = typeof data === 'string' && data.startsWith('data:') ? data : URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }));
    const a = h('a', { href: url, download: name });
    document.body.append(a); a.click(); a.remove();
    if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 5000);
  },
  async copy(t) {
    try { await navigator.clipboard.writeText(t); } catch { const a = h('textarea', { value: t }); document.body.append(a); a.select(); document.execCommand('copy'); a.remove(); }
    ui.toast('Copied');
  },
  toast(m) {
    let t = document.querySelector('.toast');
    if (!t) { t = h('div', { class: 'toast' }); document.body.append(t); }
    t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 1600);
  },
  img: src => new Promise((res, rej) => {
    const i = new Image(); const u = src instanceof Blob ? URL.createObjectURL(src) : src;
    i.onload = () => res(i); i.onerror = () => rej(new Error('Could not load image')); i.src = u;
  }),
  blob: (c, type = 'image/png', q) => new Promise(r => c.toBlob(r, type, q)),
  bytes(n) { const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (n >= 1024 && i < 3) { n /= 1024; i++; } return n.toFixed(i ? 1 : 0) + ' ' + u[i]; },
  err(o, e) { o.set('⚠ ' + (e.message || e)); },
  store: {
    get(k, d) { try { return JSON.parse(localStorage.getItem('hwt:' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('hwt:' + k, JSON.stringify(v)); } catch { } }
  },
  debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
};

/* store-only ZIP writer (shared by several tools) */
ui.crc32 = (() => {
  const t = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  return b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
})();
ui.zip = async files => {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  const d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const f of files) {
    const data = new Uint8Array(f.data instanceof Blob ? await f.data.arrayBuffer() : f.data), nm = enc.encode(f.name), crc = ui.crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, time, 2], [12, date, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, nm.length, 2], [28, 0, 2]]
      .forEach(([o, v, n]) => n === 4 ? lh.setUint32(o, v, true) : lh.setUint16(o, v, true));
    const ch = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, time, 2], [14, date, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, nm.length, 2], [42, off, 4]]
      .forEach(([o, v, n]) => n === 4 ? ch.setUint32(o, v, true) : ch.setUint16(o, v, true));
    parts.push(lh, nm, data); cen.push(ch, nm);
    off += 30 + nm.length + data.length;
  }
  const csize = cen.reduce((s, x) => s + (x.byteLength ?? x.length), 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csize, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...cen, end], { type: 'application/zip' });
};

/* ---------- router ---------- */
const app = document.getElementById('app'), q = document.getElementById('q');
let cleanups = [], activeCat = 'all';
const ctx = { cleanup: fn => cleanups.push(fn) };
const tileOf = t => h('a', { class: 'tile', href: '#/t/' + t.id }, h('div', { class: 'ic' }, t.icon), h('div', {}, h('h3', {}, t.name), h('p', {}, t.desc)));
const matches = (t, s) => !s || (t.name + ' ' + t.desc + ' ' + (t.kw || '') + ' ' + CATS[t.cat][1]).toLowerCase().includes(s);

function home() {
  const s = q.value.trim().toLowerCase();
  const list = TOOLS.filter(t => matches(t, s) && (activeCat === 'all' || t.cat === activeCat));
  const view = h('div');
  view.append(
    h('div', { class: 'hero' }, h('h1', {}, `${TOOLS.length} free tools. Zero uploads.`),
      h('p', {}, 'Image, text, developer, security, math, design, media and productivity utilities — all running privately in your browser. Plain HTML, CSS and JS.')),
    h('div', { class: 'chips' }, [['all', 'All'], ...Object.entries(CATS).map(([k, v]) => [k, v[0] + ' ' + v[1]])].map(([k, l]) =>
      h('button', { class: 'chip' + (k === activeCat ? ' on' : ''), onclick: () => { activeCat = k; home(); } }, l))));
  if (!list.length) view.append(h('div', { class: 'empty' }, 'No tools match “' + s + '”.'));
  else if (activeCat === 'all' && !s) {
    for (const c in CATS) {
      const ts = TOOLS.filter(t => t.cat === c);
      if (ts.length) view.append(h('div', { class: 'cat-h' }, CATS[c][0] + ' ' + CATS[c][1] + ' · ' + ts.length), h('div', { class: 'grid' }, ts.map(tileOf)));
    }
  } else view.append(h('div', { class: 'grid', style: { marginTop: '8px' } }, list.map(tileOf)));
  app.replaceChildren(view);
}

function tool(id) {
  const t = TOOLS.find(x => x.id === id);
  if (!t) return location.hash = '#/';
  document.title = t.name + ' — Hundred Web Tools';
  const root = h('div', { class: 'tool' });
  const rel = TOOLS.filter(x => x.cat === t.cat && x.id !== t.id).slice(0, 6);
  app.replaceChildren(
    h('a', { class: 'back', href: '#/' }, '← All tools'),
    h('div', { class: 'thead' }, h('div', { class: 'ic' }, t.icon), h('div', {}, h('h1', {}, t.name), h('p', {}, t.desc))),
    h('div', { class: 'card' }, root),
    h('div', { class: 'cat-h' }, 'More in ' + CATS[t.cat][1]), h('div', { class: 'grid' }, rel.map(tileOf)));
  try { t.render(root, ctx); } catch (e) { root.append(h('p', { class: 'err' }, 'Tool failed to load: ' + e.message)); console.error(e); }
  window.scrollTo(0, 0);
}

function route() {
  cleanups.forEach(f => { try { f(); } catch { } }); cleanups = [];
  const m = location.hash.match(/^#\/t\/([\w-]+)/);
  document.title = 'Hundred Open Web Tools — 100 free, private, in-browser utilities';
  m ? tool(m[1]) : home();
}
addEventListener('hashchange', route);
addEventListener('DOMContentLoaded', route);
q.addEventListener('input', () => { if (location.hash.startsWith('#/t/')) location.hash = '#/'; else home(); });
addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); } });
const root$ = document.documentElement;
const savedTheme = ui.store.get('theme'); if (savedTheme) root$.dataset.theme = savedTheme;
document.getElementById('theme').onclick = () => {
  const dark = root$.dataset.theme ? root$.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
  root$.dataset.theme = dark ? 'light' : 'dark'; ui.store.set('theme', root$.dataset.theme);
};
