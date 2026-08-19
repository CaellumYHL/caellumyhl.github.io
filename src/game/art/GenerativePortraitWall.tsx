import { RoundedBox, useCursor } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

function randomFrom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const washColors = [
  '#8aa6a0',
  '#d2a07c',
  '#8f9dad',
  '#b8a17c',
  '#9f8d9b',
  '#a6ad8b',
  '#b98777',
] as const

function drawPaper(context: CanvasRenderingContext2D, width: number, height: number, random: () => number) {
  context.fillStyle = '#eee8d9'
  context.fillRect(0, 0, width, height)

  context.lineCap = 'round'
  for (let index = 0; index < 720; index += 1) {
    const x = random() * width
    const y = random() * height
    const length = 5 + random() * 30
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + length, y + (random() - 0.5) * 3)
    context.strokeStyle = random() > 0.5
      ? `rgba(80, 63, 45, ${0.012 + random() * 0.025})`
      : `rgba(255, 255, 247, ${0.05 + random() * 0.08})`
    context.lineWidth = 0.5 + random() * 0.9
    context.stroke()
  }
}

function drawFace(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  random: () => number,
) {
  const wash = washColors[Math.floor(random() * washColors.length)]
  const headWidth = scale * (0.47 + random() * 0.18)
  const headHeight = scale * (0.57 + random() * 0.16)
  const tilt = (random() - 0.5) * 0.16

  context.save()
  context.translate(centerX, centerY)
  context.rotate(tilt)

  context.globalCompositeOperation = 'multiply'
  for (let layer = 0; layer < 8; layer += 1) {
    context.beginPath()
    context.ellipse(
      (random() - 0.5) * scale * 0.11,
      (random() - 0.5) * scale * 0.09,
      headWidth * (0.72 + random() * 0.28),
      headHeight * (0.72 + random() * 0.3),
      (random() - 0.5) * 0.28,
      0,
      Math.PI * 2,
    )
    context.fillStyle = `${wash}${Math.round((0.028 + random() * 0.025) * 255)
      .toString(16)
      .padStart(2, '0')}`
    context.fill()
  }
  context.globalCompositeOperation = 'source-over'

  const facePoints = 15
  context.beginPath()
  for (let point = 0; point <= facePoints; point += 1) {
    const angle = (point / facePoints) * Math.PI * 2 - Math.PI / 2
    const rough = 1 + (random() - 0.5) * 0.12
    const x = Math.cos(angle) * headWidth * rough
    const y = Math.sin(angle) * headHeight * rough
    if (point === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.strokeStyle = 'rgba(42, 39, 36, 0.76)'
  context.lineWidth = Math.max(1.3, scale * 0.012)
  context.stroke()

  const eyeY = -scale * (0.05 + random() * 0.04)
  const eyeSpread = scale * (0.16 + random() * 0.035)
  const leftEyeY = eyeY + (random() - 0.5) * scale * 0.05
  const rightEyeY = eyeY + (random() - 0.5) * scale * 0.05

  context.lineWidth = Math.max(1.2, scale * 0.011)
  context.strokeStyle = 'rgba(34, 33, 34, 0.86)'
  for (const [eyeX, y] of [[-eyeSpread, leftEyeY], [eyeSpread, rightEyeY]] as const) {
    context.beginPath()
    context.ellipse(eyeX, y, scale * (0.045 + random() * 0.025), scale * 0.022, (random() - 0.5) * 0.35, 0, Math.PI * 2)
    context.stroke()
    if (random() > 0.28) {
      context.beginPath()
      context.arc(eyeX + (random() - 0.5) * scale * 0.025, y, scale * 0.011, 0, Math.PI * 2)
      context.fillStyle = '#2d2b2a'
      context.fill()
    }
  }

  context.beginPath()
  context.moveTo((random() - 0.5) * scale * 0.035, -scale * 0.035)
  context.quadraticCurveTo(
    -scale * (0.03 + random() * 0.035),
    scale * 0.075,
    scale * (0.015 + random() * 0.055),
    scale * 0.13,
  )
  context.lineTo(scale * (random() * 0.045), scale * 0.145)
  context.stroke()

  const mouthY = scale * (0.22 + random() * 0.035)
  context.beginPath()
  context.moveTo(-scale * (0.095 + random() * 0.025), mouthY)
  context.quadraticCurveTo(
    0,
    mouthY + (random() - 0.44) * scale * 0.085,
    scale * (0.095 + random() * 0.035),
    mouthY + (random() - 0.5) * scale * 0.02,
  )
  context.stroke()

  const hairStyle = Math.floor(random() * 5)
  context.strokeStyle = 'rgba(41, 36, 34, 0.88)'
  context.fillStyle = 'rgba(45, 38, 34, 0.84)'
  context.lineWidth = Math.max(2, scale * 0.022)
  if (hairStyle === 0 || hairStyle === 1) {
    for (let strand = 0; strand < 8 + Math.floor(random() * 7); strand += 1) {
      const x = (strand / 12 - 0.5) * headWidth * 1.4
      context.beginPath()
      context.moveTo(x, -headHeight * 0.86)
      context.lineTo(x + (random() - 0.5) * scale * 0.12, -headHeight * (1.05 + random() * 0.34))
      context.stroke()
    }
  } else if (hairStyle === 2) {
    context.beginPath()
    context.ellipse(0, -headHeight * 0.94, headWidth * 0.6, scale * 0.13, 0, 0, Math.PI * 2)
    context.fill()
  } else if (hairStyle === 3) {
    context.beginPath()
    context.moveTo(-headWidth * 0.75, -headHeight * 0.62)
    context.quadraticCurveTo(0, -headHeight * 1.34, headWidth * 0.8, -headHeight * 0.68)
    context.lineTo(headWidth * 0.45, -headHeight * 0.92)
    context.quadraticCurveTo(0, -headHeight * 1.04, -headWidth * 0.5, -headHeight * 0.85)
    context.closePath()
    context.fill()
  }

  if (random() > 0.74) {
    context.beginPath()
    context.arc((random() - 0.5) * scale * 0.26, scale * (0.02 + random() * 0.24), scale * 0.014, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}

export function drawPortraitSheet(canvas: HTMLCanvasElement, seed: number): void {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create portrait study')
  const random = randomFrom(seed)
  drawPaper(context, canvas.width, canvas.height, random)

  const columns = 6
  const rows = 4
  const marginX = canvas.width * 0.062
  const marginTop = canvas.height * 0.09
  const cellWidth = (canvas.width - marginX * 2) / columns
  const cellHeight = (canvas.height - marginTop - canvas.height * 0.072) / rows
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      drawFace(
        context,
        marginX + cellWidth * (column + 0.5),
        marginTop + cellHeight * (row + 0.48),
        Math.min(cellWidth, cellHeight) * 0.72,
        random,
      )
    }
  }

  context.fillStyle = 'rgba(37, 35, 32, 0.62)'
  context.font = `600 ${Math.round(canvas.width * 0.015)}px Georgia, serif`
  context.textAlign = 'right'
  context.fillText(
    `GENERATIVE SHEET · SEED ${String(seed).padStart(3, '0')}`,
    canvas.width * 0.95,
    canvas.height * 0.955,
  )
}

function createPortraitTexture(seed: number): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 760
  drawPortraitSheet(canvas, seed)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function createCaptionTexture(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 160
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create portrait caption')
  context.fillStyle = '#e8dfca'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#6d5946'
  context.lineWidth = 3
  context.strokeRect(7, 7, canvas.width - 14, canvas.height - 14)
  context.fillStyle = '#322e29'
  context.font = 'italic 56px Georgia, serif'
  context.fillText('Naïve Faces', 42, 74)
  context.fillStyle = '#675d51'
  context.font = '600 22px Arial, sans-serif'
  context.fillText('OPEN FULL-SCREEN STUDY  ·  GENERATE / EXPORT', 44, 119)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

interface GenerativePortraitWallProps {
  readonly position?: [number, number, number]
  readonly rotation?: [number, number, number]
  readonly scale?: number
  readonly decorative?: boolean
  readonly onOpen?: () => void
}

export function GenerativePortraitWall({
  position = [7.15, 3.85, -12.34],
  rotation = [0, 0, 0],
  scale = 1,
  decorative = false,
  onOpen,
}: GenerativePortraitWallProps) {
  const [seed, setSeed] = useState(37)
  const [hovered, setHovered] = useState(false)
  const portraitTexture = useMemo(() => createPortraitTexture(seed), [seed])
  const captionTexture = useMemo(() => createCaptionTexture(), [])
  useCursor(hovered)

  useEffect(() => () => portraitTexture.dispose(), [portraitTexture])
  useEffect(() => () => captionTexture.dispose(), [captionTexture])

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
          event.stopPropagation()
          if (onOpen) {
            onOpen()
            return
          }
          setSeed((value) => (value * 73 + 19) % 997)
        }}
        onPointerEnter={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[5.62, 3.62]} />
        <meshBasicMaterial map={portraitTexture} toneMapped={false} />
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
