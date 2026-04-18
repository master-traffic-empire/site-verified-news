// lib/articles.ts — Load news articles from content/news/*.md
// Each article is a Markdown file with YAML frontmatter:
//   title, description, slug, desk, desk_label, published_at, updated_at,
//   grounding_score (0..1), grounding_label, tags (JSON array), url, canonical
//
// The body contains the article prose plus a "## Grounding & Sources" section
// with citation links, which we parse into a structured `sources` list.

import { readdir, readFile } from "fs/promises"
import { join } from "path"

export interface GroundingSource {
  url: string
  title: string
}

export interface NewsArticle {
  slug: string
  title: string
  description: string
  desk: string
  deskLabel: string
  publishedAt: string
  updatedAt: string
  groundingScore: number
  groundingLabel: string
  tags: string[]
  url: string
  canonical: string
  /** Raw markdown body AFTER frontmatter (includes sources section). */
  body: string
  /** Markdown body with the trailing "## Grounding & Sources" block removed. */
  bodyStripped: string
  /** Structured list of cited sources extracted from the body. */
  sources: GroundingSource[]
  /** Estimated reading time in minutes. */
  readingTime: number
  /** Relative path to hero image (falls back to slug-based webp). */
  image: string | null
}

export interface Desk {
  id: string
  label: string
}

export const DESKS: Desk[] = [
  { id: "politics", label: "Politics" },
  { id: "tech", label: "Tech" },
  { id: "finance", label: "Finance" },
  { id: "consumer", label: "Consumer" },
  { id: "social", label: "Social & Culture" },
  { id: "science", label: "Science & Health" },
  { id: "sports", label: "Sports" },
]

const CONTENT_DIR = join(process.cwd(), "content", "news")
const IMAGE_DIR = join(process.cwd(), "public", "images", "blog")

/** Minimal YAML-frontmatter extractor. Supports string, number, and array values. */
function parseFrontmatter(raw: string): { fm: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---")) return { fm: {}, body: raw }
  const end = raw.indexOf("\n---", 3)
  if (end === -1) return { fm: {}, body: raw }
  const fmBlock = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).replace(/^\r?\n/, "")
  const fm: Record<string, unknown> = {}
  for (const line of fmBlock.split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val: string = m[2].trim()
    if (val.startsWith("[") && val.endsWith("]")) {
      // JSON-style array
      try {
        fm[key] = JSON.parse(val.replace(/'/g, '"'))
        continue
      } catch {
        // fall through
      }
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (val !== "" && /^-?\d+(?:\.\d+)?$/.test(val)) {
      fm[key] = Number(val)
    } else {
      fm[key] = val
    }
  }
  return { fm, body }
}

/** Extract sources from the "## Grounding & Sources" section. */
function extractSources(body: string): GroundingSource[] {
  const marker = body.indexOf("## Grounding & Sources")
  if (marker === -1) return []
  const section = body.slice(marker)
  const sources: GroundingSource[] = []
  const re = /-\s*\[([^\]]+)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(section)) !== null) {
    sources.push({ title: match[1], url: match[2] })
  }
  return sources
}

/** Remove "## Grounding & Sources", "## Tags", and canonical footer from body. */
function stripTrailingSections(body: string): string {
  let out = body
  const groundingIdx = out.indexOf("\n## Grounding & Sources")
  if (groundingIdx !== -1) out = out.slice(0, groundingIdx)
  const tagsIdx = out.indexOf("\n## Tags")
  if (tagsIdx !== -1) out = out.slice(0, tagsIdx)
  return out.replace(/\n-{3,}\s*$/g, "").trimEnd()
}

function defaultGroundingLabel(score: number): string {
  if (score >= 0.8) return "Verified"
  if (score >= 0.5) return "Partial"
  return "Unverified"
}

function estimateReadingTime(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

let _articleCache: NewsArticle[] | null = null

export async function getAllArticles(): Promise<NewsArticle[]> {
  if (_articleCache) return _articleCache
  let files: string[]
  try {
    files = await readdir(CONTENT_DIR)
  } catch {
    return []
  }
  const imgFiles = new Set<string>()
  try {
    for (const f of await readdir(IMAGE_DIR)) imgFiles.add(f)
  } catch {
    /* ignore */
  }

  const out: NewsArticle[] = []
  for (const f of files) {
    if (!f.endsWith(".md")) continue
    const raw = await readFile(join(CONTENT_DIR, f), "utf-8")
    const { fm, body } = parseFrontmatter(raw)
    const slug = (fm.slug as string) || f.replace(/\.md$/, "")
    const score =
      typeof fm.grounding_score === "number"
        ? (fm.grounding_score as number)
        : 0
    const image = imgFiles.has(`${slug}.webp`)
      ? `/images/blog/${slug}.webp`
      : null
    out.push({
      slug,
      title: (fm.title as string) || slug,
      description: (fm.description as string) || "",
      desk: (fm.desk as string) || "politics",
      deskLabel:
        (fm.desk_label as string) ||
        DESKS.find((d) => d.id === fm.desk)?.label ||
        "News",
      publishedAt: (fm.published_at as string) || "",
      updatedAt: (fm.updated_at as string) || (fm.published_at as string) || "",
      groundingScore: score,
      groundingLabel:
        (fm.grounding_label as string) || defaultGroundingLabel(score),
      tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
      url: (fm.url as string) || `/news/${slug}/`,
      canonical:
        (fm.canonical as string) || `https://news.thicket.sh/news/${slug}/`,
      body,
      bodyStripped: stripTrailingSections(body),
      sources: extractSources(body),
      readingTime: estimateReadingTime(body),
      image,
    })
  }
  out.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  _articleCache = out
  return out
}

export async function getArticleBySlug(
  slug: string
): Promise<NewsArticle | null> {
  const all = await getAllArticles()
  return all.find((a) => a.slug === slug) ?? null
}

export async function getArticlesByDesk(deskId: string): Promise<NewsArticle[]> {
  const all = await getAllArticles()
  return all.filter((a) => a.desk === deskId)
}

export function getDeskLabel(id: string): string {
  return DESKS.find((d) => d.id === id)?.label ?? id
}

export function groundingColor(score: number): string {
  if (score >= 0.8) return "#22C55E"
  if (score >= 0.5) return "#F59E0B"
  return "#EF4444"
}

export function groundingLabelFromScore(score: number): string {
  return defaultGroundingLabel(score)
}

export function formatDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
