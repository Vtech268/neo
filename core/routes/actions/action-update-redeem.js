import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/update-redeem',
   method: 'post',
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         let data = global.db.setting.redeem_codes

         const payload = req.body

         const codeIndex = data.findIndex(v => v.code === payload.code)
         if (codeIndex === -1) {
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Redeem code not found.'
            })
         }

         const originalCode = data[codeIndex]
         const updatedCode = {
            ...originalCode,
            ...payload,
            created_at: originalCode.created_at,
            redeemed: originalCode.redeemed
         }

         data[codeIndex] = updatedCode

         res.json({
            creator: global.creator,
            status: true,
            message: 'Redeem code updated successfully.'
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
   login: '401-operator'
}