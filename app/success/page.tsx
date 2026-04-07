'use client'

import { useEffect } from 'react'
import { setProUser } from '@/lib/usage'
import { CheckCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  useEffect(() => {
    setProUser()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/40 mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">You're now on Pro</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Unlimited searches, full AI breakdowns on every outlier. Go find your next viral video.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <TrendingUp size={16} />
          Start analyzing →
        </Link>
      </div>
    </div>
  )
}
