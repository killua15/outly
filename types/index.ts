export interface Video {
  id: string
  title: string
  views: number
  publishedAt: string
  thumbnail: string
  channelTitle: string
}

export interface OutlierVideo extends Video {
  avgViews: number
  multiplier: number
  aiAnalysis?: AIAnalysis
}

export interface AIAnalysis {
  whyExploded: string
  pattern: string
  howToReplicate: string[]
  newIdea: string
}

export interface SearchResult {
  id: string
  query: string
  queryType: 'channel' | 'keyword'
  outliers: OutlierVideo[]
  totalVideosAnalyzed: number
  avgViews: number
  createdAt: string
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
