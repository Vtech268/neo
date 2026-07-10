import { Instance, Config, Utils } from '@neoxr/wb'
import { toJid } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/token-auth',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { jid, type } = req.session
         const main = toJid(Config.pairing.number)
         let instanceJid

         if (type === 2) {
            const bot = global?.db?.bots?.find(v =>
               v.jid === jid || v.connector.sessionOpts.owner === jid
            )
            if (!bot)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Bot not found'
               })

            instanceJid = bot.jid
         }

         const instance = type === 1 ? Instance.getBotDataByJid(main) : Instance.getBotDataByJid(instanceJid)
         if (!instance)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Instance not found'
            })

         res.json({
            creator: global.creator,
            status: true,
            data: {
               token: instance.token
            }
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
   login: true
}
