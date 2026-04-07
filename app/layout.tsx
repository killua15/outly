import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Outly — Find Viral YouTube Video Ideas Instantly',
  description:
    'Discover which YouTube videos outperform the average in any niche. Get AI-powered insights on why they went viral and exactly how to replicate them.',
  keywords: [
    'youtube video ideas',
    'how to go viral on youtube',
    'youtube seo tool',
    'find viral youtube videos',
    'youtube outlier finder',
    'youtube content strategy',
  ],
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Outly — Find Viral YouTube Video Ideas Instantly',
    description:
      'Enter any YouTube channel or keyword. Get the videos that exploded in views — with AI breakdown on why and how to replicate them.',
    type: 'website',
    url: 'https://outly.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outly — Viral YouTube Video Finder',
    description: 'Discover outlier videos in any niche. Powered by AI.',
  },
  metadataBase: new URL('https://outly.app'),
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Outly',
  applicationCategory: 'BusinessApplication',
  description: 'YouTube outlier finder and viral video idea generator powered by AI',
  offers: {
    '@type': 'Offer',
    price: '9',
    priceCurrency: 'USD',
    priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
