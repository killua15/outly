'use client'

import Image from 'next/image'
import { formatViews, formatMultiplier, cn } from '@/lib/utils'
import type { OutlierVideo } from '@/types'
import { Flame, Brain, Target, Lightbulb, ExternalLink, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  outlier: OutlierVideo
  index: number
  isPro?: boolean
}

const MULTIPLIER_COLORS = {
  low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  mid: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function getMultiplierColor(m: number) {
  if (m >= 10) return MULTIPLIER_COLORS.high
  if (m >= 5) return MULTIPLIER_COLORS.mid
  return MULTIPLIER_COLORS.low
}

export function OutlierCard({ outlier, index, isPro = false }: Props) {
  const t = useTranslations('card')
  const showAI = isPro || index === 0
  const videoUrl = `https://www.youtube.com/watch?v=${outlier.id}`

  return (
    <div className={cn(
      'rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden',
      'transition-shadow hover:shadow-lg',
      index === 0 && 'ring-2 ring-orange-500/20'
    )}>
      {/* Thumbnail + header */}
      <div className="flex gap-4 p-5">
        {outlier.thumbnail && (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <div className="relative w-32 h-[72px] rounded-lg overflow-hidden bg-[var(--muted)]">
              <Image
                src={outlier.thumbnail}
                alt={outlier.title}
                fill
                className="object-cover"
              />
            </div>
          </a>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
              getMultiplierColor(outlier.multiplier)
            )}>
              {formatMultiplier(outlier.multiplier)}
            </span>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1">
            {outlier.title}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {formatViews(outlier.views)} views · {outlier.channelTitle}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      {outlier.aiAnalysis ? (
        <div className={cn('relative px-5 pb-5 space-y-4', !showAI && 'select-none')}>
          {!showAI && (
            <div className="absolute inset-0 backdrop-blur-sm bg-[var(--card)]/60 flex flex-col items-center justify-center z-10 rounded-b-2xl">
              <Lock size={20} className="text-[var(--muted-foreground)] mb-2" />
              <p className="text-sm font-medium mb-3">{t('unlockTitle')}</p>
              <button className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
                {t('upgradePro')}
              </button>
            </div>
          )}

          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex items-start gap-2 mb-1">
              <Flame size={14} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{t('whyExploded')}</p>
            </div>
            <p className="text-sm pl-5">{outlier.aiAnalysis.whyExploded}</p>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-1">
              <Brain size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{t('pattern')}</p>
            </div>
            <p className="text-sm pl-5">{outlier.aiAnalysis.pattern}</p>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-1">
              <Target size={14} className="text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{t('howToReplicate')}</p>
            </div>
            <ol className="text-sm pl-5 space-y-1">
              {outlier.aiAnalysis.howToReplicate.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-orange-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-1">
              <Lightbulb size={14} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">{t('makeThisVideo')}</p>
            </div>
            <p className="text-sm font-medium pl-5">{outlier.aiAnalysis.newIdea}</p>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5">
          <div className="border-t border-[var(--border)] pt-4 flex flex-col items-center gap-2 py-6">
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-2 rounded-full bg-[var(--muted)] animate-pulse" style={{ width: `${60 + i * 20}px`, animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{t('generating')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
