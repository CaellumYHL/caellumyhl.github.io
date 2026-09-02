import { describe, expect, it } from 'vitest'
import { exhibitById, exhibits, totalExhibits } from './portfolio'

describe('portfolio exhibit registry', () => {
  it('keeps identifiers, indices, and world positions unique', () => {
    expect(new Set(exhibits.map((entry) => entry.id)).size).toBe(exhibits.length)
    expect(new Set(exhibits.map((entry) => entry.index)).size).toBe(exhibits.length)
    expect(new Set(exhibits.map((entry) => entry.position.join(':'))).size).toBe(
      exhibits.length,
    )
  })

  it('contains every current resume lane', () => {
    const ids: readonly string[] = exhibits.map((entry) => entry.id)
    expect(totalExhibits).toBe(6)
    expect(exhibitById.has('experience')).toBe(true)
    expect(exhibitById.has('paper-cuts')).toBe(true)
    expect(exhibitById.has('ensemble')).toBe(true)
    expect(exhibitById.has('auctopus')).toBe(true)
    expect(exhibitById.has('twin-universe')).toBe(true)
    expect(exhibitById.has('skills')).toBe(true)
    expect(ids).not.toContain('profile')
    expect(ids).not.toContain('contact')
  })
})
