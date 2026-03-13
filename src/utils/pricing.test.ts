import { describe, expect, test } from 'vitest'
import { defaultModel } from '../app/defaultModel'
import {
  calculateCheckoutPricing,
  calculateMaterialVolumeCm3,
  calculateUnitPrice,
  sanitizeCurrency,
  sanitizeQuantity,
} from './pricing'

describe('pricing utilities', () => {
  test('calculates material volume from outer minus inner volume', () => {
    const volume = calculateMaterialVolumeCm3({
      ...defaultModel,
      width: 100,
      height: 80,
      depth: 60,
      wallThickness: 5,
    })

    expect(volume).toBeCloseTo(165)
  })

  test('enforces minimum price and supports currency conversion', () => {
    const tinyConfig = {
      ...defaultModel,
      width: 40,
      height: 30,
      depth: 40,
      wallThickness: 0.1,
    }

    expect(calculateUnitPrice(tinyConfig, 'GBP')).toBe(5)
    expect(calculateUnitPrice(tinyConfig, 'USD')).toBeCloseTo(6.35)
    expect(calculateUnitPrice(tinyConfig, 'EUR')).toBeCloseTo(5.85)
  })

  test('sanitizes quantity and currency values', () => {
    expect(sanitizeQuantity(0)).toBe(1)
    expect(sanitizeQuantity(999)).toBe(100)
    expect(sanitizeCurrency('usd')).toBe('USD')
    expect(sanitizeCurrency('zzz')).toBe('GBP')

    const pricing = calculateCheckoutPricing(defaultModel, 2.4, 'GBP')
    expect(pricing.totalPrice).toBeCloseTo(pricing.unitPrice * 2)
  })
})
