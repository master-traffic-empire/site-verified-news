// app/news-sitemap.xml/route.ts — Google News sitemap (articles < 2 days old)
import { siteConfig } from "@/site.config"
import { getAllArticles } from "@/lib/articles"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export async function GET() {
  const all = await getAllArticles()

  // Google News requires articles from the past 48 hours. If none qualify,
  // fall back to the 20 most recent articles so the feed is still valid.
  const twoDaysMs = 1000 * 60 * 60 * 48
  const now = Date.now()
  const fresh = all.filter(
    (a) => now - new Date(a.publishedAt).getTime() <= twoDaysMs
  )
  const source = fresh.length > 0 ? fresh : all.slice(0, 20)

  const entries = source
    .map((a) => {
      const link = `${siteConfig.baseUrl}/news/${a.slug}/`
      return `  <url>
    <loc>${link}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(siteConfig.name)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.publishedAt).toISOString()}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>
`
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  })
}
