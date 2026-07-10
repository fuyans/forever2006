export default defineEventHandler(async (event) => {
  // Admin-only. The site cookie lets you *read* the guestbook; only the admin
  // cookie lets you delete.
  if (!isAdminAuthed(event)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required.' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing message id.' })
  }

  const removed = await deleteMessage(id)
  if (!removed) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found.' })
  }

  return { success: true }
})
