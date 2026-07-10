import { Chiper, Config, Instance, Utils } from '@neoxr/wb'
import system from '../../../lib/system/adapter.js'
import { io } from '../../../lib/system/mapping.js'
import { toJid } from '../../utils/index.js'

const chiper = new Chiper

export const routes = {
   category: 'action',
   path: '/action/change-number',
   method: 'post',
   parameter: ['id', 'number', 'method'],
   execution: async (req, res, next) => {
      try {
         const { type } = req.session
         const { id, number, method } = req.body

         if (type === 1)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Admin has not performed the required action.'
            })

         if (
            String(number) === String(Config.owner) ||
            String(number) === String(Config.pairing.number)
         )
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This number cannot be used for this action.'
            })

         if (global.db.bots?.some(v =>
            v.jid === toJid(number)
         ))
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'The number is already registered as a bot'
            })

         const result = await req.bot.sock.onWhatsApp(String(number))
         const { jid, exists } = result?.[0] || {}

         if (!exists)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'The number is not registered on WhatsApp.'
            })

         const bot = global.db.bots?.find(v =>
            v._id === id
         )

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         if (bot.is_connected)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Unable to change the number because the bot is currently running.'
            })

         if (bot.jid === jid)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'The new number is the same as the current number.'
            })

         try {
            const socket = Instance.getSocketByJid(bot.jid)
            if (socket) {
               await socket.logout()
            }
         } catch { }

         const token = global.db.instance.find(v => v.jid === bot.jid)
         if (!token)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'The previous number is not registered as an active bot instance.'
            })

         io.delete(bot.jid)

         if (['sqlite', 'local'].includes(system.session)) {
            const oldNumber = bot.jid.replace(/@.+/, '')
            await Utils.renameDatabaseSqlite(`./databases/${oldNumber}.db`, `./databases/${number}.db`)
         }

         token.jid = jid

         bot._id = chiper.encrypt(jid)
         bot.jid = jid
         bot.method = method
         bot.connector.sessionOpts.session = ['sqlite', 'local'].includes(system.session)
            ? `./${Config.bot_hosting.session_dir}/${number}`
            : String(number)
         bot.connector.sessionOpts.number = String(number)
         bot.connector.pairingConfig.state = method === 'pairing'
         bot.connector.pairingConfig.number = String(number)

         res.status(200).json({
            creator: global.creator,
            status: true,
            message: 'The number has been changed successfully.'
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