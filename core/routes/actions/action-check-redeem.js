import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/check-redeem',
   parameter: ['code'],
   method: 'post',
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         let data = global.db.setting.redeem_codes

         const payload = req.body
         const now = Date.now()

         const codeIndex = data.findIndex(v => v.code === payload.code)
         if (codeIndex === -1)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Promo code not found.'
            })

         const { code, type, reward, expires_at, is_active, redeemed, limit } = data[codeIndex]

         if (!is_active)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This code is no longer active.'
            })

         if (expires_at > 0 && now > expires_at)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This code has expired.'
            })

         if (redeemed.length >= limit.total)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'This code has reached its maximum usage limit.'
            })

         res.json({
            creator: global.creator,
            status: true,
            data: {
               code, type,
               discount: reward.discount,
               expires_at, is_active
            }
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