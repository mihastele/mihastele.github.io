/* Files & fun */
T({
  id: 'zip-tool', name: 'ZIP Creator & Extractor', cat: 'misc', icon: '🗜', desc: 'Bundle files into a ZIP or open a ZIP and download individual files — all offline.',
  render(root) {
    let files = []; const list = h('div'), out = h('div');
    const draw = () => list.replaceChildren(...files.map((f, i) => h('div', { class: 'row c' }, h('span', { style: { flex: 1 } }, `${f.name} · ${ui.bytes(f.size)}`), ui.btn('✕', () => { files.splice(i, 1); draw(); }, 'sm sec'))));
    const unzip = async f => {
      const d = new Uint8Array(await f.arrayBuffer()), v = new DataView(d.buffer); let e = d.length - 22; while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--; if (e < 0) return ui.toast('Not a valid ZIP file');
      const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true); const rows = [];
      for (let i = 0; i < n; i++) {
        const method = v.getUint16(p + 10, true), csz = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), el = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true), name = new TextDecoder().decode(d.subarray(p + 46, p + 46 + nl)); p += 46 + nl + el + cl;
        if (name.endsWith('/')) continue; const ds = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true), raw = d.subarray(ds, ds + csz);
        const get = async () => method === 0 ? new Blob([raw]) : await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
        rows.push({ name, size: csz, get });
      }
      out.replaceChildren(h('p', {}, `${rows.length} file(s) in ${f.name}`), ...rows.map(r => h('div', { class: 'row c' }, h('span', { style: { flex: 1 } }, `${r.name} · ${ui.bytes(r.size)} packed`), ui.btn('Download', async () => ui.dl(r.name.split('/').pop(), await r.get()), 'sm'))));
    };
    root.append(h('h3', {}, 'Create ZIP'), ui.file('Drop files to add', '', (_, fs) => { files.push(...fs); draw(); }, true), list, ui.btn('Create ZIP', async () => files.length ? ui.dl('archive.zip', await ui.zip(files.map(f => ({ name: f.name, data: f })))) : ui.toast('Add files first')), h('h3', {}, 'Extract ZIP'), ui.file('Drop a .zip file', '.zip,application/zip', unzip), out);
  }
});

T({
  id: 'csv-viewer', name: 'CSV Viewer & Sorter', cat: 'misc', icon: '📋', desc: 'Open a CSV, search it, sort by any column and export the result.',
  render(root) {
    let rows = [], head = [], sortC = -1, asc = true; const q = ui.input('Search rows'), tb = h('div', { style: { overflow: 'auto', maxHeight: '520px' } }), info = h('p', { class: 'muted' }), ta = ui.area('…or paste CSV here', { rows: 4 });
    const parse = t => { const R = []; let r = [], f = '', qt = false; const d = t.indexOf('\t') > -1 && t.indexOf(',') < 0 ? '\t' : t.split('\n')[0].split(';').length > t.split('\n')[0].split(',').length ? ';' : ','; for (let k = 0; k < t.length; k++) { const c = t[k]; if (qt) { if (c === '"') { if (t[k + 1] === '"') { f += '"'; k++; } else qt = false; } else f += c; } else if (c === '"') qt = true; else if (c === d) { r.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[k + 1] === '\n') k++; r.push(f); R.push(r); r = []; f = ''; } else f += c; } if (f || r.length) { r.push(f); R.push(r); } return R.filter(x => x.some(Boolean)); };
    const draw = () => {
      let v = rows.filter(r => !q.v || r.some(c => c.toLowerCase().includes(q.v.toLowerCase()))); if (sortC >= 0) v = v.slice().sort((a, b) => { const x = a[sortC], y = b[sortC], n = !isNaN(x) && !isNaN(y) && x !== '' && y !== ''; return (n ? x - y : x.localeCompare(y)) * (asc ? 1 : -1); });
      info.textContent = `${v.length} of ${rows.length} rows · ${head.length} columns`; draw.cur = v;
      tb.replaceChildren(h('table', {}, h('tr', {}, head.map((c, i) => h('th', { style: { cursor: 'pointer', position: 'sticky', top: 0, background: 'var(--card)' }, onclick: () => { asc = sortC === i ? !asc : true; sortC = i; draw(); } }, c + (sortC === i ? (asc ? ' ▲' : ' ▼') : '')))), v.slice(0, 1000).map(r => h('tr', {}, head.map((_, i) => h('td', {}, r[i] ?? ''))))));
    };
    const load = t => { const p = parse(t); if (!p.length) return; head = p[0]; rows = p.slice(1); sortC = -1; draw(); };
    q.on(draw); ta.on(() => load(ta.v));
    root.append(ui.file('Drop a CSV file', '.csv,.tsv,.txt,text/csv', f => f.text().then(load)), ta, q, info, tb, ui.btn('Export current view as CSV', () => ui.dl('view.csv', [head, ...(draw.cur || [])].map(r => r.map(c => /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c).join(',')).join('\n'), 'text/csv'), 'sec'));
  }
});

T({
  id: 'keyboard-tester', name: 'Keyboard Event Tester', cat: 'misc', icon: '⌨', desc: 'Press any key to see its key, code, keyCode and modifiers.',
  render(root, ctx) {
    const big = h('div', { class: 'big' }, 'Press a key'), st = ui.stats(), log = h('div', { class: 'row', style: { gap: '6px' } });
    const on = e => { e.preventDefault(); big.textContent = e.key === ' ' ? 'Space' : e.key; st.set({ key: e.key === ' ' ? '" "' : e.key, code: e.code, keyCode: e.keyCode, location: ['Standard', 'Left', 'Right', 'Numpad'][e.location], repeat: e.repeat, modifiers: ['ctrl', 'alt', 'shift', 'meta'].filter(m => e[m + 'Key']).join('+') || 'none' }); if (!e.repeat) log.prepend(h('span', { class: 'tag', style: { fontSize: '14px', padding: '2px 10px' } }, e.code)); while (log.children.length > 30) log.lastChild.remove(); };
    addEventListener('keydown', on); ctx.cleanup(() => removeEventListener('keydown', on));
    root.append(big, st, h('p', { class: 'muted' }, 'Recent keys (physical key codes):'), log);
  }
});

T({
  id: 'reaction-time', name: 'Reaction Time Test', cat: 'misc', icon: '⚡', desc: 'Click as soon as the box turns green. How fast are you?',
  render(root, ctx) {
    let state = 0, t0, to, best = ui.store.get('rt-best', null), res = []; const box = h('div', { style: { height: '240px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '24px', fontWeight: 700, cursor: 'pointer', userSelect: 'none', background: '#2563eb', textAlign: 'center' } }, 'Click to start'), st = h('p', { class: 'muted' });
    const stats = () => st.textContent = (res.length ? `Last: ${res.at(-1)} ms · Average (${res.length}): ${Math.round(res.reduce((a, b) => a + b) / res.length)} ms · ` : '') + (best ? `Best ever: ${best} ms` : '');
    box.onpointerdown = () => {
      if (state === 0) { state = 1; box.style.background = '#dc2626'; box.textContent = 'Wait for green…'; to = setTimeout(() => { state = 2; t0 = performance.now(); box.style.background = '#16a34a'; box.textContent = 'CLICK!'; }, 1000 + Math.random() * 3500); }
      else if (state === 1) { clearTimeout(to); state = 0; box.style.background = '#ea580c'; box.textContent = 'Too soon! Click to retry'; }
      else { const ms = Math.round(performance.now() - t0); res.push(ms); if (!best || ms < best) { best = ms; ui.store.set('rt-best', ms); } state = 0; box.style.background = '#2563eb'; box.textContent = `${ms} ms — click to go again`; stats(); }
    };
    ctx.cleanup(() => clearTimeout(to)); stats(); root.append(box, st);
  }
});

T({
  id: 'snake-game', name: 'Snake', cat: 'misc', icon: '🐍', desc: 'The classic. Arrow keys / WASD or swipe on mobile.',
  render(root, ctx) {
    const N = 20, S = 20, cv = h('canvas', { width: N * S, height: N * S, style: { display: 'block', margin: '0 auto', border: '2px solid var(--bd)', borderRadius: '8px', background: 'var(--bg)', touchAction: 'none' } }), sc = h('p', { style: { textAlign: 'center', fontWeight: 700 } }); let sn, dir, nd, food, score, iv, best = ui.store.get('snake-best', 0), over;
    const reset = () => { sn = [[10, 10], [9, 10], [8, 10]]; dir = nd = [1, 0]; score = 0; over = false; place(); clearInterval(iv); iv = setInterval(step, 110); draw(); };
    const place = () => { do food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; while (sn.some(s => s[0] === food[0] && s[1] === food[1])); };
    const step = () => { dir = nd; const hd = [sn[0][0] + dir[0], sn[0][1] + dir[1]]; if (hd[0] < 0 || hd[1] < 0 || hd[0] >= N || hd[1] >= N || sn.some(s => s[0] === hd[0] && s[1] === hd[1])) { over = true; clearInterval(iv); if (score > best) { best = score; ui.store.set('snake-best', best); } return draw(); } sn.unshift(hd); if (hd[0] === food[0] && hd[1] === food[1]) { score++; place(); } else sn.pop(); draw(); };
    const draw = () => { const x = cv.getContext('2d'), cs = getComputedStyle(document.body); x.clearRect(0, 0, N * S, N * S); x.fillStyle = '#ef4444'; x.beginPath(); x.arc(food[0] * S + S / 2, food[1] * S + S / 2, S / 2 - 2, 0, 7); x.fill(); sn.forEach((s, i) => { x.fillStyle = i ? cs.getPropertyValue('--ac') : cs.getPropertyValue('--ac2'); x.fillRect(s[0] * S + 1, s[1] * S + 1, S - 2, S - 2); }); sc.textContent = `Score ${score} · Best ${best}` + (over ? ' · Game over — press Space' : ''); };
    const turn = d => { if (d[0] + dir[0] || d[1] + dir[1]) nd = d; };
    const keys = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
    const kd = e => { if (keys[e.key]) { e.preventDefault(); turn(keys[e.key]); } else if (e.key === ' ' && over) { e.preventDefault(); reset(); } };
    addEventListener('keydown', kd); ctx.cleanup(() => { removeEventListener('keydown', kd); clearInterval(iv); });
    let sx, sy; cv.onpointerdown = e => { sx = e.clientX; sy = e.clientY; }; cv.onpointerup = e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return over && reset(); Math.abs(dx) > Math.abs(dy) ? turn([Math.sign(dx), 0]) : turn([0, Math.sign(dy)]); };
    root.append(sc, cv, ui.row(ui.btn('↻ Restart', reset, 'sec'))); reset();
  }
});

T({
  id: 'memory-match', name: 'Memory Match', cat: 'misc', icon: '🃏', desc: 'Flip cards and find all the pairs in as few moves as possible.',
  render(root) {
    const E = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐙', '🦄']; let first, lock, moves, pairs; const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', maxWidth: '420px', margin: '0 auto' } }), st = h('p', { style: { textAlign: 'center', fontWeight: 700 } });
    const reset = () => {
      const d = [...E, ...E].sort(() => Math.random() - .5); first = null; lock = false; moves = 0; pairs = 0; st.textContent = 'Moves: 0';
      grid.replaceChildren(...d.map(e => { const c = h('button', { class: 'btn sec', style: { height: '80px', fontSize: '34px' } }, '❓'); c.onclick = () => { if (lock || c.disabled || c === first) return; c.textContent = e; if (!first) { first = c; first.e = e; return; } moves++; st.textContent = 'Moves: ' + moves; if (first.e === e) { c.disabled = first.disabled = true; first = null; if (++pairs === E.length) st.textContent = `🎉 Solved in ${moves} moves!`; } else { lock = true; setTimeout(() => { c.textContent = first.textContent = '❓'; first = null; lock = false; }, 700); } }; return c; }));
    };
    root.append(st, grid, ui.row(ui.btn('New game', reset)), h('style', {}, '.tool .row{justify-content:center}')); reset();
  }
});
