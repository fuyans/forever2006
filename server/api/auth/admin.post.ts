export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const password = body?.password

  if (!password || typeof password !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Password is required' })
  }

  const ok = tryAdminLogin(event, password)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Incorrect admin password' })
  }

  return { success: true }
})
