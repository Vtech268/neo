import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/update-group',
   method: 'post',
   parameter: ['jid'],
   execution: async (req, res, next) => {
      try {
         const { jid: id, ...settings } = req.body
         const { type, jid } = req.session

         const data = parsingData(type, jid)
         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot session not found'
            })

         let { groups } = data

         const target = groups?.find(v => v.jid === id)
         if (!target)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Group not found in the global database'
            })

         if (target) {
            for (const key in settings) {
               if (Object.hasOwnProperty.call(target, key)) {
                  target[key] = settings[key]
               }
            }

            return res.json({
               creator: global.creator,
               status: true,
               message: 'Group settings updated successfully'
            })
         }

         return res.status(400).json({
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