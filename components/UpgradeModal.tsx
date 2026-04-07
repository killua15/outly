'use client'

import { useState } from 'react'
import { X, Zap, CheckCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, type PlanId } from '@/lib/stripe'
import { useTranslations } from 'next-intl'

interface Props {
  open: boolean
  onClose: () => void
  trigger?: 'limit' | 'blur' | 'manual'
  authToken?: string | null
}

export function UpgradeModal({ open, onClose, trigger = 'manual', authToken }: Props) {
  const t = useTranslations('upgrade')
  const [selected, setSelected] = useState<PlanId>('annual')
  const FEATURES = [t('feat1'), t('feat2'), t('feat3'), t('feat4'), t('feat5')]

  async function handleCheckout() {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan: selected }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      window.location.href = PLANS[selected].paymentLink
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 mb-3">
            <Zap size={22} className="text-orange-500" />
          </div>
          {trigger === 'limit' ? (
            <>
              <h2 className="text-xl font-bold mb-1">{t('limitTitle')}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{t('limitDesc')}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">{t('defaultTitle')}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{t('defaultDesc')}</p>
            </>
          )}
        </div>

        {/* Plan selector */}
        <div className="space-y-2 mb-5">
          {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id as PlanId)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left',
                selected === plan.id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-[var(--border)] hover:border-orange-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  selected === plan.id ? 'border-orange-500' : 'border-[var(--muted-foreground)]'
                )}>
                  {selected === plan.id && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{plan.label}</span>
                    {plan.badge && (
                      <span className={cn(
                        'text-xs font-bold px-1.5 py-0.5 rounded-full',
                        plan.id === 'lifetime'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      )}>
                        {plan.id === 'lifetime' && <Star size={9} className="inline mr-0.5" />}
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{plan.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-lg">${plan.price}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{plan.period}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <ul className="space-y-1.5 mb-5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} className="text-green-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          className="w-full py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {t('cta')}
          {selected === 'lifetime' ? t('ctaLifetime') : selected === 'annual' ? t('ctaAnnual') : t('ctaMonthly')}
        </button>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
          {t('stripe')}
          {selected !== 'lifetime' && ` ${t('cancel')}`}
        </p>
      </div>
    </div>
  )
}
