'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { setProUser } from '@/lib/usage'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Suspense } from 'react'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    async function handleCallback() {
      try {
        const supabase = getSupabase()
        const token_hash = params.get('token_hash')
        const type = params.get('type') as 'magiclink' | 'email' | null

        if (token_hash && type) {
          // Exchange token hash for session
          const { error } = await supabase.auth.verifyOtp({ token_hash, type })
          if (error) throw error
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) throw new Error('No session found')

        // Check profile plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()

        if (profile?.plan === 'pro') {
          setProUser()
        }

        setStatus('success')
        setMessage(profile?.plan === 'pro' ? 'Pro access restored!' : 'Signed in successfully!')

        setTimeout(() => router.replace('/'), 1500)
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Authentication failed')
        setTimeout(() => router.replace('/'), 2500)
      }
    }

    handleCallback()
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-[var(--muted-foreground)]">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold">{message}</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={40} className="text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-red-500">{message}</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  )
}
