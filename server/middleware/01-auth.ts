// Primary gate: every request that isn't explicitly public must carry a valid
// auth cookie. This runs on the Nitro server and protects SSR page loads as
// well as API routes (e.g. guestbook messages). The Nuxt route middleware
// (app/middleware/auth.global.ts) is only a fast client-side complement.

// Paths that are always reachable without auth. Keep this list small and
// specific — anything added here is publicly accessible.
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/music'
]

// Prefixes for paths that are always public (static assets, favicons, etc.).
const PUBLIC_PREFIXES = [
  '/_nuxt/',
  '/__nuxt/',
  '/favicon',
  '/robots.txt',
  '/memories/' // folder-based photo gallery, served from content/memories/
]

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true
  return PUBLIC_PREFIXES.some(p => path.startsWith(p))
}

export default defineEventHandler((event) => {
  // Skip auth during static generation (prerender).
  if (import.meta.prerender) return

  const path = event.path || event.node?.req?.url || ''

  if (isPublic(path)) return

  if (!isSiteAuthed(event)) {
    // For HTML navigations, redirect to login. For API/JSON requests, 401.
    const accept = getRequestHeader(event, 'accept') || ''
    if (accept.includes('text/html') || path.startsWith('/api/')) {
      if (path.startsWith('/api/')) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }
      return sendRedirect(event, '/login', 302)
    }
    // Default for other content types: redirect to be safe.
    return sendRedirect(event, '/login', 302)
  }
})
