import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { drawPortraitSheet } from '../game/art/GenerativePortraitWall'

export type ArtStudioMode = 'watercolor' | 'faces'
type BrushKind = 'round' | 'wash' | 'dry' | 'splatter'
type Channels = [Float32Array, Float32Array, Float32Array]

interface ArtStudioProps {
  readonly initialMode: ArtStudioMode
  readonly onClose: () => void
}

interface WatercolorState {
  readonly width: number
  readonly height: number
  readonly context: CanvasRenderingContext2D
  readonly paper: Float32Array
  wet: Float32Array
  wetNext: Float32Array
  suspended: Channels
  suspendedNext: Channels
  readonly deposited: Channels
  readonly image: ImageData
  stamp: number
}

interface PaintSettings {
  color: string
  size: number
  water: number
  brush: BrushKind
}

const pigmentPalette = [
  { name: 'Ultramarine', color: '#315985' },
  { name: 'Alizarin', color: '#9a3f48' },
  { name: 'Yellow ochre', color: '#bd8437' },
  { name: 'Viridian', color: '#356a5a' },
  { name: 'Payne’s grey', color: '#394451' },
  { name: 'Burnt sienna', color: '#9b5e3f' },
] as const

const brushOptions: readonly { id: BrushKind; label: string; detail: string }[] = [
  { id: 'round', label: 'Round', detail: 'Controlled edge' },
  { id: 'wash', label: 'Wash', detail: 'More water, wider spread' },
  { id: 'dry', label: 'Dry brush', detail: 'Pigment catches on fibres' },
  { id: 'splatter', label: 'Splatter', detail: 'Scattered droplets' },
] as const

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.max(minimum, Math.min(maximum, value))
}

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 9283.17 + salt * 77.13) * 43758.5453
  return value - Math.floor(value)
}

function channels(count: number): Channels {
  return [new Float32Array(count), new Float32Array(count), new Float32Array(count)]
}

function createWatercolorState(canvas: HTMLCanvasElement): WatercolorState {
  canvas.width = 512
  canvas.height = 336
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to initialize watercolor canvas')
  const count = canvas.width * canvas.height
  const paper = new Float32Array(count)
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = y * canvas.width + x
      const broad = Math.sin(x * 0.037) * Math.cos(y * 0.031) * 0.16
      const fibre = Math.sin(x * 0.71 + y * 0.08) * 0.08
      paper[index] = clamp(0.48 + broad + fibre + (seeded(index, 12) - 0.5) * 0.34)
    }
  }
  return {
    width: canvas.width,
    height: canvas.height,
    context,
    paper,
    wet: new Float32Array(count),
    wetNext: new Float32Array(count),
    suspended: channels(count),
    suspendedNext: channels(count),
    deposited: channels(count),
    image: context.createImageData(canvas.width, canvas.height),
    stamp: 0,
  }
}

function absorptionFromHex(hex: string): readonly [number, number, number] {
  const parsed = Number.parseInt(hex.slice(1), 16)
  const red = (parsed >> 16) & 255
  const green = (parsed >> 8) & 255
  const blue = parsed & 255
  return [
    (1 - red / 255) * 1.18,
    (1 - green / 255) * 1.18,
    (1 - blue / 255) * 1.18,
  ]
}

function stampRound(
  state: WatercolorState,
  u: number,
  v: number,
  color: string,
  radius: number,
  water: number,
  pigment: number,
  dry: boolean,
): void {
  const centerX = Math.round(clamp(u) * (state.width - 1))
  const centerY = Math.round(clamp(v) * (state.height - 1))
  const absorption = absorptionFromHex(color)
  const boundedRadius = Math.max(3, Math.round(radius))

  for (let offsetY = -boundedRadius; offsetY <= boundedRadius; offsetY += 1) {
    const y = centerY + offsetY
    if (y < 1 || y >= state.height - 1) continue
    for (let offsetX = -boundedRadius; offsetX <= boundedRadius; offsetX += 1) {
      const x = centerX + offsetX
      if (x < 1 || x >= state.width - 1) continue
      const distance = Math.hypot(offsetX, offsetY) / boundedRadius
      if (distance >= 1) continue
      const index = y * state.width + x
      const feather = Math.pow(1 - distance, dry ? 0.7 : 1.72)
      const grain = 0.68 + state.paper[index] * 0.56
      if (dry && seeded(index + state.stamp * 101, 6) < 0.38 + state.paper[index] * 0.18) continue
      state.wet[index] = clamp(state.wet[index] + feather * water)
      for (let channel = 0; channel < 3; channel += 1) {
        const amount = absorption[channel] * feather * grain * pigment
        if (dry) state.deposited[channel][index] += amount
        else state.suspended[channel][index] += amount
      }
    }
  }
  state.stamp += 1
}

function paintWatercolor(
  state: WatercolorState,
  u: number,
  v: number,
  settings: PaintSettings,
): void {
  const baseRadius = settings.size * (state.width / 512)
  if (settings.brush === 'splatter') {
    for (let drop = 0; drop < 14; drop += 1) {
      const angle = seeded(state.stamp + drop, 19) * Math.PI * 2
      const spread = seeded(state.stamp + drop, 23) * baseRadius * 2.3
      const dropU = u + (Math.cos(angle) * spread) / state.width
      const dropV = v + (Math.sin(angle) * spread) / state.height
      const radius = baseRadius * (0.1 + seeded(state.stamp + drop, 29) * 0.24)
      stampRound(
        state,
        dropU,
        dropV,
        settings.color,
        radius,
        settings.water * 0.62,
        0.27,
        false,
      )
    }
    return
  }

  const isWash = settings.brush === 'wash'
  const isDry = settings.brush === 'dry'
  stampRound(
    state,
    u,
    v,
    settings.color,
    baseRadius * (isWash ? 1.65 : isDry ? 0.78 : 1),
    settings.water * (isWash ? 1.22 : isDry ? 0.09 : 0.72),
    isWash ? 0.12 : isDry ? 0.18 : 0.24,
    isDry,
  )
}

function stepWatercolor(state: WatercolorState, time: number): void {
  const { width, height, paper, deposited } = state
  const wet = state.wet
  const wetNext = state.wetNext

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      const left = index - 1
      const right = index + 1
      const up = index - width
      const down = index + width
      const averageWet = (wet[left] + wet[right] + wet[up] + wet[down]) * 0.25
      const paperSlopeX = paper[right] - paper[left]
      const paperSlopeY = paper[down] - paper[up]
      const curlX = Math.sin(y * 0.137 + time * 0.38) * 0.36
      const curlY = Math.cos(x * 0.113 - time * 0.31) * 0.28
      const sourceX = clamp(Math.round(x + (paperSlopeX * 5 + curlX) * wet[index]), 1, width - 2)
      const sourceY = clamp(Math.round(y + (paperSlopeY * 5 + curlY) * wet[index]), 1, height - 2)
      const source = sourceY * width + sourceX
      const nextWet = clamp(
        wet[index]
          + (averageWet - wet[index]) * 0.19
          + (wet[source] - wet[index]) * 0.08
          - (0.0012 + paper[index] * 0.0009),
      )
      wetNext[index] = nextWet

      const wetGradient = Math.abs(wet[left] - wet[right]) + Math.abs(wet[up] - wet[down])
      const edgeDeposit = clamp(wetGradient * 0.42, 0, 0.05)
      for (let channel = 0; channel < 3; channel += 1) {
        const pigment = state.suspended[channel]
        const pigmentNext = state.suspendedNext[channel]
        const averagePigment = (pigment[left] + pigment[right] + pigment[up] + pigment[down]) * 0.25
        const depositRate = (1 - nextWet) * 0.018 + edgeDeposit + paper[index] * 0.0023
        const deposit = pigment[index] * depositRate
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

  state.wet = wetNext
  state.wetNext = wet
  for (let channel = 0; channel < 3; channel += 1) {
    const current = state.suspended[channel]
    state.suspended[channel] = state.suspendedNext[channel]
    state.suspendedNext[channel] = current
  }
}

function renderWatercolor(state: WatercolorState): void {
  const pixels = state.image.data
  const count = state.width * state.height
  for (let index = 0; index < count; index += 1) {
    const fibre = state.paper[index]
    const baseR = 243 - fibre * 16
    const baseG = 237 - fibre * 17
    const baseB = 222 - fibre * 15
    const redAbsorb = state.deposited[0][index] + state.suspended[0][index] * 0.58
    const greenAbsorb = state.deposited[1][index] + state.suspended[1][index] * 0.58
    const blueAbsorb = state.deposited[2][index] + state.suspended[2][index] * 0.58
    const wetDarken = 1 - state.wet[index] * 0.075
    const pixel = index * 4
    pixels[pixel] = clamp(baseR * Math.exp(-redAbsorb * 1.62) * wetDarken, 0, 255)
    pixels[pixel + 1] = clamp(baseG * Math.exp(-greenAbsorb * 1.62) * wetDarken, 0, 255)
    pixels[pixel + 2] = clamp(baseB * Math.exp(-blueAbsorb * 1.62) * wetDarken, 0, 255)
    pixels[pixel + 3] = 255
  }
  state.context.putImageData(state.image, 0, 0)
}

function clearWatercolor(state: WatercolorState, seedSamples = false): void {
  state.wet.fill(0)
  state.wetNext.fill(0)
  state.suspended.forEach((channel) => channel.fill(0))
  state.suspendedNext.forEach((channel) => channel.fill(0))
  state.deposited.forEach((channel) => channel.fill(0))
  if (seedSamples) {
    const samples = [
      [0.3, 0.42, '#315985'],
      [0.47, 0.57, '#9a3f48'],
      [0.64, 0.39, '#bd8437'],
      [0.7, 0.62, '#356a5a'],
    ] as const
    samples.forEach(([u, v, color]) => {
      stampRound(state, u, v, color, state.width * 0.082, 1.02, 0.26, false)
    })
    for (let index = 0; index < 10; index += 1) stepWatercolor(state, index * 0.08)
  }
  renderWatercolor(state)
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function WatercolorWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<WatercolorState | null>(null)
  const activeUntilRef = useRef(0)
  const settingsRef = useRef<PaintSettings>({
    color: pigmentPalette[0].color,
    size: 34,
    water: 1,
    brush: 'round',
  })
  const [color, setColor] = useState<string>(pigmentPalette[0].color)
  const [size, setSize] = useState(34)
  const [water, setWater] = useState(1)
  const [brush, setBrush] = useState<BrushKind>('round')

  useEffect(() => {
    settingsRef.current = { color, size, water, brush }
  }, [brush, color, size, water])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const state = createWatercolorState(canvas)
    stateRef.current = state
    clearWatercolor(state, true)
    activeUntilRef.current = performance.now() + 9000
    let frame = 0
    let previousStep = performance.now()
    const animate = (now: number): void => {
      if (now < activeUntilRef.current && now - previousStep > 78) {
        stepWatercolor(state, now * 0.001)
        renderWatercolor(state)
        previousStep = now
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const paint = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    const state = stateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const bounds = canvas.getBoundingClientRect()
    paintWatercolor(
      state,
      (event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height,
      settingsRef.current,
    )
    activeUntilRef.current = performance.now() + 8000
    renderWatercolor(state)
  }

  return (
    <div className="art-workspace art-workspace--watercolor">
      <aside className="art-tools" aria-label="Watercolor tools">
        <section>
          <header><span>01</span><h3>Pigment</h3></header>
          <div className="pigment-swatches">
            {pigmentPalette.map((pigment) => (
              <button
                key={pigment.color}
                className={color === pigment.color ? 'is-selected' : undefined}
                style={{ '--pigment': pigment.color } as CSSProperties}
                onClick={() => setColor(pigment.color)}
                aria-label={pigment.name}
                title={pigment.name}
              />
            ))}
          </div>
          <label className="color-input">
            <span>Custom colour</span>
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
        </section>

        <section>
          <header><span>02</span><h3>Brush</h3></header>
          <div className="brush-options">
            {brushOptions.map((option) => (
              <button
                key={option.id}
                className={brush === option.id ? 'is-selected' : undefined}
                onClick={() => setBrush(option.id)}
              >
                <b>{option.label}</b>
                <small>{option.detail}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="art-sliders">
          <header><span>03</span><h3>Stroke</h3></header>
          <label>
            <span>Size <b>{size}px</b></span>
            <input type="range" min="8" max="78" value={size} onChange={(event) => setSize(Number(event.target.value))} />
          </label>
          <label>
            <span>Water <b>{Math.round(water * 100)}%</b></span>
            <input type="range" min="0.35" max="1.35" step="0.05" value={water} onChange={(event) => setWater(Number(event.target.value))} />
          </label>
        </section>

        <div className="art-tool-actions">
          <button onClick={() => {
            if (!stateRef.current) return
            activeUntilRef.current = 0
            clearWatercolor(stateRef.current)
          }}>Clear paper</button>
          <button onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, 'caellum-watercolor.png')}>Export PNG</button>
        </div>
      </aside>

      <section className="art-canvas-stage">
        <div className="art-canvas-stage__heading">
          <span>
            <small>INTERACTIVE WATERCOLOR</small>
            <b>Drag directly on the paper</b>
          </span>
          <p>Water diffuses suspended pigment; the paper field catches it as it dries.</p>
        </div>
        <div className="art-paper-frame">
          <canvas
            ref={canvasRef}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              paint(event)
            }}
            onPointerMove={(event) => {
              if (event.buttons === 1) paint(event)
            }}
            aria-label="Interactive watercolor paper"
          />
        </div>
      </section>
    </div>
  )
}

function FaceWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [seed, setSeed] = useState(37)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 1600
    canvas.height = 1000
    drawPortraitSheet(canvas, seed)
  }, [seed])

  return (
    <div className="art-workspace art-workspace--faces">
      <aside className="art-tools art-tools--faces">
        <section>
          <header><span>01</span><h3>Generation</h3></header>
          <p>
            Each sheet is drawn from seeded JavaScript primitives: imperfect contours,
            asymmetric features, paper grain, and translucent washes.
          </p>
        </section>
        <dl className="face-seed">
          <div><dt>Current seed</dt><dd>{String(seed).padStart(3, '0')}</dd></div>
          <div><dt>Faces</dt><dd>24</dd></div>
          <div><dt>Medium</dt><dd>Canvas 2D</dd></div>
        </dl>
        <div className="art-tool-actions">
          <button onClick={() => setSeed((value) => (value * 73 + 19) % 997)}>Generate new sheet</button>
          <button onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, `naive-faces-${seed}.png`)}>Export PNG</button>
        </div>
      </aside>
      <section className="art-canvas-stage">
        <div className="art-canvas-stage__heading">
          <span>
            <small>GENERATIVE JAVASCRIPT DRAWING</small>
            <b>Naïve Faces</b>
          </span>
          <p>A sharp full-size rendering of the study shown on the gallery wall.</p>
        </div>
        <div className="art-paper-frame art-paper-frame--faces">
          <canvas ref={canvasRef} aria-label="Generated sheet of naïve faces" />
        </div>
      </section>
    </div>
  )
}

export function ArtStudio({ initialMode, onClose }: ArtStudioProps) {
  const [mode, setMode] = useState(initialMode)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => closeRef.current?.focus(), [])

  return (
    <section className="art-studio" role="dialog" aria-modal="true" aria-labelledby="art-studio-title">
      <header className="art-studio__header">
        <span className="art-studio__mark">CYH</span>
        <span>
          <small>INTERACTIVE STUDIES</small>
          <b id="art-studio-title">Code, pigment, and paper</b>
        </span>
        <nav aria-label="Choose a study">
          <button className={mode === 'watercolor' ? 'is-active' : undefined} onClick={() => setMode('watercolor')}>
            Watercolor
          </button>
          <button className={mode === 'faces' ? 'is-active' : undefined} onClick={() => setMode('faces')}>
            Naïve Faces
          </button>
        </nav>
        <button ref={closeRef} className="art-studio__close" onClick={onClose}>
          Return to room <kbd>ESC</kbd>
        </button>
      </header>

      {mode === 'watercolor' ? <WatercolorWorkspace /> : <FaceWorkspace />}

      <footer className="art-studio__footer">
        <span>Runs locally in your browser</span>
        <a href="https://grail.cs.washington.edu/projects/watercolor/" target="_blank" rel="noreferrer">
          Watercolor model reference: Curtis et al., SIGGRAPH 1997 ↗
        </a>
      </footer>
    </section>
  )
}
