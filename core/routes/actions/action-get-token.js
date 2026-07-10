import { Instance, Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/get-token',
   method: 'post',
   parameter: ['id'],
   execution: async (req, res, next) => {
      try {
         const { id } = req.body
         const { jid, type } = req.session

         const bot = type === 1 ? global?.db?.bots?.find(v => v._id === id) : global?.db?.bots?.find(v => v.jid === jid && v._id === id)
         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         const instance = Instance.getBotDataByJid(bot.jid)
         if (!instance)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         res.json({
            creator: global.creator,
            status: true,
            data: {
               token: instance.token
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