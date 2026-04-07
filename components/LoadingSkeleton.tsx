'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const STEPS = ['step1', 'step2', 'step3'] as const

export function LoadingSkeleton() {
  const t = useTranslations('home')
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {STEPS.map((key, i) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-500 ${
              i === step
                ? 'text-orange-500'
                : i < step
                ? 'text-green-500'
                : 'text-[var(--muted-foreground)]'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < step
                  ? 'bg-green-500 text-white'
                  : i === step
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'border border-[var(--border)] text-[var(--muted-foreground)]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{t(key)}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px transition-colors duration-500 ${i < step ? 'bg-green-500' : 'bg-[var(--border)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Skeleton cards */}
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden" style={{ opacity: 1 - i * 0.3 }}>
            <div className="flex gap-4 p-5">
              {/* Thumbnail skeleton */}
              <div className="w-32 h-[72px] rounded-lg bg-[var(--muted)] animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-[var(--muted)] animate-pulse" />
                  <div className="h-5 w-12 rounded-full bg-[var(--muted)] animate-pulse" />
                </div>
                <div className="h-4 w-3/4 rounded-lg bg-[var(--muted)] animate-pulse" />
                <div className="h-4 w-1/2 rounded-lg bg-[var(--muted)] animate-pulse" />
                <div className="h-3 w-1/3 rounded-lg bg-[var(--muted)] animate-pulse" />
              </div>
            </div>
            <div className="px-5 pb-5 border-t border-[var(--border)] pt-4 space-y-3">
              <div className="h-3 w-24 rounded bg-[var(--muted)] animate-pulse" />
              <div className="h-4 w-full rounded bg-[var(--muted)] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[var(--muted)] animate-pulse" />
              <div className="h-3 w-20 rounded bg-[var(--muted)] animate-pulse mt-4" />
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-[var(--muted)] animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-[var(--muted)] animate-pulse" />
                <div className="h-4 w-3/5 rounded bg-[var(--muted)] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
