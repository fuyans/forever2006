import { promises as fs } from 'node:fs'
import { resolve, basename, extname } from 'node:path'
import matter from 'gray-matter'

const ROOT = resolve(process.cwd(), 'content', 'memories')

export interface MemoryMedia {
  type: 'image' | 'video'
  src: string
  alt?: string
  caption?: string
  poster?: string
}

export interface Memory {
  slug: string
  date: string // "2003-09-01"
  title: string
  period: string
  category: string
  description: string
  cover: string // "/memories/{slug}/cover.svg"
  gallery: MemoryMedia[]
}

const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'])
const VID_EXTS = new Set(['.mp4', '.mov', '.webm', '.m4v'])

function dateFromSlug(slug: string): string {
  const m = slug.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!m) return slug.slice(0, 10)
  return `${m[1]!}-${m[2]!}-${m[3]!}`
}

async function scanFolder(name: string): Promise<Memory | null> {
  const dir = resolve(ROOT, name)
  const stat = await fs.stat(dir).catch(() => null)
  if (!stat?.isDirectory()) return null

  const indexMd = resolve(dir, 'index.md')
  const raw = await fs.readFile(indexMd, 'utf8').catch(() => null)
  if (!raw) return null

  const { data } = matter(raw)
  const title = data.title?.toString().trim() || name
  const period = data.period?.toString().trim() || ''
  const category = data.category?.toString().trim() || 'milestone'
  const description = data.description?.toString().trim() ?? matter(raw).content.trim()

  // Parse optional video list from frontmatter.
  const rawVideos: Array<{ src?: unknown, caption?: unknown, poster?: unknown }>
    = Array.isArray(data.videos) ? data.videos : []

  const entries = await fs.readdir(dir)
  const images: string[] = []
  const videos: string[] = []
  const captions = new Map<string, string>()

  for (const entry of entries) {
    const ext = extname(entry).toLowerCase()
    const stem = basename(entry, ext)
    if (IMG_EXTS.has(ext)) {
      images.push(entry)
    } else if (VID_EXTS.has(ext)) {
      videos.push(entry)
    } else if (ext === '.md' && entry !== 'index.md') {
      const captionRaw = await fs.readFile(resolve(dir, entry), 'utf8')
      captions.set(stem, captionRaw.trim())
    }
  }

  // Sort images: cover first (if exists), then alphabetical
  images.sort((a, b) => {
    if (basename(a, extname(a)) === 'cover') return -1
    if (basename(b, extname(b)) === 'cover') return 1
    return a.localeCompare(b)
  })

  const slug = name
  const cover = images.length > 0 ? `/memories/${slug}/${images[0]!}` : ''

  const gallery: MemoryMedia[] = images.map((img) => {
    const stem = basename(img, extname(img))
    const caption = captions.get(stem) ?? undefined
    return {
      type: 'image' as const,
      src: `/memories/${slug}/${img}`,
      alt: caption?.slice(0, 60),
      caption
    }
  })

  // Video files stored directly in the folder.
  for (const vid of videos) {
    const stem = basename(vid, extname(vid))
    const caption = captions.get(stem) ?? undefined
    gallery.push({
      type: 'video',
      src: `/memories/${slug}/${vid}`,
      caption
    })
  }

  // Append videos from frontmatter (YouTube / Bilibili URLs).
  for (const v of rawVideos) {
    const src = v.src?.toString().trim()
    if (!src) continue
    gallery.push({
      type: 'video',
      src,
      caption: v.caption?.toString().trim(),
      poster: v.poster?.toString().trim()
    })
  }

  return {
    slug,
    date: dateFromSlug(slug),
    title,
    period,
    category,
    description,
    cover,
    gallery
  }
}

export async function getAllMemories(): Promise<Memory[]> {
  const entries = await fs.readdir(ROOT).catch(() => [] as string[])
  const results = await Promise.all(entries.map(scanFolder))
  return results
    .filter((m): m is Memory => m !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
}
