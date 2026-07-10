import { Utils } from '@neoxr/wb'
import Mapping from '../../../lib/system/mapping.js'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'main',
   path: '/data/commands',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { setting, statistic, bot } = data

         let commands = Mapping.property.get('commands')
         if (bot?.connector?.override?.plugsdir) {
            const number = bot?.jid ? String(bot.jid?.replace(/@.+/, '')) : null
            if (number) commands = Mapping.property.get(`commands-${number}`)
         }

         if (!commands)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Commands is empty'
            })

         const all = commands.map(command => {
            const disabled = setting?.error?.includes(command)
            return {
               name: command,
               stats: statistic?.[command] || {},
               disabled
            }
         })

         res.json({
            creator: global.creator,
            status: true,
            data: {
               stats: {
                  enable: all.filter(v => !v.disabled).length,
                  disable: all.filter(v => v.disabled).length,
                  total: all.length
               },
               commands: all
            }
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
