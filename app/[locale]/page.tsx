'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchInput } from '@/components/SearchInput'
import { ResultsSection } from '@/components/ResultsSection'
import { UpgradeModal } from '@/components/UpgradeModal'
import { UsageBanner } from '@/components/UsageBanner'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { AuthModal } from '@/components/AuthModal'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { getUsage, incrementUsage, hasReachedLimit, setProUser } from '@/lib/usage'
import { getSupabase } from '@/lib/supabase'
import { DEMO_RESULT } from '@/lib/demo'
import type { SearchResult } from '@/types'
import { TrendingUp, Share2, Check, LogIn, LogOut, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { EmailCapture } from '@/components/EmailCapture'

const NICHES = ['fitness', 'crypto', 'gaming', 'finance', 'cooking', 'tech', 'travel']

export default function Home() {
  const t = useTranslations()
  const locale = useLocale()

  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<'limit' | 'blur' | 'manual'>('manual')
  const [isPro, setIsPro] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bannerKey, setBannerKey] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const { isPro: pro } = getUsage()
    setIsPro(pro)

    // Show demo result immediately
    setResult(DEMO_RESULT)

    const params = new URLSearchParams(window.location.search)
    if (params.get('canceled') === 'true') {
      window.history.replaceState({}, '', `/${locale}`)
    }

    async function syncAuth() {
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        setUserEmail(session.user.email ?? null)
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
        if (profile?.plan === 'pro') {
          setProUser()
          setIsPro(true)
        }
      } catch { /* silent */ }
    }
    syncAuth()
  }, [locale])

  function handleResult(data: SearchResult) {
    setError(null)
    setResult(data)
    incrementUsage()
    setBannerKey((k) => k + 1)
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  function handleError(msg: string) {
    setError(msg)
    setResult(null)
  }

  function handleSearchAttempt(): boolean {
    if (!isPro && hasReachedLimit()) {
      setUpgradeTrigger('limit')
      setShowUpgrade(true)
      return false
    }
    return true
  }

  function openUpgrade(trigger: 'limit' | 'blur' | 'manual' = 'manual') {
    setUpgradeTrigger(trigger)
    setShowUpgrade(true)
  }

  async function handleShare() {
    if (!result?.id || result.isDemo) return
    const url = `${window.location.origin}/${locale}/analysis/${result.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} trigger={upgradeTrigger} />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Image src="/logo.svg" alt="Outly" width={28} height={28} />
          Outly
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/outliers/fitness`}
            className="hidden sm:block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {t('nav.exploreNiches')}
          </Link>
          {isPro ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30 px-3 py-1 rounded-full">
              ✦ Pro
            </span>
          ) : (
            <button
              onClick={() => openUpgrade('manual')}
              className="hidden sm:block text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              {t('nav.goPro')}
            </button>
          )}
          {userEmail ? (
            <button
              onClick={async () => {
                const supabase = getSupabase()
                await supabase.auth.signOut()
                setUserEmail(null)
              }}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title={userEmail}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">{t('nav.signIn')}</span>
            </button>
          )}
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-start px-4">
        <div className="w-full max-w-2xl mx-auto pt-14 pb-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 px-3 py-1 rounded-full mb-6">
            <TrendingUp size={12} />
            {t('home.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {t('home.title1')}{' '}
            <span className="gradient-text">{t('home.titleHighlight')}</span>
          </h1>

          <p className="text-[var(--muted-foreground)] text-lg mb-10 max-w-lg mx-auto">
            {t('home.subtitle')}
          </p>

          <SearchInput
            onResult={handleResult}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onBeforeSearch={handleSearchAttempt}
          />

          {!isPro && (
            <div className="mt-4">
              <UsageBanner onUpgradeClick={() => openUpgrade('limit')} refreshKey={bannerKey} />
            </div>
          )}

          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && !isLoading && (
          <div id="results" className="w-full pb-20">
            {/* Demo or share header */}
            <div className="max-w-2xl mx-auto px-1 mb-3 flex items-center justify-between">
              {result.isDemo ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-3 py-1.5 rounded-full">
                  <Sparkles size={11} />
                  {t('home.demoLabel')}
                  <span className="font-normal text-orange-500/70">— {t('home.demoDesc')}</span>
                </div>
              ) : (
                <div />
              )}
              {result.id && !result.isDemo && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
                  {copied ? t('home.copied') : t('home.share')}
                </button>
              )}
            </div>

            <ResultsSection
              result={result}
              isPro={isPro}
              onUpgradeClick={() => openUpgrade('blur')}
            />
          </div>
        )}

        {/* Niche links (shown only when demo is displayed) */}
        {result?.isDemo && !isLoading && (
          <div className="w-full max-w-2xl mx-auto pb-8 mt-2">
            <p className="text-center text-xs text-[var(--muted-foreground)] mb-3 uppercase tracking-widest font-semibold">
              {t('home.exploreNiches')}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {NICHES.map((niche) => (
                <Link
                  key={niche}
                  href={`/${locale}/outliers/${niche}`}
                  className="text-sm px-4 py-2 rounded-full border border-[var(--border)] hover:border-orange-500/50 hover:text-orange-500 transition-colors capitalize bg-[var(--muted)]"
                >
                  {niche}
                </Link>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 text-center border-t border-[var(--border)] pt-10">
              {[
                { stat: '3x+', label: t('home.statThreshold') },
                { stat: '< 10s', label: t('home.statTime') },
                { stat: 'AI', label: t('home.statAi') },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-orange-500">{stat}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FAQ */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('home.faqTitle')}</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <h3 className="font-semibold mb-2">{t(`home.faq${n}q` as never)}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{t(`home.faq${n}a` as never)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="border-t border-[var(--border)] py-10 px-4 bg-[var(--card)]">
        <div className="max-w-md mx-auto text-center">
          <p className="font-semibold mb-1">{t('home.emailTitle')}</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">{t('home.emailSubtitle')}</p>
          <EmailCapture />
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6 px-6 text-center text-xs text-[var(--muted-foreground)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>{t('home.footerText')}</p>
          <div className="flex gap-4">
            {NICHES.slice(0, 4).map((n) => (
              <Link
                key={n}
                href={`/${locale}/outliers/${n}`}
                className="hover:text-[var(--foreground)] transition-colors capitalize"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
