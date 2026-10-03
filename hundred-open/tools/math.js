/* Math, finance & calculators */
const money = (n, c = 'USD') => isFinite(n) ? n.toLocaleString(undefined, { style: 'currency', currency: c }) : '—';
const num = (n, d = 4) => isFinite(n) ? +n.toFixed(d) : '—';

function calc(src, deg) {
  const toks = src.replace(/\s+/g, '').toLowerCase().replace(/π/g, 'pi').replace(/×/g, '*').replace(/÷/g, '/').replace(/√/g, 'sqrt').match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[-+*/^%()!,]/g) || [];
  let p = 0; const peek = () => toks[p], next = () => toks[p++];
  const r = x => deg ? x * Math.PI / 180 : x, back = x => deg ? x * 180 / Math.PI : x;
  const fact = n => { if (n < 0 || n % 1) return NaN; let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const F = { sin: x => Math.sin(r(x)), cos: x => Math.cos(r(x)), tan: x => Math.tan(r(x)), asin: x => back(Math.asin(x)), acos: x => back(Math.acos(x)), atan: x => back(Math.atan(x)), ln: Math.log, log: Math.log10, log2: Math.log2, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, floor: Math.floor, ceil: Math.ceil, round: Math.round, fact };
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), x = term(); v = o === '+' ? v + x : v - x; } return v; };
  const term = () => { let v = unary(); while (['*', '/', '%'].includes(peek())) { const o = next(), x = unary(); v = o === '*' ? v * x : o === '/' ? v / x : v % x; } return v; };
  const unary = () => peek() === '-' ? (next(), -unary()) : peek() === '+' ? (next(), unary()) : pow();
  const pow = () => { const b = post(); return peek() === '^' ? (next(), b ** unary()) : b; };
  const post = () => { let v = atom(); while (peek() === '!') { next(); v = fact(v); } return v; };
  const atom = () => {
    const t = next(); if (t === undefined) throw Error('Unexpected end');
    if (/^[\d.]/.test(t)) return parseFloat(t); if (t === '(') { const v = expr(); if (next() !== ')') throw Error('Missing )'); return v; }
    if (t === 'pi') return Math.PI; if (t === 'e') return Math.E;
    if (F[t]) { if (next() !== '(') throw Error('Expected ( after ' + t); const v = expr(); if (next() !== ')') throw Error('Missing )'); return F[t](v); }
    throw Error('Unexpected “' + t + '”');
  };
  const v = expr(); if (p < toks.length) throw Error('Unexpected “' + toks[p] + '”'); return v;
}
T({
  id: 'scientific-calculator', name: 'Scientific Calculator', cat: 'math', icon: '🧮', desc: 'Type or tap expressions: trig, logs, powers, factorials, constants.',
  render(root) {
    const inp = ui.input('Expression', { value: '2*(3+4)^2 / sqrt(16)', autofocus: true }), res = h('div', { class: 'big', style: { fontSize: '40px' } }), deg = ui.check('Degrees', true), hist = h('div', { class: 'muted' }); let H = [];
    const run = () => { try { const v = calc(inp.v, deg.v); res.textContent = num(v, 10); res.className = 'big'; return v; } catch (e) { res.textContent = e.message; res.className = 'big err'; res.style.fontSize = '20px'; } };
    inp.on(run); deg.on(run); run();
    const eq = () => { const v = run(); if (v !== undefined) { H.unshift(inp.v + ' = ' + num(v, 10)); hist.replaceChildren(...H.slice(0, 8).map(x => h('div', {}, x))); inp.v = num(v, 10); } };
    inp.c.addEventListener('keydown', e => e.key === 'Enter' && eq());
    const keys = ['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt(', '(', ')', '^', '!', 'pi', 'e', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+'];
    root.append(inp, res, h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', maxWidth: '420px' } }, keys.map(k => ui.btn(k, () => { inp.v += k; run(); }, 'sec')), ui.btn('C', () => { inp.v = ''; res.textContent = ''; }, 'danger'), ui.btn('⌫', () => { inp.v = inp.v.slice(0, -1); run(); }, 'sec'), ui.btn('=', eq)), deg, hist);
  }
});

T({
  id: 'unit-converter', name: 'Unit Converter', cat: 'math', icon: '📏', desc: 'Length, mass, volume, temperature, speed, data, energy and more.',
  render(root) {
    const U = {
      Length: { mm: .001, cm: .01, m: 1, km: 1000, inch: .0254, foot: .3048, yard: .9144, mile: 1609.344, 'nautical mile': 1852 }, Mass: { mg: 1e-6, g: .001, kg: 1, tonne: 1000, ounce: .028349523, pound: .45359237, stone: 6.35029318 },
      Volume: { ml: .001, litre: 1, 'm³': 1000, teaspoon: .00492892, tablespoon: .0147868, 'fl oz': .0295735, cup: .236588, pint: .473176, quart: .946353, gallon: 3.78541 }, Area: { 'mm²': 1e-6, 'cm²': 1e-4, 'm²': 1, hectare: 1e4, 'km²': 1e6, 'in²': 6.4516e-4, 'ft²': .092903, acre: 4046.8564, 'mi²': 2589988.11 },
      Speed: { 'm/s': 1, 'km/h': .277778, mph: .44704, knot: .514444, 'ft/s': .3048 }, Time: { ms: .001, second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, year: 31557600 },
      Data: { bit: .125, byte: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 }, Energy: { joule: 1, kJ: 1e3, calorie: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, BTU: 1055.06 },
      Pressure: { Pa: 1, kPa: 1e3, bar: 1e5, psi: 6894.757, atm: 101325, mmHg: 133.322 }, Power: { W: 1, kW: 1e3, hp: 745.7 }, Temperature: { '°C': 0, '°F': 0, K: 0 }
    };
    const cat = ui.select('Category', Object.keys(U)), v = ui.input('Value', { type: 'number', value: 1 }), from = ui.select('From', []), to = ui.select('To', []), o = ui.stats(), all = h('div');
    const T0 = { '°C': [x => x, x => x], '°F': [x => (x - 32) * 5 / 9, x => x * 9 / 5 + 32], K: [x => x - 273.15, x => x + 273.15] };
    const conv = (x, a, b) => cat.v === 'Temperature' ? T0[b][1](T0[a][0](x)) : x * U[cat.v][a] / U[cat.v][b];
    const fill = () => { const ks = Object.keys(U[cat.v]); [from, to].forEach(s => s.c.replaceChildren(...ks.map(k => h('option', {}, k)))); to.v = ks[Math.min(2, ks.length - 1)]; update(); };
    const update = () => { const r = conv(v.v, from.v, to.v); o.set({ Result: `${num(r, 8)} ${to.v}` }); all.replaceChildren(h('table', {}, Object.keys(U[cat.v]).map(k => h('tr', {}, h('td', {}, k), h('td', {}, num(conv(v.v, from.v, k), 8)))))); };
    cat.on(fill); [v, from, to].forEach(c => c.on(update)); fill();
    root.append(cat, ui.row(v, from, to), o, all);
  }
});

T({
  id: 'percentage-calculator', name: 'Percentage Calculator', cat: 'math', icon: '％', desc: 'Percent of, percent change, and “what percent is X of Y”.',
  render(root) {
    const mk = (title, fields, fn) => { const ins = fields.map(([l, v]) => ui.input(l, { type: 'number', value: v })), o = h('b', { style: { fontSize: '20px' } }); const upd = () => o.textContent = fn(...ins.map(i => i.v)); ins.forEach(i => i.on(upd)); upd(); return h('div', { class: 'card' }, h('h3', { style: { marginTop: 0 } }, title), ui.row(ins), o); };
    root.append(mk('What is X% of Y?', [['X %', 15], ['Y', 200]], (x, y) => num(x / 100 * y)), mk('X is what % of Y?', [['X', 30], ['Y', 120]], (x, y) => num(x / y * 100) + '%'), mk('Percent change from X to Y', [['From', 80], ['To', 100]], (x, y) => (y >= x ? '+' : '') + num((y - x) / Math.abs(x) * 100) + '%'), mk('Add / subtract a percent', [['Value', 100], ['Percent (±)', -20]], (x, p) => num(x * (1 + p / 100))), mk('Original price before discount', [['Final price', 80], ['Discount %', 20]], (f, d) => num(f / (1 - d / 100))));
  }
});

T({
  id: 'bmi-calculator', name: 'BMI Calculator', cat: 'math', icon: '⚖️', desc: 'Body mass index with healthy weight range (metric or imperial).',
  render(root) {
    const sys = ui.select('Units', [['m', 'Metric (kg, cm)'], ['i', 'Imperial (lb, in)']]), w = ui.input('Weight', { type: 'number', value: 70 }), hh = ui.input('Height', { type: 'number', value: 175 }), st = ui.stats(), note = h('p', { class: 'muted' });
    live([sys, w, hh], () => {
      const kg = sys.v === 'm' ? w.v : w.v * .45359237, m = sys.v === 'm' ? hh.v / 100 : hh.v * .0254, b = kg / m ** 2, cat = b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese', lo = 18.5 * m ** 2, hi = 24.9 * m ** 2, k = sys.v === 'm' ? [1, 'kg'] : [2.20462, 'lb'];
      st.set({ BMI: num(b, 1), Category: cat, 'Healthy range': `${num(lo * k[0], 1)}–${num(hi * k[0], 1)} ${k[1]}` }); note.textContent = 'BMI is a rough screening tool and not a medical diagnosis.';
    });
    root.append(ui.row(sys, w, hh), st, note);
  }
});

T({
  id: 'loan-calculator', name: 'Loan & Mortgage Calculator', cat: 'math', icon: '🏠', desc: 'Monthly payment, total interest and full amortization schedule.',
  render(root) {
    const a = ui.input('Loan amount', { type: 'number', value: 250000 }), r = ui.input('Annual interest %', { type: 'number', value: 6.5, step: .1 }), y = ui.input('Term (years)', { type: 'number', value: 30 }), st = ui.stats(), tb = h('div', { style: { maxHeight: '360px', overflow: 'auto' } });
    live([a, r, y], () => {
      const n = Math.round(y.v * 12), i = r.v / 1200, pay = i ? a.v * i / (1 - (1 + i) ** -n) : a.v / n; let bal = a.v, rows = [];
      for (let k = 1; k <= n; k++) { const int = bal * i, pr = pay - int; bal = Math.max(0, bal - pr); rows.push([k, pay, pr, int, bal]); }
      st.set({ 'Monthly payment': money(pay), 'Total paid': money(pay * n), 'Total interest': money(pay * n - a.v) });
      tb.replaceChildren(h('table', {}, h('tr', {}, ['#', 'Payment', 'Principal', 'Interest', 'Balance'].map(x => h('th', {}, x))), rows.slice(0, 600).map(x => h('tr', {}, x.map((c, j) => h('td', {}, j ? money(c) : c))))));
    });
    root.append(ui.row(a, r, y), st, tb);
  }
});

T({
  id: 'compound-interest', name: 'Compound Interest Calculator', cat: 'math', icon: '📈', desc: 'See how savings grow with regular contributions.',
  render(root) {
    const p = ui.input('Initial deposit', { type: 'number', value: 5000 }), c = ui.input('Monthly contribution', { type: 'number', value: 200 }), r = ui.input('Annual return %', { type: 'number', value: 7, step: .1 }), y = ui.input('Years', { type: 'number', value: 20 }), f = ui.select('Compounding', [['12', 'Monthly'], ['365', 'Daily'], ['4', 'Quarterly'], ['1', 'Yearly']]), st = ui.stats(), cv = h('canvas', { width: 800, height: 260 }), tb = h('div');
    live([p, c, r, y, f], () => {
      let bal = p.v, contrib = p.v; const pts = [[0, bal]], rows = [], nf = +f.v, m = (1 + r.v / 100 / nf) ** (nf / 12) - 1;
      for (let k = 1; k <= y.v * 12; k++) { bal = bal * (1 + m) + c.v; contrib += c.v; if (k % 12 === 0) { pts.push([k / 12, bal]); rows.push([k / 12, contrib, bal - contrib, bal]); } }
      st.set({ 'Final balance': money(bal), 'Total contributed': money(contrib), 'Interest earned': money(bal - contrib) });
      const x = cv.getContext('2d'), mx = Math.max(...pts.map(q => q[1]), 1); x.clearRect(0, 0, 800, 260); x.strokeStyle = getComputedStyle(document.body).getPropertyValue('--ac'); x.lineWidth = 3; x.beginPath();
      pts.forEach(([a, b], i) => { const px = 40 + a / Math.max(1, y.v) * 740, py = 240 - b / mx * 220; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); x.fillStyle = getComputedStyle(document.body).getPropertyValue('--mut'); x.font = '12px sans-serif'; x.fillText(money(mx), 4, 14); x.fillText('Year ' + y.v, 740, 256);
      tb.replaceChildren(h('table', {}, h('tr', {}, ['Year', 'Contributed', 'Interest', 'Balance'].map(q => h('th', {}, q))), rows.map(q => h('tr', {}, q.map((v, j) => h('td', {}, j ? money(v) : v))))));
    });
    root.append(ui.row(p, c, r, y, f), st, cv, tb);
  }
});

T({
  id: 'tip-calculator', name: 'Tip & Bill Splitter', cat: 'math', icon: '🍽️', desc: 'Split a bill between friends with tip and optional rounding.',
  render(root) {
    const b = ui.input('Bill amount', { type: 'number', value: 86.5 }), t = ui.range('Tip %', 0, 40, 18), n = ui.input('People', { type: 'number', value: 3, min: 1 }), rd = ui.check('Round each share up'), st = ui.stats();
    live([b, t, n, rd], () => { const tip = b.v * t.v / 100, tot = b.v + tip; let each = tot / Math.max(1, n.v); if (rd.v) each = Math.ceil(each); st.set({ Tip: money(tip), Total: money(tot), 'Each pays': money(each), 'Tip each': money(tip / Math.max(1, n.v)) }); });
    root.append(b, t, n, rd, st);
  }
});

T({
  id: 'age-calculator', name: 'Age Calculator', cat: 'math', icon: '🎂', desc: 'Exact age in years, months, days — plus next birthday countdown.',
  render(root) {
    const d = ui.input('Date of birth', { type: 'date', value: '1990-06-15' }), at = ui.input('Age at date', { type: 'date', value: new Date().toISOString().slice(0, 10) }), st = ui.stats();
    live([d, at], () => {
      const a = new Date(d.v), b = new Date(at.v); if (isNaN(a) || isNaN(b)) return; let y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), dd = b.getDate() - a.getDate();
      if (dd < 0) { m--; dd += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); } if (m < 0) { y--; m += 12; }
      let nb = new Date(b.getFullYear(), a.getMonth(), a.getDate()); if (nb < b) nb.setFullYear(b.getFullYear() + 1); const days = Math.floor((b - a) / 864e5);
      st.set({ Age: `${y}y ${m}m ${dd}d`, 'Total days': days.toLocaleString(), 'Total weeks': Math.floor(days / 7).toLocaleString(), 'Total hours': (days * 24).toLocaleString(), 'Next birthday in': Math.ceil((nb - b) / 864e5) + ' days', 'Born on a': a.toLocaleDateString(undefined, { weekday: 'long', timeZone: 'UTC' }) });
    });
    root.append(ui.row(d, at), st);
  }
});

T({
  id: 'date-calculator', name: 'Date Difference & Add Days', cat: 'math', icon: '📅', desc: 'Days between dates, business days, or add/subtract days from a date.',
  render(root) {
    const t = new Date().toISOString().slice(0, 10), a = ui.input('From', { type: 'date', value: t }), b = ui.input('To', { type: 'date', value: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10) }), st = ui.stats();
    const s = ui.input('Start date', { type: 'date', value: t }), n = ui.input('Days to add (negative to subtract)', { type: 'number', value: 30 }), r = h('b', { style: { fontSize: '20px' } });
    live([a, b], () => { let x = new Date(a.v), y = new Date(b.v); if (isNaN(x) || isNaN(y)) return; const neg = x > y; if (neg) [x, y] = [y, x]; const days = Math.round((y - x) / 864e5); let bd = 0; for (let k = 0, c = new Date(x); k < days; k++, c.setDate(c.getDate() + 1)) if (c.getDay() % 6) bd++; let mo = (y.getFullYear() - x.getFullYear()) * 12 + y.getMonth() - x.getMonth(); if (y.getDate() < x.getDate()) mo--; st.set({ Days: (neg ? '-' : '') + days, Weeks: num(days / 7, 1), 'Business days': bd, 'Months (approx)': mo, Years: num(days / 365.25, 2) }); });
    live([s, n], () => { const d = new Date(s.v); d.setDate(d.getDate() + (n.v | 0)); r.textContent = isNaN(d) ? '' : d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); });
    root.append(h('h3', {}, 'Difference'), ui.row(a, b), st, h('h3', {}, 'Add / subtract days'), ui.row(s, n), r);
  }
});

T({
  id: 'aspect-ratio', name: 'Aspect Ratio Calculator', cat: 'math', icon: '🖼', desc: 'Simplify ratios and scale dimensions while keeping proportions.',
  render(root) {
    const w = ui.input('Width', { type: 'number', value: 1920 }), hh = ui.input('Height', { type: 'number', value: 1080 }), nw = ui.input('New width', { type: 'number', value: 1280 }), nh = ui.input('New height', { type: 'number', value: 720 }), st = ui.stats();
    const g = (a, b) => b ? g(b, a % b) : a;
    const upd = () => { const d = g(w.v, hh.v) || 1; st.set({ Ratio: `${w.v / d}:${hh.v / d}`, Decimal: num(w.v / hh.v, 4), Megapixels: num(w.v * hh.v / 1e6, 2) }); };
    live([w, hh], upd); nw.on(() => { nh.v = Math.round(nw.v * hh.v / w.v); }); nh.on(() => { nw.v = Math.round(nh.v * w.v / hh.v); }); nw.c.dispatchEvent(new Event('input'));
    root.append(ui.row(w, hh), st, h('h3', {}, 'Scale to…'), ui.row(nw, nh), h('p', { class: 'muted' }, 'Common: 16:9 (1920×1080), 4:3 (1024×768), 1:1 (1080×1080), 9:16 (1080×1920), 21:9 (2560×1080).'));
  }
});

T({
  id: 'prime-gcd-lcm', name: 'Prime Factors, GCD & LCM', cat: 'math', icon: '🔢', desc: 'Factorize numbers, test primality, find GCD and LCM of a list.',
  render(root) {
    const n = ui.input('Number', { type: 'number', value: 360 }), st = ui.stats(), list = ui.input('Numbers (comma separated)', { value: '12, 18, 30' }), st2 = ui.stats();
    live([n], () => { let x = Math.floor(n.v); if (x < 2 || x > 2 ** 53) return st.set({ Result: 'Enter an integer ≥ 2' }); const f = {}; let y = x; for (let p = 2; p * p <= y; p += p === 2 ? 1 : 2) while (y % p === 0) { f[p] = (f[p] || 0) + 1; y /= p; } if (y > 1) f[y] = (f[y] || 0) + 1; const divs = Object.values(f).reduce((a, e) => a * (e + 1), 1); st.set({ Prime: Object.keys(f).length === 1 && Object.values(f)[0] === 1 ? 'Yes ✔' : 'No', Factors: Object.entries(f).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × '), 'Number of divisors': divs }); });
    const g = (a, b) => b ? g(b, a % b) : a;
    live([list], () => { const a = list.v.split(/[,\s]+/).map(Number).filter(Number.isInteger); if (a.length < 2) return st2.set({ Result: 'Enter 2+ integers' }); st2.set({ GCD: a.reduce(g), LCM: a.reduce((x, y) => x / g(x, y) * y) }); });
    root.append(n, st, h('h3', {}, 'GCD / LCM'), list, st2);
  }
});

T({
  id: 'random-dice', name: 'Random Number, Dice & Coin', cat: 'math', icon: '🎲', desc: 'Cryptographically fair random numbers, dice rolls and coin flips.',
  render(root) {
    const lo = ui.input('Min', { type: 'number', value: 1 }), hi = ui.input('Max', { type: 'number', value: 100 }), n = ui.input('Count', { type: 'number', value: 1, min: 1, max: 1000 }), uq = ui.check('Unique'), o = ui.out('Numbers', { pre: { fontSize: '20px' } }), dice = ui.out('Dice / coin', { pre: { fontSize: '20px' } });
    const roll = () => { const a = lo.v | 0, b = hi.v | 0, c = Math.min(n.v | 0, 1000), set = []; if (b < a || (uq.v && c > b - a + 1)) return o.set('Invalid range'); while (set.length < c) { const x = a + rnd(b - a + 1); if (!uq.v || !set.includes(x)) set.push(x); } o.set(set.join(', ')); };
    const dn = ui.select('Dice', ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'], 'd6'), dc = ui.input('How many', { type: 'number', value: 2, min: 1, max: 50 });
    root.append(ui.row(lo, hi, n, uq), ui.btn('Generate', roll), o, h('h3', {}, 'Dice'), ui.row(dn, dc, ui.btn('Roll 🎲', () => { const r = Array.from({ length: dc.v | 0 }, () => 1 + rnd(+dn.v.slice(1))); dice.set(`${r.join(' + ')} = ${r.reduce((a, b) => a + b, 0)}`); }), ui.btn('Flip coin 🪙', () => dice.set(rnd(2) ? 'Heads' : 'Tails'), 'sec')), dice);
    roll();
  }
});

T({
  id: 'statistics-calculator', name: 'Statistics Calculator', cat: 'math', icon: '📊', desc: 'Mean, median, mode, standard deviation, quartiles for a data set.',
  render(root) {
    const d = ui.area('Numbers (separated by commas, spaces or new lines)', { rows: 5, value: '4, 8, 15, 16, 23, 42, 8' }), st = ui.stats();
    live([d], () => {
      const a = (d.v.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).sort((x, y) => x - y), n = a.length; if (!n) return st.set({ Result: 'No numbers' });
      const sum = a.reduce((x, y) => x + y, 0), mean = sum / n, q = p => { const i = (n - 1) * p, f = Math.floor(i); return a[f] + (a[Math.min(f + 1, n - 1)] - a[f]) * (i - f); }, vr = a.reduce((s, x) => s + (x - mean) ** 2, 0), cnt = {}; a.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const mc = Math.max(...Object.values(cnt));
      st.set({ Count: n, Sum: num(sum), Mean: num(mean), Median: num(q(.5)), Mode: mc > 1 ? Object.keys(cnt).filter(k => cnt[k] === mc).join(', ') : 'none', Min: a[0], Max: a[n - 1], Range: num(a[n - 1] - a[0]), 'Std dev (pop.)': num(Math.sqrt(vr / n)), 'Std dev (sample)': n > 1 ? num(Math.sqrt(vr / (n - 1))) : '—', 'Variance (pop.)': num(vr / n), Q1: num(q(.25)), Q3: num(q(.75)) });
    });
    root.append(d, st);
  }
});
