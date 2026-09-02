/* art.js — artworks between the pages of the book. Each one is generated
   fresh: click the drawing to make a new one. */
'use strict'

;(function () {
  var ART = window.SKETCH.art = {}
  var write = function () { return SKETCH.letter.write.apply(null, arguments) }
  var measure = function () { return SKETCH.letter.measure.apply(null, arguments) }

  /* ------------------------------------------------------ shared foliage */

  function mixColor(a, b, t) {
    var pa = parseInt(a.slice(1), 16)
    var pb = parseInt(b.slice(1), 16)
    var r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t)
    var g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t)
    var bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t)
    return 'rgb(' + r + ',' + g + ',' + bl + ')'
  }

  /* A clump of little painted leaves. */
  function leafClump(context, x, y, radius, dark, light, seed) {
    var random = SKETCH.rng(seed)
    var marks = Math.round(radius * 2.4)
    for (var mark = 0; mark < marks; mark += 1) {
      var angle = random() * Math.PI * 2
      var distance = Math.sqrt(random()) * radius
      var markX = x + Math.cos(angle) * distance
      var markY = y + Math.sin(angle) * distance * 0.85
      /* leaves near the top of the clump catch the light */
      var lift = SKETCH.clamp(0.5 - (markY - y) / (radius * 1.6), 0, 1)
      context.fillStyle = mixColor(dark, light, SKETCH.clamp(lift + (random() - 0.5) * 0.5, 0, 1))
      context.globalAlpha = 0.55 + random() * 0.4
      context.save()
      context.translate(markX, markY)
      context.rotate(random() * Math.PI)
      context.beginPath()
      context.ellipse(0, 0, 1 + random() * 2.2, 0.7 + random() * 1.2, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
    context.globalAlpha = 1
  }

  /* A soft granular bloom of colour: pigment settling into the paper,
     like the blots in the WORKING PLAN reference. */
  function softBloom(context, centerX, centerY, radiusX, radiusY, color, seed) {
    var random = SKETCH.rng(seed)
    context.save()
    context.fillStyle = color
    for (var layer = 0; layer < 22; layer += 1) {
      context.globalAlpha = 0.05 + random() * 0.06
      context.beginPath()
      context.ellipse(
        centerX + (random() + random() - 1) * radiusX * 0.5,
        centerY + (random() + random() - 1) * radiusY * 0.5,
        radiusX * (0.3 + random() * 0.4), radiusY * (0.3 + random() * 0.4),
        random() * 3, 0, Math.PI * 2,
      )
      context.fill()
    }
    for (var speck = 0; speck < radiusX * 1.4; speck += 1) {
      var angle = random() * Math.PI * 2
      var reach = 0.6 + Math.pow(random(), 0.6) * 0.6
      context.globalAlpha = 0.08 + random() * 0.2
      context.fillRect(
        centerX + Math.cos(angle) * radiusX * reach,
        centerY + Math.sin(angle) * radiusY * reach,
        0.8 + random() * 1.6, 0.8 + random() * 1.4,
      )
    }
    context.restore()
  }

  /* ---------------------------------------------------------------- room */
  /* A pale, empty room with trees and grass growing out of the carpet —
     painted in the same pencil-and-wash hand as the grove outside. */

  ART.room = function (data) {
    var state = { seed: 907 }

    function drawRoom(context, width, height, seed) {
      var random = SKETCH.rng(seed)

      /* one-point perspective: a back wall and four receding edges */
      var back = {
        left: width * (0.26 + random() * 0.04),
        right: width * (0.7 + random() * 0.04),
        top: height * (0.24 + random() * 0.04),
        bottom: height * (0.66 + random() * 0.03),
      }

      function fillPolygon(points, color) {
        context.save()
        context.fillStyle = color
        context.beginPath()
        points.forEach(function (point, index) {
          if (index === 0) context.moveTo(point[0], point[1])
          else context.lineTo(point[0], point[1])
        })
        context.closePath()
        context.fill()
        context.restore()
      }

      /* the rooms of the room: ceiling, walls, carpet */
      fillPolygon([[0, 0], [width, 0], [back.right, back.top], [back.left, back.top]], '#efe9d8')
      fillPolygon([[0, 0], [back.left, back.top], [back.left, back.bottom], [0, height]], '#e7ddbf')
      fillPolygon([[width, 0], [back.right, back.top], [back.right, back.bottom], [width, height]], '#e3d8b8')
      fillPolygon([[back.left, back.top], [back.right, back.top], [back.right, back.bottom], [back.left, back.bottom]], '#eae0c2')
      fillPolygon([[0, height], [back.left, back.bottom], [back.right, back.bottom], [width, height]], '#dccfa9')
      SKETCH.texture(context, width, height, seed)

      /* carpet speckle, denser up close */
      context.save()
      context.beginPath()
      context.moveTo(0, height)
      context.lineTo(back.left, back.bottom)
      context.lineTo(back.right, back.bottom)
      context.lineTo(width, height)
      context.closePath()
      context.clip()
      for (var pile = 0; pile < 900; pile += 1) {
        var pileT = Math.pow(random(), 0.6)
        var pileY = back.bottom + pileT * (height - back.bottom)
        context.fillStyle = random() > 0.5 ? 'rgba(150, 130, 92, 0.16)' : 'rgba(246, 240, 220, 0.2)'
        context.fillRect(random() * width, pileY, 1 + random() * 2, 1 + random())
      }
      context.restore()

      /* pencil edges, drawn like everything else */
      var edgeColor = 'rgba(96, 88, 74, 0.6)'
      SKETCH.pencil(context, [[0, 0], [back.left, back.top]], { seed: seed + 1, color: edgeColor, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [[width, 0], [back.right, back.top]], { seed: seed + 2, color: edgeColor, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [[0, height], [back.left, back.bottom]], { seed: seed + 3, color: edgeColor, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [[width, height], [back.right, back.bottom]], { seed: seed + 4, color: edgeColor, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [
        [back.left, back.top], [back.right, back.top], [back.right, back.bottom],
        [back.left, back.bottom], [back.left, back.top],
      ], { seed: seed + 5, color: edgeColor, width: 1.3, amp: 1 })

      /* wall seams and a skirting line */
      for (var seam = 1; seam < 4; seam += 1) {
        var seamT = seam / 4
        SKETCH.pencil(context, [
          [back.left * seamT, back.top * seamT],
          [back.left * seamT, height - (height - back.bottom) * seamT],
        ], { seed: seed + 10 + seam, color: 'rgba(120, 110, 88, 0.28)', width: 1, amp: 1 })
        SKETCH.pencil(context, [
          [width - (width - back.right) * seamT, back.top * seamT],
          [width - (width - back.right) * seamT, height - (height - back.bottom) * seamT],
        ], { seed: seed + 15 + seam, color: 'rgba(120, 110, 88, 0.28)', width: 1, amp: 1 })
      }
      SKETCH.pencil(context, [[back.left, back.bottom - 7], [back.right, back.bottom - 7]], { seed: seed + 19, color: 'rgba(110, 100, 80, 0.4)', width: 1.2, amp: 0.8 })

      /* a crack wandering out of the ceiling, and a water stain under it */
      SKETCH.pencil(context, [
        [width * (0.3 + random() * 0.2), 0],
        [width * (0.34 + random() * 0.2), back.top * 0.4],
        [width * (0.3 + random() * 0.24), back.top * 0.8],
      ], { seed: seed + 21, color: 'rgba(96, 86, 68, 0.5)', width: 1.2, amp: 2 })
      SKETCH.stain(context, back.left + (back.right - back.left) * 0.24, back.top + 30, 46, seed + 22)
      for (var streak = 0; streak < 3; streak += 1) {
        SKETCH.pencil(context, [
          [back.left + (back.right - back.left) * (0.2 + streak * 0.03), back.top + 4],
          [back.left + (back.right - back.left) * (0.2 + streak * 0.03) + (random() - 0.5) * 4, back.top + 30 + random() * 40],
        ], { seed: seed + 23 + streak, color: 'rgba(140, 124, 92, 0.3)', width: 1, amp: 0.8 })
      }

      /* fluorescent panels on the ceiling, one flickering a fleck of yellow */
      var panels = 3
      for (var panel = 0; panel < panels; panel += 1) {
        var panelT = (panel + 0.6) / (panels + 0.4)
        var panelY = back.top * panelT * 0.82
        var panelHalf = width * (0.09 + (1 - panelT) * 0.1)
        var panelX = width / 2 + (panel - 1) * width * 0.002
        context.save()
        context.globalAlpha = 0.85
        context.fillStyle = '#f8f4e6'
        context.fillRect(panelX - panelHalf, panelY, panelHalf * 2, 10 + (1 - panelT) * 8)
        context.restore()
        SKETCH.pencil(context, [
          [panelX - panelHalf, panelY], [panelX + panelHalf, panelY],
          [panelX + panelHalf, panelY + 10 + (1 - panelT) * 8], [panelX - panelHalf, panelY + 10 + (1 - panelT) * 8],
          [panelX - panelHalf, panelY],
        ], { seed: seed + 30 + panel, color: 'rgba(110, 100, 82, 0.4)', width: 1, amp: 0.7 })
        if (random() > 0.5) {
          context.save()
          context.globalAlpha = 0.5
          context.fillStyle = '#e0c23c'
          context.fillRect(panelX - panelHalf + random() * panelHalf * 2, panelY + 4, 3, 2)
          context.restore()
        }
      }

      /* a dark doorway, ajar, far off in the back wall */
      var doorWidth = (back.right - back.left) * 0.13
      var doorX = back.left + (back.right - back.left) * (0.68 + random() * 0.12)
      var doorTop = back.top + (back.bottom - back.top) * 0.28
      context.save()
      context.fillStyle = 'rgba(84, 74, 58, 0.82)'
      context.fillRect(doorX, doorTop, doorWidth, back.bottom - doorTop - 2)
      context.fillStyle = 'rgba(52, 45, 36, 0.6)'
      context.fillRect(doorX + doorWidth * 0.6, doorTop, doorWidth * 0.4, back.bottom - doorTop - 2)
      context.restore()
      SKETCH.pencil(context, [
        [doorX, back.bottom - 2], [doorX, doorTop], [doorX + doorWidth, doorTop], [doorX + doorWidth, back.bottom - 2],
      ], { seed: seed + 40, color: 'rgba(70, 62, 50, 0.7)', width: 1.2, amp: 0.8 })

      /* corner glooms */
      SKETCH.stain(context, 0, height, Math.min(width, height) * 0.4, seed + 45)
      SKETCH.stain(context, width, height, Math.min(width, height) * 0.36, seed + 46)
      SKETCH.stain(context, width * 0.5, 0, Math.min(width, height) * 0.3, seed + 47)

      /* the room darkens toward its edges, in soft gradients */
      var gloomLeft = context.createLinearGradient(0, 0, width * 0.22, 0)
      gloomLeft.addColorStop(0, 'rgba(96, 84, 60, 0.18)')
      gloomLeft.addColorStop(1, 'rgba(96, 84, 60, 0)')
      context.fillStyle = gloomLeft
      context.fillRect(0, 0, width * 0.22, height)
      var gloomRight = context.createLinearGradient(width, 0, width * 0.78, 0)
      gloomRight.addColorStop(0, 'rgba(96, 84, 60, 0.18)')
      gloomRight.addColorStop(1, 'rgba(96, 84, 60, 0)')
      context.fillStyle = gloomRight
      context.fillRect(width * 0.78, 0, width * 0.22, height)
      var gloomDown = context.createLinearGradient(0, height, 0, height * 0.78)
      gloomDown.addColorStop(0, 'rgba(80, 70, 48, 0.2)')
      gloomDown.addColorStop(1, 'rgba(80, 70, 48, 0)')
      context.fillStyle = gloomDown
      context.fillRect(0, height * 0.78, width, height * 0.22)

      /* pigment weather: violet blooms settling on the wall and carpet */
      softBloom(context, back.left + (back.right - back.left) * 0.32, back.top + (back.bottom - back.top) * 0.42, 56, 42, '#8a7590', seed + 48)
      softBloom(context, width * 0.63, height * 0.87, 76, 30, '#8a7590', seed + 49)
      var ringPoints = []
      for (var gouacheStep = 0; gouacheStep <= 26; gouacheStep += 1) {
        var gouacheAngle = (gouacheStep / 26) * Math.PI * 1.7 + 0.4
        ringPoints.push([width * 0.63 + Math.cos(gouacheAngle) * 62, height * 0.87 + Math.sin(gouacheAngle) * 26])
      }
      SKETCH.gouache(context, ringPoints, { seed: seed + 50, width: 7 })

      /* pools of light on the carpet under the panels */
      for (var pool = 0; pool < 3; pool += 1) {
        var poolX = width / 2 + (pool - 1) * width * 0.17
        var poolY = back.bottom + (height - back.bottom) * (0.3 + pool * 0.09)
        var poolGlow = context.createRadialGradient(poolX, poolY, 4, poolX, poolY, width * 0.09)
        poolGlow.addColorStop(0, 'rgba(250, 246, 226, 0.2)')
        poolGlow.addColorStop(1, 'rgba(250, 246, 226, 0)')
        context.fillStyle = poolGlow
        context.fillRect(poolX - width * 0.1, poolY - width * 0.06, width * 0.2, width * 0.12)
      }

      /* ivy creeping along the skirting and up the far corner */
      for (var creep = 0; creep < 26; creep += 1) {
        leafClump(
          context,
          back.left + (back.right - back.left) * random(),
          back.bottom - 4 - random() * 8,
          3 + random() * 5,
          '#3f5c33', '#8fae5e', seed + 50 + creep,
        )
      }
      for (var climb = 0; climb < 10; climb += 1) {
        leafClump(
          context,
          back.left + 4 + random() * 10,
          back.bottom - 10 - climb * ((back.bottom - back.top) * 0.06) - random() * 8,
          2.5 + random() * (4 - climb * 0.25),
          '#3f5c33', '#8fae5e', seed + 80 + climb,
        )
      }

      /* grass, pushing up through the carpet — thicker up close */
      var tufts = 110 + Math.floor(random() * 50)
      var grassTones = ['rgba(123, 139, 78, 0.8)', 'rgba(166, 173, 139, 0.8)', 'rgba(150, 138, 90, 0.7)', 'rgba(95, 110, 66, 0.8)']
      for (var tuft = 0; tuft < tufts; tuft += 1) {
        var depth = Math.pow(random(), 0.65)
        var tuftY = back.bottom + 4 + depth * (height - back.bottom - 8)
        var tuftX = random() * width
        if (tuftY < back.bottom + 6) continue
        var blades = 3 + Math.floor(random() * 3)
        var tall = (3 + depth * 13) * (1 + random() * 0.5)
        var tone = grassTones[Math.floor(random() * grassTones.length)]
        for (var blade = 0; blade < blades; blade += 1) {
          var leanBlade = (random() - 0.5) * tall * 0.8
          SKETCH.stroke(context, [
            [tuftX + (blade - blades / 2) * 1.6, tuftY],
            [tuftX + (blade - blades / 2) * 1.6 + leanBlade, tuftY - tall * (0.7 + random() * 0.5)],
          ], { seed: seed + 60 + tuft * 7 + blade, color: tone, width: 0.9 + depth, amp: 0.6 })
        }
      }

      /* the trees, small in the distance, tall up close */
      SKETCH.grove.tree(context, back.left + (back.right - back.left) * 0.22, back.bottom - 2, (back.bottom - back.top) * 0.7, seed + 100)
      SKETCH.grove.tree(context, back.left + (back.right - back.left) * 0.46, back.bottom + 4, (back.bottom - back.top) * 0.5, seed + 130)
      SKETCH.grove.tree(context, width * 0.17, height * 0.92, height * 0.42, seed + 160)
      SKETCH.grove.tree(context, width * 0.8, height * 0.99, height * 0.56, seed + 200)

      /* drifting dust in the light */
      context.save()
      context.fillStyle = 'rgba(120, 108, 86, 0.4)'
      for (var mote = 0; mote < 22; mote += 1) {
        context.globalAlpha = 0.14 + random() * 0.3
        context.fillRect(random() * width, random() * height * 0.6, 1 + random(), 1 + random())
      }
      context.restore()
    }

    return {
      state: state,
      aria: 'An artwork: a pale, empty back room with drawn trees and grass growing out of the carpet, regrown on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height) {
        SKETCH.plainPaper(context, width, height, { seed: 903, tone: '#efece1' })
        drawRoom(context, width, height, state.seed)
        write(context, data.title, 26, 28, { size: 12, media: 'pencil', seed: 901, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 38, 26 + measure(data.title, 12, 0.4) + 8, { seed: 902, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.date, 26 + measure(data.title, 12, 0.4) + 20, 28, { size: 8.5, media: 'pencil', seed: 904 })
        write(context, 'CLICK TO REGROW', 26, 48, { size: 7, color: SKETCH.GREEN_PEN, seed: 906 })
        SKETCH.artifacts(context, width, height, 908 + state.seed)
      },
      onPointer: function (type, x, y, api) {
        if (type === 'move') { api.canvas.style.cursor = 'pointer'; return }
        if (type !== 'down') return
        state.seed = Math.floor(Math.random() * 999983)
        api.redraw()
      },
    }
  }

  /* --------------------------------------------------------------- court */
  /* A sunken court deep in a forest, painted as a plate on the page:
     matte muted colour, ink outlines that miss their fills, scribble
     hatching, granular shadow, and paper eating the edges. */

  ART.court = function (data) {
    var state = { seed: 1213 }

    /* a muted, grey-leaning palette */
    var LEAF_DARK = '#3e4f33'
    var LEAF_MID = '#5f7345'
    var LEAF_LIGHT = '#8ba05c'
    var LEAF_SUNLIT = '#bac683'
    var INK = 'rgba(50, 52, 44, 0.8)'

    /* a soft granular mass, like pigment dust settling */
    function softMass(context, centerX, centerY, radiusX, radiusY, color, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      context.fillStyle = color
      for (var layer = 0; layer < 34; layer += 1) {
        var offsetX = (random() + random() - 1) * radiusX * 0.5
        var offsetY = (random() + random() - 1) * radiusY * 0.5
        context.globalAlpha = 0.09 + random() * 0.08
        context.beginPath()
        context.ellipse(centerX + offsetX, centerY + offsetY, radiusX * (0.3 + random() * 0.4), radiusY * (0.3 + random() * 0.4), random() * 3, 0, Math.PI * 2)
        context.fill()
      }
      /* dust halo */
      for (var speck = 0; speck < radiusX * 1.2; speck += 1) {
        var angle = random() * Math.PI * 2
        var reach = 0.7 + Math.pow(random(), 0.5) * 0.55
        context.globalAlpha = 0.08 + random() * 0.2
        context.fillRect(
          centerX + Math.cos(angle) * radiusX * reach,
          centerY + Math.sin(angle) * radiusY * reach,
          0.8 + random() * 1.6, 0.8 + random() * 1.4,
        )
      }
      context.restore()
    }

    /* diagonal hatch shading clipped to a rectangle */
    function hatchRect(context, x, y, rectWidth, rectHeight, spacing, color, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      context.beginPath()
      context.rect(x, y, rectWidth, rectHeight)
      context.clip()
      context.strokeStyle = color
      context.lineWidth = 0.9
      for (var line = -rectHeight; line < rectWidth; line += spacing) {
        context.globalAlpha = 0.3 + random() * 0.3
        context.beginPath()
        context.moveTo(x + line + (random() - 0.5) * 2, y - 2)
        context.lineTo(x + line + rectHeight * 0.6 + (random() - 0.5) * 3, y + rectHeight + 2)
        context.stroke()
      }
      context.restore()
    }

    /* an ink line that has slipped off its fill a little */
    function inkLine(context, points, seed, offsetX, offsetY, width) {
      SKETCH.stroke(context, points.map(function (point) {
        return [point[0] + offsetX, point[1] + offsetY]
      }), { seed: seed, color: INK, width: width || 1.6, amp: 1.6, step: 9 })
    }

    /* A canopy mass built from dust, clumps, scribble, and a few drawn
       leaf outlines — no hard edge anywhere. */
    function canopy(context, centerX, centerY, radiusX, radiusY, sunlit, seed) {
      var random = SKETCH.rng(seed)
      softMass(context, centerX, centerY, radiusX * 1.06, radiusY * 1.1, '#31402b', seed)
      softMass(context, centerX, centerY, radiusX * 0.82, radiusY * 0.85, '#273521', seed + 1)

      var clumps = Math.round((radiusX * radiusY) / 200)
      for (var clump = 0; clump < clumps; clump += 1) {
        var angle = random() * Math.PI * 2
        var distance = Math.pow(random(), 0.7)
        var clumpX = centerX + Math.cos(angle) * radiusX * distance
        var clumpY = centerY + Math.sin(angle) * radiusY * distance
        var top = SKETCH.clamp(0.5 - (clumpY - centerY) / (radiusY * 1.8), 0, 1)
        leafClump(
          context, clumpX, clumpY, 5 + random() * 12,
          LEAF_DARK,
          top > 0.55 && sunlit ? LEAF_SUNLIT : top > 0.3 ? LEAF_LIGHT : LEAF_MID,
          seed + 900 + clump,
        )
      }

      /* scribble hatch through the middle, like the grove crowns */
      context.save()
      context.strokeStyle = 'rgba(42, 52, 38, 1)'
      context.lineCap = 'round'
      var scribbles = Math.round((radiusX * radiusY) / 160)
      for (var scribble = 0; scribble < scribbles; scribble += 1) {
        var scribbleAngle = random() * Math.PI * 2
        var scribbleDistance = Math.sqrt(random()) * 0.9
        var sx = centerX + Math.cos(scribbleAngle) * radiusX * scribbleDistance
        var sy = centerY + Math.sin(scribbleAngle) * radiusY * scribbleDistance
        var direction = random() * Math.PI
        var length = 4 + random() * 10
        context.globalAlpha = 0.12 + random() * 0.26
        context.lineWidth = 0.7 + random() * 0.8
        context.beginPath()
        context.moveTo(sx, sy)
        context.quadraticCurveTo(
          sx + Math.cos(direction) * length * 0.5 + (random() - 0.5) * 5,
          sy + Math.sin(direction) * length * 0.5 - (random() - 0.5) * 5,
          sx + Math.cos(direction) * length,
          sy + Math.sin(direction) * length,
        )
        context.stroke()
      }
      context.restore()

      /* a few drawn leaves along the lit edges */
      for (var drawn = 0; drawn < 9; drawn += 1) {
        var drawnAngle = -Math.PI * (0.15 + random() * 0.7)
        var leafX = centerX + Math.cos(drawnAngle) * radiusX * (0.72 + random() * 0.3)
        var leafY = centerY + Math.sin(drawnAngle) * radiusY * (0.72 + random() * 0.3)
        var tilt = random() * Math.PI
        var size = 3 + random() * 4
        SKETCH.stroke(context, [
          [leafX - Math.cos(tilt) * size, leafY - Math.sin(tilt) * size],
          [leafX - Math.sin(tilt) * size * 0.5, leafY + Math.cos(tilt) * size * 0.5],
          [leafX + Math.cos(tilt) * size, leafY + Math.sin(tilt) * size],
          [leafX + Math.sin(tilt) * size * 0.5, leafY - Math.cos(tilt) * size * 0.5],
          [leafX - Math.cos(tilt) * size, leafY - Math.sin(tilt) * size],
        ], { seed: seed + 40 + drawn, color: 'rgba(46, 54, 40, 0.7)', width: 0.9, amp: 0.5, step: 4 })
      }
    }

    /* A trunk: matte fill, then ink contours that have slipped sideways. */
    function trunk(context, x, baseY, topY, thickness, seed) {
      var random = SKETCH.rng(seed)
      var lean = (random() - 0.5) * thickness * 3

      context.save()
      context.fillStyle = random() > 0.5 ? '#6b5d4b' : '#5d5142'
      context.beginPath()
      context.moveTo(x - thickness / 2, baseY)
      context.quadraticCurveTo(x + lean * 0.4 - thickness * 0.42, (baseY + topY) / 2, x + lean - thickness * 0.32, topY)
      context.lineTo(x + lean + thickness * 0.32, topY)
      context.quadraticCurveTo(x + lean * 0.4 + thickness * 0.42, (baseY + topY) / 2, x + thickness / 2, baseY)
      context.closePath()
      context.fill()
      /* shaded side */
      context.globalAlpha = 0.4
      context.fillStyle = '#42392e'
      context.beginPath()
      context.moveTo(x - thickness / 2, baseY)
      context.quadraticCurveTo(x + lean * 0.4 - thickness * 0.42, (baseY + topY) / 2, x + lean - thickness * 0.32, topY)
      context.lineTo(x + lean - thickness * 0.08, topY)
      context.quadraticCurveTo(x + lean * 0.4 - thickness * 0.14, (baseY + topY) / 2, x - thickness * 0.14, baseY)
      context.closePath()
      context.fill()
      context.restore()

      /* the slipped ink contours */
      var slipX = (random() - 0.5) * 4
      inkLine(context, [
        [x - thickness / 2, baseY],
        [x + lean * 0.4 - thickness * 0.42, (baseY + topY) / 2],
        [x + lean - thickness * 0.32, topY],
      ], seed + 2, slipX, 0, 1.4)
      inkLine(context, [
        [x + thickness / 2, baseY],
        [x + lean * 0.4 + thickness * 0.42, (baseY + topY) / 2],
        [x + lean + thickness * 0.32, topY],
      ], seed + 3, slipX * 0.6, 1, 1.2)

      /* bark: short curved cross-strokes */
      var barkMarks = Math.round((baseY - topY) / 6)
      context.save()
      context.lineCap = 'round'
      for (var bark = 0; bark < barkMarks; bark += 1) {
        var barkT = random()
        var barkY = topY + (baseY - topY) * barkT
        var barkX = x + lean * (1 - barkT)
        context.strokeStyle = random() > 0.62 ? 'rgba(140, 124, 100, 0.6)' : 'rgba(40, 34, 27, 0.5)'
        context.lineWidth = 0.8 + random()
        context.globalAlpha = 0.5 + random() * 0.4
        context.beginPath()
        context.moveTo(barkX - thickness * 0.3, barkY)
        context.quadraticCurveTo(barkX, barkY + 2 + random() * 3, barkX + thickness * (0.1 + random() * 0.25), barkY + (random() - 0.5) * 3)
        context.stroke()
      }
      context.restore()

      /* moss up the shaded side */
      for (var moss = 0; moss < 5; moss += 1) {
        leafClump(context, x - thickness * 0.4 + (random() - 0.5) * 3, baseY - (baseY - topY) * random() * 0.6, 2 + random() * 3.5, LEAF_DARK, LEAF_MID, seed + 40 + moss)
      }
    }

    /* A ruined wall: matte mass, hatch shading, broken block courses,
       and a slipped ink silhouette. */
    function ruinWall(context, x, y, wallWidth, wallHeight, fade, seed) {
      var random = SKETCH.rng(seed)
      var body = mixColor('#8f8e79', '#d2d0bc', fade)

      /* eroded silhouette */
      var silhouette = [[x + (random() - 0.5) * 3, y + wallHeight]]
      silhouette.push([x + (random() - 0.5) * 4, y + random() * wallHeight * 0.18])
      var acrossX = x
      while (acrossX < x + wallWidth) {
        acrossX += wallWidth * (0.12 + random() * 0.18)
        silhouette.push([Math.min(acrossX, x + wallWidth), y + random() * wallHeight * 0.22])
      }
      silhouette.push([x + wallWidth + (random() - 0.5) * 3, y + wallHeight])

      context.save()
      context.fillStyle = body
      context.beginPath()
      silhouette.forEach(function (point, index) {
        if (index === 0) context.moveTo(point[0], point[1])
        else context.lineTo(point[0], point[1])
      })
      context.closePath()
      context.fill()
      context.restore()

      /* hatch shading on the flank and under the top edge */
      hatchRect(context, x, y + wallHeight * 0.14, wallWidth * 0.26, wallHeight * 0.86, 5.5, mixColor('#4c5142', '#b9b8a2', fade), seed + 4)
      hatchRect(context, x + wallWidth * (0.32 + random() * 0.26), y + wallHeight * 0.34, wallWidth * 0.12, wallHeight * 0.5, 4, mixColor('#3a3e32', '#a9a892', fade), seed + 5)

      /* broken block courses */
      var courseInk = 'rgba(52, 54, 44, ' + (0.62 - fade * 0.32) + ')'
      var courses = Math.round(wallHeight / 16)
      for (var course = 1; course < courses; course += 1) {
        var courseY = y + wallHeight * (course / courses)
        var walked = x + 2
        while (walked < x + wallWidth - 4) {
          var piece = 8 + random() * 22
          if (random() > 0.22) {
            SKETCH.stroke(context, [[walked, courseY + (random() - 0.5) * 2], [Math.min(walked + piece, x + wallWidth - 2), courseY + (random() - 0.5) * 2.4]], { seed: seed + course * 31 + Math.round(walked), color: courseInk, width: 0.9, amp: 0.5 })
          }
          walked += piece + random() * 7
        }
        for (var block = 0; block < 2; block += 1) {
          var blockX = x + wallWidth * ((block + random()) / 2.2)
          SKETCH.stroke(context, [[blockX, courseY], [blockX + (random() - 0.5) * 2, courseY - wallHeight / courses]], { seed: seed + 60 + course * 5 + block, color: courseInk, width: 0.8, amp: 0.5 })
        }
      }

      /* the slipped ink silhouette */
      inkLine(context, silhouette, seed + 7, 2 + random() * 2, -(1 + random() * 2), 1.5 - fade * 0.6)

      /* moss and hanging ivy */
      for (var moss = 0; moss < Math.round(wallWidth / 20); moss += 1) {
        leafClump(
          context,
          x + random() * wallWidth,
          y + wallHeight * (0.12 + random() * 0.84),
          2.5 + random() * 5,
          mixColor(LEAF_DARK, '#a8ab90', fade), mixColor(LEAF_LIGHT, '#c9caae', fade),
          seed + 70 + moss,
        )
      }
    }

    /* A fallen column drum, ink slipped off the fill. */
    function fallenColumn(context, x, y, length, girth, angle, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      context.translate(x, y)
      context.rotate(angle)
      context.fillStyle = '#8f8e79'
      context.fillRect(-length / 2, -girth / 2, length, girth)
      hatchRect(context, -length / 2, 0, length, girth / 2, 4.5, '#565b49', seed + 2)
      var rings = Math.max(2, Math.round(length / (girth * 1.2)))
      for (var ring = 0; ring <= rings; ring += 1) {
        var ringX = -length / 2 + (length / rings) * ring + (random() - 0.5) * 3
        SKETCH.stroke(context, [[ringX, -girth / 2], [ringX + (random() - 0.5) * 2, girth / 2]], { seed: seed + ring, color: 'rgba(52, 54, 44, 0.55)', width: 1, amp: 0.7 })
      }
      inkLine(context, [[-length / 2, -girth / 2], [length / 2, -girth / 2]], seed + 20, 1.5, -1.5, 1.4)
      inkLine(context, [[-length / 2, girth / 2], [length / 2, girth / 2]], seed + 21, -1, 1.5, 1.2)
      inkLine(context, [[-length / 2, -girth / 2], [-length / 2, girth / 2]], seed + 22, -1.5, 0, 1.2)
      inkLine(context, [[length / 2, -girth / 2], [length / 2, girth / 2]], seed + 23, 1.5, 0, 1.2)
      for (var moss = 0; moss < Math.round(length / 24); moss += 1) {
        leafClump(context, -length / 2 + random() * length, -girth / 2 - 1 + random() * 4, 2.5 + random() * 4, LEAF_DARK, LEAF_LIGHT, seed + 30 + moss)
      }
      context.restore()
    }

    /* An upright ruined column. */
    function column(context, x, baseY, shaftWidth, shaftHeight, lean, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      context.translate(x, baseY)
      context.rotate(lean)

      context.fillStyle = '#a4a38e'
      context.fillRect(-shaftWidth / 2, -shaftHeight, shaftWidth, shaftHeight)
      hatchRect(context, -shaftWidth / 2, -shaftHeight, shaftWidth * 0.38, shaftHeight, 4.5, '#565b49', seed + 2)

      /* capital and base */
      context.fillStyle = '#95947f'
      context.fillRect(-shaftWidth * 0.7, -shaftHeight - shaftWidth * 0.34, shaftWidth * 1.4, shaftWidth * 0.34)
      context.fillRect(-shaftWidth * 0.64, -shaftWidth * 0.26, shaftWidth * 1.28, shaftWidth * 0.26)
      inkLine(context, [
        [-shaftWidth * 0.7, -shaftHeight - shaftWidth * 0.34], [shaftWidth * 0.7, -shaftHeight - shaftWidth * 0.34],
        [shaftWidth * 0.7, -shaftHeight], [-shaftWidth * 0.7, -shaftHeight], [-shaftWidth * 0.7, -shaftHeight - shaftWidth * 0.34],
      ], seed + 3, 1.5, -1, 1.2)

      /* joints, broken */
      var joints = Math.max(3, Math.round(shaftHeight / (shaftWidth * 0.95)))
      for (var joint = 1; joint < joints; joint += 1) {
        var jointY = -shaftHeight * (joint / joints) + (random() - 0.5) * 3
        SKETCH.stroke(context, [[-shaftWidth / 2 + random() * 3, jointY], [shaftWidth / 2 - random() * 3, jointY + (random() - 0.5) * 2]], { seed: seed + joint, color: 'rgba(52, 54, 44, 0.55)', width: 0.9, amp: 0.6 })
      }

      /* slipped silhouette */
      inkLine(context, [[-shaftWidth / 2, 0], [-shaftWidth / 2, -shaftHeight]], seed + 12, -2, 0, 1.5)
      inkLine(context, [[shaftWidth / 2, 0], [shaftWidth / 2, -shaftHeight]], seed + 13, 2.5, 0, 1.2)

      /* moss */
      for (var moss = 0; moss < 7; moss += 1) {
        leafClump(context, (random() - 0.5) * shaftWidth, -shaftHeight * random() * 0.9, 2 + random() * 4.5, LEAF_DARK, LEAF_MID, seed + 20 + moss)
      }
      leafClump(context, -shaftWidth * 0.4, -4, 5 + random() * 4, LEAF_DARK, LEAF_LIGHT, seed + 30)
      leafClump(context, shaftWidth * 0.36, -3, 4 + random() * 4, LEAF_DARK, LEAF_LIGHT, seed + 31)
      context.restore()
    }

    /* Grainy shafts of light. */
    function lightShafts(context, frameX, frameWidth, frameY, frameHeight, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      var shafts = 4 + Math.floor(random() * 2)
      for (var shaft = 0; shaft < shafts; shaft += 1) {
        var topX = frameX + frameWidth * (0.3 + random() * 0.45)
        var slant = frameWidth * (0.05 + random() * 0.09)
        var shaftWidth = frameWidth * (0.012 + random() * 0.04)
        var reach = frameHeight * (0.5 + random() * 0.35)
        /* a faint bar of glow with dust settling through it */
        var glow = context.createLinearGradient(topX, frameY, topX - slant, frameY + reach)
        glow.addColorStop(0, 'rgba(248, 246, 222, 0.2)')
        glow.addColorStop(1, 'rgba(248, 246, 222, 0)')
        context.fillStyle = glow
        context.beginPath()
        context.moveTo(topX - shaftWidth, frameY)
        context.lineTo(topX + shaftWidth * 2, frameY)
        context.lineTo(topX + shaftWidth * 2 - slant, frameY + reach)
        context.lineTo(topX - shaftWidth - slant, frameY + reach)
        context.closePath()
        context.fill()
        for (var grain = 0; grain < 420; grain += 1) {
          var along = Math.pow(random(), 1.3)
          context.globalAlpha = (1 - along) * (0.2 + random() * 0.26)
          context.fillStyle = 'rgba(248, 245, 222, 1)'
          context.fillRect(
            topX - slant * along + random() * shaftWidth,
            frameY + along * reach,
            0.8 + random() * 1.8, 1 + random() * 2.6,
          )
        }
      }
      context.restore()
    }

    /* The ivy bank ringing the clearing: dust shadow then clumps. */
    function ivyRing(context, centerX, centerY, radiusX, radiusY, seed) {
      var random = SKETCH.rng(seed)
      /* granular shadow bed */
      context.save()
      context.fillStyle = '#3e4a34'
      for (var dust = 0; dust < 700; dust += 1) {
        var angle = random() * Math.PI * 2
        var reach = 0.82 + random() * 0.3
        context.globalAlpha = 0.1 + random() * 0.22
        context.fillRect(
          centerX + Math.cos(angle) * radiusX * reach,
          centerY + Math.sin(angle) * radiusY * reach,
          1.4 + random() * 2.4, 1.2 + random() * 2,
        )
      }
      context.restore()

      /* a continuous hedge: an overlapping walk around the rim, then the
         band between rim and bowl packed with clumps */
      var mounds = 116
      for (var mound = 0; mound < mounds; mound += 1) {
        var moundAngle = (mound / mounds) * Math.PI * 2
        var moundX = centerX + Math.cos(moundAngle) * radiusX * (0.98 + random() * 0.08)
        var moundY = centerY + Math.sin(moundAngle) * radiusY * 0.94
        var front = SKETCH.clamp(Math.sin(moundAngle), -0.4, 1)
        var size = 12 + front * 13 + random() * 6
        leafClump(context, moundX, moundY - size * 0.4, size, LEAF_DARK, LEAF_MID, seed + mound * 3)
        if (mound % 2 === 0) {
          leafClump(context, moundX + (random() - 0.5) * size, moundY - size * 0.85, size * 0.66, LEAF_DARK, LEAF_SUNLIT, seed + 500 + mound * 3)
        }
      }
      for (var packed = 0; packed < 240; packed += 1) {
        var packedAngle = random() * Math.PI * 2
        var packedRadius = 0.74 + random() * 0.3
        var packedFront = SKETCH.clamp(Math.sin(packedAngle), -0.4, 1)
        leafClump(
          context,
          centerX + Math.cos(packedAngle) * radiusX * packedRadius,
          centerY + Math.sin(packedAngle) * radiusY * packedRadius * 0.94,
          (7 + packedFront * 8 + random() * 6) * (packedRadius > 0.95 ? 1 : 0.8),
          packedRadius < 0.86 ? '#2f3d26' : LEAF_DARK,
          packedRadius < 0.86 ? LEAF_MID : LEAF_LIGHT,
          seed + 2000 + packed * 7,
        )
      }
    }

    /* The clearing floor and the striped dais. */
    function clearing(context, centerX, centerY, radiusX, radiusY, seed) {
      var random = SKETCH.rng(seed)

      /* irregular mossy floor */
      context.save()
      context.beginPath()
      var rim = []
      for (var point = 0; point <= 26; point += 1) {
        var rimAngle = (point / 26) * Math.PI * 2
        rim.push([
          centerX + Math.cos(rimAngle) * radiusX * 0.9 * (0.96 + random() * 0.08),
          centerY + Math.sin(rimAngle) * radiusY * 0.82 * (0.94 + random() * 0.12),
        ])
      }
      rim.forEach(function (rimPoint, index) {
        if (index === 0) context.moveTo(rimPoint[0], rimPoint[1])
        else context.lineTo(rimPoint[0], rimPoint[1])
      })
      context.closePath()
      context.clip()

      context.fillStyle = '#7d8a5c'
      context.fillRect(centerX - radiusX, centerY - radiusY, radiusX * 2, radiusY * 2)
      /* the bowl darkens toward its rim */
      context.save()
      context.strokeStyle = 'rgba(48, 60, 36, 0.3)'
      context.lineWidth = radiusY * 0.34
      context.beginPath()
      context.ellipse(centerX, centerY, radiusX * 0.86, radiusY * 0.76, 0, 0, Math.PI * 2)
      context.stroke()
      context.restore()
      for (var patch = 0; patch < 50; patch += 1) {
        var patchAngle = random() * Math.PI * 2
        var patchDistance = Math.sqrt(random())
        SKETCH.wash(
          context,
          centerX + Math.cos(patchAngle) * radiusX * 0.8 * patchDistance - 12,
          centerY + Math.sin(patchAngle) * radiusY * 0.7 * patchDistance - 7,
          14 + random() * 26, 8 + random() * 12,
          random() > 0.5 ? '#a2ad74' : '#6d7852',
          { seed: seed + patch, alpha: 0.22, layers: 2, edge: false, grain: false },
        )
      }
      for (var fleck = 0; fleck < 1200; fleck += 1) {
        var fleckAngle = random() * Math.PI * 2
        var fleckDistance = Math.sqrt(random())
        context.fillStyle = random() > 0.5 ? 'rgba(58, 66, 44, 0.3)' : 'rgba(196, 204, 148, 0.3)'
        context.fillRect(
          centerX + Math.cos(fleckAngle) * radiusX * 0.86 * fleckDistance,
          centerY + Math.sin(fleckAngle) * radiusY * 0.78 * fleckDistance,
          1 + random() * 1.8, 0.8 + random() * 1.2,
        )
      }
      /* grass tufts scattered on the floor */
      for (var floorTuft = 0; floorTuft < 70; floorTuft += 1) {
        var tuftAngle = random() * Math.PI * 2
        var tuftDistance = 0.3 + Math.sqrt(random()) * 0.62
        var tuftX = centerX + Math.cos(tuftAngle) * radiusX * 0.86 * tuftDistance
        var tuftY = centerY + Math.sin(tuftAngle) * radiusY * 0.78 * tuftDistance
        for (var tuftBlade = 0; tuftBlade < 3; tuftBlade += 1) {
          SKETCH.stroke(context, [
            [tuftX + (tuftBlade - 1) * 1.4, tuftY],
            [tuftX + (tuftBlade - 1) * 1.4 + (random() - 0.5) * 4, tuftY - 3 - random() * 4],
          ], { seed: seed + 200 + floorTuft * 5 + tuftBlade, color: random() > 0.5 ? 'rgba(74, 88, 48, 0.7)' : 'rgba(150, 164, 104, 0.7)', width: 0.9, amp: 0.4 })
        }
      }

      /* faint pool of light */
      var pool = context.createRadialGradient(centerX, centerY, 4, centerX, centerY, radiusX * 0.5)
      pool.addColorStop(0, 'rgba(226, 228, 180, 0.24)')
      pool.addColorStop(1, 'rgba(226, 228, 180, 0)')
      context.fillStyle = pool
      context.fillRect(centerX - radiusX, centerY - radiusY, radiusX * 2, radiusY * 2)
      context.restore()

      /* broken ink arcs around the rim */
      for (var arc = 0; arc < 7; arc += 1) {
        var arcStart = random() * Math.PI * 2
        var arcPoints = []
        for (var step = 0; step <= 5; step += 1) {
          var stepAngle = arcStart + (step / 5) * (0.3 + random() * 0.5)
          arcPoints.push([
            centerX + Math.cos(stepAngle) * radiusX * 0.9,
            centerY + Math.sin(stepAngle) * radiusY * 0.82,
          ])
        }
        SKETCH.stroke(context, arcPoints, { seed: seed + 40 + arc, color: 'rgba(52, 58, 42, 0.5)', width: 1.1, amp: 1.2, step: 8 })
      }

      /* the dais */
      var daisWidth = radiusX * 0.32
      var daisX = centerX - daisWidth / 2
      var daisY = centerY + radiusY * 0.12
      context.save()
      /* soft cast shadow */
      SKETCH.wash(context, centerX - daisWidth * 0.62, daisY + 2, daisWidth * 1.24, 12, '#39402c', { seed: seed + 50, alpha: 0.4, layers: 3, edge: false, grain: false })
      context.fillStyle = '#c5c0ab'
      context.fillRect(daisX, daisY, daisWidth, 4)
      var stripes = Math.round(daisWidth / 7)
      for (var stripe = 0; stripe < stripes; stripe += 1) {
        context.fillStyle = stripe % 2 ? '#35332d' : '#d5d0bd'
        context.fillRect(daisX + (daisWidth / stripes) * stripe + (Math.sin(stripe * 7) * 0.6), daisY + 3, daisWidth / stripes, 4 + (stripe % 3 === 0 ? 0.8 : 0))
      }
      inkLine(context, [[daisX - 2, daisY], [daisX + daisWidth + 2, daisY]], seed + 53, 0.5, -1.2, 1)
      SKETCH.dot(context, centerX + (random() - 0.5) * 6, daisY - 2, 2.6, '#c2a044', seed + 55)
      context.fillStyle = 'rgba(244, 230, 158, 0.85)'
      context.fillRect(centerX - 0.5, daisY - 6, 1, 3)
      context.restore()
    }

    /* Paper scumble along the plate edges: the painting gives out. */
    function raggedEdge(context, frameX, frameY, frameWidth, frameHeight, paperTone, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      context.fillStyle = paperTone
      var perimeter = (frameWidth + frameHeight) * 2
      for (var bite = 0; bite < perimeter / 3; bite += 1) {
        var along = random() * perimeter
        var x
        var y
        if (along < frameWidth) { x = frameX + along; y = frameY }
        else if (along < frameWidth + frameHeight) { x = frameX + frameWidth; y = frameY + (along - frameWidth) }
        else if (along < frameWidth * 2 + frameHeight) { x = frameX + (frameWidth * 2 + frameHeight - along); y = frameY + frameHeight }
        else { x = frameX; y = frameY + (perimeter - along) }
        context.globalAlpha = 0.5 + random() * 0.5
        var depth = Math.pow(random(), 2.2) * 9
        context.beginPath()
        context.ellipse(
          x + (x === frameX ? -1 : x === frameX + frameWidth ? 1 : 0) * depth * 0.2,
          y + (y === frameY ? -1 : 1) * 0,
          2 + random() * 5 + depth * 0.4, 1.5 + random() * 4,
          random() * 3, 0, Math.PI * 2,
        )
        context.fill()
      }
      context.restore()
    }

    function drawCourt(context, width, height, seed) {
      var random = SKETCH.rng(seed)
      var paperTone = '#efece1'
      SKETCH.plainPaper(context, width, height, { seed: 903, tone: paperTone })

      /* the plate sits inside a paper margin */
      var frameX = width * 0.055
      var frameY = height * 0.095
      var frameWidth = width * 0.89
      var frameHeight = height * 0.84

      context.save()
      context.beginPath()
      context.rect(frameX, frameY, frameWidth, frameHeight)
      context.clip()

      /* local coordinates for the scene */
      var sceneX = function (t) { return frameX + frameWidth * t }
      var sceneY = function (t) { return frameY + frameHeight * t }

      /* pale luminous haze, grainy rather than smooth */
      var sky = context.createLinearGradient(0, frameY, 0, frameY + frameHeight)
      sky.addColorStop(0, '#eae8d4')
      sky.addColorStop(0.55, '#ccd2ac')
      sky.addColorStop(1, '#9fae7d')
      context.fillStyle = sky
      context.fillRect(frameX, frameY, frameWidth, frameHeight)

      /* far ruins, sunk in haze */
      ruinWall(context, sceneX(0.32), sceneY(0.06), frameWidth * 0.16, frameHeight * 0.5, 0.55, seed + 10)
      ruinWall(context, sceneX(0.53), sceneY(0.02), frameWidth * 0.2, frameHeight * 0.58, 0.4, seed + 20)
      ruinWall(context, sceneX(0.03), sceneY(0.1), frameWidth * 0.17, frameHeight * 0.5, 0.45, seed + 30)

      /* mid-ground ruin furniture */
      column(context, sceneX(0.17), sceneY(0.68), frameWidth * 0.042, frameHeight * 0.5, -0.04 + random() * 0.02, seed + 100)
      ruinWall(context, sceneX(0.7), sceneY(0.1), frameWidth * 0.26, frameHeight * 0.56, 0.15, seed + 110)
      column(context, sceneX(0.83), sceneY(0.7), frameWidth * 0.048, frameHeight * 0.34, 0.16 + random() * 0.06, seed + 120)
      fallenColumn(context, sceneX(0.42), sceneY(0.58), frameWidth * 0.3, frameHeight * 0.065, -0.06 + random() * 0.04, seed + 130)
      fallenColumn(context, sceneX(0.66), sceneY(0.62), frameWidth * 0.17, frameHeight * 0.07, 0.3 + random() * 0.1, seed + 140)

      /* understory: bushes banked between the ruins and the court */
      for (var bush = 0; bush < 110; bush += 1) {
        var bushX = sceneX(random())
        var bushY = sceneY(0.5 + Math.pow(random(), 1.3) * 0.16)
        var bushSize = 5 + random() * 11 + (bushY - sceneY(0.5)) / frameHeight * 40
        leafClump(context, bushX, bushY, bushSize, LEAF_DARK, random() > 0.6 ? LEAF_LIGHT : LEAF_MID, seed + 800 + bush * 3)
      }

      /* the big trees */
      var bigTrees = [0.08, 0.3, 0.51, 0.67, 0.92]
      bigTrees.forEach(function (treeX, index) {
        trunk(
          context,
          sceneX(treeX) + (random() - 0.5) * frameWidth * 0.02,
          sceneY(0.7 + random() * 0.04),
          frameY - frameHeight * 0.04,
          frameWidth * (0.024 + random() * 0.012),
          seed + 200 + index * 17,
        )
      })

      /* the canopy: a heavy overlapping band across the top */
      canopy(context, sceneX(0.04), sceneY(0.08), frameWidth * 0.19, frameHeight * 0.17, true, seed + 300)
      canopy(context, sceneX(0.22), sceneY(0.0), frameWidth * 0.2, frameHeight * 0.15, true, seed + 310)
      canopy(context, sceneX(0.4), sceneY(0.1), frameWidth * 0.17, frameHeight * 0.13, true, seed + 320)
      canopy(context, sceneX(0.58), sceneY(0.01), frameWidth * 0.19, frameHeight * 0.14, true, seed + 330)
      canopy(context, sceneX(0.76), sceneY(0.09), frameWidth * 0.17, frameHeight * 0.14, true, seed + 335)
      canopy(context, sceneX(0.95), sceneY(0.04), frameWidth * 0.18, frameHeight * 0.17, true, seed + 340)
      canopy(context, sceneX(0.13), sceneY(0.26), frameWidth * 0.12, frameHeight * 0.09, false, seed + 350)
      canopy(context, sceneX(0.5), sceneY(0.28), frameWidth * 0.1, frameHeight * 0.07, false, seed + 355)
      canopy(context, sceneX(0.86), sceneY(0.29), frameWidth * 0.12, frameHeight * 0.09, false, seed + 360)

      /* light falling in */
      lightShafts(context, frameX, frameWidth, frameY, frameHeight, seed + 400)

      /* the sunken ring and clearing */
      var ringX = sceneX(0.5)
      var ringY = sceneY(0.76)
      ivyRing(context, ringX, ringY, frameWidth * 0.45, frameHeight * 0.165, seed + 500)
      clearing(context, ringX, ringY + frameHeight * 0.055, frameWidth * 0.37, frameHeight * 0.15, seed + 600)

      /* foreground moss dust at the very bottom */
      context.save()
      context.fillStyle = '#2f3a26'
      for (var foot = 0; foot < 900; foot += 1) {
        var footT = Math.pow(random(), 2)
        context.globalAlpha = 0.14 + random() * 0.3
        context.fillRect(frameX + random() * frameWidth, frameY + frameHeight - footT * frameHeight * 0.13, 1.6 + random() * 2.6, 1.2 + random() * 2.2)
      }
      context.restore()

      context.restore()

      /* the paper takes the edges back, and a pencil plate-line half holds */
      raggedEdge(context, frameX, frameY, frameWidth, frameHeight, paperTone, seed + 700)
      SKETCH.pencil(context, [
        [frameX - 4, frameY - 4], [frameX + frameWidth + 4, frameY - 3],
      ], { seed: seed + 710, color: 'rgba(110, 102, 86, 0.5)', width: 1.2, amp: 1.6 })
      SKETCH.pencil(context, [
        [frameX - 3, frameY + frameHeight + 4], [frameX + frameWidth + 3, frameY + frameHeight + 3],
      ], { seed: seed + 711, color: 'rgba(110, 102, 86, 0.4)', width: 1.2, amp: 1.6 })

      /* paper grain over the whole plate */
      SKETCH.texture(context, width, height, seed)
    }

    return {
      state: state,
      aria: 'An artwork: a sunken court deep in a forest — mossy ruined columns among tall trees, light through the canopy, a ring of ivy, and a small striped dais at the centre. Repainted on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height) {
        drawCourt(context, width, height, state.seed)
        write(context, data.title, 26, 30, { size: 12, media: 'pencil', seed: 1201, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 40, 26 + measure(data.title, 12, 0.4) + 8, { seed: 1202, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.date, 26 + measure(data.title, 12, 0.4) + 20, 30, { size: 8.5, media: 'pencil', seed: 1204 })
        write(context, 'CLICK TO REPAINT', width - 26, 30, { size: 7, color: SKETCH.GREEN_PEN, seed: 1206, align: 'right' })
        SKETCH.artifacts(context, width, height, 1208 + state.seed)
      },
      onPointer: function (type, x, y, api) {
        if (type === 'move') { api.canvas.style.cursor = 'pointer'; return }
        if (type !== 'down') return
        state.seed = Math.floor(Math.random() * 999983)
        api.redraw()
      },
    }
  }

  /* ---------------------------------------------------------------- adam */
  /* The Creation of Adam, as smeared pigment: the figures are blotches
     dragged across the plaster, found again with searching pencil lines —
     and the two smears still do not quite touch. */

  ART.adam = function (data) {
    var state = { seed: 1526 }

    var INK = 'rgba(58, 44, 36, 0.8)'

    /* A smeared blotch: a soft blob dragged along a path, dusty at the
       edges, with drag streaks pulled through it. */
    function smear(context, path, radius, color, seed, options) {
      options = options || {}
      var random = SKETCH.rng(seed)
      var alpha = options.alpha === undefined ? 0.085 : options.alpha
      var taper = options.taper === undefined ? 0.55 : options.taper

      /* flatten the path into steps */
      var steps = []
      for (var segment = 1; segment < path.length; segment += 1) {
        var ax = path[segment - 1][0]
        var ay = path[segment - 1][1]
        var bx = path[segment][0]
        var by = path[segment][1]
        var length = Math.hypot(bx - ax, by - ay)
        var pieces = Math.max(1, Math.round(length / (radius * 0.36)))
        for (var piece = 0; piece < pieces; piece += 1) {
          var t = piece / pieces
          steps.push([ax + (bx - ax) * t, ay + (by - ay) * t])
        }
      }
      steps.push(path[path.length - 1])

      context.save()
      context.fillStyle = color
      steps.forEach(function (step, index) {
        var along = index / (steps.length - 1)
        var stepRadius = radius * (1 - (1 - taper) * along)
        for (var layer = 0; layer < 3; layer += 1) {
          context.globalAlpha = alpha * (0.7 + random() * 0.6)
          context.beginPath()
          context.ellipse(
            step[0] + (random() - 0.5) * stepRadius * 0.5,
            step[1] + (random() - 0.5) * stepRadius * 0.5,
            stepRadius * (0.6 + random() * 0.5),
            stepRadius * (0.5 + random() * 0.45),
            random() * 3, 0, Math.PI * 2,
          )
          context.fill()
        }
      })

      /* pigment dust along the whole smear */
      steps.forEach(function (step, index) {
        var along = index / (steps.length - 1)
        var stepRadius = radius * (1 - (1 - taper) * along)
        if (random() > 0.5) return
        for (var dust = 0; dust < 3; dust += 1) {
          var angle = random() * Math.PI * 2
          context.globalAlpha = 0.1 + random() * 0.22
          context.fillRect(
            step[0] + Math.cos(angle) * stepRadius * (0.8 + random() * 0.6),
            step[1] + Math.sin(angle) * stepRadius * (0.8 + random() * 0.6),
            0.8 + random() * 1.6, 0.8 + random() * 1.4,
          )
        }
      })

      /* drag streaks pulled along the direction of the smear */
      if (options.streaks !== false) {
        var first = steps[0]
        var last = steps[steps.length - 1]
        context.strokeStyle = options.streakColor || color
        context.lineCap = 'round'
        for (var streak = 0; streak < 4; streak += 1) {
          var offset = (random() - 0.5) * radius * 1.1
          var dirX = last[0] - first[0]
          var dirY = last[1] - first[1]
          var dirLength = Math.hypot(dirX, dirY) || 1
          var normalX = -dirY / dirLength
          var normalY = dirX / dirLength
          context.globalAlpha = 0.12 + random() * 0.18
          context.lineWidth = 0.9 + random() * 1.4
          context.beginPath()
          context.moveTo(first[0] + normalX * offset + dirX * random() * 0.2, first[1] + normalY * offset + dirY * random() * 0.2)
          context.lineTo(last[0] + normalX * offset * 0.7 + dirX * random() * 0.1, last[1] + normalY * offset * 0.7 + dirY * random() * 0.1)
          context.stroke()
        }
      }
      context.restore()
    }

    /* Searching pencil gesture lines: the same stroke found two or three
       times, each pass slightly elsewhere. */
    function gesture(context, points, seed, options) {
      options = options || {}
      var passes = options.passes || 2
      for (var pass = 0; pass < passes; pass += 1) {
        var random = SKETCH.rng(seed + pass * 37)
        var shiftX = (random() - 0.5) * 5
        var shiftY = (random() - 0.5) * 5
        SKETCH.pencil(context, points.map(function (point) {
          return [point[0] + shiftX, point[1] + shiftY]
        }), {
          seed: seed + pass * 41,
          color: options.color || 'rgba(70, 56, 44, 0.85)',
          width: options.width || 1.3,
          amp: 1.6,
        })
      }
    }

    function drawAdamPanel(context, width, height, seed) {
      var random = SKETCH.rng(seed)
      var paperTone = '#efece1'
      SKETCH.plainPaper(context, width, height, { seed: 1503, tone: paperTone })

      var frameX = width * 0.055
      var frameY = height * 0.095
      var frameWidth = width * 0.89
      var frameHeight = height * 0.84
      var fx = function (t) { return frameX + frameWidth * t }
      var unit = frameWidth

      context.save()
      context.beginPath()
      context.rect(frameX, frameY, frameWidth, frameHeight)
      context.clip()

      /* plaster */
      var plaster = context.createLinearGradient(frameX, frameY, frameX + frameWidth, frameY + frameHeight)
      plaster.addColorStop(0, '#e9e3cf')
      plaster.addColorStop(0.5, '#efe8d2')
      plaster.addColorStop(1, '#e2dbc4')
      context.fillStyle = plaster
      context.fillRect(frameX, frameY, frameWidth, frameHeight)
      softBloom(context, fx(0.24), frameY + frameHeight * 0.3, unit * 0.14, unit * 0.08, '#cfc4a6', seed + 2)
      softBloom(context, fx(0.85), frameY + frameHeight * 0.68, unit * 0.12, unit * 0.07, '#cfc4a6', seed + 3)

      /* the cropped fresco above and below: dark strips with smeared company */
      var stripHeight = frameHeight * 0.115
      context.fillStyle = '#5d5c50'
      context.fillRect(frameX, frameY, frameWidth, stripHeight)
      context.fillRect(frameX, frameY + frameHeight - stripHeight, frameWidth, stripHeight)
      smear(context, [[fx(0.1), frameY + stripHeight * 0.6], [fx(0.17), frameY + stripHeight * 0.4]], stripHeight * 0.32, '#cfa27f', seed + 4, { alpha: 0.12 })
      smear(context, [[fx(0.26), frameY + stripHeight * 0.4], [fx(0.31), frameY + stripHeight * 0.6]], stripHeight * 0.26, '#c9a13c', seed + 5, { alpha: 0.12 })
      smear(context, [[fx(0.8), frameY + stripHeight * 0.5], [fx(0.87), frameY + stripHeight * 0.45]], stripHeight * 0.3, '#cfa27f', seed + 6, { alpha: 0.12 })
      smear(context, [[fx(0.3), frameY + frameHeight - stripHeight * 0.5], [fx(0.37), frameY + frameHeight - stripHeight * 0.55]], stripHeight * 0.3, '#cfa27f', seed + 7, { alpha: 0.12 })
      smear(context, [[fx(0.83), frameY + frameHeight - stripHeight * 0.45], [fx(0.89), frameY + frameHeight - stripHeight * 0.55]], stripHeight * 0.28, '#b46a38', seed + 8, { alpha: 0.12 })
      SKETCH.stroke(context, [[frameX, frameY + stripHeight], [frameX + frameWidth, frameY + stripHeight + 2]], { seed: seed + 10, color: 'rgba(48, 46, 40, 0.7)', width: 1.6, amp: 1, step: 12 })
      SKETCH.stroke(context, [[frameX, frameY + frameHeight - stripHeight], [frameX + frameWidth, frameY + frameHeight - stripHeight - 2]], { seed: seed + 11, color: 'rgba(48, 46, 40, 0.7)', width: 1.6, amp: 1, step: 12 })

      var panelTop = frameY + stripHeight
      var panelHeight = frameHeight - stripHeight * 2
      var py = function (t) { return panelTop + panelHeight * t }

      /* ---------------------------------------------------- the earth */
      /* the bank Adam lies on: broad dragged smears of grey-green and umber */
      smear(context, [[fx(-0.02), py(0.62)], [fx(0.16), py(0.52)], [fx(0.34), py(0.5)], [fx(0.46), py(0.58)]], unit * 0.075, '#8b8874', seed + 20, { alpha: 0.1, taper: 0.9 })
      smear(context, [[fx(-0.02), py(0.78)], [fx(0.2), py(0.72)], [fx(0.4), py(0.72)], [fx(0.47), py(0.8)]], unit * 0.085, '#6f6250', seed + 21, { alpha: 0.11, taper: 0.95 })
      smear(context, [[fx(-0.02), py(0.94)], [fx(0.24), py(0.9)], [fx(0.46), py(0.93)]], unit * 0.07, '#5a5342', seed + 22, { alpha: 0.1, taper: 1 })
      /* the bank found again in pencil */
      gesture(context, [[fx(0.0), py(0.56)], [fx(0.18), py(0.485)], [fx(0.36), py(0.475)], [fx(0.465), py(0.55)]], seed + 23, { passes: 2, width: 1.2 })

      /* -------------------------------------------------------- adam */
      /* the body: one long flesh smear reclining up the bank */
      smear(context, [[fx(0.155), py(0.66)], [fx(0.21), py(0.575)], [fx(0.265), py(0.49)], [fx(0.3), py(0.44)]], unit * 0.042, '#cfa27f', seed + 30, { alpha: 0.12, taper: 0.75 })
      /* legs, dragged out along the ground */
      smear(context, [[fx(0.195), py(0.65)], [fx(0.115), py(0.69)], [fx(0.04), py(0.68)]], unit * 0.022, '#c99a76', seed + 31, { alpha: 0.11, taper: 0.5 })
      smear(context, [[fx(0.23), py(0.62)], [fx(0.3), py(0.525)], [fx(0.335), py(0.62)], [fx(0.345), py(0.7)]], unit * 0.02, '#c99a76', seed + 32, { alpha: 0.11, taper: 0.6 })
      /* the head: a small round blot, hair dabbed dark */
      smear(context, [[fx(0.302), py(0.43)], [fx(0.312), py(0.422)]], unit * 0.021, '#cfa27f', seed + 33, { alpha: 0.15, taper: 0.9, streaks: false })
      smear(context, [[fx(0.296), py(0.405)], [fx(0.312), py(0.398)]], unit * 0.013, '#6b5136', seed + 34, { alpha: 0.18, taper: 0.9, streaks: false })
      /* the reaching arm: a thin smear pulled toward the gap */
      smear(context, [[fx(0.3), py(0.465)], [fx(0.36), py(0.5)], [fx(0.42), py(0.487)], [fx(0.458), py(0.472)]], unit * 0.013, '#d8b491', seed + 35, { alpha: 0.13, taper: 0.4 })

      /* Adam found again: back, seat, legs, and the one certain arm line */
      gesture(context, [[fx(0.165), py(0.675)], [fx(0.225), py(0.55)], [fx(0.285), py(0.455)], [fx(0.307), py(0.415)]], seed + 36, { passes: 3 })
      gesture(context, [[fx(0.2), py(0.655)], [fx(0.11), py(0.695)], [fx(0.038), py(0.683)]], seed + 37, { passes: 2, width: 1.1 })
      gesture(context, [[fx(0.235), py(0.625)], [fx(0.302), py(0.525)], [fx(0.34), py(0.63)], [fx(0.347), py(0.705)]], seed + 38, { passes: 2, width: 1.1 })
      gesture(context, [[fx(0.302), py(0.468)], [fx(0.362), py(0.503)], [fx(0.425), py(0.488)], [fx(0.465), py(0.47)]], seed + 39, { passes: 3, width: 1.2 })
      /* a face worth two marks, and the limp fingers in ink */
      SKETCH.stroke(context, [[fx(0.316), py(0.428)], [fx(0.323), py(0.433)]], { seed: seed + 40, color: INK, width: 1.1, amp: 0.3 })
      SKETCH.stroke(context, [[fx(0.462), py(0.468)], [fx(0.474), py(0.474)]], { seed: seed + 41, color: INK, width: 1.4, amp: 0.3 })
      SKETCH.stroke(context, [[fx(0.46), py(0.475)], [fx(0.4715), py(0.483)]], { seed: seed + 42, color: INK, width: 1.1, amp: 0.3 })
      SKETCH.stroke(context, [[fx(0.457), py(0.481)], [fx(0.466), py(0.49)]], { seed: seed + 43, color: INK, width: 1, amp: 0.3 })

      /* ---------------------------------------------------- the host */
      /* the mantle: wine-dark smears swirled into a cloud, open toward Adam */
      smear(context, [
        [fx(0.63), py(0.5)], [fx(0.6), py(0.38)], [fx(0.66), py(0.26)],
        [fx(0.78), py(0.22)], [fx(0.89), py(0.28)], [fx(0.93), py(0.42)],
        [fx(0.88), py(0.56)], [fx(0.76), py(0.61)], [fx(0.67), py(0.57)],
      ], unit * 0.055, '#7c3e49', seed + 60, { alpha: 0.12, taper: 1 })
      smear(context, [
        [fx(0.66), py(0.46)], [fx(0.66), py(0.34)], [fx(0.75), py(0.28)],
        [fx(0.85), py(0.33)], [fx(0.87), py(0.45)], [fx(0.79), py(0.54)], [fx(0.7), py(0.52)],
      ], unit * 0.045, '#93454f', seed + 61, { alpha: 0.12, taper: 1 })
      /* ribbons of cloth flying off behind */
      smear(context, [[fx(0.9), py(0.33)], [fx(0.96), py(0.27)], [fx(0.995), py(0.24)]], unit * 0.018, '#8a4753', seed + 62, { alpha: 0.12, taper: 0.35 })
      smear(context, [[fx(0.9), py(0.5)], [fx(0.96), py(0.55)], [fx(0.995), py(0.6)]], unit * 0.016, '#8a4753', seed + 63, { alpha: 0.12, taper: 0.35 })

      /* the company: small dark-rose blots crowded into the cloth */
      var cherubs = [
        [0.7, 0.52, 0.02], [0.76, 0.55, 0.018], [0.83, 0.52, 0.017], [0.87, 0.42, 0.016], [0.8, 0.28, 0.016],
      ]
      cherubs.forEach(function (cherub, index) {
        smear(context, [
          [fx(cherub[0]), py(cherub[1])], [fx(cherub[0] + 0.012), py(cherub[1] - 0.014)],
        ], unit * cherub[2], index % 2 ? '#b0707a' : '#c98a92', seed + 70 + index, { alpha: 0.14, taper: 0.8, streaks: false })
      })
      /* one face surfaces from the crowd */
      SKETCH.dot(context, fx(0.757), py(0.532), 1, INK, seed + 80)
      SKETCH.dot(context, fx(0.766), py(0.531), 1, INK, seed + 81)
      SKETCH.stroke(context, [[fx(0.758), py(0.541)], [fx(0.765), py(0.541)]], { seed: seed + 82, color: INK, width: 0.9, amp: 0.2 })

      /* God: a pale smear carried forward through the cloud */
      smear(context, [[fx(0.63), py(0.44)], [fx(0.7), py(0.4)], [fx(0.78), py(0.39)], [fx(0.83), py(0.41)]], unit * 0.032, '#dcc3b6', seed + 90, { alpha: 0.14, taper: 0.8 })
      /* his head, and the beard streaming in the wind of arrival */
      smear(context, [[fx(0.638), py(0.41)], [fx(0.646), py(0.404)]], unit * 0.018, '#cfa27f', seed + 91, { alpha: 0.16, taper: 0.9, streaks: false })
      context.save()
      context.lineCap = 'round'
      for (var beard = 0; beard < 12; beard += 1) {
        var beardY = py(0.408) + (random() - 0.5) * unit * 0.02
        context.strokeStyle = random() > 0.3 ? 'rgba(240, 236, 224, 0.85)' : 'rgba(168, 162, 148, 0.8)'
        context.lineWidth = 0.9 + random() * 1.1
        context.beginPath()
        context.moveTo(fx(0.636), beardY)
        context.quadraticCurveTo(
          fx(0.616) + (random() - 0.5) * 6, beardY + unit * 0.006,
          fx(0.6 + random() * 0.012), beardY + unit * (0.004 + random() * 0.01),
        )
        context.stroke()
      }
      context.restore()
      SKETCH.dot(context, fx(0.641), py(0.406), 1, INK, seed + 92)

      /* his arm: the one straight, certain smear in the picture */
      smear(context, [[fx(0.655), py(0.43)], [fx(0.59), py(0.448)], [fx(0.53), py(0.458)], [fx(0.492), py(0.462)]], unit * 0.012, '#d8b491', seed + 93, { alpha: 0.14, taper: 0.4 })
      gesture(context, [[fx(0.657), py(0.428)], [fx(0.59), py(0.447)], [fx(0.525), py(0.458)], [fx(0.488), py(0.4635)]], seed + 94, { passes: 3, width: 1.3 })
      SKETCH.stroke(context, [[fx(0.494), py(0.461)], [fx(0.4805), py(0.4655)]], { seed: seed + 95, color: INK, width: 1.5, amp: 0.3 })
      SKETCH.stroke(context, [[fx(0.496), py(0.467)], [fx(0.4855), py(0.4715)]], { seed: seed + 96, color: INK, width: 1, amp: 0.3 })

      /* the mantle found again: a loose contour and two fold lines */
      gesture(context, [
        [fx(0.635), py(0.51)], [fx(0.605), py(0.38)], [fx(0.665), py(0.255)],
        [fx(0.79), py(0.215)], [fx(0.9), py(0.28)], [fx(0.935), py(0.43)],
        [fx(0.87), py(0.58)], [fx(0.74), py(0.625)],
      ], seed + 97, { passes: 2, width: 1.3 })
      gesture(context, [[fx(0.67), py(0.34)], [fx(0.75), py(0.31)], [fx(0.83), py(0.35)]], seed + 98, { passes: 1, width: 1.1 })
      gesture(context, [[fx(0.68), py(0.5)], [fx(0.77), py(0.49)]], seed + 99, { passes: 1, width: 1 })

      /* the green sash, dragged down and away */
      smear(context, [[fx(0.68), py(0.58)], [fx(0.65), py(0.68)], [fx(0.61), py(0.77)], [fx(0.59), py(0.84)]], unit * 0.02, '#6f8f6a', seed + 100, { alpha: 0.13, taper: 0.4 })
      SKETCH.gouache(context, [[fx(0.672), py(0.6)], [fx(0.643), py(0.69)], [fx(0.607), py(0.78)]], { seed: seed + 101, width: 4 })

      /* the gap: nothing but plaster, and one hot fleck of pigment */
      context.save()
      context.globalAlpha = 0.85
      context.fillStyle = '#d4457c'
      context.fillRect(fx(0.4775), py(0.442), 2.4, 2)
      context.restore()

      /* cracks through the plaster */
      SKETCH.pencil(context, [
        [fx(0.505), panelTop], [fx(0.5), py(0.2)], [fx(0.52), py(0.38)], [fx(0.505), py(0.45)],
      ], { seed: seed + 150, color: 'rgba(96, 88, 72, 0.5)', width: 1, amp: 1.8 })
      SKETCH.pencil(context, [
        [fx(0.36), py(1)], [fx(0.375), py(0.84)], [fx(0.36), py(0.74)],
      ], { seed: seed + 151, color: 'rgba(96, 88, 72, 0.4)', width: 1, amp: 1.6 })
      SKETCH.pencil(context, [
        [fx(0.88), panelTop], [fx(0.895), py(0.14)],
      ], { seed: seed + 152, color: 'rgba(96, 88, 72, 0.4)', width: 0.9, amp: 1.2 })

      /* warm light from the upper right */
      var warmth = context.createLinearGradient(frameX + frameWidth, frameY, frameX, frameY + frameHeight)
      warmth.addColorStop(0, 'rgba(244, 226, 186, 0.14)')
      warmth.addColorStop(0.55, 'rgba(244, 226, 186, 0)')
      context.fillStyle = warmth
      context.fillRect(frameX, frameY, frameWidth, frameHeight)

      context.restore()

      /* the paper takes the edges back */
      raggedPlateEdge(context, frameX, frameY, frameWidth, frameHeight, paperTone, seed + 160)
      SKETCH.texture(context, width, height, seed)
    }

    function raggedPlateEdge(context, frameX, frameY, frameWidth, frameHeight, paperTone, seed) {
      var random = SKETCH.rng(seed)
      context.save()
      context.fillStyle = paperTone
      var perimeter = (frameWidth + frameHeight) * 2
      for (var bite = 0; bite < perimeter / 3; bite += 1) {
        var along = random() * perimeter
        var x
        var y
        if (along < frameWidth) { x = frameX + along; y = frameY }
        else if (along < frameWidth + frameHeight) { x = frameX + frameWidth; y = frameY + (along - frameWidth) }
        else if (along < frameWidth * 2 + frameHeight) { x = frameX + (frameWidth * 2 + frameHeight - along); y = frameY + frameHeight }
        else { x = frameX; y = frameY + (perimeter - along) }
        context.globalAlpha = 0.5 + random() * 0.5
        context.beginPath()
        context.ellipse(x, y, 2 + random() * 6, 1.5 + random() * 4, random() * 3, 0, Math.PI * 2)
        context.fill()
      }
      context.restore()
    }

    return {
      state: state,
      aria: 'An artwork: a smeared-pigment rendition of Michelangelo’s Creation of Adam — the figures are dragged blotches found again in pencil, and the two hands still do not quite touch. Repainted on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height) {
        drawAdamPanel(context, width, height, state.seed)
        write(context, data.title, 26, 30, { size: 12, media: 'pencil', seed: 1601, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 40, 26 + measure(data.title, 12, 0.4) + 8, { seed: 1602, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.note, 26 + measure(data.title, 12, 0.4) + 20, 30, { size: 8, color: SKETCH.GREEN_PEN, seed: 1603 })
        write(context, data.date, width - 26, 30, { size: 8.5, media: 'pencil', seed: 1604, align: 'right' })
        write(context, 'CLICK TO REPAINT', width - 26, 46, { size: 7, color: SKETCH.GREEN_PEN, seed: 1605, align: 'right' })
        SKETCH.artifacts(context, width, height, 1606 + state.seed)
      },
      onPointer: function (type, x, y, api) {
        if (type === 'move') { api.canvas.style.cursor = 'pointer'; return }
        if (type !== 'down') return
        state.seed = Math.floor(Math.random() * 999983)
        api.redraw()
      },
    }
  }
})()
