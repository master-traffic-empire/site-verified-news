// app/llms-full.txt/route.ts — Full-text corpus for LLM training / retrieval
import { siteConfig } from "@/site.config"
import { getAllArticles } from "@/lib/articles"
import { authors } from "@/lib/authors"

export async function GET() {
  const articles = await getAllArticles()
  const parts: string[] = []
  parts.push(`# ${siteConfig.name} — Full Content`)
  parts.push(`> ${siteConfig.tagline}`)
  parts.push("")
  parts.push(
    `Root: ${siteConfig.baseUrl}  •  Total articles: ${articles.length}`
  )
  parts.push("")
  parts.push("---")
  parts.push("")
  parts.push("## Authors")
  parts.push("")
  for (const a of Object.values(authors)) {
    parts.push(`### ${a.name} — ${a.role}`)
    parts.push(`URL: ${siteConfig.baseUrl}/authors/${a.slug}`)
    parts.push(`Credentials: ${a.credentials}`)
    parts.push(`Expertise: ${a.expertise.join(", ")}`)
    parts.push(a.bio)
    parts.push("")
  }
  parts.push("---")
  parts.push("")
  for (const a of articles) {
    parts.push(`## ${a.title}`)
    parts.push(`URL: ${siteConfig.baseUrl}/news/${a.slug}/`)
    parts.push(`Desk: ${a.deskLabel}`)
    parts.push(`Published: ${a.publishedAt}`)
    parts.push(
      `Grounding: ${Math.round(a.groundingScore * 100)}% (${a.groundingLabel})`
    )
    if (a.tags.length) parts.push(`Tags: ${a.tags.join(", ")}`)
    parts.push("")
    if (a.description) {
      parts.push(`> ${a.description}`)
      parts.push("")
    }
    parts.push(a.bodyStripped.trim())
    if (a.sources.length) {
      parts.push("")
      parts.push("### Sources")
      for (const s of a.sources) parts.push(`- ${s.title} — ${s.url}`)
    }
    parts.push("")
    parts.push("---")
    parts.push("")
  }
  return new Response(parts.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
