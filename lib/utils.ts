import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${Math.round(views / 1_000)}K`
  return views.toLocaleString()
}

export function formatMultiplier(multiplier: number): string {
  return `${Math.round(multiplier)}x`
}

export function extractChannelId(input: string): { type: 'channel' | 'keyword'; value: string } {
  const channelPatterns = [
    /youtube\.com\/@([^/?]+)/,
    /youtube\.com\/channel\/([^/?]+)/,
    /youtube\.com\/c\/([^/?]+)/,
    /youtube\.com\/user\/([^/?]+)/,
  ]

  for (const pattern of channelPatterns) {
    const match = input.match(pattern)
    if (match) return { type: 'channel', value: match[1] }
  }

  if (input.startsWith('@')) return { type: 'channel', value: input.slice(1) }

  return { type: 'keyword', value: input.trim() }
}
