import type { Post } from '@/lib/types'

/** First image URL from `![](url)` or `<img src="...">` in post body (for link previews when thumbnail is empty). */
export function firstContentImageUrl(content: string | null | undefined): string | null {
  if (!content) return null
  const md = content.match(/!\[[^\]]*\]\(\s*<?([^>\s)]+)>?\s*(?:["'][^"']*["'])?\s*\)/)
  if (md?.[1]) return md[1].trim()
  const html = content.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i)
  if (html?.[1]) return html[1].trim()
  return null
}

function toAbsoluteImageUrl(raw: string, siteUrl: string): string {
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return new URL(path, siteUrl).href
}

/** Open Graph / social preview image: thumbnail, else first in-body image, else site logo. */
export function resolvePostOgImageUrl(post: Post, siteUrl: string): string {
  const thumb = post.thumbnail_url?.trim()
  const fromBody = firstContentImageUrl(post.content)
  for (const candidate of [thumb, fromBody]) {
    if (!candidate) continue
    try {
      return toAbsoluteImageUrl(candidate, siteUrl)
    } catch {
      continue
    }
  }
  return new URL('/LOA-logo.png', siteUrl).href
}
