// app/desk/[slug]/page.tsx — Per-desk index (category) page
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import {
  DESKS,
  formatDate,
  getArticlesByDesk,
  getDeskLabel,
  groundingColor,
} from "@/lib/articles"

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return DESKS.map((d) => ({ slug: d.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const label = getDeskLabel(slug)
  const canonical = `${siteConfig.baseUrl}/desk/${slug}/`
  return {
    title: `${label} News — ${siteConfig.name}`,
    description: `Latest ${label.toLowerCase()} news, fact-checked by AI and grounded in real sources.`,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${label} News — ${siteConfig.name}`,
      description: `Latest ${label.toLowerCase()} news, fact-checked by AI.`,
      images: [{ url: `${siteConfig.baseUrl}/og-image.png` }],
    },
  }
}

export default async function DeskPage({ params }: Props) {
  const { slug } = await params
  if (!DESKS.find((d) => d.id === slug)) notFound()
  const label = getDeskLabel(slug)
  const articles = await getArticlesByDesk(slug)

  return (
    <main className="gt-main">
      <section className="gt-desk-header">
        <div className="gt-container">
          <p className="gt-breadcrumb">
            <Link href="/">{siteConfig.name}</Link>
            <span>›</span>
            <span>{label}</span>
          </p>
          <h1>{label}</h1>
          <p>
            {articles.length} {articles.length === 1 ? "story" : "stories"} · AI-verified
          </p>
        </div>
      </section>

      <section className="gt-section">
        <div className="gt-container">
          {articles.length === 0 ? (
            <p style={{ color: "var(--gt-text-muted)" }}>
              No stories on this desk yet.
            </p>
          ) : (
            <div className="gt-grid">
              {articles.map((article) => (
                <article key={article.slug} className="gt-card">
                  {article.image && (
                    <Link
                      href={`/news/${article.slug}/`}
                      className="gt-card-img"
                      aria-hidden
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                      />
                    </Link>
                  )}
                  <div className="gt-card-body">
                    <div className="gt-meta">
                      <span className="gt-desk-badge">{article.deskLabel}</span>
                      <span
                        className="gt-grounding"
                        style={{
                          background: groundingColor(article.groundingScore),
                        }}
                      >
                        {Math.round(article.groundingScore * 100)}%{" "}
                        {article.groundingLabel}
                      </span>
                    </div>
                    <h3 className="gt-card-title">
                      <Link href={`/news/${article.slug}/`}>
                        {article.title}
                      </Link>
                    </h3>
                    {article.description && (
                      <p className="gt-card-desc">{article.description}</p>
                    )}
                    <p className="gt-meta gt-meta-footer">
                      <span>{formatDate(article.publishedAt)}</span>
                      <span>·</span>
                      <span>{article.readingTime} min read</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
