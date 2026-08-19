import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { Suspense, type MutableRefObject } from 'react'
import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { exhibits, type ExhibitId } from '../data/portfolio'
import { ExhibitMonument } from './ExhibitMonument'
import { FacilityRoom } from './FacilityRoom'
import {
  PlayerSlime,
  type PlayerInputState,
  type PlayerTelemetry,
} from './PlayerSlime'

interface PortfolioWorldProps {
  readonly gameEnabled: boolean
  readonly reducedMotion: boolean
  readonly nearbyId: ExhibitId | null
  readonly trackedId: ExhibitId | null
  readonly inputRef: MutableRefObject<PlayerInputState>
  readonly destinationRef: MutableRefObject<Vector3 | null>
  readonly playerPositionRef: MutableRefObject<Vector3>
  readonly onTelemetry: (telemetry: PlayerTelemetry) => void
  readonly onOpenExhibit: (id: ExhibitId) => void
  readonly onOpenStudio: (study: 'watercolor' | 'faces') => void
}

function WorldScene({
  gameEnabled,
  reducedMotion,
  nearbyId,
  trackedId,
  inputRef,
  destinationRef,
  playerPositionRef,
  onTelemetry,
  onOpenExhibit,
  onOpenStudio,
}: PortfolioWorldProps) {
  const navigate = (event: ThreeEvent<PointerEvent>): void => {
    if (!gameEnabled || event.button !== 0) return
    event.stopPropagation()
    destinationRef.current = new Vector3(event.point.x, 0, event.point.z)
  }

  return (
    <>
      <FacilityRoom
        playerPositionRef={playerPositionRef}
        reducedMotion={reducedMotion}
        onOpenStudio={onOpenStudio}
      />

      {exhibits.map((exhibit) => (
        <Suspense key={exhibit.id} fallback={null}>
          <ExhibitMonument
            exhibit={exhibit}
            nearby={nearbyId === exhibit.id}
            tracked={trackedId === exhibit.id}
            reducedMotion={reducedMotion}
            onOpen={onOpenExhibit}
          />
        </Suspense>
      ))}

      <PlayerSlime
        enabled={gameEnabled}
        reducedMotion={reducedMotion}
        inputRef={inputRef}
        destinationRef={destinationRef}
        worldPositionRef={playerPositionRef}
        onTelemetry={onTelemetry}
      />

      <mesh
        position={[0, 0.13, -8]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={navigate}
      >
        <planeGeometry args={[44, 44]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Preload all />
    </>
  )
}

export function PortfolioWorld(props: PortfolioWorldProps) {
  return (
    <Canvas
      className="game-canvas"
      camera={{
        position: [8.6, 8.18, 18.85],
        fov: 42,
        near: 0.1,
        far: 72,
      }}
      dpr={[1, 1.65]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.02
        gl.shadowMap.type = PCFSoftShadowMap
      }}
      fallback={
        <div className="webgl-fallback">
          3D rendering is unavailable. Open Field Notes for the complete portfolio.
        </div>
      }
    >
      <WorldScene {...props} />
    </Canvas>
  )
}
