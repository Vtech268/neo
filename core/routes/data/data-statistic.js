import { Utils } from '@neoxr/wb'
import Mapping from '../../../lib/system/mapping.js'

export const routes = {
   category: 'data',
   path: '/data/statistic',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const messageSent = (global.db?.bots?.reduce((total, item) => {
            return total + (item.data?.setting?.sent || 0)
         }, 0) || 0) + (global.db?.setting?.sent || 0)

         const messageReceived = (global.db?.bots?.reduce((total, item) => {
            return total + (item.data?.setting?.received || 0)
         }, 0) || 0) + (global.db?.setting?.received || 0)

         const users = (global.db?.bots?.reduce((total, item) => {
            return total + (item.data?.users?.length || 0)
         }, 0) || 0) + (global.db?.users?.length || 0)

         const commands = Mapping.property.get('commands')

         res.json({
            creator: global.creator,
            status: true,
            data: {
               message_sent: messageSent || 0,
               message_received: messageReceived || 0,
               users: users || 0,
               features: commands?.length || 0
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
   error: false
} 