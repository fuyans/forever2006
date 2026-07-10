import type { Memory } from '~~/server/utils/memories'

/** Load timeline/album memories — direct scan on server, static JSON in the browser. */
export async function fetchMemories(): Promise<Memory[]> {
  if (import.meta.server) {
    const { getAllMemories } = await import('~~/server/utils/memories')
    return getAllMemories()
  }
  const base = import.meta.env.BASE_URL ?? '/'
  return $fetch<Memory[]>(`${base}api/memories.json`)
}

export function useMemories() {
  return useAsyncData<Memory[]>('memories', fetchMemories, {
    default: () => []
  })
}
