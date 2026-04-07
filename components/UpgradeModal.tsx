'use client'

import { useState } from 'react'
import { X, Zap, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  trigger?: 'limit' | 'blur' | 'manual'
}

const FEATURES = [
  'Unlimited searches per day',
  'Full AI breakdown on all outliers',
  'Step-by-step replication guides',
  '7 niche explorer pages',
]

export function UpgradeModal({ open, onClose, trigger = 'manual' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl',
        'animate-in fade-in zoom-in-95 duration-200'
      )}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 mb-3">
            <Zap size={22} className="text-orange-500" />
          </div>

          {trigger === 'limit' ? (
            <>
              <h2 className="text-xl font-bold mb-1">You've used your 3 free searches</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Upgrade to Pro for unlimited outlier analysis.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Unlock full AI breakdown</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                See why every outlier exploded — and exactly how to replicate it.
              </p>
            </>
          )}
        </div>

        {/* Price */}
        <div className="text-center mb-5">
          <span className="text-4xl font-bold">$9</span>
          <span className="text-[var(--muted-foreground)] text-sm">/month</span>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle size={15} className="text-green-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600',
            'transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Redirecting...
            </>
          ) : (
            'Upgrade to Pro →'
          )}
        </button>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
          Cancel anytime · Secure checkout via Stripe
        </p>
      </div>
    </div>
  )
}
