/* ============================================================
   app.js — boot, game-menu navigation, and the Pokedex-style
   selectors for Projects & Experience.

   Main menu = pointer-driven tab select.
   Projects / Experience = a sub-menu you browse with the arrow
   keys (seeing only a preview), then ENTER / click to open the
   full entry. ESC backs out one level.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- data ---------------- */
  var PROJECTS = [
    {
      list: 'Paper Cuts', name: 'Paper Cuts', when: 'Jun 2026',
      event: '🏆 1st Overall ($5,000) · Best UI/UX — Cal Hacks',
      img: 'images/papercuts.png',
      desc: "A real-time, draw-to-play game that turns kids' doodles into playable game assets in seconds — custom diffusion, a cascading recognition pipeline, and a neuro-symbolic mechanic composer.",
      highlights: [
        'Trained an image-to-image diffusion model (<b>SDXL</b> + <b>InstructPix2Pix</b>) on <b>AWS Trainium</b>.',
        'Cascading recognition: custom <b>CNN</b> &rarr; open-vocab <b>VLM</b> fallback &rarr; RAG over <b>Redis</b> (RediSearch HNSW).',
        '"Moose": neuro-symbolic composer (LoRA + safe rule-graph) and a from-scratch <b>HTML5 Canvas</b> engine with WebSocket phone controllers.'
      ],
      tech: ['PyTorch', 'FastAPI', 'Redis', 'AWS Trainium', 'SDXL'],
      links: [{ label: 'GitHub ↗', url: 'https://github.com/Jeremyliu-621/paper-cuts' }]
    },
    {
      list: 'Auctopus', name: 'Auctopus', when: 'May 2026',
      event: '🏆 1st — Cloudinary &amp; Polarity tracks · SOON Hackathon',
      img: 'images/auctopus.png',
      desc: 'An end-to-end automated product validation &amp; prototyping pipeline: an async 8-stage chain streaming live progress over SSE.',
      highlights: [
        'Multi-model workflow &mdash; <b>Gemini 2.5 Pro</b> brand research, <b>Veo 2</b> video, <b>Neo4j</b>-backed multi-persona audience sim.',
        '<b>Cloudinary</b> CDN + Meshy for interactive 3D GLB/USDZ (Apple AR Quick Look).',
        '<b>Composio</b> to Slack/Notion, <b>CyStack</b> secrets, <b>Polarity</b> AI PR reviews.'
      ],
      tech: ['Next.js', 'Gemini 2.5', 'Veo 2', 'Neo4j', 'Cloudinary'],
      links: [{ label: 'GitHub ↗', url: 'https://github.com/Jeremyliu-621/soon' }]
    },
    {
      list: 'Minutes', name: 'Minutes', when: 'Mar 2026',
      event: '🏆 Runner-Up — Google Best AI for Community Impact · GenAIGenesis',
      img: 'images/minutes.png',
      desc: 'An autonomous civic agent that broadcasts municipal legislative updates to social media in plain language.',
      highlights: [
        'Ingestion via <b>Playwright</b> + <b>BeautifulSoup4</b> against undocumented Toronto portal APIs.',
        'RAG with <b>LangChain</b> + <b>ChromaDB</b> &rarr; jargon-free policy summaries via OpenRouter.',
        'Automated DM workflow on the Instagram Graph API + RLS-encrypted <b>PostgreSQL</b>.'
      ],
      tech: ['FastAPI', 'LangChain', 'ChromaDB', 'Docker', 'Supabase'],
      links: [{ label: 'GitHub ↗', url: 'https://github.com/Caleb-Gawthroupe/minutes' }]
    },
    {
      list: 'Apogee AI', name: 'Apogee AI', when: 'Jan 2026', event: 'DeltaHacks 12',
      img: 'images/apogee.png',
      desc: 'A 3D node map of vectorized news clustered by subtopic, with a context-aware chatbot grounded in scraped articles.',
      highlights: [
        '<b>Louvain</b> clustering + <b>Pyvis</b> 3D graph of vectorized articles.',
        '<b>Moorcheh AI</b> RAG + <b>Gemini</b> chatbot with memory.',
        'Political-spectrum &amp; emotion filtering with NER plotted on a global map.'
      ],
      tech: ['Python', 'Streamlit', 'Scikit-learn', 'Gemini'],
      links: []
    },
    {
      list: 'Twin Universe', name: 'Twin Universe', when: '2023 – Now',
      event: '🎮 2.8M+ player visits · Bronze Bat Studio',
      img: 'images/twinuniverse.png',
      desc: 'A space-exploration game with rocket launches, progression systems, and multiplayer missions.',
      highlights: [
        'Designed interactive environments &amp; engaging mechanics in <b>Lua</b>.',
        'Grew to over <b>2.8 million</b> player visits on Roblox.'
      ],
      tech: ['Lua', 'Roblox', 'Multiplayer'],
      links: [{ label: 'Play ↗', url: 'https://www.roblox.com/games/4818610549/Twin-Universe-Space-Travel-RP-Rocket-Simulator' }]
    },
    {
      list: 'Trace', name: 'Trace', when: 'Dec 2025', event: 'Stock Market Predictor',
      img: 'images/trace.png',
      desc: 'A TensorFlow <b>LSTM</b> network that predicts stock-price trends from decades of historical market data.',
      highlights: [
        'Trained an <b>LSTM</b> in TensorFlow on global OHLC data.',
        'Ingestion pipeline over the <b>Alpha Vantage API</b> cleaning 20+ years into Pandas.'
      ],
      tech: ['Python', 'TensorFlow', 'Pandas'],
      links: []
    },
    {
      list: 'Cellular Automata', name: 'Genetic Code / Cellular Automata', when: '2025',
      event: 'Computational Biology Research',
      img: 'images/automata.png',
      desc: 'Computational experiments on SGC mutation tolerance and augmentors in Wolfram Rule 110 cellular automata.',
      highlights: [
        'Assessed mutation tolerance &amp; augmentor impact in <b>Rule 110</b>.',
        'Documented findings in Quarto / Jupyter notebooks.'
      ],
      tech: ['R', 'Quarto', 'Jupyter'],
      links: [{ label: 'GitHub ↗', url: 'https://github.com/CaellumYHL/CSB195' }]
    }
  ];

  var EXPERIENCE = [
    {
      role: 'Software Engineer', org: 'Chatforce', when: 'Feb 2026 – Present',
      where: 'Chatforce Office · Toronto, ON',
      summary: 'Overhauled the AI game-development pipeline and shipped core platform &amp; creator-economy features.',
      bullets: [
        'Overhauled the AI game-development pipeline &mdash; single-handedly implementing a vision-driven <b>multi-agent architecture</b> inspired by <b>OpenGame</b> research with a custom affordance model.',
        'Built the Chatforce Creator Economy &amp; a Creator Analytics Dashboard in <b>Angular</b> + <b>TailwindCSS</b> backed by S3.',
        'Shipped core platform features (game versioning, taglines, patch notes) with <b>Angular</b> &amp; <b>FastAPI</b>.',
        'Designed a <b>FastAPI</b> rate-limiter with a <b>Redis</b> dedup cascade, <b>Pydantic</b> validation, and IPv6 prefix truncation to stop play-count manipulation.'
      ],
      tech: ['Angular', 'FastAPI', 'Redis', 'TailwindCSS', 'AWS S3'],
      links: []
    },
    {
      role: 'Software Developer', org: 'U of T Blueprint', when: 'Sep 2025 – May 2026',
      where: 'University of Toronto · Toronto, ON',
      summary: 'Building software for social change with a student-run non-profit.',
      bullets: [
        'Building software for social change with a student-run non-profit.',
        'Developed JWT auth/middleware, an admin dashboard, and a CSV data-management system in <b>Django REST</b> + <b>React</b> for the Museum of Art &amp; Digital Entertainment (California).'
      ],
      tech: ['Django REST', 'React', 'JWT'],
      links: [{ label: 'GitHub ↗', url: 'https://github.com/uoftblueprint/made' }]
    },
    {
      role: 'Front End Developer', org: 'U of T Boxing Club', when: 'Jan 2026 – Mar 2026',
      where: 'University of Toronto · Toronto, ON',
      summary: 'Built the club website and a Google-powered CMS for 40+ members.',
      bullets: [
        'Built the club website with <b>React</b>, <b>Next.js</b>, and <b>Tailwind CSS</b>.',
        'Implemented a <b>CMS</b> over the Google Sheets &amp; Calendar APIs to manage merch, classes, and schedules for <b>40+ members</b>.'
      ],
      tech: ['React', 'Next.js', 'Tailwind CSS'],
      links: []
    },
    {
      role: 'Owner &amp; Software Lead', org: 'Bronze Bat Studio', when: 'Aug 2023 – Present',
      where: 'Independent Game Studio',
      summary: 'Founded and lead an indie studio with 3M+ plays across Steam &amp; Roblox.',
      bullets: [
        'Founded and lead a small game studio working in <b>Lua</b> and <b>C#</b>.',
        'Published titles with <b>3M+ plays</b> and <b>~$2,000</b> in revenue across Steam &amp; Roblox.'
      ],
      tech: ['Lua', 'C#', 'Roblox', 'Steam'],
      links: []
    },
    {
      role: 'Head of Programming / Co-founder', org: 'RHHS Game Design', when: 'Sep 2023 – Jun 2025',
      where: 'Richmond Hill High School · Richmond Hill, ON',
      summary: 'Designed &amp; taught interactive Unity game-dev lessons in C#.',
      bullets: [
        'Designed &amp; taught interactive <b>Unity</b> lessons in <b>C#</b>, guiding members to build a Flappy-Bird-style game.',
        'Used gameplay mechanics to teach conditionals, functions, and Unity physics.'
      ],
      tech: ['Unity', 'C#'],
      links: []
    }
  ];

  /* ---------------- element refs ---------------- */
  var boot      = document.getElementById('boot');
  var startBtn  = document.getElementById('startBtn');
  var app       = document.getElementById('app');
  var menu      = document.getElementById('menu');
  var content   = document.getElementById('content');
  var backBtn   = document.getElementById('backBtn');
  var brandHome = document.getElementById('brandHome');
  var items  = Array.prototype.slice.call(document.querySelectorAll('.menu-item'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));

  var started = false;
  var selIndex = 0;
  var activeName = null;

  function panelByName(name) {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-panel') === name) return panels[i];
    }
    return null;
  }

  /* ---------------- helpers ---------------- */
  function tags(arr) {
    if (!arr || !arr.length) return '';
    return '<div class="tags">' + arr.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>';
  }
  function linkRow(arr) {
    if (!arr || !arr.length) return '';
    return '<div class="detail-links">' + arr.map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + '</a>';
    }).join('') + '</div>';
  }
  function bullets(arr) {
    return '<ul class="detail-hl">' + arr.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>';
  }

  /* ---------------- generic selector ---------------- */
  function makeSelector(opts) {
    var listEl = opts.listEl, stageEl = opts.stageEl, rootEl = opts.rootEl, data = opts.data;
    var idx = 0, mode = 'browse';

    function paint() {
      var lis = listEl.children;
      for (var i = 0; i < lis.length; i++) lis[i].classList.toggle('sel', i === idx);
    }
    function renderList() {
      listEl.innerHTML = data.map(opts.renderItem).join('');
      paint();
    }
    function showPreview() {
      mode = 'browse';
      rootEl.classList.remove('is-detail');
      stageEl.innerHTML = opts.renderPreview(data[idx], idx);
    }
    function showDetail() {
      mode = 'detail';
      rootEl.classList.add('is-detail');
      stageEl.innerHTML = opts.renderDetail(data[idx], idx);
      stageEl.scrollTop = 0;
    }
    function select(i) {
      idx = (i + data.length) % data.length;
      paint();
      if (mode === 'detail') showDetail(); else showPreview();
    }
    function open() { showDetail(); }
    function back() { showPreview(); }
    function reset() { idx = 0; mode = 'browse'; renderList(); showPreview(); }

    listEl.addEventListener('click', function (e) {
      var li = e.target.closest('li'); if (!li) return;
      select(Array.prototype.indexOf.call(listEl.children, li));
      open();
    });
    listEl.addEventListener('mousemove', function (e) {
      if (mode !== 'browse') return;
      var li = e.target.closest('li'); if (!li) return;
      var i = Array.prototype.indexOf.call(listEl.children, li);
      if (i !== idx) select(i);
    });
    stageEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-act="back"]')) { back(); return; }
      if (e.target.closest('[data-act="open"]')) { open(); }
    });

    function handleKey(e) {
      switch (e.key) {
        case 'ArrowDown': case 'ArrowRight': e.preventDefault(); select(idx + 1); return true;
        case 'ArrowUp': case 'ArrowLeft': e.preventDefault(); select(idx - 1); return true;
        case 'Enter': case ' ': e.preventDefault(); if (mode === 'browse') open(); return true;
        case 'Escape': case 'Backspace':
          if (mode === 'detail') { e.preventDefault(); back(); return true; }
          return false;
      }
      return false;
    }
    return { handleKey: handleKey, reset: reset };
  }

  /* ---------------- project selector ---------------- */
  var projSel = makeSelector({
    listEl: document.getElementById('projList'),
    stageEl: document.getElementById('projStage'),
    rootEl: document.getElementById('projSelector'),
    data: PROJECTS,
    renderItem: function (p) {
      return '<li class="sel-item"><span class="chip-suit">&#9830;</span><span class="sel-label">' + p.list + '</span></li>';
    },
    renderPreview: function (p) {
      return '<div class="sel-card">' +
        '<div class="sel-shot" data-act="open"><img src="' + p.img + '" alt="' + p.name + '" /></div>' +
        '<div class="sel-info">' +
          '<h3 class="sel-title">' + p.name + '</h3>' +
          '<p class="sel-event">' + p.event + '</p>' +
          '<p class="sel-sub">' + p.when + '</p>' +
          '<button class="open-cue" data-act="open" type="button">▸ OPEN ENTRY</button>' +
        '</div></div>';
    },
    renderDetail: function (p) {
      return '<button class="back-link" data-act="back" type="button">◀ BACK</button>' +
        '<div class="card detail">' +
        '<div class="detail-shot"><img src="' + p.img + '" alt="' + p.name + '" /></div>' +
        '<h3 class="detail-title">' + p.name + '</h3>' +
        '<p class="sel-event">' + p.event + '</p>' +
        '<p class="detail-sub">' + p.when + '</p>' +
        '<p class="detail-desc">' + p.desc + '</p>' +
        bullets(p.highlights) + tags(p.tech) + linkRow(p.links) +
        '</div>';
    }
  });

  /* ---------------- experience selector (timeline) ---------------- */
  var expSel = makeSelector({
    listEl: document.getElementById('expList'),
    stageEl: document.getElementById('expStage'),
    rootEl: document.getElementById('expSelector'),
    data: EXPERIENCE,
    renderItem: function (x) {
      return '<li class="sel-item t-item"><span class="t-node"></span>' +
        '<span class="t-role">' + x.role + ' &middot; <b>' + x.org + '</b></span>' +
        '<span class="t-when">' + x.when + '</span></li>';
    },
    renderPreview: function (x) {
      return '<div class="card sel-card exp-card">' +
        '<h3 class="sel-title">' + x.role + '</h3>' +
        '<p class="sel-org">' + x.org + '</p>' +
        '<p class="sel-sub">' + x.when + ' &middot; ' + x.where + '</p>' +
        '<p class="exp-summary">' + x.summary + '</p>' +
        '<button class="open-cue" data-act="open" type="button">▸ OPEN ENTRY</button>' +
        '</div>';
    },
    renderDetail: function (x) {
      return '<button class="back-link" data-act="back" type="button">◀ BACK</button>' +
        '<div class="card detail">' +
        '<h3 class="detail-title">' + x.role + '</h3>' +
        '<p class="detail-org">' + x.org + ' &middot; ' + x.where + '</p>' +
        '<p class="detail-sub">' + x.when + '</p>' +
        bullets(x.bullets) + tags(x.tech) + linkRow(x.links) +
        '</div>';
    }
  });

  /* ---------------- main menu / boot ---------------- */
  function setSel(i) {
    selIndex = (i + items.length) % items.length;
    for (var k = 0; k < items.length; k++) items[k].classList.toggle('sel', k === selIndex);
  }

  function start() {
    if (started) return;
    started = true;
    boot.classList.add('leaving');
    setTimeout(function () { boot.style.display = 'none'; }, 520);
    app.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { app.classList.add('show'); });
    });
    document.body.classList.remove('section-open');
    setSel(0);
  }

  function openPanel(name) {
    var panel = panelByName(name);
    if (!panel) return;
    var wasPanel = app.classList.contains('panel-mode');
    app.classList.add('panel-mode');

    for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');
    void panel.offsetWidth;
    panel.classList.add('active');

    for (var j = 0; j < items.length; j++) {
      var on = items[j].getAttribute('data-panel') === name;
      items[j].classList.toggle('active', on);
      if (on) setSel(j);
    }
    activeName = name;
    document.body.classList.add('section-open');
    if (name === 'projects') projSel.reset();
    if (name === 'experience') expSel.reset();

    if (history.replaceState) history.replaceState(null, '', '#' + name);
    if (!wasPanel && content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closePanel() {
    app.classList.remove('panel-mode');
    for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');
    for (var j = 0; j < items.length; j++) items[j].classList.remove('active');
    activeName = null;
    document.body.classList.remove('section-open');
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (menu) menu.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------------- wiring ---------------- */
  startBtn.addEventListener('click', function (e) { e.stopPropagation(); start(); });
  boot.addEventListener('click', start);

  items.forEach(function (it, idx) {
    it.addEventListener('click', function () { openPanel(it.getAttribute('data-panel')); });
    it.addEventListener('mouseenter', function () { setSel(idx); });
    it.addEventListener('focus', function () { setSel(idx); });
  });
  backBtn.addEventListener('click', closePanel);
  brandHome.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (!started) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); }
      return;
    }
    var inPanel = app.classList.contains('panel-mode');

    // route arrows/enter/esc into the active sub-selector first
    if (inPanel && activeName === 'projects' && projSel.handleKey(e)) return;
    if (inPanel && activeName === 'experience' && expSel.handleKey(e)) return;

    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight':
        e.preventDefault(); setSel(selIndex + 1);
        if (inPanel) openPanel(items[selIndex].getAttribute('data-panel'));
        break;
      case 'ArrowUp': case 'ArrowLeft':
        e.preventDefault(); setSel(selIndex - 1);
        if (inPanel) openPanel(items[selIndex].getAttribute('data-panel'));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault(); openPanel(items[selIndex].getAttribute('data-panel'));
        break;
      case 'Escape':
      case 'Backspace':
        if (inPanel) { e.preventDefault(); closePanel(); }
        break;
      default:
        if (e.key >= '1' && e.key <= String(items.length)) {
          openPanel(items[parseInt(e.key, 10) - 1].getAttribute('data-panel'));
        }
    }
  });

  /* ---------------- deep links ---------------- */
  function applyHash() {
    var name = (location.hash || '').replace('#', '');
    if (name === 'menu') { start(); return; }
    if (panelByName(name)) { start(); openPanel(name); }
  }
  applyHash();
  window.addEventListener('hashchange', applyHash);
})();
