import { Instance } from '@neoxr/wb'
import fs from 'node:fs'

export const run = {
   usage: ['terminate'],
   category: 'bot hosting',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!global.db.bots?.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 1))
         const bot = global.db.bots?.map(v => v._id)
         const [number] = args
         if (isNaN(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
         const token = bot?.[parseInt(number) - 1]
         if (!token) return client.reply(m.chat, Utils.texted('bold', `🚩 Token not found.`), m)
         const fn = global.db.bots.find(b => b._id === token)
         if (!fn) return client.reply(m.chat, Utils.texted('bold', `🚩 Bot not found.`), m)
         m.react('🕒')
         try {
            const socket = Instance.getSocketByJid(fn.jid)
            socket.logout()
         } catch { } finally {
            if (['local', 'sqlite'].includes(fn?.connector?.type)) {
               const number = fn.jid.replace(/@.+/, '')
               const dir = `./databases/${number}`
               if (fs.existsSync(dir)) fs.rmSync(dir, {
                  recursive: true,
                  force: true
               })
            }
         }
         client.reply(m.chat, Utils.texted('bold', `✅ Bot @${fn.jid.replace(/@.+/, '')} terminated.`), m).then(() => {
            global.db.bots.remove(fn.jid)
            global.db.instance.remove(fn.jid)
         })
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false,
   operator: true
}