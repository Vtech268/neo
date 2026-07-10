
import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/credential',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session

         if (type === 1)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'You are not allowed to access this route.'
            })

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         const { bot } = data

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot instance not found for this session.'
            })

         if (!bot?.connector?.override || !Object.values(bot?.connector?.override).length) bot.connector.override = {
            username: '',
            email: '',
            password: ''
         }

         res.json({
            creator: global.creator,
            status: true,
            data: bot?.connector?.override
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