import express from 'express'
import next from 'next'
import { createProxyMiddleware } from 'http-proxy-middleware'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  // Redirect root to /landingpage
  server.get('/', (req, res) => {
    res.redirect(301, '/landingpage')
  })

  // Proxy /landingpage to the WordPress site
  server.use('/landingpage', createProxyMiddleware({
    target: 'https://farconic.xyz',
    changeOrigin: true,
    pathRewrite: {
      '^/landingpage': '/'
    }
  }))

  // Handle all other requests
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const port = process.env.PORT || 3000
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})