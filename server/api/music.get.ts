import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineEventHandler(async (_event) => {
  const dir = resolve(process.cwd(), 'public', 'music')
  const files = await readdir(dir).catch(() => [] as string[])
  const tracks = files
    .filter(f => f.endsWith('.mp3') || f.endsWith('.m4a'))
    .sort()
    .map(f => `/music/${f}`)
  return tracks
})
