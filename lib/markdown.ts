// lib/markdown.ts — Tiny, dependency-free Markdown → HTML renderer.
// Scope: GroundTruth article bodies which use a small subset:
//   # / ## / ### headings, paragraphs, blockquotes (>), horizontal rules (---),
//   emphasis (**bold**, _italic_), inline code, links [a](b), unordered lists (-).
// Good enough for SSR display; real content is also exposed as raw markdown
// via the .md routes for LLMs and feed readers.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inline(s: string): string {
  let out = escapeHtml(s)
  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
  )
  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  // italic _text_ or *text*
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
  out = out.replace(/(^|\W)_([^_\n]+)_/g, "$1<em>$2</em>")
  // inline code `x`
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>")
  return out
}

export function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let i = 0
  let inList = false
  let inPara: string[] = []
  let inQuote: string[] = []

  const flushPara = () => {
    if (inPara.length) {
      out.push(`<p>${inline(inPara.join(" "))}</p>`)
      inPara = []
    }
  }
  const flushQuote = () => {
    if (inQuote.length) {
      out.push(`<blockquote>${inline(inQuote.join(" "))}</blockquote>`)
      inQuote = []
    }
  }
  const closeList = () => {
    if (inList) {
      out.push("</ul>")
      inList = false
    }
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === "") {
      flushPara()
      flushQuote()
      closeList()
      i++
      continue
    }
    if (/^-{3,}$/.test(trimmed)) {
      flushPara()
      flushQuote()
      closeList()
      out.push("<hr />")
      i++
      continue
    }
    const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (hMatch) {
      flushPara()
      flushQuote()
      closeList()
      const level = hMatch[1].length
      out.push(`<h${level}>${inline(hMatch[2])}</h${level}>`)
      i++
      continue
    }
    if (trimmed.startsWith("> ")) {
      flushPara()
      closeList()
      inQuote.push(trimmed.slice(2))
      i++
      continue
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara()
      flushQuote()
      if (!inList) {
        out.push("<ul>")
        inList = true
      }
      out.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`)
      i++
      continue
    }
    // Default: paragraph line
    flushQuote()
    closeList()
    inPara.push(trimmed)
    i++
  }
  flushPara()
  flushQuote()
  closeList()
  return out.join("\n")
}
