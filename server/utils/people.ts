import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

// Same deliberately tiny JSON-file "database" approach as the guestbook.
// One file, in-memory cache, serialized writes. Right-sized for a class roster.

export interface Person {
  id: string
  name: string
  bio: string
  // Path under /public the photo is served from, e.g. "/uploads/people/abc.jpg".
  // Undefined if no photo was provided.
  photo?: string
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  // Optional class label the submitter may add (e.g. "3班").
  classYear?: string
}

interface PeopleDB {
  people: Person[]
}

const DB_PATH = resolve(process.cwd(), '.store', 'people.json')

let cache: PeopleDB | null = null
let writeChain: Promise<unknown> = Promise.resolve()

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, JSON.stringify({ people: [] }, null, 2), 'utf8')
  }
}

async function read(): Promise<PeopleDB> {
  if (cache) return cache
  await ensureFile()
  const raw = await fs.readFile(DB_PATH, 'utf8')
  try {
    cache = JSON.parse(raw) as PeopleDB
  } catch {
    cache = { people: [] }
  }
  return cache
}

function write(db: PeopleDB): Promise<void> {
  cache = db
  writeChain = writeChain.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
  )
  return writeChain as Promise<void>
}

export async function getPeople(): Promise<Person[]> {
  const db = await read()
  // Newest first.
  return [...db.people].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addPerson(input: { name: string, bio: string, photo?: string, classYear?: string }): Promise<Person> {
  const db = await read()
  const now = new Date().toISOString()
  const person: Person = {
    id: randomUUID(),
    name: input.name.trim().slice(0, 50),
    bio: input.bio.trim().slice(0, 300),
    photo: input.photo,
    createdAt: now,
    updatedAt: now,
    classYear: input.classYear?.trim().slice(0, 20) || undefined
  }
  db.people.push(person)
  await write(db)
  return person
}

export async function updatePerson(id: string, patch: { name?: string, bio?: string, photo?: string, classYear?: string }): Promise<Person | null> {
  const db = await read()
  const person = db.people.find(p => p.id === id)
  if (!person) return null
  if (patch.name !== undefined) person.name = patch.name.trim().slice(0, 50)
  if (patch.bio !== undefined) person.bio = patch.bio.trim().slice(0, 300)
  if (patch.photo !== undefined) person.photo = patch.photo || undefined
  if (patch.classYear !== undefined) person.classYear = patch.classYear.trim().slice(0, 20) || undefined
  person.updatedAt = new Date().toISOString()
  await write(db)
  return person
}

export async function deletePerson(id: string): Promise<boolean> {
  const db = await read()
  const before = db.people.length
  db.people = db.people.filter(p => p.id !== id)
  const changed = db.people.length !== before
  if (changed) await write(db)
  return changed
}

// ---- Photo upload helper ----------------------------------------------------
// Saves an uploaded image buffer to public/uploads/people, resized and
// compressed to WebP for consistent size and quality. Public dir at <root>/public.
const UPLOAD_DIR = resolve(process.cwd(), 'public', 'uploads', 'people')

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB input limit

export async function savePhoto(buffer: Buffer, mime: string): Promise<string> {
  if (!ALLOWED_TYPES.has(mime)) {
    throw createError({ statusCode: 400, statusMessage: '仅支持 JPG / PNG / WebP / GIF 格式。' })
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: '图片不能超过 5MB。' })
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `${randomUUID()}.webp`
  await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(resolve(UPLOAD_DIR, filename))
  return `/uploads/people/${filename}`
}
