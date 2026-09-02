/* main.js — the facts of the portfolio, and the order of the pages in the
   book. Every string below is lettered by hand at load. */
'use strict'

;(function () {
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  var now = new Date()
  var shortDate = now.getDate() + ' ' + MONTHS[now.getMonth()]
  var slashDate = String(now.getDate()).padStart(2, '0') + '/'
    + String(now.getMonth() + 1).padStart(2, '0') + '/'
    + String(now.getFullYear()).slice(2)

  var DATA = {
    cover: {
      date: slashDate,
      subtitle: 'CS AT THE UNIVERSITY OF TORONTO · SOFTWARE ENGINEER AT CHATFORCE',
      stationery: 'YHL MILLING CO. · FINE PAPERS · TORONTO',
      links: [
        { label: 'GITHUB ↗', href: 'https://github.com/CaellumYHL', title: 'GitHub — CaellumYHL' },
        { label: 'LINKEDIN ↗', href: 'https://www.linkedin.com/in/caellum-yip-hoi-lee-29242b30b', title: 'LinkedIn — Caellum Yip Hoi-Lee' },
        { label: 'EMAIL', href: 'mailto:cyiphoilee@mail.utoronto.ca', title: 'Email Caellum' },
        { label: 'RESUME (PDF)', href: 'Resume_Latex.pdf', title: 'Résumé PDF' },
      ],
    },

    faces: { date: shortDate },

    room: { title: 'DREAM DUMP NO. 1', date: shortDate },

    court: { title: 'DREAM DUMP NO. 2', date: shortDate },

    adam: { title: 'THE CREATION OF ADAM RENDITION', note: '(MY FAVOURITE ART)', date: shortDate },

    resume: {
      date: shortDate,
      href: 'Resume_Latex.pdf',
      openLabel: 'OPEN THE PDF ↗',
      openTitle: 'Open the résumé PDF',
      note: 'THE REAL ONE, TYPESET IN LATEX',
    },

    work: {
      date: shortDate,
      projects: [
        {
          seed: 2100,
          doodle: 'scissors',
          accent: '#a94750',
          title: 'PAPER CUTS',
          date: 'CAL HACKS · JUNE 2026 · 1ST OVERALL & BEST UI/UX',
          shortDate: 'CAL HACKS · 2026',
          metric: '1ST OF 1,000+',
          line: 'A REAL-TIME GAME ENGINE THAT TURNS A HAND-DRAWN SKETCH INTO A PLAYABLE ASSET AND MECHANIC IN LESS THAN A SECOND',
          bullets: [
            'TRAINED AN SDXL DIFFUSION MODEL ON AWS TRAINIUM AND PAIRED IT WITH A CASCADING CNN/VLM PLUS REDIS HNSW VECTOR MEMORY',
            'BUILT MOOSE, A LORA-TUNED MODEL THAT MAPS DRAWINGS TO SAFE, PLAYABLE MECHANICS WITH LATENCY UNDER 500 MS',
          ],
          tech: 'PYTHON · PYTORCH · FASTAPI · REDIS · AWS TRAINIUM · JAVASCRIPT',
          href: 'https://devpost.com/software/paper-cuts',
          linkNote: 'OPEN ON DEVPOST',
        },
        {
          seed: 2200,
          doodle: 'ensemble',
          accent: '#655184',
          title: 'ENSEMBLE',
          date: 'HACK THE SIX · JULY 2026 · TOP 5 OVERALL',
          shortDate: 'HACK THE SIX · 2026',
          metric: 'TOP 5',
          line: 'AN AGENTIC CONDUCTING SYSTEM THAT TURNS PHYSICAL GESTURES INTO MUSICAL INTENT AND KEEPS A ROOM OF CONNECTED DEVICES IN SYNC',
          bullets: [
            'A QNX RASPBERRY PI AND ARDUINO UNO R4 CONDUCTING WAND RUNS TINYML GESTURE RECOGNITION AND BROADCASTS INTENT OVER WEBSOCKETS',
            'FINE-TUNED A REAL-TIME QWEN LORA ON A FIREWORKS H200 WITH SFT AND GRPO — IT COMPOSES NEW BARS AT 453 MS LATENCY',
          ],
          tech: 'PYTHON · QNX · RASPBERRY PI · WEBSOCKETS · QWEN LORA · WEB AUDIO API',
          href: 'https://devpost.com/software/ensemble-jbgqrd',
          linkNote: 'OPEN ON DEVPOST',
        },
        {
          seed: 2300,
          doodle: 'octopus',
          accent: '#bd8332',
          title: 'AUCTOPUS',
          date: 'SOON HACKATHON · MAY 2026 · 2 TRACK FIRSTS',
          shortDate: 'SOON · 2026',
          metric: '2 FIRSTS',
          line: 'AN AUTOMATED AI PRODUCT-VALIDATION PIPELINE THAT RESEARCHES, PROTOTYPES, SIMULATES AUDIENCES, AND DELIVERS 3D AR CONCEPTS',
          bullets: [
            'ORCHESTRATED GEMINI 2.5 PRO, VEO 2, NEO4J, AND A NEXT.JS SSE EXECUTION CHAIN INTO AN END-TO-END VALIDATION WORKFLOW',
            'AUTOMATED MESHY 3D AR GENERATION AND DELIVERY THROUGH THE CLOUDINARY CDN, WITH COMPOSIO ANALYTICS AND POLARITY REVIEW',
          ],
          tech: 'NEXT.JS · GEMINI 2.5 PRO · VEO 2 · NEO4J · CLOUDINARY',
          href: 'https://devpost.com/software/auctopus',
          linkNote: 'OPEN ON DEVPOST',
        },
        {
          seed: 2400,
          doodle: 'rocket',
          accent: '#4e7b8b',
          title: 'TWIN UNIVERSE',
          date: 'BRONZE BAT STUDIO · 2023 — TODAY',
          shortDate: 'ROBLOX · 2023 —',
          metric: '2.8M+ VISITS',
          line: 'A ROBLOX SPACEFLIGHT GAME FEATURING ROCKET LAUNCHES, SPACECRAFT PROGRESSION, AND MULTIPLAYER MISSIONS',
          bullets: [
            'DESIGNED AND BUILT INTERACTIVE ENVIRONMENTS, ROCKET LAUNCH MECHANICS, AND PLAYER PROGRESSION IN LUA',
            'RELEASED THROUGH BRONZE BAT STUDIO — MORE THAN 2.8 MILLION PLAYER VISITS ON ROBLOX',
          ],
          tech: 'LUA · ROBLOX STUDIO · MULTIPLAYER SYSTEMS · GAME DESIGN',
          href: 'https://www.roblox.com/games/4818610549/Twin-Universe-Space-Travel-RP-Rocket-Simulator',
          linkNote: 'PLAY ON ROBLOX',
        },
      ],
    },

    experience: {
      date: shortDate,
      rows: [
        {
          org: 'CHATFORCE',
          role: 'SOFTWARE ENGINEER',
          period: 'FEB 2026 — TODAY',
          bullets: [
            'OVERHAULED A THREE.JS AGENTIC HARNESS — ARCHITECTURE, MCP, AND TOOL CALLS FOR A VISION-DRIVEN MULTI-AGENT SYSTEM — LIFTING GAME PUBLICATION RATE 20%',
            'DEVELOPED FASTAPI/REDIS RATE-LIMITING AND SERVER-AUTHORITATIVE MULTIPLAYER SUPPORTING 5,000+ USERS · HELPED DRIVE USER COUNT UP OVER 900%',
            'BUILT A RUST PIXEL-ART UPSCALER WITH FUSED-ARGMAX VOTERS, SCORING 77% ON PIXEL-BENCH',
          ],
        },
        {
          org: 'U OF T BLUEPRINT',
          role: 'SOFTWARE ENGINEER & PROJECT LEAD',
          period: 'SEP 2025 — MAY 2026',
          bullets: [
            'LEADING A TEAM OF 10 DEVELOPERS BUILDING SOFTWARE FOR TWO NONPROFIT ORGANIZATIONS',
            'BUILT JWT AUTHENTICATION, AN ADMIN DASHBOARD, AND CSV DATA MANAGEMENT WITH DJANGO REST AND REACT FOR THE MUSEUM OF ART AND DIGITAL ENTERTAINMENT',
          ],
        },
        {
          org: 'BRONZE BAT STUDIO',
          role: 'OWNER & SOFTWARE LEAD',
          period: 'AUG 2023 — TODAY',
          bullets: [
            'PUBLISHED 7 TITLES ACROSS STEAM AND ROBLOX — OVER 3 MILLION PLAYS AND $2,000 IN REVENUE',
            'DIRECT AN INDIE GAME STUDIO — MECHANICS, PHYSICS ALGORITHMS, AND NETWORKING IN LUA AND C#',
          ],
        },
        {
          org: 'UNIVERSITY OF TORONTO',
          role: 'HONOURS BSC, COMPUTER SCIENCE',
          period: 'FEB 2025 — APR 2029',
          bullets: [
            'CUMULATIVE GPA 3.94 / 4.0',
          ],
        },
      ],
    },

    washes: {
      title: 'SKILLS',
      date: shortDate,
      margin: '2 CYCLES X 70 DIVISIONS · MADE IN CANADA',
      groups: [
        { label: 'LANGUAGES', items: ['PYTHON', 'JAVA', 'C++', 'C#', 'TS / JS', 'SQL', 'LUA'] },
        { label: 'FRAMEWORKS', items: ['REACT', 'NEXT.JS', 'DJANGO', 'FASTAPI', 'RN'] },
        { label: 'AI / ML', items: ['PYTORCH', 'LANGCHAIN', 'HF', 'RAG', 'SDXL'] },
        { label: 'INFRASTRUCTURE', items: ['LINUX', 'GIT', 'DOCKER', 'AWS', 'POSTGRES', 'REDIS', 'NEO4J', 'WS'] },
      ],
    },

    ledger: {
      date: shortDate,
      sourceLabel: 'SOURCE ON GITHUB ↗',
      sourceHref: 'https://github.com/CaellumYHL/caellumyhl.github.io',
      sourceTitle: 'Source of this site on GitHub',
    },
  }

  /* A favicon, drawn like everything else. */
  function drawFavicon() {
    var canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    var context = canvas.getContext('2d')
    SKETCH.plainPaper(context, 64, 64, { seed: 991, stains: 0 })
    SKETCH.faces.drawFace(context, 32, 34, 52, 412)
    document.querySelectorAll('link[rel="icon"]').forEach(function (old) { old.remove() })
    var link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = canvas.toDataURL('image/png')
    document.head.appendChild(link)
  }

  function start() {
    SKETCH.grove.environment()
    drawFavicon()
    SKETCH.ledger.record()

    var page = document.getElementById('page')
    var holder = document.createElement('div')
    holder.className = 'book'
    page.appendChild(holder)

    SKETCH.bookCreate(holder, [
      { id: 'cover', tab: 'COVER', spec: SKETCH.plates.cover(DATA.cover) },
      { id: 'experience', tab: 'CV', spec: SKETCH.plates.experience(DATA.experience) },
      { id: 'work', tab: 'WORK', spec: SKETCH.plates.work(DATA.work) },
      { id: 'washes', tab: 'SKILLS', spec: SKETCH.plates.washes(DATA.washes) },
      { id: 'faces', tab: 'FACES', spec: SKETCH.plates.faces(DATA.faces) },
      { id: 'paint', tab: 'PAINT', spec: SKETCH.watercolor.spec() },
      { id: 'room', tab: 'ART', spec: SKETCH.art.room(DATA.room) },
      { id: 'court', tab: 'ART', spec: SKETCH.art.court(DATA.court) },
      { id: 'adam', tab: 'ART', spec: SKETCH.art.adam(DATA.adam) },
      { id: 'resume', tab: 'RESUME', spec: SKETCH.plates.resume(DATA.resume) },
      { id: 'ledger', tab: 'END', spec: SKETCH.ledger.spec(DATA.ledger) },
    ])
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }
})()
