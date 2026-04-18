// app/atom.xml/route.ts — Atom 1.0 feed built from content/news/*.md
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
  const updated = articles[0]?.updatedAt
    ? new Date(articles[0].updatedAt).toISOString()
    : new Date().toISOString()

  const entries = articles
    .map((a) => {
      const link = `${siteConfig.baseUrl}/news/${a.slug}/`
      return `  <entry>
    <title>${esc(a.title)}</title>
    <link href="${link}" />
    <id>${link}</id>
    <updated>${new Date(a.updatedAt || a.publishedAt).toISOString()}</updated>
    <published>${new Date(a.publishedAt).toISOString()}</published>
    <summary>${esc(a.description)}</summary>
    <category term="${esc(a.desk)}" label="${esc(a.deskLabel)}" />
  </entry>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(siteConfig.blog.feedTitle ?? siteConfig.name)}</title>
  <subtitle>${esc(siteConfig.blog.feedDescription ?? siteConfig.tagline)}</subtitle>
  <link href="${siteConfig.baseUrl}/" />
  <link href="${siteConfig.baseUrl}/atom.xml" rel="self" />
  <id>${siteConfig.baseUrl}/</id>
  <updated>${updated}</updated>
${entries}
</feed>
`
  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  })
}
