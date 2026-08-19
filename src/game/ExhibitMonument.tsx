import { RoundedBox, useCursor, useTexture } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import {
  CanvasTexture,
  DoubleSide,
  SRGBColorSpace,
  Texture,
} from 'three'
import type { Exhibit } from '../data/portfolio'

interface ExhibitMonumentProps {
  readonly exhibit: Exhibit
  readonly nearby: boolean
  readonly tracked: boolean
  readonly reducedMotion: boolean
  readonly onOpen: (id: Exhibit['id']) => void
}

function prepareCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create exhibit artwork')
  context.fillStyle = '#eee6d6'
  context.fillRect(0, 0, width, height)

  for (let index = 0; index < 360; index += 1) {
    const x = (Math.sin(index * 91.72) * 0.5 + 0.5) * width
    const y = (Math.sin(index * 37.19 + 1.8) * 0.5 + 0.5) * height
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 8 + (index % 31), y + ((index % 5) - 2) * 0.6)
    context.strokeStyle = index % 2
      ? 'rgba(72, 57, 43, 0.028)'
      : 'rgba(255, 253, 244, 0.13)'
    context.lineWidth = 1
    context.stroke()
  }
  return { canvas, context }
}

function finishTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maximumWidth: number,
  startSize: number,
  family: string,
  weight = '700',
): number {
  let size = startSize
  context.font = `${weight} ${size}px ${family}`
  while (context.measureText(text).width > maximumWidth && size > 24) {
    size -= 2
    context.font = `${weight} ${size}px ${family}`
  }
  return size
}

function createProjectLabel(exhibit: Exhibit): CanvasTexture {
  const { canvas, context } = prepareCanvas(1200, 300)
  context.fillStyle = exhibit.accent
  context.fillRect(0, 0, 16, 300)
  context.fillRect(52, 58, 112, 4)

  context.fillStyle = 'rgba(59, 50, 43, .62)'
  context.font = '700 25px Arial, sans-serif'
  context.fillText('PROJECT', 52, 43)

  fitText(context, exhibit.title, 665, 75, 'Georgia, serif', 'italic 700')
  context.fillStyle = '#302b27'
  context.fillText(exhibit.title, 52, 151)

  context.fillStyle = 'rgba(63, 53, 45, .7)'
  fitText(context, exhibit.eyebrow.toUpperCase(), 700, 25, 'Arial, sans-serif', '600')
  context.fillText(exhibit.eyebrow.toUpperCase(), 53, 197)

  context.fillStyle = exhibit.accent
  context.font = '700 37px Arial, sans-serif'
  context.textAlign = 'right'
  context.fillText(exhibit.metric.toUpperCase(), 1138, 105)
  context.fillStyle = 'rgba(57, 48, 41, .72)'
  context.font = '600 20px Arial, sans-serif'
  context.fillText(exhibit.metricLabel.toUpperCase(), 1138, 140)

  context.strokeStyle = 'rgba(75, 59, 45, .24)'
  context.beginPath()
  context.moveTo(52, 229)
  context.lineTo(1138, 229)
  context.stroke()
  context.fillStyle = '#4f443b'
  context.font = '700 22px Arial, sans-serif'
  context.fillText('VIEW PROJECT  →', 1138, 269)
  context.strokeStyle = 'rgba(72, 56, 42, .55)'
  context.lineWidth = 3
  context.strokeRect(2, 2, 1196, 296)
  return finishTexture(canvas)
}

function createEnsembleArtwork(accent: string): CanvasTexture {
  const { canvas, context } = prepareCanvas(1200, 720)
  const washes = [accent, '#446c80', '#b88447', '#8f4f59']
  context.globalCompositeOperation = 'multiply'
  washes.forEach((color, index) => {
    const x = 235 + index * 245
    const y = 280 + Math.sin(index * 2.4) * 95
    const gradient = context.createRadialGradient(x, y, 20, x, y, 210)
    gradient.addColorStop(0, `${color}88`)
    gradient.addColorStop(0.58, `${color}32`)
    gradient.addColorStop(1, `${color}00`)
    context.fillStyle = gradient
    context.fillRect(x - 230, y - 230, 460, 460)
  })
  context.globalCompositeOperation = 'source-over'

  context.strokeStyle = 'rgba(50, 43, 39, .35)'
  context.lineWidth = 2
  for (let line = 0; line < 5; line += 1) {
    const y = 252 + line * 34
    context.beginPath()
    context.moveTo(88, y)
    context.bezierCurveTo(340, y - 8, 705, y + 11, 1115, y)
    context.stroke()
  }

  const nodes = [
    [210, 335], [390, 230], [585, 365], [775, 218], [980, 340],
  ] as const
  context.lineCap = 'round'
  nodes.forEach(([x, y], index) => {
    if (index < nodes.length - 1) {
      const [nextX, nextY] = nodes[index + 1]
      context.beginPath()
      context.moveTo(x, y)
      context.bezierCurveTo(x + 72, y - 120, nextX - 70, nextY + 120, nextX, nextY)
      context.strokeStyle = `${washes[index % washes.length]}aa`
      context.lineWidth = 8
      context.stroke()
    }
    context.beginPath()
    context.arc(x, y, 28 + (index % 2) * 9, 0, Math.PI * 2)
    context.fillStyle = washes[index % washes.length]
    context.fill()
    context.strokeStyle = '#efe5d2'
    context.lineWidth = 7
    context.stroke()
  })

  context.save()
  context.translate(596, 350)
  context.rotate(-0.52)
  context.fillStyle = '#4a3f37'
  context.fillRect(-9, -255, 18, 510)
  context.fillStyle = '#b9884d'
  context.beginPath()
  context.moveTo(0, -294)
  context.lineTo(-18, -247)
  context.lineTo(18, -247)
  context.closePath()
  context.fill()
  context.restore()

  context.fillStyle = '#352f2b'
  context.font = 'italic 700 72px Georgia, serif'
  context.fillText('Ensemble', 68, 104)
  context.fillStyle = 'rgba(54, 47, 42, .63)'
  context.font = '600 23px Arial, sans-serif'
  context.fillText('GESTURE → MUSICAL INTENT → SYNCHRONIZED DEVICES', 72, 145)
  return finishTexture(canvas)
}

function createExperienceBoard(exhibit: Exhibit): CanvasTexture {
  const { canvas, context } = prepareCanvas(1600, 880)
  context.fillStyle = exhibit.accent
  context.fillRect(0, 0, 18, 880)
  context.fillStyle = 'rgba(58, 49, 42, .62)'
  context.font = '700 27px Arial, sans-serif'
  context.fillText('PROFESSIONAL EXPERIENCE', 62, 61)
  context.fillStyle = '#302b27'
  context.font = 'italic 700 88px Georgia, serif'
  context.fillText('Work Experience', 60, 157)
  context.fillStyle = 'rgba(58, 49, 42, .68)'
  context.font = '600 24px Arial, sans-serif'
  context.fillText('OPEN THE BOARD TO READ THE FULL RECORD', 64, 204)

  exhibit.timeline?.forEach((entry, index) => {
    const y = 290 + index * 180
    context.fillStyle = exhibit.accent
    context.font = '700 22px Arial, sans-serif'
    context.fillText(`0${index + 1}`, 64, y)
    context.fillStyle = '#302b27'
    context.font = '700 39px Arial, sans-serif'
    context.fillText(entry.role, 132, y)
    context.fillStyle = 'rgba(52, 45, 39, .78)'
    context.font = '600 26px Arial, sans-serif'
    context.fillText(entry.organization, 132, y + 42)
    context.textAlign = 'right'
    context.font = '600 23px Arial, sans-serif'
    context.fillText(entry.period.toUpperCase(), 1528, y)
    context.fillStyle = 'rgba(65, 54, 46, .56)'
    context.fillText(entry.location.toUpperCase(), 1528, y + 40)
    context.textAlign = 'left'
    context.strokeStyle = 'rgba(70, 56, 44, .18)'
    context.beginPath()
    context.moveTo(64, y + 105)
    context.lineTo(1528, y + 105)
    context.stroke()
  })
  context.fillStyle = '#4f443b'
  context.font = '700 22px Arial, sans-serif'
  context.textAlign = 'right'
  context.fillText('VIEW EXPERIENCE DETAILS  →', 1528, 835)
  return finishTexture(canvas)
}

function createSkillsBoard(exhibit: Exhibit): CanvasTexture {
  const { canvas, context } = prepareCanvas(1260, 900)
  context.fillStyle = exhibit.accent
  context.fillRect(0, 0, 18, 900)
  context.fillStyle = 'rgba(58, 49, 42, .62)'
  context.font = '700 25px Arial, sans-serif'
  context.fillText('TECHNICAL REFERENCE', 58, 58)
  context.fillStyle = '#302b27'
  context.font = 'italic 700 76px Georgia, serif'
  context.fillText('Skills & Tools', 57, 142)

  exhibit.skillGroups?.forEach((group, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = 58 + column * 596
    const y = 245 + row * 298
    context.fillStyle = exhibit.accent
    context.font = '700 22px Arial, sans-serif'
    context.fillText(`0${index + 1}`, x, y)
    context.fillStyle = '#302b27'
    context.font = '700 33px Arial, sans-serif'
    context.fillText(group.label, x + 54, y)
    context.fillStyle = 'rgba(53, 46, 40, .72)'
    context.font = '500 24px Arial, sans-serif'
    const lines: string[] = []
    let line = ''
    group.items.forEach((item) => {
      const next = line ? `${line} · ${item}` : item
      if (context.measureText(next).width > 510 && line) {
        lines.push(line)
        line = item
      } else {
        line = next
      }
    })
    if (line) lines.push(line)
    lines.slice(0, 4).forEach((text, lineIndex) => {
      context.fillText(text, x, y + 55 + lineIndex * 38)
    })
    context.strokeStyle = 'rgba(70, 56, 44, .17)'
    context.beginPath()
    context.moveTo(x, y + 224)
    context.lineTo(x + 535, y + 224)
    context.stroke()
  })
  context.fillStyle = '#4f443b'
  context.font = '700 21px Arial, sans-serif'
  context.textAlign = 'right'
  context.fillText('VIEW COMPLETE SKILLS LIST  →', 1195, 856)
  return finishTexture(canvas)
}

function ImageArtwork({ src }: { readonly src: string }) {
  const texture = useTexture(src) as Texture
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
  }, [texture])
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function EnsembleArtwork({ accent }: { readonly accent: string }) {
  const texture = useMemo(() => createEnsembleArtwork(accent), [accent])
  useEffect(() => () => texture.dispose(), [texture])
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function ProjectExhibit({
  exhibit,
  active,
}: {
  readonly exhibit: Exhibit
  readonly active: boolean
}) {
  const labelTexture = useMemo(() => createProjectLabel(exhibit), [exhibit])
  useEffect(() => () => labelTexture.dispose(), [labelTexture])
  const frameWidth = 4.48
  const frameHeight = 2.51
  const frameAspect = frameWidth / frameHeight
  const imageAspect = exhibit.imageAspect ?? frameAspect
  const artworkWidth = imageAspect > frameAspect
    ? frameWidth
    : frameHeight * imageAspect
  const artworkHeight = imageAspect > frameAspect
    ? frameWidth / imageAspect
    : frameHeight

  return (
    <group>
      <RoundedBox args={[5.05, 0.2, 1.18]} radius={0.07} position={[0, 0.1, 0]} receiveShadow>
        <meshStandardMaterial color="#9e8e75" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[4.7, 0.08, 0.92]} radius={0.04} position={[0, 0.24, 0]} receiveShadow>
        <meshStandardMaterial color="#ddd2bd" roughness={0.96} />
      </RoundedBox>
      {[-1.78, 1.78].map((x) => (
        <RoundedBox key={x} args={[0.13, 2.95, 0.14]} radius={0.025} position={[x, 1.58, -0.08]} castShadow>
          <meshStandardMaterial color="#725a45" roughness={0.74} />
        </RoundedBox>
      ))}
      <RoundedBox args={[5.02, 3.05, 0.24]} radius={0.055} position={[0, 2.8, 0]} castShadow>
        <meshStandardMaterial color="#5b4434" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[4.72, 2.75, 0.255]} radius={0.03} position={[0, 2.8, 0.075]}>
        <meshStandardMaterial color="#c7aa78" roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, 2.8, 0.213]}>
        <planeGeometry args={[
          exhibit.image ? artworkWidth : frameWidth,
          exhibit.image ? artworkHeight : frameHeight,
        ]} />
        {exhibit.image
          ? <ImageArtwork src={exhibit.image} />
          : <EnsembleArtwork accent={exhibit.accent} />}
      </mesh>
      <mesh position={[0, 0.84, 0.25]}>
        <planeGeometry args={[4.55, 1.14]} />
        <meshBasicMaterial map={labelTexture} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.285, 0.52]}>
        <boxGeometry args={[4.58, 0.035, 0.06]} />
        <meshBasicMaterial
          color={exhibit.accent}
          transparent
          opacity={active ? 0.95 : 0.34}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function FramedBoard({
  texture,
  width,
  height,
  accent,
  active,
}: {
  readonly texture: CanvasTexture
  readonly width: number
  readonly height: number
  readonly accent: string
  readonly active: boolean
}) {
  return (
    <group>
      <RoundedBox args={[width + 0.42, height + 0.42, 0.26]} radius={0.055} position={[0, 3.15, 0]} castShadow>
        <meshStandardMaterial color="#5d4737" roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[width + 0.16, height + 0.16, 0.28]} radius={0.035} position={[0, 3.15, 0.08]}>
        <meshStandardMaterial color="#c4ab7d" roughness={0.83} />
      </RoundedBox>
      <mesh position={[0, 3.15, 0.235]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={DoubleSide} />
      </mesh>
      <RoundedBox args={[width + 0.75, 0.2, 0.86]} radius={0.07} position={[0, 0.1, 0]} receiveShadow>
        <meshStandardMaterial color="#9e8e75" roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.23, 0.45]}>
        <boxGeometry args={[width + 0.25, 0.035, 0.055]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.95 : 0.34}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function ExperienceExhibit({
  exhibit,
  active,
}: {
  readonly exhibit: Exhibit
  readonly active: boolean
}) {
  const texture = useMemo(() => createExperienceBoard(exhibit), [exhibit])
  useEffect(() => () => texture.dispose(), [texture])
  return <FramedBoard texture={texture} width={8.3} height={4.58} accent={exhibit.accent} active={active} />
}

function SkillsExhibit({
  exhibit,
  active,
}: {
  readonly exhibit: Exhibit
  readonly active: boolean
}) {
  const texture = useMemo(() => createSkillsBoard(exhibit), [exhibit])
  useEffect(() => () => texture.dispose(), [texture])
  return <FramedBoard texture={texture} width={6.15} height={4.4} accent={exhibit.accent} active={active} />
}

export function ExhibitMonument({
  exhibit,
  nearby,
  tracked,
  onOpen,
}: ExhibitMonumentProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const active = nearby || tracked || hovered

  return (
    <group
      position={exhibit.position}
      rotation={[0, exhibit.rotation ?? 0, 0]}
      onPointerDown={(event) => {
        event.stopPropagation()
        onOpen(exhibit.id)
      }}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {exhibit.kind === 'project' ? <ProjectExhibit exhibit={exhibit} active={active} /> : null}
      {exhibit.kind === 'experience' ? <ExperienceExhibit exhibit={exhibit} active={active} /> : null}
      {exhibit.kind === 'skills' ? <SkillsExhibit exhibit={exhibit} active={active} /> : null}
    </group>
  )
}
