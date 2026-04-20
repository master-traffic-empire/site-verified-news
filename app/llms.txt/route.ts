// app/llms.txt/route.ts — LLM-friendly index for GroundTruth
import { siteConfig } from "@/site.config"
import { DESKS, getAllArticles } from "@/lib/articles"
import { authors } from "@/lib/authors"

export async function GET() {
  const articles = await getAllArticles()
  const lines: string[] = []
  lines.push(`# ${siteConfig.name}`)
  lines.push(`> ${siteConfig.tagline}`)
  lines.push("")
  lines.push(siteConfig.description)
  lines.push("")
  lines.push("## About")
  lines.push(
    "Every article is verified against real sources and carries a grounding score (0-100%). Citations are listed on every story."
  )
  lines.push("")
  lines.push("## Endpoints")
  lines.push(`- Homepage: ${siteConfig.baseUrl}/`)
  lines.push(`- JSON API: ${siteConfig.baseUrl}/api/llm`)
  lines.push(`- Full text corpus: ${siteConfig.baseUrl}/llms-full.txt`)
  lines.push(`- RSS feed: ${siteConfig.baseUrl}/rss.xml`)
  lines.push(`- Atom feed: ${siteConfig.baseUrl}/atom.xml`)
  lines.push(`- Sitemap: ${siteConfig.baseUrl}/sitemap.xml`)
  lines.push(`- News sitemap: ${siteConfig.baseUrl}/news-sitemap.xml`)
  lines.push("")
  lines.push("## Desks")
  for (const d of DESKS) {
    const count = articles.filter((a) => a.desk === d.id).length
    lines.push(
      `- [${d.label}](${siteConfig.baseUrl}/desk/${d.id}/) — ${count} stor${
        count === 1 ? "y" : "ies"
      }`
    )
  }
  lines.push("")
  lines.push("## Authors")
  for (const a of Object.values(authors)) {
    lines.push(
      `- [${a.name}](${siteConfig.baseUrl}/authors/${a.slug}) — ${a.role}. ${a.shortBio}`
    )
  }
  lines.push("")
  lines.push("## Latest Articles")
  for (const a of articles) {
    lines.push(
      `- [${a.title}](${siteConfig.baseUrl}/news/${a.slug}/) — ${a.deskLabel}, ${Math.round(
        a.groundingScore * 100
      )}% ${a.groundingLabel}`
    )
  }
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
