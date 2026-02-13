import { auth } from "@/auth"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthRoute = pathname.startsWith("/api/auth")
  const isPublicPath = pathname.startsWith("/share/")
  const isErrorPage = pathname === "/auth-error"
  const isAuthPage = pathname === "/auth"
  const isApiRoute = pathname.startsWith("/api/")

  // Allow public routes
  if (isAuthRoute || isPublicPath || isErrorPage || isAuthPage) return

  // API routes: GET allowed without auth; write methods require session or API key
  if (isApiRoute) {
    const method = req.method ?? "GET"
    if (method === "GET" || method === "OPTIONS") return

    const apiKey = req.headers.get("x-api-key")
    if (apiKey === process.env.API_SECRET_KEY) return
    if (isLoggedIn) return
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Settings page: require session, redirect to auth when not logged in
  if (pathname === "/settings" && !isLoggedIn) {
    return Response.redirect(new URL("/auth", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
