import { NextRequest, NextResponse } from "next/server"

// Catch-all for .md URLs that aren't materialised as physical files under
// /public (those static copies take precedence). This handles dynamic paths
// like /desk/<id>.md and /.md at request time.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.endsWith(".md") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/mdapi") &&
    // These have physical .md files under public/ generated at build time.
    // Let Next serve them directly as static assets.
    !pathname.startsWith("/news/") &&
    !pathname.startsWith("/desk/") &&
    pathname !== "/index.md"
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/mdapi"
    url.searchParams.set("path", pathname)
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
}
