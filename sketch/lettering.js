/* lettering.js — a naive single-stroke letterform set, drawn by hand every
   time. There are no fonts on this site; every word is a set of ink strokes
   with their own wobble. Coordinates: x within [0, advance], y 0 = cap top,
   1 = baseline. */
'use strict'

;(function () {
  var G = {}

  G.A = { w: 0.72, s: [[[0, 1], [0.36, 0], [0.72, 1]], [[0.17, 0.62], [0.56, 0.62]]] }
  G.B = { w: 0.68, s: [[[0.02, 0], [0.02, 1]], [[0.02, 0], [0.5, 0.01], [0.62, 0.13], [0.61, 0.34], [0.48, 0.46], [0.02, 0.47]], [[0.02, 0.47], [0.54, 0.49], [0.67, 0.63], [0.66, 0.86], [0.5, 1], [0.02, 1]]] }
  G.C = { w: 0.68, s: [[[0.66, 0.13], [0.48, 0], [0.2, 0], [0.04, 0.17], [0, 0.5], [0.04, 0.83], [0.2, 1], [0.48, 1], [0.66, 0.87]]] }
  G.D = { w: 0.7, s: [[[0.02, 0], [0.02, 1]], [[0.02, 0], [0.4, 0], [0.62, 0.14], [0.7, 0.5], [0.62, 0.86], [0.4, 1], [0.02, 1]]] }
  G.E = { w: 0.62, s: [[[0.62, 0], [0.02, 0], [0.02, 1], [0.62, 1]], [[0.02, 0.5], [0.48, 0.5]]] }
  G.F = { w: 0.6, s: [[[0.6, 0], [0.02, 0], [0.02, 1]], [[0.02, 0.5], [0.46, 0.5]]] }
  G.G = { w: 0.7, s: [[[0.67, 0.13], [0.48, 0], [0.2, 0], [0.04, 0.18], [0, 0.5], [0.04, 0.82], [0.2, 1], [0.5, 1], [0.68, 0.85], [0.69, 0.56], [0.42, 0.56]]] }
  G.H = { w: 0.7, s: [[[0.02, 0], [0.02, 1]], [[0.68, 0], [0.68, 1]], [[0.02, 0.52], [0.68, 0.52]]] }
  G.I = { w: 0.4, s: [[[0.2, 0], [0.2, 1]], [[0.02, 0], [0.38, 0]], [[0.02, 1], [0.38, 1]]] }
  G.J = { w: 0.6, s: [[[0.58, 0], [0.58, 0.78], [0.44, 1], [0.16, 1], [0.02, 0.82]]] }
  G.K = { w: 0.68, s: [[[0.02, 0], [0.02, 1]], [[0.64, 0], [0.04, 0.56]], [[0.24, 0.42], [0.68, 1]]] }
  G.L = { w: 0.58, s: [[[0.02, 0], [0.02, 1], [0.58, 1]]] }
  G.M = { w: 0.88, s: [[[0.02, 1], [0.04, 0], [0.44, 0.66], [0.84, 0], [0.86, 1]]] }
  G.N = { w: 0.7, s: [[[0.02, 1], [0.02, 0], [0.68, 1], [0.68, 0]]] }
  G.O = { w: 0.72, s: [[[0.36, 0], [0.14, 0.05], [0.02, 0.28], [0, 0.52], [0.04, 0.78], [0.18, 0.98], [0.4, 1], [0.6, 0.93], [0.7, 0.7], [0.72, 0.45], [0.66, 0.18], [0.5, 0.02], [0.36, 0]]] }
  G.P = { w: 0.64, s: [[[0.02, 1], [0.02, 0], [0.48, 0], [0.62, 0.12], [0.63, 0.38], [0.48, 0.52], [0.02, 0.52]]] }
  G.Q = { w: 0.74, s: [[[0.36, 0], [0.14, 0.05], [0.02, 0.28], [0, 0.52], [0.04, 0.78], [0.18, 0.98], [0.4, 1], [0.6, 0.93], [0.7, 0.7], [0.72, 0.45], [0.66, 0.18], [0.5, 0.02], [0.36, 0]], [[0.46, 0.72], [0.74, 1.05]]] }
  G.R = { w: 0.68, s: [[[0.02, 1], [0.02, 0], [0.48, 0], [0.62, 0.12], [0.63, 0.36], [0.48, 0.5], [0.02, 0.5]], [[0.32, 0.5], [0.68, 1]]] }
  G.S = { w: 0.64, s: [[[0.6, 0.13], [0.44, 0], [0.18, 0], [0.04, 0.14], [0.06, 0.32], [0.26, 0.44], [0.5, 0.55], [0.62, 0.7], [0.6, 0.88], [0.42, 1], [0.15, 1], [0, 0.87]]] }
  G.T = { w: 0.68, s: [[[0, 0], [0.68, 0]], [[0.34, 0], [0.34, 1]]] }
  G.U = { w: 0.7, s: [[[0.02, 0], [0.02, 0.76], [0.16, 0.99], [0.5, 1], [0.66, 0.8], [0.68, 0]]] }
  G.V = { w: 0.7, s: [[[0.02, 0], [0.35, 1], [0.68, 0]]] }
  G.W = { w: 0.96, s: [[[0.02, 0], [0.2, 1], [0.48, 0.28], [0.74, 1], [0.94, 0]]] }
  G.X = { w: 0.68, s: [[[0.02, 0], [0.66, 1]], [[0.66, 0], [0.02, 1]]] }
  G.Y = { w: 0.7, s: [[[0.02, 0], [0.35, 0.52], [0.68, 0]], [[0.35, 0.52], [0.35, 1]]] }
  G.Z = { w: 0.66, s: [[[0.02, 0], [0.64, 0], [0.02, 1], [0.66, 1]]] }

  G['0'] = { w: 0.66, s: [[[0.33, 0], [0.12, 0.06], [0.02, 0.3], [0, 0.55], [0.05, 0.8], [0.18, 0.98], [0.38, 1], [0.56, 0.9], [0.64, 0.66], [0.66, 0.4], [0.6, 0.14], [0.46, 0.01], [0.33, 0]]] }
  G['1'] = { w: 0.52, s: [[[0.08, 0.2], [0.3, 0], [0.3, 1]], [[0.06, 1], [0.5, 1]]] }
  G['2'] = { w: 0.64, s: [[[0.04, 0.16], [0.2, 0], [0.48, 0], [0.62, 0.14], [0.58, 0.38], [0.02, 1], [0.64, 1]]] }
  G['3'] = { w: 0.64, s: [[[0.04, 0.1], [0.25, 0], [0.5, 0], [0.62, 0.13], [0.58, 0.32], [0.4, 0.44], [0.58, 0.55], [0.64, 0.78], [0.5, 0.97], [0.2, 1], [0.03, 0.88]]] }
  G['4'] = { w: 0.68, s: [[[0.5, 1], [0.5, 0], [0.02, 0.68], [0.68, 0.68]]] }
  G['5'] = { w: 0.64, s: [[[0.6, 0], [0.1, 0], [0.06, 0.44], [0.34, 0.38], [0.58, 0.5], [0.64, 0.74], [0.5, 0.96], [0.2, 1], [0.03, 0.87]]] }
  G['6'] = { w: 0.64, s: [[[0.56, 0.06], [0.38, 0], [0.16, 0.09], [0.04, 0.36], [0.02, 0.68], [0.12, 0.93], [0.34, 1], [0.54, 0.92], [0.63, 0.72], [0.54, 0.52], [0.28, 0.48], [0.08, 0.6]]] }
  G['7'] = { w: 0.62, s: [[[0.02, 0], [0.62, 0], [0.24, 1]], [[0.14, 0.52], [0.46, 0.52]]] }
  G['8'] = { w: 0.64, s: [[[0.32, 0.46], [0.12, 0.36], [0.05, 0.18], [0.16, 0.02], [0.34, 0], [0.52, 0.04], [0.6, 0.2], [0.52, 0.37], [0.32, 0.46], [0.1, 0.58], [0.02, 0.78], [0.12, 0.96], [0.34, 1], [0.54, 0.95], [0.62, 0.76], [0.53, 0.57], [0.32, 0.46]]] }
  G['9'] = { w: 0.64, s: [[[0.08, 0.94], [0.26, 1], [0.48, 0.91], [0.6, 0.64], [0.62, 0.32], [0.52, 0.07], [0.3, 0], [0.1, 0.08], [0.01, 0.28], [0.1, 0.48], [0.36, 0.52], [0.56, 0.4]]] }

  G[' '] = { w: 0.46, s: [] }
  G['.'] = { w: 0.24, dot: [[0.12, 0.94]] }
  G[','] = { w: 0.24, s: [[[0.14, 0.88], [0.06, 1.12]]] }
  G['-'] = { w: 0.5, s: [[[0.04, 0.52], [0.46, 0.52]]] }
  G['—'] = { w: 0.9, s: [[[0.02, 0.52], [0.88, 0.52]]] } /* em dash */
  G['·'] = { w: 0.3, dot: [[0.15, 0.52]] } /* middle dot */
  G['/'] = { w: 0.5, s: [[[0.06, 1.02], [0.46, -0.02]]] }
  G[':'] = { w: 0.24, dot: [[0.12, 0.3], [0.12, 0.78]] }
  G['('] = { w: 0.36, s: [[[0.32, -0.04], [0.12, 0.2], [0.05, 0.5], [0.12, 0.8], [0.32, 1.04]]] }
  G[')'] = { w: 0.36, s: [[[0.04, -0.04], [0.24, 0.2], [0.31, 0.5], [0.24, 0.8], [0.04, 1.04]]] }
  G["'"] = { w: 0.2, s: [[[0.12, 0], [0.08, 0.2]]] }
  G['!'] = { w: 0.26, s: [[[0.13, 0], [0.13, 0.66]]], dot: [[0.13, 0.94]] }
  G['?'] = { w: 0.56, s: [[[0.04, 0.14], [0.18, 0], [0.42, 0], [0.54, 0.14], [0.5, 0.34], [0.3, 0.46], [0.28, 0.64]]], dot: [[0.28, 0.94]] }
  G['&'] = { w: 0.76, s: [[[0.68, 0.98], [0.28, 0.5], [0.12, 0.32], [0.14, 0.1], [0.32, 0], [0.46, 0.1], [0.44, 0.3], [0.1, 0.56], [0.02, 0.78], [0.14, 0.97], [0.38, 1], [0.56, 0.86], [0.74, 0.62]]] }
  G['+'] = { w: 0.56, s: [[[0.28, 0.24], [0.28, 0.8]], [[0.02, 0.52], [0.54, 0.52]]] }
  G['%'] = { w: 0.74, s: [[[0.66, 0.04], [0.06, 0.96]], [[0.14, 0.02], [0.04, 0.12], [0.09, 0.26], [0.22, 0.24], [0.25, 0.1], [0.14, 0.02]], [[0.58, 0.74], [0.48, 0.85], [0.53, 0.98], [0.66, 0.96], [0.69, 0.82], [0.58, 0.74]]] }
  G['↗'] = { w: 0.62, s: [[[0.06, 0.92], [0.54, 0.14]], [[0.2, 0.1], [0.56, 0.1], [0.55, 0.48]]] } /* north-east arrow */
  G['#'] = { w: 0.64, s: [[[0.22, 0.08], [0.14, 0.92]], [[0.46, 0.08], [0.38, 0.92]], [[0.04, 0.36], [0.6, 0.34]], [[0.02, 0.66], [0.58, 0.64]]] }
  G['$'] = { w: 0.64, s: [[[0.6, 0.16], [0.44, 0.06], [0.18, 0.06], [0.05, 0.2], [0.08, 0.36], [0.28, 0.46], [0.5, 0.55], [0.6, 0.7], [0.57, 0.86], [0.4, 0.94], [0.15, 0.94], [0.02, 0.83]], [[0.32, -0.04], [0.3, 1.05]]] }

  var LETTER = window.SKETCH.letter = {}

  /* Measure text width for a given cap-height size. */
  LETTER.measure = function (text, size, tracking) {
    var track = tracking === undefined ? 0.3 : tracking
    var width = 0
    var upper = String(text).toUpperCase()
    for (var index = 0; index < upper.length; index += 1) {
      var glyph = G[upper[index]] || G['-']
      width += (glyph.w + track) * size
    }
    return width - (upper.length ? track * size : 0)
  }

  /* Write a line of naive lettering. Options:
     size, color, width (stroke px), tracking, seed, align (left|center|right),
     amp (wobble), tilt (per-letter rotation amount), media ('ink'|'pencil').
     Returns text width. */
  LETTER.write = function (context, text, x, y, options) {
    options = options || {}
    var size = options.size || 16
    var track = options.tracking === undefined ? 0.3 : options.tracking
    var seed = options.seed === undefined ? 7 : options.seed
    var random = SKETCH.rng(seed)
    var pencil = options.media === 'pencil'
    var color = options.color || (pencil ? 'rgba(74, 70, 65, 1)' : SKETCH.INK)
    var strokeWidth = options.width || Math.max(1.1, size * (pencil ? 0.09 : 0.075))
    var amp = options.amp === undefined ? Math.max(0.5, size * 0.035) : options.amp
    var tilt = options.tilt === undefined ? 0.02 : options.tilt
    var renderStroke = pencil ? SKETCH.pencil : SKETCH.stroke

    var upper = String(text).toUpperCase()
    var total = LETTER.measure(upper, size, track)
    var penX = x
    if (options.align === 'center') penX = x - total / 2
    if (options.align === 'right') penX = x - total

    for (var index = 0; index < upper.length; index += 1) {
      var glyph = G[upper[index]] || G['-']
      var glyphSeed = seed + index * 131 + upper.charCodeAt(index)
      var bob = (random() - 0.5) * size * 0.06
      var lean = (random() - 0.5) * tilt

      context.save()
      context.translate(penX, y + bob)
      context.rotate(lean)
      if (glyph.s) {
        for (var strokeIndex = 0; strokeIndex < glyph.s.length; strokeIndex += 1) {
          var points = glyph.s[strokeIndex].map(function (point) {
            return [point[0] * size, (point[1] - 1) * size]
          })
          renderStroke(context, points, {
            seed: glyphSeed + strokeIndex * 17,
            color: color,
            width: strokeWidth,
            amp: amp,
            step: Math.max(3, size / 5),
          })
        }
      }
      if (glyph.dot) {
        for (var dotIndex = 0; dotIndex < glyph.dot.length; dotIndex += 1) {
          SKETCH.dot(
            context,
            glyph.dot[dotIndex][0] * size,
            (glyph.dot[dotIndex][1] - 1) * size,
            Math.max(1.2, strokeWidth * 0.75),
            color,
            glyphSeed + dotIndex,
          )
        }
      }
      context.restore()
      penX += (glyph.w + track) * size
    }
    return total
  }

  /* Split text into lines that fit maxWidth at the given size. */
  LETTER.wrap = function (text, size, maxWidth, tracking) {
    var words = String(text).split(' ')
    var lines = []
    var line = ''
    words.forEach(function (word) {
      var candidate = line ? line + ' ' + word : word
      if (line && LETTER.measure(candidate, size, tracking) > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    })
    if (line) lines.push(line)
    return lines
  }

  /* Write and underline, like a sketchbook title. Returns width. */
  LETTER.title = function (context, text, x, y, options) {
    options = options || {}
    var width = LETTER.write(context, text, x, y, options)
    var size = options.size || 16
    var startX = x
    if (options.align === 'center') startX = x - width / 2
    if (options.align === 'right') startX = x - width
    SKETCH.rule(context, startX - size * 0.15, y + size * 0.42, startX + width + size * 0.35, {
      seed: (options.seed || 7) + 501,
      color: options.ruleColor || SKETCH.PENCIL,
      width: Math.max(1, size * 0.05),
    })
    return width
  }
})()
