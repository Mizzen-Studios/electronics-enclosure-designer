import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'
import type { SupportedCurrency } from '../types/checkout'
import type { EnclosureConfig } from '../types/enclosure'

const functions = app ? getFunctions(app) : null

interface CheckoutRequest {
  config: EnclosureConfig
  quantity: number
  currency: SupportedCurrency
}

interface CheckoutResponse {
  url: string
}

export async function createCheckoutSession(
  config: EnclosureConfig,
  quantity: number,
  currency: SupportedCurrency,
): Promise<string> {
  if (!functions) {
    throw new Error('Firebase configuration is missing or invalid.')
  }

  const createSessionCmd = httpsCallable<CheckoutRequest, CheckoutResponse>(functions, 'createCheckoutSession')
  const result = await createSessionCmd({ config, quantity, currency })

  if (!result.data || !result.data.url) {
    throw new Error('Invalid response from checkout service.')
  }

  return result.data.url
}
