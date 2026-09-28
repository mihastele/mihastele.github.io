# Seasonal website

A static site that tells the story of Seasonal and documents the brand. No
build step, no framework, no JavaScript, no external requests.

## View it

```sh
cd site
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just open `index.html` directly in a browser.

## Deploy

Copy the `site/` directory to any static host (GitHub Pages, Netlify,
Cloudflare Pages, an S3 bucket). There is nothing to compile.

## Contents

- `index.html` — the story and product principles
- `styles.css` — the brand palette as CSS variables, with dark mode
- `assets/` — the logo mark, lockup, and app icon
- `favicon.svg`, `favicon.ico`, `site.webmanifest` — installable icon set

All icon files are rendered from `brand/icons/` by `brand/render-icons.sh`;
edit the SVG masters and re-run the script instead of touching outputs.

The palette here must stay in sync with `brand/BRAND.md` and
`lib/brand/palette.dart`.
