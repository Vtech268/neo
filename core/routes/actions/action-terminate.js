import { Instance, Utils } from '@neoxr/wb'
import fs from 'node:fs'

export const routes = {
   category: 'action',
   path: '/action/terminate',
   method: 'post',
   parameter: ['id'],
   execution: async (req, res, next) => {
      try {
         const { id, remove } = req.body

         const isRemoveData = Boolean(remove)
         const bot = global?.db?.bots?.find(v => v._id === id)
         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         try {
            const client = Instance.getSocketByJid(bot.jid)
            await client.logout()
         } catch { } finally {
            if (['local', 'sqlite'].includes(bot?.connector?.type)) {
               const number = bot.jid.replace(/@.+/, '')
               const dir = `./databases/${number}`
               if (fs.existsSync(dir)) fs.rmSync(dir, {
                  recursive: true,
                  force: true
               })
            }
            global.db.bots.remove(bot.jid)
            global.db.instance.remove(bot.jid)
         }

         return res.json({
            creator: global.creator,
            status: true,
            message: `Bot ${isRemoveData ? 'deleted' : 'terminated'} successfully`
         })
      } catch (e) {
         Utils.printError(e)
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false,
   login: '401-operator'
}