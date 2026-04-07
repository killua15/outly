'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  url: string
  query: string
  outliersCount: number
}

export function ShareButton({ url, query, outliersCount }: Props) {
  const t = useTranslations('analysis')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleTweet() {
    const text = `Found ${outliersCount} viral outlier videos for "${query}" using @OutlyApp 🔥\n\nSee the full AI breakdown:`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] px-3 py-1.5 rounded-lg transition-colors bg-[var(--card)]"
      >
        {copied ? <Check size={12} className="text-green-500" /> : <Share2 size={12} />}
        {copied ? t('linkCopied') : t('copyLink')}
      </button>
      <button
        onClick={handleTweet}
        className="flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 border border-sky-200 dark:border-sky-800/40 bg-sky-50 dark:bg-sky-950/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        <span className="font-bold text-[11px]">𝕏</span>
        {t('tweetBtn')}
      </button>
    </div>
  )
}
