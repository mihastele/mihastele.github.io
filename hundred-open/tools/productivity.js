/* Productivity tools — state is kept in localStorage only. */
const beep = (f = 880, d = .25, n = 1) => { try { const ac = new AudioContext(); for (let i = 0; i < n; i++) { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * .4; o.frequency.value = f; g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d); } setTimeout(() => ac.close(), n * 500 + 500); } catch { } };
const hms = s => { s = Math.max(0, Math.ceil(s)); const hh = Math.floor(s / 3600); return (hh ? hh + ':' : '') + String(Math.floor(s % 3600 / 60)).padStart(hh ? 2 : 2, '0') + ':' + String(s % 60).padStart(2, '0'); };

T({
  id: 'pomodoro-timer', name: 'Pomodoro Timer', cat: 'prod', icon: '🍅', desc: 'Focus in 25-minute sprints with automatic short and long breaks.',
  render(root, ctx) {
    const cfg = ui.store.get('pomo', { w: 25, s: 5, l: 15 }), w = ui.input('Focus (min)', { type: 'number', value: cfg.w, min: 1 }), s = ui.input('Short break', { type: 'number', value: cfg.s, min: 1 }), l = ui.input('Long break', { type: 'number', value: cfg.l, min: 1 });
    let phase = 'Focus', left = w.v * 60, run = false, last, done = 0, iv; const disp = h('div', { class: 'big' }), lbl = h('div', { style: { textAlign: 'center', fontWeight: 700 } }), cnt = h('p', { class: 'muted', style: { textAlign: 'center' } });
    const len = () => (phase === 'Focus' ? w.v : phase === 'Short break' ? s.v : l.v) * 60;
    const show = () => { disp.textContent = hms(left); lbl.textContent = phase; cnt.textContent = `Completed focus sessions: ${done}`; document.title = (run ? hms(left) + ' · ' : '') + phase; };
    const tick = () => { const n = Date.now(); left -= (n - last) / 1000; last = n; if (left <= 0) { beep(880, .3, 3); if (phase === 'Focus') { done++; phase = done % 4 ? 'Short break' : 'Long break'; } else phase = 'Focus'; left = len(); } show(); };
    const btn = ui.btn('▶ Start', () => { run = !run; btn.textContent = run ? '⏸ Pause' : '▶ Start'; last = Date.now(); clearInterval(iv); if (run) iv = setInterval(tick, 250); show(); });
    [w, s, l].forEach(c => c.on(() => { ui.store.set('pomo', { w: w.v, s: s.v, l: l.v }); if (!run) { left = len(); show(); } }));
    ctx.cleanup(() => { clearInterval(iv); document.title = 'Hundred Open Web Tools'; });
    root.append(lbl, disp, cnt, ui.row(btn, ui.btn('⏭ Skip', () => { phase = phase === 'Focus' ? 'Short break' : 'Focus'; left = len(); show(); }, 'sec'), ui.btn('↺ Reset', () => { phase = 'Focus'; left = len(); done = 0; show(); }, 'sec')), ui.row(w, s, l)); show();
  }
});

T({
  id: 'stopwatch', name: 'Stopwatch & Laps', cat: 'prod', icon: '⏱️', desc: 'Millisecond-accurate stopwatch with lap times.',
  render(root, ctx) {
    let t0 = 0, acc = 0, run = false, raf, laps = []; const d = h('div', { class: 'big' }), ls = h('div'); const fmt = ms => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(Math.floor(ms % 1000 / 10)).padStart(2, '0')}`;
    const cur = () => acc + (run ? performance.now() - t0 : 0), loop = () => { d.textContent = fmt(cur()); raf = requestAnimationFrame(loop); };
    const btn = ui.btn('▶ Start', () => { if (run) { acc = cur(); run = false; cancelAnimationFrame(raf); d.textContent = fmt(acc); btn.textContent = '▶ Resume'; } else { t0 = performance.now(); run = true; loop(); btn.textContent = '⏸ Pause'; } });
    ctx.cleanup(() => cancelAnimationFrame(raf)); d.textContent = fmt(0);
    root.append(d, ui.row(btn, ui.btn('⚑ Lap', () => { if (!run) return; const t = cur(); laps.unshift([laps.length + 1, t, t - (laps[0]?.[1] || 0)]); ls.replaceChildren(h('table', {}, h('tr', {}, ['Lap', 'Split', 'Total'].map(x => h('th', {}, x))), laps.map(([n, tt, sp]) => h('tr', {}, h('td', {}, n), h('td', {}, fmt(sp)), h('td', {}, fmt(tt)))))); }, 'sec'), ui.btn('↺ Reset', () => { cancelAnimationFrame(raf); run = false; acc = 0; laps = []; ls.replaceChildren(); d.textContent = fmt(0); btn.textContent = '▶ Start'; }, 'sec')), ls);
  }
});

T({
  id: 'countdown-timer', name: 'Countdown Timer', cat: 'prod', icon: '⏳', desc: 'Set a timer in minutes/seconds or count down to a date with an alarm.',
  render(root, ctx) {
    const hh = ui.input('Hours', { type: 'number', value: 0, min: 0 }), m = ui.input('Minutes', { type: 'number', value: 5, min: 0 }), s = ui.input('Seconds', { type: 'number', value: 0, min: 0 }), d = h('div', { class: 'big' }, '05:00'); let end, iv;
    const stop = () => { clearInterval(iv); iv = null; };
    const start = secs => { stop(); end = Date.now() + secs * 1000; iv = setInterval(() => { const l = (end - Date.now()) / 1000; d.textContent = hms(l); document.title = hms(l); if (l <= 0) { stop(); d.textContent = '00:00'; beep(660, .3, 5); ui.toast('⏰ Time is up!'); } }, 200); };
    const tgt = ui.input('Or count down to a date/time', { type: 'datetime-local' }), days = h('div', { class: 'muted' });
    tgt.on(() => { stop(); const t = new Date(tgt.v) - Date.now(); if (t > 0) { iv = setInterval(() => { const x = Math.floor((new Date(tgt.v) - Date.now()) / 1000); days.textContent = x <= 0 ? 'Reached!' : `${Math.floor(x / 86400)}d ${Math.floor(x % 86400 / 3600)}h ${Math.floor(x % 3600 / 60)}m ${x % 60}s`; }, 500); } });
    ctx.cleanup(() => { stop(); document.title = 'Hundred Open Web Tools'; });
    root.append(d, ui.row(hh, m, s), ui.row([1, 5, 10, 15, 30].map(x => ui.btn(x + ' min', () => { hh.v = 0; m.v = x; s.v = 0; start(x * 60); }, 'sec sm'))), ui.row(ui.btn('▶ Start', () => start(hh.v * 3600 + m.v * 60 + s.v)), ui.btn('■ Stop', () => { stop(); document.title = 'Hundred Open Web Tools'; }, 'sec')), tgt, days);
  }
});

T({
  id: 'world-clock', name: 'World Clock & Time Zones', cat: 'prod', icon: '🌍', desc: 'Track the current time in any city/time zone — saved in your browser.',
  render(root, ctx) {
    const zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'], saved = ui.store.get('zones', [Intl.DateTimeFormat().resolvedOptions().timeZone, 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']), list = h('div');
    const sel = ui.select('Add a time zone', zones), draw = () => list.replaceChildren(h('table', {}, saved.map(z => { const t = h('td', { 'data-z': z, style: { fontSize: '22px', fontVariantNumeric: 'tabular-nums' } }); return h('tr', {}, h('td', {}, z.replace(/_/g, ' ')), t, h('td', { 'data-d': z, class: 'muted' }), h('td', {}, ui.btn('✕', () => { saved.splice(saved.indexOf(z), 1); ui.store.set('zones', saved); draw(); tick(); }, 'sm sec'))); })));
    const tick = () => list.querySelectorAll('[data-z]').forEach(e => { const z = e.dataset.z, n = new Date(); e.textContent = n.toLocaleTimeString([], { timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit' }); list.querySelector(`[data-d="${z}"]`).textContent = n.toLocaleDateString([], { timeZone: z, weekday: 'short', month: 'short', day: 'numeric' }); });
    const iv = setInterval(tick, 1000); ctx.cleanup(() => clearInterval(iv));
    root.append(ui.row(sel, ui.btn('Add', () => { if (!saved.includes(sel.v)) { saved.push(sel.v); ui.store.set('zones', saved); draw(); tick(); } })), list); draw(); tick();
  }
});

T({
  id: 'todo-list', name: 'To-Do List', cat: 'prod', icon: '✅', desc: 'Simple task list that remembers your items between visits.',
  render(root) {
    let items = ui.store.get('todos', []), filter = 'all'; const inp = ui.input('', { placeholder: 'Add a task and press Enter…' }), list = h('div'), cnt = h('span', { class: 'muted' });
    const save = () => { ui.store.set('todos', items); draw(); };
    function draw() {
      list.replaceChildren(...items.map((t, i) => ({ t, i })).filter(({ t }) => filter === 'all' || (filter === 'done') === t.d).map(({ t, i }) => h('div', { class: 'row c', style: { padding: '8px 0', borderBottom: '1px solid var(--bd)' } }, h('input', { type: 'checkbox', checked: t.d, style: { width: '18px' }, onchange: e => { t.d = e.target.checked; save(); } }), h('span', { style: { flex: 1, textDecoration: t.d ? 'line-through' : '', opacity: t.d ? .55 : 1 } }, t.x), ui.btn('✕', () => { items.splice(i, 1); save(); }, 'sm sec'))));
      cnt.textContent = `${items.filter(t => !t.d).length} open · ${items.filter(t => t.d).length} done`;
    }
    inp.c.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.v.trim()) { items.unshift({ x: inp.v.trim(), d: false }); inp.v = ''; save(); } });
    root.append(inp, ui.row(['all', 'open', 'done'].map(f => ui.btn(f, () => { filter = f === 'open' ? 'open' : f; draw(); }, 'sec sm')), ui.btn('Clear done', () => { items = items.filter(t => !t.d); save(); }, 'sec sm'), cnt), list); draw();
  }
});

T({
  id: 'notes-scratchpad', name: 'Notes Scratchpad', cat: 'prod', icon: '🗒️', desc: 'Multiple autosaved notes stored privately in your browser. Export anytime.',
  render(root) {
    let notes = ui.store.get('notes', [{ t: 'First note', b: '' }]), cur = 0; const sel = ui.select('Note', []), title = ui.input('Title'), body = ui.area('', { rows: 14, placeholder: 'Start typing… saved automatically' }), st = h('span', { class: 'muted' });
    const save = ui.debounce(() => { notes[cur] = { t: title.v, b: body.v }; ui.store.set('notes', notes); st.textContent = 'Saved'; drawSel(); }, 300), drawSel = () => { sel.c.replaceChildren(...notes.map((n, i) => h('option', { value: i }, n.t || 'Untitled'))); sel.v = cur; }, load = () => { title.v = notes[cur].t; body.v = notes[cur].b; };
    sel.on(() => { cur = +sel.v; load(); }); [title, body].forEach(c => c.on(() => { st.textContent = 'Saving…'; save(); }));
    root.append(sel, ui.row(ui.btn('+ New note', () => { notes.push({ t: 'New note', b: '' }); cur = notes.length - 1; ui.store.set('notes', notes); drawSel(); load(); }, 'sec'), ui.btn('Delete', () => { if (notes.length > 1 && confirm('Delete this note?')) { notes.splice(cur, 1); cur = 0; ui.store.set('notes', notes); drawSel(); load(); } }, 'sec'), ui.btn('Export all (.json)', () => ui.dl('notes.json', JSON.stringify(notes, null, 2), 'application/json'), 'sec'), ui.btn('Download this (.txt)', () => ui.dl((title.v || 'note') + '.txt', body.v), 'sec'), st), title, body); drawSel(); load();
  }
});

T({
  id: 'spin-wheel', name: 'Random Picker Wheel', cat: 'prod', icon: '🎡', desc: 'Spin a wheel to choose a winner, a dinner place or who goes first.',
  render(root) {
    const ta = ui.area('Options (one per line)', { rows: 6, value: 'Pizza\nSushi\nTacos\nBurgers\nSalad\nCurry' }), cv = h('canvas', { width: 420, height: 420, style: { display: 'block', margin: '0 auto' } }), res = h('div', { class: 'big', style: { fontSize: '32px' } }); let rot = 0, spinning = false;
    const draw = () => { const o = ta.v.split('\n').map(x => x.trim()).filter(Boolean), n = o.length || 1, x = cv.getContext('2d'); x.clearRect(0, 0, 420, 420); x.save(); x.translate(210, 210); x.rotate(rot); o.forEach((t, i) => { x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 200, i * 2 * Math.PI / n, (i + 1) * 2 * Math.PI / n); x.fillStyle = `hsl(${i * 360 / n},70%,58%)`; x.fill(); x.save(); x.rotate((i + .5) * 2 * Math.PI / n); x.fillStyle = '#fff'; x.font = 'bold 16px sans-serif'; x.textAlign = 'right'; x.shadowColor = '#0006'; x.shadowBlur = 3; x.fillText(t.slice(0, 18), 188, 5); x.restore(); }); x.restore(); x.fillStyle = getComputedStyle(document.body).getPropertyValue('--fg'); x.beginPath(); x.moveTo(400, 210); x.lineTo(428, 196); x.lineTo(428, 224); x.fill(); return o; };
    const spin = () => { if (spinning) return; const o = draw(); if (o.length < 2) return; spinning = true; res.textContent = ''; const start = rot, total = 2 * Math.PI * (5 + Math.random() * 3) + Math.random() * 2 * Math.PI, t0 = performance.now(), dur = 4500; const f = now => { const p = Math.min(1, (now - t0) / dur); rot = start + total * (1 - (1 - p) ** 4); draw(); if (p < 1) requestAnimationFrame(f); else { spinning = false; const a = ((-rot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); res.textContent = '🎉 ' + o[Math.floor(a / (2 * Math.PI) * o.length)]; beep(660, .15, 2); } }; requestAnimationFrame(f); };
    ta.on(draw); root.append(ta, cv, ui.btn('🎡 SPIN', spin), res); draw();
  }
});

T({
  id: 'typing-test', name: 'Typing Speed Test', cat: 'prod', icon: '⌨️', desc: 'Measure your words-per-minute and accuracy.',
  render(root) {
    const P = ['The quick brown fox jumps over the lazy dog while the sun sets slowly behind the distant hills.', 'Programming is the art of telling another human what one wants the computer to do, clearly and without ambiguity.', 'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.', 'A journey of a thousand miles begins with a single step, and a thousand lines of code begin with a single character.', 'Simplicity is prerequisite for reliability, and good design is as little design as possible in the end.'];
    let text, t0, done; const show = h('div', { style: { fontSize: '20px', lineHeight: 1.7, fontFamily: 'ui-monospace,monospace', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--bd)' } }), inp = ui.area('', { rows: 3, placeholder: 'Start typing here to begin…' }), st = ui.stats();
    const reset = () => { text = P[Math.floor(Math.random() * P.length)]; t0 = 0; done = false; inp.v = ''; st.set({ WPM: 0, Accuracy: '100%', Time: '0s' }); render(); inp.c.disabled = false; inp.c.focus(); };
    const render = () => { const v = inp.v; show.replaceChildren(...[...text].map((c, i) => h('span', { style: { color: i < v.length ? (v[i] === c ? 'var(--ok)' : 'var(--err)') : '', background: i === v.length ? 'color-mix(in srgb,var(--ac) 30%,transparent)' : '', textDecoration: i < v.length && v[i] !== c ? 'underline' : '' } }, c))); };
    inp.on(() => { if (done) return; if (!t0) t0 = Date.now(); render(); const v = inp.v, mins = (Date.now() - t0) / 60000, ok = [...v].filter((c, i) => c === text[i]).length; st.set({ WPM: Math.round(ok / 5 / Math.max(mins, 1 / 600)), Accuracy: (v.length ? Math.round(ok / v.length * 100) : 100) + '%', Time: Math.round(mins * 60) + 's' }); if (v.length >= text.length) { done = true; inp.c.disabled = true; ui.toast('Finished!'); } });
    root.append(show, inp, st, ui.btn('New text', reset, 'sec')); reset();
  }
});

T({
  id: 'invoice-generator', name: 'Invoice Generator', cat: 'prod', icon: '🧾', desc: 'Create a clean invoice and save it as PDF via your browser’s print dialog.',
  render(root) {
    const f = {}; [['from', 'From (your business)', 'Acme Studio\n1 Main St\nCity'], ['to', 'Bill to', 'Client Inc.\n2 Side Rd\nTown']].forEach(([k, l, v]) => f[k] = ui.area(l, { rows: 3, value: v }));
    const no = ui.input('Invoice #', { value: 'INV-001' }), dt = ui.input('Date', { type: 'date', value: new Date().toISOString().slice(0, 10) }), cur = ui.input('Currency', { value: 'USD' }), tax = ui.input('Tax %', { type: 'number', value: 0 }), notes = ui.area('Notes', { rows: 2, value: 'Thank you for your business!' });
    let rows = [{ d: 'Design work', q: 10, p: 80 }, { d: 'Hosting', q: 1, p: 120 }]; const tb = h('div'), prev = h('div', { class: 'card', style: { background: '#fff', color: '#111' } });
    const row = () => { tb.replaceChildren(...rows.map((r, i) => ui.row(...[['d', 'Description', 'text'], ['q', 'Qty', 'number'], ['p', 'Price', 'number']].map(([k, l, t]) => { const x = ui.input(i ? '' : l, { type: t, value: r[k] }); x.on(() => { r[k] = t === 'number' ? +x.v : x.v; draw(); }); return x; }), ui.btn('✕', () => { rows.splice(i, 1); row(); draw(); }, 'sec sm')))); };
    const draw = () => {
      const sub = rows.reduce((s, r) => s + r.q * r.p, 0), tx = sub * tax.v / 100, m = n => money(n, cur.v.toUpperCase() || 'USD'), pre = t => h('div', { style: { whiteSpace: 'pre-line' } }, t);
      prev.replaceChildren(h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('h2', { style: { margin: 0 } }, 'INVOICE'), h('div', { style: { textAlign: 'right' } }, h('b', {}, no.v), h('div', {}, dt.v))), h('div', { class: 'cols', style: { margin: '20px 0' } }, h('div', {}, h('b', {}, 'From'), pre(f.from.v)), h('div', {}, h('b', {}, 'Bill to'), pre(f.to.v))),
        h('table', {}, h('tr', {}, ['Description', 'Qty', 'Price', 'Amount'].map(x => h('th', {}, x))), rows.map(r => h('tr', {}, h('td', {}, r.d), h('td', {}, r.q), h('td', {}, m(r.p)), h('td', {}, m(r.q * r.p))))), h('div', { style: { textAlign: 'right', marginTop: '14px' } }, h('div', {}, 'Subtotal: ' + m(sub)), tax.v ? h('div', {}, `Tax (${tax.v}%): ${m(tx)}`) : null, h('h3', {}, 'Total: ' + m(sub + tx))), h('p', { style: { whiteSpace: 'pre-line', color: '#555' } }, notes.v));
    };
    [f.from, f.to, no, dt, cur, tax, notes].forEach(c => c.on(draw));
    root.append(h('div', { class: 'noprint' }, ui.cols(f.from, f.to), ui.row(no, dt, cur, tax), tb, ui.row(ui.btn('+ Add line', () => { rows.push({ d: '', q: 1, p: 0 }); row(); draw(); }, 'sec'), ui.btn('🖨 Print / Save as PDF', () => print())), notes), prev); row(); draw();
  }
});

T({
  id: 'breathing-guide', name: 'Breathing Exercise', cat: 'prod', icon: '🧘', desc: 'Guided box breathing and 4-7-8 patterns with an animated circle.',
  render(root, ctx) {
    const P = { 'Box (4-4-4-4)': [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]], '4-7-8 relax': [['Inhale', 4], ['Hold', 7], ['Exhale', 8]], 'Calm (5-5)': [['Inhale', 5], ['Exhale', 5]] }, sel = ui.select('Pattern', Object.keys(P)), circ = h('div', { style: { width: '200px', height: '200px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--ac),var(--ac2))', margin: '20px auto', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '22px', fontWeight: 700, transition: 'transform 1s linear' } }); let iv, i = 0, s = 0;
    const stop = () => { clearInterval(iv); iv = null; btn.textContent = '▶ Start'; circ.style.transform = 'scale(1)'; circ.textContent = ''; };
    const btn = ui.btn('▶ Start', () => { if (iv) return stop(); i = 0; s = 0; const step = () => { const ph = P[sel.v]; const [n, d] = ph[i % ph.length]; circ.textContent = `${n} ${d - s}`; circ.style.transition = `transform ${n === 'Hold' ? 0 : 1}s linear`; circ.style.transform = n === 'Inhale' ? `scale(${1 + (s + 1) / d * .5})` : n === 'Exhale' ? `scale(${1.5 - (s + 1) / d * .5})` : circ.style.transform; if (++s >= d) { s = 0; i++; } }; step(); iv = setInterval(step, 1000); });
    ctx.cleanup(() => clearInterval(iv)); root.append(sel, circ, btn);
  }
});

T({
  id: 'kanban-board', name: 'Kanban Board', cat: 'prod', icon: '🗂️', desc: 'Drag-and-drop To Do / Doing / Done board saved in your browser.',
  render(root) {
    let data = ui.store.get('kanban', { 'To Do': ['Plan project', 'Write docs'], Doing: ['Build tools'], Done: [] }), drag = null;
    const board = h('div', { class: 'cols' }), save = () => { ui.store.set('kanban', data); draw(); };
    function draw() {
      board.replaceChildren(...Object.entries(data).map(([col, cards]) => { const inp = h('input', { placeholder: '+ Add card', onkeydown: e => { if (e.key === 'Enter' && e.target.value.trim()) { cards.push(e.target.value.trim()); save(); } } });
        return h('div', { class: 'card', style: { background: 'var(--bg)', minHeight: '200px' }, ondragover: e => e.preventDefault(), ondrop: () => { if (drag) { data[drag[0]].splice(drag[1], 1); cards.push(drag[2]); drag = null; save(); } } }, h('b', {}, `${col} (${cards.length})`), cards.map((c, i) => h('div', { draggable: 'true', ondragstart: () => drag = [col, i, c], style: { background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: '8px', padding: '8px 10px', margin: '8px 0', cursor: 'grab', display: 'flex', justifyContent: 'space-between', gap: '8px' } }, h('span', {}, c), h('a', { href: '#', style: { textDecoration: 'none' }, onclick: e => { e.preventDefault(); cards.splice(i, 1); save(); } }, '✕'))), inp); }));
    }
    root.append(board); draw();
  }
});
