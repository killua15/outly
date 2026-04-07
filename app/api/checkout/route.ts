import { NextRequest, NextResponse } from 'next/server'
import { PLANS, type PlanId } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json().catch(() => ({ plan: 'annual' }))
    const planId: PlanId = (plan in PLANS) ? plan : 'annual'
    const selectedPlan = PLANS[planId]

    // If Stripe keys are configured, create dynamic checkout session
    if (process.env.STRIPE_SECRET_KEY && selectedPlan.priceId) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' })
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        const session = await stripe.checkout.sessions.create({
          mode: planId === 'lifetime' ? 'payment' : 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
          success_url: `${baseUrl}/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/?canceled=true`,
          metadata: { plan: planId },
        })

        return NextResponse.json({ url: session.url })
      } catch (err) {
        console.error('Checkout session error, using payment link:', err)
      }
    }

    // Fallback: Stripe Payment Link (works without env vars)
    return NextResponse.json({ url: selectedPlan.paymentLink })
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
