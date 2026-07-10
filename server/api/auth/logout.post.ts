export default defineEventHandler((event) => {
  clearSiteAuth(event)
  return { success: true }
})
