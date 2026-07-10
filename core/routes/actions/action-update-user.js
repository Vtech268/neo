import { Config, Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/update-user',
   method: 'post',
   parameter: ['id'],
   execution: async (req, res, next) => {
      try {
         const { id, limit, limit_game, banned, premium } = req.body
         const { type, jid } = req.session

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { users } = data
         let target = users?.find(v => v.jid === id)

         if (!target)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'User not found'
            })

         if (target) {
            const oldPremium = target.premium
            const newPremium = Boolean(premium)

            if (oldPremium === newPremium) {
               target.limit = Number(limit ?? 0)
               target.limit_game = Number(limit_game ?? 0)
            }

            if (!oldPremium && newPremium) {
               target.limit += 1000
               target.limit_game += 1000
               target.expired = Date.now() + 86400000 * 30 // 30 hari
            }

            if (oldPremium && !newPremium) {
               target.limit = Config.limit
               target.limit_game = Config.limit_game
               target.expired = 0
            }

            target.premium = newPremium
            target.banned = Boolean(banned)

            return res.json({
               creator: global.creator,
               status: true,
               message: 'User updated'
            })
         }

         res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Invalid payload'
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
