import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/update-command',
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
               message: 'Parameters "status" are required'
            })

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })


         let { setting } = data

         if (!setting.error) {
            setting.error = []
         }

         const isCurrentlyDisabled = setting.error.includes(name)
         const requestedStatus = Boolean(status)

         if (requestedStatus && isCurrentlyDisabled) {
            setting.error = setting.error.filter(cmd => cmd !== name)
            console.log(`Command '${name}' has been enabled.`)
         } else if (!requestedStatus && !isCurrentlyDisabled) {
            setting.error.push(name)
            console.log(`Command '${name}' has been disabled.`)
         } else {
            console.log(`Command '${name}' status is already as requested. No changes made.`)
         }

         res.json({
            creator: global.creator,
            status: true,
            message: `Command '${name}' status updated successfully.`
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