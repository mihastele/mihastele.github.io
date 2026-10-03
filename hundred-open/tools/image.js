/* Image tools — all processing uses the Canvas API locally. */
const MIME = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
const cvOf = (img, w = img.naturalWidth || img.width, hh = img.naturalHeight || img.height) => {
  const c = h('canvas', { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(hh)) });
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c;
};
const encode = (c, fmt, q = 0.92) => {
  if (fmt !== 'jpeg') return ui.blob(c, MIME[fmt], q);
  const f = h('canvas', { width: c.width, height: c.height }), x = f.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(c, 0, 0);
  return ui.blob(f, MIME.jpeg, q);
};
const imgPicker = (cb, multi = false) => ui.file('Drop image' + (multi ? 's' : '') + ' here or click to choose', 'image/*', async (f, all) => {
  try { multi ? cb(all) : cb(await ui.img(f), f); } catch (e) { ui.toast(e.message); }
}, multi);
const baseName = f => f.name.replace(/\.[^.]+$/, '');

T({
  id: 'image-cropper', name: 'Image Cropper', cat: 'image', icon: '✂️', desc: 'Drag to select an area, lock an aspect ratio, export PNG/JPG/WebP.',
  render(root) {
    let img, sel, sc = 1, start, name = 'image';
    const cv = h('canvas', { style: { cursor: 'crosshair', touchAction: 'none' } });
    const ratio = ui.select('Aspect ratio', [['0', 'Free'], ['1', '1:1'], ['1.7778', '16:9'], ['1.3333', '4:3'], ['1.5', '3:2'], ['0.75', '3:4'], ['0.5625', '9:16']]);
    const fmt = ui.select('Format', ['png', 'jpeg', 'webp']);
    const info = h('div', { class: 'muted' }), res = h('div');
    const work = h('div', { hidden: true }, ui.row(ratio, fmt), h('div', { class: 'stage' }, cv), info, ui.row(ui.btn('Crop', crop), ui.btn('Reset selection', () => { sel = null; draw(); }, 'sec')), res);
    function draw() {
      const c = cv.getContext('2d'); c.drawImage(img, 0, 0, cv.width, cv.height);
      if (sel && sel.w > 1) {
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, 0, cv.width, cv.height);
        c.drawImage(img, sel.x * sc, sel.y * sc, sel.w * sc, sel.h * sc, sel.x, sel.y, sel.w, sel.h);
        c.strokeStyle = '#fff'; c.setLineDash([6, 4]); c.lineWidth = 2; c.strokeRect(sel.x, sel.y, sel.w, sel.h);
        info.textContent = `Selection: ${Math.round(sel.w * sc)} × ${Math.round(sel.h * sc)} px at (${Math.round(sel.x * sc)}, ${Math.round(sel.y * sc)})`;
      } else info.textContent = `Image ${img.naturalWidth} × ${img.naturalHeight}px — drag on the image to select an area.`;
    }
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: Math.min(cv.width, Math.max(0, (e.clientX - r.left) * cv.width / r.width)), y: Math.min(cv.height, Math.max(0, (e.clientY - r.top) * cv.height / r.height)) }; };
    cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); start = pos(e); sel = null; };
    cv.onpointermove = e => {
      if (!start) return; const p = pos(e), r = +ratio.v;
      let dw = p.x - start.x, dh = p.y - start.y;
      if (r) { dh = (dh < 0 ? -1 : 1) * Math.abs(dw) / r; const lim = dh < 0 ? start.y : cv.height - start.y; if (Math.abs(dh) > lim) { dh = Math.sign(dh) * lim; dw = Math.sign(dw || 1) * Math.abs(dh) * r; } }
      sel = { x: Math.min(start.x, start.x + dw), y: Math.min(start.y, start.y + dh), w: Math.abs(dw), h: Math.abs(dh) }; draw();
    };
    cv.onpointerup = () => start = null;
    async function crop() {
      if (!sel || sel.w < 2) return ui.toast('Select an area first');
      const c = h('canvas', { width: Math.round(sel.w * sc), height: Math.round(sel.h * sc) });
      c.getContext('2d').drawImage(img, sel.x * sc, sel.y * sc, sel.w * sc, sel.h * sc, 0, 0, c.width, c.height);
      const b = await encode(c, fmt.v); res.replaceChildren(h('div', { class: 'stage' }, c), h('p', { class: 'muted' }, `${c.width}×${c.height} · ${ui.bytes(b.size)}`), ui.btn('Download', () => ui.dl(`${name}-cropped.${fmt.v === 'jpeg' ? 'jpg' : fmt.v}`, b)));
    }
    root.append(imgPicker((i, f) => { img = i; name = baseName(f); cv.width = Math.min(860, i.naturalWidth); cv.height = Math.round(i.naturalHeight * cv.width / i.naturalWidth); sc = i.naturalWidth / cv.width; sel = null; res.replaceChildren(); work.hidden = false; draw(); }), work);
  }
});

T({
  id: 'image-compressor', name: 'Image Compressor', cat: 'image', icon: '🗜️', desc: 'Shrink JPG/PNG/WebP images by re-encoding. Batch support, ZIP download.',
  render(root) {
    let files = [];
    const q = ui.range('Quality', 10, 100, 75), fmt = ui.select('Output format', ['jpeg', 'webp']), mx = ui.input('Max dimension (px, 0 = keep)', { type: 'number', value: 0, min: 0 });
    const list = h('div'); let results = [];
    const run = async () => {
      list.replaceChildren(); results = [];
      for (const f of files) {
        try {
          const i = await ui.img(f), m = +mx.v, k = m && Math.max(i.naturalWidth, i.naturalHeight) > m ? m / Math.max(i.naturalWidth, i.naturalHeight) : 1;
          const b = await encode(cvOf(i, i.naturalWidth * k, i.naturalHeight * k), fmt.v, q.v / 100), ext = fmt.v === 'jpeg' ? 'jpg' : 'webp', nm = baseName(f) + '-min.' + ext;
          results.push({ name: nm, data: b });
          list.append(h('div', { class: 'row c', style: { padding: '8px 0', borderBottom: '1px solid var(--bd)' } }, h('img', { src: URL.createObjectURL(b), style: { height: '48px', borderRadius: '6px' } }),
            h('div', { style: { flex: 1 } }, h('b', {}, f.name), h('div', { class: 'muted' }, `${ui.bytes(f.size)} → ${ui.bytes(b.size)} (${b.size < f.size ? '-' : '+'}${Math.abs(Math.round((1 - b.size / f.size) * 100))}%)`)),
            ui.btn('Download', () => ui.dl(nm, b), 'sm')));
        } catch (e) { list.append(h('p', { class: 'err' }, f.name + ': ' + e.message)); }
      }
    };
    const rerun = ui.debounce(() => files.length && run(), 300);
    [q, fmt, mx].forEach(c => c.on(rerun));
    root.append(imgPicker(fs => { files = fs; run(); }, true), ui.row(q, fmt, mx), list, ui.btn('Download all as ZIP', async () => results.length ? ui.dl('compressed-images.zip', await ui.zip(results)) : ui.toast('Nothing yet'), 'sec'));
  }
});

T({
  id: 'image-resizer', name: 'Image Resizer', cat: 'image', icon: '📐', desc: 'Resize by pixels or percentage with aspect-ratio lock and quality control.',
  render(root) {
    let img, name; const w = ui.input('Width', { type: 'number', min: 1 }), hh = ui.input('Height', { type: 'number', min: 1 }), pct = ui.range('Scale %', 1, 300, 100), lock = ui.check('Lock aspect ratio', true), fmt = ui.select('Format', ['png', 'jpeg', 'webp']), q = ui.range('Quality', 10, 100, 92);
    const out = h('div'), info = h('p', { class: 'muted' });
    w.on(() => { if (lock.v && img) hh.v = Math.round(w.v * img.naturalHeight / img.naturalWidth); });
    hh.on(() => { if (lock.v && img) w.v = Math.round(hh.v * img.naturalWidth / img.naturalHeight); });
    pct.on(() => { if (img) { w.v = Math.round(img.naturalWidth * pct.v / 100); hh.v = Math.round(img.naturalHeight * pct.v / 100); } });
    const work = h('div', { hidden: true }, info, ui.row(w, hh), pct, ui.row(fmt, q, lock), ui.btn('Resize', async () => {
      const c = cvOf(img, w.v, hh.v), b = await encode(c, fmt.v, q.v / 100);
      out.replaceChildren(h('div', { class: 'stage' }, c), h('p', { class: 'muted' }, `${c.width}×${c.height} · ${ui.bytes(b.size)}`), ui.btn('Download', () => ui.dl(`${name}-${c.width}x${c.height}.${fmt.v === 'jpeg' ? 'jpg' : fmt.v}`, b)));
    }), out);
    root.append(imgPicker((i, f) => { img = i; name = baseName(f); w.v = i.naturalWidth; hh.v = i.naturalHeight; info.textContent = `Original: ${i.naturalWidth}×${i.naturalHeight}`; work.hidden = false; out.replaceChildren(); }), work);
  }
});

T({
  id: 'image-converter', name: 'Image Format Converter', cat: 'image', icon: '🔄', desc: 'Convert between PNG, JPG and WebP in bulk.',
  render(root) {
    const fmt = ui.select('Convert to', ['png', 'jpeg', 'webp']), q = ui.range('Quality (JPG/WebP)', 10, 100, 92), list = h('div'); let res = [];
    root.append(ui.row(fmt, q), imgPicker(async fs => {
      list.replaceChildren(); res = [];
      for (const f of fs) {
        try {
          const b = await encode(cvOf(await ui.img(f)), fmt.v, q.v / 100), nm = baseName(f) + '.' + (fmt.v === 'jpeg' ? 'jpg' : fmt.v); res.push({ name: nm, data: b });
          list.append(h('div', { class: 'row c' }, h('span', { style: { flex: 1 } }, `${f.name} → ${nm} (${ui.bytes(f.size)} → ${ui.bytes(b.size)})`), ui.btn('Download', () => ui.dl(nm, b), 'sm')));
        } catch (e) { list.append(h('p', { class: 'err' }, e.message)); }
      }
    }, true), list, ui.btn('Download all as ZIP', async () => res.length && ui.dl('converted.zip', await ui.zip(res)), 'sec'));
  }
});

T({
  id: 'image-base64', name: 'Image ⇄ Base64', cat: 'image', icon: '🔣', desc: 'Turn images into data URIs, or decode a data URI back to an image.',
  render(root) {
    const o = ui.out('Data URI'), ta = ui.area('Paste a data URI or raw Base64', { rows: 5 }), prev = h('div', { class: 'stage' });
    ta.on(() => {
      let v = ta.v.trim(); if (!v) return prev.replaceChildren(); if (!v.startsWith('data:')) v = 'data:image/png;base64,' + v;
      prev.replaceChildren(h('img', { src: v, onerror: () => prev.replaceChildren('Not a valid image') }));
    });
    root.append(h('h3', {}, 'Image → Base64'), ui.file('Drop an image', 'image/*', f => { const r = new FileReader(); r.onload = () => o.set(r.result); r.readAsDataURL(f); }), o,
      h('h3', {}, 'Base64 → Image'), ta, prev, ui.btn('Download image', () => { const i = prev.querySelector('img'); i && ui.dl('image.' + (i.src.match(/image\/(\w+)/)?.[1] || 'png'), i.src); }, 'sec'));
  }
});

T({
  id: 'image-filters', name: 'Photo Filters Editor', cat: 'image', icon: '🌈', desc: 'Brightness, contrast, saturation, hue, blur, sepia and more — live preview.',
  render(root) {
    let img, name; const cv = h('canvas');
    const S = { brightness: [0, 200, 100, '%'], contrast: [0, 200, 100, '%'], saturate: [0, 300, 100, '%'], 'hue-rotate': [0, 360, 0, 'deg'], blur: [0, 20, 0, 'px'], grayscale: [0, 100, 0, '%'], sepia: [0, 100, 0, '%'], invert: [0, 100, 0, '%'] };
    const sl = {}; for (const k in S) sl[k] = ui.range(k, S[k][0], S[k][1], S[k][2]).on(draw);
    function draw() { if (!img) return; const c = cv.getContext('2d'); c.filter = Object.keys(S).map(k => `${k}(${sl[k].v}${S[k][3]})`).join(' '); c.clearRect(0, 0, cv.width, cv.height); c.drawImage(img, 0, 0, cv.width, cv.height); }
    const presets = { Original: {}, 'B&W': { grayscale: 100 }, Vintage: { sepia: 60, contrast: 110, brightness: 95 }, Vivid: { saturate: 180, contrast: 110 }, Cool: { 'hue-rotate': 190, saturate: 120 }, Fade: { contrast: 80, brightness: 115, saturate: 80 } };
    const work = h('div', { hidden: true }, ui.row(Object.entries(presets).map(([n, p]) => ui.btn(n, () => { for (const k in S) sl[k].v = p[k] ?? S[k][2]; document.querySelectorAll('.tool .f b').forEach(() => 0); Object.values(sl).forEach(s => s.c.dispatchEvent(new Event('input'))); }, 'sec sm'))), ui.cols(...Object.values(sl)), h('div', { class: 'stage' }, cv),
      ui.btn('Download PNG', async () => ui.dl(name + '-edited.png', await ui.blob(cv))));
    root.append(imgPicker((i, f) => { img = i; name = baseName(f); const k = Math.min(1, 2400 / Math.max(i.naturalWidth, i.naturalHeight)); cv.width = i.naturalWidth * k; cv.height = i.naturalHeight * k; work.hidden = false; draw(); }), work);
  }
});

T({
  id: 'image-rotate-flip', name: 'Rotate & Flip Image', cat: 'image', icon: '🔃', desc: 'Rotate by 90° or any angle and flip horizontally/vertically.',
  render(root) {
    let img, name, rot = 0, fx = 1, fy = 1; const cv = h('canvas'), ang = ui.range('Fine angle', -180, 180, 0);
    function draw() {
      const a = (rot + ang.v) * Math.PI / 180, w = img.naturalWidth, hh = img.naturalHeight, s = Math.abs(Math.sin(a)), c = Math.abs(Math.cos(a));
      cv.width = Math.round(w * c + hh * s); cv.height = Math.round(w * s + hh * c);
      const x = cv.getContext('2d'); x.translate(cv.width / 2, cv.height / 2); x.rotate(a); x.scale(fx, fy); x.drawImage(img, -w / 2, -hh / 2);
    }
    ang.on(draw);
    const work = h('div', { hidden: true }, ui.row(ui.btn('⟲ 90°', () => { rot -= 90; draw(); }, 'sec'), ui.btn('⟳ 90°', () => { rot += 90; draw(); }, 'sec'), ui.btn('⇋ Flip H', () => { fx *= -1; draw(); }, 'sec'), ui.btn('⇅ Flip V', () => { fy *= -1; draw(); }, 'sec')), ang, h('div', { class: 'stage' }, cv), ui.btn('Download PNG', async () => ui.dl(name + '-rotated.png', await ui.blob(cv))));
    root.append(imgPicker((i, f) => { img = i; name = baseName(f); rot = 0; fx = fy = 1; ang.v = 0; work.hidden = false; draw(); }), work);
  }
});

T({
  id: 'meme-generator', name: 'Meme Generator', cat: 'image', icon: '😂', desc: 'Add top and bottom captions in classic meme style.',
  render(root) {
    let img, cv = h('canvas'); const top = ui.input('Top text', { value: 'WHEN THE CODE WORKS' }), bot = ui.input('Bottom text', { value: 'ON THE FIRST TRY' }), size = ui.range('Font size %', 4, 20, 10), col = ui.input('Text color', { type: 'color', value: '#ffffff' });
    function draw() {
      if (!img) return; cv.width = Math.min(900, img.naturalWidth); cv.height = Math.round(img.naturalHeight * cv.width / img.naturalWidth);
      const x = cv.getContext('2d'); x.drawImage(img, 0, 0, cv.width, cv.height); const fs = cv.width * size.v / 100;
      x.font = `900 ${fs}px Impact, "Arial Black", sans-serif`; x.textAlign = 'center'; x.fillStyle = col.v; x.strokeStyle = '#000'; x.lineWidth = fs / 7; x.lineJoin = 'round';
      const put = (t, y, base) => { x.textBaseline = base; t.toUpperCase().split('\n').forEach((l, i, a) => { const yy = base === 'top' ? y + i * fs : y - (a.length - 1 - i) * fs; x.strokeText(l, cv.width / 2, yy, cv.width * .95); x.fillText(l, cv.width / 2, yy, cv.width * .95); }); };
      put(top.v, 10, 'top'); put(bot.v, cv.height - 10, 'bottom');
    }
    [top, bot, size, col].forEach(c => c.on(draw));
    const work = h('div', { hidden: true }, ui.row(top, bot), ui.row(size, col), h('div', { class: 'stage' }, cv), ui.btn('Download PNG', async () => ui.dl('meme.png', await ui.blob(cv))));
    root.append(imgPicker(i => { img = i; work.hidden = false; draw(); }), work);
  }
});

T({
  id: 'favicon-generator', name: 'Favicon Generator', cat: 'image', icon: '⭐', desc: 'Make favicon.ico plus PNG icons (16–512px) and the HTML snippet.',
  render(root) {
    const out = h('div'), code = ui.out('HTML <head> snippet');
    code.set('<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
    root.append(imgPicker(async img => {
      const sizes = [16, 32, 48, 180, 192, 512], pngs = {}, side = Math.min(img.naturalWidth, img.naturalHeight), files = [];
      for (const s of sizes) {
        const c = h('canvas', { width: s, height: s }); c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, s, s);
        pngs[s] = new Uint8Array(await (await ui.blob(c)).arrayBuffer());
      }
      const ico = [16, 32, 48], head = new DataView(new ArrayBuffer(6 + 16 * ico.length)); head.setUint16(2, 1, true); head.setUint16(4, ico.length, true);
      let off = head.byteLength; ico.forEach((s, i) => { const o = 6 + i * 16; head.setUint8(o, s); head.setUint8(o + 1, s); head.setUint16(o + 4, 1, true); head.setUint16(o + 6, 32, true); head.setUint32(o + 8, pngs[s].length, true); head.setUint32(o + 12, off, true); off += pngs[s].length; });
      const icoBlob = new Blob([head, ...ico.map(s => pngs[s])], { type: 'image/x-icon' });
      files.push({ name: 'favicon.ico', data: icoBlob }, ...sizes.map(s => ({ name: s === 180 ? 'apple-touch-icon.png' : `favicon-${s}.png`, data: pngs[s] })));
      out.replaceChildren(h('div', { class: 'row c' }, sizes.map(s => { const i = h('img', { src: URL.createObjectURL(new Blob([pngs[s]])), style: { width: Math.min(s, 96) + 'px' } }); return h('div', {}, i, h('div', { class: 'muted' }, s + 'px')); })),
        ui.btn('Download all (ZIP)', async () => ui.dl('favicons.zip', await ui.zip(files))), ' ', ui.btn('favicon.ico only', () => ui.dl('favicon.ico', icoBlob), 'sec'));
    }), out, code);
  }
});

T({
  id: 'image-to-ascii', name: 'Image to ASCII Art', cat: 'image', icon: '🔠', desc: 'Convert any picture into text art.',
  render(root) {
    let img; const w = ui.range('Width (chars)', 20, 200, 80), inv = ui.check('Invert'), set = ui.select('Charset', [['@%#*+=-:. ', 'Classic'], ['█▓▒░ ', 'Blocks'], ['#. ', 'Minimal']]);
    const o = ui.out('', { pre: { fontSize: '7px', lineHeight: '7px', maxHeight: '600px' } });
    function go() {
      if (!img) return; const cw = w.v, ch = Math.round(img.naturalHeight / img.naturalWidth * cw * .5), c = cvOf(img, cw, ch), d = c.getContext('2d').getImageData(0, 0, cw, ch).data, cs = inv.v ? [...set.v].reverse().join('') : set.v; let s = '';
      for (let y = 0; y < ch; y++) { for (let x = 0; x < cw; x++) { const i = (y * cw + x) * 4, l = (.299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]) / 255 * (d[i + 3] / 255 || 0) + (1 - d[i + 3] / 255); s += cs[Math.min(cs.length - 1, Math.floor(l * cs.length))]; } s += '\n'; }
      o.set(s);
    }
    [w, inv, set].forEach(c => c.on(go));
    root.append(imgPicker(i => { img = i; go(); }), ui.row(w, set, inv), o);
  }
});

T({
  id: 'image-color-picker', name: 'Image Color Picker', cat: 'image', icon: '💧', desc: 'Click any pixel to get its color and extract a dominant palette.',
  render(root) {
    const cv = h('canvas', { style: { cursor: 'crosshair' } }), pick = h('div', { class: 'row c' }), pal = h('div', { class: 'row' });
    const sw = c => h('div', { style: { width: '90px' } }, h('div', { class: 'sw', style: { background: c, cursor: 'pointer' }, onclick: () => ui.copy(c) }), h('code', {}, c));
    const hex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    cv.onclick = e => { const r = cv.getBoundingClientRect(), d = cv.getContext('2d').getImageData(Math.floor((e.clientX - r.left) * cv.width / r.width), Math.floor((e.clientY - r.top) * cv.height / r.height), 1, 1).data; const hx = hex(d[0], d[1], d[2]); pick.replaceChildren(sw(hx), h('code', {}, `rgb(${d[0]}, ${d[1]}, ${d[2]})`)); };
    const work = h('div', { hidden: true }, h('div', { class: 'stage' }, cv), h('p', { class: 'muted' }, 'Click the image to pick a color (click a swatch to copy).'), pick, h('h3', {}, 'Dominant colors'), pal);
    root.append(imgPicker(i => {
      const k = Math.min(1, 900 / i.naturalWidth); cv.width = i.naturalWidth * k; cv.height = i.naturalHeight * k; cv.getContext('2d').drawImage(i, 0, 0, cv.width, cv.height); work.hidden = false;
      const s = cvOf(i, 80, 80 * i.naturalHeight / i.naturalWidth).getContext('2d'), d = s.getImageData(0, 0, s.canvas.width, s.canvas.height).data, bk = {};
      for (let j = 0; j < d.length; j += 4) { if (d[j + 3] < 128) continue; const k2 = (d[j] >> 5) + ',' + (d[j + 1] >> 5) + ',' + (d[j + 2] >> 5); (bk[k2] ||= [0, 0, 0, 0]); bk[k2][0] += d[j]; bk[k2][1] += d[j + 1]; bk[k2][2] += d[j + 2]; bk[k2][3]++; }
      pal.replaceChildren(...Object.values(bk).sort((a, b) => b[3] - a[3]).slice(0, 8).map(a => sw(hex(...[0, 1, 2].map(n => Math.round(a[n] / a[3]))))));
    }), work, window.EyeDropper ? ui.btn('Pick from screen (EyeDropper)', async () => { try { const r = await new EyeDropper().open(); pick.replaceChildren(sw(r.sRGBHex)); } catch { } }, 'sec') : null);
  }
});

T({
  id: 'images-to-pdf', name: 'Images to PDF', cat: 'image', icon: '📄', desc: 'Combine photos into a single PDF — page size A4 or fit-to-image.',
  render(root) {
    let imgs = []; const size = ui.select('Page size', [['fit', 'Fit to image'], ['a4', 'A4 portrait'], ['a4l', 'A4 landscape'], ['letter', 'US Letter']]), q = ui.range('JPEG quality', 40, 100, 85), list = h('p', { class: 'muted' });
    root.append(imgPicker(async fs => { imgs = []; for (const f of fs) imgs.push(await ui.img(f)); list.textContent = imgs.length + ' image(s) loaded'; }, true), ui.row(size, q), list, ui.btn('Create PDF', async () => {
      if (!imgs.length) return ui.toast('Add images first'); const pages = [];
      for (const i of imgs) {
        const c = cvOf(i), b = new Uint8Array(await (await encode(c, 'jpeg', q.v / 100)).arrayBuffer()), P = { a4: [595, 842], a4l: [842, 595], letter: [612, 792] }[size.v];
        let pw, ph, dw, dh; if (!P) { pw = dw = i.naturalWidth; ph = dh = i.naturalHeight; } else { [pw, ph] = P; const k = Math.min((pw - 40) / c.width, (ph - 40) / c.height); dw = c.width * k; dh = c.height * k; }
        pages.push({ w: pw, h: ph, dw, dh, x: (pw - dw) / 2, y: (ph - dh) / 2, iw: c.width, ih: c.height, jpeg: b });
      }
      const enc = new TextEncoder(), parts = [], offs = []; let off = 0; const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); off += b.length; };
      const obj = (id, ...body) => { offs[id] = off; push(`${id} 0 obj\n`); body.forEach(push); push('\nendobj\n'); };
      push('%PDF-1.4\n'); obj(1, '<</Type/Catalog/Pages 2 0 R>>'); obj(2, `<</Type/Pages/Count ${pages.length}/Kids[${pages.map((_, i) => `${3 + 3 * i} 0 R`).join(' ')}]>>`);
      pages.forEach((p, i) => {
        const pid = 3 + 3 * i, c = `q ${p.dw.toFixed(2)} 0 0 ${p.dh.toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)} cm /Im0 Do Q`;
        obj(pid, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${p.w} ${p.h}]/Contents ${pid + 1} 0 R/Resources<</XObject<</Im0 ${pid + 2} 0 R>>>>>>`);
        obj(pid + 1, `<</Length ${c.length}>>\nstream\n${c}\nendstream`);
        obj(pid + 2, `<</Type/XObject/Subtype/Image/Width ${p.iw}/Height ${p.ih}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${p.jpeg.length}>>\nstream\n`, p.jpeg, '\nendstream');
      });
      const xr = off, total = 3 * pages.length + 3; push(`xref\n0 ${total}\n0000000000 65535 f \n`);
      for (let i = 1; i < total; i++) push(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
      push(`trailer\n<</Size ${total}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);
      ui.dl('images.pdf', new Blob(parts, { type: 'application/pdf' }));
    }));
  }
});
