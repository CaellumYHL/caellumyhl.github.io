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

  var REDUCED_MOTION = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function smoothPath(context, points) {
    context.beginPath()
    context.moveTo(points[0][0], points[0][1])
    for (var index = 1; index < points.length - 1; index += 1) {
      var midX = (points[index][0] + points[index + 1][0]) / 2
      var midY = (points[index][1] + points[index + 1][1]) / 2
      context.quadraticCurveTo(points[index][0], points[index][1], midX, midY)
    }
    context.closePath()
  }

  function soften(context, points, color, seed, options) {
    options = options || {}
    var random = SKETCH.rng(seed)
    var passes = options.passes || 5
    var jitter = options.jitter === undefined ? 4 : options.jitter
    var alpha = options.alpha === undefined ? 0.2 : options.alpha
    context.save()
    context.fillStyle = color
    for (var pass = 0; pass < passes; pass += 1) {
      var driftX = (random() - 0.5) * jitter * 2
      var driftY = (random() - 0.5) * jitter * 2
      context.globalAlpha = alpha * (0.75 + random() * 0.5)
      smoothPath(context, points.map(function (point) {
        return [point[0] + driftX + (random() - 0.5) * jitter, point[1] + driftY + (random() - 0.5) * jitter]
      }))
      context.fill()
    }
    if (options.dust !== false) {
      for (var dust = 0; dust < points.length * 2; dust += 1) {
        var at = Math.floor(random() * (points.length - 1))
        var t = random()
        context.globalAlpha = 0.07 + random() * 0.12
        context.fillRect(
          points[at][0] + (points[at + 1][0] - points[at][0]) * t + (random() - 0.5) * jitter * 3,
          points[at][1] + (points[at + 1][1] - points[at][1]) * t + (random() - 0.5) * jitter * 3,
          0.9 + random() * 1.6, 0.8 + random() * 1.4,
        )
      }
    }
    context.restore()
  }

  function tubePoints(line, startWidth, endWidth) {
    var left = []
    var right = []
    for (var index = 0; index < line.length; index += 1) {
      var previous = line[Math.max(0, index - 1)]
      var next = line[Math.min(line.length - 1, index + 1)]
      var dirX = next[0] - previous[0]
      var dirY = next[1] - previous[1]
      var length = Math.hypot(dirX, dirY) || 1
      var normalX = -dirY / length
      var normalY = dirX / length
      var t = index / (line.length - 1)
      var halfWidth = (startWidth + (endWidth - startWidth) * t) / 2
      left.push([line[index][0] + normalX * halfWidth, line[index][1] + normalY * halfWidth])
      right.push([line[index][0] - normalX * halfWidth, line[index][1] - normalY * halfWidth])
    }
    return left.concat(right.reverse())
  }

  function limb(context, line, startWidth, endWidth, color, seed, options) {
    soften(context, tubePoints(line, startWidth, endWidth), color, seed, options)
  }

  function ringPoints(centerX, centerY, radius, squashY) {
    var points = []
    for (var index = 0; index < 12; index += 1) {
      var angle = (index / 12) * Math.PI * 2
      points.push([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * (squashY || 1)])
    }
    return points
  }

  function deviceRatio(canvas) {
    var bounds = canvas.getBoundingClientRect()
    return bounds.width ? canvas.width / bounds.width : 1
  }

  /* A boiled copy of a drawn page: the image sliced into strips, each
     strip nudged a hair — the lines waver as if redrawn by hand. */
  function boiledCopy(source, variant) {
    var copy = document.createElement('canvas')
    copy.width = source.width
    copy.height = source.height
    var context = copy.getContext('2d')
    var random = SKETCH.rng(9000 + variant * 131)
    context.drawImage(source, 0, 0)
    var strip = Math.max(18, Math.round(source.width / 46))
    for (var x = 0; x < source.width; x += strip) {
      var give = (random() - 0.5) * 3.2
      context.drawImage(source, x, 0, strip, source.height, x, give, strip, source.height)
    }
    var mid = document.createElement('canvas')
    mid.width = source.width
    mid.height = source.height
    var midContext = mid.getContext('2d')
    midContext.drawImage(copy, 0, 0)
    for (var y = 0; y < source.height; y += strip) {
      var giveX = (random() - 0.5) * 3.2
      midContext.drawImage(copy, 0, y, source.width, strip, giveX, y, source.width, strip)
    }
    return mid
  }

  /* Snapshot a freshly drawn page and keep it alive: the drawing boils
     between re-wobbled frames while a quiet overlay moves on top. */
  function beginIdle(state, api, overlay) {
    if (REDUCED_MOTION) return
    var snap = document.createElement('canvas')
    snap.width = api.canvas.width
    snap.height = api.canvas.height
    snap.getContext('2d').drawImage(api.canvas, 0, 0)
    state.frames = [snap, boiledCopy(snap, 1), boiledCopy(snap, 2)]
    state.frameIndex = 0
    state.lastBoil = 0
    state.idleApi = api
    if (state.raf) return
    var tick = function (now) {
      state.raf = 0
      if (state.hidden || !state.frames) return
      if (now - state.lastBoil > 640) {
        state.frameIndex = (state.frameIndex + 1) % state.frames.length
        state.lastBoil = now
      }
      var liveApi = state.idleApi
      var ratio = deviceRatio(liveApi.canvas)
      var region = { x: 0, y: 58, width: liveApi.width - 16, height: liveApi.height - 58 - 96 }
      var context = liveApi.canvas.getContext('2d')
      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.drawImage(
        state.frames[state.frameIndex],
        region.x * ratio, region.y * ratio, region.width * ratio, region.height * ratio,
        region.x * ratio, region.y * ratio, region.width * ratio, region.height * ratio,
      )
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.beginPath()
      context.rect(region.x, region.y, region.width, region.height)
      context.clip()
      overlay(context, now)
      context.restore()
      state.raf = requestAnimationFrame(tick)
    }
    state.raf = requestAnimationFrame(tick)
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
      state.room = { back: back, width: width, height: height }

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

    function roomOverlay(context, now) {
      var room = state.room
      if (!room) return
      var t = now * 0.001
      /* dust hanging in the still air */
      context.fillStyle = 'rgba(120, 108, 86, 1)'
      for (var mote = 0; mote < 22; mote += 1) {
        var moteX = (((mote * 0.127 + t * 0.006 * (1 + (mote % 3))) % 1) + 1) % 1 * room.width
        var moteY = ((((mote * 0.211) - t * 0.009) % 1) + 1) % 1 * room.height
        context.globalAlpha = 0.08 + 0.12 * Math.abs(Math.sin(t * 0.7 + mote * 1.7))
        context.fillRect(moteX, moteY, 1.3, 1.3)
      }
      context.globalAlpha = 1
      /* the fluorescents stutter now and then */
      var cycle = t % 6.4
      if (cycle < 0.1 || (cycle > 0.18 && cycle < 0.26)) {
        context.globalAlpha = 0.07
        context.fillStyle = '#fdf9e8'
        context.fillRect(0, 0, room.width, room.back.bottom)
        context.globalAlpha = 1
      }
    }

    return {
      state: state,
      aria: 'An artwork: a pale, empty back room with drawn trees and grass growing out of the carpet, regrown on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height, api) {
        SKETCH.plainPaper(context, width, height, { seed: 903, tone: '#efece1' })
        drawRoom(context, width, height, state.seed)
        write(context, data.title, 26, 28, { size: 12, media: 'pencil', seed: 901, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 38, 26 + measure(data.title, 12, 0.4) + 8, { seed: 902, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.date, 26 + measure(data.title, 12, 0.4) + 20, 28, { size: 8.5, media: 'pencil', seed: 904 })
        write(context, 'CLICK TO REGROW', 26, 48, { size: 7, color: SKETCH.GREEN_PEN, seed: 906 })
        SKETCH.artifacts(context, width, height, 908 + state.seed)
        if (api) beginIdle(state, api, roomOverlay)
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
      state.frame = { x: frameX, y: frameY, width: frameWidth, height: frameHeight }

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

    function buildCourtButterfly(span) {
      var wingWidth = Math.round(span * 0.58)
      var wingHeight = Math.round(span * 0.92)
      var wing = document.createElement('canvas')
      wing.width = wingWidth * 2
      wing.height = wingHeight * 2
      var context = wing.getContext('2d')
      context.setTransform(2, 0, 0, 2, 0, 0)
      var random = SKETCH.rng(5417)

      var fore = [
        [2, wingHeight * 0.48], [wingWidth * 0.2, wingHeight * 0.16], [wingWidth * 0.62, wingHeight * 0.03],
        [wingWidth * 0.93, wingHeight * 0.1], [wingWidth * 0.9, wingHeight * 0.32], [wingWidth * 0.62, wingHeight * 0.46],
        [wingWidth * 0.24, wingHeight * 0.5],
      ]
      var hind = [
        [2, wingHeight * 0.52], [wingWidth * 0.42, wingHeight * 0.5], [wingWidth * 0.66, wingHeight * 0.6],
        [wingWidth * 0.6, wingHeight * 0.82], [wingWidth * 0.34, wingHeight * 0.97], [wingWidth * 0.1, wingHeight * 0.86],
        [wingWidth * 0.02, wingHeight * 0.66],
      ]

      /* a wing: the true silhouette, filled with wet pigment, held by a
         darker drying edge in its own colour — never an ink outline */
      function paintWing(shape, fill, pool, edge, seed) {
        var jagged = shape.map(function (point) {
          return [point[0] + (random() - 0.5) * 3, point[1] + (random() - 0.5) * 3]
        })
        context.save()
        smoothPath(context, jagged)
        context.clip()
        context.globalAlpha = 0.5
        context.fillStyle = fill
        context.fillRect(0, 0, wingWidth, wingHeight)
        /* the paint pools unevenly while it dries */
        for (var puddle = 0; puddle < 5; puddle += 1) {
          context.globalAlpha = 0.1 + random() * 0.14
          context.fillStyle = puddle % 2 ? pool : fill
          context.beginPath()
          context.ellipse(
            wingWidth * (0.2 + random() * 0.6), wingHeight * (0.1 + random() * 0.8),
            wingWidth * (0.14 + random() * 0.2), wingHeight * (0.08 + random() * 0.12),
            random() * 3, 0, Math.PI * 2,
          )
          context.fill()
        }
        /* granulation */
        context.fillStyle = pool
        for (var grain = 0; grain < 130; grain += 1) {
          context.globalAlpha = 0.08 + random() * 0.16
          context.fillRect(random() * wingWidth, random() * wingHeight, 1 + random() * 1.5, 1 + random())
        }
        context.restore()
        SKETCH.stroke(context, jagged.concat([jagged[0]]), { seed: seed, color: edge, width: 1.7, amp: 1.8, step: 5 })
      }

      paintWing(fore, '#ddd6c4', '#a8a294', 'rgba(118, 112, 98, 0.55)', 5440)
      paintWing(hind, '#b3afa4', '#807b70', 'rgba(96, 90, 78, 0.55)', 5441)

      /* grey marks, like a cabbage white's */
      SKETCH.wash(context, wingWidth * 0.56, wingHeight * 0.14, wingWidth * 0.14, wingHeight * 0.1, '#8a857a', { seed: 5442, alpha: 0.5, layers: 2, grain: false })
      SKETCH.wash(context, wingWidth * 0.32, wingHeight * 0.66, wingWidth * 0.1, wingHeight * 0.08, '#918c80', { seed: 5443, alpha: 0.4, layers: 2, grain: false })

      var body = document.createElement('canvas')
      var bodyWidth = Math.round(span * 0.1)
      var bodyHeight = Math.round(span * 0.52)
      body.width = bodyWidth * 2
      body.height = bodyHeight * 2
      var bodyContext = body.getContext('2d')
      bodyContext.setTransform(2, 0, 0, 2, 0, 0)
      SKETCH.wash(bodyContext, bodyWidth * 0.26, bodyHeight * 0.12, bodyWidth * 0.48, bodyHeight * 0.8, '#3c322a', { seed: 5444, alpha: 0.85, layers: 3 })
      SKETCH.pencil(bodyContext, [[bodyWidth * 0.44, bodyHeight * 0.12], [bodyWidth * 0.1, bodyHeight * 0.0]], { seed: 5445, color: 'rgba(60, 50, 42, 0.8)', width: 1.2, amp: 0.8 })
      SKETCH.pencil(bodyContext, [[bodyWidth * 0.56, bodyHeight * 0.12], [bodyWidth * 0.9, bodyHeight * 0.0]], { seed: 5446, color: 'rgba(60, 50, 42, 0.8)', width: 1.2, amp: 0.8 })

      return { wing: wing, body: body, wingWidth: wingWidth, wingHeight: wingHeight, bodyWidth: bodyWidth, bodyHeight: bodyHeight, span: span }
    }

    function courtOverlay(context, now) {
      var frame = state.frame
      if (!frame) return
      var t = now * 0.001

      /* the light through the canopy breathes */
      var shimmer = 0.028 + 0.028 * Math.sin(t * 0.5)
      var glow = context.createLinearGradient(0, frame.y, 0, frame.y + frame.height * 0.8)
      glow.addColorStop(0, 'rgba(248, 246, 224, ' + shimmer + ')')
      glow.addColorStop(1, 'rgba(248, 246, 224, 0)')
      context.fillStyle = glow
      context.fillRect(frame.x + frame.width * 0.3, frame.y, frame.width * 0.28, frame.height * 0.8)

      /* dust rising through the shafts */
      context.fillStyle = 'rgba(246, 243, 220, 1)'
      for (var mote = 0; mote < 18; mote += 1) {
        var rise = ((t * 0.03 * (1 + (mote % 3) * 0.4) + mote * 0.37) % 1)
        var moteX = frame.x + frame.width * (0.33 + ((mote * 0.617) % 1) * 0.24)
        var moteY = frame.y + frame.height * (0.75 - rise * 0.6)
        context.globalAlpha = Math.sin(rise * Math.PI) * (0.18 + 0.14 * ((mote * 7) % 3) / 3)
        context.fillRect(moteX + Math.sin(t + mote) * 3, moteY, 1.4, 1.4)
      }
      context.globalAlpha = 1

      /* every little while, one leaf lets go */
      var period = 8.5
      var phase = (t % period) / period
      if (phase < 0.62) {
        var fall = phase / 0.62
        var leafX = frame.x + frame.width * (0.45 + Math.sin(fall * 9 + Math.floor(t / period)) * 0.05)
        var leafY = frame.y + frame.height * (0.16 + fall * 0.58)
        context.save()
        context.translate(leafX, leafY)
        context.rotate(Math.sin(fall * 11) * 0.9)
        context.globalAlpha = Math.min(1, Math.sin(fall * Math.PI) * 1.6) * 0.85
        context.fillStyle = '#77855c'
        context.beginPath()
        context.ellipse(0, 0, 5.5, 3, 0, 0, Math.PI * 2)
        context.fill()
        context.strokeStyle = 'rgba(46, 54, 40, 0.7)'
        context.lineWidth = 0.8
        context.beginPath()
        context.moveTo(-5, 0)
        context.lineTo(5, 0)
        context.stroke()
        context.restore()
      }

      /* the one butterfly, fuzzy as breathed pigment, over the clearing */
      var span = frame.width * 0.085
      if (!state.butterfly || Math.abs(state.butterfly.span - span) > 2) {
        state.butterfly = buildCourtButterfly(span)
      }
      var parts = state.butterfly
      var dt = Math.min(0.06, (now - (state.butterflyLast || now)) / 1000) || 0.016
      state.butterflyLast = now

      /* it beats often and quickly, resting only briefly between bursts */
      var flutter = 0.12 + 0.88 * Math.pow(Math.max(0, Math.sin(t * 0.9 + Math.sin(t * 0.33) * 1.6)), 1.5)
      state.butterflyPhase = (state.butterflyPhase || 0) + dt * (6 + 26 * flutter)
      /* the wings snap shut quickly and open slowly */
      var warped = state.butterflyPhase + 0.7 * Math.sin(state.butterflyPhase)
      var flapDepth = 0.15 + 0.7 * flutter
      var spread = 1 - flapDepth * (0.5 + 0.5 * Math.sin(warped))
      var fold = Math.sin(warped)

      /* it only travels on its wingbeats: the bursts push and lift it,
         and when the wings rest it slows to a hover and settles */
      if (!state.butterflyPos) {
        state.butterflyPos = { x: 0.47, y: 0.58 }
        state.butterflyVel = { x: 0, y: 0 }
      }
      var pos = state.butterflyPos
      var vel = state.butterflyVel
      var targetX = 0.47 + Math.sin(t * 0.13) * 0.05
      var targetY = 0.58 + Math.sin(t * 0.19 + 1) * 0.035
      var beating = flutter > 0.4
      if (beating) {
        vel.x += (targetX - pos.x) * 1.6 * dt
        vel.y += ((targetY - pos.y) * 1.2 - 0.045 * flutter) * dt
      } else {
        vel.y += 0.014 * dt
      }
      var damp = beating ? 0.9 : 2.8
      vel.x *= Math.max(0, 1 - damp * dt)
      vel.y *= Math.max(0, 1 - damp * dt)
      pos.x = SKETCH.clamp(pos.x + vel.x * dt, 0.38, 0.56)
      pos.y = SKETCH.clamp(pos.y + vel.y * dt, 0.48, 0.68)

      var butterflyX = frame.x + frame.width * pos.x
      var butterflyY = frame.y + frame.height * pos.y + fold * 2 * flutter
      /* it leans into its own motion, and rocks with each beat */
      var tilt = SKETCH.clamp(vel.x * 30, -0.24, 0.24) + fold * 0.05 * flutter

      /* a soft shadow on the grass beneath it */
      context.save()
      context.globalAlpha = 0.12
      context.fillStyle = '#2e3a26'
      context.beginPath()
      context.ellipse(butterflyX, frame.y + frame.height * 0.72, parts.span * 0.34 * spread, parts.span * 0.06, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()

      context.save()
      context.translate(butterflyX, butterflyY)
      context.rotate(tilt)
      context.globalAlpha = 0.95
      context.save()
      context.scale(-spread, 1)
      context.drawImage(parts.wing, 0, -parts.wingHeight / 2, parts.wingWidth, parts.wingHeight)
      context.restore()
      context.save()
      context.scale(spread, 1)
      context.drawImage(parts.wing, 0, -parts.wingHeight / 2, parts.wingWidth, parts.wingHeight)
      context.restore()
      context.drawImage(parts.body, -parts.bodyWidth / 2, -parts.bodyHeight * 0.36, parts.bodyWidth, parts.bodyHeight)
      context.restore()
    }

    return {
      state: state,
      aria: 'An artwork: a sunken court deep in a forest — mossy ruined columns among tall trees, light through the canopy, a ring of ivy, and a small striped dais at the centre. Repainted on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height, api) {
        drawCourt(context, width, height, state.seed)
        write(context, data.title, 26, 30, { size: 12, media: 'pencil', seed: 1201, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 40, 26 + measure(data.title, 12, 0.4) + 8, { seed: 1202, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.date, 26 + measure(data.title, 12, 0.4) + 20, 30, { size: 8.5, media: 'pencil', seed: 1204 })
        write(context, 'CLICK TO REPAINT', width - 26, 30, { size: 7, color: SKETCH.GREEN_PEN, seed: 1206, align: 'right' })
        SKETCH.artifacts(context, width, height, 1208 + state.seed)
        if (api) beginIdle(state, api, courtOverlay)
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
  /* The Creation of Adam, traced from the fresco and repainted soft: low
     dark banks, Adam large and bright, the wine-dark cloak swept around
     God and his company, and the two hands not quite touching. The panel
     idles: haze drifts and the paint gently wavers. */

  ART.adam = function (data) {
    var state = {
      seed: 1526,
      frames: null,
      frameKey: '',
      frameIndex: 0,
      lastBoil: 0,
      raf: 0,
      layout: null,
      drifters: null,
    }

    /* the fresco's palette */
    var FLESH = '#d9b28c'
    var FLESH_SH = '#a97e58'
    var FLESH_HI = '#efd0a8'
    var CHERUB_FLESH = '#c99772'
    var HAIR_BROWN = '#6b4a2f'
    var HAIR_GOLD = '#c8963c'
    var HAIR_AUBURN = '#9a5a33'
    var HILL = '#7b8790'
    var BANK = '#66705a'
    var ROCK = '#4a4136'
    var TEAL = '#2c4a42'
    var SHELL_RIM = '#5e2c28'
    var SHELL = '#7d3b32'
    var SHELL_WARM = '#8d4a3c'
    var CLOAK_RED = '#6b2722'
    var TUNIC = '#e6d8d2'
    var TUNIC_SH = '#c1a49e'
    var BEARD = '#d6d6d8'
    var SASH = '#3f7a55'
    var SASH_HI = '#6fa878'
    var INK = 'rgba(60, 46, 38, 0.6)'
    var INK_DARK = 'rgba(48, 38, 30, 0.85)'

    /* a flesh limb with the light on it: lit along the top, core shadow
       along the underside — the form turns instead of lying flat */
    function modelLimb(context, line, startWidth, endWidth, seed, options) {
      options = options || {}
      limb(context, line, startWidth, endWidth, FLESH, seed, options)
      var drop = startWidth * 0.26
      limb(context, line.map(function (point) { return [point[0], point[1] + drop] }),
        startWidth * 0.52, endWidth * 0.5, FLESH_SH, seed + 501,
        { jitter: options.jitter, alpha: 0.13, dust: false, passes: 3 })
      limb(context, line.map(function (point) { return [point[0], point[1] - drop] }),
        startWidth * 0.4, endWidth * 0.38, FLESH_HI, seed + 502,
        { jitter: options.jitter, alpha: 0.12, dust: false, passes: 3 })
    }
    function ink(context, points, seed, width, color) {
      SKETCH.stroke(context, points, { seed: seed, color: color || INK, width: width || 1.2, amp: 0.9, step: 8 })
    }

    /* A small clear face: clean disc, hair, two eyes that read. */
    function tinyFace(context, x, y, radius, hair, look, seed) {
      soften(context, ringPoints(x, y, radius, 1.08), CHERUB_FLESH, seed, { passes: 4, jitter: radius * 0.09, alpha: 0.3, dust: false })
      ink(context, ringPoints(x, y, radius * 1.02, 1.08).concat([[x + radius * 1.02, y]]), seed + 1, 0.9, 'rgba(60, 46, 38, 0.45)')
      /* hair cap */
      soften(context, [
        [x - radius * 0.95, y - radius * 0.25], [x - radius * 0.6, y - radius * 0.95],
        [x + radius * 0.25, y - radius * 1.15], [x + radius * 0.9, y - radius * 0.55],
        [x + radius * 0.55, y - radius * 0.4], [x - radius * 0.2, y - radius * 0.5],
      ], hair, seed + 2, { passes: 3, jitter: radius * 0.08, alpha: 0.32, dust: false })
      /* eyes, brows, mouth */
      var eyeOffset = look * radius * 0.18
      SKETCH.dot(context, x - radius * 0.32 + eyeOffset, y - radius * 0.05, Math.max(0.9, radius * 0.09), INK_DARK, seed + 3)
      SKETCH.dot(context, x + radius * 0.32 + eyeOffset, y - radius * 0.05, Math.max(0.9, radius * 0.09), INK_DARK, seed + 4)
      ink(context, [[x - radius * 0.45 + eyeOffset, y - radius * 0.28], [x - radius * 0.15 + eyeOffset, y - radius * 0.32]], seed + 5, 0.8)
      ink(context, [[x + radius * 0.15 + eyeOffset, y - radius * 0.32], [x + radius * 0.45 + eyeOffset, y - radius * 0.28]], seed + 6, 0.8)
      ink(context, [[x - radius * 0.16 + eyeOffset * 0.6, y + radius * 0.42], [x + radius * 0.16 + eyeOffset * 0.6, y + radius * 0.44]], seed + 7, 0.9)
    }

    /* ------------------------------------------------------- the panel */

    function drawAdamPanel(context, width, height, seed, boil) {
      var random = SKETCH.rng(seed + boil * 7717)
      var paperTone = '#efece1'
      SKETCH.plainPaper(context, width, height, { seed: 1503, tone: paperTone })

      var frameX = width * 0.055
      var frameY = height * 0.095
      var frameWidth = width * 0.89
      var frameHeight = height * 0.84
      var unit = frameWidth
      var wave = boil * 3301

      state.layout = { frameX: frameX, frameY: frameY, frameWidth: frameWidth, frameHeight: frameHeight }

      context.save()
      context.beginPath()
      context.rect(frameX, frameY, frameWidth, frameHeight)
      context.clip()

      var stripHeight = frameHeight * 0.1
      var panelTop = frameY + stripHeight
      var panelHeight = frameHeight - stripHeight * 2
      var px = function (t) { return frameX + frameWidth * t }
      var py = function (t) { return panelTop + panelHeight * t }

      /* plaster */
      var plaster = context.createLinearGradient(frameX, panelTop, frameX + frameWidth, panelTop + panelHeight)
      plaster.addColorStop(0, '#ccc9b8')
      plaster.addColorStop(0.45, '#dcd9c8')
      plaster.addColorStop(1, '#c6c3b1')
      context.fillStyle = plaster
      context.fillRect(frameX, frameY, frameWidth, frameHeight)
      softBloom(context, px(0.42), py(0.16), unit * 0.1, unit * 0.05, '#cbc8b6', seed + 2)
      softBloom(context, px(0.5), py(0.82), unit * 0.09, unit * 0.04, '#cfccba', seed + 3)
      /* a pale breath around where the hands will meet */
      var glow = context.createRadialGradient(px(0.386), py(0.39), 6, px(0.386), py(0.39), unit * 0.09)
      glow.addColorStop(0, 'rgba(242, 236, 216, 0.35)')
      glow.addColorStop(1, 'rgba(242, 236, 216, 0)')
      context.fillStyle = glow
      context.fillRect(px(0.28), py(0.2), unit * 0.22, panelHeight * 0.4)

      /* soft cloud banks painted into the sky, far behind everyone */
      var cloudBanks = [
        [0.44, 0.16, 1.1], [0.40, 0.5, 0.9], [0.5, 0.78, 1.0], [0.17, 0.1, 0.8],
      ]
      cloudBanks.forEach(function (bank, bankIndex) {
        var bankX = px(bank[0])
        var bankY = py(bank[1])
        var bankScale = bank[2] * unit / 1300
        for (var puff = 0; puff < 5; puff += 1) {
          context.globalAlpha = 0.12 - puff * 0.014
          context.fillStyle = '#e8e5d3'
          context.beginPath()
          context.ellipse(bankX + (puff - 2) * 34 * bankScale, bankY + Math.abs(puff - 2) * 6, 60 * bankScale, 16 * bankScale, 0, 0, Math.PI * 2)
          context.fill()
        }
        context.globalAlpha = 0.07
        context.fillStyle = '#b4b1a0'
        context.beginPath()
        context.ellipse(bankX, bankY + 14, 66 * bankScale, 8 * bankScale, 0, 0, Math.PI * 2)
        context.fill()
        context.globalAlpha = 1
        void bankIndex
      })

      /* dark strips of the surrounding ceiling */
      context.fillStyle = '#565549'
      context.fillRect(frameX, frameY, frameWidth, stripHeight)
      context.fillRect(frameX, frameY + frameHeight - stripHeight, frameWidth, stripHeight)
      SKETCH.stroke(context, [[frameX, panelTop], [frameX + frameWidth, panelTop + 2]], { seed: seed + 10, color: 'rgba(48, 46, 40, 0.7)', width: 1.5, amp: 1, step: 12 })
      SKETCH.stroke(context, [[frameX, panelTop + panelHeight], [frameX + frameWidth, panelTop + panelHeight - 2]], { seed: seed + 11, color: 'rgba(48, 46, 40, 0.7)', width: 1.5, amp: 1, step: 12 })

      /* ------------------------------------------------------ the earth */
      /* a hazy hill far behind his head */
      soften(context, [
        [px(0), py(0.16)], [px(0.06), py(0.2)], [px(0.115), py(0.3)], [px(0.1), py(0.42)], [px(0), py(0.46)],
      ], HILL, seed + wave + 20, { passes: 4, jitter: unit * 0.005, alpha: 0.13 })
      /* the low green bank he lies on */
      soften(context, [
        [px(0), py(0.98)], [px(0), py(0.4)], [px(0.045), py(0.42)], [px(0.09), py(0.5)],
        [px(0.16), py(0.6)], [px(0.24), py(0.7)], [px(0.315), py(0.8)], [px(0.365), py(0.92)], [px(0.37), py(0.98)],
      ], BANK, seed + wave + 21, { passes: 6, jitter: unit * 0.004 })
      /* dark rock under his seat and legs */
      soften(context, [
        [px(0.04), py(1)], [px(0.08), py(0.76)], [px(0.16), py(0.78)], [px(0.27), py(0.87)], [px(0.37), py(0.97)], [px(0.38), py(1)],
      ], ROCK, seed + wave + 22, { passes: 6, jitter: unit * 0.004 })
      /* the teal scrap at the corner */
      soften(context, [
        [px(0.01), py(0.9)], [px(0.05), py(0.855)], [px(0.1), py(0.885)], [px(0.09), py(0.96)], [px(0.03), py(0.97)],
      ], TEAL, seed + 23, { passes: 4, jitter: unit * 0.003 })

      /* ---------------------------------------------------------- adam */
      /* support arm behind, resting into the bank */
      modelLimb(context, [[px(0.07), py(0.42)], [px(0.038), py(0.5)], [px(0.03), py(0.575)], [px(0.02), py(0.635)]], unit * 0.024, unit * 0.013, seed + wave + 30, { jitter: unit * 0.0028 })
      /* extended leg running down the rock */
      modelLimb(context, [[px(0.105), py(0.685)], [px(0.16), py(0.77)], [px(0.225), py(0.875)], [px(0.283), py(0.94)]], unit * 0.038, unit * 0.016, seed + wave + 31, { jitter: unit * 0.003 })
      limb(context, [[px(0.283), py(0.94)], [px(0.315), py(0.945)]], unit * 0.014, unit * 0.009, FLESH, seed + wave + 32, { jitter: unit * 0.002 })
      /* raised leg: thigh up, calf down, the foot set flat */
      modelLimb(context, [[px(0.125), py(0.655)], [px(0.2), py(0.53)], [px(0.256), py(0.46)]], unit * 0.038, unit * 0.028, seed + wave + 33, { jitter: unit * 0.003 })
      modelLimb(context, [[px(0.256), py(0.46)], [px(0.293), py(0.6)], [px(0.303), py(0.73)], [px(0.31), py(0.82)]], unit * 0.026, unit * 0.012, seed + wave + 34, { jitter: unit * 0.003 })
      limb(context, [[px(0.31), py(0.82)], [px(0.338), py(0.833)]], unit * 0.012, unit * 0.008, FLESH, seed + wave + 35, { jitter: unit * 0.002 })
      /* torso, broad at the chest */
      soften(context, [
        [px(0.088), py(0.35)], [px(0.118), py(0.315)], [px(0.138), py(0.36)], [px(0.156), py(0.42)],
        [px(0.152), py(0.5)], [px(0.138), py(0.6)], [px(0.125), py(0.665)], [px(0.098), py(0.7)],
        [px(0.08), py(0.66)], [px(0.068), py(0.575)], [px(0.066), py(0.47)], [px(0.074), py(0.4)],
      ], FLESH, seed + wave + 36, { jitter: unit * 0.0032 })
      /* modelling: light on the chest, shade along the flank */
      soften(context, [
        [px(0.092), py(0.37)], [px(0.125), py(0.345)], [px(0.142), py(0.4)], [px(0.12), py(0.44)], [px(0.095), py(0.42)],
      ], FLESH_HI, seed + 37, { passes: 3, jitter: unit * 0.0025, alpha: 0.16, dust: false })
      soften(context, [
        [px(0.075), py(0.52)], [px(0.09), py(0.62)], [px(0.11), py(0.68)], [px(0.088), py(0.68)], [px(0.07), py(0.6)],
      ], FLESH_SH, seed + 38, { passes: 3, jitter: unit * 0.0025, alpha: 0.15, dust: false })
      /* the reaching arm, carried high across the knee */
      modelLimb(context, [[px(0.125), py(0.385)], [px(0.2), py(0.345)], [px(0.27), py(0.34)], [px(0.333), py(0.36)]], unit * 0.028, unit * 0.012, seed + wave + 39, { jitter: unit * 0.0026 })
      limb(context, [[px(0.333), py(0.36)], [px(0.349), py(0.369)]], unit * 0.012, unit * 0.009, FLESH, seed + wave + 40, { jitter: unit * 0.002 })
      /* the limp hand: a palm, and fingers hanging from it */
      soften(context, ringPoints(px(0.356), py(0.374), unit * 0.0105, 1.15), FLESH, seed + 240, { passes: 4, jitter: unit * 0.0015, dust: false })
      limb(context, [[px(0.362), py(0.378)], [px(0.373), py(0.392)]], unit * 0.006, unit * 0.004, FLESH, seed + 241, { jitter: unit * 0.0012 })
      limb(context, [[px(0.359), py(0.382)], [px(0.369), py(0.399)]], unit * 0.0055, unit * 0.0038, FLESH, seed + 242, { jitter: unit * 0.0012 })
      limb(context, [[px(0.355), py(0.385)], [px(0.362), py(0.403)]], unit * 0.005, unit * 0.0035, FLESH, seed + 243, { jitter: unit * 0.0012 })
      ink(context, [[px(0.361), py(0.377)], [px(0.3735), py(0.3925)]], seed + 41, 1.1, INK_DARK)
      ink(context, [[px(0.358), py(0.381)], [px(0.3695), py(0.4)]], seed + 42, 1, INK_DARK)
      ink(context, [[px(0.354), py(0.3845)], [px(0.3625), py(0.4045)]], seed + 43, 0.9, INK_DARK)
      /* head, tipped back to watch */
      soften(context, ringPoints(px(0.105), py(0.315), unit * 0.026, 1.12), FLESH, seed + wave + 44, { passes: 5, jitter: unit * 0.002 })
      soften(context, [
        [px(0.082), py(0.29)], [px(0.09), py(0.256)], [px(0.113), py(0.248)], [px(0.128), py(0.27)],
        [px(0.122), py(0.295)], [px(0.098), py(0.3)],
      ], HAIR_BROWN, seed + 45, { passes: 4, jitter: unit * 0.002, dust: false })
      /* his face: brow, eye, nose, mouth, all legible */
      ink(context, [[px(0.108), py(0.296)], [px(0.121), py(0.298)]], seed + 46, 1)
      SKETCH.dot(context, px(0.114), py(0.308), 1.3, INK_DARK, seed + 47)
      ink(context, [[px(0.124), py(0.305)], [px(0.128), py(0.32)], [px(0.122), py(0.326)]], seed + 48, 1)
      ink(context, [[px(0.112), py(0.336)], [px(0.122), py(0.337)]], seed + 49, 1)
      /* the long line of him, found once in ink */
      ink(context, [[px(0.088), py(0.36)], [px(0.07), py(0.47)], [px(0.08), py(0.62)], [px(0.104), py(0.69)], [px(0.16), py(0.775)], [px(0.225), py(0.878)], [px(0.283), py(0.938)]], seed + 50, 1.1)
      ink(context, [[px(0.128), py(0.383)], [px(0.202), py(0.343)], [px(0.272), py(0.34)], [px(0.334), py(0.361)]], seed + 52, 1)

      /* ------------------------------------------------------ the host */
      /* the swept cloak, deep and irregular, open at the left */
      var shellOuter = [
        [px(0.545), py(0.21)], [px(0.565), py(0.135)], [px(0.625), py(0.075)], [px(0.7), py(0.042)],
        [px(0.78), py(0.035)], [px(0.86), py(0.06)], [px(0.925), py(0.115)], [px(0.965), py(0.21)],
        [px(0.975), py(0.32)], [px(0.955), py(0.44)], [px(0.905), py(0.55)], [px(0.83), py(0.64)],
        [px(0.745), py(0.7)], [px(0.66), py(0.7)], [px(0.6), py(0.63)], [px(0.565), py(0.52)], [px(0.548), py(0.38)],
      ]
      soften(context, shellOuter, SHELL_RIM, seed + wave + 60, { passes: 6, jitter: unit * 0.004 })
      soften(context, shellOuter.map(function (point) {
        return [point[0] * 0.9 + px(0.758) * 0.1, point[1] * 0.88 + py(0.37) * 0.12]
      }), SHELL, seed + wave + 61, { passes: 5, jitter: unit * 0.004 })
      soften(context, ringPoints(px(0.79), py(0.35), unit * 0.11, 1.3), SHELL_WARM, seed + 62, { passes: 4, jitter: unit * 0.005, alpha: 0.12, dust: false })
      /* the red folds flying off it */
      soften(context, [
        [px(0.9), py(0.06)], [px(0.965), py(0.045)], [px(1.0), py(0.1)], [px(0.995), py(0.23)], [px(0.945), py(0.16)],
      ], CLOAK_RED, seed + wave + 63, { passes: 5, jitter: unit * 0.004 })
      soften(context, [
        [px(0.965), py(0.3)], [px(1.0), py(0.35)], [px(0.995), py(0.5)], [px(0.95), py(0.44)],
      ], CLOAK_RED, seed + 64, { passes: 5, jitter: unit * 0.004 })

      /* the company: bodies first, then faces that read */
      soften(context, [
        [px(0.79), py(0.14)], [px(0.87), py(0.17)], [px(0.93), py(0.26)], [px(0.94), py(0.38)],
        [px(0.9), py(0.5)], [px(0.83), py(0.55)], [px(0.78), py(0.47)], [px(0.77), py(0.33)], [px(0.765), py(0.22)],
      ], CHERUB_FLESH, seed + wave + 65, { passes: 4, jitter: unit * 0.004, alpha: 0.14 })
      soften(context, [
        [px(0.6), py(0.43)], [px(0.67), py(0.45)], [px(0.71), py(0.54)], [px(0.67), py(0.62)], [px(0.61), py(0.6)], [px(0.585), py(0.51)],
      ], '#8e5236', seed + wave + 66, { passes: 4, jitter: unit * 0.004, alpha: 0.16 })

      /* God's bare legs, trailing behind to the right */
      modelLimb(context, [[px(0.816), py(0.472)], [px(0.858), py(0.555)], [px(0.898), py(0.632)]], unit * 0.03, unit * 0.014, seed + wave + 70, { jitter: unit * 0.0028 })
      limb(context, [[px(0.898), py(0.632)], [px(0.921), py(0.655)], [px(0.928), py(0.668)]], unit * 0.012, unit * 0.006, FLESH, seed + wave + 71, { jitter: unit * 0.002 })
      modelLimb(context, [[px(0.84), py(0.412)], [px(0.902), py(0.44)], [px(0.955), py(0.458)]], unit * 0.034, unit * 0.015, seed + wave + 73, { jitter: unit * 0.0028 })
      limb(context, [[px(0.955), py(0.458)], [px(0.983), py(0.458)], [px(0.993), py(0.468)]], unit * 0.013, unit * 0.006, FLESH, seed + 74, { jitter: unit * 0.002 })

      /* THE white robe: one bright body flying forward, shoulders to thigh */
      var robe = [
        [px(0.638), py(0.2)], [px(0.672), py(0.165)], [px(0.716), py(0.165)], [px(0.757), py(0.2)],
        [px(0.788), py(0.25)], [px(0.818), py(0.32)], [px(0.845), py(0.39)], [px(0.848), py(0.45)],
        [px(0.812), py(0.475)], [px(0.77), py(0.44)], [px(0.727), py(0.39)], [px(0.683), py(0.33)],
        [px(0.648), py(0.275)], [px(0.628), py(0.235)],
      ]
      context.save()
      context.globalAlpha = 0.85
      context.fillStyle = TUNIC
      smoothPath(context, robe)
      context.fill()
      context.restore()
      soften(context, robe, TUNIC, seed + wave + 75, { passes: 3, jitter: unit * 0.0035, alpha: 0.12 })
      /* the underside of the robe in shadow, and the folds of flight */
      soften(context, [
        [px(0.66), py(0.3)], [px(0.71), py(0.375)], [px(0.765), py(0.435)], [px(0.808), py(0.462)],
        [px(0.77), py(0.455)], [px(0.71), py(0.4)], [px(0.658), py(0.325)],
      ], TUNIC_SH, seed + 76, { passes: 3, jitter: unit * 0.0025, alpha: 0.26, dust: false })
      /* the light catches the top of the robe */
      limb(context, [
        [px(0.648), py(0.196)], [px(0.685), py(0.17)], [px(0.722), py(0.172)], [px(0.758), py(0.204)], [px(0.79), py(0.256)],
      ], unit * 0.014, unit * 0.01, '#f7f1ea', seed + 85, { passes: 3, jitter: unit * 0.002, alpha: 0.22, dust: false })
      /* folds turned away from the light */
      limb(context, [[px(0.676), py(0.215)], [px(0.724), py(0.262)], [px(0.772), py(0.334)]], unit * 0.009, unit * 0.007, TUNIC_SH, seed + 86, { passes: 3, jitter: unit * 0.002, alpha: 0.2, dust: false })
      limb(context, [[px(0.662), py(0.262)], [px(0.708), py(0.32)], [px(0.752), py(0.392)]], unit * 0.008, unit * 0.006, TUNIC_SH, seed + 87, { passes: 3, jitter: unit * 0.002, alpha: 0.18, dust: false })
      /* the body inside the robe: a lit chest, a cinched waist, a hip */
      soften(context, [
        [px(0.652), py(0.215)], [px(0.676), py(0.19)], [px(0.706), py(0.196)], [px(0.716), py(0.23)],
        [px(0.694), py(0.256)], [px(0.664), py(0.252)],
      ], '#f4ece6', seed + 190, { passes: 3, jitter: unit * 0.002, alpha: 0.2, dust: false })
      ink(context, [[px(0.706), py(0.238)], [px(0.72), py(0.28)], [px(0.727), py(0.325)]], seed + 191, 1.1)
      ink(context, [[px(0.712), py(0.245)], [px(0.727), py(0.29)]], seed + 192, 0.9)
      soften(context, ringPoints(px(0.792), py(0.385), unit * 0.026, 0.8), TUNIC_SH, seed + 193, { passes: 3, jitter: unit * 0.002, alpha: 0.14, dust: false })
      ink(context, [[px(0.668), py(0.21)], [px(0.72), py(0.25)], [px(0.775), py(0.32)], [px(0.815), py(0.4)]], seed + 77, 1)
      ink(context, [[px(0.655), py(0.26)], [px(0.705), py(0.315)], [px(0.757), py(0.385)], [px(0.795), py(0.44)]], seed + 78, 0.9)
      ink(context, robe.slice(0, 8), seed + 81, 1, 'rgba(60, 46, 38, 0.5)')

      /* the one who waits, tucked at his side under his arm */
      tinyFace(context, px(0.716), py(0.276), unit * 0.016, HAIR_BROWN, -0.6, seed + 80)
      modelLimb(context, [[px(0.687), py(0.19)], [px(0.71), py(0.226)], [px(0.728), py(0.255)]], unit * 0.016, unit * 0.01, seed + wave + 79, { jitter: unit * 0.002 })
      /* and the far hand, closed over her shoulder */
      soften(context, ringPoints(px(0.732), py(0.264), unit * 0.0085, 1.1), FLESH, seed + 180, { passes: 4, jitter: unit * 0.0015, dust: false })
      ink(context, [[px(0.728), py(0.268)], [px(0.737), py(0.278)]], seed + 181, 1.1, INK_DARK)
      ink(context, [[px(0.733), py(0.264)], [px(0.742), py(0.273)]], seed + 182, 1, INK_DARK)
      ink(context, [[px(0.737), py(0.26)], [px(0.745), py(0.267)]], seed + 183, 0.9, INK_DARK)

      /* faces of the company, each one legible */
      tinyFace(context, px(0.73), py(0.115), unit * 0.012, HAIR_AUBURN, -0.4, seed + 82)
      tinyFace(context, px(0.782), py(0.1), unit * 0.011, HAIR_GOLD, -0.3, seed + 83)
      tinyFace(context, px(0.862), py(0.225), unit * 0.015, HAIR_GOLD, -0.7, seed + 84)
      tinyFace(context, px(0.9), py(0.33), unit * 0.012, HAIR_AUBURN, -0.5, seed + 85)
      tinyFace(context, px(0.915), py(0.28), unit * 0.011, HAIR_BROWN, -0.4, seed + 86)
      tinyFace(context, px(0.928), py(0.42), unit * 0.0105, HAIR_BROWN, -0.5, seed + 87)
      tinyFace(context, px(0.617), py(0.43), unit * 0.012, HAIR_BROWN, -0.2, seed + 88)
      /* the carried putto below, curls of gold */
      soften(context, ringPoints(px(0.71), py(0.565), unit * 0.026, 1.15), CHERUB_FLESH, seed + wave + 89, { passes: 4, jitter: unit * 0.0025 })
      tinyFace(context, px(0.687), py(0.515), unit * 0.014, HAIR_GOLD, -0.6, seed + 90)
      limb(context, [[px(0.702), py(0.6)], [px(0.678), py(0.68)]], unit * 0.012, unit * 0.007, CHERUB_FLESH, seed + 91, { jitter: unit * 0.002 })
      limb(context, [[px(0.725), py(0.605)], [px(0.71), py(0.69)]], unit * 0.011, unit * 0.007, CHERUB_FLESH, seed + 92, { jitter: unit * 0.002 })

      /* the green sash swinging under it all */
      limb(context, [[px(0.705), py(0.52)], [px(0.665), py(0.6)], [px(0.648), py(0.7)], [px(0.668), py(0.8)], [px(0.7), py(0.855)]], unit * 0.019, unit * 0.008, SASH, seed + wave + 93, { jitter: unit * 0.0026 })
      limb(context, [[px(0.698), py(0.545)], [px(0.664), py(0.63)], [px(0.655), py(0.72)]], unit * 0.006, unit * 0.004, SASH_HI, seed + 94, { jitter: unit * 0.002, dust: false })

      /* God: the great arm, then the head that means it */
      modelLimb(context, [[px(0.645), py(0.248)], [px(0.598), py(0.288)], [px(0.548), py(0.328)], [px(0.5), py(0.358)], [px(0.458), py(0.375)]], unit * 0.036, unit * 0.013, seed + wave + 95, { jitter: unit * 0.0026 })
      limb(context, [[px(0.458), py(0.375)], [px(0.441), py(0.381)]], unit * 0.013, unit * 0.01, FLESH, seed + wave + 96, { jitter: unit * 0.002 })
      /* the hand, and the finger that gives */
      soften(context, ringPoints(px(0.432), py(0.386), unit * 0.011, 1.1), FLESH, seed + 250, { passes: 4, jitter: unit * 0.0015, dust: false })
      limb(context, [[px(0.423), py(0.385)], [px(0.399), py(0.3935)]], unit * 0.006, unit * 0.0035, FLESH, seed + 251, { jitter: unit * 0.0012 })
      limb(context, [[px(0.426), py(0.393)], [px(0.413), py(0.399)]], unit * 0.005, unit * 0.0035, FLESH, seed + 252, { jitter: unit * 0.0012 })
      ink(context, [[px(0.424), py(0.383)], [px(0.398), py(0.3925)]], seed + 97, 1.3, INK_DARK)
      ink(context, [[px(0.427), py(0.391)], [px(0.4125), py(0.398)]], seed + 98, 1, INK_DARK)
      ink(context, [[px(0.649), py(0.24)], [px(0.598), py(0.286)], [px(0.548), py(0.328)], [px(0.5), py(0.358)], [px(0.44), py(0.382)]], seed + 99, 1)

      /* neck and shoulder, then the head */
      soften(context, [
        [px(0.63), py(0.222)], [px(0.648), py(0.212)], [px(0.664), py(0.222)], [px(0.658), py(0.248)], [px(0.638), py(0.252)],
      ], FLESH, seed + 175, { passes: 4, jitter: unit * 0.002, dust: false })
      soften(context, ringPoints(px(0.629), py(0.211), unit * 0.028, 1.1), FLESH, seed + wave + 100, { passes: 5, jitter: unit * 0.002 })
      /* the face turns: shadow under the brow and jaw */
      soften(context, [
        [px(0.612), py(0.222)], [px(0.632), py(0.226)], [px(0.644), py(0.24)], [px(0.626), py(0.242)], [px(0.608), py(0.232)],
      ], FLESH_SH, seed + 176, { passes: 3, jitter: unit * 0.0015, alpha: 0.13, dust: false })
      soften(context, [
        [px(0.608), py(0.198)], [px(0.62), py(0.192)], [px(0.634), py(0.194)], [px(0.63), py(0.201)], [px(0.612), py(0.203)],
      ], FLESH_HI, seed + 177, { passes: 3, jitter: unit * 0.0015, alpha: 0.14, dust: false })
      /* the full beard, hanging from the jaw and streaming down-left */
      soften(context, [
        [px(0.603), py(0.236)], [px(0.632), py(0.23)], [px(0.645), py(0.254)], [px(0.639), py(0.295)],
        [px(0.623), py(0.335)], [px(0.6), py(0.352)], [px(0.585), py(0.312)], [px(0.591), py(0.262)],
      ], BEARD, seed + 102, { passes: 4, jitter: unit * 0.002 })
      /* grey hair sweeping back with the speed of arrival */
      soften(context, [
        [px(0.606), py(0.196)], [px(0.614), py(0.166)], [px(0.64), py(0.152)], [px(0.669), py(0.158)],
        [px(0.689), py(0.178)], [px(0.703), py(0.198)], [px(0.678), py(0.204)], [px(0.648), py(0.198)], [px(0.622), py(0.203)],
      ], BEARD, seed + 101, { passes: 4, jitter: unit * 0.002, dust: false })
      context.save()
      context.lineCap = 'round'
      for (var whisker = 0; whisker < 12; whisker += 1) {
        context.strokeStyle = whisker % 3 ? 'rgba(226, 226, 230, 0.85)' : 'rgba(148, 152, 160, 0.85)'
        context.lineWidth = 0.9 + random()
        context.beginPath()
        var whiskerY = py(0.25 + random() * 0.07)
        context.moveTo(px(0.617), whiskerY)
        context.quadraticCurveTo(px(0.602), whiskerY + unit * 0.009, px(0.586 + random() * 0.012), whiskerY + unit * (0.013 + random() * 0.009))
        context.stroke()
      }
      /* and a few hair strands trailing behind */
      for (var strand = 0; strand < 6; strand += 1) {
        context.strokeStyle = strand % 2 ? 'rgba(226, 226, 230, 0.8)' : 'rgba(148, 152, 160, 0.8)'
        context.lineWidth = 0.9 + random()
        context.beginPath()
        var strandY = py(0.168 + random() * 0.03)
        context.moveTo(px(0.664), strandY)
        context.quadraticCurveTo(px(0.69), strandY + unit * 0.004, px(0.706 + random() * 0.014), strandY + unit * (0.007 + random() * 0.006))
        context.stroke()
      }
      context.restore()
      /* the stern face, turned down toward Adam: brows knotted, eyes as
         dashes looking left, the nose, the moustache joining the beard */
      ink(context, [[px(0.609), py(0.202)], [px(0.62), py(0.199)]], seed + 103, 1.4, INK_DARK)
      ink(context, [[px(0.626), py(0.199)], [px(0.637), py(0.201)]], seed + 104, 1.4, INK_DARK)
      ink(context, [[px(0.6105), py(0.2075)], [px(0.617), py(0.208)]], seed + 105, 1.2, INK_DARK)
      ink(context, [[px(0.627), py(0.208)], [px(0.6335), py(0.2075)]], seed + 106, 1.2, INK_DARK)
      SKETCH.dot(context, px(0.6115), py(0.2075), 0.9, INK_DARK, seed + 118)
      SKETCH.dot(context, px(0.628), py(0.208), 0.9, INK_DARK, seed + 119)
      ink(context, [[px(0.6205), py(0.207)], [px(0.6155), py(0.221)], [px(0.6205), py(0.2255)]], seed + 107, 1)
      context.save()
      context.lineCap = 'round'
      context.strokeStyle = 'rgba(226, 226, 230, 0.9)'
      context.lineWidth = 1.4
      context.beginPath()
      context.moveTo(px(0.6185), py(0.2295))
      context.quadraticCurveTo(px(0.609), py(0.231), px(0.6), py(0.2415))
      context.moveTo(px(0.6235), py(0.2305))
      context.quadraticCurveTo(px(0.633), py(0.2335), px(0.6365), py(0.2455))
      context.stroke()
      context.restore()

      /* the cloak found once in ink */
      ink(context, [[px(0.552), py(0.34)], [px(0.56), py(0.18)], [px(0.63), py(0.08)], [px(0.75), py(0.045)], [px(0.87), py(0.075)], [px(0.945), py(0.16)]], seed + 108, 1.1)

      /* cracks in the plaster */
      SKETCH.pencil(context, [
        [px(0.43), panelTop], [px(0.415), py(0.3)], [px(0.435), py(0.52)], [px(0.42), py(0.78)], [px(0.43), py(1)],
      ], { seed: seed + 150, color: 'rgba(96, 92, 78, 0.45)', width: 0.9, amp: 1.8 })
      SKETCH.pencil(context, [
        [px(0.63), panelTop], [px(0.617), py(0.06)],
      ], { seed: seed + 151, color: 'rgba(96, 92, 78, 0.4)', width: 0.9, amp: 1.2 })

      /* warm light from the right */
      var warmth = context.createLinearGradient(frameX + frameWidth, frameY, frameX, frameY + frameHeight)
      warmth.addColorStop(0, 'rgba(240, 224, 190, 0.1)')
      warmth.addColorStop(0.6, 'rgba(240, 224, 190, 0)')
      context.fillStyle = warmth
      context.fillRect(frameX, frameY, frameWidth, frameHeight)

      context.restore()

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

    /* -------------------------------------------------- the idle life */

    var reducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function ensureFrames(api) {
      var key = state.seed + ':' + api.width + 'x' + api.height
      if (state.frameKey === key && state.frames) return
      state.frames = []
      state.frameKey = key
      var ratio = deviceRatio(api.canvas)
      var count = reducedMotion ? 1 : 3
      for (var frame = 0; frame < count; frame += 1) {
        var offscreen = document.createElement('canvas')
        offscreen.width = api.canvas.width
        offscreen.height = api.canvas.height
        var offscreenContext = offscreen.getContext('2d')
        offscreenContext.setTransform(ratio, 0, 0, ratio, 0, 0)
        drawAdamPanel(offscreenContext, api.width, api.height, state.seed, frame)
        state.frames.push(offscreen)
      }
      if (!state.drifters) {
        var random = SKETCH.rng(state.seed + 5)
        /* haze drifts in the open plaster only — the gap between the
           figures, and the sky above the hill */
        state.drifters = {
          clouds: [
            { x: 0.42, y: 0.2, speed: 0.003 + random() * 0.002, scale: 0.8 + random() * 0.4 },
            { x: 0.46, y: 0.62, speed: 0.002 + random() * 0.002, scale: 0.7 + random() * 0.4 },
            { x: 0.16, y: 0.1, speed: 0.003 + random() * 0.002, scale: 0.6 + random() * 0.3 },
          ],
        }
      }
    }

    function blitFrame(api, index) {
      var context = api.canvas.getContext('2d')
      var layout = state.layout
      var ratio = deviceRatio(api.canvas)
      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      var sx = Math.max(0, (layout.frameX - 8) * ratio)
      var sy = Math.max(0, (layout.frameY - 8) * ratio)
      var sw = (layout.frameWidth + 16) * ratio
      var sh = (layout.frameHeight + 16) * ratio
      context.drawImage(state.frames[index], sx, sy, sw, sh, sx, sy, sw, sh)
      context.restore()
    }

    function drawLife(api, now) {
      var context = api.canvas.getContext('2d')
      var layout = state.layout
      var ratio = deviceRatio(api.canvas)
      context.save()
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      /* only the open plaster: the gap between the figures, and the sky
         over the hill — never in front of anyone */
      context.beginPath()
      context.rect(layout.frameX + layout.frameWidth * 0.345, layout.frameY + layout.frameHeight * 0.12, layout.frameWidth * 0.2, layout.frameHeight * 0.76)
      context.rect(layout.frameX + layout.frameWidth * 0.02, layout.frameY + layout.frameHeight * 0.115, layout.frameWidth * 0.32, layout.frameHeight * 0.1)
      context.clip()

      /* haze drifting through the gap */
      state.drifters.clouds.forEach(function (cloud, index) {
        var cloudX = layout.frameX + (cloud.x + Math.sin(now * 0.0002 + index) * 0.02) * layout.frameWidth
        var cloudY = layout.frameY + (cloud.y + Math.sin(now * 0.00013 + index * 2) * 0.015) * layout.frameHeight
        for (var puff = 0; puff < 3; puff += 1) {
          context.globalAlpha = 0.05 - puff * 0.012
          context.fillStyle = '#f4f0e0'
          context.beginPath()
          context.ellipse(cloudX + puff * 26 * cloud.scale, cloudY + (puff % 2) * 6, 46 * cloud.scale, 13 * cloud.scale, 0, 0, Math.PI * 2)
          context.fill()
        }
      })

      /* the gap between the hands, breathing */
      var pulse = 0.08 + 0.05 * Math.sin(now * 0.0012)
      var glowX = layout.frameX + layout.frameWidth * 0.386
      var glowY = layout.frameY + layout.frameHeight * 0.1 + (layout.frameHeight * 0.8) * 0.39
      var glow = context.createRadialGradient(glowX, glowY, 4, glowX, glowY, layout.frameWidth * 0.07)
      glow.addColorStop(0, 'rgba(246, 240, 216, ' + pulse + ')')
      glow.addColorStop(1, 'rgba(246, 240, 216, 0)')
      context.globalAlpha = 1
      context.fillStyle = glow
      context.fillRect(glowX - layout.frameWidth * 0.08, glowY - layout.frameWidth * 0.08, layout.frameWidth * 0.16, layout.frameWidth * 0.16)

      context.restore()
    }

    function startLife(api) {
      if (reducedMotion || state.raf) return
      var tick = function (now) {
        state.raf = 0
        if (state.hidden || !state.frames) return
        if (now - state.lastBoil > 640) {
          state.frameIndex = (state.frameIndex + 1) % state.frames.length
          state.lastBoil = now
        }
        blitFrame(api, state.frameIndex)
        drawLife(api, now)
        state.raf = requestAnimationFrame(tick)
      }
      state.raf = requestAnimationFrame(tick)
    }

    return {
      state: state,
      aria: 'An artwork: a soft repainting of Michelangelo’s Creation of Adam — Adam bright on the low green bank, God and his company swept along in the wine-dark cloak, haze drifting while the two hands never quite touch. Repainted on every click.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height, api) {
        ensureFrames(api)
        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.drawImage(state.frames[0], 0, 0)
        context.restore()
        write(context, data.title, 26, 30, { size: 12, media: 'pencil', seed: 1601, tracking: 0.4, width: 2 })
        SKETCH.rule(context, 24, 40, 26 + measure(data.title, 12, 0.4) + 8, { seed: 1602, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.note, 26 + measure(data.title, 12, 0.4) + 20, 30, { size: 8, color: SKETCH.GREEN_PEN, seed: 1603 })
        write(context, data.date, width - 26, 30, { size: 8.5, media: 'pencil', seed: 1604, align: 'right' })
        write(context, 'CLICK TO REPAINT', width - 26, 46, { size: 7, color: SKETCH.GREEN_PEN, seed: 1605, align: 'right' })
        SKETCH.artifacts(context, width, height, 1606 + state.seed)
        startLife(api)
      },
      onPointer: function (type, x, y, api) {
        if (type === 'move') { api.canvas.style.cursor = 'pointer'; return }
        if (type !== 'down') return
        state.seed = Math.floor(Math.random() * 999983)
        state.frames = null
        state.frameKey = ''
        state.drifters = null
        api.redraw()
      },
    }
  }
})()
