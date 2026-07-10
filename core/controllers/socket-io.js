import { Utils } from '@neoxr/wb'
import { io } from '../../lib/system/mapping.js'

export const updateBotStatus = (jid, type, message) => {
   try {
      if (!process.argv.includes('--server')) return
      const socket = io.get(jid)
      if (!socket) return
      const number = jid.replace(/@.+/, '')
      socket.emit(`status.${number}`, {
         jid: jid,
         status: type, // 'success' | 'error' | 'warning'
         message: message
      })
      io.delete(jid)
   } catch (e) {
      Utils.printError(e)
   }
}

export const terminal = (jid, data = {}) => {
   try {
      if (!process.argv.includes('--server')) return
      const socket = io.get(jid)
      if (!socket) return
      const number = jid.replace(/@.+/, '')
      socket.emit(`logs.${number}`, {
         jid, data
      })
   } catch (e) {
      Utils.printError(e)
   }
}