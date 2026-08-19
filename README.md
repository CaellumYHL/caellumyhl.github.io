# Caellum Yip Hoi-Lee's Archive

Caellum Yip Hoi-Lee's playable 3D portfolio: a watercolor gallery built with React, Three.js, React Three Fiber, and GLSL. The player is a living drop of pigment adapted from the neighboring `slimesim` project.

## Run locally

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173/>.

- `WASD` or arrow keys — move
- Click the floor — set a destination
- `Space` — jump
- `E` — inspect a nearby exhibit
- `M` — open the catalogue
- `F` — open the résumé
- `Esc` — close the current panel

Useful direct views:

- `/?mode=gallery` — skip the introduction
- `/?mode=catalogue` — open the catalogue
- `/?mode=resume` — recruiter-friendly résumé
- `/?exhibit=paper-cuts` — open a specific project
- `/?mode=gallery&room=work` — start in the work room
- `/?mode=gallery&studio=watercolor` — open the full watercolor study
- `/?mode=gallery&studio=faces` — open the full generative portrait study

## Verify a production build

```bash
npm test
npm run build
npm run preview
```

The production output is written to `dist/`.

## Watercolor study

The back-wall pigment piece is a compact interactive interpretation of the layered model described by Curtis et al. in *Computer-Generated Watercolor* (SIGGRAPH 1997): an uneven paper field, water transport, suspended pigment, deposition, resuspension, drying edges, and subtractive color mixing. It is an artistic browser study, not a line-for-line reproduction of the paper.

Original project: <https://grail.cs.washington.edu/projects/watercolor/>

## Visitor ledger

GitHub Pages is static, so the basin's shared visit count is read from GoatCounter.
Local development displays a clearly labelled preview; the live site records visits.

1. Register the account name `caellumyhl` at <https://www.goatcounter.com/signup>
   and use `https://caellumyhl.github.io` as the site domain.
2. In GoatCounter, open **Settings → Site settings** and enable
   **Allow adding visitor counts on your website**.
3. The production build then records one canonical visit and reads the public
   `/counter/` JSON value into the basin. No GitHub secret or rebuild is needed.

The app defaults to `caellumyhl.goatcounter.com`. To use another account, add an
Actions repository variable named `VITE_GOATCOUNTER_CODE` containing its short
site code (or full `https://…goatcounter.com` URL), then redeploy.

No API secret is shipped to the browser.

## Publish on GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests and builds `dist/` on pushes to `main`, then publishes that artifact. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions** once.
