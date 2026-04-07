'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { setProUser } from '@/lib/usage'
import { getSupabase } from '@/lib/supabase'
import { AuthModal } from '@/components/AuthModal'
import { CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function SuccessPage() {
  const t = useTranslations('success')
  const locale = useLocale()
  const [showAuth, setShowAuth] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function activate() {
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setIsLoggedIn(true)
          // Verify Pro status from DB and sync to localStorage
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', session.user.id)
            .single()
          if (profile?.plan === 'pro') {
            setProUser()
          }
        }
        // No session — user paid anonymously, needs to log in to claim Pro
      } catch { /* silent */ } finally {
        setChecking(false)
      }
    }
    activate()
  }, [])

  function handleSignedIn() {
    setIsLoggedIn(true)
    setShowAuth(false)
    setProUser()
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--muted-foreground)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onSignedIn={handleSignedIn} />

      <div className="max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/40 mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
        <p className="text-[var(--muted-foreground)] mb-8">{t('desc')}</p>

        {!isLoggedIn ? (
          // Anonymous user paid — needs to log in to activate Pro
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted-foreground)] bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-xl px-4 py-3">
              {t('loginToActivate')}
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {t('loginCta')}
            </button>
          </div>
        ) : (
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Image src="/logo.svg" alt="Outly" width={18} height={18} />
            {t('cta')}
          </Link>
        )}
      </div>
    </div>
  )
}
