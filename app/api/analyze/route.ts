import { NextRequest, NextResponse } from 'next/server'
import { analyzeQuery } from '@/lib/youtube'
import { analyzeOutliersBatch } from '@/lib/ai'
import { extractChannelId } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const hasSupabase = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

async function getDb() {
  if (!hasSupabase()) return null
  const { supabaseAdmin } = await import('@/lib/supabase')
  return supabaseAdmin()
}

export async function POST(req: NextRequest) {
  try {
    const { query, locale = 'en' } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube API key not configured. Add YOUTUBE_API_KEY in Vercel.' }, { status: 503 })
    }

    const { type, value } = extractChannelId(query.trim())
    const db = await getDb()

    // Check cache if Supabase is available
    if (db) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      const { data: cached } = await db
        .from('searches')
        .select('id, query, query_type, total_videos_analyzed, avg_views, created_at, outliers(*)')
        .eq('query', value)
        .gte('created_at', sixHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cached?.outliers?.length) {
        return NextResponse.json({
          id: cached.id,
          query: cached.query,
          queryType: cached.query_type,
          outliers: cached.outliers.map((o: {
            video_id: string; title: string; views: number; avg_views: number; multiplier: number;
            thumbnail: string; channel_title: string; published_at: string; days_old: number; performance_label: string;
            why_exploded: string; pattern: string; how_to_replicate: string[]; new_idea: string;
            next_video_title: string; next_video_hook: string; next_video_structure: string[]; next_video_cta: string;
            tiktok_ideas: { hook: string; concept: string }[]; ai_analyzed: boolean;
            viral_score: number; score_hook: number; score_topic: number; score_repeatability: number;
            score_emotion: number; score_label: string; score_reason: string;
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
            performanceLabel: o.performance_label,
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
                viralScore: o.viral_score != null ? {
                  score: o.viral_score,
                  breakdown: {
                    hook: o.score_hook,
                    topic: o.score_topic,
                    repeatability: o.score_repeatability,
                    emotion: o.score_emotion,
                  },
                  label: o.score_label,
                  reason: o.score_reason,
                } : undefined,
              } : undefined,
              tiktokIdeas: o.tiktok_ideas ?? undefined,
            } : undefined,
          })),
          totalVideosAnalyzed: cached.total_videos_analyzed,
          avgViews: cached.avg_views,
          createdAt: cached.created_at,
          fromCache: true,
        })
      }
    }

    // Fetch from YouTube
    const { videos, outliers, avgViews } = await analyzeQuery(value, type)

    if (!outliers.length) {
      return NextResponse.json({
        query: value,
        queryType: type,
        outliers: [],
        totalVideosAnalyzed: videos.length,
        avgViews,
        message: 'No outliers found. Try a larger channel or broader keyword.',
      })
    }

    // AI analysis
    const analyzedOutliers = await analyzeOutliersBatch(outliers, locale)

    // Persist to Supabase if available
    if (db) {
      try {
        const { data: search } = await db
          .from('searches')
          .insert({ query: value, query_type: type, total_videos_analyzed: videos.length, avg_views: avgViews })
          .select('id')
          .single()

        if (search?.id) {
          await db.from('outliers').insert(
            analyzedOutliers.map((o) => ({
              search_id: search.id,
              video_id: o.id,
              title: o.title,
              thumbnail: o.thumbnail,
              channel_title: o.channelTitle,
              views: o.views,
              avg_views: o.avgViews,
              multiplier: o.multiplier,
              published_at: o.publishedAt,
              days_old: o.daysOld,
              performance_label: o.performanceLabel,
              why_exploded: o.aiAnalysis?.whyExploded,
              pattern: o.aiAnalysis?.pattern,
              how_to_replicate: o.aiAnalysis?.howToReplicate,
              new_idea: o.aiAnalysis?.newIdea,
              next_video_title: o.aiAnalysis?.nextVideo?.title,
              next_video_hook: o.aiAnalysis?.nextVideo?.hook,
              next_video_structure: o.aiAnalysis?.nextVideo?.structure,
              next_video_cta: o.aiAnalysis?.nextVideo?.cta,
              tiktok_ideas: o.aiAnalysis?.tiktokIdeas,
              viral_score: o.aiAnalysis?.nextVideo?.viralScore?.score,
              score_hook: o.aiAnalysis?.nextVideo?.viralScore?.breakdown?.hook,
              score_topic: o.aiAnalysis?.nextVideo?.viralScore?.breakdown?.topic,
              score_repeatability: o.aiAnalysis?.nextVideo?.viralScore?.breakdown?.repeatability,
              score_emotion: o.aiAnalysis?.nextVideo?.viralScore?.breakdown?.emotion,
              score_label: o.aiAnalysis?.nextVideo?.viralScore?.label,
              score_reason: o.aiAnalysis?.nextVideo?.viralScore?.reason,
              ai_analyzed: !!o.aiAnalysis,
            }))
          )

          return NextResponse.json({
            id: search.id,
            query: value,
            queryType: type,
            outliers: analyzedOutliers,
            totalVideosAnalyzed: videos.length,
            avgViews,
            createdAt: new Date().toISOString(),
          })
        }
      } catch (dbErr) {
        console.error('Supabase persist error (non-fatal):', dbErr)
      }
    }

    // Return results without persistence
    return NextResponse.json({
      query: value,
      queryType: type,
      outliers: analyzedOutliers,
      totalVideosAnalyzed: videos.length,
      avgViews,
      createdAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
