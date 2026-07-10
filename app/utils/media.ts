// Helpers for rendering milestone gallery videos.
//
// Only Bilibili embeds are supported — YouTube is blocked in mainland China,
// so an embedded YouTube iframe would hang/fail for most classmates. Local
// video files (.mp4/.mov) are the primary mechanism and always work.

export function bilibiliId(url: string): string | null {
  const m = url.match(/bilibili\.com\/video\/(BV[\w]+)/)
  return m ? m[1] ?? null : null
}

export function embedUrl(url: string): string | null {
  const bili = bilibiliId(url)
  if (bili) return `https://player.bilibili.com/player.html?bvid=${bili}&high_quality=1`
  return null
}
