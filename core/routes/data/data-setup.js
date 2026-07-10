export const routes = {
   category: 'data',
   path: '/data/setup',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         res.json({
            creator: global.creator,
            status: true,
            data: global.db.setup
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