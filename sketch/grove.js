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

  /* A whole tree: pale trunk with dark flecked edges, a stack of crowns.
     weather (optional): 'sun' | 'rain' | 'snow' changes its coat. */
  GROVE.tree = function (context, x, baseY, height, seed, weather) {
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

    if (weather === 'snow') {
      /* snow settled along the top of the crown and out the branches */
      context.save()
      context.fillStyle = 'rgba(249, 249, 243, 0.8)'
      for (var cap = 0; cap < 5; cap += 1) {
        context.globalAlpha = 0.45 + random() * 0.35
        context.beginPath()
        context.ellipse(
          x + lean + (cap - 2) * mainRx * 0.42 + (random() - 0.5) * mainRx * 0.2,
          crownY - mainRy * (0.42 + (cap % 2) * 0.2) + (random() - 0.5) * mainRy * 0.15,
          mainRx * (0.24 + random() * 0.14), mainRy * (0.16 + random() * 0.1),
          (random() - 0.5) * 0.4, 0, Math.PI * 2,
        )
        context.fill()
      }
      context.restore()
      SKETCH.stroke(context, [
        [x - trunkWidth, baseY], [x + lean * 0.5 - trunkWidth * 0.8, baseY - height * 0.28],
      ], { seed: seed + 60, color: 'rgba(249, 249, 243, 0.6)', width: trunkWidth * 0.4, amp: 1 })
    } else if (weather === 'rain') {
      /* soaked: a cool sheen over the crown, a darker trunk */
      context.save()
      context.globalAlpha = 0.14
      context.fillStyle = '#3d4a52'
      context.beginPath()
      context.ellipse(x + lean, crownY, mainRx * 1.2, mainRy * 1.25, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
      SKETCH.pencil(context, [
        [x + trunkWidth * 0.3, baseY], [x + lean * 0.5 + trunkWidth * 0.2, baseY - height * 0.3],
      ], { seed: seed + 61, color: 'rgba(50, 56, 60, 0.5)', width: 1, amp: 0.6 })
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

  var SKIES = {
    sun: ['#f1ede1', '#ebe6d7', '#e0dac6'],
    rain: ['#e3e2d8', '#d5d7ce', '#c2c7bd'],
    snow: ['#f4f3ed', '#edece5', '#dfddd3'],
  }
  var FIELD_SETS = {
    sun: ['#d9c39a', '#a8a494', '#a5939c', '#b8bd9c', '#c4b892'],
    rain: ['#b0ab96', '#8f9490', '#8b8792', '#98a294', '#a5a292'],
    snow: ['#d8dce1', '#c6ccd4', '#cdc6cf', '#ced6d4', '#d2d4d8'],
  }

  function drawEnvironment(context, width, height, seed, weather) {
    var random = SKETCH.rng(seed)
    var skyStops = SKIES[weather] || SKIES.sun
    var sky = context.createLinearGradient(0, 0, 0, height)
    sky.addColorStop(0, skyStops[0])
    sky.addColorStop(0.65, skyStops[1])
    sky.addColorStop(1, skyStops[2])
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    SKETCH.texture(context, width, height, seed)

    /* weather: broad settled fields of colour */
    var fields = FIELD_SETS[weather] || FIELD_SETS.sun
    softField(context, width * 0.08, height * 0.5, width * 0.16, height * 0.3, fields[0], seed + 1)
    softField(context, width * 0.93, height * 0.42, width * 0.15, height * 0.34, fields[1], seed + 2)
    softField(context, width * 0.85, height * 0.12, width * 0.13, height * 0.14, fields[2], seed + 3)
    softField(context, width * 0.14, height * 0.14, width * 0.11, height * 0.12, fields[3], seed + 4)
    softField(context, width * 0.5, height * 0.97, width * 0.3, height * 0.08, fields[4], seed + 5)

    if (weather === 'snow') {
      /* drifts along the bottom of the window */
      context.save()
      context.fillStyle = 'rgba(248, 248, 243, 0.75)'
      for (var drift = 0; drift < 7; drift += 1) {
        context.globalAlpha = 0.4 + random() * 0.35
        context.beginPath()
        context.ellipse(width * random(), height - random() * height * 0.03, width * (0.1 + random() * 0.14), 12 + random() * 14, 0, 0, Math.PI * 2)
        context.fill()
      }
      context.restore()
    } else if (weather === 'rain') {
      /* standing water catching what light there is */
      for (var puddle = 0; puddle < 4; puddle += 1) {
        SKETCH.gouache(context, [
          [width * (0.1 + random() * 0.7), height - 8 - random() * height * 0.04],
          [width * (0.2 + random() * 0.7), height - 6 - random() * height * 0.04],
        ], { seed: seed + 60 + puddle, width: 4, color: 'rgba(212, 218, 218, 0.5)' })
      }
    }

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
    GROVE.tree(context, width * 0.04, height + 14, scale * (0.66 + random() * 0.2), seed + 100, weather)
    GROVE.tree(context, width * 0.115, height + 30, scale * (0.44 + random() * 0.16), seed + 130, weather)
    GROVE.tree(context, -width * 0.012, height * 0.86, scale * (0.5 + random() * 0.2), seed + 160, weather)

    GROVE.tree(context, width * 0.965, height + 12, scale * (0.72 + random() * 0.2), seed + 200, weather)
    GROVE.tree(context, width * 0.885, height + 34, scale * (0.42 + random() * 0.16), seed + 230, weather)
    GROVE.tree(context, width * 1.015, height * 0.8, scale * (0.52 + random() * 0.18), seed + 260, weather)

    /* small distant pair along the bottom */
    context.save()
    context.globalAlpha = 0.7
    GROVE.tree(context, width * 0.3, height + 16, scale * 0.26, seed + 300, weather)
    GROVE.tree(context, width * 0.68, height + 20, scale * 0.3, seed + 330, weather)
    context.restore()
  }

  /* Mount the environment behind everything, redrawn when the window
     changes shape. */
  var WEATHERS = ['sun', 'rain', 'snow']

  function loadWeather() {
    try {
      var fromUrl = new URLSearchParams(window.location.search).get('weather')
      if (WEATHERS.indexOf(fromUrl) >= 0) return fromUrl
      var stored = localStorage.getItem('sketch-weather')
      if (WEATHERS.indexOf(stored) >= 0) return stored
    } catch (error) { void error }
    return 'sun'
  }

  GROVE.environment = function () {
    var reducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    var weather = loadWeather()

    var canvas = document.createElement('canvas')
    canvas.id = 'grove'
    canvas.setAttribute('aria-hidden', 'true')
    document.body.insertBefore(canvas, document.body.firstChild)

    /* the precipitation lives on its own sheet over the grove */
    var precip = document.createElement('canvas')
    precip.id = 'precip'
    precip.setAttribute('aria-hidden', 'true')
    document.body.insertBefore(precip, canvas.nextSibling)

    /* and one great scrapbook butterfly on a sheet above everything */
    var flight = document.createElement('canvas')
    flight.id = 'butterfly'
    flight.setAttribute('aria-hidden', 'true')
    document.body.appendChild(flight)

    var seed = 7300 + Math.floor(Math.random() * 400)
    function draw() {
      var width = window.innerWidth
      var height = window.innerHeight
      var ratio = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      var context = canvas.getContext('2d')
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawEnvironment(context, width, height, seed, weather)
      precip.width = Math.round(width * ratio)
      precip.height = Math.round(height * ratio)
      flight.width = Math.round(width * ratio)
      flight.height = Math.round(height * ratio)
      butterflyParts = null
    }

    /* ------------------------------------------------- falling weather */
    var drops = []
    var raf = 0

    function seedDrops() {
      drops = []
      var random = SKETCH.rng(seed + 9)
      var count = weather === 'rain' ? 110 : weather === 'snow' ? 80 : 0
      for (var index = 0; index < count; index += 1) {
        drops.push({
          x: random(), y: random(),
          speed: weather === 'rain' ? 0.55 + random() * 0.35 : 0.05 + random() * 0.05,
          length: 7 + random() * 9,
          drift: weather === 'rain' ? 0.06 + random() * 0.04 : 0,
          radius: 1 + random() * 1.6,
          phase: random() * 7,
        })
      }
    }

    /* ---------------------------------------------- the one butterfly */
    var butterflyParts = null
    var butterflyPhase = 0

    function buildButterfly() {
      var span = SKETCH.clamp(window.innerWidth * 0.13, 96, 220)
      var wingWidth = Math.round(span * 0.55)
      var wingHeight = Math.round(span * 0.8)
      var wing = document.createElement('canvas')
      wing.width = wingWidth * 2
      wing.height = wingHeight * 2
      var context = wing.getContext('2d')
      context.setTransform(2, 0, 0, 2, 0, 0)

      var fore = [
        [3, wingHeight * 0.5], [wingWidth * 0.22, wingHeight * 0.14], [wingWidth * 0.68, wingHeight * 0.04],
        [wingWidth * 0.95, wingHeight * 0.2], [wingWidth * 0.82, wingHeight * 0.44], [wingWidth * 0.36, wingHeight * 0.52],
      ]
      var hind = [
        [3, wingHeight * 0.54], [wingWidth * 0.5, wingHeight * 0.5], [wingWidth * 0.72, wingHeight * 0.64],
        [wingWidth * 0.6, wingHeight * 0.86], [wingWidth * 0.3, wingHeight * 0.96], [wingWidth * 0.07, wingHeight * 0.74],
      ]

      function fillShape(points, color, grow) {
        var centerX = 0
        var centerY = 0
        points.forEach(function (point) { centerX += point[0] / points.length; centerY += point[1] / points.length })
        context.beginPath()
        points.forEach(function (point, index) {
          var x = centerX + (point[0] - centerX) * grow
          var y = centerY + (point[1] - centerY) * grow
          if (index === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        })
        context.closePath()
        context.fillStyle = color
        context.fill()
      }

      /* the paper it was cut from: a cream margin all round */
      fillShape(fore, '#f3eeda', 1.14)
      fillShape(hind, '#f3eeda', 1.16)
      /* the painted wings */
      fillShape(fore, '#d9a441', 1)
      fillShape(hind, '#6d4a5e', 1)
      /* granulation and scribble, like every wash on the site */
      var random = SKETCH.rng(4177)
      context.save()
      context.beginPath()
      fore.concat([fore[0]]).forEach(function (point, index) {
        if (index === 0) context.moveTo(point[0], point[1])
        else context.lineTo(point[0], point[1])
      })
      hind.concat([hind[0]]).forEach(function (point, index) {
        if (index === 0) context.moveTo(point[0], point[1])
        else context.lineTo(point[0], point[1])
      })
      context.clip()
      for (var grain = 0; grain < 260; grain += 1) {
        context.globalAlpha = 0.08 + random() * 0.16
        context.fillStyle = random() > 0.5 ? 'rgba(84, 56, 30, 1)' : 'rgba(255, 248, 230, 1)'
        context.fillRect(random() * wingWidth, random() * wingHeight, 1 + random() * 1.6, 1 + random() * 1.2)
      }
      context.globalAlpha = 1
      context.restore()
      /* cream spots */
      SKETCH.dot(context, wingWidth * 0.62, wingHeight * 0.2, wingWidth * 0.05, 'rgba(246, 240, 222, 0.95)', 4180)
      SKETCH.dot(context, wingWidth * 0.78, wingHeight * 0.3, wingWidth * 0.035, 'rgba(246, 240, 222, 0.9)', 4181)
      SKETCH.dot(context, wingWidth * 0.42, wingHeight * 0.72, wingWidth * 0.04, 'rgba(232, 220, 200, 0.9)', 4182)
      /* the ink that missed the paint */
      SKETCH.stroke(context, fore.concat([fore[0]]).map(function (point) { return [point[0] + 1.5, point[1] - 1] }), { seed: 4183, color: 'rgba(48, 42, 36, 0.9)', width: 2, amp: 1.2, step: 6 })
      SKETCH.stroke(context, hind.concat([hind[0]]).map(function (point) { return [point[0] + 1, point[1] + 1] }), { seed: 4184, color: 'rgba(48, 42, 36, 0.85)', width: 1.8, amp: 1.2, step: 6 })
      /* veins from the shoulder */
      SKETCH.stroke(context, [[4, wingHeight * 0.5], [wingWidth * 0.6, wingHeight * 0.16]], { seed: 4185, color: 'rgba(48, 42, 36, 0.5)', width: 1, amp: 0.8 })
      SKETCH.stroke(context, [[4, wingHeight * 0.5], [wingWidth * 0.78, wingHeight * 0.3]], { seed: 4186, color: 'rgba(48, 42, 36, 0.5)', width: 1, amp: 0.8 })
      SKETCH.stroke(context, [[4, wingHeight * 0.54], [wingWidth * 0.52, wingHeight * 0.78]], { seed: 4187, color: 'rgba(48, 42, 36, 0.5)', width: 1, amp: 0.8 })

      /* the body on its own little sheet */
      var body = document.createElement('canvas')
      var bodyWidth = Math.round(span * 0.1)
      var bodyHeight = Math.round(span * 0.52)
      body.width = bodyWidth * 2
      body.height = bodyHeight * 2
      var bodyContext = body.getContext('2d')
      bodyContext.setTransform(2, 0, 0, 2, 0, 0)
      SKETCH.stroke(bodyContext, [
        [bodyWidth * 0.5, bodyHeight * 0.22], [bodyWidth * 0.5, bodyHeight * 0.6], [bodyWidth * 0.5, bodyHeight * 0.92],
      ], { seed: 4190, color: 'rgba(52, 44, 36, 0.95)', width: bodyWidth * 0.5, amp: 0.6 })
      SKETCH.dot(bodyContext, bodyWidth * 0.5, bodyHeight * 0.18, bodyWidth * 0.26, 'rgba(52, 44, 36, 0.95)', 4191)
      SKETCH.stroke(bodyContext, [[bodyWidth * 0.46, bodyHeight * 0.14], [bodyWidth * 0.2, bodyHeight * 0.02]], { seed: 4192, color: 'rgba(52, 44, 36, 0.85)', width: 1.1, amp: 0.8 })
      SKETCH.stroke(bodyContext, [[bodyWidth * 0.54, bodyHeight * 0.14], [bodyWidth * 0.82, bodyHeight * 0.02]], { seed: 4193, color: 'rgba(52, 44, 36, 0.85)', width: 1.1, amp: 0.8 })

      butterflyParts = { wing: wing, body: body, wingWidth: wingWidth, wingHeight: wingHeight, bodyWidth: bodyWidth, bodyHeight: bodyHeight }
    }

    function drawButterfly(now) {
      if (!butterflyParts) buildButterfly()
      var parts = butterflyParts
      var width = window.innerWidth
      var height = window.innerHeight
      var ratio = Math.min(1.5, window.devicePixelRatio || 1)
      var context = flight.getContext('2d')
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      var t = now * 0.001
      /* it flutters in bursts, then glides */
      var effort = 0.5 + 0.5 * Math.sin(t * 0.9 + Math.sin(t * 0.31) * 1.7)
      butterflyPhase += (0.016) * (4 + 11 * effort)
      var fold = Math.sin(butterflyPhase)
      var spread = 0.18 + 0.82 * Math.abs(fold)

      var x = width * 0.5 + Math.sin(t * 0.19) * width * 0.15 + Math.sin(t * 0.047 + 2) * width * 0.06
      var y = height * 0.42 + Math.sin(t * 0.23 + 1) * height * 0.11 + fold * 3 - effort * 8
      var tilt = Math.cos(t * 0.19) * 0.16 + Math.sin(t * 0.09) * 0.08

      context.save()
      context.translate(x, y)
      context.rotate(tilt)
      context.globalAlpha = 0.96
      context.save()
      context.scale(-spread, 1)
      context.drawImage(parts.wing, 0, -parts.wingHeight / 2, parts.wingWidth, parts.wingHeight)
      context.restore()
      context.save()
      context.scale(spread, 1)
      context.drawImage(parts.wing, 0, -parts.wingHeight / 2, parts.wingWidth, parts.wingHeight)
      context.restore()
      context.drawImage(parts.body, -parts.bodyWidth / 2, -parts.bodyHeight * 0.4, parts.bodyWidth, parts.bodyHeight)
      context.restore()
    }

    var lastTick = 0
    function tick(now) {
      raf = 0
      drawButterfly(now)
      if (!drops.length) {
        raf = requestAnimationFrame(tick)
        return
      }
      var dt = Math.min(0.06, (now - lastTick) / 1000) || 0.016
      lastTick = now
      var width = window.innerWidth
      var height = window.innerHeight
      var ratio = Math.min(1.5, window.devicePixelRatio || 1)
      var context = precip.getContext('2d')
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      drops.forEach(function (drop) {
        drop.y += drop.speed * dt
        drop.x += drop.drift * dt
        if (drop.y > 1.02) { drop.y -= 1.06; drop.x = (drop.x + 0.13) % 1 }
        if (drop.x > 1.02) drop.x -= 1.04
        var dropX = drop.x * width
        var dropY = drop.y * height
        if (weather === 'rain') {
          context.strokeStyle = 'rgba(104, 116, 124, 0.3)'
          context.lineWidth = 1
          context.beginPath()
          context.moveTo(dropX, dropY)
          context.lineTo(dropX - drop.length * 0.22, dropY - drop.length)
          context.stroke()
        } else {
          var sway = Math.sin(drop.y * 9 + drop.phase) * 6
          context.globalAlpha = 0.55 + Math.sin(drop.phase + drop.y * 5) * 0.2
          context.fillStyle = 'rgba(252, 252, 248, 1)'
          context.beginPath()
          context.arc(dropX + sway, dropY, drop.radius, 0, Math.PI * 2)
          context.fill()
          context.globalAlpha = 1
        }
      })
      raf = requestAnimationFrame(tick)
    }

    function startWeather() {
      seedDrops()
      var context = precip.getContext('2d')
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, precip.width, precip.height)
      if (reducedMotion) {
        /* a still butterfly, wings open, for those who prefer stillness */
        drawButterfly(1200)
        return
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }

    /* ------------------------------------------------ the weather knob */
    var button = document.createElement('button')
    button.id = 'weather-toggle'
    var buttonCanvas = document.createElement('canvas')
    button.appendChild(buttonCanvas)
    document.body.appendChild(button)

    function drawButton() {
      var buttonWidth = 92
      var buttonHeight = 40
      var ratio = Math.min(2, window.devicePixelRatio || 1)
      buttonCanvas.width = buttonWidth * ratio
      buttonCanvas.height = buttonHeight * ratio
      buttonCanvas.style.width = buttonWidth + 'px'
      buttonCanvas.style.height = buttonHeight + 'px'
      var context = buttonCanvas.getContext('2d')
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      /* the glyph of the day */
      var glyphX = 14
      var glyphY = 19
      if (weather === 'sun') {
        SKETCH.stroke(context, [[glyphX - 5, glyphY], [glyphX - 3, glyphY - 4], [glyphX + 1, glyphY - 5], [glyphX + 5, glyphY - 2], [glyphX + 5, glyphY + 3], [glyphX + 1, glyphY + 5], [glyphX - 4, glyphY + 4], [glyphX - 5, glyphY]], { seed: 11, color: 'rgba(178, 122, 40, 0.9)', width: 1.4, amp: 0.5, step: 4 })
        for (var ray = 0; ray < 6; ray += 1) {
          var rayAngle = (ray / 6) * Math.PI * 2 + 0.3
          SKETCH.stroke(context, [
            [glyphX + Math.cos(rayAngle) * 7, glyphY + Math.sin(rayAngle) * 7],
            [glyphX + Math.cos(rayAngle) * 11, glyphY + Math.sin(rayAngle) * 11],
          ], { seed: 12 + ray, color: 'rgba(178, 122, 40, 0.8)', width: 1.2, amp: 0.4 })
        }
      } else if (weather === 'rain') {
        SKETCH.stroke(context, [[glyphX - 7, glyphY - 2], [glyphX - 5, glyphY - 6], [glyphX, glyphY - 7], [glyphX + 5, glyphY - 5], [glyphX + 7, glyphY - 1]], { seed: 21, color: 'rgba(96, 104, 112, 0.9)', width: 1.4, amp: 0.5, step: 4 })
        for (var drop = 0; drop < 3; drop += 1) {
          SKETCH.stroke(context, [
            [glyphX - 4 + drop * 4, glyphY + 2], [glyphX - 6 + drop * 4, glyphY + 8],
          ], { seed: 25 + drop, color: 'rgba(96, 110, 122, 0.85)', width: 1.3, amp: 0.3 })
        }
      } else {
        for (var flake = 0; flake < 3; flake += 1) {
          var flakeX = glyphX - 5 + flake * 5
          var flakeY = glyphY - 3 + (flake % 2) * 6
          for (var spoke = 0; spoke < 3; spoke += 1) {
            var spokeAngle = (spoke / 3) * Math.PI
            SKETCH.stroke(context, [
              [flakeX - Math.cos(spokeAngle) * 3, flakeY - Math.sin(spokeAngle) * 3],
              [flakeX + Math.cos(spokeAngle) * 3, flakeY + Math.sin(spokeAngle) * 3],
            ], { seed: 31 + flake * 3 + spoke, color: 'rgba(120, 130, 140, 0.9)', width: 1.1, amp: 0.2 })
          }
        }
      }

      var label = weather.toUpperCase()
      SKETCH.letter.write(context, label, 30, 22, { size: 9, seed: 41, color: SKETCH.INK_SOFT, tracking: 0.4 })
      SKETCH.rule(context, 29, 29, 32 + SKETCH.letter.measure(label, 9, 0.4), { seed: 42, color: SKETCH.PENCIL, width: 1.1, amp: 0.6 })
      button.setAttribute('aria-label', 'Change the weather (now: ' + weather + ')')
      button.title = 'Change the weather'
    }

    button.addEventListener('click', function () {
      weather = WEATHERS[(WEATHERS.indexOf(weather) + 1) % WEATHERS.length]
      try { localStorage.setItem('sketch-weather', weather) } catch (error) { void error }
      draw()
      drawButton()
      startWeather()
    })

    var pending = 0
    window.addEventListener('resize', function () {
      clearTimeout(pending)
      pending = setTimeout(function () {
        draw()
        startWeather()
      }, 180)
    })

    draw()
    drawButton()
    startWeather()
  }
})()
