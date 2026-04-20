// app/news/[slug]/page.tsx — Individual article page with grounding score + sources
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import {
  formatDate,
  getAllArticles,
  getArticleBySlug,
  groundingColor,
} from "@/lib/articles"
import { renderMarkdown } from "@/lib/markdown"
import { authors, authorUrl } from "@/lib/authors"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const all = await getAllArticles()
  return all.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  const canonical = article.canonical || `${siteConfig.baseUrl}/news/${slug}/`
  return {
    title: `${article.title} — ${siteConfig.name}`,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.tags,
      images: article.image
        ? [
            {
              url: `${siteConfig.baseUrl}${article.image}`,
              width: 1200,
              height: 675,
              alt: article.title,
            },
          ]
        : [{ url: `${siteConfig.baseUrl}/og-image.png` }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [
        article.image
          ? `${siteConfig.baseUrl}${article.image}`
          : `${siteConfig.baseUrl}/og-image.png`,
      ],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const scorePct = Math.round(article.groundingScore * 100)
  const scoreColor = groundingColor(article.groundingScore)

  const authorMeta = authors[article.authorSlug] ?? authors["marcus-rivera"]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: article.canonical,
    articleSection: article.deskLabel,
    keywords: article.tags.join(", "),
    image: article.image ? `${siteConfig.baseUrl}${article.image}` : undefined,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    author: {
      "@type": "Person",
      name: authorMeta.name,
      url: authorUrl(authorMeta.slug),
      jobTitle: authorMeta.jobTitle,
      description: authorMeta.shortBio,
    },
    citation: article.sources.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
    })),
  }

  return (
    <main className="gt-main gt-article">
      <article className="gt-article-container">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <nav className="gt-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">{siteConfig.name}</Link>
          <span>›</span>
          <Link href={`/desk/${article.desk}/`}>{article.deskLabel}</Link>
          <span>›</span>
          <span>Article</span>
        </nav>
        <h1 className="gt-article-title">{article.title}</h1>
        {article.description && (
          <p className="gt-article-sub">{article.description}</p>
        )}
        <div className="gt-article-meta">
          <Link href={`/desk/${article.desk}/`} className="gt-desk-badge">
            {article.deskLabel}
          </Link>
          <span
            className="gt-grounding"
            style={{ background: scoreColor }}
          >
            {scorePct}% {article.groundingLabel}
          </span>
          <span style={{ color: "var(--gt-text-muted)", fontSize: "0.88rem" }}>
            By{" "}
            <Link
              href={`/authors/${authorMeta.slug}`}
              style={{ color: "var(--gt-text-muted)", fontWeight: 600 }}
            >
              {authorMeta.name}
            </Link>
            , {authorMeta.role}
          </span>
          <span style={{ color: "var(--gt-text-muted)", fontSize: "0.88rem" }}>
            {formatDate(article.publishedAt)}
          </span>
          <span style={{ color: "var(--gt-text-muted)", fontSize: "0.88rem" }}>
            · {article.readingTime} min read
          </span>
        </div>

        {article.image && (
          <figure className="gt-article-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.image} alt={article.title} />
          </figure>
        )}

        <aside className="gt-grounding-panel" aria-label="Grounding score">
          <div
            className="gt-grounding-score"
            style={{ background: scoreColor }}
            aria-hidden
          >
            {scorePct}%
          </div>
          <div className="gt-grounding-panel-body">
            <p className="title">
              {article.groundingLabel} — grounded by {article.sources.length}{" "}
              source{article.sources.length === 1 ? "" : "s"}
            </p>
            <p className="sub">
              Every claim in this article is checked against real sources. See
              the full citation list below.
            </p>
          </div>
        </aside>

        <div
          className="gt-article-body"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(article.bodyStripped),
          }}
        />

        {article.sources.length > 0 && (
          <section className="gt-sources" aria-label="Sources">
            <h2>Sources ({article.sources.length})</h2>
            <ul className="gt-sources-list">
              {article.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {article.tags.length > 0 && (
          <div className="gt-tag-list" aria-label="Tags">
            {article.tags.map((t) => (
              <span key={t} className="gt-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </article>
    </main>
  )
}
