import { App } from '@neoxr/webly'
import './controllers/global.js'
import middleware from './middlewares/index.js'
import path from 'path'
import { clone } from '../lib/system/mapping.js'
import { randomUUID } from 'crypto'
import os from 'node:os'

const onlineUsers = new Map()
let previousCpuTime = { idle: 0, total: 0 }

const app = new App({
   staticPath: ['nuxt/.output/public'],
   routePath: './core/routes',
   middleware,
   socket: true,
   socketOpts: {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      pingInterval: 25000,
      pingTimeout: 5000
   },
   session: {
      name: 'token',
      keys: ['session'],
      maxAge: 72 * 60 * 60 * 1000, // 3 days
      httpOnly: false,
      sameSite: 'strict'
   },
   cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: '*',
      credentials: true
   },
   error: (req, res) => {
      res.sendFile(path.join(process.cwd(), 'nuxt/.output/public', '404.html'))
   }
})

app?.socket?.on('connection', (socket) => {
   console.log('🟢 Client connected:', socket.id)

   socket.on('register_session', (persistentSessionId) => {
      let currentSessionId = persistentSessionId

      if (!currentSessionId || !onlineUsers.has(currentSessionId)) {
         currentSessionId = randomUUID()
         socket.emit('session_established', currentSessionId)
      } else {
         console.log(`Client ${currentSessionId} reconnected with new socket ID: ${socket.id}`)
      }

      const user = onlineUsers.get(currentSessionId)
      if (user && user.disconnectionTimer) {
         clearTimeout(user.disconnectionTimer)
      }

      onlineUsers.set(currentSessionId, {
         socketId: socket.id,
         disconnectionTimer: null
      })
   })

   socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id)

      let userSessionId = null
      for (const [sessionId, user] of onlineUsers.entries()) {
         if (user.socketId === socket.id) {
            userSessionId = sessionId
            break
         }
      }

      if (userSessionId) {
         const user = onlineUsers.get(userSessionId)
         user.disconnectionTimer = setTimeout(() => {
            onlineUsers.delete(userSessionId)
         }, 30000)
      }
   })
})

setInterval(() => {
   const cpus = os.cpus()
   let idle = 0
   let total = 0

   cpus.forEach(core => {
      for (const type in core.times) {
         total += core.times[type]
      }
      idle += core.times.idle
   })

   const idleDifference = idle - previousCpuTime.idle
   const totalDifference = total - previousCpuTime.total
   previousCpuTime = { idle, total }

   const cpuPercentage = 100 - Math.floor((idleDifference / totalDifference) * 100)

   const memory = process.memoryUsage()

   const systemMetrics = {
      cpuUsage: isNaN(cpuPercentage) ? 0 : cpuPercentage,
      cpuModel: cpus[0].model,
      cores: cpus.length,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers,
      totalMem: os.totalmem(),
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
   }

   app?.socket?.emit('server_metrics', systemMetrics)

}, 2000)

app.use((req, res, next) => {
   req.bot = clone.get('sync')
   next()
})

app.start()