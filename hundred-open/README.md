# Hundred Open Web Tools

100 free, private utilities that run entirely in the browser. Plain HTML, CSS and JavaScript — no Node, no bundler, no build step, no server. Files and text are never uploaded.

## Run / host

Open `index.html` through any static server (ES features used are supported by current evergreen browsers):

```bash
python -m http.server 8123   # then visit http://localhost:8123
```

Deploy by uploading the folder as-is to GitHub Pages, Netlify, Cloudflare Pages, S3, etc. Navigation is hash-based (`#/t/<tool-id>`), so no rewrite rules are needed.

> Camera, microphone, screen capture, clipboard and Web Crypto need `https://` or `localhost`.

## Layout

```
index.html            shell + script tags
assets/app.js         DOM helper `h`, UI kit `ui`, tool registry `T`, router, ZIP writer
assets/style.css      theme (light/dark) + components
tools/<category>.js   tools, each registered with T({ id, name, cat, icon, desc, render(root, ctx) })
vendor/qrcode.js      qrcode-generator by Kazuhiko Arase (MIT) — the only third-party code
```

### Adding a tool

```js
T({ id: 'my-tool', name: 'My Tool', cat: 'dev', icon: '🛠️', desc: 'One line.',
  render(root, ctx) {
    const i = ui.input('Text'), o = ui.out('Result');
    i.on(() => o.set(i.v.toUpperCase()));
    root.append(i, o);
    // ctx.cleanup(() => clearInterval(timer));   // free timers/streams on navigation
  } });
```

## The 100 tools

**Image (12)** Cropper · Compressor · Resizer · Format Converter · Image⇄Base64 · Photo Filters · Rotate & Flip · Meme Generator · Favicon Generator · Image→ASCII · Image Color Picker · Images→PDF
**Text (12)** Word Counter · Case Converter · Lorem Ipsum · Text Diff · Sort & Dedupe Lines · Slug Generator · Markdown Preview · Text-to-Speech · Morse Code · Roman Numerals · Regex Find & Replace · Fancy Text
**Developer (19)** JSON Formatter · JSON⇄CSV · HTML/XML Formatter · Minifier · Base64 · URL Encoder/Parser · HTML Entities · JWT Decoder · Regex Tester · Cron Helper · Timestamp Converter · UUID/ULID Generator · Hash Generator (MD5/SHA/HMAC) · SQL Formatter · Number Base Converter · HTTP Status Codes · Chmod Calculator · Browser Info · String Escaper
**Security (6)** Password Generator · Passphrase Generator · Password Strength · AES-256 Text Encryptor · TOTP Generator · File Checksum Verifier
**Math & Finance (13)** Scientific Calculator · Unit Converter · Percentage · BMI · Loan/Mortgage · Compound Interest · Tip Splitter · Age Calculator · Date Calculator · Aspect Ratio · Prime/GCD/LCM · Random/Dice/Coin · Statistics
**Design & CSS (11)** Gradient · Box Shadow · Border Radius · Contrast Checker · Color Converter · Palette Generator · Tints & Shades · PX/REM/clamp() · SVG Blob · CSS Patterns · Glassmorphism
**Audio & Video (10)** QR Code · Barcode (Code 128) · Audio Recorder · Screen Recorder · Webcam Photo · Speech-to-Text · Tone Generator · Metronome · Audio Trimmer (WAV) · Video Frame Grabber
**Productivity (11)** Pomodoro · Stopwatch · Countdown · World Clock · To-Do · Notes · Picker Wheel · Typing Test · Invoice Generator · Breathing Guide · Kanban
**Files & Fun (6)** ZIP Creator/Extractor · CSV Viewer · Keyboard Tester · Reaction Test · Snake · Memory Match

## License

MIT (vendored `qrcode-generator` is MIT as well).
