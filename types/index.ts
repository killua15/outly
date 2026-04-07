export interface Video {
  id: string
  title: string
  views: number
  publishedAt: string
  thumbnail: string
  channelTitle: string
}

export type PerformanceLabel = 'Exploding' | 'Spike' | 'Consistent'
export type ScoreLabel = 'Low' | 'Medium' | 'High'

export interface ScoreBreakdown {
  hook: number
  topic: number
  repeatability: number
  emotion: number
}

export interface ViralScore {
  score: number
  breakdown: ScoreBreakdown
  label: ScoreLabel
  reason: string
}

export interface NextVideo {
  title: string
  hook: string
  structure: string[]
  cta: string
  viralScore?: ViralScore
}

export interface TikTokIdea {
  hook: string
  concept: string
}

export interface ImprovedIdea {
  title: string
  hook: string
  concept: string
  viralScore: ViralScore
}

export interface AIAnalysis {
  whyExploded: string
  pattern: string
  howToReplicate: string[]
  newIdea: string
  nextVideo?: NextVideo
  tiktokIdeas?: TikTokIdea[]
  improvedIdea?: ImprovedIdea
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
