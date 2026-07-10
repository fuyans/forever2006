// Admin-only: edit an existing person. Accepts multipart (new photo) or JSON.
export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    throw createError({ statusCode: 403, statusMessage: '需要管理员权限。' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '缺少 ID。' })
  }

  const contentType = getRequestHeader(event, 'content-type') || ''
  let patch: { name?: string, bio?: string, photo?: string }

  if (contentType.includes('multipart/form-data')) {
    const form = await readMultipartFormData(event)
    const field = (key: string) => {
      const f = form?.find(x => x.name === key)
      return f ? f.data?.toString('utf8').trim() : undefined
    }
    patch = {
      name: field('name'),
      bio: field('bio')
    }
    const file = form?.find(f => f.name === 'photo' && f.data?.length)
    if (file) {
      patch.photo = await savePhoto(file.data!, file.type || 'image/jpeg')
    }
    // Explicit "remove photo" signal from the form.
    if (field('removePhoto') === '1') patch.photo = ''
  } else {
    patch = await readBody(event)
  }

  const person = await updatePerson(id, patch)
  if (!person) {
    throw createError({ statusCode: 404, statusMessage: '找不到该同学。' })
  }
  return { success: true, person }
})
