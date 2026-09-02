/* faces.js — the naive faces study. Every face is a handful of seeded
   strokes: a crooked contour, uneven eyes, a wash of colour behind.
   Click a face to redraw that one person; nobody comes back twice. */
'use strict'

;(function () {
  var FACES = window.SKETCH.faces = {}

  function drawWashBackdrop(context, scale, random) {
    var wash = SKETCH.WASHES[Math.floor(random() * SKETCH.WASHES.length)]
    var shape = random()
    context.save()
    context.globalAlpha = 0.32 + random() * 0.2
    context.fillStyle = wash
    if (shape > 0.72) {
      /* a rough square of wash, like a paint test */
      context.rotate((random() - 0.5) * 0.12)
      context.fillRect(-scale * 0.52, -scale * 0.56, scale * 1.04, scale * 1.1)
    } else {
      context.beginPath()
      var points = 11
      for (var index = 0; index <= points; index += 1) {
        var angle = (index / points) * Math.PI * 2
        var radius = scale * (0.52 + random() * 0.16)
        var x = Math.cos(angle) * radius
        var y = Math.sin(angle) * radius * (0.94 + random() * 0.12)
        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.closePath()
      if (random() > 0.55) {
        context.fill()
      } else {
        context.lineWidth = scale * (0.05 + random() * 0.05)
        context.strokeStyle = wash
        context.stroke()
      }
    }
    context.restore()
  }

  function drawFace(context, centerX, centerY, scale, seed) {
    var random = SKETCH.rng(seed)
    var headWidth = scale * (0.47 + random() * 0.18)
    var headHeight = scale * (0.57 + random() * 0.16)
    var tilt = (random() - 0.5) * 0.16

    context.save()
    context.translate(centerX, centerY)
    context.rotate(tilt)

    drawWashBackdrop(context, scale, random)

    /* skin wash on about half the faces */
    if (random() > 0.42) {
      context.save()
      context.globalAlpha = 0.18 + random() * 0.2
      context.fillStyle = ['#c98d63', '#a96b45', '#e0b48c', '#8a5a3c', '#d9a06b'][Math.floor(random() * 5)]
      context.beginPath()
      context.ellipse(0, scale * 0.02, headWidth * 0.94, headHeight * 0.94, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    /* contour */
    var facePoints = []
    var count = 15
    for (var point = 0; point <= count; point += 1) {
      var angle = (point / count) * Math.PI * 2 - Math.PI / 2
      var rough = 1 + (random() - 0.5) * 0.12
      facePoints.push([Math.cos(angle) * headWidth * rough, Math.sin(angle) * headHeight * rough])
    }
    facePoints.push(facePoints[0])
    SKETCH.stroke(context, facePoints, {
      seed: seed + 1,
      color: 'rgba(42, 39, 36, 0.78)',
      width: Math.max(1.2, scale * 0.024),
      amp: scale * 0.012,
      step: scale * 0.1,
    })

    /* eyes */
    var eyeY = -scale * (0.05 + random() * 0.04)
    var eyeSpread = scale * (0.16 + random() * 0.035)
    var ink = 'rgba(34, 33, 34, 0.86)'
    var sides = [[-eyeSpread, eyeY + (random() - 0.5) * scale * 0.05], [eyeSpread, eyeY + (random() - 0.5) * scale * 0.05]]
    for (var side = 0; side < 2; side += 1) {
      var eyeX = sides[side][0]
      var y = sides[side][1]
      var eyeKind = random()
      if (eyeKind > 0.82) {
        /* spectacles ring */
        var ring = []
        for (var r = 0; r <= 10; r += 1) {
          var a = (r / 10) * Math.PI * 2
          ring.push([eyeX + Math.cos(a) * scale * 0.085, y + Math.sin(a) * scale * 0.085])
        }
        SKETCH.stroke(context, ring, { seed: seed + 40 + side, color: ink, width: Math.max(1, scale * 0.016), amp: scale * 0.006, step: scale * 0.06 })
        SKETCH.dot(context, eyeX, y, scale * 0.018, ink, seed + side)
      } else if (eyeKind > 0.68) {
        /* sleepy line */
        SKETCH.stroke(context, [[eyeX - scale * 0.055, y], [eyeX + scale * 0.055, y + (random() - 0.5) * scale * 0.02]], { seed: seed + 44 + side, color: ink, width: Math.max(1.1, scale * 0.02), amp: scale * 0.006 })
      } else {
        var oval = []
        for (var o = 0; o <= 8; o += 1) {
          var oa = (o / 8) * Math.PI * 2
          oval.push([eyeX + Math.cos(oa) * scale * (0.045 + random() * 0.02), y + Math.sin(oa) * scale * 0.023])
        }
        SKETCH.stroke(context, oval, { seed: seed + 48 + side, color: ink, width: Math.max(1, scale * 0.016), amp: scale * 0.004, step: scale * 0.05 })
        if (random() > 0.28) SKETCH.dot(context, eyeX + (random() - 0.5) * scale * 0.025, y, scale * 0.014, '#2d2b2a', seed + 50 + side)
      }
    }

    /* brows, sometimes joined */
    if (random() > 0.4) {
      var browY = eyeY - scale * (0.07 + random() * 0.03)
      if (random() > 0.85) {
        SKETCH.stroke(context, [[-eyeSpread - scale * 0.06, browY], [eyeSpread + scale * 0.06, browY + (random() - 0.5) * scale * 0.03]], { seed: seed + 60, color: ink, width: Math.max(1.2, scale * 0.024), amp: scale * 0.008 })
      } else {
        SKETCH.stroke(context, [[-eyeSpread - scale * 0.05, browY + (random() - 0.5) * scale * 0.02], [-eyeSpread + scale * 0.05, browY - scale * 0.01]], { seed: seed + 61, color: ink, width: Math.max(1.1, scale * 0.02), amp: scale * 0.006 })
        SKETCH.stroke(context, [[eyeSpread - scale * 0.05, browY - scale * 0.01], [eyeSpread + scale * 0.05, browY + (random() - 0.5) * scale * 0.02]], { seed: seed + 62, color: ink, width: Math.max(1.1, scale * 0.02), amp: scale * 0.006 })
      }
    }

    /* nose */
    SKETCH.stroke(context, [
      [(random() - 0.5) * scale * 0.035, -scale * 0.035],
      [-scale * (0.03 + random() * 0.035), scale * 0.075],
      [scale * (0.015 + random() * 0.055), scale * 0.13],
      [scale * (random() * 0.045), scale * 0.145],
    ], { seed: seed + 70, color: ink, width: Math.max(1.1, scale * 0.02), amp: scale * 0.006 })

    /* mouth */
    var mouthY = scale * (0.22 + random() * 0.035)
    var mouthKind = random()
    if (mouthKind > 0.85) {
      /* open surprise */
      var mouth = []
      for (var m = 0; m <= 8; m += 1) {
        var ma = (m / 8) * Math.PI * 2
        mouth.push([Math.cos(ma) * scale * 0.05, mouthY + Math.sin(ma) * scale * 0.06])
      }
      SKETCH.stroke(context, mouth, { seed: seed + 80, color: ink, width: Math.max(1.1, scale * 0.02), amp: scale * 0.005, step: scale * 0.05 })
    } else {
      SKETCH.stroke(context, [
        [-scale * (0.095 + random() * 0.025), mouthY],
        [0, mouthY + (mouthKind - 0.44) * scale * 0.17],
        [scale * (0.095 + random() * 0.035), mouthY + (random() - 0.5) * scale * 0.04],
      ], { seed: seed + 81, color: ink, width: Math.max(1.1, scale * 0.02), amp: scale * 0.008 })
    }

    /* hair */
    var hairStyle = Math.floor(random() * 6)
    var hairInk = 'rgba(41, 36, 34, 0.88)'
    if (hairStyle === 0 || hairStyle === 1) {
      for (var strand = 0; strand < 8 + Math.floor(random() * 7); strand += 1) {
        var sx = (strand / 12 - 0.5) * headWidth * 1.4
        SKETCH.stroke(context, [
          [sx, -headHeight * 0.86],
          [sx + (random() - 0.5) * scale * 0.12, -headHeight * (1.05 + random() * 0.34)],
        ], { seed: seed + 90 + strand, color: hairInk, width: Math.max(1.3, scale * 0.028), amp: scale * 0.008 })
      }
    } else if (hairStyle === 2) {
      context.save()
      context.fillStyle = 'rgba(45, 38, 34, 0.84)'
      context.beginPath()
      context.ellipse(0, -headHeight * 0.94, headWidth * 0.6, scale * 0.13, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    } else if (hairStyle === 3) {
      context.save()
      context.fillStyle = 'rgba(45, 38, 34, 0.84)'
      context.beginPath()
      context.moveTo(-headWidth * 0.75, -headHeight * 0.62)
      context.quadraticCurveTo(0, -headHeight * 1.34, headWidth * 0.8, -headHeight * 0.68)
      context.lineTo(headWidth * 0.45, -headHeight * 0.92)
      context.quadraticCurveTo(0, -headHeight * 1.04, -headWidth * 0.5, -headHeight * 0.85)
      context.closePath()
      context.fill()
      context.restore()
    } else if (hairStyle === 4) {
      /* scribble curls */
      for (var curl = 0; curl < 20; curl += 1) {
        var cx = (random() - 0.5) * headWidth * 1.3
        var cy = -headHeight * (0.78 + random() * 0.34)
        SKETCH.stroke(context, [
          [cx - scale * 0.03, cy],
          [cx, cy - scale * 0.045],
          [cx + scale * 0.035, cy + scale * 0.01],
        ], { seed: seed + 120 + curl, color: hairInk, width: Math.max(1, scale * 0.018), amp: scale * 0.01 })
      }
    }
    /* hairStyle 5: bald */

    /* small chance of a beauty mark, blush, or earring */
    if (random() > 0.74) {
      SKETCH.dot(context, (random() - 0.5) * scale * 0.26, scale * (0.02 + random() * 0.24), scale * 0.016, 'rgba(45, 38, 34, 0.84)', seed + 140)
    }
    if (random() > 0.7) {
      context.save()
      context.globalAlpha = 0.24
      context.fillStyle = '#c76a5c'
      context.beginPath()
      context.ellipse(-eyeSpread, scale * 0.1, scale * 0.05, scale * 0.032, 0, 0, Math.PI * 2)
      context.ellipse(eyeSpread, scale * 0.1, scale * 0.05, scale * 0.032, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    context.restore()
  }

  FACES.columnsFor = function (width) {
    if (width > 690) return 6
    if (width > 460) return 4
    return 3
  }

  FACES.ROWS_TOTAL = 24

  /* Render the sheet of faces onto a context. seeds: array of 24 numbers. */
  FACES.renderSheet = function (context, width, height, seeds, topOffset) {
    var columns = FACES.columnsFor(width)
    var rows = Math.ceil(seeds.length / columns)
    var cellWidth = width / columns
    var cellHeight = (height - topOffset) / rows
    var cells = []
    for (var index = 0; index < seeds.length; index += 1) {
      var column = index % columns
      var row = Math.floor(index / columns)
      var x = cellWidth * (column + 0.5)
      var y = topOffset + cellHeight * (row + 0.52)
      drawFace(context, x, y, Math.min(cellWidth, cellHeight) * 0.72, seeds[index])
      cells.push({ x: cellWidth * column, y: topOffset + cellHeight * row, width: cellWidth, height: cellHeight })
    }
    return cells
  }

  FACES.drawFace = drawFace
})()
