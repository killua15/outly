export interface Video {
  id: string
  title: string
  views: number
  publishedAt: string
  thumbnail: string
  channelTitle: string
}

export type PerformanceLabel = 'Exploding' | 'Spike' | 'Consistent'

export interface NextVideo {
  title: string
  hook: string
  structure: string[]
  cta: string
}

export interface TikTokIdea {
  hook: string
  concept: string
}

export interface AIAnalysis {
  whyExploded: string
  pattern: string
  howToReplicate: string[]
  newIdea: string
  nextVideo?: NextVideo
  tiktokIdeas?: TikTokIdea[]
}

export interface OutlierVideo extends Video {
  avgViews: number
  multiplier: number
  daysOld?: number
  performanceLabel?: PerformanceLabel
  aiAnalysis?: AIAnalysis
}

export interface SearchResult {
  id: string
  query: string
  queryType: 'channel' | 'keyword'
  outliers: OutlierVideo[]
  totalVideosAnalyzed: number
  avgViews: number
  createdAt: string
  isDemo?: boolean
}

export interface NicheData {
  slug: string
  label: string
  description: string
  keywords: string[]
  exampleOutliers: StaticOutlier[]
}

export interface StaticOutlier {
  title: string
  multiplier: number
  views: string
  whyExploded: string
  pattern: string
  howToReplicate: string[]
  newIdea: string
}
