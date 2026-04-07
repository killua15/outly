'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export function EmailCapture({ className }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status !== 'idle') return

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (status === 'done') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-green-600 dark:text-green-400', className)}>
        <Check size={16} />
        <span>You're in! Check your inbox for tips.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={cn(
            'w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)]',
            'outline-none focus:border-orange-500 transition-colors placeholder:text-[var(--muted-foreground)]'
          )}
        />
      </div>
      <button
        type="submit"
        disabled={!email.trim() || status === 'loading'}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold',
          'bg-orange-500 hover:bg-orange-600 text-white transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {status === 'loading' ? (
          <Loader2 size={14} className="animate-spin" />
        ) : status === 'error' ? (
          'Try again'
        ) : (
          <>Get tips <ArrowRight size={13} /></>
        )}
      </button>
    </form>
  )
}
