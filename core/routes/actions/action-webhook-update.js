import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'
import { models } from '../../../lib/system/models.js'

export const routes = {
   category: 'action',
   path: '/action/update-webhook',
   method: 'post',
   parameter: ['data'],
   execution: async (req, res, next) => {
      try {
         const { data: newSettings } = req.body

         if (!newSettings || typeof newSettings !== 'object')
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid settings data provided'
            })

         const { type, jid } = req.session

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { setting } = data
         if (!setting) setting = {}
         if (!setting.webhook) setting.webhook = models.setting.webhook

         for (const key in newSettings) {
            if (Object.prototype.hasOwnProperty.call(setting.webhook, key)) {
               setting.webhook[key] = newSettings[key]
            }
         }

         res.json({
            creator: global.creator,
            status: true,
            message: 'Webhook updated successfully'
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