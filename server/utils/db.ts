import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'

// A deliberately tiny JSON-file "database". Right-sized for a reunion: we
// expect on the order of dozens-to-hundreds of messages, all in memory, all
// human-inspectable on disk. No native dependencies required.

export interface Message {
  id: string
  name: string
  body: string
  createdAt: string // ISO timestamp
  // A tailwind color name used to tint the avatar — assigned at write time.
  avatarColor: string
  // Optional class / year label the visitor may add (e.g. "3班").
  classYear?: string
}

export interface MessageDB {
  messages: Message[]
}

const DB_PATH = resolve(process.cwd(), '.store', 'messages.json')

// Palette for randomly tinted avatars.
const AVATAR_COLORS = [
  'text-rose-500', 'text-amber-500', 'text-emerald-500', 'text-sky-500',
  'text-violet-500', 'text-fuchsia-500', 'text-teal-500', 'text-orange-500'
]

let cache: MessageDB | null = null
let writeChain: Promise<unknown> = Promise.resolve()

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, JSON.stringify({ messages: [] }, null, 2), 'utf8')
  }
}

async function read(): Promise<MessageDB> {
  if (cache) return cache
  await ensureFile()
  const raw = await fs.readFile(DB_PATH, 'utf8')
  try {
    cache = JSON.parse(raw) as MessageDB
  } catch {
    // Corrupt file — reset rather than crash.
    cache = { messages: [] }
  }
  return cache
}

// Serialize writes so concurrent POSTs don't clobber each other.
function write(db: MessageDB): Promise<void> {
  cache = db
  writeChain = writeChain.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
  )
  return writeChain as Promise<void>
}

export async function getMessages(): Promise<Message[]> {
  const db = await read()
  // Newest first for display.
  return [...db.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addMessage(input: { name: string, body: string, classYear?: string }): Promise<Message> {
  const db = await read()
  const color = AVATAR_COLORS[db.messages.length % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!
  const message: Message = {
    id: randomUUID(),
    name: input.name.trim().slice(0, 50),
    body: input.body.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
    avatarColor: color,
    classYear: input.classYear?.trim().slice(0, 20) || undefined
  }
  db.messages.push(message)
  await write(db)
  return message
}

export async function deleteMessage(id: string): Promise<boolean> {
  const db = await read()
  const before = db.messages.length
  db.messages = db.messages.filter(m => m.id !== id)
  const changed = db.messages.length !== before
  if (changed) await write(db)
  return changed
}
