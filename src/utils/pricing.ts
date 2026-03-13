import { currencyDefinitions, defaultCurrency } from '../types/checkout'
import type { SupportedCurrency } from '../types/checkout'
import type { EnclosureConfig } from '../types/enclosure'

const BASE_PRICE_PER_CM3_GBP = 1.2
const MIN_UNIT_PRICE_GBP = 5

export interface CheckoutPricing {
  materialVolumeCm3: number
  unitPrice: number
  totalPrice: number
}

const roundMoney = (value: number) => Math.round(value * 100) / 100

export function sanitizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1
  }

  return Math.min(100, Math.max(1, Math.round(quantity)))
}

export function sanitizeCurrency(currency: string | null | undefined): SupportedCurrency {
  if (!currency) {
    return defaultCurrency
  }

  const upper = currency.toUpperCase() as SupportedCurrency
  return currencyDefinitions[upper] ? upper : defaultCurrency
}

export function calculateMaterialVolumeCm3(config: EnclosureConfig): number {
  const outerMm3 = config.width * config.height * config.depth
  const innerW = Math.max(0, config.width - 2 * config.wallThickness)
  const innerH = Math.max(0, config.height - 2 * config.wallThickness)
  const innerD = Math.max(0, config.depth - 2 * config.wallThickness)
  const innerMm3 = innerW * innerH * innerD
  return (outerMm3 - innerMm3) / 1000
}

export function calculateUnitPrice(config: EnclosureConfig, currency: SupportedCurrency): number {
  const materialVolumeCm3 = calculateMaterialVolumeCm3(config)
  const unitPriceGbp = Math.max(MIN_UNIT_PRICE_GBP, materialVolumeCm3 * BASE_PRICE_PER_CM3_GBP)

  return roundMoney(unitPriceGbp * currencyDefinitions[currency].gbpRate)
}

export function calculateCheckoutPricing(
  config: EnclosureConfig,
  quantity: number,
  currency: SupportedCurrency,
): CheckoutPricing {
  const sanitizedQuantity = sanitizeQuantity(quantity)
  const unitPrice = calculateUnitPrice(config, currency)

  return {
    materialVolumeCm3: calculateMaterialVolumeCm3(config),
    unitPrice,
    totalPrice: roundMoney(unitPrice * sanitizedQuantity),
  }
}

export function formatPrice(amount: number, currency: SupportedCurrency): string {
  const definition = currencyDefinitions[currency]
  return new Intl.NumberFormat(definition.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
