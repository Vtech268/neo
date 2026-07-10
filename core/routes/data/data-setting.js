import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/setting',
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

         let { setting } = data

         if (!setting.chatbot_config) setting.chatbot_config ={}
         if (!setting.chatbot_config?.apikey?.cloudflare) setting.chatbot_config.apikey.cloudflare = {
            account: '',
            token: ''
         }

         if (!setting.chatbot_config?.model?.cloudflare) setting.chatbot_config.model.cloudflare = {
            image: '',
            text: ''
         }

         res.json({
            creator: global.creator,
            status: true,
            data: setting || {}
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