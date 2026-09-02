/* tools.js — the drawing toolkit for the sketchbook.
   Everything on this site is made with these marks: paper, printed
   stationery, pencil, ink, wash, gouache, splatter, and the wear of a bad
   scan. There are no images and no fonts anywhere. */
'use strict'

var SKETCH = window.SKETCH = {}

/* ---------------------------------------------------------------- palette */

SKETCH.INK = 'rgba(48, 44, 39, 0.9)'
SKETCH.INK_SOFT = 'rgba(48, 44, 39, 0.6)'
SKETCH.PENCIL = 'rgba(96, 90, 82, 0.62)'
SKETCH.PRINT = 'rgba(112, 106, 94, 0.5)'
SKETCH.RED = 'rgba(178, 72, 54, 0.82)'
SKETCH.RED_FAINT = 'rgba(190, 88, 66, 0.32)'
SKETCH.GREEN_PEN = 'rgba(96, 132, 58, 0.85)'
SKETCH.PLUM = 'rgba(74, 48, 54, 0.85)'
SKETCH.DESK = '#c9c0ac'

SKETCH.WASHES = [
  '#8aa6a0', '#d2a07c', '#8f9dad', '#b8a17c',
  '#9f8d9b', '#a6ad8b', '#b98777', '#c9b471',
]

/* ------------------------------------------------------------ seeded rng */

SKETCH.rng = function (seed) {
  var state = seed >>> 0
  return function () {
    state += 0x6d2b79f5
    var value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

SKETCH.clamp = function (value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value))
}

/* ------------------------------------------------------------ ink strokes */

/* Draw a polyline as a wobbly hand stroke: each segment is subdivided and
   nudged sideways so no two strokes ever land the same way twice. */
SKETCH.stroke = function (context, points, options) {
  options = options || {}
  var random = SKETCH.rng(options.seed === undefined ? 1 : options.seed)
  var amp = options.amp === undefined ? 1.1 : options.amp
  var step = options.step === undefined ? 6 : options.step

  context.save()
  context.strokeStyle = options.color || SKETCH.INK
  context.lineWidth = options.width || 1.6
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()

  var phase = random() * 7
  var started = false
  for (var index = 1; index < points.length; index += 1) {
    var ax = points[index - 1][0]
    var ay = points[index - 1][1]
    var bx = points[index][0]
    var by = points[index][1]
    var length = Math.hypot(bx - ax, by - ay)
    var pieces = Math.max(1, Math.round(length / step))
    var normalX = length ? -(by - ay) / length : 0
    var normalY = length ? (bx - ax) / length : 0
    for (var piece = 0; piece <= pieces; piece += 1) {
      if (index > 1 && piece === 0) continue
      var t = piece / pieces
      var wobble = Math.sin((phase + index * 2.7 + t * pieces) * 1.7) * amp
        + (random() - 0.5) * amp * 0.9
      var x = ax + (bx - ax) * t + normalX * wobble
      var y = ay + (by - ay) * t + normalY * wobble
      if (!started) {
        context.moveTo(x, y)
        started = true
      } else {
        context.lineTo(x, y)
      }
    }
  }
  context.stroke()
  context.restore()
}

/* A grainy pencil stroke: a solid graphite core with specks along it, the
   tooth of the paper showing through at the edges. */
SKETCH.pencil = function (context, points, options) {
  options = options || {}
  var random = SKETCH.rng(options.seed === undefined ? 2 : options.seed)
  var width = options.width || 2
  var amp = options.amp === undefined ? 1 : options.amp
  var color = options.color || 'rgba(74, 70, 65, 1)'

  /* the solid core, so the mark stays legible at any size */
  context.save()
  context.globalAlpha = 0.62
  SKETCH.stroke(context, points, {
    seed: (options.seed || 2) + 1,
    color: color,
    width: Math.max(1, width * 0.6),
    amp: amp * 0.7,
    step: options.step || 6,
  })
  context.restore()

  context.save()
  context.fillStyle = color
  for (var index = 1; index < points.length; index += 1) {
    var ax = points[index - 1][0]
    var ay = points[index - 1][1]
    var bx = points[index][0]
    var by = points[index][1]
    var length = Math.hypot(bx - ax, by - ay)
    var pieces = Math.max(1, Math.round(length / 1.3))
    var normalX = length ? -(by - ay) / length : 0
    var normalY = length ? (bx - ax) / length : 0
    var drift = (random() - 0.5) * amp
    for (var piece = 0; piece <= pieces; piece += 1) {
      var t = piece / pieces
      if (random() < 0.12) continue /* the pencil skips on the tooth */
      var wobble = drift + Math.sin((index * 3.1 + t * pieces) * 1.9) * amp * 0.6
      var x = ax + (bx - ax) * t + normalX * wobble
      var y = ay + (by - ay) * t + normalY * wobble
      var specks = 1 + Math.floor(random() * (1 + width * 0.7))
      for (var speck = 0; speck < specks; speck += 1) {
        var offset = (random() - 0.5) * width
        context.globalAlpha = 0.16 + random() * 0.3
        context.fillRect(
          x + normalX * offset + (random() - 0.5),
          y + normalY * offset + (random() - 0.5),
          0.7 + random() * 0.9,
          0.7 + random() * 0.9,
        )
      }
    }
  }
  context.restore()
}

/* An opaque pale gouache stroke, dry in places. */
SKETCH.gouache = function (context, points, options) {
  options = options || {}
  var random = SKETCH.rng(options.seed === undefined ? 4 : options.seed)
  var width = options.width || 7
  var color = options.color || 'rgba(240, 236, 222, 0.75)'
  var passes = 4
  for (var pass = 0; pass < passes; pass += 1) {
    var offset = (pass / (passes - 1) - 0.5) * width * 0.8
    var shifted = points.map(function (point) {
      return [point[0] + (random() - 0.5) * 2, point[1] + offset + (random() - 0.5) * 2]
    })
    SKETCH.stroke(context, shifted, {
      seed: (options.seed || 4) + pass * 31,
      color: color,
      width: width * 0.34,
      amp: 1.4,
      step: 7,
    })
  }
}

/* A hand-ruled line. */
SKETCH.rule = function (context, x1, y, x2, options) {
  options = options || {}
  SKETCH.stroke(context, [[x1, y], [x2, y]], {
    seed: options.seed === undefined ? 5 : options.seed,
    color: options.color || SKETCH.INK_SOFT,
    width: options.width || 1.4,
    amp: options.amp === undefined ? 1 : options.amp,
    step: 9,
  })
}

/* A rough dot of ink. */
SKETCH.dot = function (context, x, y, radius, color, seed) {
  var random = SKETCH.rng(seed === undefined ? 3 : seed)
  context.save()
  context.fillStyle = color || SKETCH.INK
  context.beginPath()
  for (var index = 0; index <= 8; index += 1) {
    var angle = (index / 8) * Math.PI * 2
    var rough = radius * (0.82 + random() * 0.36)
    var px = x + Math.cos(angle) * rough
    var py = y + Math.sin(angle) * rough
    if (index === 0) context.moveTo(px, py)
    else context.lineTo(px, py)
  }
  context.closePath()
  context.fill()
  context.restore()
}

/* ---------------------------------------------------------------- washes */

/* A layered blob of wash with a darker drying edge and granulation. */
SKETCH.wash = function (context, x, y, width, height, color, options) {
  options = options || {}
  var random = SKETCH.rng(options.seed === undefined ? 11 : options.seed)
  var alpha = options.alpha === undefined ? 0.5 : options.alpha
  var layers = options.layers === undefined ? 3 : options.layers
  var centerX = x + width / 2
  var centerY = y + height / 2

  context.save()
  for (var layer = 0; layer < layers; layer += 1) {
    context.globalAlpha = alpha / layers
    context.fillStyle = color
    context.beginPath()
    var points = 11
    for (var index = 0; index <= points; index += 1) {
      var angle = (index / points) * Math.PI * 2
      var radiusX = (width / 2) * (0.8 + random() * 0.3)
      var radiusY = (height / 2) * (0.8 + random() * 0.3)
      var px = centerX + Math.cos(angle) * radiusX + (random() - 0.5) * 3
      var py = centerY + Math.sin(angle) * radiusY + (random() - 0.5) * 3
      if (index === 0) context.moveTo(px, py)
      else context.lineTo(px, py)
    }
    context.closePath()
    context.fill()
  }
  /* drying edge */
  if (options.edge !== false) {
    context.globalAlpha = alpha * 0.5
    context.strokeStyle = color
    context.lineWidth = 1.4
    context.beginPath()
    for (var edge = 0; edge <= 12; edge += 1) {
      var edgeAngle = (edge / 12) * Math.PI * 2
      var ex = centerX + Math.cos(edgeAngle) * (width / 2) * (0.9 + random() * 0.16)
      var ey = centerY + Math.sin(edgeAngle) * (height / 2) * (0.9 + random() * 0.16)
      if (edge === 0) context.moveTo(ex, ey)
      else context.lineTo(ex, ey)
    }
    context.closePath()
    context.stroke()
  }
  /* granulation */
  if (options.grain !== false) {
    context.globalAlpha = alpha * 0.4
    context.fillStyle = color
    var grains = Math.round((width * height) / 60)
    for (var grain = 0; grain < grains; grain += 1) {
      var gx = centerX + (random() - 0.5) * width * 0.82
      var gy = centerY + (random() - 0.5) * height * 0.82
      context.fillRect(gx, gy, 1 + random(), 1 + random())
    }
  }
  context.restore()
}

/* A speckle of thrown paint. */
SKETCH.splatter = function (context, x, y, radius, color, seed, count) {
  var random = SKETCH.rng(seed === undefined ? 13 : seed)
  context.save()
  context.fillStyle = color || SKETCH.PLUM
  for (var index = 0; index < (count || 9); index += 1) {
    var angle = random() * Math.PI * 2
    var distance = Math.pow(random(), 1.6) * radius
    var px = x + Math.cos(angle) * distance
    var py = y + Math.sin(angle) * distance * 0.8
    context.globalAlpha = 0.35 + random() * 0.45
    SKETCH.dot(context, px, py, 0.6 + Math.pow(random(), 2) * 2.6, color || SKETCH.PLUM, seed + index)
  }
  context.restore()
}

/* A pale old stain soaked into the paper. */
SKETCH.stain = function (context, x, y, radius, seed) {
  var random = SKETCH.rng(seed === undefined ? 17 : seed)
  var gradient = context.createRadialGradient(x, y, radius * 0.2, x, y, radius)
  var strength = 0.03 + random() * 0.05
  gradient.addColorStop(0, 'rgba(150, 124, 84, ' + strength * 0.5 + ')')
  gradient.addColorStop(0.8, 'rgba(150, 124, 84, ' + strength + ')')
  gradient.addColorStop(1, 'rgba(150, 124, 84, 0)')
  context.save()
  context.fillStyle = gradient
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

/* A scratchy correction, scribbled over something. */
SKETCH.scribble = function (context, x, y, width, height, seed, color) {
  var random = SKETCH.rng(seed === undefined ? 19 : seed)
  var lines = 6 + Math.floor(random() * 6)
  for (var index = 0; index < lines; index += 1) {
    var y1 = y + random() * height
    var y2 = y + random() * height
    SKETCH.stroke(context, [
      [x + random() * width * 0.25, y1],
      [x + width * (0.6 + random() * 0.4), y2],
    ], { seed: seed + index * 7, color: color || 'rgba(28, 26, 24, 0.8)', width: 1.6 + random() * 1.4, amp: 1.6 })
  }
}

/* A drip running in from the top edge of the sheet. */
SKETCH.drip = function (context, x, length, color, seed) {
  var random = SKETCH.rng(seed === undefined ? 23 : seed)
  var lean = (random() - 0.5) * length * 0.25
  var widths = [5.5, 3.6, 2.2]
  for (var part = 0; part < 3; part += 1) {
    SKETCH.stroke(context, [
      [x + lean * (part / 3), length * (part / 3)],
      [x + lean * ((part + 1) / 3), length * ((part + 1) / 3)],
    ], { seed: seed + part, color: color, width: widths[part], amp: 1.6, step: 8 })
  }
  SKETCH.wash(context, x + lean - 5, length - 6, 11, 12, color, { seed: seed + 9, alpha: 0.7, layers: 2, grain: false })
  if (random() > 0.5) SKETCH.dot(context, x + lean + (random() - 0.5) * 14, length + 10 + random() * 16, 1.4, color, seed + 11)
}

/* An inked thumbprint: ridge lines clipped inside a print-shaped blob. */
SKETCH.thumbprint = function (context, centerX, centerY, radiusX, radiusY, color, seed) {
  var random = SKETCH.rng(seed === undefined ? 29 : seed)
  var ink = color || SKETCH.PLUM
  context.save()
  context.beginPath()
  var lobe = []
  for (var index = 0; index <= 14; index += 1) {
    var angle = (index / 14) * Math.PI * 2
    var rx = radiusX * (0.86 + random() * 0.26)
    var ry = radiusY * (0.86 + random() * 0.26)
    lobe.push([centerX + Math.cos(angle) * rx, centerY + Math.sin(angle) * ry])
  }
  context.moveTo(lobe[0][0], lobe[0][1])
  for (var point = 1; point < lobe.length; point += 1) context.lineTo(lobe[point][0], lobe[point][1])
  context.closePath()
  context.clip()

  var rings = Math.floor(Math.max(radiusX, radiusY) / 2.1)
  for (var ring = 1; ring <= rings; ring += 1) {
    var t = ring / rings
    var segment = []
    var gapAt = random()
    var gapWidth = 0.05 + random() * 0.16
    for (var arc = 0; arc <= 26; arc += 1) {
      var arcT = arc / 26
      if (Math.abs(arcT - gapAt) < gapWidth) {
        if (segment.length > 1) {
          SKETCH.stroke(context, segment, { seed: seed + ring * 31 + arc, color: ink, width: 1.1 + random() * 0.5, amp: 0.8, step: 4 })
        }
        segment = []
        continue
      }
      var arcAngle = arcT * Math.PI * 2
      segment.push([
        centerX + Math.cos(arcAngle) * radiusX * t * (0.95 + random() * 0.12) + (random() - 0.5) * 1.6,
        centerY + Math.sin(arcAngle) * radiusY * t * (0.95 + random() * 0.12) + (random() - 0.5) * 1.6,
      ])
    }
    if (segment.length > 1) {
      SKETCH.stroke(context, segment, { seed: seed + ring * 37, color: ink, width: 1.1 + random() * 0.5, amp: 0.8, step: 4 })
    }
  }
  context.restore()
  if (random() > 0.4) SKETCH.splatter(context, centerX + radiusX, centerY + radiusY * 0.8, radiusX * 0.9, ink, seed + 51, 4)
}

/* A bit of translucent tape. */
SKETCH.tape = function (context, x, y, width, angle, seed) {
  var random = SKETCH.rng(seed === undefined ? 9 : seed)
  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.fillStyle = 'rgba(233, 224, 200, 0.72)'
  context.strokeStyle = 'rgba(120, 106, 84, 0.18)'
  context.lineWidth = 1
  var height = width * 0.34
  context.beginPath()
  context.moveTo(-width / 2 + (random() - 0.5) * 3, -height / 2)
  context.lineTo(width / 2 + (random() - 0.5) * 3, -height / 2 + (random() - 0.5) * 2)
  context.lineTo(width / 2 + (random() - 0.5) * 3, height / 2)
  context.lineTo(-width / 2 + (random() - 0.5) * 3, height / 2 + (random() - 0.5) * 2)
  context.closePath()
  context.fill()
  context.stroke()
  context.restore()
}

/* ------------------------------------------------------------ paper stock */

var grainTiles = {}
function grainTile(seed) {
  if (grainTiles[seed]) return grainTiles[seed]
  var tile = document.createElement('canvas')
  tile.width = 224
  tile.height = 224
  var context = tile.getContext('2d')
  var random = SKETCH.rng(seed)
  /* fine tooth */
  for (var index = 0; index < 5200; index += 1) {
    var x = random() * tile.width
    var y = random() * tile.height
    var dark = random() > 0.46
    context.fillStyle = dark
      ? 'rgba(92, 78, 58, ' + (0.02 + random() * 0.05) + ')'
      : 'rgba(255, 255, 248, ' + (0.03 + random() * 0.08) + ')'
    context.fillRect(x, y, 0.8 + random() * 1.4, 0.8 + random() * 1.2)
  }
  /* pressed felt blotches */
  for (var blotch = 0; blotch < 260; blotch += 1) {
    var bx = random() * tile.width
    var by = random() * tile.height
    context.fillStyle = random() > 0.5
      ? 'rgba(104, 90, 68, ' + (0.012 + random() * 0.02) + ')'
      : 'rgba(255, 254, 246, ' + (0.02 + random() * 0.03) + ')'
    context.beginPath()
    context.ellipse(bx, by, 2 + random() * 4, 1.5 + random() * 3, random() * 3, 0, Math.PI * 2)
    context.fill()
  }
  grainTiles[seed] = tile
  return tile
}

/* Cover an area with paper texture. */
SKETCH.texture = function (context, width, height, seed) {
  var pattern = context.createPattern(grainTile(300 + ((seed || 0) % 3)), 'repeat')
  context.save()
  context.fillStyle = pattern
  context.fillRect(0, 0, width, height)
  context.restore()
}

/* The wear of a bad scan: broken specks along lines, stray marks, and the
   occasional tiny glitch of saturated colour. */
SKETCH.artifacts = function (context, width, height, seed) {
  var random = SKETCH.rng(seed === undefined ? 41 : seed)
  context.save()
  /* speck runs */
  var runs = 3 + Math.floor(random() * 4)
  for (var run = 0; run < runs; run += 1) {
    var y = random() * height
    var x = random() * width * 0.8
    var length = 30 + random() * 130
    var walked = 0
    context.fillStyle = 'rgba(24, 26, 38, ' + (0.3 + random() * 0.4) + ')'
    while (walked < length) {
      walked += 2 + random() * 9
      if (random() > 0.4) context.fillRect(x + walked, y + (random() - 0.5) * 2, 1 + random() * 3.5, 0.7 + random())
    }
  }
  /* stray specks */
  for (var speck = 0; speck < 26; speck += 1) {
    context.fillStyle = 'rgba(20, 22, 30, ' + (0.15 + random() * 0.35) + ')'
    context.fillRect(random() * width, random() * height, 0.6 + random() * 1.6, 0.6 + random() * 1.4)
  }
  /* one or two saturated glitches */
  var glitches = random() > 0.4 ? 2 : 1
  var colors = ['rgba(224, 32, 90, 0.85)', 'rgba(120, 200, 40, 0.85)', 'rgba(255, 210, 40, 0.9)', 'rgba(60, 60, 220, 0.7)']
  for (var glitch = 0; glitch < glitches; glitch += 1) {
    context.fillStyle = colors[Math.floor(random() * colors.length)]
    var gx = random() * width
    var gy = random() * height
    for (var chip = 0; chip < 3 + random() * 4; chip += 1) {
      context.fillRect(gx + (random() - 0.5) * 6, gy + (random() - 0.5) * 6, 1 + random() * 2.4, 1 + random() * 2)
    }
  }
  context.restore()
}

/* A printed line that has worn out: drawn as short inked pieces with gaps. */
function printedLine(context, x1, y1, x2, y2, color, width, random) {
  var length = Math.hypot(x2 - x1, y2 - y1)
  var walked = 0
  context.save()
  context.strokeStyle = color
  context.lineWidth = width
  context.lineCap = 'round'
  context.beginPath()
  while (walked < length) {
    var piece = 8 + random() * 26
    var gap = random() < 0.16 ? 2 + random() * 8 : 0
    var t1 = walked / length
    var t2 = Math.min(1, (walked + piece) / length)
    var wobble = (random() - 0.5) * 1.4
    context.moveTo(x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1 + wobble)
    context.lineTo(x1 + (x2 - x1) * t2, y1 + (y2 - y1) * t2 + wobble * 0.5)
    walked += piece + gap
  }
  context.stroke()
  context.restore()
}

/* Plain cream stock. */
SKETCH.plainPaper = function (context, width, height, options) {
  options = options || {}
  var seed = options.seed === undefined ? 61 : options.seed
  var random = SKETCH.rng(seed)
  context.fillStyle = options.tone || '#efe9da'
  context.fillRect(0, 0, width, height)
  SKETCH.texture(context, width, height, seed)
  var stains = options.stains === undefined ? 2 : options.stains
  for (var stain = 0; stain < stains; stain += 1) {
    SKETCH.stain(context, random() * width, random() * height, 24 + random() * 60, seed + stain * 7)
  }
}

/* Ledger stock: horizontal rules, a red head rule, faint column rules. */
SKETCH.ledgerPaper = function (context, width, height, options) {
  options = options || {}
  var seed = options.seed === undefined ? 67 : options.seed
  var random = SKETCH.rng(seed)
  SKETCH.plainPaper(context, width, height, { seed: seed, tone: options.tone || '#ece6d5', stains: 2 })

  var headY = options.headY === undefined ? 34 : options.headY
  if (options.headRule !== false) {
    printedLine(context, 0, headY, width, headY, 'rgba(172, 62, 48, 0.5)', 1.2, random)
    printedLine(context, 0, headY + 4, width, headY + 4, 'rgba(172, 62, 48, 0.42)', 1, random)
  }
  var gap = options.ruleGap || 26
  for (var y = headY + gap; y < height - 14; y += gap) {
    printedLine(context, 0, y, width, y, 'rgba(96, 112, 122, 0.34)', 1, random)
  }
  var columns = options.columns || [0.09, 0.53, 0.57, 0.9]
  columns.forEach(function (column) {
    printedLine(context, column * width, 0, column * width, height, 'rgba(96, 112, 122, 0.26)', 1, random)
  })
}

/* Graph stock: a light hand-printed grid. */
SKETCH.graphPaper = function (context, width, height, options) {
  options = options || {}
  var seed = options.seed === undefined ? 71 : options.seed
  var random = SKETCH.rng(seed)
  SKETCH.plainPaper(context, width, height, { seed: seed, tone: options.tone || '#eee9db', stains: 2 })
  var gap = options.gap || 19
  var color = options.gridColor || 'rgba(118, 168, 172, 0.42)'
  for (var x = gap; x < width; x += gap) {
    printedLine(context, x + (random() - 0.5) * 2, 0, x + (random() - 0.5) * 3, height, color, 0.9, random)
  }
  for (var y = gap; y < height; y += gap) {
    printedLine(context, 0, y + (random() - 0.5) * 2, width, y + (random() - 0.5) * 3, color, 0.9, random)
  }
}

/* Printed stationery marks: tiny letter-spaced caps. */
SKETCH.print = function (context, text, x, y, options) {
  options = options || {}
  SKETCH.letter.write(context, text, x, y, {
    size: options.size || 7.5,
    color: options.color || SKETCH.PRINT,
    seed: options.seed === undefined ? 73 : options.seed,
    tracking: options.tracking === undefined ? 0.85 : options.tracking,
    amp: 0.25,
    tilt: 0,
    align: options.align,
    width: options.width || 1,
  })
}

/* -------------------------------------------------------- plate framework */

/* Mount a drawing onto a container. spec:
   height(width)            -> sheet height for a given width
   draw(context, w, h, api) -> draw everything; register links via api.link
   onPointer(type, x, y, api, event)  (optional)
   state                    (optional bag, kept across redraws)
   aria                     -> description of the drawing for screen readers */
SKETCH.mount = function (container, spec) {
  var canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  if (spec.aria) canvas.setAttribute('aria-label', spec.aria)
  container.appendChild(canvas)

  var linkLayer = document.createElement('div')
  linkLayer.className = 'hotspots'
  container.appendChild(linkLayer)

  var api = {
    state: spec.state || {},
    canvas: canvas,
    container: container,
    width: 0,
    height: 0,
    hotspots: [],
    link: function (x, y, width, height, href, label) {
      api.hotspots.push({ x: x, y: y, width: width, height: height, href: href, label: label })
    },
    redraw: function () { draw() },
  }

  function syncHotspots() {
    linkLayer.textContent = ''
    api.hotspots.forEach(function (spot) {
      var anchor = document.createElement('a')
      anchor.href = spot.href
      anchor.setAttribute('aria-label', spot.label)
      anchor.title = spot.label
      /* the label again as clipped text, so crawlers see anchor text where
         the drawing only has lettering painted onto a canvas */
      var caption = document.createElement('span')
      caption.className = 'visually-hidden'
      caption.textContent = spot.label
      anchor.appendChild(caption)
      if (/^https?:/.test(spot.href)) {
        anchor.target = '_blank'
        anchor.rel = 'noreferrer'
      }
      anchor.style.left = (spot.x / api.width) * 100 + '%'
      anchor.style.top = (spot.y / api.height) * 100 + '%'
      anchor.style.width = (spot.width / api.width) * 100 + '%'
      anchor.style.height = (spot.height / api.height) * 100 + '%'
      linkLayer.appendChild(anchor)
    })
  }

  function draw() {
    var width = container.clientWidth
    if (!width) return
    var height = Math.round(spec.height(width))
    var ratio = Math.min(2, window.devicePixelRatio || 1)
    api.width = width
    api.height = height
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    var context = canvas.getContext('2d')
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    api.hotspots = []
    spec.draw(context, width, height, api)
    syncHotspots()
  }

  if (spec.onPointer) {
    var toLocal = function (event) {
      var bounds = canvas.getBoundingClientRect()
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * api.width,
        y: ((event.clientY - bounds.top) / bounds.height) * api.height,
      }
    }
    canvas.addEventListener('pointerdown', function (event) {
      canvas.setPointerCapture(event.pointerId)
      var point = toLocal(event)
      spec.onPointer('down', point.x, point.y, api, event)
    })
    canvas.addEventListener('pointermove', function (event) {
      var point = toLocal(event)
      spec.onPointer('move', point.x, point.y, api, event)
    })
    canvas.addEventListener('pointerup', function (event) {
      var point = toLocal(event)
      spec.onPointer('up', point.x, point.y, api, event)
    })
  }

  var pending = 0
  var observer = new ResizeObserver(function () {
    clearTimeout(pending)
    pending = setTimeout(function () {
      if (container.clientWidth !== api.width) draw()
    }, 120)
  })
  observer.observe(container)

  draw()
  return api
}

/* Save a drawing as a PNG. */
SKETCH.download = function (canvas, filename) {
  var link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/* The desk the sheets are lying on. */
SKETCH.deskBackground = function () {
  var tile = document.createElement('canvas')
  tile.width = 200
  tile.height = 200
  var context = tile.getContext('2d')
  context.fillStyle = SKETCH.DESK
  context.fillRect(0, 0, tile.width, tile.height)
  var random = SKETCH.rng(881)
  for (var index = 0; index < 1600; index += 1) {
    context.fillStyle = random() > 0.5
      ? 'rgba(88, 76, 56, ' + (0.01 + random() * 0.03) + ')'
      : 'rgba(255, 252, 240, ' + (0.015 + random() * 0.04) + ')'
    context.fillRect(random() * tile.width, random() * tile.height, 1 + random() * 2, 1 + random())
  }
  document.body.style.backgroundImage = 'url(' + tile.toDataURL() + ')'
}
