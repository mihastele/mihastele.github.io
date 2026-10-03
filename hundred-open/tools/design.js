/* Design & CSS tools */
const cvx = document.createElement('canvas').getContext('2d');
const toRgb = s => { cvx.fillStyle = '#010203'; cvx.fillStyle = s; const v = cvx.fillStyle; if (v === '#010203' && s.trim().toLowerCase() !== '#010203') return null; if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.substr(i, 2), 16)); return v.match(/[\d.]+/g).slice(0, 3).map(Number); };
const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const rgb2hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let hh = 0, s = 0; if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; } return [hh, s * 100, l * 100]; };
const hsl2rgb = ([hh, s, l]) => { hh = ((hh % 360) + 360) % 360; s /= 100; l /= 100; const k = n => (n + hh / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0) * 255, f(8) * 255, f(4) * 255]; };
const lum = ([r, g, b]) => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const cssBox = (css, label = 'CSS') => ui.out(label).set(css);

T({
  id: 'css-gradient', name: 'CSS Gradient Generator', cat: 'design', icon: '🌅', desc: 'Linear, radial and conic gradients with multiple color stops.',
  render(root) {
    let stops = [{ c: '#ff512f', p: 0 }, { c: '#dd2476', p: 100 }];
    const type = ui.select('Type', ['linear', 'radial', 'conic']), ang = ui.range('Angle', 0, 360, 135), prev = h('div', { style: { height: '200px', borderRadius: '12px' } }), list = h('div'), o = ui.out('CSS');
    const css = () => { const s = stops.slice().sort((a, b) => a.p - b.p).map(x => `${x.c} ${x.p}%`).join(', '); return type.v === 'linear' ? `linear-gradient(${ang.v}deg, ${s})` : type.v === 'radial' ? `radial-gradient(circle, ${s})` : `conic-gradient(from ${ang.v}deg, ${s})`; };
    const upd = () => { const g = css(); prev.style.background = g; o.set(`background: ${g};`); };
    const draw = () => { list.replaceChildren(...stops.map((s, i) => h('div', { class: 'row c', style: { margin: '6px 0' } }, h('input', { type: 'color', value: s.c, style: { width: '56px' }, oninput: e => { s.c = e.target.value; upd(); } }), h('input', { type: 'range', min: 0, max: 100, value: s.p, style: { flex: 1 }, oninput: e => { s.p = +e.target.value; upd(); } }), ui.btn('✕', () => { if (stops.length > 2) { stops.splice(i, 1); draw(); upd(); } }, 'sec sm')))); };
    [type, ang].forEach(c => c.on(upd));
    root.append(ui.row(type, ang), prev, list, ui.row(ui.btn('+ Add stop', () => { stops.push({ c: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), p: 50 }); draw(); upd(); }, 'sec'), ui.btn('🎲 Random', () => { stops = [0, 100].map(p => ({ c: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), p })); draw(); upd(); }, 'sec')), o);
    draw(); upd();
  }
});

T({
  id: 'box-shadow', name: 'Box Shadow Generator', cat: 'design', icon: '🌑', desc: 'Visually craft layered CSS box-shadows.',
  render(root) {
    const x = ui.range('Offset X', -50, 50, 0), y = ui.range('Offset Y', -50, 50, 10), b = ui.range('Blur', 0, 100, 30), s = ui.range('Spread', -30, 50, 0), c = ui.input('Color', { type: 'color', value: '#000000' }), a = ui.range('Opacity %', 0, 100, 25), inset = ui.check('Inset'), o = ui.out('CSS');
    const stage = h('div', { style: { background: '#e5e7eb', padding: '50px', borderRadius: '12px', display: 'grid', placeItems: 'center' } }), box = h('div', { style: { width: '160px', height: '110px', background: '#fff', borderRadius: '12px' } }); stage.append(box);
    live([x, y, b, s, c, a, inset], () => { const [r, g, bl] = toRgb(c.v), v = `${inset.v ? 'inset ' : ''}${x.v}px ${y.v}px ${b.v}px ${s.v}px rgba(${r}, ${g}, ${bl}, ${a.v / 100})`; box.style.boxShadow = v; o.set(`box-shadow: ${v};`); });
    root.append(ui.cols(x, y, b, s), ui.row(c, a, inset), stage, o);
  }
});

T({
  id: 'border-radius', name: 'Border Radius Generator', cat: 'design', icon: '⬜', desc: 'Round corners — even blob-like shapes — and copy the CSS.',
  render(root) {
    const tl = ui.range('Top left', 0, 100, 30), tr = ui.range('Top right', 0, 100, 70), br = ui.range('Bottom right', 0, 100, 30), bl = ui.range('Bottom left', 0, 100, 70), u = ui.select('Unit', ['%', 'px']), o = ui.out('CSS'), box = h('div', { style: { width: '220px', height: '220px', background: 'linear-gradient(135deg,var(--ac),var(--ac2))', margin: '0 auto' } });
    live([tl, tr, br, bl, u], () => { const v = [tl, tr, br, bl].map(r => r.v + u.v).join(' '); box.style.borderRadius = v; o.set(`border-radius: ${v};`); });
    root.append(ui.cols(tl, tr, br, bl), u, box, o);
  }
});

T({
  id: 'contrast-checker', name: 'Color Contrast Checker', cat: 'design', icon: '👁️', desc: 'WCAG 2.1 contrast ratio with AA/AAA pass-fail results.',
  render(root) {
    const fg = ui.input('Text color', { type: 'color', value: '#1f2937' }), bg = ui.input('Background', { type: 'color', value: '#fef3c7' }), prev = h('div', { style: { padding: '20px', borderRadius: '12px' } }, h('b', { style: { fontSize: '24px' } }, 'Large heading sample'), h('p', {}, 'Normal body text to check readability across the palette.')), st = ui.stats();
    live([fg, bg], () => {
      const a = lum(toRgb(fg.v)), b = lum(toRgb(bg.v)), r = (Math.max(a, b) + .05) / (Math.min(a, b) + .05), ok = t => r >= t ? '✅ Pass' : '❌ Fail';
      prev.style.color = fg.v; prev.style.background = bg.v; st.set({ 'Contrast ratio': r.toFixed(2) + ':1', 'AA normal (4.5)': ok(4.5), 'AA large (3)': ok(3), 'AAA normal (7)': ok(7), 'AAA large (4.5)': ok(4.5) });
    });
    root.append(ui.row(fg, bg, ui.btn('⇄ Swap', () => { [fg.v, bg.v] = [bg.v, fg.v]; fg.c.dispatchEvent(new Event('input')); }, 'sec')), prev, st);
  }
});

T({
  id: 'color-converter', name: 'Color Converter', cat: 'design', icon: '🎨', desc: 'HEX ⇄ RGB ⇄ HSL ⇄ CMYK — accepts any CSS color name too.',
  render(root) {
    const i = ui.input('Color (hex, rgb(), hsl(), name)', { value: '#4f46e5' }), pk = ui.input('Pick', { type: 'color', value: '#4f46e5' }), sw = h('div', { class: 'sw', style: { height: '80px' } }), o = ui.out('Formats');
    pk.on(() => { i.v = pk.v; i.c.dispatchEvent(new Event('input')); });
    live([i], () => {
      const rgb = toRgb(i.v); if (!rgb) return o.set('Unrecognized color'); const [hh, s, l] = rgb2hsl(rgb), [r, g, b] = rgb.map(v => v / 255), k = 1 - Math.max(r, g, b), cm = c => k === 1 ? 0 : Math.round((1 - c - k) / (1 - k) * 100), mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      sw.style.background = toHex(rgb); o.set(`HEX   ${toHex(rgb)}\nRGB   rgb(${rgb.join(', ')})\nHSL   hsl(${Math.round(hh)}, ${Math.round(s)}%, ${Math.round(l)}%)\nHSV   hsv(${Math.round(hh)}, ${Math.round(mx ? (mx - mn) / mx * 100 : 0)}%, ${Math.round(mx * 100)}%)\nCMYK  cmyk(${cm(r)}%, ${cm(g)}%, ${cm(b)}%, ${Math.round(k * 100)}%)\nDEC   ${(rgb[0] << 16) + (rgb[1] << 8) + rgb[2]}`);
    });
    root.append(ui.row(i, h('div', { style: { maxWidth: '90px' } }, pk)), sw, o);
  }
});

T({
  id: 'palette-generator', name: 'Color Palette Generator', cat: 'design', icon: '🖌️', desc: 'Harmonious palettes: complementary, analogous, triadic, tetradic and more.',
  render(root) {
    const base = ui.input('Base color', { type: 'color', value: '#4f46e5' }), sch = ui.select('Scheme', ['Analogous', 'Complementary', 'Triadic', 'Tetradic', 'Split complementary', 'Monochromatic']), row = h('div', { class: 'row' }), o = ui.out('CSS variables');
    const offs = { Analogous: [-60, -30, 0, 30, 60], Complementary: [0, 180], Triadic: [0, 120, 240], Tetradic: [0, 90, 180, 270], 'Split complementary': [0, 150, 210] };
    live([base, sch], () => {
      const [hh, s, l] = rgb2hsl(toRgb(base.v)); const cols = sch.v === 'Monochromatic' ? [15, 30, 45, 60, 75, 90].map(L => toHex(hsl2rgb([hh, s, L]))) : offs[sch.v].map(d => toHex(hsl2rgb([hh + d, s, l])));
      row.replaceChildren(...cols.map(c => h('div', { style: { flex: 1, minWidth: '90px', textAlign: 'center' } }, h('div', { class: 'sw', style: { background: c, height: '90px', cursor: 'pointer' }, onclick: () => ui.copy(c) }), h('code', {}, c)))); o.set(':root {\n' + cols.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}');
    });
    root.append(ui.row(base, sch, ui.btn('🎲 Random', () => { base.v = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'); base.c.dispatchEvent(new Event('input')); }, 'sec')), row, o);
  }
});

T({
  id: 'color-shades', name: 'Tints & Shades Generator', cat: 'design', icon: '🌗', desc: 'Build a Tailwind-style 50–950 scale from any color.',
  render(root) {
    const base = ui.input('Base color (500)', { type: 'color', value: '#3b82f6' }), row = h('div', { class: 'row' }), o = ui.out('CSS');
    live([base], () => {
      const [hh, s] = rgb2hsl(toRgb(base.v)), steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950], L = [97, 93, 85, 74, 62, null, 42, 33, 24, 16, 9], cols = steps.map((st, i) => st === 500 ? base.v : toHex(hsl2rgb([hh, s, L[i]])));
      row.replaceChildren(...cols.map((c, i) => h('div', { style: { flex: 1, minWidth: '70px', textAlign: 'center' } }, h('div', { class: 'sw', style: { background: c, cursor: 'pointer' }, onclick: () => ui.copy(c) }), h('small', {}, steps[i]), h('br'), h('code', { style: { fontSize: '11px' } }, c)))); o.set(':root {\n' + cols.map((c, i) => `  --brand-${steps[i]}: ${c};`).join('\n') + '\n}');
    });
    root.append(base, row, o);
  }
});

T({
  id: 'px-rem-clamp', name: 'PX ⇄ REM & Fluid Clamp()', cat: 'design', icon: '↕️', desc: 'Convert px to rem/em and generate fluid typography with clamp().',
  render(root) {
    const px = ui.input('Pixels', { type: 'number', value: 24 }), base = ui.input('Base font size (px)', { type: 'number', value: 16 }), rem = ui.input('rem / em', { type: 'number', value: 1.5, step: .125 });
    px.on(() => rem.v = num(px.v / base.v, 4)); rem.on(() => px.v = num(rem.v * base.v, 2)); base.on(() => rem.v = num(px.v / base.v, 4));
    const mn = ui.input('Min size (px)', { type: 'number', value: 16 }), mx = ui.input('Max size (px)', { type: 'number', value: 32 }), vmn = ui.input('Min viewport (px)', { type: 'number', value: 360 }), vmx = ui.input('Max viewport (px)', { type: 'number', value: 1280 }), o = ui.out('CSS'), t = h('p', { style: { margin: 0 } }, 'Fluid text preview — resize the window');
    live([mn, mx, vmn, vmx, base], () => { const sl = (mx.v - mn.v) / (vmx.v - vmn.v), ic = mn.v - sl * vmn.v, css = `clamp(${num(mn.v / base.v, 3)}rem, ${num(ic / base.v, 3)}rem + ${num(sl * 100, 3)}vw, ${num(mx.v / base.v, 3)}rem)`; o.set(`font-size: ${css};`); t.style.fontSize = css; });
    root.append(h('h3', {}, 'PX ⇄ REM'), ui.row(px, base, rem), h('h3', {}, 'Fluid typography'), ui.row(mn, mx), ui.row(vmn, vmx), t, o);
  }
});

T({
  id: 'svg-blob', name: 'SVG Blob Generator', cat: 'design', icon: '🫧', desc: 'Organic random blob shapes as ready-to-use SVG.',
  render(root) {
    const n = ui.range('Points', 3, 12, 6), r = ui.range('Randomness', 0, 90, 40), c1 = ui.input('Fill', { type: 'color', value: '#7c3aed' }), c2 = ui.input('Gradient end', { type: 'color', value: '#4f46e5' }), g = ui.check('Gradient', true), box = h('div', { style: { textAlign: 'center' } }), o = ui.out('SVG'); let seed = Math.random();
    const rand = i => { const x = Math.sin(seed * 9999 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
    const draw = () => {
      const N = n.v, pts = Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2, rad = 100 * (1 - r.v / 100 * rand(i) * .6); return [100 + Math.cos(a) * rad, 100 + Math.sin(a) * rad]; });
      let d = `M${pts[0].map(v => v.toFixed(1))}`; for (let i = 0; i < N; i++) { const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N]; d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; }
      const svg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${g.v ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1.v}"/><stop offset="1" stop-color="${c2.v}"/></linearGradient></defs>` : ''}<path d="${d}Z" fill="${g.v ? 'url(#g)' : c1.v}"/></svg>`;
      box.innerHTML = svg; box.firstChild.style.width = '280px'; o.set(svg);
    };
    live([n, r, c1, c2, g], draw);
    root.append(ui.row(n, r), ui.row(c1, c2, g), ui.btn('🎲 New shape', () => { seed = Math.random(); draw(); }), box, o, ui.btn('Download SVG', () => ui.dl('blob.svg', o.get(), 'image/svg+xml'), 'sec'));
  }
});

T({
  id: 'css-pattern', name: 'CSS Pattern Generator', cat: 'design', icon: '🔳', desc: 'Pure-CSS stripes, dots, checkerboards and grids — no images.',
  render(root) {
    const kind = ui.select('Pattern', ['Stripes', 'Dots', 'Checkerboard', 'Grid', 'Zigzag', 'Diagonal lines']), c1 = ui.input('Color 1', { type: 'color', value: '#4f46e5' }), c2 = ui.input('Color 2', { type: 'color', value: '#eef2ff' }), sz = ui.range('Size', 8, 100, 24), prev = h('div', { style: { height: '220px', borderRadius: '12px' } }), o = ui.out('CSS');
    live([kind, c1, c2, sz], () => {
      const a = c1.v, b = c2.v, s = sz.v; const P = {
        Stripes: [`repeating-linear-gradient(90deg, ${a} 0 ${s / 2}px, ${b} ${s / 2}px ${s}px)`], Dots: [`radial-gradient(${a} ${s / 5}px, ${b} ${s / 5}px)`, `${s}px ${s}px`],
        Checkerboard: [`conic-gradient(${a} 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0)`, `${s}px ${s}px`], Grid: [`linear-gradient(${a} 1px, transparent 1px), linear-gradient(90deg, ${a} 1px, ${b} 1px)`, `${s}px ${s}px`],
        Zigzag: [`linear-gradient(135deg, ${a} 25%, transparent 25%) -${s / 2}px 0, linear-gradient(225deg, ${a} 25%, transparent 25%) -${s / 2}px 0, linear-gradient(315deg, ${a} 25%, transparent 25%), linear-gradient(45deg, ${a} 25%, transparent 25%)`, `${s}px ${s}px`], 'Diagonal lines': [`repeating-linear-gradient(45deg, ${a} 0 2px, ${b} 2px ${s / 2}px)`]
      }[kind.v];
      prev.style.background = P[0]; prev.style.backgroundColor = b; prev.style.backgroundSize = P[1] || 'auto'; o.set(`background-color: ${b};\nbackground-image: ${P[0]};${P[1] ? `\nbackground-size: ${P[1]};` : ''}`);
    });
    root.append(ui.row(kind, c1, c2), sz, prev, o);
  }
});

T({
  id: 'glassmorphism', name: 'Glassmorphism Generator', cat: 'design', icon: '🪟', desc: 'Frosted-glass CSS (backdrop-filter) with live preview.',
  render(root) {
    const bl = ui.range('Blur px', 0, 40, 14), tr = ui.range('Transparency %', 0, 100, 25), sat = ui.range('Saturation %', 50, 250, 150), col = ui.input('Tint', { type: 'color', value: '#ffffff' }), rad = ui.range('Radius px', 0, 60, 20), o = ui.out('CSS');
    const stage = h('div', { style: { background: 'linear-gradient(135deg,#f093fb,#f5576c 40%,#4facfe)', padding: '50px 20px', borderRadius: '12px', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' } }, h('div', { style: { position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: '#fde047', top: '20px', left: '15%' } })), card = h('div', { style: { padding: '30px 40px', color: '#fff', textAlign: 'center', position: 'relative' } }, h('h3', { style: { margin: 0 } }, 'Glass card'), h('p', { style: { margin: '6px 0 0' } }, 'Frosted background')); stage.append(card);
    live([bl, tr, sat, col, rad], () => { const [r, g, b] = toRgb(col.v), css = `background: rgba(${r}, ${g}, ${b}, ${tr.v / 100});\nbackdrop-filter: blur(${bl.v}px) saturate(${sat.v}%);\n-webkit-backdrop-filter: blur(${bl.v}px) saturate(${sat.v}%);\nborder-radius: ${rad.v}px;\nborder: 1px solid rgba(255, 255, 255, 0.35);\nbox-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);`; card.style.cssText += ';' + css.replace(/\n/g, ''); card.style.color = '#fff'; o.set(css); });
    root.append(ui.cols(bl, tr, sat, rad), col, stage, o);
  }
});
