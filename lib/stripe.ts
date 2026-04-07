import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
  apiVersion: '2025-03-31.basil',
})

export const PLANS = {
  pro: {
    name: 'Outly Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited searches per day',
      'Full AI breakdown on all outliers',
      'All 7 niche explorer pages',
      'Priority analysis (no queue)',
    ],
  },
}
