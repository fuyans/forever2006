import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

// The cookie name used to mark an authenticated (password-known) visitor.
export const AUTH_COOKIE = 'memorial_auth'
// A separate cookie marks an admin session (for deleting guestbook messages).
export const ADMIN_COOKIE = 'memorial_admin'

// Signed token = payload + "." + hmac(payload). The payload is a fixed label so
// we can distinguish site-auth from admin-auth by the key used to sign it. We
// keep it deliberately simple: this is gating a reunion site, not a bank.
function sign(payload: string, secret: string): string {
  const mac = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${mac}`
}

function verify(token: string | undefined, secret: string): boolean {
  if (!token) return false
  const dot = token.lastIndexOf('.')
  if (dot < 1) return false
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  // Constant-time compare to avoid timing leaks.
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  } catch {
    return false
  }
}

const SITE_PAYLOAD = 'memorial.v1'
const ADMIN_PAYLOAD = 'memorial.admin.v1'

function config(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  // Coerce to string: dotenv/Nuxt parse all-numeric values like "2026" into
  // numbers, but crypto.createHmac requires a string/Buffer key.
  return {
    site: String(cfg.sitePassword ?? ''),
    admin: String(cfg.adminPassword ?? '')
  }
}

export function isSiteAuthed(event: H3Event): boolean {
  const { site } = config(event)
  return verify(getCookie(event, AUTH_COOKIE), site)
}

export function isAdminAuthed(event: H3Event): boolean {
  const { admin } = config(event)
  return verify(getCookie(event, ADMIN_COOKIE), admin)
}

/** Set the visitor (site) auth cookie. Expires in 7 days. */
export function setSiteAuth(event: H3Event) {
  const { site } = config(event)
  setCookie(event, AUTH_COOKIE, sign(SITE_PAYLOAD, site), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export function clearSiteAuth(event: H3Event) {
  deleteCookie(event, AUTH_COOKIE, { path: '/' })
}

/** Validate the provided password and, if correct, set the site cookie. */
export function tryLogin(event: H3Event, password: string): boolean {
  const { site } = config(event)
  // Constant-time-ish comparison via signing both sides.
  const a = createHmac('sha256', site).update(String(password)).digest()
  const b = createHmac('sha256', site).update(site).digest()
  if (a.length === b.length && timingSafeEqual(a, b)) {
    setSiteAuth(event)
    return true
  }
  return false
}

/** Validate the admin password and set the admin cookie. */
export function tryAdminLogin(event: H3Event, password: string): boolean {
  const { admin } = config(event)
  const a = createHmac('sha256', admin).update(String(password)).digest()
  const b = createHmac('sha256', admin).update(admin).digest()
  if (a.length === b.length && timingSafeEqual(a, b)) {
    setCookie(event, ADMIN_COOKIE, sign(ADMIN_PAYLOAD, admin), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
    return true
  }
  return false
}

export function clearAdminAuth(event: H3Event) {
  deleteCookie(event, ADMIN_COOKIE, { path: '/' })
}
