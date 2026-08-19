import {
  CubicBezierCurve,
  LatheGeometry,
  MathUtils,
  Vector2,
  type BufferGeometry,
} from 'three'

/**
 * The player silhouette is adapted from the authored droplet profile in
 * slimesim. A lathed profile holds up far better than a stretched sphere when
 * the character is only a few dozen pixels tall.
 */
export function createPlayerSlimeGeometry(detail: 'low' | 'high'): BufferGeometry {
  const high = detail === 'high'
  const lower = new CubicBezierCurve(
    new Vector2(0.012, -0.82),
    new Vector2(0.57, -0.82),
    new Vector2(1.01, -0.67),
    new Vector2(0.98, -0.2),
  ).getPoints(high ? 12 : 6)

  const shoulder = new CubicBezierCurve(
    new Vector2(0.98, -0.2),
    new Vector2(1, 0.22),
    new Vector2(0.65, 0.61),
    new Vector2(0.36, 0.82),
  )
    .getPoints(high ? 12 : 6)
    .slice(1)

  const tip = new CubicBezierCurve(
    new Vector2(0.36, 0.82),
    new Vector2(0.25, 1.01),
    new Vector2(0.13, 1.13),
    new Vector2(0.012, 1.19),
  )
    .getPoints(high ? 9 : 5)
    .slice(1)

  const geometry = new LatheGeometry(
    [...lower, ...shoulder, ...tip],
    high ? 52 : 28,
    Math.PI,
  )
  const positions = geometry.getAttribute('position')

  for (let index = 0; index < positions.count; index += 1) {
    const sourceX = positions.getX(index)
    const sourceY = positions.getY(index)
    const sourceZ = positions.getZ(index)
    const tipMask = MathUtils.smoothstep(sourceY, 0.46, 1.19)
    const shoulderMask = MathUtils.smoothstep(sourceY, 0.2, 0.92)

    positions.setXYZ(
      index,
      sourceX * 0.84 + tipMask * tipMask * 0.17,
      sourceY + Math.sin(shoulderMask * Math.PI) * 0.018,
      sourceZ * (0.72 - tipMask * 0.035),
    )
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  geometry.name = `PortfolioDroplet-${detail}`
  return geometry
}
