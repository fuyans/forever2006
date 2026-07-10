// Create a person. Anyone who passed the site gate can add a card.
// Accepts multipart/form-data (with optional photo file) OR JSON (photo URL).
export default defineEventHandler(async (event) => {
  let name: string
  let bio: string
  let photo: string | undefined

  const contentType = getRequestHeader(event, 'content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const form = await readMultipartFormData(event)
    const field = (key: string) => form?.find(f => f.name === key)?.data?.toString('utf8').trim() || ''
    name = field('name')
    bio = field('bio')

    const file = form?.find(f => f.name === 'photo' && f.data?.length)
    if (file) {
      photo = await savePhoto(file.data!, file.type || 'image/jpeg')
    }
  } else {
    const body = await readBody<{ name?: string, bio?: string, photo?: string }>(event)
    name = (body?.name ?? '').toString().trim()
    bio = (body?.bio ?? '').toString().trim()
    // JSON path: accept a photo URL string as-is.
    if (body?.photo) photo = body.photo.toString().trim()
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '请输入姓名。' })
  }
  if (!bio) {
    throw createError({ statusCode: 400, statusMessage: '请写一句简介。' })
  }

  const person = await addPerson({ name, bio, photo })
  return { success: true, person }
})
