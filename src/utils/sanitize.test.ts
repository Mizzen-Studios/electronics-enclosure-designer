import { describe, expect, test } from 'vitest'
import { defaultModel } from '../app/defaultModel'
import type { EnclosureConfig } from '../types/enclosure'
import { sanitizeConfig } from './sanitize'

function buildConfig(overrides: Partial<EnclosureConfig>): EnclosureConfig {
  return {
    ...defaultModel,
    ...overrides,
    premium: {
      ...defaultModel.premium,
      ...(overrides.premium ?? {}),
    },
    services: {
      ...defaultModel.services,
      ...(overrides.services ?? {}),
    },
    holes: overrides.holes ?? defaultModel.holes,
  }
}

describe('sanitizeConfig', () => {
  test('clamps dimensions and wall thickness to safe ranges', () => {
    const config = buildConfig({
      width: 999,
      height: 1,
      depth: -50,
      wallThickness: 999,
      name: '   ',
    })

    const sanitized = sanitizeConfig(config)

    expect(sanitized.width).toBe(240)
    expect(sanitized.height).toBe(30)
    expect(sanitized.depth).toBe(40)
    expect(sanitized.wallThickness).toBeLessThanOrEqual(Math.min(sanitized.width, sanitized.height, sanitized.depth) / 3)
    expect(sanitized.name).toBe(defaultModel.name)
  })

  test('clamps holes inside the selected face bounds', () => {
    const config = buildConfig({
      width: 100,
      height: 80,
      depth: 60,
      wallThickness: 4,
      holes: [
        {
          id: 'h-1',
          face: 'front',
          radius: 50,
          x: 999,
          y: -999,
        },
      ],
    })

    const sanitized = sanitizeConfig(config)
    const [hole] = sanitized.holes

    expect(hole.radius).toBeGreaterThanOrEqual(1)
    expect(hole.radius).toBeLessThanOrEqual(36)
    expect(hole.x).toBeLessThanOrEqual(50 - 4 - hole.radius)
    expect(hole.y).toBeGreaterThanOrEqual(-(40 - 4) + hole.radius)
  })

  test('removes premium toggles for unpaid accounts', () => {
    const config = buildConfig({
      premium: {
        advancedFastening: true,
        waterproofSeal: true,
      },
    })

    const unpaid = sanitizeConfig(config, { allowPremium: false })
    expect(unpaid.premium.advancedFastening).toBe(false)
    expect(unpaid.premium.waterproofSeal).toBe(false)

    const paid = sanitizeConfig(config, { allowPremium: true })
    expect(paid.premium.advancedFastening).toBe(true)
    expect(paid.premium.waterproofSeal).toBe(true)
  })
})
