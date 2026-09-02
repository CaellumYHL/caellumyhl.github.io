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

  /* A portrait of the author: curly dark fringe, rectangular glasses,
     strong brows, a fuller mouth held level, a cord at the neck, and a
     grey tank — drawn with the same marks as everyone else. */
  FACES.portrait = function (context, centerX, centerY, size, seed) {
    var random = SKETCH.rng(seed)
    var headW = size * 0.37
    var headH = size * 0.5
    var ink = 'rgba(40, 36, 32, 0.85)'

    /* shoulders and the grey tank */
    context.save()
    context.globalAlpha = 0.5
    context.fillStyle = '#a8a49c'
    context.beginPath()
    context.moveTo(centerX - size * 0.52, centerY + size * 0.78)
    context.quadraticCurveTo(centerX - size * 0.42, centerY + size * 0.52, centerX - size * 0.2, centerY + size * 0.47)
    context.lineTo(centerX + size * 0.2, centerY + size * 0.47)
    context.quadraticCurveTo(centerX + size * 0.42, centerY + size * 0.52, centerX + size * 0.52, centerY + size * 0.78)
    context.closePath()
    context.fill()
    context.restore()
    SKETCH.stroke(context, [
      [centerX - size * 0.5, centerY + size * 0.76], [centerX - size * 0.38, centerY + size * 0.52],
      [centerX - size * 0.2, centerY + size * 0.47],
    ], { seed: seed + 1, color: ink, width: 1.4, amp: 1 })
    SKETCH.stroke(context, [
      [centerX + size * 0.5, centerY + size * 0.76], [centerX + size * 0.38, centerY + size * 0.52],
      [centerX + size * 0.2, centerY + size * 0.47],
    ], { seed: seed + 2, color: ink, width: 1.4, amp: 1 })

    /* neck */
    context.save()
    context.globalAlpha = 0.55
    context.fillStyle = '#d3a983'
    context.fillRect(centerX - size * 0.11, centerY + size * 0.34, size * 0.22, size * 0.18)
    context.restore()

    /* the face: broad at the brow, tapering to the chin */
    var face = [
      [centerX - headW * 0.92, centerY - headH * 0.5],
      [centerX - headW, centerY - headH * 0.05],
      [centerX - headW * 0.82, centerY + headH * 0.42],
      [centerX - headW * 0.45, centerY + headH * 0.86],
      [centerX, centerY + headH],
      [centerX + headW * 0.45, centerY + headH * 0.86],
      [centerX + headW * 0.82, centerY + headH * 0.42],
      [centerX + headW, centerY - headH * 0.05],
      [centerX + headW * 0.92, centerY - headH * 0.5],
      [centerX + headW * 0.5, centerY - headH * 0.86],
      [centerX, centerY - headH * 0.95],
      [centerX - headW * 0.5, centerY - headH * 0.86],
    ]
    context.save()
    context.globalAlpha = 0.6
    context.fillStyle = '#dcb28c'
    context.beginPath()
    face.forEach(function (point, index) {
      if (index === 0) context.moveTo(point[0], point[1])
      else context.lineTo(point[0], point[1])
    })
    context.closePath()
    context.fill()
    /* the light leaves the sides of the face */
    context.globalAlpha = 0.16
    context.fillStyle = '#a97e58'
    context.beginPath()
    context.ellipse(centerX - headW * 0.66, centerY + headH * 0.3, headW * 0.26, headH * 0.34, 0.3, 0, Math.PI * 2)
    context.ellipse(centerX + headW * 0.66, centerY + headH * 0.3, headW * 0.26, headH * 0.34, -0.3, 0, Math.PI * 2)
    context.fill()
    context.restore()
    SKETCH.stroke(context, face.concat([face[0]]), { seed: seed + 3, color: ink, width: 1.5, amp: size * 0.008, step: size * 0.06 })

    /* ears */
    SKETCH.stroke(context, [
      [centerX - headW * 0.98, centerY - headH * 0.02], [centerX - headW * 1.1, centerY + headH * 0.08], [centerX - headW * 0.95, centerY + headH * 0.22],
    ], { seed: seed + 4, color: ink, width: 1.3, amp: 0.8 })
    SKETCH.stroke(context, [
      [centerX + headW * 0.98, centerY - headH * 0.02], [centerX + headW * 1.1, centerY + headH * 0.08], [centerX + headW * 0.95, centerY + headH * 0.22],
    ], { seed: seed + 5, color: ink, width: 1.3, amp: 0.8 })

    /* the curly dark hair, a mass of scribbles with a falling fringe */
    context.save()
    context.globalAlpha = 0.75
    context.fillStyle = '#453627'
    context.beginPath()
    context.moveTo(centerX - headW * 1.04, centerY - headH * 0.28)
    context.quadraticCurveTo(centerX - headW * 1.12, centerY - headH * 1.05, centerX - headW * 0.35, centerY - headH * 1.28)
    context.quadraticCurveTo(centerX + headW * 0.4, centerY - headH * 1.42, centerX + headW * 1.02, centerY - headH * 0.92)
    context.quadraticCurveTo(centerX + headW * 1.12, centerY - headH * 0.5, centerX + headW * 1.0, centerY - headH * 0.26)
    context.quadraticCurveTo(centerX + headW * 0.6, centerY - headH * 0.62, centerX, centerY - headH * 0.66)
    context.quadraticCurveTo(centerX - headW * 0.6, centerY - headH * 0.64, centerX - headW * 1.04, centerY - headH * 0.28)
    context.closePath()
    context.fill()
    context.restore()
    /* curls throughout the mass */
    for (var curl = 0; curl < 40; curl += 1) {
      var curlX = centerX + (random() - 0.5) * headW * 1.85
      var curlY = centerY - headH * (0.7 + random() * 0.48)
      SKETCH.stroke(context, [
        [curlX - size * 0.02, curlY + size * 0.008],
        [curlX, curlY - size * 0.02],
        [curlX + size * 0.022, curlY + size * 0.006],
        [curlX + size * 0.008, curlY + size * 0.02],
      ], { seed: seed + 20 + curl, color: 'rgba(50, 38, 27, 0.85)', width: 1.4, amp: size * 0.006 })
    }
    /* the fringe: a few curls falling over the forehead */
    for (var strand = 0; strand < 3; strand += 1) {
      var strandX = centerX - headW * 0.42 + strand * headW * 0.4
      SKETCH.stroke(context, [
        [strandX, centerY - headH * 0.66],
        [strandX + (random() - 0.5) * size * 0.03, centerY - headH * (0.5 - (strand % 2) * 0.06)],
        [strandX + size * 0.02, centerY - headH * (0.42 - (strand % 2) * 0.05)],
        [strandX - size * 0.005, centerY - headH * (0.38 - (strand % 2) * 0.05)],
      ], { seed: seed + 60 + strand, color: 'rgba(50, 38, 27, 0.9)', width: size * 0.02, amp: size * 0.008 })
    }

    /* strong brows, nearly level */
    SKETCH.stroke(context, [
      [centerX - headW * 0.62, centerY - headH * 0.24], [centerX - headW * 0.16, centerY - headH * 0.28],
    ], { seed: seed + 70, color: 'rgba(44, 34, 26, 0.9)', width: size * 0.018, amp: size * 0.004 })
    SKETCH.stroke(context, [
      [centerX + headW * 0.16, centerY - headH * 0.28], [centerX + headW * 0.62, centerY - headH * 0.24],
    ], { seed: seed + 71, color: 'rgba(44, 34, 26, 0.9)', width: size * 0.018, amp: size * 0.004 })

    /* the rectangular glasses: dark along the top, fine below */
    var lensW = headW * 0.62
    var lensH = headH * 0.3
    var lensY = centerY - headH * 0.12
    ;[-1, 1].forEach(function (side, sideIndex) {
      var lensX = centerX + side * headW * 0.42
      SKETCH.stroke(context, [
        [lensX - lensW / 2, lensY - lensH / 2], [lensX + lensW / 2, lensY - lensH / 2],
      ], { seed: seed + 80 + sideIndex, color: 'rgba(36, 32, 28, 0.95)', width: size * 0.016, amp: 0.4 })
      SKETCH.stroke(context, [
        [lensX + lensW / 2, lensY - lensH / 2], [lensX + lensW / 2, lensY + lensH / 2],
        [lensX - lensW / 2, lensY + lensH / 2], [lensX - lensW / 2, lensY - lensH / 2],
      ], { seed: seed + 84 + sideIndex, color: 'rgba(56, 50, 44, 0.75)', width: size * 0.008, amp: 0.5 })
    })
    SKETCH.stroke(context, [
      [centerX - headW * 0.11, lensY - lensH / 2], [centerX + headW * 0.11, lensY - lensH / 2],
    ], { seed: seed + 88, color: 'rgba(36, 32, 28, 0.9)', width: size * 0.012, amp: 0.3 })
    SKETCH.stroke(context, [
      [centerX - headW * 0.73, lensY - lensH / 2], [centerX - headW * 0.97, lensY - lensH * 0.2],
    ], { seed: seed + 89, color: 'rgba(36, 32, 28, 0.8)', width: size * 0.01, amp: 0.3 })
    SKETCH.stroke(context, [
      [centerX + headW * 0.73, lensY - lensH / 2], [centerX + headW * 0.97, lensY - lensH * 0.2],
    ], { seed: seed + 90, color: 'rgba(36, 32, 28, 0.8)', width: size * 0.01, amp: 0.3 })

    /* calm eyes behind the lenses */
    ;[-1, 1].forEach(function (side, sideIndex) {
      var eyeX = centerX + side * headW * 0.4
      SKETCH.stroke(context, [
        [eyeX - headW * 0.16, lensY], [eyeX + headW * 0.16, lensY - headH * 0.015],
      ], { seed: seed + 94 + sideIndex, color: ink, width: size * 0.011, amp: 0.5 })
      SKETCH.dot(context, eyeX + side * headW * 0.02, lensY + headH * 0.028, size * 0.018, '#33291f', seed + 98 + sideIndex)
    })

    /* the nose, defined */
    SKETCH.stroke(context, [
      [centerX - headW * 0.05, centerY - headH * 0.06],
      [centerX - headW * 0.09, centerY + headH * 0.2],
      [centerX - headW * 0.02, centerY + headH * 0.3],
      [centerX + headW * 0.1, centerY + headH * 0.28],
    ], { seed: seed + 102, color: ink, width: size * 0.011, amp: size * 0.004 })
    SKETCH.stroke(context, [
      [centerX - headW * 0.16, centerY + headH * 0.3], [centerX - headW * 0.1, centerY + headH * 0.33],
    ], { seed: seed + 103, color: 'rgba(40, 36, 32, 0.6)', width: size * 0.009, amp: 0.3 })

    /* the mouth: fuller lips, held level */
    SKETCH.stroke(context, [
      [centerX - headW * 0.3, centerY + headH * 0.52],
      [centerX - headW * 0.1, centerY + headH * 0.5],
      [centerX, centerY + headH * 0.53],
      [centerX + headW * 0.1, centerY + headH * 0.5],
      [centerX + headW * 0.3, centerY + headH * 0.52],
    ], { seed: seed + 106, color: 'rgba(40, 34, 30, 0.9)', width: size * 0.012, amp: size * 0.003 })
    context.save()
    context.globalAlpha = 0.4
    context.fillStyle = '#b97a68'
    context.beginPath()
    context.ellipse(centerX, centerY + headH * 0.6, headW * 0.26, headH * 0.06, 0, 0, Math.PI)
    context.fill()
    context.restore()
    SKETCH.stroke(context, [
      [centerX - headW * 0.2, centerY + headH * 0.67], [centerX + headW * 0.2, centerY + headH * 0.67],
    ], { seed: seed + 108, color: 'rgba(40, 36, 32, 0.5)', width: size * 0.008, amp: 0.4 })

    /* the cord at the neck, and its small knot */
    SKETCH.stroke(context, [
      [centerX - size * 0.16, centerY + size * 0.5], [centerX - size * 0.05, centerY + size * 0.62], [centerX + size * 0.01, centerY + size * 0.65],
    ], { seed: seed + 112, color: 'rgba(34, 30, 26, 0.85)', width: 1.3, amp: 0.6 })
    SKETCH.stroke(context, [
      [centerX + size * 0.16, centerY + size * 0.5], [centerX + size * 0.06, centerY + size * 0.62], [centerX + size * 0.01, centerY + size * 0.65],
    ], { seed: seed + 113, color: 'rgba(34, 30, 26, 0.85)', width: 1.3, amp: 0.6 })
    SKETCH.dot(context, centerX + size * 0.01, centerY + size * 0.66, size * 0.014, 'rgba(34, 30, 26, 0.9)', seed + 114)
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
