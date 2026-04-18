// site.config.ts — GroundTruth (verified-news)
import type { SiteConfig } from "@base/types"

export const siteConfig: SiteConfig = {
  slug: "verified-news",
  name: "GroundTruth",
  tagline: "Every story fact-checked by AI. Every claim grounded in real sources.",
  description:
    "AI-verified news. Every story fact-checked against real sources. Grounding scores, verified sources, and transparent citations for every article across politics, tech, finance, consumer, culture, science, and sports.",
  domain: "news.thicket.sh",
  baseUrl: "https://news.thicket.sh",
  category: "news",

  primaryKeyword: "AI-verified news",
  targetKeywords: [
    "fact checked news",
    "grounded news",
    "verified news sources",
    "AI fact checking",
    "news with sources",
  ],
  twitterHandle: "",

  colors: {
    primary: "#0F172A",
    secondary: "#2563EB",
    accent: "#22C55E",
    surface: "#FFFFFF",
    surfaceDark: "#0F172A",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#E2E8F0",
  },

  fonts: {
    display: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  },

  gaMeasurementId: "G-E0CF8H2DGH",

  itemsPerPage: 24,
  featuredCount: 6,

  geo: {
    llmsTxtEnabled: true,
    llmsFullTxtEnabled: true,
    mdRoutesEnabled: true,
    structuredApiEnabled: true,
  },

  blog: {
    enabled: true,
    basePath: "/news",
    feedTitle: "GroundTruth — AI-Verified News",
    feedDescription:
      "Every story fact-checked by AI. Every claim grounded in real sources.",
  },

  monetization: {
    adsenseEnabled: false,
    adsenseClientId: "",
    affiliateEnabled: false,
  },
}
