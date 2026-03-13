export type SupportedCurrency = 'GBP' | 'USD' | 'EUR'

export interface CurrencyDefinition {
  code: SupportedCurrency
  stripeCode: Lowercase<SupportedCurrency>
  symbol: string
  locale: string
  gbpRate: number
}

export const currencyDefinitions: Record<SupportedCurrency, CurrencyDefinition> = {
  GBP: {
    code: 'GBP',
    stripeCode: 'gbp',
    symbol: '£',
    locale: 'en-GB',
    gbpRate: 1,
  },
  USD: {
    code: 'USD',
    stripeCode: 'usd',
    symbol: '$',
    locale: 'en-US',
    gbpRate: 1.27,
  },
  EUR: {
    code: 'EUR',
    stripeCode: 'eur',
    symbol: '€',
    locale: 'de-DE',
    gbpRate: 1.17,
  },
}

export const supportedCurrencies = Object.keys(currencyDefinitions) as SupportedCurrency[]
export const defaultCurrency: SupportedCurrency = 'GBP'
