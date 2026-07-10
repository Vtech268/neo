import { Instance, Config, Utils } from '@neoxr/wb'
import { io } from '../../../lib/system/mapping.js'
import { toJid, parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/account',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { jid, type } = req.session
         const main = toJid(Config.owner)
         let instanceJid

         const data = parsingData(type, jid)

         if (!data?.bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot instance not found for this session.'
            })

         if (type === 2) {
            instanceJid = data.bot.jid
         } else if (type === 1) {
            instanceJid = main
         } else {
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Invalid session type.'
            })
         }

         const instance = Instance.getBotDataByJid(instanceJid)
         if (!instance)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot instance data not found in cache.'
            })

         if (req.io) {
            if (io.has(instanceJid)) {
               console.log(`[TERMINAL] Overwriting existing socket for JID: ${instanceJid}`)
            }
            io.set(instanceJid, req.io)
            console.log(`[TERMINAL] New Socket connected and mapped to JID: ${instanceJid}`)
         }

         const { data: database, ...duplicate } = data.bot

         res.json({
            creator: global.creator,
            status: true,
            data: {
               token: instance.token,
               ...duplicate,
               massage_sent: data?.setting?.sent || 0,
               message_received: data?.setting?.received || 0,
               wa_version: Config.pairing.version
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