// Prepends the app's base URL to absolute asset paths so images work correctly
// in subpath deployments (e.g. GitHub Pages under /forever2006/).
// External URLs (http://, https://) pass through unchanged.
export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = import.meta.env.BASE_URL ?? '/'
  // If base is '/' and path already starts with '/', return as-is.
  if (base === '/' && path.startsWith('/')) return path
  // Otherwise prepend base (strip leading / from path to avoid double slash).
  return base + (path.startsWith('/') ? path.slice(1) : path)
}
