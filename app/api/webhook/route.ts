import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' })
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = supabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const customerId = session.customer as string
      const email = session.customer_details?.email
      // client_reference_id is the Supabase user ID (set in /api/checkout when logged in)
      const userId = session.client_reference_id

      if (userId) {
        // Logged-in user — update directly by user ID (most reliable)
        await db
          .from('profiles')
          .update({ plan: 'pro', stripe_customer_id: customerId })
          .eq('id', userId)
      } else if (email) {
        // Anonymous user — try to find existing profile by email
        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (profile?.id) {
          // Profile exists — mark as pro
          await db
            .from('profiles')
            .update({ plan: 'pro', stripe_customer_id: customerId })
            .eq('id', profile.id)
        } else {
          // No account yet — save in pending_pro so it activates on first login
          await db
            .from('pending_pro')
            .upsert({ email, stripe_customer_id: customerId }, { onConflict: 'email' })
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const customerId = sub.customer as string
      await db
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.updated': {
      // Handle plan reactivation (e.g. unpause)
      const sub = event.data.object
      if (sub.status === 'active') {
        const customerId = sub.customer as string
        await db
          .from('profiles')
          .update({ plan: 'pro', stripe_subscription_id: sub.id })
          .eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
