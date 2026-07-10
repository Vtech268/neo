import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/chats',
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

         let { chats } = data

         res.json({
            creator: global.creator,
            status: true,
            data: {
               stats: {
                  personal: (chats.filter(v => v.jid.endsWith('.net')) || [])?.length,
                  group: (chats.filter(v => v.jid.endsWith('g.us')) || [])?.length,
                  total: chats.length
               },
               chats: chats?.sort((a, b) => (b.lastseen || b.lastchat || 0) - (a.lastseen || a.lastchat || 0))
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
