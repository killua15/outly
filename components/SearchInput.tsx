'use client'

import { useState, useRef } from 'react'
import { Search, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/types'
import { useTranslations, useLocale } from 'next-intl'

interface Props {
  onResult: (result: SearchResult) => void
  onError: (error: string) => void
  onLimitReached: () => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
  onBeforeSearch?: () => boolean
  authToken?: string | null
}

const EXAMPLES = ['MrBeast', '@veritasium', 'home workout routine', 'crypto investing 2024']

export function SearchInput({ onResult, onError, onLimitReached, isLoading, setIsLoading, onBeforeSearch, authToken }: Props) {
  const t = useTranslations('search')
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(q?: string) {
    const value = (q ?? query).trim()
    if (!value || isLoading) return
    if (onBeforeSearch && !onBeforeSearch()) return

    setIsLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: value, locale }),
      })

      const data = await res.json()

      if (res.status === 429) {
        onLimitReached()
        return
      }

      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      onResult(data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={cn(
        'relative flex items-center rounded-2xl border-2 transition-all bg-[var(--card)]',
        'border-[var(--border)] focus-within:border-orange-500 focus-within:shadow-lg focus-within:shadow-orange-500/10'
      )}>
        <Search size={18} className="absolute left-4 text-[var(--muted-foreground)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('placeholder')}
          className={cn(
            'flex-1 bg-transparent pl-11 pr-4 py-4 text-base outline-none',
            'placeholder:text-[var(--muted-foreground)]'
          )}
          disabled={isLoading}
          autoFocus
        />
        <button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || isLoading}
          className={cn(
            'mr-2 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
            'bg-orange-500 text-white hover:bg-orange-600 active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {t('analyze')}
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex)
              handleSubmit(ex)
            }}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border border-[var(--border)]',
              'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-orange-500/50',
              'transition-colors bg-[var(--muted)]'
            )}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
