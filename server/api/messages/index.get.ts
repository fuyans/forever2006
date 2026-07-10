export default defineEventHandler(async (_event) => {
  // The server middleware already enforces site auth for /api/*. This endpoint
  // is reachable by anyone who passed the front gate.
  return await getMessages()
})
