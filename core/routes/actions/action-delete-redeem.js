import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/delete-redeem',
   method: 'post',
   parameter: ['code'],
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         let data = global.db.setting.redeem_codes

         const { code } = req.body

         const fnCode = data?.find(v => v.code === code)
         if (!fnCode)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Redeem code not found.'
            })

         Utils.removeItem(global.db.setting.redeem_codes, fnCode)

         res.json({
            creator: global.creator,
            status: true,
            message: 'Redeem code deleted successfully.'
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