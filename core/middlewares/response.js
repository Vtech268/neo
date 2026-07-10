import { Instance, Config, Utils } from '@neoxr/wb'
import { toJid } from '../utils/index.js'

export default route => (req, res, next) => {
   try {
      const token = req.headers['x-neoxr-token']
      if (!token) return res.status(401).json({
         creator: global.creator,
         status: false,
         message: 'Unauthorized'
      })

      const main = toJid(Config.pairing.number)

      const instance = global.db?.instance.find(v =>
         v.token === token
      )

      if (!instance)
         return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Bot instance not found.'
         })

      if (instance.jid === main) return next()

      const bot = global.db.bots?.find(v => v.jid === instance.jid)
      if (!bot)
         return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Bot instance data not found.'
         })

      if (bot.is_logout || bot.stop || !bot.is_connected)
         return res.status(403).json({
            creator: global.creator,
            status: false,
            message: `Bot instance is not connected (Reason: ${bot.is_logout ? 'Logout' : 'Stopped'}).`
         })

      const now = Date.now()

      if (typeof bot.plan === 'undefined' || typeof bot.limit === 'undefined') {
         const plan = Config.bot_hosting.price_list.find(v => v.code === 'trial')
         if (plan) {
            bot.plan = plan.code
            bot.limit = plan.response
            bot.expired = now + (plan.days * 24 * 60 * 60 * 1000)
         } else {
            bot.plan = 'none'
            bot.limit = 0
            bot.expired = now
         }
      }

      if (bot.plan !== 'none') {
         if (bot.expired && now > bot.expired) {
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Your bot is inactive. The subscription has expired.'
            })
         }

         if (bot.limit > 0) {
            bot.limit -= 1
            next()
         } else {
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Your bot instance has reached its response limit.'
            })
         }
      } else next()
   } catch (e) {
      Utils.printError(e)
      res.status(500).json({
         creator: global.creator,
         status: false,
         msg: 'Internal Server Error'
      })
   }
}