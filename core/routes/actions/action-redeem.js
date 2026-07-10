import { Utils, Config } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/redeem',
   method: 'post',
   parameter: ['code'],
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         const data = global.db.setting.redeem_codes

         const { code } = req.body
         if (!code)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Redeem code is required.'
            })

         const { jid } = req.session
         const bot = global.db.bots?.find(v => v.connector.sessionOpts.owner === jid)

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot data not found for your session.'
            })

         const now = Date.now()

         const codeIndex = data.findIndex(v => v.code === code)
         if (codeIndex === -1)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'The redeem code you entered is invalid.'
            })

         const redeemCode = data[codeIndex]

         if (!redeemCode.is_active)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This redeem code is no longer active.'
            })

         if (redeemCode.expires_at > 0 && now > redeemCode.expires_at)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This redeem code has expired.'
            })

         if (redeemCode.redeemed.length >= redeemCode.limit.total)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This redeem code has reached its maximum usage limit.'
            })

         const userRedeemRecord = redeemCode.redeemed.find(r => r.jid === bot.jid)
         const userRedeemCount = userRedeemRecord ? userRedeemRecord.count : 0

         if (userRedeemCount >= redeemCode.limit.per_user)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'You have already reached the usage limit for this code.'
            })

         bot.max_owner = bot.max_owner || 0

         switch (redeemCode.type) {
            case 'plan':
               const choosenPlan = Config.bot_hosting.price_list.find(v => v.code === redeemCode.reward.plan)
               const planExpiry = redeemCode.reward.days * 24 * 60 * 60 * 1000
               bot.plan = redeemCode.reward.plan
               bot.limit += choosenPlan.response
               bot.expired = (bot.expired > now ? bot.expired : now) + planExpiry
               break

            case 'discount':
               return res.status(400).json({
                  status: false,
                  message: 'Discount code is only valid at checkout.'
               })

            case 'universal':
               const universalExpiry = (redeemCode.reward.add_days || 0) * 24 * 60 * 60 * 1000
               bot.expired = (bot.expired > now ? bot.expired : now) + universalExpiry
               bot.limit += redeemCode.reward.add_response || 0
               bot.max_owner += redeemCode.reward.add_owner || 0
               break

            default:
               return res.status(400).json({
                  status: false,
                  message: 'Unknown redeem code type.'
               })
         }

         if (userRedeemRecord) {
            userRedeemRecord.count++
            userRedeemRecord.at = now
         } else {
            redeemCode.redeemed.push({
               jid: bot.jid,
               count: 1,
               at: now
            })
         }

         global.db.setting.redeem_codes[codeIndex] = redeemCode

         res.json({
            creator: global.creator,
            status: true,
            message: redeemCode.message || 'Code redeemed successfully!'
         })
      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false,
   login: true
}