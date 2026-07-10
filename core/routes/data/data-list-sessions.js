import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'data',
   path: '/data/sessions',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         res.json({
            creator: global.creator,
            status: true,
            data: global.db?.bots?.map(v => ({
               account: v?.account || Utils.randomInt(999999, 100000),
               ...v,
               data: {
                  users: v.data?.users?.length || 0,
                  chats: v?.data?.chats?.length || 0,
                  groups: v?.data?.groups?.length || 0
               }
            }))
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
   login: '401-operator'
}