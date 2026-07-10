// Helpers for rendering milestone gallery videos (YouTube / Bilibili embeds).

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  return m ? m[1] ?? null : null
}

export function bilibiliId(url: string): string | null {
  const m = url.match(/bilibili\.com\/video\/(BV[\w]+)/)
  return m ? m[1] ?? null : null
}

export function embedUrl(url: string): string | null {
  const yt = youtubeId(url)
  if (yt) return `https://www.youtube.com/embed/${yt}`
  const bili = bilibiliId(url)
  if (bili) return `https://player.bilibili.com/player.html?bvid=${bili}&high_quality=1`
  return null
}
