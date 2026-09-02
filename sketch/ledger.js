/* ledger.js — the visitor ledger. GitHub Pages is static, so the shared
   count comes from GoatCounter; the digits are drawn like everything else.
   Localhost is never counted as a visit. */
'use strict'

;(function () {
  var LEDGER = window.SKETCH.ledger = {}

  var CODE = 'caellumyhl'
  var ROOT = 'https://' + CODE + '.goatcounter.com'

  var isLocalPreview =
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost' ||
    window.location.protocol === 'file:'

  function digitsOnly(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return null
    var parsed = parseInt(String(value).replace(/[^0-9]/g, ''), 10)
    return isFinite(parsed) ? parsed : null
  }

  /* Load the GoatCounter script so the visit is recorded. Called at boot so
     every visit counts, whether or not the ledger page is ever opened. */
  LEDGER.record = function () {
    if (isLocalPreview) return
    if (document.querySelector('script[data-portfolio-counter]')) return
    window.goatcounter = { path: function () { return '/' } }
    var script = document.createElement('script')
    script.async = true
    script.src = 'https://gc.zgo.at/count.js'
    script.dataset.goatcounter = ROOT + '/count'
    script.dataset.portfolioCounter = 'true'
    document.head.appendChild(script)
  }

  /* status: loading | ready | unavailable. The real total is fetched
     everywhere — localhost just never records a visit. */
  function watchCount(onChange) {
    onChange(null, 'loading')

    var succeeded = false
    var readCount = function () {
      fetch(ROOT + '/counter/TOTAL.json', { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('counter returned ' + response.status)
          return response.json()
        })
        .then(function (payload) {
          var count = digitsOnly(payload && payload.count)
          if (count === null) throw new Error('invalid count')
          succeeded = true
          onChange(count, 'ready')
        })
        .catch(function (error) {
          console.warn('Visitor ledger is unavailable', error)
          if (!succeeded) onChange(null, 'unavailable')
        })
    }

    LEDGER.record()
    setTimeout(readCount, 250)
    setTimeout(readCount, 9000)
  }

  function grouped(count, status) {
    void status
    if (count === null) return '— — —'
    var digits = String(count)
    while (digits.length < 6) digits = '0' + digits
    return digits.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')
  }

  LEDGER.spec = function (data) {
    var state = { count: null, status: 'loading', started: false }

    return {
      state: state,
      aria: 'Visitor ledger: a hand-drawn counter of total site visits, and the colophon of the site.',
      height: function () { return 330 },
      draw: function (context, width, height, api) {
        if (!state.started) {
          state.started = true
          watchCount(function (count, status) {
            state.count = count
            state.status = status
            api.redraw()
          })
        }

        var write = SKETCH.letter.write
        var centerX = width / 2

        SKETCH.plainPaper(context, width, height, { seed: 701, tone: '#efe9da' })

        write(context, 'VISITOR LEDGER', 26, 26, { size: 12, seed: 700, width: 1.5, tracking: 0.42 })
        SKETCH.rule(context, 24, 35, 26 + SKETCH.letter.measure('VISITOR LEDGER', 12, 0.42) + 8, { seed: 702, color: SKETCH.PENCIL, width: 1.1 })
        write(context, data.date, 26 + SKETCH.letter.measure('VISITOR LEDGER', 12, 0.42) + 22, 26, { size: 8.5, media: 'pencil', seed: 704 })

        var s = SKETCH.clamp(width / 620, 0.9, 1.5)
        write(context, grouped(state.count, state.status), centerX, height * 0.33, {
          size: 40 * s,
          seed: 703 + (state.count || 0),
          align: 'center',
          width: 2.5 * s,
          tracking: 0.42,
        })

        var statusLine = state.status === 'ready' ? 'TOTAL SITE VISITS'
          : state.status === 'loading' ? 'COUNTING . . .'
            : 'COUNT UNAVAILABLE TODAY'
        write(context, statusLine, centerX, height * 0.33 + 42 * s, { size: 8 * Math.min(s, 1.2), color: SKETCH.GREEN_PEN, seed: 705, align: 'center', tracking: 0.6 })

        /* colophon */
        var noteSize = 8.5 * Math.min(s, 1.2)
        var y = height * 0.58
        data.colophon.forEach(function (line) {
          SKETCH.letter.wrap(line, noteSize, Math.min(700, width - 56), 0.35).forEach(function (piece) {
            write(context, piece, centerX, y, { size: noteSize, color: SKETCH.INK_SOFT, seed: 720 + y, align: 'center', tracking: 0.35 })
            y += noteSize * 2.1
          })
          y += 8
        })
        y += 10

        var sourceSize = 9.5 * Math.min(s, 1.25)
        var sourceWidth = SKETCH.letter.measure(data.sourceLabel, sourceSize)
        write(context, data.sourceLabel, centerX, y, { size: sourceSize, seed: 730, align: 'center' })
        SKETCH.rule(context, centerX - sourceWidth / 2 - 2, y + sourceSize * 0.75, centerX + sourceWidth / 2 + 4, { seed: 731, color: SKETCH.RED_FAINT, width: 2 })
        api.link(centerX - sourceWidth / 2 - 8, y - 13, sourceWidth + 16, 28, data.sourceHref, data.sourceTitle)

        /* the grove again, small, seeing the book out */
        SKETCH.grove.cluster(context, width * 0.5, height - 20, Math.min(height * 0.15, 104), 7911, 3)

        SKETCH.artifacts(context, width, height, 734)
      },
    }
  }
})()
