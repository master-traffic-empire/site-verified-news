// app/layout.tsx — GroundTruth root layout
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { Inter, JetBrains_Mono } from "next/font/google"
import { siteConfig } from "@/site.config"
import { RootLayout } from "@base/layouts/RootLayout"
import { generateSiteMetadata } from "@base/lib/metadata"
import { DESKS } from "@/lib/articles"
import "@base/styles/globals.css"
import "./groundtruth.css"

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
})

export const viewport: Viewport = {
  themeColor: siteConfig.colors.primary,
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = generateSiteMetadata(siteConfig)

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      siteConfig={siteConfig}
      fontVariables={`${bodyFont.variable} ${monoFont.variable}`}
    >
      <div className="gt-shell">
        <header className="gt-header">
          <div className="gt-container gt-header-inner">
            <Link href="/" className="gt-logo" aria-label={siteConfig.name}>
              <span className="gt-logo-mark" aria-hidden>
                GT
              </span>
              <span className="gt-logo-text">{siteConfig.name}</span>
              <span className="gt-logo-tag">AI-verified news</span>
            </Link>
            <nav className="gt-header-nav" aria-label="Desks">
              {DESKS.map((d) => (
                <Link key={d.id} href={`/desk/${d.id}/`}>
                  {d.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="gt-footer">
          <div className="gt-container gt-footer-inner">
            <div>
              <p className="gt-footer-brand">{siteConfig.name}</p>
              <p className="gt-footer-tag">{siteConfig.tagline}</p>
            </div>
            <div className="gt-footer-links">
              <Link href="/llms.txt">LLMs index</Link>
              <Link href="/rss.xml">RSS</Link>
              <Link href="/atom.xml">Atom</Link>
              <Link href="/sitemap.xml">Sitemap</Link>
              <a
                href="https://thicket.sh"
                rel="noopener noreferrer"
                target="_blank"
              >
                Thicket
              </a>
            </div>
          </div>
        </footer>
      </div>
    </RootLayout>
  )
}
