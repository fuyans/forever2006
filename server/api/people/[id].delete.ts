// Admin-only: delete a person card.
export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    throw createError({ statusCode: 403, statusMessage: '需要管理员权限。' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '缺少 ID。' })
  }

  const removed = await deletePerson(id)
  if (!removed) {
    throw createError({ statusCode: 404, statusMessage: '找不到该同学。' })
  }
  return { success: true }
})
