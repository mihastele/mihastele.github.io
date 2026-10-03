/* Security tools — all use the Web Crypto API (crypto.getRandomValues / SubtleCrypto). */
const rnd = n => { // unbiased random int in [0,n)
  const lim = Math.floor(2 ** 32 / n) * n, a = new Uint32Array(1);
  do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n;
};
const b64 = u8 => btoa(String.fromCharCode(...u8)), unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

T({
  id: 'password-generator', name: 'Password Generator', cat: 'sec', icon: '🔑', desc: 'Strong random passwords using your browser’s cryptographic RNG.',
  render(root) {
    const len = ui.range('Length', 6, 128, 20), up = ui.check('A–Z', true), lo = ui.check('a–z', true), dg = ui.check('0–9', true), sy = ui.check('Symbols !@#$…', true), amb = ui.check('Avoid look-alikes (0 O l 1 I)'), n = ui.input('How many', { type: 'number', value: 5, min: 1, max: 50 }), o = ui.out('Passwords', { pre: { fontSize: '15px' } }), ent = h('p', { class: 'muted' });
    const gen = () => {
      let set = (up.v ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') + (lo.v ? 'abcdefghijklmnopqrstuvwxyz' : '') + (dg.v ? '0123456789' : '') + (sy.v ? '!@#$%^&*()-_=+[]{};:,.<>?/~' : '');
      if (amb.v) set = set.replace(/[0Ol1I]/g, ''); if (!set) return o.set('Select at least one character set.');
      o.set(Array.from({ length: n.v | 0 }, () => Array.from({ length: len.v }, () => set[rnd(set.length)]).join('')).join('\n')); ent.textContent = `≈ ${Math.round(len.v * Math.log2(set.length))} bits of entropy`;
    };
    live([len, up, lo, dg, sy, amb, n], gen);
    root.append(len, ui.row(up, lo, dg, sy, amb), ui.row(n, ui.btn('Generate', gen)), ent, o);
  }
});

T({
  id: 'passphrase-generator', name: 'Passphrase Generator', cat: 'sec', icon: '🗝️', desc: 'Memorable multi-word passphrases (diceware style).',
  render(root) {
    const W = 'able acid aged also area army away baby back ball band bank base bath bear beat bell belt bike bird blue boat body bold bone book boom boss bowl bulk burn cafe cake calm camp card care cart case cash cast cave cell chef chip city clay clip club coal coat code coin cold come cook cool copy core cost crew crop dark data dawn deal deep deer desk dial dice diet dish dock door dove down draw drum duck dust duty each earn ease east easy edge epic even exit face fact fair fall farm fast fate fern film find fire firm fish five flag flat flow foam fold food foot fork form fort four free frog fuel full fund gain game gate gift girl glad glow goal gold golf good grab gray grid grow gulf hair half hall hand hard harm hawk heat help herb hero high hill hint hold home hope horn host hour huge hunt icon idea inch iron isle jade jazz jump june jury keen keep kind king kite knee lake lamp land lane last lawn lead leaf lens life lift lime line link lion list live load loan lock loft long loop lord loud love luck lung made mail main make mall many maps mark mask mass math meal meat melt menu mild mile milk mind mine mint mist moon moss move much music nail name navy neat nest news nice nine node noon note oath ocean oil okay once only open oval pace pack page palm park path peak pear pine pink plan play plum pond pool port pure quad quiz race rain rank rare reed rice rich ride ring rise road rock roof room root rope rose ruby rush sail salt sand save seal seed ship shop show silk sing site skin slow snow soft soil song soul star stay step sun swim tail tale tank team tent tide tile time tiny tone tool tree trip true tune turn twin unit vase vast view vine wait wake walk wall warm wave west wind wing wire wise wolf wood wool yard year zero zone'.split(' ');
    const n = ui.range('Words', 3, 10, 5), sep = ui.select('Separator', [['-', 'Hyphen'], [' ', 'Space'], ['.', 'Dot'], ['', 'None']]), cap = ui.check('Capitalize', true), num = ui.check('Add number'), o = ui.out('Passphrases', { pre: { fontSize: '16px' } }), ent = h('p', { class: 'muted' });
    const gen = () => { o.set(Array.from({ length: 6 }, () => { const w = Array.from({ length: n.v }, () => { const x = W[rnd(W.length)]; return cap.v ? x[0].toUpperCase() + x.slice(1) : x; }); if (num.v) w.push(rnd(100)); return w.join(sep.v); }).join('\n')); ent.textContent = `Dictionary of ${W.length} words ≈ ${(n.v * Math.log2(W.length) + (num.v ? Math.log2(100) : 0)).toFixed(0)} bits of entropy`; };
    live([n, sep, cap, num], gen); root.append(n, ui.row(sep, cap, num), ui.btn('Generate new', gen), ent, o);
  }
});

T({
  id: 'password-strength', name: 'Password Strength Checker', cat: 'sec', icon: '🛡️', desc: 'Estimate entropy and crack time — evaluated locally, never sent anywhere.',
  render(root) {
    const p = ui.input('Password', { type: 'password', placeholder: 'Type a password to test' }), show = ui.check('Show'), st = ui.stats(), tips = h('ul'), bar = h('div', { style: { height: '10px', borderRadius: '5px', background: 'var(--bd)', overflow: 'hidden' } }, h('div', { style: { height: '100%', width: '0', transition: '.3s' } }));
    const common = 'password 123456 12345678 qwerty abc123 letmein monkey dragon 111111 iloveyou admin welcome login princess football sunshine master shadow passw0rd trustno1 baseball superman 000000 qazwsx'.split(' ');
    show.on(() => p.c.type = show.v ? 'text' : 'password');
    live([p], () => {
      const s = p.v; if (!s) { st.set({}); tips.replaceChildren(); bar.firstChild.style.width = 0; return; }
      let pool = 0; if (/[a-z]/.test(s)) pool += 26; if (/[A-Z]/.test(s)) pool += 26; if (/\d/.test(s)) pool += 10; if (/[^\w]/.test(s) || /_/.test(s)) pool += 33;
      let bits = s.length * Math.log2(pool || 1); const issues = [];
      if (common.some(c => s.toLowerCase().includes(c))) { bits = Math.min(bits, 20); issues.push('Contains a very common password'); }
      if (/(.)\1{2,}/.test(s)) { bits *= .8; issues.push('Repeated characters'); } if (/(?:abc|bcd|cde|123|234|345|456|567|678|789|qwe|asd|zxc)/i.test(s)) { bits *= .85; issues.push('Sequential/keyboard pattern'); }
      if (s.length < 12) issues.push('Use at least 12 characters'); if (pool < 62) issues.push('Mix upper, lower, digits and symbols');
      const secs = 2 ** bits / 1e10 / 2, fmt = t => t < 1 ? 'instantly' : t < 60 ? Math.round(t) + ' seconds' : t < 3600 ? Math.round(t / 60) + ' minutes' : t < 86400 ? Math.round(t / 3600) + ' hours' : t < 3.15e7 ? Math.round(t / 86400) + ' days' : t < 3.15e9 ? Math.round(t / 3.15e7) + ' years' : t < 3.15e16 ? 'centuries' : 'practically forever';
      const lvl = bits < 40 ? ['Weak', '#dc2626', 25] : bits < 60 ? ['Fair', '#ea580c', 50] : bits < 80 ? ['Good', '#ca8a04', 75] : ['Strong', '#16a34a', 100];
      bar.firstChild.style.cssText += `width:${lvl[2]}%;background:${lvl[1]}`;
      st.set({ Strength: lvl[0], Entropy: Math.round(bits) + ' bits', Length: s.length, 'Crack time*': fmt(secs) }); tips.replaceChildren(...issues.map(x => h('li', {}, x)), h('li', { class: 'muted' }, '*Assumes 10 billion guesses/second offline attack.'));
    });
    root.append(p, show, bar, st, tips);
  }
});

T({
  id: 'text-encryptor', name: 'Text Encryptor (AES-256)', cat: 'sec', icon: '🔏', desc: 'Encrypt or decrypt text with a password using AES-GCM + PBKDF2.',
  render(root) {
    const i = ui.area('Text / encrypted message', { rows: 6 }), pw = ui.input('Password', { type: 'password' }), o = ui.out('Result');
    const key = async (p, salt, use) => crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, await crypto.subtle.importKey('raw', new TextEncoder().encode(p), 'PBKDF2', false, ['deriveKey']), { name: 'AES-GCM', length: 256 }, false, [use]);
    root.append(i, pw, ui.row(ui.btn('🔒 Encrypt', async () => {
      if (!pw.v) return ui.toast('Enter a password'); const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
      const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(pw.v, salt, 'encrypt'), new TextEncoder().encode(i.v))); o.set(b64(new Uint8Array([...salt, ...iv, ...c])));
    }), ui.btn('🔓 Decrypt', async () => {
      try { const d = unb64(i.v.trim()); o.set(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: d.slice(16, 28) }, await key(pw.v, d.slice(0, 16), 'decrypt'), d.slice(28)))); } catch { o.set('⚠ Wrong password or corrupted message.'); }
    }, 'sec')), o);
  }
});

T({
  id: 'totp-generator', name: 'TOTP Code Generator', cat: 'sec', icon: '📲', desc: 'Generate 2FA one-time codes from a Base32 secret (RFC 6238).',
  render(root, ctx) {
    const sec = ui.input('Base32 secret', { value: 'JBSWY3DPEHPK3PXP' }), dig = ui.select('Digits', ['6', '8']), per = ui.select('Period (s)', ['30', '60']), code = h('div', { class: 'big' }), bar = h('div', { style: { height: '6px', background: 'var(--ac)', transition: 'width .2s' } }), err = h('p', { class: 'err' });
    const dec = s => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = '', out = []; for (const c of s.toUpperCase().replace(/[\s=-]/g, '')) { const v = A.indexOf(c); if (v < 0) throw Error('Invalid Base32 character'); bits += v.toString(2).padStart(5, '0'); } for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return new Uint8Array(out); };
    const tick = async () => {
      try {
        const p = +per.v, t = Math.floor(Date.now() / 1000), ctr = Math.floor(t / p), b = new DataView(new ArrayBuffer(8)); b.setUint32(4, ctr); b.setUint32(0, Math.floor(ctr / 2 ** 32));
        const k = await crypto.subtle.importKey('raw', dec(sec.v), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']), m = new DataView(await crypto.subtle.sign('HMAC', k, b)), o = m.getUint8(19) & 15, n = (m.getUint32(o) & 0x7fffffff) % 10 ** +dig.v;
        const s = String(n).padStart(+dig.v, '0'); code.textContent = s.slice(0, s.length / 2) + ' ' + s.slice(s.length / 2); bar.style.width = (p - t % p) / p * 100 + '%'; err.textContent = '';
      } catch (e) { err.textContent = e.message; code.textContent = '— — —'; }
    };
    const iv = setInterval(tick, 500); ctx.cleanup(() => clearInterval(iv)); tick();
    root.append(sec, ui.row(dig, per), code, h('div', { style: { background: 'var(--bd)', borderRadius: '3px', overflow: 'hidden' } }, bar), err, h('p', { class: 'muted' }, 'Your secret never leaves this page. Default secret is a public test key.'));
  }
});

T({
  id: 'file-hash', name: 'File Checksum Verifier', cat: 'sec', icon: '✅', desc: 'Compute SHA-1/256/384/512 of any file and compare with an expected hash.',
  render(root) {
    const o = ui.out('Checksums'), exp = ui.input('Expected hash (optional) — paste to verify'), res = h('p'); let hashes = {};
    const check = () => { const e = exp.v.trim().toLowerCase(); if (!e || !Object.keys(hashes).length) return res.textContent = ''; const m = Object.entries(hashes).find(([, v]) => v === e); res.className = m ? 'ok' : 'err'; res.textContent = m ? `✅ Match (${m[0]})` : '❌ No match'; };
    exp.on(check);
    root.append(ui.file('Drop any file to hash it', '', async f => {
      o.set('Hashing…'); const buf = await f.arrayBuffer(); hashes = {}; let txt = `${f.name} (${ui.bytes(f.size)})\n\n`;
      for (const a of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) { hashes[a] = hexOf(await crypto.subtle.digest(a, buf)); txt += `${a.padEnd(8)} ${hashes[a]}\n`; } o.set(txt); check();
    }), exp, res, o);
  }
});
