import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

const ROOT = resolve(process.cwd(), 'content', 'memories')

const MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/mp4'
}

export default defineEventHandler(async (event) => {
  const rawPath = event.path.replace(/^\/memories\//, '')
  // Security: prevent directory traversal
  if (rawPath.includes('..')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const filePath = resolve(ROOT, rawPath)
  // Double-check we're still under ROOT
  if (!filePath.startsWith(ROOT)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'

  try {
    const data = await readFile(filePath)
    setResponseHeader(event, 'Content-Type', contentType)
    return data
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
})
