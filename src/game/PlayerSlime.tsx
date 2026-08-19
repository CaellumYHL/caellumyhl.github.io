import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  Group,
  MathUtils,
  Mesh,
  Vector3,
  type Camera,
} from 'three'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react'
import { createPlayerSlimeGeometry } from './slimeGeometry'
import { createPlayerSlimeMaterial } from './slimeMaterial'

export interface PlayerInputState {
  x: number
  y: number
  jumpQueued: boolean
}

export interface PlayerTelemetry {
  readonly x: number
  readonly z: number
  readonly speed: number
  readonly inWater: boolean
}

interface PlayerSlimeProps {
  readonly enabled: boolean
  readonly reducedMotion: boolean
  readonly inputRef: MutableRefObject<PlayerInputState>
  readonly destinationRef: MutableRefObject<Vector3 | null>
  readonly worldPositionRef: MutableRefObject<Vector3>
  readonly onTelemetry: (telemetry: PlayerTelemetry) => void
}

const FLOOR_Y = 0.83
const MOVE_SPEED = 4.35
const PROJECT_ROOM_CAMERA_OFFSET = new Vector3(0, 7.35, 10.6)
const WORK_ROOM_CAMERA_OFFSET = new Vector3(5.65, 7.1, 9.15)
const PROJECT_ROOM_LOOK_OFFSET = new Vector3(0, 0.45, -1.15)
const WORK_ROOM_LOOK_OFFSET = new Vector3(-0.35, 1.45, -2.15)
const startInWorkRoom = new URLSearchParams(window.location.search).get('room') === 'work'
const START_POSITION = new Vector3(0, FLOOR_Y, startInWorkRoom ? -17.2 : 7.45)

function updateCamera(
  camera: Camera,
  position: Vector3,
  lookTarget: Vector3,
  delta: number,
  immediate: boolean,
): void {
  const workRoomBlend = 1 - MathUtils.smoothstep(position.z, -14, -12.15)
  const cameraOffset = PROJECT_ROOM_CAMERA_OFFSET
    .clone()
    .lerp(WORK_ROOM_CAMERA_OFFSET, workRoomBlend)
  const lookOffset = PROJECT_ROOM_LOOK_OFFSET
    .clone()
    .lerp(WORK_ROOM_LOOK_OFFSET, workRoomBlend)
  const desired = position.clone().add(cameraOffset)
  const cameraBlend = immediate ? 1 : 1 - Math.exp(-delta * 3.2)
  camera.position.lerp(desired, cameraBlend)
  lookTarget.lerp(position.clone().add(lookOffset), immediate ? 1 : 1 - Math.exp(-delta * 5.2))
  camera.lookAt(lookTarget)
}

export function PlayerSlime({
  enabled,
  reducedMotion,
  inputRef,
  destinationRef,
  worldPositionRef,
  onTelemetry,
}: PlayerSlimeProps) {
  const camera = useThree((state) => state.camera)
  const rootRef = useRef<Group>(null)
  const faceRef = useRef<Group>(null)
  const shadowRef = useRef<Mesh>(null)
  const keysRef = useRef(new Set<string>())
  const velocityRef = useRef(new Vector3())
  const directionRef = useRef(new Vector3())
  const cameraForwardRef = useRef(new Vector3())
  const cameraRightRef = useRef(new Vector3())
  const navigationTargetRef = useRef(new Vector3())
  const lookTargetRef = useRef(
    START_POSITION.clone().add(startInWorkRoom ? WORK_ROOM_LOOK_OFFSET : PROJECT_ROOM_LOOK_OFFSET),
  )
  const verticalRef = useRef({ height: 0, velocity: 0, landing: 0 })
  const telemetryElapsedRef = useRef(0)
  const firstFrameRef = useRef(true)

  const bodyGeometry = useMemo(() => createPlayerSlimeGeometry('high'), [])
  const bodyMaterial = useMemo(() => createPlayerSlimeMaterial(), [])

  useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      bodyMaterial.dispose()
    }
  }, [bodyGeometry, bodyMaterial])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!enabled) return
      if (
        event.code === 'KeyW' ||
        event.code === 'KeyA' ||
        event.code === 'KeyS' ||
        event.code === 'KeyD' ||
        event.code.startsWith('Arrow') ||
        event.code === 'Space'
      ) {
        event.preventDefault()
      }
      keysRef.current.add(event.code)
      if (event.code === 'Space' && !event.repeat) inputRef.current.jumpQueued = true
    }

    const handleKeyUp = (event: KeyboardEvent): void => {
      keysRef.current.delete(event.code)
    }

    const clearKeys = (): void => keysRef.current.clear()
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', clearKeys)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', clearKeys)
    }
  }, [enabled, inputRef])

  useEffect(() => {
    if (!enabled) {
      keysRef.current.clear()
      inputRef.current.x = 0
      inputRef.current.y = 0
    }
  }, [enabled, inputRef])

  const queueJump = useCallback(
    (event: ThreeEvent<PointerEvent>): void => {
      if (!enabled) return
      event.stopPropagation()
      inputRef.current.jumpQueued = true
    },
    [enabled, inputRef],
  )

  useFrame((state, frameDelta) => {
    const root = rootRef.current
    if (!root) return

    const delta = Math.min(frameDelta, 0.05)
    const keys = keysRef.current
    let inputX =
      (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
      (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0)
    let forwardInput =
      (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) -
      (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0)

    inputX += inputRef.current.x
    forwardInput -= inputRef.current.y

    const direction = directionRef.current
    const cameraForward = cameraForwardRef.current
    const cameraRight = cameraRightRef.current
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    cameraForward.normalize()
    cameraRight.crossVectors(cameraForward, camera.up).normalize()
    direction
      .copy(cameraRight)
      .multiplyScalar(inputX)
      .addScaledVector(cameraForward, forwardInput)
    if (direction.lengthSq() > 1) direction.normalize()

    if (direction.lengthSq() > 0.015) {
      destinationRef.current = null
    } else if (destinationRef.current) {
      const destination = destinationRef.current
      const navigationTarget = navigationTargetRef.current.copy(destination)
      const crossesToWorkRoom = root.position.z > -12.35 && destination.z < -13.45
      const crossesToProjectRoom = root.position.z < -13.45 && destination.z > -12.35
      if (crossesToWorkRoom) navigationTarget.set(0, 0, -13.55)
      if (crossesToProjectRoom) navigationTarget.set(0, 0, -12.2)
      direction.copy(navigationTarget).sub(root.position)
      direction.y = 0
      if (direction.lengthSq() < 0.12 && navigationTarget.equals(destination)) {
        destinationRef.current = null
        direction.set(0, 0, 0)
      } else {
        direction.normalize()
      }
    }

    const basinZ = 1.1
    const inWater = root.position.x * root.position.x + (root.position.z - basinZ) * (root.position.z - basinZ) < 17.2
    const speedScale = inWater ? 0.88 : 1
    const desiredVelocity = direction.clone().multiplyScalar(MOVE_SPEED * speedScale)
    const velocity = velocityRef.current
    const responsiveness = direction.lengthSq() > 0 ? 1 - Math.exp(-delta * 10.5) : 1 - Math.exp(-delta * 7.5)
    velocity.lerp(desiredVelocity, responsiveness)
    if (!enabled) velocity.multiplyScalar(Math.exp(-delta * 10))

    const previousZ = root.position.z
    root.position.x += velocity.x * delta
    root.position.z += velocity.z * delta
    root.position.x = MathUtils.clamp(root.position.x, -12.8, 12.8)
    root.position.z = MathUtils.clamp(root.position.z, -27.25, 11.15)

    const crossedDivider =
      (previousZ > -12.9 && root.position.z <= -12.9) ||
      (previousZ < -12.9 && root.position.z >= -12.9)
    if (crossedDivider && Math.abs(root.position.x) > 2.42) {
      root.position.z = previousZ
      velocity.z = 0
    }

    const vertical = verticalRef.current
    if (inputRef.current.jumpQueued) {
      inputRef.current.jumpQueued = false
      if (enabled && vertical.height <= 0.001) {
        vertical.velocity = reducedMotion ? 3.1 : 5.25
        vertical.landing = 0
      }
    }

    if (vertical.height > 0 || vertical.velocity > 0) {
      vertical.velocity -= (reducedMotion ? 15.5 : 13.8) * delta
      vertical.height += vertical.velocity * delta
      if (vertical.height <= 0) {
        vertical.height = 0
        vertical.velocity = 0
        vertical.landing = 1
      }
    }
    vertical.landing = Math.max(0, vertical.landing - delta * (reducedMotion ? 7 : 3.8))
    root.position.y = FLOOR_Y + vertical.height

    const planarSpeed = Math.min(1, velocity.length() / MOVE_SPEED)
    bodyMaterial.uniforms.uTime.value = state.clock.elapsedTime
    bodyMaterial.uniforms.uSpeed.value = planarSpeed
    bodyMaterial.uniforms.uLanding.value = vertical.landing
    bodyMaterial.uniforms.uMotionScale.value = reducedMotion ? 0.22 : 1
    if (velocity.lengthSq() > 0.01) {
      bodyMaterial.uniforms.uDirection.value.set(
        velocity.x / Math.max(velocity.length(), 0.001),
        velocity.z / Math.max(velocity.length(), 0.001),
      )
    }

    if (shadowRef.current) {
      const shadowScale = 1 - Math.min(vertical.height * 0.16, 0.34)
      shadowRef.current.scale.setScalar(shadowScale)
      const shadowMaterial = shadowRef.current.material
      if (!Array.isArray(shadowMaterial)) {
        shadowMaterial.opacity = 0.28 * shadowScale
      }
    }

    if (faceRef.current) {
      faceRef.current.rotation.y = Math.atan2(
        camera.position.x - root.position.x,
        camera.position.z - root.position.z,
      )
    }

    worldPositionRef.current.set(root.position.x, 0, root.position.z)
    updateCamera(
      camera,
      root.position,
      lookTargetRef.current,
      delta,
      firstFrameRef.current,
    )
    firstFrameRef.current = false

    telemetryElapsedRef.current += delta
    if (telemetryElapsedRef.current >= 0.1) {
      telemetryElapsedRef.current = 0
      onTelemetry({
        x: root.position.x,
        z: root.position.z,
        speed: planarSpeed,
        inWater,
      })
    }
  })

  return (
    <group ref={rootRef} position={START_POSITION}>
      <mesh
        castShadow
        receiveShadow
        geometry={bodyGeometry}
        material={bodyMaterial}
        onPointerDown={queueJump}
      />

      <group ref={faceRef}>
        <mesh position={[-0.23, 0.15, 0.79]} scale={[0.064, 0.082, 0.042]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#211e25" roughness={0.55} />
        </mesh>
        <mesh position={[0.23, 0.15, 0.79]} scale={[0.064, 0.082, 0.042]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#211e25" roughness={0.55} />
        </mesh>
        <mesh position={[-0.247, 0.178, 0.831]} scale={0.014}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#e9dec7" toneMapped={false} />
        </mesh>
        <mesh position={[0.213, 0.178, 0.831]} scale={0.014}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#e9dec7" toneMapped={false} />
        </mesh>
      </group>

      <mesh
        ref={shadowRef}
        position={[0, -0.818, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-1}
      >
        <circleGeometry args={[0.88, 40]} />
        <meshBasicMaterial
          color="#3a3040"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
