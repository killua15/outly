import type { SearchResult } from '@/types'

export const DEMO_RESULT: SearchResult = {
  id: 'demo',
  query: 'fitness',
  queryType: 'keyword',
  totalVideosAnalyzed: 50,
  avgViews: 320000,
  createdAt: new Date().toISOString(),
  isDemo: true,
  outliers: [
    {
      id: 'demo_1',
      title: 'I Did 100 Push-Ups Every Day For 30 Days (Unexpected Results)',
      views: 5800000,
      avgViews: 320000,
      multiplier: 18.1,
      thumbnail: '',
      channelTitle: 'FitProgress',
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      daysOld: 12,
      performanceLabel: 'Exploding',
      aiAnalysis: {
        whyExploded:
          'Challenge + specific number + surprise outcome is the highest-converting formula in fitness. "Unexpected results" creates a curiosity gap that viewers feel compelled to close.',
        pattern: 'Specific daily challenge + fixed timeframe + curiosity gap title',
        howToReplicate: [
          'Pick a daily challenge with a specific, relatable number (100 reps, 5km, etc.)',
          'Document Day 1, Day 15, and Day 30 with visible, honest progress shots',
          'Title with the result hinted but not fully revealed ("unexpected", "this happened", "nobody told me")',
        ],
        newIdea: 'I Walked 10,000 Steps Every Day For 60 Days — My Doctor Was Surprised',
        nextVideo: {
          title: "I Did 100 Squats Every Day For 30 Days — Here's Exactly What Changed",
          hook: "On day one I could barely finish 50. By day 30, something happened that even my trainer couldn't explain.",
          structure: [
            'Opening: Day 1 raw footage — struggling, relatable, no filters',
            'Days 5-15: show the grind and small wins (time-lapse + voiceover)',
            'Day 25 reveal: the unexpected change (physical OR mental twist)',
            'Closing: the science behind why it happened + what you should try next',
          ],
          cta: "Comment what challenge YOU want me to do next — I'm picking the top reply.",
        },
        tiktokIdeas: [
          {
            hook: 'Watch what happens to your body after 30 days of 100 push-ups...',
            concept:
              'Before/after split-screen transformation with day counter — 30 seconds, ends on the surprise result',
          },
          {
            hook: 'Day 1 vs Day 30 — nobody warns you about THIS part',
            concept:
              'Focus on the unexpected mental side effect (discipline, confidence). The angle everyone ignores.',
          },
        ],
      },
    },
    {
      id: 'demo_2',
      title: 'The Exercise That Burns More Fat Than Running (Science-Backed)',
      views: 3900000,
      avgViews: 320000,
      multiplier: 12.2,
      thumbnail: '',
      channelTitle: 'FitProgress',
      publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      daysOld: 35,
      performanceLabel: 'Spike',
    },
    {
      id: 'demo_3',
      title: 'Fitness Influencers Are Lying About This (I Tested It For You)',
      views: 2100000,
      avgViews: 320000,
      multiplier: 6.6,
      thumbnail: '',
      channelTitle: 'FitProgress',
      publishedAt: new Date(Date.now() - 72 * 24 * 60 * 60 * 1000).toISOString(),
      daysOld: 72,
      performanceLabel: 'Consistent',
    },
  ],
}
