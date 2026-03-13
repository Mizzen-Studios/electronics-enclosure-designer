import { useMemo, useState } from 'react'
import { Loader2, Minus, Plus, ShoppingCart, X } from 'lucide-react'
import { createCheckoutSession } from '../services/stripeService'
import { currencyDefinitions, defaultCurrency, supportedCurrencies } from '../types/checkout'
import type { SupportedCurrency } from '../types/checkout'
import type { EnclosureConfig } from '../types/enclosure'
import {
  calculateCheckoutPricing,
  formatPrice,
  sanitizeCurrency,
  sanitizeQuantity,
} from '../utils/pricing'

interface BuyModalProps {
  config: EnclosureConfig
  firebaseEnabled: boolean
  isPaidAccount: boolean
  onClose: () => void
}

export function BuyModal({ config, firebaseEnabled, isPaidAccount, onClose }: BuyModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [currency, setCurrency] = useState<SupportedCurrency>(defaultCurrency)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasPremiumFeatures = config.premium.advancedFastening || config.premium.waterproofSeal
  const pricing = useMemo(
    () => calculateCheckoutPricing(config, quantity, currency),
    [config, currency, quantity],
  )

  const quantityLabel = sanitizeQuantity(quantity)

  const handleCheckout = async () => {
    setError(null)

    if (!firebaseEnabled) {
      setError('Firebase is not configured. Purchasing is disabled.')
      return
    }

    if (hasPremiumFeatures && !isPaidAccount) {
      setError('Premium enclosure options require a paid account before checkout.')
      return
    }

    setLoading(true)

    try {
      const url = await createCheckoutSession(config, quantityLabel, currency)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header className="modal-header">
          <h2>Order Print</h2>
          <button className="ghost close-btn" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="modal-body">
          <div className="summary-card">
            <p className="summary-title">{config.name || 'Custom Enclosure'}</p>
            <ul className="summary-details">
              <li>Dimensions: {config.width} × {config.height} × {config.depth} mm</li>
              <li>Wall thickness: {config.wallThickness} mm</li>
              <li>Material volume: {pricing.materialVolumeCm3.toFixed(1)} cm³</li>
              <li>Holes: {config.holes.length}</li>
              <li>Unit price: {formatPrice(pricing.unitPrice, currency)}</li>
            </ul>
          </div>

          <div className="modal-control-grid">
            <div className="quantity-row">
              <span className="qty-label">Quantity</span>
              <div className="qty-stepper">
                <button
                  className="secondary"
                  disabled={quantityLabel <= 1 || loading}
                  onClick={() => setQuantity((current) => sanitizeQuantity(current - 1))}
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="qty-value">{quantityLabel}</span>
                <button
                  className="secondary"
                  disabled={quantityLabel >= 100 || loading}
                  onClick={() => setQuantity((current) => sanitizeQuantity(current + 1))}
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <label className="field-label modal-field">
              Currency
              <select
                value={currency}
                onChange={(event) => setCurrency(sanitizeCurrency(event.target.value))}
                disabled={loading}
              >
                {supportedCurrencies.map((supportedCurrency) => (
                  <option key={supportedCurrency} value={supportedCurrency}>
                    {supportedCurrency} ({currencyDefinitions[supportedCurrency].symbol})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!firebaseEnabled && (
            <div className="modal-error-banner">
              Firebase is not configured. Purchasing is disabled.
            </div>
          )}

          {hasPremiumFeatures && !isPaidAccount && (
            <div className="modal-error-banner">
              Premium options are enabled in this design. Sign in with a paid account before checkout.
            </div>
          )}

          {error && <p className="error" style={{ marginTop: 0, marginBottom: '0.5rem' }}>{error}</p>}
        </div>

        <footer className="modal-footer">
          <button className="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="primary checkout-btn"
            onClick={handleCheckout}
            disabled={loading || !firebaseEnabled || (hasPremiumFeatures && !isPaidAccount)}
          >
            {loading ? (
              <Loader2 className="spinner" size={16} strokeWidth={2.5} />
            ) : (
              <ShoppingCart size={16} strokeWidth={2.5} />
            )}
            Proceed to Checkout ({formatPrice(pricing.totalPrice, currency)})
          </button>
        </footer>
      </div>
    </div>
  )
}
