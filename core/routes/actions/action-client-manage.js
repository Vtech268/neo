import { Config, Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/client-manage',
   method: 'post',
   parameter: ['jid', 'plan'],
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session
         const { jid: id, plan } = req.body

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { bots } = data

         const bot = bots?.find(v => v.jid === id)

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot data not found'
            })

         if (plan === 'none') {
            bot.plan = 'none'
            bot.limit = 0
            bot.expired = 0
            return res.json({
               creator: global.creator,
               status: true,
               message: `Premium status has been reset.`
            })
         } else {
            const selectedPlan = Config.bot_hosting.price_list?.find(v => v.code === plan)
            if (!selectedPlan)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Plan not found'
               })

            const now = new Date().getTime()
            const additionalTime = Number(selectedPlan.days) * 24 * 60 * 60 * 1000

            bot.plan = plan
            if (bot.limit) bot.limit += selectedPlan.response
            bot.limit = selectedPlan.response

            if (bot.expired && bot.expired > now) {
               bot.expired += additionalTime
            } else {
               bot.expired = now + additionalTime
            }

            return res.json({
               creator: global.creator,
               status: true,
               message: `Successfully added ${selectedPlan.days} days.`
            })
         }
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