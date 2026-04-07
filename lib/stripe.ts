export const PLANS = {
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: 15,
    period: '/mo',
    badge: null,
    description: 'Billed monthly',
    paymentLink: 'https://buy.stripe.com/4gM3cu3DO7iJ02FbkNfIs0c',
    priceId: 'price_1TJNfFA2rVBUxBrS8ygvAl5n',
  },
  annual: {
    id: 'annual',
    label: 'Annual',
    price: 120,
    period: '/yr',
    badge: 'Save 33%',
    description: 'Billed yearly · $10/mo',
    paymentLink: 'https://buy.stripe.com/00wbJ0b6g1YpbLn4WpfIs0d',
    priceId: 'price_1TJNfFA2rVBUxBrSqp4klJF4',
  },
  lifetime: {
    id: 'lifetime',
    label: 'Lifetime',
    price: 147,
    period: '',
    badge: 'Best value',
    description: 'Pay once, use forever',
    paymentLink: 'https://buy.stripe.com/eVq9AS8Y8fPfdTv88BfIs0e',
    priceId: 'price_1TJNfGA2rVBUxBrSrIJFIedM',
  },
} as const

export type PlanId = keyof typeof PLANS

// Note: to enable recurring billing for monthly/annual plans,
// go to Stripe Dashboard → Products → Outly Pro → and create
// recurring prices, then update the priceId fields above.
