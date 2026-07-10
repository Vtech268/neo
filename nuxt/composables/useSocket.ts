import { io, type Socket } from 'socket.io-client'

export const useSocket = () => {
   const socketState = useState<Socket | null>('global_socket', () => null)

   if (!process.client) return null

   if (!socketState.value) {
      const socket = io({
         path: '/socket.io',
         autoConnect: true,
         reconnection: true,
         reconnectionAttempts: Infinity,
         reconnectionDelay: 1000,
         reconnectionDelayMax: 5000,
         transports: ['websocket']
      })

      socket.on('connect', () => {
         const persistentSessionId = localStorage.getItem('session_id')
         socket.emit('register_session', persistentSessionId)
      })

      socket.on('session_established', (newSessionId: string) => {
         localStorage.setItem('session_id', newSessionId)
      })

      socket.on('disconnect', reason => {
         console.log('❌ Socket Disconnected:', reason)
      })

      document.addEventListener('visibilitychange', () => {
         if (!document.hidden && !socket.connected) {
            socket.connect()
         }
      })

      socketState.value = socket
   }

   return socketState.value
}

// let socket: Socket | null = null
// let pingInterval: ReturnType<typeof setInterval> | null = null

// export const useSocket = () => {
//    if (!socket && process.client) {
//       socket = io({
//          path: '/socket.io',
//          reconnection: true,
//          reconnectionAttempts: Infinity,
//          reconnectionDelay: 1000,
//          reconnectionDelayMax: 5000,
//          timeout: 10000,
//          transports: ['polling', 'websocket']
//       })

//       socket.on('connect', () => {
//          console.log('Global WebSocket Connected!', socket?.id)

//          startPing()
//       })

//       socket.on('disconnect', (reason) => {
//          console.log('Global WebSocket Disconnected:', reason)

//          stopPing()
//       })

//       socket.on('reconnect_attempt', (attempt) => {
//          console.log('Global WebSocket Reconnecting... Attempt:', attempt)
//       })

//       socket.on('pong_check', () => {
//          console.log('📡 Pong received from server')
//       })
//    }

//    return socket
// }

// function startPing() {
//    if (pingInterval) clearInterval(pingInterval)

//    pingInterval = setInterval(() => {
//       if (!socket || !socket.connected) return

//       console.log('📡 Sending ping_check...')
//       socket.emit('ping_check', {
//          timestamp: Date.now()
//       })
//    }, 10_000)
// }

// function stopPing() {
//    if (pingInterval) {
//       clearInterval(pingInterval)
//       pingInterval = null
//    }
// }