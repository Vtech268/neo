import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'main',
   path: '/data/all',
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

         let { users, chats, groups, bots } = data

         res.json({
            creator: global.creator,
            status: true,
            data: {
               users: {
                  premium: (users?.filter(v => v.premium) || [])?.length || 0,
                  banned: (users?.filter(v => v.banned) || [])?.length || 0,
                  total: users?.length || 0
               },
               groups: {
                  rental: (groups?.filter(v => v.expired > 1) || [])?.length || 0,
                  total: groups?.length || 0
               },
               chats: {
                  total: chats?.length || 0
               },
               bots: {
                  connected: (bots?.filter(v => v.is_connected) || [])?.length || 0,
                  disconnected: (bots?.filter(v => !v.is_connected) || [])?.length || 0,
                  total: bots?.length || 0
               }
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
