import { Instance } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/logout',
   method: 'post',
   execution: async (req, res, next) => {
      const { jid } = req.body
      if (jid) {
         const { jid: id } = req.body
         const client = Instance.getSocketByJid(id)
         if (!client)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot was not found in the instance'
            })

         const bot = global.db.bots?.find(v => v.jid === id)
         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot was not found in the database'
            })

         bot.is_connected = false
         bot.stop = false
         client.logout()
         res.json({
            creator: global.creator,
            status: true,
            message: 'Logout successful'
         })
      } else {
         req.session.login = true
         req.session.type = null
         req.session.jid = null
         req.session.account = null
         req.session.token = null
         req.session = null
         res.json({
            creator: global.creator,
            status: true,
            message: 'Logout successful'
         })
      }
   },
   error: false,
   login: true
}