import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase'
import { OutlierCard } from '@/components/OutlierCard'
import { ShareButton } from '@/components/ShareButton'
import { getTranslations } from 'next-intl/server'
import type { OutlierVideo } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const db = supabaseAdmin()
  const { data } = await db.from('searches').select('query').eq('id', id).single()

  return {
    title: data ? `Outliers for "${data.query}" — Outly` : 'Outly Analysis',
    description: 'Viral YouTube video outlier analysis with AI-powered replication guide.',
  }
}

export default async function AnalysisPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations('analysis')
  const db = supabaseAdmin()

  const { data: search } = await db
    .from('searches')
    .select('id, query, query_type, total_videos_analyzed, avg_views, created_at, outliers(*)')
    .eq('id', id)
    .single()

  if (!search) notFound()

  const outliers: OutlierVideo[] = (search.outliers ?? []).map((o: {
    video_id: string; title: string; views: number; avg_views: number; multiplier: number;
    thumbnail: string; channel_title: string; published_at: string; days_old: number; performance_label: string;
    why_exploded: string; pattern: string; how_to_replicate: string[]; new_idea: string;
    next_video_title: string; next_video_hook: string; next_video_structure: string[]; next_video_cta: string;
    tiktok_ideas: { hook: string; concept: string }[]; ai_analyzed: boolean;
  }) => ({
    id: o.video_id,
    title: o.title,
    views: o.views,
    avgViews: o.avg_views,
    multiplier: o.multiplier,
    thumbnail: o.thumbnail,
    channelTitle: o.channel_title,
    publishedAt: o.published_at,
    daysOld: o.days_old,
    performanceLabel: o.performance_label as OutlierVideo['performanceLabel'],
    aiAnalysis: o.ai_analyzed ? {
      whyExploded: o.why_exploded,
      pattern: o.pattern,
      howToReplicate: o.how_to_replicate,
      newIdea: o.new_idea,
      nextVideo: o.next_video_title ? {
        title: o.next_video_title,
        hook: o.next_video_hook,
        structure: o.next_video_structure ?? [],
        cta: o.next_video_cta,
      } : undefined,
      tiktokIdeas: o.tiktok_ideas ?? undefined,
    } : undefined,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full border-b border-[var(--border)]">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Image src="/logo.svg" alt="Outly" width={24} height={24} />
          Outly
        </Link>
        <Link href={`/${locale}`} className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={14} />
          {t('newAnalysis')}
        </Link>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest font-semibold mb-1">
                {t('analysisFor')}
              </p>
              <h1 className="text-2xl font-bold">"{search.query}"</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {t('outliersFrom', { count: outliers.length, total: search.total_videos_analyzed })}
              </p>
            </div>
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://outly.app'}/${locale}/analysis/${search.id}`}
              query={search.query}
              outliersCount={outliers.length}
            />
          </div>
        </div>

        <div className="space-y-4">
          {outliers.map((outlier, i) => (
            <OutlierCard key={outlier.id} outlier={outlier} index={i} isPro={true} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {t('analyzeAnother')}
          </Link>
        </div>
      </main>
    </div>
  )
}
