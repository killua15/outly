'use client'

import { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { setProUser } from '@/lib/usage'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function SuccessPage() {
  const t = useTranslations('success')
  const locale = useLocale()

  useEffect(() => {
    setProUser()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/40 mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
        <p className="text-[var(--muted-foreground)] mb-8">{t('desc')}</p>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Image src="/logo.svg" alt="Outly" width={18} height={18} />
          {t('cta')}
        </Link>
      </div>
    </div>
  )
}
