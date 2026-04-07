import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, ArrowLeft, Target, Lightbulb, Brain, Flame } from 'lucide-react'
import { getNicheBySlug, getAllNicheSlugs } from '@/lib/niches'

interface Props {
  params: Promise<{ niche: string }>
}

export async function generateStaticParams() {
  return getAllNicheSlugs().map((slug) => ({ niche: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche } = await params
  const data = getNicheBySlug(niche)
  if (!data) return {}

  return {
    title: `${data.label} YouTube Outliers — Viral Video Ideas | Outly`,
    description: `Discover which ${data.label.toLowerCase()} YouTube videos go viral. AI-powered breakdown of top outliers with step-by-step replication guides.`,
    keywords: [
      `${data.label.toLowerCase()} youtube video ideas`,
      `viral ${data.label.toLowerCase()} youtube`,
      `${data.label.toLowerCase()} youtube seo`,
      ...data.keywords,
    ],
    openGraph: {
      title: `Top Viral ${data.label} YouTube Videos — Outly`,
      description: data.description,
    },
  }
}

export default async function NichePage({ params }: Props) {
  const { niche } = await params
  const data = getNicheBySlug(niche)
  if (!data) notFound()

  const allSlugs = getAllNicheSlugs()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <TrendingUp size={20} className="text-orange-500" />
          Outly
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={14} />
          Analyze a channel
        </Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 px-3 py-1 rounded-full mb-4">
            <TrendingUp size={12} />
            Outlier Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Viral {data.label} YouTube Videos
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg">{data.description}</p>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-10">
          {data.keywords.map((kw) => (
            <Link
              key={kw}
              href={`/?q=${encodeURIComponent(kw)}`}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-orange-500/50 hover:text-orange-500 transition-colors"
            >
              {kw}
            </Link>
          ))}
        </div>

        {/* Outlier cards */}
        <div className="space-y-8">
          {data.exampleOutliers.map((outlier, i) => (
            <article
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
              itemScope
              itemType="https://schema.org/Article"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {outlier.multiplier}x avg views
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">{outlier.views} views</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug" itemProp="headline">
                    {outlier.title}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Flame size={14} className="text-orange-500" />
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Why it exploded</span>
                  </div>
                  <p className="text-sm pl-5">{outlier.whyExploded}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Brain size={14} className="text-blue-500" />
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Pattern</span>
                  </div>
                  <p className="text-sm pl-5 font-medium">{outlier.pattern}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Target size={14} className="text-green-500" />
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">How to replicate</span>
                  </div>
                  <ol className="text-sm pl-5 space-y-1">
                    {outlier.howToReplicate.map((step, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-orange-500 font-bold shrink-0">{j + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lightbulb size={14} className="text-orange-500" />
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Make this video now</span>
                  </div>
                  <p className="text-sm font-semibold pl-5">{outlier.newIdea}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-center">
          <h3 className="text-lg font-bold mb-2">
            Analyze any {data.label} channel live
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Paste a {data.label.toLowerCase()} YouTube channel URL and get real-time outlier analysis with AI insights.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Analyze a {data.label} channel →
          </Link>
        </div>

        {/* Related niches */}
        <div className="mt-10">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest font-semibold mb-3">
            Explore other niches
          </p>
          <div className="flex flex-wrap gap-2">
            {allSlugs.filter((s) => s !== niche).map((s) => (
              <Link
                key={s}
                href={`/outliers/${s}`}
                className="text-sm px-4 py-1.5 rounded-full border border-[var(--border)] hover:border-orange-500/50 hover:text-orange-500 transition-colors capitalize bg-[var(--muted)]"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-6 px-6 text-center text-xs text-[var(--muted-foreground)]">
        <p>© 2026 Outly — <Link href="/" className="hover:text-[var(--foreground)]">Find viral YouTube videos in any niche</Link></p>
      </footer>
    </div>
  )
}
