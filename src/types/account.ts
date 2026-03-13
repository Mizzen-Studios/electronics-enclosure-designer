export type AccountTier = 'guest' | 'free' | 'paid'

export interface AccountState {
  tier: AccountTier
  isPaid: boolean
  loading: boolean
  error: string | null
}
