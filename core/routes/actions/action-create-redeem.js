import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/create-redeem',
   method: 'post',
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         let data = global.db.setting.redeem_codes

         const payload = req.body

         if (data?.find(v => v.code === payload.code))
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Redeem code already exists.'
            })

         data.push(payload)

         res.json({
            creator: global.creator,
            status: true,
            message: 'Redeem code created successfully.'
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