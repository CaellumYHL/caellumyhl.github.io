import {
  Color,
  FrontSide,
  ShaderMaterial,
  Vector2,
  type IUniform,
  type ShaderMaterialParameters,
} from 'three'

interface PlayerSlimeUniforms {
  [uniform: string]: IUniform
  uTime: IUniform<number>
  uSpeed: IUniform<number>
  uLanding: IUniform<number>
  uMotionScale: IUniform<number>
  uDirection: IUniform<Vector2>
  uBaseColor: IUniform<Color>
  uDeepColor: IUniform<Color>
  uRimColor: IUniform<Color>
  uHighlightColor: IUniform<Color>
}

export type PlayerSlimeMaterial = ShaderMaterial & {
  uniforms: PlayerSlimeUniforms
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uLanding;
  uniform float uMotionScale;
  uniform vec2 uDirection;

  varying vec3 vLocalPosition;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying float vWobble;

  void main() {
    vec3 p = position;

    float breath = sin(uTime * 1.55 + position.y * 1.2)
      * 0.018 * uMotionScale;
    float stride = sin(uTime * (5.0 + uSpeed * 5.0))
      * uSpeed * 0.035 * uMotionScale;
    float verticalScale = clamp(
      1.0 + breath - uSpeed * 0.09 - uLanding * 0.17 + stride,
      0.72,
      1.16
    );
    float horizontalScale = inversesqrt(verticalScale);
    p.y *= verticalScale;
    p.xz *= horizontalScale;

    float upperBody = smoothstep(-0.7, 0.7, position.y);
    p.x += uDirection.x * uSpeed * upperBody * 0.095;
    p.z += uDirection.y * uSpeed * upperBody * 0.095;

    float edgeFlex = smoothstep(-0.78, 0.25, position.y);
    float wobbleA = sin(position.y * 5.1 + position.x * 3.2 + uTime * 2.15);
    float wobbleB = sin(position.z * 7.2 - position.y * 2.4 - uTime * 1.72);
    float wobble = (wobbleA + wobbleB) * 0.5;
    p += normal * wobble * 0.024 * uMotionScale * edgeFlex;

    vLocalPosition = p;
    vWobble = wobble * 0.5 + 0.5;
    vViewNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uBaseColor;
  uniform vec3 uDeepColor;
  uniform vec3 uRimColor;
  uniform vec3 uHighlightColor;

  varying vec3 vLocalPosition;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying float vWobble;

  float softDisc(vec2 point, vec2 center, float radius) {
    return 1.0 - smoothstep(radius * 0.28, radius, distance(point, center));
  }

  float pigmentGrain(vec3 point) {
    vec3 cell = floor(point * 58.0);
    return fract(sin(dot(cell, vec3(12.9898, 78.233, 43.117))) * 43758.5453);
  }

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 1.75);

    vec3 keyDirection = normalize(vec3(-0.48, 0.76, 0.56));
    float keyLight = max(dot(normal, keyDirection), 0.0);
    vec3 halfDirection = normalize(keyDirection + viewDirection);
    float broadHighlight = pow(max(dot(normal, halfDirection), 0.0), 25.0);
    float wetHighlight = pow(max(dot(normal, halfDirection), 0.0), 92.0);

    float bodyHeight = smoothstep(-0.8, 1.15, vLocalPosition.y);
    float opticalDepth = pow(facing, 0.62) * mix(1.06, 0.73, bodyHeight);
    float innerVolume = smoothstep(0.25, 0.9, facing);
    vec3 bodyColor = mix(
      uDeepColor,
      uBaseColor,
      0.3 + bodyHeight * 0.2 + keyLight * 0.12
    );
    bodyColor = mix(bodyColor, uDeepColor, opticalDepth * 0.34);
    bodyColor *= 0.72 + keyLight * 0.21;

    float caustic = sin(
      vLocalPosition.y * 7.2
      + sin(vLocalPosition.x * 5.4 - uTime * 0.36)
      + uTime * 0.48
    ) * 0.5 + 0.5;
    caustic = smoothstep(0.71, 0.98, caustic) * innerVolume;

    vec2 moteA = vec2(
      sin(uTime * 0.24) * 0.02 + 0.36,
      cos(uTime * 0.17) * 0.018 + 0.34
    );
    vec2 moteB = vec2(
      cos(uTime * 0.19 + 1.8) * 0.02 - 0.38,
      sin(uTime * 0.14 + 2.1) * 0.018 - 0.27
    );
    float motes = (
      softDisc(vLocalPosition.xy, moteA, 0.047)
      + softDisc(vLocalPosition.xy, moteB, 0.038)
    ) * innerVolume;

    bodyColor += uRimColor * fresnel * (0.17 + uSpeed * 0.04);
    bodyColor += uBaseColor * caustic * 0.045;
    bodyColor += uRimColor * motes * 0.18;
    bodyColor += uHighlightColor * broadHighlight * 0.075;
    bodyColor += uHighlightColor * wetHighlight * 0.62;
    bodyColor += uRimColor * vWobble * innerVolume * 0.012;
    float grain = pigmentGrain(vLocalPosition);
    bodyColor *= 0.94 + grain * 0.095;
    bodyColor = mix(bodyColor, uDeepColor, smoothstep(0.93, 1.0, grain) * 0.12);

    gl_FragColor = vec4(bodyColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function createPlayerSlimeMaterial(): PlayerSlimeMaterial {
  const parameters: ShaderMaterialParameters = {
    name: 'PortfolioDropletSurface',
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 0 },
      uLanding: { value: 0 },
      uMotionScale: { value: 1 },
      uDirection: { value: new Vector2() },
      uBaseColor: { value: new Color('#355f91') },
      uDeepColor: { value: new Color('#17243f') },
      uRimColor: { value: new Color('#91a9c3') },
      uHighlightColor: { value: new Color('#f5dfb8') },
    } satisfies PlayerSlimeUniforms,
    vertexShader,
    fragmentShader,
    depthTest: true,
    depthWrite: true,
    dithering: true,
    side: FrontSide,
    transparent: false,
    toneMapped: true,
  }

  const material = new ShaderMaterial(parameters) as PlayerSlimeMaterial
  material.customProgramCacheKey = () => 'portfolio-pigment-droplet-v2'
  return material
}
