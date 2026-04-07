import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Stripe Payment Link (created via Stripe Dashboard / MCP)
// To upgrade to full Checkout sessions, set STRIPE_SECRET_KEY + STRIPE_PRO_PRICE_ID
const PAYMENT_LINK = process.env.STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/8x2cN42zK5aB7v760tfIs0b'

export async function POST() {
  // If Stripe keys are configured, use dynamic checkout sessions
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID) {
    try {
      const { stripe } = await import('@/lib/stripe')
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?canceled=true`,
        metadata: { plan: 'pro' },
      })

      return NextResponse.json({ url: session.url })
    } catch (err) {
      console.error('Checkout session error, falling back to payment link:', err)
    }
  }

  // Fallback: redirect to Stripe Payment Link
  return NextResponse.json({ url: PAYMENT_LINK })
}
