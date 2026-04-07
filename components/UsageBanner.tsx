'use client'

import { useEffect, useState } from 'react'
import { getRemainingSearches, FREE_LIMIT } from '@/lib/usage'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Props {
  onUpgradeClick: () => void
  refreshKey?: number
}

export function UsageBanner({ onUpgradeClick, refreshKey }: Props) {
  const t = useTranslations('banner')
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    setRemaining(getRemainingSearches())
  }, [refreshKey])

  // Don't render until hydrated or if Pro
  if (remaining === null || remaining === Infinity) return null

  const used = FREE_LIMIT - remaining
  const pct = (used / FREE_LIMIT) * 100

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm',
      remaining === 0
        ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30'
        : remaining === 1
        ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800/30'
        : 'border-[var(--border)] bg-[var(--muted)]'
    )}>
      {/* Progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn(
            'font-medium',
            remaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--foreground)]'
          )}>
            {remaining === 0
              ? t('limitReached')
              : t('searchesLeft', { remaining })}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">{used}/{FREE_LIMIT}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              remaining === 0 ? 'bg-red-500' : remaining === 1 ? 'bg-orange-500' : 'bg-green-500'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={onUpgradeClick}
        className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors shrink-0"
      >
        <Zap size={12} />
        {t('goPro')}
      </button>
    </div>
  )
}
