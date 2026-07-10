import { Utils } from '@neoxr/wb'
import Mapping from '../../../lib/system/mapping.js'
import { parsingData } from '../../utils/index.js'
import path from 'path'

export const routes = {
   category: 'main',
   path: '/data/plugins',
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

         let { setting, bot } = data

         let plugins = Mapping.property.get('plugins')
         if (bot?.connector?.override?.plugsdir) {
            const number = bot?.jid ? String(bot.jid?.replace(/@.+/, '')) : null
            if (number) plugins = Mapping.property.get(`plugins-${number}`)
         }

         if (!plugins)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Plugins not loaded'
            })

         const all = Object.entries(plugins).map(([dir, prop]) => {
            const base = path.basename(dir, '.js')
            const disabled = setting?.pluginDisable?.includes(base)
            return {
               name: base,
               ...prop.run,
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
               plugins: all
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
