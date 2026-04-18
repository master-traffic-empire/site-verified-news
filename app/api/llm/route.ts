// app/api/llm/route.ts — Structured JSON API for LLMs / agents
import { siteConfig } from "@/site.config"
import { DESKS, getAllArticles } from "@/lib/articles"

export async function GET() {
  const articles = await getAllArticles()
  const payload = {
    site: siteConfig.name,
    description: siteConfig.tagline,
    url: siteConfig.baseUrl,
    total_articles: articles.length,
    desks: DESKS.map((d) => ({
      id: d.id,
      label: d.label,
      url: `${siteConfig.baseUrl}/desk/${d.id}/`,
      count: articles.filter((a) => a.desk === d.id).length,
    })),
    endpoints: {
      all_articles: `${siteConfig.baseUrl}/api/llm`,
      sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
      full_text: `${siteConfig.baseUrl}/llms-full.txt`,
      rss: `${siteConfig.baseUrl}/rss.xml`,
      atom: `${siteConfig.baseUrl}/atom.xml`,
    },
    grounding_legend: {
      verified: { min: 0.8, label: "Verified", color: "#22C55E" },
      partial: { min: 0.5, label: "Partial", color: "#F59E0B" },
      unverified: { min: 0, label: "Unverified", color: "#EF4444" },
    },
    articles: articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      desk: a.desk,
      desk_label: a.deskLabel,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      grounding_score: a.groundingScore,
      grounding_label: a.groundingLabel,
      tags: a.tags,
      url: `${siteConfig.baseUrl}/news/${a.slug}/`,
      canonical: a.canonical,
      image: a.image ? `${siteConfig.baseUrl}${a.image}` : null,
      reading_time: a.readingTime,
      sources: a.sources,
    })),
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
