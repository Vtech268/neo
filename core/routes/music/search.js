import { Utils } from '@neoxr/wb'
import yts from 'yt-search'

export const routes = {
   category: 'action',
   path: '/music/search',
   method: 'post',
   execution: async (req, res, next) => {
      try {
         const { query } = req.body

         const result = await yts(query).catch(() => null)

         const music = result.all?.filter(v =>
            v.type === 'video' &&
            typeof v.seconds === 'number' &&
            v.seconds <= 600
         )

         if (!music?.length) {
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Music not found.'
            })
         }

         res.json({
            creator: global.creator,
            status: true,
            data: music
         })
      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false,
   challenge: true
}