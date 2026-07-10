import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/users',
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

         let { users } = data

         res.json({
            creator: global.creator,
            status: true,
            data: {
               stats: {
                  banned: (users.filter(v => v.banned) || [])?.length,
                  premium: (users.filter(v => v.premium) || [])?.length,
                  total: users.length
               },
               users: users.sort((a, b) => b.usebot - a.usebot)
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
