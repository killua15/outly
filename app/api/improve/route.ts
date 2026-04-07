import { NextRequest, NextResponse } from 'next/server'
import { improveIdea } from '@/lib/ai'
import type { OutlierVideo } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { video, locale = 'en' }: { video: OutlierVideo; locale: string } = await req.json()

    if (!video?.id) {
      return NextResponse.json({ error: 'Video is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 })
    }

    const improved = await improveIdea(video, locale)
    return NextResponse.json(improved)
  } catch (err) {
    console.error('Improve error:', err)
    const message = err instanceof Error ? err.message : 'Failed to improve idea'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
