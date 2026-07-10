export default defineEventHandler(async (_event) => {
  // Site auth enforced by the global server middleware.
  return await getPeople()
})
