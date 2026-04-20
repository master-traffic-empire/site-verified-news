// app/sitemap.ts — Sitemap for homepage + 7 desks + every article
import { siteConfig } from "@/site.config"
import { DESKS, getAllArticles } from "@/lib/articles"
import { authors } from "@/lib/authors"
import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ]

  for (const d of DESKS) {
    staticRoutes.push({
      url: `${siteConfig.baseUrl}/desk/${d.id}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    })
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteConfig.baseUrl}/news/${a.slug}/`,
    lastModified: new Date(a.updatedAt || a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  const authorRoutes: MetadataRoute.Sitemap = Object.keys(authors).map(
    (slug) => ({
      url: `${siteConfig.baseUrl}/authors/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  )

  return [...staticRoutes, ...articleRoutes, ...authorRoutes]
}
