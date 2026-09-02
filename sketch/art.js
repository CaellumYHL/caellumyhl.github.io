/* art.js — artworks between the pages of the book. Each one is generated
   fresh: click the drawing to make a new one. */
'use strict'

;(function () {
  var ART = window.SKETCH.art = {}
  var write = function () { return SKETCH.letter.write.apply(null, arguments) }
  var measure = function () { return SKETCH.letter.measure.apply(null, arguments) }

  /* A faint dotted survey grid, like the ruled sheets in the references. */
  function dottedGrid(context, width, height, seed) {
    var random = SKETCH.rng(seed)
    context.save()
    context.fillStyle = 'rgba(40, 44, 66, 0.5)'
    var gap = 96
    for (var y = 60; y < height - 20; y += gap) {
      var walked = 10
      while (walked < width - 10) {
        walked += 3 + random() * 10
        if (random() > 0.42) context.fillRect(walked, y + (random() - 0.5) * 2, 1 + random() * 2.4, 0.8)
      }
    }
    for (var x = 60; x < width - 20; x += gap) {
      var walkedY = 40
      while (walkedY < height - 30) {
        walkedY += 3 + random() * 10
        if (random() > 0.42) context.fillRect(x + (random() - 0.5) * 2, walkedY, 0.8, 1 + random() * 2.4)
      }
    }
    context.restore()
  }

  /* ------------------------------------------------------------- tangle */
  /* A knot of dark ink inside a pencil boundary, every line haloed with a
     hot pink wash. */

  ART.tangle = function (data) {
    var state = { seed: 811 }

    function drawKnot(context, width, height, seed) {
      var random = SKETCH.rng(seed)
      var centerX = width / 2
      var centerY = height * 0.44
      var radiusX = Math.min(width * 0.34, 470)
      var radiusY = Math.min(height * 0.32, 450)

      /* pencil boundary the knot lives inside */
      var boundary = []
      for (var b = 0; b <= 22; b += 1) {
        var angle = (b / 22) * Math.PI * 2
        boundary.push([
          centerX + Math.cos(angle) * radiusX * (1.04 + random() * 0.08),
          centerY + Math.sin(angle) * radiusY * (1.04 + random() * 0.08),
        ])
      }
      SKETCH.pencil(context, boundary, { seed: seed + 1, width: 1.6, amp: 2, color: 'rgba(120, 114, 106, 0.55)' })

      /* the knot: a momentum walk that bounces off the boundary */
      var x = centerX + (random() - 0.5) * radiusX
      var y = centerY + (random() - 0.5) * radiusY
      var heading = random() * Math.PI * 2
      var strands = 26 + Math.floor(random() * 12)
      for (var strand = 0; strand < strands; strand += 1) {
        var length = 40 + random() * radiusX * 1.1
        var nextX = x + Math.cos(heading) * length
        var nextY = y + Math.sin(heading) * length
        /* stay inside */
        var normX = (nextX - centerX) / radiusX
        var normY = (nextY - centerY) / radiusY
        if (normX * normX + normY * normY > 1) {
          heading += Math.PI * (0.6 + random() * 0.5)
          nextX = x + Math.cos(heading) * length * 0.6
          nextY = y + Math.sin(heading) * length * 0.6
        }
        nextX = SKETCH.clamp(nextX, centerX - radiusX, centerX + radiusX)
        nextY = SKETCH.clamp(nextY, centerY - radiusY, centerY + radiusY)

        /* pink halo first, then the dark line */
        var midX = (x + nextX) / 2 + (random() - 0.5) * 10
        var midY = (y + nextY) / 2 + (random() - 0.5) * 10
        var haloSteps = 3 + Math.floor(random() * 3)
        for (var halo = 0; halo < haloSteps; halo += 1) {
          var t = (halo + 0.5) / haloSteps
          SKETCH.wash(
            context,
            x + (nextX - x) * t - 9, y + (nextY - y) * t - 8,
            18 + random() * 14, 14 + random() * 10,
            random() > 0.3 ? '#d4457c' : '#e0668f',
            { seed: seed + strand * 31 + halo, alpha: 0.16, layers: 2, edge: false, grain: false },
          )
        }
        SKETCH.stroke(context, [[x, y], [midX, midY], [nextX, nextY]], {
          seed: seed + strand * 7,
          color: 'rgba(58, 24, 40, 0.85)',
          width: 1.9 + random(),
          amp: 1.6,
          step: 9,
        })
        /* occasional branch */
        if (random() > 0.66) {
          var branchAngle = heading + (random() - 0.5) * 2.4
          SKETCH.stroke(context, [
            [midX, midY],
            [midX + Math.cos(branchAngle) * 40 * random() + 14, midY + Math.sin(branchAngle) * 36 * random()],
          ], { seed: seed + strand * 13, color: 'rgba(58, 24, 40, 0.8)', width: 1.6, amp: 1.4 })
        }
        x = nextX
        y = nextY
        heading += (random() - 0.5) * 1.7
      }

      /* one dark knot and one deep bloom, like the reference */
      SKETCH.wash(context, centerX + (random() - 0.5) * radiusX, centerY + random() * radiusY * 0.5, 34, 28, '#c22f6d', { seed: seed + 501, alpha: 0.6 })
      SKETCH.wash(context, centerX + (random() - 0.5) * radiusX * 0.8, centerY + (random() - 0.4) * radiusY * 0.6, 24, 20, '#3a1230', { seed: seed + 502, alpha: 0.75 })

      /* stray red marks in the margins */
      SKETCH.scribble(context, width * (0.06 + random() * 0.1), height * (0.3 + random() * 0.4), 14, 12, seed + 503, 'rgba(198, 30, 40, 0.9)')
      SKETCH.scribble(context, width * (0.4 + random() * 0.3), height - 60 - random() * 40, 12, 10, seed + 504, 'rgba(198, 30, 40, 0.9)')
    }

    return {
      state: state,
      aria: 'An artwork: a tangle of dark ink lines haloed in pink wash, redrawn on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height) {
        SKETCH.plainPaper(context, width, height, { seed: 803, tone: '#f0ece0' })
        dottedGrid(context, width, height, 807 + state.seed)
        drawKnot(context, width, height, state.seed)
        write(context, data.title, 26, 28, { size: 12, media: 'pencil', seed: 801, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 38, 26 + measure(data.title, 12, 0.4) + 8, { seed: 802, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.date, 26 + measure(data.title, 12, 0.4) + 20, 28, { size: 8.5, media: 'pencil', seed: 804 })
        write(context, 'CLICK TO RE-TANGLE', 26, 48, { size: 7, color: SKETCH.GREEN_PEN, seed: 805 })
        SKETCH.artifacts(context, width, height, 806 + state.seed)
      },
      onPointer: function (type, x, y, api) {
        if (type === 'move') { api.canvas.style.cursor = 'pointer'; return }
        if (type !== 'down') return
        state.seed = Math.floor(Math.random() * 999983)
        api.redraw()
      },
    }
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
      var edgeInk = { color: 'rgba(96, 88, 74, 0.6)', width: 1.6, amp: 1.6, step: 14 }
      SKETCH.pencil(context, [[0, 0], [back.left, back.top]], { seed: seed + 1, color: edgeInk.color, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [[width, 0], [back.right, back.top]], { seed: seed + 2, color: edgeInk.color, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [[0, height], [back.left, back.bottom]], { seed: seed + 3, color: edgeInk.color, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [[width, height], [back.right, back.bottom]], { seed: seed + 4, color: edgeInk.color, width: 1.4, amp: 1.2 })
      SKETCH.pencil(context, [
        [back.left, back.top], [back.right, back.top], [back.right, back.bottom],
        [back.left, back.bottom], [back.left, back.top],
      ], { seed: seed + 5, color: edgeInk.color, width: 1.3, amp: 1 })

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

      /* grass, pushing up through the carpet — thicker up close */
      var tufts = 90 + Math.floor(random() * 40)
      var grassTones = ['rgba(123, 139, 78, 0.8)', 'rgba(166, 173, 139, 0.8)', 'rgba(150, 138, 90, 0.7)', 'rgba(95, 110, 66, 0.8)']
      for (var tuft = 0; tuft < tufts; tuft += 1) {
        var depth = Math.pow(random(), 0.65)
        var tuftY = back.bottom + 4 + depth * (height - back.bottom - 8)
        var spreadLeft = (back.left * (1 - depth)) * (tuftY - back.bottom) / Math.max(1, height - back.bottom)
        var tuftX = random() * width
        if (tuftY < back.bottom + 6) continue
        var blade = 3 + Math.floor(random() * 3)
        var tall = (3 + depth * 13) * (1 + random() * 0.5)
        var tone = grassTones[Math.floor(random() * grassTones.length)]
        for (var leaf = 0; leaf < blade; leaf += 1) {
          var leanBlade = (random() - 0.5) * tall * 0.8
          SKETCH.stroke(context, [
            [tuftX + (leaf - blade / 2) * 1.6, tuftY],
            [tuftX + (leaf - blade / 2) * 1.6 + leanBlade, tuftY - tall * (0.7 + random() * 0.5)],
          ], { seed: seed + 60 + tuft * 7 + leaf, color: tone, width: 0.9 + depth, amp: 0.6 })
        }
        void spreadLeft
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
})()
