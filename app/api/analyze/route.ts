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
    const { query } = await req.json()

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
    const analyzedOutliers = await analyzeOutliersBatch(outliers)

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
              why_exploded: o.aiAnalysis?.whyExploded,
              pattern: o.aiAnalysis?.pattern,
              how_to_replicate: o.aiAnalysis?.howToReplicate,
              new_idea: o.aiAnalysis?.newIdea,
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
