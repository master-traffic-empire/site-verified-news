// app/authors/[slug]/page.tsx — Author profile page for E-E-A-T and News/Discover authorship.
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import { authors, authorUrl } from "@/lib/authors"
import { getAllArticles, formatDate } from "@/lib/articles"

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return Object.keys(authors).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = authors[slug]
  if (!author) return {}
  return {
    title: `${author.name} — ${author.role} | ${siteConfig.name}`,
    description: author.shortBio,
    alternates: { canonical: authorUrl(author.slug) },
    openGraph: {
      type: "profile",
      title: `${author.name} — ${author.role}`,
      description: author.shortBio,
      url: authorUrl(author.slug),
    },
  }
}

export default async function AuthorProfilePage({ params }: Props) {
  const { slug } = await params
  const author = authors[slug]
  if (!author) notFound()

  const allArticles = await getAllArticles()
  const byline = allArticles
    .filter((a) => a.authorSlug === author.slug)
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
    .slice(0, 60)

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${authorUrl(author.slug)}#person`,
    name: author.name,
    url: authorUrl(author.slug),
    jobTitle: author.jobTitle,
    description: author.bio,
    knowsAbout: author.expertise,
    worksFor: {
      "@type": "Organization",
      "@id": `${siteConfig.baseUrl}#organization`,
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  }

  return (
    <main className="gt-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="gt-container" style={{ padding: "2.5rem 1.25rem 4rem", maxWidth: 820 }}>
        <nav style={{ fontSize: "0.9rem", marginBottom: "1.5rem", color: "var(--gt-text-muted)" }}>
          <Link href="/" style={{ color: "inherit" }}>{siteConfig.name}</Link>
          <span style={{ margin: "0 0.5rem" }}>›</span>
          <span>Authors</span>
        </nav>

        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "2.25rem", lineHeight: 1.15 }}>
            {author.name}
          </h1>
          <p style={{ margin: "0.5rem 0 0", fontSize: "1.1rem", color: "var(--gt-text-muted)", fontWeight: 500 }}>
            {author.role}
          </p>
          <p style={{ margin: "0.25rem 0 0", color: "var(--gt-text-muted)", fontSize: "0.95rem" }}>
            {author.credentials}
          </p>
        </header>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem" }}>About</h2>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.65 }}>{author.bio}</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem" }}>Areas of expertise</h2>
          <ul style={{ lineHeight: 1.8 }}>
            {author.expertise.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>

        {byline.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.25rem" }}>
              Articles by {author.name} ({byline.length})
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {byline.map((a) => (
                <li key={a.slug} style={{ borderBottom: "1px solid var(--gt-border, #e2e8f0)", padding: "1rem 0" }}>
                  <Link href={`/news/${a.slug}/`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                    {a.title}
                  </Link>
                  <div style={{ fontSize: "0.85rem", color: "var(--gt-text-muted)", marginTop: "0.25rem" }}>
                    {formatDate(a.publishedAt)} · {a.deskLabel}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
