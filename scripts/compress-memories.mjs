/**
 * Batch-compress all photos in content/memories/ in place.
 *
 * - Images (.jpg/.jpeg/.png): resize to max 1600px on the longest edge,
 *   re-encode as JPEG quality 82. Skips files already small enough.
 * - Videos (.mp4/.mov): left untouched (too lossy to re-encode with sharp).
 *
 * Run: node scripts/compress-memories.mjs
 */
import { readdir, stat, readFile, writeFile } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import sharp from 'sharp'

const ROOT = join(process.cwd(), 'content', 'memories')
const MAX_WIDTH = 1600
const QUALITY = 82
const SKIP_BELOW = 300 * 1024 // don't bother re-encoding files under 300KB

const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png'])

let totalBefore = 0
let totalAfter = 0
let processed = 0
let skipped = 0

async function processImage(filePath) {
  const before = await stat(filePath)
  totalBefore += before.size

  if (before.size < SKIP_BELOW) {
    skipped++
    totalAfter += before.size
    return { name: basename(filePath), before: before.size, after: before.size, skipped: true }
  }

  const buf = await readFile(filePath)
  const meta = await sharp(buf).metadata()
  const longest = Math.max(meta.width || 0, meta.height || 0)

  let pipeline = sharp(buf)
  if (longest > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, height: MAX_WIDTH, fit: 'inside', withoutEnlargement: true })
  }
  const out = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer()

  // Only overwrite if we actually saved meaningful space (>10% reduction)
  if (out.length < before.size * 0.9) {
    await writeFile(filePath, out)
    processed++
    totalAfter += out.length
    return { name: basename(filePath), before: before.size, after: out.length }
  } else {
    skipped++
    totalAfter += before.size
    return { name: basename(filePath), before: before.size, after: before.size, skipped: true }
  }
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

async function main() {
  console.log(`Compressing images in ${ROOT}`)
  console.log(`  Max width: ${MAX_WIDTH}px | Quality: ${QUALITY} | Skip below: ${fmt(SKIP_BELOW)}`)
  console.log()

  const folders = await readdir(ROOT)
  for (const folder of folders) {
    const dir = join(ROOT, folder)
    const s = await stat(dir).catch(() => null)
    if (!s?.isDirectory()) continue

    const files = await readdir(dir)
    const images = files.filter(f => IMG_EXTS.has(extname(f).toLowerCase()))
    if (!images.length) continue

    console.log(`📁 ${folder}/`)
    for (const img of images.sort()) {
      const result = await processImage(join(dir, img))
      if (result.skipped) {
        console.log(`   ⏭  ${result.name} (${fmt(result.before)}) — skipped`)
      } else {
        const saved = ((1 - result.after / result.before) * 100).toFixed(0)
        console.log(`   ✅ ${result.name}: ${fmt(result.before)} → ${fmt(result.after)} (-${saved}%)`)
      }
    }
    console.log()
  }

  console.log('═══════════════════════════════════════')
  console.log(`Total: ${fmt(totalBefore)} → ${fmt(totalAfter)}`)
  const savedPct = totalBefore > 0 ? ((1 - totalAfter / totalBefore) * 100).toFixed(0) : 0
  console.log(`Saved: ${fmt(totalBefore - totalAfter)} (${savedPct}% reduction)`)
  console.log(`Processed: ${processed} | Skipped: ${skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
