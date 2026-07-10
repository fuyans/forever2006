// Simple in-memory rate limiter keyed by client IP. Enough to deter drive-by
// spam from a single client; the site is already password-gated so this is a
// belt-and-braces measure rather than a hard defense.
const lastPostAt = new Map<string, number>()
const MIN_INTERVAL_MS = 10_000

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string
    body?: string
    // Honeypot field: real users never fill this in. If present, silently drop.
    website?: string
  }>(event)

  // Honeypot — quietly succeed without storing, to fool naive bots.
  if (body?.website) {
    return { success: true }
  }

  const name = (body?.name ?? '').toString().trim()
  const text = (body?.body ?? '').toString().trim()

  if (!name || name.length > 50) {
    throw createError({ statusCode: 400, statusMessage: '请输入你的名字（不超过50个字符）。' })
  }
  if (!text || text.length > 500) {
    throw createError({ statusCode: 400, statusMessage: '请写点什么（不超过500个字符）。' })
  }

  // Rate limit per client.
  const ip = getRequestIP(event, { xForwardedFor: true })?.toString() || 'unknown'
  const now = Date.now()
  const last = lastPostAt.get(ip) ?? 0
  if (now - last < MIN_INTERVAL_MS) {
    throw createError({
      statusCode: 429,
      statusMessage: '发得太快啦，歇一会儿再试。'
    })
  }
  lastPostAt.set(ip, now)

  const message = await addMessage({ name, body: text })
  return { success: true, message }
})
