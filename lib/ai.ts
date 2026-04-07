import OpenAI from 'openai'
import type { AIAnalysis, OutlierVideo } from '@/types'

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function analyzeOutlier(video: OutlierVideo): Promise<AIAnalysis> {
  const prompt = `You are an expert YouTube growth strategist. Analyze this viral video outlier and provide actionable insights.

Video: "${video.title}"
Channel: ${video.channelTitle}
Views: ${video.views.toLocaleString()} (${Math.round(video.multiplier)}x above channel average of ${video.avgViews.toLocaleString()})

Respond ONLY with a valid JSON object in this exact format:
{
  "whyExploded": "1-2 sentences explaining the specific reason this video massively outperformed",
  "pattern": "The viral pattern or formula this video used (e.g., 'curiosity gap + controversy', 'step-by-step transformation')",
  "howToReplicate": ["Step 1: specific action", "Step 2: specific action", "Step 3: specific action"],
  "newIdea": "A concrete, specific video idea you could make TODAY inspired by this pattern"
}`

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content ?? ''

  try {
    return JSON.parse(text) as AIAnalysis
  } catch {
    return {
      whyExploded: 'This video tapped into a high-demand topic with a compelling hook.',
      pattern: 'High curiosity gap + relatable problem + clear outcome',
      howToReplicate: [
        'Identify the core problem your audience faces',
        'Create a title that promises a specific transformation',
        'Open with the result, then explain how',
      ],
      newIdea: `Create a video inspired by "${video.title}" but with your unique angle and audience perspective.`,
    }
  }
}

export async function analyzeOutliersBatch(outliers: OutlierVideo[]): Promise<OutlierVideo[]> {
  const analyzed = await Promise.allSettled(
    outliers.slice(0, 5).map(async (outlier) => {
      const aiAnalysis = await analyzeOutlier(outlier)
      return { ...outlier, aiAnalysis }
    })
  )

  return analyzed.map((result, i) =>
    result.status === 'fulfilled' ? result.value : outliers[i]
  )
}
