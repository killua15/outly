'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatViews, formatMultiplier, cn } from '@/lib/utils'
import type { DifficultyLevel, ImprovedIdea, OutlierVideo, ViralScore } from '@/types'
import {
  Flame, Brain, Target, Lightbulb, ExternalLink, Lock,
  Clapperboard, Smartphone, Copy, Check, Zap, Sparkles, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface Props {
  outlier: OutlierVideo
  index: number
  isPro?: boolean
  onUpgradeClick?: () => void
}

// ─── Score color helpers ───────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 8) return 'text-green-500'
  if (score >= 5) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBarColor(score: number) {
  if (score >= 8) return 'bg-green-500'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-red-500'
}

function getLabelColors(label: string) {
  if (label === 'High') return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
  if (label === 'Medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
  return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
}

function getDifficultyColors(d: DifficultyLevel) {
  if (d === 'Easy') return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
  if (d === 'Medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
  return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
}

function getDifficultyDot(d: DifficultyLevel) {
  if (d === 'Easy') return 'bg-green-500'
  if (d === 'Medium') return 'bg-yellow-500'
  return 'bg-red-500'
}

// ─── Viral Score Badge ─────────────────────────────────────────────────────

function ViralScoreBadge({
  vs,
  t,
  onImprove,
  improving,
}: {
  vs: ViralScore
  t: ReturnType<typeof useTranslations<'card'>>
  onImprove?: () => void
  improving?: boolean
}) {
  const labelKey = vs.label === 'High' ? 'viralScoreHigh' : vs.label === 'Medium' ? 'viralScoreMedium' : 'viralScoreLow'

  const bars: [string, number][] = [
    [t('scoreHook'), vs.breakdown.hook],
    [t('scoreTopic'), vs.breakdown.topic],
    [t('scoreRepeatability'), vs.breakdown.repeatability],
    [t('scoreEmotion'), vs.breakdown.emotion],
  ]

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--muted)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-purple-500 shrink-0" />
          <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
            {t('viralScore')}
          </span>
        </div>
        <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', getLabelColors(vs.label))}>
          {t(labelKey as never)}
        </span>
      </div>

      {/* Score + confidence */}
      <div className="px-4 pt-4 pb-3 flex items-end gap-3">
        <span className={cn('text-6xl font-black tabular-nums leading-none', getScoreColor(vs.score))}>
          {vs.score.toFixed(1)}
        </span>
        <div className="pb-1">
          <span className="text-xl text-[var(--muted-foreground)]">/10</span>
          {vs.confidence != null && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {t('confidence')}: <span className="font-semibold text-[var(--foreground)]">{vs.confidence}%</span>
            </p>
          )}
        </div>
      </div>

      {/* Score bars */}
      <div className="px-4 pb-3 space-y-2">
        {bars.map(([label, val]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] w-16 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getScoreBarColor(val))}
                style={{ width: `${val * 10}%` }}
              />
            </div>
            <span className={cn('text-xs font-bold w-4 text-right tabular-nums', getScoreColor(val))}>{val}</span>
          </div>
        ))}
      </div>

      {/* Reason */}
      <div className="px-4 pb-3 border-t border-[var(--border)] pt-2.5">
        <p className="text-xs text-[var(--muted-foreground)] italic">{vs.reason}</p>
      </div>

      {/* Urgency signal */}
      <div className="px-4 pb-3">
        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
          {t('urgencySignal')}
        </p>
      </div>

      {/* Improve button — primary CTA */}
      {onImprove && (
        <div className="px-4 pb-4">
          <button
            onClick={onImprove}
            disabled={improving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition-colors active:scale-95"
          >
            {improving ? (
              <><Zap size={14} className="animate-pulse" />{t('improving')}</>
            ) : (
              <><Zap size={14} />⚡ {t('improveIdea')}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Copy button ───────────────────────────────────────────────────────────

function CopyButton({ textToCopy, label, copiedLabel }: { textToCopy: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] hover:text-orange-500 transition-colors"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? copiedLabel : label}
    </button>
  )
}

// ─── Main card ─────────────────────────────────────────────────────────────

export function OutlierCard({ outlier, index, isPro = false, onUpgradeClick }: Props) {
  const t = useTranslations('card')
  const locale = useLocale()
  const showAI = isPro || index === 0
  const isDemo = outlier.id.startsWith('demo_')
  const isOld = (outlier.daysOld ?? 0) > 365
  const videoUrl = isDemo ? '#' : `https://www.youtube.com/watch?v=${outlier.id}`

  const [improving, setImproving] = useState(false)
  const [improved, setImproved] = useState<ImprovedIdea | null>(null)

  const labelStyles: Record<string, string> = {
    Exploding: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    Spike: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    Consistent: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  }

  const labelKey = outlier.performanceLabel
    ? ({ Exploding: 'labelExploding', Spike: 'labelSpike', Consistent: 'labelConsistent' }[outlier.performanceLabel])
    : null

  const nextVideoText = outlier.aiAnalysis?.nextVideo
    ? `Title: ${outlier.aiAnalysis.nextVideo.title}\n\nHook: ${outlier.aiAnalysis.nextVideo.hook}\n\nStructure:\n${outlier.aiAnalysis.nextVideo.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nCTA: ${outlier.aiAnalysis.nextVideo.cta}`
    : ''

  async function handleImprove() {
    if (improving) return
    setImproving(true)
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: outlier, locale }),
      })
      if (res.ok) setImproved(await res.json())
    } catch { /* silent */ } finally {
      setImproving(false)
    }
  }

  return (
    <div className={cn(
      'rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden transition-shadow hover:shadow-lg',
      index === 0 && 'ring-2 ring-orange-500/20'
    )}>

      {/* Old content warning */}
      {isOld && (
        <div className="flex items-center gap-2 px-5 py-2 bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800/30">
          <AlertTriangle size={13} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">{t('oldContentWarning')}</p>
        </div>
      )}

      {/* Thumbnail + header */}
      <div className="flex gap-4 p-5">
        {outlier.thumbnail ? (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <div className="relative w-32 h-[72px] rounded-lg overflow-hidden bg-[var(--muted)]">
              <Image src={outlier.thumbnail} alt={outlier.title} fill className="object-cover" />
            </div>
          </a>
        ) : (
          <div className="w-32 h-[72px] rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/30 dark:to-orange-900/10 border border-orange-200/50 dark:border-orange-800/20 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-orange-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Multiplier — "28x acima da média" */}
              <span className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                outlier.multiplier >= 10
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : outlier.multiplier >= 5
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              )}>
                {formatMultiplier(outlier.multiplier)} {t('multiplierSuffix')}
              </span>
              {/* Performance label */}
              {labelKey && (
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', labelStyles[outlier.performanceLabel!])}>
                  {t(labelKey as never)}
                </span>
              )}
            </div>
            {!isDemo && (
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1">{outlier.title}</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {formatViews(outlier.views)} views · {outlier.channelTitle}
            {outlier.daysOld !== undefined && ` · ${t('daysAgo', { days: outlier.daysOld })}`}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      {outlier.aiAnalysis ? (
        <div className={cn('relative px-5 pb-5 space-y-4', !showAI && 'select-none')}>

          {/* Locked overlay */}
          {!showAI && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-b-2xl"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--card) 30%)' }}
            >
              <div className="mt-16 flex flex-col items-center gap-3 text-center px-6">
                <div className="p-2.5 rounded-full bg-orange-100 dark:bg-orange-950/40">
                  <Lock size={18} className="text-orange-500" />
                </div>
                <p className="text-sm font-semibold">{t('lockedMessage')}</p>
                <button
                  onClick={onUpgradeClick}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                >
                  {t('lockedCta')}
                </button>
              </div>
            </div>
          )}

          {/* Why it exploded */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex items-start gap-2 mb-1">
              <Flame size={14} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{t('whyExploded')}</p>
            </div>
            <p className="text-sm pl-5">{outlier.aiAnalysis.whyExploded}</p>
          </div>

          {/* Pattern */}
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Brain size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{t('pattern')}</p>
            </div>
            <p className="text-sm pl-5">{outlier.aiAnalysis.pattern}</p>
          </div>

          {/* How to replicate */}
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

          {/* Make this video */}
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-1">
              <Lightbulb size={14} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">{t('makeThisVideo')}</p>
            </div>
            <p className="text-sm font-medium pl-5">{outlier.aiAnalysis.newIdea}</p>
          </div>

          {/* Next Video section */}
          {outlier.aiAnalysis.nextVideo && (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--muted)] border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Clapperboard size={14} className="text-purple-500" />
                  <span className="text-xs font-semibold text-[var(--foreground)]">{t('nextVideo')}</span>
                  {improved && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
                      {t('improvedBadge')}
                    </span>
                  )}
                </div>
                {showAI && (
                  <CopyButton textToCopy={nextVideoText} label={t('copyScript')} copiedLabel={t('scriptCopied')} />
                )}
              </div>

              {improved ? (
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">{t('videoTitle')}</p>
                    <p className="font-semibold">"{improved.title}"</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">{t('hook')}</p>
                    <p className="italic border-l-2 border-purple-400 pl-3">{improved.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Concept</p>
                    <p className="text-[var(--foreground)]">{improved.concept}</p>
                  </div>
                  {improved.viralScore && (
                    <ViralScoreBadge vs={improved.viralScore} t={t} />
                  )}
                  <button
                    onClick={() => setImproved(null)}
                    className="w-full text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1"
                  >
                    {t('backToOriginal')}
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">{t('videoTitle')}</p>
                    <p className="font-semibold">"{outlier.aiAnalysis.nextVideo.title}"</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">{t('hook')}</p>
                    <p className="italic border-l-2 border-orange-400 pl-3">{outlier.aiAnalysis.nextVideo.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">{t('structure')}</p>
                    <ol className="space-y-1">
                      {outlier.aiAnalysis.nextVideo.structure.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-purple-500 font-bold shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">{t('cta')}</p>
                    <p className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 rounded-lg px-3 py-2 text-xs italic">
                      "{outlier.aiAnalysis.nextVideo.cta}"
                    </p>
                  </div>

                  {/* Difficulty badge */}
                  {outlier.aiAnalysis.nextVideo.difficulty && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-[var(--muted-foreground)]">{t('difficulty')}:</span>
                      <span className={cn('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', getDifficultyColors(outlier.aiAnalysis.nextVideo.difficulty))}>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', getDifficultyDot(outlier.aiAnalysis.nextVideo.difficulty))} />
                        {t((`difficulty${outlier.aiAnalysis.nextVideo.difficulty}`) as never)}
                      </span>
                    </div>
                  )}

                  {/* Viral Score + Improve button */}
                  {outlier.aiAnalysis.nextVideo.viralScore && showAI && (
                    <ViralScoreBadge
                      vs={outlier.aiAnalysis.nextVideo.viralScore}
                      t={t}
                      onImprove={handleImprove}
                      improving={improving}
                    />
                  )}

                  {/* Improve button fallback if no viral score */}
                  {!outlier.aiAnalysis.nextVideo.viralScore && showAI && (
                    <button
                      onClick={handleImprove}
                      disabled={improving}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition-colors"
                    >
                      {improving ? <><Zap size={14} className="animate-pulse" />{t('improving')}</> : <><Zap size={14} />⚡ {t('improveIdea')}</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TikTok Ideas */}
          {outlier.aiAnalysis.tiktokIdeas && outlier.aiAnalysis.tiktokIdeas.length > 0 && (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] border-b border-[var(--border)]">
                <Smartphone size={14} className="text-pink-500" />
                <span className="text-xs font-semibold">{t('tiktok')}</span>
              </div>
              <div className="p-4 space-y-3">
                {outlier.aiAnalysis.tiktokIdeas.map((idea, i) => (
                  <div key={i} className={cn('space-y-1', i > 0 && 'pt-3 border-t border-[var(--border)]')}>
                    <p className="text-xs font-bold text-pink-600 dark:text-pink-400">
                      Hook: <span className="italic font-normal">"{idea.hook}"</span>
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">{idea.concept}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
