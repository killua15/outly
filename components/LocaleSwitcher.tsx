'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
]

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(next: string) {
    // pathname is like /en/... or /es/... — replace the first segment
    const segments = pathname.split('/')
    segments[1] = next
    router.replace(segments.join('/') || '/')
  }

  return (
    <div className="flex items-center gap-0.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg p-0.5">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
            locale === code
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
