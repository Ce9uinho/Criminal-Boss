import app from './trpc/hono'

export default {
  port: 3000,
  fetch: app.fetch
}

console.log('Server running on http://localhost:3000')