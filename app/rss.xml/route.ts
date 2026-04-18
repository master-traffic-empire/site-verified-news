// app/rss.xml/route.ts — RSS 2.0 feed built from content/news/*.md
import { siteConfig } from "@/site.config"
import { getAllArticles } from "@/lib/articles"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const articles = await getAllArticles()
  const lastBuild = articles[0]?.publishedAt
    ? new Date(articles[0].publishedAt).toUTCString()
    : new Date().toUTCString()

  const items = articles
    .map((a) => {
      const link = `${siteConfig.baseUrl}/news/${a.slug}/`
      return `  <item>
    <title>${esc(a.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${esc(a.description)}</description>
    <category>${esc(a.deskLabel)}</category>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
  </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(siteConfig.blog.feedTitle ?? siteConfig.name)}</title>
  <link>${siteConfig.baseUrl}</link>
  <description>${esc(siteConfig.blog.feedDescription ?? siteConfig.tagline)}</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
  <atom:link href="${siteConfig.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>
`
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  })
}
