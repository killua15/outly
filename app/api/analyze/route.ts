import { NextRequest, NextResponse } from 'next/server'
import { analyzeQuery } from '@/lib/youtube'
import { analyzeOutliersBatch } from '@/lib/ai'
import { extractChannelId } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const FREE_LIMIT = 3

const hasSupabase = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

async function getDb() {
  if (!hasSupabase()) return null
  const { supabaseAdmin } = await import('@/lib/supabase')
  return supabaseAdmin()
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check and increment usage for authenticated users (profiles table).
 * Returns { allowed, remaining }
 */
async function checkAuthUsage(db: ReturnType<typeof import('@/lib/supabase')['supabaseAdmin']>, userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = todayDate()

  const { data: profile } = await db
    .from('profiles')
    .select('plan, searches_today, last_search_date')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }
  if (profile.plan === 'pro') return { allowed: true, remaining: Infinity }

  const count = profile.last_search_date === today ? (profile.searches_today ?? 0) : 0

  if (count >= FREE_LIMIT) return { allowed: false, remaining: 0 }

  await db
    .from('profiles')
    .update({ searches_today: count + 1, last_search_date: today })
    .eq('id', userId)

  return { allowed: true, remaining: FREE_LIMIT - (count + 1) }
}

/**
 * Check and increment usage for anonymous users (anon_usage table by IP).
 * Returns { allowed, remaining }
 */
async function checkAnonUsage(db: ReturnType<typeof import('@/lib/supabase')['supabaseAdmin']>, ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = todayDate()

  const { data: row } = await db
    .from('anon_usage')
    .select('searches_today, last_search_date')
    .eq('ip', ip)
    .single()

  const count = row?.last_search_date === today ? (row.searches_today ?? 0) : 0

  if (count >= FREE_LIMIT) return { allowed: false, remaining: 0 }

  await db
    .from('anon_usage')
    .upsert({ ip, searches_today: count + 1, last_search_date: today }, { onConflict: 'ip' })

  return { allowed: true, remaining: FREE_LIMIT - (count + 1) }
}

function mapOutlier(o: {
  video_id: string; title: string; views: number; avg_views: number; multiplier: number;
  thumbnail: string; channel_title: string; published_at: string; days_old: number; performance_label: string;
  why_exploded: string; pattern: string; how_to_replicate: string[]; new_idea: string;
  next_video_title: string; next_video_hook: string; next_video_structure: string[]; next_video_cta: string;
  tiktok_ideas: { hook: string; concept: string }[]; ai_analyzed: boolean;
  viral_score: number; score_hook: number; score_topic: number; score_repeatability: number;
  score_emotion: number; score_label: string; score_reason: string;
}) {
  return {
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
  }
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

    const db = await getDb()

    // --- Rate limiting (server-enforced) ---
    let remaining = FREE_LIMIT
    if (db) {
      // Check if authenticated
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      let userId: string | null = null

      if (token) {
        const { supabaseAdmin } = await import('@/lib/supabase')
        const { data: { user } } = await supabaseAdmin().auth.getUser(token)
        userId = user?.id ?? null
      }

      const { allowed, remaining: rem } = userId
        ? await checkAuthUsage(db, userId)
        : await checkAnonUsage(db, getClientIp(req))

      if (!allowed) {
        return NextResponse.json(
          { error: 'limit_reached', remaining: 0 },
          { status: 429 }
        )
      }
      remaining = rem
    }

    const { type, value } = extractChannelId(query.trim())

    // --- Cache check ---
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
          outliers: cached.outliers.map(mapOutlier),
          totalVideosAnalyzed: cached.total_videos_analyzed,
          avgViews: cached.avg_views,
          createdAt: cached.created_at,
          remaining,
          fromCache: true,
        })
      }
    }

    // --- YouTube + AI ---
    const { videos, outliers, avgViews } = await analyzeQuery(value, type)

    if (!outliers.length) {
      return NextResponse.json({
        query: value,
        queryType: type,
        outliers: [],
        totalVideosAnalyzed: videos.length,
        avgViews,
        remaining,
        message: 'No outliers found. Try a larger channel or broader keyword.',
      })
    }

    const analyzedOutliers = await analyzeOutliersBatch(outliers, locale)

    // --- Persist ---
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
            remaining,
            createdAt: new Date().toISOString(),
          })
        }
      } catch (dbErr) {
        console.error('Supabase persist error (non-fatal):', dbErr)
      }
    }

    return NextResponse.json({
      query: value,
      queryType: type,
      outliers: analyzedOutliers,
      totalVideosAnalyzed: videos.length,
      avgViews,
      remaining,
      createdAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
