/* grove.js — a pencil-and-wash grove: scribble-hatched crowns, pale trunks,
   flecks of ochre. It grows behind the book as the environment, and a few
   trees are planted inside the pages too. */
'use strict'

;(function () {
  var GROVE = window.SKETCH.grove = {}

  var TONES = [
    { fill: '#9a9891', hatch: 'rgba(74, 74, 70, 1)', accent: '#e0c23c' },
    { fill: '#d9c39a', hatch: 'rgba(140, 116, 76, 1)', accent: '#d98f3f' },
    { fill: '#8a7259', hatch: 'rgba(84, 66, 48, 1)', accent: '#d98f3f' },
    { fill: '#5f5246', hatch: 'rgba(48, 40, 32, 1)', accent: '#e0c23c' },
    { fill: '#c9b896', hatch: 'rgba(120, 104, 74, 1)', accent: '#c96a32' },
  ]

  function blobPath(context, centerX, centerY, radiusX, radiusY, random) {
    var points = 14
    context.beginPath()
    for (var index = 0; index <= points; index += 1) {
      var angle = (index / points) * Math.PI * 2
      var rx = radiusX * (0.78 + random() * 0.4)
      var ry = radiusY * (0.78 + random() * 0.4)
      var x = centerX + Math.cos(angle) * rx
      var y = centerY + Math.sin(angle) * ry
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath()
  }

  /* A scribble-hatched crown: wash base, dense pencil hatching, dark specks
     along the boundary, a few coloured flecks. */
  GROVE.crown = function (context, centerX, centerY, radiusX, radiusY, tone, seed) {
    var random = SKETCH.rng(seed)

    /* wash base, clipped */
    context.save()
    blobPath(context, centerX, centerY, radiusX, radiusY, random)
    context.clip()
    context.globalAlpha = 0.42
    context.fillStyle = tone.fill
    context.fillRect(centerX - radiusX * 1.5, centerY - radiusY * 1.5, radiusX * 3, radiusY * 3)

    /* hatch scribbles */
    var strokes = Math.round((radiusX * radiusY) / 26)
    context.lineCap = 'round'
    context.strokeStyle = tone.hatch
    for (var index = 0; index < strokes; index += 1) {
      var angle = random() * Math.PI * 2
      var distance = Math.sqrt(random())
      var x = centerX + Math.cos(angle) * radiusX * distance
      var y = centerY + Math.sin(angle) * radiusY * distance
      var length = 4 + random() * 11
      var direction = random() * Math.PI
      var bend = (random() - 0.5) * 6
      context.globalAlpha = 0.14 + random() * 0.3
      context.lineWidth = 0.7 + random() * 0.9
      context.beginPath()
      context.moveTo(x, y)
      context.quadraticCurveTo(
        x + Math.cos(direction) * length * 0.5 + bend,
        y + Math.sin(direction) * length * 0.5 - bend,
        x + Math.cos(direction) * length,
        y + Math.sin(direction) * length,
      )
      context.stroke()
    }

    /* inner grain */
    context.fillStyle = tone.hatch
    for (var grain = 0; grain < strokes / 3; grain += 1) {
      var grainAngle = random() * Math.PI * 2
      var grainDistance = Math.sqrt(random())
      context.globalAlpha = 0.1 + random() * 0.2
      context.fillRect(
        centerX + Math.cos(grainAngle) * radiusX * grainDistance,
        centerY + Math.sin(grainAngle) * radiusY * grainDistance,
        1 + random() * 1.6,
        1 + random(),
      )
    }
    context.restore()

    /* dark specks along the boundary */
    context.save()
    context.fillStyle = 'rgba(38, 34, 30, 1)'
    var edgeSpecks = Math.round(radiusX / 2.2)
    for (var speck = 0; speck < edgeSpecks; speck += 1) {
      var edgeAngle = random() * Math.PI * 2
      var wobble = 0.9 + (random() - 0.5) * 0.24
      context.globalAlpha = 0.2 + random() * 0.42
      context.fillRect(
        centerX + Math.cos(edgeAngle) * radiusX * wobble,
        centerY + Math.sin(edgeAngle) * radiusY * wobble,
        0.8 + random() * 1.8,
        0.8 + random() * 1.4,
      )
    }
    /* coloured flecks */
    context.fillStyle = tone.accent
    var flecks = 3 + Math.floor(random() * 6)
    for (var fleck = 0; fleck < flecks; fleck += 1) {
      var fleckAngle = random() * Math.PI * 2
      context.globalAlpha = 0.5 + random() * 0.4
      context.fillRect(
        centerX + Math.cos(fleckAngle) * radiusX * (0.75 + random() * 0.3),
        centerY + Math.sin(fleckAngle) * radiusY * (0.75 + random() * 0.3),
        1.2 + random() * 2,
        1 + random() * 1.6,
      )
    }
    context.restore()
  }

  /* A whole tree: pale trunk with dark flecked edges, a stack of crowns. */
  GROVE.tree = function (context, x, baseY, height, seed) {
    var random = SKETCH.rng(seed)
    var tone = TONES[Math.floor(random() * TONES.length)]
    var lean = (random() - 0.5) * height * 0.22
    var crownY = baseY - height * 0.68
    var trunkTop = baseY - height * 0.52

    /* trunk: pale gouache with dark pencil flecks along it */
    var trunkWidth = Math.max(2.5, height * 0.022)
    SKETCH.stroke(context, [
      [x, baseY],
      [x + lean * 0.5, baseY - height * 0.28],
      [x + lean, trunkTop],
    ], { seed: seed + 1, color: 'rgba(224, 217, 201, 0.92)', width: trunkWidth, amp: 1.4, step: 9 })
    SKETCH.pencil(context, [
      [x - trunkWidth * 0.5, baseY],
      [x + lean * 0.5 - trunkWidth * 0.4, baseY - height * 0.28],
      [x + lean - trunkWidth * 0.3, trunkTop],
    ], { seed: seed + 2, color: 'rgba(60, 54, 46, 0.85)', width: 1, amp: 0.8 })

    /* a branch or two */
    var branches = 1 + Math.floor(random() * 2)
    for (var branch = 0; branch < branches; branch += 1) {
      var branchY = baseY - height * (0.34 + random() * 0.18)
      var reach = (random() > 0.5 ? 1 : -1) * height * (0.1 + random() * 0.14)
      SKETCH.stroke(context, [
        [x + lean * 0.5, branchY],
        [x + lean * 0.5 + reach, branchY - height * (0.08 + random() * 0.08)],
      ], { seed: seed + 6 + branch, color: 'rgba(224, 217, 201, 0.85)', width: trunkWidth * 0.5, amp: 1 })
    }

    /* crowns: one main, a couple of satellites */
    var mainRx = height * (0.24 + random() * 0.1)
    var mainRy = height * (0.17 + random() * 0.08)
    GROVE.crown(context, x + lean, crownY, mainRx, mainRy, tone, seed + 10)
    var satellites = 1 + Math.floor(random() * 2)
    for (var satellite = 0; satellite < satellites; satellite += 1) {
      var satTone = random() > 0.6 ? TONES[Math.floor(random() * TONES.length)] : tone
      GROVE.crown(
        context,
        x + lean + (random() - 0.5) * mainRx * 1.9,
        crownY + (random() - 0.3) * mainRy * 1.4,
        mainRx * (0.4 + random() * 0.35),
        mainRy * (0.4 + random() * 0.35),
        satTone,
        seed + 20 + satellite * 7,
      )
    }
  }

  /* A little stand of trees, for planting inside pages. */
  GROVE.cluster = function (context, x, baseY, height, seed, count) {
    var random = SKETCH.rng(seed)
    var trees = count || 3
    for (var index = 0; index < trees; index += 1) {
      GROVE.tree(
        context,
        x + (index - (trees - 1) / 2) * height * (0.5 + random() * 0.25),
        baseY + (random() - 0.5) * height * 0.06,
        height * (0.72 + random() * 0.5),
        seed + index * 101,
      )
    }
  }

  /* ------------------------------------------------- the page environment */

  /* a soft granular field of colour, pigment settling into the paper */
  function softField(context, centerX, centerY, radiusX, radiusY, color, seed) {
    var random = SKETCH.rng(seed)
    context.save()
    context.fillStyle = color
    for (var layer = 0; layer < 20; layer += 1) {
      context.globalAlpha = 0.035 + random() * 0.05
      context.beginPath()
      context.ellipse(
        centerX + (random() + random() - 1) * radiusX * 0.5,
        centerY + (random() + random() - 1) * radiusY * 0.5,
        radiusX * (0.32 + random() * 0.4), radiusY * (0.32 + random() * 0.4),
        random() * 3, 0, Math.PI * 2,
      )
      context.fill()
    }
    for (var speck = 0; speck < 160; speck += 1) {
      var angle = random() * Math.PI * 2
      var reach = 0.55 + Math.pow(random(), 0.6) * 0.65
      context.globalAlpha = 0.06 + random() * 0.14
      context.fillRect(
        centerX + Math.cos(angle) * radiusX * reach,
        centerY + Math.sin(angle) * radiusY * reach,
        1 + random() * 2, 1 + random() * 1.6,
      )
    }
    context.restore()
  }

  function drawEnvironment(context, width, height, seed) {
    var random = SKETCH.rng(seed)
    var sky = context.createLinearGradient(0, 0, 0, height)
    sky.addColorStop(0, '#f1ede1')
    sky.addColorStop(0.65, '#ebe6d7')
    sky.addColorStop(1, '#e0dac6')
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    SKETCH.texture(context, width, height, seed)

    /* weather: broad settled fields of ochre, grey, and mauve */
    softField(context, width * 0.08, height * 0.5, width * 0.16, height * 0.3, '#d9c39a', seed + 1)
    softField(context, width * 0.93, height * 0.42, width * 0.15, height * 0.34, '#a8a494', seed + 2)
    softField(context, width * 0.85, height * 0.12, width * 0.13, height * 0.14, '#a5939c', seed + 3)
    softField(context, width * 0.14, height * 0.14, width * 0.11, height * 0.12, '#b8bd9c', seed + 4)
    softField(context, width * 0.5, height * 0.97, width * 0.3, height * 0.08, '#c4b892', seed + 5)

    /* two pale gouache passes low across the sheet */
    SKETCH.gouache(context, [
      [width * 0.04, height * 0.9], [width * 0.3, height * 0.905], [width * 0.5, height * 0.895],
    ], { seed: seed + 6, width: 9 })
    SKETCH.gouache(context, [
      [width * 0.55, height * 0.94], [width * 0.8, height * 0.935], [width * 0.97, height * 0.945],
    ], { seed: seed + 7, width: 7 })

    /* faint ground strokes */
    for (var ground = 0; ground < 8; ground += 1) {
      var groundY = height - random() * height * 0.09
      SKETCH.stroke(context, [
        [random() * width * 0.5, groundY],
        [width * (0.5 + random() * 0.5), groundY + (random() - 0.5) * 6],
      ], { seed: seed + 30 + ground, color: 'rgba(150, 138, 116, 0.2)', width: 2 + random() * 3, amp: 1.2, step: 16 })
    }
    for (var stain = 0; stain < 4; stain += 1) {
      SKETCH.stain(context, random() * width, random() * height, 40 + random() * 120, seed + 40 + stain)
    }

    /* groves hugging the edges, crowns bleeding off-screen */
    var scale = Math.max(height, 560)
    GROVE.tree(context, width * 0.04, height + 14, scale * (0.66 + random() * 0.2), seed + 100)
    GROVE.tree(context, width * 0.115, height + 30, scale * (0.44 + random() * 0.16), seed + 130)
    GROVE.tree(context, -width * 0.012, height * 0.86, scale * (0.5 + random() * 0.2), seed + 160)

    GROVE.tree(context, width * 0.965, height + 12, scale * (0.72 + random() * 0.2), seed + 200)
    GROVE.tree(context, width * 0.885, height + 34, scale * (0.42 + random() * 0.16), seed + 230)
    GROVE.tree(context, width * 1.015, height * 0.8, scale * (0.52 + random() * 0.18), seed + 260)

    /* small distant pair along the bottom */
    context.save()
    context.globalAlpha = 0.7
    GROVE.tree(context, width * 0.3, height + 16, scale * 0.26, seed + 300)
    GROVE.tree(context, width * 0.68, height + 20, scale * 0.3, seed + 330)
    context.restore()
  }

  /* Mount the environment behind everything, redrawn when the window
     changes shape. */
  GROVE.environment = function () {
    var canvas = document.createElement('canvas')
    canvas.id = 'grove'
    canvas.setAttribute('aria-hidden', 'true')
    document.body.insertBefore(canvas, document.body.firstChild)

    var seed = 7300 + Math.floor(Math.random() * 400)
    function draw() {
      var width = window.innerWidth
      var height = window.innerHeight
      var ratio = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      var context = canvas.getContext('2d')
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawEnvironment(context, width, height, seed)
    }

    var pending = 0
    window.addEventListener('resize', function () {
      clearTimeout(pending)
      pending = setTimeout(draw, 180)
    })
    draw()
  }
})()
