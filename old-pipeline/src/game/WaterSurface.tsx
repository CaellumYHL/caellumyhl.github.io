import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import {
  Color,
  MathUtils,
  ShaderMaterial,
  Vector3,
  type IUniform,
} from 'three'

interface WaterSurfaceProps {
  readonly playerPositionRef: MutableRefObject<Vector3>
  readonly reducedMotion: boolean
}

interface WaterUniforms {
  [uniform: string]: IUniform
  uTime: IUniform<number>
  uPlayer: IUniform<Vector3>
  uMotionScale: IUniform<number>
  uActivityStrength: IUniform<number>
  uDeep: IUniform<Color>
  uShallow: IUniform<Color>
  uGlint: IUniform<Color>
  uOchre: IUniform<Color>
  uRose: IUniform<Color>
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMotionScale;
  uniform float uActivityStrength;
  uniform vec3 uPlayer;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vResponseWave;

  void main() {
    vUv = uv;
    vec3 displaced = position;
    vec4 baseWorldPosition = modelMatrix * vec4(position, 1.0);
    float contactDistance = distance(baseWorldPosition.xz, uPlayer.xz);
    float envelope = uActivityStrength *
      (1.0 - smoothstep(0.12, 3.25, contactDistance));
    float responseWave = sin(
      contactDistance * 13.5 - uTime * uMotionScale * 5.1
    ) * envelope;
    float crossWave = sin(
      baseWorldPosition.x * 3.8 + baseWorldPosition.z * 4.9 +
      uTime * uMotionScale * 0.72
    );
    crossWave += sin(
      baseWorldPosition.x * 6.1 - baseWorldPosition.z * 2.7 -
      uTime * uMotionScale * 0.48
    ) * 0.45;

    // The mesh is rotated onto the floor, so local Z is world-space height.
    displaced.z += responseWave * 0.095 * uMotionScale;
    displaced.z += crossWave * 0.012 * uMotionScale;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vResponseWave = responseWave;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uMotionScale;
  uniform float uActivityStrength;
  uniform vec3 uPlayer;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uGlint;
  uniform vec3 uOchre;
  uniform vec3 uRose;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vResponseWave;

  float hash21(vec2 value) {
    value = fract(value * vec2(123.34, 456.21));
    value += dot(value, value + 45.32);
    return fract(value.x * value.y);
  }

  void main() {
    float radial = distance(vUv, vec2(0.5)) * 2.0;
    if (radial > 1.0) discard;

    float edge = smoothstep(0.58, 1.0, radial);
    float contactDistance = distance(vWorldPosition.xz, uPlayer.xz);
    float contactEnvelope = uActivityStrength *
      (1.0 - smoothstep(0.16, 3.3, contactDistance));
    float narrowRing = smoothstep(0.48, 0.98, vResponseWave) * contactEnvelope;

    // Long, curved light seams retain the responsive-caustic character from
    // slimesim without producing a repeated dot matrix across the basin.
    float roomWave = sin(
      vWorldPosition.z * 0.72 + uTime * uMotionScale * 0.25
    );
    float seamA = abs(sin(
      vWorldPosition.x * 2.12 + roomWave * 1.05 +
      uTime * uMotionScale * 0.18
    ));
    float seamB = abs(sin(
      vWorldPosition.z * 1.82 -
      sin(vWorldPosition.x * 0.72 - uTime * uMotionScale * 0.19) * 0.92
    ));
    float caustic = max(
      smoothstep(0.977, 0.999, seamA),
      smoothstep(0.982, 0.999, seamB) * 0.52
    );

    vec3 color = mix(uDeep, uShallow, (1.0 - edge) * 0.55);
    float ochreBloom = smoothstep(
      0.35,
      0.98,
      sin(vWorldPosition.x * 0.54 + sin(vWorldPosition.z * 0.7))
    );
    float roseBloom = smoothstep(
      0.48,
      0.98,
      cos(vWorldPosition.z * 0.58 - sin(vWorldPosition.x * 0.46))
    );
    color = mix(color, uOchre, ochreBloom * (1.0 - radial) * 0.2);
    color = mix(color, uRose, roseBloom * (1.0 - radial) * 0.15);
    color += uGlint * caustic * 0.015;
    color += uGlint * narrowRing * 0.62;
    color += vec3(0.025, 0.08, 0.1) * edge;

    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(
      1.0 - max(dot(normalize(vWorldNormal), viewDirection), 0.0),
      3.0
    );
    color += uGlint * fresnel * 0.12;

    float grain = hash21(floor(vWorldPosition.xz * 45.0));
    color *= 0.955 + grain * 0.055;
    gl_FragColor = vec4(color, 0.96);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function WaterSurface({
  playerPositionRef,
  reducedMotion,
}: WaterSurfaceProps) {
  const materialRef = useRef<ShaderMaterial>(null)
  const previousPlayerRef = useRef(new Vector3())
  const hasPreviousRef = useRef(false)
  const activityRef = useRef(0)
  const uniforms = useMemo<WaterUniforms>(
    () => ({
      uTime: { value: 0 },
      uPlayer: { value: new Vector3(0, 0, 1.1) },
      uMotionScale: { value: reducedMotion ? 0.16 : 1 },
      uActivityStrength: { value: 0 },
      uDeep: { value: new Color('#263752') },
      uShallow: { value: new Color('#597787') },
      uGlint: { value: new Color('#f0dfbd') },
      uOchre: { value: new Color('#9f7337') },
      uRose: { value: new Color('#7e3d4c') },
    }),
    [reducedMotion],
  )

  useFrame((state, delta) => {
    const material = materialRef.current
    if (!material) return
    const player = playerPositionRef.current
    const previous = previousPlayerRef.current
    const moved = hasPreviousRef.current ? player.distanceTo(previous) : 0
    const speed = moved / Math.max(delta, 0.001)
    const dx = player.x
    const dz = player.z - 1.1
    const inBasin = dx * dx + dz * dz < 18.1
    const targetActivity = inBasin ? MathUtils.clamp(speed / 2.8, 0, 1) : 0
    const response = targetActivity > activityRef.current ? 8.5 : 1.15
    activityRef.current = MathUtils.lerp(
      activityRef.current,
      targetActivity,
      1 - Math.exp(-delta * response),
    )

    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uPlayer.value.copy(player)
    material.uniforms.uMotionScale.value = reducedMotion ? 0.16 : 1
    material.uniforms.uActivityStrength.value = reducedMotion
      ? activityRef.current * 0.32
      : activityRef.current
    previous.copy(player)
    hasPreviousRef.current = true
  })

  return (
    <mesh
      position={[0, 0.055, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[8.3, 8.3, 88, 88]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        dithering
        toneMapped
      />
    </mesh>
  )
}
