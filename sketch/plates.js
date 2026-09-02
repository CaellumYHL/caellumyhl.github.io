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
    return {
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

        /* a small grove growing out of the page corner */
        SKETCH.grove.cluster(context, width * 0.72, height * 0.93, Math.min(height * 0.3, width * 0.2), 7411, 3)
        SKETCH.splatter(context, width * 0.6, height * 0.82, 30, 'rgba(84, 66, 48, 0.6)', 123, 6)

        SKETCH.print(context, data.stationery, width / 2, height - 30, { align: 'center', seed: 150 })
        SKETCH.artifacts(context, width, height, 152)
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
        var s = typeScale(width)
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
            /* a tight two-line entry on small screens */
            write(context, project.shortDate, textX, top + 52, { size: 8.5, media: 'pencil', seed: project.seed + 4 })
            write(context, project.metric, width - 26, top + 52, { size: 8.5, color: SKETCH.RED, seed: project.seed + 3, align: 'right' })
          } else {
            write(context, project.metric, width - 28, top + 24, { size: 9.5 * s, color: SKETCH.RED, seed: project.seed + 3, align: 'right' })
            write(context, project.date, textX, top + 34 + 22 * s, { size: 9 * s, media: 'pencil', seed: project.seed + 4 })
            var y = top + 40 + 46 * s
            var floor = top + ENTRY - 16
            var maxWidth = width - textX - 36
            wrapLines(project.line, 9.5 * s, maxWidth).forEach(function (line) {
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
        var s = typeScale(width)
        var factSize = (compact ? 8 : 9.5) * s
        var rowH = Math.max(112, (height - 160) / data.rows.length)
        data.rows.forEach(function (row, index) {
          var y = 86 + index * rowH
          var textX = width * 0.21
          SKETCH.thumbprint(context, width * 0.1, y + 40, Math.min(38, width * 0.038), Math.min(48, width * 0.048), null, 1220 + index * 13)
          var orgSize = (compact ? 11.5 : 14) * s
          write(context, row.org, textX, y + 12, { size: orgSize, seed: 1100 + index, width: orgSize * 0.115, tracking: 0.36 })
          if (!compact) write(context, row.period, width - 28, y + 12, { size: 9 * s, media: 'pencil', seed: 1110 + index, align: 'right' })
          write(context, row.role, textX, y + 14 + 26 * s, { size: (compact ? 9 : 10.5) * s, seed: 1105 + index, tracking: 0.36 })
          var lineY = y + 18 + 50 * s
          var facts = compact ? row.period + ' · ' + row.facts : row.facts
          wrapLines(facts, factSize, width - textX - 34).forEach(function (line) {
            write(context, line, textX, lineY, { size: factSize, color: SKETCH.INK_SOFT, seed: 1120 + index + lineY })
            lineY += factSize * 1.8
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
