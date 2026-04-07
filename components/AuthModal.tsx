'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { setProUser } from '@/lib/usage'
import { X, Mail, Loader2, CheckCircle, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  open: boolean
  onClose: () => void
  onSignedIn?: () => void
}

type Step = 'email' | 'code' | 'done'

export function AuthModal({ open, onClose, onSignedIn }: Props) {
  const t = useTranslations('auth')
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function handleClose() {
    // Reset state on close
    setStep('email')
    setEmail('')
    setCode('')
    setError(null)
    onClose()
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const { error: authErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      })
      if (authErr) throw authErr
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.length < 6) return
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      })
      if (verifyErr) throw verifyErr

      // Check Pro status
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
        if (profile?.plan === 'pro') setProUser()
      }

      setStep('done')
      setTimeout(() => {
        handleClose()
        onSignedIn?.()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('codeError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 relative shadow-xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Step: done */}
        {step === 'done' && (
          <div className="text-center py-4">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <h2 className="font-bold text-lg mb-1">{t('doneTitle')}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{t('doneDesc')}</p>
          </div>
        )}

        {/* Step: email */}
        {step === 'email' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Mail size={18} className="text-orange-500" />
              <h2 className="font-bold text-lg">{t('title')}</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">{t('subtitle')}</p>

            <form onSubmit={handleSendCode} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholder')}
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? t('sending') : t('sendCode')}
              </button>
            </form>
          </>
        )}

        {/* Step: code */}
        {step === 'code' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-orange-500" />
              <h2 className="font-bold text-lg">{t('codeTitle')}</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              {t('codeDesc', { email })}
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? t('verifying') : t('verify')}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(null); setCode('') }}
                className="w-full text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1"
              >
                {t('changeEmail')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
