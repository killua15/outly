import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { OutlierCard } from '@/components/OutlierCard'
import type { OutlierVideo } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
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
  const { id } = await params
  const db = supabaseAdmin()

  const { data: search } = await db
    .from('searches')
    .select('id, query, query_type, total_videos_analyzed, avg_views, created_at, outliers(*)')
    .eq('id', id)
    .single()

  if (!search) notFound()

  const outliers: OutlierVideo[] = (search.outliers ?? []).map((o: {
    video_id: string; title: string; views: number; avg_views: number; multiplier: number;
    thumbnail: string; channel_title: string; published_at: string;
    why_exploded: string; pattern: string; how_to_replicate: string[]; new_idea: string; ai_analyzed: boolean;
  }) => ({
    id: o.video_id,
    title: o.title,
    views: o.views,
    avgViews: o.avg_views,
    multiplier: o.multiplier,
    thumbnail: o.thumbnail,
    channelTitle: o.channel_title,
    publishedAt: o.published_at,
    aiAnalysis: o.ai_analyzed ? {
      whyExploded: o.why_exploded,
      pattern: o.pattern,
      howToReplicate: o.how_to_replicate,
      newIdea: o.new_idea,
    } : undefined,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <TrendingUp size={20} className="text-orange-500" />
          Outly
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={14} />
          New analysis
        </Link>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-6">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest font-semibold mb-1">
            Analysis for
          </p>
          <h1 className="text-2xl font-bold">"{search.query}"</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {outliers.length} outliers from {search.total_videos_analyzed} videos
          </p>
        </div>

        <div className="space-y-4">
          {outliers.map((outlier, i) => (
            <OutlierCard key={outlier.id} outlier={outlier} index={i} isPro={true} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Analyze another channel →
          </Link>
        </div>
      </main>
    </div>
  )
}
