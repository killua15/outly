import type { NicheData } from '@/types'

export const NICHES: NicheData[] = [
  {
    slug: 'fitness',
    label: 'Fitness',
    description: 'Discover which fitness videos go viral and why — from home workouts to transformation stories.',
    keywords: ['fitness', 'workout', 'weight loss', 'muscle building', 'home workout'],
    exampleOutliers: [
      {
        title: 'I Worked Out Every Day for 30 Days — This Is What Happened',
        multiplier: 18,
        views: '4.2M',
        whyExploded: 'Personal transformation + specific timeframe creates a curiosity gap that viewers feel compelled to close.',
        pattern: 'Challenge + transformation + specific timeline',
        howToReplicate: [
          'Pick a specific challenge (30 days, 100 reps, etc.)',
          'Document the journey with before/after visuals',
          'Title with the result teased, not revealed',
        ],
        newIdea: 'I Did 100 Push-Ups Every Day for 60 Days (My Body Changed In Ways I Didn\'t Expect)',
      },
      {
        title: 'The Workout Big Fitness YouTubers Don\'t Want You to Know',
        multiplier: 12,
        views: '2.8M',
        whyExploded: 'Conspiracy framing + "forbidden knowledge" triggers massive click-through from fitness audiences.',
        pattern: 'Exposed / secret knowledge / contrarian',
        howToReplicate: [
          'Find a common belief in your niche to debunk',
          'Frame it as suppressed or overlooked information',
          'Deliver genuine value that justifies the hook',
        ],
        newIdea: 'Why Most Fitness Advice Is Actually Making You Weaker (What I Wish I\'d Known Earlier)',
      },
    ],
  },
  {
    slug: 'crypto',
    label: 'Crypto',
    description: 'Find outlier crypto videos — what makes certain market predictions and tutorials explode.',
    keywords: ['crypto', 'bitcoin', 'ethereum', 'altcoins', 'DeFi'],
    exampleOutliers: [
      {
        title: 'I Invested $1,000 In Crypto 1 Year Ago — Here\'s Exactly What Happened',
        multiplier: 22,
        views: '6.1M',
        whyExploded: 'Real money + real timeline + specific amount creates unparalleled relatability and trust.',
        pattern: 'Real money experiment + time-based outcome',
        howToReplicate: [
          'Start with a specific dollar amount readers can relate to',
          'Document real trades with real receipts',
          'Reveal the outcome only at the end',
        ],
        newIdea: 'I Put $500 Into 5 Different Cryptos 6 Months Ago — One Changed Everything',
      },
    ],
  },
  {
    slug: 'gaming',
    label: 'Gaming',
    description: 'Uncover which gaming videos outperform the average — challenges, tutorials, and viral moments.',
    keywords: ['gaming', 'gameplay', 'gaming tutorial', 'game challenge', 'esports'],
    exampleOutliers: [
      {
        title: 'I Beat the Hardest Level Using Only The Worst Weapon',
        multiplier: 15,
        views: '3.5M',
        whyExploded: 'Self-imposed constraints create a narrative tension that hooks both casual and hardcore gamers.',
        pattern: 'Constraint challenge + difficulty + unexpected success',
        howToReplicate: [
          'Pick a game mode with a recognizable difficulty',
          'Add a ridiculous constraint',
          'Thumbnail shows the contrast (weak item vs. tough enemy)',
        ],
        newIdea: 'Beating [Popular Game] With The Worst Character — Impossible Challenge',
      },
    ],
  },
  {
    slug: 'finance',
    label: 'Personal Finance',
    description: 'See which personal finance and investing videos generate outsized viewership and why.',
    keywords: ['personal finance', 'investing', 'passive income', 'saving money', 'side hustle'],
    exampleOutliers: [
      {
        title: 'How I Made $10,000 While I Slept (Passive Income Breakdown)',
        multiplier: 20,
        views: '5.3M',
        whyExploded: 'Specific income claim + passive framing + transparency triggers massive FOMO.',
        pattern: 'Income reveal + passive + specific number',
        howToReplicate: [
          'Use a real, specific number in the title',
          'Break down every income stream with actual data',
          'Include failures and what didn\'t work',
        ],
        newIdea: 'My Exact Passive Income Sources This Month (Every Stream Ranked)',
      },
    ],
  },
  {
    slug: 'cooking',
    label: 'Cooking',
    description: 'Find which cooking videos go viral — from budget meals to restaurant-quality recipes at home.',
    keywords: ['cooking', 'recipe', 'easy meals', 'meal prep', 'budget cooking'],
    exampleOutliers: [
      {
        title: 'I Only Ate $5/Day For A Week — Every Single Meal',
        multiplier: 16,
        views: '4.0M',
        whyExploded: 'Budget constraint + time limit + "every meal" promise delivers clear, tangible value.',
        pattern: 'Budget challenge + complete documentation',
        howToReplicate: [
          'Set a tight budget with a specific dollar amount',
          'Show EVERY meal — no skipping days',
          'Calculate cost per meal on screen',
        ],
        newIdea: 'Eating Like a Bodybuilder on $30/Week — Full Meal Plan',
      },
    ],
  },
  {
    slug: 'tech',
    label: 'Tech',
    description: 'Discover which tech reviews, tutorials, and AI content dominate YouTube.',
    keywords: ['technology', 'AI tools', 'productivity apps', 'tech review', 'software tutorial'],
    exampleOutliers: [
      {
        title: 'I Replaced My Entire Workflow with AI — Here\'s What Actually Works',
        multiplier: 19,
        views: '5.8M',
        whyExploded: 'AI anxiety + personal experiment + honest evaluation hits every knowledge worker\'s core fear.',
        pattern: 'AI experiment + workflow replacement + honest verdict',
        howToReplicate: [
          'Pick a specific workflow everyone recognizes',
          'Test AI tools for 30+ days before filming',
          'Give a clear verdict: worth it or not',
        ],
        newIdea: 'I Let AI Run My Business for 30 Days — Here\'s What It Couldn\'t Do',
      },
    ],
  },
  {
    slug: 'travel',
    label: 'Travel',
    description: 'Find outlier travel videos — what makes destination guides and travel vlogs explode in views.',
    keywords: ['travel', 'budget travel', 'travel vlog', 'solo travel', 'travel tips'],
    exampleOutliers: [
      {
        title: 'I Traveled to 10 Countries With $2,000 — Here\'s How',
        multiplier: 14,
        views: '3.2M',
        whyExploded: 'Specific number of countries + tight budget + "here\'s how" turns aspiration into accessible reality.',
        pattern: 'Budget travel + multiple destinations + how-to',
        howToReplicate: [
          'Set a total budget viewers consider impossibly low',
          'Cover multiple destinations in one video',
          'Include the exact booking strategies used',
        ],
        newIdea: 'Solo Traveling Southeast Asia for Under $1,500 — Complete Guide',
      },
    ],
  },
]

export function getNicheBySlug(slug: string): NicheData | undefined {
  return NICHES.find((n) => n.slug === slug)
}

export function getAllNicheSlugs(): string[] {
  return NICHES.map((n) => n.slug)
}
