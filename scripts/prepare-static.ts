/**
 * Prepares a read-only static build by:
 * 1. Copying memories images to public/memories/ so they're statically served
 * 2. Generating public/api/memories.json from the content/memories/ folder
 *
 * Run before `nuxi generate` or `pnpm generate`.
 */
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getAllMemories } from '../server/utils/memories'

const ROOT = process.cwd()
const SRC = resolve(ROOT, 'content', 'memories')
const DST = resolve(ROOT, 'public', 'memories')
const API = resolve(ROOT, 'public', 'api')

async function main() {
  // 1. Copy images
  console.log('Copying memories images to public/...')
  await mkdir(DST, { recursive: true })
  await cp(SRC, DST, { recursive: true, force: true })

  // 2. Generate API JSON
  console.log('Generating memories API JSON...')
  const data = await getAllMemories()

  // 3. Prefix absolute paths for subpath deployment (e.g. GitHub Pages)
  const base = process.env.NUXT_APP_BASE_URL || ''
  if (base && base !== '/') {
    const rewrite = (p: string) => {
      if (!p) return p
      if (p.startsWith('http')) return p
      return base + (p.startsWith('/') ? p.slice(1) : p)
    }
    for (const m of data) {
      m.cover = rewrite(m.cover)
      for (const g of m.gallery) {
        g.src = rewrite(g.src)
        if (g.poster) g.poster = rewrite(g.poster)
      }
    }
    console.log(`  → paths prefixed with "${base}"`)
  }

  await mkdir(API, { recursive: true })
  await writeFile(resolve(API, 'memories.json'), JSON.stringify(data), 'utf8')
  console.log(`  → ${data.length} memories written to public/api/memories.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
