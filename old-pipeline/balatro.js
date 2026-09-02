/* ============================================================
   balatro.js — vanilla port of the React Bits <Balatro/> shader
   (https://reactbits.dev). Renders the swirling paint background
   with ogl, loaded as an ES module from a CDN (no build step).
   Colors = Balatro defaults: red / blue / dark teal.
   ============================================================ */
import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl@1.0.11';

(function () {
  'use strict';
  var container = document.getElementById('bg');
  if (!container) return;

  function hexToVec4(hex) {
    var h = hex.replace('#', ''), r = 0, g = 0, b = 0, a = 1;
    r = parseInt(h.slice(0, 2), 16) / 255;
    g = parseInt(h.slice(2, 4), 16) / 255;
    b = parseInt(h.slice(4, 6), 16) / 255;
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
    return [r, g, b, a];
  }

  var vertex = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

  var fragment = `
precision highp float;
#define PI 3.14159265359

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);

    float speed = (uSpinRotation * uSpinEase * 0.2);
    if (uIsRotate) { speed = iTime * speed; }
    speed += 302.2;

    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;

    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);

    uv *= 30.0;
    float baseSpeed = iTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;

    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);

    return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;

  var P = {
    spinRotation: -2.0, spinSpeed: 5.0, offset: [0.0, 0.0],
    color1: '#18c98a', color2: '#0b8f86', color3: '#07150f',
    contrast: 3.2, lighting: 0.5, spinAmount: 0.25,
    pixelFilter: 720.0, spinEase: 1.0, isRotate: false
  };

  var renderer = new Renderer();
  var gl = renderer.gl;
  gl.clearColor(0, 0, 0, 1);
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  gl.canvas.style.display = 'block';

  var program;
  function resize() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    if (program) {
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
    }
  }
  window.addEventListener('resize', resize);

  var geometry = new Triangle(gl);
  program = new Program(gl, {
    vertex: vertex, fragment: fragment,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: [1, 1, 1] },
      uSpinRotation: { value: P.spinRotation },
      uSpinSpeed: { value: P.spinSpeed },
      uOffset: { value: P.offset },
      uColor1: { value: hexToVec4(P.color1) },
      uColor2: { value: hexToVec4(P.color2) },
      uColor3: { value: hexToVec4(P.color3) },
      uContrast: { value: P.contrast },
      uLighting: { value: P.lighting },
      uSpinAmount: { value: P.spinAmount },
      uPixelFilter: { value: P.pixelFilter },
      uSpinEase: { value: P.spinEase },
      uIsRotate: { value: P.isRotate },
      uMouse: { value: [0.5, 0.5] }
    }
  });
  var mesh = new Mesh(gl, { geometry: geometry, program: program });
  container.appendChild(gl.canvas);
  resize();

  var raf;
  function update(t) {
    raf = requestAnimationFrame(update);
    program.uniforms.iTime.value = t * 0.001;
    renderer.render({ scene: mesh });
  }
  raf = requestAnimationFrame(update);

  // container sits behind the UI (pointer-events: none), so track the window
  window.addEventListener('mousemove', function (e) {
    var x = e.clientX / window.innerWidth;
    var y = 1.0 - e.clientY / window.innerHeight;
    program.uniforms.uMouse.value = [x, y];
  }, { passive: true });
})();
