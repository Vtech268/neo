import { Utils } from '@neoxr/wb'
import Chatbot from '../../../lib/chatbot/index.js'

const chatbot = new Chatbot({
   apikey: {},
   instruction: '',
   model: {}
})

export const routes = {
   category: 'data',
   path: '/data/models',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const json = chatbot.getModels()
         res.json(json)
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