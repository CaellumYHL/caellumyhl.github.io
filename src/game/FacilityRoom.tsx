import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import {
  CanvasTexture,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Points,
} from 'three'
import { GenerativePortraitWall } from './art/GenerativePortraitWall'
import { WatercolorStudy } from './art/WatercolorStudy'
import { WaterSurface } from './WaterSurface'
import { VisitorLedger } from './VisitorLedger'

interface FacilityRoomProps {
  readonly playerPositionRef: MutableRefObject<Vector3>
  readonly reducedMotion: boolean
  readonly onOpenStudio: (study: 'watercolor' | 'faces') => void
}

function randomFrom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = Math.imul(1664525, value) + 1013904223
    return (value >>> 0) / 4294967296
  }
}

function createPaperTexture(variant: 'floor' | 'plaster'): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create gallery paper texture')
  const random = randomFrom(variant === 'floor' ? 1884 : 1997)
  context.fillStyle = variant === 'floor' ? '#b9ad96' : '#ddd4c2'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.globalCompositeOperation = 'multiply'
  const washes = variant === 'floor'
    ? ['rgba(98, 111, 105, .08)', 'rgba(143, 103, 76, .07)', 'rgba(68, 86, 102, .055)']
    : ['rgba(128, 107, 82, .045)', 'rgba(83, 108, 115, .035)', 'rgba(164, 118, 94, .035)']
  for (let index = 0; index < 24; index += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const radius = 70 + random() * 210
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, washes[index % washes.length])
    gradient.addColorStop(0.72, washes[(index + 1) % washes.length])
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }
  context.globalCompositeOperation = 'source-over'

  for (let index = 0; index < 1550; index += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const length = 4 + random() * 44
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + length, y + (random() - 0.5) * 2.8)
    context.lineWidth = 0.35 + random() * 0.7
    context.strokeStyle = random() > 0.45
      ? `rgba(75, 61, 47, ${0.012 + random() * 0.022})`
      : `rgba(255, 252, 238, ${0.035 + random() * 0.055})`
    context.stroke()
  }

  if (variant === 'floor') {
    context.strokeStyle = 'rgba(69, 58, 48, .14)'
    context.lineWidth = 2
    for (let index = 0; index <= 4; index += 1) {
      const coordinate = (canvas.width / 4) * index
      context.beginPath()
      context.moveTo(coordinate, 0)
      context.lineTo(coordinate + (random() - 0.5) * 4, canvas.height)
      context.stroke()
      context.beginPath()
      context.moveTo(0, coordinate)
      context.lineTo(canvas.width, coordinate + (random() - 0.5) * 4)
      context.stroke()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(variant === 'floor' ? 3.8 : 2.4, variant === 'floor' ? 4 : 1.6)
  texture.needsUpdate = true
  return texture
}

function createSignTexture(title: string, subtitle: string): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 240
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create room sign')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(235, 226, 208, .98)'
  context.fillRect(5, 5, 1190, 230)
  context.strokeStyle = 'rgba(70, 56, 43, .55)'
  context.lineWidth = 3
  context.strokeRect(7, 7, 1186, 226)
  context.fillStyle = '#302b27'
  context.textAlign = 'center'
  context.font = 'italic 700 78px Georgia, serif'
  context.fillText(title, 600, 105)
  context.fillStyle = 'rgba(61, 51, 43, .64)'
  context.font = '700 23px Arial, sans-serif'
  context.fillText(subtitle.toUpperCase(), 600, 163)
  context.fillStyle = '#3e6f91'
  context.fillRect(485, 191, 230, 5)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function GalleryShell({
  playerPositionRef,
}: Pick<FacilityRoomProps, 'playerPositionRef'>) {
  const gl = useThree((state) => state.gl)
  const dividerRef = useRef<Group>(null)
  const floorTexture = useMemo(() => createPaperTexture('floor'), [])
  const plasterTexture = useMemo(() => createPaperTexture('plaster'), [])

  useEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    floorTexture.anisotropy = anisotropy
    plasterTexture.anisotropy = anisotropy
    return () => {
      floorTexture.dispose()
      plasterTexture.dispose()
    }
  }, [floorTexture, gl, plasterTexture])

  useFrame(() => {
    if (dividerRef.current) {
      dividerRef.current.visible = playerPositionRef.current.z > -12.72
    }
  })

  const wallMaterial = (
    <meshStandardMaterial
      map={plasterTexture}
      color="#e7dfcf"
      roughness={0.96}
      side={DoubleSide}
    />
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.04, -8]}>
        <planeGeometry args={[48, 50]} />
        <meshStandardMaterial map={floorTexture} color="#d6c9b2" roughness={0.9} side={DoubleSide} />
      </mesh>

      <group ref={dividerRef}>
        <mesh position={[-12.3, 4.7, -12.9]} receiveShadow>
          <planeGeometry args={[19.4, 9.4]} />
          {wallMaterial}
        </mesh>
        <mesh position={[12.3, 4.7, -12.9]} receiveShadow>
          <planeGeometry args={[19.4, 9.4]} />
          {wallMaterial}
        </mesh>
        <mesh position={[0, 8.05, -12.9]} receiveShadow>
          <planeGeometry args={[5.4, 2.7]} />
          {wallMaterial}
        </mesh>
        <RoundedBox args={[19.3, 0.34, 0.42]} radius={0.06} position={[-12.35, 0.16, -12.65]}>
          <meshStandardMaterial color="#6b5541" roughness={0.78} />
        </RoundedBox>
        <RoundedBox args={[19.3, 0.34, 0.42]} radius={0.06} position={[12.35, 0.16, -12.65]}>
          <meshStandardMaterial color="#6b5541" roughness={0.78} />
        </RoundedBox>
      </group>

      <mesh position={[0, 4.7, -29.1]} receiveShadow>
        <planeGeometry args={[44, 9.4]} />
        {wallMaterial}
      </mesh>
      <mesh position={[-21.9, 4.25, -8.2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[42, 8.5]} />
        {wallMaterial}
      </mesh>
      <mesh position={[21.9, 4.25, -8.2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[42, 8.5]} />
        {wallMaterial}
      </mesh>

      <RoundedBox args={[44, 0.34, 0.42]} radius={0.06} position={[0, 0.16, -28.86]}>
        <meshStandardMaterial color="#6b5541" roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.34, 42]} radius={0.06} position={[-21.67, 0.16, -8.2]}>
        <meshStandardMaterial color="#6b5541" roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.34, 42]} radius={0.06} position={[21.67, 0.16, -8.2]}>
        <meshStandardMaterial color="#6b5541" roughness={0.78} />
      </RoundedBox>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -21]}>
        <planeGeometry args={[20.2, 13.1]} />
        <meshStandardMaterial color="#978d7c" roughness={0.96} transparent opacity={0.32} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -14.1]}>
        <planeGeometry args={[5.15, 1.05]} />
        <meshStandardMaterial color="#d9ccb3" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -14.1]}>
        <planeGeometry args={[4.82, 0.055]} />
        <meshBasicMaterial color="#3e6f91" transparent opacity={0.62} />
      </mesh>
    </group>
  )
}

function RoomPortal({
  playerPositionRef,
}: Pick<FacilityRoomProps, 'playerPositionRef'>) {
  const portalRef = useRef<Group>(null)
  const workSign = useMemo(
    () => createSignTexture('Work Experience', 'Work history and technical skills'),
    [],
  )
  useEffect(
    () => () => {
      workSign.dispose()
    },
    [workSign],
  )
  useFrame(() => {
    if (portalRef.current) {
      portalRef.current.visible = playerPositionRef.current.z > -12.72
    }
  })

  return (
    <group ref={portalRef}>
      {[-2.82, 2.82].map((x) => (
        <group key={x} position={[x, 0, -12.58]}>
          <RoundedBox args={[0.48, 6.25, 0.46]} radius={0.045} position={[0, 3.12, 0]} castShadow>
            <meshStandardMaterial color="#c7baa4" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.82, 0.25, 0.72]} radius={0.035} position={[0, 0.2, 0.05]}>
            <meshStandardMaterial color="#a99578" roughness={0.84} />
          </RoundedBox>
        </group>
      ))}
      <RoundedBox args={[6.12, 0.52, 0.52]} radius={0.055} position={[0, 6.22, -12.58]} castShadow>
        <meshStandardMaterial color="#a99578" roughness={0.84} />
      </RoundedBox>
      <mesh position={[0, 4.92, -12.27]}>
        <planeGeometry args={[4.5, 0.9]} />
        <meshBasicMaterial map={workSign} transparent toneMapped={false} side={DoubleSide} />
      </mesh>
    </group>
  )
}

function PigmentBasin() {
  const palette = ['#315985', '#9a3f48', '#bd8437', '#356a5a']
  return (
    <group position={[0, 0, 1.1]}>
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.32, 96]} />
        <meshStandardMaterial color="#594b45" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[4.18, 4.55, 128]} />
        <meshStandardMaterial color="#c6b99f" roughness={0.91} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.37, 4.42, 128]} />
        <meshBasicMaterial color="#6d5946" transparent opacity={0.52} />
      </mesh>
      {palette.map((color, index) => {
        const angle = -1.05 + index * 0.7
        return (
          <mesh
            key={color}
            position={[Math.sin(angle) * 4.39, 0.045, Math.cos(angle) * 4.39]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.13 + (index % 2) * 0.025, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.72} />
          </mesh>
        )
      })}
    </group>
  )
}

function PaperDust({ reducedMotion }: { readonly reducedMotion: boolean }) {
  const pointsRef = useRef<Points>(null)
  const positions = useMemo(() => {
    const data = new Float32Array(145 * 3)
    for (let index = 0; index < 145; index += 1) {
      data[index * 3] = (Math.sin(index * 32.17) * 0.5 + 0.5) * 39 - 19.5
      data[index * 3 + 1] = (Math.sin(index * 17.41 + 1.2) * 0.5 + 0.5) * 6.6 + 0.35
      data[index * 3 + 2] = (Math.sin(index * 8.91 + 2.7) * 0.5 + 0.5) * 39 - 28
    }
    return data
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion) return
    pointsRef.current.rotation.y += delta * 0.003
    pointsRef.current.position.y = Math.sin(performance.now() * 0.00012) * 0.08
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f2dfb9"
        size={0.033}
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export function FacilityRoom({
  playerPositionRef,
  reducedMotion,
  onOpenStudio,
}: FacilityRoomProps) {
  return (
    <group>
      <color attach="background" args={['#c7bead']} />
      <fog attach="fog" args={['#c8bfaf', 28, 66]} />

      <hemisphereLight args={['#fff9e9', '#766a61', 2.15]} />
      <directionalLight
        position={[7, 14, 9]}
        intensity={3.1}
        color="#fff5dc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={18}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={56}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[-11, 8, -18]} intensity={0.78} color="#a9bdd0" />
      <pointLight position={[0, 6.8, -23]} intensity={34} distance={24} color="#f0d7ad" />

      <GalleryShell playerPositionRef={playerPositionRef} />
      <RoomPortal playerPositionRef={playerPositionRef} />
      <PigmentBasin />
      <group position={[0, 0, 1.1]}>
        <WaterSurface playerPositionRef={playerPositionRef} reducedMotion={reducedMotion} />
        <VisitorLedger />
      </group>

      <WatercolorStudy
        reducedMotion={reducedMotion}
        position={[-11.4, 3.65, -18.15]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.68}
        onOpen={() => onOpenStudio('watercolor')}
      />
      <GenerativePortraitWall
        position={[-11.4, 3.65, -23.7]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.68}
        onOpen={() => onOpenStudio('faces')}
      />
      <PaperDust reducedMotion={reducedMotion} />
    </group>
  )
}
