import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/top',
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

         const show = 10
         const point = [...users].sort((a, b) => Number(b.point) - Number(a.point))
         const hit = [...users].sort((a, b) => Number(b.hit) - Number(a.hit))

         res.json({
            creator: global.creator,
            status: true,
            data: {
               top_hit: hit.slice(0, show),
               top_point: point.slice(0, show)
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