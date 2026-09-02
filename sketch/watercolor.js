/* watercolor.js — wet paper. A compact interpretation of the layered model
   in Curtis et al., "Computer-Generated Watercolor" (SIGGRAPH 1997): an
   uneven paper field, water transport, suspended pigment, deposition, and
   drying edges. The paint box under the paper is part of the drawing. */
'use strict'

;(function () {
  var WATER = window.SKETCH.watercolor = {}

  var SIM_W = 320
  var SIM_H = 200

  var PIGMENTS = [
    { name: 'ULTRAMARINE', color: '#315985' },
    { name: 'ALIZARIN', color: '#9a3f48' },
    { name: 'OCHRE', color: '#bd8437' },
    { name: 'VIRIDIAN', color: '#356a5a' },
    { name: 'PAYNES GREY', color: '#394451' },
    { name: 'SIENNA', color: '#9b5e3f' },
  ]

  var BRUSHES = ['ROUND', 'WASH', 'DRY', 'SPLATTER']
  var SIZES = [14, 26, 44]

  function clamp01(value) { return Math.max(0, Math.min(1, value)) }

  function seeded(index, salt) {
    var value = Math.sin(index * 9283.17 + salt * 77.13) * 43758.5453
    return value - Math.floor(value)
  }

  function channels(count) {
    return [new Float32Array(count), new Float32Array(count), new Float32Array(count)]
  }

  function createSim() {
    var count = SIM_W * SIM_H
    var canvas = document.createElement('canvas')
    canvas.width = SIM_W
    canvas.height = SIM_H
    var context = canvas.getContext('2d')
    var paper = new Float32Array(count)
    for (var y = 0; y < SIM_H; y += 1) {
      for (var x = 0; x < SIM_W; x += 1) {
        var index = y * SIM_W + x
        var broad = Math.sin(x * 0.037) * Math.cos(y * 0.031) * 0.16
        var fibre = Math.sin(x * 0.71 + y * 0.08) * 0.08
        paper[index] = clamp01(0.48 + broad + fibre + (seeded(index, 12) - 0.5) * 0.34)
      }
    }
    return {
      canvas: canvas,
      context: context,
      paper: paper,
      wet: new Float32Array(count),
      wetNext: new Float32Array(count),
      suspended: channels(count),
      suspendedNext: channels(count),
      deposited: channels(count),
      image: context.createImageData(SIM_W, SIM_H),
      stamp: 0,
    }
  }

  function absorptionFromHex(hex) {
    var parsed = parseInt(hex.slice(1), 16)
    return [
      (1 - ((parsed >> 16) & 255) / 255) * 1.18,
      (1 - ((parsed >> 8) & 255) / 255) * 1.18,
      (1 - (parsed & 255) / 255) * 1.18,
    ]
  }

  function stampRound(sim, u, v, color, radius, water, pigment, dry) {
    var centerX = Math.round(clamp01(u) * (SIM_W - 1))
    var centerY = Math.round(clamp01(v) * (SIM_H - 1))
    var absorption = absorptionFromHex(color)
    var bounded = Math.max(2, Math.round(radius))
    for (var offsetY = -bounded; offsetY <= bounded; offsetY += 1) {
      var y = centerY + offsetY
      if (y < 1 || y >= SIM_H - 1) continue
      for (var offsetX = -bounded; offsetX <= bounded; offsetX += 1) {
        var x = centerX + offsetX
        if (x < 1 || x >= SIM_W - 1) continue
        var distance = Math.hypot(offsetX, offsetY) / bounded
        if (distance >= 1) continue
        var index = y * SIM_W + x
        var feather = Math.pow(1 - distance, dry ? 0.7 : 1.72)
        var grain = 0.68 + sim.paper[index] * 0.56
        if (dry && seeded(index + sim.stamp * 101, 6) < 0.38 + sim.paper[index] * 0.18) continue
        sim.wet[index] = clamp01(sim.wet[index] + feather * water)
        for (var channel = 0; channel < 3; channel += 1) {
          var amount = absorption[channel] * feather * grain * pigment
          if (dry) sim.deposited[channel][index] += amount
          else sim.suspended[channel][index] += amount
        }
      }
    }
    sim.stamp += 1
  }

  function paint(sim, u, v, settings) {
    var baseRadius = settings.size * (SIM_W / 512)
    if (settings.brush === 'SPLATTER') {
      for (var drop = 0; drop < 14; drop += 1) {
        var angle = seeded(sim.stamp + drop, 19) * Math.PI * 2
        var spread = seeded(sim.stamp + drop, 23) * baseRadius * 2.3
        stampRound(
          sim,
          u + (Math.cos(angle) * spread) / SIM_W,
          v + (Math.sin(angle) * spread) / SIM_H,
          settings.color,
          baseRadius * (0.1 + seeded(sim.stamp + drop, 29) * 0.24),
          0.62,
          0.27,
          false,
        )
      }
      return
    }
    var isWash = settings.brush === 'WASH'
    var isDry = settings.brush === 'DRY'
    stampRound(
      sim,
      u,
      v,
      settings.color,
      baseRadius * (isWash ? 1.65 : isDry ? 0.78 : 1),
      isWash ? 1.22 : isDry ? 0.09 : 0.72,
      isWash ? 0.12 : isDry ? 0.18 : 0.24,
      isDry,
    )
  }

  function step(sim, time) {
    var paper = sim.paper
    var deposited = sim.deposited
    var wet = sim.wet
    var wetNext = sim.wetNext
    for (var y = 1; y < SIM_H - 1; y += 1) {
      for (var x = 1; x < SIM_W - 1; x += 1) {
        var index = y * SIM_W + x
        var left = index - 1
        var right = index + 1
        var up = index - SIM_W
        var down = index + SIM_W
        var averageWet = (wet[left] + wet[right] + wet[up] + wet[down]) * 0.25
        var slopeX = paper[right] - paper[left]
        var slopeY = paper[down] - paper[up]
        var curlX = Math.sin(y * 0.137 + time * 0.38) * 0.36
        var curlY = Math.cos(x * 0.113 - time * 0.31) * 0.28
        var sourceX = Math.max(1, Math.min(SIM_W - 2, Math.round(x + (slopeX * 5 + curlX) * wet[index])))
        var sourceY = Math.max(1, Math.min(SIM_H - 2, Math.round(y + (slopeY * 5 + curlY) * wet[index])))
        var source = sourceY * SIM_W + sourceX
        var nextWet = clamp01(
          wet[index]
            + (averageWet - wet[index]) * 0.19
            + (wet[source] - wet[index]) * 0.08
            - (0.0012 + paper[index] * 0.0009),
        )
        wetNext[index] = nextWet

        var wetGradient = Math.abs(wet[left] - wet[right]) + Math.abs(wet[up] - wet[down])
        var edgeDeposit = Math.min(0.05, wetGradient * 0.42)
        for (var channel = 0; channel < 3; channel += 1) {
          var pigment = sim.suspended[channel]
          var pigmentNext = sim.suspendedNext[channel]
          var averagePigment = (pigment[left] + pigment[right] + pigment[up] + pigment[down]) * 0.25
          var depositRate = (1 - nextWet) * 0.018 + edgeDeposit + paper[index] * 0.0023
          var deposit = pigment[index] * depositRate
          pigmentNext[index] = Math.max(
            0,
            pigment[index]
              + (averagePigment - pigment[index]) * (0.045 + nextWet * 0.11)
              + (pigment[source] - pigment[index]) * nextWet * 0.075
              - deposit,
          )
          deposited[channel][index] += deposit
        }
      }
    }
    sim.wet = wetNext
    sim.wetNext = wet
    for (var swap = 0; swap < 3; swap += 1) {
      var current = sim.suspended[swap]
      sim.suspended[swap] = sim.suspendedNext[swap]
      sim.suspendedNext[swap] = current
    }
  }

  function render(sim) {
    var pixels = sim.image.data
    var count = SIM_W * SIM_H
    for (var index = 0; index < count; index += 1) {
      var fibre = sim.paper[index]
      var baseR = 243 - fibre * 16
      var baseG = 237 - fibre * 17
      var baseB = 222 - fibre * 15
      var redAbsorb = sim.deposited[0][index] + sim.suspended[0][index] * 0.58
      var greenAbsorb = sim.deposited[1][index] + sim.suspended[1][index] * 0.58
      var blueAbsorb = sim.deposited[2][index] + sim.suspended[2][index] * 0.58
      var wetDarken = 1 - sim.wet[index] * 0.075
      var pixel = index * 4
      pixels[pixel] = Math.min(255, baseR * Math.exp(-redAbsorb * 1.62) * wetDarken)
      pixels[pixel + 1] = Math.min(255, baseG * Math.exp(-greenAbsorb * 1.62) * wetDarken)
      pixels[pixel + 2] = Math.min(255, baseB * Math.exp(-blueAbsorb * 1.62) * wetDarken)
      pixels[pixel + 3] = 255
    }
    sim.context.putImageData(sim.image, 0, 0)
  }

  function clear(sim, seedSamples) {
    sim.wet.fill(0)
    sim.wetNext.fill(0)
    for (var channel = 0; channel < 3; channel += 1) {
      sim.suspended[channel].fill(0)
      sim.suspendedNext[channel].fill(0)
      sim.deposited[channel].fill(0)
    }
    if (seedSamples) {
      var samples = [
        [0.28, 0.4, '#315985'], [0.46, 0.58, '#9a3f48'],
        [0.63, 0.38, '#bd8437'], [0.72, 0.62, '#356a5a'],
      ]
      samples.forEach(function (sample) {
        stampRound(sim, sample[0], sample[1], sample[2], SIM_W * 0.1, 1.05, 0.42, false)
      })
      for (var index = 0; index < 16; index += 1) step(sim, index * 0.08)
    }
    render(sim)
  }

  /* ------------------------------------------------------------- the page */

  var PAD = 24
  var TITLE_H = 54

  /* Flow the paint box items left to right, wrapping. Returns the items
     with positions and the height of the strip. */
  function flowControls(width, settings) {
    var items = []
    var x = PAD
    var y = 0
    var rowH = 40
    var limit = width - PAD

    function place(itemWidth, item) {
      if (x + itemWidth > limit && x > PAD) {
        x = PAD
        y += rowH
      }
      item.x = x
      item.y = y
      item.w = itemWidth
      items.push(item)
      x += itemWidth
    }

    PIGMENTS.forEach(function (pigment) {
      place(32, { kind: 'pigment', value: pigment.color, name: pigment.name })
    })
    x += 14
    SIZES.forEach(function (size) {
      place(26, { kind: 'size', value: size })
    })
    x += 14
    BRUSHES.forEach(function (brush) {
      place(SKETCH.letter.measure(brush, 9.5) + 18, { kind: 'brush', value: brush })
    })
    x += 10
    ;['CLEAR', 'SAVE PNG'].forEach(function (label) {
      place(SKETCH.letter.measure(label, 9.5) + 20, { kind: label === 'CLEAR' ? 'clear' : 'save', value: label })
    })
    void settings
    return { items: items, height: y + rowH + 18 }
  }

  function layout(width, height) {
    var controls = flowControls(width, null)
    var paperWidth = width - PAD * 2
    var paperHeight = paperWidth * (SIM_H / SIM_W)
    /* keep paper, paint box, and citation inside the page */
    var maxPaperHeight = height - TITLE_H - controls.height - 84
    if (paperHeight > maxPaperHeight) {
      paperHeight = Math.max(140, maxPaperHeight)
      paperWidth = paperHeight * (SIM_W / SIM_H)
    }
    return {
      paper: { x: (width - paperWidth) / 2, y: TITLE_H, width: paperWidth, height: paperHeight },
      controlsY: TITLE_H + paperHeight + 18,
      controlsH: controls.height,
    }
  }

  WATER.spec = function () {
    var sim = createSim()
    clear(sim, true)

    var state = {
      sim: sim,
      settings: { color: PIGMENTS[0].color, brush: 'ROUND', size: SIZES[1] },
      zones: [],
      paper: null,
      activeUntil: 0,
      raf: 0,
      lastStep: 0,
    }

    function blit(api) {
      if (!state.paper || state.hidden) return
      var context = api.canvas.getContext('2d')
      context.save()
      context.imageSmoothingEnabled = true
      context.drawImage(sim.canvas, state.paper.x, state.paper.y, state.paper.width, state.paper.height)
      context.restore()
    }

    function wake(api) {
      state.activeUntil = performance.now() + 8000
      if (state.raf) return
      var animate = function (now) {
        state.raf = 0
        if (state.hidden) return
        if (now < state.activeUntil) {
          if (now - state.lastStep > 76) {
            step(sim, now * 0.001)
            render(sim)
            blit(api)
            state.lastStep = now
          }
          state.raf = requestAnimationFrame(animate)
        }
      }
      state.raf = requestAnimationFrame(animate)
    }

    function drawControls(context, width, height) {
      var frame = layout(width, height)
      var top = frame.controlsY
      var flow = flowControls(width, state.settings)
      state.zones = []

      /* wipe and redraw only the control strip */
      context.save()
      context.beginPath()
      context.rect(0, top - 8, width, frame.controlsH + 12)
      context.clip()
      SKETCH.graphPaper(context, width, height, { seed: 601 })
      context.restore()

      var write = SKETCH.letter.write
      var currentName = ''

      flow.items.forEach(function (item, index) {
        var x = item.x
        var y = top + item.y
        if (item.kind === 'pigment') {
          SKETCH.wash(context, x, y + 6, 24, 24, item.value, { seed: 300 + index, alpha: 0.82, layers: 3 })
          if (state.settings.color === item.value) {
            currentName = item.name
            var ring = []
            for (var r = 0; r <= 12; r += 1) {
              var angle = (r / 12) * Math.PI * 2
              ring.push([x + 12 + Math.cos(angle) * 18, y + 18 + Math.sin(angle) * 18])
            }
            SKETCH.stroke(context, ring, { seed: 91 + index, color: SKETCH.INK_SOFT, width: 1.3, amp: 1.4, step: 7 })
          }
          state.zones.push({ x: x - 3, y: y + 2, width: 30, height: 32, kind: 'pigment', value: item.value })
        } else if (item.kind === 'size') {
          var active = state.settings.size === item.value
          SKETCH.dot(context, x + 10, y + 18, 2.4 + (item.value / 44) * 4.6, active ? SKETCH.INK : 'rgba(48,44,39,0.35)', 500 + index)
          state.zones.push({ x: x - 3, y: y + 4, width: 28, height: 30, kind: 'size', value: item.value })
        } else if (item.kind === 'brush') {
          var isBrush = state.settings.brush === item.value
          write(context, item.value, x, y + 22, { size: 9.5, seed: 400 + index, color: isBrush ? SKETCH.INK : SKETCH.INK_SOFT })
          if (isBrush) {
            SKETCH.rule(context, x - 2, y + 29, x + item.w - 14, { seed: 92 + index, color: SKETCH.RED, width: 1.6 })
          }
          state.zones.push({ x: x - 4, y: y + 6, width: item.w, height: 30, kind: 'brush', value: item.value })
        } else {
          write(context, item.value, x, y + 22, { size: 9.5, seed: 600 + index, color: SKETCH.INK_SOFT })
          SKETCH.rule(context, x - 1, y + 29, x + item.w - 16, { seed: 610 + index, color: SKETCH.PENCIL, width: 1.2, amp: 0.7 })
          state.zones.push({ x: x - 4, y: y + 6, width: item.w, height: 30, kind: item.kind })
        }
      })

      /* the current pigment, noted in green pen */
      write(context, currentName, PAD, top + flow.height - 4, { size: 7, color: SKETCH.GREEN_PEN, seed: 24 })
    }

    function drawControlsOn(api) {
      var context = api.canvas.getContext('2d')
      drawControls(context, api.width, api.height)
    }

    return {
      state: state,
      aria: 'An interactive watercolor simulation: drag on the paper to paint. A drawn paint box below offers pigments, brushes, and sizes.',
      height: function (width) {
        var frame = layout(width, width * 1.24)
        return frame.controlsY + frame.controlsH + 30
      },
      draw: function (context, width, height, api) {
        var frame = layout(width, height)
        state.paper = frame.paper
        SKETCH.graphPaper(context, width, height, { seed: 601 })

        SKETCH.letter.write(context, 'WET PAPER, NO. 2', PAD, 26, { size: 12, seed: 61, width: 1.5, tracking: 0.42 })
        SKETCH.rule(context, PAD - 2, 35, PAD + SKETCH.letter.measure('WET PAPER, NO. 2', 12, 0.42) + 8, { seed: 62, color: SKETCH.PENCIL, width: 1.1 })
        if (width >= 460) {
          SKETCH.letter.write(context, 'DRAG ON THE PAPER', width - PAD, 26, { size: 7, color: SKETCH.GREEN_PEN, seed: 63, align: 'right' })
        }

        /* pencil frame around the paper */
        SKETCH.stroke(context, [
          [frame.paper.x - 3, frame.paper.y - 3],
          [frame.paper.x + frame.paper.width + 3, frame.paper.y - 2],
          [frame.paper.x + frame.paper.width + 2, frame.paper.y + frame.paper.height + 3],
          [frame.paper.x - 2, frame.paper.y + frame.paper.height + 2],
          [frame.paper.x - 3, frame.paper.y - 3],
        ], { seed: 64, color: SKETCH.PENCIL, width: 1.2, amp: 1.4, step: 10 })

        drawControls(context, width, height)

        /* citation, drawn, with a real link over it */
        var citation = 'AFTER CURTIS ET AL., SIGGRAPH 1997 ↗'
        var citationWidth = SKETCH.letter.measure(citation, 7.5)
        SKETCH.letter.write(context, citation, width - PAD, height - 48, { size: 7.5, media: 'pencil', seed: 65, align: 'right' })
        api.link(width - PAD - citationWidth, height - 60, citationWidth, 20, 'https://grail.cs.washington.edu/projects/watercolor/', 'Watercolor model reference: Curtis et al., SIGGRAPH 1997')

        SKETCH.artifacts(context, width, height, 67)

        blit(api)
        wake(api)
      },
      onPointer: function (type, x, y, api, event) {
        var paper = state.paper
        if (!paper) return
        var inPaper = x >= paper.x && x <= paper.x + paper.width && y >= paper.y && y <= paper.y + paper.height

        if (type === 'move') {
          var overZone = state.zones.some(function (z) {
            return x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
          })
          api.canvas.style.cursor = overZone ? 'pointer' : inPaper ? 'crosshair' : 'default'
        }

        if ((type === 'down' || (type === 'move' && event.buttons === 1)) && inPaper) {
          paint(sim, (x - paper.x) / paper.width, (y - paper.y) / paper.height, state.settings)
          render(sim)
          blit(api)
          wake(api)
          return
        }

        if (type !== 'down') return
        for (var index = 0; index < state.zones.length; index += 1) {
          var z = state.zones[index]
          if (x < z.x || x > z.x + z.width || y < z.y || y > z.y + z.height) continue
          if (z.kind === 'pigment') state.settings.color = z.value
          if (z.kind === 'brush') state.settings.brush = z.value
          if (z.kind === 'size') state.settings.size = z.value
          if (z.kind === 'clear') { state.activeUntil = 0; clear(sim, false); blit(api) }
          if (z.kind === 'save') {
            var exportCanvas = document.createElement('canvas')
            exportCanvas.width = SIM_W * 3
            exportCanvas.height = SIM_H * 3
            var exportContext = exportCanvas.getContext('2d')
            exportContext.imageSmoothingEnabled = true
            exportContext.drawImage(sim.canvas, 0, 0, exportCanvas.width, exportCanvas.height)
            SKETCH.download(exportCanvas, 'wet-paper.png')
            return
          }
          drawControlsOn(api)
          return
        }
      },
    }
  }
})()
