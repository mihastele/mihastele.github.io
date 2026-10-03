/* Audio, video & codes. Uses MediaRecorder, Web Audio, getUserMedia (all local). */
T({
  id: 'qr-code', name: 'QR Code Generator', cat: 'media', icon: '▦', desc: 'QR codes for text, URLs or Wi-Fi — export PNG or SVG.',
  render(root) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const mode = ui.select('Content', [['text', 'Text / URL'], ['wifi', 'Wi-Fi network']]), txt = ui.area('Text or URL', { rows: 3, value: 'https://example.com' });
    const ssid = ui.input('Network name (SSID)'), pw = ui.input('Password'), enc = ui.select('Security', ['WPA', 'WEP', 'nopass']), wifi = h('div', { hidden: true }, ui.row(ssid, pw, enc));
    const ecc = ui.select('Error correction', [['L', 'Low (7%)'], ['M', 'Medium (15%)'], ['Q', 'Quartile (25%)'], ['H', 'High (30%)']], 'M'), sz = ui.range('Size px', 128, 1024, 320, 16), fg = ui.input('Foreground', { type: 'color', value: '#000000' }), bg = ui.input('Background', { type: 'color', value: '#ffffff' });
    const cv = h('canvas'), err = h('p', { class: 'err' }); let svg = '';
    live([mode, txt, ssid, pw, enc, ecc, sz, fg, bg], () => {
      wifi.hidden = mode.v !== 'wifi'; txt.hidden = mode.v === 'wifi'; const data = mode.v === 'wifi' ? `WIFI:T:${enc.v};S:${ssid.v.replace(/([\\;,:"])/g, '\\$1')};P:${pw.v.replace(/([\\;,:"])/g, '\\$1')};;` : txt.v;
      try {
        const q = qrcode(0, ecc.v); q.addData(data || ' '); q.make(); const n = q.getModuleCount(), m = 4, cell = Math.max(1, Math.floor(sz.v / (n + 2 * m))), S = cell * (n + 2 * m); cv.width = cv.height = S;
        const x = cv.getContext('2d'); x.fillStyle = bg.v; x.fillRect(0, 0, S, S); x.fillStyle = fg.v; let p = '';
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) { x.fillRect((c + m) * cell, (r + m) * cell, cell, cell); p += `M${c + m},${r + m}h1v1h-1z`; }
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bg.v}"/><path d="${p}" fill="${fg.v}"/></svg>`; err.textContent = '';
      } catch (e) { err.textContent = 'Too much data for a QR code: ' + e.message; }
    });
    root.append(mode, txt, wifi, ui.row(ecc, sz), ui.row(fg, bg), err, h('div', { class: 'stage', style: { padding: '12px' } }, cv), ui.row(ui.btn('Download PNG', async () => ui.dl('qr.png', await ui.blob(cv))), ui.btn('Download SVG', () => ui.dl('qr.svg', svg, 'image/svg+xml'), 'sec')));
  }
});

T({
  id: 'barcode-generator', name: 'Barcode Generator (Code 128)', cat: 'media', icon: '|||', desc: 'Create scannable Code 128 barcodes for any ASCII text.',
  render(root) {
    const P = '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
    const t = ui.input('Text', { value: 'HUNDRED-TOOLS-2024' }), hgt = ui.range('Height px', 40, 300, 120), sc = ui.range('Bar width', 1, 6, 2), lbl = ui.check('Show text', true), cv = h('canvas'), err = h('p', { class: 'err' });
    live([t, hgt, sc, lbl], () => {
      const s = t.v; if (!s || /[^\x20-\x7e]/.test(s)) { err.textContent = 'Use printable ASCII characters only.'; return; } err.textContent = '';
      const codes = [104, ...[...s].map(c => c.charCodeAt(0) - 32)]; codes.push(codes.reduce((a, v, i) => a + (i ? v * i : v), 0) % 103, 106);
      const pat = codes.map(c => P[c]).join(''), q = 10, w = [...pat].reduce((a, d) => a + +d, 0) * sc.v + q * 2 * sc.v, th = lbl.v ? 22 : 0;
      cv.width = w; cv.height = hgt.v + th; const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, cv.height); x.fillStyle = '#000'; let px = q * sc.v;
      [...pat].forEach((d, i) => { const dw = +d * sc.v; if (i % 2 === 0) x.fillRect(px, 0, dw, hgt.v); px += dw; });
      if (lbl.v) { x.font = '16px monospace'; x.textAlign = 'center'; x.fillText(s, w / 2, hgt.v + 17); }
    });
    root.append(t, ui.row(hgt, sc, lbl), err, h('div', { class: 'stage', style: { padding: '12px' } }, cv), ui.btn('Download PNG', async () => ui.dl('barcode.png', await ui.blob(cv))));
  }
});

const mediaRec = (stream, onStop, mime) => {
  const chunks = [], rec = new MediaRecorder(stream, mime && MediaRecorder.isTypeSupported(mime) ? { mimeType: mime } : undefined);
  rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); onStop(new Blob(chunks, { type: rec.mimeType })); }; rec.start(250); return rec;
};
const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

T({
  id: 'audio-recorder', name: 'Voice / Audio Recorder', cat: 'media', icon: '🎙️', desc: 'Record from your microphone and download the clip.',
  render(root, ctx) {
    let rec, t0, iv, stream; const time = h('div', { class: 'big' }, '00:00'), res = h('div'), meter = h('div', { style: { height: '8px', background: 'var(--bd)', borderRadius: '4px', overflow: 'hidden' } }, h('div', { style: { height: '100%', width: '0', background: 'var(--ac)' } })), st = h('p', { class: 'muted' });
    const start = ui.btn('● Record', async () => {
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return st.textContent = 'Microphone unavailable: ' + e.message; }
      res.replaceChildren(); const ac = new AudioContext(), an = ac.createAnalyser(), d = new Uint8Array(an.fftSize); ac.createMediaStreamSource(stream).connect(an); t0 = Date.now();
      iv = setInterval(() => { time.textContent = clock((Date.now() - t0) / 1000); an.getByteTimeDomainData(d); meter.firstChild.style.width = Math.min(100, Math.max(...d.map(v => Math.abs(v - 128))) * 1.6) + '%'; }, 80);
      rec = mediaRec(stream, b => { clearInterval(iv); ac.close(); meter.firstChild.style.width = 0; const ext = b.type.includes('ogg') ? 'ogg' : b.type.includes('mp4') ? 'm4a' : 'webm'; res.replaceChildren(h('audio', { controls: true, src: URL.createObjectURL(b), style: { width: '100%' } }), ui.btn('Download', () => ui.dl('recording.' + ext, b))); }); start.disabled = true; stop.disabled = false; st.textContent = 'Recording…';
    }), stop = ui.btn('■ Stop', () => { rec.stop(); start.disabled = false; stop.disabled = true; st.textContent = ''; }, 'sec'); stop.disabled = true;
    ctx.cleanup(() => { clearInterval(iv); stream?.getTracks().forEach(t => t.stop()); });
    root.append(time, meter, ui.row(start, stop), st, res);
  }
});

T({
  id: 'screen-recorder', name: 'Screen Recorder', cat: 'media', icon: '🖥️', desc: 'Capture a screen, window or tab (optionally with audio) and save as WebM.',
  render(root, ctx) {
    if (!navigator.mediaDevices?.getDisplayMedia) return root.append('Screen capture is not supported in this browser.');
    let rec, stream; const aud = ui.check('Include system audio (if offered)', true), mic = ui.check('Include microphone'), prev = h('video', { muted: true, autoplay: true, style: { width: '100%', borderRadius: '8px', display: 'none' } }), res = h('div'), st = h('p', { class: 'muted' });
    const start = ui.btn('● Start recording', async () => {
      try { stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: aud.v }); if (mic.v) { const m = await navigator.mediaDevices.getUserMedia({ audio: true }); m.getAudioTracks().forEach(t => stream.addTrack(t)); } } catch (e) { return st.textContent = e.message; }
      res.replaceChildren(); prev.srcObject = stream; prev.style.display = 'block'; stream.getVideoTracks()[0].onended = () => rec?.state === 'recording' && stop.click();
      rec = mediaRec(stream, b => { prev.style.display = 'none'; prev.srcObject = null; res.replaceChildren(h('video', { controls: true, src: URL.createObjectURL(b), style: { width: '100%', borderRadius: '8px' } }), ui.btn('Download .webm', () => ui.dl('screen-recording.webm', b))); }, 'video/webm;codecs=vp9,opus'); start.disabled = true; stop.disabled = false;
    }), stop = ui.btn('■ Stop', () => { rec.stop(); start.disabled = false; stop.disabled = true; }, 'sec'); stop.disabled = true;
    ctx.cleanup(() => stream?.getTracks().forEach(t => t.stop()));
    root.append(ui.row(aud, mic), ui.row(start, stop), st, prev, res);
  }
});

T({
  id: 'webcam-photo', name: 'Webcam Photo Booth', cat: 'media', icon: '📸', desc: 'Take snapshots with your camera, mirror them, and download.',
  render(root, ctx) {
    let stream; const v = h('video', { autoplay: true, playsinline: true, muted: true, style: { width: '100%', maxWidth: '640px', borderRadius: '10px', background: '#000' } }), mir = ui.check('Mirror', true), shots = h('div', { class: 'row' }), st = h('p', { class: 'muted' });
    mir.on(() => v.style.transform = mir.v ? 'scaleX(-1)' : ''); v.style.transform = 'scaleX(-1)';
    const startCam = async () => { try { stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } }); v.srcObject = stream; st.textContent = ''; } catch (e) { st.textContent = 'Camera unavailable: ' + e.message; } };
    ctx.cleanup(() => stream?.getTracks().forEach(t => t.stop()));
    root.append(v, ui.row(mir, ui.btn('📷 Capture', async () => { if (!v.videoWidth) return; const c = h('canvas', { width: v.videoWidth, height: v.videoHeight }), x = c.getContext('2d'); if (mir.v) { x.translate(c.width, 0); x.scale(-1, 1); } x.drawImage(v, 0, 0); const b = await ui.blob(c, 'image/png'); shots.prepend(h('div', {}, h('img', { src: URL.createObjectURL(b), style: { height: '110px', borderRadius: '8px', display: 'block' } }), ui.btn('Save', () => ui.dl('photo-' + Date.now() + '.png', b), 'sm sec'))); })), st, shots);
    startCam();
  }
});

T({
  id: 'speech-to-text', name: 'Speech to Text (Dictation)', cat: 'media', icon: '🗨️', desc: 'Dictate with your microphone using the browser’s speech recognition.',
  render(root, ctx) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return root.append('Speech recognition isn’t supported in this browser (try Chrome or Edge).');
    const lang = ui.select('Language', [['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['de-DE', 'Deutsch'], ['es-ES', 'Español'], ['fr-FR', 'Français'], ['it-IT', 'Italiano'], ['pt-BR', 'Português'], ['sl-SI', 'Slovenščina'], ['ja-JP', '日本語'], ['zh-CN', '中文']], navigator.language.startsWith('en') ? 'en-US' : undefined), ta = ui.area('Transcript', { rows: 10 }), st = h('p', { class: 'muted' }); let r, on = false, base = '';
    const go = ui.btn('🎤 Start', () => { if (on) { on = false; r.stop(); go.textContent = '🎤 Start'; return; } r = new SR(); r.lang = lang.v; r.continuous = r.interimResults = true; base = ta.v ? ta.v + ' ' : '';
      r.onresult = e => { let f = '', i = ''; for (const x of e.results) (x.isFinal ? (f += x[0].transcript) : (i += x[0].transcript)); ta.v = base + f + i; if (f) base += f; }; r.onerror = e => st.textContent = 'Error: ' + e.error; r.onend = () => { if (on) r.start(); }; on = true; r.start(); go.textContent = '■ Stop'; });
    ctx.cleanup(() => { on = false; r?.stop(); });
    root.append(lang, ui.row(go, ui.btn('Copy', () => ui.copy(ta.v), 'sec'), ui.btn('Clear', () => ta.v = '', 'sec')), st, ta);
  }
});

T({
  id: 'tone-generator', name: 'Tone Generator', cat: 'media', icon: '🔊', desc: 'Generate sine, square, saw or triangle tones from 20 Hz to 20 kHz.',
  render(root, ctx) {
    let ac, osc, gain; const f = ui.range('Frequency Hz', 20, 20000, 440), vol = ui.range('Volume %', 0, 100, 20), wave = ui.select('Waveform', ['sine', 'square', 'sawtooth', 'triangle']);
    const stop = () => { osc?.stop(); osc = null; btn.textContent = '▶ Play'; };
    const btn = ui.btn('▶ Play', () => { if (osc) return stop(); ac ||= new AudioContext(); osc = ac.createOscillator(); gain = ac.createGain(); osc.type = wave.v; osc.frequency.value = f.v; gain.gain.value = vol.v / 100; osc.connect(gain).connect(ac.destination); osc.start(); btn.textContent = '■ Stop'; });
    f.on(() => osc && (osc.frequency.value = f.v)); vol.on(() => gain && (gain.gain.value = vol.v / 100)); wave.on(() => osc && (osc.type = wave.v)); ctx.cleanup(() => { stop(); ac?.close(); });
    root.append(f, ui.row([['A4', 440], ['C4', 261.63], ['432', 432], ['1 kHz', 1000], ['100 Hz', 100]].map(([n, v]) => ui.btn(n, () => { f.v = v; f.c.dispatchEvent(new Event('input')); }, 'sec sm'))), vol, wave, btn, h('p', { class: 'muted' }, 'Keep the volume low — pure tones can be loud on headphones.'));
  }
});

T({
  id: 'metronome', name: 'Metronome', cat: 'media', icon: '🥁', desc: 'Accurate Web Audio metronome with accents and tap tempo.',
  render(root, ctx) {
    let ac, timer, next = 0, beat = 0, taps = []; const bpm = ui.range('BPM', 30, 240, 100), bpb = ui.select('Beats per bar', ['2', '3', '4', '5', '6', '7'], '4'), dots = h('div', { class: 'row', style: { justifyContent: 'center' } }), lbl = h('div', { class: 'big' }, '100');
    const draw = () => dots.replaceChildren(...Array.from({ length: +bpb.v }, (_, i) => h('div', { style: { width: '22px', height: '22px', borderRadius: '50%', background: i === beat % +bpb.v ? 'var(--ac)' : 'var(--bd)' } })));
    const click = (t, acc) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = acc ? 1200 : 800; g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .06); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + .07); };
    const sched = () => { while (next < ac.currentTime + .15) { const b = beat % +bpb.v; click(next, b === 0); const d = (next - ac.currentTime) * 1000, bb = beat; setTimeout(() => { if (timer) { beat = bb; draw(); } }, Math.max(0, d)); next += 60 / bpm.v; beat++; } };
    const btn = ui.btn('▶ Start', () => { if (timer) { clearInterval(timer); timer = null; btn.textContent = '▶ Start'; return; } ac ||= new AudioContext(); beat = 0; next = ac.currentTime + .05; timer = setInterval(sched, 25); sched(); btn.textContent = '■ Stop'; });
    bpm.on(() => lbl.textContent = bpm.v); bpb.on(draw); draw(); ctx.cleanup(() => { clearInterval(timer); timer = null; ac?.close(); });
    root.append(lbl, bpm, dots, ui.row(bpb, btn, ui.btn('Tap tempo', () => { const n = Date.now(); taps = taps.filter(t => n - t < 2500); taps.push(n); if (taps.length > 1) { bpm.v = Math.min(240, Math.max(30, Math.round(60000 / ((taps.at(-1) - taps[0]) / (taps.length - 1))))); bpm.c.dispatchEvent(new Event('input')); } }, 'sec')));
  }
});

T({
  id: 'audio-trimmer', name: 'Audio Trimmer & WAV Export', cat: 'media', icon: '✂', desc: 'Cut a section out of any audio file and export it as WAV, with fades.',
  render(root, ctx) {
    let buf, src, ac = new AudioContext(); const cv = h('canvas', { width: 900, height: 140, style: { width: '100%', background: 'var(--bg)', borderRadius: '8px' } }), a = ui.range('Start (s)', 0, 1, 0, .01), b = ui.range('End (s)', 0, 1, 1, .01), fade = ui.range('Fade in/out (s)', 0, 5, 0, .1), info = h('p', { class: 'muted' });
    const draw = () => { const x = cv.getContext('2d'), d = buf.getChannelData(0), step = Math.ceil(d.length / 900); x.clearRect(0, 0, 900, 140); const s = a.v / buf.duration * 900, e = b.v / buf.duration * 900; x.fillStyle = 'rgba(124,58,237,.18)'; x.fillRect(s, 0, e - s, 140); x.fillStyle = getComputedStyle(document.body).getPropertyValue('--ac'); for (let i = 0; i < 900; i++) { let mx = 0; for (let j = 0; j < step; j += 8) mx = Math.max(mx, Math.abs(d[i * step + j] || 0)); x.fillRect(i, 70 - mx * 68, 1, Math.max(1, mx * 136)); } info.textContent = `Selection ${(b.v - a.v).toFixed(2)}s of ${buf.duration.toFixed(2)}s`; };
    [a, b, fade].forEach(c => c.on(() => buf && draw()));
    const slice = () => { const sr = buf.sampleRate, s = Math.floor(a.v * sr), e = Math.floor(b.v * sr), n = e - s, out = ac.createBuffer(buf.numberOfChannels, n, sr), f = Math.floor(fade.v * sr); for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c).slice(s, e); for (let i = 0; i < Math.min(f, n); i++) { d[i] *= i / f; d[n - 1 - i] *= i / f; } out.copyToChannel(d, c); } return out; };
    const wav = o => { const ch = o.numberOfChannels, n = o.length, v = new DataView(new ArrayBuffer(44 + n * ch * 2)), w = (p, s) => [...s].forEach((c, i) => v.setUint8(p + i, c.charCodeAt(0))); w(0, 'RIFF'); v.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, o.sampleRate, true); v.setUint32(28, o.sampleRate * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * ch * 2, true); const cd = Array.from({ length: ch }, (_, c) => o.getChannelData(c)); let p = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, cd[c][i])); v.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true); p += 2; } return new Blob([v], { type: 'audio/wav' }); };
    const work = h('div', { hidden: true }, cv, ui.cols(a, b), fade, info, ui.row(ui.btn('▶ Preview', () => { src?.stop(); src = ac.createBufferSource(); src.buffer = slice(); src.connect(ac.destination); src.start(); }, 'sec'), ui.btn('■ Stop', () => src?.stop(), 'sec'), ui.btn('Export WAV', () => ui.dl('trimmed.wav', wav(slice())))));
    ctx.cleanup(() => { src?.stop(); ac.close(); });
    root.append(ui.file('Drop an audio file (mp3, wav, ogg, m4a…)', 'audio/*', async f => { try { buf = await ac.decodeAudioData(await f.arrayBuffer()); [a, b].forEach(r => { r.c.max = buf.duration; }); a.v = 0; b.v = buf.duration.toFixed(2); a.c.dispatchEvent(new Event('input')); b.c.dispatchEvent(new Event('input')); work.hidden = false; draw(); } catch (e) { ui.toast('Could not decode audio'); } }), work);
  }
});

T({
  id: 'video-frame-grabber', name: 'Video Frame Grabber', cat: 'media', icon: '🎞️', desc: 'Scrub through a video and save any frame as an image.',
  render(root) {
    const v = h('video', { controls: true, style: { width: '100%', maxHeight: '420px', background: '#000', borderRadius: '8px' } }), fmt = ui.select('Format', ['png', 'jpeg', 'webp']), shots = h('div', { class: 'row' });
    const grab = async () => { if (!v.videoWidth) return; const c = h('canvas', { width: v.videoWidth, height: v.videoHeight }); c.getContext('2d').drawImage(v, 0, 0); const b = await encode(c, fmt.v), nm = `frame-${v.currentTime.toFixed(2)}s.${fmt.v === 'jpeg' ? 'jpg' : fmt.v}`; shots.prepend(h('div', {}, h('img', { src: URL.createObjectURL(b), style: { height: '100px', borderRadius: '6px', display: 'block' } }), ui.btn('Save', () => ui.dl(nm, b), 'sm sec'))); };
    const step = d => { v.pause(); v.currentTime = Math.max(0, v.currentTime + d); };
    const work = h('div', { hidden: true }, v, ui.row(ui.btn('⏮ −1 frame', () => step(-1 / 30), 'sec sm'), ui.btn('+1 frame ⏭', () => step(1 / 30), 'sec sm'), ui.btn('−1s', () => step(-1), 'sec sm'), ui.btn('+1s', () => step(1), 'sec sm'), fmt, ui.btn('📷 Grab frame', grab)), shots);
    root.append(ui.file('Drop a video file', 'video/*', f => { v.src = URL.createObjectURL(f); work.hidden = false; shots.replaceChildren(); }), work);
  }
});
