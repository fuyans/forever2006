/**
 * Prepares a read-only static build by:
 * 1. Copying memories images to public/memories/ so they're statically served
 * 2. Generating public/api/memories.json from the content/memories/ folder
 *
 * Run before `nuxi generate` or `pnpm generate`.
 */
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getAllMemories } from '../server/utils/memories'

const ROOT = process.cwd()
const SRC = resolve(ROOT, 'content', 'memories')
const DST = resolve(ROOT, 'public', 'memories')
const API = resolve(ROOT, 'public', 'api')

async function main() {
  // Accept base URL as CLI arg (e.g. npx tsx prepare-static.ts /forever2006/)
  const base = process.argv[2] || process.env.NUXT_APP_BASE_URL || ''
  console.log(`Base URL: ${base || '(none — root deployment)'}`)

  // 1. Copy images
  console.log('Copying memories images to public/...')
  await mkdir(DST, { recursive: true })
  await cp(SRC, DST, { recursive: true, force: true })

  // 2. Generate API JSON
  console.log('Generating memories API JSON...')
  const data = await getAllMemories()

  // 3. Prefix absolute paths for subpath deployment (e.g. /forever2006/)
  if (base && base !== '/') {
    const rewrite = (p: string) => p && !p.startsWith('http') ? base + (p.startsWith('/') ? p.slice(1) : p) : p
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

  // 4. Export people data (if any)
  const peoplePath = resolve(ROOT, '.store', 'people.json')
  const peopleRaw = await readFile(peoplePath, 'utf8').catch(() => null)
  if (peopleRaw) {
    const people = JSON.parse(peopleRaw).people || []
    await writeFile(resolve(API, 'people.json'), JSON.stringify(people), 'utf8')
    console.log(`  → ${people.length} people written to public/api/people.json`)
  }

  // 5. Export messages data (if any)
  const msgPath = resolve(ROOT, '.store', 'messages.json')
  const msgRaw = await readFile(msgPath, 'utf8').catch(() => null)
  if (msgRaw) {
    const messages = JSON.parse(msgRaw).messages || []
    await writeFile(resolve(API, 'messages.json'), JSON.stringify(messages), 'utf8')
    console.log(`  → ${messages.length} messages written to public/api/messages.json`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
