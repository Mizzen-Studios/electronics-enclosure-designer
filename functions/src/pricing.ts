export type SupportedCurrency = 'gbp' | 'usd' | 'eur'

const GBP_EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  gbp: 1,
  usd: 1.27,
  eur: 1.17,
}

const BASE_PRICE_PER_CM3_GBP = 1.2
const MIN_UNIT_PRICE_GBP_PENCE = 500

const roundToMinorUnit = (value: number) => Math.round(value)

export function sanitizeCurrency(currency: unknown): SupportedCurrency {
  if (typeof currency !== 'string') {
    return 'gbp'
  }

  const normalized = currency.trim().toLowerCase()
  if (normalized === 'usd' || normalized === 'eur' || normalized === 'gbp') {
    return normalized
  }

  return 'gbp'
}

export function sanitizeQuantity(quantity: unknown): number {
  const numeric = typeof quantity === 'number' ? quantity : Number(quantity)

  if (!Number.isFinite(numeric)) {
    return 1
  }

  return Math.min(100, Math.max(1, Math.round(numeric)))
}

export function calculateMaterialVolumeCm3(config: {
  width: number
  height: number
  depth: number
  wallThickness: number
}): number {
  const outerVolumeMm3 = config.width * config.height * config.depth
  const innerW = Math.max(0, config.width - 2 * config.wallThickness)
  const innerH = Math.max(0, config.height - 2 * config.wallThickness)
  const innerD = Math.max(0, config.depth - 2 * config.wallThickness)
  const innerVolumeMm3 = innerW * innerH * innerD

  return (outerVolumeMm3 - innerVolumeMm3) / 1000
}

export function calculateUnitPriceMinor(
  materialVolumeCm3: number,
  currency: SupportedCurrency,
): number {
  const unitPriceGbpPence = Math.max(
    MIN_UNIT_PRICE_GBP_PENCE,
    roundToMinorUnit(materialVolumeCm3 * BASE_PRICE_PER_CM3_GBP * 100),
  )

  return roundToMinorUnit(unitPriceGbpPence * GBP_EXCHANGE_RATES[currency])
}
