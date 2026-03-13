import type { ParsedToken, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { AccountTier } from '../types/account'
import { db } from './firebase'

interface AccountProfile {
  isPaid?: boolean
  tier?: string
  plan?: string
}

const PAID_PLAN_ALIASES = new Set(['paid', 'premium', 'pro', 'business', 'enterprise'])

function resolveTierFromPlanLikeValue(value: unknown): AccountTier | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized.length === 0) {
    return null
  }

  return PAID_PLAN_ALIASES.has(normalized) ? 'paid' : 'free'
}

function hasPaidClaim(claims: ParsedToken): boolean {
  if (claims.paid === true || claims.isPaid === true || claims.premium === true) {
    return true
  }

  const planTier = resolveTierFromPlanLikeValue(claims.plan) ?? resolveTierFromPlanLikeValue(claims.tier)
  return planTier === 'paid'
}

async function resolveTierFromFirestore(userId: string): Promise<AccountTier | null> {
  if (!db) {
    return null
  }

  const snapshot = await getDoc(doc(db, 'users', userId, 'account', 'profile'))
  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data() as AccountProfile
  if (data.isPaid === true) {
    return 'paid'
  }

  return resolveTierFromPlanLikeValue(data.tier) ?? resolveTierFromPlanLikeValue(data.plan)
}

export async function resolveAccountTier(user: User): Promise<AccountTier> {
  const token = await user.getIdTokenResult()
  if (hasPaidClaim(token.claims)) {
    return 'paid'
  }

  return (await resolveTierFromFirestore(user.uid)) ?? 'free'
}
