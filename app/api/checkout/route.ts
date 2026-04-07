import { NextRequest, NextResponse } from 'next/server'
import { PLANS, type PlanId } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json().catch(() => ({ plan: 'annual' }))
    const planId: PlanId = (plan in PLANS) ? plan : 'annual'
    const selectedPlan = PLANS[planId]

    // Identify logged-in user from Authorization header
    let userId: string | null = null
    let userEmail: string | null = null

    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (token && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { supabaseAdmin } = await import('@/lib/supabase')
        const { data: { user } } = await supabaseAdmin().auth.getUser(token)
        if (user) {
          userId = user.id
          userEmail = user.email ?? null
        }
      } catch { /* silent */ }
    }

    if (process.env.STRIPE_SECRET_KEY && selectedPlan.priceId) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' })
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
          mode: planId === 'lifetime' ? 'payment' : 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
          success_url: `${baseUrl}/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/?canceled=true`,
          metadata: { plan: planId, user_id: userId ?? '' },
        }

        // Attach user identity to the session so the webhook can match reliably
        if (userId) sessionParams.client_reference_id = userId
        if (userEmail) sessionParams.customer_email = userEmail

        const session = await stripe.checkout.sessions.create(sessionParams)
        return NextResponse.json({ url: session.url })
      } catch (err) {
        console.error('Checkout session error, using payment link:', err)
      }
    }

    return NextResponse.json({ url: selectedPlan.paymentLink })
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
