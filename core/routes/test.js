import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'main',
   path: '/test',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         console.log({ bot: req.bot.sock.user.id })
         res.json({
            creator: global.creator,
            status: true,
            message: 'Server Online!'
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
   error: false
}
