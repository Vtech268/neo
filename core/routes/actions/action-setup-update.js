import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/update-setup',
   method: 'post',
   parameter: ['data'],
   execution: async (req, res, next) => {
      try {
         const { data: newSetup } = req.body

         if (!newSetup || typeof newSetup !== 'object')
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid setups data provided'
            })

         if (!global.db?.setup) global.db.setup = {}
         if (!global.db.setup?.ads) global.db.setup.ads = ''

         for (const key in newSetup) {
            if (Object.prototype.hasOwnProperty.call(global.db.setup, key)) {
               global.db.setup[key] = newSetup[key]
            }
         }

         res.json({
            creator: global.creator,
            status: true,
            message: 'Setup updated successfully'
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