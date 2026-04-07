'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchInput } from '@/components/SearchInput'
import { ResultsSection } from '@/components/ResultsSection'
import { UpgradeModal } from '@/components/UpgradeModal'
import { UsageBanner } from '@/components/UsageBanner'
import { getUsage, incrementUsage, hasReachedLimit } from '@/lib/usage'
import type { SearchResult } from '@/types'
import { TrendingUp, Share2, Check } from 'lucide-react'
import Link from 'next/link'
import { EmailCapture } from '@/components/EmailCapture'

const NICHES = ['fitness', 'crypto', 'gaming', 'finance', 'cooking', 'tech', 'travel']

export default function Home() {
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<'limit' | 'blur' | 'manual'>('manual')
  const [isPro, setIsPro] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const { isPro: pro } = getUsage()
    setIsPro(pro)

    // Handle post-payment canceled state
    const params = new URLSearchParams(window.location.search)
    if (params.get('canceled') === 'true') {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  function handleResult(data: SearchResult) {
    setError(null)
    setResult(data)
    // Increment usage after successful search
    incrementUsage()
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
    if (!result?.id) return
    const url = `${window.location.origin}/analysis/${result.id}`
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
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        trigger={upgradeTrigger}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <TrendingUp size={20} className="text-orange-500" />
          Outly
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/outliers/fitness"
            className="hidden sm:block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Explore niches
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
              Go Pro — $9/mo
            </button>
          )}
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-start px-4">
        <div className="w-full max-w-2xl mx-auto pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 px-3 py-1 rounded-full mb-6">
            <TrendingUp size={12} />
            Outlier Finder for YouTube
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Find videos that{' '}
            <span className="gradient-text">explode in views</span>
            <br />in any niche
          </h1>

          <p className="text-[var(--muted-foreground)] text-lg mb-10 max-w-lg mx-auto">
            Enter a YouTube channel or keyword. Get the outlier videos with AI-powered breakdown on{' '}
            <strong className="text-[var(--foreground)]">exactly what to make next.</strong>
          </p>

          <SearchInput
            onResult={handleResult}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onBeforeSearch={handleSearchAttempt}
          />

          {/* Usage banner */}
          {!isPro && (
            <div className="mt-4">
              <UsageBanner onUpgradeClick={() => openUpgrade('limit')} />
            </div>
          )}

          {isLoading && (
            <div className="mt-10 space-y-2 text-[var(--muted-foreground)] text-sm">
              <p className="animate-pulse">Analyzing videos...</p>
              <div className="flex items-center justify-center gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div id="results" className="w-full pb-20">
            {/* Share button */}
            {result.id && (
              <div className="max-w-2xl mx-auto px-1 mb-3 flex justify-end">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
                  {copied ? 'Copied!' : 'Share this analysis'}
                </button>
              </div>
            )}
            <ResultsSection
              result={result}
              isPro={isPro}
              onUpgradeClick={() => openUpgrade('blur')}
            />
          </div>
        )}

        {!result && !isLoading && (
          <div className="w-full max-w-2xl mx-auto pb-20 mt-4">
            <p className="text-center text-xs text-[var(--muted-foreground)] mb-3 uppercase tracking-widest font-semibold">
              Or explore by niche
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {NICHES.map((niche) => (
                <Link
                  key={niche}
                  href={`/outliers/${niche}`}
                  className="text-sm px-4 py-2 rounded-full border border-[var(--border)] hover:border-orange-500/50 hover:text-orange-500 transition-colors capitalize bg-[var(--muted)]"
                >
                  {niche}
                </Link>
              ))}
            </div>

            <div className="mt-16 grid grid-cols-3 gap-4 text-center border-t border-[var(--border)] pt-10">
              {[
                { stat: '3x+', label: 'Minimum outlier threshold' },
                { stat: '< 10s', label: 'Time to first insight' },
                { stat: 'AI', label: 'Powered breakdown' },
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

      {/* FAQ for SEO */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            How to find viral YouTube video ideas
          </h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture strip */}
      <section className="border-t border-[var(--border)] py-10 px-4 bg-[var(--card)]">
        <div className="max-w-md mx-auto text-center">
          <p className="font-semibold mb-1">Get weekly viral video breakdowns</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Real outlier analyses, patterns, and ideas — free, every Friday.
          </p>
          <EmailCapture />
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6 px-6 text-center text-xs text-[var(--muted-foreground)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Outly. Built for YouTube creators.</p>
          <div className="flex gap-4">
            {NICHES.slice(0, 4).map((n) => (
              <Link
                key={n}
                href={`/outliers/${n}`}
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

const FAQ = [
  {
    q: 'What is a YouTube outlier video?',
    a: "An outlier video is one that performs significantly above the channel's average — typically 3x or more views. These videos reveal what content resonates most with an audience and what patterns can be replicated.",
  },
  {
    q: 'How does Outly find viral YouTube video ideas?',
    a: "Outly fetches the last 50 videos from any channel, calculates the average views, and flags videos that exceed 3x the average. It then uses AI to analyze why each outlier performed so well and generates a step-by-step replication guide.",
  },
  {
    q: 'Can I use Outly for YouTube SEO?',
    a: 'Yes. By identifying what content goes viral in your niche, you can reverse-engineer successful titles, hooks, and topics — which is the most effective form of YouTube SEO.',
  },
  {
    q: "What's the difference between free and Pro?",
    a: 'Free users get 3 searches per day and see the first AI breakdown. Pro users ($9/mo) get unlimited searches, full AI analysis on all outliers, and shareable analysis links.',
  },
]
