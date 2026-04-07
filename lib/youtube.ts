import type { Video, PerformanceLabel } from '@/types'

const YT_API_KEY = process.env.YOUTUBE_API_KEY!
const YT_BASE = 'https://www.googleapis.com/youtube/v3'

async function ytFetch(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${YT_BASE}/${endpoint}`)
  url.searchParams.set('key', YT_API_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)
  return res.json()
}

async function getChannelId(handle: string): Promise<string> {
  const data = await ytFetch('channels', {
    forHandle: handle,
    part: 'id',
    maxResults: '1',
  })
  if (!data.items?.[0]) throw new Error(`Channel not found: ${handle}`)
  return data.items[0].id
}

async function getChannelVideos(channelId: string, maxResults = 50): Promise<Video[]> {
  const searchData = await ytFetch('search', {
    channelId,
    part: 'snippet',
    order: 'date',
    type: 'video',
    maxResults: String(maxResults),
  })

  if (!searchData.items?.length) return []

  const videoIds = searchData.items.map((i: { id: { videoId: string } }) => i.id.videoId).join(',')
  const statsData = await ytFetch('videos', {
    id: videoIds,
    part: 'statistics,snippet',
  })

  return statsData.items.map((item: {
    id: string
    snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } }; channelTitle: string }
    statistics: { viewCount?: string }
  }) => ({
    id: item.id,
    title: item.snippet.title,
    views: parseInt(item.statistics.viewCount || '0'),
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
  }))
}

async function getKeywordVideos(keyword: string, maxResults = 50): Promise<Video[]> {
  const searchData = await ytFetch('search', {
    q: keyword,
    part: 'snippet',
    type: 'video',
    order: 'relevance',
    maxResults: String(maxResults),
  })

  if (!searchData.items?.length) return []

  const videoIds = searchData.items.map((i: { id: { videoId: string } }) => i.id.videoId).join(',')
  const statsData = await ytFetch('videos', {
    id: videoIds,
    part: 'statistics,snippet',
  })

  return statsData.items.map((item: {
    id: string
    snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } }; channelTitle: string }
    statistics: { viewCount?: string }
  }) => ({
    id: item.id,
    title: item.snippet.title,
    views: parseInt(item.statistics.viewCount || '0'),
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
  }))
}

function getDaysOld(publishedAt: string): number {
  return Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24))
}

function getPerformanceLabel(multiplier: number, daysOld: number): PerformanceLabel {
  if (daysOld < 30 && multiplier >= 8) return 'Exploding'
  if (daysOld < 90 && multiplier >= 4) return 'Spike'
  return 'Consistent'
}

export function detectOutliers(videos: Video[], threshold = 3) {
  const withViews = videos.filter((v) => v.views > 0)
  if (withViews.length < 3) return { outliers: [], avgViews: 0 }

  const avgViews = Math.round(withViews.reduce((sum, v) => sum + v.views, 0) / withViews.length)
  const minViews = avgViews * threshold

  const outliers = withViews
    .filter((v) => v.views >= minViews)
    .map((v) => {
      const daysOld = getDaysOld(v.publishedAt)
      const multiplier = v.views / avgViews
      return {
        ...v,
        avgViews,
        multiplier,
        daysOld,
        performanceLabel: getPerformanceLabel(multiplier, daysOld),
      }
    })
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 10)

  return { outliers, avgViews }
}

export async function analyzeQuery(input: string, type: 'channel' | 'keyword') {
  let videos: Video[]

  if (type === 'channel') {
    let channelId = input
    if (!input.startsWith('UC')) {
      channelId = await getChannelId(input)
    }
    videos = await getChannelVideos(channelId)
  } else {
    videos = await getKeywordVideos(input)
  }

  const { outliers, avgViews } = detectOutliers(videos)
  return { videos, outliers, avgViews }
}
