import type { Memory } from '~~/server/utils/memories'

/**
 * Load timeline/album memories.
 *
 * - SSR (local dev / full server): scan the content folder directly.
 * - Browser on SSR build: fetch the live `/api/memories` endpoint.
 * - Static build (GitHub Pages): fetch the pre-generated `/api/memories.json`.
 *
 * We try the live API first; if it's missing (static build with no server),
 * we fall back to the static JSON file.
 */
export async function fetchMemories(): Promise<Memory[]> {
  if (import.meta.server) {
    const { getAllMemories } = await import('~~/server/utils/memories')
    return getAllMemories()
  }
  // Prefer the live API; fall back to the static JSON used on GitHub Pages.
  try {
    return await $fetch<Memory[]>('/api/memories')
  } catch {
    const base = import.meta.env.BASE_URL ?? '/'
    return $fetch<Memory[]>(`${base}api/memories.json`)
  }
}

export function useMemories() {
  return useAsyncData<Memory[]>('memories', fetchMemories, {
    default: () => []
  })
}
