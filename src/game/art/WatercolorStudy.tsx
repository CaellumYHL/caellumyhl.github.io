import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox, useCursor } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  SRGBColorSpace,
} from 'three'

type Channels = [Float32Array, Float32Array, Float32Array]

interface WatercolorState {
  readonly width: number
  readonly height: number
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  readonly texture: CanvasTexture
  readonly paper: Float32Array
  wet: Float32Array
  wetNext: Float32Array
  suspended: Channels
  suspendedNext: Channels
  readonly deposited: Channels
  readonly image: ImageData
  elapsed: number
  paletteIndex: number
}

const pigments = [
  [0.16, 0.26, 0.56], // ultramarine
  [0.62, 0.16, 0.22], // alizarin
  [0.79, 0.53, 0.14], // yellow ochre
  [0.11, 0.42, 0.33], // viridian
] as const

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.max(minimum, Math.min(maximum, value))
}

function randomFrom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = Math.imul(1664525, value) + 1013904223
    return (value >>> 0) / 4294967296
  }
}

function addBloom(
  state: WatercolorState,
  u: number,
  v: number,
  pigmentIndex: number,
  intensity = 1,
) {
  const { width, height, wet, suspended, paper } = state
  const centerX = Math.round(clamp(u) * (width - 1))
  const centerY = Math.round((1 - clamp(v)) * (height - 1))
  const radius = Math.max(7, Math.round(width * (0.068 + intensity * 0.03)))
  const color = pigments[pigmentIndex % pigments.length]
  const absorption = color.map((channel) => (1 - channel) * 1.18)

  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    const y = centerY + offsetY
    if (y < 1 || y >= height - 1) continue
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      const x = centerX + offsetX
      if (x < 1 || x >= width - 1) continue
      const distance = Math.hypot(offsetX, offsetY) / radius
      if (distance >= 1) continue
      const index = y * width + x
      const feather = Math.pow(1 - distance, 1.65)
      const grain = 0.72 + paper[index] * 0.48
      wet[index] = clamp(wet[index] + feather * (0.68 + intensity * 0.24))
      for (let channel = 0; channel < 3; channel += 1) {
        suspended[channel][index] += absorption[channel] * feather * grain * 0.34 * intensity
      }
    }
  }
}

function renderWatercolor(state: WatercolorState) {
  const { width, height, paper, wet, suspended, deposited, image, context } = state
  const pixels = image.data
  for (let index = 0; index < width * height; index += 1) {
    const fiber = paper[index]
    const baseR = 241 - fiber * 17
    const baseG = 235 - fiber * 18
    const baseB = 219 - fiber * 16
    const redAbsorb = deposited[0][index] + suspended[0][index] * 0.58
    const greenAbsorb = deposited[1][index] + suspended[1][index] * 0.58
    const blueAbsorb = deposited[2][index] + suspended[2][index] * 0.58
    const wetDarken = 1 - wet[index] * 0.075
    const pixel = index * 4
    pixels[pixel] = clamp(baseR * Math.exp(-redAbsorb * 1.62) * wetDarken, 0, 255)
    pixels[pixel + 1] = clamp(baseG * Math.exp(-greenAbsorb * 1.62) * wetDarken, 0, 255)
    pixels[pixel + 2] = clamp(baseB * Math.exp(-blueAbsorb * 1.62) * wetDarken, 0, 255)
    pixels[pixel + 3] = 255
  }
  context.putImageData(image, 0, 0)
  state.texture.needsUpdate = true
}

function stepWatercolor(state: WatercolorState, time: number) {
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
          - (0.0015 + paper[index] * 0.0012),
      )
      wetNext[index] = nextWet

      const wetGradient = Math.abs(wet[left] - wet[right]) + Math.abs(wet[up] - wet[down])
      const edgeDeposit = clamp(wetGradient * 0.42, 0, 0.05)
      for (let channel = 0; channel < 3; channel += 1) {
        const pigment = state.suspended[channel]
        const pigmentNext = state.suspendedNext[channel]
        const averagePigment = (pigment[left] + pigment[right] + pigment[up] + pigment[down]) * 0.25
        const depositRate = (1 - nextWet) * 0.019 + edgeDeposit + paper[index] * 0.0026
        const deposit = pigment[index] * depositRate
        const resuspend = deposited[channel][index] * nextWet * 0.0007
        pigmentNext[index] = Math.max(
          0,
          pigment[index]
            + (averagePigment - pigment[index]) * (0.045 + nextWet * 0.11)
            + (pigment[source] - pigment[index]) * nextWet * 0.075
            - deposit
            + resuspend,
        )
        deposited[channel][index] = Math.max(0, deposited[channel][index] + deposit - resuspend)
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

function createWatercolorState(): WatercolorState {
  const width = 256
  const height = 168
  const count = width * height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create watercolor study')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping

  const random = randomFrom(1997)
  const paper = new Float32Array(count)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x
      const broad = Math.sin(x * 0.071) * Math.cos(y * 0.053) * 0.16
      const fiber = Math.sin(x * 0.82 + y * 0.09) * 0.08
      paper[index] = clamp(0.48 + broad + fiber + (random() - 0.5) * 0.34)
    }
  }

  const channels = (): Channels => [
    new Float32Array(count),
    new Float32Array(count),
    new Float32Array(count),
  ]
  const state: WatercolorState = {
    width,
    height,
    canvas,
    context,
    texture,
    paper,
    wet: new Float32Array(count),
    wetNext: new Float32Array(count),
    suspended: channels(),
    suspendedNext: channels(),
    deposited: channels(),
    image: context.createImageData(width, height),
    elapsed: 0,
    paletteIndex: 0,
  }

  addBloom(state, 0.26, 0.62, 0, 1.2)
  addBloom(state, 0.47, 0.44, 1, 1.05)
  addBloom(state, 0.68, 0.57, 2, 1.18)
  addBloom(state, 0.57, 0.72, 3, 0.92)
  addBloom(state, 0.34, 0.4, 2, 0.76)
  addBloom(state, 0.73, 0.36, 0, 0.82)
  for (let index = 0; index < 24; index += 1) stepWatercolor(state, index * 0.08)
  renderWatercolor(state)
  return state
}

function createCaptionTexture(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 160
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create watercolor caption')
  context.fillStyle = '#e8dfca'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#6d5946'
  context.lineWidth = 3
  context.strokeRect(7, 7, canvas.width - 14, canvas.height - 14)
  context.fillStyle = '#322e29'
  context.font = 'italic 56px Georgia, serif'
  context.fillText('Wet Paper, No. 01', 42, 74)
  context.fillStyle = '#675d51'
  context.font = '600 22px Arial, sans-serif'
  context.fillText('OPEN FULL-SCREEN STUDIO  ·  BRUSH / PIGMENT / WATER', 44, 119)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

interface WatercolorStudyProps {
  readonly reducedMotion: boolean
  readonly position?: [number, number, number]
  readonly rotation?: [number, number, number]
  readonly scale?: number
  readonly decorative?: boolean
  readonly onOpen?: () => void
}

export function WatercolorStudy({
  reducedMotion,
  position = [-7.15, 3.85, -12.34],
  rotation = [0, 0, 0],
  scale = 1,
  decorative = false,
  onOpen,
}: WatercolorStudyProps) {
  const state = useMemo(() => createWatercolorState(), [])
  const captionTexture = useMemo(() => createCaptionTexture(), [])
  const [hovered, setHovered] = useState(false)
  const dragElapsed = useRef(0)
  useCursor(hovered)

  useEffect(
    () => () => {
      state.texture.dispose()
      captionTexture.dispose()
    },
    [captionTexture, state],
  )

  useFrame((_, delta) => {
    state.elapsed += delta
    dragElapsed.current += delta
    const interval = reducedMotion ? 0.16 : 0.067
    if (state.elapsed < interval) return
    const step = Math.min(state.elapsed, 0.12)
    state.elapsed = 0
    stepWatercolor(state, performance.now() * 0.001)
    if (!reducedMotion || Math.floor(performance.now() / 160) % 2 === 0) renderWatercolor(state)
    void step
  })

  const paint = (event: ThreeEvent<PointerEvent>, force = false): void => {
    if (!event.uv || (!force && event.buttons !== 1) || (!force && dragElapsed.current < 0.045)) return
    event.stopPropagation()
    dragElapsed.current = 0
    addBloom(state, event.uv.x, event.uv.y, state.paletteIndex, force ? 1.08 : 0.55)
    if (force) state.paletteIndex = (state.paletteIndex + 1) % pigments.length
    renderWatercolor(state)
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[6.35, 4.34, 0.26]} radius={0.05} castShadow>
        <meshStandardMaterial color="#594333" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[5.98, 3.98, 0.29]} radius={0.035} position={[0, 0, 0.06]}>
        <meshStandardMaterial color="#d4bd8e" roughness={0.82} />
      </RoundedBox>
      <mesh
        position={[0, 0, 0.225]}
        onPointerDown={(event) => {
          if (onOpen) {
            event.stopPropagation()
            onOpen()
            return
          }
          paint(event, true)
        }}
        onPointerMove={(event) => {
          if (!onOpen) paint(event)
        }}
        onPointerEnter={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[5.62, 3.62]} />
        <meshBasicMaterial map={state.texture} toneMapped={false} />
      </mesh>
      {!decorative ? (
        <mesh position={[0, -2.46, 0.12]}>
          <planeGeometry args={[4.7, 0.73]} />
          <meshBasicMaterial map={captionTexture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  )
}
