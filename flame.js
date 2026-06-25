/* ============================================================
   flame.js — pixelated swirly blue-flame flow field
   A curl/flow-field particle system rendered to a low-res
   offscreen buffer and upscaled with nearest-neighbour for a
   chunky, "pixel" look. Deep navy / blue / cyan-white palette.
   Reacts to the cursor (swirls + brightens around the pointer).
   Exposes window.Flame.setMode('boot' | 'app').
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('flame');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });

  // Low-res buffer -> upscaled => pixelation. Bigger PIXEL = chunkier.
  var PIXEL = 5;
  var buffer = document.createElement('canvas');
  var bctx = buffer.getContext('2d', { alpha: false });

  var W = 0, H = 0;      // screen (CSS) px
  var bw = 0, bh = 0;    // buffer px

  /* ---------- value/gradient noise (Perlin-ish, seeded) ---------- */
  var perm = new Uint8Array(512);
  (function seed() {
    var p = new Uint8Array(256), i;
    for (i = 0; i < 256; i++) p[i] = i;
    var s = 1337;
    var rnd = function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (i = 255; i > 0; i--) { var j = (rnd() * (i + 1)) | 0; var t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < 512; i++) perm[i] = p[i & 255];
  })();

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function grad(h, x, y) {
    switch (h & 3) {
      case 0: return x + y;
      case 1: return -x + y;
      case 2: return x - y;
      default: return -x - y;
    }
  }
  function noise2(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    var xf = x - Math.floor(x), yf = y - Math.floor(y);
    var u = fade(xf), v = fade(yf);
    var aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
    var ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    var x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    var x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v); // ~ -1..1
  }

  /* ---------- particles (flat arrays for speed) ---------- */
  var N = 0;
  var px, py, pvx, pvy, plife, pmax;

  function allocate() {
    var area = bw * bh;
    N = Math.min(4200, Math.max(900, Math.round(area * 0.05)));
    px = new Float32Array(N);
    py = new Float32Array(N);
    pvx = new Float32Array(N);
    pvy = new Float32Array(N);
    plife = new Float32Array(N);
    pmax = new Float32Array(N);
    for (var i = 0; i < N; i++) respawn(i, true);
  }

  function rand() { return Math.random(); }

  function respawn(i, anywhere) {
    px[i] = rand() * bw;
    // bias spawns toward lower half so the flame "rises"
    py[i] = anywhere ? rand() * bh : bh * (0.55 + rand() * 0.5);
    pvx[i] = 0; pvy[i] = 0;
    pmax[i] = 80 + rand() * 140;
    plife[i] = anywhere ? rand() * pmax[i] : 0;
  }

  /* ---------- cursor ---------- */
  var mx = -9999, my = -9999, mActive = false;
  window.addEventListener('pointermove', function (e) {
    mx = e.clientX / PIXEL; my = e.clientY / PIXEL; mActive = true;
  }, { passive: true });
  window.addEventListener('pointerout', function () { mActive = false; });

  /* ---------- mode (boot = bright/full, app = dimmed bg) ---------- */
  var intensity = 1, intensityTarget = 1;
  window.Flame = {
    setMode: function (m) { intensityTarget = (m === 'app') ? 0.34 : 1; }
  };

  /* ---------- palette: energy 0..1 -> rgb (deep blue -> cyan-white) ---------- */
  function colorFor(e) {
    e = e < 0 ? 0 : e > 1 ? 1 : e;
    var r, g, b;
    if (e < 0.5) {
      var t = e / 0.5;                 // deep navy -> electric blue
      r = lerp(8, 38, t); g = lerp(20, 104, t); b = lerp(70, 240, t);
    } else {
      var t2 = (e - 0.5) / 0.5;        // electric blue -> cyan-white
      r = lerp(38, 168, t2); g = lerp(104, 222, t2); b = lerp(240, 255, t2);
    }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }

  /* ---------- resize ---------- */
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    bw = Math.ceil(W / PIXEL); bh = Math.ceil(H / PIXEL);
    buffer.width = bw; buffer.height = bh;
    bctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    bctx.fillStyle = '#04060e';
    bctx.fillRect(0, 0, bw, bh);
    allocate();
  }

  /* ---------- main loop ---------- */
  var t = 0;
  function frame() {
    t += 0.0016;
    intensity += (intensityTarget - intensity) * 0.04;

    // fade previous frame -> motion trails / glow. Stronger fade in app mode.
    bctx.globalCompositeOperation = 'source-over';
    bctx.fillStyle = 'rgba(4,6,14,' + (0.18 + (1 - intensity) * 0.26) + ')';
    bctx.fillRect(0, 0, bw, bh);

    // additive draw for the flame glow
    bctx.globalCompositeOperation = 'lighter';

    var SPD = 0.9;
    var SC = 0.012;        // spatial scale of the flow field
    for (var i = 0; i < N; i++) {
      var x = px[i], y = py[i];

      // flow-field angle (two octaves -> swirlier)
      var a = noise2(x * SC, y * SC + t) * 6.2831853 * 1.6
            + noise2(x * SC * 2.3, y * SC * 2.3 - t * 1.4) * 3.1415926;
      var dx = Math.cos(a), dy = Math.sin(a);
      dy -= 0.55;          // buoyancy: flames rise

      // cursor swirl + attraction
      if (mActive) {
        var rx = x - mx, ry = y - my;
        var d2 = rx * rx + ry * ry;
        var R = 46;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) + 0.001;
          var f = (1 - d / R);
          // tangential (perpendicular) -> swirl around pointer
          dx += (-ry / d) * f * 3.2;
          dy += (rx / d) * f * 3.2;
          // gentle pull inward
          dx -= (rx / d) * f * 0.9;
          dy -= (ry / d) * f * 0.9;
        }
      }

      // integrate with inertia for smooth streams
      pvx[i] = pvx[i] * 0.82 + dx * SPD * 0.18;
      pvy[i] = pvy[i] * 0.82 + dy * SPD * 0.18;
      x += pvx[i]; y += pvy[i];

      // wrap horizontally, recycle by life
      if (x < 0) x += bw; else if (x >= bw) x -= bw;
      plife[i] += 1;
      if (y < -2 || plife[i] > pmax[i]) { respawn(i, false); continue; }

      px[i] = x; py[i] = y;

      // energy: faster + nearer cursor + lower-on-screen => hotter
      var spd = Math.sqrt(pvx[i] * pvx[i] + pvy[i] * pvy[i]);
      var lifeT = plife[i] / pmax[i];
      var e = 0.18 + spd * 0.42 + (1 - lifeT) * 0.35;
      if (mActive) {
        var mrx = x - mx, mry = y - my, md = Math.sqrt(mrx * mrx + mry * mry);
        if (md < 60) e += (1 - md / 60) * 0.5;
      }
      e *= intensity;

      bctx.fillStyle = colorFor(e);
      bctx.globalAlpha = (0.35 + e * 0.6) * intensity;
      bctx.fillRect(x | 0, y | 0, 1, 1);
      // hot core for the brightest particles
      if (e > 0.85) { bctx.fillStyle = '#dff1ff'; bctx.fillRect(x | 0, y | 0, 1, 1); }
    }
    bctx.globalAlpha = 1;

    // upscale buffer -> screen (nearest-neighbour => chunky pixels)
    ctx.drawImage(buffer, 0, 0, bw, bh, 0, 0, W, H);

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
