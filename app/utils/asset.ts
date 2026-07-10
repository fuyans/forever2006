// Prepends the app's base URL to absolute asset paths so images work correctly
// in subpath deployments (e.g. GitHub Pages under /forever2006/).
// External URLs (http://, https://) pass through unchanged.
export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // Runtime config baseURL — empty string in dev (/), '/forever2006/' on Pages.
  const { public: { baseURL } } = useRuntimeConfig()
  const prefix = (baseURL as string) || ''
  if (!prefix || prefix === '/') return path
  return prefix + (path.startsWith('/') ? path.slice(1) : path)
}
