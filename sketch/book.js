/* book.js — the scrapbook binding. One page is open at a time; index tabs
   stick out of the right edge, the dog-eared corners turn the page, and the
   arrow keys flip too. The tabs and corners are drawn like everything else. */
'use strict'

;(function () {
  /* the tab gutter grows a little with the book */
  function gutterFor(width) {
    return SKETCH.clamp(Math.round(width * 0.033), 36, 62)
  }
  var TAB_COLORS = ['#b5495b', '#7b8b4e', '#d9a441', '#6d4a5e', '#4e7b8b', '#b4713f', '#8f9dad', '#a6ad8b', '#b98777']

  SKETCH.bookCreate = function (container, pages) {
    var state = { index: 0, zones: [], hover: null }

    /* open on the page named in the hash, if any */
    var hash = window.location.hash.replace(/^#\/?/, '')
    pages.forEach(function (page, index) {
      if (page.id === hash) state.index = index
    })

    function setHidden() {
      pages.forEach(function (page, index) {
        if (page.spec.state) page.spec.state.hidden = index !== state.index
      })
    }
    setHidden()

    var api = null
    var flight = { raf: 0 }
    var reducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function snapshot(canvas) {
      var copy = document.createElement('canvas')
      copy.width = canvas.width
      copy.height = canvas.height
      copy.getContext('2d').drawImage(canvas, 0, 0)
      return copy
    }

    function flipTo(index) {
      if (index < 0 || index >= pages.length || index === state.index) return
      if (flight.raf) {
        cancelAnimationFrame(flight.raf)
        flight.raf = 0
      }
      var forward = index > state.index
      var before = api && !reducedMotion ? snapshot(api.canvas) : null
      state.index = index
      state.hover = null
      setHidden()
      if (history.replaceState) history.replaceState(null, '', '#/' + pages[index].id)
      if (!api) return
      api.redraw()
      if (!before) return

      /* turn the page: the old sheet peels across the new one */
      var after = snapshot(api.canvas)
      var context = api.canvas.getContext('2d')
      var deviceH = api.canvas.height
      var scale = api.canvas.width / api.width
      var pageW = api.width - gutterFor(api.width)
      var start = performance.now()
      var duration = 430

      var frame = function (now) {
        flight.raf = 0
        var t = Math.min(1, (now - start) / duration)
        var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        var boundary = forward ? pageW * (1 - eased) : pageW * eased

        context.setTransform(1, 0, 0, 1, 0, 0)
        context.drawImage(after, 0, 0)
        context.save()
        context.beginPath()
        if (forward) context.rect(0, 0, boundary * scale, deviceH)
        else context.rect(boundary * scale, 0, (pageW - boundary) * scale, deviceH)
        context.clip()
        context.drawImage(before, 0, 0)
        context.restore()

        if (t < 1) {
          /* the lifted edge: a curl of paper backside and a cast shadow,
             kept strictly inside the page so it never darkens the tabs */
          context.setTransform(scale, 0, 0, scale, 0, 0)
          context.save()
          context.beginPath()
          context.rect(0, 0, pageW, api.height)
          context.clip()
          var shade = context.createLinearGradient(boundary, 0, boundary + 54, 0)
          shade.addColorStop(0, 'rgba(46, 36, 22, 0.22)')
          shade.addColorStop(1, 'rgba(46, 36, 22, 0)')
          context.fillStyle = shade
          context.fillRect(boundary, 0, 54, api.height)
          var curl = context.createLinearGradient(boundary - 24, 0, boundary, 0)
          curl.addColorStop(0, 'rgba(240, 234, 218, 0.4)')
          curl.addColorStop(0.7, '#f6f1e2')
          curl.addColorStop(1, '#ded7c2')
          context.fillStyle = curl
          context.fillRect(Math.max(0, boundary - 24), 0, Math.min(24, boundary), api.height)
          context.restore()
          flight.raf = requestAnimationFrame(frame)
        } else {
          context.setTransform(1, 0, 0, 1, 0, 0)
          context.drawImage(after, 0, 0)
        }
      }
      flight.raf = requestAnimationFrame(frame)
    }

    function zone(x, y, width, height, action, id) {
      state.zones.push({ x: x, y: y, width: width, height: height, action: action, id: id, cursor: 'pointer' })
    }

    function drawChrome(context, pageW, width, height) {
      state.zones = []
      var ts = SKETCH.clamp(width / 900, 1, 1.4)

      /* index tabs, sliding out from under the page edge */
      var tabH = Math.min(46 * ts, (height - 120) / pages.length - 8)
      pages.forEach(function (page, index) {
        var tabY = 58 + index * (tabH + 8)
        var active = index === state.index
        var hovered = state.hover === 'tab' + index
        var color = TAB_COLORS[index % TAB_COLORS.length]
        var tabX = pageW - 12
        var tabRight = active ? width - 2 : hovered ? width - 4 : width - 8
        context.save()
        context.globalAlpha = active ? 0.92 : hovered ? 0.82 : 0.6
        context.fillStyle = color
        var random = SKETCH.rng(4000 + index)
        context.beginPath()
        context.moveTo(tabX, tabY + (random() - 0.5) * 2)
        context.lineTo(tabRight - 4, tabY + (random() - 0.5) * 2)
        context.quadraticCurveTo(tabRight, tabY + tabH / 2, tabRight - 4, tabY + tabH + (random() - 0.5) * 2)
        context.lineTo(tabX, tabY + tabH)
        context.closePath()
        context.fill()
        /* wash grain on the tab */
        context.globalAlpha = 0.2
        for (var grain = 0; grain < 12; grain += 1) {
          context.fillRect(tabX + random() * (tabRight - tabX - 4), tabY + random() * tabH, 1 + random(), 1 + random())
        }
        context.restore()

        /* the label, written up the tab, shrunk to fit it */
        var labelSize = Math.min(6.5 * ts, (10 * (tabH - 8)) / SKETCH.letter.measure(page.tab, 10, 0.5))
        context.save()
        context.translate(pageW + (active ? 15 : 11) * ts, tabY + tabH / 2)
        context.rotate(Math.PI / 2)
        SKETCH.letter.write(context, page.tab, 0, 2.5 * ts, {
          size: labelSize,
          color: 'rgba(252, 248, 238, 0.95)',
          seed: 4100 + index,
          align: 'center',
          tracking: 0.5,
          amp: 0.2,
          width: 1,
        })
        context.restore()

        zone(pageW - 12, tabY, width - pageW + 12, tabH, function () { flipTo(index) }, 'tab' + index)
      })

      /* dog-eared corners to turn the page */
      if (state.index < pages.length - 1) {
        var fold = 46 * ts * (state.hover === 'next' ? 1.35 : 1)
        context.save()
        context.fillStyle = 'rgba(60, 50, 34, 0.14)'
        context.beginPath()
        context.moveTo(pageW - fold, height)
        context.lineTo(pageW, height - fold)
        context.lineTo(pageW, height)
        context.closePath()
        context.fill()
        context.restore()
        SKETCH.stroke(context, [[pageW - fold, height - 1], [pageW - 1, height - fold]], { seed: 4200, color: SKETCH.PENCIL, width: 1.4, amp: 1 })
        SKETCH.letter.write(context, 'NEXT', pageW - 16, height - 16, { size: 7 * ts, media: 'pencil', seed: 4201, align: 'right' })
        zone(pageW - 84 * ts, height - 84 * ts, 84 * ts, 84 * ts, function () { flipTo(state.index + 1) }, 'next')
      }
      if (state.index > 0) {
        var foldBack = 46 * ts * (state.hover === 'back' ? 1.35 : 1)
        context.save()
        context.fillStyle = 'rgba(60, 50, 34, 0.12)'
        context.beginPath()
        context.moveTo(foldBack, height)
        context.lineTo(0, height - foldBack)
        context.lineTo(0, height)
        context.closePath()
        context.fill()
        context.restore()
        SKETCH.stroke(context, [[foldBack, height - 1], [1, height - foldBack]], { seed: 4210, color: SKETCH.PENCIL, width: 1.4, amp: 1 })
        SKETCH.letter.write(context, 'BACK', 16, height - 16, { size: 7 * ts, media: 'pencil', seed: 4211 })
        zone(0, height - 84 * ts, 84 * ts, 84 * ts, function () { flipTo(state.index - 1) }, 'back')
      }

      /* where we are in the book */
      SKETCH.print(context, (state.index + 1) + ' OF ' + pages.length, pageW / 2, height - 12, { align: 'center', seed: 4300, size: 7 * ts })
    }

    var spec = {
      state: state,
      aria: 'A flippable scrapbook. Use the tabs on the right edge, the page corners, or the arrow keys to turn pages.',
      height: function (width) {
        /* the book fills the window; pages fit themselves to its shape */
        return Math.round((width - gutterFor(width)) * bookShape().ratio)
      },
      draw: function (context, width, height, mountApi) {
        api = mountApi
        var pageW = width - gutterFor(width)
        var page = pages[state.index]

        /* the closed depth of the book under the open page */
        context.save()
        for (var edge = 3; edge >= 1; edge -= 1) {
          context.fillStyle = edge % 2 ? '#e6dfcc' : '#ddd5c0'
          context.fillRect(edge * 2.5, edge * 2.5, pageW, height - edge * 2)
        }
        context.restore()

        var pageApi = {
          state: page.spec.state,
          canvas: mountApi.canvas,
          container: mountApi.container,
          width: pageW,
          height: height,
          hotspots: mountApi.hotspots,
          link: mountApi.link,
          redraw: mountApi.redraw,
        }
        page.spec.draw(context, pageW, height, pageApi)
        drawChrome(context, pageW, width, height)
      },
      onPointer: function (type, x, y, mountApi, event) {
        /* the book's own controls first */
        var over = null
        for (var index = 0; index < state.zones.length; index += 1) {
          var z = state.zones[index]
          if (x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height) { over = z; break }
        }
        if (type === 'move') {
          var hoverId = over ? over.id : null
          if (hoverId !== state.hover && !flight.raf) {
            state.hover = hoverId
            mountApi.redraw()
          }
        }
        if (over) {
          if (type === 'move') { mountApi.canvas.style.cursor = over.cursor; return }
          if (type === 'down') { over.action(); return }
          return
        }
        var page = pages[state.index]
        var pageW = mountApi.width - gutterFor(mountApi.width)
        if (x > pageW) {
          if (type === 'move') mountApi.canvas.style.cursor = 'default'
          return
        }
        if (page.spec.onPointer) {
          var pageApi = {
            state: page.spec.state,
            canvas: mountApi.canvas,
            container: mountApi.container,
            width: pageW,
            height: mountApi.height,
            link: mountApi.link,
            redraw: mountApi.redraw,
          }
          page.spec.onPointer(type, x, y, pageApi, event)
        } else if (type === 'move') {
          mountApi.canvas.style.cursor = 'default'
        }
      },
    }

    document.addEventListener('keydown', function (event) {
      if (event.target && /input|textarea|select/i.test(event.target.tagName || '')) return
      if (event.key === 'ArrowRight') flipTo(state.index + 1)
      if (event.key === 'ArrowLeft') flipTo(state.index - 1)
    })

    /* size the book to the window: nearly the whole screen, whatever its
       shape, within sensible page proportions */
    function bookShape() {
      var availW = window.innerWidth - SKETCH.clamp(window.innerWidth * 0.11, 30, 230)
      var availH = window.innerHeight - SKETCH.clamp(window.innerHeight * 0.09, 26, 96)
      var gutter = gutterFor(availW)
      var pageW = availW - gutter
      var ratio = availH / pageW
      if (ratio < 0.42) {
        pageW = availH / 0.42
        ratio = 0.42
      }
      if (ratio > 1.55) ratio = 1.55
      return { width: Math.max(290, Math.round(pageW + gutter)), ratio: ratio }
    }

    var refit = 0
    function fitToWindow() {
      container.style.width = bookShape().width + 'px'
      /* a pure height change never fires the width observer — redraw anyway */
      clearTimeout(refit)
      refit = setTimeout(function () { if (api) api.redraw() }, 140)
    }
    fitToWindow()
    window.addEventListener('resize', fitToWindow)

    var mounted = SKETCH.mount(container, spec)
    api = mounted
    return mounted
  }
})()
