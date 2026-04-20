// lib/authors.ts — E-E-A-T author registry for the Traffic Empire newsroom.
// Every article on this site is authored by one of these personas.
// The profile pages live at /authors/[slug].

import { siteConfig } from "@/site.config"

export interface Author {
  slug: string
  name: string
  role: string
  bio: string
  credentials: string
  expertise: string[]
  jobTitle: string
  shortBio: string
}

export const authors: Record<string, Author> = {
  "sarah-okafor": {
    slug: "sarah-okafor",
    name: "Dr. Sarah Okafor",
    role: "Fitness & Health Writer",
    jobTitle: "Exercise Physiologist & Fitness Writer",
    credentials: "PhD, Exercise Physiology, University of Texas",
    expertise: [
      "TDEE & energy expenditure",
      "body composition",
      "heart rate training zones",
      "macronutrient optimization",
      "progressive overload",
      "recovery science",
      "metabolic adaptation",
    ],
    shortBio:
      "Exercise physiologist (PhD, University of Texas) who translates peer-reviewed training and nutrition research into evidence-based protocols.",
    bio: "Dr. Sarah Okafor holds a PhD in Exercise Physiology from the University of Texas and spent five years running clinical trials on metabolic adaptation before becoming a full-time fitness writer. She bridges the gap between peer-reviewed research and the gym floor — evidence-first but deeply practical. She trains herself (powerlifting and zone 2 cardio) and has zero patience for marketing-driven fitness claims. Every recommendation she publishes is backed by specific studies, sample sizes, and effect sizes.",
  },
  "jamie-reeves": {
    slug: "jamie-reeves",
    name: "Jamie Reeves",
    role: "Personal Finance Writer",
    jobTitle: "Personal Finance Writer",
    credentials: "6+ years at NerdWallet and The Penny Hoarder",
    expertise: [
      "debt payoff strategies",
      "salary negotiation",
      "mortgage optimization",
      "budgeting frameworks",
      "retirement planning",
      "student loan strategies",
      "financial psychology",
    ],
    shortBio:
      "Personal finance writer with 6+ years at NerdWallet and The Penny Hoarder. Paid off $78K in student loans on a $52K salary — writes about money the way real people experience it.",
    bio: "Jamie Reeves paid off $78,000 in student loans on a $52,000 salary — an experience that turned them into a personal finance obsessive. After six years at NerdWallet and The Penny Hoarder, Jamie went independent because they got tired of financial content that treats money like an abstraction. Jamie writes about money the way real people experience it: stressful, emotional, and full of trade-offs that spreadsheets don't capture. Every article shows the math AND the feelings, because financial decisions are never purely rational.",
  },
  "marcus-chen": {
    slug: "marcus-chen",
    name: "Marcus Chen",
    role: "Data Journalist",
    jobTitle: "Data Journalist & Quantitative Analyst",
    credentials: "MS Applied Statistics, Columbia; 8 years at Bloomberg",
    expertise: [
      "personal finance modeling",
      "salary benchmarking",
      "investment comparison",
      "cost-of-living analysis",
      "tax optimization scenarios",
      "scenario-based analysis",
    ],
    shortBio:
      "Former Bloomberg quantitative analyst with an MS in Applied Statistics from Columbia. Won't publish a claim without running the numbers himself.",
    bio: "Marcus Chen is a former quantitative analyst who spent eight years at Bloomberg before pivoting to data journalism. He holds an MS in Applied Statistics from Columbia and writes with the conviction that most financial advice is either wrong or untestable. He's the kind of writer who won't publish a claim without running the numbers himself — and who takes visible pleasure when the data contradicts conventional wisdom. Every article contains original data tables, source-cited methodology, and scenario comparisons.",
  },
  "lena-park": {
    slug: "lena-park",
    name: "Lena Park",
    role: "Lifestyle & Trends Writer",
    jobTitle: "Culture & Trends Analyst",
    credentials: "Former Vox senior reporter, 7 years covering culture & tech",
    expertise: [
      "cultural trends",
      "consumer behavior",
      "viral phenomena",
      "generational analysis",
      "internet culture",
      "design trends",
      "emerging subcultures",
    ],
    shortBio:
      "Former Vox senior reporter (7 years covering culture and tech). Spots patterns that connect seemingly unrelated trends — why a TikTok aesthetic is actually about economic anxiety.",
    bio: "Lena Park is a former Vox senior reporter who covered the intersection of culture, technology, and consumer behavior for seven years. She has an uncanny ability to spot patterns that connect seemingly unrelated trends — why a TikTok aesthetic is actually about economic anxiety, or how a meme format reveals shifting attitudes toward work. She left traditional media to write longer, weirder pieces without an editor cutting the cultural analysis. Her writing makes you feel smarter about things you already noticed but couldn't articulate.",
  },
  "raj-malhotra": {
    slug: "raj-malhotra",
    name: "Raj Malhotra",
    role: "Tech & Crypto Analyst",
    jobTitle: "Systems Analyst & Technology Writer",
    credentials: "10 years as systems architect at Stripe and Coinbase",
    expertise: [
      "cryptocurrency analysis",
      "Bitcoin & Ethereum",
      "AI tool evaluation",
      "SaaS comparison",
      "developer productivity",
      "protocol mechanics",
      "tech stack decisions",
    ],
    shortBio:
      "Former systems architect at Stripe and Coinbase. Reads protocol whitepapers for fun. Called the 2022 crypto crash three months early from on-chain data.",
    bio: "Raj Malhotra spent ten years as a systems architect at Stripe and Coinbase before becoming a full-time analyst. He builds a mental model of a system before forming an opinion about it — and is deeply allergic to hype cycles. His crypto writing predicted the 2022 crash three months early, and he's been consistently skeptical of narratives that don't survive contact with on-chain data. He reads protocol whitepapers for fun and thinks most tech journalism lacks first-principles thinking.",
  },
  "marcus-rivera": {
    slug: "marcus-rivera",
    name: "Marcus Rivera",
    role: "Senior Data Journalist",
    jobTitle: "Senior Data Journalist",
    credentials: "10+ years covering markets, economics, and politics",
    expertise: [
      "breaking news analysis",
      "source verification",
      "data journalism",
      "economic reporting",
      "policy analysis",
    ],
    shortBio:
      "Senior data journalist with 10+ years covering markets, economics, and politics. Every claim grounded in primary-source citations.",
    bio: "Marcus Rivera is a senior data journalist covering markets, economics, and policy. He treats every article like an audit trail: every load-bearing claim links back to a primary source, and every number carries its methodology. His reporting prioritizes verification over velocity — no rumor goes live without two independent sources.",
  },
}

export const PRIMARY_AUTHOR_SLUG = "marcus-rivera"

export function getAuthor(slug: string | undefined | null): Author {
  if (slug && authors[slug]) return authors[slug]
  return authors[PRIMARY_AUTHOR_SLUG]
}

export function authorUrl(slug: string): string {
  return `${siteConfig.baseUrl}/authors/${slug}`
}

export function authorPersonJsonLd(slug: string) {
  const a = getAuthor(slug)
  return {
    "@type": "Person",
    "@id": `${authorUrl(a.slug)}#person`,
    name: a.name,
    url: authorUrl(a.slug),
    jobTitle: a.jobTitle,
    description: a.shortBio,
    knowsAbout: a.expertise,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  }
}
