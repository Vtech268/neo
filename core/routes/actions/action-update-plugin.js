import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/update-plugin',
   method: 'post',
   parameter: ['name'],
   execution: async (req, res, next) => {
      try {
         const { name, status } = req.body
         const { type, jid } = req.session

         if (typeof status === 'undefined')
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Parameter "status" are required'
            })

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { setting } = data

         if (!setting.pluginDisable) {
            setting.pluginDisable = []
         }

         const isCurrentlyDisabled = setting.pluginDisable.includes(name)
         const requestedStatus = Boolean(status)

         if (requestedStatus && isCurrentlyDisabled) {
            setting.pluginDisable = setting.pluginDisable.filter(p => p !== name)
            console.log(`Plugin '${name}' has been enabled.`)
         } else if (!requestedStatus && !isCurrentlyDisabled) {
            setting.pluginDisable.push(name)
            console.log(`Plugin '${name}' has been disabled.`)
         } else {
            console.log(`Plugin '${name}' status is already as requested. No changes made.`)
         }

         res.json({
            creator: global.creator,
            status: true,
            message: `Plugin '${name}' status updated successfully.`
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