export const routes = {
   category: 'data',
   path: '/data/redeem-codes',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         res.json({
            creator: global.creator,
            status: true,
            data: global.db.setting.redeem_codes
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