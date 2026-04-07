import OpenAI from 'openai'
import type { AIAnalysis, ImprovedIdea, OutlierVideo } from '@/types'

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese (Brazilian)',
}

export async function analyzeOutlier(video: OutlierVideo, locale = 'en'): Promise<AIAnalysis> {
  const language = LANGUAGE_MAP[locale] ?? 'English'

  const prompt = `You are an expert YouTube growth strategist. Analyze this viral video outlier and generate actionable insights AND ready-to-use content scripts.

Video: "${video.title}"
Channel: ${video.channelTitle}
Views: ${video.views.toLocaleString()} (${Math.round(video.multiplier)}x above channel average of ${video.avgViews.toLocaleString()})

IMPORTANT: Respond ENTIRELY in ${language}. Every field must be in ${language}.

Respond ONLY with a valid JSON object in this exact format:
{
  "whyExploded": "1-2 sentences explaining the specific reason this video massively outperformed",
  "pattern": "The viral pattern or formula this video used (e.g., 'curiosity gap + controversy', 'step-by-step transformation')",
  "howToReplicate": ["Step 1: specific action", "Step 2: specific action", "Step 3: specific action"],
  "newIdea": "A concrete, specific video idea you could make TODAY inspired by this pattern",
  "nextVideo": {
    "title": "A ready-to-use YouTube title (high CTR, mirrors the viral pattern exactly)",
    "hook": "The exact first 3 seconds of the video — what to say or show immediately to grab attention",
    "structure": ["Opening: ...", "Middle: ...", "Reveal: ...", "Closing: ..."],
    "cta": "The exact call-to-action to say at the end of the video",
    "viralScore": {
      "score": 7.5,
      "breakdown": {
        "hook": 8,
        "topic": 7,
        "repeatability": 6,
        "emotion": 8
      },
      "label": "High",
      "reason": "Short explanation of why this idea has this viral potential score"
    }
  },
  "tiktokIdeas": [
    {
      "hook": "Exact opening line for a TikTok version (under 5 words, high pattern interrupt)",
      "concept": "30-60 second TikTok concept derived from this viral pattern"
    },
    {
      "hook": "Second TikTok hook — different angle from the same video",
      "concept": "Alternative TikTok format (trend, duet, POV, etc.)"
    }
  ]
}

For the viralScore inside nextVideo: evaluate the viral potential of the proposed next video idea. Be critical and realistic — not optimistic. Score from 1-10 based on: hook strength (does the hook grab attention?), topic virality (is this topic trending or evergreen?), repeatability (will viewers watch again or share?), emotion (does it trigger a strong emotional response?). Set label to "Low" if score < 5, "Medium" if 5-7, "High" if above 7.`

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1000,
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
      nextVideo: {
        title: `My Take On: ${video.title}`,
        hook: "Before I show you the result — let me tell you what nobody talks about with this topic.",
        structure: [
          'Open with the surprising outcome',
          'Rewind — show the starting point',
          'Document the key turning points',
          'Deliver the insight + practical takeaway',
        ],
        cta: 'Subscribe so you don\'t miss the next one — I post every week.',
        viralScore: {
          score: 6,
          breakdown: { hook: 6, topic: 6, repeatability: 5, emotion: 6 },
          label: 'Medium',
          reason: 'Solid concept based on a proven viral pattern, but needs a stronger hook to stand out.',
        },
      },
      tiktokIdeas: [
        {
          hook: 'Nobody talks about this...',
          concept: '60-second breakdown of the key insight from this video, ending with a cliffhanger',
        },
        {
          hook: 'POV: you finally figured out...',
          concept: 'First-person POV showing the moment of realization — relatable and shareable',
        },
      ],
    }
  }
}

export async function improveIdea(video: OutlierVideo, locale = 'en'): Promise<ImprovedIdea> {
  const language = LANGUAGE_MAP[locale] ?? 'English'
  const nextVideo = video.aiAnalysis?.nextVideo

  const prompt = `You are an expert YouTube content strategist. Take this existing video idea and improve it to maximize viral potential.

Original video that inspired this: "${video.title}" (${Math.round(video.multiplier)}x above average)
Current idea title: "${nextVideo?.title ?? video.title}"
Current hook: "${nextVideo?.hook ?? 'No hook yet'}"

IMPORTANT: Respond ENTIRELY in ${language}. Every field must be in ${language}.

Your task: Rewrite this idea with a stronger hook, more compelling title, and clearer concept. Make it punch harder.

Respond ONLY with a valid JSON object:
{
  "title": "Improved YouTube title — more curiosity, clearer outcome, higher CTR",
  "hook": "Stronger opening 3 seconds — more pattern interrupt, more specific",
  "concept": "2-3 sentences describing the improved video concept and why it will outperform",
  "viralScore": {
    "score": 8.5,
    "breakdown": {
      "hook": 9,
      "topic": 8,
      "repeatability": 7,
      "emotion": 9
    },
    "label": "High",
    "reason": "Why this improved version has higher viral potential than the original"
  }
}

Be critical: only increase the score if the improvement genuinely makes it more viral. Set label to "Low" if score < 5, "Medium" if 5-7, "High" if above 7.`

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    temperature: 0.8,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content ?? ''

  try {
    return JSON.parse(text) as ImprovedIdea
  } catch {
    return {
      title: `${nextVideo?.title ?? video.title} (Improved)`,
      hook: "Here's why everyone's getting this wrong — and what actually works:",
      concept: 'A stronger, more direct take on the same viral pattern with a punchier hook and clearer payoff.',
      viralScore: {
        score: 7,
        breakdown: { hook: 8, topic: 7, repeatability: 6, emotion: 7 },
        label: 'Medium',
        reason: 'Improved hook and framing give this better click-through potential.',
      },
    }
  }
}

export async function analyzeOutliersBatch(outliers: OutlierVideo[], locale = 'en'): Promise<OutlierVideo[]> {
  const analyzed = await Promise.allSettled(
    outliers.slice(0, 5).map(async (outlier) => {
      const aiAnalysis = await analyzeOutlier(outlier, locale)
      return { ...outlier, aiAnalysis }
    })
  )

  return analyzed.map((result, i) =>
    result.status === 'fulfilled' ? result.value : outliers[i]
  )
}
