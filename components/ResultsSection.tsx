'use client'

import { formatViews } from '@/lib/utils'
import { OutlierCard } from './OutlierCard'
import type { SearchResult } from '@/types'
import { TrendingUp, BarChart2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  result: SearchResult
  isPro?: boolean
  onUpgradeClick?: () => void
}

export function ResultsSection({ result, isPro = false, onUpgradeClick }: Props) {
  const t = useTranslations('results')

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
          />
        ))}
      </div>

      {/* Upgrade CTA for free users */}
      {!isPro && result.outliers.length > 1 && (
        <div className="mt-6 p-5 rounded-2xl border-2 border-dashed border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/10 text-center">
          <p className="text-sm font-semibold mb-1">
            {t('unlockTitle', { count: result.outliers.length })}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">{t('unlockDesc')}</p>
          <button
            onClick={onUpgradeClick}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-colors"
          >
            {t('upgradeCta')}
          </button>
        </div>
      )}
    </div>
  )
}
