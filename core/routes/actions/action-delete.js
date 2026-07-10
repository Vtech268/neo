import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/delete',
   method: 'post',
   parameter: ['jid', 'type'],
   execution: async (req, res, next) => {
      try {
         const { jid: id, type: t } = req.body
         const { type, jid: sessionJid } = req.session

         const DATA_MAP = {
            '_u': 'users',
            '_c': 'chats',
            '_g': 'groups',
            '_b': 'bots'
         }

         const collection = DATA_MAP[t]
         if (!collection)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid type parameter'
            })

         let data, target

         if (type === 1) {
            data = global.db?.[collection]
            if (!data)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Collection not found'
               })

            target = t === '_b'
               ? data.find(v => v.jid === id || v.connector?.sessionOpts?.owner === id)
               : data.find(v => v.jid === id)
         } else if (type === 2) {
            const bot = global.db.bots?.find(v =>
               v.jid === sessionJid || v.connector?.sessionOpts?.owner === sessionJid
            )

            if (!bot)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Your bot instance not found'
               })

            if (t === '_b')
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'You are not allowed to delete bot instances'
               })

            data = bot.data[collection]
            target = data?.find(v => v.jid === id)
         }

         if (!target) {
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Data not found in database'
            })
         }

         const success = data.remove(id)
         if (!success) {
            data.remove(target.jid || target.id)
         }

         return res.json({
            creator: global.creator,
            status: true,
            message: `Successfully deleted ${id} from ${collection}`
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