/* plates.js — the sheets of the workbook: a cover, the faces study, the
   selected work ledger, the experience ledger, and the washes chart. Each
   sheet is drawn onto its own paper stock; the only HTML on top is a layer
   of invisible link targets. */
'use strict'

;(function () {
  var PLATES = window.SKETCH.plates = {}
  var write = function () { return SKETCH.letter.write.apply(null, arguments) }
  var measure = function () { return SKETCH.letter.measure.apply(null, arguments) }

  /* Split text into lines that fit maxWidth at the given size. */
  function wrapLines(text, size, maxWidth, tracking) {
    var words = String(text).split(' ')
    var lines = []
    var line = ''
    words.forEach(function (word) {
      var candidate = line ? line + ' ' + word : word
      if (line && measure(candidate, size, tracking) > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    })
    if (line) lines.push(line)
    return lines
  }

  /* Lettering grows a little with the page. */
  function typeScale(width) {
    return SKETCH.clamp(width / 640, 0.9, 1.55)
  }

  /* Small-caps sheet title with the date beside it, like the references. */
  function sheetTitle(context, title, date, x, y, pageWidth) {
    var s = pageWidth ? SKETCH.clamp(pageWidth / 720, 1, 1.4) : 1
    var size = 12 * s
    write(context, title, x, y, { size: size, seed: 45, width: size * 0.125, tracking: 0.42 })
    SKETCH.rule(context, x - 2, y + size * 0.75, x + measure(title, size, 0.42) + 8, { seed: 46, color: SKETCH.PENCIL, width: 1.1 })
    if (date) {
      write(context, date, x + measure(title, size, 0.42) + 22, y, { size: 8.5 * s, media: 'pencil', seed: 47 })
    }
  }

  /* ---------------------------------------------------------------- cover */

  PLATES.cover = function (data) {
    var state = { planted: [], raf: 0 }
    var KINDS = ['rose', 'poppy', 'tulip', 'daisy', 'lavender']

    function gardenBox(width, height) {
      return { y: Math.round(height * 0.52), bottom: Math.round(height - 96), pivot: height * 0.93 }
    }

    function drawGarden(context, width, height) {
      SKETCH.garden.bed(context, width * 0.7, height * 0.9, Math.min(height * 0.32, width * 0.22), 7411)
      state.planted.slice().sort(function (a, b) { return a.fy - b.fy }).forEach(function (plant) {
        SKETCH.garden[plant.kind](context, plant.fx * width, plant.fy * height, plant.size * height, plant.seed)
      })
    }

    function startSway(api) {
      if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (state.raf) return
        var tick = function (now) {
          state.raf = 0
          if (state.hidden || !state.base) return
          var liveApi = state.swayApi
          var bounds = liveApi.canvas.getBoundingClientRect()
          var ratio = bounds.width ? liveApi.canvas.width / bounds.width : 1
          var box = gardenBox(liveApi.width, liveApi.height)
          var context = liveApi.canvas.getContext('2d')
          context.save()
          context.setTransform(1, 0, 0, 1, 0, 0)
          context.drawImage(
            state.base,
            0, box.y * ratio, liveApi.width * ratio, (box.bottom - box.y) * ratio,
            0, box.y * ratio, liveApi.width * ratio, (box.bottom - box.y) * ratio,
          )
          context.setTransform(ratio, 0, 0, ratio, 0, 0)
          context.beginPath()
          context.rect(0, box.y, liveApi.width, box.bottom - box.y)
          context.clip()
          /* the flowers hold stiffer than the trees, but the same wind */
          var lean = (SKETCH.windAt ? SKETCH.windAt(now * 0.001) : 0) * 0.35
          var shear = Math.tan(lean * Math.PI / 180)
          context.translate(0, box.pivot)
          context.transform(1, 0, shear, 1, 0, 0)
          context.translate(0, -box.pivot)
          context.drawImage(state.sprite, 0, box.y, liveApi.width, box.bottom - box.y)
          context.restore()
          state.raf = requestAnimationFrame(tick)
        }
        state.raf = requestAnimationFrame(tick)
      }
    }

    return {
      state: state,
      aria: 'Cover: Caellum Yip Hoi-Lee. ' + data.subtitle,
      height: function (width) { return width * 1.02 },
      draw: function (context, width, height, api) {
        var pad = 28
        SKETCH.graphPaper(context, width, height, { seed: 101 })

        /* drips in from the top edge */
        SKETCH.drip(context, width * 0.2, 58, 'rgba(88, 66, 84, 0.5)', 501)
        SKETCH.drip(context, width * 0.52, 104, 'rgba(88, 66, 84, 0.42)', 502)
        SKETCH.drip(context, width * 0.84, 44, 'rgba(88, 66, 84, 0.55)', 503)

        write(context, data.date, pad, 42, { size: 9, media: 'pencil', seed: 102 })

        /* the name, in wide pencil capitals */
        var s = typeScale(width)
        var y = height * 0.17
        var lines = ['CAELLUM', 'YIP HOI-LEE']
        var titleSize = Math.min(64, ((width - pad * 2) / measure(lines[1], 10, 0.55)) * 10, height * 0.11)
        lines.forEach(function (line, index) {
          write(context, line, width / 2, y, {
            size: titleSize,
            media: 'pencil',
            seed: 104 + index,
            align: 'center',
            tracking: 0.55,
            width: titleSize * 0.16,
            amp: titleSize * 0.014,
          })
          y += titleSize * 1.5
        })
        y += 4

        wrapLines(data.subtitle, 10.5 * s, width - pad * 2, 0.4).forEach(function (line) {
          write(context, line, width / 2, y, { size: 10.5 * s, seed: 110 + y, align: 'center', tracking: 0.4 })
          y += 22 * s
        })

        /* links, stacked like margin notes on the left */
        var linkY = height * 0.6
        data.links.forEach(function (link, index) {
          var linkSize = 10 * s
          var wordWidth = measure(link.label, linkSize)
          write(context, link.label, pad, linkY, { size: linkSize, seed: 130 + index })
          SKETCH.rule(context, pad - 1, linkY + linkSize * 0.8, pad + wordWidth + 4, { seed: 140 + index, color: SKETCH.RED_FAINT, width: 2, amp: 0.8 })
          api.link(pad - 6, linkY - linkSize * 1.4, wordWidth + 16, linkSize * 2.6, link.href, link.title)
          linkY += 30 * s
        })

        /* the author, drawn in the house style */
        SKETCH.faces.portrait(context, width * 0.175, height * 0.53, height * 0.16, 77)

        SKETCH.print(context, data.stationery, width / 2, height - 30, { align: 'center', seed: 150 })
        SKETCH.artifacts(context, width, height, 152)

        /* the page without its garden, remembered; the garden on its own
           sheet, so the wind can lean it */
        var base = document.createElement('canvas')
        base.width = api.canvas.width
        base.height = api.canvas.height
        base.getContext('2d').drawImage(api.canvas, 0, 0)
        state.base = base
        state.swayApi = api

        var bounds = api.canvas.getBoundingClientRect()
        var ratio = bounds.width ? api.canvas.width / bounds.width : 1
        var box = gardenBox(width, height)
        var sprite = document.createElement('canvas')
        sprite.width = Math.round(width * ratio)
        sprite.height = Math.round((box.bottom - box.y) * ratio)
        var spriteContext = sprite.getContext('2d')
        spriteContext.setTransform(ratio, 0, 0, ratio, 0, 0)
        spriteContext.translate(0, -box.y)
        drawGarden(spriteContext, width, height)
        state.sprite = sprite

        context.drawImage(sprite, 0, box.y, width, box.bottom - box.y)
        startSway(api)
      },
      onPointer: function (type, x, y, api) {
        var plantable = y > api.height * 0.62 && y < api.height - 110 && x > 130 && x < api.width - 130
        if (type === 'move') {
          api.canvas.style.cursor = plantable ? 'pointer' : 'default'
          return
        }
        if (type !== 'down' || !plantable) return
        if (state.planted.length >= 20) state.planted.shift()
        state.planted.push({
          fx: x / api.width,
          fy: y / api.height,
          kind: KINDS[Math.floor(Math.random() * KINDS.length)],
          size: 0.04 + Math.random() * 0.028,
          seed: Math.floor(Math.random() * 999983),
        })
        api.redraw()
      },
    }
  }

  /* ------------------------------------------------------------- doodles */

  function ring(centerX, centerY, radius, points) {
    var out = []
    for (var index = 0; index <= (points || 10); index += 1) {
      var angle = (index / (points || 10)) * Math.PI * 2
      out.push([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius])
    }
    return out
  }

  var doodles = {
    scissors: function (context, centerX, centerY, scale, accent) {
      for (var dash = 0; dash < 7; dash += 1) {
        var dashX = centerX - scale * 0.85 + dash * scale * 0.27
        SKETCH.stroke(context, [[dashX, centerY + scale * 0.42], [dashX + scale * 0.13, centerY + scale * 0.42]], { seed: 900 + dash, color: SKETCH.PENCIL, width: 1.4, amp: 0.5 })
      }
      SKETCH.wash(context, centerX + scale * 0.28, centerY - scale * 0.62, scale * 0.62, scale * 0.5, accent, { seed: 910, alpha: 0.4 })
      SKETCH.stroke(context, [
        [centerX + scale * 0.3, centerY - scale * 0.55],
        [centerX + scale * 0.88, centerY - scale * 0.66],
        [centerX + scale * 0.8, centerY - scale * 0.14],
        [centerX + scale * 0.38, centerY - scale * 0.1],
        [centerX + scale * 0.3, centerY - scale * 0.55],
      ], { seed: 911, width: 1.5, amp: 1.2 })
      SKETCH.stroke(context, [[centerX - scale * 0.62, centerY - scale * 0.42], [centerX + scale * 0.5, centerY + scale * 0.34]], { seed: 912, width: 2, amp: 0.8 })
      SKETCH.stroke(context, [[centerX - scale * 0.62, centerY + 2 + scale * 0.3], [centerX + scale * 0.5, centerY - scale * 0.42]], { seed: 913, width: 2, amp: 0.8 })
      SKETCH.stroke(context, ring(centerX - scale * 0.74, centerY - scale * 0.5, scale * 0.14), { seed: 914, width: 1.7, amp: 0.7 })
      SKETCH.stroke(context, ring(centerX - scale * 0.74, centerY + scale * 0.4, scale * 0.14), { seed: 915, width: 1.7, amp: 0.7 })
      SKETCH.dot(context, centerX - scale * 0.05, centerY - scale * 0.04, 2.2, SKETCH.INK, 916)
    },

    ensemble: function (context, centerX, centerY, scale, accent) {
      for (var line = 0; line < 5; line += 1) {
        SKETCH.rule(context, centerX - scale * 0.9, centerY - scale * 0.3 + line * scale * 0.15, centerX + scale * 0.55, { seed: 920 + line, color: SKETCH.INK_SOFT, width: 1.1, amp: 0.7 })
      }
      var notes = [[-0.6, 0.12], [-0.28, -0.05], [0.02, 0.2], [0.3, 0.05]]
      notes.forEach(function (note, index) {
        var noteX = centerX + note[0] * scale
        var noteY = centerY + note[1] * scale
        SKETCH.wash(context, noteX - 4, noteY - 3, 9, 7, accent, { seed: 930 + index, alpha: 0.85, layers: 2, grain: false })
        SKETCH.stroke(context, [[noteX + 4, noteY], [noteX + 4, noteY - scale * 0.32]], { seed: 935 + index, width: 1.5, amp: 0.5 })
      })
      SKETCH.stroke(context, [[centerX + scale * 0.5, centerY + scale * 0.55], [centerX + scale * 0.95, centerY - scale * 0.5]], { seed: 940, width: 2.2, amp: 0.7 })
      for (var spark = 0; spark < 4; spark += 1) {
        var angle = spark * 1.7
        SKETCH.stroke(context, [
          [centerX + scale * 0.95 + Math.cos(angle) * 4, centerY - scale * 0.5 + Math.sin(angle) * 4],
          [centerX + scale * 0.95 + Math.cos(angle) * 10, centerY - scale * 0.5 + Math.sin(angle) * 10],
        ], { seed: 945 + spark, width: 1.3, amp: 0.4, color: SKETCH.INK_SOFT })
      }
    },

    octopus: function (context, centerX, centerY, scale, accent) {
      var headY = centerY - scale * 0.25
      SKETCH.wash(context, centerX - scale * 0.42, headY - scale * 0.42, scale * 0.84, scale * 0.74, accent, { seed: 950, alpha: 0.42 })
      SKETCH.stroke(context, ring(centerX, headY, scale * 0.4, 12).map(function (point) {
        return [point[0], headY + (point[1] - headY) * 0.88]
      }), { seed: 951, width: 1.7, amp: 1.4 })
      SKETCH.dot(context, centerX - scale * 0.15, headY, 2.6, SKETCH.INK, 952)
      SKETCH.dot(context, centerX + scale * 0.15, headY, 2.6, SKETCH.INK, 953)
      SKETCH.stroke(context, [[centerX - scale * 0.08, headY + scale * 0.16], [centerX + scale * 0.1, headY + scale * 0.17]], { seed: 954, width: 1.3, amp: 0.6 })
      for (var leg = 0; leg < 8; leg += 1) {
        var legX = centerX - scale * 0.42 + (leg / 7) * scale * 0.84
        var sway = (leg % 2 ? 1 : -1) * scale * (0.1 + (leg % 3) * 0.05)
        SKETCH.stroke(context, [
          [legX, headY + scale * 0.3],
          [legX + sway * 0.4, centerY + scale * 0.28],
          [legX + sway, centerY + scale * (0.52 + (leg % 3) * 0.06)],
        ], { seed: 960 + leg, width: 1.6, amp: 1.6 })
      }
    },

    rocket: function (context, centerX, centerY, scale, accent) {
      SKETCH.dot(context, centerX - scale * 0.8, centerY - scale * 0.5, 1.6, SKETCH.INK_SOFT, 970)
      SKETCH.dot(context, centerX + scale * 0.75, centerY - scale * 0.62, 1.6, SKETCH.INK_SOFT, 971)
      SKETCH.dot(context, centerX + scale * 0.62, centerY + 0.2 * scale, 1.4, SKETCH.INK_SOFT, 972)
      SKETCH.stroke(context, [
        [centerX - scale * 0.68, centerY + scale * 0.4], [centerX - scale * 0.78, centerY + scale * 0.52],
        [centerX - scale * 0.66, centerY + scale * 0.62],
      ], { seed: 973, width: 1.4, amp: 0.8, color: SKETCH.INK_SOFT })
      context.save()
      context.translate(centerX, centerY)
      context.rotate(-0.5)
      SKETCH.wash(context, -scale * 0.18, -scale * 0.5, scale * 0.36, scale * 0.8, accent, { seed: 975, alpha: 0.4 })
      SKETCH.stroke(context, [
        [0, -scale * 0.72], [scale * 0.18, -scale * 0.3], [scale * 0.18, scale * 0.3],
        [-scale * 0.18, scale * 0.3], [-scale * 0.18, -scale * 0.3], [0, -scale * 0.72],
      ], { seed: 976, width: 1.7, amp: 1 })
      SKETCH.stroke(context, ring(0, -scale * 0.12, scale * 0.09, 8), { seed: 977, width: 1.4, amp: 0.5 })
      SKETCH.stroke(context, [[-scale * 0.18, scale * 0.1], [-scale * 0.38, scale * 0.42], [-scale * 0.18, scale * 0.3]], { seed: 978, width: 1.5, amp: 0.8 })
      SKETCH.stroke(context, [[scale * 0.18, scale * 0.1], [scale * 0.38, scale * 0.42], [scale * 0.18, scale * 0.3]], { seed: 979, width: 1.5, amp: 0.8 })
      SKETCH.wash(context, -scale * 0.1, scale * 0.32, scale * 0.2, scale * 0.34, '#c9773d', { seed: 980, alpha: 0.65, grain: false })
      SKETCH.stroke(context, [[-scale * 0.07, scale * 0.34], [0, scale * 0.72], [scale * 0.07, scale * 0.34]], { seed: 981, width: 1.2, amp: 1, color: 'rgba(160, 88, 40, 0.7)' })
      context.restore()
    },
  }

  /* -------------------------------------------------- selected work sheet */

  PLATES.work = function (data) {
    var HEAD = 84

    return {
      aria: 'Selected work ledger: ' + data.projects.map(function (project) {
        return project.title + ', ' + project.metric
      }).join('; '),
      height: function (width) { return width * 1.24 },
      draw: function (context, width, height, api) {
        var ENTRY = Math.max(108, (height - HEAD - 44) / data.projects.length)
        SKETCH.ledgerPaper(context, width, height, { seed: 201, ruleGap: 29.5, headY: 36, columns: [0.165, 0.17] })
        sheetTitle(context, 'SELECTED WORK', data.date, 26, 26, width)

        var compact = width < 430
        var s = Math.min(typeScale(width), SKETCH.clamp(height / 560, 0.85, 1.55))
        data.projects.forEach(function (project, index) {
          var top = HEAD + index * ENTRY
          var textX = width * 0.21
          var random = SKETCH.rng(project.seed)

          doodles[project.doodle](context, width * 0.09, top + ENTRY * 0.42, Math.min(56, width * 0.058), project.accent)

          var titleSize = (compact ? 12 : 14) * s
          var titleWidth = measure(project.title + ' ↗', titleSize, 0.36)
          write(context, project.title + ' ↗', textX, top + 24, { size: titleSize, seed: project.seed + 1, width: titleSize * 0.115, tracking: 0.36 })
          SKETCH.rule(context, textX - 1, top + 24 + titleSize * 0.75, textX + titleWidth + 5, { seed: project.seed + 2, color: SKETCH.RED_FAINT, width: 2 })
          api.link(0, top, width, ENTRY, project.href, project.title + ' — ' + project.linkNote)

          if (compact) {
            /* a tight three-line entry on small screens */
            write(context, project.shortDate, textX, top + 50, { size: 8.5, media: 'pencil', seed: project.seed + 4 })
            write(context, project.metric, textX, top + 72, { size: 8.5, color: SKETCH.RED, seed: project.seed + 3 })
          } else {
            write(context, project.metric, width - 28, top + 24, { size: 9.5 * s, color: SKETCH.RED, seed: project.seed + 3, align: 'right' })
            write(context, project.date, textX, top + 34 + 22 * s, { size: 9 * s, media: 'pencil', seed: project.seed + 4 })
            var y = top + 40 + 46 * s
            var floor = top + ENTRY - 16
            var maxWidth = width - textX - 36
            wrapLines(project.line, 9.5 * s, maxWidth).forEach(function (line) {
              if (y > floor - 4) return
              write(context, line, textX, y, { size: 9.5 * s, seed: project.seed + 5 + y })
              y += 19 * s
            })
            y += 4 * s
            /* detail bullets, as many as the entry has room for */
            ;(project.bullets || []).forEach(function (bullet) {
              var pieces = wrapLines(bullet, 8.5 * s, maxWidth - 18 * s)
              if (y + pieces.length * 16.5 * s > floor - 18 * s) return
              write(context, '—', textX, y, { size: 8.5 * s, color: SKETCH.PENCIL, seed: project.seed + 6 })
              pieces.forEach(function (piece) {
                write(context, piece, textX + 18 * s, y, { size: 8.5 * s, color: SKETCH.INK_SOFT, seed: project.seed + 7 + y })
                y += 16.5 * s
              })
              y += 3 * s
            })
            if (project.tech && y <= floor) {
              write(context, project.tech, textX, floor, { size: 7.5 * s, media: 'pencil', seed: project.seed + 8 })
            }
          }

          if (random() > 0.45) {
            SKETCH.splatter(context, textX + (0.3 + random() * 0.5) * (width - textX), top + 40 + random() * 60, 18, 'rgba(74, 48, 54, 0.7)', project.seed + 8, 5)
          }
        })

        SKETCH.artifacts(context, width, height, 212)
      },
    }
  }

  /* ----------------------------------------------------- experience sheet */

  PLATES.experience = function (data) {
    return {
      aria: 'Experience ledger: ' + data.rows.map(function (row) { return row.org + ', ' + row.role + ', ' + row.period }).join('; '),
      height: function (width) { return width * 1.24 },
      draw: function (context, width, height) {
        SKETCH.ledgerPaper(context, width, height, { seed: 301, ruleGap: 26, headY: 36, columns: [0.165, 0.17, 0.95] })
        sheetTitle(context, 'EXPERIENCE', data.date, 26, 26, width)

        var compact = width < 430
        var s = Math.min(typeScale(width), SKETCH.clamp(height / 560, 0.85, 1.55))
        var factSize = (compact ? 7.5 : 8.5) * s
        var rowH = Math.max(104, (height - 140) / data.rows.length)
        data.rows.forEach(function (row, index) {
          var y = 78 + index * rowH
          var textX = width * 0.21
          var floor = y + rowH - 8
          SKETCH.thumbprint(context, width * 0.1, y + 38, Math.min(34, width * 0.034), Math.min(42, width * 0.044), null, 1220 + index * 13)
          var orgSize = (compact ? 11 : 13) * s
          write(context, row.org, textX, y + 12, { size: orgSize, seed: 1100 + index, width: orgSize * 0.115, tracking: 0.36 })
          if (!compact) write(context, row.period, width - 28, y + 12, { size: 8.5 * s, media: 'pencil', seed: 1110 + index, align: 'right' })
          write(context, row.role, textX, y + 12 + 23 * s, { size: (compact ? 8.5 : 9.5) * s, color: SKETCH.RED, seed: 1105 + index, tracking: 0.36 })
          var lineY = y + 16 + 44 * s
          var maxWidth = width - textX - 34
          ;(row.bullets || []).forEach(function (bullet, bulletIndex) {
            if (compact && bulletIndex > 0) return
            if (lineY + factSize * 1.7 > floor) return
            var pieces = wrapLines(bullet, factSize, maxWidth - 16 * s)
            write(context, '—', textX, lineY, { size: factSize, color: SKETCH.PENCIL, seed: 1130 + index })
            pieces.forEach(function (piece) {
              if (lineY + factSize * 0.7 > floor) return
              write(context, piece, textX + 16 * s, lineY, { size: factSize, color: SKETCH.INK_SOFT, seed: 1140 + index * 7 + lineY })
              lineY += factSize * 1.7
            })
            lineY += 3 * s
          })
        })

        SKETCH.scribble(context, 22, height - 78, 54, 26, 310)
        SKETCH.artifacts(context, width, height, 313)
      },
    }
  }

  /* --------------------------------------------------------- washes sheet */

  var SKILL_COLORS = ['#b5495b', '#7b8b4e', '#d9a441', '#6d4a5e', '#4e7b8b', '#b4713f']

  function squareWash(context, x, y, width, height, color, seed) {
    var random = SKETCH.rng(seed)
    context.save()
    for (var layer = 0; layer < 3; layer += 1) {
      context.globalAlpha = 0.17 + random() * 0.15
      context.fillStyle = color
      var inset = random() * 3
      context.save()
      context.translate(x + width / 2, y + height / 2)
      context.rotate((random() - 0.5) * 0.05)
      context.fillRect(
        -width / 2 + inset + (random() - 0.5) * 2,
        -height / 2 + inset + (random() - 0.5) * 2,
        width - inset * 2,
        height - inset * 2,
      )
      context.restore()
    }
    context.globalAlpha = 0.22
    context.strokeStyle = color
    context.lineWidth = 1.6
    context.strokeRect(x + 1 + random() * 2, y + 1 + random() * 2, width - 3, height - 3)
    /* granulation */
    context.globalAlpha = 0.2
    for (var grain = 0; grain < 14; grain += 1) {
      context.fillRect(x + 2 + random() * (width - 5), y + 2 + random() * (height - 5), 1 + random(), 1 + random())
    }
    context.restore()
  }

  PLATES.washes = function (data) {
    function walk(width, height, context) {
      /* the pad scales with the page */
      var s = SKETCH.clamp(width / 640, 0.76, 1.6)
      if (height && height < width) s = Math.min(s, SKETCH.clamp(height / 620, 0.76, 1.6))
      var CELL_W = 58 * s
      var CELL_H = 70 * s
      var SQ_W = 42 * s
      var SQ_H = 34 * s
      var left = 44 * Math.min(s, 1.2)
      var y = 68
      var columns = Math.max(3, Math.floor((width - left - 26) / CELL_W))
      var colorIndex = 0

      data.groups.forEach(function (group, groupIndex) {
        if (context) {
          write(context, group.label, left, y, { size: 7 * Math.min(s, 1.3), color: SKETCH.GREEN_PEN, seed: 1200 + groupIndex, tracking: 0.5 })
        }
        y += 10
        var startY = y
        group.items.forEach(function (item, itemIndex) {
          var column = itemIndex % columns
          var row = Math.floor(itemIndex / columns)
          var x = left + column * CELL_W
          var itemY = startY + row * CELL_H
          if (context) {
            var color = SKILL_COLORS[(colorIndex * 5 + groupIndex) % SKILL_COLORS.length]
            squareWash(context, x, itemY, SQ_W, SQ_H, color, 1300 + colorIndex * 17)
            write(context, item, x + SQ_W / 2, itemY + SQ_H + 13 * s, { size: 6.6 * Math.min(s, 1.25), color: SKETCH.INK_SOFT, seed: 1400 + colorIndex, align: 'center', tracking: 0.22 })
          }
          colorIndex += 1
        })
        var rows = Math.ceil(group.items.length / columns)
        y = startY + rows * CELL_H + 8
      })
      return y
    }

    return {
      aria: 'Skills painted as a chart of watercolor squares: ' + data.groups.map(function (group) {
        return group.label + ' — ' + group.items.join(', ')
      }).join('. '),
      height: function (width) { return walk(width, null, null) + 40 },
      draw: function (context, width, height) {
        SKETCH.graphPaper(context, width, height, { seed: 401, gap: 17.5 })
        sheetTitle(context, data.title, data.date, 26, 26, width)
        walk(width, height, context)

        /* row numbers out in the margin */
        for (var number = 0; number < Math.floor(height / 96); number += 1) {
          write(context, String(number + 1), 16, 84 + number * 96, { size: 8, color: SKETCH.RED_FAINT, seed: 1500 + number })
        }
        /* printed maker's mark, rotated up the side */
        context.save()
        context.translate(width - 10, height - 30)
        context.rotate(-Math.PI / 2)
        SKETCH.print(context, data.margin, 0, 0, { seed: 403, size: 7 })
        context.restore()

        /* the bottom of the pad has seen some use */
        SKETCH.splatter(context, width * 0.32, height * 0.82, 26, 'rgba(74, 48, 54, 0.7)', 407, 8)
        SKETCH.wash(context, width * 0.6, height * 0.87, 30, 20, '#7b8b4e', { seed: 408, alpha: 0.3 })
        SKETCH.scribble(context, width * 0.14, height * 0.9, 30, 14, 409)

        SKETCH.artifacts(context, width, height, 406)
      },
    }
  }

  /* -------------------------------------------------------- resume sheet */

  PLATES.resume = function (data) {
    return {
      aria: 'Résumé: a drawn miniature of the typeset résumé. Click it to open the real PDF.',
      height: function (width) { return width * 1.05 },
      draw: function (context, width, height, api) {
        SKETCH.ledgerPaper(context, width, height, { seed: 1801, ruleGap: 27, headY: 36, columns: [0.06, 0.94] })
        sheetTitle(context, 'RESUME', data.date, 26, 26, width)

        /* a miniature of the typeset page, taped to the sheet */
        var sheetHeight = height * 0.66
        var sheetWidth = sheetHeight * 0.773
        var sheetX = width / 2 - sheetWidth / 2
        var sheetY = height * 0.12
        var random = SKETCH.rng(1808)

        context.save()
        context.translate(width / 2, sheetY + sheetHeight / 2)
        context.rotate(-0.012)
        context.translate(-width / 2, -(sheetY + sheetHeight / 2))
        /* shadow, then the white sheet */
        context.fillStyle = 'rgba(60, 50, 34, 0.22)'
        context.fillRect(sheetX + 5, sheetY + 7, sheetWidth, sheetHeight)
        context.fillStyle = '#fbfaf4'
        context.fillRect(sheetX, sheetY, sheetWidth, sheetHeight)
        SKETCH.pencil(context, [
          [sheetX, sheetY], [sheetX + sheetWidth, sheetY], [sheetX + sheetWidth, sheetY + sheetHeight],
          [sheetX, sheetY + sheetHeight], [sheetX, sheetY],
        ], { seed: 1809, color: 'rgba(90, 84, 70, 0.5)', width: 1, amp: 0.8 })

        /* the resume in miniature: real headings, pencil filler */
        var inner = sheetWidth * 0.08
        var penY = sheetY + sheetHeight * 0.06
        write(context, 'CAELLUM YIP HOI-LEE', sheetX + sheetWidth / 2, penY, { size: Math.max(8, sheetWidth * 0.038), seed: 1810, align: 'center', tracking: 0.38 })
        penY += sheetHeight * 0.045
        SKETCH.rule(context, sheetX + inner * 2, penY, sheetX + sheetWidth - inner * 2, { seed: 1811, color: 'rgba(110, 104, 90, 0.4)', width: 0.8, amp: 0.4 })
        penY += sheetHeight * 0.045

        var sections = [
          { label: 'EDUCATION', lines: 2 },
          { label: 'EXPERIENCE', lines: 6 },
          { label: 'PROJECTS', lines: 6 },
          { label: 'SKILLS', lines: 3 },
        ]
        sections.forEach(function (section, sectionIndex) {
          write(context, section.label, sheetX + inner, penY, { size: Math.max(5.5, sheetWidth * 0.023), seed: 1820 + sectionIndex, tracking: 0.5, color: 'rgba(52, 48, 42, 0.9)' })
          SKETCH.rule(context, sheetX + inner, penY + sheetHeight * 0.014, sheetX + sheetWidth - inner, { seed: 1830 + sectionIndex, color: 'rgba(110, 104, 90, 0.45)', width: 0.7, amp: 0.3 })
          penY += sheetHeight * 0.04
          for (var filler = 0; filler < section.lines; filler += 1) {
            var lineEnd = sheetX + inner + (sheetWidth - inner * 2) * (0.55 + random() * 0.42)
            SKETCH.pencil(context, [
              [sheetX + inner + (filler % 2) * sheetWidth * 0.02, penY],
              [lineEnd, penY],
            ], { seed: 1840 + sectionIndex * 9 + filler, color: 'rgba(120, 114, 100, 0.5)', width: 1, amp: 0.3 })
            penY += sheetHeight * 0.032
          }
          penY += sheetHeight * 0.022
        })

        SKETCH.tape(context, sheetX + sheetWidth * 0.08, sheetY - 2, 44, -0.26, 1850)
        SKETCH.tape(context, sheetX + sheetWidth * 0.94, sheetY + 4, 44, 0.32, 1851)
        context.restore()

        api.link(sheetX - 6, sheetY - 8, sheetWidth + 14, sheetHeight + 14, data.href, data.openTitle)

        /* the open link, big and unmissable */
        var linkSize = 12 * typeScale(width)
        var linkWidth = measure(data.openLabel, linkSize)
        var linkY = sheetY + sheetHeight + height * 0.07
        write(context, data.openLabel, width / 2, linkY, { size: linkSize, seed: 1860, align: 'center', width: linkSize * 0.12 })
        SKETCH.rule(context, width / 2 - linkWidth / 2 - 4, linkY + linkSize * 0.8, width / 2 + linkWidth / 2 + 6, { seed: 1861, color: SKETCH.RED, width: 2.2, amp: 0.8 })
        api.link(width / 2 - linkWidth / 2 - 10, linkY - linkSize * 1.5, linkWidth + 20, linkSize * 3, data.href, data.openTitle)

        SKETCH.artifacts(context, width, height, 1863)
      },
    }
  }

  /* --------------------------------------------------------- faces sheet */

  PLATES.faces = function (data) {
    var state = { seeds: [], cells: [], zones: [] }
    var reseed = function (index) {
      state.seeds[index] = Math.floor(Math.random() * 999983)
    }
    for (var index = 0; index < SKETCH.faces.ROWS_TOTAL; index += 1) {
      state.seeds.push(37 + index * 131)
    }

    function topOffset(width) { return width < 520 ? 96 : 66 }

    function drawActions(context, width) {
      state.zones = []
      var actions = [
        { label: 'SAVE PNG', kind: 'save' },
        { label: 'NEW SHEET', kind: 'reseed' },
      ]
      var x = width - 26
      var y = width < 520 ? 66 : 26
      actions.forEach(function (action, actionIndex) {
        var wordWidth = measure(action.label, 9)
        var wordX = x - wordWidth
        write(context, action.label, wordX, y, { size: 9, seed: 1600 + actionIndex, color: SKETCH.INK_SOFT })
        SKETCH.rule(context, wordX - 1, y + 7, wordX + wordWidth + 3, { seed: 1610 + actionIndex, color: SKETCH.PENCIL, width: 1.2, amp: 0.7 })
        state.zones.push({ x: wordX - 6, y: y - 14, width: wordWidth + 12, height: 28, kind: action.kind })
        x = wordX - 26
      })
    }

    return {
      state: state,
      aria: 'Naive faces: a sheet of 24 generated portraits. Click a face to redraw it.',
      height: function (width) {
        var columns = SKETCH.faces.columnsFor(width - 36)
        return topOffset(width) + 4 * ((width - 36) / columns) * 1.12 + 34
      },
      draw: function (context, width, height, api) {
        SKETCH.plainPaper(context, width, height, { seed: 501, tone: '#f0ebdc' })
        sheetTitle(context, 'NAIVE FACES', data.date, 26, 26, width)
        write(context, 'CLICK A FACE TO REDRAW IT', 26, 46, { size: 7, color: SKETCH.GREEN_PEN, seed: 1622 })
        drawActions(context, width)
        context.save()
        context.translate(18, 0)
        var columns = SKETCH.faces.columnsFor(width - 36)
        var visible = state.seeds.slice(0, columns * 4)
        state.cells = SKETCH.faces.renderSheet(context, width - 36, height - 30, visible, topOffset(width))
          .map(function (cell) {
            return { x: cell.x + 18, y: cell.y, width: cell.width, height: cell.height }
          })
        context.restore()
        SKETCH.artifacts(context, width, height, 1624)
      },
      onPointer: function (type, x, y, api) {
        var overButton = state.zones.some(function (z) {
          return x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
        })
        if (type === 'move') {
          var overFace = y > topOffset(api.width) && y < api.height - 30
          api.canvas.style.cursor = overButton || overFace ? 'pointer' : 'default'
          return
        }
        if (type !== 'down') return
        for (var zoneIndex = 0; zoneIndex < state.zones.length; zoneIndex += 1) {
          var z = state.zones[zoneIndex]
          if (x < z.x || x > z.x + z.width || y < z.y || y > z.y + z.height) continue
          if (z.kind === 'reseed') {
            for (var seedIndex = 0; seedIndex < state.seeds.length; seedIndex += 1) reseed(seedIndex)
            api.redraw()
          }
          if (z.kind === 'save') {
            var exportCanvas = document.createElement('canvas')
            exportCanvas.width = 1560
            exportCanvas.height = 1080
            var exportContext = exportCanvas.getContext('2d')
            SKETCH.plainPaper(exportContext, exportCanvas.width, exportCanvas.height, { seed: 501, tone: '#f0ebdc' })
            SKETCH.letter.write(exportContext, 'NAIVE FACES', 44, 54, { size: 22, seed: 1620, width: 2.2, tracking: 0.42 })
            SKETCH.faces.renderSheet(exportContext, exportCanvas.width - 60, exportCanvas.height - 40, state.seeds, 84)
            SKETCH.download(exportCanvas, 'naive-faces.png')
          }
          return
        }
        for (var cellIndex = 0; cellIndex < state.cells.length; cellIndex += 1) {
          var cell = state.cells[cellIndex]
          if (x < cell.x || x > cell.x + cell.width || y < cell.y || y > cell.y + cell.height) continue
          reseed(cellIndex)
          api.redraw()
          return
        }
      },
    }
  }
})()
