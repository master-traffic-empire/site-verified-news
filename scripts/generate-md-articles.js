#!/usr/bin/env node
/**
 * Prebuild step: copies each content/news/*.md to public/news/<slug>.md so
 * `/news/<slug>.md` is served as a static asset. Also generates a public
 * `.md` stub at `public/index.md` and desk indexes under `public/desk/*.md`.
 *
 * This avoids the Next.js middleware .md catchall, which is fragile in
 * static-export / edge-handler scenarios and silently 404s in some cases.
 */
const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const SRC = path.join(ROOT, "content", "news")
const DEST = path.join(ROOT, "public", "news")
const DESK_DIR = path.join(ROOT, "public", "desk")
const BASE_URL = "https://news.thicket.sh"

const DESKS = [
  { id: "politics", label: "Politics" },
  { id: "tech", label: "Tech" },
  { id: "finance", label: "Finance" },
  { id: "consumer", label: "Consumer" },
  { id: "social", label: "Social & Culture" },
  { id: "science", label: "Science & Health" },
  { id: "sports", label: "Sports" },
]

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { fm: {}, body: raw }
  const end = raw.indexOf("\n---", 3)
  if (end === -1) return { fm: {}, body: raw }
  const fmBlock = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).replace(/^\r?\n/, "")
  const fm = {}
  for (const line of fmBlock.split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if (val.startsWith("[") && val.endsWith("]")) {
      try {
        fm[m[1]] = JSON.parse(val.replace(/'/g, '"'))
        continue
      } catch {}
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (val !== "" && /^-?\d+(?:\.\d+)?$/.test(val)) {
      fm[m[1]] = Number(val)
    } else {
      fm[m[1]] = val
    }
  }
  return { fm, body }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function run() {
  if (!fs.existsSync(SRC)) {
    console.log("[generate-md] No content/news/ directory — skipping.")
    return
  }
  ensureDir(DEST)
  ensureDir(DESK_DIR)

  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".md"))
  const articles = files.map((f) => {
    const raw = fs.readFileSync(path.join(SRC, f), "utf8")
    const { fm } = parseFrontmatter(raw)
    // Copy the article verbatim.
    fs.writeFileSync(path.join(DEST, f), raw)
    return {
      file: f,
      slug: fm.slug || f.replace(/\.md$/, ""),
      title: fm.title || f,
      desk: fm.desk || "politics",
      deskLabel: fm.desk_label || fm.desk || "News",
      description: fm.description || "",
      publishedAt: fm.published_at || "",
      groundingScore:
        typeof fm.grounding_score === "number" ? fm.grounding_score : 0,
      groundingLabel: fm.grounding_label || "",
    }
  })

  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // Site index: public/index.md
  const idx = [
    `# GroundTruth`,
    ``,
    `> Every story fact-checked by AI. Every claim grounded in real sources.`,
    ``,
    `Root: ${BASE_URL}  •  Total articles: ${articles.length}`,
    ``,
    `## Desks`,
    ...DESKS.map((d) => `- [${d.label}](${BASE_URL}/desk/${d.id}/)`),
    ``,
    `## Articles`,
    ...articles.map(
      (a) =>
        `- [${a.title}](${BASE_URL}/news/${a.slug}/) — ${a.deskLabel}, ${Math.round(
          a.groundingScore * 100
        )}%`
    ),
    ``,
  ].join("\n")
  fs.writeFileSync(path.join(ROOT, "public", "index.md"), idx)

  // Per-desk markdown indexes: public/desk/<id>.md
  for (const d of DESKS) {
    const deskArticles = articles.filter((a) => a.desk === d.id)
    const lines = [
      `# ${d.label} — GroundTruth`,
      ``,
      `> ${deskArticles.length} ${
        deskArticles.length === 1 ? "story" : "stories"
      }, AI-verified.`,
      ``,
    ]
    for (const a of deskArticles) {
      lines.push(`## ${a.title}`)
      lines.push(`URL: ${BASE_URL}/news/${a.slug}/`)
      lines.push(
        `Grounding: ${Math.round(a.groundingScore * 100)}% · ${a.publishedAt}`
      )
      if (a.description) {
        lines.push("")
        lines.push(`> ${a.description}`)
      }
      lines.push("")
    }
    fs.writeFileSync(path.join(DESK_DIR, `${d.id}.md`), lines.join("\n"))
  }

  console.log(
    `[generate-md] Wrote ${articles.length} article .md + ${DESKS.length} desk indexes + site index`
  )
}

run()
