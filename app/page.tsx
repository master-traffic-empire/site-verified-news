// app/page.tsx — GroundTruth homepage
import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig } from "@/site.config"
import {
  DESKS,
  formatDate,
  getAllArticles,
  groundingColor,
} from "@/lib/articles"

export const metadata: Metadata = {
  title: `${siteConfig.name} — AI-Verified News`,
  description: siteConfig.tagline,
  alternates: {
    canonical: siteConfig.baseUrl + "/",
    types: {
      "application/rss+xml": `${siteConfig.baseUrl}/rss.xml`,
      "application/atom+xml": `${siteConfig.baseUrl}/atom.xml`,
    },
  },
  openGraph: {
    type: "website",
    url: siteConfig.baseUrl + "/",
    title: `${siteConfig.name} — AI-Verified News`,
    description: siteConfig.tagline,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — AI-Verified News`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — AI-Verified News`,
    description: siteConfig.tagline,
    images: [`${siteConfig.baseUrl}/og-image.png`],
  },
}

export default async function Home() {
  const articles = await getAllArticles()
  const [lead, ...rest] = articles
  const deskCounts = DESKS.map((d) => ({
    ...d,
    count: articles.filter((a) => a.desk === d.id).length,
  }))

  return (
    <main className="gt-main">
      <section className="gt-hero">
        <div className="gt-container">
          <p className="gt-eyebrow">
            <span className="gt-dot" aria-hidden /> Live AI-verified newsroom
          </p>
          <h1 className="gt-hero-title">{siteConfig.name}</h1>
          <p className="gt-hero-sub">{siteConfig.tagline}</p>
          <nav className="gt-desk-nav" aria-label="Desks">
            {deskCounts.map((d) => (
              <Link key={d.id} href={`/desk/${d.id}/`} className="gt-chip">
                {d.label}
                <span className="gt-chip-count">{d.count}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {lead && (
        <section className="gt-section gt-lead">
          <div className="gt-container">
            <Link href={`/news/${lead.slug}/`} className="gt-lead-card">
              {lead.image && (
                <div className="gt-lead-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lead.image} alt={lead.title} loading="eager" />
                </div>
              )}
              <div className="gt-lead-body">
                <div className="gt-meta">
                  <span className="gt-desk-badge">{lead.deskLabel}</span>
                  <span
                    className="gt-grounding"
                    style={{ background: groundingColor(lead.groundingScore) }}
                  >
                    {Math.round(lead.groundingScore * 100)}% {lead.groundingLabel}
                  </span>
                </div>
                <h2 className="gt-lead-title">{lead.title}</h2>
                {lead.description && (
                  <p className="gt-lead-desc">{lead.description}</p>
                )}
                <p className="gt-meta gt-meta-footer">
                  <span>{formatDate(lead.publishedAt)}</span>
                  <span>·</span>
                  <span>{lead.readingTime} min read</span>
                  <span>·</span>
                  <span>{lead.sources.length} sources</span>
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="gt-section">
        <div className="gt-container">
          <h2 className="gt-section-title">Latest stories</h2>
          <div className="gt-grid">
            {rest.map((article) => (
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
                    <Link
                      href={`/desk/${article.desk}/`}
                      className="gt-desk-badge"
                    >
                      {article.deskLabel}
                    </Link>
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
                    <Link href={`/news/${article.slug}/`}>{article.title}</Link>
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
        </div>
      </section>
    </main>
  )
}
