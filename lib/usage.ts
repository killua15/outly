'use client'

const STORAGE_KEY = 'outly_usage'
const FREE_LIMIT = 3

interface UsageData {
  count: number
  date: string // YYYY-MM-DD
  isPro: boolean
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function getUsage(): UsageData {
  if (typeof window === 'undefined') return { count: 0, date: today(), isPro: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, date: today(), isPro: false }
    const data: UsageData = JSON.parse(raw)
    // Reset counter daily
    if (data.date !== today()) return { count: 0, date: today(), isPro: data.isPro }
    return data
  } catch {
    return { count: 0, date: today(), isPro: false }
  }
}

export function incrementUsage(): UsageData {
  const current = getUsage()
  const updated = { ...current, count: current.count + 1, date: today() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function setProUser(): void {
  const current = getUsage()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, isPro: true }))
}

export function getRemainingSearches(): number {
  const { count, isPro } = getUsage()
  if (isPro) return Infinity
  return Math.max(0, FREE_LIMIT - count)
}

export function hasReachedLimit(): boolean {
  const { count, isPro } = getUsage()
  return !isPro && count >= FREE_LIMIT
}

export { FREE_LIMIT }
