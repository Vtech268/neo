import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'main',
   path: '/data/group',
   method: 'post',
   parameter: ['jid'],
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session
         const { jid: id } = req.body

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { groups } = data

         const group = groups?.find(v => v.jid === id)

         if (!group)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Group not found'
            })

         res.json({
            creator: global.creator,
            status: true,
            data: group
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
