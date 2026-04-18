// app/mdapi/route.ts — dynamic .md handler for paths NOT materialised in public/
// Article .md files are pre-generated to public/news/<slug>.md at build time
// (see scripts/generate-md-articles.js) and served as static assets. This
// handler covers everything else: /, /desk/<id>, and arbitrary other pages.
import { NextRequest } from "next/server"
import { siteConfig } from "@/site.config"
import { DESKS, getAllArticles, getArticleBySlug } from "@/lib/articles"

export const dynamic = "force-dynamic"

function fm(fields: Record<string, unknown>): string {
  const out = ["---"]
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) out.push(`${k}: ${JSON.stringify(v)}`)
    else if (typeof v === "number") out.push(`${k}: ${v}`)
    else out.push(`${k}: "${String(v).replace(/"/g, '\\"')}"`)
  }
  out.push("---")
  return out.join("\n")
}

export async function GET(request: NextRequest) {
  const rawPath = request.nextUrl.searchParams.get("path") || "/index.md"
  const cleaned = rawPath.replace(/\.md$/, "")
  const segs = cleaned.split("/").filter(Boolean)

  // Article (fallback — should already be a static file under public/news/)
  if (segs.length === 2 && segs[0] === "news") {
    const article = await getArticleBySlug(segs[1])
    if (article) {
      const header = fm({
        title: article.title,
        description: article.description,
        slug: article.slug,
        desk: article.desk,
        desk_label: article.deskLabel,
        published_at: article.publishedAt,
        updated_at: article.updatedAt,
        grounding_score: article.groundingScore,
        grounding_label: article.groundingLabel,
        tags: article.tags,
        url: `${siteConfig.baseUrl}/news/${article.slug}/`,
        canonical: article.canonical,
      })
      return new Response(`${header}\n\n${article.body.trim()}\n`, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      })
    }
  }

  // Desk page: /desk/<id>.md
  if (segs.length === 2 && segs[0] === "desk") {
    const desk = DESKS.find((d) => d.id === segs[1])
    if (desk) {
      const articles = (await getAllArticles()).filter(
        (a) => a.desk === desk.id
      )
      const lines: string[] = []
      lines.push(`# ${desk.label} — ${siteConfig.name}`)
      lines.push("")
      lines.push(
        `> ${articles.length} ${articles.length === 1 ? "story" : "stories"}, AI-verified.`
      )
      lines.push("")
      for (const a of articles) {
        lines.push(`## ${a.title}`)
        lines.push(`URL: ${siteConfig.baseUrl}/news/${a.slug}/`)
        lines.push(
          `Grounding: ${Math.round(a.groundingScore * 100)}% (${a.groundingLabel}) · Published: ${a.publishedAt}`
        )
        if (a.description) {
          lines.push("")
          lines.push(`> ${a.description}`)
        }
        lines.push("")
      }
      return new Response(lines.join("\n"), {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      })
    }
  }

  // Site index: /.md or /index.md
  if (segs.length === 0 || (segs.length === 1 && segs[0] === "index")) {
    const articles = await getAllArticles()
    const lines: string[] = []
    lines.push(`# ${siteConfig.name}`)
    lines.push("")
    lines.push(`> ${siteConfig.tagline}`)
    lines.push("")
    lines.push(siteConfig.description)
    lines.push("")
    lines.push("## Desks")
    for (const d of DESKS) {
      lines.push(`- [${d.label}](${siteConfig.baseUrl}/desk/${d.id}/)`)
    }
    lines.push("")
    lines.push(`## Latest (${articles.length})`)
    for (const a of articles.slice(0, 40)) {
      lines.push(`- [${a.title}](${siteConfig.baseUrl}/news/${a.slug}/)`)
    }
    return new Response(lines.join("\n") + "\n", {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    })
  }

  // Generic stub
  const pageUrl = `${siteConfig.baseUrl}${cleaned || "/"}`
  const title =
    segs[segs.length - 1]
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || siteConfig.name

  const md = `${fm({
    title: `${title} — ${siteConfig.name}`,
    site: siteConfig.name,
    url: pageUrl,
  })}

# ${title} — ${siteConfig.name}

> ${siteConfig.tagline}

- Full page: [${pageUrl}](${pageUrl})
- JSON API: ${siteConfig.baseUrl}/api/llm
- Full corpus: ${siteConfig.baseUrl}/llms-full.txt
- Index: ${siteConfig.baseUrl}/llms.txt
`
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
