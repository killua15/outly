'use client'

import { formatViews } from '@/lib/utils'
import { OutlierCard } from './OutlierCard'
import type { SearchResult } from '@/types'
import { TrendingUp, BarChart2, Flame } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  result: SearchResult
  isPro?: boolean
  onUpgradeClick?: () => void
}

export function ResultsSection({ result, isPro = false, onUpgradeClick }: Props) {
  const t = useTranslations('results')
  const lockedCount = isPro ? 0 : Math.max(0, result.outliers.length - 1)

  if (!result.outliers.length) {
    return (
      <div className="text-center py-16">
        <BarChart2 size={40} className="mx-auto text-[var(--muted-foreground)] mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('noOutliersTitle')}</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">{t('noOutliersDesc')}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-500" />
          <span className="text-sm font-semibold">{t('outliersFound', { count: result.outliers.length })}</span>
          <span className="text-sm text-[var(--muted-foreground)]">{t('found')}</span>
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">
          {t('fromVideos', { count: result.totalVideosAnalyzed })}
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">
          {t('avgViews', { views: formatViews(result.avgViews) })}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {result.outliers.map((outlier, i) => (
          <OutlierCard
            key={outlier.id}
            outlier={outlier}
            index={i}
            isPro={isPro}
            onUpgradeClick={onUpgradeClick}
          />
        ))}
      </div>

      {/* FOMO banner */}
      {!isPro && lockedCount > 0 && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10">
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={16} className="text-orange-500" />
              <p className="text-sm font-bold text-[var(--foreground)]">
                {t('fomoTitle', { count: lockedCount })}
              </p>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">{t('fomoDesc')}</p>
            <button
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-500/20"
            >
              {t('fomoBtn', { count: lockedCount })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
