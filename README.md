# Caellum Yip Hoi-Lee — the sketchbook

A portfolio drawn entirely in JavaScript. There are no images, no fonts, and
no frameworks: every mark on the page — the paper grain, the printed ledger
rules, the lettering, the watercolor, the faces — is drawn onto canvases when
the page loads.

The site is a small flippable scrapbook. Use the index tabs on the right
edge, the dog-eared page corners, or the arrow keys to turn pages.

## Pages

1. **Cover** — name, role, links
2. **Selected work** — projects, each with a drawn doodle and a real link
3. **Experience** — the CV ledger, thumbprint-stamped
4. **Twenty-five washes** — skills painted as watercolor squares
5. **Naive faces** — a generated portrait sheet; click a face to redraw it
6. **Wet paper** — an interactive watercolor simulation after Curtis et al.,
   *Computer-Generated Watercolor* (SIGGRAPH 1997); drag on the paper to paint
7. **Two artworks** — a re-tangleable ink knot, and regrowable leaded leaves
8. **Visitor ledger** — a shared visit count, hand-drawn

## Run locally

There is no build step. Serve the folder and open it:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/
```

Everything lives in plain script files under `sketch/`:

- `tools.js` — paper stocks, ink/pencil/gouache strokes, washes, splatter,
  thumbprints, scan artifacts, the canvas mounting framework
- `lettering.js` — a naive single-stroke letterform set (the "font")
- `faces.js` — the portrait generator
- `watercolor.js` — the paint simulation
- `art.js` — the tangle and leaves artworks
- `plates.js` — the cover, work, CV, and skills pages
- `ledger.js` — the GoatCounter visitor ledger
- `book.js` — the flippable book: tabs, corners, keyboard
- `main.js` — the portfolio facts and page order

## Visitor ledger

GitHub Pages is static, so the shared visit count is read from GoatCounter
(`caellumyhl.goatcounter.com`). Localhost is never counted and shows a
labelled preview. In GoatCounter, **Settings → Site settings → Allow adding
visitor counts on your website** must be enabled for the public
`/counter/TOTAL.json` value to be readable.

## Deploying

`.github/workflows/deploy.yml` checks the scripts parse, copies
`index.html`, `sketch.css`, `sketch/`, and the résumé PDF into an artifact,
and publishes it to GitHub Pages on every push to `main`. The
`old-pipeline/` folder is not part of the published site.

## The old pipeline

The previous site — a playable 3D watercolor gallery built with React,
Three.js, and React Three Fiber — is archived in [`old-pipeline/`](old-pipeline/)
with its own README. It is kept for reference and is no longer served.
