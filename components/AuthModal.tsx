'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { X, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = useTranslations('auth')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const { error: authErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authErr) throw authErr
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={18} />
        </button>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <h2 className="font-bold text-lg mb-1">{t('sentTitle')}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('sentDesc', { email })}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Mail size={18} className="text-orange-500" />
              <h2 className="font-bold text-lg">{t('title')}</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">{t('subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholder')}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? t('sending') : t('sendLink')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
